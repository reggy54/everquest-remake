import React, { useState } from 'react';
import { PlayerCharacter, CombatStats, CharacterClass } from '../types';
import { CLASS_STAT_GROWTHS, SPEC_STAT_GROWTHS } from '../data/classGrowths';
import { Sparkles, Save, Shield, Swords, Zap, RefreshCw, Flame, Brain, Heart, Wind, Star, Settings2 } from 'lucide-react';

interface StatManagerProps {
  character: PlayerCharacter;
  onSave: (newStats: CombatStats, remainingFree: number) => void;
  language: 'ru' | 'en';
}

export default function StatManager({ character, onSave, language }: StatManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [distributedFreeStats, setDistributedFreeStats] = useState<Partial<CombatStats>>({
    str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0
  });

  const totalUsed = Object.values(distributedFreeStats).reduce((a, b) => (a || 0) + (b || 0), 0);
  const totalAvailable = character.freeStatPoints || 0;
  const remainingFreePoints = totalAvailable - totalUsed;

  const handleStatIncrement = (stat: keyof CombatStats) => {
    if (remainingFreePoints > 0) {
      setDistributedFreeStats(prev => ({
        ...prev,
        [stat]: (prev[stat] || 0) + 1
      }));
    }
  };

  const handleStatDecrement = (stat: keyof CombatStats) => {
    if ((distributedFreeStats[stat] || 0) > 0) {
      setDistributedFreeStats(prev => ({
        ...prev,
        [stat]: (prev[stat] || 0) - 1
      }));
    }
  };

  const applyOptimal = () => {
    // For "Оптимальное распределение"
    const baseGrowths = CLASS_STAT_GROWTHS[character.class as CharacterClass] || CLASS_STAT_GROWTHS['Warrior'];
    const specGrowths = character.specialization && SPEC_STAT_GROWTHS[character.class] 
      ? SPEC_STAT_GROWTHS[character.class][character.specialization] 
      : undefined;
    
    const growths = specGrowths || baseGrowths;
    
    // Sort growths to find highest priority stats
    const sortedStats = (Object.keys(growths) as Array<keyof CombatStats>).sort((a, b) => (growths[b] || 0) - (growths[a] || 0));
    
    const newDist: Partial<CombatStats> = { str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 };
    let tempRemaining = totalAvailable;
    
    // Distribute among top 2 stats, 70% to primary, 30% to secondary
    if (sortedStats.length >= 2) {
      const primary = sortedStats[0];
      const secondary = sortedStats[1];
      const primaryAmount = Math.floor(tempRemaining * 0.7);
      const secondaryAmount = tempRemaining - primaryAmount;
      newDist[primary] = primaryAmount;
      newDist[secondary] = secondaryAmount;
    } else if (sortedStats.length === 1) {
      newDist[sortedStats[0]] = tempRemaining;
    }

    setDistributedFreeStats(newDist);
  };

  const handleSave = () => {
    const combinedStats = { ...character.stats };
    const keys = ['str', 'sta', 'agi', 'dex', 'int', 'wis', 'cha'] as const;
    keys.forEach(k => {
      combinedStats[k] = Math.round(((combinedStats[k] || 0) + (distributedFreeStats[k] || 0)) * 10) / 10;
    });
    onSave(combinedStats, remainingFreePoints);
    setIsOpen(false);
    setDistributedFreeStats({
      str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0
    });
  };

  const handleReset = () => {
     // Stub for resetting attributes (just an alert for now, because we need back-end or complex logic to re-calculate everything minus auto stats)
     alert(language === 'ru' ? "Сброс атрибутов будет стоить 100 Сфер Забвения. Эта функция в разработке." : "Attribute reset will cost 100 Orbs of Oblivion. This feature is in development.");
  };

  const StatIcon = ({ type }: { type: keyof CombatStats }) => {
    switch (type) {
      case 'str': return <Swords className="w-4 h-4 text-orange-400" />;
      case 'sta': return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'agi': return <Wind className="w-4 h-4 text-amber-400" />;
      case 'dex': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'int': return <Brain className="w-4 h-4 text-sky-400" />;
      case 'wis': return <Star className="w-4 h-4 text-purple-400" />;
      default: return <Heart className="w-4 h-4 text-rose-400" />;
    }
  };

  const statNames = {
    str: language === 'ru' ? 'Сила' : 'Strength',
    sta: language === 'ru' ? 'Выносливость' : 'Stamina',
    agi: language === 'ru' ? 'Ловкость' : 'Agility',
    dex: language === 'ru' ? 'Сноровка' : 'Dexterity',
    int: language === 'ru' ? 'Интеллект' : 'Intelligence',
    wis: language === 'ru' ? 'Дух' : 'Wisdom',
    cha: language === 'ru' ? 'Харизма' : 'Charisma',
  };

  return (
    <>
      <div className="mt-4 p-3 bg-slate-950/60 border border-slate-700/50 rounded-lg flex flex-col gap-2">
        <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">Свободные очки</span>
            <span className={`text-sm font-black font-mono ${totalAvailable > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
              {totalAvailable}
            </span>
        </div>
        
        <div className="flex gap-2">
           <button 
             onClick={() => setIsOpen(true)}
             disabled={totalAvailable === 0}
             className="flex-1 bg-slate-800 hover:bg-amber-600/90 disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-800 text-slate-300 py-1.5 rounded border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
           >
             <Settings2 className="w-3 h-3" /> Распределить
           </button>
           <button 
             onClick={handleReset}
             className="px-2.5 bg-slate-900 hover:bg-rose-900/40 text-slate-500 hover:text-rose-400 border border-slate-800 hover:border-rose-900/50 rounded transition-colors"
             title={language === 'ru' ? "Сброс атрибутов" : "Reset Attributes"}
           >
             <RefreshCw className="w-3 h-3" />
           </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] max-w-sm w-full overflow-hidden relative">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center">
               <h3 className="font-serif text-xl font-bold text-amber-500">Распределение очков</h3>
               <span className="text-lg font-black text-amber-400 font-mono bg-slate-950 px-3 py-1 rounded border border-slate-800">
                  {remainingFreePoints}
               </span>
            </div>

            <div className="p-5 overflow-auto max-h-[60vh] space-y-2">
               <button 
                 onClick={applyOptimal}
                 className="w-full mb-4 bg-sky-900/20 hover:bg-sky-900/40 border border-sky-500/30 rounded py-2 px-3 flex items-center justify-center gap-2 text-sky-400 text-xs font-bold uppercase transition-colors"
               >
                  <Sparkles className="w-3.5 h-3.5" /> Оптимальное Распределение (Авто)
               </button>

              {(['str', 'sta', 'agi', 'int', 'wis'] as Array<keyof CombatStats>).map(k => (
                <div key={k} className="flex items-center justify-between bg-slate-800/50 p-2.5 rounded border border-slate-700/50">
                   <div className="flex items-center gap-2.5">
                       <StatIcon type={k} />
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-slate-200">{statNames[k]}</span>
                         <span className="text-[10px] text-emerald-500/70 font-mono font-bold">{character.stats[k]}</span>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <button 
                       disabled={(distributedFreeStats[k] || 0) === 0}
                       onClick={() => handleStatDecrement(k)}
                       className="w-7 h-7 rounded-sm bg-slate-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-500 transition-colors cursor-pointer"
                     >-</button>
                     <span className="font-mono text-amber-400 font-bold w-4 text-center text-sm">{distributedFreeStats[k] || 0}</span>
                     <button
                       disabled={remainingFreePoints === 0}
                       onClick={() => handleStatIncrement(k)}
                       className="w-7 h-7 rounded-sm bg-slate-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors cursor-pointer"
                     >+</button>
                   </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
               <button
                 onClick={() => {
                   setIsOpen(false);
                   setDistributedFreeStats({str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0});
                 }}
                 className="flex-1 py-2.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold uppercase"
               >
                 Отмена
               </button>
               <button
                 onClick={handleSave}
                 disabled={totalUsed === 0}
                 className="flex-1 py-2.5 rounded border border-emerald-500/40 bg-slate-800 text-slate-200 hover:text-slate-950 hover:bg-emerald-600/90 transition-colors text-xs font-bold uppercase shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
               >
                 <Save className="w-3.5 h-3.5" /> Сохранить
               </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
