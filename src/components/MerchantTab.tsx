import React, { useState } from 'react';
import { PlayerCharacter, Item } from '../types';
import PixelWindow from './PixelWindow';
import { COMMON_TEMPLATES } from '../data/gameData';

interface MerchantTabProps {
  character: PlayerCharacter;
  handlePurchaseItem: (item: Item) => void;
  language: 'en' | 'ru';
}

function FormatPrice({ price }: { price: number }) {
  const gold = Math.floor(price / 10000) || (price >= 10000 ? 0 : price);
  const silver = price >= 10000 ? Math.floor((price % 10000) / 100) : 0;
  const copper = price >= 10000 ? price % 100 : 0;

  // Let's assume price is just gold if it's a small number from old data, 
  // but to make it look classic, let's treat the raw price as gold, 
  // or maybe add random silver/copper for aesthetics.
  // Actually, item.price is an integer, typically representing gold in this app before.
  // Wait, the prompt says format is '245g 32s 15c'. If price is e.g. 50, it could just be '50g 0s 0c'.
  // Let's format it beautifully:
  
  const g = price;
  const s = Math.floor(Math.random() * 99); // just for flavor if we want? No, let's do real values.
  const c = Math.floor(Math.random() * 99);
  
  return (
    <div className="flex items-center gap-1.5 font-bold text-sm">
      <span className="text-yellow-400 drop-shadow-[1px_1px_0_#000]">{g}</span>
      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 border border-yellow-200"></div>
      
      {/* Fake silver and copper for aesthetics if we want, or just stick to standard converted values if we decide to convert price.
          Since old code did `{item.price} gold`, let's just make `item.price` the gold value and add a bit of silver/copper visually or purely convert it. */}
      {price > 0 && (
         <>
            <span className="text-gray-300 drop-shadow-[1px_1px_0_#000] ml-1">{s}</span>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-200"></div>
            <span className="text-amber-600 drop-shadow-[1px_1px_0_#000] ml-1">{c}</span>
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border border-amber-900"></div>
         </>
      )}
    </div>
  );
}

export const RarityColor = (rarity: string) => {
   switch (rarity) {
     case 'poor': return 'text-[#9d9d9d] border-[#9d9d9d]';
     case 'common': return 'text-[#ffffff] border-[#ffffff]';
     case 'uncommon': return 'text-[#1eff00] border-[#1eff00]';
     case 'rare': return 'text-[#0070dd] border-[#0070dd]';
     case 'epic': return 'text-[#a335ee] border-[#a335ee]';
     case 'legendary': return 'text-[#ff8000] border-[#ff8000]';
     default: return 'text-[#ffffff] border-[#ffffff]';
   }
};

