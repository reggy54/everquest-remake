import React, { useState } from 'react';
import { PlayerCharacter, SlotType } from '../types';
import { Shield, Sparkles, User, RefreshCw, Layers } from 'lucide-react';

interface CosmeticSalonTransmogProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
}

const TITLES = [
  'Скиталец',
  'Гроза Монстров',
  'Завоеватель Этернии',
  'Легенда Арены',
  'Великий Мастер Ремесла',
  'Истребитель Боссов',
  'Друг Драконов',
  'Вечный Искатель Сложного'
];

const HAIR_STYLES = [
  'Воинский узел',
  'Ирокез Глашатая',
  'Длинные кудри Эльфа',
  'Бритая голова',
  'Острие бури',
  'Королевский пробор',
  'Пышные дреды',
  'Взрывной астрал'
];

const HAIR_COLORS = [
  { name: 'Угольно-черный', class: 'bg-stone-900 border-stone-700' },
  { name: 'Платиновый блонд', class: 'bg-slate-100 border-stone-300' },
  { name: 'Огненно-рыжий', class: 'bg-amber-600 border-amber-500' },
  { name: 'Лесной каштан', class: 'bg-amber-900 border-amber-800' },
  { name: 'Аметистовый фиолетовый', class: 'bg-purple-600 border-purple-500' },
  { name: 'Изумрудно-зеленый', class: 'bg-emerald-600 border-emerald-500' },
  { name: 'Космический синий', class: 'bg-blue-600 border-blue-500' }
];

const SKIN_TYPES = [
  'Светлая',
  'Загорелая',
  'Эльфийская бледность',
  'Пепельно-серый',
  'Чешуйчатая (Рептилия)',
  'Темная',
  'Бронзовая'
];

// Available transmog appearance skins per slot
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
  arms: [
    { name: 'Наручи Драконьего Гнева', desc: 'Пылающие нарукавники из чешуи Нага' },
    { name: 'Муфты Магического Щита', desc: 'Магически укрепленная парча' }
  ],
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

