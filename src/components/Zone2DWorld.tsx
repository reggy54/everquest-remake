import React, { useMemo, useState, useEffect } from 'react';
import { Zone, PlayerCharacter as Character } from '../types';
import { getCharacterAvatarUrl } from './AvatarIcon';

interface Zone2DWorldProps {
  zone: Zone | null;
  character?: Character;
}

type TileType = 'grass' | 'water' | 'stone' | 'path' | 'lava' | 'sand' | 'snow' | 'darkness';

interface MapTile {
  x: number;
  y: number;
  type: TileType;
  elevation: number;
  hasTree: boolean;
  hasRock: boolean;
  hasBuilding: boolean;
}

export default function Zone2DWorld({ zone, character }: Zone2DWorldProps) {
  // Настройки сетки
  const gridSize = 32; // Увеличим видимую зону
  
  const [playerPos, setPlayerPos] = useState({ x: 16, y: 16 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');

  const mapData = useMemo(() => {
    const seed = zone ? zone.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 123;

    
    // Простая генерация шума
    const pseudoRandom = (x: number, y: number) => {
      const s = Math.sin(seed + x * 12.9898 + y * 78.233) * 43758.5453;
      return s - Math.floor(s);
    };

    let baseTileType: TileType = 'grass';
    let liquidType: TileType = 'water';
    
    if (zone?.id.includes('forest')) {
      baseTileType = 'grass';
    } else if (zone?.id.includes('volcano') || zone?.id.includes('fire')) {
      baseTileType = 'stone';
      liquidType = 'lava';
    } else if (zone?.id.includes('frozen') || zone?.id.includes('ice') || zone?.id.includes('snow')) {
      baseTileType = 'snow';
      liquidType = 'water'; // frozen
    } else if (zone?.id.includes('desert') || zone?.id.includes('sand')) {
      baseTileType = 'sand';
    } else if (zone?.id.includes('ruins') || zone?.id.includes('dungeon')) {
      baseTileType = 'stone';
      liquidType = 'darkness';
    }

    const tiles: MapTile[] = [];
    const centerX = gridSize / 2;
    const centerY = gridSize / 2;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const noiseValue = pseudoRandom(x, y);
        const structureNoise = pseudoRandom(x + 100, y + 100);
        
        let type = baseTileType as TileType;
        let elevation = 0;
        let hasTree = false;
        let hasRock = false;
        let hasBuilding = false;

        // Генерация ландшафта
        if (noiseValue > 0.8 && type !== 'lava') {
          type = liquidType;
          elevation = -1;
        } else if (noiseValue < 0.2) {
          elevation = 1;
        } else if (noiseValue < 0.05) {
          elevation = 2; // Высокие скалы
        }

        // Тропинка по центру
        if (x > gridSize / 2 - 2 && x < gridSize / 2 + 2 && noiseValue > 0.3 && type !== liquidType) {
          type = 'path';
          elevation = 0;
        }

        // Декорации
        if (type === 'grass' || type === 'snow' || type === 'sand') {
          if (structureNoise > 0.85) hasTree = true;
          else if (structureNoise < 0.05) hasRock = true;
        }
        
        if (type === 'stone' && structureNoise > 0.9) {
          hasRock = true;
        }

        // Строения в центре
        if (distFromCenter < 3 && structureNoise > 0.6 && type !== liquidType) {
          hasTree = false;
          hasRock = false;
          hasBuilding = true;
        }

        tiles.push({ x, y, type, elevation, hasTree, hasRock, hasBuilding });
      }
    }
    return tiles;
  }, [zone, gridSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Игнорируем ввод, если активен инпут или textarea
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      setPlayerPos(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let newFacing = facing;

        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'w') newY -= 1;
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 's') newY += 1;
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'a') {
          newX -= 1;
          newFacing = 'left';
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'd') {
          newX += 1;
          newFacing = 'right';
        }

        if (newX === prev.x && newY === prev.y) return prev;
        if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) return prev;

        const tile = mapData.find(t => t.x === newX && t.y === newY);
        if (!tile || tile.hasTree || tile.hasRock || tile.hasBuilding || tile.type === 'water' || tile.type === 'lava') {
          if (newFacing !== facing) setFacing(newFacing);
          return prev;
        }

        if (newFacing !== facing) setFacing(newFacing);
        return { x: newX, y: newY };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mapData, gridSize, facing]);

  const getTileColors = (tile: MapTile) => {
    switch (tile.type) {
      case 'grass': return 'bg-emerald-600 border-emerald-500';
      case 'water': return 'bg-blue-500 border-blue-400';
      case 'stone': return 'bg-slate-700 border-slate-600';
      case 'path':  return 'bg-amber-800 border-amber-700';
      case 'lava':  return 'bg-orange-600 border-orange-500';
      case 'sand':  return 'bg-yellow-600 border-yellow-500';
      case 'snow':  return 'bg-blue-100 border-white';
      case 'darkness': return 'bg-slate-900 border-slate-800';
      default: return 'bg-slate-500 border-slate-400';
    }
  };

  const getTileShadow = (tile: MapTile) => {
    switch (tile.type) {
      case 'grass': return '#059669'; // emerald-600
      case 'water': return '#2563eb'; // blue-600
      case 'stone': return '#334155'; // slate-700
      case 'path':  return '#78350f'; // amber-900
      case 'lava':  return '#ea580c'; // orange-600
      case 'sand':  return '#ca8a04'; // yellow-600
      case 'snow':  return '#94a3b8'; // slate-400
      case 'darkness': return '#0f172a'; // slate-950
      default: return '#334155';
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center z-0 pointer-events-none">
       {/* Background gradient mask */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a] z-20 pointer-events-none" />
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#000000_80%)] z-20 pointer-events-none" />
       
       <div className="relative" style={{ 
          transform: 'rotateX(60deg) rotateZ(-45deg) scale(2.0)', 
          transformStyle: 'preserve-3d',
        }}>
          
        {/* Render Tiles */}
        <div 
          className="relative grid gap-[0px]" 
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 24px)`,
            gridTemplateRows: `repeat(${gridSize}, 24px)`,
            transform: `translate(${-(playerPos.x * 24) + 12}px, ${-(playerPos.y * 24) + 12}px)`,
            transition: 'transform 0.15s linear',
            transformStyle: 'preserve-3d',
          }}
        >
          {mapData.map((tile, i) => {
             const colors = getTileColors(tile);
             const shadowColor = getTileShadow(tile);
             
             // Base tile Z translation
             const translateZ = tile.elevation * 8;
             const isPlayer = playerPos.x === tile.x && playerPos.y === tile.y;
             
             return (
               <div 
                 key={i}
                 className="relative w-[24px] h-[24px]"
                 style={{
                   transformStyle: 'preserve-3d',
                 }}
               >
                 {/* Floor / Ground */}
                 <div 
                   className={`absolute inset-0 border ${colors} ${tile.type === 'lava' || tile.type === 'water' ? 'animate-pulse opacity-80' : ''}`}
                   style={{
                     transform: `translateZ(${translateZ}px)`,
                     boxShadow: `inset 0 0 10px rgba(0,0,0,0.2), 2px 2px 0 ${shadowColor}`,
                   }}
                 />
                 
                 {/* 3D Elements (Trees, Rocks, Buildings) */}
                 {tile.hasTree && (
                   <div 
                     className="absolute"
                     style={{
                       width: '12px',
                       height: '24px',
                       bottom: '4px',
                       left: '6px',
                       background: 'linear-gradient(to right, #064e3b 50%, #047857 50%)', // Tree colors
                       transform: `translateZ(${translateZ}px) rotateX(-90deg) rotateY(45deg)`,
                       transformOrigin: 'bottom center',
                       boxShadow: '0 0 5px rgba(0,0,0,0.5)'
                     }}
                   >
                     {/* Tree Cone */}
                     <div className="w-full h-full" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', background: '#059669' }}></div>
                   </div>
                 )}

                 {tile.hasRock && (
                   <div 
                     className="absolute outline outline-1 outline-slate-600 bg-slate-500"
                     style={{
                       width: '16px',
                       height: '16px',
                       bottom: '0',
                       left: '4px',
                       transform: `translateZ(${translateZ + 8}px)`,
                     }}
                   >
                     <div className="absolute inset-x-0 bottom-0 top-full h-[8px] bg-slate-700" style={{ transformOrigin: 'top', transform: 'rotateX(-90deg)' }} />
                     <div className="absolute inset-y-0 right-0 left-full w-[8px] bg-slate-800" style={{ transformOrigin: 'left', transform: 'rotateY(90deg)' }} />
                   </div>
                 )}

                 {tile.hasBuilding && (
                   <div 
                     className="absolute outline outline-1 outline-amber-900 bg-amber-800"
                     style={{
                       width: '18px',
                       height: '18px',
                       bottom: '0',
                       left: '3px',
                       transform: `translateZ(${translateZ + 12}px)`,
                     }}
                   >
                     <div className="absolute inset-x-0 bottom-0 top-full h-[12px] bg-amber-900" style={{ transformOrigin: 'top', transform: 'rotateX(-90deg)' }} />
                     <div className="absolute inset-y-0 right-0 left-full w-[12px] bg-amber-950" style={{ transformOrigin: 'left', transform: 'rotateY(90deg)' }} />
                     {/* Roof */}
                     <div className="absolute w-full h-[8px] bg-rose-800 -top-[4px] left-0" style={{ transform: 'rotateX(45deg)' }} />
                   </div>
                 )}

                 {/* Player Character */}
                 {isPlayer && (
                   <div 
                     className="absolute z-50 flex items-center justify-center transition-all duration-150"
                     style={{
                       width: '16px',
                       height: '24px',
                       bottom: '2px',
                       left: '4px',
                       transform: `translateZ(${translateZ + 10}px) rotateX(-90deg) rotateY(45deg) scaleX(${facing === 'left' ? -1 : 1})`,
                       transformOrigin: 'bottom center',
                       filter: 'drop-shadow(2px 4px 2px rgba(0,0,0,0.5))'
                     }}
                   >
                      {/* Player Image Sprite */}
                      <div className="relative w-[32px] h-[32px] flex flex-col items-center justify-end -mb-4 -ml-2 pointer-events-none drop-shadow-xl" style={{ transform: 'scale(1.5)' }}>
                         <img 
                            src={getCharacterAvatarUrl(character as any)} 
                            alt="Player" 
                            className="w-full h-full object-contain object-bottom" 
                         />
                      </div>
                   </div>
                 )}
               </div>
             );
          })}
        </div>
       </div>

        {/* Informational UI Overlay */}
       <div className="absolute top-[5%] text-amber-500 font-mono text-xs z-30 opacity-80 uppercase tracking-widest flex flex-col items-center font-bold" style={{ textShadow: '2px 2px 0 #000' }}>
         <span className="text-xl">{zone?.name || 'Мир Этерии'}</span>
         <span className="text-[#aaa] mt-1">Iso-2D High Pixel Rendering</span>
         <span className="text-[#ffaa00] mt-4 text-[10px] px-3 py-1 border-[2px] border-[#ffaa00] bg-[#000]/50 shadow-[inset_2px_2px_0_rgba(255,255,255,0.2)]">WASD / Стрелки для перемещения</span>
       </div>
    </div>
  );
}
