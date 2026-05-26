/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, Zone, Item, Spell, ChatMessage, SlotType } from './types';
import CharacterCreator from './components/CharacterCreator';
import Combat2DArena from './components/Combat2DArena';
import MapExplorer2D, { MapEntity } from './components/MapExplorer2D';
import CosmeticSalonTransmog from './components/CosmeticSalonTransmog';
import PvPArena from './components/PvPArena';
import GatheringCraftingEngine from './components/GatheringCraftingEngine';
import PetsAndHousing from './components/PetsAndHousing';
import DungeonFinderInstance from './components/DungeonFinderInstance';
import CompanionRPDialog from './components/CompanionRPDialog';
import {
  GAME_ZONES,
  WORLD_SPELLS,
  COMMON_TEMPLATES
} from './data/gameData';
import { MAIN_SCENARIO_QUESTS } from './data/msqData';
import {
  Shield,
  Sparkles,
  BookOpen,
  Sword,
  ShoppingCart,
  MapPin,
  MessageSquare,
  Compass,
  User,
  Coins,
  ChevronRight,
  Database,
  History,
  Send,
  Loader2,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Wand2,
  Server,
  Globe,
  Activity,
  Lock,
  Terminal,
  Users,
  LogOut,
  Trophy,
  Hammer,
  Flame,
  Wrench,
  Award
} from 'lucide-react';

const GuildCreationForm = ({ onCreate, playerGold }: { onCreate: (name: string, tag: string) => void, playerGold: number }) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  return (
    <div className="space-y-3 bg-slate-950/40 p-4 border border-slate-800 rounded-lg">
      <div>
        <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Название:</label>
        <input
          type="text"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Хранители Norrath"
          className="w-full bg-slate-900 border border-slate-705 text-xs px-3 py-2 rounded focus:outline-none focus:border-amber-500"
        />
      </div>
      <div>
        <label className="block text-[10px] text-slate-400 font-mono uppercase font-bold mb-1">Тэг (3-4 символа):</label>
        <input
          type="text"
          value={tag}
          maxLength={4}
          onChange={(e) => setTag(e.target.value.replace(/[^a-zA-Z]/g, ''))}
          placeholder="EQ3"
          className="w-full bg-slate-900 border border-slate-705 text-xs px-3 py-2 rounded focus:outline-none focus:border-amber-500 font-mono uppercase"
        />
      </div>
      <button
        type="button"
        onClick={() => onCreate(name, tag)}
        disabled={name.trim().length === 0 || tag.trim().length < 2 || playerGold < 30}
        className="w-full mt-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black py-2 rounded text-xs uppercase cursor-pointer"
      >
        Основать (30 Золота)
      </button>
    </div>
  );
};

