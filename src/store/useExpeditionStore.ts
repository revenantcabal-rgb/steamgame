import { create } from 'zustand';
import { EXPEDITIONS, DIFFICULTY_SCALING } from '../config/expeditions';
import type { ExpeditionDifficulty } from '../config/expeditions';
import { addHeroXp, calculateDerivedStats, getEquippedGear } from '../engine/HeroEngine';
import { calculateAbilityContribution } from '../engine/IdleCombatEngine';
import { createGearInstance, rollBossDropRarity } from '../engine/LootEngine';
import { GEAR_TEMPLATES } from '../config/gear';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useEquipmentStore } from './useEquipmentStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useAuthStore } from './useAuthStore';

export type ExpeditionStatus = 'idle' | 'in_progress' | 'victory' | 'defeat';

export interface ActiveExpedition {
  expeditionId: string;
  difficulty: ExpeditionDifficulty;
  heroIds: string[];
  /** Current wave index (0-based) */
  currentWave: number;
  /** Current enemy index within the wave */
  currentEnemy: number;
  /** Fight progress ticks for current enemy */
  fightProgress: number;
  /** Per-hero HP remaining (heroId -> hp) */
  heroHp: Record<string, number>;
  /** Per-hero max HP (heroId -> maxHp) for the bar display */
  heroMaxHp: Record<string, number>;
  /** Per-hero SP remaining (heroId -> sp) */
  heroSp: Record<string, number>;
  /** Per-hero max SP (heroId -> maxSp) for the bar display */
  heroMaxSp: Record<string, number>;
  status: ExpeditionStatus;
  /** Log of what happened */
  battleLog: string[];
  /** Accumulated rewards */
  xpEarned: Record<string, number>;
  resourcesEarned: Record<string, number>;
  gearEarned: string[]; // instance IDs
}

interface ExpeditionState {
  active: ActiveExpedition | null;
  /** Cooldown per expedition (expeditionId -> timestamp when available) */
  cooldowns: Record<string, number>;
  /** Total completions per expedition+difficulty */
  completions: Record<string, number>;

  startExpedition: (expeditionId: string, difficulty: ExpeditionDifficulty, heroIds: string[]) => boolean;
  abandonExpedition: () => void;
  claimRewards: () => void;
  tick: () => void;

  getSerializableState: () => SerializedExpeditionState;
  loadState: (state: SerializedExpeditionState) => void;
}

export interface SerializedExpeditionState {
  active: ActiveExpedition | null;
  cooldowns: Record<string, number>;
  completions: Record<string, number>;
}

