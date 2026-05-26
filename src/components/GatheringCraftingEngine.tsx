import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Hammer, Loader2, RefreshCw, ShoppingCart, TrendingUp, AlertTriangle, Play, Sparkles } from 'lucide-react';

interface GatheringCraftingProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface CraftRecipe {
  name: string;
  profession: 'cooking' | 'alchemy';
  reqLevel: number;
  ingredients: { key: 'ores' | 'herbs'; amount: number }[];
  result: {
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic';
    slot: 'none' | 'head' | 'chest' | 'primary' | 'secondary';
    stats: Record<string, number>;
  };
}

const RECIPES: CraftRecipe[] = [
  {
    name: 'Эликсир Звездной Силы',
    profession: 'alchemy',
    reqLevel: 1,
    ingredients: [{ key: 'herbs', amount: 3 }],
    result: {
      name: 'Эликсир Звездной Силы',
      description: 'Тяжелое светящееся зелье. Увеличивает ИНТЕЛЛЕКТ на +6 единиц.',
      rarity: 'common',
      slot: 'none',
      stats: { int: 6 }
    }
  },
  {
    name: 'Горная Настойка Выносливости',
    profession: 'alchemy',
    reqLevel: 2,
    ingredients: [{ key: 'ores', amount: 2 }, { key: 'herbs', amount: 4 }],
    result: {
      name: 'Горная Настойка Выносливости',
      description: 'Густой лечебный состав. Повышает ВЫНОСЛИВОСТЬ на +10 единиц.',
      rarity: 'rare',
      slot: 'none',
      stats: { sta: 10 }
    }
  },
  {
    name: 'Черничный Охотничий Пирог',
    profession: 'cooking',
    reqLevel: 1,
    ingredients: [{ key: 'herbs', amount: 2 }],
    result: {
      name: 'Черничный Охотничий Пирог',
      description: 'Свежеиспеченный пирог для следопыта. Повышает ЛОВКОСТЬ на +5 единиц.',
      rarity: 'common',
      slot: 'none',
      stats: { agi: 5 }
    }
  },
  {
    name: 'Запеченный Дворфийский Стейк',
    profession: 'cooking',
    reqLevel: 2,
    ingredients: [{ key: 'ores', amount: 1 }, { key: 'herbs', amount: 5 }],
    result: {
      name: 'Запеченный Дворфийский Стейк',
      description: 'Очень сытное мясное блюдо на углях. Увеличивает СИЛУ на +8 единиц.',
      rarity: 'rare',
      slot: 'none',
      stats: { str: 8 }
    }
  }
];

// Simulated active auction house listings put up by players or bots
interface AuctionItem {
  id: string;
  itemName: string;
  seller: string;
  buyoutPrice: number;
  category: 'Ресурсы' | 'Снаряжение' | 'Зелья';
  isPlayerListing?: boolean;
}

const INITIAL_AUCTION: AuctionItem[] = [
  { id: 'auc-1', itemName: 'Мифриловая Руда (х5)', seller: 'Thorgar_Forge', buyoutPrice: 12, category: 'Ресурсы' },
  { id: 'auc-2', itemName: 'Цветок Черной Вдовы (х10)', seller: 'Shaman_Onyx', buyoutPrice: 18, category: 'Ресурсы' },
  { id: 'auc-3', itemName: 'Клинок Стальной Осы', seller: 'Rogue_Brella', buyoutPrice: 45, category: 'Снаряжение' },
  { id: 'auc-4', itemName: 'Эликсир Очищения Разума', seller: 'AlKabor', buyoutPrice: 25, category: 'Зелья' }
];

