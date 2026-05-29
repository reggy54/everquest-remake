import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Trophy, ShieldAlert, Swords, Users, Shield, Zap, Sparkles, Loader2, Flame, Crosshair, ShieldCheck, Flag, Search, Scale, Map, RefreshCw } from 'lucide-react';

interface PvPArenaProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

interface PVPEnemy {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  difficulty: 'Новичок' | 'Опытный' | 'Ветеран' | 'Грандмастер';
  spellName: string;
  winRatingReward: number;
}

interface ArenaMapDef {
  id: string;
  name: string;
  description: string;
  hazardLog: string;
  hazardType: 'damage' | 'miss' | 'heal_block' | 'both_damage' | 'buff';
}

const ARENA_MAPS: ArenaMapDef[] = [
  { id: 'blood_sands', name: 'Кровавые Пески', description: 'Огромная открытая арена с песчаными бурями.', hazardLog: '🌪️ Песчаная буря слепит всех! Меткость снижена.', hazardType: 'miss' },
  { id: 'shattered_bridge', name: 'Разрушенный Мост', description: 'Узкий подвесной мост над пропастью. Частые обрушения.', hazardLog: '⚠️ Обвал края моста! Вы едва удержались. Урон от падения.', hazardType: 'damage' },
  { id: 'titan_forge', name: 'Кузница Титанов', description: 'Двигающиеся платформы и случайные озера лавы.', hazardLog: '🔥 Резкий всплеск лавы обжигает обоих противников!', hazardType: 'both_damage' },
  { id: 'ruined_temple', name: 'Руины Храма', description: 'Древние проклятия подавляют восстанавливающую магию.', hazardLog: '🌫️ Миазмы Храма подавляют потоки исцеляющей энергии.', hazardType: 'heal_block' },
  { id: 'ancient_coliseum', name: 'Древний Колизей', description: 'Одобрение толпы дает случайные благословения.', hazardLog: '✨ Трибуны ликуют! Вы получаете Благословение Колизея!', hazardType: 'buff' }
];

const ARENA_ENEMIES: PVPEnemy[] = [
  { name: 'Гракх Костолом', class: 'Warrior', level: 2, hp: 160, maxHp: 160, difficulty: 'Новичок', spellName: 'Сокрушающий Удар', winRatingReward: 15 },
  { name: 'Селена Шепот Бури', class: 'Ranger', level: 4, hp: 280, maxHp: 280, difficulty: 'Опытный', spellName: 'Шквал Стрел', winRatingReward: 18 },
  { name: 'Торвальд Святой Свет', class: 'Paladin', level: 6, hp: 440, maxHp: 440, difficulty: 'Опытный', spellName: 'Священная Аура', winRatingReward: 20 },
  { name: 'Синтра Жнец Тьмы', class: 'Shadow Knight', level: 8, hp: 610, maxHp: 610, difficulty: 'Ветеран', spellName: 'Касание Смерти', winRatingReward: 25 },
  { name: 'Владыка Хаоса Ариэль', class: 'Enchanter', level: 11, hp: 920, maxHp: 920, difficulty: 'Грандмастер', spellName: 'Паралич Разума', winRatingReward: 35 }
];

type ArenaMode = '1v1' | '2v2' | '3v3' | '5v5';

const getRankName = (rating: number) => {
  if (rating < 1100) return 'Бронза';
  if (rating < 1300) return 'Серебро';
  if (rating < 1500) return 'Золото';
  if (rating < 1700) return 'Платина';
  if (rating < 1900) return 'Алмаз';
  if (rating < 2100) return 'Мастер';
  if (rating < 2300) return 'Грандмастер';
  return 'Этерниум';
};

const getRankColor = (rating: number) => {
  if (rating < 1100) return 'text-orange-700'; // Bronze
  if (rating < 1300) return 'text-slate-300'; // Silver
  if (rating < 1500) return 'text-yellow-400'; // Gold
  if (rating < 1700) return 'text-cyan-400'; // Platinum
  if (rating < 1900) return 'text-blue-500'; // Diamond
  if (rating < 2100) return 'text-purple-500'; // Master
  if (rating < 2300) return 'text-red-500'; // Grandmaster
  return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]'; // Eternium
};

