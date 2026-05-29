import { PlayerCharacter } from '../types';

export function getCharacterAvatarUrl(character: PlayerCharacter | null | undefined): string {
  if (!character) return `https://api.dicebear.com/7.x/adventurer/svg?seed=mock&backgroundColor=transparent`;

  const cClass = character.class.toLowerCase();
  const cRace = character.race.toLowerCase();
  
  let hair = 'short02'; // default
  let accessories = '';
  let features = '';
  
  // Class based styling
  if (cClass === 'warrior' || cClass === 'paladin') {
     hair = 'short16';
     features = 'belt,cuffs';
  } else if (cClass === 'mage' || cClass === 'summoner') {
     hair = 'long01';
     accessories = 'sunglasses';
  } else if (cClass === 'ranger' || cClass === 'rogue') {
     hair = 'short06';
     features = 'patch1';
     accessories = 'glasses';
  } else if (cClass === 'priest' || cClass === 'shaman') {
     hair = 'long28';
     features = 'beautyMark';
  }

  // Race based color hints
  let baseColor = 'f1c27d'; // human/standard
  if (cRace === 'orc') baseColor = '8bc34a';
  else if (cRace === 'dark elf') baseColor = '7e57c2';
  else if (cRace === 'dwarf') baseColor = 'e0ac69';
  else if (cRace === 'moon spirit') baseColor = 'e2e8f0';
  else if (cRace === 'dragonborn') baseColor = 'ef5350';
  else if (cRace === 'high elf') baseColor = 'ffccb6';
  else if (cRace === 'mechanical construct') baseColor = '9e9e9e';
  
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(character.name)}&backgroundColor=transparent&hair=${hair}&features=${features}&accessories=${accessories}&skinColor=${baseColor}`;
}

