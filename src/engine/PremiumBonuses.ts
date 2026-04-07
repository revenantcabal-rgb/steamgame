import type { PremiumBonuses } from '../types/premium';
import { useGoldenCapStore } from '../store/useGoldenCapStore';

const INACTIVE: PremiumBonuses = {
  xpMultiplier: 1.0,
  workerRespawnMultiplier: 1.0,
  heroRecruitCostMultiplier: 1.0,
  waveScaleMultiplier: 1.0,
  dropChanceBonus: 0,
  isPremiumLootTracker: false,
  autoAssignWorkers: false,
};

const ACTIVE: PremiumBonuses = {
  xpMultiplier: 1.2,
  workerRespawnMultiplier: 0.75,
  heroRecruitCostMultiplier: 0.85,
  waveScaleMultiplier: 0.75,
  dropChanceBonus: 20,
  isPremiumLootTracker: true,
  autoAssignWorkers: true,
};

/**
 * Returns current premium bonus multipliers.
 * All engine code calls this single function — no direct store imports needed.
 */
export function getPremiumBonuses(): PremiumBonuses {
  return useGoldenCapStore.getState().isActive() ? ACTIVE : INACTIVE;
}
