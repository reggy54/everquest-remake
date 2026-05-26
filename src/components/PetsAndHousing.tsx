import React, { useState } from 'react';
import { PlayerCharacter, Pet, FurnitureItem } from '../types';
import { Home, Heart, Sparkles, ShoppingBag, ShieldAlert, BadgeCheck } from 'lucide-react';

interface PetsHousingProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const FURNITURE_STORE: Omit<FurnitureItem, 'placed'>[] = [
  { id: 'furn-throne-2', name: 'Рыцарский Трон Лидера', icon: '👑', buff: 'СИЛА (STR) +5', cost: 15 },
  { id: 'furn-fireplace-1', name: 'Камин Голубого Пламени', icon: '🔥', buff: 'ВЫНОСЛИВОСТЬ (STA) +8', cost: 25 },
  { id: 'furn-bed-1', name: 'Шелковая Кровать Дракона', icon: '🛏️', buff: 'МАКСИМАЛЬНОЕ ХП +100', cost: 40 },
  { id: 'furn-flower-1', name: 'Ваза Небесного Эфира', icon: '🏺', buff: 'МАНА (MANA) +45', cost: 20 },
  { id: 'furn-statue-1', name: 'Статуя Мудрости Торвина', icon: '🗿', buff: 'МУДРОСТЬ (WIS) +12', cost: 35 },
  { id: 'furn-chest-1', name: 'Сундук Золотых Сокровищ', icon: '🪙', buff: 'ХАРИЗМА (CHA) +8', cost: 30 }
];

const STARTING_PET_CREATURES = [
  { id: 'creature-dragon', name: 'Огненный Крошка-Нага', species: 'Dragon' as const, hp: 120, maxHp: 120, damage: 22, cost: 40 },
  { id: 'creature-griffin', name: 'Юный Изумрудный Гриф', species: 'Griffin' as const, hp: 95, maxHp: 95, damage: 18, cost: 25 },
  { id: 'creature-bear', name: 'Пещерный Бурый Страж', species: 'Bear' as const, hp: 150, maxHp: 150, damage: 14, cost: 30 }
];

