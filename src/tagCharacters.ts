import fs from 'fs';
import path from 'path';
import type { Character, TaggedCharacter, Tag, TagInfo, TagDimension } from './models.js';
import { TAGS } from './models.js';

// Use the current working directory as the project root when running via npm scripts.
const ROOT = process.cwd();
const CHARACTERS_FILE = path.join(ROOT, 'onepiece_characters.json');
const TAGGED_FILE = path.join(ROOT, 'onepiece_characters_tagged.json');


function hasAny(strs: string[], needles: string[]): boolean {
  const lower = strs.map((s) => s.toLowerCase());
  return needles.some((n) => lower.some((s) => s.includes(n.toLowerCase())));
}

function normalizeOrigin(origin: string | null): string | null {
  if (!origin) return null;
  const o = origin.toLowerCase();
  if (o.includes('east blue')) return 'east';
  if (o.includes('west blue')) return 'west';
  if (o.includes('north blue')) return 'north';
  if (o.includes('south blue')) return 'south';
  if (o.includes('new world')) return 'new-world';
  if (o.includes('grand line')) return 'grand-line';
  if (o.includes('dressrosa')) return 'dressrosa';
  if (o.includes('alabasta')) return 'alabasta';
  if (o.includes('wano')) return 'wano';
  if (o.includes('skypiea')) return 'skypiea';
  return null;
}

