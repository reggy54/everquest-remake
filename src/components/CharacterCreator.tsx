import React, { useState } from 'react';
import { CharacterClass, CharacterRace, CombatStats, PlayerCharacter, SlotType, Item } from '../types';
import {
  CLASS_DESCRIPTIONS,
  RACE_BONUSES,
  SYSTEM_DEITIES,
  INITIAL_BASE_STATS,
  STARTING_GEAR,
} from '../data/gameData';
import { Shield, Sparkles, Wand2, RefreshCw } from 'lucide-react';

interface CharacterCreatorProps {
  onCreated: (character: PlayerCharacter) => void;
  language?: 'ru' | 'en';
}

const RU_CLASSES: Record<CharacterClass, string> = {
  Warrior: 'Воин',
  Cleric: 'Клирик',
  Paladin: 'Паладин',
  'Shadow Knight': 'Рыцарь Тьмы',
  Ranger: 'Следопыт',
  Druid: 'Друид',
  Monk: 'Монах',
  Bard: 'Бард',
  Rogue: 'Разбойник',
  Shaman: 'Шаман',
  Necromancer: 'Некромант',
  Wizard: 'Чародей',
  Magician: 'Маг',
  Enchanter: 'Иллюзионист',
};

const RU_RACES: Record<CharacterRace, string> = {
  Human: 'Человек',
  Barbarian: 'Варвар',
  Erudite: 'Эрудит',
  'Wood Elf': 'Лесной Эльф',
  'High Elf': 'Высший Эльф',
  'Dark Elf': 'Темный Эльф',
  Dwarf: 'Дворф',
  Halfling: 'Полурослик',
  Gnome: 'Гном',
  Ogre: 'Огр',
  Troll: 'Тролль',
  Iksar: 'Иксар',
};

const RU_STATS: Record<keyof CombatStats, string> = {
  str: 'СИЛ (Сила)',
  sta: 'ВЫН (Выносливость)',
  agi: 'ЛОВ (Ловкость)',
  dex: 'СНД (Сноровка)',
  int: 'ИНТ (Интеллект)',
  wis: 'МУД (Мудрость)',
  cha: 'ХАР (Харизма)',
};

const RU_CLASS_DESC: Record<CharacterClass, string> = {
  Warrior: 'Мастер ближнего боя. Огромный запас здоровья и тяжелая броня. Защищает союзников, провоцируя врагов.',
  Cleric: 'Величайший целитель в Norrath. Владеет мощными исцеляющими заклинаниями и божественными щитами.',
  Paladin: 'Священный воин. Сочетает мощные атаки ближнего боя со святым исцелением и изгнанием нежити.',
  'Shadow Knight': 'Темный рыцарь. Сочетает латную броню с болезнями, вампиризмом и заклинаниями страха.',
  Ranger: 'Хранитель дикой природы и стрелок. Наносит стремительный урон из лука или в ближнем бою.',
  Druid: 'Единение с природой. Использует магию стихий, исцеление и мгновенные телепорты.',
  Monk: 'Мастер рукопашного боя. Сочетает мощные серии ударов, медитацию, самоисцеление и притворную смерть.',
  Bard: 'Менестрель. Исполняет песни, непрерывно усиливающие регенерацию маны, скорость и урон группы.',
  Rogue: 'Неуловимый убийца. Наносит сокрушительные удары в спину из режима скрытности.',
  Shaman: 'Племенной знахарь. Накладывает сильнейшие баффы на параметры, ослабляет врагов и варит зелья.',
  Necromancer: 'Повелитель смерти. Призывает скелетов-прислужников, вытягивает жизнь и преобразует здоровье в ману.',
  Wizard: 'Чистый разрушитель. Уничтожает противников колоссальными заклинаниями огня, льда и молнии.',
  Magician: 'Призыватель стихий. Призывает пылающих элементалей и создает магическую экипировку.',
  Enchanter: 'Мастер контроля разума. Обеспечивает колоссальный прилив маны группе и парализует врагов.',
};

