import { create } from 'zustand';
import { COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../config/combatZones';
import { simulateFight, simulateBossFight, getFightDuration, canEnterZone, getDynamicDifficultyMultiplier, calculateAbilityContribution, getCombatTriangleMultiplier } from '../engine/IdleCombatEngine';
import { addHeroXp, getHeroFocusRing, calculateDerivedStats, getEquippedGear } from '../engine/HeroEngine';
import { getCombatDamageBonus } from '../engine/EncampmentBonuses';
import { CLASSES } from '../config/classes';
import type { CombatStyle } from '../config/combatZones';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useEquipmentStore } from './useEquipmentStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useAuthStore } from './useAuthStore';
import { usePopulationStore } from './usePopulationStore';
import { useLootTrackerStore } from './useLootTrackerStore';
import { getPremiumBonuses } from '../engine/PremiumBonuses';
import { getEncampmentBonuses } from '../engine/EncampmentBonuses';
import { useScanTowerStore } from './useScanTowerStore';

const BOSS_EVERY_N_FIGHTS = 50;
const ENEMY_SCALE_EVERY_N = 10;
/** Enemy stat boost per 10-fight wave (compounding) */
const WAVE_SCALE_FACTOR = 0.02; // +2% HP/stats per wave (every 10 fights) — gradual pressure

/** A spawned enemy instance with live HP tracking */
export interface SpawnedEnemy {
  enemyId: string;
  name: string;
  maxHp: number;
  currentHp: number;
  /** Damage per action (hit) */
  damage: number;
  /** ATB gauge fill rate per tick (default 50) */
  speed: number;
  xpReward: number;
  resourceDrops: { resourceId: string; chance: number; minQty: number; maxQty: number }[];
}

/** Generate a random group of 1-5 enemies with pre-computed scaled stats */
function rollSweepEnemies(
  zone: typeof COMBAT_ZONES[string],
  zoneTier: number,
  waveMultiplier: number,
  difficultyMult: number,
): SpawnedEnemy[] {
  const singleTargets = zone.targets.filter(t => !t.isSweep);
  if (singleTargets.length === 0) return [];
  const tierMult = ZONE_TIER_MULTIPLIERS[zoneTier - 1] || ZONE_TIER_MULTIPLIERS[0];
  const count = Math.floor(Math.random() * 5) + 1; // 1-5
  const enemies: SpawnedEnemy[] = [];
  // Enemy speed: higher zone = faster enemies (40-70 range)
  const baseEnemySpeed = Math.min(70, 40 + Math.floor(zone.minLevel / 5));
  for (let i = 0; i < count; i++) {
    const pick = singleTargets[Math.floor(Math.random() * singleTargets.length)];
    const e = pick.enemy;
    const scaledHp = Math.floor(e.hp * tierMult.hpMult * waveMultiplier * difficultyMult);
    const scaledDmg = Math.floor(e.damage * tierMult.dmgMult * waveMultiplier * difficultyMult);
    const scaledXp = Math.floor(e.xpReward * tierMult.xpMult * waveMultiplier);
    enemies.push({
      enemyId: e.id, name: e.name,
      maxHp: scaledHp, currentHp: scaledHp,
      damage: scaledDmg, speed: (e as any).speed ?? baseEnemySpeed,
      xpReward: scaledXp, resourceDrops: e.resourceDrops,
    });
  }
  return enemies;
}

/** Create a single enemy for non-sweep targets */
function rollSingleEnemy(
  enemy: typeof COMBAT_ZONES[string]['targets'][0]['enemy'],
  zoneTier: number,
  waveMultiplier: number,
  difficultyMult: number,
): SpawnedEnemy[] {
  const tierMult = ZONE_TIER_MULTIPLIERS[zoneTier - 1] || ZONE_TIER_MULTIPLIERS[0];
  const scaledHp = Math.floor(enemy.hp * tierMult.hpMult * waveMultiplier * difficultyMult);
  const scaledDmg = Math.floor(enemy.damage * tierMult.dmgMult * waveMultiplier * difficultyMult);
  const scaledXp = Math.floor(enemy.xpReward * tierMult.xpMult * waveMultiplier);
  return [{
    enemyId: enemy.id, name: enemy.name,
    maxHp: scaledHp, currentHp: scaledHp,
    damage: scaledDmg, speed: (enemy as any).speed ?? 50,
    xpReward: scaledXp, resourceDrops: enemy.resourceDrops,
  }];
}

interface PartyDeployment {
  partyId: string;
  heroIds: string[];
  zoneId: string;
  targetId: string;
  zoneTier: number;
  /** Fights in current boss cycle (0 to BOSS_EVERY_N_FIGHTS-1) */
  fightCount: number;
  fightProgress: number;
  totalKills: number;
  bossKills: number;
  /** Per-hero recovery cooldowns (heroId -> seconds remaining) */
  recoveryCooldowns: Record<string, number>;
  /** Current wave scaling factor (resets after boss) */
  waveMultiplier: number;
  /** Current group of enemies in a sweep fight (randomized each fight) */
  currentEnemies?: SpawnedEnemy[];
  /** Global tick counter — never resets between fights, used for ability cooldowns */
  globalTick: number;
  /** Timestamp when this party was deployed */
  deployedAt: number;
  /** Cumulative XP earned by this deployment */
  totalXpEarned: number;
  /** Number of times any hero died in this deployment */
  deathCount: number;
  /** Transient per-fight hero HP (heroId -> current HP). Reset each fight. */
  heroHpMap?: Record<string, number>;
  /** Transient per-fight hero SP (heroId -> current SP). Reset each fight. */
  heroSpMap?: Record<string, number>;
  /** ATB turn gauge per hero (heroId -> gauge 0-99). Reset each fight. */
  heroGaugeMap?: Record<string, number>;
  /** ATB turn gauge per enemy (index -> gauge 0-99). Reset each fight. */
  enemyGaugeMap?: number[];
  /** Which heroes attacked this tick (heroId -> globalTick when last acted) */
  heroLastAttackTick?: Record<string, number>;
}