function tagCharacter(c: Character): TaggedCharacter {
  const tags: Tag[] = [];

  // Crews
  const crewsLower = c.crews.map((s) => s.toLowerCase());
  const rolesLower = c.roles.map((s) => s.toLowerCase());

  if (hasAny(crewsLower, ['straw hat pirates'])) tags.push('crew:straw-hats');
  if (hasAny(crewsLower, ['red hair pirates'])) tags.push('crew:red-hair');
  if (hasAny(crewsLower, ['beasts pirates'])) tags.push('crew:beasts');
  if (hasAny(crewsLower, ['big mom pirates'])) tags.push('crew:big-mom');
  if (hasAny(crewsLower, ['blackbeard pirates'])) tags.push('crew:blackbeard');
  if (hasAny(crewsLower, ['donquixote pirates'])) tags.push('crew:donquixote');
  if (hasAny(crewsLower, ['roger pirates'])) tags.push('crew:roger');
  if (hasAny(crewsLower, ['heart pirates'])) tags.push('crew:heart');
  if (hasAny(crewsLower, ['kid pirates'])) tags.push('crew:kid');
  if (hasAny(crewsLower, ['whitebeard pirates'])) tags.push('crew:whitebeard');
  if (hasAny(crewsLower, ['marines'])) tags.push('crew:marines');
  if (hasAny(crewsLower, ['revolutionary army'])) tags.push('crew:revolutionary-army');
  if (hasAny(crewsLower, ['cipher pol', 'cp-0', 'cp 0', 'cp9', 'cp 9'])) tags.push('crew:cp');
  if (hasAny(crewsLower, ['warlords of the sea', 'shichibukai'])) tags.push('crew:shichibukai');
  if (hasAny(crewsLower, ['emperor crew', 'yonko'])) tags.push('crew:yonko-faction');
  if (hasAny(crewsLower, ['straw hat grand fleet'])) tags.push('crew:straw-hat-grand-fleet');
  if (hasAny(crewsLower, ['kouzuki family'])) tags.push('crew:kouzuki-family');
  if (hasAny(crewsLower, ['nefertari family'])) tags.push('crew:nefertari-family');
  if (hasAny(crewsLower, ['riku family'])) tags.push('crew:riku-family');
  if (hasAny(crewsLower, ['vinsmoke family'])) tags.push('crew:vinsmoke-family');
  if (hasAny(crewsLower, ['ryugu kingdom', 'fish-man island'])) tags.push('crew:fishman-island');
  if (hasAny(crewsLower, ['arabasta', 'alabasta'])) tags.push('crew:alabasta');
  if (hasAny(crewsLower, ['dressrosa'])) tags.push('crew:dressrosa');
  if (hasAny(crewsLower, ['five elders'])) tags.push('crew:five-elders');
  if (hasAny(crewsLower, ['knights of god', 'knight of god'])) tags.push('crew:knights-of-god');

  // Roles
  if (hasAny(rolesLower, ['captain'])) tags.push('role:captain');
  if (hasAny(rolesLower, ['first mate', 'first-mate'])) tags.push('role:first-mate');
  if (hasAny(rolesLower, ['helmsman'])) tags.push('role:helmsman');
  if (hasAny(rolesLower, ['sniper'])) tags.push('role:sniper');
  if (hasAny(rolesLower, ['swordsman', 'swordswoman'])) tags.push('role:swordsman');
  if (hasAny(rolesLower, ['cook', 'chef'])) tags.push('role:cook');
  if (hasAny(rolesLower, ['doctor', 'ship doctor', 'physician'])) tags.push('role:doctor');
  if (hasAny(rolesLower, ['shipwright', 'carpenter'])) tags.push('role:shipwright');
  if (hasAny(rolesLower, ['navigator'])) tags.push('role:navigator');
  if (hasAny(rolesLower, ['fleet admiral'])) tags.push('role:fleet-admiral');
  if (hasAny(rolesLower, ['admiral'])) tags.push('role:admiral');
  if (hasAny(rolesLower, ['vice admiral'])) tags.push('role:vice-admiral');
  if (hasAny(rolesLower, ['warden', 'chief guard'])) tags.push('role:warden');
  if (hasAny(rolesLower, ['king', 'queen', 'princess', 'prince'])) tags.push('role:royalty');

  // Devil fruit
  switch (c.devilFruitType) {
    case 'Paramecia':
      tags.push('fruit:paramecia');
      break;
    case 'Logia':
      tags.push('fruit:logia');
      break;
    case 'Zoan':
      tags.push('fruit:zoan');
      break;
    case 'Mythical Zoan':
      tags.push('fruit:mythical-zoan');
      break;
    default:
      break;
  }
  if (c.hasAwakenedFruit && c.devilFruitType === 'Paramecia') {
    tags.push('fruit:awakened-paramecia');
  }
  if (c.hasAwakenedFruit && c.devilFruitType && c.devilFruitType.includes('Zoan')) {
    tags.push('fruit:awakened-zoan');
  }

  // Haki
  if (c.hakiTypes.includes('Observation')) tags.push('haki:observation');
  if (c.hakiTypes.includes('Armament')) tags.push('haki:armament');
  if (c.hakiTypes.includes('Conqueror')) tags.push('haki:conqueror');
  if (
    c.hakiTypes.includes('Observation') &&
    c.hakiTypes.includes('Armament') &&
    c.hakiTypes.includes('Conqueror')
  ) {
    tags.push('haki:all-three');
  }

  // Race
  const race = c.race?.toLowerCase() ?? '';
  if (race.includes('fish-man') || race.includes('fishman')) tags.push('race:fishman');
  else if (race.includes('merfolk')) tags.push('race:merfolk');
  else if (race.includes('giant')) tags.push('race:giant');
  else if (race.includes('mink')) tags.push('race:mink');
  else if (race.includes('lunarian')) tags.push('race:lunarian');
  else if (race.includes('half-') || race.includes('hybrid')) tags.push('race:mixed');
  else if (race && race.includes('human')) tags.push('race:human');

  // Status
  const statusLower = c.status?.toLowerCase() ?? '';
  if (statusLower.includes('alive') || !statusLower) tags.push('status:alive');
  else if (statusLower.includes('deceased') || statusLower.includes('dead')) tags.push('status:deceased');

  // Origin
  const o = normalizeOrigin(c.origin);
  switch (o) {
    case 'east':
      tags.push('origin:east-blue');
      break;
    case 'west':
      tags.push('origin:west-blue');
      break;
    case 'north':
      tags.push('origin:north-blue');
      break;
    case 'south':
      tags.push('origin:south-blue');
      break;
    case 'grand-line':
      tags.push('origin:grand-line');
      break;
    case 'new-world':
      tags.push('origin:new-world');
      break;
    case 'dressrosa':
      tags.push('origin:dressrosa');
      break;
    case 'alabasta':
      tags.push('origin:alabasta');
      break;
    case 'wano':
      tags.push('origin:wano');
      break;
    case 'skypiea':
      tags.push('origin:skypiea');
      break;
    default:
      break;
  }

  // Meta
  if (c.name.includes(' D. ')) tags.push('meta:clan-of-d');
  if (hasAny(crewsLower, ['four emperors']) || rolesLower.some((r) => r.includes('emperor'))) {
    tags.push('meta:yonko');
  }
  if (hasAny(crewsLower, ['warlords of the sea', 'shichibukai'])) tags.push('meta:former-warlord');
  if (hasAny(crewsLower, ['worst generation']) || rolesLower.some((r) => r.includes('worst generation'))) {
    tags.push('meta:worst-generation');
  }

  // Combined tags: Status + Haki
  const isDeceased = statusLower.includes('deceased') || statusLower.includes('dead');
  if (isDeceased && c.hakiTypes.includes('Conqueror')) {
    tags.push('meta:deceased-conqueror');
  }
  if (
    isDeceased &&
    c.hakiTypes.includes('Observation') &&
    c.hakiTypes.includes('Armament') &&
    c.hakiTypes.includes('Conqueror')
  ) {
    tags.push('meta:deceased-all-three-haki');
  }

  // Combined tags: Status + Fruit
  if (isDeceased && c.devilFruitType === 'Logia') {
    tags.push('meta:deceased-logia');
  }
  if (isDeceased && c.devilFruitType === 'Paramecia') {
    tags.push('meta:deceased-paramecia');
  }
  if (isDeceased && (c.devilFruitType === 'Zoan' || c.devilFruitType === 'Mythical Zoan')) {
    tags.push('meta:deceased-zoan');
  }

  // Combined tags: Status + Role
  if (isDeceased && hasAny(rolesLower, ['captain'])) {
    tags.push('meta:deceased-captain');
  }
  if (isDeceased && hasAny(rolesLower, ['admiral'])) {
    tags.push('meta:deceased-admiral');
  }

  // Combined tags: Crew + Origin
  // Reuse 'o' from the Origin section above
  if (hasAny(crewsLower, ['straw hat pirates']) && o === 'east') {
    tags.push('meta:straw-hats-east-blue');
  }
  if (hasAny(crewsLower, ['straw hat pirates']) && o === 'grand-line') {
    tags.push('meta:straw-hats-grand-line');
  }
  if (hasAny(crewsLower, ['marines']) && o === 'grand-line') {
    tags.push('meta:marines-grand-line');
  }
  if (hasAny(crewsLower, ['marines']) && o === 'new-world') {
    tags.push('meta:marines-new-world');
  }

  return { ...c, tags };
}

function main() {
  const raw = fs.readFileSync(CHARACTERS_FILE, 'utf8');
  const characters: Character[] = JSON.parse(raw);

  const tagged: TaggedCharacter[] = characters.map(tagCharacter);
  fs.writeFileSync(TAGGED_FILE, JSON.stringify(tagged, null, 2), 'utf8');

  console.log(`Tagged ${tagged.length} characters -> ${TAGGED_FILE}`);
}

main();