const GuildMotdSection = ({ currentMotd, onUpdate }: { currentMotd: string, onUpdate: (motd: string) => void }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(currentMotd);
  if (editing) {
    return (
      <div className="space-y-2 mt-2">
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full bg-slate-900 border border-slate-705 text-xs p-2 rounded focus:outline-none focus:border-amber-500 text-slate-205 mt-1.5 font-mono"
          rows={2}
        />
        <div className="flex justify-end gap-2 text-[10px]">
          <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-white">Отмена</button>
          <button type="button" onClick={() => { onUpdate(val); setEditing(false); }} className="text-amber-500 hover:text-amber-400 font-bold">Сохранить</button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-slate-905 p-2.5 rounded border border-slate-800/45 text-[11px] leading-relaxed italic text-amber-100 relative">
      <span className="text-[9px] text-slate-500 uppercase font-bold block not-italic">Сообщение дня:</span>
      «{currentMotd}»
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute top-1.5 right-2 text-[10px] text-amber-500/80 hover:text-amber-400 font-mono"
      >
        [Изм]
      </button>
    </div>
  );
};

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: (user: { username: string; isAdmin: boolean }) => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorVal, setErrorVal] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorVal('Пожалуйста, заполните все поля.');
      return;
    }
    setErrorVal('');
    setLoading(true);

    try {
      const endpoint = isRegistering ? '/api/register' : '/api/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Произошла ошибка при аутентификации.');
      }

      if (data.success) {
        localStorage.setItem('eq3_user_session', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setErrorVal(err.message || 'Ошибка подключения к серверу.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" style={{ minHeight: '100vh', backgroundImage: 'radial-gradient(circle at center, rgb(15, 23, 42) 0%, rgb(2, 6, 23) 100%)' }}>
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900 border border-amber-600/50 rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 backdrop-blur-sm">
        
        {/* Core Game Logo Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center bg-amber-950/80 border border-amber-500/40 p-3.5 rounded-full mb-1">
            <Shield className="h-10 w-10 text-amber-500 animate-pulse" />
          </div>
          <h1 className="font-serif text-3xl font-black text-white tracking-widest uppercase mb-1">
            ХРОНИКИ
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-8 bg-amber-600/50" />
            <h2 className="font-sans text-xs font-bold text-amber-500 uppercase tracking-[0.3em]">
              Открытый мир
            </h2>
            <span className="h-[1px] w-8 bg-amber-600/40" />
          </div>
          <p className="text-[11px] text-slate-400 italic">Свободная фэнтези песочница & симулятор MMO</p>
        </div>

        {errorVal && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-200 text-xs py-2 px-3 rounded-lg mb-5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{errorVal}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5">
              Имя Персонажа / Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Введите ваше имя"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm py-2.5 px-3.5 rounded-lg focus:outline-none focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold mb-1.5">
              Пароль к Вратам
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm py-2.5 px-3.5 rounded-lg focus:outline-none focus:border-amber-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-lg text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : isRegistering ? (
              'Принять Присягу (Регистрация)'
            ) : (
              'Войти в Игровой Мир'
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorVal('');
            }}
            disabled={loading}
            className="text-amber-500 hover:text-amber-400 text-xs font-mono underline underline-offset-4 decoration-dotted cursor-pointer"
          >
            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Впервые у нас? Регистрация аккаунта'}
          </button>
        </div>

        {/* Info hints */}
        <div className="mt-8 bg-slate-950/40 border border-slate-800/60 p-3 rounded-lg text-[10px] leading-relaxed space-y-1 text-slate-500">
          <p className="font-bold text-slate-400 font-mono uppercase tracking-wide">💡 Памятка странника:</p>
          <p>• Тщательно сохраняйте ваш логин и пароль. Мир помнит каждого героя.</p>
          <p>• Назовите персонажа своим логином для плавной синхронизации сессии.</p>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<{ username: string; isAdmin: boolean } | null>(() => {
    const saved = localStorage.getItem('eq3_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [characters, setCharacters] = useState<PlayerCharacter[]>([]);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [character, setCharacter] = useState<PlayerCharacter | null>(null);
  const [selectedTab, setSelectedTab] = useState<'zones' | 'merchant' | 'lore' | 'quests' | 'character' | 'chat' | 'guild-party' | 'admin' | 'dungeons' | 'pets-housing' | 'crafting-market'>('zones');
  const [activeZone, setActiveZone] = useState<Zone>(GAME_ZONES[0]);
  const [showServerPanel, setShowServerPanel] = useState(false);

  const [merchantFilterRarity, setMerchantFilterRarity] = useState<string>('all');
  const [merchantFilterClass, setMerchantFilterClass] = useState<string>('all');
  const [questSubTab, setQuestSubTab] = useState<'msq' | 'side'>('msq');

  const [language, setLanguage] = useState<'ru'|'en'>('ru');
  const dic = {
    'ru': {
      'logout': 'Выйти из мира',
      'zones': 'Локации',
      'merchant': 'Туннель',
      'character': 'Снаряжение',
      'guild-party': 'Гильдия/Группа',
      'chat': 'Чат',
      'dungeons': 'Рейды',
      'lore': 'Сказания',
      'craft-market': 'Крафт',
      'pets-housing': 'Дом/Звери',
      'quests': 'Квесты',
      'simulatedServerInfo': 'Симулируемый MMO сервер • В сети',
      'selectChar': 'Выбор Героя',
      'createChar': 'Создать Героя',
      'charDeleted': 'удален навсегда',
      'charDeleteWarn': 'Вы уверены, что хотите удалить персонажа'
    },
    'en': {
      'logout': 'Log Out',
      'zones': 'Zones',
      'merchant': 'Shop',
      'character': 'Character',
      'guild-party': 'Guild/Group',
      'chat': 'Chat',
      'dungeons': 'Raids',
      'lore': 'Lore',
      'craft-market': 'Crafting',
      'pets-housing': 'Housing/Pets',
      'quests': 'Quests',
      'simulatedServerInfo': 'Simulated MMO Server • Online',
      'selectChar': 'Select Character',
      'createChar': 'Create Character',
      'charDeleted': 'permanently deleted',
      'charDeleteWarn': 'Are you sure you want to delete character'
    }
  };
  const t = (key: keyof typeof dic['ru']) => dic[language][key] || key;

  // Admin and Server States
  const [adminAnnouncement, setAdminAnnouncement] = useState('');
  const [adminUsers, setAdminUsers] = useState<{ username: string; isAdmin: boolean; banned: boolean }[]>([]);
  const [serverStateSettings, setServerStateSettings] = useState({
    status: 'online',
    multiplierXP: 1.0,
    multiplierGold: 1.0,
    activeEvent: 'Обычный режим',
    announcement: 'Добро пожаловать в Хроники Открытого Мира!'
  });

  const fetchServerSettings = async () => {
    try {
      const res = await fetch('/api/server-settings');
      if (res.ok) {
        const data = await res.json();
        setServerStateSettings(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchServerSettings();
    const interval = setInterval(fetchServerSettings, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTab === 'admin' && user?.isAdmin) {
      const loadUsers = async () => {
        try {
          const res = await fetch('/api/admin/users');
          if (res.ok) {
            const data = await res.json();
            setAdminUsers(data.users || []);
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadUsers();
    }
  }, [selectedTab, user]);

  // Guild & Group States in Russian style
  const [guild, setGuild] = useState<{
    name: string;
    tag: string;
    motd: string;
    level: number;
    treasury: number;
    members: { name: string; level: number; class: string; rank: string; online: boolean }[];
  } | null>(() => {
    const saved = localStorage.getItem('eq3_guild');
    return saved ? JSON.parse(saved) : null;
  });

  const [party, setParty] = useState<{
    name: string;
    members: { name: string; class: string; level: number; hp: number; maxHp: number }[];
  } | null>(() => {
    const saved = localStorage.getItem('eq3_party');
    return saved ? JSON.parse(saved) : null;
  });
  
  // Chat States
  const [chatInput, setChatInput] = useState('');
  const [chatChannel, setChatChannel] = useState<'OOC' | 'Auction' | 'Guild' | 'Shout'>('OOC');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  
  // Lore states
  const [loreSearch, setLoreSearch] = useState('');
  const [loreLoading, setLoreLoading] = useState(false);
  const [loreTopic, setLoreTopic] = useState<string>('Fippy Darkpaw');
  const [loreResponse, setLoreResponse] = useState<{ title: string; text: string } | null>({
    title: 'The Prophecy of Eternia',
    text: 'Этерния эволюционировала. Древний Авалон, Кибер-мегаполисы и подводные города Лемурии открыли свои порталы. Десятки тысяч игроков объединяются в гильдии, чтобы контролировать территории и возводить неприступные замки. Новые континенты появляются на горизонте, когда магические шпили пронзают ткань миров и открывают путь к новым, неисследованным землям и космическим мирам Эфирных Рубежей. Выживут только те сообщества, которые научатся управлять сложной экономикой и собирать рейды вглубь неизведанного...'
  });

  // Dynamic quest generator
  const [questLoading, setQuestLoading] = useState(false);

  // Combat States
  const [inCombat, setInCombat] = useState<boolean>(false);
  const [combatMonster, setCombatMonster] = useState<{ name: string; level: number; hp: number; maxHp: number; isBoss?: boolean } | null>(null);
  const [combatParty, setCombatParty] = useState<{ name: string; class: string; hp: number; maxHp: number }[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<{ id: string; name: string; provider: string; effect: string; duration: number }[]>([]);
  const [combatLogs, setCombatLogs] = useState<string[]>([]);
  const [dmNarrative, setDmNarrative] = useState<string>('');
  const [dmLoading, setDmLoading] = useState<boolean>(false);
  const [combatOver, setCombatOver] = useState<boolean>(false);
  const [victoryDetails, setVictoryDetails] = useState<{ expEarned: number; goldEarned: number; itemLooted?: Item } | null>(null);
  const [combatGcd, setCombatGcd] = useState<boolean>(false);
  const [stamina, setStamina] = useState<number>(100);
  const [spellCooldowns, setSpellCooldowns] = useState<Record<string, number>>({});
  const [comboField, setComboField] = useState<{ type: string, active: boolean }>({ type: 'none', active: false });
  const isDodgingRef = useRef<boolean>(false);

  // 2D Top-down Game States
  const MAP_COLS = 14;
  const MAP_ROWS = 11;
  const [playerX, setPlayerX] = useState<number>(3);
  const [playerY, setPlayerY] = useState<number>(3);
  const [mapEntities, setMapEntities] = useState<MapEntity[]>([]);
  const [combatVisualEvent, setCombatVisualEvent] = useState<{ id: number; type: 'melee' | 'taunt' | 'fire' | 'heal' | 'ice' | 'buff' | 'monster'; label: string; amount?: number } | null>(null);

  // Expanded Guild Features: PvE, PvP and Economy State Managers
  const [guildSubTab, setGuildSubTab] = useState<'management' | 'pve' | 'pvp' | 'craft'>('management');

  const [guildUpgrades, setGuildUpgrades] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('eq3_guild_upgrades');
    return saved ? JSON.parse(saved) : { guildHall: 1, forge: 1, lab: 1, altar: 1 };
  });

  const [guildResources, setGuildResources] = useState<{ ore: number; wood: number; herbs: number }>(() => {
    const saved = localStorage.getItem('eq3_guild_resources');
    return saved ? JSON.parse(saved) : { ore: 20, wood: 20, herbs: 20 };
  });

  const [botDuties, setBotDuties] = useState<Record<string, 'ore' | 'wood' | 'herbs' | 'idle'>>(() => {
    const saved = localStorage.getItem('eq3_guild_bot_duties');
    return saved ? JSON.parse(saved) : { 'Fippy': 'ore', 'Firiona_Vie': 'wood', 'AlKabor': 'herbs' };
  });

  const [castles, setCastles] = useState<{ id: string; name: string; defender: string; level: number; income: number; lastCollected: number }[]>(() => {
    const saved = localStorage.getItem('eq3_guild_castles');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'freeport', name: 'Крепость Фрипорта', defender: 'Синдикат Теней', level: 1, income: 50, lastCollected: 0 },
      { id: 'highpass', name: 'Высший Перевал', defender: 'Рыцари Стальной Вечности', level: 1, income: 80, lastCollected: 0 },
      { id: 'cabilis', name: 'Замок Кабилис', defender: 'Песчаный Легион', level: 1, income: 120, lastCollected: 0 }
    ];
  });

  const [rivalGuilds, setRivalGuilds] = useState<{ id: string; name: string; level: number; honor: number }[]>(() => {
    const saved = localStorage.getItem('eq3_guild_rivals');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'shadow', name: 'Синдикат Теней', level: 4, honor: 1600 },
      { id: 'knights', name: 'Рыцари Стальной Вечности', level: 3, honor: 1200 },
      { id: 'sand', name: 'Песчаный Легион', level: 5, honor: 900 }
    ];
  });

  const [guildHonor, setGuildHonor] = useState<number>(() => {
    const saved = localStorage.getItem('eq3_guild_honor');
    return saved ? Number(saved) : 550;
  });

  // Raid States
  const [inRaidBattle, setInRaidBattle] = useState(false);
  const [raidBoss, setRaidBoss] = useState<{ name: string; hp: number; maxHp: number; level: number; type: string; maxDmg: number } | null>(null);
  const [raidParty, setRaidParty] = useState<{ name: string; class: string; hp: number; maxHp: number; role: 'tank' | 'healer' | 'dps' }[]>([]);
  const [raidLogs, setRaidLogs] = useState<string[]>([]);
  const [raidBattleOver, setRaidBattleOver] = useState(false);
  const [raidVictory, setRaidVictory] = useState<boolean | null>(null);

  // Castle Siege States
  const [inSiegeBattle, setInSiegeBattle] = useState(false);
  const [siegeCastle, setSiegeCastle] = useState<{ id: string; name: string; defender: string; hp: number; maxHp: number } | null>(null);
  const [siegePlayerHp, setSiegePlayerHp] = useState(100); // percentage
  const [siegeLogs, setSiegeLogs] = useState<string[]>([]);
  const [siegeBattleOver, setSiegeBattleOver] = useState(false);
  const [siegeVictory, setSiegeVictory] = useState<boolean | null>(null);

  // GvG Skirmish States
  const [inGvgBattle, setInGvgBattle] = useState(false);
  const [gvgOpponentName, setGvgOpponentName] = useState('');
  const [gvgPlayerHp, setGvgPlayerHp] = useState(100);
  const [gvgOpponentHp, setGvgOpponentHp] = useState(100);
  const [gvgLogs, setGvgLogs] = useState<string[]>([]);
  const [gvgBattleOver, setGvgBattleOver] = useState(false);
  const [gvgVictory, setGvgVictory] = useState<boolean | null>(null);

  const saveGuildStats = (upgrades: any, resources: any, duties: any, castleList: any, honorVal: number) => {
    setGuildUpgrades(upgrades);
    localStorage.setItem('eq3_guild_upgrades', JSON.stringify(upgrades));
    setGuildResources(resources);
    localStorage.setItem('eq3_guild_resources', JSON.stringify(resources));
    setBotDuties(duties);
    localStorage.setItem('eq3_guild_bot_duties', JSON.stringify(duties));
    setCastles(castleList);
    localStorage.setItem('eq3_guild_castles', JSON.stringify(castleList));
    setGuildHonor(honorVal);
    localStorage.setItem('eq3_guild_honor', JSON.stringify(honorVal));
  };

  // System Notifications
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Scroll ref for chat logs
  const chatEndRef = useRef<HTMLDivElement>(null);

  const ensureCharacterFields = (char: PlayerCharacter): PlayerCharacter => {
    if (!char) return char;
    const updated = { ...char };
    if (!updated.visualCustomization) {
      updated.visualCustomization = {
        hairStyle: 'Воинский узел',
        hairColor: 'Угольно-черный',
        skinType: 'Светлая',
        transmogs: {
          head: null,
          chest: null,
          arms: null,
          legs: null,
          hands: null,
          feet: null,
          primary: null,
          secondary: null
        },
        title: 'Скиталец'
      };
    }
    if (!updated.pets) {
      updated.pets = [
        {
          id: 'pet-wolf-1',
          name: 'Лютоволк Кейноса',
          species: 'Wolf',
          level: 1,
          exp: 12,
          hp: 80,
          maxHp: 80,
          damage: 12,
          summoned: true
        }
      ];
    }
    if (!updated.houseFurniture) {
      updated.houseFurniture = [
        { id: 'furn-throne-1', name: 'Дубовый стул гильдмастера', icon: '🪑', buff: 'ХАР (CHA) +2', cost: 5, placed: true },
        { id: 'furn-table-1', name: 'Круглый обеденный стол', icon: '🪵', buff: 'ИНТ (INT) +2', cost: 8, placed: true }
      ];
    }
    if (!updated.craftingStats) {
      updated.craftingStats = {
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
    }
    if (!updated.arenaStats) {
      updated.arenaStats = {
        rating: 1200,
        wins: 0,
        losses: 0,
        points: 10
      };
    }
    return updated;
  };

  // 1. Initial Load: Check for character in local storage
  useEffect(() => {
    let _chars: PlayerCharacter[] = [];
    const savedArray = localStorage.getItem('eq3_characters');
    if (savedArray) {
      try {
        _chars = JSON.parse(savedArray).map(ensureCharacterFields);
        setCharacters(_chars);
      } catch (e) {
        console.error('Failed to parse saved characters array', e);
      }
    } else {
      const saved = localStorage.getItem('eq3_character');
      if (saved) {
        try {
          const parsed = ensureCharacterFields(JSON.parse(saved));
          _chars = [parsed];
          setCharacters(_chars);
          localStorage.setItem('eq3_characters', JSON.stringify(_chars));
        } catch (e) {
          console.error('Failed to parse saved single character', e);
        }
      }
    }
  }, []);

  // Save character utility
  const saveCharacter = (char: PlayerCharacter) => {
    const enriched = ensureCharacterFields(char);
    setCharacter(enriched);
    
    setCharacters(prev => {
      let updated = [...prev];
      const idx = updated.findIndex(c => c.name === enriched.name);
      if (idx >= 0) {
        updated[idx] = enriched;
      } else {
        updated.push(enriched);
      }
      localStorage.setItem('eq3_characters', JSON.stringify(updated));
      return updated;
    });

    localStorage.setItem('eq3_character', JSON.stringify(enriched));
  };

  const triggerAlert = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
  };

  const createGuild = (name: string, tag: string) => {
    if (!character) return;
    if (character.gold < 30) {
      triggerAlert('Недостаточно золота! Создание гильдии стоит 30 золотых монет.', 'error');
      return;
    }
    const newGuild = {
      name,
      tag: tag.toUpperCase(),
      motd: 'Добро пожаловать в нашу новую гильдию! Вместе мы завоюем этот Открытый Мир!',
      level: 1,
      treasury: 0,
      members: [
        { name: character.name, level: character.level, class: character.class, rank: 'Лидер', online: true },
        { name: 'Fippy', level: 3, class: 'Warrior', rank: 'Офицер', online: false },
        { name: 'Firiona_Vie', level: 5, class: 'Paladin', rank: 'Рекрут', online: true },
        { name: 'AlKabor', level: 8, class: 'Wizard', rank: 'Рекрут', online: true }
      ]
    };
    setGuild(newGuild);
    localStorage.setItem('eq3_guild', JSON.stringify(newGuild));
    
    // Deduct cost
    const updatedChar = { ...character, gold: character.gold - 30 };
    setCharacter(updatedChar);
    localStorage.setItem('eq3_character', JSON.stringify(updatedChar));
    
    triggerAlert(`Гильдия [${name}] успешно основана! Списано 30 золотых монет.`, 'success');
  };

  const donateToGuild = (amount: number) => {
    if (!character || !guild) return;
    if (character.gold < amount) {
      triggerAlert('У вас нет такого количества золота!', 'error');
      return;
    }
    const newTreasury = guild.treasury + amount;
    const shouldLevelUp = newTreasury >= guild.level * 100;
    const newLevel = shouldLevelUp ? guild.level + 1 : guild.level;
    const updatedGuild = {
      ...guild,
      treasury: shouldLevelUp ? newTreasury - guild.level * 100 : newTreasury,
      level: newLevel,
    };
    setGuild(updatedGuild);
    localStorage.setItem('eq3_guild', JSON.stringify(updatedGuild));

    const updatedChar = { ...character, gold: character.gold - amount };
    setCharacter(updatedChar);
    localStorage.setItem('eq3_character', JSON.stringify(updatedChar));

    if (shouldLevelUp) {
      triggerAlert(`Казна пополнена! Гильдия повысила свой уровень до ${newLevel}!`, 'success');
    } else {
      triggerAlert(`Вы внесли ${amount} золотых в казну гильдии!`, 'success');
    }
  };

  const updateGuildMotd = (motd: string) => {
    if (!guild) return;
    const updatedGuild = { ...guild, motd };
    setGuild(updatedGuild);
    localStorage.setItem('eq3_guild', JSON.stringify(updatedGuild));
    triggerAlert('Сообщение дня гильдии обновлено!', 'success');
  };

  const leaveGuild = () => {
    setGuild(null);
    localStorage.removeItem('eq3_guild');
    triggerAlert('Вы покинули гильдию.', 'info');
  };

  const handleUpgradeBuilding = (building: string, gold: number, wood: number, ore: number, herbs: number) => {
    if (!character || !guild) return;
    if (character.gold < gold) {
      triggerAlert('У вас недостаточно золота на личном балансе!', 'error');
      return;
    }
    if (guildResources.wood < wood || guildResources.ore < ore || guildResources.herbs < herbs) {
      triggerAlert('Недостаточно сырьевых материалов в запасах гильдии!', 'error');
      return;
    }

    // Deduct gold & resources
    const updatedChar = { ...character, gold: character.gold - gold };
    saveCharacter(updatedChar);

    const nextResources = {
      ore: guildResources.ore - ore,
      wood: guildResources.wood - wood,
      herbs: guildResources.herbs - herbs
    };
    setGuildResources(nextResources);
    localStorage.setItem('eq3_guild_resources', JSON.stringify(nextResources));

    // Increase building level
    const nextUpgrades = {
      ...guildUpgrades,
      [building]: (guildUpgrades[building] || 0) + 1
    };
    setGuildUpgrades(nextUpgrades);
    localStorage.setItem('eq3_guild_upgrades', JSON.stringify(nextUpgrades));

    triggerAlert(`Постройка успешно улучшена! Текущий уровень здания: ${nextUpgrades[building]}`, 'success');
  };

  const handleCraftGuildItem = (recipe: string, costs: { ore: number; wood: number; herbs: number }, itemData: any) => {
    if (!character || !guild) return;
    if (guildResources.ore < costs.ore || guildResources.wood < costs.wood || guildResources.herbs < costs.herbs) {
      triggerAlert('Недостаточно сырья в запасах гильдии!', 'error');
      return;
    }

    // Deduct materials
    const nextRes = {
      ore: guildResources.ore - costs.ore,
      wood: guildResources.wood - costs.wood,
      herbs: guildResources.herbs - costs.herbs
    };
    setGuildResources(nextRes);
    localStorage.setItem('eq3_guild_resources', JSON.stringify(nextRes));

    // Generate item loot
    const craftLoot = {
      id: `loot-craft-${Date.now()}`,
      name: itemData.name,
      slot: itemData.slot,
      description: itemData.description,
      price: itemData.price,
      rarity: itemData.rarity,
      stats: itemData.stats
    };

    const nextChar = {
      ...character,
      inventory: [...character.inventory, craftLoot]
    };
    saveCharacter(nextChar);

    triggerAlert(`Предмет [${craftLoot.name}] успешно выкован на верстаке! Добавлен в рюкзак.`, 'success');
  };

  const handleSiegeConquest = (castleId: string) => {
    if (!character || !guild) return;
    
    // Captured castle! Set owner to player's tag
    const nextCastles = castles.map(c => {
      if (c.id === castleId) {
        return { ...c, defender: `Ваша гильдия [${guild.tag}]` };
      }
      return c;
    });
    setCastles(nextCastles);
    localStorage.setItem('eq3_guild_castles', JSON.stringify(nextCastles));

    // Increase guild honor
    setGuildHonor(h => h + 250);
    localStorage.setItem('eq3_guild_honor', String(guildHonor + 250));

    triggerAlert(`Крепость успешно завоевана вашим легионом! Налоги станут доступны для сбора.`, 'success');
  };

  const handleGvgVictory = (rivalName: string) => {
    if (!character || !guild) return;
    
    setGuildHonor(h => h + 150);
    localStorage.setItem('eq3_guild_honor', String(guildHonor + 150));

    // deduct opponent honor slightly to simulate shift
    const nextRivals = rivalGuilds.map(r => {
      if (r.name === rivalName) {
        return { ...r, honor: Math.max(200, r.honor - 100) };
      }
      return r;
    });
    setRivalGuilds(nextRivals);
    localStorage.setItem('eq3_guild_rivals', JSON.stringify(nextRivals));

    triggerAlert(`Победа во славу [${guild.name}]! Рейтинговые очки зачислены.`, 'success');
  };

  const createParty = (name: string) => {
    if (!character) return;
    const newParty = {
      name,
      members: [
        { name: character.name, class: character.class, level: character.level, hp: character.hp, maxHp: character.maxHp }
      ]
    };
    setParty(newParty);
    localStorage.setItem('eq3_party', JSON.stringify(newParty));
    triggerAlert(`Группа [${name}] успешно создана!`, 'success');
  };

  const inviteToParty = (botName: string, botClass: string) => {
    if (!party) {
      triggerAlert('Сначала создайте группу во вкладке "Гильдия и Группа"!', 'error');
      return;
    }
    if (party.members.length >= 6) {
      triggerAlert('Группа уже полна! Максимум 3 спутников.', 'error');
      return;
    }
    if (party.members.some(m => m.name === botName)) {
      triggerAlert('Этот игрок уже состоит в группе!', 'error');
      return;
    }
    const newMember = {
      name: botName,
      class: botClass,
      level: character ? character.level : 1,
      hp: 100 + (character ? character.level : 1) * 45,
      maxHp: 100 + (character ? character.level : 1) * 45
    };
    const updatedParty = {
      ...party,
      members: [...party.members, newMember]
    };
    setParty(updatedParty);
    localStorage.setItem('eq3_party', JSON.stringify(updatedParty));
    triggerAlert(`Игрок ${botName} (${botClass}) вступил в вашу группу!`, 'success');
  };

  const leaveParty = () => {
    setParty(null);
    localStorage.removeItem('eq3_party');
    triggerAlert('Вы распустили группу.', 'info');
  };

  const dismissFromParty = (botName: string) => {
    if (!party) return;
    const filtered = party.members.filter(m => m.name !== botName);
    if (filtered.length <= 1) {
      setParty(null);
      localStorage.removeItem('eq3_party');
      triggerAlert('Вы покинули группу (остались одни).', 'info');
    } else {
      const updatedParty = { ...party, members: filtered };
      setParty(updatedParty);
      localStorage.setItem('eq3_party', JSON.stringify(updatedParty));
      triggerAlert(`Игрок ${botName} был исключен из группы.`, 'info');
    }
  };

  // 2. Fetch shared chat log periodically
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setChatMessages(data.messages);
          }
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };

    fetchChat();
    const interval = setInterval(fetchChat, 3000); // Fetch every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll chat to bottom when new messages show up
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const isObstacle = (x: number, y: number, zoneId: string) => {
    if (x < 0 || x >= MAP_COLS || y < 0 || y >= MAP_ROWS) return true;
    if (zoneId === 'qeynos-hills') {
      if ((x === 8 && y === 5) || (x === 8 && y === 6) || (x === 9 && y === 5)) return true; // Central pond
      if (x === 11 && y === 3) return true;
      if (x === 4 && y === 8) return true;
    } else if (zoneId === 'blackburrow') {
      if ((x === 4 || x === 9) && y >= 3 && y <= 7) return true;
    } else if (zoneId === 'lower-guk') {
      if (x % 3 === 0 && y % 3 === 0 && (x > 1 && y > 1)) return true;
    } else if (zoneId === 'castle-mistmoore') {
      if (y === 5 && x !== 7 && x !== 8) return true;
    } else if (zoneId === 'plane-of-fear') {
      if (x === 6 && y >= 2 && y <= 8) return true;
    } else if (zoneId === 'east-commonlands') {
      if ((x === 5 && y === 3) || (x === 10 && y === 7) || (x === 11 && y === 7)) return true;
    }
    return false;
  };

  const init2DMap = (zoneId: string) => {
    const entities: MapEntity[] = [];
    
    // 1. Cozy campfire Inn
    entities.push({
      id: 'campfire-site',
      type: 'campfire',
      name: 'Cozy Campfire Inn',
      x: 2,
      y: 2,
      icon: '🔥'
    });

    // 2. Coffer Chests
    entities.push({
      id: 'loot-chest-1',
      type: 'chest',
      name: 'Mysterious Coffer',
      x: MAP_COLS - 3,
      y: 2,
      icon: '📦',
      looted: false
    });
    entities.push({
      id: 'loot-chest-2',
      type: 'chest',
      name: 'Relic Chest',
      x: 3,
      y: MAP_ROWS - 3,
      icon: '📦',
      looted: false
    });

    // 3. Spawns Portals based on connections
    const currentZone = GAME_ZONES.find(z => z.id === zoneId) || GAME_ZONES[0];
    if (currentZone.connections && currentZone.connections.length > 0) {
      currentZone.connections.forEach((connId, index) => {
        const connZone = GAME_ZONES.find(z => z.id === connId);
        if (connZone) {
          const px = index === 0 ? MAP_COLS - 1 : index === 1 ? 0 : Math.floor(MAP_COLS / 2);
          const py = index === 0 ? Math.floor(MAP_ROWS / 2) : index === 1 ? MAP_ROWS - 1 : 0;
          entities.push({
            id: `portal-${connId}`,
            type: 'portal',
            name: `Gate to ${connZone.name}`,
            x: px,
            y: py,
            icon: '🚪',
            targetZoneId: connId
          });
        }
      });
    }

    // 4. Populate active monsters (Simulate high density farming area)
    const M_COUNT = 3; // Number of duplicates per monster to represent 1000+
    currentZone.monsters.forEach((mon, monIndex) => {
      let mIcon = '🕷️';
      if (mon.name.includes('Skeleton')) mIcon = '💀';
      else if (mon.name.includes('Beetle')) mIcon = '🐜';
      else if (mon.name.includes('Bear') || mon.name.includes('cub')) mIcon = '🐻';
      else if (mon.name.includes('Wolf')) mIcon = '🐺';
      else if (mon.name.includes('Gnoll')) mIcon = '🐕';
      else if (mon.name.includes('Froglok')) mIcon = '🐸';
      else if (mon.name.includes('Spider')) mIcon = '🕷️';
      else if (mon.name.includes('Vampire') || mon.name.includes('Lord') || mon.isBoss) mIcon = '😈';

      for (let dup = 0; dup < (mon.isBoss ? 1 : M_COUNT); dup++) {
        const mx = Math.floor(Math.random() * (MAP_COLS - 2)) + 1;
        const my = Math.floor(Math.random() * (MAP_ROWS - 2)) + 1;
        entities.push({
          id: `mon-${mon.name}-${monIndex}-${dup}-${Date.now()}`,
          type: 'monster',
          name: mon.name,
          level: mon.level,
          hp: mon.hp,
          maxHp: mon.hp,
          isBoss: mon.isBoss,
          x: mx,
          y: my,
          icon: mIcon
        });
      }
    });

    // 5. Populate Economy and Story NPCs (Quests, Merchants, Background)
    const merchants = ['Trader Mathok', 'Supply Master', 'Shady Swashbuckler'];
    const questGivers = ['Captain Tillin', 'Old Man Marcus', 'Scholar Veera'];
    
    // Spawn 1-2 Merchants
    for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) {
        entities.push({
          id: `merc-${i}-${Date.now()}`,
          type: 'merchant',
          name: merchants[i % merchants.length],
          x: Math.floor(Math.random() * 5) + 1,
          y: Math.floor(Math.random() * 5) + 1,
        });
    }

    // Spawn 1-2 Questgivers
    for (let i = 0; i < 2; i++) {
        entities.push({
          id: `qst-${i}-${Date.now()}`,
          type: 'quest',
          name: questGivers[i % questGivers.length],
          x: MAP_COLS - 2 - Math.floor(Math.random() * 4),
          y: Math.floor(Math.random() * 5) + 1,
        });
    }

    // Spawn Ambient/Background NPCs
    const bgNpcs = ['Уставший путник', 'Пьяный завсегдатай', 'Горожанин', 'Охотник', 'Шут'];
    const bgCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < bgCount; i++) {
        entities.push({
          id: `bg-${i}-${Date.now()}`,
          type: 'background',
          name: bgNpcs[i % bgNpcs.length],
          x: Math.floor(Math.random() * (MAP_COLS - 2)) + 1,
          y: Math.floor(Math.random() * (MAP_ROWS - 2)) + 1,
        });
    }

    // 6. Populate bot players (Social Interaction)
    const otherNames = ['Fippy', 'AlKabor', 'Sorn', 'Firiona_Vie', 'Xanthor', 'Glorg', 'Nika'];
    const classes = ['Paladin', 'Wizard', 'Druid', 'Enchanter', 'Necromancer'];
    const botCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < botCount; i++) {
      const rx = Math.floor(Math.random() * (MAP_COLS - 4)) + 2;
      const ry = Math.floor(Math.random() * (MAP_ROWS - 4)) + 2;
      entities.push({
        id: `bot-${otherNames[i % otherNames.length]}-${Date.now()}`,
        type: 'bot',
        name: otherNames[i % otherNames.length],
        class: classes[Math.floor(Math.random() * classes.length)],
        x: rx,
        y: ry,
      });
    }

    setMapEntities(entities);
    setPlayerX(2);
    setPlayerY(3);
  };

  useEffect(() => {
    if (!character) return;
    init2DMap(activeZone.id);
  }, [activeZone.id, !character]);

  useEffect(() => {
    if (!character || inCombat) return;

    const interval = setInterval(() => {
      setMapEntities((prevEntities) => {
        return prevEntities.map((entity) => {
          if (entity.type !== 'monster' && entity.type !== 'bot') return entity;
          
          // AI: Получение информации -> Анализ -> Действие (Information -> Analysis -> Action)
          const isBot = entity.type === 'bot';
          
          // 1. ПОЛУЧЕНИЕ ИНФОРМАЦИИ (Sensor phase)
          // Сканируем окружение: ищем ближайших противников и объекты
          const mapTargets = prevEntities.filter(e => {
            if (e.id === entity.id) return false;
            if (isBot) return e.type === 'monster' || e.type === 'campfire';
            else return e.type === 'bot';
          });

          let nearestTarget: any = null;
          let minDist = Infinity;

          mapTargets.forEach(t => {
            const dist = Math.abs(t.x - entity.x) + Math.abs(t.y - entity.y);
            if (dist < minDist) {
              minDist = dist;
              nearestTarget = t;
            }
          });

          // 2. АНАЛИЗ (Decision phase / AI State)
          // Определение контекста и намерений (Intention)
          let intent: 'wander' | 'attack' | 'flee' | 'rest' = 'wander';
          let chatQueue: string | null = null;
          let targetDx = 0;
          let targetDy = 0;

          if (nearestTarget && minDist < 6) {
            if (isBot) {
              if (nearestTarget.type === 'monster') {
                intent = (entity.hp && entity.hp < 30) ? 'flee' : 'attack';
                if (intent === 'flee' && minDist < 3 && Math.random() > 0.7) {
                  chatQueue = `Помогите! Рядом с координатами [${entity.x}, ${entity.y}] злой монстр, а у меня мало ХП!`;
                } else if (intent === 'attack' && minDist < 3 && Math.random() > 0.85) {
                  chatQueue = `Атакую монстра ${nearestTarget.name}! За Норрат!`;
                }
              } else if (nearestTarget.type === 'campfire') {
                intent = (entity.hp && entity.hp < 80) ? 'rest' : 'wander';
                if (intent === 'rest' && minDist === 1 && Math.random() > 0.9) {
                  chatQueue = "Отдыхаю у костра, восстанавливаю силы...";
                }
              }
            } else {
               // У монстров простое поведение - преследование ботов
               intent = 'attack';
            }
          }

          // 3. ДЕЙСТВИЕ (Action phase)
          // Если ИИ "соображает" (0.7 шанс, иначе тупит/ждет)
          if (Math.random() > 0.3) {
            if (intent === 'attack' && nearestTarget) {
              targetDx = Math.sign(nearestTarget.x - entity.x);
              targetDy = Math.sign(nearestTarget.y - entity.y);
            } else if (intent === 'flee' && nearestTarget) {
              targetDx = -Math.sign(nearestTarget.x - entity.x);
              targetDy = -Math.sign(nearestTarget.y - entity.y);
            } else if (intent === 'rest' && nearestTarget) {
               targetDx = Math.sign(nearestTarget.x - entity.x);
               targetDy = Math.sign(nearestTarget.y - entity.y);
            }

            // Оставляем движение по одной из осей, чтобы не ходить по диагонали (сетка)
            if (targetDx !== 0 && targetDy !== 0) {
              if (Math.random() > 0.5) targetDx = 0; else targetDy = 0;
            }

            // Случайное блуждание, если нет цели
            if (targetDx === 0 && targetDy === 0) {
              const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
              const rDir = dirs[Math.floor(Math.random() * dirs.length)];
              targetDx = rDir.dx;
              targetDy = rDir.dy;
            }

            const nx = entity.x + targetDx;
            const ny = entity.y + targetDy;

            if (!isObstacle(nx, ny, activeZone.id) && nx > 0 && nx < MAP_COLS - 1 && ny > 0 && ny < MAP_ROWS - 1) {
              const collision = prevEntities.some(e => e.id !== entity.id && e.x === nx && e.y === ny);
              if (!collision) {
                // Если мы планируем что-то сказать в чат (контекстно)
                if (isBot) {
                  const shouldChatIdle = Math.random() > 0.95;
                  if (chatQueue || shouldChatIdle) {
                    const line = chatQueue || [
                      'Интересно, как устроен этот мир. Вижу логику ИИ.',
                      `Где находится босс зоны ${activeZone.name}?`,
                      'Деревья здесь словно процедурно сгенерированы.',
                      'Кто-нибудь продает зелья маны?',
                      'Ищу пати для быстрого фарма! (На самом деле я бот)'
                    ][Math.floor(Math.random() * 5)];
                    
                    setChatMessages(prev => [
                      ...prev,
                      {
                        id: `bot-chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        sender: entity.name,
                        channel: 'OOC',
                        text: line,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        class: entity.class as any
                      }
                    ].slice(-40));
                  }
                }
                return { ...entity, x: nx, y: ny };
              }
            }
          }
          return entity;
        });
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [activeZone.id, inCombat, !character]);

  const handlePlayerMove = (dx: number, dy: number) => {
    if (!character || inCombat) return;
    const nx = playerX + dx;
    const ny = playerY + dy;

    if (isObstacle(nx, ny, activeZone.id)) {
      return; 
    }

    setPlayerX(nx);
    setPlayerY(ny);

    // Collisions
    const portal = mapEntities.find(e => e.type === 'portal' && e.x === nx && e.y === ny);
    if (portal && portal.targetZoneId) {
      const targetZ = GAME_ZONES.find(z => z.id === portal.targetZoneId);
      if (targetZ) {
        setActiveZone(targetZ);
        setLoreTopic(targetZ.name);
        triggerAlert(`Перемещаемся в соседнюю локацию: ${targetZ.name}!`, 'info');
      }
      return;
    }

    const chest = mapEntities.find(e => e.type === 'chest' && e.x === nx && e.y === ny && !e.looted);
    if (chest) {
      const earnedGold = 10 + Math.floor(Math.random() * (character.level * 25));
      const earnedExp = 25 + Math.floor(Math.random() * (character.level * 50));
      
      setMapEntities(prev => prev.map(e => e.id === chest.id ? { ...e, looted: true, icon: '🔓' } : e));
      
      const updatedExp = character.exp + earnedExp;
      let updatedLevel = character.level;
      let expReq = character.expToNextLevel;
      let hpMax = character.maxHp;
      let manaMax = character.maxMana;
      let leveledUp = false;

      if (updatedExp >= character.expToNextLevel) {
        updatedLevel += 1;
        leveledUp = true;
        expReq = Math.floor(character.expToNextLevel * 1.5);
        hpMax = character.maxHp + 40;
        manaMax = character.maxMana + 25;
      }

      const updatedChar = {
        ...character,
        gold: character.gold + earnedGold,
        exp: leveledUp ? 0 : updatedExp,
        level: updatedLevel,
        expToNextLevel: expReq,
        maxHp: hpMax,
        maxMana: manaMax,
        hp: leveledUp ? hpMax : character.hp,
        mana: leveledUp ? manaMax : character.mana,
      };

      saveCharacter(updatedChar);
      triggerAlert(`Открыт сундук! Найдено ${earnedGold} золота и получено ${earnedExp} опыта!${leveledUp ? ' Новый Уровень!' : ''}`, 'success');
      return;
    }

    const campfire = mapEntities.find(e => e.type === 'campfire' && Math.abs(e.x - nx) <= 1 && Math.abs(e.y - ny) <= 1);
    if (campfire) {
      const hpHeal = 15;
      const mpHeal = 10;
      if (character.hp < character.maxHp || character.mana < character.maxMana) {
        saveCharacter({
          ...character,
          hp: Math.min(character.maxHp, character.hp + hpHeal),
          mana: Math.min(character.maxMana, character.mana + mpHeal),
        });
        triggerAlert('Отдых у теплого костра... Здоровье и Мана восстановлены!', 'success');
      }
    }

    const nearbyMonster = mapEntities.find(e => e.type === 'monster' && e.x === nx && e.y === ny && (e.hp || 0) > 0);
    if (nearbyMonster) {
      handleInitiateCombat({
        name: nearbyMonster.name,
        level: nearbyMonster.level || 1,
        hp: nearbyMonster.hp || 50,
        isBoss: nearbyMonster.isBoss
      });
    }

    const npc = mapEntities.find(e => ['merchant', 'quest', 'bot', 'background'].includes(e.type) && e.x === nx && e.y === ny);
    if (npc) {
      if (npc.type === 'merchant') {
         triggerAlert(`Торговец ${npc.name} предлагает вам свои товары! (Откройте вкладку Рынок)`, 'info');
      } else if (npc.type === 'quest') {
         triggerAlert(`${npc.name} говорит: "Приветствую, путник. Есть для тебя работенка..."`, 'info');
      } else if (npc.type === 'bot') {
         triggerAlert(`Игрок ${npc.name} помахал вам рукой.`, 'info');
      } else if (npc.type === 'background') {
         triggerAlert(`${npc.name} смотрит на вас, но ничего не говорит.`, 'info');
      }
    }
  };

  // Movement logic is entirely text-based now, keyboard listeners removed.
  // Spell unlocks: filter spells suitable for current level & class
  const getAvailableClassSpells = () => {
    if (!character) return [];
    const isSpellcaster = ['Cleric', 'Druid', 'Shaman', 'Necromancer', 'Wizard', 'Magician', 'Enchanter', 'Paladin', 'Shadow Knight'].includes(character.class);
    if (!isSpellcaster) return [];

    return WORLD_SPELLS.filter(spell => {
      // Clerics/Paladins get healing & buffs
      if (['Cleric', 'Paladin'].includes(character.class) && (spell.type === 'heal' || spell.id === 'shield')) return true;
      // Wizards get high damage
      if (character.class === 'Wizard' && spell.type === 'damage') return true;
      // Enchanters get Clarity + Mez
      if (character.class === 'Enchanter' && ['clarity', 'mesmerize', 'shield'].includes(spell.id)) return true;
      // Others get primary firebolt/heal based on level
      if (spell.level <= character.level) return true;
      return false;
    });
  };

  const currentSpells = getAvailableClassSpells();

  // 3. Handlers
  const handleCharacterCreated = (newChar: PlayerCharacter) => {
    saveCharacter(newChar);
    setIsCreatingCharacter(false);
    triggerAlert(`Добро пожаловать в Этернию, ${newChar.name}! Ваша судьба ждет вас!`, 'success');
  };

  const handleLogoutToSelect = () => {
    setCharacter(null);
    localStorage.removeItem('eq3_character');
    setInCombat(false);
    setCombatMonster(null);
    setVictoryDetails(null);
  };

  const handleDeleteCharacter = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`${t('charDeleteWarn')} ${name}?`)) {
      setCharacters(prev => {
        const remaining = prev.filter(c => c.name !== name);
        localStorage.setItem('eq3_characters', JSON.stringify(remaining));
        return remaining;
      });
      triggerAlert(`${name} ${t('charDeleted')}.`, 'info');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !character) return;

    setIsSendingChat(true);
    const textMsg = chatInput;
    setChatInput('');

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: character.name,
          channel: chatChannel,
          text: textMsg,
          level: character.level,
          race: character.race,
          charClass: character.class,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.currentMessages) {
          setChatMessages(data.currentMessages);
        }
      }
    } catch (err) {
      console.error('Error sending chat message:', err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // 4. Custom Side Quest Generator via Gemini
  const handleRequestQuest = async () => {
    if (!character) return;
    setQuestLoading(true);
    triggerAlert('Консультация с региональным Мастером Гильдии по поводу испытаний...', 'info');

    try {
      const response = await fetch('/api/gemini/quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: character.name,
          charClass: character.class,
          race: character.race,
          level: character.level,
          zone: activeZone.name,
        }),
      });

      if (response.ok) {
        const questData = await response.json();
        
        // Setup quest
        const compiledQuest = {
          id: `quest-${Date.now()}`,
          title: questData.title || 'Динамический контракт гильдии',
          giver: questData.giver || 'Посланник гильдии',
          description: questData.description || 'Таинственный фэнтезийный свиток с просьбой о помощи.',
          objective: questData.objective || 'Уничтожайте монстров в указанных локациях согласно инструкциям.',
          rewardExp: questData.rewardExp || 150,
          rewardGold: questData.rewardGold || 10,
          rewardItem: questData.rewardItem as Item | undefined,
          status: 'active' as const,
          progressCurrent: 0,
          progressRequired: 3, // Custom target
        };

        const updatedQuests = [...character.quests, compiledQuest];
        saveCharacter({
          ...character,
          quests: updatedQuests,
        });

        triggerAlert(`Получено новое задание: "${compiledQuest.title}"! Проверьте журнал заданий.`, 'success');
      } else {
        triggerAlert('Главы гильдии сейчас заняты. Попробуйте запросить задание позже!', 'error');
      }
    } catch (err) {
      console.error('Failed to summon quest:', err);
      triggerAlert('Портал миров нестабилен. Глава гильдии сейчас недоступен.', 'error');
    } finally {
      setQuestLoading(false);
    }
  };

  const handleAbandonQuest = (questId: string) => {
    if (!character) return;
    const filtered = character.quests.filter(q => q.id !== questId);
    saveCharacter({
      ...character,
      quests: filtered,
    });
    triggerAlert('Задание отменено.', 'info');
  };

  // 5. Tome of Norrath Deep Lore Query via Gemini
  const handleSearchLore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loreSearch.trim()) return;

    setLoreLoading(true);
    const searchTopic = loreSearch;
    setLoreTopic(searchTopic);
    setLoreSearch('');

    try {
      const response = await fetch('/api/gemini/lore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: searchTopic }),
      });

      if (response.ok) {
        const data = await response.json();
        setLoreResponse(data);
        triggerAlert(`Гримуар Этернии: Извлечены хроники о "${data.title || searchTopic}".`, 'success');
      } else {
        triggerAlert('Древние архивы неразборчивы. Магические знаки сменились...', 'error');
      }
    } catch (err) {
      console.error('Error fetching lore chronicles:', err);
      triggerAlert('Не удалось призвать архивы измерений.', 'error');
    } finally {
      setLoreLoading(false);
    }
  };

  // 6. Commonlands Merchant Shopping
  const handlePurchaseItem = (item: Item) => {
    if (!character) return;
    if (character.gold < item.price) {
      triggerAlert(`Недостаточно золота! [Нужно: ${item.price} золота, у вас: ${character.gold} золота]`, 'error');
      return;
    }

    // Purchase
    const updatedInventory = [...character.inventory, { ...item, id: `loot-${Date.now()}` }];
    saveCharacter({
      ...character,
      gold: character.gold - item.price,
      inventory: updatedInventory,
    });

    triggerAlert(`Куплен [${item.name}] в торговом туннеле!`, 'success');
  };

  const handleSellItem = (itemUniqueId: string, itemPrice: number, itemName: string) => {
    if (!character) return;
    const updatedInventory = character.inventory.filter(i => i.id !== itemUniqueId);
    const saleValue = Math.max(1, Math.floor(itemPrice * 0.4)); // Sell value is 45% of purchase price

    saveCharacter({
      ...character,
      gold: character.gold + saleValue,
      inventory: updatedInventory,
    });
    triggerAlert(`Продан [${itemName}] за ${saleValue} медных монет.`, 'info');
  };

  const handleEquipItem = (item: Item) => {
    if (!character || item.slot === 'none') return;
    const slot = item.slot as SlotType;
    const currentEquipped = character.equipment[slot];

    // Swap items
    let updatedInventory = character.inventory.filter(i => i.id !== item.id);
    if (currentEquipped) {
      updatedInventory.push(currentEquipped);
    }

    const updatedEquipment = {
      ...character.equipment,
      [slot]: item,
    };

    // Calculate stat changes and verify health limits
    saveCharacter({
      ...character,
      equipment: updatedEquipment,
      inventory: updatedInventory,
    });

    const slotNamesEnRu: Record<string, string> = {
      primary: 'Главная рука',
      chest: 'Грудь',
      head: 'Шлем',
      hands: 'Перчатки',
      feet: 'Сапоги',
      secondary: 'Вторая рука',
      arms: 'Наручи',
      legs: 'Поножи'
    };
    triggerAlert(`Надето [${item.name}] в слот "${slotNamesEnRu[slot] || slot}"!`, 'success');
  };

  const handleUnequipItem = (slot: SlotType) => {
    if (!character) return;
    const item = character.equipment[slot];
    if (!item) return;

    const updatedEquipment = {
      ...character.equipment,
      [slot]: null,
    };

    const updatedInventory = [...character.inventory, item];

    saveCharacter({
      ...character,
      equipment: updatedEquipment,
      inventory: updatedInventory,
    });

    triggerAlert(`Предмет [${item.name}] снят в инвентарь.`, 'info');
  };

  const handleUseConsumable = (itemId: string, itemName: string) => {
    if (!character) return;
    let healAmount = 0;
    if (itemName.includes('Apple')) healAmount = 30;
    else if (itemName.includes('Bandage')) healAmount = 50;
    else healAmount = 20;

    const updatedInventory = character.inventory.filter(i => i.id !== itemId);
    const newHp = Math.min(character.maxHp, character.hp + healAmount);

    saveCharacter({
      ...character,
      hp: newHp,
      inventory: updatedInventory,
    });

    triggerAlert(`Использовано ${itemName}! Восстановлено ${healAmount} единиц здоровья.`, 'success');
  };

  // 7. Combat Mechanics Core
  const handleInitiateCombat = (monster: { name: string; level: number; hp: number; isBoss?: boolean }) => {
    if (!character) return;

    // Use custom party members if a party is active, otherwise roll random simulated comrades
    let structuredParty = [];
    if (party && party.members.length > 1) {
      structuredParty = party.members
        .filter(m => m.name !== character.name)
        .map(m => ({
          name: m.name,
          class: m.class,
          hp: m.hp,
          maxHp: m.maxHp,
        }));
    } else {
      const potentialMates = COMMON_TEMPLATES.simulatedNames.filter(n => n !== character.name);
      const matchCount = activeZone.difficulty === 'Raid' ? 4 : activeZone.difficulty === 'Hard' ? 2 : 1;
      const partyMatesClasses = ['Cleric', 'Monk', 'Wizard', 'Enchanter', 'Bard'];
      
      for (let i = 0; i < matchCount; i++) {
        const pName = potentialMates[Math.floor(Math.random() * potentialMates.length)];
        const pClass = partyMatesClasses[Math.floor(Math.random() * partyMatesClasses.length)];
        structuredParty.push({
          name: pName,
          class: pClass as any,
          hp: 75 + character.level * 40,
          maxHp: 75 + character.level * 40,
        });
      }
    }

    setCombatMonster({
      name: monster.name,
      level: monster.level,
      hp: monster.hp,
      maxHp: monster.hp,
      isBoss: monster.isBoss,
    });

    setCombatParty(structuredParty);
    
    // Setup initial companion party buffs depending on who is in the party
    const initialBuffs: { id: string; name: string; provider: string; effect: string; duration: number }[] = [];
    structuredParty.forEach(member => {
      if (member.class === 'Cleric') {
        initialBuffs.push({
          id: `buff-cleric-init-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: 'Heroism',
          provider: member.name,
          effect: '+15 Max HP & AC',
          duration: 5,
        });
      } else if (member.class === 'Bard') {
        initialBuffs.push({
          id: `buff-bard-init-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: 'Song of Clarity',
          provider: member.name,
          effect: '+6 Mana regeneration per round',
          duration: 6,
        });
      } else if (member.class === 'Enchanter') {
        initialBuffs.push({
          id: `buff-enchanter-init-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: 'Clarity I',
          provider: member.name,
          effect: '+10 Mana regeneration per round',
          duration: 8,
        });
      }
    });
    setActiveBuffs(initialBuffs);

    setCombatLogs([
      `[SYSTEM] You step forward. An angry Level ${monster.level} [${monster.name}] engages your group!`,
      `[SYSTEM] Party Members joining your queue: ${structuredParty.map(p => `${p.name} (${p.class})`).join(', ')}.`
    ]);
    setDmNarrative(`You cautiously step into the shadows of the cave. Clashing sounds echo closer. Ahead of you stands a formidable ${monster.name}, breathing heavily. Your party members draw their weapons, ready to engage at your command...`);
    setCombatOver(false);
    setVictoryDetails(null);
    setSpellCooldowns({});
    setComboField({ type: 'none', active: false });
    setInCombat(true);
  };

  const handleCombatAction = async (actionType: 'melee' | 'taunt' | 'dodge' | Spell) => {
    if (!character || !combatMonster || combatOver || combatGcd) return;

    // Trigger GCD
    setCombatGcd(true);
    setTimeout(() => {
      setCombatGcd(false);
    }, 1200);

    let logChunk: string[] = [];
    let dmgToMonster = 0;
    let healToParty = 0;
    let actionName = 'Melee attack';

    // Passive Stamina Regen
    setStamina(prev => Math.min(100, prev + 15));

    // Decrement buff durations and filter out expired ones
    let updatedBuffs = activeBuffs
      .map(b => ({ ...b, duration: b.duration - 1 }))
      .filter(b => b.duration > 0);

    // Decrement spell cooldowns
    setSpellCooldowns(prev => {
      const updated = { ...prev };
      for (const k in updated) {
        if (updated[k] > 0) updated[k] -= 1;
      }
      return updated;
    });

    let activeComboField = comboField.active ? comboField.type : 'none';
    let comboTriggered = false;

    // Reset dodge ref unless they are dodging this turn
    if (actionType !== 'dodge') {
      isDodgingRef.current = false;
    }

    // A. Player Action
    if (actionType === 'dodge') {
      actionName = 'Tactical Dodge';
      if (stamina < 30) {
        triggerAlert('Not enough stamina to dodge!', 'error');
        setCombatGcd(false);
        return;
      }
      setStamina(prev => prev - 30);
      isDodgingRef.current = true;
      logChunk.push(`You execute a rapid evasive roll, consuming stamina. Incoming attacks will miss!`);
      // Add a quick visual effect
      setCombatVisualEvent({
        id: Date.now(),
        type: 'buff',
        label: 'Evaded!',
      });
    } else if (actionType === 'melee') {
      const wepBonus = character.equipment.primary?.stats.str || 0;
      dmgToMonster = Math.floor(Math.random() * 15) + Math.floor(character.stats.str / 10) + wepBonus + 5;
      
      if (activeComboField === 'fire') {
        dmgToMonster += 15;
        logChunk.push(`💥 COMBO: Flame Strike! Your blade ignites in the fire field for extra damage!`);
        comboTriggered = true;
      }
      logChunk.push(`You swing your blade and strike ${combatMonster.name} for ${dmgToMonster} physical damage!`);
      setCombatVisualEvent({
        id: Date.now(),
        type: 'melee',
        label: 'Melee Strike',
        amount: dmgToMonster,
      });
    } else if (actionType === 'taunt') {
      actionName = 'Defensive Taunt';
      logChunk.push(`You crash your shield and taunt ${combatMonster.name}. Direct monster focus centers on you, boosting threat and defenses!`);
      setCombatVisualEvent({
        id: Date.now(),
        type: 'taunt',
        label: 'Taunted!',
      });
    } else {
      // It is a spell
      const spell = actionType as Spell;
      if (spellCooldowns[spell.id] > 0) {
        triggerAlert(`${spell.name} is on cooldown!`, 'error');
        setCombatGcd(false);
        return;
      }

      actionName = spell.name;
      if (character.mana < spell.manaCost) {
        triggerAlert('Not enough mana to project this spell!', 'error');
        setCombatGcd(false);
        return;
      }
      
      // Deduct mana and set cooldown
      character.mana -= spell.manaCost;
      setSpellCooldowns(prev => ({ ...prev, [spell.id]: spell.cooldown }));

      if (spell.type === 'damage') {
        dmgToMonster = Math.floor(Math.random() * 30) + 25 + Math.floor(character.stats.int / 8);
        
        const isCold = spell.name.toLowerCase().includes('frost') || spell.name.toLowerCase().includes('ice') || spell.name.toLowerCase().includes('cold') || spell.id.includes('ice');
        const isFire = spell.name.toLowerCase().includes('fire') || spell.id.includes('fire');
        
        if (isFire) {
           setComboField({ type: 'fire', active: true });
           logChunk.push(`🔥 A raging Fire Combo Field is created!`);
        } else if (isCold && activeComboField === 'fire') {
           dmgToMonster += 30;
           logChunk.push(`💥 COMBO: Thermal Shock! Ice hits the Fire Field dealing massive combined damage!`);
           comboTriggered = true;
        }

        logChunk.push(`You weave arcane patterns! [${spell.name}] crash into ${combatMonster.name} for ${dmgToMonster} elemental damage!`);
        setCombatVisualEvent({
          id: Date.now(),
          type: isCold ? 'ice' : 'fire',
          label: spell.name,
          amount: dmgToMonster,
        });

      } else if (spell.type === 'heal') {
        healToParty = Math.floor(Math.random() * 25) + 35 + Math.floor(character.stats.wis / 8);
        character.hp = Math.min(character.maxHp, character.hp + healToParty);
        if (activeComboField === 'fire') {
           healToParty += 20;
           character.hp = Math.min(character.maxHp, character.hp + 20);
           logChunk.push(`💥 COMBO: Cleansing Flame! Healing is amplified by the Fire Field!`);
           comboTriggered = true;
        }
        logChunk.push(`You invoke divine light! [${spell.name}] heals you for ${healToParty} HP.`);
        setCombatVisualEvent({
          id: Date.now(),
          type: 'heal',
          label: spell.name,
          amount: healToParty,
        });
      } else if (spell.type === 'buff') {
        logChunk.push(`You cast [${spell.name}] shielding your life essences. Health regeneration spikes!`);
        setCombatVisualEvent({
          id: Date.now(),
          type: 'buff',
          label: spell.name,
        });
      }
    }

    // Apply player action effects to target
    let activeMonsterHp = Math.max(0, combatMonster.hp - dmgToMonster);
    
    if (comboTriggered) {
      setComboField({ type: 'none', active: false });
    }

    // B. Party AI Action triggers
    let activeParty = [...combatParty];
    if (activeMonsterHp > 0) {
      activeParty = activeParty.map(member => {
        // Cleric cures, Wizard damages, Bard buffs, Enchanter buffs
        const roleRoll = Math.random();
        if (member.hp <= 0) return member;

        if (member.class === 'Cleric') {
          if (roleRoll > 0.6) {
            const cure = 30 + Math.floor(Math.random() * 20);
            character.hp = Math.min(character.maxHp, character.hp + cure);
            logChunk.push(`[PARTY] ${member.name} (Cleric) casts Heal on you! Restored ${cure} HP.`);
          } else if (roleRoll > 0.3) {
            const hasShield = updatedBuffs.some(b => b.name === 'Aegis of Faith');
            if (!hasShield) {
              updatedBuffs.push({
                id: `buff-cleric-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: 'Aegis of Faith',
                provider: member.name,
                effect: '+15 Armor Class & Divine Shielding',
                duration: 4
              });
              logChunk.push(`[PARTY] ${member.name} (Cleric) casts [Aegis of Faith] on the group!`);
            } else {
              const punch = 10 + Math.floor(Math.random() * 10);
              activeMonsterHp = Math.max(0, activeMonsterHp - punch);
              logChunk.push(`[PARTY] ${member.name} smites ${combatMonster.name} for ${punch} Holy damage.`);
            }
          } else {
            const punch = 10 + Math.floor(Math.random() * 10);
            activeMonsterHp = Math.max(0, activeMonsterHp - punch);
            logChunk.push(`[PARTY] ${member.name} strikes ${combatMonster.name} for ${punch} damage.`);
          }
        } else if (member.class === 'Wizard' && roleRoll > 0.3) {
          const splDmg = 40 + Math.floor(Math.random() * 25);
          activeMonsterHp = Math.max(0, activeMonsterHp - splDmg);
          logChunk.push(`[PARTY] ${member.name} (Wizard) launches a glowing ice blast at ${combatMonster.name} that deals ${splDmg} frost damage!`);
        } else if (member.class === 'Enchanter') {
          if (roleRoll > 0.5) {
            const hasClarity = updatedBuffs.some(b => b.name === 'Clarity I');
            if (!hasClarity) {
              updatedBuffs.push({
                id: `buff-ench-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: 'Clarity I',
                provider: member.name,
                effect: '+10 Mana regeneration per round',
                duration: 5
              });
              logChunk.push(`[PARTY] ${member.name} (Enchanter) casts [Clarity I] on you!`);
            } else {
              const splDmg = 25 + Math.floor(Math.random() * 15);
              activeMonsterHp = Math.max(0, activeMonsterHp - splDmg);
              logChunk.push(`[PARTY] ${member.name} (Enchanter) casts Mind Strike on ${combatMonster.name} for ${splDmg} psychic damage!`);
            }
          } else {
            const hasAlac = updatedBuffs.some(b => b.name === 'Alacrity');
            if (!hasAlac) {
              updatedBuffs.push({
                id: `buff-alac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: 'Alacrity',
                provider: member.name,
                effect: '+15% Speed (Double strike possibility)',
                duration: 3
              });
              logChunk.push(`[PARTY] ${member.name} (Enchanter) casts [Alacrity] on the team!`);
            } else {
              const splDmg = 20 + Math.floor(Math.random() * 10);
              activeMonsterHp = Math.max(0, activeMonsterHp - splDmg);
              logChunk.push(`[PARTY] ${member.name} (Enchanter) strikes ${combatMonster.name} for ${splDmg} psychic damage.`);
            }
          }
        } else if (member.class === 'Bard') {
          if (roleRoll > 0.5) {
            const hasSong = updatedBuffs.some(b => b.name === 'Hymn of Valor');
            if (!hasSong) {
              updatedBuffs.push({
                id: `buff-bard-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: 'Hymn of Valor',
                provider: member.name,
                effect: 'Attack power boosted (+5 Damage)',
                duration: 4
              });
              logChunk.push(`[PARTY] ${member.name} (Bard) plays [Hymn of Valor] on his lute! Your weapons hum.`);
            } else {
              const punch = 12 + Math.floor(Math.random() * 8);
              activeMonsterHp = Math.max(0, activeMonsterHp - punch);
              logChunk.push(`[PARTY] ${member.name} (Bard) punches ${combatMonster.name} for ${punch} physical damage.`);
            }
          } else {
            const hasChorus = updatedBuffs.some(b => b.name === 'Chorus of Replenishment');
            if (!hasChorus) {
              updatedBuffs.push({
                id: `buff-chorus-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                name: 'Chorus of Replenishment',
                provider: member.name,
                effect: '+6 HP & +3 Mana regeneration per round',
                duration: 4
              });
              logChunk.push(`[PARTY] ${member.name} (Bard) plays [Chorus of Replenishment] granting health and mana recovery!`);
            } else {
              const punch = 10 + Math.floor(Math.random() * 8);
              activeMonsterHp = Math.max(0, activeMonsterHp - punch);
              logChunk.push(`[PARTY] ${member.name} strikes ${combatMonster.name} for ${punch} damage.`);
            }
          }
        } else if (member.class === 'Monk') {
          const punch = 20 + Math.floor(Math.random() * 15);
          activeMonsterHp = Math.max(0, activeMonsterHp - punch);
          logChunk.push(`[PARTY] ${member.name} (Monk) executes a flying double-kick at ${combatMonster.name} for ${punch} damage!`);
        } else {
          // General strike
          const hit = 10 + Math.floor(Math.random() * 10);
          activeMonsterHp = Math.max(0, activeMonsterHp - hit);
          logChunk.push(`[PARTY] ${member.name} strikes ${combatMonster.name} for ${hit} damage.`);
        }
        return member;
      });
    }

    // Save updated buffs state
    setActiveBuffs(updatedBuffs);

    // C. Monster Retaliates
    let activePlayerHp = character.hp;
    if (activeMonsterHp > 0) {
      // Monster selects target
      const targetSelf = Math.random() > 0.3 || actionType === 'taunt';
      const monsterStr = combatMonster.level * 6 + 10;
      const monsterHit = Math.max(2, Math.floor(Math.random() * monsterStr) + 5);

      if (targetSelf) {
        if (isDodgingRef.current) {
          logChunk.push(`[SYSTEM] ${combatMonster.name} lunges at you, but you ROLL away! (Dodge Successful)`);
        } else {
          const ac = character.equipment.chest?.stats.ac || 0;
          const reducedHit = Math.max(1, monsterHit - Math.floor(ac / 4));
          activePlayerHp = Math.max(0, character.hp - reducedHit);
          logChunk.push(`[WARNING] ${combatMonster.name} bites you brutally for ${reducedHit} damage! (AC blocked ${monsterHit - reducedHit})`);
          
          setTimeout(() => {
            setCombatVisualEvent({
              id: Date.now() + 10,
              type: 'monster',
              label: combatMonster.name,
              amount: reducedHit,
            });
          }, 350);
        }
      } else if (activeParty.length > 0) {
        const idx = Math.floor(Math.random() * activeParty.length);
        if (activeParty[idx].hp > 0) {
          activeParty[idx].hp = Math.max(0, activeParty[idx].hp - monsterHit);
          logChunk.push(`[PARTY] ${combatMonster.name} swings around and hits ${activeParty[idx].name} for ${monsterHit} damage.`);
          
          setTimeout(() => {
            setCombatVisualEvent({
              id: Date.now() + 12,
              type: 'monster',
              label: combatMonster.name,
              amount: monsterHit,
            });
          }, 350);
        }
      }
    }

    // Update Local States
    setCombatParty(activeParty);
    const updatedMonster = { ...combatMonster, hp: activeMonsterHp };
    setCombatMonster(updatedMonster);

    // Create current round log object to feed Gemini
    const roundLogSample = {
      turnText: `Ready for combat action. Played initiative: ${actionName}.`,
      damages: [{ target: combatMonster.name, amount: dmgToMonster, type: actionType === 'melee' ? 'physical' : 'magic' }],
      heals: healToParty > 0 ? [{ target: character.name, amount: healToParty }] : []
    };

    // Keep state of logs
    const nextLogs = [...combatLogs, ...logChunk];
    setCombatLogs(nextLogs);

    // Perform Dungeon Master simulation via Gemini endpoint
    const partyNames = activeParty.map(p => p.name);
    setDmLoading(true);

    try {
      const response = await fetch('/api/gemini/combat-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: logChunk,
          playerMove: actionName,
          enemyName: combatMonster.name,
          partyNames: partyNames,
          playerClass: character.class,
          enemyHp: activeMonsterHp,
          maxEnemyHp: combatMonster.maxHp,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDmNarrative(data.description || 'The clashing weapons echo deep inside files.');
      }
    } catch (err) {
      console.error('Failed to update DM narrative:', err);
    } finally {
      setDmLoading(false);
    }

    // Checking Victory/Defeat conditions
    if (activeMonsterHp <= 0) {
      handleCombatVictory(updatedMonster);
    } else if (activePlayerHp <= 0) {
      handleCombatDefeat();
    } else {
      // Apply and save updated player state (mana, hp changes) factoring in party buffs
      let finalManaRegen = Math.floor(character.stats.int / 12) + 2;
      let finalHpRegen = 0;
      
      if (updatedBuffs.some(b => b.name === 'Clarity I')) {
        finalManaRegen += 10;
      }
      if (updatedBuffs.some(b => b.name === 'Song of Clarity')) {
        finalManaRegen += 6;
      }
      if (updatedBuffs.some(b => b.name === 'Chorus of Replenishment')) {
        finalManaRegen += 3;
        finalHpRegen += 6;
      }

      const postRegenPlayerHp = Math.min(character.maxHp, activePlayerHp + finalHpRegen);
      const postRegenPlayerMana = Math.min(character.maxMana, character.mana + finalManaRegen);

      saveCharacter({
        ...character,
        hp: postRegenPlayerHp,
        mana: postRegenPlayerMana,
      });
    }
  };

  const handleCombatVictory = (monster: typeof combatMonster) => {
    if (!character || !monster) return;

    const baseExp = Math.floor((monster.level * 180 + Math.floor(Math.random() * 50)) * (serverStateSettings.multiplierXP || 1.0));
    const baseGold = Math.floor((monster.level * 8 + Math.floor(Math.random() * 8)) * (serverStateSettings.multiplierGold || 1.0));
    let loot: Item | undefined;

    // Boss gets exceptional rare drops
    const lootChance = Math.random();
    if (monster.isBoss || lootChance > 0.65) {
      const lootTemplates = COMMON_TEMPLATES.merchantItems;
      const index = Math.floor(Math.random() * lootTemplates.length);
      loot = {
        ...lootTemplates[index],
        id: `loot-${Date.now()}`,
      };
    }

    // Process quests goals
    const updatedQuests = character.quests.map(quest => {
      if (quest.status === 'active') {
        // If quest giver has monster keyword in objective or description
        const matchesTarget = quest.objective.toLowerCase().includes(monster.name.toLowerCase()) || 
                              quest.description.toLowerCase().includes(monster.name.toLowerCase()) || 
                              quest.objective.toLowerCase().includes('gnoll') && monster.name.toLowerCase().includes('gnoll') ||
                              quest.objective.toLowerCase().includes('froglok') && monster.name.toLowerCase().includes('froglok') ||
                              quest.objective.toLowerCase().includes('beetle') && monster.name.toLowerCase().includes('beetle');
        
        if (matchesTarget) {
          const curProg = quest.progressCurrent + 1;
          const isDone = curProg >= quest.progressRequired;
          return {
            ...quest,
            progressCurrent: curProg,
            status: isDone ? ('completed' as const) : ('active' as const),
          };
        }
      }
      return quest;
    });

    // Check for level ups!
    let currentExp = character.exp + baseExp;
    let level = character.level;
    let nextThreshold = character.expToNextLevel;
    let leveledUp = false;

    if (currentExp >= nextThreshold) {
      level += 1;
      currentExp = currentExp - nextThreshold;
      nextThreshold = level * 1200;
      leveledUp = true;
    }

    const nextInventory = loot ? [...character.inventory, loot] : character.inventory;

    // Recover base health/mana slightly
    const updatedHp = Math.min(character.maxHp, character.hp + Math.floor(character.maxHp * 0.2));
    const updatedMana = Math.min(character.maxMana, character.mana + Math.floor(character.maxMana * 0.2));

    const updatedChar: PlayerCharacter = {
      ...character,
      level,
      exp: currentExp,
      expToNextLevel: nextThreshold,
      gold: character.gold + baseGold,
      hp: updatedHp,
      mana: updatedMana,
      quests: updatedQuests,
      inventory: nextInventory,
    };

    saveCharacter(updatedChar);

    setVictoryDetails({
      expEarned: baseExp,
      goldEarned: baseGold,
      itemLooted: loot,
    });

    setCombatOver(true);
    if (leveledUp) {
      triggerAlert(`ПОЗДРАВЛЯЕМ! Вы получили уровень ${level}! (Ding!)`, 'success');
    } else {
      triggerAlert(`Победа! Монстр ${monster.name} повержен. Получено ${baseExp} XP!`, 'success');
    }
  };

  const handleCombatDefeat = () => {
    if (!character) return;

    // Classic Everquest death penalty! Lose 8% of EXP threshold
    const penalty = Math.floor(character.expToNextLevel * 0.08);
    const finalExp = Math.max(0, character.exp - penalty);

    saveCharacter({
      ...character,
      hp: character.maxHp, // fully regenerate upon awakening
      mana: character.maxMana,
      exp: finalExp,
    });

    setCombatLogs((prev) => [
      ...prev,
      `[КРИТИЧЕСКИЙ КРАХ] Вы упали без сил! Призванные целители перенесли вас в безопасную зону за воротами.`,
      `[СИСТЕМА] Вы потеряли ${penalty} очков опыта в качестве штрафа за гибель в подземелье.`
    ]);

    setDmNarrative('Холодный камень бьет в лицо, сознание угасает. Насмешливый вой гноллов и темных тварей растворяется во тьме. Открыв глаза, вы обнаруживаете себя у ворот Холмов Кейноса под теплыми лучами солнца — вы немного ослабли, но готовы продолжить свой путь к величию...');
    setCombatOver(true);
    setVictoryDetails(null);
    triggerAlert('Вы погибли в подземелье! Возрождение у ворот Холмов Кейноса.', 'error');
  };

  const handleClaimQuestRewards = (questId: string) => {
    if (!character) return;
    const targetQuest = character.quests.find(q => q.id === questId);
    if (!targetQuest || targetQuest.status !== 'completed') return;

    let goldReward = targetQuest.rewardGold;
    let expReward = targetQuest.rewardExp;
    let itemLoot = targetQuest.rewardItem;

    let currentExp = character.exp + expReward;
    let level = character.level;
    let nextThreshold = character.expToNextLevel;
    let leveledUp = false;

    if (currentExp >= nextThreshold) {
      level += 1;
      currentExp = currentExp - nextThreshold;
      nextThreshold = level * 1200;
      leveledUp = true;
    }

    const updatedInventory = itemLoot ? [...character.inventory, itemLoot] : character.inventory;
    const remainingQuests = character.quests.filter(q => q.id !== questId);

    saveCharacter({
      ...character,
      level,
      exp: currentExp,
      expToNextLevel: nextThreshold,
      gold: character.gold + goldReward,
      inventory: updatedInventory,
      quests: remainingQuests,
    });

    triggerAlert(`Задание "${targetQuest.title}" завершено! Получено +${goldReward} золота и ${expReward} опыта.`, 'success');
  };

  // 8. View Renderers
  if (user === null) {
    return (
      <LoginScreen onLoginSuccess={(loggedInUser) => {
        setUser(loggedInUser);
        triggerAlert(`Добро пожаловать в игру, ${loggedInUser.username}!`, 'success');
      }} />
    );
  }

  if (!character) {
    if (characters.length > 0 && !isCreatingCharacter) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4 space-y-6">
          <div className="absolute top-4 right-4 text-xs">
            <button
               onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
               className="font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded cursor-pointer transition-all border border-slate-600"
             >
               {language === 'ru' ? 'EN' : 'RU'}
            </button>
          </div>
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-serif text-amber-500 font-bold uppercase tracking-widest text-shadow">{t('selectChar')}</h1>
            <p className="text-slate-400 font-mono text-sm max-w-lg mx-auto leading-relaxed">
              {language === 'ru' ? 'Выберите героя для погружения в бесшовный мир Этернии или создайте нового легендарного искателя приключений.' : 'Choose a hero to dive into the seamless world of Eternia, or create a new legendary adventurer.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-5xl w-full">
            {characters.map(c => (
              <div 
                key={c.name}
                className="bg-slate-900 border border-slate-700 hover:border-amber-500 p-5 rounded-lg shadow-lg cursor-pointer transition-all hover:scale-[1.02] group relative h-[200px] flex flex-col justify-between"
                onClick={() => {
                  setCharacter(c);
                  localStorage.setItem('eq3_character', JSON.stringify(c));
                  triggerAlert(`Вы вошли в мир за ${c.name}`, 'success');
                }}
              >
                <button
                  onClick={(e) => handleDeleteCharacter(c.name, e)}
                  title="Удалить персонажа"
                  className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold px-2 py-0.5"
                >
                  ✕
                </button>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-amber-400 group-hover:text-amber-300 text-lg truncate max-w-[160px]" title={c.name}>{c.name}</h3>
                    <span className="text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-500 font-mono font-bold shrink-0">{language === 'ru' ? 'Ур.' : 'Lvl'} {c.level}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono mb-4 border-b border-slate-800 pb-2">
                    {c.race} • {c.class}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500">
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded">
                    <span>HP</span> <span className="text-emerald-400 font-bold">{c.maxHp}</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded">
                    <span>MP</span> <span className="text-blue-400 font-bold">{c.maxMana}</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded">
                    <span>{language === 'ru' ? 'Золото' : 'Gold'}</span> <span className="text-amber-400">{c.gold}g</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-1.5 rounded">
                    <span>Бой</span> <span className="text-slate-300">{c.stats.str} СИЛ</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div 
              className="bg-slate-950/60 border-2 border-dashed border-slate-700 hover:border-amber-500/50 hover:bg-slate-900/50 p-5 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group h-[200px]"
              onClick={() => setIsCreatingCharacter(true)}
            >
              <div className="text-4xl text-slate-600 group-hover:text-amber-500 mb-2 transition-colors">+</div>
              <div className="text-sm font-mono text-slate-500 group-hover:text-amber-400 uppercase tracking-widest font-bold transition-colors text-center mt-2">
                {t('createChar')}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4 shadow-2xl relative">
        {characters.length > 0 && (
          <button 
            onClick={() => setIsCreatingCharacter(false)}
            className="absolute top-6 left-6 text-slate-400 hover:text-white font-mono text-[10px] cursor-pointer border border-slate-800 hover:border-slate-500 px-4 py-2 uppercase font-bold tracking-widest rounded bg-slate-900 z-10"
          >
            ← К выбору
          </button>
        )}
        <CharacterCreator onCreated={handleCharacterCreated} language={language} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-1000 font-sans text-gray-200 selection:bg-amber-600 selection:text-white overflow-hidden flex flex-col relative w-full">
      {/* Background World Effect */}
      <div 
         className="absolute inset-0 z-0 bg-cover bg-center opacity-15 pointer-events-none mix-blend-overlay transition-all duration-1000 ease-in-out transition-opacity"
         style={{ backgroundImage: `url('${activeZone?.imageUrl || 'https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=1920&auto=format&fit=crop'}')` }}
      ></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-1000 pointer-events-none"></div>
      
      {/* 1. Global Alert Toast */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md border shadow-lg max-w-sm flex items-start gap-3 animate-slide-in ${
          alert.type === 'success'
          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
          : alert.type === 'error'
          ? 'bg-rose-950 text-rose-300 border-rose-850'
          : 'bg-slate-900 text-amber-300 border-amber-900/60'
        }`}>
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      )}

      {/* 1.1 Region Allocation / Server Status Modal */}
      {showServerPanel && (
        <div className="fixed inset-0 bg-slate-1000/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-600 rounded-xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            {/* Title */}
            <div className="bg-gradient-to-r from-slate-950 to-slate-900 border-b border-amber-600/30 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-amber-500 animate-spin-slow" />
                <h3 className="font-serif text-sm font-bold tracking-wider text-slate-100 uppercase">
                  Realm Allocation Control
                </h3>
              </div>
              <button 
                onClick={() => setShowServerPanel(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer border border-slate-800 hover:bg-slate-800 px-2.5 py-1 rounded"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="text-xs text-slate-400 font-mono leading-relaxed bg-slate-950/50 p-3 rounded border border-slate-800">
                <span className="text-amber-500 font-bold block mb-1">🔧 OPERATIONS REPORT</span>
                This system guides connection assignments and clusters routing. Region us-west1 has been completely decommissioned and removed to avoid execution faults.
              </div>

              {/* Regions Stack */}
              <div className="space-y-3">
                {/* Europe West */}
                <div className="bg-slate-950/40 border border-emerald-500/20 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500 text-sm">🟢</span>
                      <h4 className="font-sans font-bold text-slate-200 text-sm">Europe Central (europe-west2)</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Location Host • Active Routing • Latency: ~14ms</p>
                  </div>
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Primary
                  </span>
                </div>

                {/* US East */}
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-lg flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500 text-sm">🟡</span>
                      <h4 className="font-sans font-bold text-slate-200 text-sm">US East (us-east1)</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Standby Gate • Idle • Latency: ~85ms</p>
                  </div>
                  <span className="bg-slate-900 text-slate-400 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                    Standby
                  </span>
                </div>

                {/* US West - Purged */}
                <div className="bg-red-950/10 border border-red-600/30 p-4 rounded-lg space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-red-500 text-sm">🔴</span>
                        <h4 className="font-sans font-bold text-red-400 text-sm line-through">US West (us-west1)</h4>
                      </div>
                      <p className="text-[11px] text-red-300 font-mono">Admission Denied • PURGED FROM REALM MANAGER</p>
                    </div>
                    <span className="bg-red-955 text-red-400 border border-red-600/50 text-[10px] font-bold px-2.5 py-0.5 rounded tracking-wider uppercase animation-pulse">
                      Purged / Deleted
                    </span>
                  </div>
                  <p className="text-[11px] text-red-500 font-mono leading-normal bg-red-950/20 p-2 rounded border border-red-500/10">
                    Warning: Admission to the us-west1 cluster is blocked entirely. All game logic, client entry ports, and dynamic server handshakes for this region have been permanently severed and deleted.
                  </p>
                </div>
              </div>

              {/* Simulated Terminal */}
              <div className="bg-slate-953 border border-slate-950 rounded p-3 select-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1"><Terminal className="h-3 w-3" /> Core Terminal Logs</span>
                  <span>SSL SECURE</span>
                </div>
                <pre className="font-mono text-[10px] text-red-400 line-clamp-4 space-y-0.5 leading-snug">
                  {`> sudo sysctl --disable-cluster region=us-west1
[INFO] Shutting down node pool "us-west1-gkey-eq3"...
[INFO] Evacuating dynamic state storage from us-west1... Done.
[SUCCESS] Cluster "us-west1" successfully deleted from MMO realm indexes!
[ALERT] Zero client traffic permitted for regional identifiers containing 'us-west1'`}
                </pre>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-950 border-t border-slate-800 px-5 py-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-mono">EQ3 Operational Rule v4.8</span>
              <button 
                onClick={() => setShowServerPanel(false)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 hover:text-black font-serif text-xs font-bold px-4 py-1.5 rounded shadow cursor-pointer transition-colors"
              >
                Acknowledge Block
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. Top HUD (MMORPG Style) */}
      <div className="absolute top-4 left-4 z-40 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 p-2 pr-6 rounded-full flex items-center gap-4 shadow-xl">
        <div 
           className="relative h-14 w-14 rounded-full bg-slate-950 border-2 border-amber-600 flex flex-col items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-amber-400 transition-colors" 
           onClick={() => setSelectedTab('character')}
           title="Character Profile"
        >
           <User className="h-6 w-6 text-amber-500 mb-1.5" />
           <div className="absolute bottom-0 w-full bg-slate-900 text-center text-[10px] font-bold text-amber-400 leading-tight border-t border-amber-600/50 pt-0.5 pb-0.5">
             {character.level}
           </div>
        </div>
        <div className="w-36 sm:w-48 space-y-1.5">
          <div className="flex justify-between items-end mb-1">
            <span className="font-bold text-white text-sm leading-none drop-shadow-md">{character.name}</span>
            <span className="text-[9px] text-slate-300 font-mono leading-none">{character.class}</span>
          </div>
          {/* Health Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 shadow-inner relative group cursor-help">
            <div className="bg-red-500 h-full transition-all duration-300 relative">
               {/* Shine effect */}
               <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white opacity-0 group-hover:opacity-100">{character.hp} / {character.maxHp}</span>
          </div>
          {/* Mana Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 shadow-inner relative group cursor-help">
            <div className="bg-cyan-500 h-full transition-all duration-300 relative">
               {/* Shine effect */}
               <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
            </div>
            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white opacity-0 group-hover:opacity-100">{character.mana} / {character.maxMana}</span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: Minimap / Zone Info */}
      <div className="absolute top-4 right-4 z-40 flex flex-col items-end gap-2">
         {/* Zone Name Header */}
         <div 
            className="bg-slate-900/80 backdrop-blur-md rounded border border-slate-700/80 px-4 py-2 text-right flex flex-col items-end shadow-xl cursor-default group hover:bg-slate-800 transition-colors" 
            onClick={() => setShowServerPanel(true)}
         >
            <div className="text-white font-bold text-sm tracking-widest drop-shadow-md flex items-center gap-2">
               <MapPin className="h-4 w-4 text-emerald-500" />
               {activeZone.name}
            </div>
            <div className="text-[10px] text-amber-500 font-mono drop-shadow-md mt-0.5">{t('simulatedServerInfo')}</div>
            
            {/* Extended Server Stats shown on hover/click */}
            <div className="hidden group-hover:flex gap-3 text-[9px] text-slate-400 mt-2 uppercase font-bold bg-slate-950 p-1.5 rounded">
               <span>PVP: OFF</span>
               <span>CH: 1</span>
               <span>PING: 14ms</span>
            </div>
         </div>
         {/* Settings / Lang / Logout */}
         <div className="flex gap-2">
            <button
               onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
               className="h-7 w-7 flex items-center justify-center font-bold bg-slate-800/80 hover:bg-slate-700 backdrop-blur text-slate-300 rounded cursor-pointer transition-all border border-slate-600 text-[10px] shadow"
               title="Language"
            >
               {language === 'ru' ? 'EN' : 'RU'}
            </button>
            <button 
               onClick={handleLogoutToSelect}
               className="h-7 w-7 flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 backdrop-blur border border-slate-600 hover:text-amber-400 rounded cursor-pointer transition-colors shadow"
               title="Change Character"
            >
               <Users className="h-3.5 w-3.5" />
            </button>
            <button 
               onClick={() => { localStorage.removeItem('eq3_user_session'); setUser(null); }}
               className="h-7 w-7 flex items-center justify-center bg-rose-950/80 hover:bg-rose-900 backdrop-blur border border-rose-800/80 text-rose-300 hover:text-white rounded cursor-pointer transition-colors shadow"
               title="Logout"
            >
               <LogOut className="h-3.5 w-3.5" />
            </button>
         </div>
         {/* Gold Dropdown */}
         <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700/80 mt-1 shadow-lg">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="font-bold text-amber-400 text-xs font-mono">{character.gold}</span>
         </div>
      </div>

      <main className="flex-1 w-full flex overflow-hidden pt-24 pb-20 relative z-10 px-4 gap-6">

        {/* MMO Floating Chat HUD */}
        <div className="hidden md:flex fixed bottom-20 left-4 z-40 w-[22rem] h-56 bg-gradient-to-t from-slate-950/90 to-transparent flex-col pointer-events-auto rounded transition-colors group border-b border-t-0 border-l-0 border-r-0 border-amber-900/50 hover:bg-slate-950/80 hover:border hover:border-slate-700/50">
           {/* Chat Log Viewport */}
           <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 text-[10px] font-mono leading-tight custom-scrollbar flex flex-col justify-end pb-2">
             {chatMessages.length === 0 ? (
               <div className="text-slate-600 italic">No messages...</div>
             ) : (
               chatMessages.slice(-15).map(msg => (
                 <div key={msg.id} className="drop-shadow-md bg-slate-950/40 px-1 py-0.5 rounded">
                    <span className={`font-bold transition-all text-[9px] uppercase ${
                      msg.channel === 'System'
                        ? 'text-red-400'
                        : msg.channel === 'Auction'
                        ? 'text-emerald-400'
                        : msg.channel === 'Shout'
                        ? 'text-amber-400 font-extrabold animate-pulse'
                        : msg.channel === 'Guild'
                        ? 'text-purple-400'
                        : 'text-violet-300'
                    }`}>
                      [{msg.channel === 'System' ? 'Система' : msg.channel === 'Auction' ? 'Торг' : msg.channel === 'Shout' ? 'Крик' : msg.channel === 'Guild' ? 'ГИ' : msg.channel}]
                    </span>{' '}
                    <span className="text-white font-extrabold cursor-pointer hover:text-amber-400">{msg.sender}:</span>{' '}
                    <span className="text-slate-200">{msg.text}</span>
                 </div>
               ))
             )}
           </div>
           
           {/* Quick Input Bar - Shows on Hover */}
           <form 
              onSubmit={handleSendChat}
              className="px-2 py-1.5 border-t border-slate-700/80 bg-slate-900/90 hidden group-hover:flex items-center gap-1.5 transition-all"
           >
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider font-mono">[{chatChannel === 'OOC' ? 'Флуд' : chatChannel === 'Auction' ? 'Торг' : chatChannel === 'Guild' ? 'ГИ' : chatChannel === 'Shout' ? 'Крик' : 'Сказать'}]</span>
              <input
                 type="text"
                 placeholder="Нажмите Enter, чтобы сказать..."
                 value={chatInput}
                 onChange={(e) => setChatInput(e.target.value)}
                 className="flex-1 bg-transparent border-none text-[10px] font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-0"
              />
           </form>
        </div>
        
        {/* ================= LEFT ASIDE PANEL: Status / Character Sheet ================= */}
        <aside className="hidden lg:flex flex-col w-[320px] shrink-0 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-4">
          
          {/* Attributes */}
          <section className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-lg p-4 shadow-xl">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Характеристики Героя
            </h3>
            
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">СИЛ (Сила)</span>
                <span className="font-bold text-amber-200">{character.stats.str}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">ВЫН (Выносливость)</span>
                <span className="font-bold text-emerald-200">{character.stats.sta}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">ЛОВ (Ловкость)</span>
                <span className="font-bold text-sky-200">{character.stats.agi}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">СНД (Сноровка)</span>
                <span className="font-bold text-indigo-200">{character.stats.dex}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">ИНТ (Интеллект)</span>
                <span className="font-bold text-purple-200">{character.stats.int}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">МУД (Мудрость)</span>
                <span className="font-bold text-blue-200">{character.stats.wis}</span>
              </div>
              <div className="flex justify-between bg-slate-950/60 p-1.5 rounded">
                <span className="text-slate-400">ХАР (Харизма)</span>
                <span className="font-bold text-pink-200">{character.stats.cha}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded border-t border-amber-600/10 mt-3 shadow-inner">
                <span className="text-amber-500">Exp до Уровня</span>
                <span className="font-bold text-amber-400">{character.exp} / {character.expToNextLevel}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-1.5 rounded">
                <span className="text-slate-500">Мировоззрение</span>
                <span className="font-bold text-slate-300 text-[10px] uppercase truncate max-w-[150px]">{character.deity}</span>
              </div>
            </div>
          </section>

          {/* Active Equipment Slots */}
          <section className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-lg p-4 shadow-xl">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              Снаряжение Героя
            </h3>

            <div className="space-y-2 text-xs font-mono">
              {(['primary', 'chest', 'head', 'hands', 'feet'] as SlotType[]).map((slot) => {
                const item = character.equipment[slot];
                const slotNamesEnRu: Record<string, string> = {
                  primary: 'Главная рука',
                  chest: 'Грудь',
                  head: 'Шлем',
                  hands: 'Перчатки',
                  feet: 'Сапоги',
                  secondary: 'Вторая рука',
                  arms: 'Наручи',
                  legs: 'Поножи'
                };
                return (
                  <div key={slot} className="bg-slate-1000/90 p-2 rounded border border-slate-700/80 flex items-center justify-between gap-2 min-h-[46px] shadow-sm">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">{slotNamesEnRu[slot] || slot}</span>
                      {item ? (
                        <span className={`font-semibold text-[11px] block mt-0.5 ${
                          item.rarity === 'epic' ? 'text-amber-400 font-bold drop-shadow-md' : item.rarity === 'rare' ? 'text-blue-400 drop-shadow' : 'text-slate-200'
                        }`}>
                          {item.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600 italic">Пусто (Empty)</span>
                      )}
                    </div>
                    {item && (
                      <button
                        onClick={() => handleUnequipItem(slot)}
                        className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 py-1.5 px-2.5 rounded font-bold cursor-pointer transition-all shrink-0 border border-slate-700 hover:border-red-900"
                      >
                        Снять
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        {/* ================= CENTER PANELS: Main Game Viewport & Tabs ================= */}
        <section className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* Action Bar (MMO Top/Bottom Hotbar) */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 flex flex-col items-center">
            {/* EXP Bar overlay */}
            <div className="w-full bg-slate-950 h-2 border border-slate-800 rounded-t-md overflow-hidden relative shadow-[0_0_10px_rgba(0,0,0,0.5)]">
               <div 
                  className="bg-purple-600/80 h-full transition-all duration-300 drop-shadow-[0_0_5px_rgba(147,51,234,0.8)]"
                  style={{ width: `${(character.exp / character.expToNextLevel) * 100}%` }}
               />
               {/* Notches */}
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI0Ij48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSI0IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMykiLz48L3N2Zz4=')]"></div>
            </div>
            
            <div className="bg-slate-900/90 backdrop-blur-lg border border-slate-700/80 p-1.5 rounded-b-xl shadow-2xl flex items-center justify-center gap-1 w-full max-w-fit shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
              {[
                { id: 'zones', icon: Compass, label: t('zones'), key: '1' },
                { id: 'lore', icon: BookOpen, label: t('lore'), key: '2' },
                { id: 'quests', icon: Database, label: t('quests'), key: '3' },
                { id: 'merchant', icon: ShoppingCart, label: t('merchant'), key: '4' },
                { id: 'character', icon: User, label: t('character'), key: 'C' },
                { id: 'guild-party', icon: Users, label: t('guild-party'), key: 'G' },
                { id: 'chat', icon: MessageSquare, label: t('chat'), key: 'Enter' },
                { id: 'dungeons', icon: Flame, label: t('dungeons'), key: 'R' },
                { id: 'crafting-market', icon: Hammer, label: t('craft-market'), key: 'M' },
                { id: 'pets-housing', icon: Sparkles, label: t('pets-housing'), key: 'P' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => { setSelectedTab(btn.id); if(btn.id === 'zones') setInCombat(false); }}
                  className={`group relative h-12 w-12 sm:h-12 sm:w-auto sm:px-3 sm:py-1 rounded-md transition-all flex flex-col justify-center items-center gap-0.5 cursor-pointer border ${
                    selectedTab === btn.id && (!inCombat || btn.id !== 'zones')
                      ? 'bg-amber-600 border-amber-400 text-slate-950 shadow-[0_0_15px_rgba(217,119,6,0.6)] z-10' 
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-amber-400 hover:border-slate-600'
                  }`}
                  title={btn.label}
                >
                  <btn.icon className={`h-5 w-5 ${btn.id === 'dungeons' && selectedTab !== btn.id ? 'text-red-400' : ''}`} />
                  <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider font-mono">{btn.label}</span>
                  
                  {/* Hotkey Hint */}
                  <span className={`absolute -top-2 -right-2 text-[8px] font-mono font-bold px-1 rounded shadow-sm border ${
                    selectedTab === btn.id && (!inCombat || btn.id !== 'zones')
                     ? 'bg-slate-900 border-amber-400/50 text-amber-500'
                     : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}>
                    {btn.key}
                  </span>
                </button>
              ))}
              
              {user?.isAdmin && (
                <button
                  onClick={() => setSelectedTab('admin')}
                  className={`group relative h-12 w-12 sm:h-12 sm:w-auto sm:px-3 sm:py-1 rounded-md transition-all flex flex-col justify-center items-center gap-0.5 cursor-pointer border ${
                    selectedTab === 'admin' 
                      ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.6)] z-10' 
                      : 'bg-slate-950/80 border-red-900/50 text-red-500 hover:bg-red-900/40 hover:text-red-400 hover:border-red-700'
                  }`}
                >
                  <Terminal className="h-5 w-5" />
                  <span className="hidden sm:block text-[9px] font-bold uppercase tracking-wider font-mono">Админ</span>
                  <span className="absolute -top-2 -right-2 text-[8px] font-mono font-bold px-1 rounded shadow-sm border bg-slate-800 border-red-900 text-red-400">
                    ~
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Actual Combat View Overlay - takes precedence if inCombat is true */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-2 pb-14 space-y-4">
            {inCombat && combatMonster ? (
            <div className="bg-slate-900 border border-amber-600/30 rounded-lg p-5 shadow-xl animate-fade-in relative space-y-4">
              
              <div className="absolute top-3 right-3 bg-red-950 border border-red-800 text-red-400 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wide">
                Active Dungeon Battle
              </div>

              {/* Retro Canvas 2D Battle Arena */}
              <Combat2DArena
                character={character}
                activeZone={activeZone}
                combatParty={combatParty}
                combatMonster={combatMonster}
                visualTrigger={combatVisualEvent}
              />

              {/* Monster & Party pools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                
                {/* Monster */}
                <div className="space-y-2 bg-slate-950 p-3.5 rounded border border-red-900/40">
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Sword className="h-4 w-4 text-red-500 animate-pulse" />
                      {combatMonster.name} {combatMonster.isBoss && '👹 (Boss)'}
                    </span>
                    <span className="text-xs text-red-400 font-mono">Level {combatMonster.level}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Target HP</span>
                    <span>{combatMonster.hp} / {combatMonster.maxHp}</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-red-600 h-full transition-all duration-300"
                      style={{ width: `${(combatMonster.hp / combatMonster.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* You & Your Companion Mates */}
                <div className="space-y-3 bg-slate-950 p-3.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider font-bold block">Party status</span>
                  
                  {/* Yourself */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-white">
                      <span>{character.name} (You)</span>
                      <span>{character.hp} / {character.maxHp} HP</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mt-1">
                      <div 
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(character.hp / character.maxHp) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Companions AI */}
                  {combatParty.map((mate, i) => (
                    <div key={i} className="pt-0.5">
                      <div className="flex justify-between text-xs text-slate-300">
                        <span>{mate.name} ({mate.class})</span>
                        <span>{mate.hp} / {mate.maxHp} HP</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1 mt-0.5 overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full"
                          style={{ width: `${(mate.hp / mate.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Active Party Buffs Section */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-amber-500 uppercase font-mono tracking-wider font-bold flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                        Active Party Buffs
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {activeBuffs.length} Active
                      </span>
                    </div>

                    {activeBuffs.length > 0 ? (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {activeBuffs.map((buff) => (
                          <div 
                            key={buff.id} 
                            className="bg-slate-900 border border-slate-800/80 rounded px-2.5 py-1.5 flex items-start justify-between gap-1.5 text-[11px] font-mono hover:border-amber-600/20 transition-all duration-200"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-amber-300 text-[11px] truncate">
                                  {buff.name}
                                </span>
                                <span className="text-[9px] text-slate-500 shrink-0">
                                  from {buff.provider}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-tight">
                                {buff.effect}
                              </p>
                            </div>
                            <div className="bg-amber-950/40 border border-amber-900/40 rounded px-1.5 py-0.5 text-amber-400 text-[9px] font-bold shrink-0">
                              {buff.duration} {buff.duration === 1 ? 'rnd' : 'rnds'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-900/40 border border-dashed border-slate-800/60 rounded p-2 text-center text-slate-600 text-[10px] italic font-mono">
                        No active party enhancements
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* DUNGEON MASTER PROMPT NARRATIVE BOX */}
              <div className="bg-slate-1000 p-4 rounded-lg border border-amber-900/20 text-sm italic font-serif leading-relaxed text-amber-100/90 relative">
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase tracking-wider block mb-1">
                  ⚔️ Dungeon Master Chronicle
                </span>
                {dmLoading && (
                  <div className="absolute inset-0 bg-slate-900/95 flex items-center justify-center gap-2 rounded-lg">
                    <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
                    <span className="text-xs text-slate-400 font-mono">Formulating combat collision flow...</span>
                  </div>
                )}
                <p className="indent-4">{dmNarrative}</p>
              </div>

              {/* Action Log List */}
              <div className="bg-slate-950 rounded p-3 h-28 overflow-y-auto border border-slate-800 text-[11px] font-mono space-y-1">
                {combatLogs.map((log, i) => (
                  <div key={i} className={`p-1 rounded ${
                    log.includes('[WARNING]')
                      ? 'text-rose-400 bg-rose-950/20'
                      : log.includes('[PARTY]')
                      ? 'text-cyan-400 bg-cyan-950/10'
                      : log.includes('[SYSTEM]')
                      ? 'text-slate-400 font-bold'
                      : 'text-slate-300'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>

              {/* ACTIONS STRIP OR VICTORY SUMMARY */}
              {combatOver ? (
                <div className="bg-slate-950 border border-amber-500/10 rounded-lg p-5 text-center space-y-4">
                  
                  {victoryDetails ? (
                    <div className="space-y-3">
                      <h4 className="font-serif text-xl font-black text-amber-400 flex items-center justify-center gap-1.5">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        BATTLING VICTORY!
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {combatMonster.name} lies defeated before your party and fades into planar ashes.
                      </p>
                      
                      <div className="flex justify-center gap-4 text-sm font-mono pt-2">
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                          <span className="text-slate-500 block text-[10px]">GOLD LOOT</span>
                          <span className="font-extrabold text-amber-300">+{victoryDetails.goldEarned} Gold</span>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-3 rounded">
                          <span className="text-slate-500 block text-[10px]">EXP EARNED</span>
                          <span className="font-extrabold text-purple-400">+{victoryDetails.expEarned} XP</span>
                        </div>
                      </div>

                      {victoryDetails.itemLooted && (
                        <div className="max-w-xs mx-auto p-3.5 bg-slate-900 border border-amber-500/20 rounded mt-3">
                          <span className="text-[10px] text-amber-500 uppercase font-mono font-bold block mb-1">Epic Loot Discovered!</span>
                          <h5 className="font-bold text-sm text-yellow-300">{victoryDetails.itemLooted.name}</h5>
                          <span className="text-xs text-slate-400 block mt-1 leading-tight">{victoryDetails.itemLooted.description}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-serif text-xl font-bold text-red-500 uppercase">Perished in Battle</h4>
                      <p className="text-xs text-slate-400 mt-1">Healers dragged your party back. Rest and seek items before engaging tough monsters.</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => setInCombat(false)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-2.5 rounded uppercase text-xs tracking-wider cursor-pointer"
                    >
                      Return to Exploration
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Engage Combat Move</span>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      {comboField.active && (
                        <span className="text-amber-400 font-bold bg-amber-950/40 px-2 rounded border border-amber-900/50 flex items-center gap-1 animate-pulse">
                          🔥 COMBO FIELD ACTIVE
                        </span>
                      )}
                      <span className="text-emerald-400 font-bold">Stamina: {stamina}/100</span>
                      {combatGcd && <span className="text-rose-400 animate-pulse font-bold">[GLOBAL COOLDOWN]</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCombatAction('melee')}
                      disabled={combatGcd}
                      className={`font-mono py-2.5 px-4 rounded text-xs shrink-0 flex items-center gap-1.5 transition-all
                        ${combatGcd 
                          ? 'bg-slate-800/50 text-slate-600 border border-slate-800/50 cursor-not-allowed' 
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:text-white cursor-pointer'
                        }`}
                    >
                      <Sword className="h-4 w-4 text-red-400" />
                      Melee Strike
                    </button>
                    
                    <button
                      onClick={() => handleCombatAction('dodge')}
                      disabled={combatGcd || stamina < 30}
                      title="Consumes 30 Stamina. 100% chance to evade the next monster attack."
                      className={`font-mono py-2.5 px-4 rounded text-xs shrink-0 flex items-center gap-1.5 transition-all
                        ${combatGcd || stamina < 30
                          ? 'bg-slate-800/50 text-slate-600 border border-slate-800/50 cursor-not-allowed' 
                          : 'bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 cursor-pointer hover:text-emerald-300'
                        }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Tactical Dodge (30s)
                    </button>

                    {character.class === 'Warrior' || character.class === 'Paladin' || character.class === 'Shadow Knight' ? (
                      <button
                        onClick={() => handleCombatAction('taunt')}
                        disabled={combatGcd}
                        className={`font-mono py-2.5 px-4 rounded text-xs shrink-0 flex items-center gap-1.5 transition-all
                          ${combatGcd
                            ? 'bg-slate-800/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:text-white cursor-pointer'
                          }`}
                      >
                        <Shield className="h-4 w-4 text-emerald-400" />
                        Guard Taunt
                      </button>
                    ) : null}

                    {currentSpells.map(spell => {
                      const isOnCd = spellCooldowns[spell.id] > 0;
                      return (
                      <button
                        key={spell.id}
                        onClick={() => handleCombatAction(spell)}
                        disabled={combatGcd || character.mana < spell.manaCost || isOnCd}
                        title={spell.effect}
                        className={`font-mono py-2.5 px-4 rounded text-xs shrink-0 flex items-center gap-1 transition-all relative overflow-hidden
                          ${combatGcd || character.mana < spell.manaCost || isOnCd
                            ? 'bg-slate-800/50 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-705 hover:text-white cursor-pointer'
                          }`}
                      >
                        {isOnCd && (
                           <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-rose-500 z-10 backdrop-blur-[1px]">
                             {spellCooldowns[spell.id]}
                           </div>
                        )}
                        <Wand2 className={`h-4 w-4 ${isOnCd ? 'text-slate-600' : 'text-cyan-400'}`} />
                        Cast {spell.name} <span className="text-[10px] text-slate-500 ml-1">({spell.manaCost}m)</span>
                      </button>
                    )})}
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                     <div 
                        className="bg-emerald-400 h-full transition-all duration-300"
                        style={{ width: `${stamina}%` }}
                     />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono pt-1">Dodging costs stamina. Spells consume Mana. Actions trigger a 1.2s Global Cooldown.</p>
                </div>
              )}

            </div>
          ) : (
            /* TAB 1: Explorations & Fighting Monsters */
            selectedTab === 'zones' && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm space-y-6 relative overflow-hidden">
                {/* Active Zone Visual Header */}
                <div className="relative h-64 w-full flex items-end p-6 border-b border-amber-900/40">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url('${activeZone.imageUrl || 'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=1920&auto=format&fit=crop'}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                  <div className="absolute inset-0 bg-slate-900/20"></div>
                  
                  <div className="relative z-10 w-full max-w-2xl">
                     <div className={`text-[10px] font-extrabold uppercase mb-2 inline-block px-2 py-1 rounded backdrop-blur-md shadow-lg ${
                        activeZone.difficulty === 'Safe' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : activeZone.difficulty === 'Easy' ? 'bg-blue-950/80 text-blue-400 border border-blue-800/50'
                        : activeZone.difficulty === 'Medium' ? 'bg-yellow-950/80 text-yellow-400 border border-yellow-800/50'
                        : 'bg-red-950/80 text-red-400 border border-red-800/50'
                     }`}>
                        Угроза: {activeZone.difficulty}
                     </div>
                     <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg tracking-tight mb-2">
                        {activeZone.name}
                     </h2>
                     <p className="text-sm font-mono text-slate-300 drop-shadow-md leading-relaxed hidden sm:block">
                        {activeZone.description}
                     </p>
                  </div>
                </div>

                <div className="p-5 space-y-6 relative z-10 bg-slate-900/90 backdrop-blur-sm -mt-6">
                  {/* Zone Select Grid */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-500" /> Исследовать другие регионы</span>
                      <span className="text-[10px] text-emerald-500 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">Бесшовный Переход</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {GAME_ZONES.map((zone) => (
                        <button
                          key={zone.id}
                          onClick={() => {
                            setActiveZone(zone);
                            setLoreTopic(zone.name);
                          }}
                          className={`text-slate-100 h-24 p-0 rounded-lg font-mono border text-left transition-all relative overflow-hidden group cursor-pointer ${
                            activeZone.id === zone.id
                              ? 'border-amber-500 ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                              : 'border-slate-700 hover:border-amber-500/50 hover:shadow-lg'
                          }`}
                        >
                          <div 
                             className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                             style={{ backgroundImage: `url('${zone.imageUrl || ''}')` }}
                          />
                          <div className={`absolute inset-0 ${activeZone.id === zone.id ? 'bg-slate-900/60' : 'bg-slate-900/80 group-hover:bg-slate-900/60'} transition-colors duration-300`} />
                          
                          <div className="absolute inset-0 p-3 flex flex-col justify-end">
                             <div className="font-bold text-xs truncate text-white drop-shadow-md">{zone.name}</div>
                             <div className="text-[9px] font-medium text-amber-400 mt-0.5 uppercase drop-shadow">Lvl {zone.minLevel}+</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2D Map Explorer Grid */}
                <MapExplorer2D
                  activeZone={activeZone}
                  character={character}
                  playerX={playerX}
                  playerY={playerY}
                  mapEntities={mapEntities}
                  onPlayerMove={handlePlayerMove}
                  MAP_COLS={MAP_COLS}
                  MAP_ROWS={MAP_ROWS}
                  isObstacle={isObstacle}
                />

                {/* Fast Travel & Transport Hub */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm mt-6">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5 mb-4">
                    <Compass className="h-5 w-5 text-emerald-400" />
                    <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                      Врата & Транспорт
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Public portals / Waystones */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold text-slate-500 font-mono">Мировые Врата (Телепортация):</p>
                      <div className="space-y-2">
                        {GAME_ZONES.filter(z => z.id !== activeZone.id).map(z => (
                          <div key={z.id} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Врата в {z.name}</div>
                              <div className="text-[9px] text-slate-500 mt-0.5">Уровень: {z.minLevel}+</div>
                            </div>
                            <button
                              disabled={character.gold < 5}
                              onClick={() => {
                                const updatedChar = { ...character, gold: character.gold - 5 };
                                saveCharacter(updatedChar);
                                setActiveZone(z);
                                setLoreTopic(z.name);
                                triggerAlert(`Вы телепортировались в ${z.name}! Списано 5 золота.`, 'success');
                              }}
                              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/50 rounded text-xs uppercase tracking-wider font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              5g
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mounts */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold text-slate-500 font-mono">Ездовые Животные (Маунты):</p>
                      <div className="bg-slate-950 p-4 border border-slate-800 rounded text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
                        <div className="text-3xl mb-2">🐎</div>
                        <h4 className="font-bold text-sm text-amber-500 mb-1">Гнедой Скакун</h4>
                        <p className="text-xs text-slate-400 font-mono pb-3">+40% к скорости перемещения по глобальной карте</p>
                        
                        <div className="flex justify-center">
                          <button 
                            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-2 text-xs uppercase tracking-wider font-bold rounded transiton-colors cursor-pointer"
                            onClick={() => triggerAlert('Вы оседлали скакуна. Скорость перемещения увеличена!', 'info')}
                          >
                            Оседлать (Скоро!)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Zone Description Profile */}
                <div className="bg-slate-952 p-4 rounded-lg border border-slate-800/80 space-y-2 mt-6">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-serif text-base text-white">Хроники локации: {activeZone.name}</span>
                    <button
                      onClick={() => {
                        setSelectedTab('lore');
                        setLoreSearch(activeZone.name);
                        // Trigger lookup directly
                        const triggerDirectLore = async () => {
                          setLoreLoading(true);
                          try {
                            const response = await fetch('/api/gemini/lore', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ topic: activeZone.name }),
                            });
                            if (response.ok) {
                              const data = await response.json();
                              setLoreResponse(data);
                            }
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setLoreLoading(false);
                          }
                        };
                        triggerDirectLore();
                      }}
                      className="text-[10px] text-amber-500 font-mono hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3" />
                      Прочесть летопись
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif">{activeZone.description}</p>
                </div>

                {/* Available Monsters Section (The Grind loop) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Существа в этой локации:
                    </span>
                    <button 
                      onClick={handleRequestQuest}
                      disabled={questLoading}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-500 border border-slate-700 px-3 py-1 rounded cursor-pointer disabled:opacity-40 transition-all flex items-center gap-1 font-mono font-bold"
                    >
                      {questLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                      📜 Начать побочное задание
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {activeZone.monsters.map((monster, i) => (
                      <div 
                        key={i} 
                        className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between gap-4 transition-all hover:border-slate-700"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-sm text-slate-200">{monster.name}</span>
                            {monster.isBoss && (
                              <span className="text-[9px] bg-amber-950 text-amber-400 font-black tracking-wide border border-amber-900 px-1 py-0.5 rounded uppercase">
                                Босс зоны
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Уровень: {monster.level}</span>
                            <span>•</span>
                            <span>Здоровье: {monster.hp}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInitiateCombat(monster)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-wide cursor-pointer shadow-md transition-all flex items-center gap-1"
                        >
                          <Sword className="h-3.5 w-3.5" />
                          Атаковать
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            )
          )}

          {/* TAB 2: Tome of Norrath Deep Lore Book library */}
          {selectedTab === 'lore' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-5 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="h-5 w-5 text-amber-500" />
                  Архивы Этернии (Масштабный Мир)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Обратитесь к глобальным архивам. Ищите любую локацию, расу, кибер-город или мифическое существо, чтобы исследовать лор бесшовной вселенной с использованием ИИ.
                </p>
              </div>

              {/* Input for AI archives */}
              <form onSubmit={handleSearchLore} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g., Mayong Mistmoore, Oasis of Marr, Short Sword of Ykesha"
                  value={loreSearch}
                  onChange={(e) => setLoreSearch(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={loreLoading || !loreSearch.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 text-xs uppercase tracking-wide rounded cursor-pointer disabled:opacity-40 flex items-center gap-1.5 transition-all font-mono"
                >
                  {loreLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="h-4 w-4 text-slate-950" />
                  )}
                  Query
                </button>
              </form>

              {/* Display lore result */}
              {loreResponse && (
                <div className="bg-slate-950 rounded p-4 border border-slate-800/80 space-y-3 relative font-serif leading-relaxed">
                  {loreLoading && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 rounded">
                      <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                      <span className="text-xs text-slate-400 font-mono">Сборка архивных хроник магии...</span>
                    </div>
                  )}

                  <h4 className="text-amber-400 font-bold text-base border-b border-slate-850 pb-1 font-serif flex items-center gap-1">
                    📖 Летописи хроники: {loreResponse.title}
                  </h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line indent-4">{loreResponse.text}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Active Quests Tab */}
          {selectedTab === 'quests' && character && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                    <Database className="h-5 w-5 text-amber-500" />
                    Летопись Героя (Задания)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Отслеживайте свои великие свершения и побочные миссии.</p>
                </div>
                
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setQuestSubTab('msq')}
                    className={`px-4 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      questSubTab === 'msq' ? 'bg-amber-600 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Главный Сюжет (MSQ)
                  </button>
                  <button
                    onClick={() => setQuestSubTab('side')}
                    className={`px-4 py-1.5 rounded text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                      questSubTab === 'side' ? 'bg-amber-600 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Побочные (Гильдия)
                  </button>
                </div>
              </div>

              {questSubTab === 'msq' && (
                <div className="space-y-4">
                  {/* MSQ List */}
                  {MAIN_SCENARIO_QUESTS.map((stage) => {
                    const charProgress = character.msqProgress || { chapter: 1, stage: 1, completed: false };
                    
                    // The quest is active if it matches charProgress
                    const isActive = charProgress.chapter === stage.chapter && charProgress.stage === stage.stage && !charProgress.completed;
                    
                    // The quest is completed if charProgress is beyond this stage
                    const isCompleted = charProgress.chapter > stage.chapter || (charProgress.chapter === stage.chapter && charProgress.stage > stage.stage) || (charProgress.chapter === stage.chapter && charProgress.stage === stage.stage && charProgress.completed);
                    
                    // The quest is locked if char progress is before this stage
                    const isLocked = !isActive && !isCompleted;

                    return (
                      <div 
                        key={stage.id} 
                        className={`border rounded-lg p-4 transition-all relative overflow-hidden ${
                          isActive 
                            ? 'bg-slate-950 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                            : isCompleted 
                              ? 'bg-slate-900/50 border-emerald-900/40 opacity-75' 
                              : 'bg-slate-950/30 border-slate-850 opacity-40 grayscale'
                        }`}
                      >
                        {isActive && (
                           <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                             <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-l from-amber-500/20 to-transparent"></div>
                           </div>
                        )}
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">
                              Судьба Этернии: Том {stage.chapter}, Глава {stage.stage}
                            </span>
                            <h4 className={`font-serif font-black flex items-center gap-2 ${
                              isActive ? 'text-amber-400 text-lg' : isCompleted ? 'text-emerald-500' : 'text-slate-400'
                            }`}>
                              {stage.title}
                            </h4>
                          </div>

                          <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                            isActive ? 'bg-amber-950 text-amber-400 outline outline-1 outline-amber-700/50' 
                            : isCompleted ? 'bg-emerald-950/30 text-emerald-600' 
                            : 'bg-slate-900 text-slate-600'
                          }`}>
                            {isActive ? 'АКТИВНАЯ ГЛАВА' : isCompleted ? 'ПРОЙДЕНО' : 'ЗАБЛОКИРОВАНО'}
                          </span>
                        </div>

                        {(isActive || isCompleted) && (
                           <div className="mt-3 space-y-3">
                             <p className={`text-xs italic leading-relaxed ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                               {stage.description}
                             </p>
                             
                             <div className={`p-3 rounded border font-mono text-[11px] ${
                               isActive ? 'bg-slate-900 border-amber-900/30' : 'bg-slate-950 border-emerald-900/20'
                             }`}>
                               <span className="text-slate-500 uppercase block mb-1">Текущая задача:</span>
                               <span className={isActive ? 'text-slate-200' : 'text-emerald-500/60 line-through'}>{stage.objective}</span>
                             </div>

                             {isActive && (
                               <div className="pt-2 flex flex-wrap gap-4 items-center justify-between">
                                  <div className="flex gap-3 text-[11px] font-mono text-slate-400">
                                    <span>Награда (золото): <span className="text-amber-300 font-bold">{stage.rewards.gold}g</span></span>
                                    <span>Награда (опыт): <span className="text-purple-400 font-bold">{stage.rewards.exp}xp</span></span>
                                    {stage.rewards.item && <span>Предмет: <span className="text-cyan-400 font-bold">Снаряжение героя</span></span>}
                                  </div>
                                  <button
                                    onClick={() => triggerAlert('Функция прохождения сюжета временно недоступна в демо-версии. (Можно привязать к боевой системе).', 'info')}
                                    className="bg-amber-600 hover:bg-amber-500 text-slate-900 font-black px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                                  >
                                    Перейти к заданию
                                  </button>
                               </div>
                             )}
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {questSubTab === 'side' && (
              <>
                {character.quests.length === 0 ? (
                  <div className="bg-slate-950 rounded p-6 text-center border border-slate-800/60 font-mono">
                    <p className="text-xs text-slate-500">В вашем свитке заданий нет активных миссий от гильдии.</p>
                    <button
                      onClick={handleRequestQuest}
                      disabled={questLoading}
                      className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-955 font-black px-4 py-2 text-xs uppercase tracking-wider rounded cursor-pointer font-bold inline-block disabled:opacity-50"
                    >
                      {questLoading ? 'Поиск заданий...' : 'Получить задание Гильдии'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {character.quests.map((quest) => (
                      <div key={quest.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <div>
                            <h4 className="font-serif text-sm font-bold text-amber-400">{quest.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono block">Поручитель: {quest.giver}</span>
                          </div>
                          
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                            quest.status === 'completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {quest.status === 'completed' ? 'Выполнено' : 'Активно'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 italic leading-relaxed font-serif">{quest.description}</p>
                        
                        <div className="text-xs font-mono bg-slate-900 p-2.5 rounded border border-slate-850 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Ход задания:</span>
                          <div className="text-slate-200">{quest.objective}</div>
                          <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                            <span>Повержено существ:</span>
                            <span className="text-amber-500 font-extrabold">{quest.progressCurrent} / {quest.progressRequired}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-1.5">
                          <div className="flex gap-3 text-[11px] font-mono text-slate-400">
                            <span>Награда (золото): <span className="text-amber-300 font-bold">{quest.rewardGold}g</span></span>
                            <span>Награда (опыт): <span className="text-purple-400 font-bold">{quest.rewardExp}xp</span></span>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {quest.status === 'completed' ? (
                              <button
                                onClick={() => handleClaimQuestRewards(quest.id)}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-3 py-1.5 text-xs rounded transition-colors uppercase tracking-wider cursor-pointer"
                              >
                                Сдать квест
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAbandonQuest(quest.id)}
                                className="bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 font-bold px-3 py-1.5 border border-slate-700 hover:border-red-800 rounded text-xs transition-colors cursor-pointer"
                              >
                                Отменить
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
              )}
            </div>
          )}

          {/* TAB 4: Trade Tunnel Merchant Store */}
          {selectedTab === 'merchant' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                  Торговец в Туннеле Восточных Степей
                </h3>
                <p className="text-xs text-slate-500 mt-1">Покупайте редкое оружие и тяжелую броню, или продавайте добытые трофеи за золото.</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-950 p-3 rounded border border-slate-800">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Редкость (Rarity)</label>
                  <select 
                    value={merchantFilterRarity}
                    onChange={(e) => setMerchantFilterRarity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-amber-500"
                  >
                    <option value="all">Все (All)</option>
                    <option value="common">Обычный (Common)</option>
                    <option value="uncommon">Необычный (Uncommon)</option>
                    <option value="rare">Редкий (Rare)</option>
                    <option value="epic">Эпический (Epic)</option>
                  </select>
                </div>
                
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Класс (Class)</label>
                  <select 
                    value={merchantFilterClass}
                    onChange={(e) => setMerchantFilterClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1.5 rounded outline-none focus:border-amber-500"
                  >
                    <option value="all">Все Классы</option>
                    <option value="Warrior">Warrior</option>
                    <option value="Paladin">Paladin</option>
                    <option value="Shadow Knight">Shadow Knight</option>
                    <option value="Cleric">Cleric</option>
                    <option value="Druid">Druid</option>
                    <option value="Shaman">Shaman</option>
                    <option value="Necromancer">Necromancer</option>
                    <option value="Wizard">Wizard</option>
                    <option value="Magician">Magician</option>
                    <option value="Enchanter">Enchanter</option>
                    <option value="Ranger">Ranger</option>
                    <option value="Rogue">Rogue</option>
                    <option value="Monk">Monk</option>
                    <option value="Bard">Bard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_TEMPLATES.merchantItems
                  .filter(item => {
                    if (merchantFilterRarity !== 'all' && item.rarity !== merchantFilterRarity) return false;
                    if (merchantFilterClass !== 'all' && item.allowedClasses && !item.allowedClasses.includes(merchantFilterClass as any)) return false;
                    return true;
                  })
                  .map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded p-3.5 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`font-sans font-bold text-sm ${
                          item.rarity === 'epic' ? 'text-amber-400' : item.rarity === 'rare' ? 'text-blue-400' : 'text-slate-200'
                        }`}>
                          {item.name}
                        </span>
                        
                        <span className="text-[10px] font-mono capitalize text-slate-500 font-bold">{item.slot} slot</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 font-serif leading-tight">{item.description}</p>
                      
                      {/* Stats list */}
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-amber-500/80 mt-1.5 border-b border-slate-900 pb-1.5">
                        {item.stats.str && <span>STR +{item.stats.str}</span>}
                        {item.stats.sta && <span>STA +{item.stats.sta}</span>}
                        {item.stats.agi && <span>AGI +{item.stats.agi}</span>}
                        {item.stats.mana && <span>Mana +{item.stats.mana}</span>}
                        {item.stats.hp && <span>HP +{item.stats.hp}</span>}
                        {item.stats.ac && <span>AC +{item.stats.ac}</span>}
                      </div>

                      {/* Class list */}
                      <div className="mt-1.5">
                        <span className="text-[9px] font-mono text-slate-500">
                          {item.allowedClasses ? `Классы: ${item.allowedClasses.join(', ')}` : 'Для всех классов'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-900 pt-2 text-xs">
                      <span className="font-mono text-amber-400 font-bold">{item.price} gold coins</span>
                      <button
                        onClick={() => handlePurchaseItem(item)}
                        className="bg-slate-850 hover:bg-amber-500 hover:text-slate-950 font-bold px-3 py-1 border border-slate-700 hover:border-amber-400 rounded text-xs transition-colors cursor-pointer text-amber-300"
                      >
                        Purchase
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Inventory list and stats list explicitly */}
          {selectedTab === 'character' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                  <User className="h-5 w-5 text-amber-500" />
                  Inventory Loot Details
                </h3>
                <p className="text-xs text-slate-500 mt-1">Manage food, bandages, or click items to equip changes to the Armory.</p>
              </div>

              {character.inventory.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 text-center text-slate-500 text-xs font-mono">
                  Your inventory bags are completely empty. Go grind monsters inside active zones for drops!
                </div>
              ) : (
                <div className="space-y-2">
                  {character.inventory.map((item) => (
                    <div key={item.id} className="bg-slate-950 border border-slate-805 p-3 rounded-lg flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-200 truncate">{item.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ${
                            item.rarity === 'epic' ? 'bg-amber-950 text-amber-400' : item.rarity === 'rare' ? 'bg-blue-950 text-blue-400' : 'bg-slate-900 text-slate-400'
                          }`}>
                            {item.rarity === 'epic' ? 'эпик' : item.rarity === 'rare' ? 'редкий' : 'обычн'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight block truncate mt-0.5">{item.description}</p>
                        
                        {/* Stats list */}
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-amber-500/80 mt-1">
                          {item.stats.str && <span>СИЛ +{item.stats.str}</span>}
                          {item.stats.sta && <span>ВЫН +{item.stats.sta}</span>}
                          {item.stats.agi && <span>ЛОВ +{item.stats.agi}</span>}
                          {item.stats.mana && <span>Мана +{item.stats.mana}</span>}
                          {item.stats.hp && <span>ХП +{item.stats.hp}</span>}
                          {item.stats.ac && <span>КБ(AC) +{item.stats.ac}</span>}
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0 select-none">
                        {item.slot !== 'none' ? (
                          <button
                            onClick={() => handleEquipItem(item)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded cursor-pointer transition-all"
                          >
                            Надеть
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUseConsumable(item.id, item.name)}
                            className="text-xs bg-slate-800 hover:bg-slate-705 text-emerald-400 px-3 py-1 rounded cursor-pointer transition-all"
                          >
                            Использовать
                          </button>
                        )}

                        <button
                          onClick={() => handleSellItem(item.id, item.price, item.name)}
                          title="Продать торговцу за золотые монеты"
                          className="text-xs bg-slate-800 hover:bg-slate-700 hover:text-amber-400 text-slate-500 px-2 py-1 rounded cursor-pointer"
                        >
                          Продать
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pillar 2: Cosmetic Salon & Transmogrification Wardrobe block */}
              <div className="mt-8 border-t border-slate-800/60 pt-6">
                <CosmeticSalonTransmog
                  character={character}
                  onUpdateCharacter={saveCharacter}
                />
              </div>
            </div>
          )}

          {/* TAB: Guild and Party Management */}
          {selectedTab === 'guild-party' && (
            <div className="space-y-6 animate-fade-in text-slate-100 w-full col-span-1 lg:col-span-4">
              
              {/* Guild Header and Subtabs */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                      <h4 className="font-serif text-xl font-black text-slate-100 uppercase tracking-widest text-shadow">
                        {guild ? `[${guild.tag}] ${guild.name}` : 'Игровые Гильдии Нората'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      {guild ? `Уровень развития гильдии: ${guild.level} • Честь: ${guildHonor}🏆 • Влияние в Этернии` : 'Основывайте гильдии, собирайте группы союзников и боритесь за замки'}
                    </p>
                  </div>
                  {guild && (
                    <div className="flex flex-wrap gap-2 text-[10px] bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 font-mono text-amber-400">
                      <div className="flex items-center gap-1.5 border-r border-slate-805 pr-2.5 mr-2.5">
                        <Database className="h-3.5 w-3.5 text-amber-500" />
                        <span>РУДА: <strong className="text-slate-100">{guildResources.ore}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 border-r border-slate-805 pr-2.5 mr-2.5">
                        <Compass className="h-3.5 w-3.5 text-emerald-400" />
                        <span>ДЕРЕВО: <strong className="text-slate-100">{guildResources.wood}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>ТРАВЫ: <strong className="text-slate-100">{guildResources.herbs}</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtab Navigation Buttons */}
                {guild && (
                  <div className="flex border-t border-slate-800/80 mt-4 pt-1 flex-wrap gap-1">
                    {(['management', 'pve', 'pvp', 'craft'] as const).map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setGuildSubTab(sub)}
                        className={`mt-2 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-2 ${
                          guildSubTab === sub
                            ? 'bg-amber-600 text-slate-950 font-black'
                            : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-850'
                        }`}
                      >
                        {sub === 'management' && <Shield className="h-3.5 w-3.5" />}
                        {sub === 'pve' && <Sword className="h-3.5 w-3.5" />}
                        {sub === 'pvp' && <Trophy className="h-3.5 w-3.5" />}
                        {sub === 'craft' && <Hammer className="h-3.5 w-3.5" />}
                        {sub === 'management' ? 'Штаб / Состав' : sub === 'pve' ? 'PvE Рейды' : sub === 'pvp' ? 'PvP Осады' : 'Экономика & Крафт'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!guild ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Create guild promo */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-amber-500 font-mono flex items-center gap-2 border-b border-slate-800 pb-2.5">
                        <Shield className="h-5 w-5 text-amber-400" />
                        Основание Гильдии
                      </h3>
                      <div className="space-y-4 pt-3 text-xs leading-relaxed text-slate-300">
                        <p>
                          Вы можете создать собственное боевое братство искателей приключений Этернии! Это придаст
                          вам авторитет, откроет доступ к сокровищам, PvE рейдам на Драконов, Осадам замков и Экономике.
                        </p>
                        <ul className="space-y-2 list-disc list-inside text-slate-400">
                          <li>Стоимость легитимизации: <strong className="text-amber-400 font-mono">30 золотых монет</strong>.</li>
                          <li>Стартовый капитал и нанимаемые соратники-боты.</li>
                          <li>Интегрированная кузница, алхимический верстак и казна.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-850 mt-4">
                      <GuildCreationForm onCreate={createGuild} playerGold={character ? character.gold : 0} />
                    </div>
                  </div>

                  {/* Party Management without guild */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg flex flex-col space-y-4">
                    <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-amber-500 font-mono flex items-center gap-2">
                          <Users className="h-5 w-5 text-amber-400" />
                          Локальная Группа (Пати)
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Временный отряд союзников</p>
                      </div>
                    </div>

                    {!party ? (
                      <div className="space-y-4 pt-2">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Создайте группу, чтобы приглашать свободных ботов из вашей текущей локации для совместных баталий с монстрами в подземельях!
                        </p>
                        <button
                          type="button"
                          onClick={() => createParty('Отряд Норрата')}
                          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Создать Группу
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-2 flex-1 flex flex-col">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-slate-400">Группа «{party.name}»:</span>
                          <button onClick={leaveParty} className="bg-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded">Распустить</button>
                        </div>
                        <div className="space-y-2">
                          {party.members.map((m) => (
                            <div key={m.name} className="bg-slate-950 p-2 border border-slate-855 rounded flex items-center justify-between text-xs font-mono">
                              <div>
                                <span className="font-bold text-slate-200">{m.name} <span className="text-[9px] text-slate-500">[{m.class}]</span></span>
                                <span className="block text-[8px] text-emerald-400">ЗДОРОВЬЕ: 100%</span>
                              </div>
                              {m.name !== character?.name && (
                                <button onClick={() => dismissFromParty(m.name)} className="text-[9px] text-rose-400">Искл</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* RENDER SUBTABS AND EXPANDED CONTENT */
                <div className="space-y-6">

                  {/* 1. MANAGEMENT SUBTAB */}
                  {guildSubTab === 'management' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Original Guild Stats & MOTD */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg space-y-4">
                        <div className="border-b border-slate-800 pb-3 flex justify-between items-center text-xs">
                          <h5 className="font-bold font-mono text-amber-500 flex items-center gap-1.5 uppercase">
                            <Shield className="h-4.5 w-4.5 text-amber-400" />
                            Статистика Штаб-Квартиры
                          </h5>
                          <button onClick={leaveGuild} className="text-red-400 text-[9px] font-mono border border-red-950 hover:bg-red-950/20 px-2.5 py-0.5 rounded">
                            Покинуть / Распустить
                          </button>
                        </div>

                        <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-lg space-y-3">
                          <GuildMotdSection currentMotd={guild.motd} onUpdate={updateGuildMotd} />

                          <div className="pt-2 border-t border-slate-850 space-y-1 text-xs">
                            <div className="flex justify-between text-slate-400">
                              <span>Уровень Штаба:</span>
                              <span className="text-amber-400 font-bold">{guild.level} уровень</span>
                            </div>
                            <div className="flex justify-between text-slate-400">
                              <span>Казна (Очки Развития):</span>
                              <span className="text-slate-200 font-mono">{guild.treasury} / {guild.level * 100} золота</span>
                            </div>
                            <div className="h-2 w-full bg-slate-900 rounded overflow-hidden mt-1.5">
                              <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (guild.treasury / (guild.level * 100)) * 100)}%` }} />
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-850 space-y-1.5">
                            <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">Пополнить казну из своего кармана:</span>
                            <div className="grid grid-cols-3 gap-2">
                              <button onClick={() => donateToGuild(10)} className="bg-slate-900 hover:bg-slate-800 text-xs py-1.5 rounded transition-colors text-amber-300 font-bold border border-slate-800">
                                +10 золота
                              </button>
                              <button onClick={() => donateToGuild(50)} className="bg-slate-900 hover:bg-slate-800 text-xs py-1.5 rounded transition-colors text-amber-300 font-bold border border-slate-800">
                                +50 золота
                              </button>
                              <button onClick={() => donateToGuild(100)} className="bg-slate-900 hover:bg-slate-800 text-xs py-1.5 rounded transition-colors text-amber-300 font-bold border border-slate-800">
                                +100 золота
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Members online list */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-tight block">Союзники в сети ({guild.members.length}):</span>
                          <div className="overflow-y-auto space-y-2 max-h-[220px]">
                            {guild.members.map((m, idx) => (
                              <div key={idx} className="bg-slate-950/60 p-2.5 border border-slate-850 rounded flex items-center justify-between text-xs font-mono">
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${m.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                                  <div>
                                    <span className={m.rank === 'Лидер' ? 'text-amber-400 font-bold' : 'text-slate-200'}>{m.name}</span>
                                    <span className="block text-[9px] text-slate-500">Ур. {character?.level || m.level} • Класс: {m.class}</span>
                                  </div>
                                </div>
                                <span className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 px-2 py-0.5 rounded uppercase">{m.rank}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Party Management */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg space-y-4">
                        <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                          <div>
                            <h5 className="font-bold font-mono text-amber-500 flex items-center gap-1.5 uppercase">
                              <Users className="h-4.5 w-4.5 text-amber-400" />
                              Управление Группой (Пати)
                            </h5>
                          </div>
                          {party && (
                            <span className="text-[10px] bg-emerald-950 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded font-bold font-mono">
                              {party.members.length} / 6 ГЕРОЕВ
                            </span>
                          )}
                        </div>

                        {!party ? (
                          <div className="space-y-4 pt-2">
                            <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg text-xs leading-relaxed space-y-2">
                              <span className="text-amber-400 font-bold block">👥 СОЗДАТЬ БОЕВУЮ ГРУППУ</span>
                              Организуйте группу (пати) для совместных зачисток! Вы сможете приглашать в группу любых ботов, находящихся в вашей текущей зоне.
                            </div>
                            <button
                              type="button"
                              onClick={() => createParty('Отряд Этернии')}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded text-sm uppercase tracking-wider cursor-pointer"
                            >
                              Создать Группу
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4 pt-2 flex-1 flex flex-col">
                            <div className="flex justify-between items-center text-xs font-mono">
                              <span className="text-slate-400">Активный отряд: «{party.name}»</span>
                              <button onClick={leaveParty} className="text-slate-500 hover:text-red-400 text-[10px] border border-slate-800 px-2 py-0.5 rounded">Распустить</button>
                            </div>

                            <div className="space-y-2">
                              {party.members.map((m) => (
                                <div key={m.name} className="bg-slate-950 p-2.5 border border-slate-850 rounded-lg flex items-center justify-between text-xs font-mono">
                                  <div className="flex-1">
                                    <div className="flex justify-between text-[11px] mb-1">
                                      <span className="font-bold text-slate-200">{m.name} <span className="text-[9px] text-slate-500">({m.class})</span></span>
                                      <span className="text-emerald-400 font-bold">100% ХП</span>
                                    </div>
                                    <div className="h-1 bg-slate-900 rounded overflow-hidden">
                                      <div className="h-full bg-emerald-500 w-full" />
                                    </div>
                                  </div>
                                  {m.name !== character?.name && (
                                    <button onClick={() => dismissFromParty(m.name)} className="text-[9px] text-slate-500 hover:text-red-400 ml-4">Искл</button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Invite Zone Bots */}
                            <div className="border-t border-slate-800/80 pt-3">
                              <span className="text-[11px] font-bold font-mono uppercase text-slate-400 tracking-tight block mb-2">Найти ботов в {activeZone.name}:</span>
                              {mapEntities.filter(e => e.type === 'bot').length === 0 ? (
                                <p className="text-xs text-slate-500 italic font-serif">В этих координатах сейчас нет свободных искателей.</p>
                              ) : (
                                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                                  {mapEntities.filter(e => e.type === 'bot').map((bot) => {
                                    const inParty = party.members.some(m => m.name === bot.name);
                                    return (
                                      <div key={bot.id} className="bg-slate-950 p-2 rounded border border-slate-850 flex items-center justify-between text-xs font-mono">
                                        <div>
                                          <span className="text-slate-200 text-xs font-bold">{bot.name}</span>
                                          <span className="block text-[9px] text-slate-500">Класс: {bot.class || 'Adventurer'}</span>
                                        </div>
                                        <button
                                          disabled={inParty}
                                          onClick={() => inviteToParty(bot.name, bot.class || 'Warrior')}
                                          className={`px-2 py-1 text-[9px] font-bold rounded uppercase ${
                                            inParty ? 'bg-slate-900 text-slate-600' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                                          }`}
                                        >
                                          {inParty ? 'В ГРУППЕ' : 'Пригласить'}
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 2. PvE REIDS & QUESTS */}
                  {guildSubTab === 'pve' && (
                    <div className="space-y-6">
                      
                      {/* Interactive Raid battle frame if Active */}
                      {inRaidBattle && raidBoss ? (
                        <div className="bg-slate-950 border border-emerald-800 rounded-xl p-5 shadow-2xl relative overflow-hidden animate-pulse-subtle">
                          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
                          
                          {/* Boss header */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-red-500 font-mono text-[9px] uppercase font-black bg-red-950 border border-red-900 px-2 py-0.5 rounded tracking-widest">
                                РЕЙДОВЫЙ БОСС АКТИВЕН • УР. {raidBoss.level}
                              </span>
                              <h4 className="text-slate-100 font-serif text-lg font-black mt-1 flex items-center gap-2">
                                <Flame className="h-5 w-5 text-red-500 animate-pulse" />
                                {raidBoss.name}
                              </h4>
                            </div>
                            
                            {/* Boss hp bar */}
                            <div className="w-full md:w-64 font-mono">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400">ЗДОРОВЬЕ ДРАКОНА:</span>
                                <span className="text-red-400 font-bold">
                                  {raidBoss.hp} / {raidBoss.maxHp} HP ({Math.round((raidBoss.hp / raidBoss.maxHp) * 100)}%)
                                </span>
                              </div>
                              <div className="h-3 w-full bg-slate-900 rounded overflow-hidden border border-slate-800">
                                <div className="h-full bg-gradient-to-r from-red-650 to-rose-500 transition-all duration-300" style={{ width: `${(raidBoss.hp / raidBoss.maxHp) * 100}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Raid split board */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                            
                            {/* Party Status column */}
                            <div className="space-y-3 lg:col-span-1">
                              <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase border-b border-slate-900 pb-1.5.">
                                ВАШ ШТУРМОВОЙ СОСТАВ:
                              </span>
                              <div className="space-y-2">
                                {raidParty.map((p, idx) => (
                                  <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs leading-tight font-mono">
                                    <div className="flex justify-between mb-1 text-[11px]">
                                      <span className="font-bold text-slate-100">
                                        {p.name} <span className="text-[9px] text-slate-400">[{p.class}]</span>
                                      </span>
                                      <span className={p.hp === 0 ? 'text-red-500 font-extrabold' : 'text-emerald-400 font-bold'}>
                                        {p.hp === 0 ? 'ПАЛ В БОЮ' : `${p.hp} HP`}
                                      </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-950 rounded overflow-hidden">
                                      <div className={`h-full ${p.hp === 0 ? 'bg-red-800' : p.role === 'tank' ? 'bg-amber-500' : p.role === 'healer' ? 'bg-emerald-400' : 'bg-blue-500'}`} style={{ width: `${(p.hp / p.maxHp) * 100}%` }} />
                                    </div>
                                    <span className="text-[9px] text-slate-500 capitalize block mt-1">Роль: <strong className="text-slate-300">{p.role === 'tank' ? '🛡️ ТАНК' : p.role === 'healer' ? '🩹 ЦЕЛИТЕЛЬ' : '⚔️ ДД'}</strong></span>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Action skills for player clickable */}
                              {!raidBattleOver && (
                                <div className="space-y-1.5 pt-2">
                                  <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase pb-1">АКТИВНЫЕ КОМАНДЫ ЛИДЕРА:</span>
                                  <button
                                    onClick={() => {
                                      // Provoke
                                      if (raidBattleOver || !raidBoss) return;
                                      setRaidLogs(prev => [...prev, `🛡️ [ЛИДЕР] Спецприказ: Защитное построение! Щит танка укреплен!`]);
                                      // Reduce boss hp some or boost tank protection next turn (simulated as minor strike)
                                      setRaidBoss(b => b ? { ...b, hp: Math.max(0, b.hp - 100) } : null);
                                      triggerAlert('Провокация щитом активирована! Нанесено 100 урона!', 'info');
                                    }}
                                    className="w-full bg-slate-900 hover:bg-slate-850 text-slate-200 border border-amber-600/30 font-bold py-1.5 rounded text-[10px] uppercase cursor-pointer"
                                  >
                                    🛡️ Сплотить ряды (Защита танка)
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Group Heal
                                      if (raidBattleOver) return;
                                      setRaidParty(prev => prev.map(p => p.hp > 0 ? { ...p, hp: Math.min(p.maxHp, p.hp + 120) } : p));
                                      setRaidLogs(prev => [...prev, `🩹 [ЛИДЕР] Провозглашен свиток группового лечения! Члены рейда восстановили +120 ХП!`]);
                                      triggerAlert('Повышенное исцеление применено!', 'success');
                                    }}
                                    className="w-full bg-emerald-950/40 border border-emerald-500 hover:bg-emerald-950/80 text-emerald-400 font-bold py-1.5 rounded text-[10px] uppercase cursor-pointer"
                                  >
                                    🩹 Групповое Лечение (+120 HP)
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Focus Fire
                                      if (raidBattleOver || !raidBoss) return;
                                      const hit = Math.floor(Math.random() * 200) + 300;
                                      setRaidBoss(b => b ? { ...b, hp: Math.max(0, b.hp - hit) } : null);
                                      setRaidLogs(prev => [...prev, `⚔️ [ЛИДЕР] Приказ "Полный Штурм"! Обрушено слитное заклинание на ${hit} урона!`]);
                                      triggerAlert(`Нанесено ${hit} урона штурмом!`, 'success');
                                    }}
                                    className="w-full bg-red-950/40 border border-red-500 hover:bg-red-950/80 text-red-400 font-bold py-1.5 rounded text-[10px] uppercase cursor-pointer"
                                  >
                                    🔥 Концентрировать Огонь!
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Scrolling combat logs */}
                            <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-lg p-3 flex flex-col h-[280px]">
                              <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase border-b border-slate-800 pb-1.5">
                                РЕЙДОВОЙ ЧАТ И ТАКТИЧЕСКИЕ ЛОГИ:
                              </span>
                              
                              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-350 pt-2 leading-relaxed">
                                {raidLogs.map((log, idx) => (
                                  <div key={idx} className={`p-1.5 rounded ${idx % 2 === 0 ? 'bg-slate-950/45' : ''}`}>
                                    {log}
                                  </div>
                                ))}
                              </div>

                              {/* Close or claim button if over */}
                              {raidBattleOver && (
                                <div className="pt-2 border-t border-slate-800 flex justify-end">
                                  <button
                                    onClick={() => {
                                      setInRaidBattle(false);
                                      setRaidBoss(null);
                                      setRaidBattleOver(false);
                                      setRaidVictory(null);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded text-xs uppercase cursor-pointer transition-all"
                                  >
                                    Вернуться в лагерь
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      ) : (
                        /* Standard PvE view selector (List of World Bosses and Quests) */
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                          
                          {/* Left layout column: Guild quests */}
                          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                            <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                              <Award className="h-4.5 w-4.5 text-emerald-400" />
                              Гильдейские Квесты
                            </h5>
                            
                            <div className="space-y-3 font-mono text-xs">
                              {/* Wood Quest */}
                              <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                                <div className="flex justify-between font-bold text-amber-100">
                                  <span>🌲 Поручение лесоруба</span>
                                  <span className="text-[10px] text-emerald-400">В процессе</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">Соберите и доставьте древесину для строительства корабля.</p>
                                <div className="text-[10px] flex justify-between bg-slate-900 p-1.5 rounded">
                                  <span>Прогресс: {guildResources.wood} / 15 древесины</span>
                                  <span className="text-emerald-400 font-bold">{guildResources.wood >= 15 ? 'Готово' : 'В сборе'}</span>
                                </div>
                                <button
                                  disabled={guildResources.wood < 15}
                                  onClick={() => {
                                    setGuildResources(prev => ({ ...prev, wood: prev.wood - 15 }));
                                    const updatedTreasury = guild.treasury + 50;
                                    const nextLvl = updatedTreasury >= guild.level * 100 ? guild.level + 1 : guild.level;
                                    const updatedGuild = {
                                      ...guild,
                                      level: nextLvl,
                                      treasury: updatedTreasury >= guild.level * 100 ? updatedTreasury - guild.level * 100 : updatedTreasury
                                    };
                                    setGuild(updatedGuild);
                                    localStorage.setItem('eq3_guild', JSON.stringify(updatedGuild));
                                    triggerAlert('Квест выполнен! Сдано 15 дерева. Очки развития +50!', 'success');
                                  }}
                                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-[10px] text-emerald-400 font-bold py-1 px-2.5 rounded cursor-pointer"
                                >
                                  Сдать Древесину (+50 Казна)
                                </button>
                              </div>

                              {/* Ore Quest */}
                              <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                                <div className="flex justify-between font-bold text-amber-100">
                                  <span>🪨 Снабжение кузницы</span>
                                  <span className="text-[10px] text-emerald-400">В процессе</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">Принесите необработанное железо для вооружения рекрутов.</p>
                                <div className="text-[10px] flex justify-between bg-slate-900 p-1.5 rounded">
                                  <span>Прогресс: {guildResources.ore} / 15 руды</span>
                                  <span className="text-emerald-400 font-bold">{guildResources.ore >= 15 ? 'Готово' : 'В сборе'}</span>
                                </div>
                                <button
                                  disabled={guildResources.ore < 15}
                                  onClick={() => {
                                    setGuildResources(prev => ({ ...prev, ore: prev.ore - 15 }));
                                    const updatedTreasury = guild.treasury + 60;
                                    const nextLvl = updatedTreasury >= guild.level * 100 ? guild.level + 1 : guild.level;
                                    const updatedGuild = {
                                      ...guild,
                                      level: nextLvl,
                                      treasury: updatedTreasury >= guild.level * 100 ? updatedTreasury - guild.level * 100 : updatedTreasury
                                    };
                                    setGuild(updatedGuild);
                                    localStorage.setItem('eq3_guild', JSON.stringify(updatedGuild));
                                    triggerAlert('Квест выполнен! Сдано 15 руды. Казна +60 XP!', 'success');
                                  }}
                                  className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-[10px] text-emerald-400 font-bold py-1 px-2.5 rounded cursor-pointer"
                                >
                                  Сдать Руду (+60 Казна)
                                </button>
                              </div>

                              {/* Slay Quest */}
                              <div className="bg-slate-950 p-3 rounded border border-slate-850 space-y-2">
                                <div className="flex justify-between font-bold text-amber-100">
                                  <span>🛡️ Налет на логово</span>
                                  <span className="text-[10px] text-slate-500">Доступно</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-tight">Отправьте боевых ботов на операцию по зачистке гнезда гоблинов.</p>
                                <button
                                  onClick={() => {
                                    triggerAlert('Боты отправлены на штурм! Ожидание зачистки...', 'info');
                                    setTimeout(() => {
                                      const updatedTreasury = guild.treasury + 120;
                                      const nextLvl = updatedTreasury >= guild.level * 100 ? guild.level + 1 : guild.level;
                                      const updatedGuild = {
                                        ...guild,
                                        level: nextLvl,
                                        treasury: updatedTreasury >= guild.level * 100 ? updatedTreasury - guild.level * 100 : updatedTreasury
                                      };
                                      setGuild(updatedGuild);
                                      localStorage.setItem('eq3_guild', JSON.stringify(updatedGuild));
                                      triggerAlert('Рейдовый отряд ботов вернулся победителем! Очки гильдии +120! Найдено золото!', 'success');
                                    }, 4000);
                                  }}
                                  className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] py-1 px-2.5 rounded cursor-pointer"
                                >
                                  Развернуть Отряд Ботов (4 сек)
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Right layout column (Boss hunting) */}
                          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                            <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                              <Sword className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                              Мировые и Рейдовые Боссы (Добыча Топ Экипировки)
                            </h5>

                            <div className="space-y-3">
                              {/* Lady Vox */}
                              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                                    <h6 className="font-serif text-sm font-bold text-blue-200">❄️ Леди Вокс (Ледяной Дракон)</h6>
                                  </div>
                                  <p className="text-[10px] text-slate-450 leading-tight">
                                    Обитает в Чертогах Пера. Здоровье: 3000 HP. Сила: умеренная. Требуется Танк, Лекарь и боевое пати.
                                  </p>
                                  <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                                    ДРОП: Эпический Посох Леди Вокс (+35 Интеллект)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (guild.level < 1) {
                                      triggerAlert('Требуется 1 уровень гильдии!', 'error');
                                      return;
                                    }
                                    setInRaidBattle(true);
                                    setRaidBoss({ name: 'Леди Вокс', hp: 3000, maxHp: 3000, level: 50, type: 'ice', maxDmg: 80 });
                                    setRaidParty([
                                      { name: character.name, class: character.class, hp: character.maxHp || 150, maxHp: character.maxHp || 150, role: 'tank' },
                                      { name: 'Fippy', class: 'Warrior', hp: 200, maxHp: 200, role: 'dps' },
                                      { name: 'Firiona_Vie', class: 'Paladin', hp: 250, maxHp: 250, role: 'healer' },
                                      { name: 'AlKabor', class: 'Wizard', hp: 180, maxHp: 180, role: 'dps' }
                                    ]);
                                    setRaidLogs([`🌲 [Рейд] Начинается штурм Леди Вокс! Танком выступает ${character.name}. Полетели!`]);
                                    setRaidBattleOver(false);
                                  }}
                                  className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-black py-2 px-4 rounded cursor-pointer shadow border border-blue-500"
                                >
                                  Собрать Сводный Рейд
                                </button>
                              </div>

                              {/* Lord Nagafen */}
                              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    <h6 className="font-serif text-sm font-bold text-red-200">🔥 Лорд Нагафен (Огненный Владыка)</h6>
                                  </div>
                                  <p className="text-[10px] text-slate-450 leading-tight">
                                    Пробудился в Хребтах Когтя. Здоровье: 5000 HP. Обладает опустошающим пламенным дыханием.
                                  </p>
                                  <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                                    ДРОП: Легендарный Клинок Лорда Нагафена (+35 Сила, +25 Выносливость)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (guild.level < 2) {
                                      triggerAlert('Ваша гильдия должна достичь 2 уровня, чтобы бросить вызов Нагафену!', 'error');
                                      return;
                                    }
                                    setInRaidBattle(true);
                                    setRaidBoss({ name: 'Лорд Нагафен', hp: 5000, maxHp: 5000, level: 55, type: 'fire', maxDmg: 120 });
                                    setRaidParty([
                                      { name: 'Firiona_Vie', class: 'Paladin', hp: 300, maxHp: 300, role: 'tank' },
                                      { name: character.name, class: character.class, hp: character.maxHp || 150, maxHp: character.maxHp || 150, role: 'dps' },
                                      { name: 'AlKabor', class: 'Wizard', hp: 200, maxHp: 200, role: 'dps' },
                                      { name: 'Fippy', class: 'Warrior', hp: 220, maxHp: 220, role: 'healer' } // Fippy tries healing!
                                    ]);
                                    setRaidLogs([`🌋 [Рейд] Призыв к штурм-осаде Лорда Нагафена в огненных недрах! Будьте стойкими!`]);
                                    setRaidBattleOver(false);
                                  }}
                                  className="shrink-0 bg-red-600 hover:bg-red-500 text-white font-mono text-[10px] font-black py-2 px-4 rounded cursor-pointer shadow border border-red-500"
                                >
                                  Собрать Сводный Рейд
                                </button>
                              </div>

                              {/* Phinigel */}
                              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                                    <h6 className="font-serif text-sm font-bold text-cyan-200">💧 Финигель Аутропос (Глубинный Океан)</h6>
                                  </div>
                                  <p className="text-[10px] text-slate-450 leading-tight">
                                    Редчайший дух Руин Кабилы. Здоровье: 4000 HP. Требует сопротивления к магии и высоких показателей AC.
                                  </p>
                                  <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono">
                                    ДРОП: Тяжелая Броня Финигеля (+40 Выносливость, +25 Класс Защиты)
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setInRaidBattle(true);
                                    setRaidBoss({ name: 'Финигель Аутропос', hp: 4000, maxHp: 4000, level: 52, type: 'water', maxDmg: 90 });
                                    setRaidParty([
                                      { name: character.name, class: character.class, hp: character.maxHp || 150, maxHp: character.maxHp || 150, role: 'tank' },
                                      { name: 'Firiona_Vie', class: 'Paladin', hp: 250, maxHp: 250, role: 'healer' },
                                      { name: 'AlKabor', class: 'Wizard', hp: 180, maxHp: 180, role: 'dps' }
                                    ]);
                                    setRaidLogs([`🌊 [Рейд] Скрытый маневр! Погружаемся под воду для ликвидации Финигеля.`]);
                                    setRaidBattleOver(false);
                                  }}
                                  className="shrink-0 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-black py-2 px-4 rounded cursor-pointer shadow border border-cyan-500"
                                >
                                  Собрать Сводный Рейд
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. PvP SIEGES & WARS */}
                  {guildSubTab === 'pvp' && (
                    <div className="space-y-6">

                      {/* Render interactive Castle Siege block if active */}
                      {inSiegeBattle && siegeCastle ? (
                        <div className="bg-slate-950 border border-red-900 rounded-xl p-5 shadow-2xl space-y-4 animate-pulse-subtle">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-3">
                            <div>
                              <span className="text-red-500 font-mono text-[9px] font-black bg-slate-900 border border-red-950 px-2 py-0.5 rounded tracking-widest uppercase">
                                АКТИВНЫЙ ШТУРМ ЗАМКА КОДОВ
                              </span>
                              <h4 className="text-slate-100 font-serif text-lg font-black mt-1">Осада: {siegeCastle.name}</h4>
                            </div>

                            <div className="text-xs font-mono space-y-1">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Сила обороны ворот:</span>
                                <span className="text-red-400 font-bold">{siegeCastle.hp} / {siegeCastle.maxHp} HP ({Math.round((siegeCastle.hp / siegeCastle.maxHp) * 100)}%)</span>
                              </div>
                              <div className="h-2 w-48 bg-slate-900 rounded overflow-hidden">
                                <div className="h-full bg-red-600 transition-all duration-300" style={{ width: `${(siegeCastle.hp / siegeCastle.maxHp) * 100}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Battle controls */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Actions and weapons panel */}
                            <div className="space-y-4">
                              <div className="bg-slate-900 p-3.5 border border-slate-850 rounded-lg space-y-2.5">
                                <span className="text-[10px] text-slate-500 font-bold font-mono tracking-tight block uppercase">Оружие штурма:</span>
                                
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      if (siegeBattleOver) return;
                                      const hit = Math.floor(Math.random() * 80) + 180;
                                      const nextHp = Math.max(0, siegeCastle.hp - hit);
                                      setSiegeCastle(c => c ? { ...c, hp: nextHp } : null);
                                      setSiegeLogs(prev => [...prev, `💣 [Таран] Контакт! Удар бревном сотрясает главные ворота! Нанесено ${hit} урона.`]);
                                      
                                      if (nextHp === 0) {
                                        setSiegeBattleOver(true);
                                        setSiegeVictory(true);
                                        handleSiegeConquest(siegeCastle.id);
                                      }
                                    }}
                                    className="w-full bg-slate-950 hover:bg-slate-900 border border-amber-500/35 text-slate-2 font-bold py-2 px-3 rounded text-xs text-left cursor-pointer flex justify-between"
                                  >
                                    <span>💥 Подкатить Таран</span>
                                    <span className="text-amber-400 font-mono">-180/260 HP</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (siegeBattleOver) return;
                                      const hit = Math.floor(Math.random() * 150) + 280;
                                      const nextHp = Math.max(0, siegeCastle.hp - hit);
                                      setSiegeCastle(c => c ? { ...c, hp: nextHp } : null);
                                      setSiegeLogs(prev => [...prev, `☄️ [Катапульта] Залп! Пылающая сфера врезается в бастион! Снесен венок башни: ${hit} урона.`]);
                                      
                                      if (nextHp === 0) {
                                        setSiegeBattleOver(true);
                                        setSiegeVictory(true);
                                        handleSiegeConquest(siegeCastle.id);
                                      }
                                    }}
                                    className="w-full bg-slate-950 hover:bg-slate-900 border border-red-500/35 text-slate-2 font-bold py-2 px-3 rounded text-xs text-left cursor-pointer flex justify-between"
                                  >
                                    <span>☄️ Пылающая Катапульта</span>
                                    <span className="text-red-400 font-mono">-280/430 HP</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (siegeBattleOver) return;
                                      const hit = Math.floor(Math.random() * 50) + 90;
                                      const nextHp = Math.max(0, siegeCastle.hp - hit);
                                      setSiegeCastle(c => c ? { ...c, hp: nextHp } : null);
                                      setSiegeLogs(prev => [...prev, `🏹 [Обстрел] Залп осадных баллист срезает дозорных! Защита истощена на ${hit} HP.`]);
                                      
                                      if (nextHp === 0) {
                                        setSiegeBattleOver(true);
                                        setSiegeVictory(true);
                                        handleSiegeConquest(siegeCastle.id);
                                      }
                                    }}
                                    className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-2 font-bold py-2 px-3 rounded text-xs text-left cursor-pointer flex justify-between"
                                  >
                                    <span>🏹 Залп Баллист Снайперов</span>
                                    <span className="text-slate-400 font-mono">-90/140 HP</span>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-1 font-mono text-xs text-slate-400">
                                <div className="flex justify-between">
                                  <span>ПРОЧНОСТЬ НАШЕЙ ТЕХНИКИ:</span>
                                  <span className="font-bold text-emerald-400">{siegePlayerHp}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded overflow-hidden">
                                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${siegePlayerHp}%` }} />
                                </div>
                              </div>
                            </div>

                            {/* Siege log panel */}
                            <div className="bg-slate-900 p-4 border border-slate-850 rounded-lg flex flex-col h-[260px]">
                              <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase border-b border-slate-800 pb-1 mr-1">ХРОНИКИ ШТУРМА:</span>
                              
                              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300 pt-2 leading-relaxed">
                                {siegeLogs.map((log, idx) => (
                                  <div key={idx} className="p-1 rounded bg-slate-950/40">
                                    {log}
                                  </div>
                                ))}
                              </div>

                              {siegeBattleOver && (
                                <div className="pt-2 flex justify-end">
                                  <button
                                    onClick={() => {
                                      setInSiegeBattle(false);
                                      setSiegeCastle(null);
                                      setSiegeBattleOver(false);
                                      setSiegeVictory(null);
                                    }}
                                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black py-1.5 px-4 rounded text-xs uppercase cursor-pointer"
                                  >
                                    Вернуться к карте
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        </div>
                      ) : inGvgBattle ? (
                        /* GVG BATTLE SCREEN */
                        <div className="bg-slate-950 border border-red-800 rounded-xl p-5 shadow-2xl space-y-4 animate-scale-up">
                          <div className="border-b border-slate-850 pb-2.5 flex justify-between items-center font-mono">
                            <div>
                              <span className="text-[9px] bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded">
                                ФРАКЦИОННОЕ GvG СТОЛКНОВЕНИЕ
                              </span>
                              <h4 className="text-slate-100 font-serif text-base font-black mt-1">Арена: Наша курия vs {gvgOpponentName}</h4>
                            </div>

                            <button
                              disabled={!gvgBattleOver}
                              onClick={() => setInGvgBattle(false)}
                              className="bg-slate-900 hover:bg-slate-855 text-slate-200 border border-slate-800 py-1.5 px-3 rounded text-xs uppercase font-mono disabled:opacity-40"
                            >
                              Выйти из боя
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* Blue Team Health bar */}
                            <div className="text-center font-mono text-xs">
                              <span className="text-amber-400 font-bold tracking-wider">[ {guild.tag} ] ЧЛЕНЫ НАШЕЙ ГИЛЬДИИ</span>
                              <div className="h-3 w-full bg-slate-900 rounded overflow-hidden border border-slate-800 mt-1.5">
                                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${gvgPlayerHp}%` }} />
                              </div>
                              <span className="block mt-1 font-mono text-[10px] text-slate-500">Сила отряда: {gvgPlayerHp}%</span>
                            </div>

                            <div className="text-center text-rose-500 font-serif text-lg font-black uppercase">VS</div>

                            {/* Red Team Health bar */}
                            <div className="text-center font-mono text-xs">
                              <span className="text-rose-400 font-bold tracking-wider">{gvgOpponentName}</span>
                              <div className="h-3 w-full bg-slate-900 rounded overflow-hidden border border-slate-800 mt-1.5">
                                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${gvgOpponentHp}%` }} />
                              </div>
                              <span className="block mt-1 font-mono text-[10px] text-slate-500">Сила соперника: {gvgOpponentHp}%</span>
                            </div>
                          </div>

                          {/* Action Log scrolling */}
                          <div className="bg-slate-900 p-3 h-[200px] rounded border border-slate-850 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300">
                            {gvgLogs.map((log, idx) => (
                              <div key={idx} className="p-1.5 bg-slate-950/40 rounded">
                                {log}
                              </div>
                            ))}
                          </div>
                          
                          {/* Active click action to assist */}
                          {!gvgBattleOver && (
                            <button
                              onClick={() => {
                                const hit = Math.floor(Math.random() * 8) + 12;
                                setGvgOpponentHp(h => Math.max(0, h - hit));
                                setGvgLogs(prev => [...prev, `⚔️ [ВМЕШАТЕЛЬСТВО] Вы нанесли магический удар по соперникам на ${hit} очков!`]);
                                if (gvgOpponentHp - hit <= 0) {
                                  setGvgBattleOver(true);
                                  setGvgVictory(true);
                                  handleGvgVictory(gvgOpponentName);
                                }
                              }}
                              className="w-full bg-red-650 hover:bg-red-600 text-white font-black py-2.5 rounded text-xs uppercase cursor-pointer"
                            >
                              ⚡ Провести тактическое вмешательство (-15%)
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Standard PvP UI with castle map and leaderboards */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                          
                          {/* Left column: Castles & collection */}
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                            <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                              <MapPin className="h-4.5 w-4.5 text-red-500" />
                              Осада Крепостей (Территории & Казна)
                            </h5>

                            <div className="space-y-4 font-mono text-xs">
                              {castles.map((c) => {
                                const isOwnedByMe = c.defender.includes(guild.name) || c.defender.includes(guild.tag);
                                return (
                                  <div key={c.id} className="bg-slate-950 p-4 rounded border border-slate-850 space-y-2.5">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h6 className="font-bold text-rose-350">{c.name}</h6>
                                        <span className="block text-[10px] text-slate-500 leading-tight">Контроль фракцией: <strong className="text-slate-300">{c.defender}</strong></span>
                                      </div>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                        isOwnedByMe ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-rose-450'
                                      }`}>
                                        {isOwnedByMe ? 'НАШ ФОРТ' : 'ПОД ГАРНИЗОНОМ'}
                                      </span>
                                    </div>

                                    {/* Taxes block or build block */}
                                    {isOwnedByMe ? (
                                      <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                                        <span className="text-[10px] text-slate-400 font-bold">Сбор пошлин: <strong className="text-amber-400">{c.income} золотых</strong></span>
                                        <button
                                          onClick={() => {
                                            // Claim gold directly to player
                                            const updatedChar = { ...character, gold: character.gold + c.income };
                                            saveCharacter(updatedChar);
                                            triggerAlert(`Вы собрали пошлину крепости ${c.name} в размере +${c.income} золота!`, 'success');
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-black py-1 px-3 rounded uppercase cursor-pointer"
                                        >
                                          Собрать Налоги
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                                        <span className="text-[10px] text-slate-400">Сложность защиты: <span className="text-slate-200">★★★☆☆</span></span>
                                        <button
                                          onClick={() => {
                                            setInSiegeBattle(true);
                                            setSiegeCastle({ id: c.id, name: c.name, defender: c.defender, hp: 2000, maxHp: 2000 });
                                            setSiegePlayerHp(100);
                                            setSiegeLogs([`💥 [Осада] Объявлен запуск штурма крепости ${c.name}. Осадные машины подогнаны к главным воротам!`]);
                                            setSiegeBattleOver(false);
                                          }}
                                          className="bg-red-650 hover:bg-red-600 text-white font-mono text-[9px] font-black py-1 px-3 rounded uppercase cursor-pointer"
                                        >
                                          Штурмовать Форт
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right column: Faction wars, Arena, score ranking */}
                          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                            <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                              <Trophy className="h-4.5 w-4.5 text-amber-500" />
                              Таблица Лидеров и Войны (GvG)
                            </h5>

                            <div className="space-y-4">
                              {/* Arena declare */}
                              <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-lg space-y-2 font-mono text-xs">
                                <span className="font-bold text-amber-100 block">🏆 ЧЕМПИОНАТ АРЕНЫ</span>
                                <p className="text-[10px] text-slate-500 leading-tight">
                                  Сразитесь с чемпионами вражеских фракций за право возглавить серверную сетку по очкам Чести.
                                </p>
                                
                                <div className="space-y-1.5 pt-1.5">
                                  {rivalGuilds.map(rg => (
                                    <div key={rg.id} className="flex justify-between items-center bg-slate-900 p-2.5 rounded border border-slate-805">
                                      <div>
                                        <span className="font-bold text-slate-200 text-xs">{rg.name}</span>
                                        <span className="block text-[8px] text-slate-500">Уровень {rg.level} • Честь: {rg.honor}</span>
                                      </div>
                                      <button
                                        onClick={() => {
                                          setInGvgBattle(true);
                                          setGvgOpponentName(rg.name);
                                          setGvgPlayerHp(100);
                                          setGvgOpponentHp(100);
                                          setGvgLogs([`⚔️ [GvG] Боевой марш! Наша гильдия вышла на арену против ${rg.name}! Поприветствуйте соперника!`]);
                                          setGvgBattleOver(false);

                                          // Simulated fight updates
                                          let p = 100;
                                          let o = 100;
                                          const gvgTimer = setInterval(() => {
                                            if (p <= 0 || o <= 0) {
                                              clearInterval(gvgTimer);
                                              return;
                                            }
                                            const pStrikes = Math.floor(Math.random() * 12) + 10;
                                            const oStrikes = Math.floor(Math.random() * 14) + 8;
                                            p = Math.max(0, p - oStrikes);
                                            o = Math.max(0, o - pStrikes);
                                            setGvgPlayerHp(p);
                                            setGvgOpponentHp(o);

                                            setGvgLogs(prev => [
                                              ...prev,
                                              `🛡️ Наш защитник нанес ${pStrikes} урона по курии врага!`,
                                              `🔥 Соперник ответил ударом на ${oStrikes} по нашим оборонительным линиям!`
                                            ]);

                                            if (p === 0 || o === 0) {
                                              clearInterval(gvgTimer);
                                              setGvgBattleOver(true);
                                              if (o === 0) {
                                                setGvgVictory(true);
                                                handleGvgVictory(rg.name);
                                              } else {
                                                setGvgVictory(false);
                                                setGvgLogs(prev => [...prev, `💀 [Поражение] Champions of ${rg.name} одержали победу. Мы потеряли 50 очков чести.`]);
                                                setGuildHonor(h => Math.max(200, h - 50));
                                              }
                                            }
                                          }, 2000);
                                        }}
                                        className="bg-red-650 hover:bg-red-600 text-white font-mono text-[9px] font-black py-1 px-3 rounded uppercase cursor-pointer"
                                      >
                                        Бросить Вызов
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Honor Score Leaderboards */}
                              <div className="space-y-2">
                                <span className="text-xs font-bold font-mono text-slate-400 uppercase block tracking-tight">Рейтинг Лидеров Сервера Этернии:</span>
                                
                                <div className="space-y-1.5 font-mono text-[11px]">
                                  {/* Sorted lists with your guild inside */}
                                  {[
                                    { name: `[${guild.tag}] ${guild.name}`, level: guild.level, honor: guildHonor, itemType: 'me' },
                                    ...rivalGuilds.map(rg => ({ name: rg.name, level: rg.level, honor: rg.honor, itemType: 'bot' }))
                                  ]
                                  .sort((a,b) => b.honor - a.honor)
                                  .map((gld, rnk) => (
                                    <div key={rnk} className={`p-2 rounded flex justify-between items-center ${
                                      gld.itemType === 'me' ? 'bg-amber-950/40 border border-amber-600/60' : 'bg-slate-950/60 border border-slate-850'
                                    }`}>
                                      <div className="flex items-center gap-2">
                                        <span className="text-amber-400 font-extrabold w-4">{rnk + 1}.</span>
                                        <div>
                                          <span className="font-bold text-slate-200">{gld.name}</span>
                                          <span className="block text-[8px] text-slate-500">Уровень {gld.level} гильдии</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <span className="font-bold text-amber-400">{gld.honor} 🏆</span>
                                        <span className="block text-[8px] text-slate-500 font-normal">очков чести</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>

                        </div>
                      )}

                      {/* Pillar 3: Gladiator Arena 1v1 */}
                      <div className="mt-6 border-t border-slate-805 pt-6">
                        <PvPArena
                          character={character}
                          onUpdateCharacter={saveCharacter}
                          triggerAlert={triggerAlert}
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. ECONOMY, CRAFT & BASE UPGRADES */}
                  {guildSubTab === 'craft' && (
                    <div className="space-y-6">
                      
                      {/* Grid for Base Buildings constructor */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                        
                        {/* Upgrades panel */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                          <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                            <Wrench className="h-4.5 w-4.5 text-amber-500" />
                            Строительство и Постройки Базы
                          </h5>

                          <div className="space-y-3 font-mono text-xs">
                            {/* Guild Hall */}
                            <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <span className="font-bold text-slate-200">🏪 Зал Гильдии (Ур. {guildUpgrades.guildHall})</span>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Увеличивает базовое здоровье всего рейда в PvE боях.</p>
                                <span className="text-[9px] text-emerald-400 font-bold block mt-1">ЭФФЕКТ: +{guildUpgrades.guildHall * 30} HP для каждого raider</span>
                              </div>
                              <button
                                onClick={() => handleUpgradeBuilding('guildHall', 150, 20, 20, 0)}
                                className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-3 py-1.5 px-3 rounded text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Улучшить (150g, 20 Дерева, 20 Руды)
                              </button>
                            </div>

                            {/* Forge */}
                            <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <span className="font-bold text-slate-200">🔨 Оружейная Кузница (Ур. {guildUpgrades.forge})</span>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Открывает новые крутые формулы ковки эпического вооружения.</p>
                                <span className="text-[9px] text-emerald-400 font-bold block mt-1">ЭФФЕКТ: разблокирует эпическое оружие редкого тира</span>
                              </div>
                              <button
                                onClick={() => handleUpgradeBuilding('forge', 200, 15, 35, 0)}
                                className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-3 py-1.5 px-3 rounded text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Улучшить (200g, 15 Дерева, 35 Руды)
                              </button>
                            </div>

                            {/* Lab */}
                            <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <span className="font-bold text-slate-200">🧪 Алхимическая Лаборатория (Ур. {guildUpgrades.lab})</span>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Повышает силу восстанавливающих трав и кулинарных бинтов.</p>
                                <span className="text-[9px] text-emerald-400 font-bold block mt-1">ЭФФЕКТ: разблокирует Великие Эликсиры Здоровья</span>
                              </div>
                              <button
                                onClick={() => handleUpgradeBuilding('lab', 120, 0, 15, 30)}
                                className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-3 py-1.5 px-3 rounded text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Улучшить (120g, 15 Руды, 30 Трав)
                              </button>
                            </div>

                            {/* Altar */}
                            <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <span className="font-bold text-slate-200">🔮 Алтарь Силы и Присяги (Ур. {guildUpgrades.altar})</span>
                                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Дарует пассивный прирост опыта и золота в боевых зонах.</p>
                                <span className="text-[9px] text-amber-400 font-black block mt-1">
                                  ТЕКУЩИЙ БАФФ: XP x1.15 / ЗОЛОТО x1.15 во всех локациях!
                                </span>
                              </div>
                              <button
                                onClick={() => handleUpgradeBuilding('altar', 300, 30, 0, 40)}
                                className="shrink-0 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-3 py-1.5 px-3 rounded text-[10px] font-bold uppercase cursor-pointer"
                              >
                                Улучшить (300g, 30 Дерева, 40 Трав)
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Bot Duty Roster & Expeditions */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                          <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                            <Users className="h-4.5 w-4.5 text-amber-500" />
                            Добыча Сырья & Разделение Труда Ботов
                          </h5>

                          <div className="space-y-4 font-mono text-xs">
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Назначьте ботов вашей гильдии на сбор ресурсов Этернии! Назначенные боты будут приносить ресурсы при запуске экспедиции.
                            </p>

                            <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg space-y-3">
                              <span className="text-[10px] text-slate-500 font-bold block uppercase">Должности участников:</span>
                              
                              <div className="space-y-3.5">
                                {/* Fippy */}
                                <div className="flex justify-between items-center text-xs">
                                  <span>Fippy (Warrior)</span>
                                  <select
                                    value={botDuties['Fippy'] || 'idle'}
                                    onChange={(e) => {
                                      const next = { ...botDuties, 'Fippy': e.target.value as any };
                                      setBotDuties(next);
                                      localStorage.setItem('eq3_guild_bot_duties', JSON.stringify(next));
                                      triggerAlert('Fippy переведен на новую должность!', 'info');
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs px-2 py-1 rounded text-slate-200"
                                  >
                                    <option value="idle">💤 Отдых</option>
                                    <option value="ore">🪨 Сбор Руды</option>
                                    <option value="wood">🌲 Рубка Дерева</option>
                                    <option value="herbs">🍀 Сбор Лекарственных Трав</option>
                                  </select>
                                </div>

                                {/* Firiona */}
                                <div className="flex justify-between items-center text-xs">
                                  <span>Firiona_Vie (Paladin)</span>
                                  <select
                                    value={botDuties['Firiona_Vie'] || 'idle'}
                                    onChange={(e) => {
                                      const next = { ...botDuties, 'Firiona_Vie': e.target.value as any };
                                      setBotDuties(next);
                                      localStorage.setItem('eq3_guild_bot_duties', JSON.stringify(next));
                                      triggerAlert('Firiona_Vie переведена на новую должность!', 'info');
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs px-2 py-1 rounded text-slate-200"
                                  >
                                    <option value="idle">💤 Отдых</option>
                                    <option value="ore">🪨 Сбор Руды</option>
                                    <option value="wood">🌲 Рубка Дерева</option>
                                    <option value="herbs">🍀 Сбор Лекарственных Трав</option>
                                  </select>
                                </div>

                                {/* AlKabor */}
                                <div className="flex justify-between items-center text-xs">
                                  <span>AlKabor (Wizard)</span>
                                  <select
                                    value={botDuties['AlKabor'] || 'idle'}
                                    onChange={(e) => {
                                      const next = { ...botDuties, 'AlKabor': e.target.value as any };
                                      setBotDuties(next);
                                      localStorage.setItem('eq3_guild_bot_duties', JSON.stringify(next));
                                      triggerAlert('AlKabor переведен на новую должность!', 'info');
                                    }}
                                    className="bg-slate-900 border border-slate-800 text-xs px-2 py-1 rounded text-slate-200"
                                  >
                                    <option value="idle">💤 Отдых</option>
                                    <option value="ore">🪨 Сбор Руды</option>
                                    <option value="wood">🌲 Рубка Дерева</option>
                                    <option value="herbs">🍀 Сбор Лекарственных Трав</option>
                                  </select>
                                </div>

                              </div>
                            </div>

                            {/* Expedition Manual collect button */}
                            <button
                              onClick={() => {
                                triggerAlert('Экспедиция отправлена в леса Ро и Бухту Кодов!', 'info');
                                setTimeout(() => {
                                  // Gather materials based on duties
                                  let gatheredOre = 0;
                                  let gatheredWood = 0;
                                  let gatheredHerbs = 0;
                                  Object.values(botDuties).forEach(v => {
                                    if (v === 'ore') gatheredOre += 4;
                                    if (v === 'wood') gatheredWood += 4;
                                    if (v === 'herbs') gatheredHerbs += 4;
                                  });
                                  // default minor luck fallback
                                  gatheredOre += Math.floor(Math.random() * 2) + 1;
                                  gatheredWood += Math.floor(Math.random() * 2) + 1;
                                  gatheredHerbs += Math.floor(Math.random() * 2) + 1;

                                  const nextRes = {
                                    ore: guildResources.ore + gatheredOre,
                                    wood: guildResources.wood + gatheredWood,
                                    herbs: guildResources.herbs + gatheredHerbs
                                  };
                                  setGuildResources(nextRes);
                                  localStorage.setItem('eq3_guild_resources', JSON.stringify(nextRes));

                                  triggerAlert(`Экспедиция успешно завершена! Собрано: +${gatheredOre} Руды, +${gatheredWood} Дерева, +${gatheredHerbs} Трав!`, 'success');
                                }, 1200);
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded text-xs uppercase cursor-pointer"
                            >
                              🚀 СНАРЯДИТЬ ЭКСПЕДИЦИЮ ДОБЫЧИ КАНАЛОВ (1.2 сек)
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* 2. Верстак ковки легендарного дропа */}
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                        <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Hammer className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" />
                          Кузня и Гильдейский Верстак Крафта снаряжения
                        </h5>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Gladius */}
                          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg flex flex-col justify-between font-mono text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-blue-300">🗡️ Зазубренный Гладиус Власти</span>
                              <p className="text-[10px] text-slate-400">Прочный меч с зазубринами, крушащий ребра.</p>
                              <div className="text-[9px] text-amber-500 font-bold"> stats: STR +15, AGI +10 (Оружие Ближнего) </div>
                            </div>
                            <div className="mt-3.5 pt-2 border-t border-slate-900 flex justify-between items-center">
                              <span className="text-[10px] text-slate-400 font-bold block">Стоимость: <strong className="text-slate-100">25 Руды, 15 Дерева</strong></span>
                              <button
                                onClick={() => handleCraftGuildItem('gladius', { ore: 25, wood: 15, herbs: 0 }, {
                                  name: '🗡️ Зазубренный Гладиус Власти',
                                  slot: 'primary',
                                  description: 'Кустарный клинок высочайшей закалки гильдейской кузницы.',
                                  price: 450,
                                  rarity: 'rare',
                                  stats: { str: 15, agi: 10 }
                                })}
                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 py-1 px-3 rounded text-[10px] font-black uppercase cursor-pointer"
                              >
                                Выковать
                              </button>
                            </div>
                          </div>

                          {/* Cuirass */}
                          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg flex flex-col justify-between font-mono text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-blue-300">🛡️ Панцирь Императорской Стойкости</span>
                              <p className="text-[10px] text-slate-400">Тяжелый латный панцирь. Блокирует критические удары.</p>
                              <div className="text-[9px] text-amber-500 font-bold"> stats: STA +25, HP +60, AC +15 (Нагрудник) </div>
                            </div>
                            <div className="mt-3.5 pt-2 border-t border-slate-900 flex justify-between items-center">
                              <span className="text-[10px] text-slate-400 font-bold block">Стоимость: <strong className="text-slate-100">40 Руды, 10 Дерева</strong></span>
                              <button
                                onClick={() => handleCraftGuildItem('cuirass', { ore: 40, wood: 10, herbs: 0 }, {
                                  name: '🛡️ Панцирь Императорской Стойкости',
                                  slot: 'chest',
                                  description: 'Тяжелая литая броня, выкованная в Оружейной гильдии.',
                                  price: 550,
                                  rarity: 'rare',
                                  stats: { sta: 25, hp: 60, ac: 15 }
                                })}
                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 py-1 px-3 rounded text-[10px] font-black uppercase cursor-pointer"
                              >
                                Выковать
                              </button>
                            </div>
                          </div>

                          {/* Elixir */}
                          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg flex flex-col justify-between font-mono text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-emerald-300">🧪 Великий Эликсир Здоровья</span>
                              <p className="text-[10px] text-slate-400">Мгновенно восстанавливает большое количество здоровья в бою.</p>
                              <div className="text-[9px] text-emerald-400 font-bold"> ЭФФЕКТ: Полное восстановление HP </div>
                            </div>
                            <div className="mt-3.5 pt-2 border-t border-slate-900 flex justify-between items-center">
                              <span className="text-[10px] text-slate-400 font-bold block">Стоимость: <strong className="text-slate-100">20 Трав, 10 Дерева</strong></span>
                              <button
                                onClick={() => handleCraftGuildItem('elixir', { ore: 0, wood: 10, herbs: 20 }, {
                                  name: '🧪 Великий Эликсир Здоровья',
                                  slot: 'none',
                                  description: 'Густое бирюзовое зелье, завариваемое на лечебных травах.',
                                  price: 200,
                                  rarity: 'rare',
                                  stats: { hp: 150 }
                                })}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white py-1 px-3 rounded text-[10px] font-black uppercase cursor-pointer"
                              >
                                Сварить
                              </button>
                            </div>
                          </div>

                          {/* Ring */}
                          <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-lg flex flex-col justify-between font-mono text-xs">
                            <div className="space-y-1">
                              <span className="font-bold text-purple-300">💍 Кольцо Древнего Вихря</span>
                              <p className="text-[10px] text-slate-400">Кольцо с драгоценными камнями, питаемое маной.</p>
                              <div className="text-[9px] text-amber-500 font-bold"> stats: WIS +20, INT +15, MANA +50 (Кольцо) </div>
                            </div>
                            <div className="mt-3.5 pt-2 border-t border-slate-900 flex justify-between items-center">
                              <span className="text-[10px] text-slate-400 font-bold block">Стоимость: <strong className="text-slate-100">30 Руды, 30 Трав</strong></span>
                              <button
                                onClick={() => handleCraftGuildItem('ring', { ore: 30, wood: 0, herbs: 30 }, {
                                  name: '💍 Кольцо Древнего Вихря',
                                  slot: 'chest', // can fit armor or custom chest slot to increase stats!
                                  description: 'Зачарованное кольцо, сбалансированное чародейскими заклинаниями.',
                                  price: 800,
                                  rarity: 'rare',
                                  stats: { wis: 20, int: 15, mana: 50 }
                                })}
                                className="bg-amber-600 hover:bg-amber-500 text-slate-950 py-1 px-3 rounded text-[10px] font-black uppercase cursor-pointer"
                              >
                                Выковать
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* Pillar 5: Companion RP Socialization Dialog */}
              <div className="mt-6 border-t border-slate-805/40 pt-6">
                <CompanionRPDialog
                  character={character}
                  onUpdateCharacter={saveCharacter}
                  triggerAlert={triggerAlert}
                />
              </div>
            </div>
          )}

          {/* TAB 6: Separate Chat Tab */}
          {selectedTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 animate-fade-in">
              {/* Chat Viewport (takes 3 of the 4 columns) */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-lg shadow-sm flex flex-col h-[560px]">
                {/* Chat Box Header info */}
                <div className="p-3.5 border-b border-slate-800 bg-slate-900/40 rounded-t-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5">
                      <MessageSquare className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                      Гильдейские палаты Этернии
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono block">ИИ-соратники реагируют на ваши действия в реальном времени</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] bg-slate-950 font-mono text-emerald-500 border border-emerald-955 px-2.5 py-1 rounded">
                    <span>ЛОГИ ИГРОВОГО МИРА АКТИВНЫ</span>
                  </div>
                </div>

                {/* Chat Messages Frame list */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-2 bg-slate-955/80 font-mono text-[11px] leading-relaxed scroll-smooth select-text">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-600 text-xs text-center py-12">
                      Глобальные сообщения еще не получены. Напишите что-нибудь, чтобы пробудить игровой мир!
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="p-1.5 rounded transition-all hover:bg-slate-900/40">
                        <span className="text-slate-500">[{msg.timestamp}]</span>{' '}
                        <span className={`font-bold transition-all text-[11px] uppercase ${
                          msg.channel === 'System'
                            ? 'text-red-400'
                            : msg.channel === 'Auction'
                            ? 'text-emerald-400'
                            : msg.channel === 'Shout'
                            ? 'text-amber-400 font-extrabold animate-pulse'
                            : msg.channel === 'Guild'
                            ? 'text-purple-400'
                            : 'text-violet-300'
                        }`}>
                          [{msg.channel === 'System' ? 'Система' : msg.channel === 'Auction' ? 'Торговля' : msg.channel === 'Shout' ? 'Крик' : msg.channel === 'Guild' ? 'Гильдия' : msg.channel}]
                        </span>{' '}
                        <span className="text-white hover:text-amber-400 cursor-pointer font-extrabold">{msg.sender}:</span>{' '}
                        <span className={`${
                          msg.text.includes('[') ? 'text-amber-300 font-bold' : 'text-slate-300'
                        }`}>
                          {msg.text}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Message Input form */}
                <form onSubmit={handleSendChat} className="p-3.5 border-t border-slate-800 bg-slate-900/60 rounded-b-lg space-y-3">
                  {/* Channel buttons selectors */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono border-b border-slate-800 pb-2.5">
                    {(['OOC', 'Auction', 'Guild', 'Shout'] as const).map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setChatChannel(ch)}
                        className={`px-2.5 py-1 rounded capitalize cursor-pointer transition-all ${
                          chatChannel === ch
                            ? 'bg-amber-600 font-black text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {ch === 'OOC' ? 'Флуд' : ch === 'Auction' ? 'Торг' : ch === 'Guild' ? 'Гильдия' : ch === 'Shout' ? 'Крик' : ch}
                      </button>
                    ))}
                  </div>

                  {/* Text area and submit row */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      disabled={isSendingChat}
                      placeholder={`Нажмите Enter, чтобы сказать в канал [${chatChannel === 'OOC' ? 'Флуд' : chatChannel === 'Auction' ? 'Торг' : chatChannel === 'Guild' ? 'Гильдия' : chatChannel === 'Shout' ? 'Крик' : chatChannel}]...`}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-955 border border-slate-700 rounded px-3 py-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isSendingChat || !chatInput.trim()}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4.5 py-1.5 text-xs font-bold rounded flex items-center justify-center cursor-pointer transition-all gap-1 font-mono"
                    >
                      {isSendingChat ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>ОТПРАВИТЬ</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sidebar: Online Active Bot players & Details (takes 1 column) */}
              <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg p-4 h-[560px] flex flex-col space-y-4">
                <div className="border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
                    <User className="h-4 w-4 text-emerald-400" />
                    Соратники в Сети
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Активные симулируемые спутники в {activeZone.name}</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-none">
                  {/* The actual User */}
                  <div className="bg-slate-950/60 p-2.5 border border-amber-500/20 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-amber-400 block tracking-tight">{character.name}</span>
                        <span className="text-[9px] font-mono text-slate-400">Ур. {character.level} {character.class} (Вы)</span>
                      </div>
                    </div>
                  </div>

                  {/* Live Active Zone Bots */}
                  {mapEntities
                    .filter((e) => e.type === 'bot')
                    .map((b) => (
                      <div key={b.id} className="bg-slate-950/30 hover:bg-slate-950/60 transition-colors p-2.5 border border-slate-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 hover:text-amber-300 cursor-pointer block tracking-tight">{b.name}</span>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">Ур. {character.level + (Math.random() > 0.5 ? 1 : b.name.length % 2 === 0 ? 0 : -1) || 3} {b.class || 'Рейнджер'}</span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-slate-900 border border-slate-800 font-mono text-slate-400 px-1.5 py-0.2 rounded">БОТ</span>
                      </div>
                    ))}
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3 rounded text-[10px] font-mono text-slate-400 leading-relaxed space-y-1">
                  <span className="text-amber-500 font-bold block">💡 ИНТЕРАКТИВНЫЙ ЧАТ</span>
                  Контекст зоны адаптируется к вашим активным координатам. Говорите в чате, чтобы призвать ИИ-ботов к ответам или организовать рейд!
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'dungeons' && character && (
            <div className="space-y-6 animate-fade-in w-full">
              <DungeonFinderInstance
                character={character}
                onUpdateCharacter={saveCharacter}
                triggerAlert={triggerAlert}
              />
            </div>
          )}

          {selectedTab === 'crafting-market' && character && (
            <div className="space-y-6 animate-fade-in w-full">
              <GatheringCraftingEngine
                character={character}
                onUpdateCharacter={saveCharacter}
                triggerAlert={triggerAlert}
              />
            </div>
          )}

          {selectedTab === 'pets-housing' && character && (
            <div className="space-y-6 animate-fade-in w-full">
              <PetsAndHousing
                character={character}
                onUpdateCharacter={saveCharacter}
                triggerAlert={triggerAlert}
              />
            </div>
          )}

          {selectedTab === 'admin' && user?.isAdmin && (
            <div className="space-y-6 animate-fade-in w-full col-span-1 lg:col-span-4">
              <div className="bg-gradient-to-r from-red-950/80 to-slate-900 border border-red-800/60 rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-y-0 right-0 w-64 bg-gradient-to-l from-red-950/10 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                      <h4 className="font-serif text-xl font-black text-slate-100 uppercase tracking-widest text-shadow">
                        Панель Директора Этернии (Reggy)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      Административная консоль управления вселенной «Открытый мир» • (Пароль Andron7691)
                    </p>
                  </div>
                  <div className="bg-slate-950/80 border border-red-900/60 rounded-lg p-3 font-mono text-[10px] text-red-400 space-y-0.5">
                    <div>СЕССИЯ: РЕЖИМ РАЗРАБОТЧИКА АКТИВЕН</div>
                    <div>КУРАТОР: {user.username} (ГЛ. АДМИНИСТРАТОР)</div>
                  </div>
                </div>
              </div>

              {/* Grid with Operations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Настройки Сервера */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Server className="h-4 w-4 text-red-500" />
                    1. ПАРАМЕТРЫ СЕРВЕРА
                  </h5>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">СОСТОЯНИЕ МИРА:</label>
                      <select 
                        value={serverStateSettings.status}
                        onChange={(e) => setServerStateSettings({...serverStateSettings, status: e.target.value})}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs"
                      >
                        <option value="online">В сети (Обычный запуск)</option>
                        <option value="maintenance">Технические работы (Ограничить вход)</option>
                        <option value="event">Праздничный ивент (Бонусы активны)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 mb-1.5 font-bold">УМНОЖИТЕЛЬ XP:</label>
                        <select 
                          value={serverStateSettings.multiplierXP}
                          onChange={(e) => setServerStateSettings({...serverStateSettings, multiplierXP: Number(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs"
                        >
                          <option value="1.0">x1.0 (Стандарт)</option>
                          <option value="2.0">x2.0 (Двойной опыт)</option>
                          <option value="3.0">x3.0 (Утроенный опыт!)</option>
                          <option value="5.0">x5.0 (Сумасшедшая прокачка!)</option>
                          <option value="10.0">x10.0 (Турбо-режим)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1.5 font-bold">УМНОЖИТЕЛЬ ЗОЛОТА:</label>
                        <select 
                          value={serverStateSettings.multiplierGold}
                          onChange={(e) => setServerStateSettings({...serverStateSettings, multiplierGold: Number(e.target.value)})}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs"
                        >
                          <option value="1.0">x1.0 (Стандарт)</option>
                          <option value="2.0">x2.0 (Двойное золото)</option>
                          <option value="3.0">x3.0 (Золотой лихорадка!)</option>
                          <option value="5.0">x5.0 (Королевская щедрость!)</option>
                          <option value="10.0">x10.0 (Сокровищница открыта)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">АКТИВНОЕ ИВЕНТ-СОБЫТИЕ:</label>
                      <input 
                        type="text"
                        value={serverStateSettings.activeEvent}
                        onChange={(e) => setServerStateSettings({...serverStateSettings, activeEvent: e.target.value})}
                        placeholder="Обычный режим"
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-300 font-mono text-xs"
                      />
                    </div>

                    <button 
                      onClick={async () => {
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
                      }}
                      className="w-full bg-red-650 hover:bg-red-650/80 text-white rounded font-black py-2.5 text-xs uppercase cursor-pointer transition-all border border-red-500 hover:border-red-400"
                    >
                      Применить и Объявить в Мире
                    </button>
                  </div>
                </div>

                {/* 2. Модерация и связь */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-red-500" />
                    2. МОДЕРАЦИЯ И СВЯЗЬ
                  </h5>

                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1.5 font-bold">ОПЕРАЦИИ ЧАТА:</label>
                      <button 
                        onClick={async () => {
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
                        }}
                        className="w-full bg-slate-950 hover:bg-slate-900 border border-red-900/40 text-red-400 font-bold py-2 rounded text-xs cursor-pointer transition-all"
                      >
                        ⚠️ Очистить Мировой Чат для Всех
                      </button>
                    </div>

                    <div className="border-t border-slate-800/60 pt-3">
                      <label className="block text-slate-400 mb-1.5 font-bold">ГЛОБАЛЬНОЕ СИСТЕМНОЕ ОБЪЯВЛЕНИЕ (SHOUT):</label>
                      <textarea 
                        value={adminAnnouncement}
                        onChange={(e) => setAdminAnnouncement(e.target.value)}
                        placeholder="Введите срочное сообщение, которое увидят абсолютно все искатели приключений во всех локациях..."
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 h-20 text-slate-300 font-mono text-xs focus:outline-none focus:border-red-500"
                      />
                      <button 
                        onClick={async () => {
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
                        }}
                        className="mt-2 w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded text-xs uppercase cursor-pointer"
                      >
                        📢 Сделать Глобальный Анонс
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Администраторские Читы (Команды Творца) */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Wand2 className="h-4 w-4 text-amber-550" />
                    3. ЧИТ-КОДЫ РАЗРАБОТКИ (ДЛЯ СЕБЯ)
                  </h5>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          if (!character) return;
                          const updated = { ...character, gold: character.gold + 500 };
                          saveCharacter(updated);
                          triggerAlert('Творец начислил себе +500 Золота!', 'success');
                        }}
                        className="bg-amber-950/20 hover:bg-amber-900/30 border border-amber-600/30 text-amber-300 py-2.5 px-3 rounded text-left block cursor-pointer transition-colors"
                      >
                        <div className="font-bold">+500g Золота</div>
                        <div className="text-[9px] text-slate-400 font-normal">Мгновенное обогащение</div>
                      </button>

                      <button 
                        onClick={() => {
                          if (!character) return;
                          const updated = { ...character, gold: character.gold + 5000 };
                          saveCharacter(updated);
                          triggerAlert('Творец начислил себе +5000 Золота!', 'success');
                        }}
                        className="bg-amber-950/45 hover:bg-amber-900/60 border border-amber-550 text-amber-200 py-2.5 px-3 rounded text-left block cursor-pointer transition-colors"
                      >
                        <div className="font-bold">+5000g Золота</div>
                        <div className="text-[9px] text-slate-400 font-normal">Королевский грант</div>
                      </button>

                      <button 
                        onClick={() => {
                          if (!character) return;
                          const nextLvl = character.level + 1;
                          const updated = {
                            ...character,
                            level: nextLvl,
                            maxHp: 100 + nextLvl * 15,
                            maxMana: 80 + nextLvl * 12,
                            hp: 100 + nextLvl * 15,
                            mana: 80 + nextLvl * 12,
                            exp: 0,
                            expToNextLevel: nextLvl * 1200
                          };
                          saveCharacter(updated);
                          triggerAlert(`Уровень повышен до ${nextLvl}! (Ding!)`, 'success');
                        }}
                        className="bg-purple-950/20 hover:bg-purple-900/30 border border-purple-800/30 text-purple-300 py-2.5 px-3 rounded text-left block cursor-pointer transition-colors"
                      >
                        <div className="font-bold">Повысить Уровень (+1)</div>
                        <div className="text-[9px] text-slate-400 font-normal">Получить уровень бога</div>
                      </button>

                      <button 
                        onClick={() => {
                          if (!character) return;
                          const weapon: Item = {
                            id: `admin-wep-${Date.now()}`,
                            name: '🔥 Эпический Посох Власти Регги',
                            slot: 'primary',
                            description: 'Легендарное оружие, создающее разломы планов. Излучает энергию Этернии.',
                            price: 5000,
                            rarity: 'epic',
                            stats: { str: 25, sta: 30, int: 50, wis: 40, agi: 20 }
                          };
                          const chest: Item = {
                            id: `admin-chest-${Date.now()}`,
                            name: '🛡️ Кираса Создателя Вселенной Андрона',
                            slot: 'chest',
                            description: 'Непробиваемая броня из чистой субстанции звёзд и программного кода.',
                            price: 8888,
                            rarity: 'epic',
                            stats: { str: 45, sta: 60, int: 20, wis: 25, agi: 30 }
                          };
                          const updated = {
                            ...character,
                            inventory: [...character.inventory, weapon, chest]
                          };
                          saveCharacter(updated);
                          triggerAlert('Эпический сет перенесен на вашего персонажа!', 'success');
                        }}
                        className="bg-red-950/20 hover:bg-red-900/30 border border-red-800/30 text-red-300 py-2.5 px-3 rounded text-left block cursor-pointer transition-colors"
                      >
                        <div className="font-bold">Эпический Сет Регги</div>
                        <div className="text-[9px] text-slate-400 font-normal">Имба комплектация</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Безопасность и Реестр Пользователей */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h5 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-red-500" />
                    4. БАЗА ДАННЫХ ПЕРСОНАЖЕЙ ({adminUsers.length})
                  </h5>

                  <div className="overflow-y-auto max-h-[220px] pr-1 space-y-2">
                    {adminUsers.length === 0 ? (
                      <div className="text-center py-6 text-slate-550 font-mono text-xs">
                        Нет подключенных учетных записей или идет загрузка...
                      </div>
                    ) : (
                      adminUsers.map((u) => (
                        <div key={u.username} className="bg-slate-950 p-2.5 rounded border border-slate-850 flex items-center justify-between text-xs font-mono">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-200">{u.username}</span>
                              {u.isAdmin && <span className="bg-red-900/60 border border-red-700 text-red-300 text-[8px] px-1 rounded uppercase tracking-wider">ADMIN</span>}
                              {u.banned && <span className="bg-rose-950 border border-rose-800 text-rose-400 text-[8px] px-1 rounded uppercase tracking-wider">BANNED</span>}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Статус: {u.banned ? 'Заблокирован' : 'Может войти под присягой'}
                            </span>
                          </div>

                          <div className="flex gap-1.5">
                            {u.username !== 'Reggy' ? (
                              <button
                                onClick={async () => {
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
                                        triggerAlert(errData.error || 'Ошибка бана', 'error');
                                      }
                                    } catch (e) {
                                      triggerAlert('Ошибка соединения с базой.', 'error');
                                    }
                                  }
                                }}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  u.banned 
                                  ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800' 
                                  : 'bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800'
                                }`}
                              >
                                {u.banned ? 'Разбанить' : 'Забанить'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500 italic bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                                Иммунитет
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          </div>
        </section>

      </main>

    </div>
  );
}
