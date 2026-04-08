import { create } from 'zustand';
import { GEAR_TEMPLATES, getAspectsForSlot } from '../config/gear';
import { craftGear } from '../engine/LootEngine';
import { getTotalStats } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCombatZoneStore } from './useCombatZoneStore';
import type { GearInstance, HeroEquipment, EquipmentSlot, Aspect } from '../types/equipment';
import { getCraftTime } from '../types/equipment';
import { isUpgradeable, getUpgradeConfig, attemptUpgrade } from '../engine/UpgradeEngine';
import type { UpgradeResult } from '../engine/UpgradeEngine';

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
  /** Batch crafting: 0 = infinite, 1+ = specific count */
  craftRepeatTarget: number;
  /** How many crafts completed in current batch */
  craftRepeatCount: number;

  craftItem: (templateId: string, craftSkillLevel: number) => GearInstance | null;
  startCraft: (templateId: string, craftSkillLevel: number) => boolean;
  cancelCraft: () => void;
  tickCraft: () => void;
  setCraftRepeatTarget: (target: number) => void;
  equipItem: (heroId: string, slot: EquipmentSlot, instanceId: string) => boolean;
  unequipItem: (heroId: string, slot: EquipmentSlot) => void;
  discardItem: (instanceId: string) => void;
  rerollAspect: (instanceId: string) => boolean;
  upgradeEquipment: (instanceId: string, smeltingOreCount: number) => UpgradeResult | null;

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
  craftRepeatTarget: 1,
  craftRepeatCount: 0,

  setCraftRepeatTarget: (target) => {
    set({ craftRepeatTarget: target });
  },

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
      craftRepeatCount: 0,
    });
    return true;
  },

  cancelCraft: () => {
    const state = get();
    if (!state.activeCraft) return;
    const template = GEAR_TEMPLATES[state.activeCraft.templateId];
    useGameStore.getState().addLog(`Cancelled crafting ${template?.name || 'item'}. Resources were already consumed.`, 'info');
    set({ activeCraft: null, craftRepeatCount: 0 });
  },

  tickCraft: () => {
    const state = get();
    if (!state.activeCraft) return;

    const newProgress = state.activeCraft.progress + 1;
    if (newProgress >= state.activeCraft.duration) {
      // Craft complete — produce the item
      const templateId = state.activeCraft.templateId;
      const craftSkillLevel = state.activeCraft.craftSkillLevel;
      const gear = craftGear(templateId, craftSkillLevel);
      if (gear) {
        const template = GEAR_TEMPLATES[templateId];
        const rarityLabel = gear.rarity.charAt(0).toUpperCase() + gear.rarity.slice(1);
        const aspectPrefix = gear.aspect ? `${gear.aspect.name} ` : '';
        useGameStore.getState().addLog(
          `Crafted [${rarityLabel}] ${aspectPrefix}${template?.name || 'item'}!`,
          gear.rarity === 'plague' || gear.rarity === 'unique' ? 'levelup' : 'info',
        );

        // Anti-cheat + achievements
        const actorId = useAuthStore.getState().user?.id || 'system';
        useAnticheatStore.getState().logItemEvent(gear.gameId, 'craft', actorId, undefined, 1, { templateId, rarity: gear.rarity });
        useAchievementStore.getState().incrementStat('gearCrafted');

        const newCount = state.craftRepeatCount + 1;
        set(s => ({
          inventory: [...s.inventory, gear],
          activeCraft: null,
          craftRepeatCount: newCount,
        }));

        // Story: gear craft (fixes Chapter 2.2 + all gear crafting objectives)
        useStoryStore.getState().checkObjective('craft', templateId, 1);

        // Batch repeat: auto-start next craft if target not reached
        const target = state.craftRepeatTarget;
        if (target === 0 || newCount < target) {
          // Try to start next craft — will fail silently if materials are insufficient
          const nextState = get();
          const nextTemplate = GEAR_TEMPLATES[templateId];
          if (nextTemplate) {
            const gameStore = useGameStore.getState();
            const resources = gameStore.resources;

            // Check materials
            const hasAll = nextTemplate.craftingInputs.every(
              input => (resources[input.resourceId] || 0) >= input.quantity,
            );

            // Check previous tier gear if needed
            let hasPrevTier = true;
            if (nextTemplate.requiresPreviousTier) {
              hasPrevTier = nextState.inventory.some(g => {
                if (g.templateId !== nextTemplate.requiresPreviousTier) return false;
                for (const eq of Object.values(nextState.heroEquipment)) {
                  for (const slotVal of Object.values(eq)) {
                    if (slotVal === g.instanceId) return false;
                  }
                }
                return true;
              });
            }

            if (hasAll && hasPrevTier) {
              // Consume resources
              const newResources = { ...resources };
              for (const input of nextTemplate.craftingInputs) {
                newResources[input.resourceId] -= input.quantity;
              }
              useGameStore.setState({ resources: newResources });

              // Consume previous tier gear
              let inv = [...get().inventory];
              if (nextTemplate.requiresPreviousTier) {
                const idx = inv.findIndex(g => {
                  if (g.templateId !== nextTemplate.requiresPreviousTier) return false;
                  for (const eq of Object.values(get().heroEquipment)) {
                    for (const slotVal of Object.values(eq)) {
                      if (slotVal === g.instanceId) return false;
                    }
                  }
                  return true;
                });
                if (idx >= 0) inv.splice(idx, 1);
              }

              const duration = getCraftTime(nextTemplate);
              set({
                inventory: inv,
                activeCraft: { templateId, craftSkillLevel, progress: 0, duration },
              });
            } else {
              // Can't continue — stop batch
              if (target === 0) {
                gameStore.addLog(`Batch crafting stopped: insufficient materials.`, 'info');
              }
            }
          }
        }
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
    const aspectPrefix = gear.aspect ? `${gear.aspect.name} ` : '';
    gameStore.addLog(
      `Crafted [${rarityLabel}] ${aspectPrefix}${template.name}!`,
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

  rerollAspect: (instanceId) => {
    const state = get();
    const gear = state.inventory.find(g => g.instanceId === instanceId);
    if (!gear) return false;

    // Check not equipped
    for (const eq of Object.values(state.heroEquipment)) {
      for (const slotVal of Object.values(eq)) {
        if (slotVal === instanceId) {
          useGameStore.getState().addLog('Cannot re-roll aspect on equipped gear. Unequip it first.', 'error');
          return false;
        }
      }
    }

    // Check player has an Aspect Stone
    const gameStore = useGameStore.getState();
    const aspectStones = gameStore.resources['aspect_stone'] || 0;
    if (aspectStones < 1) {
      gameStore.addLog('Need an Aspect Stone to re-roll aspect. Craft one via Tinkering.', 'error');
      return false;
    }

    const template = GEAR_TEMPLATES[gear.templateId];
    if (!template) return false;

    // Consume Aspect Stone
    const newResources = { ...gameStore.resources };
    newResources['aspect_stone'] = aspectStones - 1;
    useGameStore.setState({ resources: newResources });

    // Roll a new aspect
    const pool = getAspectsForSlot(template.slot, template.weaponType);
    const filtered = pool.filter(f => f.name !== 'Standard');
    let newAspect: Aspect | null = null;
    if (filtered.length > 0) {
      const chosen = filtered[Math.floor(Math.random() * filtered.length)];
      const tierMults: Record<number, number> = { 1: 0.5, 2: 0.7, 3: 0.85, 4: 1.0, 5: 1.2, 6: 1.4, 7: 1.6, 8: 1.8 };
      const mult = tierMults[template.tier] || 1.0;
      newAspect = {
        name: chosen.name,
        upside: { stat: chosen.upside.stat, value: Math.round(chosen.upside.value * mult * 10) / 10, isPercentage: chosen.upside.isPercentage },
        downside: { stat: chosen.downside.stat, value: Math.round(chosen.downside.value * mult * 10) / 10, isPercentage: chosen.downside.isPercentage },
      };
    }

    // Update inventory
    set(s => ({
      inventory: s.inventory.map(g => g.instanceId === instanceId ? { ...g, aspect: newAspect } : g),
    }));

    const aspectLabel = newAspect ? newAspect.name : 'Standard';
    gameStore.addLog(`Aspect re-rolled! ${template.name} is now "${aspectLabel}".`, 'info');
    return true;
  },

  upgradeEquipment: (instanceId, smeltingOreCount) => {
    const state = get();
    const gear = state.inventory.find(g => g.instanceId === instanceId);
    if (!gear) return null;

    const template = GEAR_TEMPLATES[gear.templateId];
    if (!template) return null;

    // Check it's upgradeable (not accessory)
    if (!isUpgradeable(template)) {
      useGameStore.getState().addLog('Accessories cannot be upgraded.', 'error');
      return null;
    }

    // Check max level
    if (gear.upgradeLevel >= 12) {
      useGameStore.getState().addLog(`${template.name} is already at max upgrade level (+12).`, 'error');
      return null;
    }

    // Get upgrade config for next level
    const config = getUpgradeConfig(gear.upgradeLevel);
    if (!config) return null;

    const gameStore = useGameStore.getState();
    const resources = { ...gameStore.resources };

    // Check required resources
    if ((resources[config.resourceId] || 0) < config.resourceQty) {
      gameStore.addLog(`Not enough ${config.resourceId.replace(/_/g, ' ')} to upgrade ${template.name}.`, 'error');
      return null;
    }

    // Check smelting ores if player wants to use them
    if (smeltingOreCount > 0 && (resources['smelting_ore'] || 0) < smeltingOreCount) {
      gameStore.addLog(`Not enough smelting ore.`, 'error');
      return null;
    }

    // Deduct resources
    resources[config.resourceId] -= config.resourceQty;
    if (smeltingOreCount > 0) {
      resources['smelting_ore'] = (resources['smelting_ore'] || 0) - smeltingOreCount;
    }
    useGameStore.setState({ resources });

    // Attempt upgrade
    const result = attemptUpgrade(gear.upgradeLevel, smeltingOreCount);

    if (result.success) {
      // Update gear's upgradeLevel in inventory
      set(s => ({
        inventory: s.inventory.map(g => g.instanceId === instanceId ? { ...g, upgradeLevel: result.newLevel } : g),
      }));
      gameStore.addLog(`Upgrade success! ${template.name} is now +${result.newLevel}.`, 'levelup');
    } else if (result.destroyed) {
      // Remove from inventory and unequip from any hero
      const newHeroEquipment = { ...state.heroEquipment };
      for (const [heroId, equipment] of Object.entries(newHeroEquipment)) {
        for (const [slot, slotValue] of Object.entries(equipment)) {
          if (slotValue === instanceId) {
            newHeroEquipment[heroId] = { ...equipment, [slot]: null };
          }
        }
      }
      set(s => ({
        inventory: s.inventory.filter(g => g.instanceId !== instanceId),
        heroEquipment: newHeroEquipment,
      }));
      gameStore.addLog(`Upgrade failed! ${template.name} was destroyed!`, 'error');
    } else {
      // Downgrade
      set(s => ({
        inventory: s.inventory.map(g => g.instanceId === instanceId ? { ...g, upgradeLevel: result.newLevel } : g),
      }));
      gameStore.addLog(`Upgrade failed. ${template.name} downgraded to +${result.newLevel}.`, 'error');
    }

    return result;
  },

  getSerializableState: () => ({
    inventory: get().inventory,
    heroEquipment: get().heroEquipment,
    activeCraft: get().activeCraft,
  }),

  loadState: (saved) => {
    // Migration: add upgradeLevel to all GearInstances if missing
    const inventory = (saved.inventory || []).map(g => ({
      ...g,
      upgradeLevel: g.upgradeLevel ?? 0,
    }));

    // Migration: remove ring3 from all heroEquipment records
    const heroEquipment: Record<string, HeroEquipment> = {};
    for (const [heroId, eq] of Object.entries(saved.heroEquipment || {})) {
      const { ring3, ...rest } = eq as any;
      heroEquipment[heroId] = rest;
    }

    set({
      inventory,
      heroEquipment,
      activeCraft: saved.activeCraft || null,
    });
  },
}));

function createEmptyEquipment(): HeroEquipment {
  return { main_hand: null, off_hand: null, armor: null, legs: null, gloves: null, boots: null, ring1: null, ring2: null, earring1: null, earring2: null, necklace: null };
}
