import React from 'react';
import { Shield, Sword, Crown, Sparkles, User } from 'lucide-react';

interface Character2DModelProps {
  charClass: string;
  equipment: any;
  race: string;
}

export default function Character2DModel({ charClass, equipment, race }: Character2DModelProps) {
  const getSkinColor = (race: string) => {
    const colors: Record<string, string> = {
      'Human': 'bg-amber-200',
      'Elf': 'bg-amber-100',
      'Dark Elf': 'bg-indigo-300',
      'Dwarf': 'bg-red-200',
      'Troll': 'bg-green-300',
      'Ogre': 'bg-gray-300',
    };
    return colors[race] || 'bg-amber-200';
  };

  const getClassColor = (c: string) => {
    if (['Warrior', 'Paladin'].includes(c)) return 'text-slate-400 bg-slate-900 border-slate-700'; 
    if (['Rogue', 'Ranger'].includes(c)) return 'text-amber-700 bg-amber-950 border-amber-900'; 
    if (['Priest', 'Shaman'].includes(c)) return 'text-emerald-500 bg-emerald-950 border-emerald-900'; 
    return 'text-indigo-400 bg-indigo-950 border-indigo-900'; 
  };
  
  const skinClass = getSkinColor(race);
  const classObj = getClassColor(charClass);

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-slate-900 overflow-hidden rounded-xl z-0">
         <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950"></div>
         <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1Ij48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI1IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiLz48L3N2Zz4=')]"></div>
      </div>

      <div className={`relative z-10 flex flex-col items-center justify-center w-64 h-80 rounded-2xl border-2 shadow-2xl overflow-hidden ${classObj}`}>
         <div className="absolute inset-0 opacity-30 bg-gradient-to-t from-black via-transparent to-white/20"></div>
         
         {/* Simple 2D Avatar representation */}
         <div className="relative flex flex-col items-center justify-center z-20">
            {/* Head */}
            <div className={`w-20 h-24 rounded-full ${skinClass} shadow-inner flex items-center justify-center relative mb-1 border-2 border-black/40`}>
              {equipment.head ? (
                 <div className="absolute inset-0 bg-slate-700 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-lg">
                    <div className="w-8 h-2 bg-black rounded-full" />
                 </div>
              ) : (
                <div className="flex gap-4 absolute top-10">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Body */}
            <div className="relative">
              <div className={`w-28 h-32 ${equipment.chest ? 'bg-slate-700' : skinClass} rounded-t-3xl border-2 border-black/40 shadow-inner flex justify-center`}>
                {equipment.chest && (
                  <div className="w-10 h-full bg-slate-800 opacity-50 relative">
                     <div className="w-full h-2 bg-slate-900 absolute top-4"></div>
                     <div className="w-full h-2 bg-slate-900 absolute top-12"></div>
                  </div>
                )}
              </div>
              
              {/* Shoulders */}
              {equipment.shoulders && (
                <>
                  <div className="absolute -left-6 -top-2 w-12 h-14 bg-slate-600 rounded-lg border-2 border-slate-500 shadow-md transform -rotate-12"></div>
                  <div className="absolute -right-6 -top-2 w-12 h-14 bg-slate-600 rounded-lg border-2 border-slate-500 shadow-md transform rotate-12"></div>
                </>
              )}
            </div>
         </div>
      </div>
      
      {/* Props UI Layers */}
      <div className="absolute bottom-4 left-4 z-20">
         <div className="bg-slate-950/80 border border-slate-800 p-2 rounded flex flex-col gap-1 text-[10px] font-mono text-slate-400">
           <span className="text-white font-bold">{race}</span>
           <span className="text-amber-400">{charClass}</span>
         </div>
      </div>
    </div>
  );
}
