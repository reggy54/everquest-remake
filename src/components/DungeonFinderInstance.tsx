import React, { useState } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Sparkles, Sword, Play, Users, Shield, Heart, ShieldAlert, Award } from 'lucide-react';

interface DungeonProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface DungeonInfo {
  id: string;
  name: string;
  reqLevel: number;
  cost: number;
  stages: number;
  difficulty: 'Легко' | 'Средне' | 'Легендарно';
  enemies: { name: string; hp: number; maxHp: number; level: number; damage: number }[];
  boss: { name: string; hp: number; maxHp: number; level: number; damage: number; spell: string };
  rewardItem: Omit<Item, 'id'>;
}

const DUNGEONS: DungeonInfo[] = [
  {
    id: 'dung-1',
    name: 'Заброшенные катакомбы Бефален',
    reqLevel: 1,
    cost: 0,
    stages: 3,
    difficulty: 'Легко',
    enemies: [
      { name: 'Катакомбная крыса-мутант', hp: 90, maxHp: 90, level: 1, damage: 8 },
      { name: 'Скелет-стражник катакомб', hp: 130, maxHp: 130, level: 2, damage: 12 }
    ],
    boss: { name: 'Лорд-некромант Малакор', hp: 280, maxHp: 280, level: 3, damage: 20, spell: 'Призыв Тьмы' },
    rewardItem: {
      name: 'Шлем Вечного Некроманта',
      slot: 'head',
      description: 'Жуткий рогатый шлем, нашептывающий страшные тайны.',
      price: 25,
      rarity: 'rare',
      stats: { int: 8, hp: 50, ac: 8 }
    }
  },
  {
    id: 'dung-2',
    name: 'Осажденная крепость Огня',
    reqLevel: 4,
    cost: 15,
    stages: 3,
    difficulty: 'Средне',
    enemies: [
      { name: 'Огненный элементаль-солдат', hp: 220, maxHp: 220, level: 4, damage: 18 },
      { name: 'Пылающий лютоволк', hp: 260, maxHp: 260, level: 5, damage: 22 }
    ],
    boss: { name: 'Король-Дракон Нагараджа', hp: 650, maxHp: 650, level: 6, damage: 38, spell: 'Смертоносное Пекло' },
    rewardItem: {
      name: 'Кольчуга Вулканического Властелина',
      slot: 'chest',
      description: 'Тяжелые латы, выкованные в самом центре бурлящей лавы.',
      price: 50,
      rarity: 'epic',
      stats: { str: 15, sta: 12, hp: 140, ac: 30 }
    }
  }
];

interface PartyCompanion {
  name: string;
  class: string;
  hp: number;
  maxHp: number;
  role: 'tank' | 'healer' | 'dps';
}

