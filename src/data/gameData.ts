import { CharacterClass, CharacterRace, CombatStats, Zone, Item, Spell } from '../types';

export const CLASS_DESCRIPTIONS: Record<CharacterClass, string> = {
  Warrior: 'Мастер ближнего боя. Может стать Берсерком, Рыцарем или Стражем.',
  Mage: 'Повелитель стихий и тайной магии. Может стать Элементалистом, Арканом или Некромантом.',
  Ranger: 'Хранитель дикой природы и стрелок. Может стать Охотником, Стрелком или Природным Стражем.',
  Priest: 'Связной богов. Владеет мощными исцеляющими заклинаниями. Спеки: Светоносец, Теневой Целитель, Балансёр.',
  Rogue: 'Неуловимый боец. Наносит сокрушительные удары в спину. Спеки: Убийца, Теневой Танцор, Механик.',
  Summoner: 'Призывает существ на свою сторону. Спеки: Духовод, Повелитель Демонов, Техно-призыватель.',
  Paladin: 'Священный воин со специализациями Каратель, Защитник, Крестоносец.',
  Shaman: 'Знахарь и повелитель духов. Спеки: Стихийный, Духовный, Кровавый.',
};

export const RACE_BONUSES: Record<CharacterRace, { stats: Partial<CombatStats>; description: string }> = {
  Human: { stats: { str: 5, sta: 5, agi: 5, dex: 5, int: 5, wis: 5, cha: 5 }, description: 'Универсальные. +10% опыт от квестов. Бонус ко всем атрибутам.' },
  'High Elf': { stats: { int: 15, dex: 10 }, description: 'Магические. Увеличенная регенерация маны.' },
  Orc: { stats: { str: 15, sta: 10 }, description: 'Воинственные. Ярость в бою (временный буст).' },
  Dwarf: { stats: { sta: 20 }, description: 'Танковые / Крафт. Сопротивление урону + бонус к крафту.' },
  Dragonborn: { stats: { str: 15, int: 15 }, description: 'Гибридные. Огненное дыхание (активное умение).' },
  'Moon Spirit': { stats: { dex: 15, int: 15 }, description: 'Поддержка / Мобильные. Фазовый сдвиг (уклонение).' },
  'Dark Elf': { stats: { int: 20 }, description: 'Теневая магия. Бонус к урону в темноте.' },
  'Mechanical Construct': { stats: { sta: 25 }, description: 'Техно-магические. Самовосстановление + устойчивость к магии.' },
};

export const SYSTEM_DEITIES = [
  'Свет (Митраниэль)',
  'Тьма (Инноруук)',
  'Баланс (Тунаре)',
  'Древние (Забытые боги)',
  'Атеист',
];

export const INITIAL_BASE_STATS: Record<CharacterClass, CombatStats> = {
  Warrior: { str: 85, sta: 90, agi: 80, dex: 80, int: 50, wis: 50, cha: 60 },
  Mage: { str: 60, sta: 70, agi: 75, dex: 75, int: 90, wis: 60, cha: 60 },
  Ranger: { str: 75, sta: 75, agi: 85, dex: 80, int: 55, wis: 65, cha: 65 },
  Priest: { str: 60, sta: 75, agi: 70, dex: 70, int: 70, wis: 85, cha: 70 },
  Rogue: { str: 75, sta: 70, agi: 85, dex: 90, int: 50, wis: 50, cha: 60 },
  Summoner: { str: 60, sta: 70, agi: 70, dex: 75, int: 85, wis: 70, cha: 70 },
  Paladin: { str: 80, sta: 85, agi: 75, dex: 75, int: 50, wis: 70, cha: 75 },
  Shaman: { str: 70, sta: 80, agi: 70, dex: 70, int: 60, wis: 80, cha: 65 },
};

