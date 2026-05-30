import React, { useState } from 'react';
import { Shield, BookOpen, Crown, MapPin, Users, Hexagon, Star, Castle, BookText, Trash2, Grid, Sparkles, Wand2 } from 'lucide-react';
import { PlayerCharacter } from '../types';

interface GuildLandsAndLegendsProps {
  character: PlayerCharacter;
  guild: any;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error' | 'warning') => void;
}

const FURNITURE_CATALOG = [
  { id: 'throne', name: 'Трон Магистра', icon: '👑', cost: 150, prestige: 50, description: 'Величественный каменный трон с позолоченной эмблемой гильдии.' },
  { id: 'table', name: 'Круглый Стол Войны', icon: '🪵', cost: 100, prestige: 35, description: 'Массивный дубовый стол для тактического планирования рейдов.' },
  { id: 'chest', name: 'Запертый Сундук', icon: '🪙', cost: 80, prestige: 25, description: 'Золотой кованый сейф для хранения эпического снаряжения.' },
  { id: 'hearth', name: 'Магический Очаг', icon: '🔥', cost: 60, prestige: 20, description: 'Вечное пламя, восполняющее ману и здоровье гостей.' },
  { id: 'bookcase', name: 'Шкаф Чародея', icon: '📚', cost: 50, prestige: 15, description: 'Полки, забитые фолиантами заклинаний и древними картами.' },
  { id: 'banner', name: 'Орденское Знамя', icon: '🚩', cost: 30, prestige: 10, description: 'Тканый стяг с вышитым гербом вашего союза.' },
  { id: 'statue', name: 'Статуя Дракона', icon: '🐉', cost: 120, prestige: 40, description: 'Величественная скульптура из цельного оникса в полный рост.' },
  { id: 'dummy', name: 'Боевой Манекен', icon: '🎯', cost: 25, prestige: 8, description: 'Чучело для безопасной тренировки комбо-цепочек и ротаций.' },
];