const RU_RACE_DESC: Record<CharacterRace, string> = {
  Human: 'Универсален и ловок, приветствуется в любой гильдии.',
  Barbarian: 'Могучие серверные гиганты из Вечных Льдов. Мощные физические атаки.',
  Erudite: 'Великие ученые тайных искусств. Непревзойденный интеллект.',
  'Wood Elf': 'Ловкие лесные жители. Обладают отличным зрением и высокой скоростью.',
  'High Elf': 'Благословлены Тунаре. Грациозные, одухотворенные и мудрые.',
  'Dark Elf': 'Жители темного Нериака. Владеют ночным зрением, скрытны и коварны.',
  Dwarf: 'Крепкие латные воины. Отличное сопротивление магии и ядам.',
  Halfling: 'Любознательные и скрытные первооткрыватели. Бонус к скрытности.',
  Gnome: 'Изобретательные инженеры и знатоки техно-магии.',
  Ogre: 'Прочные каменные гиганты. Иммунитет к оглушению спереди, колоссальная мощь.',
  Troll: 'Жители болот. Обладают невероятно быстрой естественной регенерацией здоровья.',
  Iksar: 'Рептилии Кунарка. Чешуйчатая кожа дает высокий показатель брони.',
};

export default function CharacterCreator({ onCreated, language = 'ru' }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<CharacterRace>('Human');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Warrior');
  const [selectedDeity, setSelectedDeity] = useState<string>(SYSTEM_DEITIES[0]);

  // Points distribution
  const [availablePoints, setAvailablePoints] = useState(20);
  const [bonusStats, setBonusStats] = useState<Record<keyof CombatStats, number>>({
    str: 0,
    sta: 0,
    agi: 0,
    dex: 0,
    int: 0,
    wis: 0,
    cha: 0,
  });

  const getBaseStat = (stat: keyof CombatStats) => {
    const classBase = INITIAL_BASE_STATS[selectedClass]?.[stat] || 50;
    const raceBonus = (RACE_BONUSES[selectedRace]?.stats as any)?.[stat] || 0;
    return classBase + raceBonus;
  };

  const getFinalStat = (stat: keyof CombatStats) => {
    return getBaseStat(stat) + bonusStats[stat];
  };

  const adjustStat = (stat: keyof CombatStats, amount: number) => {
    if (amount > 0 && availablePoints > 0) {
      setBonusStats((prev) => ({ ...prev, [stat]: prev[stat] + 1 }));
      setAvailablePoints((prev) => prev - 1);
    } else if (amount < 0 && bonusStats[stat] > 0) {
      setBonusStats((prev) => ({ ...prev, [stat]: prev[stat] - 1 }));
      setAvailablePoints((prev) => prev + 1);
    }
  };

  const autoDistributeStats = () => {
    let points = availablePoints + Object.values(bonusStats).reduce((a: number, b: number) => a + b, 0);
    const newStats: Record<keyof CombatStats, number> = { str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 };
    
    let primaryStats: (keyof CombatStats)[] = [];
    switch (selectedClass) {
      case 'Warrior': case 'Monk': case 'Rogue': primaryStats = ['str', 'sta', 'dex', 'agi']; break;
      case 'Cleric': case 'Paladin': case 'Druid': case 'Shaman': primaryStats = ['wis', 'sta']; break;
      case 'Wizard': case 'Magician': case 'Enchanter': case 'Necromancer': primaryStats = ['int', 'sta']; break;
      case 'Shadow Knight': primaryStats = ['int', 'str', 'sta']; break;
      case 'Ranger': case 'Bard': primaryStats = ['dex', 'str', 'sta', 'cha']; break;
      default: primaryStats = ['sta'];
    }

    let i = 0;
    while (points > 0) {
      const stat = primaryStats[i % primaryStats.length];
      newStats[stat] += 1;
      points -= 1;
      i += 1;
    }
    
    setBonusStats(newStats);
    setAvailablePoints(0);
  };

  const generateRandomName = () => {
    const prefixes = ['Грим', 'Альд', 'Мель', 'Тар', 'Силь', 'Эльд', 'Кор', 'Фип', 'Дар', 'Валь', 'Брель', 'Ксор'];
    const suffixes = ['дор', 'винд', 'блейд', 'бейн', 'виспер', 'смашер', 'глен', 'мук', 'фордж', 'файр'];
    const randomName = prefixes[Math.floor(Math.random() * prefixes.length)] +
                       suffixes[Math.floor(Math.random() * suffixes.length)] +
                       Math.floor(Math.random() * 99);
    setName(randomName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate final stats
    const finalStats: CombatStats = {
      str: getFinalStat('str'),
      sta: getFinalStat('sta'),
      agi: getFinalStat('agi'),
      dex: getFinalStat('dex'),
      int: getFinalStat('int'),
      wis: getFinalStat('wis'),
      cha: getFinalStat('cha'),
    };

    // Calculate level health and mana
    const multiplier = selectedClass === 'Warrior' ? 12 : selectedClass === 'Cleric' ? 8 : 6;
    const baseHp = 100 + finalStats.sta * multiplier;
    const baseMana = (selectedClass === 'Wizard' || selectedClass === 'Cleric' || selectedClass === 'Enchanter')
      ? 80 + finalStats.int * 5
      : 30;

    // Setup equipment
    const templateGear = STARTING_GEAR[selectedClass] || {};
    const equipment: Record<SlotType, Item | null> = {
      head: null,
      chest: (templateGear.chest as Item) || null,
      arms: null,
      legs: null,
      hands: (templateGear.hands as Item) || null,
      feet: null,
      primary: (templateGear.primary as Item) || null,
      secondary: null,
    };

    const starterQuests = [
      {
        id: 'starter-quest-1',
        title: 'Боевое Крещение',
        giver: 'Наставник Кайл',
        description: `Добро пожаловать в Этернию, рекрут. Гильдия ищет достойных кандидатов. Отправляйся на Стартовый Континент Авалон и одолей Вожака стаи равнин, чтобы доказать свою преданность.`,
        objective: 'Уничтожить 1 Вожака стаи равнин на Авалоне.',
        rewardExp: 150,
        rewardGold: 5,
        status: 'active' as const,
        progressCurrent: 0,
        progressRequired: 1,
      },
    ];

    const character: PlayerCharacter = {
      name: name.trim(),
      race: selectedRace,
      class: selectedClass,
      deity: selectedDeity,
      level: 1,
      exp: 0,
      expToNextLevel: 1000,
      hp: baseHp,
      maxHp: baseHp,
      mana: baseMana,
      maxMana: baseMana,
      gold: 45, // Starting gold
      stats: finalStats,
      equipment,
      inventory: [
        {
          id: 'apple',
          name: 'Яблоко Сладкого Луга',
          slot: 'none',
          description: 'Хрустящее сочное яблоко, которое восстанавливает 15 ХП вне боя.',
          price: 1,
          rarity: 'common',
          stats: {},
        },
        {
          id: 'bandage',
          name: 'Походная Перевязка',
          slot: 'none',
          description: 'Льняной бинт, подходящий для лечения неглубоких ран.',
          price: 2,
          rarity: 'common',
          stats: {},
        },
      ],
      quests: starterQuests,
      unlockedSpells: [],
    };

    onCreated(character);
  };

  return (
    <div className="w-full relative z-0 flex items-center justify-center">
      {/* Background Image Effect */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-30 pointer-events-none mix-blend-overlay -z-10"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop')` }}
      ></div>
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/60 to-slate-1000 pointer-events-none -z-10"></div>

      <div className="relative z-10 w-full max-w-4xl mx-auto rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden p-6 md:p-8 animate-fade-in text-gray-100 my-8">
        <div className="text-center mb-8">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-amber-500" />
          {language === 'ru' ? 'Открытый Мир • Создание Героя' : 'Open World • Character Creation'}
        </h2>
        <p className="text-slate-400 mt-2 text-sm max-w-lg mx-auto">
          {language === 'ru' ? 'Сотворите легенду. Выберите происхождение, покровительство богов и распределите свои начальные характеристики.' : 'Forge a legend. Choose your origin, patron deity, and distribute your starting attributes.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Select */}
        <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 font-bold whitespace-nowrap">
              {language === 'ru' ? 'Имя вашего персонажа:' : 'Character Name:'}
            </label>
            <input
              type="text"
              required
              placeholder="Пример: Grimgor_Bronze"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, ''))}
              maxLength={16}
              className="w-full bg-slate-950 border border-slate-600 rounded px-4 py-2.5 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={generateRandomName}
            className="w-full md:w-auto mt-6 bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2.5 rounded border border-slate-500 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Случайное Имя
          </button>
        </div>

        {/* 2-Column Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Race and Deity */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 font-bold">
                {language === 'ru' ? 'Выберите Расу:' : 'Select Race:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(RACE_BONUSES).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRace(r as CharacterRace);
                      setBonusStats({ str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 });
                      setAvailablePoints(20);
                    }}
                    className={`text-xs py-2 rounded font-medium border transition-all ${
                      selectedRace === r
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-955 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {language === 'ru' ? (RU_RACES[r as CharacterRace] || r) : r}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs bg-slate-950 p-2.5 rounded text-amber-300 italic border border-slate-800 leading-relaxed">
                {language === 'ru' ? RU_RACE_DESC[selectedRace] : RACE_BONUSES[selectedRace].description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 font-bold">
                {language === 'ru' ? 'Покровитель / Мировоззрение:' : 'Patron / Alignment:'}
              </label>
              <select
                value={selectedDeity}
                onChange={(e) => setSelectedDeity(e.target.value)}
                className="w-full bg-slate-955 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {SYSTEM_DEITIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Class Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 font-bold">
                {language === 'ru' ? 'Выберите Класс:' : 'Select Class:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(CLASS_DESCRIPTIONS).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedClass(c as CharacterClass);
                      setBonusStats({ str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 });
                      setAvailablePoints(20);
                    }}
                    className={`text-xs py-2 rounded font-medium border transition-all ${
                      selectedClass === c
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-955 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {language === 'ru' ? (RU_CLASSES[c as CharacterClass] || c) : c}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs bg-slate-950 p-2.5 rounded text-amber-300 italic border border-slate-800 leading-relaxed">
                {language === 'ru' ? RU_CLASS_DESC[selectedClass] : CLASS_DESCRIPTIONS[selectedClass]}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Allocations */}
        <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
                {language === 'ru' ? 'Распределение Характеристик' : 'Attribute Distribution'}
              </h3>
              <p className="text-xs text-slate-500">{language === 'ru' ? 'Потратьте стартовые очки для кастомизации атрибутов' : 'Spend starting points to customize your character\'s attributes'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={autoDistributeStats}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1 rounded text-[10px] uppercase font-mono tracking-wider transition-colors font-bold cursor-pointer"
              >
                {language === 'ru' ? 'Авто (По Классу)' : 'Auto (By Class)'}
              </button>
              <div className="bg-amber-950 text-amber-300 border border-amber-800/60 rounded px-3 py-1 text-sm font-bold font-mono">
                {language === 'ru' ? 'Свободные Очки' : 'Points'}: {availablePoints}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(['str', 'sta', 'agi', 'dex', 'int', 'wis', 'cha'] as (keyof CombatStats)[]).map((stat) => (
              <div key={stat} className="bg-slate-900 border border-slate-800 rounded p-3 text-center">
                <span className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">
                  {RU_STATS[stat]}
                </span>
                <div className="text-xl font-extrabold text-white mt-1 mb-2">
                  {getFinalStat(stat)}{' '}
                  {bonusStats[stat] > 0 && (
                    <span className="text-xs text-green-400 font-bold ml-1">+{bonusStats[stat]}</span>
                  )}
                </div>
                <div className="flex justify-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={bonusStats[stat] === 0}
                    onClick={() => adjustStat(stat, -1)}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-red-400 font-bold border border-slate-700 disabled:opacity-30 disabled:pointer-events-none text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    disabled={availablePoints === 0}
                    onClick={() => adjustStat(stat, 1)}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-green-400 font-bold border border-slate-700 disabled:opacity-30 disabled:pointer-events-none text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finalize Button */}
        <div className="pt-4 flex justify-end">
            <button
            type="submit"
            disabled={!name.trim()}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded text-base uppercase tracking-wider shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {language === 'ru' ? 'Создать Героя и Войти в Мир' : 'Create Hero and Enter World'}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