export default function CosmeticSalonTransmog({ character, onUpdateCharacter }: CosmeticSalonTransmogProps) {
  // Defensive initialization of customization states
  const customization = character.visualCustomization || {
    hairStyle: 'Воинский узел',
    hairColor: 'Угольно-черный',
    skinType: 'Светлая',
    transmogs: {
      head: null,
      chest: null,
      arms: null,
      legs: null,
      hands: null,
      feet: null,
      primary: null,
      secondary: null
    },
    title: 'Скиталец'
  };

  const [activeTitle, setActiveTitle] = useState(customization.title);
  const [activeHairStyle, setActiveHairStyle] = useState(customization.hairStyle);
  const [activeHairColor, setActiveHairColor] = useState(customization.hairColor);
  const [activeSkin, setActiveSkin] = useState(customization.skinType);
  const [selectedTransmogs, setSelectedTransmogs] = useState<Record<string, string | null>>(customization.transmogs || {});

  const handleApplyCustomization = () => {
    const updatedCustomization = {
      title: activeTitle,
      hairStyle: activeHairStyle,
      hairColor: activeHairColor,
      skinType: activeSkin,
      transmogs: selectedTransmogs
    };

    const updatedChar: PlayerCharacter = {
      ...character,
      visualCustomization: updatedCustomization
    };

    onUpdateCharacter(updatedChar);
  };

  const handleRandomize = () => {
    const title = TITLES[Math.floor(Math.random() * TITLES.length)];
    const hair = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)];
    const color = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].name;
    const skin = SKIN_TYPES[Math.floor(Math.random() * SKIN_TYPES.length)];

    setActiveTitle(title);
    setActiveHairStyle(hair);
    setActiveHairColor(color);
    setActiveSkin(skin);
  };

  const handleSetTransmog = (slot: SlotType, skinName: string | null) => {
    setSelectedTransmogs(prev => ({
      ...prev,
      [slot]: skinName
    }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
            Цирюльня & Салон Моды Этернии
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Настройте свой индивидуальный облик, выберите почетный титул и примените легендарные облики снаряжения (Трансмогрификацию).
          </p>
        </div>
        <button
          onClick={handleRandomize}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs border border-slate-700 px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Случайно
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customization Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-4">
            <h4 className="font-serif text-sm font-bold text-amber-400 flex items-center gap-1.5">
              <User className="h-4.5 w-4.5 text-amber-500" />
              Внешний вид & Титул
            </h4>

            {/* Title Selection */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-bold block">Почетный Титул Персонажа:</span>
              <select
                value={activeTitle}
                onChange={(e) => setActiveTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 focus:outline-none focus:border-amber-400 font-mono text-xs"
              >
                {TITLES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Hair Style */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-bold block">Форма Прически:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {HAIR_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setActiveHairStyle(style)}
                    className={`p-2 rounded text-left truncate text-[11px] font-mono border transition-all ${
                      activeHairStyle === style
                        ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                    }`}
                  >
                    ✂️ {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Hair Color */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-bold block">Цвет Волос / Свечение:</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {HAIR_COLORS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setActiveHairColor(c.name)}
                    title={c.name}
                    className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${c.class} ${
                      activeHairColor === c.name ? 'scale-125 ring-2 ring-amber-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500 font-mono italic block pt-1">Текущий цвет: {activeHairColor}</span>
            </div>

            {/* Skin Color */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 font-bold block">Тип & Цвет Кожи:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {SKIN_TYPES.map(skin => (
                  <button
                    key={skin}
                    onClick={() => setActiveSkin(skin)}
                    className={`p-2 rounded text-[11px] font-mono border transition-all ${
                      activeSkin === skin
                        ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                    }`}
                  >
                    🎨 {skin}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleApplyCustomization}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-mono text-xs uppercase py-3 rounded cursor-pointer tracking-wider shadow-md transition-all"
          >
            Сохранить Облик в Архивах
          </button>
        </div>

        {/* Right Column: Transmogrification overlay */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-4">
            <h4 className="font-serif text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-emerald-500" />
              Шкаф Трансмогрификации (Внешний вид слотов)
            </h4>
            <p className="text-[10px] text-slate-500 leading-normal">
              Благодаря иллюзорной магии Ковена, вы можете изменить внешний вид любого экипированного предмета на один из легендарных скинов ниже! Исходные характеристики останутся прежними.
            </p>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {(['head', 'chest', 'arms', 'hands', 'legs', 'feet', 'primary', 'secondary'] as SlotType[]).map(slot => {
                const currentSkin = selectedTransmogs[slot] || null;
                const slotNameRu = slot === 'head' ? 'Шлем (Голова)' : slot === 'chest' ? 'Нагрудник' : slot === 'arms' ? 'Наручи' : slot === 'hands' ? 'Перчатки' : slot === 'legs' ? 'Поножи' : slot === 'feet' ? 'Сапоги' : slot === 'primary' ? 'Оружие' : 'Щит / Спутник';
                const skins = TRANSMOG_SKINS[slot] || [];

                return (
                  <div key={slot} className="bg-slate-905 border border-slate-850 p-2.5 rounded hover:border-slate-800 transition-colors">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-1.5 mb-2">
                      <span className="text-xs uppercase font-mono tracking-wider font-bold text-slate-300">
                        {slotNameRu}
                      </span>
                      {currentSkin ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 py-0.2 rounded font-mono">
                            Скин: {currentSkin}
                          </span>
                          <button
                            onClick={() => handleSetTransmog(slot, null)}
                            className="text-red-400 hover:text-red-300 text-[10px] font-mono cursor-pointer"
                          >
                            Сбросить
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono italic">Оригинальный скин</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {skins.map(skin => (
                        <button
                          key={skin.name}
                          onClick={() => handleSetTransmog(slot, skin.name)}
                          className={`p-2 rounded text-left border transition-all text-[11px] font-mono ${
                            currentSkin === skin.name
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-bold truncate text-slate-200">{skin.name}</div>
                          <div className="text-[9px] text-slate-500 leading-tight mt-0.5 truncate">{skin.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Avatar Preview Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
        <div>
          <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-widest font-extrabold block">Визуальная Проекция Героя</span>
          <h4 className="font-serif text-lg font-black text-rose-300 mt-0.5">
            {activeTitle ? `${activeTitle} ` : ''}{character.name}
          </h4>
          <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 mt-2">
            <span>Раса: <span className="text-slate-200">{character.race}</span></span>
            <span>•</span>
            <span>Класс: <span className="text-slate-200">{character.class}</span></span>
            <span>•</span>
            <span>Прическа: <span className="text-slate-200">{activeHairStyle} ({activeHairColor})</span></span>
            <span>•</span>
            <span>Кожа: <span className="text-slate-200">{activeSkin}</span></span>
          </div>
        </div>

        {/* 2D Retro Avatar Mock Drawing with state updates */}
        <div className="w-16 h-16 rounded-xl border border-slate-700 bg-slate-900 flex flex-col justify-center items-center shadow-inner relative overflow-hidden shrink-0 select-none">
          <div className="text-2xl animate-bounce">
            {character.class === 'Warrior' || character.class === 'Paladin' ? '🛡️' : character.class === 'Ranger' ? '🏹' : character.class === 'Necromancer' || character.class === 'Wizard' ? '🔮' : '🧙'}
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-slate-950/80 py-0.5 text-[8px] font-mono text-amber-500 text-center font-bold uppercase truncate tracking-tight">
            Level {character.level}
          </div>
        </div>
      </div>
    </div>
  );
}
