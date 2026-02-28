export type HakiType = 'Observation' | 'Armament' | 'Conqueror';

export type Character = {
  id: number;
  name: string;
  imageUrl: string | null;
  crews: string[];
  roles: string[];
  devilFruitType: 'Paramecia' | 'Logia' | 'Zoan' | 'Mythical Zoan' | null;
  hasAwakenedFruit: boolean | null;
  hakiTypes: HakiType[];
  race: string | null;
  bountyNumber: number | null;
  status: string | null;
  origin: string | null;
};

export type CrewTag =
  | 'crew:straw-hats'
  | 'crew:red-hair'
  | 'crew:beasts'
  | 'crew:big-mom'
  | 'crew:blackbeard'
  | 'crew:donquixote'
  | 'crew:roger'
  | 'crew:heart'
  | 'crew:kid'
  | 'crew:whitebeard'
  | 'crew:marines'
  | 'crew:revolutionary-army'
  | 'crew:cp'
  | 'crew:shichibukai'
  | 'crew:yonko-faction'
  | 'crew:kouzuki-family'
  | 'crew:nefertari-family'
  | 'crew:riku-family'
  | 'crew:vinsmoke-family'
  | 'crew:fishman-island'
  | 'crew:alabasta'
  | 'crew:dressrosa'
  | 'crew:five-elders'
  | 'crew:knights-of-god'
  | 'crew:vegapunk-satellite';

export type RoleTag =
  | 'role:captain'
  | 'role:first-mate'
  | 'role:helmsman'
  | 'role:sniper'
  | 'role:swordsman'
  | 'role:cook'
  | 'role:doctor'
  | 'role:shipwright'
  | 'role:navigator'
  | 'role:fleet-admiral'
  | 'role:admiral'
  | 'role:vice-admiral'
  | 'role:warden'
  | 'role:royalty';

export type FruitTag =
  | 'fruit:paramecia'
  | 'fruit:logia'
  | 'fruit:zoan'
  | 'fruit:mythical-zoan'
  | 'fruit:awakened-paramecia'
  | 'fruit:awakened-zoan';

export type HakiTag =
  | 'haki:observation'
  | 'haki:armament'
  | 'haki:conqueror'
  | 'haki:all-three';

export type RaceTag =
  | 'race:human'
  | 'race:fishman'
  | 'race:merfolk'
  | 'race:giant'
  | 'race:mink'
  | 'race:lunarian'
  | 'race:mixed';

export type StatusTag = 'status:alive' | 'status:deceased';

export type OriginTag =
  | 'origin:east-blue'
  | 'origin:west-blue'
  | 'origin:north-blue'
  | 'origin:south-blue'
  | 'origin:grand-line'
  | 'origin:new-world'
  | 'origin:dressrosa'
  | 'origin:alabasta'
  | 'origin:wano'
  | 'origin:skypiea';

export type MetaTag =
  | 'meta:clan-of-d'
  | 'meta:yonko'
  | 'meta:former-warlord'
  | 'meta:worst-generation'
  // Status + Haki combinations
  | 'meta:deceased-conqueror'
  | 'meta:deceased-all-three-haki'
  // Status + Fruit combinations
  | 'meta:deceased-logia'
  | 'meta:deceased-paramecia'
  | 'meta:deceased-zoan'
  // Status + Role combinations
  | 'meta:deceased-captain'
  | 'meta:deceased-admiral'
  // Crew + Origin combinations
  | 'meta:straw-hats-east-blue'
  | 'meta:straw-hats-grand-line'
  | 'meta:marines-grand-line'
  | 'meta:marines-new-world'
  | 'meta:traitor';

export type Tag =
  | CrewTag
  | RoleTag
  | FruitTag
  | HakiTag
  | RaceTag
  | StatusTag
  | OriginTag
  | MetaTag;

export type TagDimension =
  | 'crew'
  | 'role'
  | 'fruit'
  | 'haki'
  | 'race'
  | 'status'
  | 'origin'
  | 'meta';

