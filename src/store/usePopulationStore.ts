import { create } from 'zustand';
import { getTripDuration, processTrip, POPULATION_MILESTONES } from '../engine/PopulationEngine';
import { SKILLS, GATHERING_SKILLS } from '../config/skills';
import { levelFromXp } from '../types/skills';
import type { WorkerAssignment, PopulationState, RespawningWorker, IndividualWorker } from '../types/population';
import {
  WORKER_RESPAWN_MS, BASE_POPULATION_CAP, getPopulationCap,
  createIndividualWorker, getWorkerRank, getWorkerLevel,
  STAT_GROWTH_MAP,
} from '../types/population';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useLootTrackerStore } from './useLootTrackerStore';
import { useStoryStore } from './useStoryStore';
import { getPremiumBonuses } from '../engine/PremiumBonuses';
import { getEncampmentBonuses } from '../engine/EncampmentBonuses';

interface PopulationActions {
  createAssignment: (skillId: string, subActivityId: string, workerCount: number) => boolean;
  removeAssignment: (assignmentId: string) => void;
  adjustWorkers: (assignmentId: string, newCount: number) => void;
  tick: () => void;
  checkMilestones: () => void;
  addCombatKill: (zoneTier: number) => void;
  getAssignedWorkerCount: () => number;
  getSerializableState: () => SerializedPopulationState;
  loadState: (state: SerializedPopulationState) => void;
}

export interface SerializedPopulationState {
  totalWorkers: number;
  totalWorkersLost: number;
  workers?: IndividualWorker[];
  assignments: WorkerAssignment[];
  respawningWorkers?: RespawningWorker[];
  workerSkillXp: Record<string, number>;
  claimedMilestones: string[];
  combatKillCounter?: number;
}

let nextAssignmentId = 1;
let milestoneCheckCounter = 0;

/** Create N individual workers for initial state or migration */
function createWorkers(count: number): IndividualWorker[] {
  const workers: IndividualWorker[] = [];
  for (let i = 0; i < count; i++) {
    workers.push(createIndividualWorker());
  }
  return workers;
}

/** Pick N idle workers from the roster */
function pickIdleWorkers(workers: IndividualWorker[], count: number): string[] {
  const idle = workers.filter(w => !w.currentAssignmentId && !w.encampmentBuildingId && !w.isRespawning);
  return idle.slice(0, count).map(w => w.id);
}

/** Apply stat growth to a worker after a trip */
function growWorkerStats(worker: IndividualWorker, skillId: string): IndividualWorker {
  const growth = STAT_GROWTH_MAP[skillId];
  if (!growth) return worker;

  const stats = { ...worker.stats };
  stats[growth.primary] += 2;
  stats[growth.secondary] += 1;

  // +1 to a random other stat
  const allStats: (keyof typeof stats)[] = ['strength', 'endurance', 'perception', 'agility', 'intellect'];
  const others = allStats.filter(s => s !== growth.primary && s !== growth.secondary);
  const randomStat = others[Math.floor(Math.random() * others.length)];
  stats[randomStat] += 1;

  const newDispatches = worker.totalDispatches + 1;
  const newBySkill = { ...worker.dispatchesBySkill };
  newBySkill[skillId] = (newBySkill[skillId] || 0) + 1;

  return {
    ...worker,
    stats,
    totalDispatches: newDispatches,
    dispatchesBySkill: newBySkill,
    level: getWorkerLevel(newDispatches),
    rank: getWorkerRank(newDispatches),
  };
}

/** Add a new worker to the population */
function addNewWorker(state: PopulationState): Partial<PopulationState> {
  const newWorker = createIndividualWorker();
  return {
    workers: [...state.workers, newWorker],
    totalWorkers: state.totalWorkers + 1,
    availableWorkers: state.availableWorkers + 1,
  };
}

