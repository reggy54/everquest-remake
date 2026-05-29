import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { X, Settings, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import { ChatMessage, PlayerCharacter } from '../types';

interface ClassicRPChatProps {
  chatMessages: ChatMessage[];
  onSendMessage: (msg: string, channel: ChatMessage['channel']) => void;
  character: PlayerCharacter;
}

type TabType = 'Say' | 'RP' | 'Party' | 'Guild' | 'World' | 'System';

export default function ClassicRPChat({ chatMessages, onSendMessage, character }: ClassicRPChatProps) {
  const [activeTab, setActiveTab] = useState<TabType>('RP');
  const [inputText, setInputText] = useState('');
  const [rpMode, setRpMode] = useState(true);
  const [fontSize, setFontSize] = useState<11 | 12 | 14 | 16>(12);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    let text = inputText;
    // Auto-RP formatting if enabled and in Say channel
    if (rpMode && activeTab === 'Say' && !text.startsWith('*') && !text.startsWith('**')) {
      text = `говорит: "${text}"`;
    }

    onSendMessage(text, activeTab);
    setInputText('');
  };

  const filteredMessages = chatMessages.filter(msg => {
    if (activeTab === 'Say') return ['Say', 'OOC', 'Shout', 'System'].includes(msg.channel);
    if (activeTab === 'RP') return ['Say', 'RP', 'System'].includes(msg.channel) || (msg.text.includes('*') || msg.text.includes('говорит:'));
    if (activeTab === 'World') return true;
    return msg.channel === activeTab || msg.channel === 'System';
  });

  const renderMessageText = (text: string) => {
    // RP formatting parser
    // **bold** -> Strong Emotion
    // *italic* -> Action
    // "quotes" -> Speech
    
    let parts = text.split(/(\*\*.*?\*\*|\*.*?\*|".*?")/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold text-amber-500 drop-shadow-sm">{part.slice(2, -2)}</span>;
      } else if (part.startsWith('*') && part.endsWith('*')) {
        return <span key={i} className="italic text-slate-400">{part}</span>;
      } else if (part.startsWith('"') && part.endsWith('"')) {
        return <span key={i} className="text-white">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const tabs: {id: TabType, color: string, label: string}[] = [
    { id: 'Say', color: 'text-white border-white', label: 'Say' },
    { id: 'RP', color: 'text-amber-400 border-amber-400', label: 'RP' },
    { id: 'Party', color: 'text-blue-400 border-blue-400', label: 'Party' },
    { id: 'Guild', color: 'text-emerald-400 border-emerald-400', label: 'Guild' },
    { id: 'World', color: 'text-orange-400 border-orange-400', label: 'World' },
    { id: 'System', color: 'text-slate-400 border-slate-400', label: 'System' }
  ];

  return (
    <div className="flex-1 w-full max-w-[1200px] mx-auto h-[600px] relative shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-[3px] border-[#3a2c20] rounded-sm flex flex-col font-serif select-none" style={{ backgroundColor: 'rgba(20, 20, 20, 0.95)' }}>
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')] opacity-40 pointer-events-none rounded-sm" />
      
      {/* Heavy Wood/Leather Header */}
      <div className="h-12 bg-gradient-to-r from-[#2a1f18] via-[#3a2c20] to-[#2a1f18] border-b-[2px] border-[#5c4a3d] flex items-center justify-between px-4 relative z-10">
        <div className="flex gap-2">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
               className={`text-xs md:text-sm px-3 py-1 font-bold uppercase transition-all ${
                 activeTab === tab.id 
                 ? `${tab.color} bg-black/60 border-b-2 shadow-inner` 
                 : 'text-slate-500 hover:text-slate-300'
               }`}
               style={{ fontFamily: 'Friz Quadrata, serif' }}
             >
               {tab.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={(e) => { e.stopPropagation(); setRpMode(!rpMode); }}
             className={`text-[10px] px-2 py-1 font-bold rounded border ${rpMode ? 'border-amber-500 text-amber-500 bg-amber-900/30' : 'border-slate-700 text-slate-500'}`}
             title="Auto-RP Formatter"
           >
             RP-MODE
           </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 custom-scrollbar relative z-10 flex flex-col items-start select-text" 
           style={{ fontSize: `${fontSize}px`, textShadow: '1px 1px 0 #000' }}>
         {filteredMessages.length === 0 ? (
           <div className="text-slate-600 italic self-center mt-10">No messages in this realm...</div>
         ) : (
           filteredMessages.map(msg => {
             // Chat colors
             let channelColor = 'text-slate-300';
             let nameColor = 'text-white';
             
             if (msg.channel === 'System') channelColor = 'text-yellow-200';
             else if (msg.channel === 'RP') channelColor = 'text-amber-200';
             else if (msg.channel === 'Party') channelColor = 'text-blue-300';
             else if (msg.channel === 'Guild') channelColor = 'text-emerald-400';
             else if (msg.channel === 'Say') channelColor = 'text-white';
             else if (msg.channel === 'World' || msg.channel === 'Shout') channelColor = 'text-orange-400';
             
             // High RP rating or NPC check (Mocking NPC check if sender is part of known NPCs or system)
             if (['Trader Mathok', 'Captain Tillin', 'Old Man Marcus'].includes(msg.sender)) {
                nameColor = 'text-cyan-300 font-bold';
             } else if (msg.sender === character.name) {
                nameColor = 'text-amber-400 font-bold';
             }

             return (
               <div key={msg.id} className="w-full break-words leading-tight hover:bg-white/5 py-1 px-2 rounded transition-colors">
                 {msg.channel !== 'Say' && msg.channel !== 'RP' && (
                    <span className={`${channelColor} mr-1`}>[{msg.channel === 'World' ? '1. General' : msg.channel}]</span>
                 )}
                 <span className={`${nameColor} mr-1 cursor-pointer hover:underline`}>[{msg.sender}]:</span>
                 <span className={channelColor}>{renderMessageText(msg.text)}</span>
               </div>
             )
           })
         )}
         <div ref={chatEndRef} />
      </div>

      {/* Font Size controls */}
      <div className="absolute right-4 top-16 flex flex-col gap-1 opacity-20 hover:opacity-100 transition-opacity p-2 bg-black/80 rounded border border-[#5c4a3d] z-20">
          <button onClick={() => setFontSize(Math.min(24, fontSize + 2) as any)} className="text-slate-400 hover:text-white"><ChevronUp size={16} /></button>
          <span className="text-[12px] text-amber-500 font-bold text-center">{fontSize}</span>
          <button onClick={() => setFontSize(Math.max(10, fontSize - 2) as any)} className="text-slate-400 hover:text-white"><ChevronDown size={16} /></button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="relative z-10 bg-black/60 border-t-[2px] border-[#3a2c20] p-3 flex items-center gap-3">
         <div className={`px-2 text-sm font-bold ${tabs.find(t => t.id === activeTab)?.color} uppercase`}>
            {activeTab}
         </div>
         <input
           type="text"
           value={inputText}
           onChange={e => setInputText(e.target.value)}
           placeholder={rpMode && activeTab === 'Say' ? "Enter text (auto-RP on, use * for actions)..." : "Press enter to chat..."}
           className="flex-1 bg-transparent text-slate-200 text-sm md:text-base focus:outline-none placeholder-slate-600 font-sans"
         />
      </form>

      {/* Leather Corners */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-[4px] border-l-[4px] border-[#a68c70] pointer-events-none rounded-tl-sm shadow-md z-20" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-[4px] border-r-[4px] border-[#a68c70] pointer-events-none rounded-tr-sm shadow-md z-20" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-[4px] border-l-[4px] border-[#a68c70] pointer-events-none rounded-bl-sm shadow-md z-20" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-[4px] border-r-[4px] border-[#a68c70] pointer-events-none rounded-br-sm shadow-md z-20" />
    </div>
  );
}
