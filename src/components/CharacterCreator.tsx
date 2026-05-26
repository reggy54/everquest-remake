import React, { useState } from 'react';
import { CharacterClass, CharacterRace, CombatStats, PlayerCharacter, SlotType, Item } from '../types';
import {
  CLASS_DESCRIPTIONS,
  RACE_BONUSES,
  SYSTEM_DEITIES,
  INITIAL_BASE_STATS,
  STARTING_GEAR,
} from '../data/gameData';
import { Shield, Sparkles, Wand2, RefreshCw } from 'lucide-react';

interface CharacterCreatorProps {
  onCreated: (character: PlayerCharacter) => void;
}

export default function CharacterCreator({ onCreated }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState<CharacterRace>('Human');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('Warrior');
  const [selectedDeity, setSelectedDeity] = useState<string>(SYSTEM_DEITIES[0]);

  // Points distribution
  const [availablePoints, setAvailablePoints] = useState(20);
  const [bonusStats, setBonusStats] = useState<Record<keyof CombatStats, number>>({
    str: 0,
    sta: 0,
    agi: 0,
    dex: 0,
    int: 0,
    wis: 0,
    cha: 0,
  });

  const getBaseStat = (stat: keyof CombatStats) => {
    const classBase = INITIAL_BASE_STATS[selectedClass]?.[stat] || 50;
    const raceBonus = (RACE_BONUSES[selectedRace]?.stats as any)?.[stat] || 0;
    return classBase + raceBonus;
  };

  const getFinalStat = (stat: keyof CombatStats) => {
    return getBaseStat(stat) + bonusStats[stat];
  };

  const adjustStat = (stat: keyof CombatStats, amount: number) => {
    if (amount > 0 && availablePoints > 0) {
      setBonusStats((prev) => ({ ...prev, [stat]: prev[stat] + 1 }));
      setAvailablePoints((prev) => prev - 1);
    } else if (amount < 0 && bonusStats[stat] > 0) {
      setBonusStats((prev) => ({ ...prev, [stat]: prev[stat] - 1 }));
      setAvailablePoints((prev) => prev + 1);
    }
  };

  const generateRandomName = () => {
    const prefixes = ['Grim', 'Ald', 'Mel', 'Thar', 'Syl', 'Eld', 'Kor', 'Fip', 'Dar', 'Val', 'Brel', 'Xor'];
    const suffixes = ['dor', 'wind', 'blade', 'bane', 'whisper', 'smasher', 'glen', 'mook', 'forge', 'fire'];
    const randomName = prefixes[Math.floor(Math.random() * prefixes.length)] +
                       suffixes[Math.floor(Math.random() * suffixes.length)] +
                       Math.floor(Math.random() * 99);
    setName(randomName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Calculate final stats
    const finalStats: CombatStats = {
      str: getFinalStat('str'),
      sta: getFinalStat('sta'),
      agi: getFinalStat('agi'),
      dex: getFinalStat('dex'),
      int: getFinalStat('int'),
      wis: getFinalStat('wis'),
      cha: getFinalStat('cha'),
    };

    // Calculate level health and mana
    const multiplier = selectedClass === 'Warrior' ? 12 : selectedClass === 'Cleric' ? 8 : 6;
    const baseHp = 100 + finalStats.sta * multiplier;
    const baseMana = (selectedClass === 'Wizard' || selectedClass === 'Cleric' || selectedClass === 'Enchanter')
      ? 80 + finalStats.int * 5
      : 30;

    // Setup equipment
    const templateGear = STARTING_GEAR[selectedClass] || {};
    const equipment: Record<SlotType, Item | null> = {
      head: null,
      chest: (templateGear.chest as Item) || null,
      arms: null,
      legs: null,
      hands: (templateGear.hands as Item) || null,
      feet: null,
      primary: (templateGear.primary as Item) || null,
      secondary: null,
    };

    const starterQuests = [
      {
        id: 'starter-quest-1',
        title: 'Entering the Arena',
        giver: 'Guildmaster Kyle',
        description: `Welcome to Norrath, recruit. The local guild halls are looking for champions of caliber. Travel to the Qeynos Hills and defeat your first Fire Beetle to prove your worth to our guild masters.`,
        objective: 'Defeat 1 Fire Beetle in Qeynos Hills.',
        rewardExp: 150,
        rewardGold: 5,
        status: 'active' as const,
        progressCurrent: 0,
        progressRequired: 1,
      },
    ];

    const character: PlayerCharacter = {
      name: name.trim(),
      race: selectedRace,
      class: selectedClass,
      deity: selectedDeity,
      level: 1,
      exp: 0,
      expToNextLevel: 1000,
      hp: baseHp,
      maxHp: baseHp,
      mana: baseMana,
      maxMana: baseMana,
      gold: 45, // Starting gold
      stats: finalStats,
      equipment,
      inventory: [
        {
          id: 'apple',
          name: 'Sweet Meadow Apple',
          slot: 'none',
          description: 'A crunchy red apple that slowly restores 15 HP out of combat.',
          price: 1,
          rarity: 'common',
          stats: {},
        },
        {
          id: 'bandage',
          name: 'First-Aid Bandage',
          slot: 'none',
          description: 'Basic linen bindings suitable for treating heavy cuts.',
          price: 2,
          rarity: 'common',
          stats: {},
        },
      ],
      quests: starterQuests,
      unlockedSpells: [],
    };

    onCreated(character);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden p-6 md:p-8 animate-fade-in text-gray-100">
      <div className="text-center mb-8">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-amber-500" />
          EverQuest III • Character Creation
        </h2>
        <p className="text-slate-400 mt-2 text-sm max-w-lg mx-auto">
          Forge your legend. Choose your heritage, align your soul with the gods of Norrath, and shape your attributes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Name Select */}
        <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-2/3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Character Name:
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Grimgor_Bronze"
              value={name}
              onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              maxLength={16}
              className="w-full bg-slate-950 border border-slate-600 rounded px-4 py-2.5 text-base font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={generateRandomName}
            className="w-full md:w-auto mt-6 bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2.5 rounded border border-slate-500 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Random Name
          </button>
        </div>

        {/* 2-Column Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Race and Deity */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Race:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(RACE_BONUSES).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSelectedRace(r as CharacterRace);
                      setBonusStats({ str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 });
                      setAvailablePoints(20);
                    }}
                    className={`text-xs py-2 rounded font-medium border transition-all ${
                      selectedRace === r
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-955 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs bg-slate-950 p-2.5 rounded text-amber-300 italic border border-slate-800">
                {RACE_BONUSES[selectedRace]?.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Deity Alignment:
              </label>
              <select
                value={selectedDeity}
                onChange={(e) => setSelectedDeity(e.target.value)}
                className="w-full bg-slate-955 border border-slate-700 rounded p-2 text-slate-200 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {SYSTEM_DEITIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Class Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Class:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(CLASS_DESCRIPTIONS).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedClass(c as CharacterClass);
                      setBonusStats({ str: 0, sta: 0, agi: 0, dex: 0, int: 0, wis: 0, cha: 0 });
                      setAvailablePoints(20);
                    }}
                    className={`text-xs py-2 rounded font-medium border transition-all ${
                      selectedClass === c
                        ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                        : 'bg-slate-955 hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs bg-slate-950 p-2.5 rounded text-amber-300 italic border border-slate-800">
                {CLASS_DESCRIPTIONS[selectedClass]}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Allocations */}
        <div className="bg-slate-950 rounded-lg p-5 border border-slate-800">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono">
                Attributes Allocation
              </h3>
              <p className="text-xs text-slate-500">Spend starting points to specialize your hero</p>
            </div>
            <div className="bg-amber-950 text-amber-300 border border-amber-800/60 rounded px-3 py-1 text-sm font-bold font-mono">
              Points Available: {availablePoints}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(['str', 'sta', 'agi', 'dex', 'int', 'wis', 'cha'] as (keyof CombatStats)[]).map((stat) => (
              <div key={stat} className="bg-slate-900 border border-slate-800 rounded p-3 text-center">
                <span className="block text-xs uppercase font-mono tracking-wider text-slate-400 mb-1 font-bold">
                  {stat}
                </span>
                <div className="text-xl font-extrabold text-white mt-1 mb-2">
                  {getFinalStat(stat)}{' '}
                  {bonusStats[stat] > 0 && (
                    <span className="text-xs text-green-400 font-bold ml-1">+{bonusStats[stat]}</span>
                  )}
                </div>
                <div className="flex justify-center gap-2 mt-1">
                  <button
                    type="button"
                    disabled={bonusStats[stat] === 0}
                    onClick={() => adjustStat(stat, -1)}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-red-400 font-bold border border-slate-700 disabled:opacity-30 disabled:pointer-events-none text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    disabled={availablePoints === 0}
                    onClick={() => adjustStat(stat, 1)}
                    className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-green-400 font-bold border border-slate-700 disabled:opacity-30 disabled:pointer-events-none text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finalize Button */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-4 rounded text-base uppercase tracking-wider shadow-lg shadow-amber-500/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Create Hero & Enter Norrath
          </button>
        </div>
      </form>
    </div>
  );
}
