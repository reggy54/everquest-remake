import React, { useState } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Wand2, Hammer, Zap, RefreshCw, Flame, Lock, Sparkles, Shield } from 'lucide-react';

interface EquipmentReforgeProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const MODIFIERS_POOL = {
  common: [
    '+12% Критического урона',
    '+18% Скорости атаки / заклинаний',
    '+450 к Максимальному здоровью',
    '+25% Регенерации здоровья в бою',
    '+15% Проникания сопротивления',
    '+10% Вампиризма',
  ],
  rift: [
    'Эхо Разлома: При крит. ударе шанс 20% создать малый разлом (AoE-урон)',
    'Щит Звёзд: Раз в 50 сек поглощает 35% входящего урона',
    'Кровь Небес: 30% лечения наносится как урон врагам',
    'Танец Теней: После уклонения +25% к урону на 4 сек',
    'Гнев Этерии: Воскрешение с 30% HP раз в 180 сек',
  ],
  synergy: [
    'Путь Света: +40% к лечению (если более 6 Осколков Света)',
    'Шёпот Бездны: +22% урона DoT-эффектами (при преобладании Тьмы)',
    'Равновесие: +12% ко всем статам (Свет и Тьма равны)',
  ],
  legendary: [
    'Сердце Дракона: Раз в 30 сек огненное дыхание (AoE)',
    'Призрачный Клинок: Шанс игнорировать блок и парирование',
    'Воплощение Бури: Автоматический шторм каждые 20 сек',
    'Кристаллическая Кожа: 15% урона идет в щит',
    'Судьбоносный Удар: Каждый 10-й удар наносит +80% урона',
    'Эфирный След: +18% скорости союзникам при движении',
    'Разломный Голод: Убийство восстанавливает 8% маны',
    'Аватар Разлома: Форма Аватара (+35% к статам) раз в 90 сек',
  ],
};

const getRandomModifiers = (rarity: string, mode: 'simple' | 'targeted' | 'deep') => {
  const modCount = rarity === 'legendary' ? 4 : rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : 1;
  const newMods: string[] = [];

  let pool = [...MODIFIERS_POOL.common];
  if (mode === 'deep' || rarity === 'legendary' || rarity === 'epic') {
     pool = [...pool, ...MODIFIERS_POOL.rift, ...MODIFIERS_POOL.synergy];
  }
  if (mode === 'deep' && rarity === 'legendary') {
     pool = [...pool, ...MODIFIERS_POOL.legendary];
  }

  for (let i = 0; i < modCount; i++) {
    const rm = pool[Math.floor(Math.random() * pool.length)];
    if (!newMods.includes(rm)) {
      newMods.push(rm);
    }
  }
  return newMods;
};

