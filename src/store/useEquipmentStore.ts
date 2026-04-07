import { create } from 'zustand';
import { GEAR_TEMPLATES } from '../config/gear';
import { craftGear } from '../engine/LootEngine';
import { getTotalStats } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCombatZoneStore } from './useCombatZoneStore';
import type { GearInstance, HeroEquipment, EquipmentSlot } from '../types/equipment';
import { getCraftTime } from '../types/equipment';

interface ActiveCraft {
  templateId: string;
  craftSkillLevel: number;
  progress: number;  // seconds elapsed
  duration: number;  // total seconds needed
}

interface EquipmentState {
  /** All gear instances owned by the player */
  inventory: GearInstance[];
  /** Per-hero equipment (heroId -> equipped gear instance IDs) */
  heroEquipment: Record<string, HeroEquipment>;
  /** Currently in-progress craft (null if idle) */
  activeCraft: ActiveCraft | null;

  craftItem: (templateId: string, craftSkillLevel: number) => GearInstance | null;
  startCraft: (templateId: string, craftSkillLevel: number) => boolean;
  cancelCraft: () => void;
  tickCraft: () => void;
  equipItem: (heroId: string, slot: EquipmentSlot, instanceId: string) => boolean;
  unequipItem: (heroId: string, slot: EquipmentSlot) => void;
  discardItem: (instanceId: string) => void;

  getSerializableState: () => SerializedEquipmentState;
  loadState: (state: SerializedEquipmentState) => void;
}

export interface SerializedEquipmentState {
  inventory: GearInstance[];
  heroEquipment: Record<string, HeroEquipment>;
  activeCraft?: ActiveCraft | null;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  inventory: [],
  heroEquipment: {},
  activeCraft: null,

  // startCraft: validates, consumes resources, starts the timer
  startCraft: (templateId, craftSkillLevel) => {
    const state = get();
    if (state.activeCraft) {
      useGameStore.getState().addLog('Already crafting something. Wait for it to finish.', 'error');
      return false;
    }

    const template = GEAR_TEMPLATES[templateId];
    if (!template) return false;

    const gameStore = useGameStore.getState();

    // Check previous tier gear requirement (gear chaining)
    let prevTierGearIdx = -1;
    if (template.requiresPreviousTier) {
      prevTierGearIdx = state.inventory.findIndex(g => {
        if (g.templateId !== template.requiresPreviousTier) return false;
        for (const eq of Object.values(state.heroEquipment)) {
          for (const slotVal of Object.values(eq)) {
            if (slotVal === g.instanceId) return false;
          }
        }
        return true;
      });
      if (prevTierGearIdx === -1) {
        const prevTemplate = GEAR_TEMPLATES[template.requiresPreviousTier];
        gameStore.addLog(`Need a ${prevTemplate?.name || template.requiresPreviousTier} (unequipped) to forge ${template.name}.`, 'error');
        return false;
      }
    }

    // Check resources
    const resources = { ...gameStore.resources };
    for (const input of template.craftingInputs) {
      if ((resources[input.resourceId] || 0) < input.quantity) {
        gameStore.addLog(`Not enough ${input.resourceId.replace(/_/g, ' ')} to craft ${template.name}.`, 'error');
        return false;
      }
    }

    // Consume resources upfront
    for (const input of template.craftingInputs) {
      resources[input.resourceId] -= input.quantity;
    }
    useGameStore.setState({ resources });

    // Consume previous tier gear (gear chaining)
    let newInventory = [...state.inventory];
    if (prevTierGearIdx >= 0) {
      newInventory.splice(prevTierGearIdx, 1);
    }

    const duration = getCraftTime(template);
    gameStore.addLog(`Started crafting ${template.name} (${duration}s)...`, 'info');

    set({
      inventory: newInventory,
      activeCraft: { templateId, craftSkillLevel, progress: 0, duration },
    });
    return true;
  },

  cancelCraft: () => {
    const state = get();
    if (!state.activeCraft) return;
    const template = GEAR_TEMPLATES[state.activeCraft.templateId];
    useGameStore.getState().addLog(`Cancelled crafting ${template?.name || 'item'}. Resources were already consumed.`, 'info');
    set({ activeCraft: null });
  },

