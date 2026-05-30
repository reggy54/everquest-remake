import React, { useState, useEffect } from 'react';
import { PlayerCharacter, CharacterClass } from '../types';
import { SPEC_STAT_GROWTHS } from '../data/classGrowths';
import { Shield, Swords, Skull, Flame, Zap, Wind, Eye, Droplet, Moon, Sun, Ghost, Target, Heart, Crosshair } from 'lucide-react';

interface SpecializationModalProps {
  character: PlayerCharacter;
  onSelect: (spec: string) => void;
  language: 'ru' | 'en';
}

const SPEC_DATA: Record<string, { id: string; name: string; desc: string; icon: string; traits: string[]; color: string }[]> = {
  'Warrior': [
    { id: 'Берсерк', name: 'Берсерк', desc: 'Ярость — твоё оружие. Разрывай врагов в вихре стали и крови.', icon: 'flame', traits: ['Высокий burst-урон', 'Мощные AoE', 'Агрессивный стиль'], color: 'text-red-500' },
    { id: 'Рыцарь', name: 'Рыцарь', desc: 'Дисциплина и честь. Контролируй поле боя и защищай союзников.', icon: 'swords', traits: ['Контроль', 'Мобильность', 'Баланс урона и защиты'], color: 'text-amber-500' },
    { id: 'Страж', name: 'Страж', desc: 'Стань непоколебимой стеной. Принимай на себя весь гнев врагов.', icon: 'shield', traits: ['Высокая выживаемость', 'Провокация', 'Защита группы'], color: 'text-zinc-300' }
  ],
  'Mage': [
    { id: 'Элементалист', name: 'Элементалист', desc: 'Повелевай силами природы. Огонь, лёд и молния — твои союзники.', icon: 'flame', traits: ['Высокий AoE-урон', 'Контроль стихиями', 'Взрывной урон'], color: 'text-orange-500' },
    { id: 'Аркан', name: 'Аркан', desc: 'Магия чистой энергии. Манипулируй реальностью и временем.', icon: 'eye', traits: ['Burst-урон', 'Контроль', 'Мобильность'], color: 'text-purple-400' },
    { id: 'Некромант', name: 'Некромант', desc: 'Восстанавливай мёртвых. Пусть твои враги служат тебе после смерти.', icon: 'skull', traits: ['DoT-урон', 'Призывы', 'Самолечение'], color: 'text-green-500' }
  ],
  'Ranger': [
    { id: 'Охотник', name: 'Охотник', desc: 'Следи, лови, убивай. Ты — хозяин дикой природы.', icon: 'target', traits: ['Ловушки', 'Питомцы', 'Sustained урон'], color: 'text-emerald-500' },
    { id: 'Стрелок', name: 'Стрелок', desc: 'Скорость и точность. Один выстрел — один труп.', icon: 'crosshair', traits: ['Высокая мобильность', 'Burst-урон на расстоянии', 'Пробивание брони'], color: 'text-sky-400' },
    { id: 'Природный Страж', name: 'Природный Страж', desc: 'Защищай леса. Природа сама встанет на твою сторону.', icon: 'wind', traits: ['Поддержка', 'Контроль', 'Хороший урон'], color: 'text-green-400' }
  ],
  'Priest': [
    { id: 'Светоносец', name: 'Светоносец', desc: 'Несёшь свет и надежду. Исцеляй и защищай.', icon: 'sun', traits: ['Мощное лечение', 'Щиты', 'Поддержка'], color: 'text-yellow-300' },
    { id: 'Теневой Целитель', name: 'Теневой Целитель', desc: 'Исцеляй через боль. Тьма тоже может спасать.', icon: 'moon', traits: ['Лечение + урон', 'DoT', 'Гибрид'], color: 'text-purple-500' },
    { id: 'Балансёр', name: 'Балансёр', desc: 'Свет и Тьма в равновесии. Ты — мост между ними.', icon: 'eye', traits: ['Гибридный стиль', 'Универсальность', 'Поддержка'], color: 'text-blue-300' }
  ],
  'Rogue': [
    { id: 'Убийца', name: 'Убийца', desc: 'Один удар. Одна смерть.', icon: 'skull', traits: ['Высокий burst', 'Стелс', 'Смертоносность'], color: 'text-red-600' },
    { id: 'Теневой Танцор', name: 'Теневой Танцор', desc: 'Ты — тень. Быстрый, неуловимый, смертоносный.', icon: 'wind', traits: ['Мобильность', 'Уклонение', 'Комбо'], color: 'text-zinc-400' },
    { id: 'Механик', name: 'Механик', desc: 'Ловушки, яды и хитрость — твоё оружие.', icon: 'target', traits: ['Контроль', 'DoT', 'Подготовка'], color: 'text-amber-500' }
  ],
  'Summoner': [
    { id: 'НекроРомант', name: 'Некромант', desc: 'Повелитель мёртвых. Поднимай легионы нежити.', icon: 'skull', traits: ['Призыв нежити', 'Проклятия', 'Массовый урон'], color: 'text-green-500' },
    { id: 'Демонолог', name: 'Демонолог', desc: 'Заключай сделки с Бездной. Твои слуги разрушительны.', icon: 'flame', traits: ['Мощные демоны', 'Жертвоприношения', 'Бурстовый урон'], color: 'text-rose-600' },
    { id: 'Хранитель душ', name: 'Хранитель душ', desc: 'Светлая связь с духами предков.', icon: 'ghost', traits: ['Помощь группе', 'Исцеляющие духи', 'Ауры'], color: 'text-teal-400' }
  ],
  'Paladin': [
    { id: 'Крестоносец', name: 'Крестоносец', desc: 'Неси свет в самые тёмные уголки мира.', icon: 'sun', traits: ['Святой урон', 'Помощь союзникам', 'Баланс Силы и Духа'], color: 'text-yellow-400' },
    { id: 'Храмовник', name: 'Храмовник', desc: 'Абсолютный защитник веры и непоколебимый щит.', icon: 'shield', traits: ['Мощная защита', 'Ауры поддержки', 'Высокая Выносливость'], color: 'text-blue-400' },
    { id: 'Инквизитор', name: 'Инквизитор', desc: 'Сжигай ересь огнём и мечом. Никто не уйдёт от суда.', icon: 'flame', traits: ['Агрессивный урон', 'Очищающее пламя', 'Высокий урон по соло-цели'], color: 'text-rose-400' }
  ],
  'Shaman': [
    { id: 'Шаман Стихий', name: 'Стихийный', desc: 'Ярость самой природы. Обрушь гром и молнии.', icon: 'zap', traits: ['Гроза и молнии', 'Взрывной урон', 'Силы природы'], color: 'text-sky-500' },
    { id: 'Шаман Крови', name: 'Шаман Крови', desc: 'Жертвуй собой ради силы. Кровь — величайший ресурс.', icon: 'droplet', traits: ['Магия крови', 'Вампиризм', 'Ближний бой'], color: 'text-red-500' },
    { id: 'Шаман Духов', name: 'Шаман Духов', desc: 'Проводник между мирами. Зови предков на помощь.', icon: 'ghost', traits: ['Тотемный контроль', 'Поддержка группы', 'Защита'], color: 'text-indigo-400' }
  ],
  'Death Knight': [
    { id: 'Вестник Смерти', name: 'Вестник Смерти', desc: 'Неси смерть каждому живому.', icon: 'skull', traits: ['Огромный урон', 'Жатва душ', 'Темная магия'], color: 'text-gray-400' },
    { id: 'Владыка Крови', name: 'Владыка Крови', desc: 'Кровь врагов сделает тебя бессмертным.', icon: 'droplet', traits: ['Бессмертие', 'Вампиризм', 'Сверх-выживаемость'], color: 'text-red-600' },
    { id: 'Рыцарь Мороза', name: 'Рыцарь Мороза', desc: 'Холод сковывает сердца твоих врагов.', icon: 'wind', traits: ['Крио-урон', 'Замедление врагов', 'Крепкая броня'], color: 'text-cyan-400' }
  ]
};

