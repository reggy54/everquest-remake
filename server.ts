import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely check for API key
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log('Gemini API success: GoogleGenAI client initialized!');
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
} else {
  console.log('No GEMINI_API_KEY environment variable found. Gemini AI integration will run in fallback mock mode.');
}

// In-Memory Shared Multiplayer State
interface SharedMessage {
  id: string;
  sender: string;
  channel: 'OOC' | 'Auction' | 'Guild' | 'Shout' | 'System';
  text: string;
  timestamp: string;
}

const globalMessages: SharedMessage[] = [
  {
    id: 'msg-start-1',
    sender: 'Firiona_Vie',
    channel: 'System',
    text: 'Welcome to EverQuest III Chronicles! The planes of Norrath have reopened...',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: 'msg-start-2',
    sender: 'SlayerX',
    channel: 'OOC',
    text: 'LF healer for Blackburrow skull quest! Meet at entrance.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: 'msg-start-3',
    sender: 'Mist_Weaver',
    channel: 'Auction',
    text: 'WTS [Ghoulbane] and [Short Sword of Ykesha] in East Commonlands tunnel or PM offers!',
    timestamp: new Date().toLocaleTimeString(),
  },
];

// Helper to add chat messages and keep only the last 120 messages
function addChatMessage(msg: Omit<SharedMessage, 'id' | 'timestamp'>) {
  const newMsg: SharedMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toLocaleTimeString(),
  };
  globalMessages.push(newMsg);
  if (globalMessages.length > 120) {
    globalMessages.shift();
  }
  return newMsg;
}

interface UserAccount {
  username: string;
  passwordHash: string;
  isAdmin: boolean;
  banned: boolean;
}

const userAccounts: Record<string, UserAccount> = {
  "Reggy": {
    username: "Reggy",
    passwordHash: "Andron7691",
    isAdmin: true,
    banned: false
  }
};

let serverSettings = {
  status: 'online', // online, maintenance, event
  multiplierXP: 1.0,
  multiplierGold: 1.0,
  activeEvent: 'Обычный режим',
  announcement: 'Добро пожаловать в Хроники Открытого Мира!',
};

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), aiEnabled: !!ai, settings: serverSettings });
});

// Auth Endpoints
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Требуется ввести логин и пароль.' });
  }

  const uValue = username.trim();
  const normalizedKey = uValue.toLowerCase();

  const existing = Object.keys(userAccounts).find(k => k.toLowerCase() === normalizedKey);
  if (existing) {
    return res.status(400).json({ error: 'Это имя пользователя уже занято.' });
  }

  const isAdmin = (uValue.toLowerCase() === 'reggy' && password === 'Andron7691');

  userAccounts[uValue] = {
    username: uValue,
    passwordHash: password,
    isAdmin,
    banned: false
  };

  res.json({
    success: true,
    user: { username: uValue, isAdmin }
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Требуется ввести логин и пароль.' });
  }

  const uValue = username.trim();
  const account = Object.values(userAccounts).find(acc => acc.username.toLowerCase() === uValue.toLowerCase());

  if (!account) {
    return res.status(400).json({ error: 'Персонаж / аккаунт с таким именем не найден.' });
  }

  if (account.passwordHash !== password) {
    return res.status(400).json({ error: 'Неверный пароль.' });
  }

  if (account.banned) {
    return res.status(403).json({ error: 'Данный аккаунт заблокирован Администрацией.' });
  }

  res.json({
    success: true,
    user: { username: account.username, isAdmin: account.isAdmin }
  });
});

// Server Settings Get
app.get('/api/server-settings', (req, res) => {
  res.json(serverSettings);
});

// Admin Operations
app.post('/api/admin/clear-chat', (req, res) => {
  globalMessages.length = 0;
  globalMessages.push({
    id: `msg-clear-${Date.now()}`,
    sender: 'СИСТЕМА',
    channel: 'System',
    text: 'Игровой чат был очищен главным куратором игры.',
    timestamp: new Date().toLocaleTimeString(),
  });
  res.json({ success: true, messages: globalMessages });
});

