import React, { useState } from 'react';
import { PlayerCharacter, FateShard, CharacterClass } from '../types';
import { 
  Book, Star, Activity, Hexagon, Shield, Sword, Wind, Zap, Lock, BookOpen,
  Axe, Flame, ShieldAlert, Skull, Crosshair, Leaf, Target,
  Plus, X, Scale, Droplet, Ghost, Bomb, Bot, Hammer, CloudLightning, Swords, 
  CircleDot, Moon, Sun, Circle
} from 'lucide-react';

interface ProgressionProps {
  character: PlayerCharacter;
  onUpdateCharacter: (character: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'info'|'success'|'error'|'warning') => void;
}

// Tree structure for 3 rows
const dummyTalents = (prefix: string) => [
  { id: `${prefix}_1`, row: 1, desc: 'Улучшение базовых навыков', req: null },
  { id: `${prefix}_2`, row: 2, desc: 'Увеличение эффективности спец. атак', req: `${prefix}_1` },
  { id: `${prefix}_3`, row: 3, desc: 'Ультимативная способность спека', req: `${prefix}_2` },
];

const CLASS_TREES: Record<CharacterClass, { id: string, name: string, title: string, icon: any, color: string, bg: string, border: string, talents: any[] }[]> = {
  Warrior: [
    { id: 'war_berserk', title: 'Берсерк', name: 'Яростный Топор', icon: Axe, color: 'text-[#ef4444]', bg: 'bg-[#451a1a]', border: 'border-[#b91c1c]', talents: dummyTalents('wb') },
    { id: 'war_knight', title: 'Рыцарь', name: 'Щит и Меч', icon: Swords, color: 'text-[#3b82f6]', bg: 'bg-[#1e3a8a]', border: 'border-[#1d4ed8]', talents: dummyTalents('wk') },
    { id: 'war_guard', title: 'Страж', name: 'Непоколебимый Щит', icon: Shield, color: 'text-[#10b981]', bg: 'bg-[#064e3b]', border: 'border-[#047857]', talents: dummyTalents('wg') },
  ],
  Mage: [
    { id: 'mag_elem', title: 'Элементалист', name: 'Стихийный Круг', icon: Flame, color: 'text-[#f59e0b]', bg: 'bg-[#78350f]', border: 'border-[#d97706]', talents: dummyTalents('me') },
    { id: 'mag_arcane', title: 'Аркан', name: 'Рунический Разлом', icon: Hexagon, color: 'text-[#a855f7]', bg: 'bg-[#4c1d95]', border: 'border-[#7e22ce]', talents: dummyTalents('ma') },
    { id: 'mag_necro', title: 'Некромант', name: 'Череп Разлома', icon: Skull, color: 'text-[#84cc16]', bg: 'bg-[#3f6212]', border: 'border-[#4d7c0f]', talents: dummyTalents('mn') },
  ],
  Ranger: [
    { id: 'ran_hunt', title: 'Охотник', name: 'Волк и Лук', icon: Target, color: 'text-[#f97316]', bg: 'bg-[#7c2d12]', border: 'border-[#c2410c]', talents: dummyTalents('rh') },
    { id: 'ran_marks', title: 'Стрелок', name: 'Натянутая Стрела', icon: Crosshair, color: 'text-[#60a5fa]', bg: 'bg-[#1e3a8a]', border: 'border-[#2563eb]', talents: dummyTalents('rm') },
    { id: 'ran_warden', title: 'Страж Природы', name: 'Лук с Корнями', icon: Leaf, color: 'text-[#22c55e]', bg: 'bg-[#14532d]', border: 'border-[#15803d]', talents: dummyTalents('rw') },
  ],
  Priest: [
    { id: 'pri_light', title: 'Светоносец', name: 'Золотой Крест', icon: Plus, color: 'text-[#fde047]', bg: 'bg-[#713f12]', border: 'border-[#ca8a04]', talents: dummyTalents('pl') },
    { id: 'pri_shadow', title: 'Теневой Целитель', name: 'Чёрный Крест', icon: X, color: 'text-[#9ca3af]', bg: 'bg-[#1f2937]', border: 'border-[#4b5563]', talents: dummyTalents('ps') },
    { id: 'pri_balance', title: 'Балансёр', name: 'Равновесие', icon: Scale, color: 'text-[#e879f9]', bg: 'bg-[#701a75]', border: 'border-[#c026d3]', talents: dummyTalents('pb') },
  ],
  Rogue: [
    { id: 'rog_assassin', title: 'Убийца', name: 'Кровавый Кинжал', icon: Droplet, color: 'text-[#ef4444]', bg: 'bg-[#451a1a]', border: 'border-[#b91c1c]', talents: dummyTalents('ra') },
    { id: 'rog_shadow', title: 'Теневой Танцор', name: 'Тени и Кинжалы', icon: Ghost, color: 'text-[#6366f1]', bg: 'bg-[#312e81]', border: 'border-[#4338ca]', talents: dummyTalents('rs') },
    { id: 'rog_mechanic', title: 'Механик', name: 'Кинжал и Бомба', icon: Bomb, color: 'text-[#f59e0b]', bg: 'bg-[#78350f]', border: 'border-[#d97706]', talents: dummyTalents('rmc') },
  ],
  Summoner: [
    { id: 'sum_spirit', title: 'Духовод', name: 'Дух Природы', icon: Wind, color: 'text-[#6ee7b7]', bg: 'bg-[#064e3b]', border: 'border-[#059669]', talents: dummyTalents('ss') },
    { id: 'sum_demon', title: 'Повелитель Демонов', name: 'Демонический Портал', icon: CircleDot, color: 'text-[#d946ef]', bg: 'bg-[#701a75]', border: 'border-[#c026d3]', talents: dummyTalents('sd') },
    { id: 'sum_techno', title: 'Техно-призыватель', name: 'Механический Голем', icon: Bot, color: 'text-[#94a3b8]', bg: 'bg-[#0f172a]', border: 'border-[#475569]', talents: dummyTalents('st') },
  ],
  Paladin: [
    { id: 'pal_ret', title: 'Каратель', name: 'Молот Правосудия', icon: Hammer, color: 'text-[#facc15]', bg: 'bg-[#713f12]', border: 'border-[#eab308]', talents: dummyTalents('pr') },
    { id: 'pal_prot', title: 'Защитник', name: 'Щит Веры', icon: ShieldAlert, color: 'text-[#bfdbfe]', bg: 'bg-[#1e3a8a]', border: 'border-[#3b82f6]', talents: dummyTalents('pp') },
    { id: 'pal_crusader', title: 'Крестоносец', name: 'Крест и Меч', icon: Swords, color: 'text-[#f87171]', bg: 'bg-[#451a1a]', border: 'border-[#ef4444]', talents: dummyTalents('pc') },
  ],
  Shaman: [
    { id: 'sha_elem', title: 'Стихийный', name: 'Тотем Бури', icon: CloudLightning, color: 'text-[#38bdf8]', bg: 'bg-[#0c4a6e]', border: 'border-[#0284c7]', talents: dummyTalents('se') },
    { id: 'sha_spirit', title: 'Духовный', name: 'Тотем Духов', icon: Moon, color: 'text-[#c084fc]', bg: 'bg-[#4c1d95]', border: 'border-[#9333ea]', talents: dummyTalents('ssp') },
    { id: 'sha_blood', title: 'Кровавый', name: 'Кровавый Тотем', icon: Flame, color: 'text-[#f87171]', bg: 'bg-[#7f1d1d]', border: 'border-[#dc2626]', talents: dummyTalents('sb') },
  ]
};