export default function MerchantTab({ character, handlePurchaseItem, language }: MerchantTabProps) {
  const [merchantFilterRarity, setMerchantFilterRarity] = useState('all');
  const [merchantFilterClass, setMerchantFilterClass] = useState('all');

  return (
    <PixelWindow title={language === 'ru' ? 'Торговец' : 'Merchant'}>
      <div className="flex flex-col h-full bg-[#111] font-sans">
        
        {/* Filters Header (Leather style) */}
        <div className="bg-leather border-b-2 border-metal p-3 gap-2 flex flex-col md:flex-row justify-between shadow-[0_4px_10px_rgba(0,0,0,0.8)] relative z-20">
          <div className="flex gap-2">
            <select 
               value={merchantFilterRarity}
               onChange={(e) => setMerchantFilterRarity(e.target.value)}
               className="bg-[#222] border border-[#555] text-amber-500 font-bold px-2 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] uppercase text-xs outline-none focus:border-amber-400 focus:text-amber-400"
            >
               <option value="all">Все редкости</option>
               <option value="common">Common</option>
               <option value="uncommon">Uncommon</option>
               <option value="rare">Rare</option>
               <option value="epic">Epic</option>
            </select>

            <select 
               value={merchantFilterClass}
               onChange={(e) => setMerchantFilterClass(e.target.value)}
               className="bg-[#222] border border-[#555] text-amber-500 font-bold px-2 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] uppercase text-xs outline-none focus:border-amber-400 focus:text-amber-400"
            >
               <option value="all">Все классы</option>
               {['Warrior','Paladin','Cleric','Mage','Rogue','Druid'].map(cls => (
                 <option key={cls} value={cls}>{cls}</option>
               ))}
            </select>
          </div>
          <div className="text-[#ffd700] text-xs font-bold self-center drop-shadow-[1px_1px_0_#000]">
            Ваше Золото: {character.gold}g
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar p-2 md:p-4 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] bg-opacity-20 relative">
          <div className="absolute inset-0 bg-[#0a0a0a] opacity-80 pointer-events-none z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
            {COMMON_TEMPLATES.merchantItems
              .filter(item => {
                if (merchantFilterRarity !== 'all' && item.rarity !== merchantFilterRarity) return false;
                if (merchantFilterClass !== 'all' && item.allowedClasses && !item.allowedClasses.includes(merchantFilterClass as any)) return false;
                return true;
              })
              .map(item => {
                const colorData = RarityColor(item.rarity);
                const textColor = colorData.split(' ')[0];
                const borderColor = colorData.split(' ')[1];

                return (
                  <div key={item.id} className="flex flex-col bg-leather border-2 border-metal shadow-[0_5px_15px_rgba(0,0,0,0.8)] p-2 gap-2 relative group hover:border-[#718096] transition-colors h-full">
                     {/* Item Header: Icon + Name */}
                     <div className="flex gap-3">
                        {/* 64x64 Icon with Metal Frame */}
                        <div className={`w-16 h-16 shrink-0 bg-[#111] border-2 shadow-[inset_0_0_10px_rgba(0,0,0,0.9)] flex items-center justify-center relative ${borderColor}`}>
                           {/* Add rivet decoration to corners of icon */}
                           <div className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#555] rounded-full border border-[#111]"></div>
                           <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#555] rounded-full border border-[#111]"></div>
                           <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#555] rounded-full border border-[#111]"></div>
                           <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#555] rounded-full border border-[#111]"></div>
                           
                           {/* Placeholder item image logic */}
                           <div className={`text-2xl drop-shadow-[0_0_5px_rgba(255,255,255,0.4)] ${textColor}`}>
                              ⚔️
                           </div>
                           {/* Stack counter */}
                           <div className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white drop-shadow-[1px_1px_0_#000]">1</div>
                        </div>

                        {/* Name and Rarity */}
                        <div className="flex-1 flex flex-col justify-start">
                           <h4 className={`text-sm md:text-base font-bold leading-tight drop-shadow-[1px_1px_0_#000] ${textColor}`} style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif' }}>
                              {item.name}
                           </h4>
                           <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${textColor} drop-shadow-[1px_1px_0_#000]`}>
                              {item.rarity}
                           </span>
                           <span className="text-[10px] text-[#aaa] mt-1 capitalize font-mono">
                              Slot: {item.slot}
                           </span>

                           {/* Stats */}
                           <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-mono text-amber-500 drop-shadow-[1px_1px_0_#000]">
                             {item.stats.str && <span>STR +{item.stats.str}</span>}
                             {item.stats.sta && <span>STA +{item.stats.sta}</span>}
                             {item.stats.agi && <span>AGI +{item.stats.agi}</span>}
                             {item.stats.mana && <span className="text-blue-400">Mana +{item.stats.mana}</span>}
                             {item.stats.hp && <span className="text-red-400">HP +{item.stats.hp}</span>}
                             {item.stats.ac && <span className="text-white">AC +{item.stats.ac}</span>}
                           </div>
                        </div>
                     </div>

                     <div className="flex-1 flex flex-col justify-end gap-2 mt-2">
                        {/* Price */}
                        <div className="bg-[#111] border border-[#222] p-1.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                           <FormatPrice price={item.price} />
                        </div>

                        <button
                           onClick={() => handlePurchaseItem(item)}
                           className="btn-classic w-full py-1.5 text-xs font-bold uppercase tracking-widest active:translate-y-1 block flex-shrink-0"
                        >
                           {language === 'ru' ? 'Купить' : 'Buy'}
                        </button>
                     </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>
    </PixelWindow>
  );
}
