import { COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../config/combatZones';
import { GEAR_TEMPLATES } from '../config/gear';
import { ABILITIES } from '../config/abilities';
import type { AbilityTome } from '../config/abilities';
import { CONSUMABLES } from '../config/consumables';
import { createGearInstance, rollBossDropRarity } from './LootEngine';
import { calculateDerivedStats, getEquippedGear } from './HeroEngine';
import type { Hero } from '../types/hero';
import type { DerivedStats } from '../types/hero';
import type { GearInstance } from '../types/equipment';
import { getPremiumBonuses } from './PremiumBonuses';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { CLASSES } from '../config/classes';
import type { Enemy, CombatStyle } from '../config/combatZones';

/**
 * Combat Triangle: STR (melee) > INT (demolitions) > DEX (ranged) > STR (melee)
 * Returns a damage multiplier: 1.10 for advantage, 0.90 for disadvantage, 1.0 for neutral.
 */
export function getCombatTriangleMultiplier(attackerStyle: CombatStyle | undefined, defenderStyle: CombatStyle | undefined): number {
  if (!attackerStyle || !defenderStyle || attackerStyle === defenderStyle) return 1.0;
  // melee beats demolitions, demolitions beats ranged, ranged beats melee
  if (
    (attackerStyle === 'melee' && defenderStyle === 'demolitions') ||
    (attackerStyle === 'demolitions' && defenderStyle === 'ranged') ||
    (attackerStyle === 'ranged' && defenderStyle === 'melee')
  ) {
    return 1.10;
  }
  return 0.90;
}

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
 * Calculate the DPS and stat contribution of equipped active abilities over a fight.
 */
export function calculateAbilityContribution(
  hero: Hero,
  derived: DerivedStats,
  fightDurationTurns: number,
  bonusSpFromConsumables: number = 0,
): { bonusDps: number; statModifiers: Record<string, number>; spUsed: number } {
  const equippedAbilities = hero.equippedAbilities || [null, null, null, null];
  let bonusDps = 0;
  const statModifiers: Record<string, number> = {};

  const totalSpAvailable = derived.maxSp + derived.spRegen * fightDurationTurns + bonusSpFromConsumables;
  let spRemaining = totalSpAvailable;

  const heroTotalAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);

  for (const abilityId of equippedAbilities) {
    if (!abilityId) continue;
    const ability: AbilityTome | undefined = ABILITIES[abilityId];
    if (!ability || ability.isPassive || !ability.mechanicalEffect) continue;
    if (ability.cooldown <= 0) continue; // passives/zero-cooldown handled elsewhere

    const actualCost = Math.max(1, Math.round(ability.spCost * (1 - derived.spCostReduction / 100)));
    const maxCastsFromCooldown = Math.floor(fightDurationTurns / ability.cooldown);
    const maxCastsFromSp = actualCost > 0 ? Math.floor(spRemaining / actualCost) : maxCastsFromCooldown;
    const castCount = Math.min(maxCastsFromCooldown, maxCastsFromSp);
    if (castCount <= 0) continue;

    spRemaining -= castCount * actualCost;
    const me = ability.mechanicalEffect;
    const scaledValue = me.value + me.scaling * (derived.abilityPower / 100) * me.value;

    if (me.type === 'damage') {
      // Bonus DPS = (scaledValue/100) * heroAttack * castCount / fightDurationTurns
      bonusDps += (scaledValue / 100) * heroTotalAttack * castCount / Math.max(1, fightDurationTurns);
    } else if (me.type === 'dot') {
      // DoT: extra DPS over duration
      const dotDps = (scaledValue / 100) * heroTotalAttack;
      const dotUptime = Math.min(1, (ability.duration * castCount) / Math.max(1, fightDurationTurns));
      bonusDps += dotDps * dotUptime;
    } else if (me.type === 'buff' && me.stat) {
      // Average stat boost = value * (duration / cooldown) uptime
      const uptime = Math.min(1, ability.duration / ability.cooldown);
      statModifiers[me.stat] = (statModifiers[me.stat] || 0) + scaledValue * uptime;
    } else if (me.type === 'debuff') {
      // Debuffs on enemy: reduce effective enemy power (modeled as bonus DPS)
      const uptime = Math.min(1, (ability.duration * castCount) / Math.max(1, fightDurationTurns));
      bonusDps += (scaledValue / 100) * heroTotalAttack * uptime * 0.5;
    } else if (me.type === 'heal') {
      // Heals modeled as effective HP gain - apply as DPS reduction not DPS addition
      // Skip for now, survival already handled by hpRegen/lifesteal
    }
  }

  const spUsed = totalSpAvailable - spRemaining;
  return { bonusDps, statModifiers, spUsed };
}

