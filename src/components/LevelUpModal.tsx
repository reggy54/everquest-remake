import React, { useState } from 'react';
import { PlayerCharacter, CombatStats, CharacterClass } from '../types';
import { CLASS_STAT_GROWTHS, SPEC_STAT_GROWTHS, FREE_STATS_PER_LEVEL } from '../data/classGrowths';
import { Sparkles, Save, Shield, Swords, Zap, RefreshCw, Flame, Brain, Heart, Wind, Star } from 'lucide-react';

interface LevelUpModalProps {
  character: PlayerCharacter;
  newLevel: number;
  onConfirm: (autoStats: Partial<CombatStats>, freeStats: Partial<CombatStats>) => void;
  language: 'ru' | 'en';
}

export default function LevelUpModal({ character, newLevel, onConfirm, language }: LevelUpModalProps) {
  const [step, setStep] = useState(1);
  
  // Auto stats calculated based on spec if available, otherwise base class
  const baseGrowths = CLASS_STAT_GROWTHS[character.class as CharacterClass] || CLASS_STAT_GROWTHS['Warrior'];
  const specGrowths = character.specialization && SPEC_STAT_GROWTHS[character.class] 
    ? SPEC_STAT_GROWTHS[character.class][character.specialization] 
    : undefined;
  
  const growths = specGrowths || baseGrowths;
  
  const autoStats: Partial<CombatStats> = {
    str: Math.round((growths.str || 0) * 10) / 10,
    sta: Math.round((growths.sta || 0) * 10) / 10,
    agi: Math.round((growths.agi || 0) * 10) / 10,
    dex: Math.round((growths.dex || 0) * 10) / 10,
    int: Math.round((growths.int || 0) * 10) / 10,
    wis: Math.round((growths.wis || 0) * 10) / 10,
    cha: Math.round((growths.cha || 0) * 10) / 10,
  };

  const [distributedFreeStats, setDistributedFreeStats] = useState<Partial<CombatStats>>({
    str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0
  });

  const totalUsed = Object.values(distributedFreeStats).reduce((a, b) => (a || 0) + (b || 0), 0);
  const remainingFreePoints = FREE_STATS_PER_LEVEL - totalUsed;

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] max-w-sm w-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-[50px] pointer-events-none" />
        
        {step === 1 && (
          <div className="p-6 text-center animate-slide-up">
            <div className="mx-auto w-16 h-16 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(245,158,11,0.4)] relative">
               <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            
            <h2 className="font-serif text-2xl font-bold text-amber-500 mb-2 drop-shadow-md">Новый Уровень!</h2>
            <p className="text-slate-300 mb-6 font-mono font-bold tracking-widest uppercase bg-slate-800 py-1 border-y border-slate-700">Уровень {newLevel}</p>
            
            <div className="text-left space-y-4 mb-6">
               <div className="text-[10px] font-mono text-amber-500/70 uppercase tracking-widest font-bold">Путь Судьбы: {character.class} {character.specialization ? `- ${character.specialization}` : ''}</div>
               
               <div className="bg-slate-950 rounded p-3 border border-slate-800 shadow-inner">
                 <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                    {(Object.keys(autoStats) as Array<keyof CombatStats>).map(k => {
                      if (!autoStats[k]) return null;
                      return (
                        <div key={k} className="flex items-center justify-between">
                           <div className="flex items-center gap-1.5 opacity-70">
                              <StatIcon type={k} />
                              <span className="text-xs">{statNames[k]}</span>
                           </div>
                           <span className="font-mono text-emerald-400 font-bold">+{autoStats[k]}</span>
                        </div>
                      )
                    })}
                 </div>
               </div>
            </div>
            
            <button
               onClick={() => setStep(2)}
               className="w-full bg-slate-800 hover:bg-amber-600/90 text-slate-200 hover:text-slate-950 py-3 rounded-lg border border-amber-500/40 text-xs font-bold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
               Продолжить <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 animate-slide-up">
            <h3 className="font-serif text-xl font-bold text-amber-500 mb-1">Свободные очки</h3>
            <p className="text-[11px] text-slate-400 mb-4 whitespace-nowrap">Распределите для корректировки билда</p>
            
            <div className="bg-slate-950 p-2 rounded flex justify-between items-center border border-slate-800 mb-4">
              <span className="text-xs uppercase font-mono text-slate-500">Доступно:</span>
              <span className={`text-lg font-bold font-mono ${remainingFreePoints > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>{remainingFreePoints}</span>
            </div>

            <div className="space-y-2 mb-6">
              {(['str', 'sta', 'agi', 'int', 'wis'] as Array<keyof CombatStats>).map(k => (
                <div key={k} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700/50">
                   <div className="flex items-center gap-2">
                       <StatIcon type={k} />
                       <div className="flex flex-col">
                         <span className="text-sm text-slate-200">{statNames[k]}</span>
                         <span className="text-[9px] text-emerald-500/70 font-mono">Авто: +{autoStats[k] || 0}</span>
                       </div>
                   </div>
                   
                   <div className="flex items-center gap-3">
                     <button 
                       disabled={(distributedFreeStats[k] || 0) === 0}
                       onClick={() => handleStatDecrement(k)}
                       className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-500 transition-colors"
                     >-</button>
                     <span className="font-mono text-amber-400 font-bold w-4 text-center">{distributedFreeStats[k] || 0}</span>
                     <button
                       disabled={remainingFreePoints === 0}
                       onClick={() => handleStatIncrement(k)}
                       className="w-6 h-6 rounded bg-slate-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
                     >+</button>
                   </div>
                </div>
              ))}
            </div>

            <button
               onClick={() => onConfirm(autoStats, distributedFreeStats)}
               disabled={remainingFreePoints > 0}
               className="w-full bg-slate-800 hover:bg-emerald-600/90 text-slate-200 hover:text-slate-950 py-3 rounded-lg border border-emerald-500/40 text-xs font-bold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:text-slate-200"
            >
               <Save className="w-4 h-4" /> Принять
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
