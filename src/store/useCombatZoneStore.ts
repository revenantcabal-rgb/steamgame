import { create } from 'zustand';
import { COMBAT_ZONES } from '../config/combatZones';
import { simulateFight, simulateBossFight, getFightDuration, canEnterZone } from '../engine/IdleCombatEngine';
import { addHeroXp } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useEquipmentStore } from './useEquipmentStore';

const BOSS_EVERY_N_FIGHTS = 50;
const ENEMY_SCALE_EVERY_N = 10;
/** Enemy stat boost per 10-fight wave (compounding) */
const WAVE_SCALE_FACTOR = 0.12; // +12% per wave

interface CombatDeployment {
  heroId: string;
  zoneId: string;
  targetId: string;
  zoneTier: number;
  /** Fights in current boss cycle (0 to BOSS_EVERY_N_FIGHTS-1) */
  fightCount: number;
  fightProgress: number;
  totalKills: number;
  bossKills: number;
  recoveryCooldown: number;
  /** Current wave scaling factor (resets after boss) */
  waveMultiplier: number;
}

interface CombatZoneState {
  deployments: CombatDeployment[];
  tierUnlocks: Record<string, number>;
  bossKillCounts: Record<string, number>;

  deployHero: (heroId: string, zoneId: string, targetId: string, tier: number) => boolean;
  recallHero: (heroId: string) => void;
  tick: () => void;

  getSerializableState: () => SerializedCombatZoneState;
  loadState: (state: SerializedCombatZoneState) => void;
}

export interface SerializedCombatZoneState {
  deployments: CombatDeployment[];
  tierUnlocks: Record<string, number>;
  bossKillCounts: Record<string, number>;
}

export const useCombatZoneStore = create<CombatZoneState>((set, get) => ({
  deployments: [],
  tierUnlocks: {},
  bossKillCounts: {},

  deployHero: (heroId, zoneId, targetId, tier) => {
    const state = get();
    if (state.deployments.find(d => d.heroId === heroId)) return false;

    const zone = COMBAT_ZONES[zoneId];
    if (!zone) return false;

    const hero = useHeroStore.getState().heroes.find(h => h.id === heroId);
    if (!hero) return false;

    if (!canEnterZone(hero.level, zone.minLevel)) {
      useGameStore.getState().addLog(`${hero.name} is too low level for ${zone.name}.`, 'error');
      return false;
    }

    const maxTier = state.tierUnlocks[zoneId] || 1;
    if (tier > maxTier) tier = maxTier;

    set(s => ({
      deployments: [...s.deployments, {
        heroId, zoneId, targetId, zoneTier: tier,
        fightCount: 0, fightProgress: 0, totalKills: 0, bossKills: 0,
        recoveryCooldown: 0, waveMultiplier: 1.0,
      }],
    }));

    const target = zone.targets.find(t => t.id === targetId);
    useGameStore.getState().addLog(`${hero.name} deployed to ${zone.name}: ${target?.name || targetId}.`, 'info');
    return true;
  },

  recallHero: (heroId) => {
    const dep = get().deployments.find(d => d.heroId === heroId);
    if (!dep) return;
    set(s => ({ deployments: s.deployments.filter(d => d.heroId !== heroId) }));
    const hero = useHeroStore.getState().heroes.find(h => h.id === heroId);
    useGameStore.getState().addLog(`${hero?.name || 'Hero'} recalled from combat.`, 'info');
  },

  tick: () => {
    const state = get();
    if (state.deployments.length === 0) return;

    const heroStore = useHeroStore.getState();
    const gameStore = useGameStore.getState();
    const newDeployments: CombatDeployment[] = [];

    for (const dep of state.deployments) {
      const hero = heroStore.heroes.find(h => h.id === dep.heroId);
      if (!hero) { newDeployments.push(dep); continue; }

      // Recovery cooldown
      if (dep.recoveryCooldown > 0) {
        newDeployments.push({ ...dep, recoveryCooldown: dep.recoveryCooldown - 1 });
        continue;
      }

      const zone = COMBAT_ZONES[dep.zoneId];
      if (!zone) { newDeployments.push(dep); continue; }

      const fightDuration = getFightDuration(hero.level, zone.minLevel);
      const newProgress = dep.fightProgress + 1;

      if (newProgress >= fightDuration) {
        const target = zone.targets.find(t => t.id === dep.targetId);
        const isBossTime = target?.isSweep && dep.fightCount >= BOSS_EVERY_N_FIGHTS - 1;

        if (isBossTime) {
          // Boss fight - apply full wave multiplier
          const result = simulateBossFight(hero, dep.zoneId, dep.zoneTier, dep.waveMultiplier);

          const updatedHero = addHeroXp(hero, result.xpGained);
          useHeroStore.setState({ heroes: heroStore.heroes.map(h => h.id === hero.id ? updatedHero : h) });

          if (result.won) {
            const resources = { ...gameStore.resources };
            for (const r of result.resourceDrops) {
              resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
            }
            useGameStore.setState({ resources });

            if (result.gearDrop) {
              useEquipmentStore.setState(s => ({ inventory: [...s.inventory, result.gearDrop!] }));
              const rLabel = result.gearDrop.rarity.charAt(0).toUpperCase() + result.gearDrop.rarity.slice(1);
              gameStore.addLog(`BOSS DEFEATED! ${hero.name} got [${rLabel}] gear from ${result.enemyName}!`, 'levelup');
            } else {
              gameStore.addLog(`BOSS DEFEATED! ${hero.name} slew ${result.enemyName}!`, 'levelup');
            }

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

          if (result.heroDied) {
            gameStore.addLog(`${hero.name} was crushed by ${result.enemyName}! Recovering...`, 'error');
          }

          // Reset cycle: fightCount=0, waveMultiplier=1.0 after boss
          newDeployments.push({
            ...dep, fightProgress: 0, fightCount: 0, waveMultiplier: 1.0,
            totalKills: dep.totalKills + (result.won ? 1 : 0),
            bossKills: dep.bossKills + (result.won ? 1 : 0),
            recoveryCooldown: result.recoveryCooldown,
          });
        } else {
          // Normal fight - apply current wave multiplier
          const enemy = target?.enemy || zone.targets[0].enemy;
          const result = simulateFight(hero, enemy, dep.zoneTier, zone.minLevel, dep.waveMultiplier);

          const updatedHero = addHeroXp(hero, result.xpGained);
          useHeroStore.setState({ heroes: heroStore.heroes.map(h => h.id === hero.id ? updatedHero : h) });

          if (result.won) {
            const resources = { ...gameStore.resources };
            for (const r of result.resourceDrops) {
              resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
            }
            useGameStore.setState({ resources });
          }

          if (result.heroDied) {
            gameStore.addLog(`${hero.name} was defeated by ${result.enemyName}! Recovering...`, 'error');
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
            totalKills: dep.totalKills + (result.won ? 1 : 0),
            recoveryCooldown: result.recoveryCooldown,
          });
        }
      } else {
        newDeployments.push({ ...dep, fightProgress: newProgress });
      }
    }

    set({ deployments: newDeployments });
  },

  getSerializableState: () => ({
    deployments: get().deployments,
    tierUnlocks: get().tierUnlocks,
    bossKillCounts: get().bossKillCounts,
  }),

  loadState: (saved) => {
    set({
      deployments: saved.deployments.map(d => ({ ...d, waveMultiplier: d.waveMultiplier || 1.0 })),
      tierUnlocks: saved.tierUnlocks,
      bossKillCounts: saved.bossKillCounts,
    });
  },
}));
