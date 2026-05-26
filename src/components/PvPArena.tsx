import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Trophy, ShieldAlert, Swords, Users, Shield, Zap, Sparkles, Loader2 } from 'lucide-react';

interface PvPArenaProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error') => void;
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

const ARENA_ENEMIES: PVPEnemy[] = [
  { name: 'Гракх Костолом', class: 'Warrior', level: 2, hp: 160, maxHp: 160, difficulty: 'Новичок', spellName: 'Сокрушающий Удар', winRatingReward: 15 },
  { name: 'Селена Шепот Бури', class: 'Ranger', level: 4, hp: 280, maxHp: 280, difficulty: 'Опытный', spellName: 'Шквал Стрел', winRatingReward: 18 },
  { name: 'Торвальд Святой Свет', class: 'Paladin', level: 6, hp: 440, maxHp: 440, difficulty: 'Опытный', spellName: 'Священная Аура', winRatingReward: 20 },
  { name: 'Синтра Жнец Тьмы', class: 'Shadow Knight', level: 8, hp: 610, maxHp: 610, difficulty: 'Ветеран', spellName: 'Касание Смерти', winRatingReward: 25 },
  { name: 'Владыка Хаоса Ариэль', class: 'Enchanter', level: 11, hp: 920, maxHp: 920, difficulty: 'Грандмастер', spellName: 'Паралич Разума', winRatingReward: 35 }
];

