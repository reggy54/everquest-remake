import React, { useState } from 'react';
import { PlayerCharacter, Item } from '../types';
import PixelWindow from './PixelWindow';
import { COMMON_TEMPLATES } from '../data/gameData';

interface ForgeEthereaTabProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
  language: 'ru' | 'en';
}

export default function ForgeEthereaTab({ character, onUpdateCharacter, triggerAlert, language }: ForgeEthereaTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'weapons' | 'armor' | 'enhance' | 'reforge' | 'sockets' | 'special' | 'kitchen'>('weapons');
  const [isCrafting, setIsCrafting] = useState(false);
  const [craftProgress, setCraftProgress] = useState(0);

  // Helper to color texts by rarity
  const RarityHex = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#d1d1d1';
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      case 'mythic': return '#e6cc80';
      default: return '#fff';
    }
  };

  const handleCraft = (recipe: typeof COMMON_TEMPLATES.forgeRecipes[0]) => {
    // Check if player has the materials
    const requiredMats = Object.entries(recipe.cost);
    let hasAll = true;
    for (const [matId, amount] of requiredMats) {
       const userAmount = character.inventory.filter(i => i.id === matId || (i.slot === 'material' && i.id.startsWith(matId))).length;
       if (userAmount < amount) {
          hasAll = false;
          break;
       }
    }

    if (!hasAll) {
       triggerAlert(language === 'ru' ? 'Недостаточно материалов!' : 'Not enough materials!', 'error');
       return;
    }

    setIsCrafting(true);
    setCraftProgress(0);
    const interval = setInterval(() => {
      setCraftProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCrafting(false);
            setCraftProgress(0);
            
            // Consume materials
            let nextInv = [...character.inventory];
            for (const [matId, amount] of requiredMats) {
               let removed = 0;
               nextInv = nextInv.filter(i => {
                  if (removed < amount && (i.id === matId || (i.slot === 'material' && i.id.startsWith(matId)))) {
                     removed++;
                     return false;
                  }
                  return true;
               });
            }

            // Create item 
            const newLoot = {
               ...recipe.result,
               id: `crafted-${Date.now()}`
            } as Item;
            nextInv.push(newLoot);

            onUpdateCharacter({
               ...character,
               inventory: nextInv
            });

            triggerAlert(language === 'ru' ? `Создано: ${recipe.result.name}!` : `Forged: ${recipe.result.name}!`, 'success');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const TABS = [
    { id: 'weapons', label: language === 'ru' ? 'Оружие' : 'Weapons' },
    { id: 'armor', label: language === 'ru' ? 'Броня' : 'Armor' },
    { id: 'enhance', label: language === 'ru' ? 'Улучшение' : 'Enhancement' },
    { id: 'reforge', label: language === 'ru' ? 'Перековка' : 'Reforge' },
    { id: 'sockets', label: language === 'ru' ? 'Руны/Сокеты' : 'Runes' },
    { id: 'special', label: language === 'ru' ? 'Особые' : 'Special' },
    { id: 'kitchen', label: language === 'ru' ? 'Кухня' : 'Kitchen' },
  ] as const;

  const currentRecipes = (COMMON_TEMPLATES.forgeRecipes || []).filter(r => r.category === activeSubTab);

  return (
    <PixelWindow title={language === 'ru' ? 'Горн Этерии' : 'Forge of Etherea'}>
      <div className="flex flex-col md:flex-row h-full min-h-[600px] bg-[#0a0a0a] font-sans overflow-hidden border-2 border-metal shadow-[inset_0_0_50px_rgba(0,0,0,0.9)] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black pointer-events-none z-0"></div>

        {/* Left pane: Animated Forge (35%) */}
        <div className="w-full md:w-1/3 border-b-4 md:border-b-0 md:border-r-4 border-[#333] relative flex flex-col items-center justify-end overflow-hidden shadow-[inset_-10px_0_30px_rgba(0,0,0,0.9)] pb-10 z-10 shrink-0 bg-[#111]">
          
          {/* Background Forge Room */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-bottom opacity-[0.15] mix-blend-screen pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />

          {/* Central Fire Animation */}
          <div className="relative w-64 h-64 flex items-center justify-center mt-auto">
            {/* Base stones */}
            <div className="absolute bottom-0 w-[90%] h-[45%] bg-[#1a1a1a] border-t-4 border-l-4 border-r-4 border-metal shadow-[0_-10px_30px_rgba(0,0,0,0.9)] rounded-t-[40px] z-20 flex flex-col items-center justify-center pt-2">
              <div className="w-[80%] h-3 bg-[#111] rounded mt-2 border-t-2 border-l-2 border-[#000] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"></div>
              <div className="w-[80%] h-3 bg-[#111] rounded mt-3 border-t-2 border-l-2 border-[#000] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)]"></div>
            </div>
            
            {/* The Fire */}
            <div className={`absolute bottom-[20%] w-32 h-40 bg-gradient-to-t from-[#ff4500] via-[#ff8c00] to-transparent rounded-full blur-[25px] transition-all duration-500 z-10 ${isCrafting ? 'animate-pulse scale-[1.3] brightness-125' : 'animate-pulse scale-100'}`} style={{ mixBlendMode: 'screen' }} />
            
            {isCrafting && (
                <div className="absolute top-1/4 w-48 h-48 bg-gradient-to-t from-yellow-300 to-transparent blur-[40px] opacity-70 animate-ping z-30 pointer-events-none"></div>
            )}
            
            {/* Front Grill */}
            <div className="absolute bottom-[20%] w-[70%] h-[30%] flex justify-between px-3 z-30">
               <div className="w-2.5 h-full bg-gradient-to-b from-metal to-[#111] border border-[#000] shadow-md rounded-t-sm"></div>
               <div className="w-2.5 h-full bg-gradient-to-b from-metal to-[#111] border border-[#000] shadow-md rounded-t-sm"></div>
               <div className="w-2.5 h-full bg-gradient-to-b from-metal to-[#111] border border-[#000] shadow-md rounded-t-sm"></div>
               <div className="w-2.5 h-full bg-gradient-to-b from-metal to-[#111] border border-[#000] shadow-md rounded-t-sm"></div>
            </div>
            
            {/* Sparks (pseudo elements could be used, just adding a glow) */}
            <div className="absolute bottom-[40%] w-4 absolute bg-yellow-100 rounded-full blur-[2px] opacity-50 z-30"></div>
          </div>

          <div className="z-30 mt-6 w-[80%] bg-[#1a1a1a]/95 border-2 border-metal p-3 shadow-[0_4px_10px_rgba(0,0,0,0.9)] text-center relative rounded-sm">
             <div className="absolute -top-1 -left-1 w-2h-2 bg-[#555] shadow-[inset_1px_1px_rgba(255,255,255,0.4)] border border-[#000] rounded-sm"></div>
             <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#555] shadow-[inset_1px_1px_rgba(255,255,255,0.4)] border border-[#000] rounded-sm"></div>
             <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#555] shadow-[inset_1px_1px_rgba(255,255,255,0.4)] border border-[#000] rounded-sm"></div>
             <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#555] shadow-[inset_1px_1px_rgba(255,255,255,0.4)] border border-[#000] rounded-sm"></div>

             <h3 className="text-amber-500 font-bold uppercase tracking-widest text-lg drop-shadow-[2px_2px_0_#000]" style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif' }}>
                {language === 'ru' ? 'Горн Этерии' : 'Forge of Etherea'}
             </h3>
             <p className="text-[10px] text-[#aaa] font-bold mt-1 uppercase tracking-widest drop-shadow-[1px_1px_0_#000]">
                {language === 'ru' ? 'Пламя готово' : 'Flames are ready'}
             </p>
          </div>

          {/* Progress Bar (Visible only when crafting) */}
          <div className={`w-[80%] h-4 bg-[#111] border-2 border-[#333] mt-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative overflow-hidden transition-opacity duration-300 ${isCrafting ? 'opacity-100' : 'opacity-0'}`}>
             <div 
                className="h-full bg-gradient-to-r from-orange-600 via-amber-400 to-yellow-200 transition-all duration-[100ms] linear"
                style={{ width: `${craftProgress}%` }}
             ></div>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
          </div>
        </div>

        {/* Right pane: Tabs & Grid (65%) */}
        <div className="flex-1 flex flex-col relative z-20 min-w-0 bg-[#161616]">
          {/* subtle leather background */}
          <div className="absolute inset-0 bg-parchment opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
          
          {/* Metal Plate Tabs */}
          <div className="flex flex-wrap gap-0 border-b-4 border-metal bg-gradient-to-r from-[#222] to-[#111] shadow-[0_4px_10px_rgba(0,0,0,0.9)] z-10 sticky top-0 md:relative">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-3 px-3 md:px-4 font-bold text-[10px] md:text-[11px] uppercase tracking-wider transition-all duration-300 relative border-r border-[#333] flex-1 md:flex-none ${
                  activeSubTab === tab.id
                    ? 'bg-gradient-to-b from-[#4a3615] to-[#2a1d08] text-[#ffd700] shadow-[inset_0_2px_10px_rgba(255,215,0,0.1)] border-t-2 border-t-[#d4af37]'
                    : 'bg-gradient-to-b from-[#333] to-[#111] text-[#888] hover:text-[#bbb] hover:bg-[#222] border-t-2 border-t-transparent'
                }`}
              >
                {/* Rivets */}
                <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.2)] border border-[#000]"></div>
                <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#111] shadow-[inset_1px_1px_rgba(255,255,255,0.2)] border border-[#000]"></div>
                
                <span className="drop-shadow-[1px_1px_0_#000]">{tab.label}</span>
                {activeSubTab === tab.id && (
                  <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#d4af37] shadow-[0_-2px_10px_rgba(212,175,55,0.8)]" />
                )}
              </button>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 overflow-y-auto hidden-scrollbar p-3 md:p-6 relative z-0">
             
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 auto-rows-max relative z-10">
               {currentRecipes.length === 0 && (
                  <div className="col-span-1 xl:col-span-2 text-center text-[#888] p-4 text-xs font-bold uppercase tracking-widest">
                     {language === 'ru' ? 'Нет доступных рецептов.' : 'No recipes available.'}
                  </div>
               )}
               {currentRecipes.map((recipe) => (
                  <div key={recipe.id} className="bg-leather border-2 border-metal shadow-[0_5px_15px_rgba(0,0,0,0.8)] flex flex-col p-3 group hover:border-[#8b6508] transition-colors relative">
                    
                    {/* Decorative Rivets */}
                    <div className="absolute -top-1.5 -left-1.5 w-2 h-2 bg-[#555] rounded-full border border-[#111]"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-[#555] rounded-full border border-[#111]"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-2 h-2 bg-[#555] rounded-full border border-[#111]"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-2 h-2 bg-[#555] rounded-full border border-[#111]"></div>

                    <div className="flex gap-4 mb-4 relative z-10">
                      <div className="w-16 h-16 shrink-0 bg-[#0a0a0a] border-2 border-[#333] shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] flex items-center justify-center relative group-hover:border-[#d4af37] transition-colors p-1" style={{ borderColor: RarityHex(recipe.result.rarity) }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(255,255,255,0.05)] to-transparent pointer-events-none"></div>
                        <span className="text-3xl drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] z-10">
                          {activeSubTab === 'weapons' ? '⚔️' : activeSubTab === 'armor' ? '🛡️' : activeSubTab === 'sockets' ? '💎' : activeSubTab === 'kitchen' ? '🍖' : '🧪'}
                        </span>
                      </div>
                      <div className="flex flex-col justify-start min-w-0 flex-1">
                         <h4 className="font-bold text-[13px] md:text-sm tracking-wide drop-shadow-[1px_1px_0_#000]" style={{ fontFamily: 'Friz Quadrata, "Times New Roman", serif', color: RarityHex(recipe.result.rarity) }}>
                           {recipe.result.name}
                         </h4>
                         <span className="text-[10px] uppercase font-bold tracking-widest mt-1 drop-shadow-[1px_1px_0_#000]" style={{ color: RarityHex(recipe.result.rarity) }}>
                           {language === 'ru' ? 'Рецепт: ' : 'Recipe: '} {recipe.result.rarity}
                         </span>
                         <span className="text-[10px] text-[#888] uppercase font-mono tracking-wide mt-1">
                            {recipe.result.slot !== 'none' ? recipe.result.slot : recipe.category} {recipe.result.allowedClasses ? `• ${recipe.result.allowedClasses.join(', ')}` : ''}
                         </span>
                      </div>
                    </div>
                    
                    <div className="flex-1"></div>

                    {/* Requirements Section */}
                    <div className="bg-[#111] border border-[#222] p-2 mt-auto mb-3 relative shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)]">
                       <span className="absolute -top-2 left-2 px-1 bg-[#111] text-[9px] text-[#888] font-bold uppercase tracking-widest">
                         {language === 'ru' ? 'Реагенты' : 'Reagents'}
                       </span>
                       <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(recipe.cost).map(([matId, amount]) => {
                            const template = (COMMON_TEMPLATES.materials as any[]).find(m => m.id === matId);
                            const name = template ? template.name : matId;
                            
                            let icon = '📦';
                            if (matId.includes('iron')) icon = '⛓️';
                            if (matId.includes('leather')) icon = '🥾';
                            if (matId.includes('cloth')) icon = '📜';
                            if (matId.includes('magic')) icon = '✨';
                            if (matId.includes('crystal')) icon = '💎';
                            if (matId.includes('meat')) icon = '🥩';
                            if (matId.includes('herb')) icon = '🌿';
                            if (matId.includes('water')) icon = '💧';
                            
                            const userAmount = character.inventory.filter(i => i.id === matId || (i.slot === 'material' && i.id.startsWith(matId))).length;
                            const hasEnough = userAmount >= amount;

                            return (
                              <div key={matId} title={`${name} (${userAmount}/${amount})`} className={`flex items-center gap-1 group/reagent cursor-help ${hasEnough ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`w-7 h-7 bg-[#222] border ${hasEnough ? 'border-[#444]' : 'border-red-900'} rounded-sm flex items-center justify-center relative shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)]`}>
                                   <span className="text-[10px] drop-shadow-[1px_1px_0_#000]">{icon}</span>
                                   <span className={`absolute -bottom-1 -right-1 text-[8px] font-bold text-white px-1 rounded-sm border ${hasEnough ? 'bg-black border-[#444]' : 'bg-red-900 border-red-950'}`}>
                                      {amount}
                                   </span>
                                </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>

                    <button 
                      onClick={() => handleCraft(recipe)}
                      disabled={isCrafting}
                      className="btn-classic w-full py-2 text-xs md:text-sm font-bold uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.6)] group-hover:shadow-[0_4px_15px_rgba(212,175,55,0.3)] transition-all"
                    >
                      {language === 'ru' ? 'Создать (Create)' : 'Forge'}
                    </button>

                  </div>
               ))}
             </div>
          </div>
        </div>

      </div>
    </PixelWindow>
  );
}
