import React, { useState } from 'react';
import { PlayerCharacter, FateShard } from '../types';
import { Book, Star, Activity, Hexagon, Shield, Sword, Wind, Zap, Lock, BookOpen } from 'lucide-react';

interface ProgressionProps {
  character: PlayerCharacter;
  onUpdateCharacter: (character: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'info'|'success'|'error'|'warning') => void;
}

const TALENT_TREES = {
  Warrior: [
    { id: 'war_1', name: 'Кровавое Безумие', type: 'berserker', row: 1, desc: '+5% Урона, -2% ХП', req: null },
    { id: 'war_2', name: 'Щитовая Стена', type: 'knight', row: 1, desc: '+10 Брони', req: null },
    { id: 'war_3', name: 'Железная Кожа', type: 'guardian', row: 1, desc: '+20 Макс. ХП', req: null },
    { id: 'war_4', name: 'Яростный Удар', type: 'berserker', row: 2, desc: '+15% Крит урон', req: 'war_1' },
    { id: 'war_5', name: 'Вызов на Поединок', type: 'knight', row: 2, desc: 'Провокация цели', req: 'war_2' },
  ]
  // In a real app we would have trees for all classes
};

const DUMMY_FATE_SHARDS: FateShard[] = [
  { id: 'shard_1', name: 'Осколок Рассвета', type: 'Light', description: 'Светлое начало', buff: '+10% Лечение' },
  { id: 'shard_2', name: 'Тлеющий Уголь', type: 'Chaos', description: 'Разрушительная мощь', buff: '+15% Урон, -5% Броня' },
  { id: 'shard_3', name: 'Кристалл Равновесия', type: 'Balance', description: 'Идеальная гармония', buff: '+5% Ко всем атрибутам' },
];

