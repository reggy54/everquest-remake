import React, { useState } from 'react';
import { X, Sparkles, MessageSquare } from 'lucide-react';

export interface DialogOption {
  id: string;
  text: string;
  tone?: 'Respectful' | 'Rude' | 'Cunning' | 'Neutral';
  action?: () => void;
}

interface NPCDialogWindowProps {
  npc: {
    id: string;
    name: string;
    role: string;
    emotion?: 'Neutral' | 'Happy' | 'Sad' | 'Angry';
    storyImportant?: boolean;
    portraitUrl?: string;
  };
  text: string;
  options: DialogOption[];
  onClose: () => void;
}

export default function NPCDialogWindow({ npc, text, options, onClose }: NPCDialogWindowProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Background animation classes based on importance
  const getBgAnimation = () => {
    if (!npc.storyImportant) return '';
    if (npc.emotion === 'Angry') return 'bg-[url("https://media.giphy.com/media/xT0BKVl30nE1Usw7u8/giphy.gif")] opacity-20'; // fire-ish placeholder
    if (npc.emotion === 'Sad') return 'bg-blue-900/40 animate-pulse'; 
    return 'bg-amber-900/30 animate-pulse';
  };

  const getEmotionEmoji = () => {
    switch (npc.emotion) {
      case 'Happy': return '😊';
      case 'Sad': return '😔';
      case 'Angry': return '😡';
      default: return '😐';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in select-none">
      
      {/* Background Story Animation Ring */}
      {npc.storyImportant && (
        <div className={`absolute inset-0 pointer-events-none mix-blend-overlay ${getBgAnimation()}`} />
      )}

      {/* Main Dialog Container */}
      <div className="relative flex max-w-4xl w-full h-[500px] shadow-[0_0_50px_rgba(0,0,0,1)] rounded pointer-events-auto">
         
         {/* Close Button Top Right outside */}
         <button 
           onClick={onClose} 
           className="absolute -top-4 -right-4 w-10 h-10 bg-black border-2 border-[#ffb600] rounded-full text-[#ffb600] hover:bg-[#ffb600] hover:text-black hover:scale-110 flex items-center justify-center transition-all z-20 shadow-lg"
         >
           <X size={20} className="stroke-[3]" />
         </button>

         {/* Left Side: Portrait */}
         <div className={`w-[300px] h-full border-[4px] relative flex flex-col items-center justify-center rounded-l z-10 transition-all ${
            npc.storyImportant 
              ? 'bg-[#151009] border-[#ffb600] shadow-[inset_0_0_40px_rgba(245,158,11,0.2),0_0_25px_rgba(245,158,11,0.15)] animate-pulse-subtle' 
              : 'bg-[#111] border-[#443322] shadow-[inset_0_0_30px_rgba(0,0,0,1)]'
         }`}>
            {/* Main story badge banner */}
            {npc.storyImportant && (
               <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 text-slate-950 font-sans font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded shadow-md border border-amber-300 pointer-events-none whitespace-nowrap z-30">
                  📜 ОСНОВНОЙ СЮЖЕТ
               </div>
            )}

            {/* Metal Corners */}
            <div className={`absolute top-0 left-0 w-4 h-4 border-t-[4px] border-l-[4px] m-1 ${npc.storyImportant ? 'border-[#ffd700]' : 'border-[#a68c70]'}`} />
            <div className={`absolute top-0 right-0 w-4 h-4 border-t-[4px] border-r-[4px] m-1 ${npc.storyImportant ? 'border-[#ffd700]' : 'border-[#a68c70]'}`} />
            <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-[4px] border-l-[4px] m-1 ${npc.storyImportant ? 'border-[#ffd700]' : 'border-[#a68c70]'}`} />
            <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-[4px] border-r-[4px] m-1 ${npc.storyImportant ? 'border-[#ffd700]' : 'border-[#a68c70]'}`} />

            <div className={`w-48 h-48 rounded-full border-[6px] shadow-[0_10px_20px_rgba(0,0,0,0.8)] overflow-hidden bg-slate-800 relative z-10 flex items-center justify-center group text-7xl transition-all ${
               npc.storyImportant 
                 ? 'border-[#ffb600] shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-pulse' 
                 : 'border-[#3a2c20]'
            }`}>
               {npc.portraitUrl ? (
                 <img src={npc.portraitUrl} alt={npc.name} className="w-full h-full object-cover" />
               ) : (
                 <span className="drop-shadow-lg">{getEmotionEmoji()}</span>
               )}
               {/* Inner Shadow overlay */}
               <div className="absolute inset-0 ring-inset ring-4 ring-black/50 pointer-events-none rounded-full" />
            </div>

            <div className={`mt-6 text-center px-4 relative z-10 bg-black/60 p-2 border rounded shadow transition-all ${
               npc.storyImportant ? 'border-[#ffb600]' : 'border-[#3a2c20]'
            }`}>
               <h2 
                 className={`text-2xl font-bold drop-shadow-[2px_2px_0_#000] ${npc.storyImportant ? 'text-amber-400' : 'text-[#ffb600]'}`} 
                 style={{ fontFamily: 'Friz Quadrata, serif' }}
               >
                 {npc.name}
               </h2>
               <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-widest">{npc.role}</p>
            </div>
         </div>

         {/* Right Side: Dialog Text on Parchment */}
         <div className="flex-1 h-full bg-[#f4e4bc] border-y-[4px] border-r-[4px] border-[#443322] relative rounded-r rounded-bl-none overflow-hidden flex flex-col shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
            
            {/* Parchment Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-80 pointer-events-none mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#e8d5a5]/20 via-transparent to-[#c0a060]/50 pointer-events-none" />

            {/* Conversation Text */}
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative z-10 text-[#302010] font-serif text-lg leading-relaxed text-shadow-sm">
               {/* Decorative Quote Mark */}
               <span className="text-6xl text-[#b09060] absolute top-4 left-4 opacity-30 pointer-events-none font-serif">"</span>
               
               <div className="relative z-10 mt-2 px-6">
                 {/* Formatting the text: split into paragraphs */}
                 {text.split('\\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 text-justify font-serif font-medium">{paragraph}</p>
                 ))}
               </div>
            </div>

            {/* Options List */}
            <div className="bg-[#1a1410] border-t-2 border-[#5c4a3d] p-6 relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.5)] flex flex-col max-h-[45%] overflow-y-auto">
               <h3 className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-2">
                 <MessageSquare size={12} /> Варианты ответа
               </h3>
               
               <div className="space-y-2">
                 {options.map((option) => (
                   <button
                     key={option.id}
                     onClick={() => {
                        setSelectedOption(option.id);
                        if (option.action) option.action();
                        // wait a tiny bit then close if it's a simple continue
                        if (!option.action || option.id === 'continue') {
                           setTimeout(onClose, 150);
                        }
                     }}
                     className={`w-full text-left p-3 border-2 transition-all flex items-start gap-3 ${
                       selectedOption === option.id 
                       ? 'bg-amber-900/40 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                       : 'bg-black/60 border-[#4a3a2a] text-slate-300 hover:border-amber-600 hover:text-white'
                     }`}
                   >
                     <span className="shrink-0 mt-0.5 text-amber-500">
                       {option.id === 'continue' ? '👉' : '🗣️'}
                     </span>
                     <div className="flex-1">
                        <span className="font-serif leading-tight drop-shadow-[1px_1px_0_#000]">{option.text}</span>
                        {option.tone && (
                           <span className={`block text-[10px] font-mono mt-1 uppercase font-bold ${
                              option.tone === 'Respectful' ? 'text-emerald-400' :
                              option.tone === 'Rude' ? 'text-red-400' :
                              option.tone === 'Cunning' ? 'text-purple-400' :
                              'text-blue-400'
                           }`}>
                             [{option.tone}]
                           </span>
                        )}
                     </div>
                   </button>
                 ))}
               </div>
            </div>
            
         </div>
      </div>
    </div>
  );
}
