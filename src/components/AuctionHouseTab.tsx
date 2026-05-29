import React, { useState, useEffect } from 'react';
import { PlayerCharacter, Item } from '../types';
import { Search, Gavel, Coins, Shield, Swords, Package, FlaskConical, Clock, Filter, X, Hammer } from 'lucide-react';

interface AuctionHouseTabProps {
  character: PlayerCharacter;
  language: 'ru' | 'en';
  onUpdateCharacter: (c: PlayerCharacter) => void;
  triggerAlert: (msg: string, type: 'success' | 'error' | 'info') => void;
}

import { ItemIconWrapper } from './ItemIcon';

interface AuctionListing {
  id: string;
  item: Item;
  seller: string;
  timeLeftMinutes: number;
  currentBid: { g: number, s: number, c: number };
  buyout: { g: number, s: number, c: number };
  hasBid: boolean;
}

const GOBLIN_PHRASES_RU = [
  "Добро пожаловать в самое прибыльное место Этерии!",
  "Ты пришёл за сокровищами... или принёс их мне?",
  "Время — деньги, друг мой! Выбирай быстрее!",
  "Здесь нет хлама, только недооцененные шедевры!",
  "Мои комиссионные — самые честные во всем городе. Почти."
];

const GOBLIN_PHRASES_EN = [
  "Welcome to the most profitable place in Etheria!",
  "Are you here for treasures... or did you bring them to me?",
  "Time is money, my friend! Choose quickly!",
  "There is no junk here, only unappreciated masterpieces!",
  "My commissions are the fairest in the city. Almost."
];

// Helper to format copper into g/s/c
const formatCurrency = (g: number, s: number, c: number) => {
  return (
    <div className="flex items-center gap-1 text-[11px] font-bold font-mono">
       {g > 0 && <span className="text-yellow-400 drop-shadow-[1px_1px_0_#000]">{g}<span className="text-[9px] text-[#ffd700] ml-0.5">●</span></span>}
       {s > 0 && <span className="text-slate-300 drop-shadow-[1px_1px_0_#000]">{s}<span className="text-[9px] text-[#c0c0c0] ml-0.5">●</span></span>}
       <span className="text-amber-700 drop-shadow-[1px_1px_0_#000]">{c}<span className="text-[9px] text-[#cd7f32] ml-0.5">●</span></span>
    </div>
  );
};

