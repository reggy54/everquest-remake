import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, Zone } from '../types';
import { MapPin, Compass, Shield, Maximize2, Minimize2, Eye, EyeOff, Layers, Skull, Search, Sparkles, Navigation } from 'lucide-react';

export interface MapEntity {
  id: string;
  type: 'monster' | 'bot' | 'chest' | 'campfire' | 'portal' | 'merchant' | 'quest' | 'background';
  name: string;
  x: number;
  y: number;
  level?: number;
  hp?: number;
  maxHp?: number;
  isBoss?: boolean;
  class?: string;
  icon?: string;
  looted?: boolean;
  targetZoneId?: string;
}

interface MapExplorer2DProps {
  activeZone: Zone;
  character: PlayerCharacter;
  playerX: number;
  playerY: number;
  mapEntities: MapEntity[];
  onPlayerMove: (dx: number, dy: number) => void;
  MAP_COLS: number;
  MAP_ROWS: number;
  isObstacle: (x: number, y: number, zoneId: string) => boolean;
}

export default function MapExplorer2D({
  activeZone,
  character,
  playerX,
  playerY,
  mapEntities,
  onPlayerMove,
  MAP_COLS,
  MAP_ROWS,
  isObstacle,
}: MapExplorer2DProps) {

  const [viewMode, setViewMode] = useState<'mini' | 'big'>('big');
  const [altitude, setAltitude] = useState<'air' | 'ground' | 'underground'>('ground');
  
  const [filters, setFilters] = useState({
    monsters: true,
    npcs: true,
    quests: true,
    players: true, // Bots
    resources: true // Chests/Campfires
  });

  const toggleFilter = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const entitiesHere = mapEntities.filter(e => e.x === playerX && e.y === playerY);

  const canMove = (dx: number, dy: number) => {
    const nx = playerX + dx;
    const ny = playerY + dy;
    if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) return false;
    return !isObstacle(nx, ny, activeZone.id);
  };

  // Click on the map to try moving
  const handleTileClick = (tx: number, ty: number) => {
     const dx = tx - playerX;
     const dy = ty - playerY;
     // Only allow moving to adjacent tiles
     if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
         if (canMove(dx, dy)) {
             onPlayerMove(dx, dy);
         }
     }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-lg relative overflow-hidden flex flex-col h-full min-h-[500px]">
      
      {/* MAP HEADER */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80 p-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <h4 className="font-serif text-sm md:text-base font-bold text-slate-200 uppercase tracking-widest hidden sm:block">
            {activeZone.name}
          </h4>
          
          <div className="flex bg-slate-950 rounded border border-slate-800 p-0.5 overflow-hidden">
             <button 
                onClick={() => setAltitude('air')} 
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 ${altitude === 'air' ? 'bg-sky-900/50 text-sky-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Небеса
             </button>
             <button 
                onClick={() => setAltitude('ground')} 
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 ${altitude === 'ground' ? 'bg-emerald-900/50 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Наземный
             </button>
             <button 
                onClick={() => setAltitude('underground')} 
                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 ${altitude === 'underground' ? 'bg-purple-900/50 text-purple-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                Глубины
             </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] bg-black font-mono text-slate-400 border border-slate-800 px-2 py-1 rounded shadow-inner">
            <Navigation className="h-3 w-3 text-amber-500" />
            <span>X: {playerX}, Y: {playerY}</span>
          </div>
          <button 
            onClick={() => setViewMode(prev => prev === 'big' ? 'mini' : 'big')}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors border border-slate-700"
            title={viewMode === 'big' ? 'Переключить на Мини-карту' : 'Открыть Большую карту'}
          >
            {viewMode === 'big' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAP BODY */}
      <div className="flex-1 flex flex-col md:flex-row relative">
         
         {/* LEFT PANEL: FILTERS (Only in Big Map) */}
         {viewMode === 'big' && (
             <div className="w-full md:w-48 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800 p-3 flex flex-col gap-3 min-h-[120px] overflow-x-auto md:overflow-y-auto">
                <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-widest border-b border-slate-800 pb-1 flex items-center gap-1">
                   <Layers className="w-3 h-3" /> Map Filters
                </h5>
                <div className="flex md:flex-col gap-2">
                    <button onClick={() => toggleFilter('monsters')} className={`flex items-center gap-2 text-[11px] p-1.5 rounded border transition-colors ${filters.monsters ? 'bg-red-950/30 border-red-900/50 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                       <Skull className="w-3.5 h-3.5" /> Монстры
                    </button>
                    <button onClick={() => toggleFilter('npcs')} className={`flex items-center gap-2 text-[11px] p-1.5 rounded border transition-colors ${filters.npcs ? 'bg-amber-950/30 border-amber-900/50 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                       <Search className="w-3.5 h-3.5" /> NPC
                    </button>
                    <button onClick={() => toggleFilter('quests')} className={`flex items-center gap-2 text-[11px] p-1.5 rounded border transition-colors ${filters.quests ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                       <Sparkles className="w-3.5 h-3.5" /> Задания
                    </button>
                    <button onClick={() => toggleFilter('players')} className={`flex items-center gap-2 text-[11px] p-1.5 rounded border transition-colors ${filters.players ? 'bg-blue-950/30 border-blue-900/50 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                       <Compass className="w-3.5 h-3.5" /> Игроки
                    </button>
                    <button onClick={() => toggleFilter('resources')} className={`flex items-center gap-2 text-[11px] p-1.5 rounded border transition-colors ${filters.resources ? 'bg-orange-950/30 border-orange-900/50 text-orange-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                       <MapPin className="w-3.5 h-3.5" /> Ресурсы
                    </button>
                </div>
             </div>
         )}
         
         {/* THE GRID RENDERER */}
         <div className="flex-1 flex flex-col items-center justify-center p-4 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
             {/* Dynamic scaling based on viewMode */}
             <div 
               className="grid gap-[2px] p-[2px] bg-slate-800/80 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)] mx-auto relative select-none"
               style={{ 
                  gridTemplateColumns: `repeat(${MAP_COLS}, minmax(0, 1fr))`,
                  width: viewMode === 'mini' ? '250px' : 'min(100%, 700px)',
                  maxWidth: '100%',
                  aspectRatio: `${MAP_COLS} / ${MAP_ROWS}`
               }}
             >
                 {Array.from({ length: MAP_ROWS }).map((_, y) => 
                     Array.from({ length: MAP_COLS }).map((_, x) => {
                         const isWall = isObstacle(x, y, activeZone.id);
                         const isPlayerHere = x === playerX && y === playerY;
                         const isAdjacent = Math.abs(x - playerX) <= 1 && Math.abs(y - playerY) <= 1 && !isPlayerHere && !isWall;
                         
                         // Determine entities in this cell
                         const cellEntities = mapEntities.filter(e => e.x === x && e.y === y);
                         
                         // Determine visual representation
                         let cellColor = isWall ? 'bg-slate-900/90' : 'bg-slate-800/60 hover:bg-slate-700/80 transition-colors';
                         
                         // Render logic for entities based on filters
                         const renderIcons = () => {
                             if (isPlayerHere) return (
                                 <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <Navigation className="w-[60%] h-[60%] text-amber-400 rotate-45 scale-110 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] animate-pulse" />
                                 </div>
                             );
                             
                             let hasRendered = false;
                             return cellEntities.map((e, idx) => {
                                 if (hasRendered) return null; // simplify multiple entities overlapping

                                 if (e.type === 'monster' && filters.monsters) {
                                     hasRendered = true;
                                     return <div key={idx} className={`absolute inset-1 rounded-full ${e.isBoss ? 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,1)] scale-125' : 'bg-red-500/80'}`} />;
                                 }
                                 if ((e.type === 'merchant' || e.type === 'background') && filters.npcs) {
                                     hasRendered = true;
                                     return <div key={idx} className="absolute inset-1.5 rounded bg-amber-400/90 rotate-45 shadow-sm" />;
                                 }
                                 if (e.type === 'quest' && filters.quests) {
                                     hasRendered = true;
                                     return <div key={idx} className="absolute inset-x-2 top-1 bottom-1 bg-emerald-400/90 rounded text-[8px] flex items-center justify-center font-bold">!</div>;
                                 }
                                 if (e.type === 'bot' && filters.players) {
                                     hasRendered = true;
                                     return <div key={idx} className="absolute inset-1.5 rounded-full bg-blue-400/90 shadow-[0_0_5px_rgba(96,165,250,0.8)]" />;
                                 }
                                 if ((e.type === 'chest' || e.type === 'campfire') && filters.resources) {
                                     hasRendered = true;
                                     return <div key={idx} className="absolute inset-2 bg-orange-500/80 map-clip-path" />;
                                 }
                                 if (e.type === 'portal') {
                                     hasRendered = true;
                                     return <div key={idx} className="absolute inset-1 rounded bg-purple-500/60 animate-pulse border border-purple-400/80" />;
                                 }
                                 return null;
                             });
                         };

                         return (
                             <div 
                                 key={`cell-${x}-${y}`}
                                 onClick={() => handleTileClick(x, y)}
                                 className={`relative ${cellColor} ${isAdjacent ? 'cursor-pointer ring-1 ring-white/10' : ''}`}
                             >
                                 {renderIcons()}
                                 {/* Highlight adjacent cells subtly */}
                                 {isAdjacent && viewMode === 'big' && <div className="absolute inset-0 bg-white/5 pointer-events-none" />}
                             </div>
                         );
                     })
                 )}
             </div>

             {/* INTERACTION PANEL (Bottom) */}
             <div className="w-full max-w-3xl mt-4 bg-black/40 border border-slate-800 rounded-lg p-4">
                 {entitiesHere.length > 0 ? (
                    <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                       <h3 className="text-[10px] uppercase font-bold text-slate-500 font-mono border-b border-slate-800 pb-1 mb-2 sticky top-0 bg-black/80 backdrop-blur z-10">
                         Рядом с вами:
                       </h3>
                       {entitiesHere.map(e => (
                         <div key={e.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 p-2 sm:p-3 rounded border border-slate-700 hover:border-amber-500/50 transition-colors gap-2">
                           <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 border border-slate-800 bg-slate-950 text-xl shadow-inner
                                ${e.type === 'monster' ? 'text-red-500' : e.type === 'bot' ? 'text-blue-400' : 'text-amber-500'}
                             `}>
                               {e.type === 'monster' ? (e.icon || '👿') : 
                                e.type === 'chest' ? (e.looted ? '🔓' : '📦') : 
                                e.type === 'bot' ? '🧝' : 
                                e.type === 'merchant' ? '💰' :
                                e.type === 'quest' ? '📜' :
                                e.type === 'background' ? '👤' :
                                e.type === 'portal' ? '🚪' : '🔥'}
                             </div>
                             <div>
                               <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                 {e.name}
                               </h4>
                               <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                 {e.type === 'monster' && `Агрессивный монстр (Ур. ${e.level})`}
                                 {e.type === 'chest' && (e.looted ? 'Пустой сундук' : 'Сундук с сокровищами')}
                                 {e.type === 'bot' && `Искатель приключений (${e.class})`}
                                 {e.type === 'merchant' && `Местный Торговец`}
                                 {e.type === 'quest' && `Квестодатель`}
                                 {e.type === 'background' && `Фоновый Житель`}
                                 {e.type === 'portal' && 'Древние врата (Портал)'}
                                 {e.type === 'campfire' && 'Место для безопасного отдыха'}
                               </p>
                             </div>
                           </div>
                           <button 
                             onClick={() => onPlayerMove(0, 0)}
                             className="bg-amber-600/90 hover:bg-amber-500 text-slate-950 px-4 py-1.5 font-bold text-xs uppercase tracking-wider rounded shadow cursor-pointer transition-transform active:scale-95 w-full sm:w-auto"
                           >
                             Действовать
                           </button>
                         </div>
                       ))}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center justify-center py-4 opacity-50">
                       <MapPin className="w-6 h-6 text-slate-600 mb-2" />
                       <p className="text-sm text-slate-500 italic font-serif">Безопасная территория. Вокруг никого.</p>
                       <p className="text-[10px] text-slate-600 font-mono mt-1">Кликайте по соседним клеткам на карте для перемещения.</p>
                    </div>
                 )}
             </div>
             
             {/* D-PAD for Mobile / Alternative Navigation */}
             {viewMode === 'big' && (
                 <div className="absolute right-4 bottom-4 grid grid-cols-3 gap-1 md:hidden">
                    <div />
                    <button onClick={() => onPlayerMove(0, -1)} disabled={!canMove(0, -1)} className="w-10 h-10 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-slate-400 active:bg-slate-800 disabled:opacity-30">▲</button>
                    <div />
                    <button onClick={() => onPlayerMove(-1, 0)} disabled={!canMove(-1, 0)} className="w-10 h-10 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-slate-400 active:bg-slate-800 disabled:opacity-30">◀</button>
                    <button onClick={() => onPlayerMove(0, 1)} disabled={!canMove(0, 1)} className="w-10 h-10 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-slate-400 active:bg-slate-800 disabled:opacity-30">▼</button>
                    <button onClick={() => onPlayerMove(1, 0)} disabled={!canMove(1, 0)} className="w-10 h-10 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-slate-400 active:bg-slate-800 disabled:opacity-30">▶</button>
                 </div>
             )}
         </div>
      </div>
      
      <style>{`
        .map-clip-path {
           clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        }
      `}</style>
    </div>
  );
}

