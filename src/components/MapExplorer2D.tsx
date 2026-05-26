import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Zone } from '../types';
import { MapPin, Compass, Shield, HelpCircle } from 'lucide-react';

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

  // Fog of War (Explored tiles) is less relevant with pure text navigation, 
  // but we can still keep track of coordinate exploration if needed, 
  // though we will just render a text description instead of a map.

  const entitiesHere = mapEntities.filter(e => e.x === playerX && e.y === playerY);

  const canMove = (dx: number, dy: number) => {
    const nx = playerX + dx;
    const ny = playerY + dy;
    if (nx < 0 || nx >= MAP_COLS || ny < 0 || ny >= MAP_ROWS) return false;
    return !isObstacle(nx, ny, activeZone.id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-6 space-y-6 shadow-lg relative overflow-hidden">
      
      {/* Decorative top header line */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-serif text-base font-bold text-slate-200">
            {activeZone.name} — Интерактивное Исследование
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-slate-950 font-mono text-slate-400 border border-slate-800 px-2.5 py-1 rounded">
          <Compass className="h-3.5 w-3.5 text-amber-500" />
          <span>X: {playerX}, Y: {playerY}</span>
        </div>
      </div>

      <div className="bg-slate-950 p-6 rounded-lg border border-slate-800/80 shadow-inner">
        {/* Environment Text Description */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="font-serif text-2xl text-amber-500 uppercase tracking-widest font-black">
            {activeZone.name}
          </h2>
          <p className="text-slate-400 font-mono text-sm leading-relaxed max-w-lg mx-auto">
            Вы находитесь в точке <span className="text-amber-400">[{playerX}, {playerY}]</span>. 
            Осмотритесь вокруг, чтобы решить, куда двигаться дальше.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-500 pt-3">
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-sm opacity-80" title="Распределяют задания и задают экономику" >
              Квестодатели и Торговцы: <span className="text-cyan-400 font-bold">{Math.floor(mapEntities.filter(e => e.type === 'merchant' || e.type === 'quest').length * 15 + 50)}</span>
            </span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-sm opacity-80" title="Живой мир">
              Фоновые NPC: <span className="text-amber-400 font-bold">{Math.floor(mapEntities.filter(e => e.type === 'background').length * 40 + 100)}</span>
            </span>
            <span className="bg-slate-900 border border-slate-700 px-2 py-1 rounded shadow-sm opacity-80" title="Опасная зона">
              Мобы в локации: <span className="text-red-400 font-bold">{mapEntities.filter(e => e.type === 'monster').length * 50 + 1000}</span>
            </span>
          </div>
        </div>

        {/* Entities Here */}
        <div className="bg-slate-900/50 p-4 border border-slate-800 rounded-lg mb-8 min-h-[100px] flex items-center justify-center">
          {entitiesHere.length > 0 ? (
            <div className="space-y-3 w-full">
              <h3 className="text-[10px] uppercase font-bold text-slate-500 font-mono border-b border-slate-800 pb-1 mb-2">
                Прямо перед вами:
              </h3>
              {entitiesHere.map(e => (
                <div key={e.id} className="flex items-center justify-between bg-slate-950 p-3 rounded border border-slate-700 hover:border-amber-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl drop-shadow-md">
                      {e.type === 'monster' ? (e.icon || '👿') : 
                       e.type === 'chest' ? (e.looted ? '🔓' : '📦') : 
                       e.type === 'bot' ? '🧝' : 
                       e.type === 'merchant' ? '💰' :
                       e.type === 'quest' ? '📜' :
                       e.type === 'background' ? '👤' :
                       e.type === 'portal' ? '🚪' : '🔥'}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                        {e.name}
                        {(e.type === 'bot' || e.type === 'merchant' || e.type === 'quest' || e.type === 'background') && (
                          <span className="text-[8px] bg-slate-800 text-slate-400 px-1 py-0.5 rounded font-mono border border-slate-700">NPC</span>
                        )}
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
                    onClick={() => {
                      // Trigger interaction by moving "into" the same tile again
                      onPlayerMove(0, 0); 
                    }}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-950 px-4 py-2 font-bold text-xs uppercase tracking-wider rounded shadow cursor-pointer transition-transform active:scale-95"
                  >
                    Взаимодействовать
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic font-serif">Здесь ничего нет. Тихий ветер гуляет по этой местности...</p>
          )}
        </div>

        {/* Text Navigation Choices */}
        <div>
          <h3 className="text-[11px] uppercase font-bold text-slate-500 font-mono border-b border-slate-800 pb-2 mb-4 text-center tracking-widest">
            Куда отправиться дальше? (Текстовый Выбор)
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {/* North */}
            <button
              onClick={() => onPlayerMove(0, -1)}
              disabled={!canMove(0, -1)}
              className="relative group bg-slate-900 border border-slate-700 hover:border-amber-500/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 group-hover:text-amber-500 font-black text-lg">▲</span>
                <span className="font-bold text-slate-200 group-hover:text-amber-400">Идти на Север</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">y - 1</span>
            </button>

            {/* South */}
            <button
              onClick={() => onPlayerMove(0, 1)}
              disabled={!canMove(0, 1)}
              className="relative group bg-slate-900 border border-slate-700 hover:border-amber-500/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 group-hover:text-amber-500 font-black text-lg">▼</span>
                <span className="font-bold text-slate-200 group-hover:text-amber-400">Идти на Юг</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">y + 1</span>
            </button>

            {/* West */}
            <button
              onClick={() => onPlayerMove(-1, 0)}
              disabled={!canMove(-1, 0)}
              className="relative group bg-slate-900 border border-slate-700 hover:border-amber-500/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 group-hover:text-amber-500 font-black text-lg">◀</span>
                <span className="font-bold text-slate-200 group-hover:text-amber-400">Идти на Запад</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">x - 1</span>
            </button>

            {/* East */}
            <button
              onClick={() => onPlayerMove(1, 0)}
              disabled={!canMove(1, 0)}
              className="relative group bg-slate-900 border border-slate-700 hover:border-amber-500/80 hover:bg-slate-800 disabled:opacity-40 disabled:hover:border-slate-700 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 group-hover:text-amber-500 font-black text-lg">▶</span>
                <span className="font-bold text-slate-200 group-hover:text-amber-400">Идти на Восток</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">x + 1</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