export default function AuctionHouseTab({ character, language, onUpdateCharacter, triggerAlert }: AuctionHouseTabProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'weapons' | 'armor' | 'consumables' | 'resources' | 'my_lots' | 'my_bids'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [goblinPhrase, setGoblinPhrase] = useState('');
  const [selectedListing, setSelectedListing] = useState<AuctionListing | null>(null);
  const [isCreatingAuction, setIsCreatingAuction] = useState(false);
  const [auctionItemBasePrice, setAuctionItemBasePrice] = useState(0);

  // Generate some dummy listings
  const [listings, setListings] = useState<AuctionListing[]>([]);

  useEffect(() => {
    // Pick initial goblin phrase
    const phrases = language === 'ru' ? GOBLIN_PHRASES_RU : GOBLIN_PHRASES_EN;
    setGoblinPhrase(phrases[Math.floor(Math.random() * phrases.length)]);

    // Generate dummy lots
    const dummyLots: AuctionListing[] = [
      {
         id: 'l1',
         item: { id: 'l1_item', name: language === 'ru' ? 'Легендарный Клинок Разлома' : 'Legendary Rift Blade', rarity: 'legendary', slot: 'primary', stats: { str: 45, sta: 20 }, description: '...', price: 500 },
         seller: 'Игрок123',
         timeLeftMinutes: 705, // 11h 45m
         currentBid: { g: 245, s: 30, c: 0 },
         buyout: { g: 480, s: 0, c: 0 },
         hasBid: true
      },
      {
         id: 'l2',
         item: { id: 'l2_item', name: language === 'ru' ? 'Слиток Истинного Железа' : 'True Iron Ingot', rarity: 'uncommon', slot: 'material', description: '...', price: 10, stats: {} },
         seller: 'КузнецБоб',
         timeLeftMinutes: 45,
         currentBid: { g: 2, s: 50, c: 0 },
         buyout: { g: 3, s: 0, c: 0 },
         hasBid: false
      },
      {
         id: 'l3',
         item: { id: 'l3_item', name: language === 'ru' ? 'Панцирь Драконьей Черепахи' : 'Dragon Turtle Shell', rarity: 'rare', slot: 'chest', stats: { ac: 150, sta: 30 }, description: '...', price: 120 },
         seller: 'TankMaster',
         timeLeftMinutes: 1400,
         currentBid: { g: 15, s: 0, c: 0 },
         buyout: { g: 45, s: 0, c: 0 },
         hasBid: false
      },
      {
         id: 'l4',
         item: { id: 'l4_item', name: language === 'ru' ? 'Зелье Невидимости' : 'Invisibility Potion', rarity: 'common', slot: 'consumable', description: '...', price: 5, stats: {} },
         seller: 'Алхимик22',
         timeLeftMinutes: 120,
         currentBid: { g: 1, s: 20, c: 0 },
         buyout: { g: 1, s: 50, c: 0 },
         hasBid: true
      },
      {
         id: 'l5',
         item: { id: 'l5_item', name: language === 'ru' ? 'Корона Забытого Короля' : 'Crown of the Forgotten King', rarity: 'epic', slot: 'head', stats: { int: 50, mana: 200 }, description: '...', price: 350 },
         seller: 'MagicDude',
         timeLeftMinutes: 2800,
         currentBid: { g: 900, s: 0, c: 0 },
         buyout: { g: 1200, s: 0, c: 0 },
         hasBid: true
      }
    ];
    setListings(dummyLots);
  }, [language]);

  const RarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-slate-300';
      case 'uncommon': return 'text-[#1eff00]';
      case 'rare': return 'text-[#0070dd]';
      case 'epic': return 'text-[#a335ee]';
      case 'legendary': return 'text-[#ff8000]';
      case 'mythic': return 'text-[#e6cc80]';
      default: return 'text-slate-300';
    }
  };

  const RarityHex = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return '#1eff00';
      case 'rare': return '#0070dd';
      case 'epic': return '#a335ee';
      case 'legendary': return '#ff8000';
      case 'mythic': return '#e6cc80';
      default: return '#9d9d9d';
    }
  };

  const formatTimeLimit = (mins: number) => {
    if (mins >= 1440) return language === 'ru' ? '48ч' : '48h'; // roughly
    if (mins >= 720) return language === 'ru' ? '24ч' : '24h';
    if (mins >= 120) return language === 'ru' ? '12ч' : '12h';
    if (mins >= 60) return language === 'ru' ? 'Долго' : 'Long';
    if (mins >= 30) return language === 'ru' ? 'Средне' : 'Medium';
    return language === 'ru' ? 'Коротко' : 'Short';
  };

  const handleBuyout = () => {
    if (!selectedListing) return;
    triggerAlert(language === 'ru' ? `Выкуплен предмет: ${selectedListing.item.name}` : `Bought item: ${selectedListing.item.name}`, 'success');
    setListings(listings.filter(l => l.id !== selectedListing.id));
    setSelectedListing(null);
  };

  // Filter listings based on active tab & search
  const filteredListings = listings.filter(l => {
     if (searchQuery && !l.item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
     
     if (activeTab === 'weapons') return l.item.slot === 'primary' || l.item.slot === 'secondary';
     if (activeTab === 'armor') return ['head', 'chest', 'legs', 'hands', 'feet', 'amulet', 'ring1', 'ring2'].includes(l.item.slot);
     if (activeTab === 'consumables') return l.item.slot === 'consumable';
     if (activeTab === 'resources') return l.item.slot === 'material' || l.item.slot === 'rune';
     
     return true;
  });

  return (
    <div className="w-full h-full p-2 animate-fade-in font-sans select-none pb-[120px]">
       
       {/* Main Heavy Window Frame */}
       <div className="max-w-[1200px] mx-auto bg-[#1a1410] border-[4px] border-[#3a2a1a] shadow-[0_20px_60px_rgba(0,0,0,1)] rounded-lg relative flex flex-col md:flex-row h-[700px] md:h-[650px] overflow-hidden">
          
          {/* Background Texture Leather + Gold Accents */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 pointer-events-none mix-blend-overlay" />
          
          {/* Top Title Bar */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#2a1a0f] to-transparent z-20 flex justify-center items-start pt-1 pointer-events-none">
             {/* Decorative rivets */}
             <div className="absolute left-2 top-2 w-3 h-3 bg-[#4a3a2a] rounded-full border-2 border-[#1a1a1a] shadow-[inset_1px_1px_rgba(255,255,255,0.2)]"></div>
             <div className="absolute right-2 top-2 w-3 h-3 bg-[#4a3a2a] rounded-full border-2 border-[#1a1a1a] shadow-[inset_1px_1px_rgba(255,255,255,0.2)]"></div>
             
             <h2 className="text-[#ffd100] font-bold text-xl uppercase tracking-widest drop-shadow-[2px_2px_0_#000]" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                {language === 'ru' ? 'Аукционный Дом' : 'Auction House'}
             </h2>
          </div>

          {/* GOBLIN NPC AREA (Top Left / Overlay in desktop) */}
          <div className="absolute top-10 right-4 z-40 hidden lg:flex items-start gap-3 pointer-events-none">
             {/* Speech Bubble */}
             <div className="mt-4 bg-[#2a1f18] text-[#e6cc80] border border-[#554a3a] px-3 py-2 rounded-lg text-xs font-serif max-w-[200px] shadow-[0_4px_15px_rgba(0,0,0,0.8)] relative animate-pulse">
                <div className="absolute top-4 -right-2 w-0 h-0 border-t-[8px] border-t-transparent border-l-[8px] border-l-[#554a3a] border-b-[8px] border-b-transparent"></div>
                "{goblinPhrase}"
             </div>
             
             <div className="flex flex-col items-center">
                <span className="text-[#1eff00] font-bold text-xs uppercase bg-black/60 px-2 rounded-t drop-shadow-[1px_1px_0_#000]">Зигги Медноглот</span>
                <div className="w-24 h-24 bg-[url('https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=GoblinMoney&backgroundColor=111&skinColor=8bc34a')] bg-cover border-[3px] border-[#554a3a] rounded-b shadow-[0_0_20px_rgba(0,0,0,1)]"></div>
             </div>
          </div>
          <div className="lg:hidden absolute top-[44px] right-2 z-40 flex items-center gap-2 pointer-events-none">
                <div className="w-10 h-10 bg-[url('https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=GoblinMoney&backgroundColor=111&skinColor=8bc34a')] bg-cover border-[2px] border-[#554a3a] rounded-full shadow-[0_0_10px_rgba(0,0,0,1)]"></div>
          </div>

          {/* ================= 1. LEFT PANEL: NAVIGATION ================= */}
          <div className="w-full md:w-[250px] bg-[#201813] border-b md:border-b-0 md:border-r border-[#3a2a1a] shadow-[inset_-10px_0_20px_rgba(0,0,0,0.5)] z-10 flex flex-col pt-12">
             
             {/* Search Area */}
             <div className="p-3 border-b border-[#3a2a1a]/50">
               <div className="bg-[#e8dcb8] rounded relative p-1 pb-1 shadow-[inset_0_2px_5px_rgba(0,0,0,0.3)]">
                  <input 
                    type="text" 
                    placeholder={language === 'ru' ? "Поиск..." : "Search..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-[#3a2a1a] font-serif font-bold text-sm focus:outline-none focus:ring-0 placeholder-[#887a68] pl-7"
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-[#887a68]" />
               </div>
             </div>

             {/* Categories Tabs */}
             <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden p-2 gap-1.5 custom-scrollbar">
                {[
                  { id: 'all', icon: Package, label: language === 'ru' ? 'Все лоты' : 'All Items' },
                  { id: 'weapons', icon: Swords, label: language === 'ru' ? 'Оружие' : 'Weapons' },
                  { id: 'armor', icon: Shield, label: language === 'ru' ? 'Броня' : 'Armor' },
                  { id: 'consumables', icon: FlaskConical, label: language === 'ru' ? 'Расходники' : 'Consumables' },
                  { id: 'resources', icon: Hammer, label: language === 'ru' ? 'Ресурсы' : 'Resources' },
                  { id: 'my_lots', icon: Coins, label: language === 'ru' ? 'Мои лоты' : 'My Auctions' },
                  { id: 'my_bids', icon: Gavel, label: language === 'ru' ? 'Ставки' : 'Bids' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 md:py-2.5 font-bold uppercase tracking-wider text-[10px] md:text-xs text-left rounded-sm transition-all whitespace-nowrap
                       ${activeTab === tab.id 
                         ? 'bg-gradient-to-r from-[#5a422a] to-[#3a2a1a] text-[#ffd100] border border-[#a88243] shadow-[0_0_10px_rgba(255,209,0,0.2)]'
                         : 'bg-[#150f0c] text-[#a08a70] border border-[#2a1a0f] hover:bg-[#2a1f16] hover:text-[#ffd100]'
                       }
                    `}
                  >
                     <tab.icon size={14} className={activeTab === tab.id ? 'text-[#ffd100]' : 'text-[#a08a70]'} />
                     {tab.label}
                  </button>
                ))}
             </div>
             
             <div className="mt-auto px-4 py-4 md:flex flex-col gap-2 hidden">
                <button 
                  onClick={() => setIsCreatingAuction(true)}
                  className="bg-[#2a1f16] hover:bg-[#3a2a1a] border border-[#554a3a] text-[#ffd100] font-bold uppercase text-[10px] py-3 rounded text-center transition-colors shadow-[0_2px_5px_rgba(0,0,0,0.8)]"
                >
                  {language === 'ru' ? 'Выставить свой лот' : 'Create Auction'}
                </button>
             </div>
          </div>

          {/* ================= 2. CENTRAL PANEL: LOTS TABLE ================= */}
          <div className="flex-1 bg-[#16120e] relative flex flex-col z-20 pt-10 md:pt-12 min-h-[300px]">
             
             {/* Table Headers */}
             <div className="hidden lg:grid grid-cols-12 gap-x-2 px-4 py-2 bg-gradient-to-b from-[#2a1f18] to-[#150f0c] border-b-2 border-[#3a2a1a] text-[10px] font-bold text-[#ffd100] uppercase tracking-widest shadow-[0_4px_10px_rgba(0,0,0,0.5)] z-10 sticky top-0">
                <div className="col-span-1 text-center">Предмет</div>
                <div className="col-span-4">Название</div>
                <div className="col-span-2 text-center">Продавец</div>
                <div className="col-span-1 text-center">Ур.</div>
                <div className="col-span-1 text-center">Время</div>
                <div className="col-span-3 text-right">Текущая Ставка / Выкуп</div>
             </div>

             {/* Listings Scroll Area */}
             <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] p-2 space-y-1">
                {filteredListings.length === 0 ? (
                   <div className="flex h-full items-center justify-center text-[#554a3a] font-serif italic text-lg text-center">
                     {language === 'ru' ? 'Лотов не найдено. Грикс одобряет дефицит!' : 'No lots found. Grix approves of scarcity!'}
                   </div>
                ) : (
                   filteredListings.map(listing => (
                     <div 
                       key={listing.id}
                       onClick={() => setSelectedListing(listing)}
                       className={`flex flex-col lg:grid lg:grid-cols-12 gap-y-2 lg:gap-x-2 px-2 py-2 lg:px-4 lg:py-2 items-start lg:items-center border border-[#2a1a0f] rounded-sm cursor-pointer transition-colors shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]
                          ${selectedListing?.id === listing.id 
                            ? 'bg-gradient-to-r from-[#423120] to-[#201813] border-[#7d603a]'
                            : 'bg-[#150f0c] hover:bg-[#201813]'
                          }
                       `}
                     >
                        {/* Mobile & Desktop Icon + Name */}
                        <div className="col-span-5 flex items-center gap-3 w-full">
                           <div 
                             className="w-10 h-10 border-[2px] rounded-sm bg-black/60 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] relative flex justify-center items-center overflow-hidden shrink-0"
                             style={{ borderColor: RarityHex(listing.item.rarity) }}
                           >
                              <div className="opacity-80">
                                <ItemIconWrapper item={listing.item} size={24} />
                              </div>
                              <div className="absolute bottom-0 right-0.5 text-[9px] font-bold text-white shadow-black drop-shadow-[1px_1px_0_#000] z-10 leading-none pb-0.5">
                                 1
                              </div>
                           </div>
                           <div className="flex flex-col min-w-0">
                               <span className={`font-bold text-xs lg:text-[13px] truncate drop-shadow-[1px_1px_0_#000] ${RarityColor(listing.item.rarity)}`}>
                                 {listing.item.name}
                               </span>
                               {/* Mobile extra details */}
                               <div className="lg:hidden flex items-center gap-2 mt-1 text-[9px] font-mono text-slate-400">
                                  <span>{listing.seller}</span>
                                  <span>|</span>
                                  <Clock size={10} className="inline text-amber-600/70 mr-0.5"/>
                                  <span>{formatTimeLimit(listing.timeLeftMinutes)}</span>
                               </div>
                           </div>
                        </div>

                        {/* Desktop Only Columns */}
                        <div className="hidden lg:block col-span-2 text-[#a08a70] text-[11px] font-bold text-center truncate pr-2">
                           {listing.seller}
                        </div>
                        <div className="hidden lg:block col-span-1 text-center font-bold text-white">
                           40
                        </div>
                        <div className="hidden lg:block col-span-1 text-center text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                           {formatTimeLimit(listing.timeLeftMinutes)}
                        </div>
                        
                        {/* Desktop Bid / Buyout */}
                        <div className="hidden lg:flex col-span-3 flex-col items-end gap-1">
                           <div className="flex items-center justify-end w-full gap-2">
                              {/* Bid */}
                              <div className="px-2 py-0.5 bg-black/40 border border-[#2a1a0f] rounded">
                                 {formatCurrency(listing.currentBid.g, listing.currentBid.s, listing.currentBid.c)}
                              </div>
                           </div>
                           <div className="flex items-center justify-end w-full gap-2">
                              {/* Buyout */}
                              <div className="px-2 py-0.5 bg-black/40 border border-[#2a1a0f] rounded opacity-75">
                                 {formatCurrency(listing.buyout.g, listing.buyout.s, listing.buyout.c)}
                              </div>
                           </div>
                        </div>

                        {/* Mobile Bid / Buyout */}
                        <div className="lg:hidden w-full flex items-center justify-between mt-1 pt-2 border-t border-[#2a1a0f]">
                            <div className="flex flex-col gap-0.5">
                               <span className="text-[9px] text-[#554a3a] font-bold uppercase">Ставка</span>
                               {formatCurrency(listing.currentBid.g, listing.currentBid.s, listing.currentBid.c)}
                            </div>
                            <div className="flex flex-col gap-0.5 items-end">
                               <span className="text-[9px] text-[#554a3a] font-bold uppercase">Выкуп</span>
                               {formatCurrency(listing.buyout.g, listing.buyout.s, listing.buyout.c)}
                            </div>
                        </div>

                     </div>
                   ))
                )}
             </div>
             
             {/* Mobile "Create Auction" Button at bottom */}
             <div className="md:hidden p-3 border-t border-[#3a2a1a] bg-[#1a1410] z-20">
                <button 
                  onClick={() => setIsCreatingAuction(true)}
                  className="w-full bg-[#2a1f16] border border-[#554a3a] text-[#ffd100] font-bold uppercase text-[11px] py-2.5 rounded text-center transition-colors shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                >
                  {language === 'ru' ? 'Выставить свой лот' : 'Create Auction'}
                </button>
             </div>
          </div>

          {/* ================= 3. RIGHT PANEL: DETAILS (When Item Selected) ================= */}
          <div className="hidden lg:flex w-[260px] bg-[#1a1410] border-l border-[#3a2a1a] flex-col z-30 overflow-hidden shadow-[inset_10px_0_20px_rgba(0,0,0,0.8)]">
             {selectedListing ? (
                <div className="h-full flex flex-col pt-12 items-center text-center p-4">
                   <div 
                     className="w-16 h-16 border-[2px] rounded mb-3 bg-black/60 shadow-[0_10px_20px_rgba(0,0,0,1)] relative flex justify-center items-center overflow-hidden"
                     style={{ borderColor: RarityHex(selectedListing.item.rarity) }}
                   >
                     <div className="opacity-80">
                        <ItemIconWrapper item={selectedListing.item} size={36} />
                     </div>
                   </div>
                   <h3 className={`font-bold text-sm leading-tight drop-shadow-[1px_1px_0_#000] mb-1 ${RarityColor(selectedListing.item.rarity)}`}>
                      {selectedListing.item.name}
                   </h3>
                   <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">
                     {selectedListing.item.slot}
                   </div>

                   {/* Stats mock if weapon/armor */}
                   {selectedListing.item.stats && Object.keys(selectedListing.item.stats).length > 0 && (
                     <div className="bg-black/40 border border-[#2a1a0f] rounded w-full p-2 text-[11px] text-left text-white/80 space-y-1 mb-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        {selectedListing.item.stats.ac && <div>Броня: {selectedListing.item.stats.ac}</div>}
                        {selectedListing.item.stats.str && <div className="text-white">+ {selectedListing.item.stats.str} Сила</div>}
                        {selectedListing.item.stats.sta && <div className="text-white">+ {selectedListing.item.stats.sta} Выносливость</div>}
                     </div>
                   )}

                   {/* Time Left & Seller info */}
                   <div className="w-full flex justify-between text-[10px] text-[#a08a70] border-b border-[#3a2a1a] pb-2 mb-2 font-mono">
                      <span>Время: {formatTimeLimit(selectedListing.timeLeftMinutes)}</span>
                      <span>Лот: {selectedListing.seller}</span>
                   </div>

                   <div className="w-full space-y-3 mt-auto mb-4">
                      <div className="flex flex-col gap-1 items-end bg-[#201813] border border-[#3a2a1a] p-2 rounded">
                          <span className="text-[9px] text-[#887a68] font-bold uppercase w-full text-left">Текущая ставка:</span>
                          {formatCurrency(selectedListing.currentBid.g, selectedListing.currentBid.s, selectedListing.currentBid.c)}
                          {selectedListing.hasBid && <span className="text-[9px] text-[#a335ee]">Твоя ставка лидирует!</span>}
                      </div>

                      <div className="flex flex-col gap-1 items-end bg-gradient-to-br from-[#302010] to-[#150f0c] border border-[#503a20] p-2 rounded shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
                          <span className="text-[9px] text-[#ffd100] font-bold uppercase w-full text-left">Цена выкупа:</span>
                          {formatCurrency(selectedListing.buyout.g, selectedListing.buyout.s, selectedListing.buyout.c)}
                      </div>
                   </div>

                   <div className="w-full space-y-2 mt-4">
                       <button className="w-full bg-[#1e1510] border border-[#4a3a2a] text-[#aaa] font-bold uppercase text-[10px] py-2 rounded hover:bg-[#2a1f18] hover:text-white transition-colors">
                          Сделать ставку
                       </button>
                       <button 
                         onClick={handleBuyout}
                         className="w-full bg-gradient-to-b from-[#ffd100] to-[#c79100] border border-[#ffe55c] text-black font-black uppercase text-[11px] py-2.5 rounded shadow-[0_0_15px_rgba(255,209,0,0.4)] hover:brightness-110 transition-all hover:scale-[1.02]"
                       >
                          Выкупить сразу
                       </button>
                   </div>
                </div>
             ) : (
                <div className="h-full flex items-center justify-center p-6 text-center text-[#554a3a] font-serif text-sm">
                   {language === 'ru' ? 'Выберите лот для просмотра подробностей' : 'Select a lot to view details'}
                </div>
             )}
          </div>
       </div>

       {/* MOBILE Action Buttons overlays when an item is selected */}
       {selectedListing && (
         <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1a1410] border-t-2 border-[#3a2a1a] p-4 flex gap-2 z-[100] animate-slide-up shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
            <button 
               className="flex-1 bg-[#1e1510] border border-[#4a3a2a] text-[#aaa] font-bold uppercase text-[10px] py-3 rounded"
               onClick={() => setSelectedListing(null)}
            >
               Отмена
            </button>
            <button 
               onClick={handleBuyout}
               className="flex-[2] bg-gradient-to-b from-[#ffd100] to-[#c79100] text-black font-black uppercase text-[11px] py-3 rounded text-center shadow-[0_0_15px_rgba(255,209,0,0.4)]"
            >
               Выкупить
            </button>
         </div>
       )}

       {/* CREATE AUCTION MODAL overlay */}
       {isCreatingAuction && (
         <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] bg-[#1a1410] border-[4px] border-[#3a2a1a] p-6 rounded-lg shadow-[0_20px_60px_rgba(0,0,0,1)] max-w-[400px] w-full relative">
               <button 
                 onClick={() => setIsCreatingAuction(false)}
                 className="absolute top-2 right-2 text-[#887a68] hover:text-white"
               >
                 <X size={20} />
               </button>
               
               <h2 className="text-[#ffd100] font-bold text-xl uppercase tracking-widest text-center mb-6" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                  Создать Аукцион
               </h2>
               
               <div className="flex gap-4 items-start mb-6">
                  {/* Item Slot */}
                  <div className="w-16 h-16 border-[2px] border-[#3a2a1a] bg-black/60 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] flex items-center justify-center rounded cursor-pointer hover:border-[#ffd100] transition-colors relative">
                     <span className="text-[10px] text-[#4a3a2a] font-bold text-center">ПЕРЕТАЩИТЕ<br/>ПРЕДМЕТ</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                     <div className="text-[11px] text-[#887a68] mb-1 font-bold uppercase">Объект аукциона</div>
                     <div className="text-[#3a2a1a] font-serif italic text-sm">Предмет не выбран...</div>
                  </div>
               </div>
               
               <div className="space-y-4 font-mono text-[11px] mb-6">
                  <div className="flex justify-between items-center bg-black/30 p-2 border border-[#2a1a0f] rounded">
                     <span className="text-[#a08a70] uppercase font-bold">Начальная цена:</span>
                     <div className="flex items-center gap-1">
                        <input type="number" min="0" placeholder="0" className="w-12 bg-transparent text-white text-right outline-none" />
                        <span className="text-yellow-400">g</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-center bg-black/30 p-2 border border-[#2a1a0f] rounded">
                     <span className="text-[#a08a70] uppercase font-bold">Цена выкупа:</span>
                     <div className="flex items-center gap-1">
                        <input type="number" min="0" placeholder="10" className="w-12 bg-transparent text-white text-right outline-none" />
                        <span className="text-yellow-400">g</span>
                     </div>
                  </div>
                  <div className="flex justify-between items-center bg-black/30 p-2 border border-[#2a1a0f] rounded">
                     <span className="text-[#a08a70] uppercase font-bold">Длительность:</span>
                     <select className="bg-transparent text-white outline-none">
                        <option value="12">12 часов</option>
                        <option value="24">24 часа</option>
                        <option value="48">48 часов</option>
                     </select>
                  </div>
               </div>

               <div className="border-t border-[#3a2a1a] pt-4 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5 font-mono">
                     <span className="text-[9px] text-[#887a68] font-bold uppercase">Залог:</span>
                     <span className="text-[#e6cc80] text-[10px]">1g 20s 0c</span>
                  </div>
                  <button 
                     onClick={() => {
                        triggerAlert(language === 'ru' ? 'Нечего выставлять!' : 'Nothing to list!', 'error');
                     }}
                     className="bg-gradient-to-b from-[#ffd100] to-[#c79100] text-black font-black uppercase text-[11px] px-6 py-2 rounded shadow-[0_0_15px_rgba(255,209,0,0.4)]"
                  >
                     Выставить
                  </button>
               </div>
            </div>
         </div>
       )}
    </div>
  );
}