export default function GuildLandsAndLegends({ character, guild, triggerAlert }: GuildLandsAndLegendsProps) {
  // Local state for interactive elements (would be persisted in a real backend, using state for preview)
  const [activeTab, setActiveTab] = useState<'lands' | 'hall' | 'legends'>('lands');
  const [holdings, setHoldings] = useState([
    { id: '1', name: 'Сумрачный Удел', type: 'village', income: 15, level: 1 },
    { id: '2', name: 'Рудники Кейноса', type: 'mine', income: 30, level: 2 },
  ]);

  const [legends, setLegends] = useState([
    { id: '1', date: 'Год назад', title: `Основание Гильдии`, description: `Одинокий странник основал братство ${guild.name}.` },
    { id: '2', date: '6 месяцев назад', title: 'Первая Кровь', description: 'Триумфально отбили атаку на Высший Перевал.' },
  ]);

  // Guild Hall state
  const [placedFurniture, setPlacedFurniture] = useState<Record<string, string>>({
    '0-3': 'throne',
    '1-2': 'banner',
    '1-4': 'banner',
    '3-3': 'table',
    '3-4': 'table',
    '6-1': 'hearth',
    '6-6': 'chest',
    '7-3': 'statue',
  });
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>('throne');
  const [isRemoveMode, setIsRemoveMode] = useState<boolean>(false);

  const calculatePrestige = () => {
    let sum = 0;
    Object.values(placedFurniture).forEach(itemId => {
      const item = FURNITURE_CATALOG.find(f => f.id === itemId);
      if (item) sum += item.prestige;
    });
    return sum;
  };

  const currentPrestige = calculatePrestige();

  const handleGridCellClick = (row: number, col: number) => {
    const coordKey = `${row}-${col}`;
    const existingItemId = placedFurniture[coordKey];

    if (isRemoveMode) {
      if (!existingItemId) return;
      const existingItem = FURNITURE_CATALOG.find(i => i.id === existingItemId);
      const updatedPlaced = { ...placedFurniture };
      delete updatedPlaced[coordKey];
      setPlacedFurniture(updatedPlaced);
      
      if (existingItem) {
        triggerAlert(`Вы убрали "${existingItem.name}" из зала гильдии. Стоимость (${existingItem.cost} зол.) полностью возвращена в казну!`, 'info');
      }
      return;
    }

    if (!selectedCatalogId) {
      triggerAlert('Выберите предмет в меню декораций справа или включите режим удаления.', 'info');
      return;
    }

    const selectedItem = FURNITURE_CATALOG.find(i => i.id === selectedCatalogId);
    if (!selectedItem) return;

    if (character.gold < selectedItem.cost) {
      triggerAlert(`Недостаточно личного золота для покупки "${selectedItem.name}"! Нужно ${selectedItem.cost} золота.`, 'error');
      return;
    }

    // Place item on grid, replacing what's there if anything
    const updatedPlaced = { ...placedFurniture, [coordKey]: selectedCatalogId };
    setPlacedFurniture(updatedPlaced);
    triggerAlert(`Вы успешно разместили "${selectedItem.name}" на плитке [${row + 1}:${col + 1}] за ${selectedItem.cost} золотых монет!`, 'success');
  };

  const handleLoadPreset = (presetName: 'default' | 'training' | 'empty') => {
    if (presetName === 'default') {
      setPlacedFurniture({
        '0-3': 'throne',
        '1-2': 'banner',
        '1-4': 'banner',
        '3-3': 'table',
        '3-4': 'table',
        '6-1': 'hearth',
        '6-6': 'chest',
        '7-3': 'statue',
      });
      triggerAlert('Восстановлена стандартная планировка Зала Магистра!', 'info');
    } else if (presetName === 'training') {
      setPlacedFurniture({
        '0-3': 'throne',
        '1-1': 'dummy',
        '1-6': 'dummy',
        '3-1': 'dummy',
        '3-6': 'dummy',
        '5-3': 'table',
        '5-4': 'table',
        '6-3': 'bookcase',
        '7-2': 'banner',
        '7-5': 'banner',
      });
      triggerAlert('Развернут Тренировочный лагерь гильдии с чучелами!', 'success');
    } else {
      setPlacedFurniture({});
      triggerAlert('Зал гильдии полностью очищен для грандиозной перестройки!', 'warning');
    }
  };

  const handleUpgradeHolding = (id: string, name: string) => {
    if (character.gold < 100) {
      triggerAlert('Недостаточно личного золота для инвестиций в гильдию. Нужно 100.', 'error');
      return;
    }
    
    setHoldings(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, level: h.level + 1, income: h.income + 15 };
      }
      return h;
    }));
    triggerAlert(`Вы инвестировали 100 золота в Развитие Владения "${name}". Уровень повышен!`, 'success');
  };

  const handleAddLegend = () => {
    if (character.gold < 50) {
      triggerAlert('Летописец требует 50 золота за запись новых свершений.', 'error');
      return;
    }
    const newLegend = {
      id: Date.now().toString(),
      date: 'Сегодня',
      title: `${character.name} пишет историю`,
      description: `Герой ${character.name} добавил новую славную страницу в анналы гильдии ${guild.name}. Мы живы и полны сил!`
    };
    setLegends([newLegend, ...legends]);
    triggerAlert('Новая запись добавлена в Летопись Гильдии!', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 w-fit mb-6 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('lands')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
            activeTab === 'lands' ? 'bg-amber-600/90 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Владения
        </button>
        <button
          onClick={() => setActiveTab('hall')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
            activeTab === 'hall' ? 'bg-emerald-600/90 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Castle className="w-3.5 h-3.5" /> Чертоги
        </button>
        <button
          onClick={() => setActiveTab('legends')}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all whitespace-nowrap ${
            activeTab === 'legends' ? 'bg-indigo-600/90 text-slate-100 shadow' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookText className="w-3.5 h-3.5" /> Летопись
        </button>
      </div>

      {activeTab === 'lands' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-amber-950/20 border border-amber-900/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px]" />
            <h3 className="text-xl font-black text-amber-500 mb-2 relative z-10 flex items-center gap-2">
              <Castle className="w-5 h-5" /> Гильдейские Земли
            </h3>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl relative z-10">
              Гильдия может контролировать и развивать поселения, рудники и крепости в мире Норрата, 
              получая стабильный доход и уникальные ресурсы. Ветеранские гильдии оставляют свой след в экономике мира.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holdings.map(holding => (
              <div key={holding.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-5 shadow-sm space-y-4 relative group">
                 <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-lg">{holding.name}</h4>
                      <p className="text-[10px] uppercase font-mono text-slate-400 mt-1">{holding.type === 'village' ? 'Поселение' : 'Ресурсный узел'}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-950 border border-amber-900/40 rounded flex items-center justify-center font-black text-amber-500 shadow-inner">
                      Lvl {holding.level}
                    </div>
                 </div>
                 
                 <div className="bg-slate-950 rounded p-3 text-xs font-mono text-slate-400 flex justify-between items-center border border-slate-800">
                    <span>Доход в день:</span>
                    <span className="text-yellow-500 font-bold">+{holding.income} 💰</span>
                 </div>

                 <button
                    onClick={() => handleUpgradeHolding(holding.id, holding.name)}
                    className="w-full py-2 bg-amber-950/40 hover:bg-amber-900 border border-amber-700/50 rounded text-amber-400 text-[10px] uppercase font-bold tracking-wider transition-colors"
                 >
                    Развить (100 золота)
                 </button>
              </div>
            ))}
            
            <div className="bg-slate-900/40 border border-dashed border-slate-700/50 rounded-xl p-5 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-opacity">
               <Hexagon className="w-8 h-8 text-slate-600 mb-3" />
               <p className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-widest">
                 Захватите больше территорий в PvP осадах
               </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hall' && (
        <div className="space-y-6">
          {/* Header Dashboard Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-emerald-950/20 border border-emerald-950/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 relative z-10">
              <div>
                <h3 className="text-xl font-black text-emerald-400 flex items-center gap-2">
                  <Castle className="w-5 h-5" /> Обитель Ордена: {guild.name}
                </h3>
                <p className="text-slate-300 text-xs mt-1 max-w-xl">
                  Создайте уникальный облик вашего штаба! Выбирайте декор из лавки справа и устанавливайте
                  его на плиты зала. Каждая вещь повышает общую репутацию и престиж ордена.
                </p>
              </div>

              {/* Prestige Scoreboard */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 py-2 flex items-center gap-3 min-w-[180px]">
                <div className="w-10 h-10 bg-emerald-950/50 border border-emerald-500/30 rounded flex items-center justify-center text-xl text-emerald-400 shadow-inner">
                  ✨
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Престиж Зала</span>
                  <span className="text-lg font-black text-emerald-400 font-mono tracking-wide">{currentPrestige} XP</span>
                  <span className="text-[9px] text-slate-500 block">Уют: {currentPrestige > 180 ? '💎 Роскошный' : currentPrestige > 80 ? '🪵 Обустроенный' : '⛺ Пустой'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Buttons Board */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60 justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wide">Шаблоны:</span>
              <button
                onClick={() => handleLoadPreset('default')}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[9px] font-mono font-bold uppercase tracking-wider rounded transition-colors"
              >
                Обитель Магистра
              </button>
              <button
                onClick={() => handleLoadPreset('training')}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[9px] font-mono font-bold uppercase tracking-wider rounded transition-colors"
              >
                Полигон Бойцов
              </button>
              <button
                onClick={() => handleLoadPreset('empty')}
                className="px-2.5 py-1 bg-red-950/25 hover:bg-red-950/50 border border-red-900/40 text-red-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded transition-colors"
              >
                Очистить Всё
              </button>
            </div>

            <div className="text-[9.5px] font-mono text-amber-500 font-bold bg-amber-950/30 px-3 py-1 border border-amber-900/40 rounded flex items-center gap-1 shrink-0">
              💰 Личное золото: {character.gold}
            </div>
          </div>

          {/* Interactive Workspace Grid & Catalog */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* GRID VISUALIZER - size 7/12 */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative shadow-xl min-h-[460px]">
              {/* Floor Layout Boundary with beautiful tile perspective & labels */}
              <div className="w-full flex justify-between text-[9px] font-mono text-slate-500 mb-2 border-b border-slate-900 pb-1.5 px-1 uppercase tracking-wide">
                <span>[ Северная стена — Тронная зона ]</span>
                <span>Высота: 6м</span>
              </div>

              {/* TACTICAL GRID MAP */}
              <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-900/25 border border-slate-800/60 rounded-xl relative shadow-inner w-full max-w-[420px] aspect-square">
                {Array.from({ length: 8 }).map((_, r) => (
                  <React.Fragment key={r}>
                    {Array.from({ length: 8 }).map((_, c) => {
                      const coordKey = `${r}-${c}`;
                      const placedItemId = placedFurniture[coordKey];
                      const item = placedItemId ? FURNITURE_CATALOG.find(i => i.id === placedItemId) : null;
                      
                      return (
                        <button
                          key={coordKey}
                          onClick={() => handleGridCellClick(r, c)}
                          className={`aspect-square relative flex items-center justify-center transition-all duration-150 border rounded-lg overflow-hidden group/tile cursor-pointer ${
                            item 
                              ? 'bg-slate-950 border-slate-700/80 hover:scale-[1.04] shadow-md z-10' 
                              : 'bg-slate-900/40 border-slate-900/50 hover:bg-slate-800/50'
                          } ${
                            isRemoveMode 
                              ? 'hover:border-red-500 hover:bg-red-950/30' 
                              : selectedCatalogId 
                                ? 'hover:border-emerald-500 hover:bg-emerald-950/30' 
                                : 'hover:border-slate-500'
                          }`}
                        >
                          {/* Coordinates visual */}
                          <span className="absolute bottom-[2px] right-1 text-[7px] text-slate-600 font-mono opacity-0 group-hover/tile:opacity-100 transition-opacity pointer-events-none select-none">
                            {r + 1}:{c + 1}
                          </span>

                          <div className="flex flex-col items-center justify-center select-none">
                            {item ? (
                              <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transform active:scale-95 transition-transform">
                                {item.icon}
                              </span>
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover/tile:bg-emerald-500/40 transition-colors" />
                            )}
                          </div>

                          {/* Float visual representation wrapper for high tier prestige */}
                          {item && item.prestige >= 40 && (
                            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping pointer-events-none" />
                          )}

                          {/* Cell Hover Tooltip */}
                          {item && (
                            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-950 border border-slate-800 p-2.5 rounded shadow-2xl opacity-0 group-hover/tile:opacity-100 transition-opacity z-50 whitespace-nowrap text-left">
                              <span className="font-bold text-slate-100 text-[11px] block">{item.name} {item.icon}</span>
                              <p className="text-slate-450 text-[9px] max-w-[150px] leading-tight mt-0.5">{item.description}</p>
                              <div className="flex justify-between items-center border-t border-slate-900 mt-2 pt-1 text-[8.5px] font-mono">
                                <span className="text-emerald-400">Престиж: +{item.prestige}</span>
                                <span className="text-amber-500">{item.cost} золото</span>
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              <div className="w-full flex justify-between text-[9px] font-mono text-slate-500 mt-2 border-t border-slate-900 pt-1.5 px-1 uppercase tracking-wide">
                <span>[ Южная стена — Входной портал ]</span>
                <span>Пол: Ониксовый сланец</span>
              </div>
            </div>

            {/* DECORATION CATALOG SHOP - size 5/12 */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* Interaction Modes Panel */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3">
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold block">Режим взаимодействия:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsRemoveMode(false);
                      if (!selectedCatalogId && FURNITURE_CATALOG.length > 0) {
                        setSelectedCatalogId(FURNITURE_CATALOG[0].id);
                      }
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-[10px] font-bold uppercase font-mono border transition-all ${
                      !isRemoveMode
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.2)] font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Черчение
                  </button>

                  <button
                    onClick={() => {
                      setIsRemoveMode(true);
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded text-[10px] font-bold uppercase font-mono border transition-all ${
                      isRemoveMode
                        ? 'bg-red-950/60 border-red-500 text-red-200 shadow-[0_0_8px_rgba(239,68,68,0.2)] font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-red-300'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Ластик
                  </button>
                </div>

                {!isRemoveMode ? (
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] text-slate-300 leading-relaxed">
                    ✨ <strong className="text-emerald-400">Режим Черчения:</strong> Выберите декор из лавки ниже, затем кликайте по плитам зала слева для размещения. Дозволено в рамках личного золота.
                  </div>
                ) : (
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 text-[10px] text-red-300 leading-relaxed">
                    ❌ <strong className="text-red-400">Режим Ластика:</strong> Инженеры мгновенно разберут любой декор при клике по нему в зале. Стоимость <span className="font-bold underline text-white">100% возвращается</span>!
                  </div>
                )}
              </div>

              {/* Decor Store list */}
              <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex-1 flex flex-col space-y-3.5 max-h-[360px] overflow-y-auto">
                <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold block">Каталог Декораций:</span>
                
                <div className="space-y-2">
                  {FURNITURE_CATALOG.map(item => {
                    const isSelected = selectedCatalogId === item.id && !isRemoveMode;
                    const canAfford = character.gold >= item.cost;

                    return (
                      <button
                        key={item.id}
                        disabled={isRemoveMode}
                        onClick={() => {
                          setSelectedCatalogId(item.id);
                          setIsRemoveMode(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                          isRemoveMode ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'bg-slate-900 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                            : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-950 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl filter drop-shadow-[1px_1px_0_#000] min-w-[32px] text-center">{item.icon}</span>
                          <div>
                            <span className="font-bold text-[11px] text-slate-100 flex items-center gap-1.5">
                              {item.name}
                              <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-1 py-0.2 rounded font-mono">
                                +{item.prestige} ✨
                              </span>
                            </span>
                            <span className="text-[9px] text-slate-400 leading-tight block mt-0.5 line-clamp-1">{item.description}</span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-mono font-bold block ${canAfford ? 'text-yellow-500' : 'text-red-500'}`}>
                            {item.cost} 💰
                          </span>
                          <span className="text-[8px] text-slate-500 block uppercase font-mono">Выбрать</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'legends' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-6 shadow-xl relative overflow-hidden">
             
             <div className="flex justify-between items-end border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-indigo-400 flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Анналы Свершений
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">Долгосрочная история вашей гильдии, записанная на века.</p>
                </div>
                <button
                  onClick={handleAddLegend}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider font-mono transition-colors"
                >
                  Записать подвиг (50 зол)
                </button>
             </div>

             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                {legends.map((leg, index) => (
                  <div key={leg.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     
                     {/* Timeline Dot */}
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-indigo-950 text-indigo-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                        <Star className="w-4 h-4" />
                     </div>
                     
                     {/* Content Card */}
                     <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-950/80 shadow-md">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="font-bold text-slate-100 text-sm">{leg.title}</h4>
                           <span className="text-[9px] uppercase font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 relative rounded border border-indigo-900/50">{leg.date}</span>
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                           {leg.description}
                        </p>
                     </div>

                  </div>
                ))}
             </div>

          </div>
        </div>
      )}
    </div>
  );
}
