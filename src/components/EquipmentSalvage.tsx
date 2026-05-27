import React, { useState } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Trash2, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

interface EquipmentSalvageProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export default function EquipmentSalvage({ character, onUpdateCharacter, triggerAlert }: EquipmentSalvageProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isSalvaging, setIsSalvaging] = useState(false);

  const equipableItems = character.inventory.filter(item => item.slot !== 'none' && item.slot !== 'consumable' && item.slot !== 'material');

  const handleSelect = (item: Item) => {
    setSelectedItem(item);
  };

  const performSalvage = () => {
    if (!selectedItem) return;

    setIsSalvaging(true);

    setTimeout(() => {
      setIsSalvaging(false);

      const updatedChar = { ...character };
      const newInventory = [...character.inventory];
      const itemIndex = newInventory.findIndex(i => i.id === selectedItem.id);
      
      if (itemIndex > -1) {
        newInventory.splice(itemIndex, 1);
        updatedChar.inventory = newInventory;
        
        // Give some random materials/gold
        const goldReturned = Math.floor(selectedItem.price * 0.3) + 10;
        updatedChar.gold += goldReturned;
        
        // Example: adding a material
        const matAmount = selectedItem.rarity === 'uncommon' ? 2 : selectedItem.rarity === 'rare' ? 5 : selectedItem.rarity === 'epic' ? 10 : selectedItem.rarity === 'legendary' ? 25 : 1;
        const matItem: Item = {
           id: `mat_${Date.now()}`,
           name: `Энергия Разлома (${selectedItem.rarity})`,
           description: 'Материал полученный при разборе экипировки',
           slot: 'material',
           price: matAmount,
           rarity: selectedItem.rarity,
           stats: {}
        };
        // Add multiple copies to simulate quantity, or just one aggregated item for this mock
        updatedChar.inventory.push(matItem);

        onUpdateCharacter(updatedChar);
        setSelectedItem(null);
        triggerAlert(`Вы разобрали [${selectedItem.name}] и получили +${goldReturned} золота и материалы!`, 'info');
      }
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6 text-slate-300">
       <div className="flex justify-between items-center border-b border-slate-800 pb-4">
         <div>
           <h3 className="font-serif text-xl font-bold text-red-500 uppercase flex items-center gap-2">
             <Trash2 className="h-6 w-6" />
             Дробитель (Разбор)
           </h3>
           <p className="text-xs text-slate-400 mt-1 font-mono">
             Уничтожьте ненужную экипировку для получения ценных ресурсов и Энергии Разлома.
           </p>
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-6">
         {/* Inventory List */}
         <div className="md:w-1/2 bg-slate-950 p-4 rounded-lg border border-slate-800 h-[400px] overflow-y-auto">
           <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-widest border-b border-slate-800 pb-2">Доступная экипировка</h4>
           
           {equipableItems.length === 0 ? (
             <div className="text-center text-slate-500 font-mono text-xs mt-10">В сумке нет доступной экипировки.</div>
           ) : (
             <div className="space-y-2">
               {equipableItems.map(item => (
                 <div 
                   key={item.id} 
                   onClick={() => handleSelect(item)}
                   className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between
                     ${selectedItem?.id === item.id ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
                   `}
                 >
                   <div className="truncate">
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
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Salvage Altar */}
         <div className="md:w-1/2 bg-slate-1000 border-2 border-red-900/30 rounded-lg p-6 relative overflow-hidden flex flex-col items-center justify-center">
           {selectedItem ? (
             <div className="w-full max-w-sm animate-fade-in relative z-10 text-center flex flex-col h-full">
               
               <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
               <h2 className="text-lg font-serif text-slate-200">{selectedItem.name}</h2>
               <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono tracking-widest mb-6">{selectedItem.rarity} | {selectedItem.slot}</p>

               <div className="bg-slate-900/50 border border-slate-800 rounded p-4 text-left mb-auto">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Ожидаемые ресурсы</h4>
                 <ul className="text-xs space-y-1 text-slate-300 font-mono">
                   <li>• ~{Math.floor(selectedItem.price * 0.3) + 10} Золота</li>
                   <li>• Энергия Разлома ({selectedItem.rarity})</li>
                   <li className="text-slate-500 italic">• Небольшой шанс на редкие материалы...</li>
                 </ul>
               </div>

               <button
                 onClick={performSalvage}
                 disabled={isSalvaging}
                 className="mt-6 w-full bg-red-900 hover:bg-red-800 text-red-100 font-bold uppercase tracking-widest py-3 rounded focus:outline-none transition-all border border-red-700/50 cursor-pointer disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2"
               >
                 {isSalvaging ? (
                   <>
                     <Zap className="w-5 h-5 animate-pulse" />
                     Разбор...
                   </>
                 ) : (
                   <>
                     <Trash2 className="w-5 h-5" />
                     Разобрать Навсегда
                   </>
                 )}
               </button>
             </div>
           ) : (
             <div className="text-center text-slate-500 font-mono text-sm relative z-10 flex flex-col items-center">
               <ShieldAlert className="w-12 h-12 text-slate-700 mb-4 opacity-30" />
               <p>Выберите предмет для безвозвратного разбора на материалы</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
}
