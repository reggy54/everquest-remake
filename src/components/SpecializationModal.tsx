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

  const getIcon = (iconName: string, colorClass: string) => {
    const props = { className: `w-12 h-12 ${colorClass} mb-4 filter drop-shadow-[0_0_10px_currentColor]` };
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
      case 'crosshair': return <Target {...props} />;
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
    <div className="fixed inset-0 z-[120] bg-black/80 flex flex-col items-center justify-center p-4 lg:p-12 overflow-hidden animate-fade-in relative">
      {/* Background temple with runes */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay z-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-0 pointer-events-none" />
      
      {/* Central Framed Title */}
      <div className="z-20 text-center mb-8 relative">
        <h2 className="text-[#ffd700] text-3xl md:text-5xl font-black uppercase tracking-[0.1em] drop-shadow-[2px_2px_4px_#000] relative px-12 py-4" style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif', textShadow: '0 0 20px rgba(212,175,55,0.6), 2px 2px 2px #000' }}>
          {language === 'ru' ? 'Выбор Пути' : 'Choose Your Path'}
          
          <div className="absolute top-0 left-0 bottom-0 right-0 border-y-2 border-[#8b6508] opacity-50 bg-gradient-to-r from-transparent via-[#8b6508] to-transparent pointer-events-none -z-10" style={{ mixBlendMode: 'overlay' }} />
        </h2>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 relative z-10 h-full max-h-[700px]">
        {specs.map((spec, idx) => (
          <div 
            key={spec.id}
            onMouseEnter={() => setHoveredSpec(spec.id)}
            onMouseLeave={() => setHoveredSpec(null)}
            className={`flex-1 flex flex-col items-center p-6 border-4 relative overflow-hidden group cursor-pointer transition-all duration-300 ${
               hoveredSpec === spec.id 
                 ? `border-[#d4af37] scale-[1.02] shadow-[0_0_40px_rgba(212,175,55,0.4)]` 
                 : 'border-metal hover:border-[#8b6508]'
            } bg-leather shadow-[inset_0_0_50px_rgba(0,0,0,0.9)]`}
          >
             {/* Rivets */}
             <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border-2 border-[#000]" />
             <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border-2 border-[#000]" />
             <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border-2 border-[#000]" />
             <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.3)] border-2 border-[#000]" />

             {/* Glow Background */}
             <div className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-b from-transparent to-[#d4af37] pointer-events-none mix-blend-overlay`} />

             {/* Icon with Frame */}
             <div className={`w-20 h-20 bg-[#111] border-2 border-[#333] shadow-[inset_0_0_20px_#000,0_4px_10px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:border-[#d4af37] relative`}>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30 mix-blend-screen pointer-events-none" />
                <div className={`filter drop-shadow-[0_0_10px_currentColor] z-10 ${spec.color}`}>
                   {getIcon(spec.icon, '')}
                </div>
             </div>
             
             <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-widest mb-2 drop-shadow-[2px_2px_0_#000] text-center`} style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif', color: hoveredSpec === spec.id ? '#ffd700' : '#e5c07b' }}>
                {spec.name}
             </h3>
             
             <p className="text-[#ccc] text-center text-sm mb-6 h-12 w-full pb-4 leading-normal drop-shadow-[1px_1px_0_#000]" style={{ fontFamily: 'Georgia, serif' }}>
                "{spec.desc}"
             </p>

             {/* Decorative separator */}
             <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#8b6508] to-transparent mb-6" />

             <div className="w-full space-y-3 mb-auto text-left px-2">
               {spec.traits.map((trait, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-3 text-[#e2e8f0] font-sans text-xs uppercase tracking-wide drop-shadow-[1px_1px_0_#000]">
                    <div className={`w-1.5 h-1.5 rotate-45 border border-[#8b6508] shadow-[0_0_5px_rgba(212,175,55,0.8)] ${spec.color.replace('text-', 'bg-')}`} />
                    {trait}
                  </div>
               ))}
             </div>
             
             <div className="w-full mt-6 flex justify-center relative z-10 pt-4 border-t border-[#333]">
               {selectedSpecId === spec.id ? (
                 <button 
                   onClick={() => onSelect(spec.id)}
                   className="btn-classic px-8 py-3 text-sm font-bold uppercase tracking-widest animate-pulse shadow-[0_0_20px_rgba(212,175,55,0.6)]"
                 >
                   {language === 'ru' ? 'Подтвердить Выбор' : 'Confirm Selection'}
                 </button>
               ) : (
                 <button 
                   onClick={() => setSelectedSpecId(spec.id)}
                   className={`w-full py-3 border text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_4px_10px_rgba(0,0,0,0.8)] ${
                     hoveredSpec === spec.id 
                       ? `btn-classic scale-105` 
                       : 'bg-[#1a1a1a] text-[#aaa] border-[#333] hover:text-white hover:border-[#555]'
                   }`}
                 >
                   {language === 'ru' ? 'Избрать этот Путь' : 'Choose This Path'}
                 </button>
               )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
