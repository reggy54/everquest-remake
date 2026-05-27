import React, { useState } from 'react';
import { PlayerCharacter, SlotType, TransmogPreset } from '../types';
import { Shield, Sparkles, User, RefreshCw, Layers, EyeOff, Eye, Wind, Flame, Star, Zap } from 'lucide-react';
import Character3DModel from './Character3DModel';

interface CosmeticSalonTransmogProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  notifyPlayerImpact?: (actionType: string, details: string) => void;
}

const TITLES = [
  'Скиталец', 'Гроза Монстров', 'Завоеватель Этернии', 'Легенда Арены',
  'Великий Мастер Ремесла', 'Истребитель Боссов', 'Друг Драконов', 'Вечный Искатель Сложного'
];

const HAIR_STYLES = ['Воинский узел', 'Ирокез Глашатая', 'Длинные кудри Эльфа', 'Бритая голова', 'Острие бури', 'Королевский пробор', 'Пышные дреды', 'Взрывной астрал'];

const HAIR_COLORS = [
  { name: 'Угольно-черный', class: 'bg-stone-900 border-stone-700' },
  { name: 'Платиновый блонд', class: 'bg-slate-100 border-stone-300' },
  { name: 'Огненно-рыжий', class: 'bg-amber-600 border-amber-500' },
  { name: 'Лесной каштан', class: 'bg-amber-900 border-amber-800' },
  { name: 'Аметистовый фиолетовый', class: 'bg-purple-600 border-purple-500' },
  { name: 'Изумрудно-зеленый', class: 'bg-emerald-600 border-emerald-500' },
  { name: 'Космический синий', class: 'bg-blue-600 border-blue-500' }
];

const SKIN_TYPES = ['Светлая', 'Загорелая', 'Эльфийская бледность', 'Пепельно-серый', 'Чешуйчатая (Рептилия)', 'Темная', 'Бронзовая'];

const TRANSMOG_SKINS: Record<SlotType, { name: string; desc: string }[]> = {
  head: [
    { name: 'Корона Солнечного Луча', desc: 'Сияющий золотой обруч героев' },
    { name: 'Шлем Гладиатора-Арены', desc: 'Устрашающий забралом стальной шлем' },
    { name: 'Капюшон Песчаного Волка', desc: 'Тайный кожаный убор ассасина' },
    { name: 'Маска Тайных Свиней', desc: 'Мистическое матерчатое прикрытие' }
  ],
  chest: [
    { name: 'Плащ Высшего Ордена', desc: 'Серебряный расшитый доспех эльфов' },
    { name: 'Кольчуга Вечного Пламени', desc: 'Тяжелый латный кокон из красной стали' },
    { name: 'Мантия Пожирателя Душ', desc: 'Рваные шелковые одежды темных магов' },
    { name: 'Камзол Королевского Мушкетера', desc: 'Изящное синее сукно с кожаными вставками' }
  ],
  hands: [
    { name: 'Рукавицы Твердой воли', desc: 'Стальные краги для сокрушительных ударов' },
    { name: 'Перчатки Астрального Вора', desc: 'Эластичные шелковые накладки с рунами' },
    { name: 'Браслеты Охотника за скальпами', desc: 'Шипованная медвежья кожа' }
  ],
  legs: [
    { name: 'Поножи Древнего Похода', desc: 'Чешуйчатый доспех с защитой коленей' },
    { name: 'Шаровары Песков времени', desc: 'Легкие шелковые штаны для дуэлянтов' },
    { name: 'Штаны Кровавого Вождя', desc: 'Кожаная броня, усиленная стальными заклепками' }
  ],
  feet: [
    { name: 'Сапоги Теневого Бега', desc: 'Бесшумная мягкая поступь ночи' },
    { name: 'Латные башмаки Крестоносца', desc: 'Тяжелая окованная сталь' },
    { name: 'Сандалии Горного Мудреца', desc: 'Легкая соломенная подошва для аскетов' }
  ],
  shoulders: [
    { name: 'Наплечники Грома', desc: 'Массивные стальные наплечники' },
    { name: 'Мантия Звездочета', desc: 'Пропитанная магией ткань' }
  ],
  waist: [
    { name: 'Ремень Несокрушимости', desc: 'Широкий пояс с рунной пряжкой' }
  ],
  cloak: [
    { name: 'Теневой Плащ', desc: 'Сливается с темнотой' },
    { name: 'Накидка Этернии', desc: 'Светящаяся накидка чемпионов' }
  ],
  amulet: [], ring1: [], ring2: [], fateFocus: [],
  primary: [
    { name: 'Пылающий Клинок Разрушителя', desc: 'Окутанный в красное пламя двуручный меч' },
    { name: 'Посох Архимага Эрудиции', desc: 'Длинное древко с парящим кристаллом маны' },
    { name: 'Кинжал Кровопускатель Синдзюку', desc: 'Кривой тонкий клинок, источающий яд' },
    { name: 'Молот Разрушителя Дворфов', desc: 'Массивный рунный обух из мифрила' }
  ],
  secondary: [
    { name: 'Щит Эгида Вечного Света', desc: 'Святой ростовой щит с изображением Грифона' },
    { name: 'Книга Древних Заклятий Торвина', desc: 'Обтянутый драконьей кожей старинный гримуар' },
    { name: 'Астральный Тотем Стихий', desc: 'Парящий череп мистического ворона' },
    { name: 'Шипованная Баклер-Тарелка', desc: 'Малый кулачный щит для контратак' }
  ]
};