app.post('/api/admin/announce', (req, res) => {
  const { text, sender } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Текст объявления пуст.' });
  }
  const announceMsg = addChatMessage({
    sender: sender || 'АДМИНИСТРАТОР REGGY',
    channel: 'Shout',
    text: `📢 ГЛОБАЛЬНЫЙ АНОНС: ${text}`,
  });
  res.json({ success: true, message: announceMsg });
});

app.post('/api/admin/server-settings', (req, res) => {
  const { status, multiplierXP, multiplierGold, activeEvent, announcement } = req.body;
  
  if (status !== undefined) serverSettings.status = status;
  if (multiplierXP !== undefined) serverSettings.multiplierXP = Number(multiplierXP);
  if (multiplierGold !== undefined) serverSettings.multiplierGold = Number(multiplierGold);
  if (activeEvent !== undefined) serverSettings.activeEvent = activeEvent;
  if (announcement !== undefined) serverSettings.announcement = announcement;

  addChatMessage({
    sender: 'СИСТЕМА',
    channel: 'System',
    text: `Параметры игрового мира изменены! Режим: "${serverSettings.activeEvent}". Умножитель Опыта: x${serverSettings.multiplierXP}, Золота: x${serverSettings.multiplierGold}.`,
  });

  res.json({ success: true, settings: serverSettings });
});

app.get('/api/admin/users', (req, res) => {
  res.json({
    users: Object.values(userAccounts).map(u => ({
      username: u.username,
      isAdmin: u.isAdmin,
      banned: u.banned
    }))
  });
});

app.post('/api/admin/user-ban', (req, res) => {
  const { username, ban } = req.body;
  if (!username) return res.status(400).json({ error: 'Не указано имя пользователя.' });
  
  const account = Object.values(userAccounts).find(acc => acc.username.toLowerCase() === username.toLowerCase());
  if (!account) return res.status(404).json({ error: 'Пользователь не найден.' });

  if (account.username === 'Reggy') {
    return res.status(400).json({ error: 'Невозможно заблокировать главного Администратора!' });
  }

  account.banned = !!ban;
  
  addChatMessage({
    sender: 'СИСТЕМА',
    channel: 'System',
    text: `Персонаж ${account.username} был ${ban ? 'ЗАБЛОКИРОВАН' : 'РАЗБЛОКИРОВАН'} Администрацией.`,
  });

  res.json({ success: true, user: { username: account.username, banned: account.banned } });
});

// Chat get & post
app.get('/api/chat', (req, res) => {
  res.json({ messages: globalMessages });
});