interface CombatZoneState {
  deployments: PartyDeployment[];
  tierUnlocks: Record<string, number>;
  bossKillCounts: Record<string, number>;
  /** Global hero recovery cooldowns that persist across recalls (heroId -> seconds remaining) */
  heroRecoveryCooldowns: Record<string, number>;
  /** Tracks recovery tier for escalating cooldowns (heroId -> tier 0/1/2) */
  heroRecoveryTier: Record<string, number>;
  /** Timestamp when hero finished recovering — fragile window is 3 min after this */
  heroRecoveredAt: Record<string, number>;
  nextPartyId: number;

  isHeroDeployed: (heroId: string) => boolean;
  isHeroRecovering: (heroId: string) => boolean;
  deployParty: (heroIds: string[], zoneId: string, targetId: string, tier: number) => boolean;
  recallParty: (partyId: string) => void;
  recallHero: (partyId: string, heroId: string) => void;
  tick: () => void;

  getSerializableState: () => SerializedCombatZoneState;
  loadState: (state: SerializedCombatZoneState) => void;
}

export interface SerializedCombatZoneState {
  deployments: PartyDeployment[];
  tierUnlocks: Record<string, number>;
  bossKillCounts: Record<string, number>;
  heroRecoveryCooldowns?: Record<string, number>;
  nextPartyId?: number;
}

/** Recovery cooldown: 7 min base, doubles if dying within 3-min fragile window, max 21 min. */
const BASE_RECOVERY_SECS = 7 * 60; // 420s
const MAX_RECOVERY_SECS = 21 * 60; // 1260s

function getRecoveryCooldown(heroId: string, state: { heroRecoveryTier: Record<string, number>; heroRecoveredAt: Record<string, number> }): { cooldown: number; newTier: number } {
  const recoveredAt = state.heroRecoveredAt[heroId];
  const inFragileWindow = recoveredAt && (Date.now() - recoveredAt) < 3 * 60 * 1000;
  const currentTier = inFragileWindow ? (state.heroRecoveryTier[heroId] || 0) : 0;
  const newTier = inFragileWindow ? Math.min(currentTier + 1, 2) : 0;
  const cooldown = Math.min(MAX_RECOVERY_SECS, BASE_RECOVERY_SECS * (1 + newTier));
  return { cooldown, newTier };
}

/** Build initial HP/SP maps for a set of heroes (full health/mana). */
function buildInitialHeroMaps(heroIds: string[]): { heroHpMap: Record<string, number>; heroSpMap: Record<string, number> } {
  const eqStore = useEquipmentStore.getState();
  const encampmentHpMult = 1 + (getEncampmentBonuses().combat_hp || 0) / 100;
  const heroHpMap: Record<string, number> = {};
  const heroSpMap: Record<string, number> = {};
  const heroStore = useHeroStore.getState();
  for (const hid of heroIds) {
    const hero = heroStore.heroes.find(h => h.id === hid);
    if (!hero) continue;
    const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
    const derived = calculateDerivedStats(hero, gear);
    heroHpMap[hid] = Math.round(derived.maxHp * encampmentHpMult);
    heroSpMap[hid] = derived.maxSp;
  }
  return { heroHpMap, heroSpMap };
}

