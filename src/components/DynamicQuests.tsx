import React, { useState } from 'react';
import { BrainCircuit, BookOpen, Fingerprint, Sparkles, AlertTriangle, Target } from 'lucide-react';
import { PlayerCharacter, Quest } from '../types';

interface DynamicQuestsProps {
  character: PlayerCharacter;
  zone: string;
  addQuest: (quest: Quest) => void;
}

export default function DynamicQuests({ character, zone, addQuest }: DynamicQuestsProps) {
  const [loading, setLoading] = useState(false);
  const [generatedQuests, setGeneratedQuests] = useState<Quest[]>([]);

  // Mocking AI Generation based on recent player's context.
  const generateQuests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/dynamic-quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: character.name,
          charClass: character.class,
          race: character.race,
          level: character.level,
          zone: zone,
          recentActions: `Current gold: ${character.gold}. Inventory slots mostly empty. Health: ${character.hp}/${character.maxHp}. Mana: ${character.mana}/${character.maxMana}. Active companion: ${character.activeCompanion ? character.activeCompanion : 'None'}.`
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.quests) {
           const formattedQuests = data.quests.map((q: any, i: number) => ({
             id: `ai-quest-${Date.now()}-${i}`,
             title: q.title || "Динамическое задание",
             giver: q.giver || "ИИ-Режиссёр",
             status: 'active' as const,
             description: q.description || "Анализ ситуации завершён.",
             objective: q.objective || "Следуйте инструкциям.",
             progressCurrent: 0,
             progressRequired: 3,
             rewardGold: q.rewardGold || 100,
             rewardExp: q.rewardExp || 200,
           }));
           setGeneratedQuests(formattedQuests);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-950/40 to-slate-900 border border-purple-900/50 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-900/40 rounded shadow-inner border border-purple-500/30">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-purple-300 font-bold font-serif text-lg tracking-wider uppercase">ИИ-Режиссёр Заданий</h3>
            <p className="text-xs text-slate-400 font-mono">Анализ ваших действий в мире Этерии</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 italic mb-4">
          Динамическая система квестов отслеживает ваши перемещения, бои, экономические траты и отношения с фракциями, 
          создавая уникальные, персонализированные поручения специально для вас.
        </p>
        <button 
          onClick={generateQuests} 
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest text-xs px-6 py-2.5 rounded shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Fingerprint className="w-4 h-4" />}
          {loading ? 'Анализ судьбы...' : 'Сгенерировать личные квесты'}
        </button>
      </div>

      {generatedQuests.length > 0 && (
        <div className="space-y-4 animate-fade-in duration-500">
           <h4 className="text-[10px] font-mono font-bold uppercase text-slate-500 border-b border-slate-800 pb-1">
             Сформированные ИИ поручения:
           </h4>
           {generatedQuests.map((q) => (
             <div key={q.id} className="bg-slate-950 border border-purple-900/30 rounded-lg p-4 group hover:border-purple-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <div>
                     <h5 className="font-serif text-amber-400 font-bold text-lg">{q.title}</h5>
                     <span className="text-[10px] uppercase font-mono text-purple-500 tracking-wider block mb-2">{q.giver}</span>
                   </div>
                   <Target className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                </div>
                
                <p className="text-xs text-slate-400 italic mb-4">{q.description}</p>
                
                <div className="bg-slate-900 rounded p-3 text-xs font-mono space-y-2 border border-slate-800">
                  <div className="flex justify-between text-slate-300">
                     <span className="uppercase text-[10px] text-slate-500">Цель:</span>
                     <span>{q.objective}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                     <span className="uppercase text-[10px] text-slate-500">Награды:</span>
                     <span className="text-amber-500 font-bold">{q.rewardGold}g <span className="text-slate-600 mx-1">|</span> <span className="text-cyan-500">{q.rewardExp}xp</span></span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                   <button 
                     onClick={() => {
                        addQuest(q);
                        setGeneratedQuests(prev => prev.filter(quest => quest.id !== q.id));
                     }}
                     className="bg-amber-600/90 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2 text-xs uppercase tracking-wider rounded cursor-pointer transition-transform active:scale-95"
                   >
                     Принять Вызов
                   </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
