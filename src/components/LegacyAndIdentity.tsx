import React, { useState } from 'react';
import { PlayerCharacter, LegacyData } from '../types';
import { Star, Shield, Trophy, FileText, Crown, Map, Heart, Users, BookOpen, Settings } from 'lucide-react';

interface LegacyAndIdentityProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export default function LegacyAndIdentity({ character, onUpdateCharacter, triggerAlert }: LegacyAndIdentityProps) {
  const legacy = character.legacy;
  if (!legacy) return <div className="text-white p-4">Наследие еще не пробудилось (Legacy data missing).</div>;

  const activeTitle = character.visualCustomization?.title || '';
  
  const handleSelectTitle = (title: string) => {
    onUpdateCharacter({
      ...character,
      visualCustomization: {
        ...(character.visualCustomization || { hairStyle: '', hairColor: '', skinType: '', transmogs: {} as any, title: '' }),
        title
      }
    } as any);
    triggerAlert(`Установлен титул: ${title}`, 'success');
  };

  const toggleVeteranMode = () => {
    const updated = { ...character };
    updated.legacy = {
      ...updated.legacy!,
      veteranMode: !updated.legacy!.veteranMode
    };
    onUpdateCharacter(updated);
    if (!updated.legacy!.veteranMode) {
      triggerAlert('Режим Ветерана отключен. Возвращено стандартное количество ежедневных заданий.', 'info');
    } else {
      triggerAlert('Активирован Режим Ветерана! Вы будете получать меньше ежедневных заданий, но награды будут выше.', 'success');
    }
  };

  const accountAgeDays = Math.floor((Date.now() - legacy.createdAt) / (1000 * 60 * 60 * 24));
  const isVeteranMonth = accountAgeDays >= 365;

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="bg-slate-900 border border-amber-900/40 rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px]" />
        
        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-amber-500/50 flex items-center justify-center shrink-0 relative z-10">
          <Crown className="w-10 h-10 text-amber-500 drop-shadow-md" />
        </div>
        
        <div className="flex-1 relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
              {activeTitle ? `${activeTitle} ` : ''}
            </span>
            {character.name}
          </h2>
          <p className="text-sm font-mono text-slate-400 mt-1">Очков Наследия: <span className="text-amber-400 font-bold">{legacy.legacyPoints}</span> | Возраст в Этерии: <span className="text-emerald-400">{accountAgeDays} дн.</span></p>

          {isVeteranMonth && (
            <div className="mt-3 inline-flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-700/50 uppercase font-mono text-[10px] text-amber-500 font-bold rounded-full">
                <Star className="w-3 h-3" />
                Легенда Этерии (Ветеран Обретенного Света)
              </div>
              
              <button 
                onClick={toggleVeteranMode}
                className={`inline-flex items-center gap-1.5 px-3 py-1 border uppercase font-mono text-[10px] font-bold rounded-full transition-colors ${legacy.veteranMode ? 'bg-indigo-950/40 border-indigo-700/50 text-indigo-400 hover:bg-indigo-900/50' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
              >
                <Settings className="w-3 h-3" />
                Режим Ветерана: {legacy.veteranMode ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Titles / Легенда Этерии */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 shadow-sm">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h3 className="font-serif font-bold text-white">Летопись Титулов</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {legacy.titles.map((title, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg flex items-center justify-between cursor-pointer border transition-colors ${activeTitle === title ? 'bg-indigo-950/40 border-indigo-700/50' : 'bg-slate-950/50 border-slate-800 hover:border-indigo-900/50'}`}
                onClick={() => handleSelectTitle(title)}
              >
                <div className="font-mono text-sm font-bold text-slate-200">
                  {title}
                </div>
                {activeTitle === title && (
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded">Активен</span>
                )}
              </div>
            ))}
            {legacy.titles.length === 0 && (
              <p className="text-slate-500 text-xs font-mono text-center py-4">Нет доступных титулов.</p>
            )}
            
            {/* Locked Veteran Title example */}
            {!legacy.titles.includes('Разломный Страж') && (
              <div className="p-3 rounded-lg flex items-center justify-between border border-slate-800 bg-slate-950/30 opacity-60">
                <div className="w-full">
                  <div className="font-mono text-sm font-bold text-slate-400 flex items-center gap-2">
                    Разломный Страж (Год игры)
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full" style={{ width: `${Math.min(100, (accountAgeDays / 365) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Museum of Achievements */}
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 shadow-sm">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-white">Музей Достижений</h3>
             </div>
             <span className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-500 bg-amber-950/50 border border-amber-900">Выполнено: {legacy.achievements.length}</span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {legacy.achievements.map((ach) => (
              <div key={ach.id} className="p-3 bg-slate-950 border border-amber-900/30 rounded-lg flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 bg-slate-900 border border-amber-500/50 rounded flex items-center justify-center text-lg">{ach.icon || '🏆'}</div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-400 font-sans">{ach.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-tight">{ach.description}</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-2">Получено: {new Date(ach.dateUnlocked).toLocaleDateString()}</p>
                  </div>
              </div>
            ))}
            {legacy.achievements.length === 0 && (
              <div className="text-center py-6 px-4 bg-slate-950 border border-slate-800 rounded-lg">
                <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-xs font-mono">Ваша личная галерея пуста. Великие дела еще впереди.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Memory and Blood Ties blocks */}
        <div className="space-y-6">
           {/* Кровные узы (Blood Ties) */}
           <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 shadow-sm">
             <div className="border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-rose-500" />
                <h3 className="font-serif font-bold text-white">Кровные Узы</h3>
             </div>
             {(!legacy.bloodTies || legacy.bloodTies.length === 0) ? (
               <div className="text-center py-4 px-4 bg-slate-950 border border-slate-800 rounded-lg">
                 <Heart className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                 <p className="text-slate-500 text-xs font-mono">Вы еще не разделили свою судьбу с другим героем или компаньоном.</p>
               </div>
             ) : (
               <div className="space-y-2">
                 {legacy.bloodTies.map((tieName, idx) => (
                   <div key={idx} className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-lg flex items-center gap-3">
                     <Heart className="w-4 h-4 text-rose-500 shrink-0 fill-rose-500" />
                     <span className="font-bold text-slate-200 text-sm">Спутник Судьбы: <span className="text-rose-400">{tieName}</span></span>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Воспоминания (Memories) */}
           <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 shadow-sm">
             <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <BookOpen className="w-5 h-5 text-emerald-400" />
                   <h3 className="font-serif font-bold text-white">Воспоминания</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-500 bg-emerald-950/50 border border-emerald-900">{(legacy.memories || []).length}</span>
             </div>
             
             <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
               {(!legacy.memories || legacy.memories.length === 0) ? (
                  <div className="text-center py-4 px-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-slate-500 text-xs font-mono">Здесь будут храниться самые значимые моменты вашей истории.</p>
                  </div>
               ) : (
                 legacy.memories.map(mem => (
                    <div key={mem.id} className="p-3 bg-slate-950 border border-emerald-900/20 rounded-lg">
                      <h4 className="text-sm font-bold text-emerald-400 mb-1">{mem.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed italic">"{mem.text}"</p>
                      <div className="mt-2 text-[9px] text-slate-500 font-mono">
                         {new Date(mem.date).toLocaleDateString()}
                      </div>
                    </div>
                 ))
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
