import fs from 'fs';

const appContent = fs.readFileSync('src/App.tsx', 'utf-8');

const dummyChar = `{
  name: 'Test',
  race: 'Human',
  class: 'Warrior',
  deity: 'Митраниэль Марр (Доблесть)',
  level: 1,
  exp: 0,
  expToNextLevel: 1000,
  hp: 100,
  maxHp: 100,
  mana: 100,
  maxMana: 100,
  gold: 0,
  skills: [],
  spells: [],
  stats: {str: 1, sta: 1, agi: 1, dex: 1, int: 1, wis: 1, cha: 1},
  equipment: { head: null, chest: null, legs: null, feet: null, primary: null, secondary: null, hands: null },
  inventory: [],
  quests: [],
  unlockedSpells: []
}`;

const replacedAppContent = appContent.replace(
  "const [character, setCharacter] = useState<PlayerCharacter | null>(null);",
  "const [character, setCharacter] = useState<PlayerCharacter | null>(" + dummyChar + ");"
).replace(
  "const [selectedTab, setSelectedTab] = useState<'zones' | 'quests' | 'character' | 'merchant' | 'guild-party' | 'chat' | 'lore' | 'admin' | 'dungeons' | 'crafting-market' | 'pets-housing'>('zones');",
  "const [selectedTab, setSelectedTab] = useState<'zones' | 'quests' | 'character' | 'merchant' | 'guild-party' | 'chat' | 'lore' | 'admin' | 'dungeons' | 'crafting-market' | 'pets-housing'>('zones');"
);

fs.writeFileSync('src/App.patched.tsx', replacedAppContent);
