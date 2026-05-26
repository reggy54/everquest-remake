import React from 'react';
import { PlayerCharacter, Zone } from '../types';
import { MapPin, Compass, Shield, HelpCircle } from 'lucide-react';

export interface MapEntity {
  id: string;
  type: 'monster' | 'bot' | 'chest' | 'campfire' | 'portal';
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

  // Generate tiles array
  const tiles: { x: number; y: number }[] = [];
  for (let y = 0; y < MAP_ROWS; y++) {
    for (let x = 0; x < MAP_COLS; x++) {
      tiles.push({ x, y });
    }
  }

  // Get tile color/texture classes depending on Zone ID
  const getTileStyles = (x: number, y: number) => {
    const isWall = isObstacle(x, y, activeZone.id);
    
    if (activeZone.id === 'qeynos-hills') {
      if (isWall) return 'bg-emerald-900 border-emerald-950 text-emerald-600 font-mono'; // Trees/mountains
      // Central pond representation
      if ((x === 8 && y === 5) || (x === 8 && y === 6) || (x === 9 && y === 5)) {
        return 'bg-cyan-950 border-cyan-900 animate-pulse'; // Pond
      }
      return 'bg-emerald-950/70 border-emerald-900/40 hover:bg-emerald-900/30';
    } 
    
    if (activeZone.id === 'blackburrow') {
      if (isWall) return 'bg-slate-800 border-slate-950 text-slate-500';
      return 'bg-indigo-950/60 border-indigo-900/30 hover:bg-indigo-900/20';
    } 
    
    if (activeZone.id === 'lower-guk') {
      if (isWall) return 'bg-teal-900 border-teal-950 text-emerald-800';
      return 'bg-zinc-900 border-slate-800/80 hover:bg-zinc-800/40';
    } 
    
    if (activeZone.id === 'east-commonlands') {
      if (isWall) return 'bg-amber-900 border-amber-950 text-amber-500'; // Canyon ridges
      return 'bg-yellow-950/40 border-amber-900/20 hover:bg-yellow-900/15'; // Desert sands
    } 
    
    if (activeZone.id === 'castle-mistmoore') {
      if (isWall) return 'bg-rose-950 border-stone-900 text-rose-800'; // Stone castle pillars
      return 'bg-slate-900 border-rose-950/30 hover:bg-slate-800/30'; // Velvet rooms
    } 
    
    // Plane of Fear / General
    if (isWall) return 'bg-fuchsia-950 border-purple-950 text-fuchsia-700';
    return 'bg-slate-950 border-purple-900/20 hover:bg-purple-950/10';
  };