  tickCraft: () => {
    const state = get();
    if (!state.activeCraft) return;

    const newProgress = state.activeCraft.progress + 1;
    if (newProgress >= state.activeCraft.duration) {
      // Craft complete — produce the item
      const gear = craftGear(state.activeCraft.templateId, state.activeCraft.craftSkillLevel);
      if (gear) {
        const template = GEAR_TEMPLATES[state.activeCraft.templateId];
        const rarityLabel = gear.rarity.charAt(0).toUpperCase() + gear.rarity.slice(1);
        const facetPrefix = gear.facet ? `${gear.facet.name} ` : '';
        useGameStore.getState().addLog(
          `Crafted [${rarityLabel}] ${facetPrefix}${template?.name || 'item'}!`,
          gear.rarity === 'plague' || gear.rarity === 'unique' ? 'levelup' : 'info',
        );

        // Anti-cheat + achievements
        const actorId = useAuthStore.getState().user?.id || 'system';
        useAnticheatStore.getState().logItemEvent(gear.gameId, 'craft', actorId, undefined, 1, { templateId: state.activeCraft.templateId, rarity: gear.rarity });
        useAchievementStore.getState().incrementStat('gearCrafted');

        set(s => ({
          inventory: [...s.inventory, gear],
          activeCraft: null,
        }));
      } else {
        set({ activeCraft: null });
      }
    } else {
      set(s => ({
        activeCraft: s.activeCraft ? { ...s.activeCraft, progress: newProgress } : null,
      }));
    }
  },

  craftItem: (templateId, craftSkillLevel) => {
    const template = GEAR_TEMPLATES[templateId];
    if (!template) return null;

    const gameStore = useGameStore.getState();
    const state = get();

    // Check previous tier gear requirement (gear chaining)
    let prevTierGearIdx = -1;
    if (template.requiresPreviousTier) {
      prevTierGearIdx = state.inventory.findIndex(g => {
        if (g.templateId !== template.requiresPreviousTier) return false;
        // Must not be equipped by any hero
        for (const eq of Object.values(state.heroEquipment)) {
          for (const slotVal of Object.values(eq)) {
            if (slotVal === g.instanceId) return false;
          }
        }
        return true;
      });
      if (prevTierGearIdx === -1) {
        const prevTemplate = GEAR_TEMPLATES[template.requiresPreviousTier];
        gameStore.addLog(`Need a ${prevTemplate?.name || template.requiresPreviousTier} (unequipped) to forge ${template.name}.`, 'error');
        return null;
      }
    }

    // Check resources
    const resources = { ...gameStore.resources };
    for (const input of template.craftingInputs) {
      if ((resources[input.resourceId] || 0) < input.quantity) {
        gameStore.addLog(`Not enough ${input.resourceId.replace(/_/g, ' ')} to craft ${template.name}.`, 'error');
        return null;
      }
    }

    // Consume resources
    for (const input of template.craftingInputs) {
      resources[input.resourceId] -= input.quantity;
    }
    useGameStore.setState({ resources });

    // Consume previous tier gear (gear chaining)
    let newInventory = [...state.inventory];
    if (prevTierGearIdx >= 0) {
      newInventory.splice(prevTierGearIdx, 1);
    }

    // Create the item
    const gear = craftGear(templateId, craftSkillLevel);
    if (!gear) return null;

    newInventory.push(gear);
    set({ inventory: newInventory });

    const rarityLabel = gear.rarity.charAt(0).toUpperCase() + gear.rarity.slice(1);
    const facetPrefix = gear.facet ? `${gear.facet.name} ` : '';
    gameStore.addLog(
      `Crafted [${rarityLabel}] ${facetPrefix}${template.name}!`,
      gear.rarity === 'plague' ? 'levelup' : gear.rarity === 'unique' ? 'levelup' : 'info',
    );

    // Anti-cheat: log craft event
    const actorId = useAuthStore.getState().user?.id || 'system';
    useAnticheatStore.getState().logItemEvent(gear.gameId, 'craft', actorId, undefined, 1, { templateId, rarity: gear.rarity });

    // Achievement: track gear crafted
    useAchievementStore.getState().incrementStat('gearCrafted');

    return gear;
  },

