import React, { useState } from 'react';
import { Calendar, Clock, Globe, Shield, Swords, Map, Sparkles, Flame, Droplet, BrainCircuit, Flag, Leaf, Snowflake, Activity } from 'lucide-react';

interface WorldEventsCalendarProps {
  language?: 'ru' | 'en';
}

export default function WorldEventsCalendar({ language = 'ru' }: WorldEventsCalendarProps) {
  const [tab, setTab] = useState<'current' | 'roadmap' | 'ai'>('roadmap');

  const currentEvents = [
    {
       name: language === 'ru' ? 'Падение Осколка' : 'Shardfall',
       frequency: language === 'ru' ? 'Каждые 90 мин' : 'Every 90 min',
       zone: language === 'ru' ? 'Долина Разбитых Звёзд' : 'Valley of Shattered Stars',
       type: 'cyclic',
       description: language === 'ru' ? 'С неба падает звездный осколок. Добудьте редкие ресурсы, пока их не захватили големы.' : 'A star shard falls from the sky. Gather rare resources before golems take them.',
       reward: language === 'ru' ? 'Редкая руда, Астральная пыль' : 'Rare Ore, Astral Dust',
       icon: <Sparkles className="w-5 h-5 text-amber-400" />
    },
    {
       name: language === 'ru' ? 'Нашествие Теней' : 'Shadow Invasion',
       frequency: language === 'ru' ? 'Каждые 2 часа' : 'Every 2 hours',
       zone: language === 'ru' ? 'Горный Хребет Вел’Дарион' : 'Vel\'Darion Mountain Ridge',
       type: 'cyclic',
       description: language === 'ru' ? 'Сотни теневых существ пытаются прорваться через ущелье. Защитите аванпост Хранителей!' : 'Hundreds of shadow creatures attempt to breach the gorge. Defend the Guardian Outpost!',
       reward: language === 'ru' ? 'Репутация фракции, Опыт' : 'Faction Reputation, XP',
       icon: <Shield className="w-5 h-5 text-purple-500" />
    },
    {
       name: language === 'ru' ? 'Поющая Буря' : 'Singing Storm',
       frequency: language === 'ru' ? 'Каждые 4 часа' : 'Every 4 hours',
       zone: language === 'ru' ? 'Пылающие Пустоши Аш’Кара' : 'Ash\'Kar Burning Wastes',
       type: 'dynamic',
       description: language === 'ru' ? 'Магический шторм меняет ландшафт пустыни на 15 минут, открывая древние сундуки в песках.' : 'A magical storm alters the desert landscape for 15 minutes, revealing ancient chests.',
       reward: language === 'ru' ? 'Золото, Экипировка' : 'Gold, Gear',
       icon: <Droplet className="w-5 h-5 text-sky-400" />
    },
    {
       name: language === 'ru' ? 'Пробуждение Древнего' : 'Awakening of the Ancient',
       frequency: language === 'ru' ? '1 раз в 6 часов' : 'Once every 6 hours',
       zone: language === 'ru' ? 'Бездна Под Миром' : 'Abyss Underworld',
       type: 'world_boss',
       description: language === 'ru' ? 'Мировой босс. Требует 20+ игроков для уничтожения. Древняя тварь поднимается из глубин.' : 'World Boss. Requires 20+ players. An ancient beast rises from the depths.',
       reward: language === 'ru' ? 'Эпическое Оружие, Редкие Маунты' : 'Epic Weapons, Rare Mounts',
       icon: <Shield className="w-5 h-5 text-red-500" />
    },
    {
       name: language === 'ru' ? 'Великий Разлом' : 'The Great Rift',
       frequency: language === 'ru' ? 'Раз в 2 недели' : 'Every 2 weeks',
       zone: language === 'ru' ? 'Центральный Разлом' : 'Central Rift',
       type: 'major',
       description: language === 'ru' ? 'Огромный портал открывается в центре мира. Фракции стягивают силы для защиты Этерии от легиона Бездны.' : 'A massive portal opens in the center of the world. Factions gather to defend Etheria.',
       reward: language === 'ru' ? 'Титаническая экипировка' : 'Titanic Gear',
       icon: <Globe className="w-5 h-5 text-rose-500" />
    },
    {
       name: language === 'ru' ? 'Война Фракций' : 'Faction War',
       frequency: language === 'ru' ? 'Раз в месяц' : 'Once a month',
       zone: language === 'ru' ? 'Глобально' : 'Global',
       type: 'pvp',
       description: language === 'ru' ? 'Глобальное PvP-сражение между фракциями Света, Баланса и Тьмы за контроль над узлами маны.' : 'Global PvP battle between Light, Balance, and Dark factions for control over mana nodes.',
       reward: language === 'ru' ? 'PvP-Титулы, Баффы для сервера на месяц' : 'PvP Titles, Global month-long buffs',
       icon: <Swords className="w-5 h-5 text-orange-500" />
    }
  ];

  const seasons = [
    {
      title: language === 'ru' ? 'Сезон 1: Пробуждение (Янв — Мар)' : 'Season 1: Awakening (Jan — Mar)',
      theme: language === 'ru' ? 'Возвращение древней магии после долгого сна.' : 'The return of ancient magic after a long slumber.',
      icon: <Sparkles className="w-8 h-8 text-sky-400" />,
      color: 'border-sky-800/50 bg-sky-950/20',
      mainEvent: language === 'ru' ? '«Великое Пробуждение» (Февраль)' : '"The Great Awakening" (February)',
      mainDesc: language === 'ru' ? '72-часовое глобальное событие. Центральный Разлом открывается полностью. Игроки защищают 12 ключевых точек.' : '72-hour global event. The Central Rift opens completely. Players defend 12 key points.',
      subEvents: language === 'ru' 
        ? ['Январь: «Кристаллическая Лихорадка» (сбор ресурсов + PvP)', 'Март: «Песнь Небесных Китов» (миграция ездовых китов)']
        : ['January: "Crystal Rush" (gathering + PvP)', 'March: "Song of the Sky Whales" (migration) भी']
    },
    {
      title: language === 'ru' ? 'Сезон 2: Раскол (Апр — Июн)' : 'Season 2: The Fracture (Apr — Jun)',
      theme: language === 'ru' ? 'Конфликт трёх фракций (Свет, Тьма, Баланс) обостряется.' : 'Conflict of three factions escalates.',
      icon: <Swords className="w-8 h-8 text-orange-400" />,
      color: 'border-orange-800/50 bg-orange-950/20',
      mainEvent: language === 'ru' ? '«Война Трёх Ликов» (Май)' : '"War of Three Faces" (May)',
      mainDesc: language === 'ru' ? 'Глобальное PvP+PvE событие на 1 неделю. Битва за контроль над Центральным Разломом.' : 'Global PvP+PvE event for 1 week. Battle for control over Central Rift.',
      subEvents: language === 'ru' 
        ? ['Апрель: «Ночь Раскола» (временные зоны с перевёрнутой гравитацией)', 'Июнь: «Суд Осколка» (персональные ИИ-испытания для топ-50 игроков)']
        : ['April: "Night of the Rift" (temporary zones with inverted gravity)', 'June: "Judgment of the Shard" (personal AI trials)']
    },
    {
      title: language === 'ru' ? 'Сезон 3: Цветение и Гниение (Июл — Сен)' : 'Season 3: Bloom and Rot (Jul — Sep)',
      theme: language === 'ru' ? 'Природа мира реагирует на действия игроков.' : 'Nature reacts to player actions.',
      icon: <Leaf className="w-8 h-8 text-emerald-400" />,
      color: 'border-emerald-800/50 bg-emerald-950/20',
      mainEvent: language === 'ru' ? '«Великий Расцвет» (Август)' : '"The Great Bloom" (August)',
      mainDesc: language === 'ru' ? 'Весь мир меняет визуальный стиль на 14 дней. Появление духов природы и гигантских растений.' : 'Entire world changes visual style for 14 days. Nature spirits appear.',
      subEvents: language === 'ru' 
        ? ['Июль: «Коррупция Разлома» (ИИ "заражает" зоны при оверфарминге)', 'Сентябрь: «Охота за Первым Древом» (масштабный кооперативный рейд)']
        : ['July: "Rift Corruption" (AI infects zones over-farmed by players)', 'September: "Hunt for the First Tree" (massive coop raid)']
    },
    {
      title: language === 'ru' ? 'Сезон 4: Падение Небес (Окт — Дек)' : 'Season 4: Skyfall (Oct — Dec)',
      theme: language === 'ru' ? 'Кульминация года. Мир перестраивается.' : 'Year culmination. The world restructures.',
      icon: <Snowflake className="w-8 h-8 text-purple-400" />,
      color: 'border-purple-800/50 bg-purple-950/20',
      mainEvent: language === 'ru' ? '«Падение Седьмого Неба» (Ноябрь)' : '"Fall of the Seventh Sky" (November)',
      mainDesc: language === 'ru' ? 'Самый масштабный ивент года. Огромный летающий континент падает. 10 дней эвакуации и финальная битва. Открытие нового континента.' : 'Biggest event of the year. Floating continent falls. 10 days of evacuation. New continent unlocks.',
      subEvents: language === 'ru' 
        ? ['Октябрь: «Праздник Мёртвых Звёзд»', 'Декабрь: «Зимнее Равноденствие» (зимние фестивальные награды)']
        : ['October: "Festival of Dead Stars"', 'December: "Winter Solstice" (winter rewards)']
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm animate-fade-in h-full relative flex flex-col">
      <div className="border-b border-slate-800 p-5 sticky top-0 bg-slate-900/90 backdrop-blur z-20 flex flex-col gap-4">
        <div>
           <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em] shadow-black drop-shadow-md">
             <Calendar className="h-6 w-6 text-emerald-500" />
             {language === 'ru' ? 'Дорожная Карта и События' : 'Roadmap & Events'}
           </h3>
           <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-widest pl-8">
             {language === 'ru' ? 'Живое Небо Этерии' : 'Living Sky of Etheria'}
           </p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2">
           <button 
             onClick={() => setTab('roadmap')}
             className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${tab === 'roadmap' ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
           >
             {language === 'ru' ? 'Годовой Roadmap' : 'Yearly Roadmap'}
           </button>
           <button 
             onClick={() => setTab('current')}
             className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors ${tab === 'current' ? 'bg-emerald-600/20 text-emerald-500 border border-emerald-600/50' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
           >
             {language === 'ru' ? 'Текущие События' : 'Current Events'}
           </button>
           <button 
             onClick={() => setTab('ai')}
             className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 ${tab === 'ai' ? 'bg-purple-600/20 text-purple-400 border border-purple-600/50' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800'}`}
           >
             <BrainCircuit className="w-3 h-3" /> {language === 'ru' ? 'ИИ Динамика' : 'AI Dynamics'}
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
        
        {tab === 'current' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {currentEvents.map((ev, i) => (
                 <div key={i} className="bg-slate-950/50 border border-slate-800 rounded-lg p-4 group hover:border-emerald-500/50 hover:bg-slate-900 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                       <div className="flex items-center gap-2">
                           <div className="bg-slate-800 p-2 rounded shrink-0 ring-1 ring-slate-700 flex items-center justify-center">
                               {ev.icon}
                           </div>
                           <div>
                               <h4 className="font-serif text-lg text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">{ev.name}</h4>
                               <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.frequency}</span>
                           </div>
                       </div>
                       <div className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-[10px] font-mono uppercase text-slate-300">
                          {ev.type}
                       </div>
                    </div>
                    
                    <div className="space-y-2 mt-4 text-sm">
                       <div className="flex gap-2 items-center text-slate-300 bg-slate-950 p-2 rounded">
                          <Map className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="text-xs uppercase font-bold tracking-widest">{ev.zone}</span>
                       </div>
                       <p className="text-slate-400 text-xs leading-relaxed border-l-2 border-slate-700 pl-3">
                          {ev.description}
                       </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
                       <span className="text-slate-500 uppercase tracking-widest text-[9px] block">{language === 'ru' ? 'Возможная награда:' : 'Possible Reward:'}</span>
                       <span className="font-bold text-amber-500 text-right block">{ev.reward}</span>
                    </div>
                 </div>
             ))}
          </div>
        )}

        {tab === 'roadmap' && (
          <div className="space-y-6">
             <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 flex items-start gap-4">
               <Globe className="w-10 h-10 text-amber-500 shrink-0 mt-1" />
               <div>
                  <h4 className="text-white font-serif text-lg tracking-wider mb-1">
                    {language === 'ru' ? 'Глобальный Контент-план' : 'Global Content Roadmap'}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                    {language === 'ru' 
                      ? 'Мир Этерии живёт сезонами. Каждый сезон длится 3 месяца, привнося масштабные мировые изменения, новые зоны и сюжетные арки, которые навсегда меняют ландшафт игры.' 
                      : 'The world of Etheria lives by seasons. Each season lasts 3 months, bringing massive world changes, new zones, and story arcs that permanently change the game landscape.'}
                  </p>
               </div>
             </div>

             <div className="grid grid-cols-1 gap-6 relative before:content-[''] before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800 ml-2">
                {seasons.map((season, i) => (
                  <div key={i} className={`relative pl-14`}>
                     <div className="absolute left-2 top-4 w-8 h-8 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center shrink-0 shadow-lg z-10">
                        {i + 1}
                     </div>
                     <div className={`bg-slate-950/50 border ${season.color} rounded-lg p-5`}>
                        <div className="flex items-center gap-4 mb-4">
                           {season.icon}
                           <div>
                              <h3 className="font-serif text-xl tracking-widest text-white">{season.title}</h3>
                              <p className="text-slate-400 text-sm italic">{season.theme}</p>
                           </div>
                        </div>

                        <div className="bg-slate-900/60 p-4 rounded border border-slate-800/80 mb-4">
                           <div className="flex items-center gap-2 mb-2">
                             <Flag className="w-4 h-4 text-rose-500" />
                             <span className="uppercase text-[10px] font-bold tracking-widest text-rose-400">
                               {language === 'ru' ? 'Главное Событие Сезона' : 'Main Event of the Season'}
                             </span>
                           </div>
                           <h4 className="text-lg text-rose-400 font-bold mb-1">{season.mainEvent}</h4>
                           <p className="text-xs text-slate-300 leading-relaxed">{season.mainDesc}</p>
                        </div>

                        <div className="pl-2 border-l border-slate-800 space-y-2">
                           {season.subEvents.map((sub, j) => (
                              <div key={j} className="text-xs text-slate-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block mr-2" />
                                {sub}
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {tab === 'ai' && (
          <div className="space-y-6">
             <div className="bg-gradient-to-br from-indigo-950/50 to-purple-950/50 border border-purple-800/30 rounded-xl p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
                <BrainCircuit className="w-16 h-16 text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                <h3 className="font-serif text-2xl text-white mb-2 tracking-widest uppercase">
                  {language === 'ru' ? 'Живое Небо Этерии (AI Директор)' : 'Living Sky of Etheria (AI Director)'}
                </h3>
                <p className="text-slate-300 leading-relaxed max-w-3xl mb-6">
                  {language === 'ru'
                    ? 'Система комбинирует запланированные сюжетные арки с процедурной генерацией ИИ-директора, который анализирует миллионы действий игроков и адаптирует мир в реальном времени.'
                    : 'The system combines planned story arcs with procedural AI Director generation, which analyzes millions of player actions and adapts the world in real-time.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="bg-black/40 border border-slate-800/80 p-4 rounded-lg">
                      <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> {language === 'ru' ? 'Анализ и Баланс' : 'Analysis & Balance'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'ru' 
                          ? 'ИИ следит за балансом фракций. Если одна фракция доминирует, ИИ генерирует "События сопротивления", помогая слабым. Если зону забросили игроки — ИИ спавнит там редкие ресурсы и мировых мини-боссов для привлечения внимания.'
                          : 'AI tracks faction balance. If one dominates, it spawns "Resistance Events". If a zone is abandoned, AI triggers rare resources there to pull players back.'}
                      </p>
                   </div>
                   <div className="bg-black/40 border border-slate-800/80 p-4 rounded-lg">
                      <h4 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" /> {language === 'ru' ? 'Экологическая реакция' : 'Ecological Reaction'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'ru' 
                          ? 'Если игроки слишком активно истребляют конкретный вид мобов или добывают лес, ИИ запускает событие "Гнев Природы", локально усиливая монстров или заражая руду.'
                          : 'Over-farming a monster type or forest makes AI trigger "Nature\'s Wrath", buffing monsters or corrupting ores in that area.'}
                      </p>
                   </div>
                   <div className="bg-black/40 border border-slate-800/80 p-4 rounded-lg md:col-span-2">
                      <h4 className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
                        <Flame className="w-4 h-4" /> {language === 'ru' ? 'Персонализированные Испытания' : 'Personalized Trials'}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {language === 'ru' 
                          ? 'В конце каждого года ИИ-директор генерирует уникальные, адаптированные под стиль игры финальные события для 1000 лучших игроков сервера. Топ-гильдии могут получить эксклюзивные испытания-осады, где ИИ-создаёт босса специально против их тактик.'
                          : 'At year-end, the AI generates unique final events for the top 1000 players based on their specific playstyles. Top guilds face custom AI bosses built specifically to counter their common raid tactics.'}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

