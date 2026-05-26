import { CharacterClass, CharacterRace, CombatStats, Zone, Item, Spell } from '../types';

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  Warrior: 'Masters of melee weapons. High hitpoints and armor. Employs Taunt to guard allies.',
  Cleric: 'The ultimate healer. Employs potent dynamic heals and shields. Crucial for any group crawl.',
  Paladin: 'Holy crusader. Blends strong melee damage with holy healing capabilities and undead banes.',
  'Shadow Knight': 'Dark knight of agony. Combines plate armor with disease spells, life taps, and fear.',
  Ranger: 'Master of wilderness, paths, and bows. Delivers swift damage at range or melee.',
  Druid: 'Nature calling. Blends forest damage spells, healing regenerations, and swift teleports.',
  Monk: 'Unarmed combat master. Blends epic martial strikes with mend heals and death feign evasion.',
  Bard: 'Dynamic songweavers. Buffs party mana regeneration, speed, and attack damage continually.',
  Rogue: 'Masters of disguise. Executes massive Backstabs when attacking from the shadows.',
  Shaman: 'Tribal witch doctors. Employs strong stat buffs, slowing debuffs, and damage-over-time alchemy.',
  Necromancer: 'Summoners of death. Conjures skeletal pets, life-drains targets, and converts health to mana.',
  Wizard: 'Pure spell damage focus. Devastates enemies with colossal fire, ice, and lightning spells.',
  Magician: 'Elemental summoners. Conjures blazing elemental pets and provides magical armor resources.',
  Enchanter: 'Masters of illusion and mind. Grants colossal mana buffs and paralyzes enemies with crowd control.',
};

export const RACE_BONUSES: Record<CharacterRace, { stats: Partial<CombatStats>; description: string }> = {
  Human: { stats: { cha: 5, sta: 2 }, description: 'Versatile and adaptable, comfortable in all guild halls.' },
  Barbarian: { stats: { str: 10, sta: 5 }, description: 'Mighty northern giants from Everfrost. Natural slam strikes.' },
  Erudite: { stats: { int: 15, wis: 5, cha: -5 }, description: 'High scholars of arcane wisdom. Unmatched intellect.' },
  'Wood Elf': { stats: { agi: 10, dex: 5 }, description: 'Agile forest dwellers. Exceptional vision and speed.' },
  'High Elf': { stats: { wis: 10, int: 5, str: -5 }, description: 'Blessed by Tunare. Graceful and deeply spiritual.' },
  'Dark Elf': { stats: { int: 10, dex: 10, cha: -10 }, description: 'Born in Neriak. Possess darkvision and cunning.' },
  Dwarf: { stats: { sta: 15, str: 10, cha: -5 }, description: 'Stout plate wielders. Exceptional magical and poison resistance.' },
  Halfling: { stats: { dex: 15, agi: 5 }, description: 'Inquisitive and stealthy explorers. Sneak bonuses.' },
  Gnome: { stats: { int: 10, dex: 10 }, description: 'Resourceful tinkerers and arcane mechanics.' },
  Ogre: { stats: { str: 20, sta: 15, int: -15, cha: -15 }, description: 'Colossal physical power. Unstoppable, immune to front stuns.' },
  Troll: { stats: { sta: 20, str: 10, int: -15, wis: -10 }, description: 'Swift swamp hunters. Possess high natural health regeneration.' },
  Iksar: { stats: { agi: 10, sta: 5, wis: 5, cha: -10 }, description: 'Reptilian masters of Kunark. Heavy armor-scaling skin.' },
};

export const SYSTEM_DEITIES = [
  'Mithaniel Marr (Valor)',
  'Tunare (Mother of All)',
  'Cazic-Thule (Lord of Fear)',
  'Innoruuk (Prince of Hate)',
  'Solusek Ro (燃 Burning Prince)',
  'Brell Serilis (Duke of Underfoot)',
  'The Tribunal (Justice)',
  'Rallos Zek (Warlord)',
  'Rodcet Nife (Prime Healer)',
];