export default function EquipmentReforge({ character, onUpdateCharacter, triggerAlert }: EquipmentReforgeProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isReforging, setIsReforging] = useState(false);
  const [reforgeMode, setReforgeMode] = useState<'simple' | 'targeted' | 'deep'>('simple');
  const [lockedModIdx, setLockedModIdx] = useState<number | null>(null);

  const equipableItems = character.inventory.filter(item => item.slot !== 'none' && item.slot !== 'consumable' && item.slot !== 'material');

  const handleSelect = (item: Item) => {
    setSelectedItem(item);
    setLockedModIdx(null);
  };

  const getCost = () => {
    if (reforgeMode === 'simple') return 15;
    if (reforgeMode === 'targeted') return 50;
    return 150;
  };

  const performReforge = () => {
    if (!selectedItem) return;

    const cost = getCost();
    if (character.gold < cost) {
      triggerAlert('Недостаточно Пыли Судьбы (представлено Золотом)!', 'error');
      return;
    }

    setIsReforging(true);

    setTimeout(() => {
      setIsReforging(false);

      let savedMod: string | null = null;
      if (lockedModIdx !== null && selectedItem.modifiers && selectedItem.modifiers[lockedModIdx]) {
         savedMod = selectedItem.modifiers[lockedModIdx];
      }

      const generatedMods = getRandomModifiers(selectedItem.rarity, reforgeMode);
      if (savedMod && generatedMods.length > 0) {
        generatedMods[0] = savedMod; // Keep locked mod
      } else if (savedMod) {
        generatedMods.push(savedMod);
      }

      const newItem = {
        ...selectedItem,
        modifiers: generatedMods
      };

      const updatedChar = { ...character, gold: character.gold - cost };
      const newInventory = [...character.inventory];
      const itemIndex = newInventory.findIndex(i => i.id === selectedItem.id);
      
      if (itemIndex > -1) {
        newInventory[itemIndex] = newItem;
        updatedChar.inventory = newInventory;
      }
      
      setSelectedItem(newItem);
      onUpdateCharacter(updatedChar);

      triggerAlert(`Предмет [${selectedItem.name}] успешно перекован!`, 'success');
    }, 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6 text-slate-300">
       <div className="flex justify-between items-center border-b border-slate-800 pb-4">
         <div>
           <h3 className="font-serif text-xl font-bold text-amber-500 uppercase flex items-center gap-2">
             <Wand2 className="h-6 w-6" />
             Наковальня Судьбы (Перековка)
           </h3>
           <p className="text-xs text-slate-400 mt-1 font-mono">
             Сбросьте старые руны и напитайте экипировку новыми модификаторами.
           </p>
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-6">
         {/* Inventory List */}
         <div className="md:w-1/3 bg-slate-950 p-4 rounded-lg border border-slate-800 h-[550px] overflow-y-auto">
           <h4 className="text-[10px] uppercase font-bold text-indigo-400 mb-4 tracking-widest border-b border-slate-800 pb-2">Доступная экипировка</h4>
           
           {equipableItems.length === 0 ? (
             <div className="text-center text-slate-500 font-mono text-xs mt-10">В сумке нет доступной экипировки.</div>
           ) : (
             <div className="space-y-2">
               {equipableItems.map(item => (
                 <div 
                   key={item.id} 
                   onClick={() => handleSelect(item)}
                   className={`p-2 rounded border cursor-pointer transition-all flex flex-col justify-center
                     ${selectedItem?.id === item.id ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                   `}
                 >
                   <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold block truncate ${
                       item.rarity === 'legendary' ? 'text-orange-400' :
                       item.rarity === 'epic' ? 'text-purple-400' :
                       item.rarity === 'rare' ? 'text-blue-400' :
                       item.rarity === 'uncommon' ? 'text-green-400' : 'text-slate-300'
                     }`}>
                       {item.upgradeLevel ? `+${item.upgradeLevel} ` : ''}{item.name}
                     </span>
                     <span className="text-[9px] text-slate-500 font-mono uppercase">{item.slot}</span>
                   </div>
                   {item.modifiers && item.modifiers.length > 0 && (
                     <div className="mt-1 flex gap-1 flex-wrap">
                       {item.modifiers.map((m, i) => (
                         <span key={i} className="text-[8px] bg-slate-800 px-1 py-0.5 rounded text-slate-400 truncate max-w-full">
                           {m}
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Reforging Interface */}
         <div className="md:w-2/3 bg-slate-1000 border-2 border-slate-800 rounded-lg p-6 relative flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden min-h-[550px]">
           {selectedItem ? (
             <div className="w-full max-w-md animate-fade-in relative z-10 flex flex-col h-full">
               
               {/* Item Display */}
               <div className="text-center mb-6">
                 <div className="w-20 h-20 mx-auto bg-slate-900 border border-indigo-500/50 rounded-lg shadow-[0_0_30px_rgba(99,102,241,0.15)] flex items-center justify-center mb-3 relative">
                   {isReforging && (
                     <div className="absolute inset-0 bg-indigo-500/20 rounded-lg animate-pulse" />
                   )}
                   <Flame className={`w-8 h-8 text-indigo-400 ${isReforging ? 'animate-bounce' : ''}`} />
                 </div>
                 <h2 className="text-lg font-serif text-slate-200">{selectedItem.name}</h2>
                 <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">{selectedItem.rarity} | {selectedItem.slot}</p>
               </div>

               {/* Current Modifiers and Locking */}
               <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 mb-6">
                 <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-wider flex items-center justify-between">
                   <span>Текущие Модификаторы</span>
                   <span className="text-emerald-500 flex items-center gap-1"><Lock className="w-3 h-3"/> Можно закрепить один</span>
                 </h4>
                 
                 {(!selectedItem.modifiers || selectedItem.modifiers.length === 0) ? (
                   <p className="text-xs text-slate-500 font-mono italic p-2 border border-dashed border-slate-700 rounded text-center">Нет модификаторов для перековки</p>
                 ) : (
                   <div className="space-y-1.5">
                     {selectedItem.modifiers.map((mod, idx) => (
                       <div 
                         key={idx}
                         onClick={() => setLockedModIdx(lockedModIdx === idx ? null : idx)}
                         className={`p-2 rounded border cursor-pointer flex items-center justify-between transition-all text-xs
                           ${lockedModIdx === idx 
                             ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                             : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600'
                           }
                         `}
                       >
                         <span className="truncate pr-2 max-w-[85%]">{mod}</span>
                         {lockedModIdx === idx && <Lock className="w-3 h-3 flex-shrink-0" />}
                       </div>
                     ))}
                   </div>
                 )}
               </div>

               {/* Reforge Options */}
               <div className="grid grid-cols-1 gap-3 mb-6">
                 {(['simple', 'targeted', 'deep'] as const).map(mode => (
                   <div 
                     key={mode}
                     onClick={() => setReforgeMode(mode)}
                     className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center
                       ${reforgeMode === mode ? 'bg-indigo-900/40 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}
                     `}
                   >
                     <div>
                       <h5 className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${mode === 'deep' ? 'text-orange-400' : mode === 'targeted' ? 'text-blue-400' : 'text-slate-300'}`}>
                         {mode === 'simple' ? 'Простая Перековка' : mode === 'targeted' ? 'Целевая Перековка' : 'Глубокая Перековка'}
                       </h5>
                       <p className="text-[9px] text-slate-500 leading-tight">
                         {mode === 'simple' ? 'Случайные статы' : mode === 'targeted' ? 'Повышенный шанс на синергию' : 'Шанс на редкие/разломные модификаторы'}
                       </p>
                     </div>
                     <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                       {mode === 'simple' ? '15' : mode === 'targeted' ? '50' : '150'} <Sparkles className="w-3 h-3 text-amber-600"/>
                     </div>
                   </div>
                 ))}
               </div>

               <div className="mt-auto">
                 <button
                   onClick={performReforge}
                   disabled={isReforging}
                   className="w-full bg-gradient-to-r from-indigo-700 to-blue-800 hover:from-indigo-600 hover:to-blue-700 text-indigo-100 font-bold uppercase tracking-widest py-3 rounded focus:outline-none transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 flex justify-center items-center gap-2 border border-indigo-400/50"
                 >
                   {isReforging ? (
                     <>
                       <RefreshCw className="w-5 h-5 animate-spin" />
                       Перековка...
                     </>
                   ) : (
                     <>
                       <Wand2 className="w-5 h-5" />
                       Перековать Судьбу
                     </>
                   )}
                 </button>
               </div>
             </div>
           ) : (
             <div className="m-auto text-center text-slate-500 font-mono text-sm relative z-10 flex flex-col items-center">
               <Wand2 className="w-12 h-12 text-slate-700 mb-4 opacity-50" />
               <p>Выберите предмет для изменения его скрытого потенциала</p>
             </div>
           )}
           
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
             <Shield className="w-96 h-96" />
           </div>
         </div>
       </div>
    </div>
  );
}
