import { PlayerCharacter } from '../types';

export function getCharacterAvatarUrl(character: PlayerCharacter | null | undefined): string {
  if (!character) return `https://api.dicebear.com/7.x/adventurer/svg?seed=mock&backgroundColor=transparent`;

  // Make the appearance completely dependent on class and race
  // We can pass different props to DiceBear adventurer API based on class
  const cClass = character.class.toLowerCase();
  
  let hair = 'short01';
  let skinColor = 'f5deb3';
  let features = '';
  let accessories = '';
  
  if (cClass === 'warrior' || cClass === 'paladin') {
     hair = 'short16';
     features = 'cuffs,scar';
  } else if (cClass === 'mage' || cClass === 'warlock') {
     hair = 'long01';
     accessories = 'sunglasses';
  } else if (cClass === 'rogue' || cClass === 'hunter') {
     hair = 'short06';
     accessories = 'glasses';
  } else if (cClass === 'priest' || cClass === 'shaman') {
     hair = 'bun';
     features = 'freckles';
  }
  
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(character.name)}&backgroundColor=transparent&hair=${hair}&features=${features}&accessories=${accessories}`;
}
