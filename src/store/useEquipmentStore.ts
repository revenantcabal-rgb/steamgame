import { create } from 'zustand';
import { GEAR_TEMPLATES } from '../config/gear';
import { craftGear } from '../engine/LootEngine';
import { getTotalStats } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import type { GearInstance, HeroEquipment, EquipmentSlot } from '../types/equipment';

interface EquipmentState {
  /** All gear instances owned by the player */
  inventory: GearInstance[];
  /** Per-hero equipment (heroId -> equipped gear instance IDs) */
  heroEquipment: Record<string, HeroEquipment>;

  craftItem: (templateId: string, craftSkillLevel: number) => GearInstance | null;
  equipItem: (heroId: string, slot: EquipmentSlot, instanceId: string) => boolean;
  unequipItem: (heroId: string, slot: EquipmentSlot) => void;
  discardItem: (instanceId: string) => void;

  getSerializableState: () => SerializedEquipmentState;
  loadState: (state: SerializedEquipmentState) => void;
}

export interface SerializedEquipmentState {
  inventory: GearInstance[];
  heroEquipment: Record<string, HeroEquipment>;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  inventory: [],
  heroEquipment: {},

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

    return true;
  },

  unequipItem: (heroId, slot) => {
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

    set(state => ({
      inventory: state.inventory.filter(g => g.instanceId !== instanceId),
    }));
  },

  getSerializableState: () => ({
    inventory: get().inventory,
    heroEquipment: get().heroEquipment,
  }),

  loadState: (saved) => {
    set({
      inventory: saved.inventory,
      heroEquipment: saved.heroEquipment,
    });
  },
}));

function createEmptyEquipment(): HeroEquipment {
  return { main_hand: null, off_hand: null, armor: null, legs: null, gloves: null, boots: null, ring1: null, ring2: null, ring3: null, earring1: null, earring2: null, necklace: null };
}
