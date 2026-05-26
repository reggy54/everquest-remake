export type CharacterClass =
  | 'Warrior'
  | 'Cleric'
  | 'Paladin'
  | 'Shadow Knight'
  | 'Ranger'
  | 'Druid'
  | 'Monk'
  | 'Bard'
  | 'Rogue'
  | 'Shaman'
  | 'Necromancer'
  | 'Wizard'
  | 'Magician'
  | 'Enchanter';

export type CharacterRace =
  | 'Human'
  | 'Barbarian'
  | 'Erudite'
  | 'Wood Elf'
  | 'High Elf'
  | 'Dark Elf'
  | 'Dwarf'
  | 'Halfling'
  | 'Gnome'
  | 'Ogre'
  | 'Troll'
  | 'Iksar';

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
  | 'chest'
  | 'arms'
  | 'legs'
  | 'hands'
  | 'feet'
  | 'primary'
  | 'secondary';

export interface Item {
  id: string;
  name: string;
  slot: SlotType | 'none'; // 'none' means inventory only
  description: string;
  price: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  stats: Partial<CombatStats> & { hp?: number; mana?: number; ac?: number };
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
  unlockedSpells: Spell[];
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
