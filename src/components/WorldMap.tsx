import React, { useState, useRef, useEffect } from 'react';
import { Zone } from '../types';
import { GAME_ZONES } from '../data/gameData';
import { MapPin, Search, Compass, Navigation, Waypoints, Sparkles, Layers, Anchor, Bookmark, ScanEye, Flag } from 'lucide-react';

interface WorldMapProps {
  currentZoneId: string;
  onTravel: (zoneId: string) => void;
  language?: 'ru' | 'en';
}

const ZONES_COORDS: Record<string, { x: number, y: number, color: string, name: string }> = {
  'starter-hills': { x: 30, y: 75, color: 'bg-emerald-900/60', name: 'Серебряные Луга' }, // светло-зелёный
  'broken-stars-valley': { x: 45, y: 55, color: 'bg-indigo-900/60', name: 'Долина Звезд' }, // фиолетово-голубой
  'whispering-jungles': { x: 20, y: 40, color: 'bg-green-900/60', name: 'Джунгли' },
  'central-rift': { x: 50, y: 45, color: 'bg-purple-900/60', name: 'Центральный Разлом' },
  'mountain-ridge': { x: 70, y: 40, color: 'bg-slate-800/60', name: 'Горный Хребет' }, // серо-голубой
  'burning-wastes': { x: 80, y: 70, color: 'bg-rose-900/60', name: 'Пылающие Пустоши' }, // оранжево-красный
  'sky-archipelago': { x: 50, y: 20, color: 'bg-sky-900/60', name: 'Парящие Острова' },
  'abyss-underworld': { x: 50, y: 85, color: 'bg-orange-950/60', name: 'Глубины' },
  'broken-horizon': { x: 85, y: 25, color: 'bg-indigo-950/60', name: 'Расколотый Горизонт' },
};

// SVG paths for regions approximations
const MAP_REGIONS = [
  "M 25 70 Q 30 65 35 70 T 40 85 Q 30 90 20 85 Z",
  "M 35 50 Q 45 45 55 55 T 45 65 Q 35 60 30 55 Z",
  "M 60 35 Q 70 30 80 40 T 75 55 Q 65 50 60 35 Z",
  "M 10 35 Q 20 30 30 40 T 25 55 Q 15 50 10 35 Z",
  "M 70 65 Q 85 60 95 75 T 80 90 Q 70 85 65 75 Z",
  "M 45 40 Q 55 35 60 45 T 50 55 C 45 50 40 50 45 40 Z",
];

type Layer = 'base' | 'height' | 'active' | 'rift';
type Filter = 'quests' | 'resources' | 'teleports' | 'events' | 'guilds' | 'bosses';

import PixelWindow from './PixelWindow';

