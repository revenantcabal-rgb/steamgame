import { create } from 'zustand';
import { BUILDINGS, getBuildCost, getBonusAtLevel, getWorkerTickInterval } from '../config/buildings';
import type { BonusType } from '../config/buildings';
import { CLASSES } from '../config/classes';
import { useGameStore } from './useGameStore';
import { usePopulationStore } from './usePopulationStore';
import { useHeroStore } from './useHeroStore';

export interface BuiltBuilding {
  buildingId: string;
  level: number;
  assignedWorker: boolean;
  /** Seconds accumulated toward next worker resource tick */
  workerTickProgress: number;
  /** Specialist hero assigned as leader (optional) */
  leaderId?: string;
}

interface EncampmentState {
  buildings: Record<string, BuiltBuilding>;
}

interface EncampmentActions {
  buildOrUpgrade: (buildingId: string) => boolean;
  assignWorker: (buildingId: string) => boolean;
  removeWorker: (buildingId: string) => boolean;
  assignLeader: (buildingId: string, heroId: string) => boolean;
  removeLeader: (buildingId: string) => boolean;
  getLeaderBonus: (buildingId: string) => number;
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

  assignLeader: (buildingId: string, heroId: string) => {
    const state = get();
    const building = state.buildings[buildingId];
    if (!building) return false;
    if (building.leaderId) return false; // already has a leader

    // Validate hero exists and is a specialist
    const heroStore = useHeroStore.getState();
    const hero = heroStore.heroes.find(h => h.id === heroId);
    if (!hero) return false;
    const cls = CLASSES[hero.classId];
    if (!cls || cls.heroType !== 'specialist') {
      useGameStore.getState().addLog('Only specialist heroes can serve as building leaders.', 'error');
      return false;
    }

    // Check hero isn't already leading another building
    for (const b of Object.values(state.buildings)) {
      if (b.leaderId === heroId) {
        useGameStore.getState().addLog(`${hero.name} is already leading another building.`, 'error');
        return false;
      }
    }

    set({
      buildings: {
        ...state.buildings,
        [buildingId]: { ...building, leaderId: heroId },
      },
    });

    const def = BUILDINGS[buildingId];
    useGameStore.getState().addLog(`${hero.name} assigned as leader of ${def?.name || buildingId}.`, 'system');
    return true;
  },

  removeLeader: (buildingId: string) => {
    const state = get();
    const building = state.buildings[buildingId];
    if (!building || !building.leaderId) return false;

    const hero = useHeroStore.getState().heroes.find(h => h.id === building.leaderId);

    set({
      buildings: {
        ...state.buildings,
        [buildingId]: { ...building, leaderId: undefined },
      },
    });

    const def = BUILDINGS[buildingId];
    useGameStore.getState().addLog(`${hero?.name || 'Leader'} removed from ${def?.name || buildingId}.`, 'system');
    return true;
  },

  getLeaderBonus: (buildingId: string) => {
    const state = get();
    const building = state.buildings[buildingId];
    if (!building?.leaderId) return 0;

    const hero = useHeroStore.getState().heroes.find(h => h.id === building.leaderId);
    if (!hero) return 0;

    // Leader bonus: 1% per hero level, capped at 50%
    return Math.min(50, hero.level);
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

      let bonus = getBonusAtLevel(def, building.level);
      // Leader multiplier: specialist hero assigned as leader boosts building output
      if (building.leaderId) {
        const leaderPct = get().getLeaderBonus(building.buildingId);
        bonus *= (1 + leaderPct / 100);
      }
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