app.post('/api/chat/send', async (req, res) => {
  const { sender, channel, text, level, race, charClass } = req.body;
  if (!sender || !text) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }

  const userMsg = addChatMessage({ sender, channel, text });

  // If the user talks in general OOC or Shout channels, let another simulated player answer or comment!
  // We activate GEMINI to yield 1-2 responses from other simulated MMO players!
  if (ai && (channel === 'OOC' || channel === 'Shout' || channel === 'Guild')) {
    try {
      const activeRecentText = globalMessages
        .slice(-6)
        .map((m) => `[${m.channel}] ${m.sender}: ${m.text}`)
        .join('\n');

      const prompt = `You are a group of iconic retro EverQuest or classic MMORPG players hanging out in global chat.
A player named "${sender}" (Level ${level} ${race} ${charClass}) says: "${text}".
Analyze the chat log below of the last few chat messages inside the server:
${activeRecentText}

Provide an immediate follow-up response in JSON format from another player (or up to two players) replying to "${sender}"'s comment, or commenting on relevant EverQuest info (quests, item lookups, raid complaints, bad luck rolling, gold sellers, or classic dungeon crawls like Blackburrow/Mistmoore/Guk).
Keep the character names retro (classic MMO style, e.g., "Shadow_Blade", "ElfLord99", " cleric_girl", "OgreSmasher").
Keep transcripts realistic and human-like: short comments, colloquial MMO terms (e.g. LFG, OOM, agro, DPS, ding, bio, wtfe, wts, wtb). Include correct channel types (mostly OOC).

Format return JSON:
{
  "answers": [
    {
      "sender": "Nickname_Here",
      "channel": "OOC",
      "text": "Message content"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sender: { type: Type.STRING },
                    channel: { type: Type.STRING },
                    text: { type: Type.STRING },
                  },
                  required: ['sender', 'channel', 'text'],
                },
              },
            },
            required: ['answers'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.answers && Array.isArray(parsed.answers)) {
        for (const answer of parsed.answers) {
          // Add random slight delay or respond immediately
          addChatMessage({
            sender: answer.sender,
            channel: answer.channel || 'OOC',
            text: answer.text,
          });
        }
      }
    } catch (err) {
      console.error('Failure inside Gemini automatic chat retort:', err);
    }
  } else if (!ai && (channel === 'OOC' || channel === 'Shout' || channel === 'Guild')) {
    // Basic mock replies if Gemini API is not working or not configured
    setTimeout(() => {
      const mockNPCs = ['Ogre_Crusher', 'Drizzt_III', 'Xanathor', 'HealzPlease'];
      const randomSender = mockNPCs[Math.floor(Math.random() * mockNPCs.length)];
      const phrases = [
        `Haha true, ${sender}! Did anyone spot the undead spawn close to the ruins?`,
        `WTB Ghoulbane, have 200pp raw plat, whisper me ASAP!`,
        `Congrats on the level up if you dinged!`,
        `Anyone down for Lower Guk crawl soon? Need tank.`,
      ];
      addChatMessage({
        sender: randomSender,
        channel: 'OOC',
        text: phrases[Math.floor(Math.random() * phrases.length)],
      });
    }, 1500);
  }

  res.json({ success: true, message: userMsg, currentMessages: globalMessages });
});

// Periodic simulated chatter injector to make the world feel "alive"
setInterval(() => {
  const botsLog = [
    { sender: 'Athelas_Elf', channel: 'OOC', text: 'Where does the Holly Wind quest trigger again?' },
    { sender: 'Grom_Bronzebeard', channel: 'Shout', text: 'TRAIN IN BLACKBURROW RUN FOR THE ZONE LINE!!!' },
    { sender: 'LootGoblin', channel: 'Auction', text: 'WTS [Ashenwood Shortbow] 150 gold, PST.' },
    { sender: 'MageGnome', channel: 'Guild', text: 'Our guild raid is scheduled for the Plane of Fear on Saturday, sign up in discord!' },
    { sender: 'Shadow_Stalker', channel: 'OOC', text: 'Man, the griffins in East Commonlands are totally brutal today.' },
    { sender: 'Paladin_Grace', channel: 'OOC', text: 'Offering buffs at Oasis dock if anyone needs regeneration.' },
  ];
  const selected = botsLog[Math.floor(Math.random() * botsLog.length)];
  addChatMessage(selected as any);
}, 25000); // add one every 25 seconds of idle, keeping it active without spam

// Gemini Endpoint: Custom Dynamic Side Quests
app.post('/api/gemini/quest', async (req, res) => {
  const { name, charClass, race, level, zone } = req.body;

  if (!ai) {
    // Sandbox Mock Response
    return res.json({
      title: 'Lore of Blackburrow',
      giver: 'Captain Althea',
      description: `Greetings, brave adventurer. The gnolls of Blackburrow are gathering reinforcements under the orders of their sovereign. Go to Blackburrow, retrieve five Gnoll Fangs and present them to Althea to safeguard the northern hills.`,
      objective: 'Obtain 3 Gnoll Fangs from Blackburrow.',
      rewardExp: 350,
      rewardGold: 10,
      rewardItem: {
        id: 'gnoll-slayer',
        name: 'Jagged Gnoll Slayer',
        slot: 'primary',
        description: 'A finely forged steel blade shimmering with a blue glow.',
        price: 30,
        rarity: 'uncommon',
        stats: { str: 2, agi: 1, damage: 6 },
      },
    });
  }

  try {
    const prompt = `Generate a lore-rich RPG quest description suitable for a retro MMORPG like EverQuest 3.
Adventurer details: Level ${level} ${race} ${charClass} named ${name}.
Current location/zone specified: "${zone}".

Generate a creative side quest in JSON containing:
1. title (Max 6 words, grand fantasy theme)
2. giver (The NPC's name, titles, e.g. "Loremaster Kyle")
3. description (A paragraph of engaging dialogue or narration establishing why this task is needed, specific to ${charClass} or the zone lore).
4. objective (A concise outline, e.g. "Defeat 3 Gnoll Commanders and gather their medallions")
5. rewardExp (integer between 100 * level and 500 * level)
6. rewardGold (integer between 5 * level and 35 * level)
7. rewardItem (An object describing a rewarding weapon, armor piece, or ring that suits their class)

Schema of rewardItem:
{
  "id": "item-id",
  "name": "Item Name",
  "slot": "head" | "chest" | "arms" | "hands" | "legs" | "feet" | "primary" | "secondary" | "none",
  "description": "Flavor description of item",
  "price": number,
  "rarity": "uncommon" | "rare" | "epic",
  "stats": { "str": number, "sta": number, "agi": number, "dex": number, "int": number, "wis": number, "hp": number, "mana": number }
}

Provide JSON output only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            giver: { type: Type.STRING },
            description: { type: Type.STRING },
            objective: { type: Type.STRING },
            rewardExp: { type: Type.INTEGER },
            rewardGold: { type: Type.INTEGER },
            rewardItem: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                slot: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                rarity: { type: Type.STRING },
                stats: {
                  type: Type.OBJECT,
                  properties: {
                    str: { type: Type.INTEGER },
                    sta: { type: Type.INTEGER },
                    agi: { type: Type.INTEGER },
                    dex: { type: Type.INTEGER },
                    int: { type: Type.INTEGER },
                    wis: { type: Type.INTEGER },
                    hp: { type: Type.INTEGER },
                    mana: { type: Type.INTEGER },
                  },
                },
              },
              required: ['id', 'name', 'slot', 'description', 'price', 'rarity'],
            },
          },
          required: ['title', 'giver', 'description', 'objective', 'rewardExp', 'rewardGold'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('Error generating quest:', err);
    res.status(500).json({ error: 'Failed to generate quest.' });
  }
});

