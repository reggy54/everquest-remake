import React, { useState } from 'react';
import { PlayerCharacter, Item, Rune, ItemSocket, RuneColor } from '../types';
import { Hexagon, Plus, Shield, Sword, Sparkles, Activity, Layers, X, ShieldAlert } from 'lucide-react';

interface EquipmentSocketsProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const getRuneColorHex = (color: RuneColor) => {
  switch (color) {
    case 'red': return 'text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-red-950/40';
    case 'blue': return 'text-blue-400 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-blue-950/40';
    case 'green': return 'text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-950/40';
    case 'purple': return 'text-purple-400 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)] bg-purple-950/40';
    case 'gold': return 'text-amber-400 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/40';
    default: return 'text-slate-400 border-slate-500 bg-slate-900';
  }
};

const getRuneIcon = (color: RuneColor) => {
  switch (color) {
    case 'red': return <Sword className="w-4 h-4" />;
    case 'blue': return <Shield className="w-4 h-4" />;
    case 'green': return <Activity className="w-4 h-4" />;
    case 'purple': return <Sparkles className="w-4 h-4" />;
    case 'gold': return <Layers className="w-4 h-4" />;
  }
};

const getMaxSockets = (rarity: string) => {
  switch(rarity) {
    case 'rare': return 1;
    case 'epic': return 2;
    case 'legendary': return 3;
    case 'mythic': case 'eternium': return 4;
    default: return 0;
  }
};

