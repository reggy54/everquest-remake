import React, { useState } from 'react';
import { PlayerCharacter, CompanionDef, CompanionState } from '../types';
import { Heart, Shield, Swords, Star, MessageCircle, HeartHandshake, UserPlus, Gift } from 'lucide-react';

interface CompanionsCampProps {
  character: PlayerCharacter;
  onUpdateCharacter: (char: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  notifyPlayerImpact?: (actionType: string, details: string) => void;
}

export const COMPANIONS_DB: CompanionDef[] = [
  { id: 'liria', name: 'Лирия Светлая', race: 'Высшая Эльфийка', charClass: 'Жрец', personality: 'Идеалистка', role: 'Healer', description: 'Верит в свет и спасение каждой души. Мощный хил.', icon: '🧝‍♀️', romanceable: true },
  { id: 'kragg', name: 'Крагг Железный', race: 'Дварф', charClass: 'Воин', personality: 'Грубый, честный', role: 'Tank', description: 'Честь и крепкий щит для него превыше всего.', icon: '🧔', romanceable: false },
  { id: 'silvara', name: 'Сильвара', race: 'Лунный Дух', charClass: 'Рейнджер', personality: 'Загадочная', role: 'DPS', description: 'Дитя ночного леса, разящее без промаха.', icon: '🏹', romanceable: true },
  { id: 'zarif', name: 'Зариф', race: 'Тёмный Эльф', charClass: 'Маг', personality: 'Циничный', role: 'Mage DPS', description: 'Ищет запретных знаний любой ценой.', icon: '🧛', romanceable: true },
  { id: 'torin', name: 'Торин', race: 'Драконорождённый', charClass: 'Шаман', personality: 'Прямолинейный', role: 'Bruiser', description: 'Голос бури и ярость пламени.', icon: '🐉', romanceable: false },
  { id: 'mirak', name: 'Мирак', race: 'Конструкт', charClass: 'Призыватель', personality: 'Логичный', role: 'Support', description: 'Машина, задающая слишком много вопросов.', icon: '🤖', romanceable: false },
  { id: 'velaris', name: 'Веларис', race: 'Человек', charClass: 'Паладин', personality: 'Благородный', role: 'Hybrid', description: 'Несет свет в самые тёмные уголки мира.', icon: '🛡️', romanceable: true },
  { id: 'nira', name: 'Нира', race: 'Орчиха', charClass: 'Разбойница', personality: 'Хитрая', role: 'Burst DPS', description: 'Её верность стоит дорого, но окупается в бою.', icon: '🥷', romanceable: true },
];

export default function CompanionsCamp({ character, onUpdateCharacter, triggerAlert, notifyPlayerImpact }: CompanionsCampProps) {
  const charCompanions = character.companions || {};
  
  // Base setup if empty
  if (Object.keys(charCompanions).length === 0) {
    COMPANIONS_DB.forEach(c => {
       charCompanions[c.id] = { id: c.id, loyalty: 0, unlocked: false };
    });
    // Let's grant the first companion implicitly to ensure player has one
    charCompanions['liria'].unlocked = true;
    charCompanions['kragg'].unlocked = true;
  }

  const [activeCompanionInfo, setActiveCompanionInfo] = useState<CompanionDef>(COMPANIONS_DB[0]);

  const toggleUnlock = (comp: CompanionDef) => {
    const compState = charCompanions[comp.id] || { id: comp.id, loyalty: 0, unlocked: false };
    const isNowUnlocked = !compState.unlocked;
    
    const updated = {
      ...character,
      companions: {
        ...charCompanions,
        [comp.id]: {
          ...compState,
          unlocked: isNowUnlocked
        }
      }
    };
    
    // If we locked the currently active one, remove them
    if (!isNowUnlocked && character.activeCompanion === comp.id) {
       updated.activeCompanion = null;
    }
    
    onUpdateCharacter(updated);
    
    if (isNowUnlocked) {
      triggerAlert(`${comp.name} присоединяется к вашему отряду!`, 'success');
      if (notifyPlayerImpact) notifyPlayerImpact("Новый союзник", `NPC по имени ${comp.name} (${comp.charClass}) присоединился к отряду героя.`);
    }
  };

  const setAsActive = (compId: string) => {
    onUpdateCharacter({
      ...character,
      activeCompanion: compId
    });
    const def = COMPANIONS_DB.find(c => c.id === compId);
    triggerAlert(`${def?.name} теперь ваш активный компаньон!`, 'info');
  };

  const giftCompanion = (comp: CompanionDef) => {
    if (character.gold < 15) {
      triggerAlert('У вас недостаточно золота для подарка (нужно 15).', 'error');
      return;
    }
    
    const compState = charCompanions[comp.id];
    if (!compState.unlocked) return;
    
    const increment = 10 + Math.floor(Math.random() * 5);
    const newLoyalty = Math.min(100, compState.loyalty + increment);
    
    const updated = {
      ...character,
      gold: character.gold - 15,
      companions: {
        ...charCompanions,
        [comp.id]: {
          ...compState,
          loyalty: newLoyalty
        }
      }
    };
    onUpdateCharacter(updated);
    triggerAlert(`Вы подарили подарок ${comp.name}. Верность +${increment}!`, 'success');
  };

  const renderLoyaltyBar = (loyalty: number) => {
    let color = 'bg-slate-500';
    if (loyalty > 25) color = 'bg-blue-500';
    if (loyalty > 50) color = 'bg-emerald-500';
    if (loyalty > 75) color = 'bg-amber-500';
    if (loyalty >= 100) color = 'bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]';

    return (
      <div className="w-full bg-slate-900 border border-slate-700 h-2 rounded mt-1 overflow-hidden shrink-0">
        <div className={`h-full transition-all duration-500 ${color}`} style={{ width: `${loyalty}%` }} />
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6 shadow-xl">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-2xl font-bold text-amber-500 flex items-center gap-2">
            <HeartHandshake className="h-6 w-6" /> Лагерь Компаньонов
          </h3>
          <p className="text-[11px] text-slate-400 font-mono mt-1 w-full max-w-xl">
            Спутники путешествуют вместе с вами, помогают в боях, реагируют на мировые события и развивают собственную историю. Повышайте их верность.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Roster List */}
        <div className="md:col-span-5 space-y-2">
          {COMPANIONS_DB.map(comp => {
            const state = charCompanions[comp.id] || { loyalty: 0, unlocked: false };
            const isActive = character.activeCompanion === comp.id;
            
            return (
              <div 
                key={comp.id}
                onClick={() => setActiveCompanionInfo(comp)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex gap-3 items-center ${
                  activeCompanionInfo?.id === comp.id ? 'bg-slate-800 border-amber-500/50' : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                } ${isActive ? 'ring-1 ring-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : ''}`}
              >
                <div className={`text-2xl h-10 w-10 flex items-center justify-center rounded-lg border ${state.unlocked ? 'bg-slate-800 border-slate-700' : 'bg-slate-950 border-slate-900 opacity-50 grayscale'}`}>
                  {comp.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                     <span className={`font-bold text-sm truncate ${state.unlocked ? 'text-slate-200' : 'text-slate-600'}`}>{comp.name}</span>
                     {isActive && <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-900/50">В партии</span>}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">{comp.charClass} | {comp.role}</div>
                  {state.unlocked && renderLoyaltyBar(state.loyalty)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Companion Details View */}
        <div className="md:col-span-7">
          {activeCompanionInfo && (
            <div className="bg-slate-950 rounded-xl border border-slate-800 h-full flex flex-col overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Shield className="w-48 h-48" />
              </div>
              
              <div className="p-6 flex-1 flex flex-col z-10">
                <div className="flex gap-4 items-start border-b border-slate-800 pb-5 mb-5">
                  <div className="text-5xl bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
                    {activeCompanionInfo.icon}
                  </div>
                  <div>
                    <h4 className="font-serif text-2xl font-bold text-slate-100 flex items-center gap-2">
                       {activeCompanionInfo.name}
                       {activeCompanionInfo.romanceable && <span title="Возможен роман"><Heart className="w-4 h-4 text-pink-500" /></span>}
                    </h4>
                    <span className="text-xs uppercase tracking-widest font-mono text-amber-500 block">
                      {activeCompanionInfo.race} • {activeCompanionInfo.charClass}
                    </span>
                    <p className="text-sm text-slate-400 mt-2 italic border-l-2 border-slate-700 pl-3">
                      "{activeCompanionInfo.personality}"
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-auto">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono mb-1">Боевая Роль</span>
                    <div className="text-sm text-slate-200 flex items-center gap-2">
                      <Swords className="w-4 h-4 text-slate-400" /> {activeCompanionInfo.role}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono mb-1">Досье / История</span>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                      {activeCompanionInfo.description}
                    </p>
                  </div>
                  
                  {charCompanions[activeCompanionInfo.id]?.unlocked && (
                     <div className="pt-4 border-t border-slate-850">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono mb-1 flex items-center gap-2">
                           <Star className="w-3 h-3 text-amber-500" /> Уровень Верности (Лояльность)
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-amber-400 font-mono">{charCompanions[activeCompanionInfo.id].loyalty}</span>
                          <div className="flex-1">
                            {renderLoyaltyBar(charCompanions[activeCompanionInfo.id].loyalty)}
                          </div>
                        </div>
                     </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-8 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
                  {!charCompanions[activeCompanionInfo.id]?.unlocked ? (
                    <button 
                       onClick={() => toggleUnlock(activeCompanionInfo)}
                       className="col-span-2 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 py-3 rounded text-xs font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Разблокировать компаньона (DEV)
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          if (character.activeCompanion !== activeCompanionInfo.id) {
                            setAsActive(activeCompanionInfo.id);
                          } else {
                            onUpdateCharacter({ ...character, activeCompanion: null });
                          }
                        }}
                        className={`py-3 rounded font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${
                          character.activeCompanion === activeCompanionInfo.id 
                           ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' 
                           : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-700 text-emerald-400'
                        }`}
                      >
                         <Shield className="w-4 h-4" /> {character.activeCompanion === activeCompanionInfo.id ? 'Отпустить в лагерь' : 'Взять в отряд'}
                      </button>
                      
                      <button 
                        onClick={() => giftCompanion(activeCompanionInfo)}
                        className="bg-purple-950 hover:bg-purple-900 py-3 rounded border border-purple-700 text-purple-300 font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                      >
                         <Gift className="w-4 h-4" /> Подарок (15G)
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
