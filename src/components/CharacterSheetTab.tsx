import React, { useState } from 'react';
import { PlayerCharacter, Item, SlotType } from '../types';
import { Shield, Swords, Image as ImageIcon, Zap, Star, Wind, Brain, Droplet, Heart, Info, X, Coins, Package } from 'lucide-react';
import { ItemIconWrapper } from './ItemIcon';
import { getCharacterAvatarUrl } from './AvatarIcon';

interface CharacterSheetTabProps {
  character: PlayerCharacter;
  onUpdateCharacter: (c: PlayerCharacter) => void;
  triggerAlert: (msg: string, type: 'success' | 'error' | 'info') => void;
  language: 'ru' | 'en';
}

export default function CharacterSheetTab({ character, onUpdateCharacter, triggerAlert, language }: CharacterSheetTabProps) {
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  const [hoveredEquipped, setHoveredEquipped] = useState<Item | null>(null);

  const [isDisassembling, setIsDisassembling] = useState(false);

  const equipItem = (item: Item, index: number) => {
    if (item.slot === 'none' || item.slot === 'consumable' || item.slot === 'material' || item.slot === 'rune') {
      triggerAlert(language === 'ru' ? "Этот предмет нельзя экипировать." : "This item cannot be equipped.", "error");
      return;
    }
    
    // Check class restriction
    if (item.allowedClasses && !item.allowedClasses.includes(character.class)) {
      triggerAlert(language === 'ru' ? `Этот предмет доступен только для: ${item.allowedClasses.join(', ')}` : `Requires class: ${item.allowedClasses.join(', ')}`, "error");
      return;
    }

    const currentEquip = character.equipment[item.slot];
    let newInventory = [...character.inventory];
    
    if (index >= 0 && index < newInventory.length) {
       newInventory.splice(index, 1);
    } else {
       const fallbackIndex = newInventory.findIndex(i => i.id === item.id);
       if (fallbackIndex > -1) newInventory.splice(fallbackIndex, 1);
    }

    if (currentEquip) {
      newInventory.push(currentEquip);
    }

    const updatedChar = {
      ...character,
      equipment: { ...character.equipment, [item.slot]: item },
      inventory: newInventory
    };

    onUpdateCharacter(updatedChar);
    setHoveredItem(null);
    triggerAlert(language === 'ru' ? `Экипировано: ${item.name}` : `Equipped: ${item.name}`, 'success');
  };

  const useConsumable = (item: Item, index: number) => {
    if (item.slot !== 'none' && item.slot !== 'consumable') return;
    
    let healAmount = 0;
    if (item.name.includes('Apple') || item.name.includes('Яблок')) healAmount = 30;
    else if (item.name.includes('Bandage') || item.name.includes('Бинт')) healAmount = 50;
    else if (item.name.includes('Potion') || item.name.includes('Зел')) healAmount = 100;
    else healAmount = 20;

    let newInventory = [...character.inventory];
    if (index >= 0 && index < newInventory.length) {
       newInventory.splice(index, 1);
    } else {
       const fallbackIndex = newInventory.findIndex(i => i.id === item.id);
       if (fallbackIndex > -1) newInventory.splice(fallbackIndex, 1);
    }

    const newHp = Math.min(character.maxHp, character.hp + healAmount);

    onUpdateCharacter({
       ...character,
       hp: newHp,
       inventory: newInventory
    });
    
    setHoveredItem(null);
    triggerAlert(language === 'ru' ? `Использовано: ${item.name}. Здоровье +${healAmount}` : `Used: ${item.name}. Health +${healAmount}`, 'success');
  };

  const disassembleItem = (item: Item, index: number) => {
    let newInventory = [...character.inventory];
    if (index >= 0 && index < newInventory.length) {
       newInventory.splice(index, 1);
    }
    
    const goldEarned = item.price ? Math.max(1, Math.floor(item.price / 4)) : 5;
    
    onUpdateCharacter({
       ...character,
       gold: character.gold + goldEarned,
       inventory: newInventory
    });
    
    setHoveredItem(null);
    setIsDisassembling(false);
    triggerAlert(language === 'ru' ? `Предмет разобран. Получено ${goldEarned} золота.` : `Item disassembled. Received ${goldEarned} gold.`, 'success');
  };

  const sortInventory = () => {
    const sorted = [...character.inventory].sort((a, b) => {
      const rarityRank = { 'mythic': 6, 'legendary': 5, 'epic': 4, 'rare': 3, 'uncommon': 2, 'common': 1 };
      const rA = rarityRank[a.rarity as keyof typeof rarityRank] || 0;
      const rB = rarityRank[b.rarity as keyof typeof rarityRank] || 0;
      if (rA !== rB) return rB - rA;
      return a.name.localeCompare(b.name);
    });
    onUpdateCharacter({ ...character, inventory: sorted });
    triggerAlert(language === 'ru' ? 'Сумки рассортированы.' : 'Bags sorted.', 'info');
  };

  const unequipItem = (slot: SlotType) => {
    const currentEquip = character.equipment[slot];
    if (!currentEquip) return;

    if (character.inventory.length >= 40) {
      triggerAlert(language === 'ru' ? `Сумки полны.` : `Inventory full.`, 'error');
      return;
    }

    const updatedChar = {
      ...character,
      equipment: { ...character.equipment, [slot]: null },
      inventory: [...character.inventory, currentEquip]
    };
    onUpdateCharacter(updatedChar);
    // triggerAlert(language === 'ru' ? `Снято снаряжение с ячейки ${slot}` : `Unequipped ${slot}`, 'info');
  };

  const RarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-300 border-[#9d9d9d]';
      case 'uncommon': return 'text-[#1eff00] border-[#1eff00]';
      case 'rare': return 'text-[#0070dd] border-[#0070dd]';
      case 'epic': return 'text-[#a335ee] border-[#a335ee] shadow-[0_0_10px_rgba(163,53,238,0.7)]';
      case 'legendary': return 'text-[#ff8000] border-[#ff8000] shadow-[0_0_15px_rgba(255,128,0,0.8)]';
      case 'mythic': return 'text-[#e6cc80] border-[#e6cc80] shadow-[0_0_15px_rgba(230,204,128,0.8)]';
      default: return 'text-slate-300 border-[#9d9d9d]';
    }
  };

  const RarityHex = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      case 'mythic': return '#e6cc80';
      default: return '#9d9d9d';
    }
  };

  // Group slots classically
  const leftSlots: SlotType[] = ['head', 'amulet', 'head', 'chest', 'hands']; // using head twice to mock shoulders/back for demo since we have limited Slots in types
  const rightSlots: SlotType[] = ['legs', 'feet', 'ring1', 'ring2'];

  const renderEquipSlot = (slot: SlotType, label: string, side: 'left' | 'right' | 'bottom') => {
    const item = character.equipment[slot];
    
    return (
      <div 
        key={slot}
        onClick={() => unequipItem(slot)}
        onMouseEnter={() => setHoveredEquipped(item || null)}
        onMouseLeave={() => setHoveredEquipped(null)}
        className={`w-12 h-12 md:w-14 md:h-14 bg-[#111111] rounded border-[2px] shadow-[inset_0_0_15px_rgba(0,0,0,1)] relative flex items-center justify-center cursor-pointer transition-all hover:brightness-125 z-10 overflow-hidden
          ${item ? `border-[${RarityHex(item.rarity)}]` : 'border-[#5a483a]'}`}
        style={item ? { borderColor: RarityHex(item.rarity) } : {}}
      >
        {/* Metal rivet corners */}
        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-gray-500 rounded-full shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.8)] pointer-events-none"></div>
        <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-gray-500 rounded-full shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.8)] pointer-events-none"></div>
        <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-gray-500 rounded-full shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.8)] pointer-events-none"></div>
        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-gray-500 rounded-full shadow-[inset_-1px_-1px_1px_rgba(0,0,0,0.8)] pointer-events-none"></div>
        
        {/* Glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#d4af37]/0 to-[#d4af37]/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10" />

        {!item && (
          <span className="text-[9px] text-[#444] font-serif uppercase absolute tracking-tighter drop-shadow-[0_1px_0_rgba(0,0,0,1)] z-0 leading-tight text-center px-0.5 font-bold">
            {label}
          </span>
        )}
        {item && (
          <div className="absolute inset-0 bg-[#222] rounded-sm z-10 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
               <ItemIconWrapper item={item} size={32} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none z-10" />
            <span className="absolute bottom-0 right-0 text-[10px] font-bold text-white shadow-[0_0_2px_black] drop-shadow-[1px_1px_0_#000] leading-none mb-0.5 mr-0.5 z-20">
              {item.upgradeLevel ? `+${item.upgradeLevel}` : ''}
            </span>
          </div>
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/50 pointer-events-none z-20"></div>
      </div>
    );
  };

  // Inventory Grid logic
  const TOTAL_INV_SLOTS = 40;
  const invGrid = Array(TOTAL_INV_SLOTS).fill(null);
  character.inventory.forEach((item, index) => {
    if (index < TOTAL_INV_SLOTS) {
      invGrid[index] = item;
    }
  });

  const renderTooltip = (item: Item, isEquipped: boolean) => {
    let rawEquippedItem: Item | null = null;
    if (!isEquipped && item.slot !== 'none' && item.slot !== 'consumable') {
      rawEquippedItem = character.equipment[item.slot] || null;
    }

    const StatDiff = ({ stat, val, currentVal }: { stat: string, val: number, currentVal: number }) => {
      const diff = val - currentVal;
      if (diff === 0) return null;
      return (
        <span className={`text-[11px] ${diff > 0 ? 'text-green-400' : 'text-red-400'} ml-2`}>
          ({diff > 0 ? '+' : ''}{diff})
        </span>
      );
    };

    return (
      <div className="fixed z-[200] flex gap-2 pointer-events-none" style={{ left: '50%', top: '20%', transform: 'translateX(-50%)' }}>
        <div className="bg-[#0f0b09]/95 border-[2px] border-[#5c4a3d] p-4 shadow-[0_0_40px_rgba(0,0,0,0.9)] min-w-[280px] max-w-[340px] rounded-lg animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 pointer-events-none mix-blend-overlay" />
          <div className="relative z-10 flex justify-between items-start mb-2">
            <div className={`text-lg font-bold drop-shadow-[1px_1px_0_#000] leading-tight flex-1`} style={{ color: RarityHex(item.rarity) }}>
               {item.name} {item.upgradeLevel ? `+${item.upgradeLevel}` : ''}
            </div>
            {isEquipped && <span className="text-[9px] uppercase font-bold text-[#d4af37] bg-[#3a2012] px-1.5 py-0.5 rounded border border-[#8b5a2b] shadow-inner ml-2 shrink-0">Надето</span>}
          </div>
          
          <div className="relative z-10 text-[12px] font-bold text-white/90 mb-1 drop-shadow-[1px_1px_0_#000]">
            {language === 'ru' ? 'Уровень предмета: ' : 'Item Level: '}{character.level * 2 + (item.upgradeLevel || 0) * 3}
          </div>
          
          <div className="relative z-10 flex justify-between text-xs text-[#a68c70] font-bold mb-3 drop-shadow-[1px_1px_0_#000] border-b border-[#3a2012] pb-2 uppercase tracking-wide">
             <span>{item.slot !== 'none' ? item.slot : ''}</span>
             <span>{language === 'ru' ? 'Персональный' : 'Soulbound'}</span>
          </div>

          {item.stats && Object.keys(item.stats).length > 0 && (
             <div className="relative z-10 flex flex-col gap-1 text-[13px] mb-3 text-white font-serif tracking-wide border-b border-[#3a2012] pb-3">
               {item.stats.ac && (
                 <div className="flex justify-between items-center bg-[#1a0e06] px-2 py-0.5 rounded border border-[#2a160c]">
                   <span className="drop-shadow-[1px_1px_0_#000] text-gray-300">{item.stats.ac} {language === 'ru' ? 'Броня' : 'Armor'}</span>
                   {!isEquipped && rawEquippedItem?.stats && <StatDiff stat="ac" val={item.stats.ac} currentVal={rawEquippedItem.stats.ac || 0} />}
                 </div>
               )}
               {item.stats.str && (
                 <span className="drop-shadow-[1px_1px_0_#000] text-white">
                   +{item.stats.str} {language === 'ru' ? 'Сила' : 'Strength'}
                   {!isEquipped && rawEquippedItem?.stats && <StatDiff stat="str" val={item.stats.str} currentVal={rawEquippedItem.stats.str || 0} />}
                 </span>
               )}
               {item.stats.sta && (
                 <span className="drop-shadow-[1px_1px_0_#000] text-white">
                   +{item.stats.sta} {language === 'ru' ? 'Выносливость' : 'Stamina'}
                   {!isEquipped && rawEquippedItem?.stats && <StatDiff stat="sta" val={item.stats.sta} currentVal={rawEquippedItem.stats.sta || 0} />}
                 </span>
               )}
               {item.stats.agi && (
                 <span className="drop-shadow-[1px_1px_0_#000] text-white">
                   +{item.stats.agi} {language === 'ru' ? 'Ловкость' : 'Agility'}
                   {!isEquipped && rawEquippedItem?.stats && <StatDiff stat="agi" val={item.stats.agi} currentVal={rawEquippedItem.stats.agi || 0} />}
                 </span>
               )}
               {item.stats.int && (
                 <span className="drop-shadow-[1px_1px_0_#000] text-white">
                   +{item.stats.int} {language === 'ru' ? 'Интеллект' : 'Intellect'}
                   {!isEquipped && rawEquippedItem?.stats && <StatDiff stat="int" val={item.stats.int} currentVal={rawEquippedItem.stats.int || 0} />}
                 </span>
               )}
               {item.stats.hp && <span className="drop-shadow-[1px_1px_0_#000] text-[#1eff00] text-xs">Надевание: Увеличивает максимальный запас здоровья на {item.stats.hp}.</span>}
               {item.stats.mana && <span className="drop-shadow-[1px_1px_0_#000] text-[#1eff00] text-xs">Надевание: Восполняет ману на {item.stats.mana}.</span>}
             </div>
          )}

          {item.allowedClasses && (
             <div className="relative z-10 text-[11px] text-[#ff4444] mb-2 drop-shadow-[1px_1px_0_#000] font-bold uppercase tracking-wider">
               {language === 'ru' ? 'Требуется: ' : 'Requires: '}<span className="text-white">{item.allowedClasses.join(', ')}</span>
             </div>
          )}

          <div className="relative z-10 text-[#ffd700] text-xs font-serif italic drop-shadow-[1px_1px_0_#000] leading-snug">
             "{item.description}"
          </div>
        </div>

        {/* Comparison Tooltip */}
        {!isEquipped && rawEquippedItem && (
           <div className="bg-[#0f0b09]/95 border-[2px] border-[#3a2012] p-4 shadow-[0_0_20px_rgba(0,0,0,0.8)] min-w-[240px] max-w-[280px] rounded-lg animate-fade-in relative overflow-hidden opacity-90 scale-95 origin-left hidden md:block">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-30 pointer-events-none mix-blend-overlay" />
             <div className="relative z-10 text-[10px] text-[#a68c70] font-bold uppercase tracking-widest mb-2 border-b border-[#3a2012] pb-1">
               {language === 'ru' ? 'Текущее снаряжение' : 'Currently Equipped'}
             </div>
             <div className={`relative z-10 text-sm font-bold drop-shadow-[1px_1px_0_#000] leading-tight mb-2`} style={{ color: RarityHex(rawEquippedItem.rarity) }}>
               {rawEquippedItem.name} {rawEquippedItem.upgradeLevel ? `+${rawEquippedItem.upgradeLevel}` : ''}
             </div>
             {rawEquippedItem.stats && Object.keys(rawEquippedItem.stats).length > 0 && (
               <div className="relative z-10 flex flex-col gap-0.5 text-[11px] text-gray-300 font-serif tracking-wide opacity-80">
                 {rawEquippedItem.stats.ac && <span>{rawEquippedItem.stats.ac} {language === 'ru' ? 'Броня' : 'Armor'}</span>}
                 {rawEquippedItem.stats.str && <span>+{rawEquippedItem.stats.str} {language === 'ru' ? 'Сила' : 'Strength'}</span>}
                 {rawEquippedItem.stats.sta && <span>+{rawEquippedItem.stats.sta} {language === 'ru' ? 'Выносливость' : 'Stamina'}</span>}
                 {rawEquippedItem.stats.agi && <span>+{rawEquippedItem.stats.agi} {language === 'ru' ? 'Ловкость' : 'Agility'}</span>}
                 {rawEquippedItem.stats.int && <span>+{rawEquippedItem.stats.int} {language === 'ru' ? 'Интеллект' : 'Intellect'}</span>}
               </div>
             )}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row p-2 gap-4 animate-fade-in font-sans select-none overflow-hidden max-h-screen pb-[120px]">
      
      {/* Container simulating the big Heavy Window */}
      <div className="flex-1 min-h-[800px] md:min-h-0 bg-[#3a2012] border-[6px] border-double border-[#8b5a2b] shadow-[0_20px_60px_rgba(0,0,0,1)] rounded-lg relative flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
         {/* Background Texture Leather */}
         <div className="absolute inset-0 bg-[#29160c] opacity-90 rounded-sm" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-100 mix-blend-multiply pointer-events-none rounded-sm" />
         
         {/* Top Header Plate - Leather & Bronze insert */}
         <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-[#1a0e06] to-[#29160c] z-20 flex justify-center items-center shadow-[0_4px_10px_rgba(0,0,0,0.8)] border-b-[2px] border-[#5c3e21] mx-4 mt-2 rounded-t-lg pointer-events-none">
            <h2 className="text-[#ffd700] font-bold text-lg md:text-xl uppercase tracking-[0.15em] drop-shadow-[2px_2px_1px_#000] flex items-center justify-center w-full" style={{ fontFamily: 'Friz Quadrata, serif' }}>
               <span className="w-16 h-px bg-gradient-to-r from-transparent to-[#8b5a2b] mr-4 opacity-70" />
               {language === 'ru' ? 'Снаряжение' : 'Equipment'}
               <span className="w-16 h-px bg-gradient-to-l from-transparent to-[#8b5a2b] ml-4 opacity-70" />
            </h2>
         </div>

         {/* ================= LEFT SIDE: PAPER DOLL (60%) ================= */}
         <div className="w-full md:w-[60%] min-h-[500px] md:min-h-0 relative flex flex-col items-center justify-center border-b-[4px] md:border-b-0 md:border-r-[6px] border-[#201007] z-10 pt-16 pb-8 md:pb-4 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)]">
            
            {/* Character Info (Top) */}
            <div className="absolute top-16 text-center z-20 drop-shadow-[2px_2px_0_#000]">
               <div className="text-white font-serif text-xl tracking-wider">{character.name}</div>
               <div className="text-[#ffb600] text-xs font-mono uppercase tracking-widest mt-1">
                 Ур. {character.level} • {character.race} • {character.class}
               </div>
            </div>

            {/* Platform / Background for Character - Stone with runes */}
            <div className="absolute inset-x-0 bottom-12 md:bottom-16 h-32 flex justify-center items-end z-0 pointer-events-none">
               <div className="absolute w-[80%] md:w-[70%] h-20 md:h-24 bg-[#111] rounded-[100%] shadow-[0_0_50px_rgba(0,0,0,1)] border-t-[3px] border-[#3a2012] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-30" />
                  <div className="w-full h-full rounded-[100%] border-[2px] border-purple-500/30 scale-90 flex items-center justify-center shadow-[inset_0_0_20px_rgba(168,85,247,0.3)]">
                     <span className="text-purple-400/10 text-xl md:text-3xl font-black tracking-[1em] rotate-12 blur-[1px]">ᚱᛁᚠᛏ</span>
                  </div>
               </div>
            </div>

            {/* Middle Big Character Portrait (Simulating 3D Model view) */}
            <div className="w-[85%] md:w-[90%] h-[60%] md:h-[70%] z-10 mt-16 md:mt-12 relative flex justify-center pointer-events-none">
                <img 
                  src={getCharacterAvatarUrl(character)}
                  alt="Character Model"
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_15px_rgba(0,0,0,0.8)] scale-110 md:scale-[1.25] origin-bottom transition-all duration-500 hover:brightness-110"
                />
            </div>

            {/* Slots Placements - WoW Style Arranged precisely around character */}
            {/* Left Column Slots */}
            <div className="absolute left-3 md:left-6 top-28 md:top-32 bottom-28 md:bottom-36 flex flex-col justify-between z-20 py-2">
               {renderEquipSlot('head', 'Голова', 'left')}
               {renderEquipSlot('amulet', 'Шея', 'left')}
               {renderEquipSlot('shoulders', 'Плечи', 'left')}
               {renderEquipSlot('chest', 'Грудь', 'left')}
               {renderEquipSlot('hands', 'Наручи', 'left')}
            </div>

            {/* Right Column Slots */}
            <div className="absolute right-3 md:right-6 top-28 md:top-32 bottom-28 md:bottom-36 flex flex-col justify-between z-20 py-2">
               {renderEquipSlot('cloak', 'Плащ', 'right')}
               {renderEquipSlot('waist', 'Пояс', 'right')}
               {renderEquipSlot('legs', 'Поножи', 'right')}
               {renderEquipSlot('feet', 'Ступни', 'right')}
               <div className="flex gap-1 md:gap-2 justify-end w-full">
                 <div className="scale-75 md:scale-90 origin-right">{renderEquipSlot('ring1', 'Кольцо', 'right')}</div>
                 <div className="scale-75 md:scale-90 origin-right">{renderEquipSlot('ring2', 'Кольцо', 'right')}</div>
               </div>
            </div>

            {/* Bottom Weapons */}
            <div className="absolute bottom-6 md:bottom-10 inset-x-0 flex justify-center gap-6 md:gap-10 z-20">
               {renderEquipSlot('primary', 'Пр. Рука', 'bottom')}
               {renderEquipSlot('secondary', 'Лев. Рука', 'bottom')}
            </div>
         </div>

         {/* ================= RIGHT SIDE: INVENTORY (40%) ================= */}
         <div className="w-full md:w-[40%] flex flex-col relative z-20 bg-[#160c07] shadow-[inset_20px_0_30px_rgba(0,0,0,0.8)] h-full overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')] opacity-40 pointer-events-none" />
            
            {/* Bag Tabs Header */}
            <div className="flex px-4 pt-10 md:pt-16 pb-2 gap-2 border-b-[3px] border-[#29160c] bg-gradient-to-b from-[#29160c]/60 to-[#160c07] relative z-10 items-end">
               {/* Main Backpack */}
               <div className="w-9 h-11 border-[2px] border-[#8b5a2b] bg-[#2a1a0d] shadow-[0_0_10px_rgba(0,0,0,0.8)] rounded-md opacity-100 cursor-pointer relative overflow-hidden flex flex-col items-center justify-center group hover:brightness-125">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-80 mix-blend-multiply"></div>
                 <Package size={20} className="text-[#d4af37] drop-shadow-[0_2px_2px_rgba(0,0,0,1)] relative z-10 group-hover:scale-110 transition-transform" />
                 <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"></div>
               </div>
               
               {/* Extra Bags */}
               {[1, 2, 3].map((bagNum) => (
                 <div key={bagNum} className="w-7 h-9 border-[2px] border-[#4a3623] bg-[#1a0e06] shadow-[inset_0_0_10px_rgba(0,0,0,1)] rounded-md opacity-70 hover:opacity-100 cursor-pointer flex flex-col items-center justify-center relative group transition-all">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-40 mix-blend-multiply"></div>
                   <div className="w-2.5 h-3 rounded bg-[#3a2012] group-hover:bg-[#5c3e21] border border-[#2a160c] relative z-10 transition-colors shadow"></div>
                 </div>
               ))}
               
               <div className="flex-1 text-right pb-1 flex justify-end gap-1 items-end">
                 <span className="text-[#a68c70] font-mono text-[10px] uppercase font-bold tracking-widest bg-[#1a0e06] px-1.5 py-0.5 rounded border border-[#29160c]">
                   {character.inventory.length} <span className="text-[#5c3e21]">/</span> {TOTAL_INV_SLOTS}
                 </span>
               </div>
            </div>

            {/* Inventory Grid Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 md:p-3 relative z-10">
               {/* Inner metal frame */}
               <div className="min-h-full bg-[#110804] border-[2px] border-[#29160c] rounded p-2 md:p-3 shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/padded-light.png')] opacity-[0.03] pointer-events-none" />
                 
                 <div className="grid grid-cols-5 md:grid-cols-5 gap-1 md:gap-[6px] auto-rows-max place-items-center relative z-10">
                    {invGrid.map((item, i) => (
                      <div 
                        key={i}
                        onMouseEnter={() => item && setHoveredItem(item)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => {
                          if (item) {
                            if (isDisassembling) {
                              disassembleItem(item, i);
                            } else if (item.slot === 'none' || item.slot === 'consumable') {
                              useConsumable(item, i);
                            } else {
                              equipItem(item, i);
                            }
                          }
                        }}
                        className={`w-[42px] h-[42px] md:w-[46px] md:h-[46px] border-[2px] rounded relative flex items-center justify-center bg-[#222] shadow-[inset_0_0_15px_rgba(0,0,0,1)] cursor-pointer group transition-all hover:z-20 bg-cover bg-center overflow-hidden
                          ${item ? (isDisassembling ? `border-[#ff4444] hover:bg-[#330000] cursor-crosshair shadow-[0_0_10px_rgba(255,0,0,0.5)]` : `border-[${RarityHex(item.rarity)}] hover:brightness-125`) : 'border-[#29160c] hover:border-[#3a2012]'}`}
                        style={item ? { borderColor: isDisassembling ? '#ff4444' : RarityHex(item.rarity) } : {}}
                      >
                         {!item && (
                            <div className="w-full h-full opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] pointer-events-none mix-blend-multiply" />
                         )}
                         {item && (
                            <>
                               <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
                                 <ItemIconWrapper item={item} size={24} />
                               </div>
                               <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none rounded-[2px]" />
                               {/* Item level corner */}
                               <span className="absolute bottom-0 right-1 text-[10px] font-bold text-white drop-shadow-[1px_1px_1px_#000] z-10 leading-none pb-0.5 pointer-events-none font-mono">
                                 {item.name.includes('Apple') || item.name.includes('Potion') ? '5' : (item.upgradeLevel ? `+${item.upgradeLevel}` : '')}
                               </span>
                               {/* Inner shadow for 3D effect */}
                               <div className="absolute inset-0 shadow-[inset_0_0_6px_rgba(0,0,0,0.8)] pointer-events-none rounded-[2px]" />
                            </>
                         )}
                      </div>
                    ))}
                 </div>
               </div>
            </div>

            {/* Bottom Actions Bar (Gold & Weight) */}
            <div className="absolute bottom-0 inset-x-0 h-14 border-t-[3px] border-[#4a2e1b] bg-gradient-to-t from-[#110804] to-[#29160c] flex items-center justify-between px-3 md:px-4 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] gap-2">
               
               <div className="flex flex-col gap-1">
                 {/* Weight */}
                 <div className="font-serif text-[10px] uppercase font-bold text-[#8a7258] drop-shadow-[1px_1px_0_#000] flex items-center gap-1">
                    Вес: <span className="text-[#d8c3a5] tracking-wide ml-1">184<span className="text-[#8a7258] mx-0.5">/</span>260</span>
                 </div>
                 {/* Gold Currency */}
                 <div className="flex items-center gap-2 bg-[#0a0502] px-2 py-0.5 rounded border border-[#29160c] shadow-inner">
                    <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-white drop-shadow-[1px_1px_0_#000]">
                       {Math.floor(character.gold / 10000) || 0}
                       <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-600 border border-yellow-800" title="Gold" />
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-white drop-shadow-[1px_1px_0_#000]">
                       {Math.floor((character.gold % 10000) / 100) || 0}
                       <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-gray-300 to-gray-500 border border-gray-700" title="Silver" />
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-white drop-shadow-[1px_1px_0_#000]">
                       {(character.gold % 100) || 0}
                       <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-b from-orange-400 to-orange-700 border border-orange-900" title="Copper" />
                    </div>
                 </div>
               </div>

               <div className="flex gap-1.5 md:gap-2">
                  <button onClick={() => setIsDisassembling(!isDisassembling)} className={`bg-gradient-to-b ${isDisassembling ? 'from-[#4a1010] to-[#200505] border-[#ff4444]' : 'from-[#2a170f] to-[#110804] border-[#5c3e21]'} hover:brightness-125 border text-[#a68c70] px-2.5 md:px-3 py-1.5 text-[9px] font-bold uppercase rounded shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all drop-shadow-[1px_1px_0_#000]`}>{isDisassembling ? 'Отмена' : 'Разобрать'}</button>
                  <button onClick={sortInventory} className="bg-gradient-to-b from-[#2a170f] to-[#110804] hover:brightness-125 border border-[#5c3e21] text-[#a68c70] px-2.5 md:px-3 py-1.5 text-[9px] font-bold uppercase rounded shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-all drop-shadow-[1px_1px_0_#000]">Сортировка</button>
               </div>
            </div>
         </div>

      </div>

      {hoveredEquipped && renderTooltip(hoveredEquipped, true)}
      {hoveredItem && renderTooltip(hoveredItem, false)}
    </div>
  );
}