export const INITIAL_BASE_STATS: Record<CharacterClass, CombatStats> = {
  Warrior: { str: 85, sta: 90, agi: 80, dex: 80, int: 50, wis: 50, cha: 60 },
  Cleric: { str: 70, sta: 75, agi: 70, dex: 70, int: 60, wis: 85, cha: 75 },
  Paladin: { str: 80, sta: 85, agi: 75, dex: 75, int: 50, wis: 70, cha: 75 },
  'Shadow Knight': { str: 80, sta: 85, agi: 75, dex: 75, int: 70, wis: 50, cha: 60 },
  Ranger: { str: 75, sta: 75, agi: 85, dex: 80, int: 55, wis: 65, cha: 65 },
  Druid: { str: 65, sta: 70, agi: 75, dex: 70, int: 60, wis: 85, cha: 70 },
  Monk: { str: 80, sta: 80, agi: 85, dex: 85, int: 50, wis: 50, cha: 55 },
  Bard: { str: 75, sta: 75, agi: 80, dex: 75, int: 60, wis: 60, cha: 85 },
  Rogue: { str: 75, sta: 70, agi: 85, dex: 90, int: 50, wis: 50, cha: 60 },
  Shaman: { str: 70, sta: 80, agi: 70, dex: 70, int: 50, wis: 80, cha: 65 },
  Necromancer: { str: 60, sta: 70, agi: 75, dex: 75, int: 85, wis: 60, cha: 55 },
  Wizard: { str: 60, sta: 70, agi: 75, dex: 75, int: 90, wis: 60, cha: 60 },
  Magician: { str: 60, sta: 70, agi: 75, dex: 75, int: 85, wis: 60, cha: 60 },
  Enchanter: { str: 60, sta: 70, agi: 70, dex: 75, int: 85, wis: 65, cha: 80 },
};