  const getTileOverlayContent = (x: number, y: number) => {
    // 1. Check if player occupies tile
    if (playerX === x && playerY === y) {
      // Find class color representing class
      let flagColor = 'bg-amber-500 text-slate-950';
      if (character.class === 'Wizard' || character.class === 'Enchanter') flagColor = 'bg-cyan-500 text-slate-950';
      else if (character.class === 'Cleric' || character.class === 'Paladin') flagColor = 'bg-yellow-300 text-slate-900';
      else if (character.class === 'Necromancer') flagColor = 'bg-purple-500 text-white';

      return (
        <div className={`relative w-full h-full flex items-center justify-center rounded-sm text-sm font-extrabold shadow-md border ${flagColor} animate-bounce z-10`}>
          👑
          <span className="absolute -bottom-6 px-1.5 py-0.5 bg-slate-950/95 text-yellow-400 text-[8px] font-mono whitespace-nowrap border border-amber-500/30 rounded scale-90">
            {character.name}
          </span>
        </div>
      );
    }

    // 2. Check if entity occupies tile
    const entity = mapEntities.find((e) => e.x === x && e.y === y);
    if (entity) {
      if (entity.type === 'monster') {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-sm relative animate-pulse select-none" title={entity.name}>
            <span className="text-base">{entity.icon || '👿'}</span>
            <span className="absolute -bottom-5 px-1 py-0.5 bg-red-950/95 text-red-400 text-[8px] font-mono rounded border border-red-500/20 scale-75 whitespace-nowrap">
              Lvl {entity.level}
            </span>
          </div>
        );
      }
      if (entity.type === 'bot') {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs relative select-none" title={`${entity.name} (${entity.class})`}>
            <span className="text-sm">🧝</span>
            <span className="absolute -bottom-5 px-1 py-0.5 bg-slate-950/90 text-slate-400 text-[8px] font-mono rounded border border-slate-800 scale-75 whitespace-nowrap">
              {entity.name}
            </span>
          </div>
        );
      }
      if (entity.type === 'chest') {
        return (
          <div className="w-full h-full flex items-center justify-center text-base hover:scale-110 transition-transform filter drop-shadow animate-pulse" title={entity.name}>
            {entity.looted ? '🔓' : '📦'}
          </div>
        );
      }
      if (entity.type === 'campfire') {
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-base relative" title={entity.name}>
            <span className="animate-bounce">🔥</span>
            <span className="absolute -bottom-5 px-1 bg-emerald-950/80 text-emerald-400 text-[7px] font-bold rounded uppercase scale-75 whitespace-nowrap">
              Rest
            </span>
          </div>
        );
      }
      if (entity.type === 'portal') {
        return (
          <div className="w-full h-full flex items-center justify-center text-base animate-pulse border-2 border-dashed border-cyan-500/40 rounded-full" title={entity.name}>
            🚪
          </div>
        );
      }
    }

    // Otherwise render default zone symbols
    const isWall = isObstacle(x, y, activeZone.id);
    if (isWall) {
      if (activeZone.id === 'qeynos-hills') return '🌲';
      if (activeZone.id === 'east-commonlands') return '🌵';
      if (activeZone.id === 'blackburrow') return '🪨';
      if (activeZone.id === 'lower-guk') return '🧱';
      if (activeZone.id === 'castle-mistmoore') return '🦇';
      return '💀';
    }

    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-5 shadow-lg relative overflow-hidden">
      
      {/* Decorative top header line */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-serif text-sm font-bold text-slate-200">
            {activeZone.name} — Interactive 2D World Map
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-slate-950 font-mono text-slate-400 border border-slate-800 px-2.5 py-1 rounded">
          <Compass className="h-3.5 w-3.5 text-amber-500" />
          <span>X: {playerX}, Y: {playerY}</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative flex justify-center bg-slate-1000 p-2.5 rounded-lg border border-slate-950 select-none shadow-inner">
        <div 
          className="grid gap-[2px] w-full max-w-lg aspect-[14/11]"
          style={{ gridTemplateColumns: `repeat(${MAP_COLS}, minmax(0, 1fr))` }}
        >
          {tiles.map((tile) => {
            const styleClass = getTileStyles(tile.x, tile.y);
            return (
              <div
                key={`${tile.x}-${tile.y}`}
                onClick={() => {
                  const dx = tile.x - playerX;
                  const dy = tile.y - playerY;
                  // Allow clicking adjacent tiles to move!
                  if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && (dx !== 0 || dy !== 0)) {
                    onPlayerMove(dx, dy);
                  }
                }}
                className={`aspect-square flex items-center justify-center text-[10px] rounded-[2px] border transition-all duration-150 duration-200 relative cursor-pointer ${styleClass}`}
              >
                {getTileOverlayContent(tile.x, tile.y)}
              </div>
            );
          })}
        </div>
      </div>

      {/* On-screen controls & Legends combo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        
        {/* Legendary Key Map Information */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg space-y-2.5 text-xs font-mono text-slate-400">
          <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider block border-b border-slate-800/80 pb-1 mb-1 flex items-center gap-1">
            <Shield className="h-3 w-3" /> MAP LEGEND GUIDE
          </span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="text-sm bg-slate-900 px-1 py-0.5 rounded">👑</span>
              <span>{character.name} (You)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-slate-900 px-1 py-0.5 rounded">🔥</span>
              <span>Campfire (Heal)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-slate-900 px-1 py-0.5 rounded">📦</span>
              <span>Treasure Chest</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-slate-900 px-1 py-0.5 rounded">🚪</span>
              <span>Connected Portals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-slate-900 px-1 py-0.5 rounded">👿</span>
              <span>Aggressive Foes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-slate-900 px-1 py-0.5 rounded">🧝</span>
              <span>MMO Bot Guildies</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 flex items-start gap-1">
            <HelpCircle className="h-3 w-3 text-slate-500 mt-0.5 shrink-0" />
            <span>Use WASD, Arrow keys, or click/tap adjacent grids to travel and engage monsters!</span>
          </div>
        </div>

        {/* Visual Metallic Retro D-pad Controller */}
        <div className="flex flex-col items-center justify-center p-2">
          <div className="relative w-28 h-28 bg-gradient-to-br from-slate-800 to-slate-950 border-4 border-slate-700 rounded-full shadow-lg flex items-center justify-center">
            {/* Center Core Button */}
            <div className="absolute w-8 h-8 bg-slate-950 border-2 border-slate-700 rounded-full shadow-inner z-10 flex items-center justify-center text-[10px] font-black text-amber-500 select-none">
              PAD
            </div>
            
            {/* Move Up */}
            <button
              onClick={() => onPlayerMove(0, -1)}
              className="absolute top-1 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-amber-600 active:text-slate-950 text-slate-200 border border-slate-700 rounded shadow-md cursor-pointer transition-all duration-100 font-bold"
              title="Move Up"
            >
              ▲
            </button>

            {/* Move Down */}
            <button
              onClick={() => onPlayerMove(0, 1)}
              className="absolute bottom-1 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-amber-600 active:text-slate-950 text-slate-200 border border-slate-700 rounded shadow-md cursor-pointer transition-all duration-100 font-bold"
              title="Move Down"
            >
              ▼
            </button>

            {/* Move Left */}
            <button
              onClick={() => onPlayerMove(-1, 0)}
              className="absolute left-1 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-amber-600 active:text-slate-950 text-slate-200 border border-slate-700 rounded shadow-md cursor-pointer transition-all duration-100 font-bold"
              title="Move Left"
            >
              ◀
            </button>

            {/* Move Right */}
            <button
              onClick={() => onPlayerMove(1, 0)}
              className="absolute right-1 w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:bg-amber-600 active:text-slate-950 text-slate-200 border border-slate-700 rounded shadow-md cursor-pointer transition-all duration-100 font-bold"
              title="Move Right"
            >
              ▶
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
