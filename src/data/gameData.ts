import { CharacterClass, CharacterRace, CombatStats, Zone, Item, Spell } from '../types';

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  Warrior: 'Мастер ближнего боя. Огромный запас здоровья и тяжелая броня. Защищает союзников, провоцируя врагов.',
  Cleric: 'Величайший целитель. Владеет мощными исцеляющими заклинаниями и божественными щитами. Незаменим в любом подземелье.',
  Paladin: 'Священный рыцарь. Сочетает урон в ближнем бою со святым исцелением и изгнанием нежити.',
  'Shadow Knight': 'Темный рыцарь. Сочетает латную броню с болезнями, вампиризмом и заклинаниями страха.',
  Ranger: 'Хранитель дикой природы и стрелок. Наносит стремительный урон из лука или в ближнем бою.',
  Druid: 'Единение с природой. Использует лесную магию стихий, исцеление и мгновенные телепорты.',
  Monk: 'Мастер рукопашного боя. Сочетает серии ударов, медитацию, самоисцеление и притворную смерть.',
  Bard: 'Менестрель. Исполняет песни, непрерывно усиливающие регенерацию маны, скорость и урон группы.',
  Rogue: 'Неуловимый убийца. Наносит сокрушительные удары в спину из режима скрытности.',
  Shaman: 'Племенной знахарь. Накладывает сильнейшие баффы на параметры, ослабляет врагов и варит зелья.',
  Necromancer: 'Повелитель смерти. Призывает скелетов-прислужников, вытягивает жизнь и преобразует здоровье в ману.',
  Wizard: 'Чистый разрушитель. Уничтожает противников колоссальными заклинаниями огня, льда и молнии.',
  Magician: 'Призыватель стихий. Призывает пылающих элементалей и создает магическую экипировку.',
  Enchanter: 'Мастер контроля разума. Обеспечивает колоссальный прилив маны группе и парализует врагов.',
};

export const RACE_BONUSES: Record<CharacterRace, { stats: Partial<CombatStats>; description: string }> = {
  Human: { stats: { cha: 5, sta: 2 }, description: 'Универсален и ловок, приветствуется в любой гильдии.' },
  Barbarian: { stats: { str: 10, sta: 5 }, description: 'Могучие северные гиганты из Вечных Льдов. Обладают навыком сокрушения.' },
  Erudite: { stats: { int: 15, wis: 5, cha: -5 }, description: 'Великие ученые тайных искусств. Непревзойденный интеллект.' },
  'Wood Elf': { stats: { agi: 10, dex: 5 }, description: 'Ловкие лесные жители. Обладают отличным зрением и высокой скоростью.' },
  'High Elf': { stats: { wis: 10, int: 5, str: -5 }, description: 'Благословлены Тунаре. Грациозные, одухотворенные и глубоко верующие.' },
  'Dark Elf': { stats: { int: 10, dex: 10, cha: -10 }, description: 'Жители темного Нериака. Владеют ночным зрением, скрытны и коварны.' },
  Dwarf: { stats: { sta: 15, str: 10, cha: -5 }, description: 'Крепкие латные воины. Отличное сопротивление магии и ядам.' },
  Halfling: { stats: { dex: 15, agi: 5 }, description: 'Любознательные и скрытные первооткрыватели. Бонус к скрытности.' },
  Gnome: { stats: { int: 10, dex: 10 }, description: 'Изобретательные инженеры и знатоки техно-магии.' },
  Ogre: { stats: { str: 20, sta: 15, int: -15, cha: -15 }, description: 'Колоссальная физическая мощь. Неудержимы, иммунны к оглушению спереди.' },
  Troll: { stats: { sta: 20, str: 10, int: -15, wis: -10 }, description: 'Стремительные болотные охотники. Обладают невероятно быстрой естественной регенерацией здоровья.' },
  Iksar: { stats: { agi: 10, sta: 5, wis: 5, cha: -10 }, description: 'Рептилии Кунарка. Чешуйчатая кожа дает высокий показатель брони.' },
};