export const usePopulationStore = create<PopulationState & PopulationActions>((set, get) => ({
  availableWorkers: 3,
  totalWorkers: 3,
  totalWorkersLost: 0,
  workers: createWorkers(3),
  assignments: [],
  respawningWorkers: [],
  workerSkillXp: {},
  claimedMilestones: ['start'],
  combatKillCounter: 0,

  createAssignment: (skillId, subActivityId, workerCount) => {
    const state = get();
    if (workerCount <= 0 || workerCount > state.availableWorkers) return false;

    const skillDef = SKILLS[skillId];
    if (!skillDef || skillDef.category !== 'gathering') return false;

    const subActivity = skillDef.subActivities?.find(a => a.id === subActivityId);
    if (!subActivity) return false;

    const assignmentId = `assign_${nextAssignmentId++}`;
    const workerIds = pickIdleWorkers(state.workers, workerCount);
    if (workerIds.length < workerCount) return false;

    const newAssignment: WorkerAssignment = {
      id: assignmentId,
      skillId,
      subActivityId,
      workerCount,
      tripProgress: 0,
      tripsCompleted: 0,
      totalResourcesGathered: {},
      workersLost: 0,
      assignedWorkerIds: workerIds,
    };

    set({
      assignments: [...state.assignments, newAssignment],
      availableWorkers: state.availableWorkers - workerCount,
      workers: state.workers.map(w =>
        workerIds.includes(w.id) ? { ...w, currentAssignmentId: assignmentId } : w
      ),
    });

    const gameStore = useGameStore.getState();
    gameStore.addLog(
      `Deployed ${workerCount} worker${workerCount > 1 ? 's' : ''} to ${skillDef.name}: ${subActivity.name}.`,
      'system',
    );
    return true;
  },

  removeAssignment: (assignmentId) => {
    const state = get();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    set({
      assignments: state.assignments.filter(a => a.id !== assignmentId),
      availableWorkers: state.availableWorkers + assignment.workerCount,
      workers: state.workers.map(w =>
        w.currentAssignmentId === assignmentId ? { ...w, currentAssignmentId: null } : w
      ),
    });

    const skillDef = SKILLS[assignment.skillId];
    useGameStore.getState().addLog(
      `Recalled ${assignment.workerCount} worker${assignment.workerCount > 1 ? 's' : ''} from ${skillDef?.name || assignment.skillId}.`,
      'system',
    );
  },

  adjustWorkers: (assignmentId, newCount) => {
    const state = get();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment || newCount <= 0) return;

    const diff = newCount - assignment.workerCount;
    if (diff > 0 && diff > state.availableWorkers) return;

    let updatedWorkers = [...state.workers];
    let newWorkerIds = [...(assignment.assignedWorkerIds || [])];

    if (diff > 0) {
      // Adding workers
      const additionalIds = pickIdleWorkers(updatedWorkers, diff);
      if (additionalIds.length < diff) return;
      newWorkerIds = [...newWorkerIds, ...additionalIds];
      updatedWorkers = updatedWorkers.map(w =>
        additionalIds.includes(w.id) ? { ...w, currentAssignmentId: assignmentId } : w
      );
    } else if (diff < 0) {
      // Removing workers
      const removeCount = Math.abs(diff);
      const toRemove = newWorkerIds.slice(-removeCount);
      newWorkerIds = newWorkerIds.slice(0, -removeCount);
      updatedWorkers = updatedWorkers.map(w =>
        toRemove.includes(w.id) ? { ...w, currentAssignmentId: null } : w
      );
    }

    set({
      assignments: state.assignments.map(a =>
        a.id === assignmentId ? { ...a, workerCount: newCount, assignedWorkerIds: newWorkerIds } : a
      ),
      availableWorkers: state.availableWorkers - diff,
      workers: updatedWorkers,
    });
  },

  tick: () => {
    if (++milestoneCheckCounter >= 5) {
      milestoneCheckCounter = 0;
      get().checkMilestones();
    }

    const state = get();

    // Process worker respawns
    const now = Date.now();
    const stillRespawning: RespawningWorker[] = [];
    let respawnedCount = 0;
    const autoAssignQueue: RespawningWorker[] = [];
    const respawnedWorkerIds: string[] = [];

    for (const rw of state.respawningWorkers) {
      if (now >= rw.respawnAt) {
        respawnedCount++;
        if (rw.lastSkillId && rw.lastSubActivityId) {
          autoAssignQueue.push(rw);
        }
      } else {
        stillRespawning.push(rw);
      }
    }

    if (respawnedCount > 0) {
      const gameStore = useGameStore.getState();
      gameStore.addLog(`${respawnedCount} worker${respawnedCount > 1 ? 's' : ''} recovered and ${respawnedCount > 1 ? 'are' : 'is'} available again.`, 'system');

      // Find respawning individual workers and mark them available
      let respawnedSoFar = 0;
      const updatedWorkers = state.workers.map(w => {
        if (w.isRespawning && w.respawnAt && now >= w.respawnAt && respawnedSoFar < respawnedCount) {
          respawnedSoFar++;
          return { ...w, isRespawning: false, respawnAt: null };
        }
        return w;
      });

      set({
        respawningWorkers: stillRespawning,
        totalWorkers: state.totalWorkers + respawnedCount,
        availableWorkers: state.availableWorkers + respawnedCount,
        workers: updatedWorkers,
      });

      // Golden Cap: auto-reassign
      if (getPremiumBonuses().autoAssignWorkers && autoAssignQueue.length > 0) {
        for (const rw of autoAssignQueue) {
          const skillDef = SKILLS[rw.lastSkillId!];
          if (!skillDef || skillDef.category !== 'gathering') continue;
          const sub = skillDef.subActivities?.find(a => a.id === rw.lastSubActivityId);
          if (!sub) continue;
          const gameSkills = useGameStore.getState().skills;
          if (sub.levelReq && (gameSkills[rw.lastSkillId!]?.level || 1) < sub.levelReq) continue;
          const ok = get().createAssignment(rw.lastSkillId!, rw.lastSubActivityId!, 1);
          if (ok) {
            gameStore.addLog(`Worker auto-assigned to ${skillDef.name}: ${sub.name} (Golden Cap).`, 'info');
          }
        }
      }
    }

    if (state.assignments.length === 0) return;

    const gameStore = useGameStore.getState();
    const newAssignments: WorkerAssignment[] = [];
    const newRespawning: RespawningWorker[] = [];
    let workersFreed = 0;
    let workersLostThisTick = 0;
    const newWorkerSkillXp = { ...state.workerSkillXp };
    let updatedWorkers = [...state.workers];

    for (const assignment of state.assignments) {
      const tripDuration = getTripDuration(assignment, state.workerSkillXp);
      const newProgress = assignment.tripProgress + 1;

      if (newProgress >= tripDuration) {
        // Trip complete
        const result = processTrip(assignment, state.workerSkillXp);

        // Add resources
        const resources = { ...gameStore.resources };
        const resNames: string[] = [];
        const skillDef = SKILLS[assignment.skillId];
        for (const r of result.resourcesGained) {
          resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
          resNames.push(`${r.quantity}x ${r.resourceId.replace(/_/g, ' ')}`);
          useLootTrackerStore.getState().trackLoot(r.resourceId, r.quantity, 'worker', skillDef?.name || assignment.skillId);
        }
        useGameStore.setState({ resources });

        // Worker skill XP
        newWorkerSkillXp[assignment.skillId] = (newWorkerSkillXp[assignment.skillId] || 0) + result.xpGained;

        // Player skill XP
        const playerSkills = { ...gameStore.skills };
        const currentSkill = playerSkills[assignment.skillId];
        if (currentSkill) {
          const newTotalXp = currentSkill.xp + result.xpGained;
          const newLevel = Math.min(100, levelFromXp(newTotalXp));
          playerSkills[assignment.skillId] = { level: newLevel, xp: newTotalXp };
          useGameStore.setState({ skills: playerSkills });

          if (newLevel > currentSkill.level) {
            gameStore.addLog(`LEVEL UP! ${skillDef?.name || assignment.skillId} is now level ${newLevel}!`, 'levelup');
            useStoryStore.getState().checkObjective('reach_skill_level', assignment.skillId, newLevel);
          }
        }

        // Grow stats for all assigned workers
        const assignedIds = assignment.assignedWorkerIds || [];
        for (const wId of assignedIds) {
          const idx = updatedWorkers.findIndex(w => w.id === wId);
          if (idx >= 0) {
            updatedWorkers[idx] = growWorkerStats(updatedWorkers[idx], assignment.skillId);
          }
        }

        // Update totals
        const updatedTotals = { ...assignment.totalResourcesGathered };
        for (const r of result.resourcesGained) {
          updatedTotals[r.resourceId] = (updatedTotals[r.resourceId] || 0) + r.quantity;
        }

        if (result.workerDied && assignment.workerCount > 0) {
          workersLostThisTick++;
          const deathNow = Date.now();
          const encampmentBonuses = getEncampmentBonuses();
          const respawnReduction = 1 - Math.min(0.9, (encampmentBonuses.worker_respawn_speed || 0) / 100);
          const respawnMs = Math.floor(WORKER_RESPAWN_MS * getPremiumBonuses().workerRespawnMultiplier * respawnReduction);
          newRespawning.push({ diedAt: deathNow, respawnAt: deathNow + respawnMs, lastSkillId: assignment.skillId, lastSubActivityId: assignment.subActivityId });

          // Mark the lowest-endurance worker as respawning
          const assignedWorkers = assignedIds.map(id => updatedWorkers.find(w => w.id === id)).filter(Boolean) as IndividualWorker[];
          if (assignedWorkers.length > 0) {
            const sorted = [...assignedWorkers].sort((a, b) => a.stats.endurance - b.stats.endurance);
            const victim = sorted[0];
            updatedWorkers = updatedWorkers.map(w =>
              w.id === victim.id ? { ...w, isRespawning: true, respawnAt: deathNow + respawnMs, currentAssignmentId: null } : w
            );

            const newAssignedIds = assignedIds.filter(id => id !== victim.id);
            gameStore.addLog(
              `${victim.name} was injured during ${skillDef?.name || ''} and needs recovery. (${newAssignedIds.length} remain)`,
              'error',
            );

            if (newAssignedIds.length === 0) {
              gameStore.addLog(`All workers on this assignment are recovering. Task paused.`, 'error');
              continue;
            }

            newAssignments.push({
              ...assignment,
              tripProgress: 0,
              tripsCompleted: assignment.tripsCompleted + 1,
              totalResourcesGathered: updatedTotals,
              workerCount: newAssignedIds.length,
              workersLost: assignment.workersLost + 1,
              assignedWorkerIds: newAssignedIds,
            });
          }
        } else {
          gameStore.addLog(`Workers returned from ${skillDef?.name || ''}: ${resNames.join(', ')}`, 'drop');
          newAssignments.push({
            ...assignment,
            tripProgress: 0,
            tripsCompleted: assignment.tripsCompleted + 1,
            totalResourcesGathered: updatedTotals,
          });
        }
      } else {
        newAssignments.push({ ...assignment, tripProgress: newProgress });
      }
    }

    set(s => ({
      assignments: newAssignments,
      workerSkillXp: newWorkerSkillXp,
      respawningWorkers: [...s.respawningWorkers, ...newRespawning],
      totalWorkersLost: s.totalWorkersLost + workersLostThisTick,
      totalWorkers: s.totalWorkers - workersLostThisTick,
      availableWorkers: s.availableWorkers + workersFreed,
      workers: updatedWorkers,
    }));
  },

  checkMilestones: () => {
    const state = get();
    const gameStore = useGameStore.getState();
    const gatheringSkillIds = GATHERING_SKILLS.map(s => s.id);

    const heroCount = useHeroStore.getState().heroes.length;
    const skills = gameStore.skills;
    const maxGatheringLevel = Math.max(0, ...gatheringSkillIds.map(id => skills[id]?.level || 0));
    const allGatheringAt100 = gatheringSkillIds.length > 0 && gatheringSkillIds.every(id => (skills[id]?.level || 0) >= 100);
    const storyState = useStoryStore.getState();
    const tutorialComplete = storyState.completedStories?.includes(1) ?? false;

    let workersGained = 0;
    const newClaimed = [...state.claimedMilestones];

    for (const milestone of POPULATION_MILESTONES) {
      if (newClaimed.includes(milestone.id)) continue;
      if (milestone.id === 'start') continue;

      let eligible = false;
      switch (milestone.id) {
        case 'tutorial_complete': eligible = tutorialComplete; break;
        case 'first_hero': eligible = heroCount >= 1; break;
        case 'gathering_15': eligible = maxGatheringLevel >= 15; break;
        case 'gathering_30': eligible = maxGatheringLevel >= 30; break;
        case 'gathering_45': eligible = maxGatheringLevel >= 45; break;
        case 'gathering_60': eligible = maxGatheringLevel >= 60; break;
        case 'gathering_80': eligible = maxGatheringLevel >= 80; break;
        case 'gathering_100': eligible = maxGatheringLevel >= 100; break;
        case 'all_gathering_100': eligible = allGatheringAt100; break;
        case 'first_pvp_win':
        case 'join_clan': eligible = false; break;
      }

      if (eligible) {
        newClaimed.push(milestone.id);
        workersGained += milestone.workers;
        gameStore.addLog(`Milestone: ${milestone.description}! +${milestone.workers} worker${milestone.workers > 1 ? 's' : ''}.`, 'levelup');
      }
    }

    if (workersGained > 0) {
      const newWorkers: IndividualWorker[] = [];
      for (let i = 0; i < workersGained; i++) {
        newWorkers.push(createIndividualWorker());
      }
      set({
        claimedMilestones: newClaimed,
        totalWorkers: state.totalWorkers + workersGained,
        availableWorkers: state.availableWorkers + workersGained,
        workers: [...state.workers, ...newWorkers],
      });
    }
  },

  addCombatKill: (zoneTier) => {
    const state = get();
    const newCounter = state.combatKillCounter + 1;

    if (newCounter % 10 === 0) {
      const chance = Math.min(0.30, 0.10 + (zoneTier - 1) * 0.05);
      const totalPop = state.totalWorkers + state.respawningWorkers.length;
      const cap = getPopulationCap();

      if (totalPop < cap && Math.random() < chance) {
        const newWorker = createIndividualWorker();
        useGameStore.getState().addLog(
          `A survivor was found during combat! ${newWorker.name} joins the settlement. (${state.totalWorkers + 1} total)`,
          'levelup',
        );
        set({
          combatKillCounter: newCounter,
          totalWorkers: state.totalWorkers + 1,
          availableWorkers: state.availableWorkers + 1,
          workers: [...state.workers, newWorker],
        });
        return;
      }
    }

    set({ combatKillCounter: newCounter });
  },

  getAssignedWorkerCount: () => {
    return get().assignments.reduce((sum, a) => sum + a.workerCount, 0);
  },

  getSerializableState: () => {
    const state = get();
    return {
      totalWorkers: state.totalWorkers,
      totalWorkersLost: state.totalWorkersLost,
      workers: state.workers,
      assignments: state.assignments,
      respawningWorkers: state.respawningWorkers,
      workerSkillXp: state.workerSkillXp,
      claimedMilestones: state.claimedMilestones,
      combatKillCounter: state.combatKillCounter,
    };
  },

  loadState: (saved) => {
    const assigned = saved.assignments.reduce((sum, a) => sum + a.workerCount, 0);

    // Migration: if no workers array, generate from totalWorkers count
    let workers = saved.workers || [];
    if (workers.length === 0 && saved.totalWorkers > 0) {
      workers = createWorkers(saved.totalWorkers);
      // Mark assigned workers
      for (const a of saved.assignments) {
        const ids: string[] = [];
        for (let i = 0; i < a.workerCount; i++) {
          const idle = workers.find(w => !w.currentAssignmentId && !w.isRespawning);
          if (idle) {
            idle.currentAssignmentId = a.id;
            ids.push(idle.id);
          }
        }
        a.assignedWorkerIds = ids;
      }
    }

    // Ensure assignedWorkerIds exists on all assignments
    for (const a of saved.assignments) {
      if (!a.assignedWorkerIds) {
        a.assignedWorkerIds = [];
      }
    }

    set({
      totalWorkers: saved.totalWorkers,
      totalWorkersLost: saved.totalWorkersLost,
      workers,
      assignments: saved.assignments,
      respawningWorkers: saved.respawningWorkers || [],
      workerSkillXp: saved.workerSkillXp,
      claimedMilestones: saved.claimedMilestones,
      combatKillCounter: saved.combatKillCounter || 0,
      availableWorkers: saved.totalWorkers - assigned,
    });
  },
}));
