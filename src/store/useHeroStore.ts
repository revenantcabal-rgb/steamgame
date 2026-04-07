import { create } from 'zustand';
import { recruitHero, allocateStatPoint, calculateDerivedStats, getEquippedGear, getTotalStats } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useEquipmentStore } from './useEquipmentStore';
import type { Hero, PrimaryStats } from '../types/hero';
import { CLASSES } from '../config/classes';
import { ABILITIES } from '../config/abilities';
import { CONSUMABLES } from '../config/consumables';
import { getPremiumBonuses } from '../engine/PremiumBonuses';

/** Equippable combat skill items with rank 1-5 (found as drops, upgraded via duplicates) */
export interface OwnedSkillItem {
  skillId: string;
  rank: number;       // 1-5
  duplicates: number; // duplicates collected toward next rank
}

/** Duplicates needed per rank: Rank 2=3, Rank 3=8, Rank 4=25, Rank 5=84 */
const RANK_UPGRADE_COST = [0, 0, 3, 8, 25, 84];

interface HeroState {
  heroes: Hero[];
  selectedHeroId: string | null;
  ownedAbilities: string[];
  ownedSkillItems: OwnedSkillItem[];

  recruit: (classId: string, isFree?: boolean) => Hero | null;
  dismissHero: (heroId: string) => void;
  selectHero: (heroId: string | null) => void;
  allocateStat: (heroId: string, stat: keyof PrimaryStats) => void;
  allocateMultiple: (heroId: string, stat: keyof PrimaryStats, count: number) => void;

  equipAbility: (heroId: string, slotIndex: number, abilityId: string) => boolean;
  unequipAbility: (heroId: string, slotIndex: number) => void;
  equipDecree: (heroId: string, abilityId: string) => boolean;
  unequipDecree: (heroId: string) => void;
  addOwnedAbility: (abilityId: string) => void;
  removeOwnedAbility: (abilityId: string) => void;

  equipConsumable: (heroId: string, slotIndex: number, consumableId: string) => boolean;
  unequipConsumable: (heroId: string, slotIndex: number) => void;

  /** Add a skill item drop (or add duplicate if already owned) */
  addSkillItem: (skillId: string) => void;
  /** Attempt to upgrade a skill item to the next rank using collected duplicates */
  upgradeSkillRank: (skillId: string) => boolean;

  getSerializableState: () => SerializedHeroState;
  loadState: (state: SerializedHeroState) => void;
}

export interface SerializedHeroState {
  heroes: Hero[];
  ownedAbilities?: string[];
  ownedSkillItems?: OwnedSkillItem[];
}