export type TagInfo = {
  tag: Tag;
  dimension: TagDimension;
  label: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type TaggedCharacter = Character & { tags: Tag[] };

export type PuzzleGroup = {
  id: string;
  tag: Tag;
  label: string;
  difficulty: 'easy' | 'medium' | 'hard';
  characterIds: number[];
};

export type Puzzle = {
  id: string;
  groups: PuzzleGroup[];
  allCharacterIds: number[];
};

export const TAGS: TagInfo[] = [
  { tag: 'crew:straw-hats', dimension: 'crew', label: 'Straw Hat Pirates', difficulty: 'easy' },
  { tag: 'crew:red-hair', dimension: 'crew', label: 'Red Hair Pirates', difficulty: 'medium' },
  { tag: 'crew:beasts', dimension: 'crew', label: 'Beasts Pirates', difficulty: 'medium' },
  { tag: 'crew:big-mom', dimension: 'crew', label: 'Big Mom Pirates', difficulty: 'medium' },
  { tag: 'crew:blackbeard', dimension: 'crew', label: 'Blackbeard Pirates', difficulty: 'medium' },
  { tag: 'crew:donquixote', dimension: 'crew', label: 'Donquixote Pirates', difficulty: 'medium' },
  { tag: 'crew:roger', dimension: 'crew', label: 'Roger Pirates', difficulty: 'hard' },
  { tag: 'crew:heart', dimension: 'crew', label: 'Heart Pirates', difficulty: 'medium' },
  { tag: 'crew:kid', dimension: 'crew', label: 'Kid Pirates', difficulty: 'medium' },
  { tag: 'crew:whitebeard', dimension: 'crew', label: 'Whitebeard Pirates', difficulty: 'medium' },
  { tag: 'crew:marines', dimension: 'crew', label: 'Marines', difficulty: 'easy' },
  {
    tag: 'crew:revolutionary-army',
    dimension: 'crew',
    label: 'Revolutionary Army',
    difficulty: 'medium',
  },
  { tag: 'crew:cp', dimension: 'crew', label: 'Cipher Pol', difficulty: 'hard' },
  {
    tag: 'crew:shichibukai',
    dimension: 'crew',
    label: 'Former Warlords of the Sea',
    difficulty: 'medium',
  },
  { tag: 'crew:yonko-faction', dimension: 'crew', label: 'Emperor Crews', difficulty: 'hard' },
  { tag: 'crew:kouzuki-family', dimension: 'crew', label: 'Kouzuki Family', difficulty: 'hard' },
  {
    tag: 'crew:nefertari-family',
    dimension: 'crew',
    label: 'Nefertari Family',
    difficulty: 'hard',
  },
  { tag: 'crew:riku-family', dimension: 'crew', label: 'Riku Family', difficulty: 'hard' },
  {
    tag: 'crew:vinsmoke-family',
    dimension: 'crew',
    label: 'Vinsmoke Family',
    difficulty: 'hard',
  },
  {
    tag: 'crew:fishman-island',
    dimension: 'crew',
    label: 'Fish-Man Island factions',
    difficulty: 'medium',
  },
  { tag: 'crew:alabasta', dimension: 'crew', label: 'Alabasta factions', difficulty: 'medium' },
  { tag: 'crew:dressrosa', dimension: 'crew', label: 'Dressrosa factions', difficulty: 'medium' },
  { tag: 'crew:five-elders', dimension: 'crew', label: 'Five Elders', difficulty: 'hard' },
  { tag: 'crew:knights-of-god', dimension: 'crew', label: 'Knights of God', difficulty: 'hard' }, 
  { tag: 'crew:vegapunk-satellite', dimension: 'crew', label: 'Vegapunk Satellites', difficulty: 'hard' },

  { tag: 'role:captain', dimension: 'role', label: 'Captains', difficulty: 'easy' },
  { tag: 'role:first-mate', dimension: 'role', label: 'First Mates', difficulty: 'medium' },
  { tag: 'role:helmsman', dimension: 'role', label: 'Helmsmen', difficulty: 'hard' },
  { tag: 'role:sniper', dimension: 'role', label: 'Snipers', difficulty: 'medium' },
  { tag: 'role:swordsman', dimension: 'role', label: 'Swordsmen', difficulty: 'easy' },
  { tag: 'role:cook', dimension: 'role', label: 'Cooks', difficulty: 'easy' },
  { tag: 'role:doctor', dimension: 'role', label: 'Doctors', difficulty: 'easy' },
  { tag: 'role:shipwright', dimension: 'role', label: 'Shipwrights', difficulty: 'medium' },
  { tag: 'role:navigator', dimension: 'role', label: 'Navigators', difficulty: 'easy' },
  {
    tag: 'role:fleet-admiral',
    dimension: 'role',
    label: 'Fleet Admirals',
    difficulty: 'hard',
  },
  { tag: 'role:admiral', dimension: 'role', label: 'Admirals', difficulty: 'medium' },
  { tag: 'role:vice-admiral', dimension: 'role', label: 'Vice Admirals', difficulty: 'medium' },
  {
    tag: 'role:warden',
    dimension: 'role',
    label: 'Impel Down Wardens',
    difficulty: 'medium',
  },
  { tag: 'role:royalty', dimension: 'role', label: 'Royalty', difficulty: 'medium' },

  { tag: 'fruit:paramecia', dimension: 'fruit', label: 'Paramecia users', difficulty: 'easy' },
  { tag: 'fruit:logia', dimension: 'fruit', label: 'Logia users', difficulty: 'medium' },
  { tag: 'fruit:zoan', dimension: 'fruit', label: 'Zoan users', difficulty: 'medium' },
  {
    tag: 'fruit:mythical-zoan',
    dimension: 'fruit',
    label: 'Mythical Zoan users',
    difficulty: 'hard',
  },
  {
    tag: 'fruit:awakened-paramecia',
    dimension: 'fruit',
    label: 'Awakened Paramecia users',
    difficulty: 'hard',
  },
  {
    tag: 'fruit:awakened-zoan',
    dimension: 'fruit',
    label: 'Awakened Zoan users',
    difficulty: 'hard',
  },

  {
    tag: 'haki:observation',
    dimension: 'haki',
    label: 'Observation Haki users',
    difficulty: 'easy',
  },
  {
    tag: 'haki:armament',
    dimension: 'haki',
    label: 'Armament Haki users',
    difficulty: 'easy',
  },
  {
    tag: 'haki:conqueror',
    dimension: 'haki',
    label: 'Conqueror’s Haki users',
    difficulty: 'medium',
  },
  {
    tag: 'haki:all-three',
    dimension: 'haki',
    label: 'Users of all three Haki types',
    difficulty: 'hard',
  },

  { tag: 'race:human', dimension: 'race', label: 'Humans', difficulty: 'easy' },
  { tag: 'race:fishman', dimension: 'race', label: 'Fish-Men', difficulty: 'medium' },
  { tag: 'race:merfolk', dimension: 'race', label: 'Merfolk', difficulty: 'medium' },
  { tag: 'race:giant', dimension: 'race', label: 'Giants', difficulty: 'medium' },
  { tag: 'race:mink', dimension: 'race', label: 'Minks', difficulty: 'medium' },
  { tag: 'race:lunarian', dimension: 'race', label: 'Lunarians', difficulty: 'hard' },
  { tag: 'race:mixed', dimension: 'race', label: 'Mixed race', difficulty: 'hard' },

  { tag: 'status:alive', dimension: 'status', label: 'Alive', difficulty: 'easy' },
  { tag: 'status:deceased', dimension: 'status', label: 'Deceased', difficulty: 'easy' },

  { tag: 'origin:east-blue', dimension: 'origin', label: 'From East Blue', difficulty: 'easy' },
  {
    tag: 'origin:west-blue',
    dimension: 'origin',
    label: 'From West Blue',
    difficulty: 'medium',
  },
  {
    tag: 'origin:north-blue',
    dimension: 'origin',
    label: 'From North Blue',
    difficulty: 'medium',
  },
  {
    tag: 'origin:south-blue',
    dimension: 'origin',
    label: 'From South Blue',
    difficulty: 'medium',
  },
  {
    tag: 'origin:grand-line',
    dimension: 'origin',
    label: 'From the Grand Line',
    difficulty: 'medium',
  },
  {
    tag: 'origin:new-world',
    dimension: 'origin',
    label: 'From the New World',
    difficulty: 'medium',
  },
  {
    tag: 'origin:dressrosa',
    dimension: 'origin',
    label: 'From Dressrosa',
    difficulty: 'hard',
  },
  {
    tag: 'origin:alabasta',
    dimension: 'origin',
    label: 'From Alabasta',
    difficulty: 'hard',
  },
  { tag: 'origin:wano', dimension: 'origin', label: 'From Wano', difficulty: 'hard' },
  { tag: 'origin:skypiea', dimension: 'origin', label: 'From Skypiea', difficulty: 'hard' },

  {
    tag: 'meta:clan-of-d',
    dimension: 'meta',
    label: 'Bearers of the D.',
    difficulty: 'medium',
  },
  { tag: 'meta:yonko', dimension: 'meta', label: 'Four Emperors', difficulty: 'hard' },
  {
    tag: 'meta:former-warlord',
    dimension: 'meta',
    label: 'Former Warlords',
    difficulty: 'medium',
  },
  {
    tag: 'meta:worst-generation',
    dimension: 'meta',
    label: 'Worst Generation members',
    difficulty: 'medium',
  },
  
  // Combined tags: Status + Haki
  {
    tag: 'meta:deceased-conqueror',
    dimension: 'meta',
    label: 'Deceased Conqueror\'s Haki users',
    difficulty: 'hard',
  },
  {
    tag: 'meta:deceased-all-three-haki',
    dimension: 'meta',
    label: 'Deceased users of all three Haki types',
    difficulty: 'hard',
  },
  
  // Combined tags: Status + Fruit
  {
    tag: 'meta:deceased-logia',
    dimension: 'meta',
    label: 'Deceased Logia users',
    difficulty: 'hard',
  },
  {
    tag: 'meta:deceased-paramecia',
    dimension: 'meta',
    label: 'Deceased Paramecia users',
    difficulty: 'medium',
  },
  {
    tag: 'meta:deceased-zoan',
    dimension: 'meta',
    label: 'Deceased Zoan users',
    difficulty: 'medium',
  },
  
  // Combined tags: Status + Role
  {
    tag: 'meta:deceased-captain',
    dimension: 'meta',
    label: 'Deceased Captains',
    difficulty: 'hard',
  },
  {
    tag: 'meta:deceased-admiral',
    dimension: 'meta',
    label: 'Deceased Admirals',
    difficulty: 'hard',
  },
  
  // Combined tags: Crew + Origin
  {
    tag: 'meta:straw-hats-east-blue',
    dimension: 'meta',
    label: 'Straw Hat Pirates from East Blue',
    difficulty: 'medium',
  },
  {
    tag: 'meta:straw-hats-grand-line',
    dimension: 'meta',
    label: 'Straw Hat Pirates from Grand Line',
    difficulty: 'medium',
  },
  {
    tag: 'meta:marines-grand-line',
    dimension: 'meta',
    label: 'Marines from Grand Line',
    difficulty: 'medium',
  },
  {
    tag: 'meta:marines-new-world',
    dimension: 'meta',
    label: 'Marines from New World',
    difficulty: 'hard',
  },
  {
    tag: 'meta:traitor',
    dimension: 'meta',
    label: 'Traitors',
    difficulty: 'hard',
  },
];