/**
 * Get fight duration based on hero level vs zone level.
 */
export function getFightDuration(heroLevel: number, zoneMinLevel: number, turnSpeed: number = 100): number {
  const diff = heroLevel - zoneMinLevel;
  let baseDuration: number;
  if (diff >= 20) baseDuration = 3;
  else if (diff >= 10) baseDuration = 5;
  else if (diff >= 0) baseDuration = 8;
  else if (diff >= -10) baseDuration = 12;
  else baseDuration = 99;
  const speedFactor = Math.max(0.3, 100 / Math.max(1, turnSpeed));
  return Math.max(2, Math.round(baseDuration * speedFactor));
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
  const baseDerived = calculateDerivedStats(hero, gear);
  const tierMult = ZONE_TIER_MULTIPLIERS[zoneTier - 1] || ZONE_TIER_MULTIPLIERS[0];

  // ── Apply consumable effects (work on a copy) ──
  const derived: DerivedStats = { ...baseDerived };
  let consumableHealHp = 0;
  let consumableHealSp = 0;
  const equippedConsumables = hero.equippedConsumables || [null];
  for (const consumableId of equippedConsumables) {
    if (!consumableId) continue;
    const consumable = CONSUMABLES[consumableId];
    if (!consumable || !consumable.mechanicalEffect) continue;
    const me = consumable.mechanicalEffect;

    if (me.type === 'buff' && me.stats) {
      // Buff uptime: duration / (duration + cooldown)
      const uptime = consumable.duration > 0 ? consumable.duration / (consumable.duration + consumable.cooldown) : 0;
      for (const s of me.stats) {
        const key = s.stat as keyof DerivedStats;
        const current = derived[key];
        if (typeof current !== 'number') continue;
        if (s.isPercentage) {
          (derived as any)[key] = Math.round((current * (1 + (s.value / 100) * uptime)) * 100) / 100;
        } else {
          (derived as any)[key] = Math.round((current + s.value * uptime) * 100) / 100;
        }
      }
    } else if (me.type === 'instant_heal_hp') {
      consumableHealHp += me.healValue || 0;
    } else if (me.type === 'instant_heal_sp') {
      consumableHealSp += me.healValue || 0;
    } else if (me.type === 'instant_heal_both') {
      if (me.healPercentage) {
        consumableHealHp += Math.floor(derived.maxHp * me.healPercentage / 100);
        consumableHealSp += Math.floor(derived.maxSp * me.healPercentage / 100);
      }
      if (me.healValue) {
        consumableHealHp += me.healValue;
        consumableHealSp += me.healValue;
      }
    }
  }

  const totalEnemyMult = tierMult.hpMult * waveMultiplier * difficultyMult;
  const scaledEnemyHp = Math.floor(enemy.hp * totalEnemyMult);
  const scaledEnemyDmg = Math.floor(enemy.damage * tierMult.dmgMult * waveMultiplier * difficultyMult);
  const scaledXp = Math.floor(enemy.xpReward * tierMult.xpMult * waveMultiplier);

  const heroTotalAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);

  // Combat triangle multiplier (hero style vs enemy style)
  const classDef = CLASSES[hero.classId];
  const heroStyle = classDef?.primaryCombatStyle as CombatStyle | undefined;
  const triangleMult = getCombatTriangleMultiplier(heroStyle, enemy.combatStyle);

  // Accuracy affects hit rate
  const hitRate = Math.min(1, derived.accuracy / 100);

  // Crit multiplier
  const critMult = 1 + (derived.critChance / 100) * (derived.critDamage / 100 - 1);

  // Armor penetration (enemies have ~10% base damage reduction)
  const enemyBaseDefense = 0.10;
  const effectiveEnemyDefense = enemyBaseDefense * Math.max(0, 1 - derived.armorPen / 100);

  // DPS with accuracy, crits, armor pen, and combat triangle
  let heroDps = heroTotalAttack * hitRate * critMult * (1 - effectiveEnemyDefense) * triangleMult;

  // DoT bonus: burn, poison, radiation, and bleed add % of attack as extra DPS
  heroDps += heroTotalAttack * (derived.burnDot / 100 + derived.poisonDot / 100 + derived.radiationDot / 100 + derived.bleedDot / 100);

  // Ability contribution (active abilities equipped on this hero)
  const fightDurationEstimate = Math.max(2, Math.ceil(scaledEnemyHp / Math.max(1, heroDps)));
  const abilityContrib = calculateAbilityContribution(hero, derived, fightDurationEstimate, consumableHealSp);
  heroDps += abilityContrib.bonusDps;

  // Apply buff stat modifiers from abilities (averaged over uptime)
  if (abilityContrib.statModifiers.meleeAttack) heroDps += abilityContrib.statModifiers.meleeAttack / 100 * heroTotalAttack * hitRate * critMult;
  if (abilityContrib.statModifiers.rangedAttack) heroDps += abilityContrib.statModifiers.rangedAttack / 100 * heroTotalAttack * hitRate * critMult;
  if (abilityContrib.statModifiers.blastAttack) heroDps += abilityContrib.statModifiers.blastAttack / 100 * heroTotalAttack * hitRate * critMult;

  // Turn speed ratio (frostSlow reduces enemy effective speed)
  const speedRatio = Math.max(0.5, derived.turnSpeed / (100 + derived.frostSlow));

  const turnsToKillEnemy = Math.max(1, Math.ceil(scaledEnemyHp / Math.max(1, heroDps)));

  // Defense curve (diminishing returns)
  const defenseReduction = Math.max(0.2, 1 - derived.defense / (derived.defense + 200));
  const evasionReduction = 1 - Math.min(0.5, derived.evasion / 100);
  const blockReduction = 1 - (derived.blockChance / 100) * 0.5;
  const drReduction = 1 - derived.damageReduction / 100;

  // Enemy turns adjusted by speed
  const effectiveEnemyTurns = Math.max(1, Math.ceil(turnsToKillEnemy / speedRatio));
  const damageTaken = scaledEnemyDmg * effectiveEnemyTurns * defenseReduction * evasionReduction * blockReduction * drReduction;

  // Thorns reflect
  const thornsDmg = damageTaken * (derived.thornsDamage / 100);
  const effectiveEnemyHp = Math.max(1, scaledEnemyHp - thornsDmg);
  const adjustedTurns = Math.max(1, Math.ceil(effectiveEnemyHp / Math.max(1, heroDps)));
  const adjustedEnemyTurns = Math.max(1, Math.ceil(adjustedTurns / speedRatio));
  const finalDamageTaken = scaledEnemyDmg * adjustedEnemyTurns * defenseReduction * evasionReduction * blockReduction * drReduction;

  // Lifesteal + HP regen healing + consumable instant heals
  const lifestealHealing = heroDps * adjustedTurns * (derived.lifesteal / 100);
  const regenHealing = derived.hpRegen * adjustedTurns;
  const effectiveHp = derived.maxHp + lifestealHealing + regenHealing + consumableHealHp;

  const won = finalDamageTaken < effectiveHp;
  const heroDied = !won;

  const resourceDrops: { resourceId: string; quantity: number }[] = [];
  if (won) {
    for (const drop of enemy.resourceDrops) {
      const adjustedChance = Math.min(1, drop.chance * (1 + (derived.dropChance + getPremiumBonuses().dropChanceBonus) / 100));
      if (Math.random() < adjustedChance) {
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
    recoveryCooldown: heroDied ? Math.floor((scaledEnemyHp > 1000 ? 30 : scaledEnemyHp > 300 ? 15 : 5) * 60 * Math.max(0.3, 1 - derived.statusResist / 200)) : 0,
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
