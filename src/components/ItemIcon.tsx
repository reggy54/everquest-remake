import React from 'react';
import { Item } from '../types';
import { 
  Sword, 
  Shield, 
  Shirt, 
  Gem, 
  FlaskConical, 
  Crown, 
  Hammer,
  Book,
  Crosshair,
  Scroll,
  Sprout,
  Droplet,
  Box,
  Wind,
  Drumstick,
  Axe
} from 'lucide-react';

export function getItemIcon(item: Item | undefined | null, size: number = 24) {
  if (!item) return <Box size={size} />;
  
  const nameLow = item.name.toLowerCase();
  
  if (item.slot === 'primary' || item.slot === 'secondary') {
    if (nameLow.includes('bow') || nameLow.includes('лук')) return <Crosshair size={size} />;
    if (nameLow.includes('shield') || nameLow.includes('щит')) return <Shield size={size} />;
    if (nameLow.includes('staff') || nameLow.includes('посох')) return <Wind size={size} />;
    if (nameLow.includes('wand') || nameLow.includes('жезл')) return <Wind size={size} />;
    if (nameLow.includes('axe') || nameLow.includes('топор')) return <Axe size={size} />;
    return <Sword size={size} />;
  }
  
  if (item.slot === 'head') return <Crown size={size} />;
  if (item.slot === 'chest') return <Shirt size={size} />;
  if (item.slot === 'legs') return <Shirt size={size} className="rotate-180" />;
  if (item.slot === 'feet') return <Box size={size} />;
  if (item.slot === 'amulet' || item.slot === 'ring1' || item.slot === 'ring2') return <Gem size={size} />;
  
  if (item.slot === 'consumable') {
    if (nameLow.includes('food') || nameLow.includes('мясо') || nameLow.includes('суп')) return <Drumstick size={size} />; 
    return <FlaskConical size={size} />;
  }
  
  if (item.slot === 'material') {
    if (nameLow.includes('herb') || nameLow.includes('трав')) return <Sprout size={size} />;
    if (nameLow.includes('water') || nameLow.includes('вод')) return <Droplet size={size} />;
    if (nameLow.includes('cloth') || nameLow.includes('ткан')) return <Scroll size={size} />;
    if (nameLow.includes('meat') || nameLow.includes('мясо')) return <Drumstick size={size} />;
    return <Hammer size={size} />;
  }
  
  if (item.slot === 'rune') return <Gem size={size} />;

  return <Box size={size} />;
}

export function ItemIconWrapper({ item, size = 24, className = "" }: { item: Item | null | undefined, size?: number, className?: string }) {
  if (!item) return null;
  return (
    <div className={`flex items-center justify-center opacity-80 ${className}`}>
      {getItemIcon(item, size)}
    </div>
  );
}
