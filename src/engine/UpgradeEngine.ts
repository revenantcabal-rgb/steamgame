import type { GearInstance, GearTemplate, StatBonus } from '../types/equipment';
import { GEAR_TEMPLATES } from '../config/gear';

export interface UpgradeResult {
  success: boolean;
  newLevel: number;
  destroyed: boolean;
}

export const UPGRADE_CONFIG: Record<number, { successRate: number; resourceId: string; resourceQty: number; failureMode: 'none' | 'downgrade' | 'destroy' }> = {
  1:  { successRate: 100, resourceId: 'reinforcement_ore', resourceQty: 1, failureMode: 'none' },
  2:  { successRate: 100, resourceId: 'reinforcement_ore', resourceQty: 2, failureMode: 'none' },
  3:  { successRate: 100, resourceId: 'reinforcement_ore', resourceQty: 3, failureMode: 'none' },
  4:  { successRate: 80,  resourceId: 'refinement_metal',  resourceQty: 1, failureMode: 'downgrade' },
  5:  { successRate: 60,  resourceId: 'refinement_metal',  resourceQty: 2, failureMode: 'downgrade' },
  6:  { successRate: 40,  resourceId: 'refinement_metal',  resourceQty: 3, failureMode: 'downgrade' },
  7:  { successRate: 30,  resourceId: 'highgrade_alloy',   resourceQty: 1, failureMode: 'downgrade' },
  8:  { successRate: 20,  resourceId: 'highgrade_alloy',   resourceQty: 2, failureMode: 'downgrade' },
  9:  { successRate: 15,  resourceId: 'highgrade_alloy',   resourceQty: 3, failureMode: 'downgrade' },
  10: { successRate: 10,  resourceId: 'highgrade_alloy',   resourceQty: 4, failureMode: 'destroy' },
  11: { successRate: 5,   resourceId: 'masterwork_ore',    resourceQty: 1, failureMode: 'destroy' },
  12: { successRate: 3,   resourceId: 'masterwork_ore',    resourceQty: 2, failureMode: 'destroy' },
};

/** Check if a gear template can be upgraded (accessories cannot) */
export function isUpgradeable(template: GearTemplate): boolean {
  return !['ring', 'earring', 'necklace'].includes(template.slot);
}

/** Get the upgrade config for the NEXT level */
export function getUpgradeConfig(currentLevel: number) {
  return UPGRADE_CONFIG[currentLevel + 1] || null;
}

/** Attempt an upgrade. Returns result. */
export function attemptUpgrade(currentLevel: number, smeltingOreCount: number): UpgradeResult {
  const targetLevel = currentLevel + 1;
  const config = UPGRADE_CONFIG[targetLevel];
  if (!config) return { success: false, newLevel: currentLevel, destroyed: false };

  const bonusRate = Math.min(smeltingOreCount * 5, 92); // +5% per smelting ore, capped so total max 95%
  const totalRate = Math.min(config.successRate + bonusRate, 95);
  const roll = Math.random() * 100;

  if (roll < totalRate) {
    return { success: true, newLevel: targetLevel, destroyed: false };
  }

  // Failure
  if (config.failureMode === 'destroy') {
    return { success: false, newLevel: 0, destroyed: true };
  }
  if (config.failureMode === 'downgrade') {
    return { success: false, newLevel: Math.max(0, currentLevel - 1), destroyed: false };
  }
  // 'none' — shouldn't happen for levels 1-3 since they're 100%
  return { success: false, newLevel: currentLevel, destroyed: false };
}

/** Calculate bonus stats from upgrade level. Each +1 = 8% of base stats. */
export function getUpgradeStatBonuses(templateId: string, upgradeLevel: number): StatBonus[] {
  if (upgradeLevel <= 0) return [];
  const template = GEAR_TEMPLATES[templateId];
  if (!template) return [];

  const multiplier = upgradeLevel * 0.08;
  return template.baseStats
    .filter(s => !s.isPercentage) // Only flat stats get upgrade bonus
    .map(s => ({
      stat: s.stat,
      value: Math.round(s.value * multiplier * 10) / 10, // 1 decimal
      isPercentage: false,
    }))
    .filter(s => s.value > 0);
}