export const SYSTEM_DEITIES = [
  'Митраниэль Марр (Доблесть)',
  'Тунаре (Мать Всего сущего)',
  'Казик-Туле (Повелитель Страха)',
  'Инноруук (Принц Ненависти)',
  'Солусек Ро (Пылающий Принц)',
  'Брелл Серилис (Герцог Подземелья)',
  'Трибунал (Правосудие)',
  'Раллос Зек (Командующий Войной)',
  'Родсет Найф (Главный Целитель)',
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
    id: 'valoria-continent',
    name: 'Авалон (Стартовый Континент)',
    description: 'Огромный бесшовный континент площадью более 40 000 км². Великолепные леса, реки и скалистые хребты. Здесь расположены ключевые хабы и торговые площади начинающих гильдий.',
    minLevel: 1,
    difficulty: 'Safe',
    imageUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Вожак стаи равнин', level: 2, hp: 35 },
      { name: 'Механический страж', level: 5, hp: 80 },
      { name: 'Лесной энт-стражник', level: 8, hp: 150 },
      { name: 'Алчный мародер', level: 12, hp: 300 },
    ],
    connections: ['cyber-megacity', 'volcanic-wastes'],
  },
  {
    id: 'cyber-megacity',
    name: 'Неокарния (Кибер-Мегаполис)',
    description: 'Огромный многоуровневый неоновый мегаполис, работающий на техномагии. Сотни игроков торгуют на парящих аукционах, создают кибер-импланты и ведут теневые разборки синдикатов.',
    minLevel: 15,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1515281239448-2afe2491a134?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Беглый киборг', level: 15, hp: 450 },
      { name: 'Служебный дрон-ликвидатор', level: 18, hp: 600 },
      { name: 'Синдикатский боевик', level: 22, hp: 850 },
      { name: 'ИИ-Надзиратель Альфа', level: 25, hp: 3200, isBoss: true },
    ],
    connections: ['valoria-continent', 'abyssal-depths'],
  },
  {
    id: 'volcanic-wastes',
    name: 'Пепельные Пустоши (Вулкан)',
    description: 'Опасный биом, где лавовые реки постоянно меняют русло из-за динамических событий мира. Сюда со всего мира стягиваются кузнецы в поисках редчайшей раскаленной руды.',
    minLevel: 30,
    difficulty: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1614210408544-7f1dfa832f05?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Обсидиановый голем', level: 30, hp: 1500 },
      { name: 'Лавовая саламандра', level: 35, hp: 2200 },
      { name: 'Пепельный элементаль', level: 38, hp: 2800 },
      { name: 'Владыка Инферно', level: 42, hp: 8500, isBoss: true },
    ],
    connections: ['valoria-continent', 'cosmic-galaxy'],
  },
  {
    id: 'abyssal-depths',
    name: 'Лемурия (Подводные Глубины)',
    description: 'Мифический подводный город-государство. Исследование требует артефактов дыхания под водой. Радикально изменяет физику передвижения и боя среди коралловых рифов.',
    minLevel: 45,
    difficulty: 'Hard',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Глубинный охотник', level: 45, hp: 4000 },
      { name: 'Жрец культа Дагона', level: 48, hp: 5500 },
      { name: 'Кракен-надзиратель', level: 52, hp: 8000 },
      { name: 'Левиафан Лемурии', level: 55, hp: 25000, isBoss: true },
    ],
    connections: ['cyber-megacity', 'cosmic-galaxy'],
  },
  {
    id: 'cosmic-galaxy',
    name: 'Эфирные Рубежи (Космос)',
    description: 'Бесконечные параллельные измерения и астральный космос. Игроки путешествуют на воздушных и космических кораблях, участвуя в масштабных рейдах на гигантских боссов.',
    minLevel: 60,
    difficulty: 'Raid',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Астральный пожиратель', level: 60, hp: 15000 },
      { name: 'Фантом пустоты', level: 65, hp: 22000 },
      { name: 'Рыцарь Черной Дыры', level: 70, hp: 35000 },
      { name: 'Титанический Космический Бог', level: 80, hp: 150000, isBoss: true },
    ],
    connections: ['volcanic-wastes', 'abyssal-depths'],
  },
];

export const WORLD_SPELLS: Spell[] = [
  // Wizard Spells
  { id: 'firebolt', name: 'Удар Огня', level: 1, manaCost: 15, cooldown: 1, type: 'damage', effect: 'Наносит 35 единиц огненного урона.' },
  { id: 'ice-comet', name: 'Ледяной Комет', level: 10, manaCost: 65, cooldown: 3, type: 'damage', effect: 'Наносит 220 единиц сокрушительного урона льдом.' },
  // Cleric Spells
  { id: 'minor-heal', name: 'Светлое Исцеление', level: 1, manaCost: 10, cooldown: 1, type: 'heal', effect: 'Восстанавливает 40 единиц здоровья союзнику.' },
  { id: 'complete-heal', name: 'Полное Восстановление', level: 10, manaCost: 60, cooldown: 4, type: 'heal', effect: 'Полностью исцеляет союзника на 400 единиц здоровья.' },
  // Enchanter Spells
  { id: 'clarity', name: 'Ясность разума', level: 5, manaCost: 25, cooldown: 5, type: 'buff', effect: 'Увеличивает регенерацию маны на 10 за ход на 4 хода.' },
  { id: 'mesmerize', name: 'Усыпление', level: 8, manaCost: 35, cooldown: 4, type: 'debuff', effect: 'Умиротворяет врагов, снижая их наносимый урон на 40%.' },
  // General/Mage utility
  { id: 'shield', name: 'Щит Земли', level: 2, manaCost: 15, cooldown: 3, type: 'buff', effect: 'Дарует 15 единиц класса брони и 50 очков щита.' },
];

