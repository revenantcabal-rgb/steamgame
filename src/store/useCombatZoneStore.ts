import { create } from 'zustand';
import { COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../config/combatZones';
import { simulateFight, simulateBossFight, getFightDuration, canEnterZone, getDynamicDifficultyMultiplier } from '../engine/IdleCombatEngine';
import { addHeroXp } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useEquipmentStore } from './useEquipmentStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useAuthStore } from './useAuthStore';

const BOSS_EVERY_N_FIGHTS = 50;
const ENEMY_SCALE_EVERY_N = 10;
/** Enemy stat boost per 10-fight wave (compounding) */
const WAVE_SCALE_FACTOR = 0.12; // +12% per wave

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
}

interface CombatZoneState {
  deployments: PartyDeployment[];
  tierUnlocks: Record<string, number>;
  bossKillCounts: Record<string, number>;

  isHeroDeployed: (heroId: string) => boolean;
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
}

let nextPartyId = 1;

export const useCombatZoneStore = create<CombatZoneState>((set, get) => ({
  deployments: [],
  tierUnlocks: {},
  bossKillCounts: {},

  isHeroDeployed: (heroId) => {
    return get().deployments.some(d => d.heroIds.includes(heroId));
  },

  deployParty: (heroIds, zoneId, targetId, tier) => {
    const state = get();

    const zone = COMBAT_ZONES[zoneId];
    if (!zone) return false;
    if (heroIds.length === 0) return false;

    const heroStore = useHeroStore.getState();
    const deployedHeroIds = new Set(state.deployments.flatMap(d => d.heroIds));

    // Validate all heroes
    const validHeroes = [];
    for (const heroId of heroIds) {
      if (deployedHeroIds.has(heroId)) continue; // already deployed
      const hero = heroStore.heroes.find(h => h.id === heroId);
      if (!hero) continue;
      if (!canEnterZone(hero.level, zone.minLevel)) {
        useGameStore.getState().addLog(`${hero.name} is too low level for ${zone.name}.`, 'error');
        continue;
      }
      validHeroes.push(hero);
    }

    if (validHeroes.length === 0) return false;

    const maxTier = state.tierUnlocks[zoneId] || 1;
    if (tier > maxTier) tier = maxTier;

    const partyId = `party-${nextPartyId++}-${Date.now()}`;

    set(s => ({
      deployments: [...s.deployments, {
        partyId,
        heroIds: validHeroes.map(h => h.id),
        zoneId, targetId, zoneTier: tier,
        fightCount: 0, fightProgress: 0, totalKills: 0, bossKills: 0,
        recoveryCooldowns: {}, waveMultiplier: 1.0,
      }],
    }));

    const target = zone.targets.find(t => t.id === targetId);
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
        newDeployments.push({ ...dep, recoveryCooldowns: newCooldowns });
        continue;
      }

      // Fight duration based on strongest active hero
      const fastestDuration = Math.min(...activeHeroes.map(h => getFightDuration(h.level, zone.minLevel)));
      const newProgress = dep.fightProgress + 1;

      if (newProgress >= fastestDuration) {
        const target = zone.targets.find(t => t.id === dep.targetId);
        const isBossTime = target?.isSweep && dep.fightCount >= BOSS_EVERY_N_FIGHTS - 1;

        // Calculate party difficulty scaling
        const avgLevel = activeHeroes.reduce((s, h) => s + h.level, 0) / activeHeroes.length;
        const { difficultyMult, xpBonusMult } = getDynamicDifficultyMultiplier(activeHeroes.length, avgLevel, zone.minLevel);

        let anyWon = false;
        let anyDied = false;
        const updatedCooldowns = { ...newCooldowns };

        if (isBossTime) {
          // Boss fight — each active hero fights the boss
          let bossWon = false;
          for (const hero of activeHeroes) {
            const result = simulateBossFight(hero, dep.zoneId, dep.zoneTier, dep.waveMultiplier, difficultyMult);
            const updatedHero = addHeroXp(hero, Math.floor(result.xpGained * xpBonusMult));
            useHeroStore.setState({ heroes: heroStore.heroes.map(h => h.id === hero.id ? updatedHero : h) });
            // Story: hero level up
            if (updatedHero.level > hero.level) {
              useStoryStore.getState().checkObjective('reach_hero_level', 'any', updatedHero.level);
            }

            if (result.won) {
              bossWon = true;
              const resources = { ...gameStore.resources };
              for (const r of result.resourceDrops) {
                resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
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
              updatedCooldowns[hero.id] = result.recoveryCooldown;
              gameStore.addLog(`${hero.name} was crushed by ${result.enemyName}! Recovering...`, 'error');
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

          // Reset cycle after boss
          newDeployments.push({
            ...dep, fightProgress: 0, fightCount: 0, waveMultiplier: 1.0,
            totalKills: dep.totalKills + (bossWon ? 1 : 0),
            bossKills: dep.bossKills + (bossWon ? 1 : 0),
            recoveryCooldowns: updatedCooldowns,
          });
        } else {
          // Normal fight — each active hero fights the enemy
          for (const hero of activeHeroes) {
            const enemy = target?.enemy || zone.targets[0].enemy;
            const result = simulateFight(hero, enemy, dep.zoneTier, zone.minLevel, dep.waveMultiplier, difficultyMult);
            const updatedHero = addHeroXp(hero, Math.floor(result.xpGained * xpBonusMult));
            useHeroStore.setState({ heroes: heroStore.heroes.map(h => h.id === hero.id ? updatedHero : h) });
            // Story: hero level up
            if (updatedHero.level > hero.level) {
              useStoryStore.getState().checkObjective('reach_hero_level', 'any', updatedHero.level);
            }

            if (result.won) {
              anyWon = true;
              const resources = { ...gameStore.resources };
              for (const r of result.resourceDrops) {
                resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
              }
              useGameStore.setState({ resources });

              // Story: enemy kill
              useStoryStore.getState().checkObjective('kill_enemies', 'any', 1);
            }

            if (result.heroDied) {
              anyDied = true;
              updatedCooldowns[hero.id] = result.recoveryCooldown;
              gameStore.addLog(`${hero.name} was defeated by ${result.enemyName}! Recovering...`, 'error');
            }
          }

          const newFightCount = target?.isSweep ? dep.fightCount + 1 : dep.fightCount;

          // Recalculate wave multiplier every 10 fights
          let newWaveMult = dep.waveMultiplier;
          if (target?.isSweep && newFightCount > 0 && newFightCount % ENEMY_SCALE_EVERY_N === 0) {
            newWaveMult = 1.0 + Math.floor(newFightCount / ENEMY_SCALE_EVERY_N) * WAVE_SCALE_FACTOR;
            gameStore.addLog(`Wave ${Math.floor(newFightCount / ENEMY_SCALE_EVERY_N) + 1}: enemies in ${zone.name} grow stronger! (+${Math.round((newWaveMult - 1) * 100)}%)`, 'system');
          }

          newDeployments.push({
            ...dep, fightProgress: 0, fightCount: newFightCount, waveMultiplier: newWaveMult,
            totalKills: dep.totalKills + (anyWon ? 1 : 0),
            recoveryCooldowns: updatedCooldowns,
          });
        }
      } else {
        newDeployments.push({ ...dep, fightProgress: newProgress, recoveryCooldowns: newCooldowns });
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
  }),

  loadState: (saved) => {
    set({
      deployments: saved.deployments.map(d => ({
        ...d,
        waveMultiplier: d.waveMultiplier || 1.0,
        recoveryCooldowns: d.recoveryCooldowns || {},
        partyId: d.partyId || `party-${nextPartyId++}-${Date.now()}`,
        heroIds: d.heroIds || ((d as any).heroId ? [(d as any).heroId] : []),
      })),
      tierUnlocks: saved.tierUnlocks,
      bossKillCounts: saved.bossKillCounts,
    });
  },
}));