export default function ProgressionTalentsFates({ character, onUpdateCharacter, triggerAlert }: ProgressionProps) {
  const [activeTab, setActiveTab] = useState<'fates' | 'talents'>('fates');
  const [selectedShard, setSelectedShard] = useState<FateShard | null>(null);

  const characterTalents = character.talents || [];
  const talentPoints = character.talentPoints ?? Math.max(0, character.level - 10);
  const fatePages = character.fatePages || {};
  const fateShards = character.fateShardsInventory || DUMMY_FATE_SHARDS;

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
    <div className="bg-slate-950 border border-amber-900/30 rounded-lg shadow-2xl overflow-hidden flex flex-col w-full min-h-[600px] text-slate-300 relative">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-amber-900/30 p-4 flex flex-col md:flex-row relative justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-serif text-amber-500 font-bold tracking-widest uppercase flex items-center gap-2">
            <BookOpen className="text-amber-500" /> Прогрессия персонажа
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">Определите свой Путь Судьбы и откройте новые возможности</p>
        </div>
        
        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button 
            onClick={() => setActiveTab('fates')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'fates' ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-700/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Book className="w-4 h-4" /> Книга Судеб
          </button>
          <button 
            onClick={() => setActiveTab('talents')}
            className={`px-4 py-2 rounded text-xs font-bold uppercase transition-all flex items-center gap-2 ${activeTab === 'talents' ? 'bg-amber-900/50 text-amber-500 border border-amber-700/50' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Star className="w-4 h-4" /> Древо Талантов
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {activeTab === 'fates' && (
          <div className="flex flex-col lg:flex-row gap-6 relative">
            
            {/* Left page: Shards */}
            <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 p-4">
              <h3 className="text-indigo-400 font-bold uppercase text-sm tracking-wider mb-4 border-b border-indigo-900/50 pb-2">Инвентарь Осколков</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fateShards.map(shard => (
                  <div 
                    key={shard.id}
                    onClick={() => setSelectedShard(shard)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedShard?.id === shard.id ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-indigo-700'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 text-sm">{shard.name}</span>
                      <Hexagon className={`w-4 h-4 ${shard.type === 'Light' ? 'text-yellow-400' : shard.type === 'Dark' ? 'text-purple-600' : shard.type === 'Chaos' ? 'text-red-500' : 'text-blue-400'}`} />
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">{shard.description}</p>
                    <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded inline-block">{shard.buff}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right page: Book representation */}
            <div className="flex-1 bg-slate-1000 rounded-lg border-2 border-amber-900/20 p-6 relative shadow-inner">
               <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"20\\" height=\\"20\\" viewBox=\\"0 0 20 20\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%239C92AC\\" fill-opacity=\\"0.4\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"3\\"/>%3Ccircle cx=\\"13\\" cy=\\"13\\" r=\\"3\\"/>%3C/g%3E%3C/svg%3E")' }}></div>
               <h3 className="text-amber-500 text-center font-serif text-2xl mb-8 uppercase tracking-[0.2em]">Страницы Судьбы</h3>
               
               <div className="grid grid-cols-2 gap-6 max-w-md mx-auto relative z-10">
                 {[1, 2, 3, 4].map(page => {
                    const isUnlocked = character.level >= (page * 10);
                    const inserted = fatePages[page];

                    return (
                      <div 
                        key={page} 
                        onClick={() => { if(isUnlocked && selectedShard) handlePlaceShard(page); }}
                        className={`aspect-square rounded-full flex flex-col justify-center items-center p-4 text-center transition-all border-2 
                          ${!isUnlocked ? 'border-slate-800 bg-slate-900/50 opacity-50' : 
                            inserted ? 'border-indigo-500 bg-indigo-950 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 
                            selectedShard ? 'border-amber-500/50 bg-slate-900 cursor-pointer hover:bg-amber-900/20 hover:border-amber-400 animate-pulse' : 
                            'border-slate-700 bg-slate-900'}
                        `}
                      >
                        {!isUnlocked ? (
                          <>
                            <Lock className="text-slate-600 mb-2" />
                            <span className="text-[10px] uppercase text-slate-500 font-bold font-mono">Ур. {page*10}</span>
                          </>
                        ) : inserted ? (
                          <>
                            <Activity className="text-indigo-400 mb-2 w-8 h-8" />
                            <span className="text-xs font-bold text-slate-200">{inserted.name}</span>
                            <span className="text-[9px] text-emerald-400 mt-1 block">{inserted.buff}</span>
                          </>
                        ) : (
                          <span className="text-[10px] uppercase text-slate-500 font-bold">Пустой Слот</span>
                        )}
                      </div>
                    )
                 })}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'talents' && (
          <div className="flex flex-col items-center">
            <div className="bg-slate-900 px-6 py-3 rounded-full border border-amber-500/30 mb-8 inline-block shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <span className="text-slate-400 uppercase text-xs font-bold mr-3 tracking-wider">Свободные очки талантов:</span>
              <span className="text-2xl font-black text-amber-400 font-mono">{talentPoints}</span>
            </div>

            <div className="w-full max-w-4xl mx-auto bg-slate-950/80 p-8 pt-12 rounded-xl relative overflow-hidden border border-slate-800">
               {/* Connections placeholder - in a real app SVG lines would connect nodes */}
               <div className="absolute inset-0 flex justify-center opacity-10 pointer-events-none">
                  <div className="w-px h-full bg-slate-500"></div>
                  <div className="w-1/3 h-px bg-slate-500 absolute top-1/3"></div>
               </div>

               <div className="grid grid-cols-3 gap-8 text-center relative z-10">
                 {/* This represents a simplified 3-branch tree view for UI illustration */}
                 <div className="col-span-1 space-y-8">
                    <h4 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-8">Берсерк (Урон)</h4>
                    <div className="flex justify-center"><TalentNode id="war_1" characterTalents={characterTalents} onUnlock={handleUnlockTalent} icon={Sword} name="Кровавое Безумие" /></div>
                    <div className="flex justify-center"><TalentNode id="war_4" characterTalents={characterTalents} onUnlock={handleUnlockTalent} req="war_1" icon={Zap} name="Яростный Удар" /></div>
                 </div>
                 
                 <div className="col-span-1 space-y-8">
                    <h4 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-8">Рыцарь (Контроль)</h4>
                    <div className="flex justify-center"><TalentNode id="war_2" characterTalents={characterTalents} onUnlock={handleUnlockTalent} icon={Shield} name="Щитовая Стена" /></div>
                    <div className="flex justify-center"><TalentNode id="war_5" characterTalents={characterTalents} onUnlock={handleUnlockTalent} req="war_2" icon={Wind} name="Вызов на Поединок" /></div>
                 </div>

                 <div className="col-span-1 space-y-8">
                    <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-8">Страж (Защита)</h4>
                    <div className="flex justify-center"><TalentNode id="war_3" characterTalents={characterTalents} onUnlock={handleUnlockTalent} icon={Shield} name="Железная Кожа" /></div>
                    <div className="flex justify-center opacity-30"><TalentNode id="lock_1" characterTalents={characterTalents} onUnlock={handleUnlockTalent} req="war_3" icon={Lock} name="Последний Бастион" /></div>
                 </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TalentNode({ id, name, icon: Icon, characterTalents, onUnlock, req }: any) {
  const isUnlocked = characterTalents.includes(id);
  const isAvailable = !req || characterTalents.includes(req);

  return (
    <div 
      onClick={() => isAvailable && !isUnlocked && onUnlock(id, req)}
      className={`w-16 h-16 rounded-lg rotate-45 flex items-center justify-center transition-all cursor-pointer relative group
        ${isUnlocked ? 'bg-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.5)] border border-amber-300' : 
          isAvailable ? 'bg-slate-800 hover:bg-slate-700 border border-slate-600' : 'bg-slate-900 border border-slate-800 opacity-50'}
      `}
    >
      <div className="-rotate-45 p-2">
        <Icon className={`w-6 h-6 ${isUnlocked ? 'text-amber-100' : isAvailable ? 'text-slate-400' : 'text-slate-700'}`} />
      </div>
      
      {/* Tooltip */}
      <div className="absolute top-full lg:left-1/2 left-0 lg:-translate-x-1/2 mt-8 -rotate-45 sm:w-32 bg-slate-950 border border-slate-700 p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
        <div className="text-[10px] font-bold text-amber-400 uppercase text-center block mb-1">{name}</div>
        {!isUnlocked && isAvailable && <div className="text-[8px] text-emerald-400 text-center">Кликните для изучения</div>}
      </div>
    </div>
  );
}
