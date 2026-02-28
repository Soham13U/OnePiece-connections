import fs from 'fs';
import path from 'path';
import type { TaggedCharacter, TagInfo, Tag, TagDimension, Puzzle, PuzzleGroup } from './models.js';
import { TAGS } from './models.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), '..');
const TAGGED_FILE = path.join(ROOT, 'onepiece_characters_tagged.json');

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildByTag(characters: TaggedCharacter[]): Map<Tag, TaggedCharacter[]> {
  const byTag = new Map<Tag, TaggedCharacter[]>();
  for (const c of characters) {
    for (const t of c.tags as Tag[]) {
      if (!byTag.has(t)) byTag.set(t, []);
      byTag.get(t)!.push(c);
    }
  }
  return byTag;
}

function pickTags(byTag: Map<Tag, TaggedCharacter[]>): TagInfo[] {
  const shuffled = shuffle(TAGS);
  const chosen: TagInfo[] = [];
  const usedDimensions = new Set<TagDimension>();

  for (const info of shuffled) {
    // Skip groups that are solely about origin or status — these must only
    // appear as part of higher-level/meta connections (e.g. combined with
    // crew, haki, etc.), not as standalone dimensions on the board.
    if (info.dimension === 'status' || info.dimension === 'origin') continue;

    const pool = byTag.get(info.tag);
    // Need at least 4 characters to build a group
    if (!pool || pool.length < 4) continue;
    if (usedDimensions.has(info.dimension)) continue;
    chosen.push(info);
    usedDimensions.add(info.dimension);
    if (chosen.length === 4) break;
  }

  if (chosen.length !== 4) {
    throw new Error('Could not find 4 suitable tags for puzzle');
  }
  return chosen;
}

function pickGroupCharacters(
  tag: Tag,
  byTag: Map<Tag, TaggedCharacter[]>,
  usedIds: Set<number>,
  rng: () => number = Math.random
): number[] {
  const pool = shuffle(byTag.get(tag) ?? [], rng);
  const chosen: number[] = [];

  for (const ch of pool) {
    if (!usedIds.has(ch.id)) {
      chosen.push(ch.id);
      usedIds.add(ch.id);
      if (chosen.length === 4) break;
    }
  }

  if (chosen.length < 4) {
    throw new Error(`Not enough unique characters for tag ${tag}`);
  }

  return chosen;
}

function validateUniqueSolution(
  groups: PuzzleGroup[],
  charactersById: Map<number, TaggedCharacter>
): boolean {
  const intendedTags = new Set<Tag>(groups.map((g) => g.tag));
  const counts = new Map<Tag, number>();

  const chars = groups
    .flatMap((g) => g.characterIds)
    .map((id) => charactersById.get(id)!)
    .filter(Boolean);

  for (const ch of chars) {
    for (const t of ch.tags as Tag[]) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }

  // Intended tags must appear exactly 4 times each
  for (const g of groups) {
    if ((counts.get(g.tag) ?? 0) !== 4) return false;
  }

  return true;
}

function generatePuzzle(seed?: string): Puzzle {
  const raw = fs.readFileSync(TAGGED_FILE, 'utf8');
  const characters: TaggedCharacter[] = JSON.parse(raw);

  const byId = new Map<number, TaggedCharacter>();
  for (const c of characters) byId.set(c.id, c);

  const byTag = buildByTag(characters);

  // Simple seedable RNG using xorshift32
  let state =
    seed != null
      ? seed
          .split('')
          .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) || 1
      : Date.now();
  const rng = () => {
    state ^= state << 13;
    state ^= state >> 17;
    state ^= state << 5;
    return (state >>> 0) / 0xffffffff;
  };

  let attempts = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    attempts++;
    const usedIds = new Set<number>();
    const tagInfos = pickTags(byTag);

    try {
      const groups: PuzzleGroup[] = tagInfos.map((info, idx) => ({
        id: `g${idx}`,
        tag: info.tag,
        label: info.label,
        difficulty: info.difficulty,
        characterIds: pickGroupCharacters(info.tag, byTag, usedIds, rng),
      }));

      if (!validateUniqueSolution(groups, byId)) {
        if (attempts > 200) {
          throw new Error('Failed to find unique-solution puzzle after many attempts');
        }
        continue;
      }

      const allCharacterIds = shuffle(groups.flatMap((g) => g.characterIds), rng);

      return {
        id: seed ?? new Date().toISOString(),
        groups,
        allCharacterIds,
      };
    } catch {
      if (attempts > 200) {
        throw new Error('Failed to build puzzle after many attempts');
      }
    }
  }
}

function main() {
  const seed = process.argv[2];
  const puzzle = generatePuzzle(seed);
  console.log(JSON.stringify(puzzle, null, 2));
}

main();