// Gemini Endpoint: Deep Lore lookups (Tome of Norrath)
app.post('/api/gemini/lore', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  if (!ai) {
    return res.json({
      title: topic,
      text: `Norrath lore indicates that "${topic}" is a legendary element deeply tied to the ancient deities. Old chronicles speak of massive wars between the Ogres and the Elven courts that shaped its mountains. Keep checking the archives!`,
    });
  }

  try {
    const prompt = `Write a deep, evocative, and captivating lore chronicle entry for the classic fantasy topic: "${topic}".
Write in the high-fantasy narrative voice of a legendary scribe of Norrath (from EverQuest universe lore).
Include fascinating, specific details regarding deities (like Cazic-Thule, Tunare, Innoruuk), ancient wars, legendary artifacts, or structural zones.
Make it immersive and beautifully written in markdown format.

Format standard output JSON:
{
  "title": "${topic}",
  "text": "Chronicle story..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            text: { type: Type.STRING },
          },
          required: ['title', 'text'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('Error gathering lore:', err);
    res.status(500).json({ error: 'Failed to access the Tome of Norrath.' });
  }
});

// Gemini Endpoint: Combat Dungeon Master Descriptions
app.post('/api/gemini/combat-round', async (req, res) => {
  const { logs, playerMove, enemyName, partyNames, playerClass, enemyHp, maxEnemyHp } = req.body;

  if (!ai) {
    return res.json({
      description: `With a fierce roar, you execute ${playerMove || 'an attack'}! The ${enemyName} takes direct damage and recoils. Your party members cheer you on as the clash reverberates through the dark halls.`,
    });
  }

  try {
    const prompt = `Generate a cinematic, vivid, one-paragraph Dungeon Master combat summary for an epic retro RPG battle.
Current enemy: "${enemyName}" (HP: ${enemyHp}/${maxEnemyHp}).
Your Party: ${partyNames.join(', ')} (You are a ${playerClass}).
Current Action Choice: Player executed "${playerMove}".
Recent combat occurrences: ${JSON.stringify(logs)}

Describe the collision beautifully: describe active spell effects casting (like fireballs, divine heals, glowing shields), swords clashing on metal shields, or tactical maneuvers. Express dynamic tension making it sound like a true classic fantasy raid boss event report.
Keep it under 100 words. Return JSON:
{
  "description": "Vivid narrative round description..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
          },
          required: ['description'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err) {
    console.error('Error making DM combat summary:', err);
    res.status(500).json({ error: 'Failed to formulate combat log.' });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EverQuest III Chronicles Server running on http://localhost:${PORT}`);
  });
}

startServer();
