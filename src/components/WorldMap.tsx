import React, { useState } from 'react';
import { Zone } from '../types';
import { GAME_ZONES } from '../data/gameData';
import { MapPin, ArrowRight, Compass, Navigation, Wind, Sparkles, Layers, Waypoints } from 'lucide-react';

interface WorldMapProps {
  currentZoneId: string;
  onTravel: (zoneId: string) => void;
  language?: 'ru' | 'en';
}

type MapLayer = 'ground' | 'air' | 'magic';

export default function WorldMap({ currentZoneId, onTravel, language = 'ru' }: WorldMapProps) {
  const [activeLayer, setActiveLayer] = useState<'ground' | 'air' | 'magic' | 'underground' | 'event'>('ground');
  const [showWaypointPath, setShowWaypointPath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'isometric'>('grid');
  const [zoom, setZoom] = useState(100);

  const handleTravelClick = (zoneId: string) => {
     setShowWaypointPath(zoneId);
     setTimeout(() => {
        onTravel(zoneId);
        setShowWaypointPath(null);
     }, 800); // 3D path cinematic delay
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in h-full relative overflow-hidden flex flex-col">
      <div className="border-b border-slate-800 pb-4 sticky top-0 bg-slate-900/90 backdrop-blur z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2 uppercase tracking-[0.2em] shadow-black drop-shadow-md">
             <Compass className="h-6 w-6 text-amber-500 animate-[spin_10s_linear_infinite]" />
             {language === 'ru' ? 'Этерия: Картография' : 'Etherea: Cartography'}
           </h3>
           <p className="text-xs text-slate-400 mt-1 font-mono">
             {language === 'ru' ? 'Разрешение: 25x25км • Живой Горизонт • ' : 'Scale: 25x25km • Living Horizon • '}
             <span className="text-emerald-400">Навигация Активна</span>
           </p>
        </div>

        {/* Map Controls */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 shadow-inner">
             <button 
               onClick={() => setActiveLayer('ground')}
               className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 rounded transition-all ${
                  activeLayer === 'ground' ? 'bg-amber-600/20 text-amber-500 border border-amber-500/50' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <Navigation className="h-3 w-3" />
                {language === 'ru' ? 'Наземный' : 'Ground'}
             </button>
             <button 
               onClick={() => setActiveLayer('air')}
               className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 rounded transition-all hidden sm:flex ${
                  activeLayer === 'air' ? 'bg-sky-600/20 text-sky-400 border border-sky-400/50' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <Wind className="h-3 w-3" />
                {language === 'ru' ? 'Скай' : 'Sky'}
             </button>
             <button 
               onClick={() => setActiveLayer('underground')}
               className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 rounded transition-all hidden sm:flex ${
                  activeLayer === 'underground' ? 'bg-orange-900/40 text-orange-400 border border-orange-400/50' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <Layers className="h-3 w-3" />
                {language === 'ru' ? 'Глубины' : 'Depths'}
             </button>
             <button 
               onClick={() => setActiveLayer('magic')}
               className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 rounded transition-all ${
                  activeLayer === 'magic' ? 'bg-purple-600/20 text-purple-400 border border-purple-400/50' : 'text-slate-500 hover:text-slate-300'
               }`}
             >
                <Sparkles className="h-3 w-3" />
                {language === 'ru' ? 'Лей-линии' : 'Ley Lines'}
             </button>
          </div>
          
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 shadow-inner h-[34px]">
             <button 
               onClick={() => setViewMode(viewMode === 'grid' ? 'isometric' : 'grid')}
               className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase flex items-center gap-1 text-sky-400 border border-sky-500/30 rounded hover:bg-sky-900/30 transition-all font-bold"
             >
                3D MAP MODE: {viewMode === 'isometric' ? 'ON' : 'OFF'}
             </button>
          </div>
        </div>
      </div>

      {/* Global Compass Placeholder */}
      <div className="w-full h-8 bg-slate-950 border border-slate-800 rounded-full relative overflow-hidden flex items-center justify-center shrink-0">
         <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent top-1/2"></div>
         <div className="flex gap-16 text-[10px] font-mono text-amber-500/70 uppercase font-black tracking-widest px-4 absolute w-[200%] animate-[slide_20s_linear_infinite]">
            <span>N</span><span>NE</span><span>E</span><span>SE</span><span>S</span><span>SW</span><span>W</span><span>NW</span>
            <span>N</span><span>NE</span><span>E</span><span>SE</span><span>S</span><span>SW</span><span>W</span><span>NW</span>
         </div>
         <div className="w-0.5 h-6 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,1)] z-10"></div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pr-2 mt-2 -mr-2 relative"
           onWheel={(e) => {
              if (e.ctrlKey || e.metaKey) {
                 e.preventDefault();
                 setZoom(prev => Math.min(Math.max(prev - e.deltaY * 0.1, 50), 200));
              }
           }}>
        <div 
           className={`transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] origin-center min-h-full flex items-center justify-center p-8`}
           style={{ transform: `scale(${zoom / 100}) ${viewMode === 'isometric' ? 'rotateX(55deg) rotateZ(-45deg)' : ''}`, transformStyle: 'preserve-3d' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12 w-full max-w-7xl mx-auto">
            {GAME_ZONES.map(zone => (
            <div 
              key={zone.id} 
              className={`relative rounded-xl overflow-hidden border-2 transition-all p-4 min-h-[260px] flex flex-col justify-between group cursor-default ${
                 currentZoneId === zone.id 
                    ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                    : 'border-slate-800 hover:border-slate-600 shadow-lg'
              }`}
            >
              {/* Background Image with Layer Modifiers */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-all duration-[10s] group-hover:scale-110 ${
                  activeLayer === 'magic' ? 'mix-blend-color-dodge brightness-150 saturate-200 hue-rotate-30' : 
                  activeLayer === 'air' ? 'brightness-125 saturate-50 hue-rotate-15' : ''
                }`}
                style={{ backgroundImage: `url('${zone.imageUrl}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-900/30" />
              
              {/* Magic Layer Leylines */}
              {activeLayer === 'magic' && (
                 <div className="absolute inset-0 opacity-40 pointer-events-none mix-blend-screen">
                    <div className="w-full h-[2px] bg-purple-500 absolute top-1/3 left-0 -rotate-12 shadow-[0_0_15px_#a855f7]" />
                    <div className="w-full h-[1px] bg-sky-500 absolute top-1/2 left-0 rotate-45 shadow-[0_0_10px_#0ea5e9]" />
                 </div>
              )}

              {/* Navigation Mini-map Grid & Active Marker */}
              {currentZoneId === zone.id && (() => {
                const hash = zone.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const topPos = 30 + (hash % 40);
                const leftPos = 20 + ((hash * 7) % 60);
                
                return (
                <div className="absolute inset-0 z-0 pointer-events-none">
                   <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px] opacity-70" />
                   
                   {/* Echo Path Trace Line simulated via dashed border */}
                   <div className="absolute w-[1px] h-full bg-dashed border-l border-dashed border-emerald-500/30 left-10" />

                   {/* Active Player Marker */}
                   <div 
                     className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-1000 ease-out"
                     style={{ top: `${topPos}%`, left: `${leftPos}%` }}
                   >
                      <div className="w-12 h-12 rounded-full border border-emerald-500/50 absolute animate-ping" />
                      <div className="w-3 h-3 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.9)] relative z-10 flex items-center justify-center">
                         <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                      <div className="absolute w-[400%] h-[1px] bg-emerald-500/30" />
                      <div className="absolute h-[400%] w-[1px] bg-emerald-500/30" />
                      
                      <div className="absolute top-5 left-5 bg-slate-950/80 backdrop-blur-sm border border-emerald-900/50 text-emerald-400 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                         Z:{topPos * 10} ALT:{activeLayer === 'air' ? '1500m' : '0m'}
                      </div>
                   </div>
                </div>
              );})()}

              {/* Waypoint Golden Line Animating */}
              {showWaypointPath === zone.id && (
                 <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                    <div className="w-[150%] h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent absolute rotate-45 shadow-[0_0_20px_#fbbf24] animate-[ping_0.8s_ease-out_forwards]" />
                 </div>
              )}

              <div className="relative z-10 space-y-1 flex-1">
                 <div className="flex justify-between items-start">
                    <div>
                      {currentZoneId === zone.id && (
                        <div className="inline-flex bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.5 uppercase rounded tracking-widest shadow-lg items-center gap-1 mb-2 animate-pulse">
                          <MapPin className="h-3 w-3" />
                          {language === 'ru' ? 'ВЫ ЗДЕСЬ' : 'YOU ARE HERE'}
                        </div>
                      )}
                      
                      <h4 className="font-serif text-xl font-bold text-amber-500 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {zone.name}
                      </h4>
                    </div>
                    {/* Fast Travel Icons based on layer/zone */}
                    <div className="flex flex-col gap-1 items-end pt-1">
                       {(zone.minLevel < 30 || activeLayer === 'ground') && (
                         <div className="bg-slate-950/80 border border-emerald-900/50 rounded px-1.5 py-0.5 flex items-center gap-1 backdrop-blur" title="Путевой Камень">
                           <Waypoints className="w-3 h-3 text-emerald-400" />
                           <span className="text-[8px] font-mono text-emerald-400">Waystone</span>
                         </div>
                       )}
                       {(zone.minLevel >= 50 || activeLayer === 'air') && (
                         <div className="bg-slate-950/80 border border-sky-900/50 rounded px-1.5 py-0.5 flex items-center gap-1 backdrop-blur" title="Небесные Врата">
                           <Layers className="w-3 h-3 text-sky-400" />
                           <span className="text-[8px] font-mono text-sky-400">Sky Gate</span>
                         </div>
                       )}
                    </div>
                 </div>

                 <div className="pt-1 flex flw-wrap gap-2">
                    <span className="text-[10px] uppercase font-mono text-slate-300 font-bold bg-slate-950/60 px-2 py-0.5 rounded border border-slate-700/50 backdrop-blur-md">
                      {language === 'ru' ? 'Рек. Ур.' : 'Rec. Lvl'} {zone.minLevel}+
                    </span>
                    {zone.difficulty === 'Raid' && (
                       <span className="text-[10px] uppercase font-mono text-red-400 font-bold bg-slate-950/60 px-2 py-0.5 rounded border border-red-900/50 backdrop-blur-md animate-pulse">
                         {language === 'ru' ? 'Рейд' : 'Raid'}
                       </span>
                    )}
                 </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-2 drop-shadow-md pb-2 pt-1">
                  {zone.description}
                </p>

                {/* Events & POIs container */}
                <div className="mt-2 space-y-2 relative pb-2 backdrop-blur-sm bg-slate-900/40 border border-slate-700/30 p-2 rounded max-h-[80px] overflow-hidden group-hover:max-h-[300px] transition-all duration-300 custom-scrollbar overflow-y-auto">
                    {zone.events && zone.events.length > 0 && (
                        <div>
                             <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-orange-400 mb-1">
                                <Sparkles className="w-3 h-3" />
                                {language === 'ru' ? 'События в зоне:' : 'Zone Events:'}
                             </div>
                             <div className="space-y-1.5">
                                 {zone.events.map((ev, i) => (
                                     <div key={i} className="text-[10px] leading-tight border-l-2 border-orange-500/50 pl-2 ml-1">
                                         <strong className="text-slate-200">{ev.name}</strong> <span className="text-slate-500">({ev.frequency})</span>
                                         <p className="text-slate-400">{ev.description}</p>
                                         <span className="text-amber-500/70 text-[9px]">Награда: {ev.reward}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                    
                    {zone.pointsOfInterest && zone.pointsOfInterest.length > 0 && (
                        <div className="pt-1">
                             <div className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-sky-400 mb-1">
                                <MapPin className="w-3 h-3" />
                                {language === 'ru' ? 'Ключевые локации:' : 'Key Locations:'}
                             </div>
                             <div className="flex flex-wrap gap-1">
                                 {zone.pointsOfInterest.map((poi, i) => (
                                     <span key={i} className="text-[9px] bg-slate-800/80 text-slate-300 px-1 border border-slate-700/50 rounded whitespace-nowrap">
                                        {poi}
                                     </span>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>
              </div>
              
              <div className="relative z-10 w-full mt-auto">
                {currentZoneId !== zone.id ? (
                  <button
                    onClick={() => handleTravelClick(zone.id)}
                    disabled={showWaypointPath !== null}
                    className="w-full bg-slate-800/80 hover:bg-amber-600/90 text-slate-300 hover:text-slate-950 text-xs font-bold py-2.5 px-3 rounded border border-slate-600 hover:border-amber-400 flex items-center justify-center gap-2 uppercase tracking-[0.15em] backdrop-blur-sm transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)] group/btn"
                  >
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    {language === 'ru' ? 'Выстроить Путь' : 'Calculate Path'}
                  </button>
                ) : (
                  <div className="w-full bg-emerald-950/40 text-emerald-500/50 text-[10px] font-mono py-2 text-center uppercase tracking-widest border border-emerald-900/30 rounded backdrop-blur">
                     {language === 'ru' ? 'Текущая Позиция' : 'Current Position'}
                  </div>
                )}
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
      
      {/* Travel Interstitial Overlay (Golden Path Cinematic) */}
      {showWaypointPath && (
         <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
            <Compass className="w-16 h-16 text-amber-500 animate-[spin_2s_ease-in-out_infinite] drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
            <div className="text-amber-500 font-serif text-2xl font-bold mt-4 tracking-widest uppercase shadow-black drop-shadow-lg">
               {language === 'ru' ? 'Построение Золотого Пути...' : 'Plotting Golden Path...'}
            </div>
            <div className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-wider">
               {language === 'ru' ? 'Синхронизация с Путевыми Камнями' : 'Synchronizing Waystones'}
            </div>
         </div>
      )}
    </div>
  );
}