export default function PvPArena({ character, onUpdateCharacter, triggerAlert }: PvPArenaProps) {
  // Safe default values
  const arena = character.arenaStats || {
    rating: 1200,
    wins: 0,
    losses: 0,
    points: 10
  };

  const [activeEnemy, setActiveEnemy] = useState<PVPEnemy | null>(null);
  const [inBattle, setInBattle] = useState(false);
  const [battleLogs, setBattleLogs] = useState<string[]>([]);
  const [pveLogs, setPveLogs] = useState<string[]>([]);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [playerMana, setPlayerMana] = useState(0);
  const [battleOver, setBattleOver] = useState(false);
  const [victory, setVictory] = useState<boolean | null>(null);

  // Leaderboard lists
  const simulatedLeaderboard = [
    { name: 'Аль-Кабор', class: 'Wizard', rating: 2150, wins: 142, losses: 35 },
    { name: 'Фириона Ви', class: 'Paladin', rating: 1980, wins: 118, losses: 42 },
    { name: 'Fippy_Darkpaw', class: 'Warrior', rating: 1720, wins: 95, losses: 65 },
    { name: character.name, class: character.class, rating: arena.rating, wins: arena.wins, losses: arena.losses },
    { name: 'Инкар Кровавый', class: 'Necromancer', rating: 1150, wins: 12, losses: 24 }
  ].sort((a, b) => b.rating - a.rating);

  const startArenaMatch = (enemy: PVPEnemy) => {
    setActiveEnemy(enemy);
    setEnemyHp(enemy.hp);
    setPlayerHp(character.maxHp);
    setPlayerMana(character.maxMana);
    setBattleLogs([`[АРЕНА] Сражение началось! Вашим соперником выступает легендарный гладиатор: ${enemy.name} (${enemy.class}).`]);
    setInBattle(true);
    setBattleOver(false);
    setVictory(null);
  };

  const handleArenaTurn = (action: 'attack' | 'spell' | 'heal') => {
    if (!activeEnemy || battleOver) return;

    let localLogs = [...battleLogs];
    let nextEnemyHp = enemyHp;
    let nextPlayerHp = playerHp;
    let nextPlayerMana = playerMana;

    // 1. Player turn
    if (action === 'attack') {
      const dmg = 15 + Math.floor((character.stats.str || 50) * 0.15) + Math.floor(Math.random() * 12);
      nextEnemyHp = Math.max(0, nextEnemyHp - dmg);
      localLogs.push(`⚔️ Вы наносите физический удар в выпаде! ${activeEnemy.name} теряет ${dmg} единиц здоровья.`);
    } else if (action === 'spell') {
      if (nextPlayerMana < 15) {
        triggerAlert('Недостаточно маны для заклинания!', 'error');
        return;
      }
      nextPlayerMana -= 15;
      const dmg = 30 + Math.floor((character.stats.int || 50) * 0.25) + Math.floor(Math.random() * 25);
      nextEnemyHp = Math.max(0, nextEnemyHp - dmg);
      localLogs.push(`🔥 Вы читаете Космическое Заклятие Арены! ${activeEnemy.name} получает ${dmg} урона магии.`);
    } else if (action === 'heal') {
      const heal = 25 + Math.floor((character.stats.wis || 50) * 0.25) + Math.floor(Math.random() * 15);
      nextPlayerHp = Math.min(character.maxHp, nextPlayerHp + heal);
      localLogs.push(`❇️ Вы совершаете прилив Второго Дыхания, восстанавливая +${heal} ХП.`);
    }

    setEnemyHp(nextEnemyHp);
    setPlayerMana(nextPlayerMana);

    // 2. Check enemy survival
    if (nextEnemyHp <= 0) {
      handleMatchEnd(true, localLogs);
      return;
    }

    // 3. Enemy Turn
    const enemyAction = Math.random() > 0.4 ? 'attack' : 'spell';
    if (enemyAction === 'attack') {
      const enemyDmg = 12 + activeEnemy.level * 3 + Math.floor(Math.random() * 8);
      nextPlayerHp = Math.max(0, nextPlayerHp - enemyDmg);
      localLogs.push(`👹 ${activeEnemy.name} проводит яростную контратаку: "${activeEnemy.spellName}"! Вы получаете ${enemyDmg} урона.`);
    } else {
      const enemyHeal = 15 + activeEnemy.level * 4;
      nextEnemyHp = Math.min(activeEnemy.maxHp, nextEnemyHp + enemyHeal);
      localLogs.push(`🧪 ${activeEnemy.name} поглощает настойку выносливости Арены и залечивает ${enemyHeal} ХП.`);
    }

    setEnemyHp(nextEnemyHp);
    setPlayerHp(nextPlayerHp);

    // 4. Check player survival
    if (nextPlayerHp <= 0) {
      handleMatchEnd(false, localLogs);
      return;
    }

    setBattleLogs(localLogs);
  };

  const handleMatchEnd = (playerWon: boolean, logsAccumulator: string[]) => {
    setBattleOver(true);
    setVictory(playerWon);

    const arenaStats = character.arenaStats || { rating: 1200, wins: 0, losses: 0, points: 10 };

    if (playerWon && activeEnemy) {
      const earnedPoints = 4 + Math.floor(activeEnemy.level * 1.5);
      const ratingGain = activeEnemy.winRatingReward;
      const updatedArena = {
        rating: arenaStats.rating + ratingGain,
        wins: arenaStats.wins + 1,
        losses: arenaStats.losses,
        points: arenaStats.points + earnedPoints
      };

      logsAccumulator.push(`🏆 ПОБЕДА! Вы одолели ${activeEnemy.name} на глазах у ревущей публики!`);
      logsAccumulator.push(`[НАГРАДА] Получено +${ratingGain} к рейтингу Арены и +${earnedPoints} Очков Арены (PvP-валюта).`);
      
      const updatedChar = { ...character, arenaStats: updatedArena };
      onUpdateCharacter(updatedChar);
      triggerAlert(`Победа на PvP-Арене! +${ratingGain} к рейтингу.`, 'success');
    } else if (activeEnemy) {
      const ratingLoss = Math.min(arenaStats.rating - 1000, 10) ? 12 : 0;
      const updatedArena = {
        rating: Math.max(1000, arenaStats.rating - ratingLoss),
        wins: arenaStats.wins,
        losses: arenaStats.losses + 1,
        points: arenaStats.points
      };

      logsAccumulator.push(`💀 ВЫ ПОВЕРЖЕНЫ! Распорядитель магии эвакуирует ваше тело с песка колизея.`);
      logsAccumulator.push(`[НАГРАДА] Потерян рейтинг Арены: -${ratingLoss}. Не расстраивайтесь, тренируйтесь больше!`);

      const updatedChar = { ...character, arenaStats: updatedArena };
      onUpdateCharacter(updatedChar);
      triggerAlert(`Поражение на PvP-Арене! -${ratingLoss} рейтинга.`, 'error');
    }

    setBattleLogs(logsAccumulator);
  };

  const buyPvpItem = (name: string, statType: 'str' | 'sta' | 'int' | 'wis', bonus: number, cost: number) => {
    const arenaStats = character.arenaStats || { rating: 1200, wins: 0, losses: 0, points: 10 };
    if (arenaStats.points < cost) {
      triggerAlert('У вас недостаточно Очков Арены для покупки этой PvP-реликвии!', 'error');
      return;
    }

    const newItem: Item = {
      id: `pvp-reward-${Date.now()}`,
      name,
      slot: 'secondary',
      description: `Почетный знак Высшего Легиона Арены.`,
      price: cost,
      rarity: 'epic',
      stats: { [statType]: bonus, hp: bonus * 10 }
    };

    const updatedArena = {
      ...arenaStats,
      points: arenaStats.points - cost
    };

    const updatedChar: PlayerCharacter = {
      ...character,
      arenaStats: updatedArena,
      inventory: [...character.inventory, newItem]
    };

    onUpdateCharacter(updatedChar);
    triggerAlert(`Приобретена PvP-реликвия: [${name}]!`, 'success');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <Swords className="h-5 w-5 text-red-500 animate-pulse" />
            Колизей Гладиаторов Арены
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Сражайтесь в напряженных 1v1 PvP дуэлях с искусными соратниками, поднимайтесь по сетке рейтинга и заслужите эпические награды Владык.
          </p>
        </div>

        {/* Player PvP statistics banner */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 flex gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block">ПВП РЕЙТИНГ:</span>
            <span className="text-amber-400 font-bold block text-sm">⭐ {arena.rating}</span>
          </div>
          <div className="border-r border-slate-800" />
          <div>
            <span className="text-slate-500 block">ПОБЕДЫ/ПОРАЖ.:</span>
            <span className="text-emerald-400 font-bold block text-sm">⚔️ {arena.wins} / {arena.losses}</span>
          </div>
          <div className="border-r border-slate-800" />
          <div>
            <span className="text-slate-500 block">PVP ВАЛЮТА:</span>
            <span className="text-red-400 font-bold block text-sm">🏵️ {arena.points}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Battle Arena Viewport */}
        <div className="lg:col-span-8 space-y-4">
          {!inBattle ? (
            <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase">Доступные соперники в Колизее:</span>
              
              <div className="space-y-3">
                {ARENA_ENEMIES.map(enemy => {
                  const tooHard = enemy.level > character.level + 2;

                  return (
                    <div 
                      key={enemy.name} 
                      className="bg-slate-900 focus:border-red-500 border border-slate-800 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-slate-100">{enemy.name}</span>
                          <span className={`text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                            enemy.difficulty === 'Новичок' ? 'bg-emerald-950 text-emerald-400' :
                            enemy.difficulty === 'Опытный' ? 'bg-blue-950 text-blue-400' :
                            enemy.difficulty === 'Ветеран' ? 'bg-purple-950 text-purple-400' : 'bg-red-950 text-red-400'
                          }`}>
                            {enemy.difficulty}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block font-mono">Класс: {enemy.class} • Уровень: {enemy.level} • ХП: {enemy.maxHp}</span>
                      </div>

                      <button
                        onClick={() => startArenaMatch(enemy)}
                        className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-mono text-xs font-black uppercase py-2 px-4 rounded cursor-pointer transition-all flex items-center gap-1 shrink-0"
                      >
                        <Swords className="h-3.5 w-3.5" />
                        Дуэль
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ACTIVE DUEL IN PROGRESS FRAME */
            <div className="bg-slate-950 border border-red-900 rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-850 pb-3">
                <div>
                  <span className="text-red-500 font-mono text-[9px] uppercase font-black bg-red-950 border border-red-900 px-2 py-0.5 rounded tracking-widest">
                    АКТИВНАЯ АРЕНА 1v1
                  </span>
                  <h4 className="text-slate-100 font-serif text-md font-black mt-1">Гладиаторский бой насмерть!</h4>
                </div>
                <div className="text-[10px] font-mono text-slate-500">Поединок прервать нельзя</div>
              </div>

              {/* Combat Health and Mana Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-lg border border-slate-850">
                {/* Player Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-200">Вы ({character.name})</span>
                    <span className="text-emerald-400">{playerHp} / {character.maxHp} HP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300 animate-pulse-subtle" style={{ width: `${Math.max(0, (playerHp / character.maxHp) * 100)}%` }} />
                  </div>

                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Мана</span>
                    <span>{playerMana} / {character.maxMana} MP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${Math.max(0, (playerMana / character.maxMana) * 100)}%` }} />
                  </div>
                </div>

                {/* Opponent Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold md:text-right">
                    <span className="text-slate-200 md:order-last">{activeEnemy?.name}</span>
                    <span className="text-red-400">{enemyHp} / {activeEnemy?.maxHp} HP</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${Math.max(0, (enemyHp / (activeEnemy?.maxHp || 100)) * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono text-right mt-1">
                    КЛАСС: <span className="text-slate-300">{activeEnemy?.class}</span> • УРОВЕНЬ: <span className="text-slate-300">{activeEnemy?.level}</span>
                  </div>
                </div>
              </div>

              {/* Combat Log Area */}
              <div 
                className="bg-slate-955 p-3.5 h-44 rounded border border-slate-800 font-mono text-[11px] leading-relaxed text-slate-300 space-y-1.5 overflow-y-auto select-text scroll-smooth"
              >
                {battleLogs.map((log, index) => (
                  <div key={index} className="border-b border-slate-850 pb-1 last:border-0">{log}</div>
                ))}
              </div>

              {/* Gladiator Interactive Control Row */}
              <div className="flex gap-2 justify-end select-none">
                {!battleOver ? (
                  <>
                    <button
                      onClick={() => handleArenaTurn('attack')}
                      className="bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-200 px-4 py-2 text-xs font-bold font-mono tracking-wider rounded uppercase flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Swords className="h-4 w-4" />
                      Атака Мечом
                    </button>
                    <button
                      onClick={() => handleArenaTurn('spell')}
                      className="bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-900 px-4 py-2 text-xs font-bold font-mono tracking-wider rounded uppercase flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Zap className="h-4 w-4" />
                      Магия свитка
                    </button>
                    <button
                      onClick={() => handleArenaTurn('heal')}
                      className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-900 px-4 py-2 text-xs font-bold font-mono tracking-wider rounded uppercase flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Shield className="h-4 w-4" />
                      Лечение
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setInBattle(false); setActiveEnemy(null); }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs px-5 py-2.5 rounded uppercase cursor-pointer transition-all flex items-center gap-1"
                  >
                    Вернуться к Списку Бойцов
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PvP reward shop */}
          <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3">
            <h4 className="font-serif text-sm font-bold text-amber-500 flex items-center gap-1.5 uppercase">
              <Sparkles className="h-4.5 w-4.5 text-amber-400" />
              Призовой интендант Арены (Награды PvP)
            </h4>
            <p className="text-[10px] text-slate-500">
              Обменяйте заработанные Очки Арены на эксклюзивные гербовые реликвии, носимые в дополнительный слот.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold font-serif text-red-400 block">🏵️ Медаль Старой Осады</span>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Второй слот • STR +8 • HP +80</p>
                  <span className="text-[10px] text-amber-500 font-bold block mt-1">Цена: 15 Аренапоинтов</span>
                </div>
                <button
                  onClick={() => buyPvpItem('Медаль Старой Осады', 'str', 8, 15)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono px-2.5 py-1.5 rounded cursor-pointer border border-slate-700"
                >
                  Купить
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center gap-4">
                <div>
                  <span className="text-xs font-bold font-serif text-indigo-400 block">🏵️ Подвеска Тайного Мага</span>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">Второй слот • INT +12 • HP +120</p>
                  <span className="text-[10px] text-amber-500 font-bold block mt-1">Цена: 30 Аренапоинтов</span>
                </div>
                <button
                  onClick={() => buyPvpItem('Подвеска Тайного Мага', 'int', 12, 30)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono px-2.5 py-1.5 rounded cursor-pointer border border-slate-700"
                >
                  Купить
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Competitive Rating Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
            <h4 className="font-serif text-sm font-bold text-slate-300 flex items-center gap-1.5 uppercase">
              <Trophy className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
              Таблица Рейтинга Арены
            </h4>

            <div className="space-y-2 select-none">
              {simulatedLeaderboard.map((user, idx) => {
                const isPlayer = user.name === character.name;

                return (
                  <div
                    key={user.name}
                    className={`p-2.5 rounded font-mono text-xs flex justify-between items-center border transition-all ${
                      isPlayer
                        ? 'bg-amber-955 border-amber-500/50 shadow-md ring-1 ring-amber-500/25'
                        : 'bg-slate-900 border-slate-850 hover:bg-slate-850 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-black text-slate-500 w-4 block text-center">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span className={`font-bold block truncate leading-tight ${isPlayer ? 'text-amber-300' : 'text-slate-100'}`}>
                          {user.name}
                        </span>
                        <span className="text-[9px] text-slate-500 block">Класс: {user.class} • Побед: {user.wins}</span>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-amber-400 shrink-0 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded">
                      🏆 {user.rating}
                    </span>
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
