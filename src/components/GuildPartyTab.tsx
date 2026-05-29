import React, { useState } from 'react';
import { PlayerCharacter, Guild } from '../types';
import { Shield, Sword, Trophy, Hammer, MapPin, Database, Compass, Sparkles, Flag, Crown, Swords, BookOpen, Eye, Award } from 'lucide-react';

interface GuildPartyTabProps {
  character: PlayerCharacter;
  guild: Guild | null;
  language: 'ru' | 'en';
}

export default function GuildPartyTab({ character, guild, language }: GuildPartyTabProps) {
  const [guildSubTab, setGuildSubTab] = useState<'management' | 'pve' | 'pvp' | 'craft' | 'lands'>('management');
  const [selectedCrest, setSelectedCrest] = useState<number>(0);

  // Hardcode dummy guild info for now since state lifted from App.tsx
  const guildHonor = 1250;
  const guildResources = { ore: 450, wood: 1200, herbs: 300 };

  const crestOptions = [
    { icon: Flag, name: language === 'ru' ? 'Классический Герб' : 'Classic Banner' },
    { icon: Shield, name: language === 'ru' ? 'Щит Гильдии' : 'Guild Shield' },
    { icon: Crown, name: language === 'ru' ? 'Корона над Разломом' : 'Rift Crown' },
    { icon: Swords, name: language === 'ru' ? 'Скрещённые Мечи' : 'Crossed Swords' },
    { icon: BookOpen, name: language === 'ru' ? 'Открытая Книга с Рунами' : 'Rune Book' },
    { icon: Eye, name: language === 'ru' ? 'Око Разлома' : 'Rift Eye' },
    { icon: Award, name: language === 'ru' ? 'Герб с Лаврами' : 'Laurel Crest' },
    { icon: Hammer, name: language === 'ru' ? 'Молот и Наковальня' : 'Hammer & Anvil' }
  ];

  const getSubTabLabel = (sub: string) => {
    const labels: Record<string, string> = {
      management: language === 'ru' ? 'Штаб / Состав' : 'Roster / Management',
      pve: language === 'ru' ? 'PvE Рейды' : 'PvE Raids',
      pvp: language === 'ru' ? 'PvP Осады' : 'PvP Sieges',
      craft: language === 'ru' ? 'Экономика & Крафт' : 'Economy & Craft',
      lands: language === 'ru' ? 'Земли и Летопись' : 'Lands & Lore',
    };
    return labels[sub] || sub;
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-100 w-full col-span-1 lg:col-span-4 max-w-[1200px] mx-auto pb-24">
      {/* Guild Header and Subtabs */}
      <div className="bg-[#171c26] border-[4px] border-[#2b3548] rounded-xl p-5 shadow-[0_20px_60px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none mix-blend-overlay" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {guild && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse border border-amber-900" />}
              <h4 className="font-serif text-2xl font-black text-[#d8c3a5] uppercase tracking-widest drop-shadow-[2px_2px_0_#000]">
                {guild ? `[${guild.tag}] ${guild.name}` : (language === 'ru' ? 'Игровые Гильдии Этерии' : 'Guilds of Etheria')}
              </h4>
            </div>
            <p className="text-sm text-[#8c7a6b] font-mono leading-relaxed max-w-xl">
              {guild ? (language === 'ru' ? `Уровень развития гильдии: ${guild.level} • Честь: ${guildHonor} • Влияние в мире` : `Guild Level: ${guild.level} • Honor: ${guildHonor} • World Influence`) 
              : (language === 'ru' ? 'Основывайте гильдии, собирайте группы союзников и боритесь за замки' : 'Found guilds, gather allies, and fight for castles')}
            </p>
          </div>
          {guild && (
            <div className="flex flex-wrap gap-3 text-xs bg-[#0f1219] border-2 border-[#2b3548] rounded-lg p-3 font-mono text-amber-400 shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-1.5 border-r border-[#2b3548] pr-3 mr-1">
                <Database className="h-4 w-4 text-amber-500" />
                <span className="text-[#64748b]">{language === 'ru' ? 'РУДА:' : 'ORE:'} <strong className="text-slate-200">{guildResources.ore}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 border-r border-[#2b3548] pr-3 mr-1">
                <Compass className="h-4 w-4 text-emerald-400" />
                <span className="text-[#64748b]">{language === 'ru' ? 'ДЕРЕВО:' : 'WOOD:'} <strong className="text-slate-200">{guildResources.wood}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-[#64748b]">{language === 'ru' ? 'ТРАВЫ:' : 'HERBS:'} <strong className="text-slate-200">{guildResources.herbs}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Subtab Navigation Buttons */}
        {guild && (
          <div className="flex border-t-2 border-[#2b3548] mt-6 pt-2 flex-wrap gap-1">
            {(['management', 'pve', 'pvp', 'craft', 'lands'] as const).map((sub) => (
              <button
                key={sub}
                onClick={() => setGuildSubTab(sub)}
                className={`mt-2 px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-2 border-[2px] ${
                  guildSubTab === sub
                    ? 'bg-[#3b82f6] text-white border-[#60a5fa] shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-[#121620] text-[#64748b] border-[#2b3548] hover:text-[#94a3b8] hover:border-[#475569]'
                }`}
              >
                {sub === 'management' && <Shield className="h-4 w-4" />}
                {sub === 'pve' && <Sword className="h-4 w-4" />}
                {sub === 'pvp' && <Trophy className="h-4 w-4" />}
                {sub === 'craft' && <Hammer className="h-4 w-4" />}
                {sub === 'lands' && <MapPin className="h-4 w-4" />}
                {getSubTabLabel(sub)}
              </button>
            ))}
          </div>
        )}
      </div>

      {!guild ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create guild promo */}
          <div className="bg-[#171c26] border-[3px] border-[#2b3548] rounded-xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[300px]">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10 pointer-events-none mix-blend-overlay" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-[#d8c3a5] font-serif flex items-center gap-3 border-b-2 border-[#2b3548] pb-4 mb-4">
                <Shield className="h-6 w-6 text-[#a68c70]" />
                {language === 'ru' ? 'Основание Гильдии' : 'Found a Guild'}
              </h3>
              <p className="text-sm text-[#8c7a6b] mb-6 leading-relaxed font-serif">
                {language === 'ru' 
                  ? 'Соберите единомышленников под единым знаменем. Гильдии позволяют захватывать территории, строить замки и участвовать в массовых сражениях за Разлом.' 
                  : 'Gather like-minded allies under a single banner. Guilds allow you to capture territories, build castles, and participate in massive battles for the Rift.'}
              </p>
              <div className="space-y-4">
                 <div className="bg-[#0f1219] p-3 border border-[#2b3548] rounded-lg">
                    <div className="text-xs text-[#a68c70] font-bold uppercase mb-1">{language === 'ru' ? 'Название Гильдии' : 'Guild Name'}</div>
                    <input type="text" className="w-full bg-transparent border-none text-[#d8c3a5] focus:outline-none focus:ring-0 placeholder-[#475569] font-serif" placeholder={language === 'ru' ? 'Например: Стражи Разлома' : 'E.g. Rift Guardians'} />
                 </div>
                 <div className="bg-[#0f1219] p-3 border border-[#2b3548] rounded-lg">
                    <div className="text-xs text-[#a68c70] font-bold uppercase mb-1">{language === 'ru' ? 'Тег (Аббревиатура)' : 'Guild Tag'}</div>
                    <input type="text" maxLength={4} className="w-full bg-transparent border-none text-[#d8c3a5] focus:outline-none focus:ring-0 placeholder-[#475569] font-serif uppercase" placeholder={language === 'ru' ? 'СТР' : 'RIFT'} />
                 </div>
                 
                 <div className="bg-[#0f1219] p-3 border border-[#2b3548] rounded-lg">
                    <div className="text-xs text-[#a68c70] font-bold uppercase mb-2">{language === 'ru' ? 'Символ Гильдии' : 'Guild Crest'}</div>
                    <div className="grid grid-cols-4 gap-2">
                      {crestOptions.map((crest, idx) => {
                         const CrestIcon = crest.icon;
                         const isSelected = selectedCrest === idx;
                         return (
                           <button
                             key={idx}
                             onClick={() => setSelectedCrest(idx)}
                             title={crest.name}
                             className={`relative aspect-square rounded-md border-2 transition-all flex items-center justify-center overflow-hidden
                               ${isSelected 
                                 ? 'bg-[#2a241f] border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                                 : 'bg-[#1a1714] border-[#3d2e1f] hover:border-[#a68c70]'}`}
                           >
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-30 pointer-events-none" />
                              {isSelected && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600/70 blur-[1px]" />}
                              <CrestIcon 
                                className={`relative z-10 h-6 w-6 transition-all ${isSelected ? 'text-[#fef08a] scale-110 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]' : 'text-[#8c7a6b]'}`} 
                              />
                           </button>
                         )
                      })}
                    </div>
                    <div className="text-center mt-2 text-xs font-serif text-[#d8c3a5] italic drop-shadow-[1px_1px_0_#000]">
                       {crestOptions[selectedCrest].name}
                    </div>
                 </div>
              </div>
            </div>
            <button className="relative z-10 w-full mt-6 bg-gradient-to-b from-[#b45309] to-[#78350f] hover:brightness-125 border-2 border-[#d97706] text-white font-bold py-3 rounded text-sm uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all">
              {language === 'ru' ? 'Создать Хартию (10,000 Золота)' : 'Create Charter (10,000 Gold)'}
            </button>
          </div>

          {/* Join guild list */}
          <div className="bg-[#171c26] border-[3px] border-[#2b3548] rounded-xl flex flex-col overflow-hidden h-[450px]">
            <div className="p-5 border-b-[2px] border-[#2b3548] bg-gradient-to-b from-[#1b2233] to-[#171c26]">
              <h3 className="text-xl font-bold text-[#d8c3a5] font-serif flex items-center gap-3">
                <Trophy className="h-6 w-6 text-[#a68c70]" />
                {language === 'ru' ? 'Топ Гильдий Нората' : 'Top Guilds'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3 relative">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-10 pointer-events-none" />
              {[
                { tag: 'СВЕТ', name: 'Орден Золотого Льва', level: 24, owner: 'Утер', crestUrl: crestOptions[1].icon },
                { tag: 'ТЬМА', name: 'Тени Назжатара', level: 21, owner: 'Иллидан', crestUrl: crestOptions[5].icon },
                { tag: 'ФАРМ', name: 'Стая Воргенов', level: 18, owner: 'Генн', crestUrl: crestOptions[3].icon },
                { tag: 'ВОЕК', name: 'Кузня Крови', level: 15, owner: 'Гаррош', crestUrl: crestOptions[7].icon },
                { tag: 'ЛОР', name: 'Искатели Истины', level: 12, owner: 'Кадгар', crestUrl: crestOptions[4].icon }
              ].map((g, i) => {
                const Crest = g.crestUrl;
                return (
                <div key={i} className="group flex items-center justify-between bg-[#121620] border border-[#2b3548] hover:border-[#4a5f8c] p-3 rounded-lg transition-all cursor-pointer relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 border-2 border-[#3a4863] rounded flex flex-col items-center justify-center text-[#a5b4fc] bg-[#1b2233] shadow-inner overflow-hidden top-guild-shield">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-30 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600/40 blur-[1px]" />
                      <Crest className="h-5 w-5 mb-0.5 text-[#d8c3a5] mix-blend-screen drop-shadow-[0_1px_1px_rgba(0,0,0,1)]" />
                      <span className="font-black text-[9px] font-mono leading-none">{g.tag}</span>
                    </div>
                    <div>
                      <div className="font-bold text-[#e2e8f0] font-serif group-hover:text-white transition-colors">{g.name}</div>
                      <div className="text-[10px] text-[#64748b] font-mono mt-0.5">Лидер: {g.owner}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#3b82f6]">УР {g.level}</div>
                    <button className="text-[10px] text-[#94a3b8] hover:text-[#e2e8f0] uppercase font-bold mt-1 bg-[#1b2233] px-2 py-0.5 rounded border border-[#2b3548]">
                      Заявка
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full text-center text-slate-400 py-10 italic">
          {/* Here we will put the roster logic later */}
          [ В разработке : Интерфейс гильдии ]
        </div>
      )}
    </div>
  );
}
