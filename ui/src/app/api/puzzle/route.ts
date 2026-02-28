import { NextResponse } from 'next/server';
import { generatePuzzle } from '@/lib/puzzle';
import charactersData from '@/data/onepiece_characters_tagged.json';
import type { TaggedCharacter } from '@/lib/models';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seed = searchParams.get('seed') ?? undefined;
  const puzzle = generatePuzzle(seed || undefined);

  const characters = charactersData as TaggedCharacter[];
  const byId = new Map(characters.map((c) => [c.id, c]));
  const cells = puzzle.allCharacterIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  return NextResponse.json({
    id: puzzle.id,
    groups: puzzle.groups,
    cells,
  });
}

