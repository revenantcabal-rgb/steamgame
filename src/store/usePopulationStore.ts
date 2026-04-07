import { create } from 'zustand';
import { getTripDuration, processTrip } from '../engine/PopulationEngine';
import { SKILLS } from '../config/skills';
import type { WorkerAssignment, PopulationState } from '../types/population';
import { useGameStore } from './useGameStore';

interface PopulationActions {
  /** Create a new worker assignment */
  createAssignment: (skillId: string, subActivityId: string, workerCount: number) => boolean;
  /** Remove an assignment and free workers */
  removeAssignment: (assignmentId: string) => void;
  /** Adjust worker count on an existing assignment */
  adjustWorkers: (assignmentId: string, newCount: number) => void;
  /** Process one second of population work */
  tick: () => void;
  /** Get total assigned workers */
  getAssignedWorkerCount: () => number;
  /** Serializable state */
  getSerializableState: () => SerializedPopulationState;
  loadState: (state: SerializedPopulationState) => void;
}

export interface SerializedPopulationState {
  totalWorkers: number;
  totalWorkersLost: number;
  assignments: WorkerAssignment[];
  workerSkillXp: Record<string, number>;
  claimedMilestones: string[];
}

let nextAssignmentId = 1;

export const usePopulationStore = create<PopulationState & PopulationActions>((set, get) => ({
  availableWorkers: 3,
  totalWorkers: 3,
  totalWorkersLost: 0,
  assignments: [],
  workerSkillXp: {},
  claimedMilestones: ['start'],

  createAssignment: (skillId, subActivityId, workerCount) => {
    const state = get();
    if (workerCount <= 0 || workerCount > state.availableWorkers) return false;

    const skillDef = SKILLS[skillId];
    if (!skillDef || skillDef.category !== 'gathering') return false;

    const subActivity = skillDef.subActivities?.find(a => a.id === subActivityId);
    if (!subActivity) return false;

    const newAssignment: WorkerAssignment = {
      id: `assign_${nextAssignmentId++}`,
      skillId,
      subActivityId,
      workerCount,
      tripProgress: 0,
      tripsCompleted: 0,
      totalResourcesGathered: {},
      workersLost: 0,
    };

    set({
      assignments: [...state.assignments, newAssignment],
      availableWorkers: state.availableWorkers - workerCount,
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
    });

    const skillDef = SKILLS[assignment.skillId];
    const gameStore = useGameStore.getState();
    gameStore.addLog(
      `Recalled ${assignment.workerCount} worker${assignment.workerCount > 1 ? 's' : ''} from ${skillDef?.name || assignment.skillId}.`,
      'system',
    );
  },

  adjustWorkers: (assignmentId, newCount) => {
    const state = get();
    const assignment = state.assignments.find(a => a.id === assignmentId);
    if (!assignment || newCount <= 0) return;

    const diff = newCount - assignment.workerCount;
    if (diff > 0 && diff > state.availableWorkers) return; // Not enough workers

    set({
      assignments: state.assignments.map(a =>
        a.id === assignmentId ? { ...a, workerCount: newCount } : a
      ),
      availableWorkers: state.availableWorkers - diff,
    });
  },

  tick: () => {
    const state = get();
    if (state.assignments.length === 0) return;

    const gameStore = useGameStore.getState();
    const newAssignments: WorkerAssignment[] = [];
    let workersFreed = 0;
    let workersLostThisTick = 0;
    const newWorkerSkillXp = { ...state.workerSkillXp };

    for (const assignment of state.assignments) {
      const tripDuration = getTripDuration(assignment, state.workerSkillXp);
      const newProgress = assignment.tripProgress + 1;

      if (newProgress >= tripDuration) {
        // Trip complete - process results
        const result = processTrip(assignment, state.workerSkillXp);

        // Add resources to game store
        const resources = { ...gameStore.resources };
        const resNames: string[] = [];
        for (const r of result.resourcesGained) {
          resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
          resNames.push(`${r.quantity}x ${r.resourceId.replace(/_/g, ' ')}`);
        }
        useGameStore.setState({ resources });

        // Add worker XP
        newWorkerSkillXp[assignment.skillId] = (newWorkerSkillXp[assignment.skillId] || 0) + result.xpGained;

        // Update assignment totals
        const updatedTotals = { ...assignment.totalResourcesGathered };
        for (const r of result.resourcesGained) {
          updatedTotals[r.resourceId] = (updatedTotals[r.resourceId] || 0) + r.quantity;
        }

        if (result.workerDied && assignment.workerCount > 0) {
          // Worker died
          workersLostThisTick++;
          const skillDef = SKILLS[assignment.skillId];
          gameStore.addLog(
            `A worker was lost in the wastes during ${skillDef?.name || assignment.skillId}! (${assignment.workerCount - 1} remain on duty)`,
            'error',
          );

          if (assignment.workerCount <= 1) {
            // Last worker died, remove assignment
            gameStore.addLog(`All workers on this assignment are gone. Task abandoned.`, 'error');
            continue; // Don't add to newAssignments
          }

          newAssignments.push({
            ...assignment,
            tripProgress: 0,
            tripsCompleted: assignment.tripsCompleted + 1,
            totalResourcesGathered: updatedTotals,
            workerCount: assignment.workerCount - 1,
            workersLost: assignment.workersLost + 1,
          });
        } else {
          // Normal trip complete
          const skillDef = SKILLS[assignment.skillId];
          gameStore.addLog(
            `Workers returned from ${skillDef?.name || ''}: ${resNames.join(', ')}`,
            'drop',
          );

          newAssignments.push({
            ...assignment,
            tripProgress: 0,
            tripsCompleted: assignment.tripsCompleted + 1,
            totalResourcesGathered: updatedTotals,
          });
        }
      } else {
        // Trip in progress
        newAssignments.push({ ...assignment, tripProgress: newProgress });
      }
    }

    set({
      assignments: newAssignments,
      workerSkillXp: newWorkerSkillXp,
      totalWorkersLost: state.totalWorkersLost + workersLostThisTick,
      totalWorkers: state.totalWorkers - workersLostThisTick,
      availableWorkers: state.availableWorkers + workersFreed,
    });
  },

  getAssignedWorkerCount: () => {
    return get().assignments.reduce((sum, a) => sum + a.workerCount, 0);
  },

  getSerializableState: () => {
    const state = get();
    return {
      totalWorkers: state.totalWorkers,
      totalWorkersLost: state.totalWorkersLost,
      assignments: state.assignments,
      workerSkillXp: state.workerSkillXp,
      claimedMilestones: state.claimedMilestones,
    };
  },

  loadState: (saved) => {
    const assigned = saved.assignments.reduce((sum, a) => sum + a.workerCount, 0);
    set({
      totalWorkers: saved.totalWorkers,
      totalWorkersLost: saved.totalWorkersLost,
      assignments: saved.assignments,
      workerSkillXp: saved.workerSkillXp,
      claimedMilestones: saved.claimedMilestones,
      availableWorkers: saved.totalWorkers - assigned,
    });
  },
}));
