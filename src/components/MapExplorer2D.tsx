import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Zone } from '../types';
import { Compass, User, Ghost, Box, Skull, Key, Star } from 'lucide-react';

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

  // Global Key Bindings for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          dy = -1;
          break;
        case 'arrowdown':
        case 's':
          dy = 1;
          break;
        case 'arrowleft':
        case 'a':
          dx = -1;
          break;
        case 'arrowright':
        case 'd':
          dx = 1;
          break;
      }
      if (dx !== 0 || dy !== 0) {
        onPlayerMove(dx, dy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayerMove]);

  // Calculate visible viewport around the player (e.g., 9x9 grid)
  const VIEW_RADIUS = 5;
  const startX = Math.max(0, playerX - VIEW_RADIUS);
  const endX = Math.min(MAP_COLS - 1, playerX + VIEW_RADIUS);
  const startY = Math.max(0, playerY - VIEW_RADIUS);
  const endY = Math.min(MAP_ROWS - 1, playerY + VIEW_RADIUS);

  const visibleRows = endY - startY + 1;
  const visibleCols = endX - startX + 1;

  const getEntityAt = (cx: number, cy: number) => {
    return mapEntities.find(e => e.x === cx && e.y === cy);
  };

  const renderCell = (cx: number, cy: number) => {
    const isPlayer = playerX === cx && playerY === cy;
    const entity = getEntityAt(cx, cy);
    const obstacle = isObstacle(cx, cy, activeZone.id);
    
    let content = null;
    let cellStyle = "bg-slate-900 border-slate-800";
    
    if (obstacle) {
      cellStyle = "bg-slate-800 border-slate-700 opacity-60";
      content = <div className="w-1/2 h-1/2 bg-slate-700 rounded-sm" />;
    } else if (isPlayer) {
      cellStyle = "bg-emerald-950/40 border-emerald-800 z-10 scale-110";
      content = <User className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />;
    } else if (entity) {
      if (entity.type === 'monster') {
        cellStyle = "bg-red-950/30 border-red-900/50";
        content = entity.isBoss ? <Skull className="w-6 h-6 text-red-500 animate-pulse" /> : <Ghost className="w-5 h-5 text-red-400" />;
      } else if (entity.type === 'chest') {
        cellStyle = "bg-amber-950/30 border-amber-900/50";
        content = <Box className="w-5 h-5 text-amber-500" />;
      } else if (entity.type === 'portal') {
        cellStyle = "bg-purple-950/30 border-purple-900/50";
        content = <Star className="w-5 h-5 text-purple-400 animate-spin-slow" />;
      } else {
        cellStyle = "bg-blue-950/30 border-blue-900/50";
        content = <Compass className="w-5 h-5 text-blue-400" />;
      }
    }

    return (
      <div 
        key={`${cx}-${cy}`} 
        className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center transition-all ${cellStyle} rounded-md`}
        title={isPlayer ? character.name : entity ? entity.name : ''}
      >
        {content}
      </div>
    );
  };

  const gridCells = [];
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      gridCells.push(renderCell(x, y));
    }
  }

  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col relative h-[500px] shadow-lg">
      
      {/* 2D Grid Map View */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950">
        <div 
          className="grid gap-1 p-4 absolute transition-transform duration-300"
          style={{ 
            gridTemplateColumns: `repeat(${visibleCols}, minmax(0, 1fr))`,
          }}
        >
          {gridCells}
        </div>
      </div>

      {/* Retro UI Overlay */}
      <div className="absolute top-0 right-0 p-4 w-64 pointer-events-none z-10 flex flex-col items-end gap-3 opacity-90">
         <div className="bg-slate-900/90 backdrop-blur border border-emerald-900/50 p-3 rounded-lg shadow-xl pointer-events-auto w-full">
            <h4 className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-2 mb-2 font-mono">
              <Compass className="w-3 h-3" />
              Навигация (W A S D)
            </h4>
            <p className="text-[9px] text-slate-400 font-mono leading-relaxed">
              Вы в зоне <strong className="text-white">{activeZone.name}</strong>.
            </p>
         </div>
      </div>

      {/* Mobile/Mouse Controls */}
      <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700/50 p-3 rounded-lg shadow-xl z-10">
          <div className="grid grid-cols-3 gap-1 w-32 mx-auto">
              <div />
              <button className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 p-2 rounded shadow flex justify-center border border-slate-600" onClick={() => onPlayerMove(0, -1)}>▲</button>
              <div />
              <button className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 p-2 rounded shadow flex justify-center border border-slate-600" onClick={() => onPlayerMove(-1, 0)}>◀</button>
              <button className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 p-2 rounded shadow flex justify-center border border-slate-600" onClick={() => onPlayerMove(0, 1)}>▼</button>
              <button className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 p-2 rounded shadow flex justify-center border border-slate-600" onClick={() => onPlayerMove(1, 0)}>▶</button>
          </div>
      </div>
      
    </div>
  );
}