export default function PetsAndHousing({ character, onUpdateCharacter, triggerAlert }: PetsHousingProps) {
  // Safe default evaluations
  const pets = character.pets || [
    { id: 'pet-wolf-1', name: 'Лютоволк Кейноса', species: 'Wolf' as const, level: 1, exp: 12, hp: 80, maxHp: 80, damage: 12, summoned: true }
  ];

  const furniture = character.houseFurniture || [
    { id: 'furn-throne-1', name: 'Дубовый стул гильдмастера', icon: '🪑', buff: 'ХАР (CHA) +2', cost: 5, placed: true },
    { id: 'furn-table-1', name: 'Круглый обеденный стол', icon: '🪵', buff: 'ИНТ (INT) +2', cost: 8, placed: true }
  ];

  const [activeTab, setActiveTab] = useState<'pets' | 'housing'>('pets');
  const [newPetName, setNewPetName] = useState('');

  // Feed pet, give xp / level up
  const handleFeedPet = (petId: string) => {
    if (character.gold < 10) {
      triggerAlert('У вас нет 10 золотых для покупки отборной дичи!', 'error');
      return;
    }

    const updatedChar = { ...character, gold: character.gold - 10 };
    const updatedPets = pets.map(p => {
      if (p.id === petId) {
        const nextXp = p.exp + 35;
        let nextLvl = p.level;
        let nextDmg = p.damage;
        let nextMaxHp = p.maxHp;

        if (nextXp >= p.level * 100) {
          nextLvl += 1;
          nextDmg = Math.floor(nextDmg * 1.25);
          nextMaxHp = Math.floor(nextMaxHp * 1.2);
          triggerAlert(`💖 Ваш питомец ${p.name} повысил свой уровень до ${nextLvl}! (Ding!)`, 'success');
        }

        return {
          ...p,
          level: nextLvl,
          exp: nextXp >= p.level * 100 ? 0 : nextXp,
          damage: nextDmg,
          maxHp: nextMaxHp,
          hp: nextMaxHp
        };
      }
      return p;
    });

    updatedChar.pets = updatedPets;
    onUpdateCharacter(updatedChar);
    triggerAlert('Питомец сытно отобедал в колыбели! Опыт питомца +35', 'success');
  };

  // Summon active pet
  const handleSummonPet = (petId: string) => {
    const updatedPets = pets.map(p => ({
      ...p,
      summoned: p.id === petId
    }));

    const updatedChar = { ...character, pets: updatedPets };
    onUpdateCharacter(updatedChar);
    triggerAlert('Спутник призван в этот мир и следует за вами!', 'info');
  };

  // Buy new dryad or fight dragon pet
  const handleBuyPet = (template: typeof STARTING_PET_CREATURES[0]) => {
    if (character.gold < template.cost) {
      triggerAlert('Недостаточно монет для покупки дикого зверя!', 'error');
      return;
    }

    const customName = newPetName.trim() || `${template.name}-Младший`;
    const newPet: Pet = {
      id: `pet-bought-${Date.now()}`,
      name: customName,
      species: template.species,
      level: 1,
      exp: 0,
      hp: template.hp,
      maxHp: template.maxHp,
      damage: template.damage,
      summoned: false
    };

    const updatedChar = {
      ...character,
      gold: character.gold - template.cost,
      pets: [...pets, newPet]
    };

    onUpdateCharacter(updatedChar);
    setNewPetName('');
    triggerAlert(`Приобретен боевой спутник: ${customName}! Позаботьтесь о нем в вольерах.`, 'success');
  };

  // Buy furniture
  const handleBuyFurniture = (item: typeof FURNITURE_STORE[0]) => {
    if (character.gold < item.cost) {
      triggerAlert('У вас нет достаточного золотого запаса!', 'error');
      return;
    }

    const newFurniture: FurnitureItem = {
      ...item,
      placed: false
    };

    const updatedChar = {
      ...character,
      gold: character.gold - item.cost,
      houseFurniture: [...furniture, newFurniture]
    };

    onUpdateCharacter(updatedChar);
    triggerAlert(`Куплен новый предмет мебели: [${item.name}]! Разместите его в гостиной.`, 'success');
  };

  // Place/Toggle place status of furniture
  const handleTogglePlace = (itemId: string) => {
    const updatedFurniture = furniture.map(f => {
      if (f.id === itemId) {
        return { ...f, placed: !f.placed };
      }
      return f;
    });

    const updatedChar = { ...character, houseFurniture: updatedFurniture };
    onUpdateCharacter(updatedChar);
    triggerAlert('Местоположение мебели обновлено! Сила покоя подействовала.', 'info');
  };

  const activeSummonedPet = pets.find(p => p.summoned);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <Home className="h-5 w-5 text-indigo-400" />
            Личные Угодья: Обитель Питомцев & Свой Усадьба
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Купите роскошные ковры и троны для усадьбы Кейноса, заведите Огненного Дракона и кормите преданных питомцев для усиления ролевых характеристик.
          </p>
        </div>
      </div>

      {/* Subtab Controllers */}
      <div className="flex border-b border-slate-800 p-0.5 max-w-sm bg-slate-950 rounded-lg select-none">
        {['pets', 'housing'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 py-1 text-xs font-mono font-bold uppercase transition-all rounded cursor-pointer ${
              activeTab === t ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'pets' ? '🦅 Жилище Питомцев' : '🏡 Личный Особняк'}
          </button>
        ))}
      </div>

      {/* TAB 1: Kennel Management */}
      {activeTab === 'pets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Summoned pet, training / stats */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block mb-3">Содержимое ваших стоил:</span>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {pets.map(pet => (
                  <div key={pet.id} className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-serif font-bold text-slate-200">🐕 {pet.name}</span>
                        <span className="text-[9px] bg-indigo-950 text-indigo-400 font-mono px-2 py-0.5 rounded uppercase font-bold">Уровень {pet.level}</span>
                        {pet.summoned && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3" /> Призван
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                        <span>Порода: <span className="text-slate-200">{pet.species === 'Wolf' ? 'Лютоволк' : pet.species === 'Dragon' ? 'Дракон' : pet.species === 'Griffin' ? 'Грифон' : 'Медведь'}</span></span>
                        <span>•</span>
                        <span>Здоровье: <span className="text-slate-200">{pet.hp} / {pet.maxHp} HP</span></span>
                        <span>•</span>
                        <span>Сила атаки: <span className="text-rose-400 font-bold">🗡️ {pet.damage} урона</span></span>
                      </div>

                      {/* Exp progress bar */}
                      <div className="w-48 space-y-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-500">
                          <span>Удовлетворенность</span>
                          <span>{pet.exp} / {pet.level * 100} XP</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded overflow-hidden">
                          <div className="bg-indigo-500 h-full transition-all duration-350" style={{ width: `${(pet.exp / (pet.level * 100)) * 100}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0 select-none">
                      {!pet.summoned && (
                        <button
                          onClick={() => handleSummonPet(pet.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono px-3.5 py-1.5 rounded cursor-pointer border border-slate-700"
                        >
                          Призвать
                        </button>
                      )}
                      <button
                        onClick={() => handleFeedPet(pet.id)}
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-mono font-bold px-3.5 py-1.5 rounded cursor-pointer"
                      >
                        Покормить (10g)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Pet Breeder / Seller */}
            <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-850 space-y-4">
              <h4 className="font-serif text-sm font-bold text-amber-500 flex items-center gap-1.5 uppercase">
                🏷️ Лесной Охотник: Инкубатор питомцев
              </h4>
              <p className="text-xs text-slate-400">
                Введите уникальное имя и приручите нового преданного хищника в свои вольеры.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Задать имя нового зверя..."
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value.replace(/[^a-zA-Z0-9_\u0400-\u04FF]/g, ''))}
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono w-full sm:w-1/2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1.5">
                {STARTING_PET_CREATURES.map(creature => (
                  <div key={creature.id} className="bg-slate-900 border border-slate-800 p-3 rounded flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold font-serif text-slate-100 block">
                        {creature.species === 'Dragon' ? '🔥 Дракончик' : creature.species === 'Griffin' ? '🦅 Юный Грифон' : '🐻 Бурый Мишка'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono leading-relaxed mt-1">
                        ХП: {creature.hp} • АТАКА: {creature.damage}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyPet(creature)}
                      className="mt-4 w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-500 font-mono text-[10px] uppercase font-bold py-1.5 rounded cursor-pointer text-center"
                    >
                      Купить за {creature.cost}g
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kennel Details Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <h4 className="font-serif text-sm font-bold text-slate-300 uppercase tracking-tight flex items-center gap-1">
                <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                Свита в бою
              </h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Призванный питомец сопровождает вас на 2D-карте мира и автоматически наносит сокрушительные удары по монстрам при каждой боевой серии!
              </p>

              {activeSummonedPet ? (
                <div className="bg-slate-900 border border-slate-800 p-3 rounded space-y-2 text-center select-none">
                  <span className="text-4xl block animate-bounce py-1">🐾</span>
                  <h5 className="font-serif font-black text-rose-300 text-sm leading-tight">{activeSummonedPet.name}</h5>
                  <span className="text-[9px] font-mono block text-slate-400">Уровень {activeSummonedPet.level} {activeSummonedPet.species}</span>
                  <div className="text-[10px] font-semibold text-emerald-400 font-mono mt-1">ГОТОВ К БОЮ И ПРИКЛЮЧЕНИЯМ!</div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-500 leading-normal px-4">
                  У вас нет призванных питомцев. Кликните "Призвать" выше, чтобы активировать спутника.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cozy Player House Decorator */}
      {activeTab === 'housing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          {/* Floor grid / room preview drawing */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">План и обстановка усадьбы Кейноса:</span>

              {/* Graphical Box 2D Room Grid */}
              <div className="bg-slate-900 p-6 rounded-lg border-2 border-dashed border-indigo-950 flex flex-col items-center justify-center space-y-4 shadow-inner relative overflow-hidden select-none">
                <div className="absolute top-2 right-2 bg-slate-950 px-2 py-0.5 rounded border border-indigo-950 font-mono text-[9px] text-indigo-400 uppercase tracking-widest font-black">
                  Гостиная Очага
                </div>

                {/* Drawn Grid layout */}
                <div className="grid grid-cols-5 gap-3 max-w-sm">
                  {Array.from({ length: 15 }).map((_, idx) => {
                    // Check if furniture matches index
                    const placedList = furniture.filter(f => f.placed);
                    const item = placedList[idx % placedList.length];

                    return (
                      <div
                        key={idx}
                        className={`w-12 h-12 rounded border flex items-center justify-center text-2xl transition-all shadow-md relative ${
                          idx % 3 === 0 && item
                            ? 'bg-indigo-950/60 border-indigo-500/50 scale-105 hover:bg-indigo-900/40 cursor-help'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                        title={idx % 3 === 0 && item ? item.name : 'Свободное место'}
                      >
                        {idx % 3 === 0 && item ? item.icon : idx === 7 ? '🚪' : ''}
                        
                        {/* Selected pet renders in the center */}
                        {idx === 6 && activeSummonedPet && (
                          <div className="absolute -bottom-1 -right-1 text-base animate-bounce">
                            🐶
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="text-center font-mono text-[10px] text-slate-500 leading-normal max-w-xs mt-2">
                  Иконки в гостиной представляют размещенную мебель. Комната дает пассивный прирост отдыха и параметров.
                </div>
              </div>

              {/* Passive statistics effects summary */}
              <div className="bg-slate-900 p-4 rounded border border-slate-850">
                <span className="text-xs font-mono font-bold text-indigo-400 block border-b border-indigo-950 pb-1.5">АКТИВНЫЕ ЭФФЕКТЫ ДОМА:</span>
                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-emerald-400">
                  {furniture.filter(f => f.placed).map(f => (
                    <span key={f.id} className="bg-slate-950 px-2.5 py-1 rounded border border-emerald-950 shadow-sm flex items-center gap-1.5">
                      <span>{f.icon} {f.name}:</span>
                      <span className="font-bold">{f.buff}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Luxury store and collection list */}
          <div className="lg:col-span-5 space-y-4">
            {/* Store to buy furniture */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
              <h4 className="font-serif text-xs font-bold text-amber-400 flex items-center gap-1 uppercase">
                <ShoppingBag className="h-4 w-4" /> Мебельная лавка Фрипорта
              </h4>
              <p className="text-[10px] text-slate-500">
                Покупайте статуэтки, ковры и элитные лавки для усиления пассивных характеристик за золото.
              </p>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {FURNITURE_STORE.map(item => (
                  <div key={item.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded flex justify-between items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-serif font-bold text-slate-100 flex items-center gap-1">
                        <span>{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </span>
                      <div className="text-[9px] text-emerald-400 font-mono mt-0.5">{item.buff}</div>
                    </div>
                    <button
                      onClick={() => handleBuyFurniture(item)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono py-1 px-3 rounded cursor-pointer border border-slate-700 font-bold shrink-0"
                    >
                      {item.cost}g
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Warehouse owned list */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-350 block">Ваш Склад Обстановки:</span>
              
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                {furniture.map(f => (
                  <div key={f.id} className="bg-slate-900 border border-slate-850 px-2.5 py-2 rounded flex justify-between items-center gap-4 text-xs">
                    <span className="font-mono text-slate-200">{f.icon} {f.name}</span>
                    <button
                      onClick={() => handleTogglePlace(f.id)}
                      className={`text-[9px] font-mono px-2 py-1 rounded cursor-pointer ${
                        f.placed ? 'bg-indigo-950 text-indigo-400 border border-indigo-900 font-bold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {f.placed ? 'В комнате' : 'Убрать в сундук'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
