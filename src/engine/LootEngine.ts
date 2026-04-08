import { GEAR_TEMPLATES, getAspectsForSlot, getBonusPoolForSlot, getDownsidePoolForSlot } from '../config/gear';
import type { GearInstance, GearSource, ItemRarity, StatBonus, Aspect } from '../types/equipment';
import { getRarityBonusCount, getRarityCurseCount, getRarityPowerMultiplier } from '../types/equipment';
import { generateGameId } from './AnticheatEngine';
import { useAuthStore } from '../store/useAuthStore';

/** Facet power multiplier by gear tier */
function getFacetTierMultiplier(tier: number): number {
  const multipliers: Record<number, number> = { 1: 0.5, 2: 0.7, 3: 0.85, 4: 1.0, 5: 1.2, 6: 1.4, 7: 1.6, 8: 1.8 };
  return multipliers[tier] || 1.0;
}

/** Source power multiplier */
function getSourceMultiplier(source: GearSource): number {
  switch (source) {
    case 'forged': return 1.0;
    case 'salvaged': return 0.75;
    case 'scavenged': return 0.60;
    case 'issued': return 0.85;
    case 'decorated': return 0.90;
  }
}

/** Roll rarity based on crafting skill level */
export function rollCraftingRarity(skillLevel: number): ItemRarity {
  const roll = Math.random() * 100;
  if (skillLevel >= 90) { if (roll < 18) return 'plague'; if (roll < 55) return 'unique'; if (roll < 85) return 'rare'; return 'common'; }
  if (skillLevel >= 80) { if (roll < 8) return 'plague'; if (roll < 35) return 'unique'; if (roll < 70) return 'rare'; return 'common'; }
  if (skillLevel >= 60) { if (roll < 5) return 'plague'; if (roll < 25) return 'unique'; if (roll < 60) return 'rare'; return 'common'; }
  if (skillLevel >= 45) { if (roll < 3) return 'plague'; if (roll < 18) return 'unique'; if (roll < 50) return 'rare'; return 'common'; }
  if (skillLevel >= 30) { if (roll < 1) return 'plague'; if (roll < 10) return 'unique'; if (roll < 40) return 'rare'; return 'common'; }
  if (skillLevel >= 15) { if (roll < 3) return 'unique'; if (roll < 25) return 'rare'; return 'common'; }
  if (roll < 10) return 'rare';
  return 'common';
}

/** Roll rarity for boss drops */
export function rollBossDropRarity(zoneTier: number): ItemRarity {
  const roll = Math.random() * 100;
  const plagueChance = 2 + zoneTier * 3;
  const uniqueChance = 13 + zoneTier * 5;
  const rareChance = 35 + zoneTier * 2;
  if (roll < plagueChance) return 'plague';
  if (roll < plagueChance + uniqueChance) return 'unique';
  if (roll < plagueChance + uniqueChance + rareChance) return 'rare';
  return 'common';
}

/** Roll a random aspect for a gear slot */
function rollAspect(slotCategory: string, tier: number, weaponType?: string): Aspect | null {
  const pool = getAspectsForSlot(slotCategory, weaponType);
  if (pool.length === 0) return null;
  const template = pool[Math.floor(Math.random() * pool.length)];
  const mult = getFacetTierMultiplier(tier);

  if (template.name === 'Standard') return null;

  return {
    name: template.name,
    upside: { stat: template.upside.stat, value: Math.round(template.upside.value * mult * 10) / 10, isPercentage: template.upside.isPercentage },
    downside: { stat: template.downside.stat, value: Math.round(template.downside.value * mult * 10) / 10, isPercentage: template.downside.isPercentage },
  };
}

/** Roll rarity bonuses */
function rollRarityBonuses(slotCategory: string, rarity: ItemRarity, sourceMult: number): StatBonus[] {
  const count = getRarityBonusCount(rarity);
  if (count === 0) return [];

  const pool = getBonusPoolForSlot(slotCategory);
  if (pool.length === 0) return [];

  const powerMult = getRarityPowerMultiplier(rarity) * sourceMult;
  const bonuses: StatBonus[] = [];
  const usedStats = new Set<string>();

  for (let i = 0; i < count && pool.length > 0; i++) {
    const available = pool.filter(b => !usedStats.has(b.stat));
    if (available.length === 0) break;
    const chosen = available[Math.floor(Math.random() * available.length)];
    usedStats.add(chosen.stat);

    const range = chosen.maxValue - chosen.minValue;
    const rawValue = chosen.minValue + Math.random() * range;
    const scaledValue = Math.round(rawValue * powerMult * 10) / 10;

    bonuses.push({ stat: chosen.stat, value: scaledValue, isPercentage: chosen.isPercentage });
  }

  return bonuses;
}

/** Roll plague curses */
function rollCurses(slotCategory: string, inherentDownsideStat?: string): StatBonus[] {
  const pool = getDownsidePoolForSlot(slotCategory).filter(d => d.stat !== inherentDownsideStat);
  if (pool.length < 2) return [];

  const curses: StatBonus[] = [];
  const usedStats = new Set<string>();

  for (let i = 0; i < 2 && pool.length > 0; i++) {
    const available = pool.filter(b => !usedStats.has(b.stat));
    if (available.length === 0) break;
    const chosen = available[Math.floor(Math.random() * available.length)];
    usedStats.add(chosen.stat);

    const range = chosen.maxValue - chosen.minValue;
    const value = Math.round((chosen.minValue + Math.random() * range) * 10) / 10;
    curses.push({ stat: chosen.stat, value, isPercentage: chosen.isPercentage });
  }

  return curses;
}

/**
 * Create a gear instance from a template.
 */
export function createGearInstance(
  templateId: string,
  source: GearSource,
  rarity: ItemRarity,
): GearInstance | null {
  const template = GEAR_TEMPLATES[templateId];
  if (!template) return null;

  const sourceMult = getSourceMultiplier(source);
  const aspect = rollAspect(template.slot, template.tier, template.weaponType);
  const bonuses = rollRarityBonuses(template.slot, rarity, sourceMult);
  const curses = rarity === 'plague' ? rollCurses(template.slot, template.inherentDownside?.stat) : [];

  const userId = useAuthStore.getState().user?.id || 'system';

  return {
    instanceId: `gear_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    templateId,
    gameId: generateGameId('gear', userId),
    rarity,
    source,
    aspect,
    rarityBonuses: bonuses,
    rarityCurses: curses,
    sourcePowerMultiplier: sourceMult,
    createdAt: Date.now(),
    upgradeLevel: 0,
  };
}

/**
 * Craft a gear item (source = forged, rarity rolled from skill level).
 */
export function craftGear(templateId: string, craftSkillLevel: number): GearInstance | null {
  const rarity = rollCraftingRarity(craftSkillLevel);
  return createGearInstance(templateId, 'forged', rarity);
}

/**
 * Generate a boss drop (source = salvaged, rarity rolled from zone tier).
 */
export function generateBossDrop(templateId: string, zoneTier: number): GearInstance | null {
  const rarity = rollBossDropRarity(zoneTier);
  return createGearInstance(templateId, 'salvaged', rarity);
}
