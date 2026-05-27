import React, { useState, useEffect } from 'react';
import { PlayerCharacter } from '../types';
import { Sparkles, ArrowRight, ShieldAlert, SkipForward, Flame, Map, Compass, Gem } from 'lucide-react';

interface OnboardingCinematicProps {
  character: PlayerCharacter;
  onComplete: () => void;
  language?: 'ru' | 'en';
}

type OnboardingState = 
  | 'awakening' 
  | 'quest1_awaken' 
  | 'quest2_light' 
  | 'quest3_guardian' 
  | 'quest4_rift'
  | 'quest5_village'
  | 'shadow_invasion_defend'
  | 'shadow_invasion_boss'
  | 'epic_transition';

export default function OnboardingCinematic({ character, onComplete, language = 'ru' }: OnboardingCinematicProps) {
  const [phase, setPhase] = useState<OnboardingState>('awakening');
  const [textStage, setTextStage] = useState(0);

  // Auto-advance awakening text
  useEffect(() => {
    if (phase === 'awakening') {
      const raceTexts = getRaceSpecificAwakening(character.race, character.name, language);
      
      if (textStage < raceTexts.length) {
        const timer = setTimeout(() => {
          setTextStage(textStage + 1);
        }, 3500);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPhase('quest1_awaken');
          setTextStage(0);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, textStage, character.race, character.name, language]);

  const handleNextPhase = () => {
    switch (phase) {
      case 'quest1_awaken': setPhase('quest2_light'); break;
      case 'quest2_light': setPhase('quest3_guardian'); break;
      case 'quest3_guardian': setPhase('quest4_rift'); break;
      case 'quest4_rift': setPhase('quest5_village'); break;
      case 'quest5_village': setPhase('shadow_invasion_defend'); break;
      case 'shadow_invasion_defend': setPhase('shadow_invasion_boss'); break;
      case 'shadow_invasion_boss': setPhase('epic_transition'); break;
      case 'epic_transition': onComplete(); break;
      default: break;
    }
  };

  const getRaceSpecificAwakening = (race: string, name: string, lang: 'ru' | 'en') => {
    if (lang === 'en') {
       return [
          "The Rift shattered the sky...",
          "Ancient Etheria trembled...",
          "We have waited centuries for hope.",
          `Awaken, ${name}. You are chosen to mend this world.`
       ];
    }
    
    // Russian specific lore based on race
    switch(race) {
      case 'High Elf':
      case 'Elf':
      case 'Wood Elf':
        return [
          "Парящий осколок Аурелиона медленно падает...",
          "Кристалл древних эльфов теряет свет...",
          "Время на исходе. Если он погаснет, мы упадем в Бездну.",
          `Проснись, ${name}. Ты — последняя искра надежды.`
        ];
      case 'Ogre':
      case 'Troll':
      case 'Barbarian':
        return [
          "Запах гари и крови...",
          "Битва с теневыми тварями в Кровавых Клыках окончена...",
          "Твой народ понес тяжелые потери.",
          `Вставай, ${name}. Твой топор еще не остыл.`
        ];
      case 'Dwarf':
        return [
          "Глубоко в Каменном Сердце тьма поглотила древние шахты...",
          "Своды рушатся, огонь кузниц гаснет...",
          "Нужно выбираться на поверхность, пока не стало поздно.",
          `Очнись, ${name}. Осколки мироздания ждут твоего молота.`
        ];
      case 'Dragonborn':
        return [
          "Ветер воет в гигантских костях Дракара...",
          "Древняя кровь бурлит в твоих венах.",
          "Первородное пламя жаждет вырваться на волю.",
          `Расправь крылья, ${name}. Разлом ждет твоего гнева.`
        ];
      case 'Moon Spirit':
        return [
          "В лесах Сильфари тихо шепчут светлячки...",
          "Ты — лишь эфирная мысль на грани сна и яви.",
          "Твоя душа ищет сосуд, чтобы прикоснуться к этому миру.",
          `Воплотись, ${name}. Свет серебряной луны осветит твой путь.`
        ];
      case 'Mechanical Construct':
        return [
          "Система перегружена... Критический сбой Технариума...",
          "Обнаружено вторжение аномалии класса 'Разлом'.",
          "Протоколы защиты активированы. Ремонтные подсистемы запущены.",
          `Питание восстановлено. Модуль ${name} готов к работе.`
        ];
      case 'Dark Elf':
      case 'Summoner':
        return [
          "В подземных сводах Нексуса тьма шепчет сладкие обещания...",
          "Разлом источает силу, перед которой невозможно устоять.",
          "Магия бездны струится по твоим рукам.",
          `Вставай, ${name}. Поглоти их слабость.`
        ];
      default: // Human / Generic
        return [
          "Разлом расколол небо над Серебряными Лугами...",
          "Старая часовня разрушена, алтарь разбит...",
          "Мы ждали надежду долгие столетия.",
          `Проснись, ${name}. Ты избран залатать этот мир.`
        ];
    }
  };

  if (phase === 'awakening') {
    const texts = getRaceSpecificAwakening(character.race, character.name, language);
    const currentText = texts[textStage] || "";
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-5xl font-serif text-white text-center px-4 leading-relaxed animate-pulse tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
           {currentText}
        </h1>
        <button 
           onClick={onComplete}
           className="absolute bottom-10 right-10 flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase font-mono text-xs tracking-widest"
        >
          {language === 'ru' ? 'Пропустить' : 'Skip'} <SkipForward className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
       {/* Background */}
       <div 
         className={`absolute inset-0 bg-cover bg-center transition-all duration-[3000ms] ${phase === 'epic_transition' ? 'scale-110' : 'scale-100'}`}
         style={{ 
             backgroundImage: phase === 'epic_transition' 
                ? "url('https://images.unsplash.com/photo-1614210408544-7f1dfa832f05?q=80&w=1920&auto=format&fit=crop')"
                : "url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1920&auto=format&fit=crop')",
             opacity: 0.4
         }}
       />
       <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/60 to-slate-950/90 pointer-events-none" />

       {/* Top Status */}
       <div className="relative z-10 w-full p-6 flex justify-between items-start pointer-events-none drop-shadow-md">
          <div className="backdrop-blur-sm bg-slate-900/40 border border-slate-700/50 p-3 rounded-lg flex items-center gap-4">
             <div className="w-12 h-12 rounded-full border-2 border-amber-500/50 bg-slate-800 flex items-center justify-center font-serif text-xl font-bold text-amber-500">
               {character.level}
             </div>
             <div>
               <div className="text-sm font-bold text-white tracking-widest uppercase">{character.name}</div>
               <div className="text-[10px] text-amber-500/80 font-mono">
                  {character.race} • {character.class}
               </div>
               <div className="w-full bg-slate-950 rounded-full h-1 mt-1 border border-slate-800">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
               </div>
             </div>
          </div>
          
          <button 
             onClick={onComplete}
             className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700 hover:bg-slate-800 hover:text-white text-slate-400 transition-colors uppercase font-mono text-[10px] tracking-widest backdrop-blur-sm shadow-lg"
          >
            {language === 'ru' ? 'Пропустить пролог' : 'Skip Prologue'} <SkipForward className="w-3 h-3" />
          </button>
       </div>

       {/* Central Overlay */}
       <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
          
          {phase === 'quest1_awaken' && (
             <div className="animate-fade-in backdrop-blur-md bg-slate-900/60 border border-slate-700 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <Compass className="w-12 h-12 text-slate-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-serif text-white mb-2">
                   {language === 'ru' ? 'Квест 1: Пробуждение' : 'Quest 1: Awakening'}
                </h2>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                   {language === 'ru' 
                     ? 'Вы очнулись посреди разрушений. Воздух пропитан остаточной маной. Возьмите своё первое оружие.'
                     : 'You awake amidst a ruined altar. The air is thick with residual mana. Try to look around and take your first steps in this new world.'}
                </p>
                <button 
                  onClick={handleNextPhase}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full uppercase tracking-widest text-xs transition-colors flex items-center gap-2 mx-auto shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                >
                   {language === 'ru' ? 'Взять экипировку' : 'Take Gear'} <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          )}

          {phase === 'quest2_light' && (
             <div className="animate-fade-in backdrop-blur-md bg-slate-900/60 border border-amber-900/50 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                <div className="w-12 h-12 border-2 border-amber-500/50 rounded flex items-center justify-center mx-auto mb-4 rotate-45 bg-slate-800">
                   <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                </div>
                <h2 className="text-2xl font-serif text-white mb-2">
                   {language === 'ru' ? 'Квест 2: Первый Свет' : 'Quest 2: First Light'}
                </h2>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                   {language === 'ru' 
                     ? 'Вам путь преграждают Теневые Сущности. Изучите базовый бой и активируйте ближайший Путевой Камень.'
                     : 'Path is blocked by Shadows. Learn basic combat and activate the waystone.'}
                </p>
                <button 
                  onClick={handleNextPhase}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3 px-8 rounded-full uppercase tracking-widest text-xs transition-colors mx-auto shadow-[0_0_15px_rgba(217,119,6,0.5)]"
                >
                   {language === 'ru' ? 'Сразиться и активировать' : 'Fight & Activate'}
                </button>
             </div>
          )}

          {phase === 'quest3_guardian' && (
             <div className="animate-fade-in backdrop-blur-md bg-slate-900/60 border border-emerald-900/50 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <Sparkles className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-serif text-white mb-2">
                   {language === 'ru' ? 'Квест 3: Помощь стражу' : 'Quest 3: Guardian Help'}
                </h2>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                   {language === 'ru' 
                     ? 'Вы нашли раненого Хранителя Этерии. Защитите его от волны мобов и соберите 5 Светящихся Лепестков для его исцеления.'
                     : 'You found a wounded Guardian. Protect him and gather glowing petals.'}
                </p>
                <button 
                  onClick={handleNextPhase}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full uppercase tracking-widest text-xs transition-colors mx-auto shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                >
                   {language === 'ru' ? 'Собрать лепестки' : 'Gather Petals'}
                </button>
             </div>
          )}

          {phase === 'quest4_rift' && (
             <div className="animate-fade-in backdrop-blur-md bg-slate-900/60 border border-purple-900/50 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                <Gem className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-serif text-white mb-2">
                   {language === 'ru' ? 'Квест 4: След Разлома' : 'Quest 4: Rift Trace'}
                </h2>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                   {language === 'ru' 
                     ? 'Малый Разлом источает скверну. Используйте энергию Хранителя, чтобы закрыть его. Это определит вашу первую склонность к Свету, Балансу или Тьме.'
                     : 'A small rift leaks corruption. Use guardian energy to close it.'}
                </p>
                <div className="flex flex-col gap-3 justify-center">
                   <button onClick={handleNextPhase} className="bg-slate-800 hover:bg-slate-700 border border-purple-500/50 text-white font-bold py-2.5 px-8 rounded-full uppercase tracking-widest text-xs transition-colors">
                      {language === 'ru' ? '[Свет] Исцелить землю' : '[Light] Heal Land'}
                   </button>
                   <button onClick={handleNextPhase} className="bg-slate-800 hover:bg-slate-700 border border-amber-500/50 text-white font-bold py-2.5 px-8 rounded-full uppercase tracking-widest text-xs transition-colors">
                      {language === 'ru' ? '[Баланс] Поглотить ману' : '[Balance] Absorb'}
                   </button>
                </div>
             </div>
          )}

          {phase === 'quest5_village' && (
             <div className="animate-fade-in backdrop-blur-md bg-slate-900/60 border border-sky-900/50 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(14,165,233,0.2)]">
                <Map className="w-12 h-12 text-sky-400 mx-auto mb-4" />
                <h2 className="text-2xl font-serif text-white mb-2">
                   {language === 'ru' ? 'Квест 5: Дорога к деревне' : 'Quest 5: Road to Village'}
                </h2>
                <p className="text-slate-300 text-sm mb-8 leading-relaxed">
                   {language === 'ru' 
                     ? 'Путь открыт! Вы подходите к стартовому хабу, спасая по пути застрявший караван торговцев. Здесь вы завершите выбор класса.'
                     : 'The path is open! Save a caravan on your way to the starting hub.'}
                </p>
                <button 
                  onClick={handleNextPhase}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full uppercase tracking-widest text-xs transition-colors mx-auto shadow-[0_0_15px_rgba(14,165,233,0.5)]"
                >
                   {language === 'ru' ? 'Прибыть в поселение' : 'Enter Settlement'}
                </button>
             </div>
          )}

          {phase === 'shadow_invasion_defend' && (
             <div className="animate-fade-in backdrop-blur-md bg-slate-900/60 border border-rose-900/50 p-8 rounded-2xl max-w-lg shadow-[0_0_50px_rgba(244,63,94,0.3)]">
                <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-serif text-rose-400 mb-2 uppercase tracking-wider font-black">
                   {language === 'ru' ? 'СОБЫТИЕ: Вторжение Теней' : 'EVENT: Shadow Invasion'}
                </h2>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                   {language === 'ru' 
                     ? 'В небе появилась гигантская трещина! Теневые существа вылезают со всех сторон. Зачистите волны врагов и защитите светящиеся кристаллы!'
                     : 'A massive rift appeared! Defend the crystals from waves of shadow creatures!'}
                </p>
                <div className="mb-6 flex justify-center items-center gap-2">
                   <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
                   <span className="text-xs font-mono text-rose-400">Public Event Joined</span>
                </div>
                <button 
                  onClick={handleNextPhase}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-8 rounded-full uppercase tracking-widest text-xs transition-colors mx-auto shadow-[0_0_15px_rgba(244,63,94,0.5)] flex items-center gap-2"
                >
                   <Flame className="w-4 h-4" /> {language === 'ru' ? 'Отбивать волны' : 'Defend Waves'}
                </button>
             </div>
          )}

          {phase === 'shadow_invasion_boss' && (
             <div className="animate-fade-in backdrop-blur-md bg-black/80 border-2 border-red-700/80 p-8 rounded-2xl max-w-lg shadow-[0_0_80px_rgba(220,38,38,0.6)]">
                <Flame className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-serif text-white mb-2 uppercase tracking-widest">
                   {language === 'ru' ? 'Малый Теневой Страж' : 'Lesser Shadow Guardian'}
                </h2>
                <p className="text-red-300 uppercase text-xs mb-8 tracking-widest font-mono">
                   {language === 'ru' 
                     ? 'Из Разлома вышел огромный Босс!'
                     : 'A giant Boss emerged from the Rift!'}
                </p>
                <div className="w-full bg-slate-900 h-2 rounded-full mb-8 border border-slate-700">
                    <div className="bg-gradient-to-r from-red-700 to-red-400 h-full rounded-full" style={{ width: '40%' }} />
                </div>
                <button 
                  onClick={handleNextPhase}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-12 rounded-full uppercase tracking-widest text-sm transition-colors flex items-center gap-3 mx-auto shadow-[0_0_25px_rgba(220,38,38,0.8)]"
                >
                   {language === 'ru' ? 'Коллективный удар!' : 'Strike Together!'}
                </button>
             </div>
          )}

          {phase === 'epic_transition' && (
             <div className="animate-fade-in text-center max-w-2xl px-6">
                <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] font-black uppercase tracking-widest">
                   {language === 'ru' ? 'Этерия' : 'Etheria'}
                </h1>
                <p className="text-xl md:text-2xl text-slate-200 mb-10 drop-shadow-md font-medium">
                   {language === 'ru' ? 'Разорванный Горизонт ждет твоего решения.' : 'The Shattered Horizon awaits your resolve.'}
                </p>
                <p className="text-amber-400 text-xs font-mono uppercase tracking-widest drop-shadow" style={{textShadow: '0 0 10px rgba(245, 158, 11, 0.5)'}}>
                   {language === 'ru' ? 'Награда получена: Ездовой Питомец' : 'Reward: Mount Acquired'}
                </p>
                <br/>
                <button 
                  onClick={onComplete}
                  className="bg-white hover:bg-slate-200 text-slate-950 font-black py-4 px-12 rounded-full uppercase tracking-[0.2em] text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.7)] mt-4"
                >
                   {language === 'ru' ? 'Войти в Открытый Мир' : 'Enter Open World'}
                </button>
             </div>
          )}

       </div>

       {/* Hints Overlay */}
       {(phase !== 'epic_transition' && phase !== 'shadow_invasion_defend' && phase !== 'shadow_invasion_boss') && (
       <div className="relative z-10 w-full p-4 flex justify-center pointer-events-none">
          <div className="text-center">
             <div className="text-xs text-slate-400 font-mono tracking-widest uppercase mb-1">
               {language === 'ru' ? 'Отслеживание сюжета' : 'Story Tracking'}
             </div>
          </div>
       </div>
       )}
    </div>
  );
}

