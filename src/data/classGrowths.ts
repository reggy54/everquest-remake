import { CharacterClass, CombatStats } from '../types';

export const CLASS_STAT_GROWTHS: Record<CharacterClass, Partial<CombatStats>> = {
  'Warrior': { str: 2.0, sta: 1.5, agi: 1.0, dex: 0.0, int: 0.2, wis: 0.3, cha: 0.0 },
  'Paladin': { str: 1.2, sta: 1.8, agi: 0.6, dex: 0.0, int: 0.8, wis: 0.6, cha: 0.0 },
  'Rogue': { str: 0.5, sta: 1.0, agi: 2.1, dex: 0.0, int: 0.4, wis: 1.0, cha: 0.0 },
  'Ranger': { str: 0.8, sta: 1.0, agi: 1.8, dex: 0.0, int: 0.7, wis: 0.7, cha: 0.0 },
  'Mage': { str: 0.3, sta: 0.8, agi: 0.8, dex: 0.0, int: 2.2, wis: 0.9, cha: 0.0 },
  'Summoner': { str: 0.4, sta: 0.8, agi: 0.9, dex: 0.0, int: 1.7, wis: 1.2, cha: 0.0 },
  'Priest': { str: 0.2, sta: 1.0, agi: 0.5, dex: 0.0, int: 1.3, wis: 2.0, cha: 0.0 },
  'Shaman': { str: 0.7, sta: 1.1, agi: 1.0, dex: 0.0, int: 1.4, wis: 0.8, cha: 0.0 },
};

export const SPEC_STAT_GROWTHS: Record<string, Record<string, Partial<CombatStats>>> = {
  'Warrior': {
    'Берсерк': { str: 2.5, sta: 1.2, agi: 1.1, dex: 0.0, int: 0.1, wis: 0.1, cha: 0.0 },
    'Гладиатор': { str: 1.8, sta: 1.4, agi: 1.6, dex: 0.0, int: 0.1, wis: 0.1, cha: 0.0 },
    'Защитник': { str: 1.5, sta: 2.5, agi: 0.8, dex: 0.0, int: 0.1, wis: 0.1, cha: 0.0 },
  },
  'Paladin': {
    'Крестоносец': { str: 1.8, sta: 1.5, agi: 0.5, dex: 0.0, int: 0.7, wis: 0.5, cha: 0.0 },
    'Храмовник': { str: 1.0, sta: 2.2, agi: 0.4, dex: 0.0, int: 1.0, wis: 0.4, cha: 0.0 },
    'Инквизитор': { str: 1.0, sta: 1.2, agi: 0.3, dex: 0.0, int: 1.5, wis: 1.0, cha: 0.0 },
  },
  'Rogue': {
    'Убийца': { str: 0.8, sta: 0.8, agi: 2.5, dex: 0.0, int: 0.3, wis: 0.6, cha: 0.0 },
    'Тень': { str: 0.4, sta: 0.9, agi: 2.2, dex: 0.0, int: 1.0, wis: 0.5, cha: 0.0 },
    'Дуэлянт': { str: 1.2, sta: 1.2, agi: 1.8, dex: 0.0, int: 0.3, wis: 0.5, cha: 0.0 },
  },
  'Ranger': {
    'Снайпер': { str: 0.6, sta: 0.9, agi: 2.4, dex: 0.0, int: 0.5, wis: 0.6, cha: 0.0 },
    'Следопыт': { str: 1.0, sta: 1.2, agi: 1.8, dex: 0.0, int: 0.4, wis: 0.6, cha: 0.0 },
    'Повелитель зверей': { str: 0.9, sta: 1.1, agi: 1.5, dex: 0.0, int: 0.5, wis: 1.0, cha: 0.0 },
  },
  'Mage': {
    'Элементалист': { str: 0.2, sta: 0.7, agi: 0.7, dex: 0.0, int: 2.6, wis: 0.8, cha: 0.0 },
    'Чернокнижник': { str: 0.3, sta: 1.2, agi: 0.5, dex: 0.0, int: 2.2, wis: 0.8, cha: 0.0 },
    'Мистик': { str: 0.2, sta: 0.6, agi: 0.9, dex: 0.0, int: 2.0, wis: 1.3, cha: 0.0 },
  },
  'Summoner': {
    'Некромант': { str: 0.3, sta: 1.1, agi: 0.7, dex: 0.0, int: 1.9, wis: 1.0, cha: 0.0 },
    'Призыватель демонов': { str: 0.5, sta: 1.0, agi: 0.8, dex: 0.0, int: 1.8, wis: 0.9, cha: 0.0 },
    'Хранитель душ': { str: 0.3, sta: 0.7, agi: 0.8, dex: 0.0, int: 1.5, wis: 1.7, cha: 0.0 },
  },
  'Priest': {
    'Целитель': { str: 0.1, sta: 1.0, agi: 0.4, dex: 0.0, int: 1.2, wis: 2.3, cha: 0.0 },
    'Оракул': { str: 0.1, sta: 0.8, agi: 0.6, dex: 0.0, int: 1.8, wis: 1.7, cha: 0.0 },
    'Аватар': { str: 0.5, sta: 1.3, agi: 0.3, dex: 0.0, int: 1.0, wis: 1.9, cha: 0.0 },
  },
  'Shaman': {
    'Шаман Стихий': { str: 0.5, sta: 1.0, agi: 0.8, dex: 0.0, int: 1.9, wis: 0.8, cha: 0.0 },
    'Шаман Крови': { str: 1.2, sta: 1.5, agi: 0.9, dex: 0.0, int: 1.0, wis: 0.4, cha: 0.0 },
    'Шаман Духов': { str: 0.6, sta: 0.9, agi: 0.7, dex: 0.0, int: 1.3, wis: 1.5, cha: 0.0 },
  },
};

export const FREE_STATS_PER_LEVEL = 1;
