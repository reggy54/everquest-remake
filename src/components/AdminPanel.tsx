import React, { useState } from 'react';
import { 
  Server, ShieldAlert, Users, Zap, Globe, Map as MapIcon, 
  Terminal, Search, Box, Database, MessageSquare, Plus, Activity, CloudRain
} from 'lucide-react';
import { PlayerCharacter as Character, Item } from '../types';

interface AdminPanelProps {
  user: { username: string; isAdmin: boolean };
  character: Character | null;
  saveCharacter: (c: Character) => void;
  triggerAlert: (msg: string, type: 'info'|'success'|'error'|'warning') => void;
  serverStateSettings: any;
  setServerStateSettings: (val: any) => void;
  fetchServerSettings: () => void;
  adminUsers: any[];
  setAdminUsers: (val: any[]) => void;
  adminAnnouncement: string;
  setAdminAnnouncement: (val: string) => void;
}

type AdminTab = 'dashboard' | 'players' | 'world' | 'logs' | 'map';

export default function AdminPanel({
  user, character, saveCharacter, triggerAlert,
  serverStateSettings, setServerStateSettings, fetchServerSettings,
  adminUsers, setAdminUsers, adminAnnouncement, setAdminAnnouncement
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const banUser = async (u: any) => {
    const actionText = u.banned ? 'РАЗБЛОКИРОВАТЬ' : 'ЗАБЛОКИРОВАТЬ';
    if (confirm(`Вы уверены, что хотите ${actionText} персонажа ${u.username}?`)) {
      try {
        const res = await fetch('/api/admin/user-ban', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u.username, ban: !u.banned })
        });
        if (res.ok) {
          triggerAlert(`Пользователь ${u.username} успешно обновлен!`, 'success');
          const r = await fetch('/api/admin/users');
          if (r.ok) {
            const d = await r.json();
            setAdminUsers(d.users || []);
          }
        } else {
          const errData = await res.json();
          triggerAlert(errData.error || 'Ошибка', 'error');
        }
      } catch (e) {
        triggerAlert('Ошибка соединения с базой.', 'error');
      }
    }
  };

  const applyServerSettings = async () => {
    try {
      const res = await fetch('/api/admin/server-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serverStateSettings)
      });
      if (res.ok) {
        triggerAlert('Параметры игрового мира успешно применены ко всем игрокам!', 'success');
        fetchServerSettings();
      }
    } catch (err) {
      triggerAlert('Ошибка сохранения параметров сервера.', 'error');
    }
  };

  const sendAnnouncement = async () => {
    if (!adminAnnouncement.trim()) return;
    try {
      const res = await fetch('/api/admin/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: adminAnnouncement.trim() })
      });
      if (res.ok) {
        setAdminAnnouncement('');
        triggerAlert('Объявление вещания разослано в игровой мир!', 'success');
      }
    } catch (err) {
      triggerAlert('Не удалось оправить глобальное объявление.', 'error');
    }
  };

  const clearChat = async () => {
    if (confirm('Очистить весь мировой чат?')) {
      try {
        const res = await fetch('/api/admin/clear-chat', { method: 'POST' });
        if (res.ok) {
          triggerAlert('Мировой чат успешно очищен!', 'success');
        }
      } catch (e) {
        triggerAlert('Не удалось очистить чат.', 'error');
      }
    }
  };

  const filteredUsers = adminUsers.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="w-full flex-col lg:flex-row flex gap-6 min-h-[600px] animate-fade-in text-gray-100">
      
      {/* Sidebar / GM Navigation */}
      <div className="w-full lg:w-1/4 xl:w-1/5 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 shrink-0 shadow-lg">
         <div className="text-center pb-4 mb-2 border-b border-slate-800">
            <div className="relative inline-block">
               <ShieldAlert className="w-12 h-12 text-blue-500 mx-auto mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
               <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping border border-red-900"></div>
            </div>
            <h2 className="font-serif text-lg font-black uppercase text-white tracking-widest drop-shadow-md">
              GM Console
            </h2>
            <div className="text-[10px] font-mono text-blue-400 mt-1 uppercase flex justify-center items-center gap-1">
               <Zap className="w-3 h-3" /> Root: {user.username}
            </div>
         </div>

         <div className="flex flex-col gap-1">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center justify-between p-2.5 rounded text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'dashboard' ? 'bg-blue-900/40 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
               <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Главная</span>
            </button>
            <button onClick={() => setActiveTab('players')} className={`flex items-center justify-between p-2.5 rounded text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'players' ? 'bg-blue-900/40 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
               <span className="flex items-center gap-2"><Users className="w-4 h-4" /> Игроки</span>
               <span className="bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">{adminUsers.length}</span>
            </button>
            <button onClick={() => setActiveTab('world')} className={`flex items-center justify-between p-2.5 rounded text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'world' ? 'bg-blue-900/40 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
               <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Мир и Ивенты</span>
            </button>
            <button onClick={() => setActiveTab('map')} className={`flex items-center justify-between p-2.5 rounded text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'map' ? 'bg-blue-900/40 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
               <span className="flex items-center gap-2"><MapIcon className="w-4 h-4" /> Live Map</span>
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
            <button onClick={() => setActiveTab('logs')} className={`flex items-center justify-between p-2.5 rounded text-xs font-bold uppercase transition-all tracking-wider ${activeTab === 'logs' ? 'bg-blue-900/40 text-blue-400 border border-blue-900/50' : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'}`}>
               <span className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Логи / Античит</span>
            </button>
         </div>

         <div className="mt-auto pt-6">
           <div className="bg-slate-950 p-3 rounded border border-slate-800 shadow-inner">
              <div className="text-[10px] text-slate-500 font-mono mb-2 uppercase flex items-center justify-between">
                 <span>AI Assistant (Beta)</span>
                 <span className="text-emerald-500 font-bold">Online</span>
              </div>
              <div className="flex bg-slate-900 rounded border border-slate-700">
                <input placeholder="Найти игрока, баг..." className="w-full bg-transparent text-[10px] p-2 focus:outline-none" />
                <button className="bg-blue-900/40 text-blue-400 hover:bg-blue-800 hover:text-white px-2 rounded-r border-l border-slate-700 transition-colors hidden sm:block"><Search className="w-3 h-3" /></button>
              </div>
           </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col gap-6">
         {/* Live Status Header */}
         <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-4 shadow-lg flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                <span className={`w-2 h-2 rounded-full ${serverStateSettings.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : serverStateSettings.status === 'event' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-300">Сервер: {serverStateSettings.status}</span>
              </div>
              <div className="text-xs font-mono text-slate-500 hidden sm:block">
                 UPTIME: 32D 14H 12M
              </div>
            </div>
            
            {/* Quick Macro Buttons */}
            <div className="flex gap-2">
               {/* Player Shadow Mode button */}
               <button className="bg-slate-800/80 hover:bg-purple-900/50 text-slate-400 hover:text-purple-400 border border-slate-700 hover:border-purple-800 p-2 rounded transition-colors hidden sm:flex items-center gap-2" title="Shadow Mode (Скрытное наблюдение)">
                  <Users className="w-4 h-4" /> <span className="text-[10px] font-mono uppercase font-bold">Shadow Mode</span>
               </button>
               <button onClick={clearChat} className="bg-slate-800/80 hover:bg-red-900/50 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-800 p-2 rounded transition-colors" title="Очистить Чат Штата">
                  <MessageSquare className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Content Tabs */}
         <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                 {/* Top Stats Cards */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                       <Database className="absolute -right-2 -bottom-2 w-16 h-16 text-slate-800 opacity-30 group-hover:opacity-50 transition-all group-hover:scale-110" />
                       <div className="text-xs text-slate-500 font-mono uppercase font-bold relative z-10">Игроки Онлайн</div>
                       <div className="text-3xl font-black text-white mt-1 relative z-10 flex items-center gap-2">
                          {adminUsers.filter(u => !u.banned).length} 
                          <span className="text-emerald-500 text-[10px] bg-emerald-950 px-1 py-0.5 rounded border border-emerald-900">+12%</span>
                       </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                       <Zap className="absolute -right-2 -bottom-2 w-16 h-16 text-slate-800 opacity-30 group-hover:opacity-50 transition-all group-hover:scale-110" />
                       <div className="text-xs text-slate-500 font-mono uppercase font-bold relative z-10">CPU Нагрузка</div>
                       <div className="text-3xl font-black text-emerald-400 mt-1 relative z-10">42%</div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                       <ShieldAlert className="absolute -right-2 -bottom-2 w-16 h-16 text-slate-800 opacity-30 group-hover:opacity-50 transition-all group-hover:scale-110" />
                       <div className="text-xs text-slate-500 font-mono uppercase font-bold relative z-10">Новые Жалобы</div>
                       <div className="text-3xl font-black text-amber-500 mt-1 relative z-10 flex items-center gap-2">
                          0
                       </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
                       <Box className="absolute -right-2 -bottom-2 w-16 h-16 text-slate-800 opacity-30 group-hover:opacity-50 transition-all group-hover:scale-110" />
                       <div className="text-xs text-slate-500 font-mono uppercase font-bold relative z-10">Всего аккаунтов</div>
                       <div className="text-3xl font-black text-white mt-1 relative z-10">{adminUsers.length}</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Announcement Tool */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
                       <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2 mb-4">
                         <Globe className="w-5 h-5 text-blue-500" /> Системное Оповещение
                       </h3>
                       <p className="text-[10px] text-slate-500 font-mono uppercase mb-2 line-clamp-2">Отправляет сообщение в центр экрана всем игрокам.</p>
                       <textarea 
                          value={adminAnnouncement}
                          onChange={(e) => setAdminAnnouncement(e.target.value)}
                          placeholder="Текст оповещения..."
                          className="flex-1 min-h-[100px] max-h-[150px] bg-slate-950 border border-slate-800 rounded p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 mb-4 resize-none custom-scrollbar"
                       />
                       <button onClick={sendAnnouncement} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                          Отправить BroadCast
                       </button>
                    </div>

                    {/* Quick Cheats (Developer only) */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
                       <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2 mb-4">
                         <Terminal className="w-5 h-5 text-amber-500" /> Быстрые Команды Творца
                       </h3>
                       <p className="text-[10px] text-slate-500 font-mono uppercase mb-4">GM-инструменты для активного персонажа ({character?.name || 'Нет'}).</p>
                       
                       <div className="grid grid-cols-2 gap-3 mt-auto">
                         <button onClick={() => {
                            if (!character) return;
                            saveCharacter({ ...character, gold: character.gold + 100000 });
                            triggerAlert('Выдано 100,000g', 'success');
                         }} className="bg-slate-950 hover:bg-slate-800 border border-amber-900/50 text-amber-500 font-mono text-xs py-3 px-2 rounded font-bold uppercase transition flex items-center justify-center gap-2">
                           <Plus className="w-4 h-4" /> +100k Золота
                         </button>
                         <button onClick={() => {
                            if (!character) return;
                            const maxLvl = 100;
                            saveCharacter({
                              ...character, level: maxLvl,
                              maxHp: 100 + maxLvl * 15, hp: 100 + maxLvl * 15,
                              maxMana: 80 + maxLvl * 12, mana: 80 + maxLvl * 12,
                              expToNextLevel: maxLvl * 9999
                            });
                            triggerAlert(`Уровень ${maxLvl}!`, 'success');
                         }} className="bg-slate-950 hover:bg-slate-800 border border-purple-900/50 text-purple-400 font-mono text-xs py-3 px-2 rounded font-bold uppercase transition flex items-center justify-center gap-2">
                           <Plus className="w-4 h-4" /> Max Level
                         </button>
                         <button onClick={() => {
                            if (!character) return;
                            const wep: Item = { id:`gm-wep-${Date.now()}`, name:'🌌 Астральный Клинок ГМа', slot:'primary', description:'Истребляет мгновенно. Дает полномочия Бога.', price:999999, rarity:'epic', stats:{str:9999, sta:9999, int:9999, wis:9999, agi:9999}};
                            const chest: Item = { id:`gm-chest-${Date.now()}`, name:'🛡️ Эгида Бессмертия ГМа', slot:'chest', description:'Полная неуязвимость.', price:999999, rarity:'epic', stats:{str:9999, sta:9999, int:9999, wis:9999, agi:9999}};
                            saveCharacter({ ...character, inventory: [...character.inventory, wep, chest] });
                            triggerAlert('GM Сет добавлен в инвентарь', 'success');
                         }} className="bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 text-red-400 font-mono text-xs py-3 px-2 rounded font-bold uppercase transition flex items-center justify-center gap-2 col-span-2 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                           <Zap className="w-4 h-4" /> Экипировать GM Сет
                         </button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* TAB: PLAYERS */}
            {activeTab === 'players' && (
               <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                     <h3 className="font-serif text-xl text-white font-bold">Управление Игроками</h3>
                     <div className="flex bg-slate-950 rounded-lg border border-slate-700 px-3 py-2 w-full sm:w-auto min-w-[250px] items-center">
                        <Search className="w-4 h-4 text-slate-500 mr-2" />
                        <input 
                           type="text" 
                           placeholder="Поиск по HWID, IP, Нику..." 
                           value={searchQuery}
                           onChange={e => setSearchQuery(e.target.value)}
                           className="bg-transparent border-none focus:outline-none text-xs text-white w-full"
                        />
                     </div>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4 font-bold">Аккаунт</th>
                              <th className="py-3 px-4 font-bold hidden md:table-cell">Последний IP</th>
                              <th className="py-3 px-4 font-bold">Роль</th>
                              <th className="py-3 px-4 font-bold">Статус</th>
                              <th className="py-3 px-4 font-bold text-right">Модерация</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm">
                           {filteredUsers.length === 0 && (
                              <tr>
                                 <td colSpan={5} className="py-12 text-center text-slate-500 font-mono text-xs">Нет результатов.</td>
                              </tr>
                           )}
                           {filteredUsers.map((u) => (
                              <tr key={u.username} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                                 <td className="py-3 px-4">
                                     <div className="text-white font-bold text-sm">{u.username}</div>
                                     <div className="text-[10px] text-slate-500 font-mono">HWID: a8f9...2c1{u.username.length}</div>
                                 </td>
                                 <td className="py-3 px-4 text-slate-400 font-mono text-[10px] hidden md:table-cell">192.168.1.{u.username.length*10}</td>
                                 <td className="py-3 px-4">
                                    {u.isAdmin ? <span className="bg-red-900/40 border border-red-900/50 text-red-500 text-[10px] px-2 py-0.5 rounded uppercase tracking-widest font-bold">Senior GM</span> 
                                               : <span className="text-slate-400 text-[10px] uppercase font-mono tracking-widest bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Player</span>}
                                 </td>
                                 <td className="py-3 px-4">
                                    {u.banned ? <span className="text-rose-500 text-xs font-bold font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>BANNED</span> 
                                              : <span className="text-emerald-500 text-xs font-bold font-mono flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>ONLINE</span>}
                                 </td>
                                 <td className="py-3 px-4 text-right space-x-2 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                    {/* Action icons mockup for GM */}
                                    <button className="bg-slate-800 hover:bg-blue-900/50 text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-800 p-1.5 rounded transition-colors" title="Открыть инвентарь">
                                       <Box className="w-3.5 h-3.5" />
                                    </button>
                                    <button className="bg-slate-800 hover:bg-indigo-900/50 text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-800 p-1.5 rounded transition-colors" title="Телепорт к игроку">
                                       <Zap className="w-3.5 h-3.5" />
                                    </button>

                                    {u.username !== 'Reggy' ? (
                                       <button 
                                          onClick={() => banUser(u)}
                                          className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all shadow-md ${u.banned ? 'bg-emerald-900 hover:bg-emerald-800 text-emerald-400 border border-emerald-700' : 'bg-rose-900 hover:bg-rose-800 text-rose-400 border border-rose-700'}`}
                                       >
                                          {u.banned ? 'Unban' : 'Ban / Kick'}
                                       </button>
                                    ) : (
                                       <span className="text-[10px] text-slate-600 font-mono py-1.5 inline-block w-20 text-center">IMMUNE</span>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* TAB: WORLD & EVENTS */}
            {activeTab === 'world' && (
              <div className="space-y-6">
                 {/* Server Status Settings */}
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                    <h3 className="font-serif text-xl text-white font-bold mb-4">Настройки Игрового Мира (Глобальные)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Статус Доступа</label>
                            <select 
                               value={serverStateSettings.status}
                               onChange={e => setServerStateSettings({...serverStateSettings, status: e.target.value})}
                               className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                            >
                               <option value="online">Online (Свободный вход)</option>
                               <option value="maintenance">Maintenance (Технические Работы - Только GM)</option>
                               <option value="event">Event Mode (Активация сценариев Разлома)</option>
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Рейты Опыта (XP)</label>
                               <select 
                                  value={serverStateSettings.multiplierXP}
                                  onChange={e => setServerStateSettings({...serverStateSettings, multiplierXP: Number(e.target.value)})}
                                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                               >
                                  <option value="1.0">x1 (Официальный)</option>
                                  <option value="2.0">x2 (Выходные)</option>
                                  <option value="5.0">x5 (Фестиваль)</option>
                                  <option value="10.0">x10 (Тестирование)</option>
                               </select>
                             </div>
                             <div>
                               <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Рейты Дропа (Gold)</label>
                               <select 
                                  value={serverStateSettings.multiplierGold}
                                  onChange={e => setServerStateSettings({...serverStateSettings, multiplierGold: Number(e.target.value)})}
                                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                               >
                                  <option value="1.0">x1 (Официальный)</option>
                                  <option value="2.0">x2 (Богатство)</option>
                                  <option value="5.0">x5 (Пиратская Бухта)</option>
                               </select>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Название Активного Ивента</label>
                            <input 
                               value={serverStateSettings.activeEvent}
                               onChange={e => setServerStateSettings({...serverStateSettings, activeEvent: e.target.value})}
                               placeholder="Например: 'Вторжение Титанов в Авалон'"
                               className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                             <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">Погодные Условия (Глобальные)</label>
                             <div className="flex gap-2">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded text-xs font-bold transition-colors">Солнечно</button>
                                <button className="flex-1 bg-indigo-900/50 hover:bg-indigo-800 border border-indigo-700 text-indigo-300 py-2.5 rounded text-xs font-bold transition-colors">Ливень</button>
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 py-2.5 rounded text-xs font-bold transition-colors">Туман</button>
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                       <button onClick={applyServerSettings} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded text-sm uppercase tracking-widest transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                          Применить Конфигурацию к Нодам
                       </button>
                    </div>
                 </div>

                 {/* Command Builder UI Placeholder */}
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                       <span className="bg-emerald-900/30 text-emerald-500 border border-emerald-800/50 text-[10px] px-2 py-1 rounded font-mono uppercase font-bold tracking-widest">Visual Logic Node v2.5</span>
                    </div>
                    <h3 className="font-serif text-lg text-white font-bold mb-1">Генератор Спавна и Действий (Command Builder)</h3>
                    <p className="text-[10px] text-slate-500 mb-4 font-mono uppercase">Графический интерфейс без ввода командной строки. Сборка JSON Payload on the fly.</p>
                    
                    <div className="bg-slate-950 border border-slate-800 p-5 rounded-lg flex flex-col xl:flex-row items-center gap-4 w-full">
                       {/* Dropdowns logic flow */}
                       <div className="flex w-full overflow-x-auto custom-scrollbar pb-2 xl:pb-0 items-center justify-between gap-4">
                          <div className="flex-1 min-w-[120px]">
                             <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Действие</label>
                             <select className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded p-2 focus:outline-none">
                                <option>Spawn Entity</option>
                                <option>Spawn Item</option>
                                <option>Weather Cmd</option>
                             </select>
                          </div>
                          <span className="text-slate-600 shrink-0 self-end mb-2">→</span>
                          
                          <div className="flex-1 min-w-[150px]">
                             <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Объект (Entity ID)</label>
                             <select className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded p-2 focus:outline-none">
                                <option>NPC_AbyssalDragon</option>
                                <option>NPC_WanderingMerchant</option>
                                <option>OBJ_TreasureChest_GodTier</option>
                             </select>
                          </div>
                          <span className="text-slate-600 shrink-0 self-end mb-2">→</span>

                          <div className="flex-1 min-w-[150px]">
                             <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Локация (X, Y, Z)</label>
                             <select className="w-full bg-slate-800 border border-slate-700 text-xs text-white rounded p-2 focus:outline-none">
                                <option>Current_Position</option>
                                <option>Target_Player_Pos</option>
                                <option>Zone_Rift_Center</option>
                             </select>
                          </div>
                          <span className="text-slate-600 shrink-0 self-end mb-2 xl:hidden">→</span>
                       </div>
                       
                       <button className="bg-emerald-900 hover:bg-emerald-800 text-emerald-400 border border-emerald-700 hover:border-emerald-500 text-xs px-6 py-3 rounded uppercase font-bold tracking-widest shrink-0 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] w-full xl:w-auto mt-2 xl:mt-0 xl:self-end">
                         Execute
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {/* TAB: LIVE MAP (Shadow Mode Map) */}
            {activeTab === 'map' && (
               <div className="w-full h-[600px] bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-center items-center group shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
                  {/* Decorative map radar logic */}
                  <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                     <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-20 sepia saturate-50 mix-blend-color-dodge filter blur-[2px]" />
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
                     
                     <div className="absolute w-[800px] h-[800px] rounded-full border border-sky-500/10" />
                     <div className="absolute w-[500px] h-[500px] rounded-full border border-sky-500/20" />
                     <div className="absolute w-[200px] h-[200px] rounded-full border border-sky-500/30" />
                     
                     <div className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"></div>
                     <div className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                     <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                     <div className="absolute top-1/4 right-1/3 w-3 h-3 rounded-full bg-amber-500 bg-opacity-80 animate-ping"></div>

                     {/* Scanner beam */}
                     <div className="absolute w-1/2 h-1/2 origin-bottom-right bg-gradient-to-r from-transparent to-sky-500/10 animate-[spin_6s_linear_infinite]" style={{ clipPath: 'polygon(100% 100%, 0 0, 100% 0)' }}></div>
                  </div>

                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-lg border border-slate-700">
                     <h4 className="text-white font-serif font-bold text-lg mb-1 flex items-center gap-2"><MapIcon className="w-5 h-5 text-sky-400" /> Ситуационный Центр Этерии</h4>
                     <div className="text-[10px] font-mono text-sky-400 space-y-1">
                        <div>[GLOBAL] Seamless Navigation Active</div>
                        <div>[ZONE_VALORIA] Players: 12 (Stable)</div>
                        <div className="text-amber-400 animate-pulse">[EVENT_RIFT] Anomaly Spawning Entity...</div>
                     </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700 flex flex-col p-2 gap-1.5 shadow-lg">
                     <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded text-[10px] font-mono tracking-widest uppercase tooltip">Teleport to Pin</button>
                     <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded text-[10px] font-mono tracking-widest uppercase">Spawn NPC Here</button>
                     <button className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded text-[10px] font-mono tracking-widest uppercase">Weather: Storm</button>
                  </div>
               </div>
            )}

            {/* TAB: LOGS & SECURITY */}
            {activeTab === 'logs' && (
               <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg h-[600px] flex flex-col">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                     <div>
                        <h3 className="font-serif text-lg text-white font-bold flex items-center gap-2">
                           <Terminal className="w-5 h-5 text-emerald-500" /> Server Console & Anticheat
                        </h3>
                        <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Live monitoring. Suspicious activity detector running.</p>
                     </div>
                     <div className="flex gap-2">
                        <span className="text-xs bg-slate-800 px-3 py-1.5 rounded hover:bg-slate-700 cursor-pointer text-white border border-transparent font-bold">ALL</span>
                        <span className="text-xs bg-slate-900 border border-slate-700 hover:border-amber-500 px-3 py-1.5 rounded cursor-pointer text-amber-500 font-bold">AUTH</span>
                        <span className="text-xs bg-slate-900 border border-slate-700 hover:border-red-500 px-3 py-1.5 rounded cursor-pointer text-red-500 font-bold">ANTICHEAT</span>
                     </div>
                  </div>
                  
                  {/* Console Interface */}
                  <div className="flex-1 overflow-y-auto font-mono text-xs text-emerald-400 space-y-2 custom-scrollbar bg-black p-4 rounded border border-slate-800 shadow-inner">
                     <div><span className="text-slate-500">[14:21:00]</span> <span className="text-blue-400">[SYSTEM]</span> Server core initialized successfully. Port: 3000.</div>
                     <div><span className="text-slate-500">[14:21:05]</span> <span className="text-purple-400">[DB]</span> Connected to persistence layer (PostgreSQL / Spanner emulator).</div>
                     <div><span className="text-slate-500">[14:21:12]</span> <span className="text-sky-400">[AUTH]</span> Admin account '{user.username}' authenticated. Security token generated.</div>
                     <div className="text-slate-300"><span className="text-slate-500">[14:22:00]</span> <span className="text-emerald-500">[WORLD]</span> Zone 'Etheria Plains' loaded. Active entities: 420.</div>
                     <div className="text-amber-400"><span className="text-slate-500">[14:22:15]</span> <span className="text-amber-500">[WARN]</span> High node memory usage (82%) detected in Navmesh subsystem. Garbage Collection triggered.</div>
                     <div className="text-slate-300"><span className="text-slate-500">[14:23:10]</span> <span className="text-sky-400">[TRADE]</span> Player 'Reggy' transferred [Epic Staff] to Player 'Andron'. Validated.</div>
                     <div className="text-red-400"><span className="text-slate-500">[14:23:40]</span> <span className="text-red-500">[ANTICHEAT]</span> Suspicious movement packet (SpeedHack possible) from UID:4452 (Player_X). Flagged for review.</div>
                     <div className="text-slate-300"><span className="text-slate-500">[14:24:00]</span> <span className="text-blue-400">[SYSTEM]</span> Async state save completed in 14ms.</div>
                     <div className="text-red-400"><span className="text-slate-500">[14:24:05]</span> <span className="text-red-500">[ERR]</span> Missing Texture "FX_Explosion_041". Spawning fallback effect.</div>
                     <div className="text-slate-300 group"><span className="text-slate-500">[14:25:01]</span> <span className="text-sky-400">[AUTH]</span> User 'Newbie123' registered. HWID: x9...f3.</div>
                     
                     <div className="pt-2 animate-pulse flex items-center gap-2">
                        <span className="text-emerald-500">&gt;</span> <span className="w-2 h-4 bg-emerald-500 inline-block"></span>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
