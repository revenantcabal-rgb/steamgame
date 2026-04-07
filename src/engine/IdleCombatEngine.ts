import { COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../config/combatZones';
import { GEAR_TEMPLATES } from '../config/gear';
import { createGearInstance, rollBossDropRarity } from './LootEngine';
import { calculateDerivedStats, getEquippedGear } from './HeroEngine';
import type { Hero } from '../types/hero';
import type { GearInstance } from '../types/equipment';
import { useEquipmentStore } from '../store/useEquipmentStore';
import type { Enemy } from '../config/combatZones';

export interface FightResult {
  enemyName: string;
  won: boolean;
  xpGained: number;
  resourceDrops: { resourceId: string; quantity: number }[];
  heroDied: boolean;
  recoveryCooldown: number;
}

export interface BossFightResult extends FightResult {
  isBoss: true;
  gearDrop: GearInstance | null;
}

/**
 * Get fight duration based on hero level vs zone level.
 */
export function getFightDuration(heroLevel: number, zoneMinLevel: number): number {
  const diff = heroLevel - zoneMinLevel;
  if (diff >= 20) return 3;
  if (diff >= 10) return 5;
  if (diff >= 0) return 8;
  if (diff >= -10) return 12;
  return 99;
}

/**
 * Calculate dynamic difficulty scaling based on heroes deployed to a zone.
 * More heroes + higher level heroes = harder zone but more XP.
 *
 * @param heroCount Number of heroes deployed to same zone
 * @param avgHeroLevel Average level of heroes in the zone
 * @param zoneMinLevel Zone's base level requirement
 * @returns Multiplier for enemy stats (>1 = harder)
 */
export function getDynamicDifficultyMultiplier(
  heroCount: number,
  avgHeroLevel: number,
  zoneMinLevel: number,
): { difficultyMult: number; xpBonusMult: number } {
  // More heroes = harder (each hero after the first adds 15% difficulty)
  const heroCountMult = 1 + Math.max(0, heroCount - 1) * 0.15;

  // Overlevel penalty/scaling: if heroes massively outlevel the zone, enemies scale up
  const levelDiff = avgHeroLevel - zoneMinLevel;
  const overlevelMult = levelDiff > 20 ? 1 + (levelDiff - 20) * 0.02 : 1.0;

  const difficultyMult = heroCountMult * overlevelMult;

  // XP bonus for harder difficulty (diminishing)
  const xpBonusMult = 1 + (difficultyMult - 1) * 0.6;

  return { difficultyMult, xpBonusMult };
}

/**
 * Simulate a fight between a hero and an enemy.
 * @param waveMultiplier - increases enemy stats for wave scaling (every 10 fights)
 * @param difficultyMult - dynamic difficulty from hero count/level
 */
export function simulateFight(
  hero: Hero,
  enemy: Enemy,
  zoneTier: number,
  zoneMinLevel: number,
  waveMultiplier: number = 1.0,
  difficultyMult: number = 1.0,
): FightResult {
  const eqStore = useEquipmentStore.getState();
  const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
  const derived = calculateDerivedStats(hero, gear);
  const tierMult = ZONE_TIER_MULTIPLIERS[zoneTier - 1] || ZONE_TIER_MULTIPLIERS[0];

  const totalEnemyMult = tierMult.hpMult * waveMultiplier * difficultyMult;
  const scaledEnemyHp = Math.floor(enemy.hp * totalEnemyMult);
  const scaledEnemyDmg = Math.floor(enemy.damage * tierMult.dmgMult * waveMultiplier * difficultyMult);
  const scaledXp = Math.floor(enemy.xpReward * tierMult.xpMult * waveMultiplier);

  const heroTotalAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);
  const heroDps = heroTotalAttack * (1 + derived.critChance / 100 * (derived.critDamage / 100 - 1));
  const turnsToKillEnemy = Math.max(1, Math.ceil(scaledEnemyHp / Math.max(1, heroDps)));
  const damageTaken = scaledEnemyDmg * turnsToKillEnemy * (1 - Math.min(0.5, derived.evasion / 100));
  const won = damageTaken < derived.maxHp;
  const heroDied = !won;

  const resourceDrops: { resourceId: string; quantity: number }[] = [];
  if (won) {
    for (const drop of enemy.resourceDrops) {
      if (Math.random() < drop.chance) {
        const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
        resourceDrops.push({ resourceId: drop.resourceId, quantity: qty });
      }
    }
  }

  return {
    enemyName: enemy.name,
    won,
    xpGained: won ? scaledXp : Math.floor(scaledXp * 0.2),
    resourceDrops,
    heroDied,
    recoveryCooldown: heroDied ? (scaledEnemyHp > 1000 ? 30 : scaledEnemyHp > 300 ? 15 : 5) * 60 : 0,
  };
}

/**
 * Boss fight with gear drop.
 */
export function simulateBossFight(
  hero: Hero,
  zoneId: string,
  zoneTier: number,
  waveMultiplier: number = 1.0,
  difficultyMult: number = 1.0,
): BossFightResult {
  const zone = COMBAT_ZONES[zoneId];
  if (!zone) {
    return { isBoss: true, enemyName: 'Unknown', won: false, xpGained: 0, resourceDrops: [], heroDied: false, recoveryCooldown: 0, gearDrop: null };
  }

  // Boss gets extra wave multiplier on top
  const bossMult = waveMultiplier * 1.5; // Bosses are 50% stronger than current wave
  const fightResult = simulateFight(hero, zone.boss, zoneTier, zone.minLevel, bossMult, difficultyMult);

  let gearDrop: GearInstance | null = null;
  if (fightResult.won && zone.bossDropPool.length > 0) {
    const templateId = zone.bossDropPool[Math.floor(Math.random() * zone.bossDropPool.length)];
    if (GEAR_TEMPLATES[templateId]) {
      const rarity = rollBossDropRarity(zoneTier);
      gearDrop = createGearInstance(templateId, 'salvaged', rarity);
    }
  }

  return { ...fightResult, isBoss: true, enemyName: zone.boss.name, gearDrop };
}

/**
 * Check if a hero can enter a zone.
 */
export function canEnterZone(heroLevel: number, zoneMinLevel: number): boolean {
  return heroLevel >= zoneMinLevel - 10;
}
