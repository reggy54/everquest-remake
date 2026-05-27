export type CharacterClass =
  | 'Warrior'
  | 'Mage'
  | 'Ranger'
  | 'Priest'
  | 'Rogue'
  | 'Summoner'
  | 'Paladin'
  | 'Shaman';

export type CharacterRace =
  | 'Human'
  | 'High Elf'
  | 'Orc'
  | 'Dwarf'
  | 'Dragonborn'
  | 'Moon Spirit'
  | 'Dark Elf'
  | 'Mechanical Construct';

export interface CombatStats {
  str: number;
  sta: number;
  agi: number;
  dex: number;
  int: number;
  wis: number;
  cha: number;
}

export type SlotType =
  | 'head'
  | 'shoulders'
  | 'chest'
  | 'hands'
  | 'waist'
  | 'legs'
  | 'feet'
  | 'cloak'
  | 'amulet'
  | 'ring1'
  | 'ring2'
  | 'primary'
  | 'secondary'
  | 'fateFocus';

export type RuneColor = 'red' | 'blue' | 'green' | 'purple' | 'gold';

export interface Rune {
  id: string;
  name: string;
  color: RuneColor;
  level: number;
  effect: string;
}

export interface ItemSocket {
  id: string;
  rune: Rune | null;
}

export interface Item {
  id: string;
  name: string;
  slot: SlotType | 'none' | 'consumable' | 'material' | 'rune'; // added rune
  description: string;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'eternium';
  stats: Partial<CombatStats> & { hp?: number; mana?: number; ac?: number };
  allowedClasses?: CharacterClass[];
  modifiers?: string[]; // E.g. '+12% Критического урона', 'Эхо Разлома'
  upgradeLevel?: number; // Up to +30
  sockets?: ItemSocket[];
}

export interface Spell {
  id: string;
  name: string;
  level: number;
  manaCost: number;
  cooldown: number; // in turns/seconds
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'utility';
  effect: string;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;
  description: string;
  objective: string;
  rewardExp: number;
  rewardGold: number;
  rewardItem?: Item;
  status: 'available' | 'active' | 'completed';
  progressCurrent: number;
  progressRequired: number;
}

export type FateType = 'Light' | 'Dark' | 'Balance' | 'Chaos' | 'Legendary';

export interface FateShard {
  id: string;
  name: string;
  type: FateType;
  description: string;
  stats?: Partial<CombatStats>;
  buff?: string;
}

export interface PlayerCharacter {
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  deity: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  stats: CombatStats;
  equipment: Record<SlotType, Item | null>;
  inventory: Item[];
  quests: Quest[];
  msqProgress?: { chapter: number; stage: number; completed: boolean };
  unlockedSpells: Spell[];
  visualCustomization?: VisualCustomization;
  // Progression
  talentPoints?: number;
  talents?: string[]; // Arrays of unlocked talent node IDs
  fateShardsInventory?: FateShard[]; 
  fatePages?: Record<number, FateShard | null>; // Page number -> inserted shard
  // External modules
  pets?: Pet[];
  houseFurniture?: FurnitureItem[];
  craftingStats?: CraftingStats;
  arenaStats?: ArenaStats;
  companions?: Record<string, CompanionState>; // companionId -> state
  activeCompanion?: string | null; // companionId
}

export interface VisualCustomization {
  hairStyle: string;
  hairColor: string;
  skinType: string;
  transmogs: Record<SlotType, string | null>;
  title: string;
  hideHelmet?: boolean;
  aura?: string | null;
  trail?: string | null;
}

export interface CompanionDef {
  id: string;
  name: string;
  race: string;
  charClass: string;
  personality: string;
  role: string;
  description: string;
  icon: string;
  romanceable: boolean;
}

export interface CompanionState {
  id: string;
  loyalty: number;
  unlocked: boolean;
}

export interface TransmogPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  author: string;
  transmogs: Record<SlotType, string | null>;
  hideHelmet?: boolean;
  aura?: string | null;
  trail?: string | null;
}

export interface Pet {
  id: string;
  name: string;
  species: 'Wolf' | 'Dragon' | 'Griffin' | 'Cat' | 'Bear';
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  damage: number;
  summoned: boolean;
}

export interface FurnitureItem {
  id: string;
  name: string;
  icon: string;
  buff: string;
  cost: number;
  placed: boolean;
}

export interface CraftingStats {
  miningLvl: number;
  miningXp: number;
  herbalismLvl: number;
  herbalismXp: number;
  cookingLvl: number;
  cookingXp: number;
  alchemyLvl: number;
  alchemyXp: number;
  ores: number;
  herbs: number;
}

export interface ArenaStats {
  rating: number; // Public rank points
  hiddenMmr?: number; // Personal hidden MMR
  roleMmr?: { dps: number; tank: number; support: number; hybrid: number };
  behaviorScore?: number; // 0 to 100
  compliments?: number;
  reports?: number;
  wins: number;
  losses: number;
  points: number;
  rank?: string;
  seasonMatches?: number;
}

export interface SimulatedPlayer {
  id: string;
  name: string;
  race: CharacterRace;
  class: CharacterClass;
  level: number;
  isLfg: boolean;
  lfgMessage?: string;
  relationshipStatus?: 'stranger' | 'friendly' | 'party_member';
}

export interface ChatMessage {
  id: string;
  sender: string;
  channel: 'OOC' | 'Auction' | 'Guild' | 'Shout' | 'System';
  text: string;
  timestamp: string;
  class?: CharacterClass; // Optional details
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  difficulty: 'Safe' | 'Easy' | 'Medium' | 'Hard' | 'Raid';
  monsters: { name: string; level: number; hp: number; isBoss?: boolean }[];
  connections: string[]; // connecting zone IDs
  imageUrl?: string;
  events?: { name: string; type: 'cyclic' | 'dynamic' | 'world'; frequency: string; reward: string; description: string }[];
  pointsOfInterest?: string[];
}

export interface CombatEntity {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  class?: CharacterClass;
  isPlayerControlled?: boolean;
}

export interface CombatRoundLog {
  turnText: string;
  damages: { target: string; amount: number; type: string }[];
  heals: { target: string; amount: number }[];
}