export default function SpecializationModal({ character, onSelect, language }: SpecializationModalProps) {
  const [phase, setPhase] = useState<'cinematic' | 'selection'>('cinematic');
  const [hoveredSpec, setHoveredSpec] = useState<string | null>(null);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);

  const specs = SPEC_DATA[character.class] || SPEC_DATA['Warrior'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('selection');
    }, 4000); // 4 seconds cinematic intro
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (iconName: string, extraClasses: string = 'w-10 h-10') => {
    const props = { className: `${extraClasses} filter drop-shadow-[0_0_8px_currentColor]` };
    switch (iconName) {
      case 'skull': return <Skull {...props} />;
      case 'swords': return <Swords {...props} />;
      case 'shield': return <Shield {...props} />;
      case 'sun': return <Sun {...props} />;
      case 'moon': return <Moon {...props} />;
      case 'flame': return <Flame {...props} />;
      case 'wind': return <Wind {...props} />;
      case 'zap': return <Zap {...props} />;
      case 'eye': return <Eye {...props} />;
      case 'ghost': return <Ghost {...props} />;
      case 'droplet': return <Droplet {...props} />;
      case 'heart': return <Heart {...props} />;
      case 'crosshair': return <Crosshair {...props} />;
      case 'target': return <Target {...props} />;
      default: return <Swords {...props} />;
    }
  };

  if (phase === 'cinematic') {
    return (
      <div className="fixed inset-0 z-[120] bg-black flex flex-col items-center justify-center overflow-hidden">
        {/* Epic cinematic background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
           <div className="w-[800px] h-[800px] bg-amber-900/40 rounded-full blur-[120px] animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        
        {/* Floating runes effect */}
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] mix-blend-overlay" />

        <div className="relative z-10 text-center animate-slide-up duration-1000 p-8 border-y-2 border-amber-900/50 bg-black/40 backdrop-blur-sm w-full">
           <div className="text-[#ffd700] font-serif text-3xl md:text-5xl lg:text-6xl mb-6 tracking-[0.2em] uppercase font-bold drop-shadow-[2px_2px_0_#000]" style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif', textShadow: '0 0 20px rgba(212,175,55,0.8), 2px 2px 4px #000' }}>
             {language === 'ru' ? 'Твой путь обрёл форму' : 'Your path takes shape'}
           </div>
           <p className="text-amber-200/80 text-lg md:text-xl font-bold italic animate-fade-in delay-1000 drop-shadow-[1px_1px_0_#000]">
             "{language === 'ru' ? 'Выбери, кем ты станешь в грядущей эпохе...' : 'Choose who you will become in the coming age...'}"
           </p>
        </div>

        {/* Cinematic Particles */}
        <div className="absolute inset-0 pointer-events-none">
           {[...Array(20)].map((_, i) => (
             <div 
               key={i} 
               className="absolute bg-amber-400/40 rounded-full blur-[1px] animate-[slide-up_3s_linear_infinite]"
               style={{
                 width: Math.random() * 4 + 2 + 'px',
                 height: Math.random() * 4 + 2 + 'px',
                 left: Math.random() * 100 + '%',
                 bottom: '-10%',
                 animationDelay: Math.random() * 3 + 's',
                 animationDuration: Math.random() * 2 + 2 + 's'
               }}
             />
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#06070a] flex flex-col overflow-hidden animate-fade-in select-none">
      {/* Background temple with runes */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-15 mix-blend-overlay z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#06070a] via-[#06070a]/90 to-transparent z-0 pointer-events-none" />
      
      {/* Central Framed Title - Non-scrolling with safe area */}
      <div className="relative z-10 text-center pt-6 pb-2 shrink-0 w-full px-4">
        <h2 className="text-[#ffd700] text-xl md:text-4xl lg:text-5xl flex items-center justify-center font-black uppercase tracking-[0.1em] drop-shadow-[2px_2px_4px_#000] relative px-4 lg:px-12 py-3 text-center" style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif', textShadow: '0 0 15px rgba(212,175,55,0.5)' }}>
          {language === 'ru' ? 'Выбор Пути' : 'Choose Your Path'}
        </h2>
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#8b6508] to-transparent mx-auto mt-1 opacity-60" />
      </div>

      {/* Swipe support indicator on mobile */}
      <div className="lg:hidden block text-center text-[10px] text-amber-200/50 uppercase tracking-widest font-mono shrink-0 py-1.5 z-10 animate-pulse">
        {language === 'ru' ? '← Пролистайте варианты свайпом →' : '← Swipe to browse options →'}
      </div>

      {/* Scrollable Container block */}
      <div className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar px-4 pb-24 pt-2 relative z-10 w-full flex flex-col items-center justify-start lg:justify-center">
        
        {/* Dynamic Card Area: Grid on lg/desktop; interactive horizontal carousel on md/mobile */}
        <div className="w-full max-w-7xl flex lg:grid lg:grid-cols-3 gap-5 lg:gap-8 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory lg:snap-none custom-scrollbar pb-6 lg:pb-0 px-2">
          {specs.map((spec, idx) => {
            const isActive = hoveredSpec === spec.id || selectedSpecId === spec.id;
            return (
              <div 
                key={spec.id}
                onClick={() => setSelectedSpecId(spec.id)}
                onMouseEnter={() => setHoveredSpec(spec.id)}
                onMouseLeave={() => setHoveredSpec(null)}
                className={`snap-center shrink-0 w-[82vw] sm:w-[350px] lg:w-auto flex flex-col items-center p-5 lg:p-7 border-4 relative overflow-hidden group cursor-pointer transition-all duration-300 rounded-xl lg:rounded-none select-none ${
                   isActive 
                     ? `border-[#d4af37] scale-[1.01] shadow-[0_0_35px_rgba(212,175,55,0.4)]` 
                     : 'border-[#3a2f26] hover:border-[#8b6508]'
                } bg-[#10121a]/95 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]`}
              >
                 {/* Rivets */}
                 <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border border-[#000]" />
                 <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border border-[#000]" />
                 <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border border-[#000]" />
                 <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border border-[#000]" />

                 {/* Glow Background */}
                 <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-b from-transparent to-[#d4af37] pointer-events-none mix-blend-overlay`} />

                 {/* Icon with Frame */}
                 <div className={`w-16 h-16 bg-[#111] border-2 border-[#3a2f26] shadow-[inset_0_0_15px_#000,0_4px_8px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-105 group-hover:border-[#d4af37] relative shrink-0`}>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30 mix-blend-screen pointer-events-none" />
                    <div className={`filter drop-shadow-[0_0_10px_currentColor] z-10 ${spec.color}`}>
                       {getIcon(spec.icon, 'w-9 h-9')}
                    </div>
                 </div>
                 
                 <h3 className="text-xl lg:text-2xl font-black uppercase tracking-widest mb-1.5 drop-shadow-[2px_2px_0_#000] text-center" style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif', color: isActive ? '#ffd700' : '#e5c07b' }}>
                    {spec.name}
                 </h3>
                 
                 <p className="text-[#ccc] text-center text-xs lg:text-sm mb-4 min-h-[3.2rem] w-full pb-2 leading-relaxed drop-shadow-[1px_1px_0_#000] line-clamp-3 overflow-hidden" style={{ fontFamily: 'Georgia, serif' }}>
                    "{spec.desc}"
                 </p>

                 {/* Decorative separator */}
                 <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#8b6508] to-transparent mb-4 shrink-0 opacity-75" />

                 {/* Feature list */}
                 <div className="w-full space-y-2 mb-4 text-left px-1 flex-1">
                   {spec.traits.map((trait, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-2.5 text-[#e2e8f0] font-sans text-[10px] lg:text-xs uppercase tracking-wide drop-shadow-[1px_1px_0_#000]">
                        <div className={`w-1.5 h-1.5 rotate-45 border border-[#8b6508] shadow-[0_0_5px_rgba(212,175,55,0.8)] ${spec.color.replace('text-', 'bg-')}`} />
                        <span className="truncate">{trait}</span>
                      </div>
                   ))}
                 </div>
                 
                 {/* Compact Action Panel */}
                 <div className="w-full mt-auto flex justify-center relative z-10 pt-3 border-t border-[#3a2f26] shrink-0">
                   {selectedSpecId === spec.id ? (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         onSelect(spec.id);
                       }}
                       className="btn-classic px-7 py-2.5 text-xs font-bold uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.6)] cursor-pointer"
                     >
                       {language === 'ru' ? 'Подтвердить' : 'Confirm'}
                     </button>
                   ) : (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedSpecId(spec.id);
                       }}
                       className={`w-full py-2.5 border text-[10px] font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_8px_rgba(0,0,0,0.8)] cursor-pointer ${
                         isActive 
                           ? `btn-classic scale-[1.02]` 
                           : 'bg-[#121212] text-[#aaa] border-[#312a20] hover:text-white hover:border-[#5c4a3d]'
                       }`}
                     >
                       {language === 'ru' ? 'Выбрать' : 'Choose'}
                     </button>
                   )}
                 </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