export default function PvPArena({ character, onUpdateCharacter, triggerAlert }: PvPArenaProps) {
  const arena = character.arenaStats || {
    rating: 1200,
    hiddenMmr: 1200,
    wins: 0,
    losses: 0,
    points: 10,
    seasonMatches: 0,
    behaviorScore: 100,
    compliments: 0,
    reports: 0
  };

  const [activeEnemy, setActiveEnemy] = useState<PVPEnemy | null>(null);
  const [inBattle, setInBattle] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [playerMana, setPlayerMana] = useState(0);
  const [battleOver, setBattleOver] = useState(false);
  const [arenaMode, setArenaMode] = useState<ArenaMode>('1v1');
  const [arenaTab, setArenaTab] = useState<'matchmaking' | 'reputation'>('matchmaking');
  const [activeMap, setActiveMap] = useState<ArenaMapDef>(ARENA_MAPS[0]);


  // Pre-battle modifiers
  const [activePrepMod, setActivePrepMod] = useState<number>(0);
  const prepMods = [
    { title: 'Железная воля', desc: '+15% HP на первые 30 сек' },
    { title: 'Внезапность', desc: 'Первый удар усилен на 40%' },
    { title: 'Эфирный щит', desc: 'Защита от первого эффекта контроля' }
  ];

  const simulatedLeaderboard = [
    { name: 'Аль-Кабор', class: 'Wizard', rating: 2150, wins: 142, losses: 35 },
    { name: 'Фириона Ви', class: 'Paladin', rating: 1980, wins: 118, losses: 42 },
    { name: 'Fippy_Darkpaw', class: 'Warrior', rating: 1720, wins: 95, losses: 65 },
    { name: character.name, class: character.class, rating: arena.rating, wins: arena.wins, losses: arena.losses },
    { name: 'Инкар Кровавый', class: 'Necromancer', rating: 1150, wins: 12, losses: 24 }
  ].sort((a, b) => b.rating - a.rating);

  const startArenaMatch = (enemy: PVPEnemy) => {
    if (arenaMode !== '1v1') {
      triggerAlert('Этот режим турнира пока недоступен! Требуется поиск напарников.', 'info');
      return;
    }

    setActiveEnemy(enemy);
    let startHp = character.maxHp;
    if (activePrepMod === 0) startHp = Math.floor(startHp * 1.15); // +15% HP mod effect
    
    setEnemyHp(enemy.hp);
    setPlayerHp(startHp);
    setPlayerMana(character.maxMana);
    
    const logs = [
      `[АРЕНА] Сражение началось! Карта: ${activeMap.name} (${activeMap.description})`,
      `[АРЕНА] Режим: ${arenaMode}. Ваш соперник: ${enemy.name} (${enemy.class}).`,
      `[ПОДГОТОВКА] Активирован бонус: ${prepMods[activePrepMod].title}.`
    ];
    setBattleLogs(logs);
    setInBattle(true);
    setBattleOver(false);
  };


  const handleArenaTurn = (action: 'attack' | 'spell' | 'heal' | 'parry') => {
    if (!activeEnemy || battleOver) return;

    let localLogs = [...battleLogs];
    let nextEnemyHp = enemyHp;
    let nextPlayerHp = playerHp;
    let nextPlayerMana = playerMana;

    // Burst Window / Combo sim
    const isBurstReady = Math.random() > 0.7;

    if (action === 'attack') {
      let dmg = 15 + Math.floor((character.stats.str || 50) * 0.2) + Math.floor(Math.random() * 15);
      if (battleLogs.length === 2 && activePrepMod === 1) dmg *= 1.4; // First strike amp
      if (isBurstReady) {
         dmg = Math.floor(dmg * 2.5);
         localLogs.push(`💥 [BURST] Открылась уязвимость! Вы наносите сокрушительный крит ${dmg} ед. урона!`);
      } else {
         localLogs.push(`⚔️ Вы наносите физический выпад! ${activeEnemy.name} теряет ${Math.floor(dmg)} здоровья.`);
      }
      nextEnemyHp = Math.max(0, nextEnemyHp - Math.floor(dmg));
    } else if (action === 'spell') {
      if (nextPlayerMana < 15) {
        triggerAlert('Недостаточно ресурса!', 'error');
        return;
      }
      nextPlayerMana -= 15;
      let dmg = 30 + Math.floor((character.stats.int || 50) * 0.3) + Math.floor(Math.random() * 25);
      if (battleLogs.length === 2 && activePrepMod === 1) dmg *= 1.4;
      if (isBurstReady) {
         dmg = Math.floor(dmg * 2);
         localLogs.push(`✨ [BURST] Вы используете момент! Заклинание перегружается, нанося ${dmg} крит. урона!`);
      } else {
         localLogs.push(`🔥 Магический выброс Разлома! Враг получает ${Math.floor(dmg)} урона.`);
      }
      nextEnemyHp = Math.max(0, nextEnemyHp - Math.floor(dmg));
    } else if (action === 'heal') {
      const heal = 25 + Math.floor((character.stats.wis || 50) * 0.3) + Math.floor(Math.random() * 20);
      nextPlayerHp = Math.min(character.maxHp * 1.15, nextPlayerHp + heal);
      localLogs.push(`❇️ Использование защитной стойки! Восстановлено +${heal} ХП.`);
    } else if (action === 'parry') {
      localLogs.push(`🛡️ Тяжелая стойка: Вы готовитесь к идеальному парированию (Window: 0.25s).`);
    }

    setEnemyHp(nextEnemyHp);
    setPlayerMana(nextPlayerMana);

    // Hazard Zones / Map Events
    if (Math.random() > 0.75 && activeMap) {
      if (activeMap.hazardType === 'damage') {
        const fallDmg = 30 + Math.floor(Math.random() * 20);
        nextPlayerHp = Math.max(0, nextPlayerHp - fallDmg);
        localLogs.push(activeMap.hazardLog);
      } else if (activeMap.hazardType === 'miss') {
        localLogs.push(activeMap.hazardLog);
        // Negate player dmg this turn if attack/spell
        if (action === 'attack' || action === 'spell') {
           nextEnemyHp = enemyHp; // reset enemy hp dmg
           localLogs.push(`🌪️ Ваш удар прошел мимо из-за бури!`);
        }
      } else if (activeMap.hazardType === 'both_damage') {
        const lavaDmg = 25;
        nextPlayerHp = Math.max(0, nextPlayerHp - lavaDmg);
        nextEnemyHp = Math.max(0, nextEnemyHp - lavaDmg);
        localLogs.push(activeMap.hazardLog);
      } else if (activeMap.hazardType === 'heal_block') {
         if (action === 'heal') {
           nextPlayerHp = playerHp; // reset player heal
           localLogs.push(activeMap.hazardLog);
           localLogs.push(`🌫️ Ваше исцеление не сработало!`);
         }
      } else if (activeMap.hazardType === 'buff') {
         const buffHeal = 25;
         nextPlayerHp = Math.min(character.maxHp * 1.15, nextPlayerHp + buffHeal);
         localLogs.push(activeMap.hazardLog);
         localLogs.push(`📈 Толпа вдохновляет вас! Восстановлено ${buffHeal} ХП.`);
      }
    }

    if (nextEnemyHp <= 0) {
      handleMatchEnd(true, localLogs);
      return;
    }

    // Enemy Turn (Interrupts & Diminishing Returns logic sim)
    const enemyAction = Math.random();
    
    if (action === 'parry' && enemyAction > 0.4) {
       // Ideal parry against enemy attack
       const counterDmg = 40 + character.level * 10 + Math.floor(Math.random() * 20);
       nextEnemyHp = Math.max(0, nextEnemyHp - counterDmg);
       nextPlayerMana = Math.min(character.maxMana, nextPlayerMana + 30);
       localLogs.push(`⚡ ИДЕАЛЬНОЕ ПАРИРОВАНИЕ! Вы блокируете атаку "${activeEnemy.spellName}" в правильное окно (0.25s) и наносите ${counterDmg} встречного урона!`);
       localLogs.push(`🔥 Ваш баланс восстановлен: +30 Очков Разлома (Маны).`);
    } else if (action === 'parry' && enemyAction <= 0.4) {
       // Wasted parry
       const enemyHeal = 15 + activeEnemy.level * 4;
       nextEnemyHp = Math.min(activeEnemy.maxHp, nextEnemyHp + enemyHeal);
       localLogs.push(`🎭 ШТРАФ ПАРИРОВАНИЯ: Вы открылись для контратаки, но враг не ударил, а восстановил ${enemyHeal} ХП.`);
    } else {
       if (enemyAction > 0.8) {
          localLogs.push(`👹 ${activeEnemy.name} пытается применить контроль, но вы уклоняетесь (i-frames Dodge)!`);
       } else if (enemyAction > 0.4) {
         const enemyDmg = 12 + activeEnemy.level * 4 + Math.floor(Math.random() * 8);
         
         let missed = false;
         if (Math.random() > 0.75 && activeMap?.hazardType === 'miss') {
             missed = true;
             localLogs.push(`🌪️ ${activeEnemy.name} промахивается из-за бури!`);
         }
         
         if (!missed) {
             nextPlayerHp = Math.max(0, nextPlayerHp - enemyDmg);
             localLogs.push(`👹 Враг кастует "${activeEnemy.spellName}"! Вы получаете ${enemyDmg} урона.`);
         }
       } else {
         const enemyHeal = 15 + activeEnemy.level * 4;
         if (Math.random() > 0.75 && activeMap?.hazardType === 'heal_block') {
            localLogs.push(activeMap.hazardLog);
            localLogs.push(`🌫️ Исцеление врага не сработало!`);
         } else {
            nextEnemyHp = Math.min(activeEnemy.maxHp, nextEnemyHp + enemyHeal);
            localLogs.push(`🛡️ ${activeEnemy.name} уходит в оборону, восстанавливая ${enemyHeal} ХП.`);
         }
       }
    }

    setEnemyHp(nextEnemyHp);
    setPlayerHp(nextPlayerHp);

    if (nextPlayerHp <= 0) {
      handleMatchEnd(false, localLogs);
      return;
    }

    setBattleLogs(localLogs);
  };

  const handleMatchEnd = (playerWon: boolean, logsAccumulator: string[]) => {
    setBattleOver(true);

    const arenaStats = character.arenaStats || { rating: 1200, wins: 0, losses: 0, points: 10, seasonMatches: 0 };
    const baseSeasonMatches = arenaStats.seasonMatches || 0;

    if (playerWon && activeEnemy) {
      const earnedPoints = 10 + Math.floor(activeEnemy.level * 2);
      const ratingGain = activeEnemy.winRatingReward;
      const updatedArena = {
        rating: arenaStats.rating + ratingGain,
        wins: arenaStats.wins + 1,
        losses: arenaStats.losses,
        points: arenaStats.points + earnedPoints,
        seasonMatches: baseSeasonMatches + 1
      };

      logsAccumulator.push(`🏆 ПОБЕДА! Трибуны ревут от восторга! Вы одолели: ${activeEnemy.name}.`);
      logsAccumulator.push(`[НАГРАДА] +${ratingGain} Рейтинга | +${earnedPoints} Очков Арены`);
      
      const updatedChar = { ...character, arenaStats: updatedArena };
      onUpdateCharacter(updatedChar);
      triggerAlert(`Победа на Арене! Рейтинг повышен.`, 'success');
    } else if (activeEnemy) {
      const ratingLoss = arenaStats.rating > 1000 ? 15 : 0;
      const updatedArena = {
        rating: Math.max(1000, arenaStats.rating - ratingLoss),
        wins: arenaStats.wins,
        losses: arenaStats.losses + 1,
        points: arenaStats.points + 2, // Consolation pts
        seasonMatches: baseSeasonMatches + 1
      };

      logsAccumulator.push(`💀 ВРАГ ОКАЗАЛСЯ СИЛЬНЕЕ! Бой прерван арбитром.`);
      logsAccumulator.push(`[ШТРАФ] -${ratingLoss} Рейтинга.`);

      const updatedChar = { ...character, arenaStats: updatedArena };
      onUpdateCharacter(updatedChar);
      triggerAlert(`Поражение на Арене. Вы потеряли рейтинг.`, 'warning');
    }

    setBattleLogs(logsAccumulator);
  };

  const buyPvpItem = (name: string, statType: 'str' | 'sta' | 'int' | 'wis', bonus: number, cost: number) => {
    const arenaStats = character.arenaStats || { rating: 1200, wins: 0, losses: 0, points: 10 };
    if (arenaStats.points < cost) {
      triggerAlert('Недостаточно Очков Арены!', 'error');
      return;
    }
    const newItem: Item = {
      id: `pvp-reward-${Date.now()}`,
      name, slot: 'secondary', description: `Трофей кровопролитных боёв.`, price: cost, rarity: 'epic',
      stats: { [statType]: bonus, hp: bonus * 12 }
    };
    onUpdateCharacter({
      ...character,
      arenaStats: { ...arenaStats, points: arenaStats.points - cost },
      inventory: [...character.inventory, newItem]
    });
    triggerAlert(`Реликвия Гладиатора приобретена!`, 'success');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      
      {/* HEADER */}
      <div className="border-b border-slate-800/80 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-red-900/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10">
          <h3 className="font-serif text-2xl font-black text-white flex items-center gap-2 drop-shadow-md">
            <Swords className="h-6 w-6 text-red-500 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            Колизей Гладиаторов
          </h3>
          <div className="flex gap-6 mt-4">
             <button onClick={() => setArenaTab('matchmaking')} className={`text-xs font-bold uppercase tracking-widest pb-1.5 transition-all relative ${arenaTab === 'matchmaking' ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}>
               Бои и Подбор
               {arenaTab === 'matchmaking' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] rounded-t-sm" />}
             </button>
             <button onClick={() => setArenaTab('reputation')} className={`text-xs font-bold uppercase tracking-widest pb-1.5 transition-all relative ${arenaTab === 'reputation' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
               Репутация (Честь)
               {arenaTab === 'reputation' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] rounded-t-sm" />}
             </button>
          </div>
        </div>

        {/* Player PvP stats view */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3 px-5 rounded-xl border border-slate-700/50 flex gap-6 text-xs font-mono shadow-xl relative z-10">
           <div className="text-center">
             <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Ранг</span>
             <span className={`font-black uppercase tracking-widest text-sm drop-shadow-sm ${getRankColor(arena.rating)}`}>{getRankName(arena.rating)}</span>
           </div>
           <div className="w-[1px] bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
           <div className="text-center">
             <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Рейтинг</span>
             <span className="text-slate-100 font-bold block text-sm drop-shadow-sm">{arena.rating} MMR</span>
           </div>
           <div className="w-[1px] bg-gradient-to-b from-transparent via-slate-700 to-transparent" />
           <div className="text-center">
             <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Очки</span>
             <span className="text-amber-400 font-bold block text-sm drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]">🏵️ {arena.points}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Battle Arena Viewport or Reputation */}
        <div className="lg:col-span-8 space-y-4">
          
          {arenaTab === 'matchmaking' && (
            <>
              {!inBattle ? (
                <div className="space-y-4">
                  {/* Season Information */}
                  <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border border-red-900/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-lg">
                     <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-red-900/20 to-transparent pointer-events-none" />
                     <div className="relative z-10">
                       <h4 className="text-red-400 font-black uppercase text-xs tracking-widest flex items-center gap-2">
                         <Flame className="w-4 h-4 text-red-500 animate-pulse"/> Сезон 4: Пламя Разлома
                       </h4>
                       <p className="text-[10px] text-slate-400 font-mono mt-1.5 flex items-center gap-2">
                         <span className="bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">Сыграно: {arena.seasonMatches || 0}</span>
                         <span className="opacity-60">Осталось: 2 нед. 4 дня</span>
                       </p>
                     </div>
                     <button className="text-[10px] font-mono font-bold uppercase tracking-widest border border-slate-700 bg-slate-900/80 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all shadow-md relative z-10 whitespace-nowrap">
                       Награды Сезона
                     </button>
                  </div>

                  {/* Current Active Map Details in Matchmaking */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 relative overflow-hidden backdrop-blur-sm">
                     <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                       <Map className="w-24 h-24 text-slate-300" />
                     </div>
                     <div className="flex justify-between items-start relative z-10">
                        <div>
                           <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest flex items-center gap-2 mb-1">
                             <Map className="w-3 h-3 text-slate-500" /> Текущая Арена (В ротации)
                           </h4>
                           <span className="text-amber-400 font-serif font-bold text-sm block">{activeMap.name}</span>
                           <p className="text-[11px] text-slate-300 font-mono mt-2 mb-1 max-w-sm">{activeMap.description}</p>
                           <p className="text-[10px] text-slate-500 font-mono italic max-w-sm">Событие среды: {activeMap.hazardLog}</p>
                        </div>
                        <button 
                           onClick={() => {
                             let newMap;
                             do { newMap = ARENA_MAPS[Math.floor(Math.random() * ARENA_MAPS.length)]; } while (newMap.id === activeMap.id);
                             setActiveMap(newMap);
                           }}
                           className="text-[10px] font-mono border border-slate-700 bg-slate-800 px-2 py-1.5 rounded text-slate-300 hover:bg-slate-700 flex items-center gap-1.5 transition-colors"
                        >
                           <RefreshCw className="w-3 h-3" /> Сменить
                        </button>
                     </div>
                  </div>

                  {/* Matchmaking Tabs */}
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-fit">
                    {(['1v1', '2v2', '3v3', '5v5'] as ArenaMode[]).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setArenaMode(mode)}
                        className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-all flex-1 sm:flex-none ${
                           arenaMode === mode 
                            ? 'bg-red-900/60 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)] ring-1 ring-red-500' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {mode === '1v1' ? 'Дуэль' : mode === '5v5' ? 'Боевая Группа' : mode}
                      </button>
                    ))}
                  </div>

                  {/* Prep Modifiers */}
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                    <h4 className="text-[10px] uppercase font-bold text-indigo-400 mb-3 tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3" />
                      Модификатор Подготовки (Перед Боем)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {prepMods.map((mod, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setActivePrepMod(idx)}
                          className={`p-2 rounded border cursor-pointer transition-all ${
                            activePrepMod === idx ? 'bg-indigo-900/30 border-indigo-500/50 relative overflow-hidden' : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {activePrepMod === idx && <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-500/20 translate-x-1/2 -translate-y-1/2 rotate-45" />}
                          <span className="text-[11px] font-bold text-slate-200 block truncate">{mod.title}</span>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{mod.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enemy Selection / Matchmaking */}
                  <div className="mt-6">
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1 mb-3 flex items-center gap-2">
                      <Search className="w-3 h-3" />
                      Доступные Противники ({arenaMode})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 arena-container-grid">
                      {ARENA_ENEMIES.map(enemy => (
                        <div 
                          key={enemy.name} 
                          className="bg-slate-900/50 border-l-[4px] border-l-red-600/70 hover:border-l-red-500 border border-slate-800/60 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/80 transition-all shadow-md group arena-interactive-zone"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-serif text-sm font-bold text-slate-100 group-hover:text-white transition-colors">{enemy.name}</span>
                              <span className={`text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded-sm uppercase border ${
                                enemy.difficulty === 'Новичок' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' :
                                enemy.difficulty === 'Опытный' ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                                enemy.difficulty === 'Ветеран' ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' : 'bg-red-950/50 text-red-400 border-red-900/50 animate-pulse'
                              }`}>
                                {enemy.difficulty}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block font-mono">
                              <span className="capitalize">{enemy.class}</span> <span className="opacity-50">|</span> Ур. {enemy.level} <span className="opacity-50">|</span> ГС: ~{enemy.level * 45}
                            </span>
                          </div>

                          <button
                            onClick={() => startArenaMatch(enemy)}
                            className="bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-900/50 hover:border-red-600 font-mono text-[10px] uppercase tracking-widest py-2 px-4 rounded-md cursor-pointer transition-all focus:ring focus:ring-red-900 shadow-inner group-hover:shadow-[0_0_10px_rgba(220,38,38,0.2)] whitespace-nowrap"
                          >
                            Бросить вызов
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                /* IN-BATTLE UI */
                <div className="bg-slate-950 border-2 border-red-900/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden ring-1 ring-black/50">
                  <div className="absolute inset-0 bg-gradient-to-b from-red-950/10 via-transparent to-slate-950/80 pointer-events-none" />
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                     <Crosshair className="w-[30rem] h-[30rem] text-white -translate-y-1/4 translate-x-1/4" />
                   </div>

                  <div className="flex justify-between items-start sm:items-center relative z-10 border-b border-slate-800/80 pb-4 mb-6">
                    <span className="text-red-500 font-mono text-[10px] uppercase font-black bg-red-950 border border-red-900 px-2 py-0.5 rounded flex gap-2 items-center tracking-widest">
                      <span className="animate-ping w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                      LIVE: {arenaMode} Deathmatch
                    </span>
                    <div className="text-right">
                       <span className="text-amber-400 font-bold font-serif text-sm block">{activeMap?.name}</span>
                       <span className="text-[9px] text-slate-400 font-mono tracking-widest uppercase max-w-[200px] block truncate">{activeMap?.description}</span>
                    </div>
                  </div>

                  {/* Health and Mana Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    {/* Player Block */}
                    <div className="space-y-1.5 transform transition-all">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="font-serif font-bold text-slate-100 text-md truncate pr-2">{character.name} <span className="text-[10px] text-slate-500 font-mono uppercase">{character.class}</span></span>
                        <span className="text-emerald-400 text-xs font-mono font-bold bg-emerald-950 px-1 rounded">{playerHp} HP</span>
                      </div>
                      <div className="w-full bg-slate-900 h-4 rounded overflow-hidden shadow-inner border border-slate-800">
                        <div className="bg-emerald-500 h-full transition-all duration-300 relative shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${Math.max(0, (playerHp / (activePrepMod === 0 ? character.maxHp * 1.15 : character.maxHp)) * 100)}%` }}>
                           <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded overflow-hidden shadow-inner border border-slate-800">
                        <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${Math.max(0, (playerMana / character.maxMana) * 100)}%` }} />
                      </div>
                    </div>

                    {/* Enemy Block */}
                    <div className="space-y-1.5 md:text-right">
                      <div className="flex justify-between md:flex-row-reverse items-baseline mb-1">
                        <span className="font-serif font-bold text-slate-100 text-md truncate md:pl-2"><span className="text-[10px] text-slate-500 font-mono uppercase mr-1">{activeEnemy?.difficulty}</span>{activeEnemy?.name}</span>
                        <span className="text-red-400 text-xs font-mono font-bold bg-red-950 px-1 rounded">{enemyHp} HP</span>
                      </div>
                      <div className="w-full bg-slate-900 h-4 rounded overflow-hidden shadow-inner md:rotate-180 border border-slate-800">
                        <div className="bg-red-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${Math.max(0, (enemyHp / (activeEnemy?.maxHp || 100)) * 100)}%` }} />
                      </div>
                       <div className="w-full bg-slate-900 h-2 rounded overflow-hidden shadow-inner md:rotate-180 opacity-0 border border-slate-800">
                        <div className="bg-red-500 h-full transition-all duration-300" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Combat Log Area with Cinematic Feel */}
                  <div className="bg-slate-950/60 p-4 h-48 rounded-lg border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 overflow-y-auto backdrop-blur-sm relative z-10 flex flex-col-reverse">
                    <div className="space-y-2">
                      {[...battleLogs].reverse().map((log, index) => {
                        let colorClass = 'text-slate-300';
                        if (log.includes('Вы получаете') || log.includes('⚠️')) colorClass = 'text-red-300';
                        if (log.includes('поглощает') || log.includes('восстанавливая') || log.includes('📈')) colorClass = 'text-emerald-300';
                        if (log.includes('BURST') || log.includes('ПОБЕДА') || log.includes('ИДЕАЛЬНОЕ')) colorClass = 'text-amber-400 font-bold';
                        if (log.includes('ВЫ ПОВЕРЖЕНЫ') || log.includes('ШТРАФ')) colorClass = 'text-red-500 font-bold';

                        return <div key={index} className={`border-l-2 pl-2 border-slate-700/50 ${colorClass}`}>{log}</div>
                      })}
                    </div>
                  </div>

                  {/* Interactive Combat Array */}
                  <div className="pt-2 relative z-10 border-t border-slate-800/50">
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest pl-1 mb-3">Действия (Ваш Ход)</h4>
                    {!battleOver ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 arena-container-grid">
                         <div className="space-y-2">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Нападение</span>
                            <button onClick={() => handleArenaTurn('attack')} className="w-full bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 p-2.5 rounded flex items-center justify-between cursor-pointer transition-transform active:scale-95 shadow-md group arena-interactive-zone">
                              <div className="flex items-center gap-2">
                                <Swords className="h-4 w-4 text-slate-400 group-hover:text-slate-200 transition-colors" />
                                <span className="text-[11px] font-bold font-mono tracking-widest uppercase">Физическая Атака</span>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono hidden sm:block">Базовый урон</span>
                            </button>
                            <button onClick={() => handleArenaTurn('spell')} className="w-full bg-blue-950/40 hover:bg-blue-900/60 text-blue-100 border border-blue-900 p-2.5 rounded flex items-center justify-between cursor-pointer transition-transform active:scale-95 shadow-md group arena-interactive-zone">
                              <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                                <span className="text-[11px] font-bold font-mono tracking-widest uppercase">Выброс Разлома</span>
                              </div>
                              <span className="text-[9px] text-blue-500/70 font-mono hidden sm:block">-30 Маны</span>
                            </button>
                         </div>
                         <div className="space-y-2">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Оборона</span>
                            <button onClick={() => handleArenaTurn('heal')} className="w-full bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-100 border border-emerald-900 p-2.5 rounded flex items-center justify-between cursor-pointer transition-transform active:scale-95 shadow-md group arena-interactive-zone">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                                <span className="text-[11px] font-bold font-mono tracking-widest uppercase">Защита</span>
                              </div>
                              <span className="text-[9px] text-emerald-500/70 font-mono hidden sm:block">i-frames & Хил</span>
                            </button>
                            <button onClick={() => handleArenaTurn('parry')} className="w-full bg-amber-950/40 hover:bg-amber-900/60 text-amber-100 border border-amber-900 p-2.5 rounded flex items-center justify-between cursor-pointer transition-transform active:scale-95 shadow-md group arena-interactive-zone">
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4 text-amber-400 group-hover:text-amber-300 transition-colors animate-pulse" />
                                <span className="text-[11px] font-bold font-mono tracking-widest uppercase text-amber-300">Стойка (Парирование)</span>
                              </div>
                              <span className="text-[9px] text-amber-500/70 font-mono hidden sm:block">Окно 0.25s</span>
                            </button>
                         </div>
                      </div>
                    ) : (
                      <div className="flex justify-end mt-4">
                        <button onClick={() => setInBattle(false)} className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 hover:from-slate-700 hover:to-slate-800 text-slate-100 font-bold font-mono text-xs px-6 py-3 rounded uppercase cursor-pointer transition-all flex items-center gap-2 shadow-lg w-full sm:w-auto justify-center">
                          Покинуть Арену
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PvP Shop */}
              {!inBattle && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                  <h4 className="font-serif text-sm font-bold text-amber-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Интендант Арены
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3 rounded flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] border border-slate-800">
                      <div>
                        <span className="text-xs font-bold font-serif text-red-400 block">🏵️ Медаль Осады</span>
                        <p className="text-[10px] text-slate-400 font-mono">Доп. слоты • STR +8</p>
                        <span className="text-[10px] text-amber-500 font-bold block mt-1">15 Очков</span>
                      </div>
                      <button onClick={() => buyPvpItem('Медаль Осады', 'str', 8, 15)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono px-3 py-2 rounded uppercase border border-slate-700">Купить</button>
                    </div>
                    <div className="bg-slate-900 p-3 rounded flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] border border-slate-800">
                      <div>
                        <span className="text-xs font-bold font-serif text-indigo-400 block">🏵️ Подвеска Мага</span>
                        <p className="text-[10px] text-slate-400 font-mono">Доп. слоты • INT +12</p>
                        <span className="text-[10px] text-amber-500 font-bold block mt-1">30 Очков</span>
                      </div>
                      <button onClick={() => buyPvpItem('Подвеска Мага', 'int', 12, 30)} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono px-3 py-2 rounded uppercase border border-slate-700">Купить</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {arenaTab === 'reputation' && (
             <div className="space-y-6">
                 {/* Behavior Score Overview */}
                 <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                    <h4 className="text-[10px] uppercase font-bold text-emerald-400 mb-4 tracking-widest flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Индекс Поведения (Очки Духа)
                    </h4>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0">
                           <span className="text-3xl font-black text-white font-mono">{arena.behaviorScore || 100}</span>
                        </div>
                        <div className="flex-1 space-y-3 font-mono text-xs text-slate-300 text-center sm:text-left">
                           <p>Ваш статус: <strong className="text-emerald-400">Рыцарь Арены</strong> (Примерное поведение)</p>
                           <p className="text-[10px] text-slate-400 max-w-sm">Награда за честную игру: +10% к рейтингу на Арене, титул «Рыцарь Арены», и приоритет в очередях матчмейкинга.</p>
                           <div className="flex justify-center sm:justify-start gap-4 pt-4 border-t border-slate-800">
                              <span className="flex items-center gap-1.5 text-slate-300 font-bold bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800"><Sparkles className="w-3 h-3 text-amber-400"/> Комплименты: {arena.compliments || 0}</span>
                              <span className="flex items-center gap-1.5 text-slate-300 font-bold bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800"><ShieldAlert className="w-3 h-3 text-red-500"/> Репорты: {arena.reports || 0}</span>
                           </div>
                        </div>
                    </div>
                 </div>

                 {/* Matchmaking details */}
                 <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
                     <h4 className="text-[10px] uppercase font-bold text-blue-400 tracking-widest flex items-center gap-2 mb-2">
                      <Scale className="w-4 h-4" />
                      Разломный Баланс (Детали MMR)
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mb-4 leading-relaxed">
                       Ваш текущий скрытый MMR: <strong>{arena.hiddenMmr || arena.rating}</strong>.<br/>
                       Система постоянно анализирует ваш стиль битвы. Для вас в настоящий момент активно расширение диапазона поиска (±100 MMR), новички программно отфильтрованы.
                    </p>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[9px] text-slate-300">
                       <div className="bg-slate-900 p-3 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-slate-500 mb-1">MMR: DPS</span>
                          <span className="font-bold text-red-400 text-sm">{(arena.hiddenMmr || arena.rating) + 15}</span>
                       </div>
                       <div className="bg-slate-900 p-3 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-slate-500 mb-1">MMR: TANK</span>
                          <span className="font-bold text-blue-400 text-sm">{(arena.hiddenMmr || arena.rating) - 40}</span>
                       </div>
                       <div className="bg-slate-900 p-3 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-slate-500 mb-1">MMR: SUPPORT</span>
                          <span className="font-bold text-emerald-400 text-sm">{(arena.hiddenMmr || arena.rating) + 5}</span>
                       </div>
                       <div className="bg-slate-900 p-3 rounded border border-slate-800 flex flex-col items-center">
                          <span className="text-slate-500 mb-1">MMR: HYBRID</span>
                          <span className="font-bold text-purple-400 text-sm">{(arena.hiddenMmr || arena.rating)}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row gap-4 justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                   <div>
                     <h4 className="text-[11px] uppercase font-bold text-slate-200 tracking-widest flex items-center gap-2 mb-1">
                        <Flag className="w-4 h-4 text-amber-500" />
                        Сообщить о нарушении (Репорт-центр)
                     </h4>
                     <p className="text-[10px] text-slate-400 font-mono">Автомодерация анализирует логи после каждого боя. Пожаловаться можно только на участников последних матчей.</p>
                   </div>
                   <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-slate-700 rounded transition whitespace-nowrap">Открыть логи матчей</button>
                 </div>
             </div>
          )}

        </div>

        {/* Right Column: Competitive Rating Leaderboard */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] pointer-events-none" />
            <h4 className="font-serif text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest border-b border-slate-700/50 pb-4 mb-4 relative z-10">
              <Trophy className="h-4 w-4 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
              Топ Гладиаторов
            </h4>

            <div className="space-y-3 relative z-10">
              {simulatedLeaderboard.map((user, idx) => {
                const isPlayer = user.name === character.name;
                const isTop3 = idx < 3;
                return (
                  <div key={user.name} className={`p-3 rounded-lg flex items-center justify-between border transition-all ${isPlayer ? 'bg-slate-800/80 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20' : isTop3 ? 'bg-slate-900 border-slate-700/50' : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/60'}`}>
                    <div className="flex items-center gap-3.5">
                      <span className={`text-sm font-black w-5 text-center ${idx === 0 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : idx === 1 ? 'text-slate-300 drop-shadow-[0_0_5px_rgba(203,213,225,0.5)]' : idx === 2 ? 'text-orange-700 drop-shadow-[0_0_5px_rgba(194,65,12,0.5)]' : 'text-slate-600'}`}>{idx + 1}</span>
                      <div>
                        <span className={`font-bold text-xs block truncate ${isPlayer ? 'text-white' : 'text-slate-200'}`}>
                           {user.name} {idx === 0 && <span className="inline-block ml-1 text-[10px]">👑</span>}
                        </span>
                        <span className="text-[9px] text-slate-500 block font-mono mt-0.5 tracking-wider">
                          <span className="text-emerald-500/70">W:{user.wins}</span> <span className="text-red-500/70">L:{user.losses}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-bold uppercase tracking-widest block mb-0.5 ${getRankColor(user.rating)}`}>{getRankName(user.rating)}</span>
                      <span className="text-xs font-mono font-black text-slate-200">{user.rating} <span className="opacity-50 text-[10px]">MMR</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
