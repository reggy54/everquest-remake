import React, { useState } from 'react';
import { Shield, BookOpen, Crown, MapPin, Users, Hexagon, Star, Castle, BookText } from 'lucide-react';
import { PlayerCharacter } from '../types';

interface GuildLandsAndLegendsProps {
  character: PlayerCharacter;
  guild: any;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export default function GuildLandsAndLegends({ character, guild, triggerAlert }: GuildLandsAndLegendsProps) {
  // Local state for interactive elements (would be persisted in a real backend, using state for preview)
  const [activeTab, setActiveTab] = useState<'lands' | 'legends'>('lands');
  const [holdings, setHoldings] = useState([
    { id: '1', name: 'Сумрачный Удел', type: 'village', income: 15, level: 1 },
    { id: '2', name: 'Рудники Кейноса', type: 'mine', income: 30, level: 2 },
  ]);

  const [legends, setLegends] = useState([
    { id: '1', date: 'Год назад', title: `Основание Гильдии`, description: `Одинокий странник основал братство ${guild.name}.` },
    { id: '2', date: '6 месяцев назад', title: 'Первая Кровь', description: 'Триумфально отбили атаку на Высший Перевал.' },
  ]);

  const handleUpgradeHolding = (id: string, name: string) => {
    if (character.gold < 100) {
      triggerAlert('Недостаточно личного золота для инвестиций в гильдию. Нужно 100.', 'error');
      return;
    }
    
    setHoldings(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, level: h.level + 1, income: h.income + 15 };
      }
      return h;
    }));
    triggerAlert(`Вы инвестировали 100 золота в Развитие Владения "${name}". Уровень повышен!`, 'success');
  };

  const handleAddLegend = () => {
    if (character.gold < 50) {
      triggerAlert('Летописец требует 50 золота за запись новых свершений.', 'error');
      return;
    }
    const newLegend = {
      id: Date.now().toString(),
      date: 'Сегодня',
      title: `${character.name} пишет историю`,
      description: `Герой ${character.name} добавил новую славную страницу в анналы гильдии ${guild.name}. Мы живы и полны сил!`
    };
    setLegends([newLegend, ...legends]);
    triggerAlert('Новая запись добавлена в Летопись Гильдии!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit mb-6">
        <button
          onClick={() => setActiveTab('lands')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
            activeTab === 'lands' ? 'bg-amber-600/90 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Владения
        </button>
        <button
          onClick={() => setActiveTab('legends')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all ${
            activeTab === 'legends' ? 'bg-indigo-600/90 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookText className="w-3.5 h-3.5" /> Летопись
        </button>
      </div>

      {activeTab === 'lands' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-amber-950/20 border border-amber-900/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
            <h3 className="text-xl font-black text-amber-500 mb-2 relative z-10 flex items-center gap-2">
              <Castle className="w-5 h-5" /> Гильдейские Земли
            </h3>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl relative z-10">
              Гильдия может контролировать и развивать поселения, рудники и крепости в мире Норрата, 
              получая стабильный доход и уникальные ресурсы. Ветеранские гильдии оставляют свой след в экономике мира.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holdings.map(holding => (
              <div key={holding.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 shadow-sm space-y-4 relative group">
                 <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-lg">{holding.name}</h4>
                      <p className="text-[10px] uppercase font-mono text-slate-400 mt-1">{holding.type === 'village' ? 'Поселение' : 'Ресурсный узел'}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-950 border border-amber-900/40 rounded flex items-center justify-center font-black text-amber-500 shadow-inner">
                      Lvl {holding.level}
                    </div>
                 </div>
                 
                 <div className="bg-slate-950 rounded p-3 text-xs font-mono text-slate-400 flex justify-between items-center border border-slate-800">
                    <span>Доход в день:</span>
                    <span className="text-yellow-500 font-bold">+{holding.income} 💰</span>
                 </div>

                 <button
                    onClick={() => handleUpgradeHolding(holding.id, holding.name)}
                    className="w-full py-2 bg-amber-950/40 hover:bg-amber-900 border border-amber-700/50 rounded text-amber-400 text-[10px] uppercase font-bold tracking-wider transition-colors"
                 >
                    Развить (100 золота)
                 </button>
              </div>
            ))}
            
            <div className="bg-slate-900/40 border border-dashed border-slate-700/50 rounded-xl p-5 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity">
               <Hexagon className="w-8 h-8 text-slate-600 mb-3" />
               <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest">
                 Захватите больше территорий в PvP осадах
               </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'legends' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
             
             <div className="flex justify-between items-end border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-indigo-400 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Анналы Свершений
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Долгосрочная история вашей гильдии, записанная на века.</p>
                </div>
                <button
                  onClick={handleAddLegend}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider font-mono transition-colors"
                >
                  Записать подвиг (50 зол)
                </button>
             </div>

             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                {legends.map((leg, index) => (
                  <div key={leg.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     
                     {/* Timeline Dot */}
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-indigo-950 text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                        <Star className="w-4 h-4" />
                     </div>
                     
                     {/* Content Card */}
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-950/80 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="font-bold text-slate-100 text-sm">{leg.title}</h4>
                           <span className="text-[9px] uppercase font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 relative rounded border border-indigo-900/50">{leg.date}</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           {leg.description}
                        </p>
                     </div>

                  </div>
                ))}
             </div>

          </div>
        </div>
      )}
    </div>
  );
}