  equipItem: (heroId, slot, instanceId) => {
    const state = get();
    const gear = state.inventory.find(g => g.instanceId === instanceId);
    if (!gear) return false;

    const template = GEAR_TEMPLATES[gear.templateId];
    if (!template) return false;

    // Check stat requirements
    const hero = useHeroStore.getState().heroes.find(h => h.id === heroId);
    if (!hero) return false;

    // Block equipment changes while hero is deployed in combat
    if (useCombatZoneStore.getState().isHeroDeployed(heroId)) {
      useGameStore.getState().addLog(`${hero.name} is deployed in combat — recall first to change equipment.`, 'error');
      return false;
    }

    const totalStats = getTotalStats(hero);
    for (const req of template.statRequirements) {
      if (totalStats[req.stat] < req.value) {
        useGameStore.getState().addLog(
          `${hero.name} needs ${req.value} ${req.stat.toUpperCase()} to equip ${template.name} (has ${totalStats[req.stat]}).`,
          'error',
        );
        return false;
      }
    }

    // Check 2-handed weapon blocking off-hand
    if (slot === 'off_hand') {
      const heroGear = state.heroEquipment[heroId];
      if (heroGear?.main_hand) {
        const mainHandGear = state.inventory.find(g => g.instanceId === heroGear.main_hand);
        if (mainHandGear) {
          const mainTemplate = GEAR_TEMPLATES[mainHandGear.templateId];
          if (mainTemplate?.isTwoHanded) {
            useGameStore.getState().addLog('Cannot equip off-hand: main hand is a two-handed weapon.', 'error');
            return false;
          }
        }
      }
    }

    // If equipping 2H weapon, unequip off-hand
    if (slot === 'main_hand' && template.isTwoHanded) {
      const heroGear = state.heroEquipment[heroId];
      if (heroGear?.off_hand) {
        // Move off-hand back to inventory (it stays in inventory, just unlink)
        set(state => ({
          heroEquipment: {
            ...state.heroEquipment,
            [heroId]: { ...(state.heroEquipment[heroId] || createEmptyEquipment()), off_hand: null },
          },
        }));
      }
    }

    // Unequip current item in that slot (if any) - it stays in inventory
    set(state => ({
      heroEquipment: {
        ...state.heroEquipment,
        [heroId]: {
          ...(state.heroEquipment[heroId] || createEmptyEquipment()),
          [slot]: instanceId,
        },
      },
    }));

    // Story: count equipped slots for this hero
    const updatedEquip = get().heroEquipment[heroId];
    if (updatedEquip) {
      const filledSlots = Object.values(updatedEquip).filter(v => v != null).length;
      useStoryStore.getState().checkObjective('equip', slot, filledSlots);
    }

    return true;
  },

  unequipItem: (heroId, slot) => {
    // Block equipment changes while hero is deployed in combat
    if (useCombatZoneStore.getState().isHeroDeployed(heroId)) {
      const hero = useHeroStore.getState().heroes.find(h => h.id === heroId);
      useGameStore.getState().addLog(`${hero?.name || 'Hero'} is deployed in combat — recall first to change equipment.`, 'error');
      return;
    }

    set(state => ({
      heroEquipment: {
        ...state.heroEquipment,
        [heroId]: {
          ...(state.heroEquipment[heroId] || createEmptyEquipment()),
          [slot]: null,
        },
      },
    }));
  },

  discardItem: (instanceId) => {
    // Check not equipped by any hero
    const state = get();
    for (const [, equipment] of Object.entries(state.heroEquipment)) {
      for (const slotValue of Object.values(equipment)) {
        if (slotValue === instanceId) {
          useGameStore.getState().addLog('Cannot discard equipped item. Unequip it first.', 'error');
          return;
        }
      }
    }

    // Anti-cheat: log discard event before removing
    const gear = state.inventory.find(g => g.instanceId === instanceId);
    if (gear) {
      const actorId = useAuthStore.getState().user?.id || 'system';
      useAnticheatStore.getState().logItemEvent(gear.gameId, 'discard', actorId, undefined, 1, { templateId: gear.templateId });
    }

    set(state => ({
      inventory: state.inventory.filter(g => g.instanceId !== instanceId),
    }));
  },

  getSerializableState: () => ({
    inventory: get().inventory,
    heroEquipment: get().heroEquipment,
    activeCraft: get().activeCraft,
  }),

  loadState: (saved) => {
    set({
      inventory: saved.inventory,
      heroEquipment: saved.heroEquipment,
      activeCraft: saved.activeCraft || null,
    });
  },
}));

function createEmptyEquipment(): HeroEquipment {
  return { main_hand: null, off_hand: null, armor: null, legs: null, gloves: null, boots: null, ring1: null, ring2: null, ring3: null, earring1: null, earring2: null, necklace: null };
}
