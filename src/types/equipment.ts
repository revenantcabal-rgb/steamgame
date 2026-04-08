import type { Job2ClassId } from './hero';

export type EquipmentSlot = 'main_hand' | 'off_hand' | 'armor' | 'legs' | 'gloves' | 'boots' | 'ring1' | 'ring2' | 'ring3' | 'earring1' | 'earring2' | 'necklace';
export type ItemRarity = 'common' | 'rare' | 'unique' | 'plague';
export type GearSource = 'forged' | 'salvaged' | 'scavenged' | 'issued' | 'decorated';
export type WeaponType = 'melee' | 'ranger' | 'demolitions';
export type GearSlotCategory = 'weapon' | 'shield' | 'armor' | 'legs' | 'gloves' | 'boots' | 'ring' | 'earring' | 'necklace';

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9ca3af',
  rare: '#3b82f6',
  unique: '#a855f7',
  plague: '#f97316',
};

export const RARITY_LABELS: Record<ItemRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  unique: 'Unique',
  plague: 'Plague',
};

export const ALL_EQUIPMENT_SLOTS: { slot: EquipmentSlot; label: string; category: GearSlotCategory }[] = [
  { slot: 'main_hand', label: 'Main Hand', category: 'weapon' },
  { slot: 'off_hand', label: 'Off Hand', category: 'shield' },
  { slot: 'armor', label: 'Armor', category: 'armor' },
  { slot: 'legs', label: 'Legs', category: 'legs' },
  { slot: 'gloves', label: 'Gloves', category: 'gloves' },
  { slot: 'boots', label: 'Boots', category: 'boots' },
  { slot: 'ring1', label: 'Ring 1', category: 'ring' },
  { slot: 'ring2', label: 'Ring 2', category: 'ring' },
  { slot: 'ring3', label: 'Ring 3', category: 'ring' },
  { slot: 'earring1', label: 'Earring 1', category: 'earring' },
  { slot: 'earring2', label: 'Earring 2', category: 'earring' },
  { slot: 'necklace', label: 'Necklace', category: 'necklace' },
];

export interface StatRequirement {
  stat: 'str' | 'dex' | 'int' | 'con' | 'per' | 'luk';
  value: number;
}

export interface StatBonus {
  stat: string; // e.g. 'meleeAttack', 'defense', 'maxHp', 'critChance', etc.
  value: number;
  isPercentage: boolean;
}

export interface Aspect {
  name: string;
  upside: StatBonus;
  downside: StatBonus;
}

export interface GearTemplate {
  id: string;
  name: string;
  description?: string;
  slot: GearSlotCategory;
  tier: number; // 1-8
  levelReq: number;
  statRequirements: StatRequirement[];
  baseStats: StatBonus[];
  inherentDownside?: StatBonus;
  /** Weapon-only */
  weaponType?: WeaponType;
  isTwoHanded?: boolean;
  /** Weapon stat XP: which stats gain XP when this weapon is used in combat. [stat, percentage] */
  weaponStatXp?: [string, number][];
  /** Ring3-only: stat focus ring type. Only rings with this field can go in ring3 slot. */
  statFocusRing?: {
    /** Primary stat (70% of combat XP goes here) */
    primaryStat: string;
    /** Secondary stat (30% goes here, OR if dual, 50/50 split) */
    secondaryStat?: string;
    /** If true, it's a dual ring (50/50 split instead of 70/30) */
    isDual?: boolean;
  };
  /** Crafting recipe */
  craftingInputs: { resourceId: string; quantity: number }[];
  craftSkillId: string;
  craftSkillLevel: number;
  craftXp: number;
  /** Previous tier gear required to craft this (gear chaining). Template ID. */
  requiresPreviousTier?: string;
  /** Set ID if this is part of a green set */
  setId?: string;
  /** Crafting duration in seconds (derived from tier if not set) */
  craftTime?: number;
  /** Job2 class requirement — only heroes with this Job2 class can equip */
  job2ClassReq?: Job2ClassId;
}

/** Get the crafting duration for a gear template (seconds). Includes 2.5x balance multiplier. */
export function getCraftTime(template: GearTemplate): number {
  if (template.craftTime) return template.craftTime;
  // Base time by tier (seconds), with 2.5x multiplier baked in
  const BASE_TIMES: Record<number, number> = { 1: 12, 2: 25, 3: 50, 4: 100, 5: 150, 6: 225, 7: 300, 8: 450 };
  return BASE_TIMES[template.tier] || 12;
}

export interface GearInstance {
  instanceId: string;
  templateId: string;
  gameId: string;
  rarity: ItemRarity;
  source: GearSource;
  aspect: Aspect | null;
  rarityBonuses: StatBonus[];
  rarityCurses: StatBonus[]; // Plague only
  /** Source power multiplier (1.0 for forged, 0.75 for salvaged, etc.) */
  sourcePowerMultiplier: number;
  createdAt: number;
}

/** Equipment set definition (Green sets) */
export interface EquipmentSet {
  id: string;
  name: string;
  description: string;
  tier: string; // 'early' | 'mid' | 'endgame'
  type: string; // 'combat' | 'gathering' | 'production' | 'balanced'
  /** Template IDs that belong to this set */
  pieces: string[];
  /** Bonuses that activate at piece count thresholds */
  bonuses: SetBonus[];
}

export interface SetBonus {
  piecesRequired: number;
  effects: StatBonus[];
  description: string;
}

export interface HeroEquipment {
  main_hand: string | null;
  off_hand: string | null;
  armor: string | null;
  legs: string | null;
  gloves: string | null;
  boots: string | null;
  ring1: string | null;
  ring2: string | null;
  ring3: string | null;
  earring1: string | null;
  earring2: string | null;
  necklace: string | null;
}

export function createEmptyEquipment(): HeroEquipment {
  return { main_hand: null, off_hand: null, armor: null, legs: null, gloves: null, boots: null, ring1: null, ring2: null, ring3: null, earring1: null, earring2: null, necklace: null };
}

/** Number of rarity bonuses by rarity */
export function getRarityBonusCount(rarity: ItemRarity): number {
  switch (rarity) {
    case 'common': return 0;
    case 'rare': return 2;
    case 'unique': return 3;
    case 'plague': return 6;
  }
}

/** Number of curses for plague */
export function getRarityCurseCount(rarity: ItemRarity): number {
  return rarity === 'plague' ? 2 : 0;
}

/** Rarity bonus power multiplier */
export function getRarityPowerMultiplier(rarity: ItemRarity): number {
  switch (rarity) {
    case 'common': return 0;
    case 'rare': return 1.0;
    case 'unique': return 1.3;
    case 'plague': return 1.5;
  }
}