export const STARTING_GEAR: Partial<Record<CharacterClass, Partial<Record<string, Item>>>> = {
  Warrior: {
    primary: {
      id: 'rust-sword',
      name: 'Ржавый палаш',
      slot: 'primary',
      description: 'Тяжелый, изъеденный непогодой железный палаш. Отлично подходит для замаха.',
      price: 5,
      rarity: 'common',
      stats: { str: 2 },
    },
    chest: {
      id: 'leather-tunic',
      name: 'Поношенный кольчужный доспех',
      slot: 'chest',
      description: 'Обеспечивает достойную защиту от когтей гноллов.',
      price: 15,
      rarity: 'common',
      stats: { sta: 3, ac: 8 },
    },
  },
  Cleric: {
    primary: {
      id: 'wooden-mace',
      name: 'Благословленная деревянная mace',
      slot: 'primary',
      description: 'Покрыта священными письменами целительской веры.',
      price: 5,
      rarity: 'common',
      stats: { wis: 3 },
    },
    chest: {
      id: 'novice-vest',
      name: 'Тканое одеяние послушника',
      slot: 'chest',
      description: 'Строгая белая одежда церковных аколитов.',
      price: 10,
      rarity: 'common',
      stats: { wis: 2, mana: 15 },
    },
  },
  Wizard: {
    primary: {
      id: 'cracked-staff',
      name: 'Треснувший деревянный посох',
      slot: 'primary',
      description: 'Потрескивает слабым электростатическим напряжением.',
      price: 4,
      rarity: 'common',
      stats: { int: 3 },
    },
    hands: {
      id: 'cloth-gloves',
      name: 'Изношенные тканевые перчатки',
      slot: 'hands',
      description: 'Обеспечивают высокую подвижность пальцев для соматических заклинаний.',
      price: 2,
      rarity: 'common',
      stats: { int: 1, mana: 10 },
    },
  },
};

export const COMMON_TEMPLATES = {
  merchantItems: [
    { id: 'iron-helmet', name: 'Латный железный шлем', slot: 'head', description: 'Тяжелый боевой шлем, обеспечивающий превосходную защиту.', price: 45, rarity: 'uncommon', stats: { sta: 3, ac: 10 }, allowedClasses: ['Warrior', 'Paladin', 'Shadow Knight', 'Cleric'] },
    { id: 'leather-boots', name: 'Эльфийские кожаные сапоги', slot: 'feet', description: 'Легкие сапоги, созданные эльфами для бесшумного бега.', price: 25, rarity: 'uncommon', stats: { agi: 4, ac: 4 }, allowedClasses: ['Ranger', 'Druid', 'Rogue', 'Monk', 'Bard', 'Shaman'] },
    { id: 'mana-ring', name: 'Сверкающее платиновое кольцо', slot: 'secondary', description: 'Сверкающий перстень, наделенный чистой эссенцией маны.', price: 75, rarity: 'rare', stats: { int: 5, wis: 5, mana: 30 }, allowedClasses: ['Wizard', 'Enchanter', 'Magician', 'Necromancer', 'Cleric', 'Druid', 'Shaman'] },
    { id: 'rubicund-breastplate', name: 'Рубиновый нагрудник', slot: 'chest', description: 'Легендарный сияющий доспех защитников Этернии.', price: 250, rarity: 'epic', stats: { str: 10, sta: 12, ac: 25, hp: 80 }, allowedClasses: ['Warrior', 'Paladin', 'Shadow Knight', 'Cleric'] },
    { id: 'ghoulbane', name: 'Клирик-Паладинский Бич Проклятых', slot: 'primary', description: 'Легендарный сияющий клинок праведного гнева, наносящий двойной урон нежити.', price: 400, rarity: 'epic', stats: { str: 14, wis: 8, ac: 10, hp: 50 }, allowedClasses: ['Paladin', 'Cleric'] },
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
    'Ищу группу! Клирик 5 уровня в Ущелье Черного Зуба со Светлым Исцелением.',
    'Ищу группу! Монах 10 уровня на зачистку Верхнего Гука. Высокий ДПС.',
    'Паладин 15 уровня ищет группу в Замок Мистмур. В руках Бич Проклятых.',
    'Иллюзионист 8 уровня ищет группу куда угодно. Нужен бафф на ману? Есть Ясность.',
    'Ищу рейд! Танк-Воин 25 уровня готов в Предел Страха. Максимальный агр.',
    'Разбойник 12 уровня ищет подземелье Мистмур. Могу вскрывать замки.',
  ],
};
