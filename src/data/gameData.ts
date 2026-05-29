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
  materials: [
    { id: 'mat-iron', name: 'Железная руда', slot: 'material', description: 'Обычный кусок железа, годится на переплавку.', price: 2, rarity: 'common' },
    { id: 'mat-leather', name: 'Обрывки кожи', slot: 'material', description: 'Потрепанная шкура убитого зверя.', price: 2, rarity: 'common' },
    { id: 'mat-cloth', name: 'Льняная ткань', slot: 'material', description: 'Обычная ткань, выпадает с гуманоидов.', price: 2, rarity: 'common' },
    { id: 'mat-magic', name: 'Магическая пыль', slot: 'material', description: 'Остатки магии, витающие в воздухе.', price: 5, rarity: 'uncommon' },
    { id: 'mat-crystal', name: 'Астральный кристалл', slot: 'material', description: 'Кристалл, впитавший силу разлома.', price: 15, rarity: 'rare' },
    { id: 'mat-meat', name: 'Кусок мяса', slot: 'material', description: 'Свежее мясо зверя.', price: 1, rarity: 'common' },
    { id: 'mat-herb', name: 'Лечебная трава', slot: 'material', description: 'Ароматная дикая трава.', price: 1, rarity: 'common' },
    { id: 'mat-water', name: 'Фляга воды', slot: 'material', description: 'Чистая родниковая вода.', price: 1, rarity: 'common' },
  ] as Item[],

  forgeRecipes: [
    // Warrior / Paladin 
    {
      id: 'rec-w-1',
      category: 'weapons',
      result: { id: 'crafted-w-wpn-1', name: 'Закаленный двуручный меч', slot: 'primary', description: 'Свежевыкованный меч из отличного железа.', price: 80, rarity: 'uncommon', stats: { str: 8, ac: 2 }, allowedClasses: ['Warrior', 'Paladin'] },
      cost: { 'mat-iron': 5, 'mat-leather': 2 }
    },
    {
      id: 'rec-w-2',
      category: 'armor',
      result: { id: 'crafted-w-chest-1', name: 'Массивные латы', slot: 'chest', description: 'Толстая броня, отражающая большинство ударов.', price: 90, rarity: 'uncommon', stats: { str: 4, sta: 4, ac: 20 }, allowedClasses: ['Warrior', 'Paladin'] },
      cost: { 'mat-iron': 8, 'mat-magic': 1 }
    },

    // Rogue / Ranger
    {
      id: 'rec-r-1',
      category: 'weapons',
      result: { id: 'crafted-r-wpn-1', name: 'Резной длинный лук', slot: 'primary', description: 'Лук из упругого дерева, усиленный кожей.', price: 80, rarity: 'uncommon', stats: { agi: 6, dex: 6 }, allowedClasses: ['Ranger'] },
      cost: { 'mat-leather': 5, 'mat-iron': 1 }
    },
    {
      id: 'rec-r-2',
      category: 'armor',
      result: { id: 'crafted-r-chest-1', name: 'Укрепленная куртка', slot: 'chest', description: 'Кожаная куртка с металлическими вставками.', price: 90, rarity: 'uncommon', stats: { agi: 5, dex: 2, ac: 15 }, allowedClasses: ['Rogue', 'Ranger'] },
      cost: { 'mat-leather': 7, 'mat-iron': 2 }
    },

    // Mage / Summoner
    {
      id: 'rec-m-1',
      category: 'weapons',
      result: { id: 'crafted-m-wpn-1', name: 'Посох зачарованного дуба', slot: 'primary', description: 'Посох, светящийся изнутри.', price: 80, rarity: 'uncommon', stats: { int: 8, mana: 30 }, allowedClasses: ['Mage', 'Summoner'] },
      cost: { 'mat-cloth': 4, 'mat-magic': 3 }
    },
    {
      id: 'rec-m-2',
      category: 'armor',
      result: { id: 'crafted-m-chest-1', name: 'Роба ученого', slot: 'chest', description: 'Одеяние, повышающее концентрацию.', price: 90, rarity: 'uncommon', stats: { int: 6, mana: 20, ac: 8 }, allowedClasses: ['Mage', 'Summoner'] },
      cost: { 'mat-cloth': 8, 'mat-magic': 2 }
    },

    // Priest / Shaman
    {
      id: 'rec-p-1',
      category: 'weapons',
      result: { id: 'crafted-p-wpn-1', name: 'Молот очищения', slot: 'primary', description: 'Оружие, пропитанное святой магией.', price: 80, rarity: 'uncommon', stats: { wis: 8, str: 3 }, allowedClasses: ['Priest', 'Paladin', 'Shaman'] },
      cost: { 'mat-iron': 4, 'mat-magic': 3 }
    },
    {
      id: 'rec-p-2',
      category: 'armor',
      result: { id: 'crafted-p-chest-1', name: 'Облачение веры', slot: 'chest', description: 'Светлая ткань с защитными рунами.', price: 90, rarity: 'uncommon', stats: { wis: 6, hp: 15, ac: 10 }, allowedClasses: ['Priest', 'Shaman'] },
      cost: { 'mat-cloth': 6, 'mat-magic': 2, 'mat-leather': 1 }
    },
    
    // Consumables and Special
    {
      id: 'rec-c-1',
      category: 'special',
      result: { id: 'crafted-pot-1', name: 'Энергетическое зелье', slot: 'consumable', description: 'Созданное вручную зелье. Восстанавливает здоровье.', price: 10, rarity: 'common' },
      cost: { 'mat-magic': 1, 'mat-cloth': 1 }
    },
    
    // Kitchen / Food 
    {
      id: 'rec-k-1',
      category: 'kitchen',
      result: { id: 'crafted-food-1', name: 'Жареный кусок мяса', slot: 'consumable', description: 'Восстанавливает здоровье.', price: 5, rarity: 'common', stats: { hp: 20 } },
      cost: { 'mat-meat': 2 }
    },
    {
      id: 'rec-k-2',
      category: 'kitchen',
      result: { id: 'crafted-food-2', name: 'Сытный суп', slot: 'consumable', description: 'Питательный суп.', price: 10, rarity: 'uncommon', stats: { hp: 50, sta: 5 } },
      cost: { 'mat-meat': 3, 'mat-herb': 1, 'mat-water': 1 }
    },
    {
      id: 'rec-k-3',
      category: 'kitchen',
      result: { id: 'crafted-food-3', name: 'Отвар из диких трав', slot: 'consumable', description: 'Приятный отвар.', price: 5, rarity: 'common', stats: { mana: 20 } },
      cost: { 'mat-herb': 2, 'mat-water': 1 }
    },
    
    // Runes
    {
      id: 'rec-r-rune',
      category: 'sockets',
      result: { id: 'crafted-rune-1', name: 'Руна Младшей Силы', slot: 'rune', description: 'Небольшая руническая пылинка с магией.', price: 50, rarity: 'uncommon', stats: { str: 2 } },
      cost: { 'mat-crystal': 1, 'mat-magic': 2 }
    }
  ],

  merchantItems: [
    // Warrior / Paladin (Heavy Melee)
    { id: 'w-head-1', name: 'Ржавый латный шлем', slot: 'head', description: 'Старый, но надежный шлем.', price: 15, rarity: 'common', stats: { sta: 1, ac: 5 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-chest-1', name: 'Бронзовая кираса', slot: 'chest', description: 'Тяжелая и неуклюжая броня.', price: 30, rarity: 'common', stats: { str: 2, ac: 12 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-legs-1', name: 'Грубые поножи', slot: 'legs', description: 'Защищают лучше, чем ничего.', price: 20, rarity: 'common', stats: { sta: 2, ac: 7 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-hands-1', name: 'Стальные рукавицы', slot: 'hands', description: 'Тяжелые латные рукавицы.', price: 18, rarity: 'common', stats: { str: 1, ac: 4 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-feet-1', name: 'Поношенные сабатоны', slot: 'feet', description: 'Металлические ботинки пехотинца.', price: 22, rarity: 'common', stats: { sta: 1, ac: 5 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-waist-1', name: 'Металлический пояс', slot: 'waist', description: 'Широкий ремень на железной бляхе.', price: 15, rarity: 'common', stats: { sta: 2, ac: 2 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-wpn-1', name: 'Стальной двуручник', slot: 'primary', description: 'Тяжелый и острый меч.', price: 40, rarity: 'uncommon', stats: { str: 5, ac: 0 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-shield-1', name: 'Дубовый щит пехотинца', slot: 'secondary', description: 'От стрелы спасет.', price: 25, rarity: 'common', stats: { sta: 3, ac: 15 }, allowedClasses: ['Warrior', 'Paladin'] },
    { id: 'w-wpn-2', name: 'Искаженный Топор Разлома', slot: 'primary', description: 'Пульсирует темной энергией.', price: 120, rarity: 'rare', stats: { str: 8, sta: 4, hp: 15 }, allowedClasses: ['Warrior'] },

    // Rogue / Ranger (Medium, Agility)
    { id: 'r-head-1', name: 'Кожаный капюшон', slot: 'head', description: 'Скрывает лицо в тенях.', price: 15, rarity: 'common', stats: { agi: 2, ac: 3 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-chest-1', name: 'Куртка из толстой кожи', slot: 'chest', description: 'Не сковывает движений.', price: 30, rarity: 'common', stats: { agi: 3, ac: 8 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-legs-1', name: 'Штаны следопыта', slot: 'legs', description: 'Удобны для скрытного перемещения.', price: 20, rarity: 'common', stats: { agi: 2, dex: 1, ac: 5 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-hands-1', name: 'Перчатки вора', slot: 'hands', description: 'Идеальны для вскрытия замков.', price: 15, rarity: 'common', stats: { agi: 1, dex: 2, ac: 2 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-feet-1', name: 'Сапоги мягкого шага', slot: 'feet', description: 'Шагов совершенно не слышно.', price: 18, rarity: 'common', stats: { agi: 2, ac: 3 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-waist-1', name: 'Пояс выживания', slot: 'waist', description: 'Много кармашков для мелочей.', price: 12, rarity: 'common', stats: { sta: 1, dex: 1, ac: 2 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-wpn-1', name: 'Зазубренный кинжал', slot: 'primary', description: 'Отличное средство для удара в спину.', price: 35, rarity: 'uncommon', stats: { agi: 4, dex: 2 }, allowedClasses: ['Rogue'] },
    { id: 'r-wpn-2', name: 'Длинный охотничий лук', slot: 'primary', description: 'Тяжелый лук для метких выстрелов.', price: 35, rarity: 'uncommon', stats: { agi: 3, dex: 4 }, allowedClasses: ['Ranger'] },
    { id: 'r-sec-1', name: 'Короткий клинок', slot: 'secondary', description: 'Удобен для левой руки.', price: 25, rarity: 'uncommon', stats: { agi: 2, dex: 1 }, allowedClasses: ['Rogue', 'Ranger'] },
    { id: 'r-wpn-3', name: 'Лук Пронзающего Ветра', slot: 'primary', description: 'Стрелы летят быстрее звука.', price: 150, rarity: 'epic', stats: { agi: 9, dex: 6, ac: 2 }, allowedClasses: ['Ranger'] },

    // Mage / Summoner (Light, Intellect)
    { id: 'm-head-1', name: 'Бархатная шляпа', slot: 'head', description: 'Классическая остроконечная шляпа.', price: 15, rarity: 'common', stats: { int: 2, ac: 1 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-chest-1', name: 'Мантия ученика', slot: 'chest', description: 'Пахнет пыльными томами.', price: 30, rarity: 'common', stats: { int: 3, mana: 10, ac: 2 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-legs-1', name: 'Льняные брюки', slot: 'legs', description: 'Свободные и комфортные.', price: 15, rarity: 'common', stats: { int: 1, ac: 2 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-hands-1', name: 'Перчатки плетения', slot: 'hands', description: 'Тонкие нити магии.', price: 12, rarity: 'common', stats: { int: 1, mana: 5, ac: 1 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-feet-1', name: 'Туфли из мягкой ткани', slot: 'feet', description: 'Совсем легкие.', price: 12, rarity: 'common', stats: { int: 1, ac: 1 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-waist-1', name: 'Шелковый кушак', slot: 'waist', description: 'Завязывается на талии.', price: 10, rarity: 'common', stats: { int: 1, mana: 5 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-wpn-1', name: 'Посох мерцающего кристалла', slot: 'primary', description: 'Кристалл слабо пульсирует магией.', price: 40, rarity: 'uncommon', stats: { int: 5, wis: 2, mana: 25 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-sec-1', name: 'Фолиант искр', slot: 'secondary', description: 'Сборник простых заклинаний.', price: 20, rarity: 'uncommon', stats: { int: 2, mana: 15 }, allowedClasses: ['Mage', 'Summoner'] },
    { id: 'm-wpn-2', name: 'Жезл Бездны', slot: 'primary', description: 'Черный как ночь артефакт.', price: 130, rarity: 'rare', stats: { int: 8, sta: 3, mana: 50 }, allowedClasses: ['Mage', 'Summoner'] },
    
    // Priest / Shaman (Light/Medium, Wisdom)
    { id: 'p-head-1', name: 'Венец веры', slot: 'head', description: 'Легкий обруч, благословленный жрецами.', price: 20, rarity: 'uncommon', stats: { wis: 3, hp: 10, ac: 2 }, allowedClasses: ['Priest', 'Shaman'] },
    { id: 'p-chest-1', name: 'Одеяния смирения', slot: 'chest', description: 'Скромный наряд, скрывающий великую силу.', price: 35, rarity: 'common', stats: { wis: 4, mana: 15, ac: 4 }, allowedClasses: ['Priest', 'Shaman'] },
    { id: 'p-legs-1', name: 'Юбка заклинателя духов', slot: 'legs', description: 'Элементы традиционного наряда.', price: 20, rarity: 'common', stats: { wis: 2, ac: 3 }, allowedClasses: ['Priest', 'Shaman'] },
    { id: 'p-hands-1', name: 'Обмотки целителя', slot: 'hands', description: 'Ткань, пропитанная целебными мазями.', price: 15, rarity: 'common', stats: { wis: 2, hp: 5, ac: 1 }, allowedClasses: ['Priest', 'Shaman'] },
    { id: 'p-feet-1', name: 'Сандалии паломника', slot: 'feet', description: 'Стоптаны во время долгих странствий.', price: 15, rarity: 'common', stats: { sta: 1, wis: 1, ac: 2 }, allowedClasses: ['Priest', 'Shaman'] },
    { id: 'p-waist-1', name: 'Веревочный пояс', slot: 'waist', description: 'С узелками для молитв.', price: 10, rarity: 'common', stats: { wis: 1, hp: 5 }, allowedClasses: ['Priest', 'Shaman'] },
    { id: 'p-wpn-1', name: 'Разрушитель нежити', slot: 'primary', description: 'Дробящее оружие, заряженное светом.', price: 45, rarity: 'uncommon', stats: { str: 2, wis: 4 }, allowedClasses: ['Priest', 'Shaman', 'Paladin'] },
    { id: 'p-sec-1', name: 'Тотем предков', slot: 'secondary', description: 'Вырезанный из древнего дерева тотем.', price: 35, rarity: 'uncommon', stats: { wis: 3, sta: 2, mana: 10 }, allowedClasses: ['Shaman'] },
    { id: 'p-wpn-2', name: 'Посох Истинного Света', slot: 'primary', description: 'Излучает теплое золотистое свечение.', price: 140, rarity: 'epic', stats: { wis: 10, sta: 5, hp: 30, mana: 30 }, allowedClasses: ['Priest'] },

    // Accessories (All classes/Universal)
    { id: 'acc-neck-1', name: 'Амулет медведя', slot: 'amulet', description: 'Дарует силу дикого зверя.', price: 60, rarity: 'rare', stats: { str: 4, sta: 4, hp: 20 } },
    { id: 'acc-neck-2', name: 'Подвеска совиного глаза', slot: 'amulet', description: 'Расширяет магическое зрение.', price: 60, rarity: 'rare', stats: { int: 4, wis: 4, mana: 20 } },
    { id: 'acc-ring-1', name: 'Кольцо проворства', slot: 'ring1', description: 'Кажется, что ваши руки двигаются быстрее.', price: 50, rarity: 'uncommon', stats: { agi: 3, dex: 3 } },
    { id: 'acc-ring-2', name: 'Перстень стойкости', slot: 'ring2', description: 'Осколок метеорита в стальной оправе.', price: 50, rarity: 'uncommon', stats: { sta: 5, hp: 15 } },
    { id: 'acc-ring-3', name: 'Кольцо Жадности', slot: 'ring1', description: 'Слегка блестит.', price: 150, rarity: 'epic', stats: { cha: 10, str: 2, int: 2 } },
    { id: 'acc-cloak-1', name: 'Плащ странника', slot: 'cloak', description: 'Видавший виды плащ, защищающий от ветра.', price: 25, rarity: 'common', stats: { agi: 1, sta: 1, ac: 2 } },
    { id: 'acc-cloak-2', name: 'Мантия теней', slot: 'cloak', description: 'Размывает силуэт владельца.', price: 80, rarity: 'rare', stats: { agi: 4, ac: 4 } },
    { id: 'acc-cloak-3', name: 'Алый плащ героя', slot: 'cloak', description: 'Сверкает на солнце.', price: 120, rarity: 'epic', stats: { str: 3, int: 3, sta: 5, ac: 6 } },

    // Existing rare/epic
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