const DUMMY_FATE_SHARDS: FateShard[] = [
  { id: 'shard_1', name: 'Осколок Света', type: 'Light', description: 'Золотой кристалл, излучающий тепло', buff: '+10% Лечение' },
  { id: 'shard_2', name: 'Осколок Тьмы', type: 'Dark', description: 'Фиолетовый кристалл, поглощающий свет', buff: '+15% Урон, -5% Броня' },
  { id: 'shard_3', name: 'Осколок Баланса', type: 'Balance', description: 'Серебряный кристалл совершенной гармонии', buff: '+5% Ко всем атрибутам' },
];

export default function ProgressionTalentsFates({ character, onUpdateCharacter, triggerAlert }: ProgressionProps) {
  const [activeTab, setActiveTab] = useState<'fates' | 'talents'>('talents');
  const [selectedShard, setSelectedShard] = useState<FateShard | null>(null);

  const characterTalents = character.talents || [];
  const talentPoints = character.talentPoints ?? Math.max(0, character.level - 10);
  const fatePages = character.fatePages || {};
  const fateShards = character.fateShardsInventory || DUMMY_FATE_SHARDS;

  const currentClassTrees = CLASS_TREES[character.class];

  const handleUnlockTalent = (id: string, req: string | null) => {
    if (talentPoints <= 0) {
      triggerAlert('Недостаточно очков талантов!', 'error');
      return;
    }
    if (characterTalents.includes(id)) {
      return;
    }
    if (req && !characterTalents.includes(req)) {
      triggerAlert('Сначала изучите предыдущий талант в ветке!', 'warning');
      return;
    }

    onUpdateCharacter({
      ...character,
      talents: [...characterTalents, id],
      talentPoints: talentPoints - 1
    });
    triggerAlert('Талант успешно изучен!', 'success');
  };

  const handlePlaceShard = (page: number) => {
    if (!selectedShard) return;
    
    const newPages = { ...fatePages, [page]: selectedShard };
    onUpdateCharacter({
      ...character,
      fatePages: newPages
    });
    setSelectedShard(null);
    triggerAlert('Осколок вставлен в Книгу Судеб!', 'success');
  };

  return (
    <div className="w-full h-full pb-24">
       <div className="max-w-[1200px] mx-auto bg-[#171412] border-[4px] border-[#3d2e1f] shadow-[0_20px_60px_rgba(0,0,0,1)] rounded-lg relative flex flex-col min-h-[750px] overflow-hidden font-serif">
          
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-80 pointer-events-none mix-blend-multiply" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-mamba.png')] opacity-30 pointer-events-none" />

          {/* Top Title Bar */}
          <div className="h-16 bg-gradient-to-b from-[#2a1c12] to-[#1a1714] border-b-[3px] border-[#5c4a3d] z-20 flex justify-between items-center relative px-6 shadow-xl">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 border-2 border-[#8a6b46] rounded-full bg-[#0a0907] flex items-center justify-center shadow-inner">
                 <BookOpen className="text-[#d8c3a5]" size={20} />
               </div>
               <div>
                 <h2 className="text-[#d8c3a5] font-bold text-xl uppercase tracking-widest drop-shadow-[2px_2px_0_#000]" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                    Судьба и Таланты
                 </h2>
                 <p className="text-xs text-[#8c7a6b] font-mono tracking-widest uppercase mt-0.5">Класс: <span className="text-[#a68c70]">{character.class}</span></p>
               </div>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('talents')}
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase rounded-sm border-2 transition-all ${activeTab === 'talents' ? 'bg-[#3d2e1f] border-[#d4af37] text-[#fef08a] shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-[#1a1714] border-[#2b1f14] text-[#8c7a6b] hover:border-[#5c4a3d] hover:text-[#c4b59d]'}`}
                >
                  <Star size={16} /> Древо Талантов
                </button>
                <button 
                  onClick={() => setActiveTab('fates')}
                  className={`flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase rounded-sm border-2 transition-all ${activeTab === 'fates' ? 'bg-[#2a1835] border-[#a855f7] text-[#e9d5ff] shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-[#1a1714] border-[#2b1f14] text-[#8c7a6b] hover:border-[#5c4a3d] hover:text-[#c4b59d]'}`}
                >
                  <Hexagon size={16} /> Осколки Судьбы
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto relative z-10 p-6">
            
            {activeTab === 'talents' && currentClassTrees && (
              <div className="flex flex-col h-full animate-fade-in">
                {/* Talent Points Counter */}
                <div className="flex justify-center mb-8">
                  <div className="bg-[#0a0907] px-6 py-3 border-[3px] border-[#5c4a3d] rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,1)] flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#d4af37]/10 to-transparent opacity-50" />
                    <span className="text-[#a68c70] uppercase text-xs font-bold tracking-widest relative z-10">Свободные очки талантов:</span>
                    <span className="text-3xl font-black text-[#d4af37] font-mono drop-shadow-[0_0_5px_#d4af37] relative z-10">{talentPoints}</span>
                  </div>
                </div>

                {/* Talent Trees */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full px-4">
                  {currentClassTrees.map((tree, idx) => {
                    const TreeIcon = tree.icon;
                    return (
                      <div key={idx} className={`relative flex flex-col items-center bg-[#171412] border-[3px] ${tree.border} rounded-md shadow-2xl overflow-hidden`}>
                         
                         {/* Background Tint & Texture */}
                         <div className={`absolute inset-0 ${tree.bg} opacity-30 pointer-events-none mix-blend-overlay`} />
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-40 pointer-events-none" />
                         
                         {/* Tree Header */}
                         <div className={`w-full py-6 px-4 border-b-[3px] ${tree.border} bg-[#0a0907]/80 flex flex-col items-center relative z-10 shadow-lg`}>
                            {/* Metallic Frame for Icon */}
                            <div className={`w-16 h-16 rounded-md border-[3px] ${tree.border} bg-[#1a1714] flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden`}>
                               <div className="absolute inset-0 pointer-events-none shadow-inner" />
                               {/* Subtle visual rift energy for Etheria thematic */}
                               <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-purple-600/40 to-transparent blur-[2px]" />
                               <TreeIcon className={`w-10 h-10 ${tree.color} drop-shadow-[0_2px_4px_rgba(0,0,0,1)] relative z-10 transition-transform duration-500 hover:scale-110 hover:brightness-125`} />
                            </div>
                            <h3 className={`text-lg font-black uppercase tracking-widest ${tree.color} drop-shadow-[1px_1px_0_#000]`}>{tree.title}</h3>
                            <p className="text-[#a68c70] text-xs mt-1 font-bold italic">«{tree.name}»</p>
                         </div>

                         {/* Tree Nodes */}
                         <div className="flex-1 w-full flex flex-col items-center pt-8 pb-12 relative z-10 space-y-12 min-h-[400px]">
                            {/* Branch lines (simplified) */}
                            <div className="absolute inset-y-0 left-1/2 w-1 border-l-2 border-dashed border-[#5c4a3d] -translate-x-1/2 z-0 opacity-50" />
                            
                            {tree.talents.map((talent, tIdx) => {
                               const isUnlocked = characterTalents.includes(talent.id);
                               const hasReq = !talent.req || characterTalents.includes(talent.req);
                               const canUnlock = hasReq && talentPoints > 0;
                               
                               return (
                                 <div key={tIdx} className="relative z-10 flex flex-col items-center group">
                                    <button 
                                      onClick={() => { if(!isUnlocked && hasReq) handleUnlockTalent(talent.id, talent.req); }}
                                      className={`w-14 h-14 rounded-md border-2 rotate-45 flex items-center justify-center transition-all cursor-pointer relative overflow-hidden
                                        ${isUnlocked 
                                          ? `bg-[#2a241f] ${tree.border} shadow-[0_0_15px_${tree.color.replace('text-', '')}]` 
                                          : canUnlock 
                                            ? 'bg-[#1a1714] border-[#a68c70] hover:scale-105 hover:bg-[#2a241f]' 
                                            : 'bg-[#0a0907] border-[#3d2e1f] opacity-60 grayscale'
                                        }
                                      `}
                                    >
                                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/binding-dark.png')] opacity-50 pointer-events-none" />
                                      {isUnlocked && <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 pointer-events-none" />}
                                      <div className="-rotate-45">
                                        <TreeIcon className={`w-6 h-6 ${isUnlocked ? tree.color : 'text-[#8c7a6b]'} drop-shadow-[0_2px_1px_rgba(0,0,0,1)]`} />
                                      </div>
                                    </button>

                                    {/* Tooltip */}
                                    <div className="absolute top-1/2 left-[120%] -translate-y-1/2 w-48 bg-[#0a0907] border-[2px] border-[#5c4a3d] p-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                      <div className={`text-xs font-bold uppercase mb-1 drop-shadow-[1px_1px_0_#000] ${tree.color}`}>{tree.title} - Этап {talent.row}</div>
                                      <div className="text-[10px] text-[#c4b59d] mb-2">{talent.desc}</div>
                                      
                                      {isUnlocked ? (
                                        <div className="text-[10px] text-emerald-400 font-bold uppercase">Изучено</div>
                                      ) : canUnlock ? (
                                        <div className="text-[10px] text-[#fef08a] font-bold uppercase blink">ЛКМ для изучения</div>
                                      ) : (
                                        <div className="text-[10px] text-red-400 uppercase">Недоступно</div>
                                      )}
                                    </div>
                                 </div>
                               )
                            })}
                         </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* FATES TAB */}
            {activeTab === 'fates' && (
              <div className="flex flex-col lg:flex-row gap-8 relative h-full animate-fade-in p-4">
                
                {/* Left page: Shards Inventory */}
                <div className="flex-1 bg-[#171412] rounded-lg border-[3px] border-[#3d2e1f] p-5 relative shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')] opacity-30 pointer-events-none" />
                  
                  <h3 className="text-[#d8c3a5] font-bold uppercase text-sm tracking-wider mb-6 border-b-2 border-[#5c4a3d] pb-3 drop-shadow-[1px_1px_0_#000] flex items-center gap-2">
                    <Hexagon size={16} className="text-purple-500" /> Инвентарь Осколков Разлома
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 relative z-10">
                    {fateShards.map(shard => (
                      <div 
                        key={shard.id}
                        onClick={() => setSelectedShard(shard)}
                        className={`p-4 rounded-md border-2 cursor-pointer transition-all flex items-start gap-4 relative overflow-hidden group
                          ${selectedShard?.id === shard.id 
                            ? 'bg-[#1a1025] border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                            : 'bg-[#0a0907] border-[#2b1f14] hover:border-[#5c4a3d]'}`}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-purple-900/10 to-transparent pointer-events-none" />
                        
                        <div className={`w-12 h-12 shrink-0 rounded flex items-center justify-center border-2 border-[#3d2e1f] bg-[#1a1714] shadow-inner ${
                          shard.type === 'Light' ? 'border-amber-700' : 
                          shard.type === 'Dark' ? 'border-purple-700' : 'border-slate-500'
                        }`}>
                           <Hexagon className={`w-6 h-6 drop-shadow-[0_0_8px_currentColor] ${
                             shard.type === 'Light' ? 'text-amber-400' : 
                             shard.type === 'Dark' ? 'text-purple-500' : 'text-slate-300'
                           }`} />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-bold text-[#d8c3a5] text-sm group-hover:text-amber-400 transition-colors uppercase">{shard.name}</h4>
                          <p className="text-xs text-[#8c7a6b] font-serif italic my-1">{shard.description}</p>
                          <div className="text-[10px] text-emerald-400 font-mono mt-2 font-bold">{shard.buff}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right page: Book representation */}
                <div className="flex-1 bg-[#251e18] rounded-xl border-[4px] border-[#5c4a3d] p-8 relative shadow-2xl flex flex-col">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stucco.png')] opacity-40 pointer-events-none mix-blend-multiply" />
                   
                   <div className="text-center mb-10 relative z-10 border-b border-[#5c4a3d] pb-6">
                      <h3 className="text-amber-500 font-serif text-2xl uppercase tracking-[0.2em] font-black drop-shadow-[2px_2px_0_#000]">Страницы Судьбы</h3>
                      <p className="text-xs text-[#a68c70] font-mono mt-3">«Заполните пустоту мощью Разлома...»</p>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-8 max-w-lg mx-auto w-full relative z-10 font-sans">
                     {[1, 2, 3, 4].map(page => {
                        const isUnlocked = character.level >= (page * 10);
                        const inserted = fatePages[page];

                        return (
                          <div key={page} className="flex flex-col items-center">
                            <div className="text-[10px] text-[#8c7a6b] uppercase font-bold tracking-widest mb-2 font-mono">Слот {page} ({page*10} Ур.)</div>
                            <button 
                              onClick={() => { if(isUnlocked && selectedShard) handlePlaceShard(page); }}
                              className={`w-24 h-24 rotate-45 rounded-md flex flex-col justify-center items-center text-center transition-all border-4 relative overflow-hidden group
                                ${!isUnlocked ? 'border-[#1a1714] bg-[#0a0907] opacity-60 cursor-not-allowed grayscale' : 
                                  inserted ? 'border-purple-600 bg-[#160c28] shadow-[0_0_25px_rgba(147,51,234,0.4)] hover:brightness-110' : 
                                  selectedShard ? 'border-amber-500 bg-[#1a1714] hover:bg-[#2a241f] shadow-[0_0_15px_rgba(245,158,11,0.5)] cursor-pointer' : 
                                  'border-[#3d2e1f] bg-[#1a1714] hover:border-[#5c4a3d]'}
                              `}
                            >
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] opacity-50 pointer-events-none mix-blend-overlay" />
                              
                              <div className="-rotate-45 w-full flex flex-col items-center justify-center p-2 relative z-10">
                                {!isUnlocked ? (
                                  <>
                                    <Lock className="text-[#3d2e1f] mb-1 opacity-50 drop-shadow-[0_1px_0_#000]" size={24} />
                                    <span className="text-[8px] uppercase text-[#5c4a3d] font-bold font-mono">Заблокировано</span>
                                  </>
                                ) : inserted ? (
                                  <>
                                    <Hexagon className="text-purple-400 mb-1 drop-shadow-[0_0_5px_currentColor]" size={28} />
                                    <span className="text-[9px] font-bold text-[#e9d5ff] uppercase leading-tight line-clamp-1 truncate w-full text-center px-1 drop-shadow-[1px_1px_0_#000]">{inserted.name}</span>
                                    <span className="text-[8px] text-emerald-300 mt-1 block font-mono">{inserted.buff}</span>
                                  </>
                                ) : (
                                  <>
                                    <div className={`w-8 h-8 rounded-full border border-dashed ${selectedShard ? 'border-amber-500 animate-spin-slow' : 'border-[#5c4a3d]'} mb-1 flex items-center justify-center`}>
                                      <div className={`w-2 h-2 rounded-full ${selectedShard ? 'bg-amber-500 animate-pulse' : 'bg-[#3d2e1f]'}`} />
                                    </div>
                                    <span className="text-[8px] uppercase text-[#8c7a6b] font-bold font-mono mt-1">
                                      {selectedShard ? 'ЛКМ вставить' : 'Пусто'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </button>
                          </div>
                        )
                     })}
                   </div>
                </div>
              </div>
            )}

          </div>
       </div>
    </div>
  );
}