export const useExpeditionStore = create<ExpeditionState>((set, get) => ({
  active: null,
  cooldowns: {},
  completions: {},

  startExpedition: (expeditionId, difficulty, heroIds) => {
    const expedition = EXPEDITIONS[expeditionId];
    if (!expedition) return false;
    if (get().active) return false;
    if (heroIds.length === 0 || heroIds.length > expedition.maxPartySize) return false;

    const heroStore = useHeroStore.getState();
    const gameStore = useGameStore.getState();

    // Validate heroes exist and meet level requirement
    const heroes = heroIds
      .map(id => heroStore.heroes.find(h => h.id === id))
      .filter(Boolean) as ReturnType<typeof heroStore.heroes.find>[];

    if (heroes.length !== heroIds.length) return false;

    for (const hero of heroes) {
      if (!hero || hero.level < expedition.minLevel) {
        gameStore.addLog(`${hero?.name || 'Hero'} is too low level for ${expedition.name}.`, 'error');
        return false;
      }
    }

    // Calculate initial HP and SP for each hero
    const eqStore = useEquipmentStore.getState();
    const heroHp: Record<string, number> = {};
    const heroMaxHp: Record<string, number> = {};
    const heroSp: Record<string, number> = {};
    const heroMaxSp: Record<string, number> = {};
    for (const hero of heroes) {
      if (!hero) continue;
      const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
      const derived = calculateDerivedStats(hero, gear);
      heroHp[hero.id] = derived.maxHp;
      heroMaxHp[hero.id] = derived.maxHp;
      heroSp[hero.id] = derived.maxSp;
      heroMaxSp[hero.id] = derived.maxSp;
    }

    set({
      active: {
        expeditionId,
        difficulty,
        heroIds,
        currentWave: 0,
        currentEnemy: 0,
        fightProgress: 0,
        heroHp,
        heroMaxHp,
        heroSp,
        heroMaxSp,
        status: 'in_progress',
        battleLog: [`Expedition started: ${expedition.name} [${DIFFICULTY_SCALING[difficulty].name}]`],
        xpEarned: {},
        resourcesEarned: {},
        gearEarned: [],
      },
    });

    const names = heroes.map(h => h!.name).join(', ');
    gameStore.addLog(`Expedition launched: ${expedition.name} [${DIFFICULTY_SCALING[difficulty].name}] with ${names}.`, 'info');
    return true;
  },

  abandonExpedition: () => {
    const active = get().active;
    if (!active) return;
    set({ active: null });
    useGameStore.getState().addLog('Expedition abandoned.', 'error');
  },

  claimRewards: () => {
    const active = get().active;
    if (!active || active.status === 'in_progress') return;

    const heroStore = useHeroStore.getState();
    const gameStore = useGameStore.getState();

    // Apply XP
    const heroes = [...heroStore.heroes];
    for (const [heroId, xp] of Object.entries(active.xpEarned)) {
      const idx = heroes.findIndex(h => h.id === heroId);
      if (idx >= 0) {
        heroes[idx] = addHeroXp(heroes[idx], xp);
      }
    }
    useHeroStore.setState({ heroes });

    // Achievement: track max hero level after XP is applied
    const maxLevel = Math.max(0, ...heroes.map(h => h.level));
    if (maxLevel > 0) {
      useAchievementStore.getState().setMaxStat('maxHeroLevel', maxLevel);
    }

    // Apply resources
    if (active.status === 'victory') {
      const resources = { ...gameStore.resources };
      for (const [resId, qty] of Object.entries(active.resourcesEarned)) {
        resources[resId] = (resources[resId] || 0) + qty;
      }
      useGameStore.setState({ resources });

      // Track completion
      const key = `${active.expeditionId}:${active.difficulty}`;
      set(s => ({ completions: { ...s.completions, [key]: (s.completions[key] || 0) + 1 } }));
    }

    gameStore.addLog(
      active.status === 'victory'
        ? 'Expedition rewards claimed!'
        : 'Partial XP from expedition claimed.',
      'info',
    );

    set({ active: null });
  },

  tick: () => {
    const active = get().active;
    if (!active || active.status !== 'in_progress') return;

    const expedition = EXPEDITIONS[active.expeditionId];
    if (!expedition) return;

    const scaling = DIFFICULTY_SCALING[active.difficulty];
    const wave = expedition.waves[active.currentWave];
    if (!wave) return;

    const enemy = wave.enemies[active.currentEnemy];
    if (!enemy) return;

    const newProgress = active.fightProgress + 1;

    if (newProgress >= expedition.fightDuration) {
      // Fight resolves — all alive heroes attack this enemy
      const heroStore = useHeroStore.getState();
      const aliveHeroIds = active.heroIds.filter(id => (active.heroHp[id] || 0) > 0);

      if (aliveHeroIds.length === 0) {
        // Party wiped
        set({
          active: {
            ...active,
            status: 'defeat',
            battleLog: [...active.battleLog, 'All heroes have fallen. Expedition failed.'],
          },
        });
        useGameStore.getState().addLog(`Expedition failed: ${expedition.name}!`, 'error');
        return;
      }

      // Scaled enemy stats
      const scaledHp = Math.floor(enemy.hp * scaling.hpMult);
      const scaledDmg = Math.floor(enemy.damage * scaling.dmgMult);
      const scaledXp = Math.floor(enemy.xpReward * scaling.xpMult);

      // Each hero attacks — combined DPS vs enemy (with ability contributions)
      let totalPartyDps = 0;
      const heroResults: { heroId: string; dps: number; derived: ReturnType<typeof calculateDerivedStats> }[] = [];
      const eqStore = useEquipmentStore.getState();
      const newSp = { ...active.heroSp };

      for (const heroId of aliveHeroIds) {
        const hero = heroStore.heroes.find(h => h.id === heroId);
        if (!hero) continue;
        const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
        const derived = calculateDerivedStats(hero, gear);
        const attack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);

        // 1) Accuracy: hit rate caps at 100%
        const hitRate = Math.min(1, derived.accuracy / 100);

        // Crit multiplier
        const critMult = 1 + (derived.critChance / 100) * (derived.critDamage / 100 - 1);

        // 2) Armor penetration: enemies have ~10% base defense
        const enemyBaseDefense = 0.10;
        const effectiveEnemyDefense = enemyBaseDefense * Math.max(0, 1 - derived.armorPen / 100);

        // DPS with accuracy, crits, and armor pen
        let dps = attack * hitRate * critMult * (1 - effectiveEnemyDefense);

        // 3) DoT bonus: burn and poison add % of attack as extra DPS
        dps += attack * (derived.burnDot / 100 + derived.poisonDot / 100);

        // Factor in ability contributions using current SP
        const currentSp = newSp[heroId] ?? derived.maxSp;
        if (currentSp > 0 && hero.equippedAbilities?.some(a => a != null)) {
          const fightEstimate = Math.max(2, Math.ceil(scaledHp / Math.max(1, dps * aliveHeroIds.length)));
          const abilityContrib = calculateAbilityContribution(hero, { ...derived, maxSp: currentSp }, fightEstimate);
          dps += abilityContrib.bonusDps;

          // Apply buff stat modifiers from abilities
          if (abilityContrib.statModifiers.meleeAttack) dps += abilityContrib.statModifiers.meleeAttack / 100 * attack * hitRate * critMult;
          if (abilityContrib.statModifiers.rangedAttack) dps += abilityContrib.statModifiers.rangedAttack / 100 * attack * hitRate * critMult;
          if (abilityContrib.statModifiers.blastAttack) dps += abilityContrib.statModifiers.blastAttack / 100 * attack * hitRate * critMult;

          // 7) Deduct actual SP used by abilities
          newSp[heroId] = Math.max(0, currentSp - abilityContrib.spUsed);
        }

        totalPartyDps += dps;
        heroResults.push({ heroId, dps, derived });
      }

      // How many rounds to kill the enemy (party combined DPS)
      let roundsToKill = Math.max(1, Math.ceil(scaledHp / Math.max(1, totalPartyDps)));

      // 5) Thorns: reflect damage reduces effective enemy HP
      const avgThorns = heroResults.reduce((s, h) => s + h.derived.thornsDamage, 0) / heroResults.length;
      const estimatedDmg = scaledDmg * roundsToKill;
      const thornsDmg = estimatedDmg * (avgThorns / 100);
      const effectiveEnemyHp = Math.max(1, scaledHp - thornsDmg);
      roundsToKill = Math.max(1, Math.ceil(effectiveEnemyHp / Math.max(1, totalPartyDps)));

      // 4) Turn speed & frost slow: adjust effective enemy rounds
      const avgTurnSpeed = heroResults.reduce((s, h) => s + h.derived.turnSpeed, 0) / heroResults.length;
      const avgFrostSlow = heroResults.reduce((s, h) => s + h.derived.frostSlow, 0) / heroResults.length;
      const speedRatio = Math.max(0.5, avgTurnSpeed / (100 + avgFrostSlow));
      const effectiveEnemyRounds = Math.max(1, Math.ceil(roundsToKill / speedRatio));

      // Enemy deals damage each round, spread across alive heroes
      // Damage is distributed weighted by inverse of evasion (tankier heroes draw more)
      const newHp = { ...active.heroHp };
      const newLog = [...active.battleLog];
      const newXp = { ...active.xpEarned };
      const newResources = { ...active.resourcesEarned };

      // Each hero takes (scaledDmg * effectiveEnemyRounds / aliveCount) reduced by their defense stats
      for (const { heroId, dps, derived } of heroResults) {
        const evasionReduction = 1 - Math.min(0.5, derived.evasion / 100);
        const defenseReduction = Math.max(0.2, 1 - derived.defense / (derived.defense + 200));
        const blockReduction = 1 - (derived.blockChance / 100) * 0.5;
        const drReduction = 1 - derived.damageReduction / 100;
        const damageTaken = Math.floor(scaledDmg * effectiveEnemyRounds * evasionReduction * defenseReduction * blockReduction * drReduction / aliveHeroIds.length);
        const lifestealHealing = Math.floor(dps * roundsToKill * (derived.lifesteal / 100));
        newHp[heroId] = Math.max(0, (newHp[heroId] || 0) - damageTaken + lifestealHealing);

        // HP regen between fights
        if (newHp[heroId] > 0) {
          newHp[heroId] = Math.min(active.heroMaxHp[heroId] || derived.maxHp, newHp[heroId] + Math.floor(derived.hpRegen * 3));
          // SP regen between fights
          newSp[heroId] = Math.min(active.heroMaxSp[heroId] || derived.maxSp, (newSp[heroId] ?? derived.maxSp) + Math.floor(derived.spRegen * 3));
        }
      }

      // Check if party killed the enemy
      const partyWon = totalPartyDps * roundsToKill >= scaledHp * 0.8; // Some forgiveness

      if (partyWon) {
        newLog.push(`${wave.name}: Party defeated ${enemy.name}!`);

        // XP to all alive heroes
        const xpPerHero = Math.floor(scaledXp / aliveHeroIds.length);
        for (const heroId of aliveHeroIds) {
          newXp[heroId] = (newXp[heroId] || 0) + xpPerHero;
        }

        // 6) Resource drops with dropChance bonus
        const avgDropBonus = heroResults.reduce((s, h) => s + h.derived.dropChance, 0) / heroResults.length;
        for (const drop of enemy.resourceDrops) {
          if (Math.random() < drop.chance * scaling.lootMult * (1 + avgDropBonus / 100)) {
            const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
            newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + qty;
          }
        }

        // Check for downed heroes
        for (const heroId of aliveHeroIds) {
          if (newHp[heroId] <= 0) {
            const hero = heroStore.heroes.find(h => h.id === heroId);
            newLog.push(`${hero?.name || 'Hero'} has fallen!`);
          }
        }

        // Advance to next enemy or next wave
        let nextEnemy = active.currentEnemy + 1;
        let nextWave = active.currentWave;

        if (nextEnemy >= wave.enemies.length) {
          // Wave complete
          nextWave++;
          nextEnemy = 0;
          newLog.push(`--- Wave ${active.currentWave + 1} complete! ---`);

          // Between waves: regenerate SP (5 turns worth of spRegen)
          for (const { heroId, derived } of heroResults) {
            if ((newHp[heroId] || 0) > 0) {
              newSp[heroId] = Math.min(
                active.heroMaxSp[heroId] || derived.maxSp,
                (newSp[heroId] ?? derived.maxSp) + Math.floor(derived.spRegen * 5),
              );
            }
          }

          if (nextWave >= expedition.waves.length) {
            // Expedition complete!
            newLog.push(`VICTORY! ${expedition.name} conquered!`);

            // Completion rewards
            for (const reward of expedition.completionRewards) {
              const qty = Math.floor(Math.random() * (reward.maxQty - reward.minQty + 1)) + reward.minQty;
              const scaledQty = Math.floor(qty * scaling.lootMult);
              newResources[reward.resourceId] = (newResources[reward.resourceId] || 0) + scaledQty;
            }

            // Gear drop from boss
            const gearEarned = [...active.gearEarned];
            if (expedition.rewardPool.length > 0) {
              const templateId = expedition.rewardPool[Math.floor(Math.random() * expedition.rewardPool.length)];
              if (GEAR_TEMPLATES[templateId]) {
                const tierForRarity = active.difficulty === 'extreme' ? 4 : active.difficulty === 'hard' ? 3 : 1;
                const rarity = rollBossDropRarity(tierForRarity);
                const gearInstance = createGearInstance(templateId, 'salvaged', rarity);
                useEquipmentStore.setState(s => ({ inventory: [...s.inventory, gearInstance] }));
                gearEarned.push(gearInstance.instanceId);
                const rLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
                newLog.push(`Loot: [${rLabel}] ${GEAR_TEMPLATES[templateId].name}!`);

                // Anti-cheat: log expedition reward
                if (gearInstance) {
                  const actorId = useAuthStore.getState().user?.id || 'system';
                  useAnticheatStore.getState().logItemEvent(gearInstance.gameId, 'expedition_reward', actorId, undefined, 1, { templateId, rarity, expeditionId: active.expeditionId });
                }
              }
            }

            useGameStore.getState().addLog(`EXPEDITION COMPLETE: ${expedition.name} [${scaling.name}]!`, 'levelup');

            // Story: expedition complete
            useStoryStore.getState().checkObjective('complete_expedition', active.difficulty, 1);

            // Achievement: track expedition completion
            const achStore = useAchievementStore.getState();
            achStore.incrementStat('expeditionsCompleted');
            if (active.difficulty === 'hard' || active.difficulty === 'extreme') {
              achStore.incrementStat('expeditionsHard');
            }
            if (active.difficulty === 'extreme') {
              achStore.incrementStat('expeditionsExtreme');
            }

            set({
              active: {
                ...active,
                status: 'victory',
                heroHp: newHp,
                heroSp: newSp,
                battleLog: newLog,
                xpEarned: newXp,
                resourcesEarned: newResources,
                gearEarned,
                currentWave: nextWave,
                currentEnemy: nextEnemy,
                fightProgress: 0,
              },
            });
            return;
          }
        }

        // Check if all heroes are dead after this fight
        const stillAlive = active.heroIds.some(id => (newHp[id] || 0) > 0);
        if (!stillAlive) {
          newLog.push('All heroes have fallen. Expedition failed.');
          useGameStore.getState().addLog(`Expedition failed: ${expedition.name}!`, 'error');
          set({
            active: {
              ...active,
              status: 'defeat',
              heroHp: newHp,
              heroSp: newSp,
              battleLog: newLog,
              xpEarned: newXp,
              resourcesEarned: newResources,
              currentWave: nextWave,
              currentEnemy: nextEnemy,
              fightProgress: 0,
            },
          });
          return;
        }

        set({
          active: {
            ...active,
            heroHp: newHp,
            heroSp: newSp,
            battleLog: newLog,
            xpEarned: newXp,
            resourcesEarned: newResources,
            currentWave: nextWave,
            currentEnemy: nextEnemy,
            fightProgress: 0,
          },
        });
      } else {
        // Party failed to kill the enemy — party wipe on this enemy
        newLog.push(`${enemy.name} overwhelmed the party!`);
        for (const heroId of aliveHeroIds) {
          newHp[heroId] = 0;
        }
        newLog.push('All heroes have fallen. Expedition failed.');
        useGameStore.getState().addLog(`Expedition failed: ${expedition.name}!`, 'error');

        set({
          active: {
            ...active,
            status: 'defeat',
            heroHp: newHp,
            heroSp: newSp,
            battleLog: newLog,
            xpEarned: newXp,
            resourcesEarned: newResources,
            fightProgress: 0,
          },
        });
      }
    } else {
      // Just tick the fight progress
      set({ active: { ...active, fightProgress: newProgress } });
    }
  },

  getSerializableState: () => ({
    active: get().active,
    cooldowns: get().cooldowns,
    completions: get().completions,
  }),

  loadState: (saved) => {
    set({
      active: saved.active,
      cooldowns: saved.cooldowns || {},
      completions: saved.completions || {},
    });
  },
}));
