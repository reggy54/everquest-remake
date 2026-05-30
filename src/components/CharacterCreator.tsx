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
import Character2DModel from './Character2DModel';

interface CharacterCreatorProps {
  onCreated: (character: PlayerCharacter) => void;
  language?: 'ru' | 'en';
}

const RU_CLASSES: Record<CharacterClass, string> = {
  Warrior: 'Воин',
  Mage: 'Маг',
  Ranger: 'Рейнджер',
  Priest: 'Жрец',
  Rogue: 'Разбойник',
  Summoner: 'Призыватель',
  Paladin: 'Паладин',
  Shaman: 'Шаман',
};

const RU_RACES: Record<CharacterRace, string> = {
  Human: 'Люди (Элиссийцы)',
  'High Elf': 'Высшие Эльфы',
  Orc: 'Орки (Кровавые Клыки)',
  Dwarf: 'Дварфы',
  Dragonborn: 'Драконорождённые',
  'Moon Spirit': 'Лунные Духи',
  'Dark Elf': 'Тёмные Эльфы',
  'Mechanical Construct': 'Механические Конструкты',
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
  Warrior: 'Берсерк / Рыцарь / Страж. Огромный запас здоровья и тяжелая броня.',
  Mage: 'Элементалист / Аркан / Некромант. Разрушительная стихийная и тайная магия.',
  Ranger: 'Охотник / Стрелок / Природный Страж. Мастер дистанционного боя и ловушек.',
  Priest: 'Светоносец / Теневой Целитель / Балансёр. Связной богов, исцеляет или карает.',
  Rogue: 'Убийца / Теневой Танцор / Механик. Быстрый, незаметный, смертоносный.',
  Summoner: 'Духовод / Повелитель Демонов / Техно-призыватель. Ведет в бой призванных существ.',
  Paladin: 'Каратель / Защитник / Крестоносец. Воин света, защищающий союзников.',
  Shaman: 'Стихийный / Духовный / Кровавый. Использует силы природы и духов для баффов и исцеления.',
};

const RU_RACE_DESC: Record<CharacterRace, string> = {
  Human: 'Универсальные. +10% опыт от квестов. Бонус ко всем атрибутам.',
  'High Elf': 'Магические. Увеличенная регенерация маны.',
  Orc: 'Воинственные. Ярость в бою (временный буст).',
  Dwarf: 'Танковые / Крафт. Сопротивление урону + бонус к крафту.',
  Dragonborn: 'Гибридные. Огненное дыхание (активное умение).',
  'Moon Spirit': 'Поддержка / Мобильные. Фазовый сдвиг (уклонение).',
  'Dark Elf': 'Теневая магия. Бонус к урону в темноте.',
  'Mechanical Construct': 'Техно-магические. Самовосстановление + устойчивость к магии.',
};