const AURAS = [
  { id: 'aura_1', name: 'Сияние Света', desc: 'Светлая аура, дающая мягкое свечение.', color: 'text-yellow-200' },
  { id: 'aura_2', name: 'Пепел Бездны', desc: 'Темные частицы, парящие в воздухе.', color: 'text-purple-500' },
  { id: 'aura_3', name: 'Ледяная Буря', desc: 'Кружащиеся магические снежинки.', color: 'text-blue-300' },
  { id: 'aura_4', name: 'Огонь Ифрита', desc: 'Языки пламени, обнимающие персонажа.', color: 'text-red-500' }
];

const TRAILS = [
  { id: 'trail_1', name: 'Звездная пыль', desc: 'Оставляет за вами мерцающий след из звезд.' },
  { id: 'trail_2', name: 'Горящая земля', desc: 'Земля опаляется под вашими ногами.' },
  { id: 'trail_3', name: 'Тлеющие листья', desc: 'Осенние листья вихрятся при каждом шаге.' }
];

const PRESETS: TransmogPreset[] = [
  {
    id: 'p1', name: 'Тёмный Лорд', description: 'Облачение владыки бездны. Внушает страх вашим врагам.', icon: '🔮', author: 'Eternia System', hideHelmet: false, aura: 'Пепел Бездны', trail: 'Горящая земля',
    transmogs: { head: 'Капюшон Песчаного Волка', chest: 'Мантия Пожирателя Душ', hands: 'Браслеты Охотника за скальпами', waist: 'Ремень Несокрушимости', legs: 'Штаны Кровавого Вождя', feet: 'Сапоги Теневого Бега', cloak: 'Теневой Плащ', shoulders: 'Мантия Звездочета', primary: 'Пылающий Клинок Разрушителя', secondary: null, amulet: null, ring1: null, ring2: null, fateFocus: null }
  },
  {
    id: 'p2', name: 'Небесный Страж', description: 'Броня, сияющая светом правосудия.', icon: '🛡️', author: 'Eternia System', hideHelmet: false, aura: 'Сияние Света', trail: 'Звездная пыль',
    transmogs: { head: 'Корона Солнечного Луча', chest: 'Кольчуга Вечного Пламени', hands: 'Рукавицы Твердой воли', waist: 'Ремень Несокрушимости', legs: 'Поножи Древнего Похода', feet: 'Латные башмаки Крестоносца', cloak: 'Накидка Этернии', shoulders: 'Наплечники Грома', primary: 'Молот Разрушителя Дворфов', secondary: 'Щит Эгида Вечного Света', amulet: null, ring1: null, ring2: null, fateFocus: null }
  }
];

