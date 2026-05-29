import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Item, SlotType } from '../types';
import { Search, Database, Vault, Package, ArrowRightLeft, MoveDown, Lock, Download } from 'lucide-react';
import { ItemIconWrapper } from './ItemIcon';
import { getCharacterAvatarUrl } from './AvatarIcon';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface BankTabProps {
  character: PlayerCharacter;
  language: 'ru' | 'en';
  onUpdateCharacter: (c: PlayerCharacter) => void;
  triggerAlert: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const NPC_RU = [
  "Твои секреты в безопасности, если заплатишь вовремя.",
  "За хранение берем недорого. В основном.",
  "Не потеряй ключи! Дубликат стоит втрое дороже.",
  "Тут безопасно, как в брюхе дракона... Стоп, это плохой пример."
];

const NPC_EN = [
  "Your secrets are safe, if you pay on time.",
  "We don't charge much for storage. Mostly.",
  "Don't lose the keys! A duplicate costs triple.",
  "It's as safe here as in a dragon's belly... Wait, that's a bad example."
];

export default function BankTab({ character, language, onUpdateCharacter, triggerAlert }: BankTabProps) {
  const [npcPhrase, setNpcPhrase] = useState('');
  const [bankTab, setBankTab] = useState<'main' | 'chest1' | 'chest2'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredItem, setHoveredItem] = useState<Item | null>(null);
  
  // Real-time Global Bank State
  const [globalBankItems, setGlobalBankItems] = useState<{ id: string, item: Item, depositorName: string }[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'bank_items')), (snapshot) => {
       const items = snapshot.docs.map(doc => ({
           id: doc.id,
           item: doc.data().item as Item,
           depositorName: doc.data().depositorName as string
       }));
       setGlobalBankItems(items);
    }, (error) => {
       console.error("Bank Error: ", error);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const phrases = language === 'ru' ? NPC_RU : NPC_EN;
    setNpcPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
  }, [language]);

  const RarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-400 border-slate-600';
      case 'uncommon': return 'text-green-400 border-green-500/50';
      case 'rare': return 'text-blue-400 border-blue-500/50';
      case 'epic': return 'text-purple-400 border-purple-500/50';
      case 'legendary': return 'text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'mythic': return 'text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(243,114,118,0.3)]';
      default: return 'text-slate-400 border-slate-600';
    }
  };

  const getSlotName = (slot: string) => {
    const names: Record<string, string> = {
      head: language === 'ru' ? 'Голова' : 'Head',
      chest: language === 'ru' ? 'Тело' : 'Chest',
      hands: language === 'ru' ? 'Перчатки' : 'Hands',
      legs: language === 'ru' ? 'Ноги' : 'Legs',
      feet: language === 'ru' ? 'Обувь' : 'Feet',
      primary: language === 'ru' ? 'Оружие' : 'Primary',
      secondary: language === 'ru' ? 'Вторая рука' : 'Secondary',
      ring1: language === 'ru' ? 'Кольцо' : 'Ring',
      ring2: language === 'ru' ? 'Кольцо' : 'Ring',
      amulet: language === 'ru' ? 'Амулет' : 'Amulet',
    };
    return names[slot] || slot;
  };

  const maxBankSlots = 560; // Huge shared bank
  const maxInvSlots = 50;

  const handleDeposit = async (item: Item) => {
    if (globalBankItems.length >= maxBankSlots) {
       triggerAlert(language === 'ru' ? 'В банке нет места!' : 'Bank is full!', 'error');
       return;
    }
    
    // Remove from local inventory
    const updatedChar = {
       ...character,
       inventory: character.inventory.filter(i => i.id !== item.id),
    };
    onUpdateCharacter(updatedChar);

    // Push to global bank
    try {
        await addDoc(collection(db, 'bank_items'), {
           item: item,
           depositorName: character.name,
           createdAt: Date.now()
        });
    } catch(err) {
        triggerAlert('Error depositing.', 'error');
    }
  };

  const handleWithdraw = async (bankRecord: { id: string, item: Item, depositorName: string }) => {
    if (character.inventory.length >= maxInvSlots) {
       triggerAlert(language === 'ru' ? 'Рюкзак переполнен!' : 'Inventory is full!', 'error');
       return;
    }
    
    try {
       // Claim from global bank
       await deleteDoc(doc(db, 'bank_items', bankRecord.id));
       
       // Add to local inventory
       const updatedChar = {
          ...character,
          inventory: [...character.inventory, bankRecord.item]
       };
       onUpdateCharacter(updatedChar);
       triggerAlert(language === 'ru' ? `Получено: ${bankRecord.item.name}` : `Withdrawn: ${bankRecord.item.name}`, 'success');
    } catch(err) {
       triggerAlert('Someone else might have claimed it!', 'error');
    }
  };

  const currentTabItems = globalBankItems.filter(record => searchQuery ? record.item.name.toLowerCase().includes(searchQuery.toLowerCase()) : true);

  // Generate grid placeholders
  const bankGrid = Array.from({ length: Math.max(56, Math.ceil(currentTabItems.length / 8) * 8) }).map((_, i) => currentTabItems[i] || null);

  const leftSlots: SlotType[] = ['head', 'chest', 'hands', 'legs', 'feet'];
  const rightSlots: SlotType[] = ['primary', 'secondary', 'ring1', 'amulet'];

  return (
    <div className="w-full h-full p-2 animate-fade-in font-sans select-none pb-[120px]">
       
       {/* Main Heavy Window Frame */}
       <div className="max-w-[1240px] mx-auto bg-[#171c26] border-[4px] border-[#2b3548] shadow-[0_20px_60px_rgba(0,0,0,1)] rounded-lg relative flex flex-col xl:flex-row h-auto min-h-[750px] overflow-hidden">
          
          {/* Background Texture Vault */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />
          
          {/* Top Title Bar */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#1b2233] to-transparent z-20 flex justify-center items-start pt-1 pointer-events-none">
             <div className="absolute left-2 top-2 w-3 h-3 bg-[#3a4863] rounded-full border-2 border-[#121620] shadow-[inset_1px_1px_rgba(255,255,255,0.2)]"></div>
             <div className="absolute right-2 top-2 w-3 h-3 bg-[#3a4863] rounded-full border-2 border-[#121620] shadow-[inset_1px_1px_rgba(255,255,255,0.2)]"></div>
             
             <h2 className="text-[#a5b4fc] font-bold text-xl uppercase tracking-widest drop-shadow-[2px_2px_0_#000]" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                {language === 'ru' ? 'Хранилище Разлома' : 'Bank of Etheria'}
             </h2>
          </div>

          {/* NPC Dwarf Keeper */}
          <div className="absolute top-8 left-4 z-40 hidden lg:flex items-start gap-4 pointer-events-none">
             <div className="flex flex-col items-center">
                <span className="text-[#60a5fa] font-bold text-[10px] uppercase bg-black/60 px-2 rounded-t drop-shadow-[1px_1px_0_#000]">Брогнир</span>
                <div className="w-20 h-20 bg-[url('https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=DwarfKeeper&backgroundColor=111&skinColor=e0ac69')] bg-cover border-[3px] border-[#3a4863] rounded-b shadow-[0_0_15px_rgba(0,0,0,1)]"></div>
             </div>
             
             <div className="mt-2 bg-[#1b2233] text-[#e2e8f0] border border-[#3a4863] px-3 py-2 rounded-lg text-xs font-serif max-w-[200px] shadow-[0_4px_15px_rgba(0,0,0,0.8)] relative">
                <div className="absolute top-4 -left-2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-[#3a4863] border-b-[6px] border-b-transparent"></div>
                "{npcPhrase}"
             </div>
          </div>

          {/* ================= 1. LEFT: BANK VAULT (MAIN GRIDS) ================= */}
          <div className="w-full xl:w-[65%] flex flex-col z-20 pt-10 border-b xl:border-b-0 xl:border-r-[4px] border-[#2b3548] shadow-[inset_-20px_0_30px_rgba(0,0,0,0.8)] relative min-h-[500px]">
             
             {/* Subtabs for Chests */}
             <div className="flex px-4 md:px-32 xl:px-44 gap-2 mt-2 lg:mt-6 mb-2">
                {[
                  { id: 'main', label: language === 'ru' ? 'Ячейка 1' : 'Vault 1', lock: false },
                  { id: 'chest1', label: language === 'ru' ? 'Ячейка 2' : 'Vault 2', lock: true },
                  { id: 'chest2', label: language === 'ru' ? 'Ячейка 3' : 'Vault 3', lock: true },
                ].map(tab => (
                   <button
                     key={tab.id}
                     onClick={() => { if(!tab.lock) setBankTab(tab.id as any) }}
                     className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase rounded-t-lg border-x border-t transition-all
                       ${bankTab === tab.id 
                          ? 'bg-[#1b2233] border-[#4a5f8c] text-[#a5b4fc] shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'bg-[#121620] border-[#2b3548] text-[#64748b] hover:bg-[#1f2937]'
                       }
                       ${tab.lock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                     `}
                   >
                     {tab.lock && <Lock size={12} />}
                     {tab.label}
                   </button>
                ))}
             </div>

             {/* Search */}
             <div className="px-4 lg:px-8 mb-4">
               <div className="bg-[#121620] border border-[#2b3548] rounded relative p-1 pb-1 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
                  <input 
                    type="text" 
                    placeholder={language === 'ru' ? "Поиск по банку..." : "Search in bank..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-[#94a3b8] font-serif text-sm focus:outline-none focus:ring-0 placeholder-[#475569] pl-8"
                  />
                  <Search size={14} className="absolute left-3 top-2.5 text-[#475569]" />
               </div>
             </div>

             {/* Bank Grid */}
             <div className="flex-1 custom-scrollbar overflow-y-auto px-4 lg:px-8 pb-8">
                <div className="grid grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-1.5 select-none auto-rows-max place-items-center">
                   {bankGrid.map((record, index) => {
                      const item = record?.item;
                      return (
                      <div 
                        key={index}
                        onMouseEnter={() => setHoveredItem(item || null)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onDoubleClick={() => record && handleWithdraw(record)}
                        onClick={() => record && handleWithdraw(record)}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-[#0f1219] border-2 rounded-sm relative cursor-pointer shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] flex items-center justify-center group overflow-hidden transition-all
                           ${item ? RarityColor(item.rarity) : 'border-[#1e293b] hover:border-[#334155]'}
                        `}
                      >
                         {/* Rivets */}
                         <div className="absolute top-[1px] left-[1px] w-1 h-1 bg-[#475569]/30 rounded-full" />
                         <div className="absolute bottom-[1px] right-[1px] w-1 h-1 bg-[#475569]/30 rounded-full" />
                         
                         {item ? (
                            <div className="w-[90%] h-[90%] flex items-center justify-center opacity-80 group-hover:scale-110 transition-transform duration-300 relative">
                               <ItemIconWrapper item={item} size={24} />
                               {item.upgradeLevel && (
                                  <div className="absolute bottom-0 right-0 text-[10px] font-bold text-white shadow-black drop-shadow-[1px_1px_0_#000] bg-black/60 px-0.5 rounded-tl">
                                     +{item.upgradeLevel}
                                  </div>
                               )}
                               <div className="absolute top-0 left-0 bg-black/60 text-[8px] text-white opacity-0 group-hover:opacity-100 px-1 truncate max-w-full">
                                  {record.depositorName}
                               </div>
                            </div>
                         ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10">
                               <Package size={16} />
                            </div>
                         )}
                      </div>
                   )})}
                </div>
             </div>
             
             {/* Bottom Bank Panel */}
             <div className="bg-[#1b2233] border-t border-[#3a4863] p-4 flex gap-4 items-center justify-between">
                <div className="text-[10px] text-[#64748b] font-mono flex flex-col">
                   <span>ЗАПОЛНЕНО: <span className="text-[#a5b4fc]">{globalBankItems.length} / {maxBankSlots}</span></span>
                </div>
                <div className="flex gap-2">
                   <button 
                      onClick={() => {
                         const spaceInInv = maxInvSlots - character.inventory.length;
                         if (spaceInInv === 0) return;
                         triggerAlert(language === 'ru' ? 'Withdraw all (take top items) coming soon!' : 'Withdraw all coming soon!', 'info');
                      }}
                      className="bg-[#121620] border border-[#2b3548] text-[#94a3b8] hover:text-[#a5b4fc] text-[10px] md:text-xs font-bold px-2 md:px-3 py-1.5 uppercase rounded shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                   >
                      {language === 'ru' ? 'Забрать топовые' : 'Withdraw Top'}
                   </button>
                   <button 
                      onClick={() => {
                         triggerAlert(language === 'ru' ? 'Сортировка глобального банка скоро будет!' : 'Global bank sorting coming soon!', 'info');
                      }}
                      className="bg-gradient-to-b from-[#3b82f6] to-[#1d4ed8] border border-[#60a5fa] hover:brightness-110 text-white text-xs font-bold px-3 py-1.5 uppercase rounded shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                   >
                      {language === 'ru' ? 'Про банкира' : 'Banker Info'}
                   </button>
                </div>
             </div>
          </div>

          {/* ================= 2. RIGHT: PLAYER INVENTORY / PAPER DOLL ================= */}
          <div className="w-full xl:w-[35%] bg-[#121620] relative flex flex-col z-10 pt-10 pb-8 min-h-[500px]">
             
             {/* Label */}
             <div className="text-center font-bold text-[#64748b] text-xs uppercase tracking-widest mb-4">
                {language === 'ru' ? 'Снаряжение и Рюкзак' : 'Equipment & Backpack'}
             </div>

             {/* Mini Paper Doll & Slots */}
             <div className="flex justify-center gap-2 md:gap-4 mb-6">
                <div className="flex flex-col gap-1.5">
                   {leftSlots.map(slot => {
                      const item = character.equipment[slot];
                      return (
                        <div key={slot} className={`w-10 h-10 border-2 rounded-sm bg-[#0a0c10] flex items-center justify-center ${item ? RarityColor(item.rarity) : 'border-[#1e293b]'}`}>
                           {item ? (
                              <div className="w-full h-full flex items-center justify-center opacity-80">
                                 <ItemIconWrapper item={item} size={24} />
                              </div>
                           ) : (
                              <span className="text-[7px] text-[#475569] uppercase font-mono tracking-tighter truncate w-full text-center">{getSlotName(slot)}</span>
                           )}
                        </div>
                      )
                   })}
                </div>
                
                {/* Portrait */}
                <div className="w-[120px] h-[220px] md:h-[240px] border-2 border-[#2b3548] rounded bg-[#1b2233] relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                   <img 
                      src={getCharacterAvatarUrl(character)} 
                      alt="Portrait" 
                      className="absolute bottom-0 w-full object-contain h-[120%]" 
                   />
                </div>
                
                <div className="flex flex-col gap-1.5">
                   {rightSlots.map(slot => {
                      const item = character.equipment[slot];
                      return (
                        <div key={slot} className={`w-10 h-10 border-2 rounded-sm bg-[#0a0c10] flex items-center justify-center ${item ? RarityColor(item.rarity) : 'border-[#1e293b]'}`}>
                           {item ? (
                              <div className="w-full h-full flex items-center justify-center opacity-80">
                                 <ItemIconWrapper item={item} size={24} />
                              </div>
                           ) : (
                              <span className="text-[7px] text-[#475569] uppercase font-mono tracking-tighter truncate w-full text-center">{getSlotName(slot)}</span>
                           )}
                        </div>
                      )
                   })}
                </div>
             </div>

             {/* Personal Inventory (Click to Deposit) */}
             <div className="px-4 lg:px-8 mb-4">
                <div className="text-[10px] text-[#64748b] font-mono mb-2 uppercase flex justify-between">
                   <span>{language === 'ru' ? 'Ваш рюкзак' : 'Your Bag'}</span>
                   <span className="text-[#94a3b8]">{character.inventory.length} / {maxInvSlots}</span>
                </div>
                
                <div className="bg-[#0b0e14] border border-[#1e293b] rounded h-[220px] overflow-y-auto custom-scrollbar p-2 grid grid-cols-5 md:grid-cols-6 gap-1 place-items-center shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] relative">
                   {/* Dotted texture */}
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                   
                   {Array.from({ length: maxInvSlots }).map((_, i) => {
                      const item = character.inventory[i];
                      return (
                         <div 
                           key={`inv-${i}`}
                           onMouseEnter={() => setHoveredItem(item || null)}
                           onMouseLeave={() => setHoveredItem(null)}
                           onClick={() => item && handleDeposit(item)}
                           className={`w-10 h-10 border bg-[#121620] relative rounded-sm cursor-[url('/icons/deposit.png'),_pointer] flex items-center justify-center transition-all hover:brightness-125 z-10
                             ${item ? RarityColor(item.rarity) : 'border-[#1e293b] opacity-40 hover:opacity-100 cursor-default'}
                           `}
                         >
                            {item && (
                               <div className="w-full h-full flex items-center justify-center opacity-80">
                                  <ItemIconWrapper item={item} size={24} />
                               </div>
                            )}
                         </div>
                      );
                   })}
                </div>
             </div>

          </div>
       </div>

       {/* Item Tooltip Overlay */}
       {hoveredItem && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-10 z-[110] bg-slate-950/95 border border-slate-700 p-5 rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl animate-slide-up w-[320px] max-w-[90vw] pointer-events-none">
            <div className={`font-bold text-lg mb-1 ${RarityColor(hoveredItem.rarity).split(' ')[0]}`}>
               {hoveredItem.upgradeLevel ? `+${hoveredItem.upgradeLevel} ` : ''}{hoveredItem.name}
            </div>
            <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
               <span className="text-xs text-slate-400 uppercase font-mono tracking-widest">{hoveredItem.slot}</span>
               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border bg-black/40 ${RarityColor(hoveredItem.rarity)}`}>{hoveredItem.rarity}</span>
            </div>
            
            {hoveredItem.stats && Object.keys(hoveredItem.stats).length > 0 && (
               <div className="flex flex-col gap-1 text-[11px] font-mono mb-3 p-2 bg-black/40 border border-slate-800 rounded">
                 {hoveredItem.stats.str && <span className="text-orange-400">СИЛ +{hoveredItem.stats.str}</span>}
                 {hoveredItem.stats.sta && <span className="text-emerald-400">ВЫН +{hoveredItem.stats.sta}</span>}
                 {hoveredItem.stats.agi && <span className="text-amber-400">ЛОВ +{hoveredItem.stats.agi}</span>}
                 {hoveredItem.stats.int && <span className="text-sky-400">ИНТ +{hoveredItem.stats.int}</span>}
                 {hoveredItem.stats.mana && <span className="text-blue-400">Мана +{hoveredItem.stats.mana}</span>}
                 {hoveredItem.stats.hp && <span className="text-red-400">ХП +{hoveredItem.stats.hp}</span>}
                 {hoveredItem.stats.ac && <span className="text-slate-300">Броня {hoveredItem.stats.ac}</span>}
               </div>
            )}
            
            {(hoveredItem.description || hoveredItem.price) && (
               <p className="text-xs text-slate-500 italic font-serif leading-relaxed line-clamp-3 mb-2">
                  "{hoveredItem.description || 'Холод на ощупь...'}"
               </p>
            )}

            {hoveredItem.price && (
               <div className="mt-2 text-right text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                  Цена: {hoveredItem.price}g
               </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-slate-800 text-[10px] text-center text-slate-400 font-bold uppercase">
               ( Клик — Переместить )
            </div>
         </div>
       )}
    </div>
  );
}