export default function GatheringCraftingEngine({ character, onUpdateCharacter, triggerAlert }: GatheringCraftingProps) {
  // Safe default values
  const craft = character.craftingStats || {
    miningLvl: 1,
    miningXp: 0,
    herbalismLvl: 1,
    herbalismXp: 0,
    cookingLvl: 1,
    cookingXp: 0,
    alchemyLvl: 1,
    alchemyXp: 0,
    ores: 3,
    herbs: 3
  };

  const [activeTab, setActiveTab] = useState<'gathering' | 'crafting' | 'auction'>('gathering');
  const [gatheringTimer, setGatheringTimer] = useState<number | null>(null);
  const [gatheringType, setGatheringType] = useState<'ore' | 'herb' | null>(null);

  // Auction House states
  const [auctionListings, setAuctionListings] = useState<AuctionItem[]>(() => {
    const saved = localStorage.getItem('eq3_auction_listings');
    return saved ? JSON.parse(saved) : INITIAL_AUCTION;
  });
  const [auctionLogs, setAuctionLogs] = useState<string[]>([
    '[АУКЦИОН] Рынок открыт в торговом туннеле.',
    '[АУКЦИОН] Игрок Thorgar_Forge выставил на торги [Мифриловая Руда (х5)] за 12 золота.'
  ]);

  // Crafting process tracking
  const [isCrafting, setIsCrafting] = useState(false);

  useEffect(() => {
    localStorage.setItem('eq3_auction_listings', JSON.stringify(auctionListings));
  }, [auctionListings]);

  // Handle ticking gathering process
  useEffect(() => {
    if (gatheringTimer === null) return;
    if (gatheringTimer <= 0) {
      completeGathering();
      return;
    }

    const interval = setTimeout(() => {
      setGatheringTimer(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(interval);
  }, [gatheringTimer]);

  const startGathering = (type: 'ore' | 'herb') => {
    if (gatheringTimer !== null) return;
    setGatheringType(type);
    setGatheringTimer(3); // 3 seconds gathering process
    triggerAlert(`Вы начали ${type === 'ore' ? 'добычу рудных жил' : 'сбор лекарственных трав'}...`, 'info');
  };

  const completeGathering = () => {
    setGatheringTimer(null);
    const craftStats = character.craftingStats || {
      miningLvl: 1, miningXp: 0, herbalismLvl: 1, herbalismXp: 0,
      cookingLvl: 1, cookingXp: 0, alchemyLvl: 1, alchemyXp: 0,
      ores: 3, herbs: 3
    };

    if (gatheringType === 'ore') {
      const yieldAmt = 1 + Math.floor(Math.random() * 3);
      const xpEarned = 15;
      let newXp = craftStats.miningXp + xpEarned;
      let newLvl = craftStats.miningLvl;
      if (newXp >= newLvl * 100) {
        newLvl += 1;
        newXp = 0;
        triggerAlert(`⭐ Ваше мастерство Горного Дела повышено до ${newLvl}!`, 'success');
      }

      const updatedCraft = {
        ...craftStats,
        ores: craftStats.ores + yieldAmt,
        miningLvl: newLvl,
        miningXp: newXp
      };

      const updatedChar = { ...character, craftingStats: updatedCraft };
      onUpdateCharacter(updatedChar);
      triggerAlert(`Руда добыта! Найдено руды: +${yieldAmt} (Опыт Горного дела +${xpEarned})`, 'success');
    } else {
      const yieldAmt = 1 + Math.floor(Math.random() * 3);
      const xpEarned = 15;
      let newXp = craftStats.herbalismXp + xpEarned;
      let newLvl = craftStats.herbalismLvl;
      if (newXp >= newLvl * 100) {
        newLvl += 1;
        newXp = 0;
        triggerAlert(`⭐ Ваше мастерство Травничества повышено до ${newLvl}!`, 'success');
      }

      const updatedCraft = {
        ...craftStats,
        herbs: craftStats.herbs + yieldAmt,
        herbalismLvl: newLvl,
        herbalismXp: newXp
      };

      const updatedChar = { ...character, craftingStats: updatedCraft };
      onUpdateCharacter(updatedChar);
      triggerAlert(`Травы собраны! Собрано трав: +${yieldAmt} (Опыт Травничества +${xpEarned})`, 'success');
    }
    setGatheringType(null);
  };

  const handleCraft = (recipe: CraftRecipe) => {
    const craftStats = character.craftingStats || {
      miningLvl: 1, miningXp: 0, herbalismLvl: 1, herbalismXp: 0,
      cookingLvl: 1, cookingXp: 0, alchemyLvl: 1, alchemyXp: 0,
      ores: 0, herbs: 0
    };

    // Check level req
    const currentProfLvl = recipe.profession === 'alchemy' ? craftStats.alchemyLvl : craftStats.cookingLvl;
    if (currentProfLvl < recipe.reqLevel) {
      triggerAlert(`Ваш уровень ремесла маловат! Требуется уровень ${recipe.reqLevel}.`, 'error');
      return;
    }

    // Check ingredients
    for (const req of recipe.ingredients) {
      if ((craftStats[req.key] || 0) < req.amount) {
        triggerAlert(`Недостаточно ресурсов! Требуется: ${req.amount} ед. сырья.`, 'error');
        return;
      }
    }

    // Spend ingredients
    setIsCrafting(true);
    setTimeout(() => {
      setIsCrafting(false);

      const updatedIngredients = { ...craftStats };
      for (const req of recipe.ingredients) {
        updatedIngredients[req.key] = (updatedIngredients[req.key] || 0) - req.amount;
      }

      // Add craft xp
      const xpEarned = 25;
      let newXp = (recipe.profession === 'alchemy' ? craftStats.alchemyXp : craftStats.cookingXp) + xpEarned;
      let newLvl = recipe.profession === 'alchemy' ? craftStats.alchemyLvl : craftStats.cookingLvl;

      if (newXp >= newLvl * 100) {
        newLvl += 1;
        newXp = 0;
        triggerAlert(`⭐ Навык ${recipe.profession === 'alchemy' ? 'Алхимии' : 'Кулинарии'} повышен до ${newLvl}!`, 'success');
      }

      if (recipe.profession === 'alchemy') {
        updatedIngredients.alchemyLvl = newLvl;
        updatedIngredients.alchemyXp = newXp;
      } else {
        updatedIngredients.cookingLvl = newLvl;
        updatedIngredients.cookingXp = newXp;
      }

      // Synthesize item
      const newItem: Item = {
        id: `crafted-${Date.now()}`,
        name: recipe.result.name,
        slot: recipe.result.slot,
        description: recipe.result.description,
        price: 8 + Math.floor(Math.random() * 10),
        rarity: recipe.result.rarity,
        stats: recipe.result.stats
      };

      const updatedChar: PlayerCharacter = {
        ...character,
        craftingStats: updatedIngredients,
        inventory: [...character.inventory, newItem]
      };

      onUpdateCharacter(updatedChar);
      triggerAlert(`Вы успешно изготовили предмет: [${newItem.name}]!`, 'success');
    }, 1500);
  };

  const buyFromAuction = (listing: AuctionItem) => {
    if (character.gold < listing.buyoutPrice) {
      triggerAlert('У вас недостаточно золота для выкупа товара с аукциона!', 'error');
      return;
    }

    // Create item
    const boughtItem: Item = {
      id: `auction-buy-${Date.now()}`,
      name: listing.itemName,
      slot: 'none',
      description: 'Куплено на аукционе у местного торговца.',
      price: listing.buyoutPrice,
      rarity: 'rare',
      stats: {}
    };

    const updatedChar: PlayerCharacter = {
      ...character,
      gold: character.gold - listing.buyoutPrice,
      inventory: [...character.inventory, boughtItem]
    };

    onUpdateCharacter(updatedChar);
    setAuctionListings(prev => prev.filter(a => a.id !== listing.id));
    setAuctionLogs(prev => [
      ...prev,
      `[АУКЦИОН] Вы выкупили [${listing.itemName}] у ${listing.seller} за ${listing.buyoutPrice} золотых.`
    ]);
    triggerAlert(`Товар [${listing.itemName}] доставлен в сумку!`, 'success');
  };

  const sellOnAuction = (item: Item, goldPrice: number) => {
    if (goldPrice <= 0 || isNaN(goldPrice)) {
      triggerAlert('Пожалуйста, укажите цену!', 'error');
      return;
    }

    // Remove from inventory
    const updatedInventory = character.inventory.filter(i => i.id !== item.id);
    const newListing: AuctionItem = {
      id: `auc-player-${Date.now()}`,
      itemName: item.name,
      seller: character.name,
      buyoutPrice: goldPrice,
      category: item.slot === 'none' ? 'Зелья' : 'Снаряжение',
      isPlayerListing: true
    };

    setAuctionListings(prev => [newListing, ...prev]);

    const updatedChar: PlayerCharacter = {
      ...character,
      inventory: updatedInventory
    };

    onUpdateCharacter(updatedChar);
    triggerAlert(`Предмет [${item.name}] размещен на аукционе за ${goldPrice} золотых!`, 'info');

    // Bot purchase simulation after 8 seconds
    setTimeout(() => {
      setAuctionListings(prev => {
        const stillExists = prev.some(l => l.id === newListing.id);
        if (stillExists) {
          // Send mail reward structure
          setAuctionLogs(oldLogs => [
            ...oldLogs,
            `💸 [СПРОС] Покупатель Вальдор купил ваш товар [${item.name}] за ${goldPrice}g!`
          ]);
          
          // Actually credit player gold in local storage directly
          const rawChar = localStorage.getItem('eq3_character');
          if (rawChar) {
            const parsed = JSON.parse(rawChar);
            parsed.gold = (parsed.gold || 0) + goldPrice;
            localStorage.setItem('eq3_character', JSON.stringify(parsed));
          }
          return prev.filter(l => l.id !== newListing.id);
        }
        return prev;
      });
    }, 8000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-6">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
            <Hammer className="h-5 w-5 text-amber-500 animate-spin-slow" />
            Экономика, Сбор & Крафтинг Вещей
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Добывайте полезную руду и травы, повышайте уровень профессий и продавайте редкие эликсиры на живом Симулируемом Аукционе.
          </p>
        </div>

        {/* Resources Panel */}
        <div className="bg-slate-950 p-2 rounded border border-slate-850 flex gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500 text-sm">🪨</span>
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">Добыто Руды:</span>
              <span className="text-slate-200 font-bold">{craft.ores} ед.</span>
            </div>
          </div>
          <div className="border-r border-slate-850" />
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 text-sm">🌿</span>
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">Собрано Трав:</span>
              <span className="text-slate-200 font-bold">{craft.herbs} ед.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtab Selectors */}
      <div className="flex border-b border-slate-800 p-0.5 max-w-md select-none bg-slate-950 rounded-lg">
        {['gathering', 'crafting', 'auction'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`flex-1 py-1.5 text-xs font-mono font-bold uppercase transition-all rounded cursor-pointer ${
              activeTab === t ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'gathering' ? '⛏️ Добыча' : t === 'crafting' ? '⚒️ Рецепты' : '⚖️ Аукцион'}
          </button>
        ))}
      </div>

      {/* TAB 1: Gathering/Mining Herb extraction */}
      {activeTab === 'gathering' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Mining Node node */}
          <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-amber-500 font-mono text-[10px] uppercase font-bold">Горное дело (Ур. {craft.miningLvl})</span>
                <span className="text-[10px] font-mono text-slate-400">Опыт: {craft.miningXp} / {craft.miningLvl * 100} XP</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-slate-200 flex items-center gap-1.5">
                🪨 Богатые Кварцевые Жилы Кейноса
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Залежи серой кварцевой породы с мифриловыми вкраплениями. Позволяет добывать руду средней крепости.
              </p>

              {gatheringTimer !== null && gatheringType === 'ore' && (
                <div className="mt-4 bg-slate-900 border border-amber-950 p-3 rounded">
                  <span className="text-[10px] font-mono block text-amber-500 animate-pulse text-center">ИДЕТ ДОБЫЧА РУДЫ... ОСТАЛОСЬ: {gatheringTimer} сек...</span>
                  <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden mt-1.5">
                    <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(gatheringTimer / 3) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => startGathering('ore')}
              disabled={gatheringTimer !== null}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-black uppercase py-2.5 rounded cursor-pointer disabled:opacity-40"
            >
              Колотить жилу киркой
            </button>
          </div>

          {/* Herbalism Node node */}
          <div className="bg-slate-950/80 p-5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-emerald-400 font-mono text-[10px] uppercase font-bold">Травничество (Ур. {craft.herbalismLvl})</span>
                <span className="text-[10px] font-mono text-slate-400">Опыт: {craft.herbalismXp} / {craft.herbalismLvl * 100} XP</span>
              </div>
              <h4 className="font-serif text-sm font-bold text-slate-200 flex items-center gap-1.5">
                🌿 Кусты Дикого Женьшеня и Ромашки
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Благоухающие травы, растущие на влажной земле Кейноса. Идеально подходят для варки первых алхимических смесей.
              </p>

              {gatheringTimer !== null && gatheringType === 'herb' && (
                <div className="mt-4 bg-slate-900 border border-emerald-950 p-3 rounded">
                  <span className="text-[10px] font-mono block text-emerald-400 animate-pulse text-center">СБОР ЛЕКАРСТВЕННЫХ ТРАВ... ОСТАЛОСЬ: {gatheringTimer} сек...</span>
                  <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden mt-1.5">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(gatheringTimer / 3) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => startGathering('herb')}
              disabled={gatheringTimer !== null}
              className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-black uppercase py-2.5 rounded cursor-pointer disabled:opacity-40"
            >
              Аккуратно срезать стебли
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Recipes Synth section */}
      {activeTab === 'crafting' && (
        <div className="space-y-4 animate-fade-in">
          {isCrafting && (
            <div className="bg-slate-950 border border-amber-900 rounded-lg p-5 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
              <span className="text-xs font-mono text-slate-300">ПЛАВКА И СИНТЕЗ ОЧКОВ РЕМЕСЛА В КОТЛЕ...</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RECIPES.map(recipe => {
              const currentLvl = recipe.profession === 'alchemy' ? craft.alchemyLvl : craft.cookingLvl;
              const hasReq = currentLvl >= recipe.reqLevel;

              return (
                <div key={recipe.name} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">{recipe.profession === 'alchemy' ? '🔮 Алхимия' : '🍳 Кулинария'}</span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                        hasReq ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                      }`}>
                        Требуемый ур: {recipe.reqLevel}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold font-serif text-slate-200">{recipe.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-tight block mt-1">{recipe.result.description}</p>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-500 mt-2.5">
                      <span>Ингредиенты:</span>
                      {recipe.ingredients.map(ing => (
                        <span key={ing.key} className={craft[ing.key] >= ing.amount ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                          {ing.key === 'ores' ? '🪨 Руда' : '🌿 Трава'} ({craft[ing.key] || 0}/{ing.amount})
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCraft(recipe)}
                    disabled={isCrafting || !hasReq}
                    className="mt-4 w-full bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 font-mono text-[11px] text-amber-500 font-extrabold uppercase py-2 rounded cursor-pointer disabled:opacity-35"
                  >
                    Изготовить в лаборатории
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Simulated Live Auction House */}
      {activeTab === 'auction' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live listings block */}
            <div className="lg:col-span-2 space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-850">
              <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">Активные торги в Туннеле:</span>

              <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                {auctionListings.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 text-xs font-mono">
                    Торги временно пусты. Выставьте вещи на продажу!
                  </div>
                ) : (
                  auctionListings.map(listing => (
                    <div key={listing.id} className="bg-slate-900 border border-slate-800 p-3 rounded flex justify-between items-center gap-4">
                      <div>
                        <span className="text-[9px] bg-slate-950 text-indigo-400 px-1.5 py-0.2 rounded font-mono uppercase font-bold tracking-tight">{listing.category}</span>
                        <h5 className="font-serif text-sm font-bold text-slate-100 mt-1">{listing.itemName}</h5>
                        <p className="text-[10px] font-mono text-slate-500">Продавец: {listing.seller}</p>
                      </div>

                      {listing.isPlayerListing ? (
                        <span className="text-[10px] font-mono bg-blue-950 font-bold border border-blue-900 text-blue-400 px-3 py-1 rounded shrink-0">ВЫ КЛАДЕТЕ</span>
                      ) : (
                        <button
                          onClick={() => buyFromAuction(listing)}
                          className="bg-slate-850 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-mono font-bold px-3 py-2 rounded shrink-0 cursor-pointer"
                        >
                          Выкупить: {listing.buyoutPrice}g
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel: Sell Item panel & Real-time Logs */}
            <div className="space-y-4">
              {/* Placing items */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
                <h4 className="text-xs text-slate-300 font-mono uppercase font-bold text-amber-500">Разместить лот с вещами:</h4>
                <p className="text-[10px] text-slate-500">
                  Выберите скрафченный эликсир или добытую руду из вашей сумки для мгновенного выставления за золотые.
                </p>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {character.inventory.length === 0 ? (
                    <div className="text-[10px] text-slate-550 font-mono text-center py-4">Ваш мешок пуст</div>
                  ) : (
                    character.inventory.map(item => (
                      <div key={item.id} className="bg-slate-900 border border-slate-850 p-2 rounded flex justify-between items-center gap-2">
                        <div className="truncate">
                          <span className="text-xs font-serif font-bold text-slate-200 block truncate">{item.name}</span>
                          <span className="text-[9px] text-slate-500 block font-mono">Выкупная цена: 15g</span>
                        </div>
                        <button
                          onClick={() => sellOnAuction(item, 15)}
                          className="bg-emerald-900 hover:bg-emerald-800 text-white font-mono text-[9px] font-black py-1 px-2.5 rounded uppercase cursor-pointer"
                        >
                          Выставить
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Auction logs */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase border-b border-slate-850 pb-1 flex items-center justify-between">
                  <span>Журнал Продаж туннеля</span>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                </span>
                <div className="text-[9px] font-mono text-slate-400 space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {auctionLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-slate-900/60 pb-1 font-mono leading-relaxed">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