export default function CosmeticSalonTransmog({ character, onUpdateCharacter, triggerAlert, notifyPlayerImpact }: CosmeticSalonTransmogProps) {
  const customization = character.visualCustomization || {
    hairStyle: 'Воинский узел', hairColor: 'Угольно-черный', skinType: 'Светлая',
    transmogs: { head: null, shoulders: null, chest: null, hands: null, waist: null, legs: null, feet: null, cloak: null, amulet: null, ring1: null, ring2: null, primary: null, secondary: null, fateFocus: null },
    title: 'Скиталец', hideHelmet: false, aura: null, trail: null
  };

  const [activeTab, setActiveTab] = useState<'wardrobe' | 'presets' | 'effects' | 'character'>('wardrobe');

  const [activeTitle, setActiveTitle] = useState(customization.title);
  const [activeHairStyle, setActiveHairStyle] = useState(customization.hairStyle);
  const [activeHairColor, setActiveHairColor] = useState(customization.hairColor);
  const [activeSkin, setActiveSkin] = useState(customization.skinType);
  const [selectedTransmogs, setSelectedTransmogs] = useState<Record<string, string | null>>(customization.transmogs || {});
  const [hideHelmet, setHideHelmet] = useState(customization.hideHelmet || false);
  const [selectedAura, setSelectedAura] = useState(customization.aura || null);
  const [selectedTrail, setSelectedTrail] = useState(customization.trail || null);

  const handleApplyCustomization = () => {
    const updatedCustomization = {
      title: activeTitle, hairStyle: activeHairStyle, hairColor: activeHairColor, skinType: activeSkin,
      transmogs: selectedTransmogs, hideHelmet, aura: selectedAura, trail: selectedTrail
    };
    onUpdateCharacter({ ...character, visualCustomization: updatedCustomization });
    triggerAlert('Внешний вид успешно обновлен и сохранён в архивах!', 'success');
    
    if (notifyPlayerImpact) {
      notifyPlayerImpact("Смена облика", `Изменил свой внешний вид в Мастерской Обликов! Теперь он носит титул "${activeTitle}", а его волосы - "${activeHairStyle}". ${selectedAura ? `Окружен аурой "${selectedAura}".` : ''}`);
    }
  };

  const handleSetTransmog = (slot: SlotType, skinName: string | null) => {
    setSelectedTransmogs(prev => ({ ...prev, [slot]: skinName }));
  };

  const loadPreset = (preset: TransmogPreset) => {
    setSelectedTransmogs(preset.transmogs);
    if (preset.hideHelmet !== undefined) setHideHelmet(preset.hideHelmet);
    if (preset.aura !== undefined) setSelectedAura(preset.aura);
    if (preset.trail !== undefined) setSelectedTrail(preset.trail);
    triggerAlert(`Набор обликов "${preset.name}" успешно применен!`, 'info');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat">
        <div>
          <h3 className="font-serif text-2xl font-bold text-teal-400 drop-shadow-[0_0_12px_rgba(45,212,191,0.5)] flex items-center gap-2 uppercase tracking-wide">
            <Sparkles className="h-6 w-6 text-teal-300 animate-pulse" />
            Мастерская Обликов Этернии
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono max-w-2xl">
            Полноценная система моды: настраивайте каждый слой брони, сохраняйте пресеты и выражайте свою индивидуальность с помощью динамических эффектов и трансмогрификации.
          </p>
        </div>
      </div>

      <div className="flex bg-slate-950 p-1.5 rounded-lg border border-slate-800 w-fit gap-1 shadow-inner">
        {(['character', 'wardrobe', 'effects', 'presets'] as const).map(tab => {
          const labels = { character: 'Персонаж', wardrobe: 'Гардероб (Слоты)', effects: 'Магические Эффекты', presets: 'Наборы Обликов' };
          const icons = { character: <User className="w-4 h-4"/>, wardrobe: <Layers className="w-4 h-4"/>, effects: <Zap className="w-4 h-4"/>, presets: <Star className="w-4 h-4"/> };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-teal-900/80 text-white shadow-[0_0_15px_rgba(45,212,191,0.4)] border border-teal-500/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              {icons[tab]} {labels[tab]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Live Interactive Wardrobe Mirror (3D Model representation) */}
        <div className="xl:col-span-5 h-[550px] bg-slate-1000 border-2 border-slate-800 rounded-xl relative shadow-2xl overflow-hidden flex flex-col group">
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/40 via-transparent to-transparent pointer-events-none z-0"></div>
          
          <div className="p-3 border-b border-slate-800 bg-slate-900/80 absolute top-0 w-full z-10 flex justify-between items-center backdrop-blur-md">
            <div className="font-mono text-[10px] uppercase tracking-widest text-teal-400 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,1)]" />
              Зеркало Проекции
            </div>
            
            <button
               onClick={() => setHideHelmet(!hideHelmet)}
               className={`text-[10px] font-mono px-3 py-1.5 rounded flex items-center gap-1.5 transition-all border ${
                 hideHelmet ? 'bg-indigo-950 text-indigo-300 border-indigo-700' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
               }`}
            >
              {hideHelmet ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {hideHelmet ? 'Шлем скрыт' : 'Скрыть шлем'}
            </button>
          </div>

          <div className="flex-1 w-full h-[400px] relative z-0 mt-12 flex justify-center items-center">
             {/* Dynamic Auras representation */}
             {selectedAura && (
               <div className={`absolute inset-0 z-0 flex justify-center items-center opacity-30 pointer-events-none`}>
                 <div className={`w-64 h-64 rounded-full blur-3xl animate-pulse ${AURAS.find(a=>a.name===selectedAura)?.color || 'bg-white'}`}></div>
               </div>
             )}
             
            <Character3DModel 
               charClass={character.class} 
               race={activeSkin.split(' ')[0] || character.race} 
               equipment={{ ...character.equipment, ...selectedTransmogs, head: hideHelmet ? undefined : (selectedTransmogs.head || character.equipment.head) }} 
            />
          </div>

          {/* Projection Status Footer */}
          <div className="absolute bottom-0 w-full bg-slate-950/90 border-t border-slate-800 p-4 backdrop-blur-md z-10">
            <h4 className="font-serif text-lg font-black text-white truncate">
                {activeTitle ? `${activeTitle} ` : ''}{character.name}
            </h4>
            <div className="text-[10px] font-mono uppercase text-slate-400 mt-1 flex flex-wrap gap-2">
               <span>Уровень: {character.level}</span> |
               <span>Аура: {selectedAura || 'Нет'}</span> |
               <span>След: {selectedTrail || 'Нет'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customization panels based on active tab */}
        <div className="xl:col-span-7 flex flex-col h-[550px]">
          
          {/* TAB: CHARACTER */}
          {activeTab === 'character' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-6 flex-1 overflow-y-auto shadow-inner animate-fade-in">
              <h4 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-widest border-b border-slate-800 pb-2">Биологические параметры</h4>
              
              <div className="space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block font-mono">Титул Персонажа</span>
                <select value={activeTitle} onChange={(e) => setActiveTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-amber-500/50 font-mono text-xs">
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block font-mono">Прическа</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HAIR_STYLES.map(style => (
                    <button key={style} onClick={() => setActiveHairStyle(style)} className={`p-2.5 rounded-md text-left truncate text-xs font-mono border transition-all ${activeHairStyle === style ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block font-mono">Цвет Пигментации</span>
                <div className="flex flex-wrap gap-3 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                  {HAIR_COLORS.map(c => (
                    <button key={c.name} onClick={() => setActiveHairColor(c.name)} title={c.name} className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${c.class} ${activeHairColor === c.name ? 'scale-125 ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950' : 'opacity-70 hover:opacity-100 hover:scale-110'}`} />
                  ))}
                </div>
              </div>

               <div className="space-y-2">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block font-mono">Тон и фактура кожи</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SKIN_TYPES.map(skin => (
                    <button key={skin} onClick={() => setActiveSkin(skin)} className={`p-2.5 rounded-md text-center text-xs font-mono border transition-all ${activeSkin === skin ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                      {skin}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: WARDROBE (TRANSMOG) */}
          {activeTab === 'wardrobe' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1 overflow-y-auto shadow-inner animate-fade-in">
              <h4 className="font-serif text-sm font-bold text-teal-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">Слои Экипировки</h4>
              <p className="text-[11px] text-slate-500 font-mono mb-4 leading-relaxed">
                Выбирайте внешний вид для каждого слота. Если слот сброшен, используется оригинальный вид надетых характеристик (stats). 
              </p>

              <div className="space-y-5 pr-2">
                {(['head', 'shoulders', 'chest', 'hands', 'waist', 'legs', 'feet', 'cloak', 'primary', 'secondary'] as SlotType[]).map(slot => {
                  const currentSkin = selectedTransmogs[slot] || null;
                  const slotNameRu = slot === 'head' ? 'Шлем' : slot === 'shoulders' ? 'Наплечники' : slot === 'chest' ? 'Нагрудник' : slot === 'hands' ? 'Перчатки' : slot === 'waist' ? 'Пояс' : slot === 'legs' ? 'Поножи' : slot === 'feet' ? 'Сапоги' : slot === 'cloak' ? 'Плащ' : slot === 'primary' ? 'Оружие' : 'Щит / Вторая рука';
                  const skins = TRANSMOG_SKINS[slot] || [];

                  return (
                    <div key={slot} className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg hover:border-slate-700 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm uppercase font-mono tracking-wider font-bold text-slate-200">{slotNameRu}</span>
                        {currentSkin ? (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] bg-teal-950/50 text-teal-300 border border-teal-900/50 px-2 py-1 rounded font-mono uppercase tracking-widest">
                              {currentSkin}
                            </span>
                            <button onClick={() => handleSetTransmog(slot, null)} className="text-red-400 hover:text-red-300 text-[10px] font-mono cursor-pointer uppercase font-bold tracking-widest bg-red-950/30 px-2 py-1 rounded border border-red-900/30">
                              Сброс
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono italic">Оригинал</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {skins.map(skin => (
                          <button
                            key={skin.name}
                            onClick={() => handleSetTransmog(slot, skin.name)}
                            className={`p-3 rounded-lg text-left border transition-all ${
                              currentSkin === skin.name
                                ? 'bg-teal-950/40 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.15)] ring-1 ring-teal-500/50'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div className={`font-bold text-xs truncate ${currentSkin === skin.name ? 'text-teal-300' : 'text-slate-300'}`}>{skin.name}</div>
                            <div className="text-[9px] text-slate-500 leading-tight mt-1 truncate font-mono">{skin.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: EFFECTS */}
          {activeTab === 'effects' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-8 flex-1 overflow-y-auto shadow-inner animate-fade-in">
              <div>
                <h4 className="font-serif text-sm font-bold text-purple-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2 mb-4">
                  <Wind className="w-4 h-4" /> Динамические Ауры
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button onClick={() => setSelectedAura(null)} className={`p-4 rounded-lg border text-left ${!selectedAura ? 'bg-purple-950/40 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <span className="font-bold text-xs uppercase font-mono tracking-widest">Нет ауры</span>
                  </button>
                  {AURAS.map(aura => (
                    <button key={aura.id} onClick={() => setSelectedAura(aura.name)} className={`p-4 rounded-lg border text-left transition-all ${selectedAura === aura.name ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                      <span className={`font-bold text-sm block ${selectedAura === aura.name ? 'text-purple-300' : 'text-slate-200'}`}>{aura.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">{aura.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-serif text-sm font-bold text-orange-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center gap-2 mb-4">
                  <Flame className="w-4 h-4" /> Следы шагов
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <button onClick={() => setSelectedTrail(null)} className={`p-4 rounded-lg border text-left ${!selectedTrail ? 'bg-orange-950/40 border-orange-500 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <span className="font-bold text-xs uppercase font-mono tracking-widest">Обычные следы</span>
                  </button>
                  {TRAILS.map(trail => (
                    <button key={trail.id} onClick={() => setSelectedTrail(trail.name)} className={`p-4 rounded-lg border text-left transition-all ${selectedTrail === trail.name ? 'bg-orange-950/40 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                      <span className={`font-bold text-sm block ${selectedTrail === trail.name ? 'text-orange-300' : 'text-slate-200'}`}>{trail.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">{trail.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRESETS */}
          {activeTab === 'presets' && (
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex-1 overflow-y-auto shadow-inner animate-fade-in flex flex-col">
              <h4 className="font-serif text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4">Наборы Обликов</h4>
              <p className="text-[11px] text-slate-500 font-mono mb-6 leading-relaxed">
                Сохраненные пресеты позволяют мгновенно менять весь внешний вид, включая слои брони, показ шлема и эффекты. Вы можете сохранить свой текущий вид как локальный пресет.
              </p>

              <div className="space-y-4 flex-1">
                {PRESETS.map((preset) => (
                  <div key={preset.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between hover:bg-slate-850 hover:border-slate-700 transition-all group">
                     <div>
                       <div className="flex items-center gap-3">
                         <span className="text-2xl">{preset.icon}</span>
                         <div>
                           <h5 className="font-bold text-slate-100 font-serif text-md">{preset.name}</h5>
                           <p className="text-[10px] text-slate-400 font-mono mt-0.5">{preset.description}</p>
                         </div>
                       </div>
                       <div className="text-[9px] text-slate-500 font-mono mt-3 uppercase tracking-wider flex gap-3">
                         <span>Шлем: {preset.hideHelmet ? 'Скрыт' : 'Отобр.'}</span>
                         {preset.aura && <span>Аура: {preset.aura}</span>}
                         {preset.trail && <span>След: {preset.trail}</span>}
                       </div>
                     </div>
                     <button
                        onClick={() => loadPreset(preset)}
                        className="opacity-0 group-hover:opacity-100 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded shadow-lg transition-all"
                     >
                       Надеть
                     </button>
                  </div>
                ))}
              </div>
              
            </div>
          )}

          {/* Save Button (Sticky bottom) */}
          <div className="mt-4 shrink-0">
             <button
              onClick={handleApplyCustomization}
              className="w-full bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-black font-mono text-sm uppercase py-4 rounded-lg cursor-pointer tracking-wider shadow-lg transition-all border border-teal-500"
            >
              Подтвердить Изменения Облика
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
