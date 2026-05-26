/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PlayerCharacter, Zone, Item, Spell, ChatMessage, SlotType } from './types';
import CharacterCreator from './components/CharacterCreator';
import Combat2DArena from './components/Combat2DArena';
import MapExplorer2D, { MapEntity } from './components/MapExplorer2D';
import {
  GAME_ZONES,
  WORLD_SPELLS,
  COMMON_TEMPLATES
} from './data/gameData';
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
  Wand2
} from 'lucide-react';

export default function App() {
  const [character, setCharacter] = useState<PlayerCharacter | null>(null);
  const [selectedTab, setSelectedTab] = useState<'zones' | 'merchant' | 'lore' | 'quests' | 'character'>('zones');
  const [activeZone, setActiveZone] = useState<Zone>(GAME_ZONES[0]);
  
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
    title: 'The Prophecy of EverQuest III',
    text: 'Norrath has evolved. Through the planar rifts of the Void, ancient guilds have reassembled. Legends speak of the return of Firiona Vie to unify the High Elven courts, while the Prince of Hate, Innoruuk, stirs in the depths of Neriak to poison the water supplies of Freeport. Brave souls gather in the East Commonlands trade tunnel to swap stories, quest scrolls, and legendary items like the glowing *Ghoulbane* and *Rubicund Breastplate*...'
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

  // 2D Top-down Game States
  const MAP_COLS = 14;
  const MAP_ROWS = 11;
  const [playerX, setPlayerX] = useState<number>(3);
  const [playerY, setPlayerY] = useState<number>(3);
  const [mapEntities, setMapEntities] = useState<MapEntity[]>([]);
  const [combatVisualEvent, setCombatVisualEvent] = useState<{ id: number; type: 'melee' | 'taunt' | 'fire' | 'heal' | 'ice' | 'buff' | 'monster'; label: string; amount?: number } | null>(null);

  // System Notifications
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Scroll ref for chat logs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Initial Load: Check for character in local storage
  useEffect(() => {
    const saved = localStorage.getItem('eq3_character');
    if (saved) {
      try {
        setCharacter(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved character', e);
      }
    }
  }, []);

  // Save character utility
  const saveCharacter = (char: PlayerCharacter) => {
    setCharacter(char);
    localStorage.setItem('eq3_character', JSON.stringify(char));
  };

  const triggerAlert = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4000);
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

    // 4. Populate active monsters
    currentZone.monsters.forEach((mon, idx) => {
      const mx = Math.min(MAP_COLS - 2, Math.max(1, 4 + idx * 3));
      const my = Math.min(MAP_ROWS - 2, Math.max(1, 4 + (idx % 2) * 3));
      
      let mIcon = '🕷️';
      if (mon.name.includes('Skeleton')) mIcon = '💀';
      else if (mon.name.includes('Beetle')) mIcon = '🐜';
      else if (mon.name.includes('Bear') || mon.name.includes('cub')) mIcon = '🐻';
      else if (mon.name.includes('Wolf')) mIcon = '🐺';
      else if (mon.name.includes('Gnoll')) mIcon = '🐕';
      else if (mon.name.includes('Froglok')) mIcon = '🐸';
      else if (mon.name.includes('Spider')) mIcon = '🕷️';
      else if (mon.name.includes('Vampire') || mon.name.includes('Lord') || mon.isBoss) mIcon = '😈';

      entities.push({
        id: `mon-${mon.name}-${idx}-${Date.now()}`,
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
    });

    // 5. Populate bot players
    const otherNames = ['Fippy', 'AlKabor', 'Sorn', 'Firiona_Vie', 'Xanthor', 'Glorg', 'Nika'];
    const classes = ['Paladin', 'Wizard', 'Druid', 'Enchanter', 'Necromancer'];
    const botCount = 2 + Math.floor(Math.random() * 2);
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
        icon: '🧙‍♂️'
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
          if (Math.random() > 0.6) {
            const dirs = [
              { dx: 0, dy: -1 },
              { dx: 0, dy: 1 },
              { dx: -1, dy: 0 },
              { dx: 1, dy: 0 },
            ];
            const chosenDir = dirs[Math.floor(Math.random() * dirs.length)];
            const nx = entity.x + chosenDir.dx;
            const ny = entity.y + chosenDir.dy;

            if (!isObstacle(nx, ny, activeZone.id) && nx > 0 && nx < MAP_COLS - 1 && ny > 0 && ny < MAP_ROWS - 1) {
              const collision = prevEntities.some(e => e.id !== entity.id && e.x === nx && e.y === ny);
              if (!collision) {
                if (entity.type === 'bot' && Math.random() > 0.94) {
                  const lines = [
                    'Heck yes, just dinged!',
                    `LF Cleric for ${activeZone.name} crawl!`,
                    'Soothe pulls, be careful!',
                    'Fippy is back up, watch out!',
                    'Need buff Clarity please!',
                    'Selling raw materials near tunnel entrance.',
                    'Man, these drops are epic!'
                  ];
                  const line = lines[Math.floor(Math.random() * lines.length)];
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
        triggerAlert(`Warping to connected zone: ${targetZ.name}!`, 'info');
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
      triggerAlert(`Opened Chest! Found ${earnedGold} Gold & earned ${earnedExp} XP!${leveledUp ? ' Level UP!' : ''}`, 'success');
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
        triggerAlert('Resting by cozy campfire... Health and Mana restored!', 'success');
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
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (inCombat || selectedTab !== 'zones') return;

      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return; 
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handlePlayerMove(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handlePlayerMove(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handlePlayerMove(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handlePlayerMove(1, 0);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playerX, playerY, mapEntities, inCombat, selectedTab, character]);

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
    triggerAlert(`Welcome to Norrath, ${newChar.name}! Your destiny awaits!`, 'success');
  };

  const handleResetCharacter = () => {
    if (window.confirm('Are you sure you want to delete this character and forge a new legend? All level accomplishments and epic items will be lost.')) {
      localStorage.removeItem('eq3_character');
      setCharacter(null);
      setInCombat(false);
      setCombatMonster(null);
      setVictoryDetails(null);
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
    triggerAlert('Consulting the regional Guildmaster for dynamic challenges...', 'info');

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
          title: questData.title || 'Dynamic Guild Contract',
          giver: questData.giver || 'Guild Envoy',
          description: questData.description || 'A mysterious fantasy scroll requesting aid.',
          objective: questData.objective || 'Slay targets in active zones under instructions.',
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

        triggerAlert(`New Quest Acquired: "${compiledQuest.title}"! Check your Quest Log.`, 'success');
      } else {
        triggerAlert('Guildmasters are currently busy. Try requesting a quest again soon!', 'error');
      }
    } catch (err) {
      console.error('Failed to summon quest:', err);
      triggerAlert('The planar gateway stuttered. Guildmaster unavailable right now.', 'error');
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
    triggerAlert('Quest abandoned.', 'info');
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
        triggerAlert(`Tome of Norrath: Chronicles on "${data.title || searchTopic}" fetched.`, 'success');
      } else {
        triggerAlert('The ancient archives were unreadable. The script shifted...', 'error');
      }
    } catch (err) {
      console.error('Error fetching lore chronicles:', err);
      triggerAlert('Unable to call the planar archives.', 'error');
    } finally {
      setLoreLoading(false);
    }
  };

  // 6. Commonlands Merchant Shopping
  const handlePurchaseItem = (item: Item) => {
    if (!character) return;
    if (character.gold < item.price) {
      triggerAlert(`You lack the gold required! [Need: ${item.price}g, Have: ${character.gold}g]`, 'error');
      return;
    }

    // Purchase
    const updatedInventory = [...character.inventory, { ...item, id: `loot-${Date.now()}` }];
    saveCharacter({
      ...character,
      gold: character.gold - item.price,
      inventory: updatedInventory,
    });

    triggerAlert(`Purchased [${item.name}] from Commonlands trade tunnel!`, 'success');
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
    triggerAlert(`Sold [${itemName}] for ${saleValue} copper-gold coins.`, 'info');
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

    triggerAlert(`Equipped [${item.name}] to your ${slot} slot!`, 'success');
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

    triggerAlert(`Unequipped [${item.name}] back into inventory.`, 'info');
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

    triggerAlert(`Used ${itemName}! Restored ${healAmount} health points.`, 'success');
  };

  // 7. Combat Mechanics Core
  const handleInitiateCombat = (monster: { name: string; level: number; hp: number; isBoss?: boolean }) => {
    if (!character) return;

    // Roll some funny group mates as classic MMO party interaction
    const potentialMates = COMMON_TEMPLATES.simulatedNames.filter(n => n !== character.name);
    const matchCount = activeZone.difficulty === 'Raid' ? 4 : activeZone.difficulty === 'Hard' ? 2 : 1;
    const partyMatesClasses = ['Cleric', 'Monk', 'Wizard', 'Enchanter', 'Bard'];
    
    const structuredParty = [];
    for (let i = 0; i < matchCount; i++) {
      const pName = potentialMates[Math.floor(Math.random() * potentialMates.length)];
      const pClass = partyMatesClasses[Math.floor(Math.random() * partyMatesClasses.length)];
      structuredParty.push({
        name: pName,
        class: pClass,
        hp: 75 + character.level * 40,
        maxHp: 75 + character.level * 40,
      });
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
    setInCombat(true);
  };

  const handleCombatAction = async (actionType: 'melee' | 'taunt' | Spell) => {
    if (!character || !combatMonster || combatOver) return;

    let logChunk: string[] = [];
    let dmgToMonster = 0;
    let healToParty = 0;
    let actionName = 'Melee attack';

    // Decrement buff durations and filter out expired ones
    let updatedBuffs = activeBuffs
      .map(b => ({ ...b, duration: b.duration - 1 }))
      .filter(b => b.duration > 0);

    // A. Player Action
    if (actionType === 'melee') {
      const wepBonus = character.equipment.primary?.stats.str || 0;
      dmgToMonster = Math.floor(Math.random() * 15) + Math.floor(character.stats.str / 10) + wepBonus + 5;
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
      actionName = spell.name;
      if (character.mana < spell.manaCost) {
        triggerAlert('Not enough mana to project this spell!', 'error');
        return;
      }
      
      // Deduct mana
      character.mana -= spell.manaCost;

      if (spell.type === 'damage') {
        dmgToMonster = Math.floor(Math.random() * 30) + 25 + Math.floor(character.stats.int / 8);
        logChunk.push(`You weave arcane patterns! [${spell.name}] blast crashes into ${combatMonster.name} for ${dmgToMonster} elemental damage!`);
        
        const isCold = spell.name.toLowerCase().includes('frost') || spell.name.toLowerCase().includes('ice') || spell.name.toLowerCase().includes('cold');
        setCombatVisualEvent({
          id: Date.now(),
          type: isCold ? 'ice' : 'fire',
          label: spell.name,
          amount: dmgToMonster,
        });
      } else if (spell.type === 'heal') {
        healToParty = Math.floor(Math.random() * 25) + 35 + Math.floor(character.stats.wis / 8);
        character.hp = Math.min(character.maxHp, character.hp + healToParty);
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

    const baseExp = monster.level * 180 + Math.floor(Math.random() * 50);
    const baseGold = monster.level * 8 + Math.floor(Math.random() * 8);
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
      triggerAlert(`CONGRATULATIONS! You have dinged Level ${level}!`, 'success');
    } else {
      triggerAlert(`Victory! Defeated ${monster.name}. Received ${baseExp} XP!`, 'success');
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
      `[CRITICAL FAILURE] You collapsed from exhaustion! Simulated healers dragged you out to the safety gates.`,
      `[SYSTEM] You lost ${penalty} experience points as a penalty for falling close to the dungeons.`
    ]);

    setDmNarrative('The cold stone hits your face as consciousness slips away. The laughter of gnolls and dark elements fades into white. When you open your eyes, you are resting outside the safety gates of Qeynos Hills under the warm sun, a bit weaker but ready to rise again...');
    setCombatOver(true);
    setVictoryDetails(null);
    triggerAlert('You perished in dungeon combat! Awakening at Qeynos Hills.', 'error');
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

    triggerAlert(`Quest "${targetQuest.title}" Turned In! Gained +${goldReward}g and ${expReward} EXP.`, 'success');
  };

  // 8. View Renderers
  if (!character) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4">
        <CharacterCreator onCreated={handleCharacterCreated} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-gray-200 selection:bg-amber-600 selection:text-white pb-10">
      
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

      {/* 2. Top Character / Game Status Bar */}
      <header className="bg-slate-900 border-b border-amber-600/40 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-amber-600 to-amber-800 p-2 rounded-md ring-1 ring-amber-400/40">
              <Sparkles className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="font-sans text-lg font-bold tracking-wide text-white">
                EverQuest III Chronicles
              </h1>
              <div className="flex items-center gap-2 text-xs text-amber-500 font-mono">
                <Compass className="h-3 w-3 animate-spin" />
                <span>Simulated MMO Realm Server • Live</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm font-mono">
            {/* Level & Class badge */}
            <div className="bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded flex items-center gap-2">
              <span className="text-amber-500 font-black">LVL {character.level}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-200">{character.race} {character.class}</span>
            </div>

            {/* Health Bar */}
            <div className="w-36 md:w-44">
              <div className="flex justify-between text-[11px] mb-1 text-red-400">
                <span>HP</span>
                <span>{character.hp} / {character.maxHp}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-red-500 h-full transition-all duration-300" 
                  style={{ width: `${Math.max(0, (character.hp / character.maxHp) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Mana Bar */}
            <div className="w-36 md:w-44">
              <div className="flex justify-between text-[11px] mb-1 text-cyan-400">
                <span>Mana</span>
                <span>{character.mana} / {character.maxMana}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-300" 
                  style={{ width: `${Math.max(0, (character.mana / character.maxMana) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1 bg-slate-950/70 py-1 px-2.5 rounded text-amber-400 border border-amber-500/10">
              <Coins className="h-4 w-4" />
              <span className="font-bold">{character.gold}g</span>
            </div>

            <button 
              onClick={handleResetCharacter}
              title="Reroll character"
              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-red-400 border border-slate-700 rounded text-xs cursor-pointer transition-colors"
            >
              Reroll
            </button>
          </div>
        </div>
        
        {/* Experience Bar under the header */}
        <div className="w-full bg-slate-950 h-1.5 flex" title="Experience Points">
          <div 
            className="bg-purple-600 h-full transition-all duration-300"
            style={{ width: `${(character.exp / character.expToNextLevel) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* ================= LEFT ASIDE PANEL: Status / Character Sheet ================= */}
        <aside className="lg:col-span-1 space-y-6">
          
          {/* Attributes */}
          <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
              <User className="h-4 w-4 text-amber-500" />
              Hero Attributes
            </h3>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">STR (Strength)</span>
                <span className="font-bold text-white">{character.stats.str}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">STA (Stamina)</span>
                <span className="font-bold text-white">{character.stats.sta}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">AGI (Agility)</span>
                <span className="font-bold text-white">{character.stats.agi}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">DEX (Dexterity)</span>
                <span className="font-bold text-white">{character.stats.dex}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">INT (Arcane Int)</span>
                <span className="font-bold text-white">{character.stats.int}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">WIS (Divine Wis)</span>
                <span className="font-bold text-white">{character.stats.wis}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">CHA (Charisma)</span>
                <span className="font-bold text-white">{character.stats.cha}</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded border-t border-amber-600/10 mt-2">
                <span className="text-amber-400">Experience to Ding</span>
                <span className="font-bold text-amber-400">{character.exp} / {character.expToNextLevel} xp</span>
              </div>
              <div className="flex justify-between bg-slate-950 p-2 rounded">
                <span className="text-slate-400">Patron Deity</span>
                <span className="font-bold text-slate-300 text-[10px] uppercase truncate max-w-[150px]">{character.deity}</span>
              </div>
            </div>
          </section>

          {/* Active Equipment Slots */}
          <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-500" />
              Equipped Armory
            </h3>

            <div className="space-y-2 text-xs font-mono">
              {(['primary', 'chest', 'head', 'hands', 'feet'] as SlotType[]).map((slot) => {
                const item = character.equipment[slot];
                return (
                  <div key={slot} className="bg-slate-1000 p-2 rounded border border-slate-800 flex items-center justify-between gap-2 min-h-[46px]">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">{slot} slot</span>
                      {item ? (
                        <span className={`font-semibold text-xs block ${
                          item.rarity === 'epic' ? 'text-amber-400 font-bold' : item.rarity === 'rare' ? 'text-blue-400' : 'text-slate-200'
                        }`}>
                          {item.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">Empty</span>
                      )}
                    </div>
                    {item && (
                      <button
                        onClick={() => handleUnequipItem(slot)}
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 py-1 px-2 rounded cursor-pointer transition-all shrink-0"
                      >
                        Strip
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </aside>

        {/* ================= CENTER PANELS: Main Game Viewport & Tabs ================= */}
        <section className="lg:col-span-2 space-y-6">
          
          {/* Tab Selection */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 gap-1">
            <button
              onClick={() => { setSelectedTab('zones'); setInCombat(false); }}
              className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'zones' && !inCombat ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Compass className="h-4 w-4" />
              Zones
            </button>
            <button
              onClick={() => setSelectedTab('lore')}
              className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'lore' ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Tome
            </button>
            <button
              onClick={() => setSelectedTab('quests')}
              className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'quests' ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Database className="h-4 w-4" />
              Quests
            </button>
            <button
              onClick={() => setSelectedTab('merchant')}
              className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'merchant' ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              Tunnel
            </button>
            <button
              onClick={() => setSelectedTab('character')}
              className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'character' ? 'bg-amber-600 text-slate-950 font-black' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <User className="h-4 w-4" />
              Items
            </button>
          </div>

          {/* Actual Combat View Overlay - takes precedence if inCombat is true */}
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
                  <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">Engage Combat Move</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCombatAction('melee')}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono hover:text-white border border-slate-700 py-2.5 px-4 rounded text-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sword className="h-4 w-4 text-red-400" />
                      Melee Strike
                    </button>
                    
                    {character.class === 'Warrior' || character.class === 'Paladin' || character.class === 'Shadow Knight' ? (
                      <button
                        onClick={() => handleCombatAction('taunt')}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-mono hover:text-white border border-slate-700 py-2.5 px-4 rounded text-xs shrink-0 cursor-pointer flex items-center gap-1.5"
                      >
                        <Shield className="h-4 w-4 text-emerald-400" />
                        Guard Taunt
                      </button>
                    ) : null}

                    {currentSpells.map(spell => (
                      <button
                        key={spell.id}
                        onClick={() => handleCombatAction(spell)}
                        title={spell.effect}
                        className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono hover:text-white border border-slate-705 py-2.5 px-4 rounded text-xs shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        <Wand2 className="h-4 w-4 text-cyan-400" />
                        Cast {spell.name} <span className="text-[10px] text-slate-500 ml-1">({spell.manaCost}m)</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">Choose dynamic spells carefully! Spell casting consumes direct Spell Points (Mana).</p>
                </div>
              )}

            </div>
          ) : (
            /* TAB 1: Explorations & Fighting Monsters */
            selectedTab === 'zones' && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-6">
                
                {/* Zone Select Grid */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Zone Select Map:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GAME_ZONES.map((zone) => (
                      <button
                        key={zone.id}
                        onClick={() => {
                          setActiveZone(zone);
                          setLoreTopic(zone.name);
                        }}
                        className={`text-slate-100 p-4 rounded-lg font-mono border text-left transition-all relative overflow-hidden group cursor-pointer ${
                          activeZone.id === zone.id
                            ? 'bg-gradient-to-br from-slate-900 to-slate-1000 border-amber-500/60 ring-1 ring-amber-500/20 shadow'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                        }`}
                      >
                        <div className="absolute top-2 right-2 flex items-center">
                          <MapPin className={`h-4 w-4 ${activeZone.id === zone.id ? 'text-amber-500' : 'text-slate-600'}`} />
                        </div>
                        <div className="font-bold text-xs truncate pr-4 text-slate-200">{zone.name}</div>
                        <div className="text-[10px] font-medium text-slate-500 mt-1 uppercase">Lvl {zone.minLevel}+</div>
                        <div className={`text-[9px] font-extrabold uppercase mt-2 inline-block px-1.5 py-0.5 rounded ${
                          zone.difficulty === 'Safe'
                            ? 'bg-emerald-950 text-emerald-400'
                            : zone.difficulty === 'Easy'
                            ? 'bg-blue-950 text-blue-400'
                            : zone.difficulty === 'Medium'
                            ? 'bg-yellow-950 text-yellow-400'
                            : 'bg-red-950 text-red-400'
                        }`}>
                          {zone.difficulty}
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

                {/* Selected Zone Description Profile */}
                <div className="bg-slate-952 p-4 rounded-lg border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-serif text-base text-white">{activeZone.name} Chronicles</span>
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
                      Read Ancient Lore
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-serif">{activeZone.description}</p>
                </div>

                {/* Available Monsters Section (The Grind loop) */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                      Zone Targets in Field:
                    </span>
                    <button 
                      onClick={handleRequestQuest}
                      disabled={questLoading}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-500 border border-slate-700 px-3 py-1 rounded cursor-pointer disabled:opacity-40 transition-all flex items-center gap-1 font-mono font-bold"
                    >
                      {questLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                      📜 Summon Side Quest
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
                                Boss Encounter
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Level: {monster.level}</span>
                            <span>•</span>
                            <span>Stats HP: {monster.hp}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInitiateCombat(monster)}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-wide cursor-pointer shadow-md transition-all flex items-center gap-1"
                        >
                          <Sword className="h-3.5 w-3.5" />
                          Engage
                        </button>
                      </div>
                    ))}
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
                  The Tome of Norrath
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Query the planar archives. Search any fantasy monster, zone, hero, or legendary item to compile lore chronicles utilizing the Gemini model.
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
                      <span className="text-xs text-slate-400 font-mono">Unbinding cosmic ink chronicles...</span>
                    </div>
                  )}

                  <h4 className="text-amber-400 font-bold text-base border-b border-slate-850 pb-1 font-serif flex items-center gap-1">
                    📖 Chronicles of: {loreResponse.title}
                  </h4>
                  <p className="text-xs text-slate-300 whitespace-pre-line indent-4">{loreResponse.text}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Active Quests Tab */}
          {selectedTab === 'quests' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                    <Database className="h-5 w-5 text-amber-500" />
                    Active Guild Quests
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Seek out monsters inside the designated exploration zones to fulfill goals.</p>
                </div>
              </div>

              {character.quests.length === 0 ? (
                <div className="bg-slate-950 rounded p-6 text-center border border-slate-800/60 font-mono">
                  <p className="text-xs text-slate-500">No active quests in your quest scroll.</p>
                  <button
                    onClick={handleRequestQuest}
                    disabled={questLoading}
                    className="mt-3 bg-amber-500 hover:bg-amber-400 text-slate-955 font-black px-4 py-2 text-xs uppercase tracking-wider rounded cursor-pointer font-bold inline-block"
                  >
                    Summon Quest
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {character.quests.map((quest) => (
                    <div key={quest.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start gap-4 flex-wrap">
                        <div>
                          <h4 className="font-serif text-sm font-bold text-amber-400">{quest.title}</h4>
                          <span className="text-[10px] text-slate-500 font-mono block">Quest giver: {quest.giver}</span>
                        </div>
                        
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                          quest.status === 'completed' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                        }`}>
                          {quest.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 italic leading-relaxed font-serif">{quest.description}</p>
                      
                      <div className="text-xs font-mono bg-slate-900 p-2.5 rounded border border-slate-850 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Objective Log:</span>
                        <div className="text-slate-200">{quest.objective}</div>
                        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                          <span>Slay Counts:</span>
                          <span className="text-amber-500 font-extrabold">{quest.progressCurrent} / {quest.progressRequired}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-1.5">
                        <div className="flex gap-3 text-[11px] font-mono text-slate-400">
                          <span>Reward gold: <span className="text-amber-300 font-bold">{quest.rewardGold}g</span></span>
                          <span>Reward XP: <span className="text-purple-400 font-bold">{quest.rewardExp}xp</span></span>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          {quest.status === 'completed' ? (
                            <button
                              onClick={() => handleClaimQuestRewards(quest.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-black uppercase py-1 px-2.5 rounded cursor-pointer-all"
                            >
                              Claim Rewards
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAbandonQuest(quest.id)}
                              className="bg-slate-800 hover:bg-slate-700 hover:text-red-400 font-mono text-[10px] py-1 px-2.5 rounded cursor-pointer-all text-slate-500"
                            >
                              Abandon
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Trade Tunnel Merchant Store */}
          {selectedTab === 'merchant' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="font-serif text-lg font-bold text-white flex items-center gap-1.5">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                  East Commonlands Tunnel Merchant
                </h3>
                <p className="text-xs text-slate-500 mt-1">Buy exotic weapons and chest armors, or trade local dungeon drops for copper-gold coins.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COMMON_TEMPLATES.merchantItems.map((item) => (
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
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-amber-500/80 mt-1.5">
                        {item.stats.str && <span>STR +{item.stats.str}</span>}
                        {item.stats.sta && <span>STA +{item.stats.sta}</span>}
                        {item.stats.agi && <span>AGI +{item.stats.agi}</span>}
                        {item.stats.mana && <span>Mana +{item.stats.mana}</span>}
                        {item.stats.hp && <span>HP +{item.stats.hp}</span>}
                        {item.stats.ac && <span>AC +{item.stats.ac}</span>}
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
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-tight block truncate mt-0.5">{item.description}</p>
                        
                        {/* Stats list */}
                        <div className="flex flex-wrap gap-1.5 text-[9px] font-mono text-amber-500/80 mt-1">
                          {item.stats.str && <span>STR +{item.stats.str}</span>}
                          {item.stats.sta && <span>STA +{item.stats.sta}</span>}
                          {item.stats.agi && <span>AGI +{item.stats.agi}</span>}
                          {item.stats.mana && <span>Mana +{item.stats.mana}</span>}
                          {item.stats.hp && <span>HP +{item.stats.hp}</span>}
                          {item.stats.ac && <span>AC +{item.stats.ac}</span>}
                        </div>
                      </div>

                      <div className="flex gap-1.5 shrink-0 select-none">
                        {item.slot !== 'none' ? (
                          <button
                            onClick={() => handleEquipItem(item)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded cursor-pointer transition-all"
                          >
                            Equip
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUseConsumable(item.id, item.name)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1 rounded cursor-pointer transition-all"
                          >
                            Consume
                          </button>
                        )}

                        <button
                          onClick={() => handleSellItem(item.id, item.price, item.name)}
                          title="Sell to trade merchant for gold coins"
                          className="text-xs bg-slate-800 hover:bg-slate-700 hover:text-amber-400 text-slate-500 px-2 py-1 rounded cursor-pointer"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </section>

        {/* ================= RIGHT PANEL: Live AI ChatBox and Multiplayers ================= */}
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm flex flex-col h-[520px]">
            
            {/* Chat Box Header info */}
            <div className="p-3 border-b border-slate-800 bg-slate-900/40 rounded-t-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1">
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                  Norrath Global Chat
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">AI Bots Retort to your actions</span>
              </div>
              <Compass className="h-4 w-4 text-emerald-500/80 animate-pulse" />
            </div>

            {/* Chat Messages Frame list */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-slate-950/80 font-mono text-[11px] leading-relaxed scroll-smooth select-text">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-1.5 rounded transition-all hover:bg-slate-900/40">
                  <span className="text-slate-500">[{msg.timestamp}]</span>{' '}
                  <span className={`font-bold transition-all text-[11px] uppercase ${
                    msg.channel === 'System'
                      ? 'text-red-400'
                      : msg.channel === 'Auction'
                      ? 'text-green-400'
                      : msg.channel === 'Shout'
                      ? 'text-amber-400 font-extrabold'
                      : msg.channel === 'Guild'
                      ? 'text-purple-400'
                      : 'text-violet-300'
                  }`}>
                    [{msg.channel}]
                  </span>{' '}
                  <span className="text-white hover:text-amber-400 cursor-pointer font-extrabold">{msg.sender}:</span>{' '}
                  <span className={`${
                    msg.text.includes('[') ? 'text-amber-300 font-bold' : 'text-slate-300'
                  }`}>
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Message Input form */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-900/60 rounded-b-lg space-y-2">
              
              {/* Channel buttons selectors */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono border-b border-slate-800 pb-2">
                {(['OOC', 'Auction', 'Guild', 'Shout'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChatChannel(ch)}
                    className={`px-2 py-1 rounded capitalize cursor-pointer transition-all ${
                      chatChannel === ch
                        ? 'bg-amber-600 font-black text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>

              {/* Text area and submit row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  disabled={isSendingChat}
                  placeholder={`Say in ${chatChannel}...`}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-955 border border-slate-700 rounded px-2.5 py-1.5 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isSendingChat || !chatInput.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 text-xs font-bold rounded flex items-center justify-center cursor-pointer transition-all"
                >
                  {isSendingChat ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </form>

          </div>
        </section>

      </main>

    </div>
  );
}
