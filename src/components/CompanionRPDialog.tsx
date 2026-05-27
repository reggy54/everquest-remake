import React, { useState } from 'react';
import { PlayerCharacter } from '../types';
import { Heart, MessageSquare, Gift, Sparkles } from 'lucide-react';

interface RPDialogProps {
  character: PlayerCharacter;
  onUpdateCharacter: (updated: PlayerCharacter) => void;
  triggerAlert: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface CompanionRP {
  id: string;
  name: string;
  class: string;
  friendLevel: number;
  unlockedBuff: string;
  buffStats: Record<string, number>;
  bio: string;
  dialogues: {
    start: string;
    past: string;
    gods: string;
    raid: string;
    giftResponse: string;
  };
}

const COMPANIONS: CompanionRP[] = [
  {
    id: 'comp-1',
    name: 'Латник Торгар',
    class: 'Paladin',
    friendLevel: 25,
    unlockedBuff: 'Священный Доспех Торгара: +15 к Снаряжению (AC)',
    buffStats: { ac: 15 },
    bio: 'Бывший паладин Храма Света Кейноса. Избран за непоколебимую волю и мастерство щита.',
    dialogues: {
      start: 'Да пребудет с тобой Свет Авалона, друг мой. О чем ты думаешь в этот час?',
      past: 'Мой отец ковал мечи в порту Фрипорта. Я выбрал путь рыцаря, когда увидел, как скелеты разоряли наши фермы. Мы выстояли тогда. Мы выстоим и сейчас.',
      gods: 'Я молюсь Митаниэлю Марру – Доблестному Воину. Его щит защищает слабых. Верным воинам он дарует стальное спокойствие перед лицом тьмы.',
      raid: 'Мой клинок принадлежит нашему отряду! Собирай группу, я прикрою авангард щитом света и заставлю любого босса пожалеть, что он вышел на бой.',
      giftResponse: 'О, этот флакон освященного масла для доспехов... Превосходный выбор! Спасибо, моя вера в наше братство крепка как никогда!'
    }
  },
  {
    id: 'comp-2',
    name: 'Жрица Соня',
    class: 'Priest',
    friendLevel: 30,
    unlockedBuff: 'Милость Сони: +30 к Максимальной Мане (Mana)',
    buffStats: { mana: 30 },
    bio: 'Высшая эльфийка, покинувшая цветущие сады Фельвита Равнинного ради исцеления страждущих в боях.',
    dialogues: {
      start: 'Приветствую, светлая душа. Моя целебная магия всегда готова оберегать твой жизненный путь.',
      past: 'Мои предки веками изучали эссенцию звезд в обсерваториях Файдарка. Но я поняла, что созерцание звезд не вылечит раненого стража. Моё место здесь, на передовой.',
      gods: 'Тунаре – Мать всего сущего, направляет руку каждого клирика. Ее шепот слышен во влажном шелесте листьев. Верь в ее силу, и раны затянутся сами.',
      raid: 'Если мы пойдем в подземелья катакомб Кабилы, держись рядом. Малейший признак яда, и я сниму его комочками живительной ауры.',
      giftResponse: 'Шелковая повязка, расшитая лунным серебром! Как изысканно! Молитвы за твое благополучие будут звучать еще ярче.'
    }
  },
  {
    id: 'comp-3',
    name: 'Оникс Снайпер',
    class: 'Ranger',
    friendLevel: 15,
    unlockedBuff: 'Глаз Сокола Оникса: +10 к Ловкости (DEX)',
    buffStats: { dex: 10 },
    bio: 'Следопыт полуэльф, долгое время живший в глухих чащах Караны. Предпочитает язык стрел пустым словам.',
    dialogues: {
      start: 'Хм... Ты ступаешь тихо, это хорошо. Говори быстрее, пока след оленя не простыл.',
      past: 'Я вырос на границах Южных Степей Караны. Кровавые Волки съели мою хижину, когда я был юнцом. Лук стал моими глазами и руками. Лес учит терпению.',
      gods: 'Карана – Владыка Бурь контролирует грозы и дожди. Ему чужды человеческие дрязги, но он уважает свист ветра и полет стрелы в раскатах грома.',
      raid: 'Приглашаешь выпустить пару шквалов стрел в морду босса? Рад размять тетиву. Главное – не подпускай их ко мне на расстояние клинка.',
      giftResponse: 'Тонкая тетива из шкуры кейносского вепря? Редкость. Мой лук будет поражать цели в два раза быстрее. Благодарю, друг.'
    }
  }
];

export default function CompanionRPDialog({ character, onUpdateCharacter, triggerAlert }: RPDialogProps) {
  const [companionsState, setCompanionsState] = useState<CompanionRP[]>(() => {
    const saved = localStorage.getItem('eq3_com_rp');
    return saved ? JSON.parse(saved) : COMPANIONS;
  });

  const [selectedCompId, setSelectedCompId] = useState<string>(COMPANIONS[0].id);
  const [activeDialogue, setActiveDialogue] = useState<string>(COMPANIONS[0].dialogues.start);

  const selectedCompanion = companionsState.find(c => c.id === selectedCompId) || companionsState[0];

  const handleDialogueChoice = (option: 'past' | 'gods' | 'raid') => {
    setActiveDialogue(selectedCompanion.dialogues[option]);
  };

  const handleGiveGift = () => {
    if (character.gold < 15) {
      triggerAlert('У вас нет 15 золотых монет на ценный подарок соратнику!', 'error');
      return;
    }

    // Spend gold
    const updatedChar = { ...character, gold: character.gold - 15 };
    
    // Increase friendship
    const updatedComps = companionsState.map(c => {
      if (c.id === selectedCompId) {
        const newLvl = Math.min(100, c.friendLevel + 15);
        if (newLvl >= 50 && c.friendLevel < 50) {
          triggerAlert(`💖 Ваша связь дружбы с ${c.name} укрепилась! Открыт постоянный пассивный эффект: ${c.unlockedBuff}!`, 'success');
          
          // Actually permanent buff addition if desired
          const bonusStats = { ...updatedChar.stats };
          for (const [statKey, val] of Object.entries(c.buffStats)) {
            bonusStats[statKey] = (bonusStats[statKey] || 0) + val;
          }
          updatedChar.stats = bonusStats;
        }
        return { ...c, friendLevel: newLvl };
      }
      return c;
    });

    setCompanionsState(updatedComps);
    localStorage.setItem('eq3_com_rp', JSON.stringify(updatedComps));
    
    setActiveDialogue(selectedCompanion.dialogues.giftResponse);
    onUpdateCharacter(updatedChar);
    triggerAlert(`Вы даровали роскошный подарок ${selectedCompanion.name}! Связь +15%`, 'success');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
      <div className="border-b border-slate-800 pb-2">
        <h4 className="font-serif text-sm font-bold text-white flex items-center gap-1.5 uppercase">
          <MessageSquare className="h-4 w-4 text-emerald-400" />
          Связь с Соратниками (Ролевые Диалоги)
        </h4>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
          Укрепляйте дружбу с вашими постоянными ИИ-соратниками в пати, дарите сувениры и разблокируйте постоянные прибавки к характеристикам ролевого аватара.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 select-none">
        {/* Companion NPCs list */}
        <div className="md:col-span-4 space-y-2">
          {companionsState.map(comp => {
            const isSelected = comp.id === selectedCompId;

            return (
              <div
                key={comp.id}
                onClick={() => {
                  setSelectedCompId(comp.id);
                  setActiveDialogue(comp.dialogues.start);
                }}
                className={`p-2.5 rounded border font-mono text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-850 hover:border-slate-800 hover:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className={`font-bold block ${isSelected ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {comp.name}
                  </span>
                  <span className="text-[9px] text-slate-500">{comp.class}</span>
                </div>
                
                {/* Friendship scale progress */}
                <div className="mt-2 space-y-0.5">
                  <div className="flex justify-between text-[8px] text-slate-500">
                    <span>Связь дружбы:</span>
                    <span className="text-emerald-400 font-bold">{comp.friendLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${comp.friendLevel}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Companion dialog panel */}
        <div className="md:col-span-8 bg-slate-950 border border-slate-850 rounded-lg p-3.5 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute top-2 right-2 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800 text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">
            АКТИВНЫЙ RP ДИАЛОГ
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-xs font-serif font-bold text-slate-100 flex items-center gap-1">
                🗣️ {selectedCompanion.name}
              </span>
              <p className="text-[10px] text-slate-550 leading-relaxed font-mono mt-0.5">{selectedCompanion.bio}</p>
            </div>

            {/* Simulated companion spoken narrative block */}
            <div className="bg-slate-900/60 p-3 rounded border border-slate-900 font-serif text-xs text-slate-250 italic leading-relaxed">
              "{activeDialogue}"
            </div>
          </div>

          {/* Dialog Action Choice buttons */}
          <div className="space-y-1.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[10px] font-mono leading-none">
              <button
                onClick={() => handleDialogueChoice('past')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 hover:text-white text-slate-300 py-1.5 px-2 rounded cursor-pointer text-center text-[10px]"
              >
                💬 Расскажи о своем прошлом
              </button>
              <button
                onClick={() => handleDialogueChoice('gods')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 hover:text-white text-slate-300 py-1.5 px-2 rounded cursor-pointer text-center text-[10px]"
              >
                💬 Каким богам ты присягаешь?
              </button>
              <button
                onClick={() => handleDialogueChoice('raid')}
                className="bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 hover:text-white text-slate-300 py-1.5 px-2 rounded cursor-pointer text-center text-[10px]"
              >
                💬 Ты пойдешь со мной в рейд?
              </button>
            </div>

            <div className="border-t border-slate-900/60 pt-2 flex justify-between items-center flex-wrap gap-2">
              <span className="text-[9px] text-slate-500 font-mono italic">
                {selectedCompanion.friendLevel >= 50 ? '💎 Связь укреплена (Сила покоя активна)' : 'Потребуется 50% связи дружбы для пассивного баффа'}
              </span>

              <button
                onClick={handleGiveGift}
                className="bg-emerald-900 hover:bg-emerald-800 text-emerald-250 font-mono text-[9px] font-black uppercase py-1.5 px-3 rounded cursor-pointer flex items-center gap-1"
              >
                <Gift className="h-3 w-3" />
                Даровать сувенир (-15g)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
