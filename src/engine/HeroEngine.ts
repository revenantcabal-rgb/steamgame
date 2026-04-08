import { CLASSES } from '../config/classes';
import { GEAR_TEMPLATES, EQUIPMENT_SETS } from '../config/gear';
import { ABILITIES } from '../config/abilities';
import { levelFromXp } from '../types/skills';
import type { Hero, PrimaryStats, DerivedStats } from '../types/hero';
import { rollStat, generateHeroName, STAT_POINTS_PER_LEVEL, PRIMARY_ATTR_SPD_BONUS } from '../types/hero';
import type { GearInstance, StatBonus } from '../types/equipment';
import { useStarlightStore } from '../store/useStarlightStore';

/**
 * Create a new hero of a given class with flat base stats.
 * All stats start at 10. statEmphasis[0] gets +3, statEmphasis[1] gets +2.
 * If both emphasis stats are the same, that stat gets +5 (15 total).
 * primaryAttribute is randomly assigned from the class's primaryAttributePool.
 */
export function recruitHero(classId: string): Hero | null {
  const classDef = CLASSES[classId];
  if (!classDef) return null;

  // All stats start at 10
  const baseStats: PrimaryStats = {
    str: 10, dex: 10, int: 10, con: 10, per: 10, luk: 10, res: 10, spd: 10,
  };

  // Apply stat emphasis: first gets +3, second gets +2
  const [emphasis1, emphasis2] = classDef.statEmphasis;
  baseStats[emphasis1] += 3;
  baseStats[emphasis2] += 2;

  // Randomly assign primary attribute from the class pool
  const pool = classDef.primaryAttributePool;
  const primaryAttribute = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: `hero_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: generateHeroName(),
    classId,
    level: 1,
    xp: 0,
    baseStats,
    allocatedStats: { str: 0, dex: 0, int: 0, con: 0, per: 0, luk: 0, res: 0, spd: 0 },
    unspentPoints: 0,
    recruitedAt: Date.now(),
    equippedAbilities: [null, null, null, null],
    equippedDecree: null,
    equippedConsumables: [null],
    job2ClassId: null,
    primaryAttribute,
  };
}

/**
 * Get total primary stats (base + allocated).
 */
export function getTotalStats(hero: Hero): PrimaryStats {
  return {
    str: hero.baseStats.str + hero.allocatedStats.str,
    dex: hero.baseStats.dex + hero.allocatedStats.dex,
    int: hero.baseStats.int + hero.allocatedStats.int,
    con: hero.baseStats.con + hero.allocatedStats.con,
    per: hero.baseStats.per + hero.allocatedStats.per,
    luk: hero.baseStats.luk + hero.allocatedStats.luk,
    res: (hero.baseStats.res || 0) + (hero.allocatedStats.res || 0),
    spd: (hero.baseStats.spd || 10) + (hero.allocatedStats.spd || 0),
  };
}

/**
 * Calculate derived combat stats from primary stats + class + equipped gear.
 *
 * STAT CONTRIBUTIONS:
 *   STR  +2 Melee Attack, +1 Defense per point
 *   DEX  +2 Ranged Attack, +0.3 Evasion per point
 *   INT  +2 Blast Attack, +1% Crit Damage per point
 *   CON  +10 Max HP, +1.5 Defense, +0.5 HP Regen per point
 *   PER  +0.8% Accuracy, +0.5% Crit Chance per point
 *   LUK  +0.5% Evasion, +0.5% Status Resistance per point
 *   RES  +1% Ability Power per point, Unlock Ability Slots
 *   SPD  +1 Turn Speed per point (ATB gauge fill rate)
 */
export function calculateDerivedStats(hero: Hero, equippedGear?: GearInstance[]): DerivedStats {
  const stats = getTotalStats(hero);

  // Ability slots based on RES thresholds
  let abilitySlots = 1; // Always have 1
  if (stats.res >= 90) abilitySlots = 4;
  else if (stats.res >= 60) abilitySlots = 3;
  else if (stats.res >= 30) abilitySlots = 2;

  // Primary attribute SPD bonus
  const primaryAttrPoints = hero.allocatedStats[hero.primaryAttribute];
  const primarySpdBonus = primaryAttrPoints * PRIMARY_ATTR_SPD_BONUS;

  // Base derived stats from primary stats
  const derived: DerivedStats = {
    maxHp: 100 + stats.con * 8,
    meleeAttack: Math.floor(5 + stats.str * 2),
    rangedAttack: Math.floor(5 + stats.dex * 2),
    blastAttack: Math.floor(5 + stats.int * 2),
    defense: Math.floor(stats.str * 1 + stats.con * 1.5),
    evasion: Math.min(50, 5 + stats.dex * 0.3 + stats.luk * 0.5),
    accuracy: Math.min(99, 80 + stats.per * 0.8),
    critChance: Math.min(60, 5 + stats.per * 0.4),
    critDamage: 150 + stats.int * 1,
    turnSpeed: 100 + stats.spd * 1.0 + primarySpdBonus,
    hpRegen: 1 + stats.con * 0.5,
    statusResist: Math.min(80, stats.luk * 0.5),
    abilityPower: stats.res * 1,
    abilitySlots,
    canEquipAura: stats.res >= 50,
    // Consumable slots based on hero level
    consumableSlots: 1 + (hero.level >= 15 ? 1 : 0) + (hero.level >= 30 ? 1 : 0) + (hero.level >= 45 ? 1 : 0) + (hero.level >= 60 ? 1 : 0) + (hero.level >= 80 ? 1 : 0),
    // SP stats
    maxSp: 30 + stats.res * 3,
    spRegen: Math.round((2 + stats.res * 0.1) * 10) / 10,
    spCostReduction: 0,
    // Extended combat stats
    lifesteal: 0,
    burnDot: 0,
    poisonDot: 0,
    radiationDot: 0,
    bleedDot: 0,
    frostSlow: 0,
    thornsDamage: 0,
    blockChance: 0,
    armorPen: 0,
    damageReduction: 0,
    dropChance: 0,
    // Gathering/production stats
    gatheringSpeed: 0,
    gatheringYield: 0,
    productionSpeed: 0,
    xpBonus: 0,
    rareResourceChance: 0,
    rarityUpgrade: 0,
    doubleOutput: 0,
  };

  // ── Apply equipment bonuses ──
  if (equippedGear && equippedGear.length > 0) {
    for (const gear of equippedGear) {
      const template = GEAR_TEMPLATES[gear.templateId];
      if (!template) continue;

      // 1. Base stats from gear template
      for (const bonus of template.baseStats) {
        applyBonus(derived, bonus);
      }

      // 2. Inherent downside from template
      if (template.inherentDownside) {
        applyBonus(derived, template.inherentDownside);
      }

      // 3. Rarity bonuses (random rolled stats)
      for (const bonus of gear.rarityBonuses) {
        applyBonus(derived, bonus);
      }

      // 4. Rarity curses (plague only - always negative)
      for (const curse of gear.rarityCurses) {
        applyBonus(derived, { stat: curse.stat, value: -Math.abs(curse.value), isPercentage: curse.isPercentage });
      }

      // 5. Aspect (upside + downside)
      if (gear.aspect) {
        applyBonus(derived, gear.aspect.upside);
        applyBonus(derived, gear.aspect.downside);
      }
    }

    // Clamp values after gear application
    derived.evasion = Math.min(50, Math.max(0, derived.evasion));
    derived.accuracy = Math.min(99, Math.max(0, derived.accuracy));
    derived.critChance = Math.min(60, Math.max(0, derived.critChance));
    derived.statusResist = Math.min(80, Math.max(0, derived.statusResist));
    derived.maxHp = Math.max(1, derived.maxHp);
    derived.defense = Math.max(0, derived.defense);
    derived.turnSpeed = Math.max(1, derived.turnSpeed);
    derived.hpRegen = Math.max(0, derived.hpRegen);
    derived.lifesteal = Math.min(25, Math.max(0, derived.lifesteal));
    derived.burnDot = Math.min(20, Math.max(0, derived.burnDot));
    derived.poisonDot = Math.min(15, Math.max(0, derived.poisonDot));
    derived.radiationDot = Math.min(15, Math.max(0, derived.radiationDot));
    derived.bleedDot = Math.min(20, Math.max(0, derived.bleedDot));
    derived.frostSlow = Math.min(50, Math.max(0, derived.frostSlow));
    derived.thornsDamage = Math.min(30, Math.max(0, derived.thornsDamage));
    derived.blockChance = Math.min(50, Math.max(0, derived.blockChance));
    derived.armorPen = Math.min(50, Math.max(0, derived.armorPen));
    derived.damageReduction = Math.min(30, Math.max(0, derived.damageReduction));
    derived.dropChance = Math.min(50, Math.max(0, derived.dropChance));
    derived.gatheringSpeed = Math.min(100, Math.max(0, derived.gatheringSpeed));
    derived.gatheringYield = Math.min(100, Math.max(0, derived.gatheringYield));
    derived.productionSpeed = Math.min(100, Math.max(0, derived.productionSpeed));
    derived.xpBonus = Math.min(100, Math.max(0, derived.xpBonus));
    derived.rareResourceChance = Math.min(50, Math.max(0, derived.rareResourceChance));
    derived.rarityUpgrade = Math.min(25, Math.max(0, derived.rarityUpgrade));
    derived.doubleOutput = Math.min(25, Math.max(0, derived.doubleOutput));
    // SP clamping
    derived.maxSp = Math.max(10, derived.maxSp);
    derived.spRegen = Math.max(0, derived.spRegen);
    derived.spCostReduction = Math.min(50, Math.max(0, derived.spCostReduction));

    // ── Equipment Set Bonuses ──
    // Count how many pieces of each set are equipped
    const setCounts: Record<string, number> = {};
    for (const gear of equippedGear) {
      const template = GEAR_TEMPLATES[gear.templateId];
      if (template?.setId) {
        setCounts[template.setId] = (setCounts[template.setId] || 0) + 1;
      }
    }
    // Apply set bonuses at each threshold
    for (const [setId, count] of Object.entries(setCounts)) {
      const setDef = EQUIPMENT_SETS[setId];
      if (!setDef) continue;
      for (const bonus of setDef.bonuses) {
        if (count >= bonus.piecesRequired) {
          for (const effect of bonus.effects) {
            applyBonus(derived, effect);
          }
        }
      }
    }
  }

  // Apply equipped passive abilities (orange tomes) and decrees (purple tomes)
  const equippedAbilities = hero.equippedAbilities || [null, null, null, null];
  const equippedDecree = hero.equippedDecree || null;

  const allEquippedIds = [...equippedAbilities.filter(Boolean), ...(equippedDecree ? [equippedDecree] : [])];
  for (const abilityId of allEquippedIds) {
    if (!abilityId) continue;
    const ability = ABILITIES[abilityId];
    if (!ability || !ability.mechanicalEffect) continue;
    if (ability.mechanicalEffect.type === 'passive_stat' && ability.mechanicalEffect.stat) {
      const baseValue = ability.mechanicalEffect.value;
      const scalingBonus = ability.mechanicalEffect.scaling * stats.res;
      const totalValue = baseValue + scalingBonus;
      applyBonus(derived, {
        stat: ability.mechanicalEffect.stat,
        value: totalValue,
        isPercentage: ability.mechanicalEffect.isPercentage,
      });
    }
  }

  // ── Account-level Starlight sphere grid bonuses (apply to ALL heroes) ──
  const starlightBonuses = useStarlightStore.getState().getStatBonuses();
  for (const [bonusKey, value] of Object.entries(starlightBonuses)) {
    // Keys ending in _pct are percentage bonuses, others are flat
    const isPct = bonusKey.endsWith('_pct');
    const stat = isPct ? bonusKey.slice(0, -4) : bonusKey;
    const key = stat as keyof DerivedStats;
    if (typeof derived[key] === 'number') {
      if (isPct) {
        (derived as any)[key] = Math.round((derived[key] as number) * (1 + value / 100) * 100) / 100;
      } else {
        (derived as any)[key] = Math.round(((derived[key] as number) + value) * 100) / 100;
      }
    }
  }

  return derived;
}

/** Apply a stat bonus (flat or percentage) to derived stats */
function applyBonus(derived: DerivedStats, bonus: StatBonus) {
  const key = bonus.stat as keyof DerivedStats;
  const current = derived[key];
  if (typeof current !== 'number') return;

  if (bonus.isPercentage) {
    (derived as any)[key] = Math.round((current * (1 + bonus.value / 100)) * 100) / 100;
  } else {
    (derived as any)[key] = Math.round((current + bonus.value) * 100) / 100;
  }
}

/**
 * Get all equipped GearInstances for a hero from the equipment store data.
 */
export function getEquippedGear(
  heroId: string,
  heroEquipment: Record<string, any>,
  inventory: GearInstance[],
): GearInstance[] {
  const equipment = heroEquipment[heroId];
  if (!equipment) return [];

  const gear: GearInstance[] = [];
  for (const slotValue of Object.values(equipment)) {
    if (!slotValue) continue;
    const item = inventory.find(g => g.instanceId === slotValue);
    if (item) gear.push(item);
  }
  return gear;
}

/**
 * Add XP to a hero and check for level up.
 * If the hero has a Focus Ring in ring3, stat XP is distributed accordingly:
 *   - Single focus: 70% to primary stat, 30% spread across others
 *   - Dual focus: 50/50 between primary and secondary
 *   - No focus ring: all XP goes to hero level (default behavior)
 *
 * Note: Focus Ring XP distribution affects stat auto-allocation on level-up,
 * giving bonus points toward the focused stat(s).
 */
export function addHeroXp(
  hero: Hero,
  xpAmount: number,
  focusRing?: { primaryStat: string; secondaryStat?: string; isDual?: boolean } | null,
): Hero {
  const newXp = hero.xp + xpAmount;
  const newLevel = Math.min(100, levelFromXp(newXp));
  const levelsGained = newLevel - hero.level;
  let newPoints = hero.unspentPoints + levelsGained * STAT_POINTS_PER_LEVEL;

  // Auto-allocate bonus stat points based on Focus Ring
  let newAllocated = hero.allocatedStats;
  if (focusRing && levelsGained > 0) {
    const bonusPoints = levelsGained; // 1 bonus auto-allocated point per level gained
    newAllocated = { ...hero.allocatedStats };
    const primary = focusRing.primaryStat as keyof PrimaryStats;

    if (focusRing.isDual && focusRing.secondaryStat) {
      const secondary = focusRing.secondaryStat as keyof PrimaryStats;
      const primaryPts = Math.ceil(bonusPoints / 2);
      const secondaryPts = Math.floor(bonusPoints / 2);
      newAllocated[primary] = (newAllocated[primary] || 0) + primaryPts;
      newAllocated[secondary] = (newAllocated[secondary] || 0) + secondaryPts;
    } else {
      newAllocated[primary] = (newAllocated[primary] || 0) + bonusPoints;
    }
  }

  return {
    ...hero,
    xp: newXp,
    level: newLevel,
    unspentPoints: newPoints,
    allocatedStats: newAllocated,
  };
}

/**
 * Get the Focus Ring data for a hero (from ring3 slot), if any.
 */
export function getHeroFocusRing(
  heroId: string,
  heroEquipment: Record<string, any>,
  inventory: GearInstance[],
): { primaryStat: string; secondaryStat?: string; isDual?: boolean } | null {
  const equipment = heroEquipment[heroId];
  if (!equipment?.ring3) return null;
  const ring = inventory.find(g => g.instanceId === equipment.ring3);
  if (!ring) return null;
  const template = GEAR_TEMPLATES[ring.templateId];
  return template?.statFocusRing || null;
}

/**
 * Allocate a stat point.
 */
export function allocateStatPoint(hero: Hero, stat: keyof PrimaryStats): Hero | null {
  if (hero.unspentPoints <= 0) return null;

  return {
    ...hero,
    allocatedStats: { ...hero.allocatedStats, [stat]: hero.allocatedStats[stat] + 1 },
    unspentPoints: hero.unspentPoints - 1,
  };
}

/**
 * Get the total base stat sum (for comparing hero quality).
 */
export function getBaseStatTotal(hero: Hero): number {
  return hero.baseStats.str + hero.baseStats.dex + hero.baseStats.int +
         hero.baseStats.con + hero.baseStats.per + hero.baseStats.luk +
         (hero.baseStats.spd || 10);
}
