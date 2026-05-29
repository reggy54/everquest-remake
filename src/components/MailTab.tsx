import React, { useState } from 'react';
import { PlayerCharacter } from '../types';
import { Mail, Search, Inbox, Send, Pencil, PackageOpen, Coins } from 'lucide-react';

interface MailTabProps {
  character: PlayerCharacter;
  language: 'ru' | 'en';
}

export default function MailTab({ character, language }: MailTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'send'>('inbox');
  
  return (
    <div className="w-full h-full p-2 animate-fade-in font-sans select-none pb-[120px]">
       
       <div className="max-w-[1000px] mx-auto bg-[#1a1714] border-[4px] border-[#3d2e1f] shadow-[0_20px_60px_rgba(0,0,0,1)] rounded-lg relative flex flex-col h-[700px] overflow-hidden">
          
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10 pointer-events-none mix-blend-overlay" />
          
          {/* Top Title Bar */}
          <div className="h-10 bg-gradient-to-b from-[#2a1c12] to-[#1a1714] border-b border-[#3d2e1f] z-20 flex justify-center items-center relative">
             <h2 className="text-[#d8c3a5] font-bold text-lg uppercase tracking-widest drop-shadow-[1px_1px_0_#000]" style={{ fontFamily: 'Friz Quadrata, serif' }}>
                {language === 'ru' ? 'Почта Азерота (Этерии)' : 'Mailbox'}
             </h2>
             <div className="absolute left-4 top-2 flex gap-2">
                <button 
                  onClick={() => setActiveSubTab('inbox')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded border transition-all ${activeSubTab === 'inbox' ? 'bg-[#3d2e1f] border-[#8a6b46] text-[#e6d5b8]' : 'bg-[#1a1714] border-[#2b1f14] text-[#8c7a6b] hover:text-[#c4b59d]'}`}
                >
                  <Inbox size={14} />
                  {language === 'ru' ? 'Входящие' : 'Inbox'}
                </button>
                <button 
                  onClick={() => setActiveSubTab('send')}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase rounded border transition-all ${activeSubTab === 'send' ? 'bg-[#3d2e1f] border-[#8a6b46] text-[#e6d5b8]' : 'bg-[#1a1714] border-[#2b1f14] text-[#8c7a6b] hover:text-[#c4b59d]'}`}
                >
                  <Pencil size={14} />
                  {language === 'ru' ? 'Отправить' : 'Send'}
                </button>
             </div>
          </div>

          <div className="flex-1 flex w-full relative z-10">
             {/* Left - Mail List */}
             <div className="w-[40%] border-r border-[#3d2e1f] bg-[#14120f] flex flex-col">
                <div className="p-3 border-b border-[#2b1f14]">
                   <div className="relative">
                      <input 
                         type="text" 
                         placeholder={language === 'ru' ? 'Поиск писем...' : 'Search mail...'}
                         className="w-full bg-[#0a0907] border border-[#2b1f14] text-[#c4b59d] text-xs py-1.5 pl-7 pr-2 rounded focus:outline-none focus:border-[#5c4a3d]"
                      />
                      <Search size={12} className="absolute left-2.5 top-2 text-[#5c4a3d]" />
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                   {/* Dummy Mails */}
                   <div className="p-2 border border-[#3d2e1f] bg-[#1a1714] hover:bg-[#25201c] cursor-pointer rounded transition-all flex items-start gap-3">
                      <div className="mt-0.5 relative">
                         <Mail size={18} className="text-[#d8c3a5]" />
                         <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#1a1714]" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <div className="text-sm font-bold text-[#e6d5b8] truncate">Аукцион: Успешная продажа</div>
                         <div className="text-xs text-[#8c7a6b]">От: Аукционный Дом</div>
                      </div>
                      <div className="text-[10px] text-[#5c4a3d]">2 дн.</div>
                   </div>
                   
                   <div className="p-2 border border-[#2b1f14] bg-[#14120f] hover:bg-[#25201c] cursor-pointer rounded transition-all flex items-start gap-3 opacity-70">
                      <div className="mt-0.5 relative">
                         <PackageOpen size={18} className="text-[#8c7a6b]" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <div className="text-sm font-bold text-[#c4b59d] truncate">Возврат предметов</div>
                         <div className="text-xs text-[#5c4a3d]">От: Почтмейстер</div>
                      </div>
                      <div className="text-[10px] text-[#5c4a3d]">14 дн.</div>
                   </div>
                </div>
             </div>

             {/* Right - Mail Content Window */}
             <div className="w-[60%] bg-[#1a1714] relative">
                <div className="absolute inset-0 bg-[#f4e4bc] opacity-5 pointer-events-none mix-blend-overlay" />
                
                <div className="p-6 h-full flex flex-col font-serif">
                   {/* Letter Header */}
                   <div className="flex items-center gap-4 border-b border-[#3d2e1f] pb-4 mb-4">
                      <div className="w-12 h-12 rounded bg-[#0a0907] border-2 border-[#5c4a3d] flex items-center justify-center shadow-inner">
                         <Mail size={24} className="text-[#a68c70]" />
                      </div>
                      <div>
                         <h3 className="text-xl font-bold text-[#d8c3a5]">Аукцион: Успешная продажа</h3>
                         <div className="text-sm text-[#8c7a6b]">От: <span className="text-[#a68c70]">Аукционный Дом Этерии</span></div>
                      </div>
                   </div>
                   
                   {/* Letter Body */}
                   <div className="flex-1 text-[#c4b59d] text-sm leading-relaxed overflow-y-auto custom-scrollbar italic pr-2">
                      Уважаемый Клиент,<br/><br/>
                      Ваш лот "Легендарный Клинок Разлома" был успешно выкуплен на аукционе.
                      Денежные средства были переведены на ваш счет и прикреплены к этому письму.<br/><br/>
                      Сумма продажи: 250g 00s 00c<br/>
                      Комиссия (5%): 12g 50s 00c<br/>
                      Итого: 237g 50s 00c<br/><br/>
                      Спасибо, что пользуетесь услугами Аукционного Дома!
                   </div>
                   
                   {/* Attachments */}
                   <div className="mt-4 p-3 bg-[#14120f] border border-[#2b1f14] rounded flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 border border-[#3d2e1f] rounded bg-[#0a0907] flex items-center justify-center">
                            <span className="text-[#ffd700] text-xs font-bold drop-shadow-[0_0_2px_#000] flex items-center"><Coins size={12} className="mr-0.5" /> 237g</span>
                         </div>
                         <span className="text-xs text-[#8c7a6b]">Прикрепленные средства</span>
                      </div>
                      
                      <button className="bg-gradient-to-b from-[#5c4a3d] to-[#3d2e1f] border border-[#8a6b46] hover:brightness-125 text-[#e6d5b8] px-4 py-1.5 text-xs font-bold uppercase rounded shadow-lg">
                         {language === 'ru' ? 'Забрать всё' : 'Loot All'}
                      </button>
                   </div>
                   
                </div>
             </div>
          </div>
          
       </div>
       
    </div>
  );
}
