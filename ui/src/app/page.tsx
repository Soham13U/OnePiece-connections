'use client';

import { useEffect, useState } from 'react';
import { generatePuzzle } from '@/lib/puzzle';
import charactersData from '@/data/onepiece_characters_tagged.json';
import type { TaggedCharacter } from '@/lib/models';
import { getProxiedImageUrl } from '@/lib/imageProxy';

type Cell = {
  id: number;
  name: string;
  imageUrl: string | null;
};

type Group = {
  id: string;
  label: string;
  difficulty: 'easy' | 'medium' | 'hard';
  characterIds: number[];
};

type PuzzleResponse = {
  id: string;
  groups: Group[];
  cells: Cell[];
};

// One Piece themed colors for each of the 4 answers
const ANSWER_COLORS = [
  { 
    bg: 'bg-gradient-to-br from-yellow-400/90 to-yellow-500/90', 
    text: 'text-yellow-950', 
    border: 'border-yellow-400/80',
    shadow: 'shadow-yellow-500/30'
  },
  { 
    bg: 'bg-gradient-to-br from-emerald-400/90 to-emerald-500/90', 
    text: 'text-emerald-950', 
    border: 'border-emerald-400/80',
    shadow: 'shadow-emerald-500/30'
  },
  { 
    bg: 'bg-gradient-to-br from-blue-400/90 to-blue-500/90', 
    text: 'text-blue-950', 
    border: 'border-blue-400/80',
    shadow: 'shadow-blue-500/30'
  },
  { 
    bg: 'bg-gradient-to-br from-purple-400/90 to-purple-500/90', 
    text: 'text-purple-950', 
    border: 'border-purple-400/80',
    shadow: 'shadow-purple-500/30'
  },
];

function RulesModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-sky-900 to-sky-950 rounded-2xl border-2 border-amber-500/40 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-200">How to Play</h2>
            <button
              onClick={onClose}
              className="text-amber-300 hover:text-amber-100 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-500/20 transition-colors"
              aria-label="Close rules"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4 text-amber-100/90">
            <div>
              <h3 className="text-lg font-bold text-amber-200 mb-2">Objective</h3>
              <p className="text-sm sm:text-base leading-relaxed">
                Find four groups of four characters that share a common connection. Each group represents a crew, role, power, origin, or other shared trait.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-amber-200 mb-2">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base leading-relaxed">
                <li>Select four characters that you think share a connection</li>
                <li>Click the "Submit" button to check your answer</li>
                <li>If correct, those characters will be removed and the connection will be revealed</li>
                <li>If incorrect, you lose one mistake (you have 4 mistakes total)</li>
                <li>Find all four connections before running out of mistakes!</li>
              </ol>
            </div>
            
           
            
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [puzzle, setPuzzle] = useState<PuzzleResponse | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(4);
  const [gameOver, setGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNames, setShowNames] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      // Generate puzzle directly on client
      const puzzle = generatePuzzle();
      const characters = charactersData as TaggedCharacter[];
      const byId = new Map(characters.map((c) => [c.id, c]));
      const cells = puzzle.allCharacterIds
        .map((id) => byId.get(id))
        .filter((c): c is TaggedCharacter => c !== undefined)
        .map((c) => ({
          id: c.id,
          name: c.name,
          imageUrl: c.imageUrl,
        }));
      
      setPuzzle({
        id: puzzle.id,
        groups: puzzle.groups,
        cells,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
      setPuzzle(null);
      setIsLoading(false);
    }
  }, []);

  const onCellClick = (id: number) => {
    if (!puzzle || gameOver || allSolved) return;
    const inSolved = puzzle.groups.some(
      (g) => solvedGroups.includes(g.id) && g.characterIds.includes(id)
    );
    if (inSolved) return;

    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = () => {
    if (!puzzle || selected.length !== 4 || gameOver || allSolved) return;

    const selSorted = [...selected].sort((a, b) => a - b);
    const match = puzzle.groups.find((g) => {
      const sorted = [...g.characterIds].sort((a, b) => a - b);
      return sorted.every((id, i) => id === selSorted[i]);
    });

    if (match) {
      setSolvedGroups((prev) => [...prev, match.id]);
      setSelected([]);
    } else {
      setMistakes((m) => {
        const next = Math.max(0, m - 1);
        if (next === 0) {
          setGameOver(true);
        }
        return next;
      });
      setSelected([]);
    }
  };

  const handleResetSelection = () => {
    setSelected([]);
  };

  const handleResetBoard = () => {
    setSelected([]);
    setSolvedGroups([]);
    setMistakes(4);
    setGameOver(false);
    setIsLoading(true);
    try {
      // Generate puzzle directly on client
      const puzzle = generatePuzzle();
      const characters = charactersData as TaggedCharacter[];
      const byId = new Map(characters.map((c) => [c.id, c]));
      const cells = puzzle.allCharacterIds
        .map((id) => byId.get(id))
        .filter((c): c is TaggedCharacter => c !== undefined)
        .map((c) => ({
          id: c.id,
          name: c.name,
          imageUrl: c.imageUrl,
        }));
      
      setPuzzle({
        id: puzzle.id,
        groups: puzzle.groups,
        cells,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to generate puzzle:', error);
      setPuzzle(null);
      setIsLoading(false);
    }
  };

  const getCellState = (id: number) => {
    if (!puzzle) return 'idle';
    const solved = puzzle.groups.find(
      (g) => solvedGroups.includes(g.id) && g.characterIds.includes(id)
    );
    if (solved) return 'solved';
    if (selected.includes(id)) return 'selected';
    return 'idle';
  };

  const allSolved = solvedGroups.length === 4;
  const remainingCells = puzzle
    ? puzzle.cells.filter(
        (cell) =>
          !puzzle.groups.some(
            (g) =>
              solvedGroups.includes(g.id) &&
              g.characterIds.includes(cell.id)
          )
      ).length
    : 0;

  const getCharactersForGroup = (group: Group) => {
    if (!puzzle) return [];
    return puzzle.cells.filter((c) => group.characterIds.includes(c.id));
  };

  if (isLoading) {
    return (
      <main className="h-screen flex items-center justify-center bg-ocean-pattern">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">Loading...</div>
          <div className="text-lg font-semibold text-amber-100 drop-shadow-lg">
            Preparing your puzzle
          </div>
        </div>
      </main>
    );
  }

  if (!puzzle) {
    return (
      <main className="h-screen flex items-center justify-center bg-ocean-pattern">
        <div className="text-center px-4 max-w-md">
          <div className="text-4xl mb-4">Error</div>
          <div className="text-xl font-semibold text-amber-100 drop-shadow-lg mb-4">
            Failed to load puzzle
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-sky-950 font-bold shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen bg-ocean-pattern text-amber-50 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-6xl">
          {/* Compact Header */}
          <header className="text-center mb-3 sm:mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
                ONE PIECE CONNECTIONS
              </h1>
              <button
                onClick={() => setShowRules(true)}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-sky-800/60 backdrop-blur-sm text-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center border border-amber-500/20 hover:bg-sky-700/60 transition-all shadow-md"
                aria-label="Show rules"
                title="How to play"
              >
                i
              </button>
            </div>
            
            {/* Compact Stats Bar */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-900/40 backdrop-blur-sm border border-amber-500/20">
                <span className="text-xs font-medium text-amber-300/80">Mistakes:</span>
                <span
                  className={`text-lg font-black ${
                    mistakes === 0
                      ? 'text-red-400'
                      : mistakes <= 2
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {mistakes}
                </span>
              </div>

              {allSolved && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/40">
                  <span className="text-xs sm:text-sm font-bold text-emerald-300">
                    All connections found!
                  </span>
                </div>
              )}

              <button
                onClick={() => setShowNames(!showNames)}
                className="px-3 py-1.5 rounded-lg bg-sky-800/60 backdrop-blur-sm text-amber-100 font-semibold text-xs shadow-md hover:bg-sky-700/60 border border-amber-500/20 transition-all"
                aria-label={showNames ? 'Hide character names' : 'Show character names'}
              >
                {showNames ? 'Hide Names' : 'Show Names'}
              </button>
            </div>
          </header>

          {/* Compact Solved Connections */}
          {(solvedGroups.length > 0 || gameOver) && (
            <section className="mb-3 sm:mb-4">
              <h2 className="text-xs sm:text-sm font-bold text-amber-200/90 mb-2 uppercase tracking-wide">
                {gameOver ? 'All Connections' : 'Solved Connections'}
              </h2>
              
              <div className="grid gap-2 sm:gap-3">
                {puzzle.groups
                  .filter((g) => solvedGroups.includes(g.id) || gameOver)
                  .map((g) => {
                    const chars = getCharactersForGroup(g);
                    const groupIndex = puzzle.groups.findIndex((gr) => gr.id === g.id);
                    const colorScheme = ANSWER_COLORS[groupIndex % 4];
                    return (
                      <div
                        key={g.id}
                        className={`flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border-2 shadow-lg transition-all ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border} ${
                          gameOver && !solvedGroups.includes(g.id) ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs sm:text-sm font-black uppercase tracking-tight">
                            {g.label}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
                          {chars.map((c) => (
                            <div
                              key={c.id}
                              className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-md flex-shrink-0 transition-transform hover:scale-105"
                            >
                              {c.imageUrl && (
                                <span className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-sky-900/40 flex-shrink-0 ring-2 ring-white/60">
                                  <img
                                    src={getProxiedImageUrl(c.imageUrl) || ''}
                                    alt={c.name}
                                    className="object-contain w-full h-full"
                                  />
                                </span>
                              )}
                              <span className="text-xs font-bold text-sky-950 whitespace-nowrap">
                                {c.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* Compact Game Over Message */}
          {gameOver && (
            <div className="mb-3 text-center px-4 py-4 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-sm border-2 border-red-400/40">
              <div className="text-xl sm:text-2xl font-black text-red-300 mb-2">Game Over</div>
              <div className="text-sm text-amber-200/90 mb-4">
                All attempts exhausted. Scroll up to see the correct connections.
              </div>
              <button
                onClick={handleResetBoard}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-sky-950 font-black text-base shadow-xl hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                New Game
              </button>
            </div>
          )}

          {/* Compact Success Message */}
          {allSolved && !gameOver && (
            <div className="mb-3 text-center px-4 py-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm border-2 border-emerald-400/40">
              <div className="text-xl sm:text-2xl font-black text-emerald-300 mb-2">Congratulations!</div>
              <div className="text-sm text-amber-200/90 mb-4">
                You found all the connections!
              </div>
              <button
                onClick={handleResetBoard}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-sky-950 font-black text-base shadow-xl hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                New Game
              </button>
            </div>
          )}

          {/* Game Board - Always 4x4 */}
          {!gameOver && (
            <section className="mb-3 sm:mb-4">
              {remainingCells > 0 && (
                <div className="text-center mb-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-sky-900/40 backdrop-blur-sm text-xs text-amber-200/80 font-semibold border border-amber-500/20">
                    {remainingCells} remaining
                  </span>
                </div>
              )}
              
              {/* Always 4 columns grid */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-2xl mx-auto mb-4">
                {puzzle.cells
                  .filter(
                    (cell) =>
                      !puzzle.groups.some(
                        (g) =>
                          solvedGroups.includes(g.id) &&
                          g.characterIds.includes(cell.id)
                      )
                  )
                .map((cell) => {
                  const state = getCellState(cell.id);
                  const base =
                    'relative aspect-square rounded-lg sm:rounded-xl border-2 shadow-lg overflow-hidden cursor-pointer transition-all duration-300';
                  const colors =
                    state === 'solved'
                      ? 'border-emerald-400/60 scale-95 opacity-60'
                      : state === 'selected'
                      ? 'ring-4 ring-amber-400/80 border-amber-400 scale-110 shadow-2xl shadow-amber-500/50 z-20'
                      : 'border-amber-600/50 hover:border-amber-400/70 hover:scale-105 hover:shadow-2xl active:scale-95';
                  
                  return (
                      <button
                        key={cell.id}
                        onClick={() => onCellClick(cell.id)}
                        disabled={gameOver || allSolved}
                        className={`${base} ${colors}`}
                        aria-label={`Select ${cell.name}`}
                      >
                        {cell.imageUrl && (
                          <img
                            src={getProxiedImageUrl(cell.imageUrl) || ''}
                            alt={cell.name}
                            className="object-contain p-0.5 absolute inset-0 w-full h-full z-0"
                            loading={selected.includes(cell.id) ? 'eager' : 'lazy'}
                            onError={(e) => {
                              // Hide broken images gracefully - some images may fail due to CDN restrictions
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                        
                        {showNames && (
                          <span className="absolute bottom-0 left-0 right-0 text-[9px] sm:text-[10px] font-black text-center leading-tight px-1 py-1 sm:py-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] bg-gradient-to-t from-black/90 via-black/70 to-black/50 text-amber-50 z-10">
                            {cell.name}
                          </span>
                        )}
                        
                        {state === 'selected' && (
                          <div className="absolute top-1 right-1 bg-gradient-to-br from-amber-400 to-amber-500 text-sky-950 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-[10px] sm:text-xs font-black shadow-lg ring-2 ring-white/50">
                            {selected.indexOf(cell.id) + 1}
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Compact Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-xl mx-auto">
                {selected.length > 0 && (
                  <button
                    onClick={handleResetSelection}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-700/80 to-sky-800/80 text-amber-100 font-bold text-sm shadow-lg hover:from-sky-600/80 hover:to-sky-700/80 border border-amber-500/20 transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    Reset Selection
                  </button>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={selected.length !== 4 || mistakes === 0 || allSolved}
                  className="w-full sm:w-auto px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-sky-950 font-black text-sm sm:text-base shadow-xl hover:from-amber-400 hover:via-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:hover:via-amber-500 disabled:hover:to-amber-600 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  {selected.length === 4
                    ? `Submit (${selected.length}/4)`
                    : selected.length > 0
                    ? `Select ${4 - selected.length} more`
                    : 'Select 4 characters'}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
      
      {/* Rules Modal */}
      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </main>
  );
}
