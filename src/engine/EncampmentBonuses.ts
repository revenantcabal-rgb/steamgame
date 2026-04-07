/**
 * Encampment Bonus Aggregation
 *
 * Single entry point for all engine code to read encampment building bonuses.
 * Pattern mirrors getPremiumBonuses() for consistency.
 */

import type { BonusType } from '../config/buildings';

const EMPTY_BONUSES: Record<BonusType, number> = {
  gathering_speed_scavenging: 0,
  gathering_speed_foraging: 0,
  gathering_speed_salvage_hunting: 0,
  gathering_speed_water_reclamation: 0,
  gathering_speed_prospecting: 0,
  gathering_yield_all: 0,
  production_speed: 0,
  combat_damage: 0,
  combat_defense: 0,
  combat_hp: 0,
  worker_speed: 0,
  worker_survivability: 0,
  worker_capacity: 0,
  hero_xp: 0,
  hero_combat_damage: 0,
  marketplace_sell_bonus: 0,
  rare_drop_chance: 0,
  worker_respawn_speed: 0,
  expedition_reward: 0,
};

/**
 * Returns aggregated encampment bonus percentages (or flat values for worker_capacity).
 * Lazy-imports the store to avoid circular dependency at module load time.
 */
export function getEncampmentBonuses(): Record<BonusType, number> {
  try {
    // Dynamic access to avoid circular import at module initialization
    const { useEncampmentStore } = require('../store/useEncampmentStore');
    return useEncampmentStore.getState().getBonuses();
  } catch {
    return { ...EMPTY_BONUSES };
  }
}

/**
 * Helper: get the gathering speed bonus for a specific skill ID.
 */
export function getGatheringSpeedBonus(skillId: string): number {
  const bonuses = getEncampmentBonuses();
  const key = `gathering_speed_${skillId}` as BonusType;
  return (bonuses[key] || 0) + (bonuses.gathering_yield_all || 0);
}

/**
 * Helper: get total combat damage bonus (armory + sparring ring).
 */
export function getCombatDamageBonus(): number {
  const bonuses = getEncampmentBonuses();
  return (bonuses.combat_damage || 0) + (bonuses.hero_combat_damage || 0);
}
