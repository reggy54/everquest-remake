import fs from 'fs';

let appContent = fs.readFileSync('src/App.tsx', 'utf-8');

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

appContent = appContent.replace(
  "const [character, setCharacter] = useState<PlayerCharacter | null>(null);",
  "const [character, setCharacter] = useState<any | null>(" + dummyChar + ");"
).replace(
  "if (!user) {",
  "if (false) {"
).replace(
  "if (!character) {",
  "if (false) {"
).replace(
  "user?.isAdmin",
  "true"
);

// We need to bypass the AuthScreen
appContent = appContent.replace(
  /if \(!user\) \{\s*return <AuthScreen onLoginSuccess=\{setUser\} \/>;\s*\}/,
  ""
);

fs.writeFileSync('src/App.patched5.tsx', appContent);