export const useHeroStore = create<HeroState>((set, get) => ({
  heroes: [],
  selectedHeroId: null,
  ownedAbilities: ['o_thick_skin', 'r_crushing_blow', 'g_quick_shot', 'w_first_aid'],
  ownedSkillItems: [],

  recruit: (classId, isFree) => {
    const gameStore = useGameStore.getState();
    const state = get();

    // Non-free recruits require hero_recruitment to be unlocked (except first hero)
    if (!isFree && state.heroes.length > 0) {
      const storyStore = useStoryStore.getState();
      if (!storyStore.isFeatureUnlocked('hero_recruitment')) {
        gameStore.addLog('Hero recruitment is locked. Complete Story 3 to unlock.', 'error');
        return null;
      }

      // Deduct WC cost
      const cost = Math.max(100, Math.floor(500 * (1 + state.heroes.length * 0.5) * getPremiumBonuses().heroRecruitCostMultiplier));
      const currentWC = gameStore.resources['wasteland_credits'] || 0;
      if (currentWC < cost) {
        gameStore.addLog(`Not enough WC to recruit. Need ${cost} WC.`, 'error');
        return null;
      }
      const newResources = { ...gameStore.resources };
      newResources['wasteland_credits'] = currentWC - cost;
      useGameStore.setState({ resources: newResources });
    }

    const hero = recruitHero(classId);
    if (!hero) return null;

    set(s => ({ heroes: [...s.heroes, hero] }));

    const classDef = CLASSES[classId];
    gameStore.addLog(
      `Recruited ${hero.name}, a ${classDef?.name || classId}!`,
      'system',
    );

    // Achievement: track hero count
    const achStore = useAchievementStore.getState();
    achStore.setMaxStat('heroCount', get().heroes.length);

    // Story: recruit hero
    useStoryStore.getState().checkObjective('recruit_hero', classId, get().heroes.length);

    return hero;
  },

  dismissHero: (heroId) => {
    const hero = get().heroes.find(h => h.id === heroId);
    if (!hero) return;

    set(state => ({
      heroes: state.heroes.filter(h => h.id !== heroId),
      selectedHeroId: state.selectedHeroId === heroId ? null : state.selectedHeroId,
    }));

    const gameStore = useGameStore.getState();
    gameStore.addLog(`Dismissed ${hero.name}.`, 'system');
  },

  selectHero: (heroId) => {
    set({ selectedHeroId: heroId });
  },

  allocateStat: (heroId, stat) => {
    set(state => ({
      heroes: state.heroes.map(h => {
        if (h.id !== heroId) return h;
        const updated = allocateStatPoint(h, stat);
        return updated || h;
      }),
    }));
  },

  allocateMultiple: (heroId, stat, count) => {
    set(state => ({
      heroes: state.heroes.map(h => {
        if (h.id !== heroId) return h;
        let current = h;
        for (let i = 0; i < count; i++) {
          const updated = allocateStatPoint(current, stat);
          if (!updated) break;
          current = updated;
        }
        return current;
      }),
    }));
  },

  equipAbility: (heroId, slotIndex, abilityId) => {
    const state = get();
    const hero = state.heroes.find(h => h.id === heroId);
    if (!hero) return false;

    const ability = ABILITIES[abilityId];
    if (!ability) return false;

    // Must be owned
    if (!state.ownedAbilities.includes(abilityId)) return false;

    // Check slot is valid (0-3)
    if (slotIndex < 0 || slotIndex > 3) return false;

    // Check slot is unlocked
    const eqStore = useEquipmentStore.getState();
    const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
    const derived = calculateDerivedStats(hero, gear);
    if (slotIndex >= derived.abilitySlots) return false;

    // Must not be a decree (those use the decree slot)
    if (ability.isDecree) return false;

    // Check stat requirements
    const totalStats = getTotalStats(hero);
    for (const req of ability.requirements) {
      const statKey = req.stat as keyof PrimaryStats;
      if ((totalStats[statKey] || 0) < req.value) return false;
    }

    // Check ability isn't equipped on another hero
    for (const h of state.heroes) {
      if (h.id === heroId) continue;
      const equipped = h.equippedAbilities || [null, null, null, null];
      if (equipped.includes(abilityId)) return false;
      if (h.equippedDecree === abilityId) return false;
    }

    set(s => ({
      heroes: s.heroes.map(h => {
        if (h.id !== heroId) return h;
        const newAbilities = [...(h.equippedAbilities || [null, null, null, null])];
        newAbilities[slotIndex] = abilityId;
        return { ...h, equippedAbilities: newAbilities };
      }),
    }));

    // Story: count total equipped abilities across all heroes
    const totalEquipped = get().heroes.reduce((sum, h) => {
      return sum + (h.equippedAbilities || []).filter(a => a != null).length;
    }, 0);
    useStoryStore.getState().checkObjective('equip_ability', 'any', totalEquipped);

    return true;
  },

  unequipAbility: (heroId, slotIndex) => {
    set(s => ({
      heroes: s.heroes.map(h => {
        if (h.id !== heroId) return h;
        const newAbilities = [...(h.equippedAbilities || [null, null, null, null])];
        newAbilities[slotIndex] = null;
        return { ...h, equippedAbilities: newAbilities };
      }),
    }));
  },

  equipDecree: (heroId, abilityId) => {
    const state = get();
    const hero = state.heroes.find(h => h.id === heroId);
    if (!hero) return false;

    const ability = ABILITIES[abilityId];
    if (!ability || !ability.isDecree) return false;

    // Must be owned
    if (!state.ownedAbilities.includes(abilityId)) return false;

    // Check canEquipAura (RES >= 50)
    const eqStore = useEquipmentStore.getState();
    const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
    const derived = calculateDerivedStats(hero, gear);
    if (!derived.canEquipAura) return false;

    // Check stat requirements
    const totalStats = getTotalStats(hero);
    for (const req of ability.requirements) {
      const statKey = req.stat as keyof PrimaryStats;
      if ((totalStats[statKey] || 0) < req.value) return false;
    }

    // Check not equipped on another hero
    for (const h of state.heroes) {
      if (h.id === heroId) continue;
      const equipped = h.equippedAbilities || [null, null, null, null];
      if (equipped.includes(abilityId)) return false;
      if (h.equippedDecree === abilityId) return false;
    }

    set(s => ({
      heroes: s.heroes.map(h => {
        if (h.id !== heroId) return h;
        return { ...h, equippedDecree: abilityId };
      }),
    }));
    return true;
  },

  unequipDecree: (heroId) => {
    set(s => ({
      heroes: s.heroes.map(h => {
        if (h.id !== heroId) return h;
        return { ...h, equippedDecree: null };
      }),
    }));
  },

  addOwnedAbility: (abilityId) => {
    set(s => {
      if (s.ownedAbilities.includes(abilityId)) return s;
      return { ownedAbilities: [...s.ownedAbilities, abilityId] };
    });
  },

  removeOwnedAbility: (abilityId) => {
    set(s => ({
      ownedAbilities: s.ownedAbilities.filter(id => id !== abilityId),
    }));
  },

  equipConsumable: (heroId, slotIndex, consumableId) => {
    const state = get();
    const hero = state.heroes.find(h => h.id === heroId);
    if (!hero) return false;

    // Validate consumable exists
    const consumable = CONSUMABLES[consumableId];
    if (!consumable) return false;

    // Validate player has this consumable in resources
    const gameStore = useGameStore.getState();
    const qty = gameStore.resources[consumableId] || 0;
    if (qty <= 0) return false;

    // Validate slot is within allowed range
    const eqStore = useEquipmentStore.getState();
    const gear = getEquippedGear(hero.id, eqStore.heroEquipment, eqStore.inventory);
    const derived = calculateDerivedStats(hero, gear);
    if (slotIndex < 0 || slotIndex >= derived.consumableSlots) return false;

    set(s => ({
      heroes: s.heroes.map(h => {
        if (h.id !== heroId) return h;
        const newConsumables = [...(h.equippedConsumables || [null])];
        // Extend array if needed
        while (newConsumables.length <= slotIndex) newConsumables.push(null);
        newConsumables[slotIndex] = consumableId;
        return { ...h, equippedConsumables: newConsumables };
      }),
    }));

    return true;
  },

  unequipConsumable: (heroId, slotIndex) => {
    set(s => ({
      heroes: s.heroes.map(h => {
        if (h.id !== heroId) return h;
        const newConsumables = [...(h.equippedConsumables || [null])];
        if (slotIndex >= 0 && slotIndex < newConsumables.length) {
          newConsumables[slotIndex] = null;
        }
        return { ...h, equippedConsumables: newConsumables };
      }),
    }));
  },

  addSkillItem: (skillId) => {
    const state = get();
    const existing = state.ownedSkillItems.find(s => s.skillId === skillId);
    const gameStore = useGameStore.getState();

    if (existing) {
      // Already owned — add as duplicate
      set({
        ownedSkillItems: state.ownedSkillItems.map(s =>
          s.skillId === skillId ? { ...s, duplicates: s.duplicates + 1 } : s
        ),
      });
      const nextRankCost = RANK_UPGRADE_COST[existing.rank + 1] || Infinity;
      const newDupes = existing.duplicates + 1;
      gameStore.addLog(
        `Skill duplicate: ${skillId} (${newDupes}/${nextRankCost} to Rank ${existing.rank + 1})`,
        'drop',
      );
    } else {
      // New skill item at Rank 1
      set({
        ownedSkillItems: [...state.ownedSkillItems, { skillId, rank: 1, duplicates: 0 }],
      });
      gameStore.addLog(`New combat skill found: ${skillId} (Rank 1)!`, 'levelup');
    }
  },

  upgradeSkillRank: (skillId) => {
    const state = get();
    const item = state.ownedSkillItems.find(s => s.skillId === skillId);
    if (!item) return false;

    if (item.rank >= 5) {
      useGameStore.getState().addLog(`${skillId} is already at maximum Rank 5.`, 'error');
      return false;
    }

    const cost = RANK_UPGRADE_COST[item.rank + 1];
    if (item.duplicates < cost) {
      useGameStore.getState().addLog(
        `Need ${cost} duplicates to upgrade ${skillId} to Rank ${item.rank + 1} (have ${item.duplicates}).`,
        'error',
      );
      return false;
    }

    set({
      ownedSkillItems: state.ownedSkillItems.map(s =>
        s.skillId === skillId
          ? { ...s, rank: s.rank + 1, duplicates: s.duplicates - cost }
          : s
      ),
    });
    useGameStore.getState().addLog(`Skill upgraded! ${skillId} is now Rank ${item.rank + 1}!`, 'levelup');
    return true;
  },

  getSerializableState: () => ({ heroes: get().heroes, ownedAbilities: get().ownedAbilities, ownedSkillItems: get().ownedSkillItems }),

  loadState: (saved) => {
    // Migrate legacy heroes missing RES stat and ability fields
    const migratedHeroes = saved.heroes.map(h => ({
      ...h,
      baseStats: { ...h.baseStats, res: h.baseStats.res ?? Math.floor(Math.random() * 6) + 3 },
      allocatedStats: { ...h.allocatedStats, res: h.allocatedStats.res ?? 0 },
      equippedAbilities: h.equippedAbilities || [null, null, null, null],
      equippedDecree: h.equippedDecree ?? null,
      equippedConsumables: h.equippedConsumables || [null],
    }));
    const ownedAbilities = saved.ownedAbilities || ['o_thick_skin', 'r_crushing_blow', 'g_quick_shot'];
    const ownedSkillItems = saved.ownedSkillItems || [];
    set({ heroes: migratedHeroes, selectedHeroId: null, ownedAbilities, ownedSkillItems });
  },
}));