export const GAME_ZONES: Zone[] = [
  {
    id: 'qeynos-hills',
    name: 'Qeynos Hills',
    description: 'Lush rolling hills outside the gates of Qeynos. Ideal for young adventurers seeking basic game sense.',
    minLevel: 1,
    difficulty: 'Safe',
    monsters: [
      { name: 'Fire Beetle', level: 1, hp: 20 },
      { name: 'Decaying Skeleton', level: 1, hp: 25 },
      { name: 'Giant Field Rat', level: 2, hp: 35 },
      { name: 'Grizzly Bear Cub', level: 3, hp: 50 },
    ],
    connections: ['blackburrow', 'east-commonlands'],
  },
  {
    id: 'east-commonlands',
    name: 'East Commonlands',
    description: 'The ancient trade crossroads of Norrath. Merchants gather near the tunnel ruins to trade massive wares.',
    minLevel: 4,
    difficulty: 'Easy',
    monsters: [
      { name: 'Desert Tarantula', level: 4, hp: 70 },
      { name: 'Hill Giant Scout', level: 6, hp: 120 },
      { name: 'Shadow Wolf', level: 5, hp: 90 },
      { name: 'Griffin Fledgling', level: 7, hp: 160 },
    ],
    connections: ['qeynos-hills', 'lower-guk', 'castle-mistmoore'],
  },
  {
    id: 'blackburrow',
    name: 'Blackburrow Canyon',
    description: 'A dark cavern canyon infested with vicious Sabertooth gnolls plotting raids against neighboring cities.',
    minLevel: 5,
    difficulty: 'Medium',
    monsters: [
      { name: 'Gnoll Scamp', level: 5, hp: 110 },
      { name: 'Gnoll Guard', level: 7, hp: 160 },
      { name: 'Gnoll Elixir Maker', level: 8, hp: 190 },
      { name: 'Captain Al`Ykesha', level: 10, hp: 320, isBoss: true },
    ],
    connections: ['qeynos-hills'],
  },
  {
    id: 'lower-guk',
    name: 'Lower Guk (Ruins)',
    description: 'Ancient damp fortress of frogloks overrun by marsh decay and skeletal knights guarding ancestral blades.',
    minLevel: 11,
    difficulty: 'Hard',
    monsters: [
      { name: 'Froglok Shin Knight', level: 12, hp: 350 },
      { name: 'Undead Froglok Mage', level: 13, hp: 420 },
      { name: 'Gargantuan Spider', level: 15, hp: 580 },
      { name: 'The Ghoul Lord', level: 18, hp: 1100, isBoss: true },
    ],
    connections: ['east-commonlands'],
  },
  {
    id: 'castle-mistmoore',
    name: 'Castle Mistmoore',
    description: 'Lair of Mayong Mistmoore. Dark gargoyles and bloodthirsty vampires guard this hauntingly luxurious keep.',
    minLevel: 15,
    difficulty: 'Hard',
    monsters: [
      { name: 'Mistmoore Gargoyle', level: 15, hp: 600 },
      { name: 'Crescent Vampire', level: 17, hp: 780 },
      { name: 'Dark Seductress', level: 19, hp: 950 },
      { name: 'Viscount Mistmoore', level: 22, hp: 1600, isBoss: true },
    ],
    connections: ['east-commonlands'],
  },
  {
    id: 'plane-of-fear',
    name: 'Plane of Fear',
    description: 'Demonic realm of Cazic-Thule. Colossal monsters roam the red sands to test the ultimate level-cap raid groups.',
    minLevel: 25,
    difficulty: 'Raid',
    monsters: [
      { name: 'Fright-Weaver Gorgon', level: 25, hp: 2500 },
      { name: 'Amorphous Dread', level: 27, hp: 3500 },
      { name: 'Avatar of Cazic-Thule', level: 30, hp: 8500, isBoss: true },
    ],
    connections: ['east-commonlands'],
  },
];

export const WORLD_SPELLS: Spell[] = [
  // Wizard Spells
  { id: 'firebolt', name: 'Shock of Fire', level: 1, manaCost: 15, cooldown: 1, type: 'damage', effect: 'Deals 35 points of Fire damage.' },
  { id: 'ice-comet', name: 'Ice Comet', level: 10, manaCost: 65, cooldown: 3, type: 'damage', effect: 'Deals 220 points of massive Ice damage.' },
  // Cleric Spells
  { id: 'minor-heal', name: 'Light Cure', level: 1, manaCost: 10, cooldown: 1, type: 'heal', effect: 'Restores 40 Health to an ally.' },
  { id: 'complete-heal', name: 'Complete Restor', level: 10, manaCost: 60, cooldown: 4, type: 'heal', effect: 'Fully heals an ally for 400 Health.' },
  // Enchanter Spells
  { id: 'clarity', name: 'Clarity of Mind', level: 5, manaCost: 25, cooldown: 5, type: 'buff', effect: 'Boosts Mana regeneration by 10 per turn for 4 turns.' },
  { id: 'mesmerize', name: 'Mesmerize', level: 8, manaCost: 35, cooldown: 4, type: 'debuff', effect: 'Pacifies enemies, reducing their outgoing damage by 40%.' },
  // General/Mage utility
  { id: 'shield', name: 'Earth Shield', level: 2, manaCost: 15, cooldown: 3, type: 'buff', effect: 'Grants 15 armor class and 50 shield points.' },
];

