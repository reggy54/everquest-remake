import React, { useRef, useEffect } from 'react';
import { PlayerCharacter, Spell } from '../types';
import { Sword, Shield, Wand2, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface ClassicCombatHUDProps {
  character: PlayerCharacter;
  combatMonster: { name: string; level: number; hp: number; maxHp: number; isBoss?: boolean };
  combatParty: { name: string; class: string; hp: number; maxHp: number }[];
  activeBuffs: { id: string; name: string; provider: string; effect: string; duration: number }[];
  combatLogs: string[];
  dmNarrative: string;
  dmLoading: boolean;
  combatOver: boolean;
  victoryDetails: any;
  setInCombat: (val: boolean) => void;
  comboField: { active: boolean };
  stamina: number;
  combatGcd: boolean;
  handleCombatAction: (actionType: 'melee' | 'taunt' | 'dodge' | Spell) => void;
  currentSpells: Spell[];
  spellCooldowns: Record<string, number>;
}

export default function ClassicCombatHUD({
  character,
  combatMonster,
  combatParty,
  activeBuffs,
  combatLogs,
  dmNarrative,
  dmLoading,
  combatOver,
  victoryDetails,
  setInCombat,
  comboField,
  stamina,
  combatGcd,
  handleCombatAction,
  currentSpells,
  spellCooldowns,
}: ClassicCombatHUDProps) {
  
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combatLogs]);

  // Determine resource color based on class
  const getResourceColor = (charClass: string) => {
    switch(charClass) {
      case 'Warrior':
      case 'Barbarian':
      case 'Death Knight':
        return 'from-red-600 to-red-400';
      case 'Rogue':
      case 'Hunter':
      case 'Monk':
        return 'from-yellow-500 to-yellow-300';
      default:
         // Mana users
        return 'from-blue-600 to-blue-400';
    }
  };

  const getResourceLabel = (charClass: string) => {
    switch(charClass) {
      case 'Warrior':
      case 'Barbarian':
      case 'Death Knight':
        return 'Rage';
      case 'Rogue':
      case 'Hunter':
      case 'Monk':
        return 'Energy';
      default:
        return 'Mana';
    }
  }

  const resourceColor = getResourceColor(character.class);
  const resourceLabel = getResourceLabel(character.class);
  
  // Calculate resources percentage
  const resourcePercent = character.mana ? Math.min(100, Math.max(0, (character.mana / 100) * 100)) : 100; // Mock max mana 100

  // Combine actions for bottom bar
  const allActions = [
    { type: 'melee', label: 'Melee Strike', icon: <Sword className="w-5 h-5 text-red-500" drop-shadow="true" />, disabled: combatGcd },
    { type: 'dodge', label: 'Tactical Dodge', icon: <Sparkles className="w-5 h-5 text-emerald-300" />, disabled: combatGcd || stamina < 30 },
  ];
  
  if (['Warrior', 'Paladin'].includes(character.class)) {
     allActions.push({ type: 'taunt', label: 'Guard Taunt', icon: <Shield className="w-5 h-5 text-emerald-400" />, disabled: combatGcd });
  }

  const getSpellIcon = (spell: Spell) => {
     if (spell.type === 'heal') return <span className="text-xl">🌿</span>;
     if (spell.type === 'buff') return <span className="text-xl">✨</span>;
     if (spell.type === 'damage') return <span className="text-xl">🔥</span>;
     return <Wand2 className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="absolute inset-0 bg-[#0a0a0a] z-50 flex flex-col font-sans overflow-hidden text-white select-none">
      
      {/* Background (Dark cave/dungeon feel) */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590845947376-79339e8fdc6a?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 pointer-events-none"></div>

      {combatOver && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-[#111] border-2 border-[#ffb600] rounded-lg p-6 shadow-[0_0_50px_rgba(255,182,0,0.3)] max-w-md w-full mx-auto relative overflow-hidden text-center">
                 {victoryDetails ? (
                    <>
                       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ffb600] to-transparent shadow-[0_0_15px_#ffb600] animate-pulse"></div>
                       <h2 className="text-3xl font-bold text-[#ffb600] mb-2 drop-shadow-md" style={{ fontFamily: 'Friz Quadrata, serif' }}>Victory!</h2>
                       <p className="text-sm text-slate-300 mb-6 font-serif">{combatMonster.name} lies defeated.</p>

                       <div className="flex justify-center gap-6 mb-6 font-bold" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                           <div className="flex flex-col items-center gap-1">
                               <span className="text-xs text-slate-400">Experience</span>
                               <span className="text-xl text-purple-400">+{victoryDetails.expEarned} XP</span>
                           </div>
                           <div className="flex flex-col items-center gap-1">
                               <span className="text-xs text-slate-400">Wealth</span>
                               <span className="text-xl text-yellow-500">+{victoryDetails.goldEarned} Gold</span>
                           </div>
                       </div>
                       
                       {victoryDetails.itemLooted && (
                           <div className="bg-black/60 border border-purple-500/30 rounded p-4 mb-6 shadow-inner">
                               <span className="text-xs text-amber-500 uppercase tracking-widest block mb-2 font-bold">Loot Discovered</span>
                               <span className="text-purple-400 font-bold block">{victoryDetails.itemLooted.name}</span>
                               <span className="text-[10px] text-slate-400">{victoryDetails.itemLooted.description}</span>
                           </div>
                       )}
                    </>
                 ) : (
                    <>
                       <h2 className="text-3xl font-bold text-red-600 mb-2 drop-shadow-md" style={{ fontFamily: 'Friz Quadrata, serif' }}>Defeat...</h2>
                       <p className="text-sm text-slate-300 mb-6 font-serif">You have fallen in battle. Your spirit weakens.</p>
                    </>
                 )}

                 <button
                    onClick={() => setInCombat(false)}
                    className="btn-classic px-8 py-2.5 font-bold tracking-widest text-[#ffcc00] border border-[#ffcc00] shadow-[0_0_10px_rgba(255,204,0,0.2)] hover:shadow-[0_0_15px_rgba(255,204,0,0.5)] transition-all uppercase text-sm"
                 >
                    Return
                 </button>
              </div>
          </div>
      )}

      {/* TARGET FRAME - Top Right */}
      <div className="absolute top-4 right-4 flex items-center justify-end z-20 w-80 animate-slide-in-right group/target cursor-pointer">
          <div className="flex flex-col items-end mr-3 drop-shadow-lg w-full">
             <div className="flex justify-start w-full gap-2 px-1 mb-1 items-end">
                <span className="text-[13px] font-bold text-amber-400 drop-shadow-[1px_1px_0_#000]" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                    {combatMonster.name}
                </span>
                <span className="text-[10px] text-slate-300 font-bold drop-shadow-[1px_1px_0_#000]">Lv.{combatMonster.level}</span>
             </div>
             {/* HP Bar */}
             <div className="w-full h-5 bg-[#111] border-2 border-metal shadow-[0_0_5px_#000] relative rounded-r-md">
                 <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300"
                    style={{ width: `${Math.max(0, (combatMonster.hp / combatMonster.maxHp) * 100)}%` }}
                 />
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-30 pointer-events-none"></div>
                 <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow-[1px_1px_0_#000]">
                    {Math.max(0, combatMonster.hp)} / {combatMonster.maxHp}
                 </span>
             </div>
             <span className="text-[9px] text-[#ffdd00] mt-1 font-bold uppercase tracking-widest block bg-black/60 px-2 border border-[#333] rounded-sm drop-shadow-[1px_1px_0_#000]">
                 {combatMonster.isBoss ? 'Boss' : 'Elite Enemy'}
             </span>
          </div>
          
          <div className="w-16 h-16 shrink-0 rounded-full border-[3px] border-[#666] bg-[#222] overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.8)] relative z-10 flex items-center justify-center">
             <div className="absolute inset-0 bg-red-900/40 mix-blend-multiply" />
             <span className="text-3xl drop-shadow-[2px_2px_0_#000]">
                {combatMonster.isBoss ? '👹' : '👿'}
             </span>
             <div className="absolute inset-0 ring-inset ring-2 ring-black/50 rounded-full pointer-events-none" />
          </div>
      </div>

      {/* COMBAT LOG & PARTY - Middle Right */}
      <div className="absolute top-28 right-4 bottom-32 w-72 flex flex-col gap-4 z-10">
         {/* Combat Log */}
         <div className="flex-1 bg-black/70 border border-[#333] p-2 flex flex-col font-serif shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-sm rounded-sm">
             <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest border-b border-[#222] pb-1 mb-2 drop-shadow-sm flex items-center gap-1.5">
                 ⚔️ Combat Log
                 {dmLoading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
             </div>
             
             {/* Small DM Box inline */}
             {dmNarrative && (
                <div className="bg-[#1a1510] border border-amber-900/40 p-2 text-[10px] text-amber-200/80 italic mb-2 rounded shadow-inner">
                   {dmNarrative}
                </div>
             )}

             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 text-[11px] pr-2 font-mono scroll-smooth">
                {combatLogs.map((log, i) => {
                    let color = 'text-slate-300';
                    if (log.includes('[WARNING]') || log.includes('hits you')) color = 'text-red-400 font-bold';
                    if (log.includes('[PARTY]') || log.includes('heal')) color = 'text-emerald-400';
                    if (log.includes('dodges')) color = 'text-yellow-400';
                    if (log.includes('critical')) color = 'text-[#ffdd00] font-black text-xs scale-105 origin-left inline-block';
                    return <div key={i} className={`${color} leading-tight drop-shadow-[1px_1px_0_#000]`}>{log}</div>
                })}
                <div ref={logEndRef} />
             </div>
         </div>

         {/* Party Frames (if any) */}
         {combatParty.length > 0 && (
             <div className="h-1/3 bg-black/70 border border-[#333] p-2 flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] rounded-sm font-serif">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest border-b border-[#222] pb-1 mb-2">Party Members</span>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                   {combatParty.map((mate, i) => (
                      <div key={i} className="flex flex-col gap-1 pr-1 group">
                         <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold text-white drop-shadow-[1px_1px_0_#000] group-hover:text-amber-400 transition-colors cursor-pointer">{mate.name}</span>
                            <span className="text-[10px] font-mono text-slate-300">{mate.hp}/{mate.maxHp}</span>
                         </div>
                         <div className="w-full h-2.5 bg-[#111] border border-[#333] shadow-inner relative">
                            <div 
                               className="h-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] transition-all duration-300"
                               style={{ width: `${(mate.hp / mate.maxHp) * 100}%` }}
                            />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
         )}
      </div>

      {/* COMPANION BAR (Left sidebar for combat party, instead of putting them by the log) */}
      {/* Moved down so Party is on the left above player */}
      
      {/* PLAYER FRAME - Bottom Left (Moved up to clear global nav) */}
      <div className="absolute bottom-24 left-4 z-40 animate-slide-in-left group/player">
         <div className="flex items-end gap-0 relative">
             
             {/* Portrait */}
             <div className="w-[72px] h-[72px] rounded-full border-[3px] border-metal bg-gradient-to-b from-[#222] to-black overflow-hidden shadow-[0_0_20px_#000] relative z-10 flex items-center justify-center group-hover:border-[#aaa] transition-colors">
                 <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
                 <span className="text-4xl drop-shadow-[2px_2px_0_#000]">👤</span>
                 {/* Level Badge */}
                 <div className="absolute bottom-0 inset-x-0 mx-auto w-6 h-6 bg-black border-[2px] border-metal rounded-full flex items-center justify-center shadow-lg -mb-2 translate-y-1/2">
                    <span className="text-[11px] font-bold text-[#ffdd00] drop-shadow-[1px_1px_0_#000]">{character.level}</span>
                 </div>
             </div>

             {/* Bars Container */}
             <div className="flex flex-col mb-2 relative left-[-2px] drop-shadow-lg w-64 bg-black/40 p-1.5 rounded-r-md border border-[#222] backdrop-blur-md">
                 
                 <div className="flex justify-between items-baseline mb-1 px-1">
                     <span className="text-[13px] font-bold text-[#ffdd00] drop-shadow-[1px_1px_0_#000] truncate max-w-[120px]" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                         {character.name}
                     </span>
                     <span className="text-[10px] text-slate-300 font-bold drop-shadow-[1px_1px_0_#000]">({character.class})</span>
                 </div>
                 
                 {/* HP Bar */}
                 <div className="w-full h-5 bg-[#111] border border-black shadow-[inset_0_2px_5px_rgba(0,0,0,1)] relative overflow-hidden rounded-t-sm mb-0.5">
                    <div 
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                        style={{ width: `${Math.max(0, (character.hp / character.maxHp) * 100)}%` }}
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-20 pointer-events-none"></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-white drop-shadow-[1px_1px_0_#000]">
                        {character.hp} / {character.maxHp}
                    </span>
                 </div>
                 
                 {/* Resource / Stamina Bar */}
                 <div className="w-full h-3 bg-[#111] border border-black shadow-[inset_0_2px_5px_rgba(0,0,0,1)] relative overflow-hidden rounded-b-sm">
                    <div 
                        className={`h-full bg-gradient-to-r ${resourceColor} transition-all duration-300`}
                        style={{ width: `${resourcePercent}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover/player:opacity-100 transition-opacity">
                       <span className="text-[8px] font-mono font-bold text-white drop-shadow-[1px_1px_0_#000]">{character.mana || stamina} {resourceLabel}</span>
                    </div>
                 </div>

             </div>
         </div>
      </div>

      {/* BUFFS - Above Player Frame */}
      <div className="absolute bottom-48 left-4 flex gap-2 w-[400px] flex-wrap items-end justify-start z-30">
          {comboField.active && (
              <div className="animate-pulse border-2 border-amber-500 rounded p-1 shadow-[0_0_10px_#f59e0b] bg-black/60 mr-2 flex items-center justify-center w-8 h-8 cursor-help relative group" title="Combo Field Active">
                 <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
          )}
          {activeBuffs.map(buff => (
             <div key={buff.id} className="relative group w-8 h-8 rounded border border-metal bg-gradient-to-br from-[#333] to-[#111] shadow-lg flex items-center justify-center cursor-help">
                <span className="text-xs">✨</span>
                <div className="absolute -bottom-1 -right-1 text-[9px] font-mono font-bold bg-black px-1 border border-[#333] rounded-sm text-[#ffdd00] z-10 scale-90 origin-bottom-right">
                   {buff.duration}
                </div>
                {/* Tooltip */}
                <div className="hidden group-hover:block absolute bottom-full left-0 mb-1 w-48 bg-[#111] border border-metal p-2 shadow-[0_5px_15px_rgba(0,0,0,1)] z-50 pointer-events-none">
                    <span className="text-yellow-400 font-bold text-[11px] block" style={{ fontFamily: 'Friz Quadrata, serif' }}>{buff.name}</span>
                    <span className="text-[10px] text-slate-300 block">{buff.effect}</span>
                </div>
             </div>
          ))}
      </div>

      {/* ACTION BAR - Bottom Center (Moved up) */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-leather border-[3px] border-metal p-2 shadow-[0_15px_40px_rgba(0,0,0,1)] rounded-md flex gap-2 items-center">
         {/* Decorative Gryphons / Ends (simplified) */}
         <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-16 bg-metal border border-[#111] rounded-l-full shadow-lg"></div>
         <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-16 bg-metal border border-[#111] rounded-r-full shadow-lg"></div>

         <div className="flex gap-1.5 flex-wrap justify-center w-full max-w-[500px]">
             
             {/* Basic Actions */}
             {allActions.map((action, idx) => (
                 <button
                    key={'basic_'+action.type}
                    onClick={() => handleCombatAction(action.type as any)}
                    disabled={action.disabled}
                    className="relative group w-10 h-10 md:w-12 md:h-12 bg-[#1a1a1a] border-2 border-[#555] rounded-sm flex items-center justify-center hover:border-amber-400 hover:shadow-[0_0_15px_#f59e0b] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)] transition-all cursor-pointer disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden active:scale-95"
                    title={action.label}
                 >
                     {action.icon}
                     <div className="absolute top-0 right-0 px-1 bg-black/60 text-[8px] font-mono font-bold text-slate-300 border-b border-l border-[#333]">
                         {idx + 1}
                     </div>
                     {/* GCD Overlay */}
                     {combatGcd && <div className="absolute inset-0 bg-black/50 animate-[spin_1.2s_linear_1] rounded-sm pointer-events-none origin-bottom" style={{ borderRadius: '50% 50% 0 0' }}></div>}
                 </button>
             ))}

             {/* Spells */}
             {currentSpells.map((spell, idx) => {
                 const isOnCd = spellCooldowns[spell.id] > 0;
                 return (
                     <button
                        key={'spell_'+spell.id}
                        onClick={() => handleCombatAction(spell)}
                        disabled={combatGcd || character.mana < spell.manaCost || isOnCd}
                        className={`relative group w-10 h-10 md:w-12 md:h-12 bg-[#1a1a1a] border-2 border-[#444] rounded-sm flex items-center justify-center hover:border-cyan-400 hover:shadow-[0_0_15px_#22d3ee] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.8)] transition-all cursor-pointer overflow-hidden active:scale-95 ${
                            (combatGcd || character.mana < spell.manaCost || isOnCd) ? 'opacity-60 grayscale cursor-not-allowed' : ''
                        }`}
                        title={`${spell.name} - ${spell.effect} (${spell.manaCost} mana)`}
                     >
                         <div className="absolute inset-0 bg-gradient-to-tr from-[#111] to-transparent pointer-events-none"></div>
                         {getSpellIcon(spell)}
                         
                         {/* Cooldown Number Overlay */}
                         {isOnCd && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/70 font-black text-rose-500 text-sm z-20 font-mono drop-shadow-[2px_2px_0_#000]">
                                 {spellCooldowns[spell.id]}
                             </div>
                         )}

                         <div className="absolute bottom-0 inset-x-0 text-center bg-black/60 text-[8px] font-mono font-bold text-cyan-300 border-t border-[#333] leading-tight pt-[1px]">
                             {spell.manaCost}m
                         </div>
                     </button>
                 )
             })}
         </div>

      </div>

    </div>
  );
}
