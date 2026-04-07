import { create } from 'zustand';
import { BUILDINGS, getBuildCost, getBonusAtLevel, getWorkerTickInterval } from '../config/buildings';
import type { BonusType } from '../config/buildings';
import { useGameStore } from './useGameStore';
import { usePopulationStore } from './usePopulationStore';

export interface BuiltBuilding {
  buildingId: string;
  level: number;
  assignedWorker: boolean;
  /** Seconds accumulated toward next worker resource tick */
  workerTickProgress: number;
}

interface EncampmentState {
  buildings: Record<string, BuiltBuilding>;
}

interface EncampmentActions {
  buildOrUpgrade: (buildingId: string) => boolean;
  assignWorker: (buildingId: string) => boolean;
  removeWorker: (buildingId: string) => boolean;
  tick: () => void;
  getBonuses: () => Record<BonusType, number>;
  getSerializableState: () => any;
  loadState: (state: any) => void;
}

const EMPTY_BONUSES: Record<BonusType, number> = {
  gathering_speed_scavenging: 0,
  gathering_speed_foraging: 0,
  gathering_speed_salvage_hunting: 0,
  gathering_speed_water_reclamation: 0,
  gathering_speed_prospecting: 0,
  gathering_yield_all: 0,
  production_speed: 0,
  combat_damage: 0,
  combat_defense: 0,
  combat_hp: 0,
  worker_speed: 0,
  worker_survivability: 0,
  worker_capacity: 0,
  hero_xp: 0,
  hero_combat_damage: 0,
  marketplace_sell_bonus: 0,
  rare_drop_chance: 0,
  worker_respawn_speed: 0,
  expedition_reward: 0,
};

export const useEncampmentStore = create<EncampmentState & EncampmentActions>((set, get) => ({
  buildings: {},

  buildOrUpgrade: (buildingId: string) => {
    const def = BUILDINGS[buildingId];
    if (!def) return false;

    const state = get();
    const existing = state.buildings[buildingId];
    const targetLevel = existing ? existing.level + 1 : 1;

    if (targetLevel > def.maxLevel) return false;

    // Check and deduct resources
    const gameStore = useGameStore.getState();
    const costs = getBuildCost(def, targetLevel);
    const resources = gameStore.resources;

    for (const c of costs) {
      if ((resources[c.resourceId] || 0) < c.quantity) {
        gameStore.addLog(`Not enough resources to ${existing ? 'upgrade' : 'build'} ${def.name}.`, 'error');
        return false;
      }
    }

    // Deduct resources
    const newResources = { ...resources };
    for (const c of costs) {
      newResources[c.resourceId] = (newResources[c.resourceId] || 0) - c.quantity;
    }
    useGameStore.setState({ resources: newResources });

    // Build or upgrade
    if (existing) {
      set({
        buildings: {
          ...state.buildings,
          [buildingId]: { ...existing, level: targetLevel },
        },
      });
      gameStore.addLog(`Upgraded ${def.name} to level ${targetLevel}!`, 'levelup');
    } else {
      set({
        buildings: {
          ...state.buildings,
          [buildingId]: { buildingId, level: 1, assignedWorker: false, workerTickProgress: 0 },
        },
      });
      gameStore.addLog(`Built ${def.name}!`, 'levelup');
    }

    return true;
  },

  assignWorker: (buildingId: string) => {
    const state = get();
    const building = state.buildings[buildingId];
    if (!building || building.assignedWorker) return false;

    const popStore = usePopulationStore.getState();
    if (popStore.availableWorkers <= 0) {
      useGameStore.getState().addLog('No available workers to assign.', 'error');
      return false;
    }

    // Find an idle worker and assign to building
    const idleWorker = popStore.workers.find(w =>
      !w.currentAssignmentId && !w.encampmentBuildingId && !w.isRespawning
    );
    if (!idleWorker) return false;

    // Update worker
    usePopulationStore.setState(s => ({
      workers: s.workers.map(w => w.id === idleWorker.id ? { ...w, encampmentBuildingId: buildingId } : w),
      availableWorkers: s.availableWorkers - 1,
    }));

    set({
      buildings: {
        ...state.buildings,
        [buildingId]: { ...building, assignedWorker: true, workerTickProgress: 0 },
      },
    });

    const def = BUILDINGS[buildingId];
    useGameStore.getState().addLog(`Worker assigned to ${def?.name || buildingId}.`, 'system');
    return true;
  },

  removeWorker: (buildingId: string) => {
    const state = get();
    const building = state.buildings[buildingId];
    if (!building || !building.assignedWorker) return false;

    // Find the worker assigned to this building and free them
    usePopulationStore.setState(s => {
      const worker = s.workers.find(w => w.encampmentBuildingId === buildingId);
      if (!worker) return s;
      return {
        workers: s.workers.map(w => w.id === worker.id ? { ...w, encampmentBuildingId: null } : w),
        availableWorkers: s.availableWorkers + 1,
      };
    });

    set({
      buildings: {
        ...state.buildings,
        [buildingId]: { ...building, assignedWorker: false, workerTickProgress: 0 },
      },
    });

    const def = BUILDINGS[buildingId];
    useGameStore.getState().addLog(`Worker removed from ${def?.name || buildingId}.`, 'system');
    return true;
  },

  tick: () => {
    const state = get();
    const updates: Record<string, BuiltBuilding> = {};
    let anyResourceGained = false;

    for (const [id, building] of Object.entries(state.buildings)) {
      if (!building.assignedWorker) continue;

      const def = BUILDINGS[id];
      if (!def) continue;

      const tickInterval = getWorkerTickInterval(def, building.level);
      const newProgress = building.workerTickProgress + 1;

      if (newProgress >= tickInterval) {
        // Worker produces resources
        const qty = def.workerBaseYield;
        const gameStore = useGameStore.getState();
        const newResources = { ...gameStore.resources };
        newResources[def.workerResourceId] = (newResources[def.workerResourceId] || 0) + qty;
        useGameStore.setState({ resources: newResources });
        updates[id] = { ...building, workerTickProgress: 0 };
        anyResourceGained = true;
      } else {
        updates[id] = { ...building, workerTickProgress: newProgress };
      }
    }

    if (Object.keys(updates).length > 0) {
      set({ buildings: { ...state.buildings, ...updates } });
    }
  },

  getBonuses: () => {
    const state = get();
    const bonuses = { ...EMPTY_BONUSES };

    for (const building of Object.values(state.buildings)) {
      const def = BUILDINGS[building.buildingId];
      if (!def) continue;

      const bonus = getBonusAtLevel(def, building.level);
      bonuses[def.bonusType] = (bonuses[def.bonusType] || 0) + bonus;
    }

    return bonuses;
  },

  getSerializableState: () => {
    return { buildings: get().buildings };
  },

  loadState: (saved: any) => {
    if (saved && saved.buildings) {
      set({ buildings: saved.buildings });
    }
  },
}));