export default function WorldMap({ currentZoneId, onTravel, language = 'ru' }: WorldMapProps) {
  const [activeLayer, setActiveLayer] = useState<Layer>('base');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [search, setSearch] = useState('');
  const [explorerMode, setExplorerMode] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filter[]>(['teleports', 'events']);
  const [waypoint, setWaypoint] = useState<{x: number, y: number} | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.001;
    setZoom(z => Math.min(Math.max(0.5, z + zoomFactor), 4));
  };

  const toggleFilter = (f: Filter) => {
    setActiveFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      setWaypoint({ x: xPercent, y: yPercent });
    }
  };

  return (
    <PixelWindow title={language === 'ru' ? 'Карта Мира - Этерия' : 'World Map - Eteria'}>
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden font-mono bg-[#111111] border-[4px] border-[#222]">
      
      {/* 2D Map Container (Left) */}
      <div 
        className="flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden bg-[#1e2330] isolate min-h-[300px] lg:min-h-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Soft paper/parchment texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Transforming Map Board */}
        <div 
          ref={mapRef}
          className="w-[2000px] h-[2000px] absolute transition-transform duration-75 origin-center"
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            top: '50%', left: '50%', marginTop: '-1000px', marginLeft: '-1000px'
          }}
          onClick={handleMapClick}
        >
          {/* Base Continents/Biomes */}
          {MAP_REGIONS.map((path, idx) => (
             <svg key={idx} className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl opacity-60">
                <path d={path.replace(/(\d+)/g, (m) => String(Number(m) * 20))} fill="none" strokeWidth="2" stroke="rgba(255,255,255,0.1)" className="fill-slate-800/20" />
             </svg>
          ))}

          {/* Zones */}
          {GAME_ZONES.map(zone => {
             const coords = ZONES_COORDS[zone.id];
             if (!coords) return null;
             const isCurrent = currentZoneId === zone.id;
             const isRiftActive = activeLayer === 'rift' && zone.id.includes('rift');
             const isAirActive = activeLayer === 'height' && zone.id.includes('sky');
             
             return (
               <div 
                 key={zone.id} 
                 className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
                 style={{ top: `${coords.y}%`, left: `${coords.x}%` }}
                 onDoubleClick={() => onTravel(zone.id)}
               >
                 {/* Biome Glow */}
                 <div className={`absolute inset-0 blur-3xl rounded-full ${coords.color} opacity-40 group-hover:opacity-60 transition-opacity w-[300px] h-[300px] -translate-x-1/2 -translate-y-1/2`} />
                 
                 {/* Node */}
                 <div className="relative flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all ${isCurrent ? 'bg-amber-400 border-white shadow-[0_0_15px_#fbbf24] scale-125' : 'bg-slate-800/80 border-slate-600 hover:border-amber-400'} ${isRiftActive ? 'shadow-[0_0_20px_#a855f7] border-purple-500' : ''}`} />
                    
                    {!explorerMode && (
                      <span className={`text-[11px] font-bold tracking-widest uppercase mt-2 whitespace-nowrap transition-colors rounded px-1.5 py-0.5 bg-slate-900/50 backdrop-blur-sm border ${isCurrent ? 'text-amber-400 border-amber-900/50' : 'text-slate-400 border-transparent group-hover:text-amber-200'}`}>
                         {coords.name}
                      </span>
                    )}

                    {/* Active indicators (Filters) */}
                    {activeLayer === 'active' && !explorerMode && (
                       <div className="absolute top-0 right-0 translate-x-2 -translate-y-2 flex gap-1">
                          {activeFilters.includes('events') && zone.events?.length ? <Sparkles className="w-3 h-3 text-orange-400 drop-shadow-md" /> : null}
                          {activeFilters.includes('teleports') ? <Waypoints className="w-3 h-3 text-sky-400 drop-shadow-md" /> : null}
                       </div>
                    )}
                 </div>
               </div>
             );
          })}

          {/* Lines connecting zones if needed */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
             {GAME_ZONES.map(zone => {
                 return zone.connections?.map(targetId => {
                    const from = ZONES_COORDS[zone.id];
                    const to = ZONES_COORDS[targetId];
                    if (!from || !to) return null;
                    return <line key={`${zone.id}-${targetId}`} x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="4 4" />
                 });
             })}
          </svg>

          {/* Waypoint visual */}
          {waypoint && (
             <div className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center" style={{ top: `${waypoint.y}%`, left: `${waypoint.x}%` }}>
                <MapPin className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_#fbbf24] animate-bounce" />
                <div className="w-8 h-2 bg-black/40 blur-sm rounded-full mt-1" />
             </div>
          )}
        </div>

        {/* HUD Elements */}
        {/* Search */}
        <div className="absolute top-4 left-4 z-40 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50 p-2 flex items-center shadow-lg">
           <Search className="w-4 h-4 text-slate-400 mr-2" />
           <input 
             type="text" 
             placeholder={language === 'ru' ? "Поиск локации..." : "Search location..."}
             className="bg-transparent border-none text-xs font-mono text-white outline-none w-48 placeholder:text-slate-500"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
        
        {/* Current position */}
        <div className="absolute bottom-4 left-4 z-40 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50 p-2.5 shadow-lg flex items-center gap-3">
           <div className="bg-amber-900/40 border border-amber-700/50 rounded flex items-center justify-center p-1.5">
             <MapPin className="w-4 h-4 text-amber-500" />
           </div>
           <div>
             <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">{language === 'ru' ? 'Текущая позиция' : 'Current position'}</div>
             <div className="text-sm font-bold text-slate-100">{GAME_ZONES.find(z => z.id === currentZoneId)?.name}</div>
           </div>
        </div>
      </div>

      {/* Right Column: Filters and Tools (Pixel Art Styled) */}
      <div className="w-full lg:w-64 bg-[#111111] border-t-[4px] lg:border-t-0 lg:border-l-[4px] border-[#333333] flex shrink-0 lg:flex-col z-40 overflow-x-auto lg:overflow-hidden" style={{ boxShadow: 'inset 4px 0 0 rgba(255,255,255,0.05)' }}>
         <div className="p-3 lg:p-4 border-r-[4px] lg:border-r-0 lg:border-b-[4px] border-[#333333] shrink-0" style={{ boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.5)' }}>
           <h3 className="text-[#ffd700] uppercase tracking-[0.2em] font-bold text-[11px] lg:text-base" style={{ textShadow: '2px 2px 0 #000' }}>
             {language === 'ru' ? 'Карта Мира' : 'World Map'}
           </h3>
           <p className="hidden lg:block text-[10px] text-[#888] mt-2 uppercase tracking-widest">
             Версия 2.1 (2D)
           </p>
         </div>

         {/* Layers */}
         <div className="p-3 lg:p-4 border-r-[4px] lg:border-r-0 lg:border-b-[4px] border-[#333333] shrink-0 flex flex-col justify-center" style={{ boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.5)' }}>
           <div className="hidden lg:block text-[10px] font-bold uppercase tracking-widest text-[#aaa] mb-3" style={{ textShadow: '1px 1px 0 #000' }}>Слои отображения</div>
           <div className="grid grid-cols-2 lg:grid-cols-2 gap-1 lg:gap-2 w-[160px] lg:w-auto">
              <button 
                onClick={() => setActiveLayer('base')} 
                className={`p-1.5 lg:p-2 text-[8px] lg:text-[9px] font-bold uppercase tracking-wider transition-all ${activeLayer === 'base' ? 'bg-[#444] text-[#fff] border-[2px] border-[#666]' : 'bg-[#222] text-[#888] border-[2px] border-[#111] hover:bg-[#333]'}`}
                style={{ boxShadow: activeLayer === 'base' ? 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.5)' : 'inset -2px -2px 0 rgba(0,0,0,0.5)' }}
              >Базовый</button>
              <button 
                onClick={() => setActiveLayer('height')} 
                className={`p-1.5 lg:p-2 text-[8px] lg:text-[9px] font-bold uppercase tracking-wider transition-all ${activeLayer === 'height' ? 'bg-[#004466] text-[#00ccff] border-[2px] border-[#0088cc]' : 'bg-[#222] text-[#888] border-[2px] border-[#111] hover:bg-[#333]'}`}
                style={{ boxShadow: activeLayer === 'height' ? 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.5)' : 'inset -2px -2px 0 rgba(0,0,0,0.5)' }}
              >Высоты</button>
              <button 
                onClick={() => setActiveLayer('active')} 
                className={`p-1.5 lg:p-2 text-[8px] lg:text-[9px] font-bold uppercase tracking-wider transition-all ${activeLayer === 'active' ? 'bg-[#004422] text-[#00ff88] border-[2px] border-[#008844]' : 'bg-[#222] text-[#888] border-[2px] border-[#111] hover:bg-[#333]'}`}
                style={{ boxShadow: activeLayer === 'active' ? 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.5)' : 'inset -2px -2px 0 rgba(0,0,0,0.5)' }}
              >Активный</button>
              <button 
                onClick={() => setActiveLayer('rift')} 
                className={`p-1.5 lg:p-2 text-[8px] lg:text-[9px] font-bold uppercase tracking-wider transition-all ${activeLayer === 'rift' ? 'bg-[#330044] text-[#aa00ff] border-[2px] border-[#660088]' : 'bg-[#222] text-[#888] border-[2px] border-[#111] hover:bg-[#333]'}`}
                style={{ boxShadow: activeLayer === 'rift' ? 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.5)' : 'inset -2px -2px 0 rgba(0,0,0,0.5)' }}
              >Разлом</button>
           </div>
         </div>

         {/* Filters */}
         <div className="p-3 lg:p-4 lg:border-b-[4px] border-[#333333] shrink-0 w-[240px] lg:w-auto lg:shrink lg:flex-1">
            <div className="flex justify-between items-center mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#aaa]" style={{ textShadow: '1px 1px 0 #000' }}>Объекты</div>
              <button 
                onClick={() => setExplorerMode(!explorerMode)}
                className={`text-[9px] px-2 py-1 uppercase font-bold transition-colors border-[2px] ${explorerMode ? 'bg-[#4a2e00] text-[#ffaa00] border-[#8a5a00] shadow-[inset_2px_2px_0_rgba(255,255,255,0.2),inset_-2px_-2px_0_rgba(0,0,0,0.5)]' : 'bg-[#222] text-[#888] border-[#111] shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.5)] hover:bg-[#333]'}`}
              >
                ЛОР
              </button>
            </div>
            
            <div className={`space-y-2 transition-opacity ${explorerMode ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
               {[
                 { id: 'teleports' as Filter, icon: Anchor, label: 'Врата', color: '#00ccff' },
                 { id: 'events' as Filter, icon: Sparkles, label: 'Ивенты', color: '#ffaa00' },
                 { id: 'quests' as Filter, icon: Bookmark, label: 'Квесты', color: '#ffff00' },
                 { id: 'resources' as Filter, icon: Layers, label: 'Лут', color: '#00ff00' },
                 { id: 'guilds' as Filter, icon: Flag, label: 'Клановые', color: '#cc00ff' },
                 { id: 'bosses' as Filter, icon: ScanEye, label: 'Варбоссы', color: '#ff3333' },
               ].map(f => (
                  <button 
                    key={f.id}
                    onClick={() => toggleFilter(f.id)}
                    className="flex justify-between items-center w-full px-2 py-2 bg-[#222] border-[2px] border-[#111] hover:bg-[#333] transition-colors"
                    style={{ boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.5)' }}
                  >
                     <div className="flex items-center gap-3">
                       <f.icon className="w-4 h-4" style={{ color: f.color, filter: 'drop-shadow(1px 1px 0 #000)' }} />
                       <span className="text-[10px] text-[#ccc] font-bold uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #000' }}>{f.label}</span>
                     </div>
                     <div className={`w-3 h-3 flex items-center justify-center border-[2px] transition-colors ${activeFilters.includes(f.id) ? 'bg-[#00ff88] border-[#004422]' : 'bg-[#111] border-[#000]'}`}>
                        {activeFilters.includes(f.id) && <div className="w-1 h-1 bg-white" />}
                     </div>
                  </button>
               ))}
            </div>
         </div>
         
         <div className="p-3 lg:p-4 border-l-[4px] lg:border-l-0 shrink-0 flex items-center justify-center bg-[#111111] border-[#333333]" style={{ boxShadow: 'inset 4px 0 0 rgba(0,0,0,0.5)' }}>
           <button 
             onClick={() => { setZoom(1); setPan({x: 0, y: 0}); }}
             className="px-6 lg:w-full py-3 h-[40px] lg:h-auto bg-[#444] text-[#eee] hover:bg-[#555] active:bg-[#333] border-[2px] border-[#666] transition-colors text-[10px] font-bold tracking-widest uppercase flex justify-center items-center gap-2"
             style={{ boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.5)' }}
           >
             <Navigation className="w-3 h-3" />
             Сброс
           </button>
         </div>
      </div>
      </div>
    </PixelWindow>
  );
}