export const STARTING_GEAR: Partial<Record<CharacterClass, Partial<Record<string, Item>>>> = {
  Warrior: {
    primary: {
      id: 'rust-sword',
      name: 'Rusty Broadsword',
      slot: 'primary',
      description: 'A heavy, weather-beaten iron broadsword. Good for swinging.',
      price: 5,
      rarity: 'common',
      stats: { str: 2 },
    },
    chest: {
      id: 'leather-tunic',
      name: 'Weathered Chain Chestpiece',
      slot: 'chest',
      description: 'Provides decent protection from the gnolls.',
      price: 15,
      rarity: 'common',
      stats: { sta: 3, ac: 8 },
    },
  },
  Cleric: {
    primary: {
      id: 'wooden-mace',
      name: 'Blessed Wooden Mace',
      slot: 'primary',
      description: 'Engraved with divine markings of healing faith.',
      price: 5,
      rarity: 'common',
      stats: { wis: 3 },
    },
    chest: {
      id: 'novice-vest',
      name: 'Novice Cloth Robes',
      slot: 'chest',
      description: 'Standard white fabrics of church acolytes.',
      price: 10,
      rarity: 'common',
      stats: { wis: 2, mana: 15 },
    },
  },
  Wizard: {
    primary: {
      id: 'cracked-staff',
      name: 'Cracked Wooden Staff',
      slot: 'primary',
      description: 'Crackle with a very faint electrostatic potential.',
      price: 4,
      rarity: 'common',
      stats: { int: 3 },
    },
    hands: {
      id: 'cloth-gloves',
      name: 'Worn Cloth Gloves',
      slot: 'hands',
      description: 'Provides high finger flexibility during somatic spells.',
      price: 2,
      rarity: 'common',
      stats: { int: 1, mana: 10 },
    },
  },
  // Fallbacks are constructed cleanly in creator.
};

export const COMMON_TEMPLATES = {
  merchantItems: [
    { id: 'iron-helmet', name: 'Plated Iron Helm', slot: 'head', description: 'Heavy battle helmet providing substantial defense.', price: 45, rarity: 'uncommon', stats: { sta: 3, ac: 10 } },
    { id: 'leather-boots', name: 'Elven Leather Boots', slot: 'feet', description: 'Light boots crafted by wood elves for silent movements.', price: 25, rarity: 'uncommon', stats: { agi: 4, ac: 4 } },
    { id: 'mana-ring', name: 'Glinting Platinum Loop', slot: 'secondary', description: 'A sparkling ring infused with pure mana essence.', price: 75, rarity: 'rare', stats: { int: 5, wis: 5, mana: 30 } },
    { id: 'rubicund-breastplate', name: 'Rubicund Breastplate', slot: 'chest', description: 'Legendary dynamic ruby polished plate armor shielding Norrath guardians.', price: 250, rarity: 'epic', stats: { str: 10, sta: 12, ac: 25, hp: 80 } },
    { id: 'ghoulbane', name: 'Ghoulbane Paladin Blade', slot: 'primary', description: 'An legendary glowing broadsword of righteous fury, dealing double damage against undead.', price: 400, rarity: 'epic', stats: { str: 14, wis: 8, ac: 10, hp: 50 } },
  ] as Item[],

  simulatedNames: [
    'Ogre_Mouth',
    'Elf_Princess',
    'Dwarf_Miner',
    'Heil_Vandor',
    'Fippy_Darkpaw',
    'Lady_Vox',
    'Mayong_V',
    'SpeedyG',
    'Tank_Express',
    'Heals_R_Us',
    'Drizzt_Clone',
    'Quellious_Monk',
    'Necro_Babe',
    'Song_Sparrow',
    'Crit_Happens',
  ],

  simulatedLFGs: [
    'LFG Level 5 Cleric Blackburrow! Fully speced with Light Cur.',
    'LFG Level 10 Monk Upper Guk crawl! High dps focus.',
    'Paladin Level 15 LFG Castle Mistmoore room. Wielding Ghoulbane.',
    'Enchanter Level 8 LFG anywhere. Need mana buffs? I got Clarity.',
    'LFG Warrior Level 25 Raid Plane of Fear ready. High threat master.',
    'Rogue Level 12 looking for dungeon crawl of Mistmoore. Can pick locks.',
  ],
};