export const useCombatZoneStore = create<CombatZoneState>((set, get) => ({
  deployments: [],
  tierUnlocks: {},
  bossKillCounts: {},
  heroRecoveryCooldowns: {},
  heroRecoveryTier: {},
  heroRecoveredAt: {},
  nextPartyId: 1,

  isHeroDeployed: (heroId) => {
    return get().deployments.some(d => d.heroIds.includes(heroId));
  },

  isHeroRecovering: (heroId) => {
    return (get().heroRecoveryCooldowns[heroId] || 0) > 0;
  },

  deployParty: (heroIds, zoneId, targetId, tier) => {
    const state = get();

    const zone = COMBAT_ZONES[zoneId];
    if (!zone) return false;
    if (heroIds.length === 0) return false;

    const heroStore = useHeroStore.getState();
    const deployedHeroIds = new Set(state.deployments.flatMap(d => d.heroIds));

    // Validate all heroes
    const validHeroes: typeof heroStore.heroes = [];
    for (const heroId of heroIds) {
      if (deployedHeroIds.has(heroId)) continue; // already deployed
      const hero = heroStore.heroes.find(h => h.id === heroId);
      if (!hero) continue;
      // Block heroes who are recovering from death
      const recoverySecs = state.heroRecoveryCooldowns[heroId] || 0;
      if (recoverySecs > 0) {
        const mins = Math.floor(recoverySecs / 60);
        const secs = recoverySecs % 60;
        useGameStore.getState().addLog(`${hero.name} is recovering (${mins}m ${secs}s remaining).`, 'error');
        continue;
      }
      if (hero.level < zone.minLevel) {
        useGameStore.getState().addLog(`Warning: ${hero.name} (Lv.${hero.level}) is below recommended Lv.${zone.minLevel} for ${zone.name}.`, 'system');
      }
      validHeroes.push(hero);
    }

    if (validHeroes.length === 0) return false;

    const maxTier = state.tierUnlocks[zoneId] || 1;
    if (tier > maxTier) tier = maxTier;

    const currentId = get().nextPartyId;
    const partyId = `party-${currentId}-${Date.now()}`;
    set({ nextPartyId: currentId + 1 });

    const target = zone.targets.find(t => t.id === targetId);
    // Compute initial difficulty for enemy scaling
    const initAvgLevel = validHeroes.reduce((s, h) => s + h.level, 0) / validHeroes.length;
    const { difficultyMult: initDiff } = getDynamicDifficultyMultiplier(validHeroes.length, initAvgLevel, zone.minLevel);
    const initialEnemies = target?.isSweep
      ? rollSweepEnemies(zone, tier, 1.0, initDiff)
      : target?.enemy
        ? rollSingleEnemy(target.enemy, tier, 1.0, initDiff)
        : undefined;

    set(s => ({
      deployments: [...s.deployments, {
        partyId,
        heroIds: validHeroes.map(h => h.id),
        zoneId, targetId, zoneTier: tier,
        fightCount: 0, fightProgress: 0, totalKills: 0, bossKills: 0,
        recoveryCooldowns: {}, waveMultiplier: 1.0,
        globalTick: 0, deployedAt: Date.now(), totalXpEarned: 0, deathCount: 0,
        currentEnemies: initialEnemies,
        ...buildInitialHeroMaps(validHeroes.map(h => h.id)),
      }],
    }));

    const names = validHeroes.map(h => h.name).join(', ');
    useGameStore.getState().addLog(`Party deployed to ${zone.name}: ${target?.name || targetId} — ${names}.`, 'info');

    // Story: entering combat zone + deployed hero count
    useStoryStore.getState().checkObjective('combat_zone', zoneId, 1);
    const totalDeployed = get().deployments.reduce((sum, d) => sum + d.heroIds.length, 0);
    useStoryStore.getState().checkObjective('deploy_heroes', 'any', totalDeployed);

    return true;
  },

  recallParty: (partyId) => {
    const dep = get().deployments.find(d => d.partyId === partyId);
    if (!dep) return;
    set(s => ({ deployments: s.deployments.filter(d => d.partyId !== partyId) }));
    useGameStore.getState().addLog(`Party recalled from combat.`, 'info');
  },

  recallHero: (partyId, heroId) => {
    const dep = get().deployments.find(d => d.partyId === partyId);
    if (!dep) return;

    const hero = useHeroStore.getState().heroes.find(h => h.id === heroId);
    const remaining = dep.heroIds.filter(id => id !== heroId);

    if (remaining.length === 0) {
      // Last hero — remove the whole party
      set(s => ({ deployments: s.deployments.filter(d => d.partyId !== partyId) }));
    } else {
      set(s => ({
        deployments: s.deployments.map(d => d.partyId === partyId
          ? { ...d, heroIds: remaining, recoveryCooldowns: { ...d.recoveryCooldowns, [heroId]: undefined! } }
          : d
        ),
      }));
    }
    useGameStore.getState().addLog(`${hero?.name || 'Hero'} recalled from combat.`, 'info');
  },

  tick: () => {
    const state = get();

    // Tick down global hero recovery cooldowns (persists across recalls)
    const updatedGlobalCooldowns = { ...state.heroRecoveryCooldowns };
    let globalCdChanged = false;
    const newRecoveredAt = { ...state.heroRecoveredAt };
    const newRecoveryTier = { ...state.heroRecoveryTier };
    for (const heroId of Object.keys(updatedGlobalCooldowns)) {
      if (updatedGlobalCooldowns[heroId] > 0) {
        updatedGlobalCooldowns[heroId]--;
        globalCdChanged = true;
        if (updatedGlobalCooldowns[heroId] <= 0) {
          delete updatedGlobalCooldowns[heroId];
          // Record when hero finished recovering (for fragile window)
          newRecoveredAt[heroId] = Date.now();
        }
      }
    }
    // Clear fragile window + recovery tier after 3 minutes
    const FRAGILE_WINDOW_MS = 3 * 60 * 1000;
    for (const heroId of Object.keys(newRecoveredAt)) {
      if (Date.now() - newRecoveredAt[heroId] > FRAGILE_WINDOW_MS) {
        delete newRecoveredAt[heroId];
        delete newRecoveryTier[heroId];
      }
    }
    if (globalCdChanged) {
      set({ heroRecoveryCooldowns: updatedGlobalCooldowns, heroRecoveredAt: newRecoveredAt, heroRecoveryTier: newRecoveryTier });
    }

    if (state.deployments.length === 0) return;

    const heroStore = useHeroStore.getState();
    const gameStore = useGameStore.getState();
    const newDeployments: PartyDeployment[] = [];

    for (const dep of state.deployments) {
      const zone = COMBAT_ZONES[dep.zoneId];
      if (!zone) { newDeployments.push(dep); continue; }

      // Tick down individual recovery cooldowns
      const newCooldowns = { ...dep.recoveryCooldowns };
      for (const hid of dep.heroIds) {
        if (newCooldowns[hid] && newCooldowns[hid] > 0) {
          newCooldowns[hid] = newCooldowns[hid] - 1;
        }
      }

      // Get active heroes (not recovering)
      const activeHeroes = dep.heroIds
        .map(id => heroStore.heroes.find(h => h.id === id))
        .filter((h): h is NonNullable<typeof h> => !!h && !(newCooldowns[h.id] > 0));

      // If all heroes are recovering, just tick cooldowns
      if (activeHeroes.length === 0) {
        newDeployments.push({ ...dep, recoveryCooldowns: newCooldowns, globalTick: (dep.globalTick || 0) + 1 });
        continue;
      }

      // Fight duration based on strongest active hero
      const baseDuration = Math.min(...activeHeroes.map(h => getFightDuration(h.level, zone.minLevel)));

      // Calculate party difficulty scaling (level-based + hero count)
      const avgLevel = activeHeroes.reduce((s, h) => s + h.level, 0) / activeHeroes.length;
      const { difficultyMult, xpBonusMult } = getDynamicDifficultyMultiplier(activeHeroes.length, avgLevel, zone.minLevel);

      // Estimate actual kill time based on party DPS vs enemy HP
      const target = zone.targets.find(t => t.id === dep.targetId);
      const isBossTime = target?.isSweep && dep.fightCount >= BOSS_EVERY_N_FIGHTS - 1;
      let fastestDuration = baseDuration;
      if (target?.enemy && !isBossTime) {
        // Use pre-computed enemy HP from currentEnemies (already scaled)
        let totalRemainingHp: number;
        if (dep.currentEnemies && dep.currentEnemies.length > 0 && dep.currentEnemies[0].maxHp > 0) {
          // New format: enemies have pre-computed scaled stats
          totalRemainingHp = dep.currentEnemies.reduce((sum, e) => sum + Math.max(0, e.currentHp), 0);
        } else {
          // Fallback for old saves without scaled enemies
          const tierMult = ZONE_TIER_MULTIPLIERS[dep.zoneTier - 1] || ZONE_TIER_MULTIPLIERS[0];
          totalRemainingHp = target.enemy.hp * tierMult.hpMult * dep.waveMultiplier * difficultyMult;
        }
        const scaledEnemyHp = totalRemainingHp;
        const eqStore = useEquipmentStore.getState();
        const encampmentDmgMult = 1 + getCombatDamageBonus() / 100;
        let totalPartyDps = 0;
        for (const hero of activeHeroes) {
          const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
          const derived = calculateDerivedStats(hero, gear);
          const heroAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);
          const cls = CLASSES[hero.classId];
          const triangleMult = getCombatTriangleMultiplier(cls?.primaryCombatStyle as CombatStyle, (target.enemy as any).combatStyle);
          const hitRate = Math.min(1, derived.accuracy / 100);
          const critMult = 1 + (derived.critChance / 100) * (derived.critDamage / 100 - 1);
          let heroDps = heroAttack * hitRate * critMult * triangleMult * encampmentDmgMult * 0.9; // 0.9 = enemy defense
          heroDps += heroAttack * (derived.burnDot + derived.poisonDot + derived.radiationDot + derived.bleedDot) / 100;
          const abilityContrib = calculateAbilityContribution(hero, derived, baseDuration);
          heroDps += abilityContrib.bonusDps;
          totalPartyDps += heroDps;
        }
        if (totalPartyDps > 0) {
          const estimatedKillTime = Math.max(4, Math.ceil(scaledEnemyHp / totalPartyDps));
          fastestDuration = Math.min(baseDuration, estimatedKillTime);
        }
      }

      const newProgress = dep.fightProgress + 1;

      // Check if all enemies are already dead from per-tick damage
      const allEnemiesDead = dep.currentEnemies && dep.currentEnemies.length > 0 &&
        dep.currentEnemies.every(e => e.currentHp <= 0);

      if (allEnemiesDead || newProgress >= fastestDuration) {
        let anyWon = false;
        let anyDied = false;
        let fightXpGained = 0;
        let fightDeaths = 0;
        const updatedCooldowns = { ...newCooldowns };

        if (isBossTime) {
          // Boss fight — each active hero fights the boss
          let bossWon = false;
          for (const hero of activeHeroes) {
            // If tick-based HP reached 0, hero is dead — skip simulation
            const tickHp = dep.heroHpMap?.[hero.id] ?? -1;
            if (tickHp === 0) {
              anyDied = true;
              fightDeaths++;
              const { cooldown: bossTickCd, newTier: bossTickTier } = getRecoveryCooldown(hero.id, state);
              updatedCooldowns[hero.id] = bossTickCd;
              set(s => ({
                heroRecoveryCooldowns: { ...s.heroRecoveryCooldowns, [hero.id]: bossTickCd },
                heroRecoveryTier: { ...s.heroRecoveryTier, [hero.id]: bossTickTier },
                heroRecoveredAt: { ...s.heroRecoveredAt, [hero.id]: undefined! },
              }));
              const cdMins = Math.floor(bossTickCd / 60);
              gameStore.addLog(`${hero.name} was slain by ${zone.boss.name}! Recovering ${cdMins}m...`, 'error');
              continue;
            }
            const result = simulateBossFight(hero, dep.zoneId, dep.zoneTier, dep.waveMultiplier, difficultyMult);

            // Consume used consumables (1 of each per fight)
            if (result.consumablesUsed.length > 0) {
              const res = { ...useGameStore.getState().resources };
              for (const cId of result.consumablesUsed) {
                res[cId] = Math.max(0, (res[cId] || 0) - 1);
              }
              useGameStore.setState({ resources: res });

              const currentRes = useGameStore.getState().resources;
              const heroState = useHeroStore.getState();
              const h = heroState.heroes.find(hh => hh.id === hero.id);
              if (h) {
                const newConsumables = [...(h.equippedConsumables || [])];
                let changed = false;
                for (let i = 0; i < newConsumables.length; i++) {
                  if (newConsumables[i] && (currentRes[newConsumables[i]!] || 0) <= 0) {
                    newConsumables[i] = null;
                    changed = true;
                  }
                }
                if (changed) {
                  useHeroStore.setState({
                    heroes: heroState.heroes.map(hh => hh.id === hero.id ? { ...hh, equippedConsumables: newConsumables } : hh),
                  });
                }
              }
            }

            const eqStore = useEquipmentStore.getState();
            const focusRing = getHeroFocusRing(hero.id, eqStore.heroEquipment, eqStore.inventory);
            const xpAmount = Math.floor(result.xpGained * xpBonusMult * getPremiumBonuses().xpMultiplier * (1 + (getEncampmentBonuses().hero_xp || 0) / 100));
            fightXpGained += xpAmount;
            const updatedHero = addHeroXp(hero, xpAmount, focusRing);
            useHeroStore.setState(s => ({ heroes: s.heroes.map(h => h.id === hero.id ? { ...updatedHero, equippedConsumables: h.equippedConsumables } : h) }));
            // Story: hero level up
            if (updatedHero.level > hero.level) {
              useStoryStore.getState().checkObjective('reach_hero_level', 'any', updatedHero.level);
            }

            if (result.won) {
              bossWon = true;
              const resources = { ...gameStore.resources };
              const bossStory = useStoryStore.getState();
              const bossIcqorUnlocked = bossStory.currentStoryNumber >= 7 || bossStory.completedStories.includes(7);
              for (const r of result.resourceDrops) {
                if (r.resourceId === 'icqor_chess_piece' && !bossIcqorUnlocked) continue;
                resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
                useLootTrackerStore.getState().trackLoot(r.resourceId, r.quantity, 'boss', zone.name);
              }
              useGameStore.setState({ resources });

              if (result.gearDrop) {
                useEquipmentStore.setState(s => ({ inventory: [...s.inventory, result.gearDrop!] }));
                const rLabel = result.gearDrop.rarity.charAt(0).toUpperCase() + result.gearDrop.rarity.slice(1);
                gameStore.addLog(`BOSS DEFEATED! ${hero.name} got [${rLabel}] gear from ${result.enemyName}!`, 'levelup');

                // Anti-cheat: log loot event
                const actorId = useAuthStore.getState().user?.id || 'system';
                useAnticheatStore.getState().logItemEvent(result.gearDrop.gameId, 'loot', actorId, undefined, 1, { zoneId: dep.zoneId, enemyName: result.enemyName, rarity: result.gearDrop.rarity });
              }
            }

            if (result.heroDied) {
              anyDied = true;
              fightDeaths++;
              const { cooldown: bossCd, newTier: bossTier } = getRecoveryCooldown(hero.id, state);
              updatedCooldowns[hero.id] = bossCd;
              set(s => ({
                heroRecoveryCooldowns: { ...s.heroRecoveryCooldowns, [hero.id]: bossCd },
                heroRecoveryTier: { ...s.heroRecoveryTier, [hero.id]: bossTier },
                heroRecoveredAt: { ...s.heroRecoveredAt, [hero.id]: undefined! },
              }));
              const bossCdMins = Math.floor(bossCd / 60);
              gameStore.addLog(`${hero.name} was crushed by ${result.enemyName}! Recovering ${bossCdMins}m...`, 'error');
            }
          }

          if (bossWon) {
            anyWon = true;
            gameStore.addLog(`Party slew the boss in ${zone.name}!`, 'levelup');

            // Story: boss kill
            useStoryStore.getState().checkObjective('kill_boss', zone.boss.id, 1);
            useStoryStore.getState().checkObjective('kill_enemies', 'any', 1);
            // If tier 2+, also fire boss_hard
            if (dep.zoneTier >= 2) {
              useStoryStore.getState().checkObjective('kill_boss', 'boss_hard', 1);
            }
            // If tier 3+, also fire boss_elite
            if (dep.zoneTier >= 3) {
              useStoryStore.getState().checkObjective('kill_boss', 'boss_elite', 1);
            }

            // Achievement: track boss kills
            useAchievementStore.getState().incrementStat('bossKills');

            // Track boss kills for tier unlock
            const key = `${dep.zoneId}:${dep.zoneTier}`;
            const newBossKills = (state.bossKillCounts[key] || 0) + 1;
            const newBossKillCounts = { ...state.bossKillCounts, [key]: newBossKills };
            let tierUnlocks = { ...state.tierUnlocks };
            if (newBossKills >= 5 && dep.zoneTier < zone.maxTier) {
              const currentMax = tierUnlocks[dep.zoneId] || 1;
              if (dep.zoneTier >= currentMax) {
                tierUnlocks[dep.zoneId] = dep.zoneTier + 1;
                const nextTierName = ['', 'Normal', 'Hard', 'Elite', 'Nightmare', 'Apocalypse', 'Extinction'][dep.zoneTier + 1] || '???';
                gameStore.addLog(`New tier unlocked: ${zone.name} ${nextTierName}!`, 'levelup');
              }
            }
            set({ bossKillCounts: newBossKillCounts, tierUnlocks });
          }

          // Reset cycle after boss — roll new enemies for next sweep fight
          const bossResetMaps = buildInitialHeroMaps(dep.heroIds);
          newDeployments.push({
            ...dep, fightProgress: 0, fightCount: 0, waveMultiplier: 1.0,
            globalTick: (dep.globalTick || 0) + 1,
            totalKills: dep.totalKills + (bossWon ? 1 : 0),
            bossKills: dep.bossKills + (bossWon ? 1 : 0),
            totalXpEarned: dep.totalXpEarned + fightXpGained,
            deathCount: dep.deathCount + fightDeaths,
            recoveryCooldowns: updatedCooldowns,
            currentEnemies: target?.isSweep
              ? rollSweepEnemies(zone, dep.zoneTier, 1.0, difficultyMult)
              : target?.enemy
                ? rollSingleEnemy(target.enemy, dep.zoneTier, 1.0, difficultyMult)
                : undefined,
            heroHpMap: bossResetMaps.heroHpMap,
            heroSpMap: bossResetMaps.heroSpMap,
            heroGaugeMap: {}, enemyGaugeMap: [], heroLastAttackTick: {},
          });
        } else {
          // Normal fight — build synthetic enemy from ALL currentEnemies (use maxHp, not currentHp)
          const allSpawned = dep.currentEnemies || [];
          // Synthetic enemy: total HP (hero must kill all), but only strongest enemy's damage
          // (hero fights one at a time, takes damage from the current target only)
          const maxSingleDmg = allSpawned.length > 0 ? Math.max(...allSpawned.map(e => e.damage)) : 0;
          const syntheticEnemy = allSpawned.length > 0 ? {
            ...((target?.enemy || zone.targets[0].enemy)),
            hp: allSpawned.reduce((s, e) => s + e.maxHp, 0),
            damage: maxSingleDmg,
            xpReward: allSpawned.reduce((s, e) => s + e.xpReward, 0),
          } : (target?.enemy || zone.targets[0].enemy);
          for (const hero of activeHeroes) {
            // If tick-based HP reached 0, hero is dead — skip simulation
            const tickHpNorm = dep.heroHpMap?.[hero.id] ?? -1;
            if (tickHpNorm === 0) {
              anyDied = true;
              fightDeaths++;
              const { cooldown: normTickCd, newTier: normTickTier } = getRecoveryCooldown(hero.id, state);
              updatedCooldowns[hero.id] = normTickCd;
              set(s => ({
                heroRecoveryCooldowns: { ...s.heroRecoveryCooldowns, [hero.id]: normTickCd },
                heroRecoveryTier: { ...s.heroRecoveryTier, [hero.id]: normTickTier },
                heroRecoveredAt: { ...s.heroRecoveredAt, [hero.id]: undefined! },
              }));
              const enemyName = target?.enemy?.name || 'enemies';
              const normTickMins = Math.floor(normTickCd / 60);
              gameStore.addLog(`${hero.name} was defeated by ${enemyName}! Recovering ${normTickMins}m...`, 'error');
              continue;
            }
            // Pass tier=1, wave=1, diff=1 since stats are already scaled in syntheticEnemy
            const result = simulateFight(hero, syntheticEnemy, 1, zone.minLevel, 1.0, 1.0);

            // Consume used consumables (1 of each per fight)
            if (result.consumablesUsed.length > 0) {
              const res = { ...useGameStore.getState().resources };
              for (const cId of result.consumablesUsed) {
                res[cId] = Math.max(0, (res[cId] || 0) - 1);
              }
              useGameStore.setState({ resources: res });

              // Auto-unequip consumables that ran out
              const currentRes = useGameStore.getState().resources;
              const heroState = useHeroStore.getState();
              const h = heroState.heroes.find(hh => hh.id === hero.id);
              if (h) {
                const newConsumables = [...(h.equippedConsumables || [])];
                let changed = false;
                for (let i = 0; i < newConsumables.length; i++) {
                  if (newConsumables[i] && (currentRes[newConsumables[i]!] || 0) <= 0) {
                    newConsumables[i] = null;
                    changed = true;
                  }
                }
                if (changed) {
                  useHeroStore.setState({
                    heroes: heroState.heroes.map(hh => hh.id === hero.id ? { ...hh, equippedConsumables: newConsumables } : hh),
                  });
                }
              }
            }

            const eqStoreNorm = useEquipmentStore.getState();
            const focusRingNorm = getHeroFocusRing(hero.id, eqStoreNorm.heroEquipment, eqStoreNorm.inventory);
            const xpAmountNorm = Math.floor(result.xpGained * xpBonusMult * getPremiumBonuses().xpMultiplier * (1 + (getEncampmentBonuses().hero_xp || 0) / 100));
            fightXpGained += xpAmountNorm;
            const updatedHero = addHeroXp(hero, xpAmountNorm, focusRingNorm);
            useHeroStore.setState(s => ({ heroes: s.heroes.map(h => h.id === hero.id ? { ...updatedHero, equippedConsumables: h.equippedConsumables } : h) }));
            // Story: hero level up
            if (updatedHero.level > hero.level) {
              useStoryStore.getState().checkObjective('reach_hero_level', 'any', updatedHero.level);
            }

            if (result.won) {
              anyWon = true;
              const resources = { ...gameStore.resources };
              for (const r of result.resourceDrops) {
                resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
                useLootTrackerStore.getState().trackLoot(r.resourceId, r.quantity, 'combat', zone.name);
              }
              useGameStore.setState({ resources });

              // Story: enemy kill
              useStoryStore.getState().checkObjective('kill_enemies', 'any', 1);
            }

            if (result.heroDied) {
              anyDied = true;
              fightDeaths++;
              const { cooldown: normCd, newTier: normTier } = getRecoveryCooldown(hero.id, state);
              updatedCooldowns[hero.id] = normCd;
              set(s => ({
                heroRecoveryCooldowns: { ...s.heroRecoveryCooldowns, [hero.id]: normCd },
                heroRecoveryTier: { ...s.heroRecoveryTier, [hero.id]: normTier },
                heroRecoveredAt: { ...s.heroRecoveredAt, [hero.id]: undefined! },
              }));
              const normCdMins = Math.floor(normCd / 60);
              gameStore.addLog(`${hero.name} was defeated by ${result.enemyName}! Recovering ${normCdMins}m...`, 'error');
            }
          }

          // Track combat kills for population growth
          if (anyWon) {
            usePopulationStore.getState().addCombatKill(dep.zoneTier);

            // Rare Icqor Chess Piece drop from regular combat kills (gated behind chapter 7)
            const storyS = useStoryStore.getState();
            const icqorUnlocked = storyS.currentStoryNumber >= 7 || storyS.completedStories.includes(7);
            const combatIcqorChance = dep.zoneTier >= 3 ? 0.003 : dep.zoneTier >= 2 ? 0.0015 : 0.0005;
            if (icqorUnlocked && Math.random() < combatIcqorChance) {
              const resources = { ...gameStore.resources };
              resources['icqor_chess_piece'] = (resources['icqor_chess_piece'] || 0) + 1;
              useGameStore.setState({ resources });
              gameStore.addLog('✦ Rare drop: Icqor Chess Piece!', 'levelup');
              useStoryStore.getState().checkObjective('gather', 'icqor_chess_piece', 1);
            }
          }

          const newFightCount = target?.isSweep ? dep.fightCount + 1 : dep.fightCount;

          // Recalculate wave multiplier every 10 fights
          let newWaveMult = dep.waveMultiplier;
          if (target?.isSweep && newFightCount > 0 && newFightCount % ENEMY_SCALE_EVERY_N === 0) {
            newWaveMult = 1.0 + Math.floor(newFightCount / ENEMY_SCALE_EVERY_N) * WAVE_SCALE_FACTOR * getPremiumBonuses().waveScaleMultiplier;
            gameStore.addLog(`Wave ${Math.floor(newFightCount / ENEMY_SCALE_EVERY_N) + 1}: enemies in ${zone.name} grow stronger! (+${Math.round((newWaveMult - 1) * 100)}%)`, 'system');
          }

          const fightResetMaps = buildInitialHeroMaps(dep.heroIds);
          newDeployments.push({
            ...dep, fightProgress: 0, fightCount: newFightCount, waveMultiplier: newWaveMult,
            globalTick: (dep.globalTick || 0) + 1,
            totalKills: dep.totalKills + (anyWon ? 1 : 0),
            totalXpEarned: dep.totalXpEarned + fightXpGained,
            deathCount: dep.deathCount + fightDeaths,
            recoveryCooldowns: updatedCooldowns,
            currentEnemies: target?.isSweep
              ? rollSweepEnemies(zone, dep.zoneTier, newWaveMult, difficultyMult)
              : target?.enemy
                ? rollSingleEnemy(target.enemy, dep.zoneTier, newWaveMult, difficultyMult)
                : undefined,
            heroHpMap: fightResetMaps.heroHpMap,
            heroSpMap: fightResetMaps.heroSpMap,
            heroGaugeMap: {}, enemyGaugeMap: [], heroLastAttackTick: {},
          });
        }
      } else {
        // ── ATB Turn Gauge mid-fight tick ──
        const updatedEnemies = dep.currentEnemies ? dep.currentEnemies.map(e => ({ ...e })) : undefined;
        const gt = (dep.globalTick || 0) + 1;
        const updatedHpMap = { ...(dep.heroHpMap || {}) };
        const updatedSpMap = { ...(dep.heroSpMap || {}) };
        const updatedHeroGauge = { ...(dep.heroGaugeMap || {}) };
        const updatedEnemyGauge = dep.enemyGaugeMap ? [...dep.enemyGaugeMap] : [];
        const updatedLastAttack: Record<string, number> = { ...(dep.heroLastAttackTick || {}) };

        if (updatedEnemies && updatedEnemies.length > 0) {
          const eqStoreT = useEquipmentStore.getState();
          const encampmentDmgMultT = 1 + getCombatDamageBonus() / 100;
          const encBonusesT = getEncampmentBonuses();
          const encDefMultT = 1 + (encBonusesT.combat_defense || 0) / 100;
          const encHpMultT = 1 + (encBonusesT.combat_hp || 0) / 100;
          const scanTurnSpeedBonus = useScanTowerStore.getState().getScanBuffBonuses().turnSpeedBonus;

          // Pre-compute hero data
          const heroData = activeHeroes.map(hero => {
            const gear = getEquippedGear(hero.id, eqStoreT.heroEquipment, eqStoreT.inventory);
            const derived = calculateDerivedStats(hero, gear);
            const effectiveDefense = derived.defense * encDefMultT;
            const defMult = Math.max(0.2, 1 - effectiveDefense / (effectiveDefense + 200))
              * (1 - Math.min(0.5, derived.evasion / 100))
              * (1 - (derived.blockChance / 100) * 0.5)
              * (1 - derived.damageReduction / 100);
            return { hero, derived, gear, defMult, maxHp: Math.round(derived.maxHp * encHpMultT) };
          });

          // ── HERO ATB: Fill gauge, act when full ──
          for (const { hero, derived } of heroData) {
            updatedHeroGauge[hero.id] = (updatedHeroGauge[hero.id] || 0) + derived.turnSpeed + scanTurnSpeedBonus;
            let actions = 0;
            while (updatedHeroGauge[hero.id] >= 100 && actions < 3) {
              updatedHeroGauge[hero.id] -= 100;
              actions++;

              const heroAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);
              const cls = CLASSES[hero.classId];
              const triangleMult = getCombatTriangleMultiplier(cls?.primaryCombatStyle as CombatStyle, (target?.enemy as any)?.combatStyle);
              const hitRate = Math.min(1, derived.accuracy / 100);
              const critMult = 1 + (derived.critChance / 100) * (derived.critDamage / 100 - 1);
              let heroDmg = heroAttack * hitRate * critMult * triangleMult * encampmentDmgMultT * 0.9;
              heroDmg += heroAttack * (derived.burnDot + derived.poisonDot + derived.radiationDot + derived.bleedDot) / 100;
              const abilityContrib = calculateAbilityContribution(hero, derived, baseDuration);
              heroDmg += abilityContrib.bonusDps;

              const firstAlive = updatedEnemies.find(e => e.currentHp > 0);
              if (firstAlive) {
                firstAlive.currentHp = Math.max(0, firstAlive.currentHp - heroDmg);
              }

              // SP consumption per action
              if (abilityContrib.spUsed > 0) {
                const spPerAction = abilityContrib.spUsed / Math.max(1, baseDuration);
                updatedSpMap[hero.id] = Math.max(0, (updatedSpMap[hero.id] ?? derived.maxSp) - spPerAction);
              }

              // Lifesteal healing per action
              const lifestealHeal = heroDmg * (derived.lifesteal / 100);
              if (lifestealHeal > 0) {
                updatedHpMap[hero.id] = Math.min(derived.maxHp, (updatedHpMap[hero.id] ?? derived.maxHp) + lifestealHeal);
              }

              updatedLastAttack[hero.id] = gt;
            }

            // SP regen every tick (regardless of actions)
            updatedSpMap[hero.id] = Math.min(derived.maxSp, (updatedSpMap[hero.id] ?? derived.maxSp) + derived.spRegen);
          }

          // ── ENEMY ATB: Fill gauge, act when full ──
          // Ensure enemy gauge array is sized
          while (updatedEnemyGauge.length < updatedEnemies.length) updatedEnemyGauge.push(0);

          for (let ei = 0; ei < updatedEnemies.length; ei++) {
            const enemy = updatedEnemies[ei];
            if (enemy.currentHp <= 0) continue;

            updatedEnemyGauge[ei] = (updatedEnemyGauge[ei] || 0) + (enemy.speed || 50);
            let eActions = 0;
            while (updatedEnemyGauge[ei] >= 100 && eActions < 3) {
              updatedEnemyGauge[ei] -= 100;
              eActions++;

              // Distribute hit across heroes
              const dmgPerHero = enemy.damage / Math.max(1, heroData.length);
              for (const hd of heroData) {
                const incomingDmg = dmgPerHero * hd.defMult;

                // Thorns reflect
                if (hd.derived.thornsDamage > 0) {
                  const thornsDmg = incomingDmg * (hd.derived.thornsDamage / 100);
                  enemy.currentHp = Math.max(0, enemy.currentHp - thornsDmg);
                }

                const netDmg = Math.max(0, incomingDmg - (hd.derived.hpRegen || 0));
                updatedHpMap[hd.hero.id] = Math.max(0, (updatedHpMap[hd.hero.id] ?? hd.maxHp) - netDmg);
              }
            }
          }
        }
        newDeployments.push({
          ...dep, fightProgress: newProgress, globalTick: gt,
          recoveryCooldowns: newCooldowns, currentEnemies: updatedEnemies,
          heroHpMap: updatedHpMap, heroSpMap: updatedSpMap,
          heroGaugeMap: updatedHeroGauge, enemyGaugeMap: updatedEnemyGauge,
          heroLastAttackTick: updatedLastAttack,
        });
      }
    }

    set({ deployments: newDeployments });

    // Achievement: track max hero level across all heroes (once per tick)
    const allHeroes = useHeroStore.getState().heroes;
    if (allHeroes.length > 0) {
      const maxLevel = Math.max(...allHeroes.map(h => h.level));
      useAchievementStore.getState().setMaxStat('maxHeroLevel', maxLevel);
    }
  },

  getSerializableState: () => ({
    deployments: get().deployments,
    tierUnlocks: get().tierUnlocks,
    bossKillCounts: get().bossKillCounts,
    heroRecoveryCooldowns: get().heroRecoveryCooldowns,
    heroRecoveryTier: get().heroRecoveryTier,
    heroRecoveredAt: get().heroRecoveredAt,
    nextPartyId: get().nextPartyId,
  }),

  loadState: (saved) => {
    const savedNextId = saved.nextPartyId || 1;
    set({
      deployments: saved.deployments.map(d => ({
        ...d,
        waveMultiplier: d.waveMultiplier || 1.0,
        recoveryCooldowns: d.recoveryCooldowns || {},
        partyId: d.partyId || `party-${savedNextId}-${Date.now()}`,
        heroIds: d.heroIds || ((d as any).heroId ? [(d as any).heroId] : []),
      })),
      tierUnlocks: saved.tierUnlocks,
      bossKillCounts: saved.bossKillCounts,
      heroRecoveryCooldowns: saved.heroRecoveryCooldowns || {},
      heroRecoveryTier: (saved as any).heroRecoveryTier || {},
      heroRecoveredAt: (saved as any).heroRecoveredAt || {},
      nextPartyId: savedNextId + saved.deployments.length,
    });
  },
}));