export default function DungeonFinderInstance({ character, onUpdateCharacter, triggerAlert }: DungeonProps) {
  const [activeDungeon, setActiveDungeon] = useState<DungeonInfo | null>(null);
  const [inDungeon, setInDungeon] = useState(false);
  const [dungeonStage, setDungeonStage] = useState(1);
  const [party, setParty] = useState<PartyCompanion[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentMonster, setCurrentMonster] = useState<{ name: string; hp: number; maxHp: number; level: number; damage: number } | null>(null);
  const [isBossFight, setIsBossFight] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState<boolean | null>(null);

  const startDungeonRun = (dung: DungeonInfo) => {
    if (character.level < dung.reqLevel) {
      triggerAlert(`Ваш уровень слишком мал! Требуется уровень ${dung.reqLevel}.`, 'error');
      return;
    }
    if (character.gold < dung.cost) {
      triggerAlert('У вас недостаточно золота для оплаты снаряжения в катакомбы!', 'error');
      return;
    }

    // Initialize 3 Simulated Companion Bots to make a 4-man classic group!
    const companionBots: PartyCompanion[] = [
      { name: 'Латник Торгар (БОТ)', class: 'Paladin', hp: 350 + character.level * 30, maxHp: 350 + character.level * 30, role: 'tank' },
      { name: 'Жрица Соня (БОТ)', class: 'Cleric', hp: 180 + character.level * 15, maxHp: 180 + character.level * 15, role: 'healer' },
      { name: 'Оникс Снайпер (БОТ)', class: 'Ranger', hp: 220 + character.level * 20, maxHp: 220 + character.level * 20, role: 'dps' }
    ];

    // Deduct cost and save
    const updatedChar = { ...character, gold: character.gold - dung.cost };
    onUpdateCharacter(updatedChar);

    // Roll first enemy
    const firstEnemyTemplate = dung.enemies[0];
    const firstEnemy = {
      name: firstEnemyTemplate.name,
      hp: firstEnemyTemplate.hp,
      maxHp: firstEnemyTemplate.maxHp,
      level: firstEnemyTemplate.level,
      damage: firstEnemyTemplate.damage
    };

    setActiveDungeon(dung);
    setParty(companionBots);
    setDungeonStage(1);
    setIsBossFight(false);
    setCurrentMonster(firstEnemy);
    setInDungeon(true);
    setGameOver(false);
    setVictory(null);
    setLogs([
      `🏰 [ПОДЗЕМЕЛЬЕ] Вы вступили в ${dung.name} в составе группы из 4 героев!`,
      `👥 Соратники Танк Торгар, Лекарь Соня и ДПС Оникс прикрывают вашу спину.`,
      `⚔️ Комната 1: Из темноты на вас наступает [${firstEnemy.name}]!`
    ]);
  };

  const handleGroupTurn = (playerAction: 'attack' | 'heal' | 'shield') => {
    if (!activeDungeon || !currentMonster || gameOver) return;

    let nextLogs = [...logs];
    let nextMonsterHp = currentMonster.hp;
    let nextParty = [...party];

    // 1. Tank Bot action (Tanks the enemy, deals low damage)
    const tankDmg = 8 + Math.floor(Math.random() * 8);
    nextMonsterHp = Math.max(0, nextMonsterHp - tankDmg);
    nextLogs.push(`🛡️ Латник Торгар провоцирует врага криком и бьет щитом, нанося ${tankDmg} ед. урона!`);

    // 2. Ranger Bot action (Deals high physical damage)
    const rangerDmg = 18 + Math.floor(Math.random() * 15);
    nextMonsterHp = Math.max(0, nextMonsterHp - rangerDmg);
    nextLogs.push(`🏹 Оникс Снайпер пускает оперенную стрелу в уязвимое место! Урон: ${rangerDmg} ед.`);

    // 3. Player action
    if (playerAction === 'attack') {
      const playerDmg = 12 + Math.floor((character.stats.str || 50) * 0.15) + Math.floor(Math.random() * 10);
      nextMonsterHp = Math.max(0, nextMonsterHp - playerDmg);
      nextLogs.push(`⚔️ Вы бросаетесь в наступление! Нанесено ${playerDmg} физического урона по ${currentMonster.name}.`);
    } else if (playerAction === 'heal') {
      // Heal the most wounded member or player
      nextParty = nextParty.map(p => {
        if (p.role === 'tank') {
          const heal = 25 + Math.floor(Math.random() * 15);
          nextLogs.push(`❇️ Вы читаете Божественное исцеление! Танк Торгар излечивает +${heal} ХП.`);
          return { ...p, hp: Math.min(p.maxHp, p.hp + heal) };
        }
        return p;
      });
    } else if (playerAction === 'shield') {
      nextLogs.push(`🛡️ Вы встаете в оборонительную стойку, снижая весь входящий урон группы на 30%!`);
    }

    setCurrentMonster(prev => prev ? { ...prev, hp: nextMonsterHp } : null);

    // Check monster status
    if (nextMonsterHp <= 0) {
      handleStageVictory(nextLogs, nextParty);
      return;
    }

    // 4. Cleric Bot Action (Heals the group if tank is low, otherwise attacks)
    const tankCompanion = nextParty.find(p => p.role === 'tank');
    if (tankCompanion && tankCompanion.hp < tankCompanion.maxHp * 0.5) {
      const clericHeal = 40 + Math.floor(Math.random() * 20);
      nextParty = nextParty.map(p => {
        if (p.role === 'tank') {
          return { ...p, hp: Math.min(p.maxHp, p.hp + clericHeal) };
        }
        return p;
      });
      nextLogs.push(`💖 Жрица Соня читает заклинание Света небес! Рваные раны Торгара затягиваются на +${clericHeal} ХП.`);
    } else {
      const clericDmg = 8 + Math.floor(Math.random() * 6);
      nextMonsterHp = Math.max(0, nextMonsterHp - clericDmg);
      setCurrentMonster(prev => prev ? { ...prev, hp: nextMonsterHp } : null);
      nextLogs.push(`✨ Жрица Соня наказывает врага Божественной карой, нанося ${clericDmg} урона магии.`);
    }

    if (nextMonsterHp <= 0) {
      handleStageVictory(nextLogs, nextParty);
      return;
    }

    // 5. Monster Action (Attacks primarily the tank Торгар!)
    const targetIdx = 0; // index of Torgar is 0
    const targetCompanion = nextParty[targetIdx];
    const rawDmg = currentMonster.damage;
    const finalDmg = playerAction === 'shield' ? Math.floor(rawDmg * 0.7) : rawDmg;
    const randDmg = finalDmg + Math.floor(Math.random() * 8);

    nextParty = nextParty.map((p, idx) => {
      if (idx === targetIdx) {
        nextLogs.push(`👹 [АГРО] ${currentMonster.name} свирепствует и обрушивает удар на Торгара! Торгар теряет ${randDmg} ХП.`);
        return { ...p, hp: Math.max(0, p.hp - randDmg) };
      }
      return p;
    });

    setParty(nextParty);

    // Check tank survival
    const isTankDead = (nextParty[targetIdx]?.hp || 0) <= 0;
    if (isTankDead) {
      nextLogs.push('💀 [ТРАГЕДИЯ] Латник Торгар пал под напором врага! Оборона группы разрушена!');
      handleDungeonDefeat(nextLogs);
      return;
    }

    setLogs(nextLogs);
  };

  const handleStageVictory = (logsAccumulator: string[], currentParty: PartyCompanion[]) => {
    if (!activeDungeon || !currentMonster) return;

    const nextStage = dungeonStage + 1;
    setParty(currentParty);

    if (nextStage > activeDungeon.stages) {
      // Final Boss is dead, fully complete!
      setGameOver(true);
      setVictory(true);

      const rewardGold = 15 + activeDungeon.reqLevel * 10;
      const rewardExp = 500 + activeDungeon.reqLevel * 150;
      
      const wonItem: Item = {
        id: `dung-reward-${Date.now()}`,
        name: activeDungeon.rewardItem.name,
        slot: activeDungeon.rewardItem.slot,
        description: activeDungeon.rewardItem.description,
        price: activeDungeon.rewardItem.price,
        rarity: activeDungeon.rewardItem.rarity as any,
        stats: activeDungeon.rewardItem.stats
      };

      logsAccumulator.push(`🏆 ПОБЕДА! Подземелье ${activeDungeon.name} успешно зачищено!`);
      logsAccumulator.push(`[ГРУППОВОЙ ДЕЛЕЖ] Найдено: Эпическая реликвия [${wonItem.name}], +${rewardGold} золота и +${rewardExp} опыта.`);

      const leveledUp = character.exp + rewardExp >= character.expToNextLevel;
      const nextLevel = leveledUp ? character.level + 1 : character.level;
      const nextExp = leveledUp ? 0 : character.exp + rewardExp;

      const updatedChar: PlayerCharacter = {
        ...character,
        level: nextLevel,
        exp: nextExp,
        gold: character.gold + rewardGold,
        inventory: [...character.inventory, wonItem]
      };

      onUpdateCharacter(updatedChar);
      triggerAlert(`Подземелье зачищено успешно! Получен предмет [${wonItem.name}]!`, 'success');
      setLogs(logsAccumulator);
    } else {
      // Advance stage, prepare next monster
      setDungeonStage(nextStage);
      const isBoss = nextStage === activeDungeon.stages;
      setIsBossFight(isBoss);

      let nextEnemy;
      if (isBoss) {
        nextEnemy = {
          name: activeDungeon.boss.name,
          hp: activeDungeon.boss.hp,
          maxHp: activeDungeon.boss.maxHp,
          level: activeDungeon.boss.level,
          damage: activeDungeon.boss.damage
        };
        logsAccumulator.push(`⚠️ ВНИМАНИЕ! Вы у ворот Тронного Зала. Из тени выходит Легендарный Рейд-Босс: [${nextEnemy.name}] (Уровень: ${nextEnemy.level})!`);
      } else {
        const nextTemplate = activeDungeon.enemies[1 % activeDungeon.enemies.length];
        nextEnemy = {
          name: nextTemplate.name,
          hp: nextTemplate.hp,
          maxHp: nextTemplate.maxHp,
          level: nextTemplate.level,
          damage: nextTemplate.damage
        };
        logsAccumulator.push(`🐾 Комната ${nextStage}: Перед вами вырастает преграда! На группу скалится [${nextEnemy.name}].`);
      }

      setCurrentMonster(nextEnemy);
      setLogs(logsAccumulator);
    }
  };

  const handleDungeonDefeat = (logsAccumulator: string[]) => {
    setGameOver(true);
    setVictory(false);
    logsAccumulator.push('💀 ВАША ГРУППА ПОГИБЛА! Некромант похитил ваши души. Тела эвакуированы соратниками к воротам города.');
    setLogs(logsAccumulator);
    triggerAlert('Ваш рейд-отряд пал в подземелье!', 'error');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <Award className="h-5 w-5 text-indigo-400 animate-bounce" />
            Инстансы & Кооперативные Подземелья
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Соберите пати из ИИ-соратников (танк Торгар, хилер Соня), пробирайтесь через смертоносные зоны вечного страха и скрестите мечи с боссами ради эпического лута.
          </p>
        </div>
      </div>

      {!inDungeon ? (
        /* DUNGEON SELECT SCREEN */
        <div className="space-y-4 max-w-4xl mx-auto">
          <span className="text-xs font-bold text-slate-400 font-mono tracking-wider block uppercase">Доступные рейдовые зоны Этернии:</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DUNGEONS.map(dung => {
              const matchesLvl = character.level >= dung.reqLevel;

              return (
                <div 
                  key={dung.id} 
                  className="bg-slate-950 p-5 rounded-lg border border-slate-850 hover:border-slate-800 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        dung.difficulty === 'Легко' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        Разряд: {dung.difficulty}
                      </span>
                      <span className="text-slate-500 font-mono">Минимальный Уровень: {dung.reqLevel}</span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-slate-200 mt-1">{dung.name}</h4>
                    <p className="text-xs text-slate-400 leading-normal">{dung.boss.name} охраняет легендарную сокровищницу на глубине. Вам понадобится дружная группа.</p>

                    <div className="bg-slate-900 border border-slate-850 p-3 rounded font-mono text-[10px] space-y-1 text-amber-500/80">
                      <div>🗝️ ЭПИК ЛУТ: <span className="font-bold text-slate-200">{dung.rewardItem.name}</span></div>
                      <div>👥 Состав группы: Вы + 3 БОТа-компаньона</div>
                      {dung.cost > 0 && <div>💰 Сбор Распорядителя: {dung.cost} золотых</div>}
                    </div>
                  </div>

                  <button
                    onClick={() => startDungeonRun(dung)}
                    className="mt-6 bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 text-white font-mono text-xs font-black uppercase py-2.5 rounded cursor-pointer flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Play className="h-4 w-4" />
                    Зайти в портал
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ACTIVE COMBAT RUN CRAWLING CORE FRAME */
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-2xl space-y-4 animate-fade-in max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-3">
            <div>
              <span className="text-indigo-400 font-mono text-[9px] uppercase font-black bg-indigo-950 border border-indigo-900 px-2 py-0.5 rounded tracking-widest">
                РЕЙДОВАЯ ЗОНА • КОМНАТА {dungeonStage} ИЗ {activeDungeon?.stages}
              </span>
              <h4 className="text-slate-100 font-serif text-base font-black mt-1">
                Группа {character.name} штурмует подземелье
              </h4>
            </div>

            <div className="text-xs font-mono bg-slate-900 border border-slate-850 px-3 py-1 rounded text-amber-500">
              Гербовый лут: {activeDungeon?.rewardItem.name}
            </div>
          </div>

          {/* Group and Monster Health panels layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Box: Simulated Party status */}
            <div className="md:col-span-5 bg-slate-900 p-4 rounded-lg border border-slate-850 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold block border-b border-slate-850 pb-1.5 uppercase">Здоровье Вашего рейд-отряда:</span>
              
              <div className="space-y-3 select-none">
                {/* Player yourself status */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-amber-400">🛡️ Вы ({character.name})</span>
                    <span className="text-slate-300">100% (При укрытии)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                    <div className="bg-amber-500 h-full transition-all duration-300 animate-pulse-subtle" style={{ width: '100%' }} />
                  </div>
                </div>

                {party.map(p => (
                  <div key={p.name} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-300">{p.role === 'tank' ? '🛡️' : p.role === 'healer' ? '🔮' : '🏹'} {p.name} ({p.class})</span>
                      <span className={p.hp < p.maxHp * 0.4 ? 'text-red-400 font-bold' : 'text-slate-400'}>
                        {p.hp} / {p.maxHp} HP
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded overflow-hidden">
                      <div className={`h-full transition-all duration-300 ${
                        p.hp < p.maxHp * 0.4 ? 'bg-red-500 animate-pulse' : 'bg-violet-500'
                      }`} style={{ width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Box: Target boss / monster face-off */}
            <div className="md:col-span-7 bg-slate-900 p-4 rounded-lg border border-slate-850 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 font-bold block border-b border-slate-850 pb-1.5 uppercase">Групповая цель в комнате:</span>
                
                {currentMonster && (
                  <div className="text-center py-5 space-y-3">
                    <span className="text-5xl block animate-bounce">
                      {isBossFight ? '🐉' : '🧟'}
                    </span>
                    <div>
                      <h4 className="font-serif text-sm font-black text-rose-450 leading-none">{currentMonster.name}</h4>
                      <span className="text-[9px] text-slate-500 font-mono tracking-wide mt-1 block">Рейд-босс • Уровень: {currentMonster.level}</span>
                    </div>

                    <div className="max-w-xs mx-auto space-y-1.5 pt-1.5 select-none">
                      <div className="flex justify-between text-[11px] font-mono text-slate-350">
                        <span>Запас жизненных сил:</span>
                        <span className="text-red-500 font-bold">{currentMonster.hp} / {currentMonster.maxHp} HP ({Math.round((currentMonster.hp / currentMonster.maxHp) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-950 h-3 rounded overflow-hidden">
                        <div className="bg-red-600 h-full transition-all duration-300" style={{ width: `${(currentMonster.hp / currentMonster.maxHp) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Combat Log for Cooperative Dungeon Crawl */}
          <div className="bg-slate-955 border border-slate-800 p-4 h-48 rounded font-mono text-[11px] text-slate-300 leading-relaxed space-y-1.5 overflow-y-auto select-text scroll-smooth">
            {logs.map((log, index) => (
              <div key={index} className="border-b border-slate-900/40 pb-1 last:border-0 font-mono">{log}</div>
            ))}
          </div>

          {/* Game Controls Row */}
          <div className="flex gap-2 justify-end select-none">
            {!gameOver ? (
              <>
                <button
                  onClick={() => handleGroupTurn('attack')}
                  className="bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-900 px-4 py-2.5 text-xs font-bold font-mono tracking-wider rounded uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sword className="h-4 w-4" />
                  Ударить Орудием
                </button>
                <button
                  onClick={() => handleGroupTurn('heal')}
                  className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-900 px-4 py-2.5 text-xs font-bold font-mono tracking-wider rounded uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Heart className="h-4 w-4" />
                  Прочесть Лечение
                </button>
                <button
                  onClick={() => handleGroupTurn('shield')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 text-xs font-bold font-mono tracking-wider rounded uppercase flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Shield className="h-4 w-4" />
                  Прикрыть Щитом (Оборона)
                </button>
              </>
            ) : (
              <button
                onClick={() => { setInDungeon(false); setActiveDungeon(null); }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs px-6 py-3 rounded uppercase cursor-pointer transition-all flex items-center gap-1"
              >
                Вернуться в Ворота города
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