export const GAME_ZONES: Zone[] = [
  {
    id: 'starter-hills',
    name: 'Серебряные Луга Элиссии',
    description: 'Огромная, но уютная зона. Яркие зелёные луга, древние каменные круги, светящиеся бабочки, небольшие ручьи с кристально чистой водой.',
    minLevel: 1,
    difficulty: 'Safe',
    imageUrl: 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Теневая Сущность', level: 3, hp: 45 },
      { name: 'Дикий Волк', level: 5, hp: 80 },
      { name: 'Малый Теневой Страж', level: 8, hp: 250, isBoss: true },
    ],
    connections: ['broken-stars-valley'],
    events: [
      { name: 'Вторжение Теней', type: 'cyclic', frequency: 'Каждые 40 мин', reward: 'Опыт, серебро', description: 'Из Разлома вылезают Теневые Сущности. Защитите светящиеся кристаллы!' },
    ],
    pointsOfInterest: ['Деревня Элиссия', 'Разбитый Храм', 'Древний Алтарь'],
  },
  {
    id: 'broken-stars-valley',
    name: 'Долина Разбитых Звёзд',
    description: 'Средние земли. Обширные поляные, где на землю обрушились осколки древних астральных тел. Место повышенной магической активности.',
    minLevel: 20,
    difficulty: 'Easy',
    imageUrl: 'https://images.unsplash.com/photo-1515281239448-2afe2491a134?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Звёздный Сталкер', level: 25, hp: 600 },
      { name: 'Искажённый Голем', level: 30, hp: 1200 },
      { name: 'Пробуждённый Метеорит', level: 35, hp: 4500, isBoss: true },
    ],
    connections: ['starter-hills', 'mountain-ridge'],
    events: [
      { name: 'Падение Осколка', type: 'cyclic', frequency: 'Каждые 90 мин', reward: 'Материалы, руда', description: 'С неба падает звездный осколок. Добудьте редкие ресурсы, пока их не захватили големы.' }
    ],
    pointsOfInterest: ['Кратер Забытых', 'Башня Астроманта'],
  },
  {
    id: 'mountain-ridge',
    name: 'Горный Хребет Вел’Дарион',
    description: 'Огромные заснеженные горы и глубокие ущелья. Вертикальность на максимуме: множество парящих платформ, ледяных мостов, пещер.',
    minLevel: 35,
    difficulty: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Ледяной Виверн', level: 40, hp: 3500 },
      { name: 'Горный Тролль', level: 45, hp: 5500 },
      { name: 'Ледяной Дракон Тиран', level: 50, hp: 15000, isBoss: true },
    ],
    connections: ['broken-stars-valley', 'whispering-jungles'],
    events: [
      { name: 'Нашествие Теней', type: 'cyclic', frequency: 'Каждые 2 часа', reward: 'Репутация фракций', description: 'Волны мобов пытаются прорваться через горный перевал.' },
      { name: 'Караван Хранителей', type: 'cyclic', frequency: 'Каждые 3 часа', reward: 'Редкие ресурсы', description: 'Защитите караван по узким горным тропам от ледяных виверн.' }
    ],
    pointsOfInterest: ['Ледяная Крепость', 'Долина Тысячи Водопадов', 'Древний Драконий Храм'],
  },
  {
    id: 'whispering-jungles',
    name: 'Шепчущие Джунгли Зара’Тул',
    description: 'Густые тропические леса с гигантскими деревьями и биолюминесценцией. Много наземного и воздушного уровня.',
    minLevel: 50,
    difficulty: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1518182170546-076616fdcb67?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Ядовитый Плеть', level: 55, hp: 6000 },
      { name: 'Страж Кроны', level: 60, hp: 8500 },
      { name: 'Мать Роя', level: 65, hp: 25000, isBoss: true },
    ],
    connections: ['mountain-ridge', 'burning-wastes'],
    events: [
      { name: 'Гнев Леса', type: 'dynamic', frequency: 'Случайно', reward: 'Редкие травы', description: 'Экологическое событие: Лес "разозлился" из-за слишком частой рубки деревьев.' }
    ],
    pointsOfInterest: ['Священное Древо', 'Руины Ядозубов'],
  },
  {
    id: 'burning-wastes',
    name: 'Пылающие Пустоши Аш’Кара',
    description: 'Красные пустыни, вулканы, лавовые реки. Очень враждебная среда.',
    minLevel: 65,
    difficulty: 'Hard',
    imageUrl: 'https://images.unsplash.com/photo-1590518335032-68dfdb14022c?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Пепельный Червь', level: 70, hp: 12000 },
      { name: 'Лавовый Голем', level: 75, hp: 18000 },
      { name: 'Владыка Пепла', level: 80, hp: 45000, isBoss: true },
    ],
    connections: ['whispering-jungles', 'central-rift'],
    events: [
      { name: 'Поющая Буря', type: 'cyclic', frequency: 'Каждые 4 часа', reward: 'Бонусы к опыту', description: 'Магическая буря меняет ландшафт на 15 мин.' }
    ],
    pointsOfInterest: ['Вулкан Слез', 'Лагерь Изгнанников'],
  },
  {
    id: 'central-rift',
    name: 'Центральный Разлом',
    description: 'Endgame зона. Динамическая, постоянно меняющаяся территория штормов маны и искажённой гравитацией.',
    minLevel: 80,
    difficulty: 'Hard',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Порождение Бездны', level: 80, hp: 15000 },
      { name: 'Магическая аномалия', level: 82, hp: 20000 },
      { name: 'Осколок Ужаса', level: 85, hp: 60000, isBoss: true },
    ],
    connections: ['burning-wastes', 'sky-archipelago'],
    events: [
      { name: 'Великий Разлом', type: 'world', frequency: 'Раз в 2 недели', reward: 'Эпическая экипировка', description: 'World Event: Центральный Разлом активируется на 2 часа.' }
    ],
  },
  {
    id: 'sky-archipelago',
    name: 'Небесный Архипелаг',
    description: 'Огромные летающие острова и вулканические массивы. Вертикальный биом, требующий планера для перемещения.',
    minLevel: 85,
    difficulty: 'Hard',
    imageUrl: 'https://images.unsplash.com/photo-1614210408544-7f1dfa832f05?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Астральный наблюдатель', level: 86, hp: 25000 },
      { name: 'Воздушный змей', level: 88, hp: 35000 },
      { name: 'Кочующий Небесный Кит', level: 90, hp: 100000, isBoss: true },
    ],
    connections: ['central-rift', 'abyss-underworld'],
    events: [
      { name: 'Падение Небес', type: 'world', frequency: 'Редко', reward: 'Новые зоны, Опыт', description: 'Крупное событие: падение нового острова.' }
    ],
  },
  {
    id: 'abyss-underworld',
    name: 'Бездна Под Миром',
    description: 'Мрачные глубины, где не светит солнце. Место обитания древних монстров.',
    minLevel: 90,
    difficulty: 'Raid',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Слепой Охотник', level: 92, hp: 45000 },
      { name: 'Темный Слуга', level: 94, hp: 60000 },
      { name: 'Пробуждённый Древний', level: 95, hp: 250000, isBoss: true },
    ],
    connections: ['sky-archipelago', 'broken-horizon'],
    events: [
      { name: 'Пробуждение Древнего', type: 'cyclic', frequency: '1 раз в 6 часов', reward: 'Эпическая экипировка', description: 'Мировой босс (требует 20–50 игроков).' }
    ],
  },
  {
    id: 'broken-horizon',
    name: 'Край Разорванного Горизонта',
    description: 'Край карты, где мир буквально обрывается в неизведанное.',
    minLevel: 95,
    difficulty: 'Raid',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop',
    monsters: [
      { name: 'Эхо Забытых Времен', level: 98, hp: 80000 },
      { name: 'Страж Границы', level: 99, hp: 150000 },
      { name: 'Древний Титан Этерии', level: 100, hp: 1000000, isBoss: true },
    ],
    connections: ['abyss-underworld'],
    events: [
      { name: 'Война Фракций', type: 'world', frequency: 'Раз в месяц', reward: 'Глобальные бонусы', description: 'Глобальное PvP-событие.' }
    ],
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
  Priest: {
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
  Mage: {
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
    { id: 'iron-helmet', name: 'Латный железный шлем', slot: 'head', description: 'Тяжелый боевой шлем, обеспечивающий превосходную защиту.', price: 45, rarity: 'uncommon', stats: { sta: 3, ac: 10 }, allowedClasses: ['Warrior', 'Paladin', 'Priest'] },
    { id: 'leather-boots', name: 'Эльфийские кожаные сапоги', slot: 'feet', description: 'Легкие сапоги, созданные эльфами для бесшумного бега.', price: 25, rarity: 'uncommon', stats: { agi: 4, ac: 4 }, allowedClasses: ['Ranger', 'Rogue', 'Shaman'] },
    { id: 'mana-ring', name: 'Сверкающее платиновое кольцо', slot: 'secondary', description: 'Сверкающий перстень, наделенный чистой эссенцией маны.', price: 75, rarity: 'rare', stats: { int: 5, wis: 5, mana: 30 }, allowedClasses: ['Mage', 'Summoner', 'Priest', 'Shaman'] },
    { id: 'rubicund-breastplate', name: 'Рубиновый нагрудник', slot: 'chest', description: 'Легендарный сияющий доспех защитников Этернии.', price: 250, rarity: 'epic', stats: { str: 10, sta: 12, ac: 25, hp: 80 }, allowedClasses: ['Warrior', 'Paladin', 'Priest'] },
    { id: 'ghoulbane', name: 'Клирик-Паладинский Бич Проклятых', slot: 'primary', description: 'Легендарный сияющий клинок праведного гнева, наносящий двойной урон нежити.', price: 400, rarity: 'epic', stats: { str: 14, wis: 8, ac: 10, hp: 50 }, allowedClasses: ['Paladin', 'Priest'] },
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