export default function CharacterCreator({ onCreated, language = 'ru' }: CharacterCreatorProps) {
  const [name, setName] = useState(() => {
    if (typeof window !== 'undefined') {
      const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser) {
        const suggested = tgUser.username || tgUser.first_name || '';
        // Sanitize name to include only letters, numbers, and underscores
        return suggested.replace(/[^a-zA-Z0-9А-Яа-я_]/g, '');
      }
    }
    return '';
  });
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
      case 'Warrior': case 'Rogue': primaryStats = ['str', 'sta', 'dex', 'agi']; break;
      case 'Priest': case 'Paladin': case 'Shaman': primaryStats = ['wis', 'sta', 'str']; break;
      case 'Mage': case 'Summoner': primaryStats = ['int', 'sta']; break;
      case 'Ranger': primaryStats = ['dex', 'str', 'sta', 'agi']; break;
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
    const multiplier = (selectedClass === 'Warrior' || selectedClass === 'Paladin') ? 12 : selectedClass === 'Priest' ? 8 : 6;
    const baseHp = 100 + finalStats.sta * multiplier;
    const baseMana = (selectedClass === 'Mage' || selectedClass === 'Priest' || selectedClass === 'Summoner' || selectedClass === 'Shaman')
      ? 80 + finalStats.int * 5
      : 30;

    // Setup equipment
    const templateGear = STARTING_GEAR[selectedClass] || {};
    const equipment: Record<SlotType, Item | null> = {
      head: null,
      shoulders: null,
      chest: (templateGear.chest as Item) || null,
      hands: (templateGear.hands as Item) || null,
      waist: null,
      legs: null,
      feet: null,
      cloak: null,
      amulet: null,
      ring1: null,
      ring2: null,
      primary: (templateGear.primary as Item) || null,
      secondary: null,
      fateFocus: null,
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
      legacy: {
        createdAt: Date.now(),
        titles: ['Новичок Этерии'],
        achievements: [],
        legacyPoints: 0,
      },
    };

    onCreated(character);
  };

  return (
    <div className="w-full relative z-0 flex items-center justify-start min-h-screen">
      {/* Background Cinematic Scene */}
      <div className="fixed inset-0 -z-10 bg-slate-950">
         <Character2DModel charClass={selectedClass} race={selectedRace} equipment={{}} />
      </div>

      <div className="fixed inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/60 to-transparent pointer-events-none -z-10"></div>
      <div className="fixed inset-0 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none -z-10 h-[30vh] bottom-0 top-auto"></div>

      {/* Floating Configuration Form */}
      <div className="relative z-10 w-full max-w-[550px] ml-0 lg:ml-8 flex flex-col h-screen overflow-y-auto custom-scrollbar pointer-events-auto">
        <div className="rounded-r-2xl lg:rounded-3xl bg-slate-900/60 backdrop-blur-2xl border-r lg:border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-8 my-4 lg:my-6 animate-fade-in text-gray-100 min-h-fit relative overflow-hidden ring-1 ring-black/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="text-left mb-8 relative z-10">
            <h2 className="font-sans text-3xl font-black tracking-tight text-white flex items-center justify-start gap-3 drop-shadow-sm">
              <Sparkles className="h-7 w-7 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              {language === 'ru' ? 'Создание Героя' : 'Character Creation'}
            </h2>
            <p className="text-slate-400 mt-2 text-xs max-w-lg font-medium leading-relaxed">
              {language === 'ru' ? 'Сотворите легенду. Выберите происхождение.' : 'Forge a legend. Choose your origin.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Name Select */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/50 flex flex-col items-start gap-3 shadow-inner hover:border-slate-600 transition-colors">
              <div className="w-full">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-2 font-bold whitespace-nowrap drop-shadow-sm">
                  {language === 'ru' ? 'Имя персонажа' : 'Character Name'}
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Пример: Grimgor_Bronze"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, ''))}
                    maxLength={16}
                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={generateRandomName}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium px-4 rounded-xl border border-slate-700 hover:border-amber-500/50 flex items-center justify-center transition-all shadow-sm"
                    title="Случайное Имя"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 1-Column Selectors for floating UI */}
            <div className="space-y-5">
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-700/50">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-3 font-bold drop-shadow-sm">
                  {language === 'ru' ? 'Раса:' : 'Race:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(RACE_BONUSES).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSelectedRace(r as CharacterRace);
                        setBonusStats({ str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 });
                        setAvailablePoints(20);
                      }}
                      className={`text-[11px] py-2 px-3 rounded-lg font-bold border transition-all truncate text-left shadow-sm ${
                        selectedRace === r
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]'
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      {language === 'ru' ? (RU_RACES[r as CharacterRace] || r) : r}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-3">
                  {language === 'ru' ? RU_RACE_DESC[selectedRace] : RACE_BONUSES[selectedRace].description}
                </p>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-700/50">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-3 font-bold drop-shadow-sm">
                  {language === 'ru' ? 'Класс:' : 'Class:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(CLASS_DESCRIPTIONS).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setSelectedClass(c as CharacterClass);
                        setBonusStats({ str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 });
                        setAvailablePoints(20);
                      }}
                      className={`text-[11px] py-2 px-3 rounded-lg font-bold border transition-all truncate text-left shadow-sm ${
                        selectedClass === c
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]'
                          : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      {language === 'ru' ? (RU_CLASSES[c as CharacterClass] || c) : c}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-3">
                  {language === 'ru' ? RU_CLASS_DESC[selectedClass] : CLASS_DESCRIPTIONS[selectedClass]}
                </p>
              </div>
              
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-700/50">
                <label className="block text-[10px] font-mono uppercase tracking-widest text-amber-500 mb-2 font-bold drop-shadow-sm">
                  {language === 'ru' ? 'Мировоззрение:' : 'Alignment:'}
                </label>
                <select
                  value={selectedDeity}
                  onChange={(e) => setSelectedDeity(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 text-xs font-bold focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                >
                  {SYSTEM_DEITIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Allocations */}
            <div className="bg-slate-950/40 rounded-2xl p-5 border border-slate-700/50 shadow-inner">
              <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-200 font-mono drop-shadow-sm">
                  {language === 'ru' ? 'Характеристики' : 'Attributes'}
                </h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={autoDistributeStats}
                    className="text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500 px-3 py-1 rounded-lg text-[9px] uppercase font-mono font-bold tracking-widest transition-all cursor-pointer shadow-sm"
                  >
                    Auto
                  </button>
                  <div className="text-amber-300 text-[11px] font-black font-mono bg-amber-950/50 px-2 py-1 rounded border border-amber-900/50">
                    Pts: {availablePoints}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                {(['str', 'sta', 'agi', 'dex', 'int', 'wis', 'cha'] as (keyof CombatStats)[]).map((stat) => (
                  <div key={stat} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-2 text-center flex flex-col items-center shadow-sm">
                    <span className="block text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold mb-1">
                      {RU_STATS[stat].split(' ')[0]}
                    </span>
                    <div className="text-base font-black text-white my-0.5 flex gap-1 items-baseline">
                      {getFinalStat(stat)}
                      {bonusStats[stat] > 0 && (
                        <span className="text-[10px] text-green-400 font-bold drop-shadow-sm">+{bonusStats[stat]}</span>
                      )}
                    </div>
                    <div className="flex justify-center gap-1.5 w-full mt-2">
                      <button
                        type="button"
                        disabled={bonusStats[stat] === 0}
                        onClick={() => adjustStat(stat, -1)}
                        className="flex-1 max-w-[24px] h-5 rounded-md bg-slate-800 text-red-400 font-bold disabled:opacity-30 flex items-center justify-center text-xs hover:bg-slate-700 transition-colors"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        disabled={availablePoints === 0}
                        onClick={() => adjustStat(stat, 1)}
                        className="flex-1 max-w-[24px] h-5 rounded-md bg-slate-800 text-green-400 font-bold disabled:opacity-30 flex items-center justify-center text-xs hover:bg-slate-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

        {/* Deep Customization UI Elements (UE5 Character Creation Placeholder) */}
        <div className="bg-slate-950/40 rounded-2xl p-5 border border-slate-700/50 shadow-inner">
           <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-200 font-mono drop-shadow-sm">
                {language === 'ru' ? 'Скульптинг' : 'Sculpting'}
              </h3>
              <div className="text-emerald-400 font-mono text-[9px] px-2 py-1 border border-emerald-900/50 rounded flex items-center gap-1 bg-emerald-950/30">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                 GEN-4 EDIT
              </div>
           </div>
           
           <div className="space-y-4">
                 <div>
                    <label className="flex justify-between text-[9px] text-slate-400 mb-2 font-mono uppercase tracking-widest font-bold">
                       <span>{language === 'ru' ? 'Челюсть (Ширина)' : 'Jaw (Width)'}</span>
                    </label>
                    <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 shadow-inner" defaultValue="45" />
                 </div>
                 <div>
                    <label className="flex justify-between text-[9px] text-slate-400 mb-2 font-mono uppercase tracking-widest font-bold">
                       <span>{language === 'ru' ? 'Скулы (Высота)' : 'Cheekbones'}</span>
                    </label>
                    <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 shadow-inner" defaultValue="72" />
                 </div>
                 <div>
                    <label className="flex justify-between text-[9px] text-slate-400 mb-2 font-mono uppercase tracking-widest font-bold">
                       <span>{language === 'ru' ? 'Глаза (Посадка)' : 'Eyes (Depth)'}</span>
                    </label>
                    <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 shadow-inner" defaultValue="30" />
                 </div>
                 <div className="pt-2">
                    <label className="flex justify-between text-[9px] text-slate-400 mb-2 font-mono uppercase tracking-widest font-bold">
                       <span>{language === 'ru' ? 'Детализация кожи (PBR)' : 'Skin Details'}</span>
                    </label>
                    <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 shadow-inner" defaultValue="90" />
                 </div>
           </div>
        </div>

        {/* Finalize Button */}
        <div className="pt-4 pb-8">
            <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black px-4 py-4 rounded-xl text-base uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {language === 'ru' ? 'Оживить Героя' : 'Awaken Hero'}
          </button>
        </div>
      </form>
        </div>
      </div>
    </div>
  );
}
