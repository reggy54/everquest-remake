import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Zone } from '../types';
import { Compass, User, Ghost, Box, Skull, Key, Star, Shield, Flame, Sparkles, Heart, Crosshair, Store, HelpCircle, Swords } from 'lucide-react';

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
  onlinePlayers?: any[];
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
  onlinePlayers = [],
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

  const getMiniModel = (charClass: string, isSelf: boolean, isOther: boolean) => {
    let IconComponent = User;
    let bgClass = "bg-slate-900";
    let borderClass = "border-slate-700/80";
    let textClass = "text-slate-400";
    let glowClass = "";

    const cl = charClass?.toLowerCase() || '';

    if (cl.includes('warrior')) {
      IconComponent = Shield;
      bgClass = "bg-slate-800";
      borderClass = "border-slate-500";
      textClass = "text-slate-300";
      glowClass = "drop-shadow-[0_0_4px_rgba(203,213,225,0.4)]";
    } else if (cl.includes('paladin')) {
      IconComponent = Shield;
      bgClass = "bg-amber-950/80";
      borderClass = "border-amber-500";
      textClass = "text-amber-300";
      glowClass = "drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]";
    } else if (cl.includes('mage')) {
      IconComponent = Sparkles;
      bgClass = "bg-purple-950/80";
      borderClass = "border-purple-500";
      textClass = "text-purple-300";
      glowClass = "drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]";
    } else if (cl.includes('summoner')) {
      IconComponent = Sparkles;
      bgClass = "bg-fuchsia-950/80";
      borderClass = "border-fuchsia-400";
      textClass = "text-fuchsia-300";
      glowClass = "drop-shadow-[0_0_4px_rgba(217,70,239,0.5)]";
    } else if (cl.includes('ranger')) {
      IconComponent = Crosshair;
      bgClass = "bg-emerald-950/80";
      borderClass = "border-emerald-500";
      textClass = "text-emerald-300";
      glowClass = "drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]";
    } else if (cl.includes('rogue')) {
      IconComponent = Swords;
      bgClass = "bg-rose-950/90";
      borderClass = "border-rose-500";
      textClass = "text-rose-300";
      glowClass = "drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]";
    } else if (cl.includes('priest')) {
      IconComponent = Heart;
      bgClass = "bg-blue-950/80";
      borderClass = "border-sky-400";
      textClass = "text-sky-300";
      glowClass = "drop-shadow-[0_0_5px_rgba(56,189,248,0.5)]";
    } else if (cl.includes('shaman')) {
      IconComponent = Flame;
      bgClass = "bg-teal-950/80";
      borderClass = "border-teal-500";
      textClass = "text-teal-300";
      glowClass = "drop-shadow-[0_0_4px_rgba(20,184,166,0.5)]";
    }

    let ringClass = "";
    if (isSelf) {
      ringClass = "ring-2 ring-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse";
    } else if (isOther) {
      ringClass = "ring-2 ring-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse";
    }

    return (
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 ${bgClass} ${borderClass} ${ringClass} ${glowClass} relative transition-all duration-300`}>
        <IconComponent className={`w-4.5 h-4.5 ${textClass}`} />
        {isSelf && (
          <span className="absolute -top-1.5 -right-1.5 bg-emerald-550 text-white text-[5.5px] font-mono font-black px-1 rounded-sm border border-slate-950 scale-90 tracking-tighter">
            ВЫ
          </span>
        )}
        {!isSelf && isOther && (
          <span className="absolute -top-1.5 -right-1.5 bg-cyan-500 text-slate-950 text-[5.5px] font-mono font-black px-1 rounded-sm border border-slate-950 scale-90 tracking-tighter animate-pulse">
            ИГР
          </span>
        )}
      </div>
    );
  };

  const renderCell = (cx: number, cy: number) => {
    const isPlayer = playerX === cx && playerY === cy;
    const otherPlayer = onlinePlayers?.find(p => p.playerX === cx && p.playerY === cy);
    const entity = getEntityAt(cx, cy);
    const obstacle = isObstacle(cx, cy, activeZone.id);
    
    let content = null;
    let cellStyle = "bg-slate-900 border-slate-800 hover:bg-slate-850";
    let hoverTitle = "";
    
    if (obstacle) {
      cellStyle = "bg-slate-800 border-slate-700 opacity-60";
      content = <div className="w-1/2 h-1/2 bg-slate-700 rounded-sm" />;
    } else if (isPlayer) {
      cellStyle = "z-10 scale-110";
      content = getMiniModel(character.class, true, false);
      hoverTitle = `${character.name} (Вы) • ур. ${character.level} ${character.class}`;
    } else if (otherPlayer) {
      cellStyle = "z-10 scale-110";
      content = getMiniModel(otherPlayer.class, false, true);
      hoverTitle = `${otherPlayer.name} (Игрок) • ур. ${otherPlayer.level} ${otherPlayer.class}`;
    } else if (entity) {
      hoverTitle = entity.name;
      
      if (entity.type === 'monster') {
        if (entity.isBoss) {
          cellStyle = "bg-red-950/40 border-red-700/80 ring-2 ring-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)] z-10 scale-110";
          content = (
            <div className="w-8 h-8 rounded-full bg-red-950 border border-red-500 flex items-center justify-center animate-pulse duration-1000">
              <Skull className="w-4.5 h-4.5 text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]" />
            </div>
          );
        } else {
          cellStyle = "bg-red-950/20 border-red-900/40 hover:border-red-500/50";
          content = (
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-red-800/60 flex items-center justify-center">
              <Ghost className="w-3.5 h-3.5 text-red-400" />
            </div>
          );
        }
      } else if (entity.type === 'merchant') {
        cellStyle = "bg-amber-950/20 border-amber-900/40 hover:border-amber-500/50";
        hoverTitle = `${entity.name} (Торговец)`;
        content = (
          <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-600 flex items-center justify-center shadow-[0_0_8px_rgba(245,158,11,0.3)] animate-pulse duration-3000">
            <Store className="w-4 h-4 text-amber-500" />
          </div>
        );
      } else if (entity.type === 'quest') {
        cellStyle = "bg-yellow-950/20 border-yellow-900/40 hover:border-yellow-550";
        hoverTitle = `${entity.name} (Задание!)`;
        content = (
          <div className="w-8 h-8 rounded-full bg-slate-950 border-2 border-yellow-500 flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.4)]">
            <HelpCircle className="w-4 h-4 text-yellow-500" />
          </div>
        );
      } else if (entity.type === 'bot') {
        const botClass = entity.class || 'Warrior';
        cellStyle = "bg-indigo-950/20 border-indigo-900/40";
        hoverTitle = `${entity.name} (Бот-${botClass})`;
        content = getMiniModel(botClass, false, false);
      } else if (entity.type === 'campfire') {
        cellStyle = "bg-orange-950/10 border-orange-900/40";
        content = (
          <div className="w-7 h-7 rounded-full bg-slate-950 border border-orange-550 flex items-center justify-center shadow-[0_0_6px_rgba(249,115,22,0.4)]">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          </div>
        );
      } else if (entity.type === 'chest') {
        cellStyle = "bg-amber-950/20 border-amber-900/30";
        content = <Box className="w-5 h-5 text-amber-500" />;
      } else if (entity.type === 'portal') {
        cellStyle = "bg-purple-950/20 border-purple-900/30";
        content = <Star className="w-5 h-5 text-purple-400 animate-spin-slow" />;
      } else {
        cellStyle = "bg-blue-950/20 border-blue-900/30";
        content = <Compass className="w-4 h-4 text-blue-400" />;
      }
    }

    return (
      <div 
        key={`${cx}-${cy}`} 
        className={`w-10 h-10 sm:w-12 sm:h-12 border flex items-center justify-center transition-all ${cellStyle} rounded-md`}
        title={hoverTitle}
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

         {onlinePlayers && onlinePlayers.length > 0 && (
           <div className="bg-slate-900/90 backdrop-blur border border-cyan-900/50 p-3 rounded-lg shadow-xl pointer-events-auto w-full">
              <h4 className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-2 mb-1.5 font-mono">
                <User className="w-3 h-3 animate-pulse" />
                Игроки в зоне ({onlinePlayers.length})
              </h4>
              <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
                {onlinePlayers.map(p => (
                  <div key={p.name} className="text-[9px] text-slate-300 font-mono flex flex-col border-b border-slate-800/40 pb-1 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-cyan-400 rounded-full animate-ping" />
                        {p.name}
                      </span>
                      <span className="text-slate-400">ур. {p.level}</span>
                    </div>
                    <div className="text-[8px] text-slate-500 pl-2">
                      {p.class} • Координаты: {p.playerX}, {p.playerY}
                    </div>
                  </div>
                ))}
              </div>
           </div>
         )}
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
