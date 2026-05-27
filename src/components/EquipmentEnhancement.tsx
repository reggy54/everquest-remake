import React, { useState } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Hammer, Zap, ArrowUpCircle, ShieldAlert, Sparkles, RefreshCcw } from 'lucide-react';

interface EquipmentEnhancementProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

export default function EquipmentEnhancement({ character, onUpdateCharacter, triggerAlert }: EquipmentEnhancementProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [useProtection, setUseProtection] = useState(false);

  const equipableItems = character.inventory.filter(item => item.slot !== 'none' && item.slot !== 'consumable' && item.slot !== 'material');

  const getEnhancementCost = (level: number) => {
    if (level < 5) return { type: 'Энергия Разлома', amount: 2, chance: 100 };
    if (level < 10) return { type: 'Улучшенная Энергия', amount: 3, chance: 90 };
    if (level < 15) return { type: 'Редкая Энергия', amount: 5, chance: 70 };
    if (level < 20) return { type: 'Энергия Судьбы', amount: 10, chance: 45 };
    if (level < 25) return { type: 'Энергия Легенды', amount: 15, chance: 25 };
    return { type: 'Энергия Этерии', amount: 20, chance: 10 };
  };

  const handleSelect = (item: Item) => {
    setSelectedItem(item);
    setUseProtection(false);
  };

  const currentLvl = selectedItem?.upgradeLevel || 0;
  const cost = selectedItem ? getEnhancementCost(currentLvl) : null;

  const performEnhancement = () => {
    if (!selectedItem || !cost) return;
    
    // Check for resources (we simulate having enough for now, or check gold)
    if (character.gold < cost.amount * 10) {
      triggerAlert('Недостаточно ресурсов (нужно больше Золота для симуляции стоимости)!', 'error');
      return;
    }

    setIsEnhancing(true);

    setTimeout(() => {
      setIsEnhancing(false);
      const isSuccess = (Math.random() * 100) <= cost.chance;
      const isCrit = isSuccess && (Math.random() * 100) <= 5; // 5% crit success
      const isCritFail = !isSuccess && !useProtection && (Math.random() * 100) <= 10; // 10% break on fail if no prot

      const updatedChar = { ...character, gold: character.gold - (cost.amount * 10) };
      const newInventory = [...character.inventory];
      const itemIndex = newInventory.findIndex(i => i.id === selectedItem.id);

      if (isCritFail && currentLvl > 10) {
        // Item breaks!
        newInventory.splice(itemIndex, 1);
        triggerAlert(`КРИТИЧЕСКИЙ ПРОВАЛ! Предмет [${selectedItem.name}] был разрушен!`, 'error');
        updatedChar.inventory = newInventory;
        setSelectedItem(null);
      } else if (isSuccess) {
        const levelsGained = isCrit ? 2 : 1;
        const newItem = {
          ...selectedItem,
          upgradeLevel: currentLvl + levelsGained
        };
        newInventory[itemIndex] = newItem;
        updatedChar.inventory = newInventory;
        setSelectedItem(newItem);
        if (isCrit) {
           triggerAlert(`КРИТИЧЕСКИЙ УСПЕХ! Предмет [${selectedItem.name}] улучшен сразу на +2!`, 'success');
        } else {
           triggerAlert(`Успешно! Предмет [${selectedItem.name}] улучшен до +${newItem.upgradeLevel}.`, 'success');
        }
      } else {
        // Fail
        if (useProtection) {
          triggerAlert(`Улучшение провалилось. Защитный свиток предотвратил падение уровня.`, 'warning');
        } else {
          const newLvl = Math.max(0, currentLvl - 1);
          const newItem = {
            ...selectedItem,
            upgradeLevel: newLvl
          };
          newInventory[itemIndex] = newItem;
          updatedChar.inventory = newInventory;
          setSelectedItem(newItem);
          triggerAlert(`Провал! Уровень предмета упал до +${newLvl}.`, 'error');
        }
      }

      onUpdateCharacter(updatedChar);
    }, 2500); // 2.5 seconds cinematic wait
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6 text-slate-300">
       <div className="flex justify-between items-center border-b border-slate-800 pb-4">
         <div>
           <h3 className="font-serif text-xl font-bold text-amber-500 uppercase flex items-center gap-2">
             <Hammer className="h-6 w-6" />
             Кузня Расколотого Горизонта
           </h3>
           <p className="text-xs text-slate-400 mt-1 font-mono">
             Улучшайте экипировку, вплетайте Энергию Разломов и достигайте мифических высот.
           </p>
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-6">
         {/* Inventory List */}
         <div className="md:w-1/3 bg-slate-950 p-4 rounded-lg border border-slate-800 h-[500px] overflow-y-auto">
           <h4 className="text-[10px] uppercase font-bold text-indigo-400 mb-4 tracking-widest border-b border-slate-800 pb-2">Доступная экипировка</h4>
           
           {equipableItems.length === 0 ? (
             <div className="text-center text-slate-500 font-mono text-xs mt-10">В сумке нет доступной экипировки.</div>
           ) : (
             <div className="space-y-2">
               {equipableItems.map(item => (
                 <div 
                   key={item.id} 
                   onClick={() => handleSelect(item)}
                   className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between
                     ${selectedItem?.id === item.id ? 'bg-amber-900/30 border-amber-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}
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

         {/* Enhancement Altar */}
         <div className="md:w-2/3 bg-slate-1000 border-2 border-slate-800 rounded-lg p-6 relative overflow-hidden flex flex-col items-center justify-center">
           {selectedItem && cost ? (
             <div className="w-full max-w-md animate-fade-in relative z-10">
               {/* Item Display */}
               <div className="text-center mb-8">
                 <div className="w-24 h-24 mx-auto bg-slate-900 border border-amber-500/50 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center justify-center mb-4 relative">
                   {isEnhancing && (
                     <div className="absolute inset-0 bg-blue-500/20 rounded-lg animate-pulse" />
                   )}
                   <Zap className={`w-10 h-10 ${
                     selectedItem.rarity === 'legendary' ? 'text-orange-400' :
                     selectedItem.rarity === 'epic' ? 'text-purple-400' : 'text-blue-400'
                   } ${isEnhancing ? 'animate-bounce' : ''}`} />
                   
                   {currentLvl > 0 && (
                     <span className="absolute -top-3 -right-3 bg-amber-600 text-amber-100 font-black px-2 py-1 rounded text-xs">
                       +{currentLvl}
                     </span>
                   )}
                 </div>
                 
                 <h2 className="text-lg font-serif text-slate-200">{selectedItem.name}</h2>
                 <p className="text-xs text-slate-400 mt-1 font-mono">Шанс успеха: {cost.chance}%</p>
               </div>

               {/* Costs & Options */}
               <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg mb-6">
                 <div className="flex justify-between items-center mb-3">
                   <span className="text-xs font-mono text-slate-400">Требуется:</span>
                   <span className="text-xs font-bold text-emerald-400">{cost.type} x{cost.amount}</span>
                 </div>
                 
                 {currentLvl >= 5 && (
                   <label className="flex items-center gap-3 cursor-pointer mt-4 p-2 bg-slate-950 rounded border border-slate-800 hover:border-amber-900 transition-colors">
                     <input 
                       type="checkbox" 
                       className="form-checkbox text-amber-600 bg-slate-800 border-slate-700 rounded"
                       checked={useProtection}
                       onChange={(e) => setUseProtection(e.target.checked)}
                       disabled={isEnhancing}
                     />
                     <div>
                       <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Использовать Защитный Свиток</span>
                       <span className="text-[9px] text-slate-500 block">Защищает от падения уровня или разрушения при провале</span>
                     </div>
                   </label>
                 )}
               </div>

               {/* Action */}
               <button
                 onClick={performEnhancement}
                 disabled={isEnhancing}
                 className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold uppercase tracking-widest py-4 rounded focus:outline-none transition-all border border-amber-400/50 shadow-lg cursor-pointer disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2"
               >
                 {isEnhancing ? (
                   <>
                     <RefreshCcw className="w-5 h-5 animate-spin" />
                     Синтез Энергии...
                   </>
                 ) : (
                   <>
                     <ArrowUpCircle className="w-5 h-5" />
                     Улучшить до +{currentLvl + 1}
                   </>
                 )}
               </button>
             </div>
           ) : (
             <div className="text-center text-slate-500 font-mono text-sm relative z-10 flex flex-col items-center">
               <Sparkles className="w-12 h-12 text-slate-700 mb-4 opacity-50" />
               <p>Выберите предмет из сумки для наложения силы Разлома</p>
             </div>
           )}
           
           {/* Background Decals */}
           <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-5">
             <Hammer className="w-96 h-96" />
           </div>
         </div>
       </div>
    </div>
  );
}