export default function EquipmentSockets({ character, onUpdateCharacter, triggerAlert }: EquipmentSocketsProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedSocketIdx, setSelectedSocketIdx] = useState<number | null>(null);
  const [isInserting, setIsInserting] = useState(false);

  const equipableItems = character.inventory.filter(item => 
    item.slot !== 'none' && item.slot !== 'consumable' && item.slot !== 'material' && item.slot !== 'rune' && getMaxSockets(item.rarity) > 0
  );

  const inventoryRunes = character.inventory.filter(item => item.slot === 'rune') as (Item & { runeData?: Rune })[];
  // Assuming runes are stored in inventory as items with slot 'rune' and have a runeData property. If they don't, we can simulate them for the demo.
  // Actually, we should probably generate some mock runes if none exist for the demonstration.

  // Let's create some mock runes if they don't exist
  const mockRunes: (Item & { runeData: Rune })[] = [
    {
      id: 'rune_1', name: 'Руна Кровавого Удара', description: '+18% Критического урона', slot: 'rune', price: 100, rarity: 'rare', stats: {},
      runeData: { id: 'r1', name: 'Руна Кровавого Удара', color: 'red', level: 1, effect: '+18% Критического урона' }
    },
    {
      id: 'rune_2', name: 'Руна Стального Сердца', description: '+650 к максимальному здоровью', slot: 'rune', price: 150, rarity: 'rare', stats: {},
      runeData: { id: 'r2', name: 'Руна Стального Сердца', color: 'blue', level: 1, effect: '+650 к максимальному здоровью' }
    },
    {
      id: 'rune_3', name: 'Руна Жизненной Силы', description: '+25% Регенерации', slot: 'rune', price: 100, rarity: 'uncommon', stats: {},
      runeData: { id: 'r3', name: 'Руна Жизненной Силы', color: 'green', level: 1, effect: '+25% Регенерации' }
    },
    {
      id: 'rune_4', name: 'Руна Эха', description: 'После использования ультимейта следующий навык усиливается на 35%', slot: 'rune', price: 500, rarity: 'epic', stats: {},
      runeData: { id: 'r4', name: 'Руна Эха', color: 'purple', level: 1, effect: 'После использования ультимейта следующий навык усиливается на 35%' }
    }
  ];

  const availableRunes = inventoryRunes.length > 0 ? inventoryRunes : mockRunes;

  const handleSelect = (item: Item) => {
    // Initialize sockets if they don't exist
    const maxS = getMaxSockets(item.rarity);
    if (maxS > 0 && (!item.sockets || item.sockets.length < maxS)) {
      const newSockets = [...(item.sockets || [])];
      while(newSockets.length < maxS) {
        newSockets.push({ id: `sock_${Math.random()}`, rune: null });
      }
      const updatedItem = { ...item, sockets: newSockets };
      setSelectedItem(updatedItem);
    } else {
      setSelectedItem(item);
    }
    setSelectedSocketIdx(null);
  };

  const insertRune = (runeItem: Item & { runeData?: Rune }, socketIdx: number) => {
    if (!selectedItem || !selectedItem.sockets) return;
    
    setIsInserting(true);

    setTimeout(() => {
      setIsInserting(false);
      
      const rData = runeItem.runeData || {
        id: runeItem.id,
        name: runeItem.name,
        color: (['red', 'blue', 'green', 'purple', 'gold'][Math.floor(Math.random() * 5)] as RuneColor),
        level: 1,
        effect: runeItem.description
      };

      const newSockets = [...selectedItem.sockets!];
      newSockets[socketIdx] = { ...newSockets[socketIdx], rune: rData };

      const newItem = {
        ...selectedItem,
        sockets: newSockets
      };

      const newInventory = [...character.inventory];
      const itemIndex = newInventory.findIndex(i => i.id === selectedItem.id);
      if (itemIndex > -1) {
        newInventory[itemIndex] = newItem;
      }
      
      // If we used a real inventory rune, we'd remove it from inventory here.
      const runeIndex = newInventory.findIndex(i => i.id === runeItem.id);
      if (runeIndex > -1) {
        newInventory.splice(runeIndex, 1);
      }

      onUpdateCharacter({ ...character, inventory: newInventory });
      setSelectedItem(newItem);
      setSelectedSocketIdx(null);
      
      triggerAlert(`Руна [${rData.name}] успешно инкрустирована!`, 'success');
    }, 1200);
  };

  const removeRune = (socketIdx: number) => {
    if (!selectedItem || !selectedItem.sockets || !selectedItem.sockets[socketIdx].rune) return;
    
    const removedRune = selectedItem.sockets[socketIdx].rune!;
    const newSockets = [...selectedItem.sockets];
    newSockets[socketIdx] = { ...newSockets[socketIdx], rune: null };

    const newItem = {
      ...selectedItem,
      sockets: newSockets
    };

    // Return rune to inventory
    const returnedRuneItem: Item = {
      id: `rune_${Date.now()}`,
      name: removedRune.name,
      description: removedRune.effect,
      slot: 'rune',
      price: 100,
      rarity: 'rare',
      stats: {}
    };

    const newInventory = [...character.inventory, returnedRuneItem];
    const itemIndex = newInventory.findIndex(i => i.id === selectedItem.id);
    if (itemIndex > -1) {
      newInventory[itemIndex] = newItem;
    }

    onUpdateCharacter({ ...character, inventory: newInventory });
    setSelectedItem(newItem);
    triggerAlert(`Руна [${removedRune.name}] успешно извлечена! (За плату)`, 'info');
  };


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6 text-slate-300">
       <div className="flex justify-between items-center border-b border-slate-800 pb-4">
         <div>
           <h3 className="font-serif text-xl font-bold text-emerald-500 uppercase flex items-center gap-2">
             <Hexagon className="h-6 w-6" />
             Алтарь Инкрустации (Руны & Сокеты)
           </h3>
           <p className="text-xs text-slate-400 mt-1 font-mono">
             Вставьте магические руны в высокоуровневую экипировку для получения невероятной силы.
           </p>
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-6">
         {/* Inventory List */}
         <div className="md:w-1/3 bg-slate-950 p-4 rounded-lg border border-slate-800 h-[550px] overflow-y-auto">
           <h4 className="text-[10px] uppercase font-bold text-emerald-400 mb-4 tracking-widest border-b border-slate-800 pb-2">Экипировка (от Rare+)</h4>
           
           {equipableItems.length === 0 ? (
             <div className="text-center text-slate-500 font-mono text-xs mt-10">Нет предметов с сокетами.</div>
           ) : (
             <div className="space-y-2">
               {equipableItems.map(item => (
                 <div 
                   key={item.id} 
                   onClick={() => handleSelect(item)}
                   className={`p-2 rounded border cursor-pointer transition-all flex flex-col justify-center
                     ${selectedItem?.id === item.id ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                   `}
                 >
                   <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold block truncate ${
                       item.rarity === 'legendary' ? 'text-orange-400' :
                       item.rarity === 'epic' ? 'text-purple-400' :
                       item.rarity === 'rare' ? 'text-blue-400' :
                       item.rarity === 'mythic' ? 'text-red-500' : 'text-slate-300'
                     }`}>
                       {item.upgradeLevel ? `+${item.upgradeLevel} ` : ''}{item.name}
                     </span>
                     <span className="text-[9px] text-slate-500 font-mono uppercase">Сокетов: {getMaxSockets(item.rarity)}</span>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Sockets Interface */}
         <div className="md:w-2/3 flex gap-4 h-[550px]">
           {/* Main item view */}
           <div className="flex-1 bg-slate-1000 border-2 border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col items-center">
             {selectedItem ? (
               <div className="w-full max-w-sm animate-fade-in relative z-10 flex flex-col items-center h-full">
                 
                 <div className="text-center mb-8">
                   <h2 className="text-lg font-serif text-slate-200">{selectedItem.name}</h2>
                   <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest">{selectedItem.rarity} | {selectedItem.slot}</p>
                 </div>

                 {/* Sockets visualization */}
                 <div className="flex flex-col gap-4 w-full">
                   {selectedItem.sockets && selectedItem.sockets.map((socket, idx) => (
                     <div 
                       key={socket.id}
                       className={`relative p-4 rounded-lg border-2 flex items-center gap-4 transition-all
                         ${socket.rune ? getRuneColorHex(socket.rune.color) : 'border-slate-700/50 bg-slate-900/50 border-dashed hover:border-emerald-500/50'}
                         ${selectedSocketIdx === idx ? 'ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''}
                       `}
                     >
                       <div 
                         onClick={() => !socket.rune && setSelectedSocketIdx(idx === selectedSocketIdx ? null : idx)}
                         className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                           socket.rune 
                             ? 'border-transparent bg-slate-900/80' 
                             : 'border-slate-600 border-dashed hover:bg-emerald-900/30'
                         }`}
                       >
                         {socket.rune ? getRuneIcon(socket.rune.color) : (
                           selectedSocketIdx === idx ? <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" /> : <Plus className="w-5 h-5 text-slate-600" />
                         )}
                       </div>
                       
                       <div className="flex-1 min-w-0" onClick={() => !socket.rune && setSelectedSocketIdx(idx === selectedSocketIdx ? null : idx)}>
                         {socket.rune ? (
                           <>
                             <div className="font-bold text-sm truncate text-white">{socket.rune.name}</div>
                             <div className="text-[10px] text-slate-300 truncate font-mono">{socket.rune.effect}</div>
                           </>
                         ) : (
                           <div className="text-xs text-slate-500 italic">Пустой сокет 
                             {selectedSocketIdx === idx ? ' (Выберите руну справа)' : ' (Нажмите для инкрустации)'}
                           </div>
                         )}
                       </div>

                       {socket.rune && (
                         <button 
                           onClick={() => removeRune(idx)}
                           className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-400 transition-colors"
                           title="Извлечь руну"
                         >
                           <X className="w-4 h-4" />
                         </button>
                       )}
                     </div>
                   ))}
                 </div>
                 
                 {isInserting && (
                   <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-lg">
                     <Hexagon className="w-12 h-12 text-emerald-400 animate-spin-slow mb-4" />
                     <span className="font-mono text-emerald-400 font-bold uppercase tracking-widest text-sm animate-pulse">
                       Инкрустация руны...
                     </span>
                   </div>
                 )}
               </div>
             ) : (
               <div className="m-auto text-center text-slate-500 font-mono text-sm relative z-10 flex flex-col items-center">
                 <Hexagon className="w-12 h-12 text-slate-700 mb-4 opacity-50" />
                 <p>Выберите мощную экипировку для настройки сокетов</p>
               </div>
             )}
           </div>

           {/* Runes Inventory Panel (Only shows when a empty socket is selected) */}
           {selectedSocketIdx !== null && (
             <div className="w-1/2 md:w-64 bg-slate-950 border border-slate-800 rounded-lg p-3 animate-fade-in-right flex flex-col">
               <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
                 <Sparkles className="w-3 h-3" />
                 Доступные Руны
               </h4>
               
               <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                 {availableRunes.map(ar => {
                   const rColor: RuneColor = ar.runeData?.color || 'blue';
                   return (
                     <div 
                       key={ar.id}
                       onClick={() => insertRune(ar as any, selectedSocketIdx)}
                       className={`p-2 rounded border border-slate-700 bg-slate-900 cursor-pointer hover:border-emerald-500 transition-all`}
                     >
                       <div className="flex items-center justify-between mb-1">
                         <span className="text-[11px] font-bold text-slate-200 truncate pr-2">{ar.name}</span>
                         <span className={`flex-shrink-0 ${rColor === 'red' ? 'text-red-400' : rColor === 'blue' ? 'text-blue-400' : rColor === 'green' ? 'text-emerald-400' : rColor === 'purple' ? 'text-purple-400' : 'text-amber-400'}`}>
                           {getRuneIcon(rColor)}
                         </span>
                       </div>
                       <p className="text-[9px] text-slate-400 leading-tight font-mono">{ar.description || (ar.runeData && ar.runeData.effect)}</p>
                     </div>
                   );
                 })}
               </div>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
