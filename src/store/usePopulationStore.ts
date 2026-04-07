import { create } from 'zustand';
import { getTripDuration, processTrip, POPULATION_MILESTONES } from '../engine/PopulationEngine';
import { SKILLS, GATHERING_SKILLS } from '../config/skills';
import { levelFromXp } from '../types/skills';
import type { WorkerAssignment, PopulationState, RespawningWorker } from '../types/population';
import { WORKER_RESPAWN_MS, POPULATION_CAP } from '../types/population';
import { useGameStore } from './useGameStore';
import { useHeroStore } from './useHeroStore';
import { useLootTrackerStore } from './useLootTrackerStore';
import { useStoryStore } from './useStoryStore';
import { getPremiumBonuses } from '../engine/PremiumBonuses';

interface PopulationActions {
  /** Create a new worker assignment */
  createAssignment: (skillId: string, subActivityId: string, workerCount: number) => boolean;
  /** Remove an assignment and free workers */
  removeAssignment: (assignmentId: string) => void;
  /** Adjust worker count on an existing assignment */
  adjustWorkers: (assignmentId: string, newCount: number) => void;
  /** Process one second of population work */
  tick: () => void;
  /** Check and claim any eligible milestones */
  checkMilestones: () => void;
  /** Record a combat kill; every 10 kills rolls for population gain */
  addCombatKill: (zoneTier: number) => void;
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
  respawningWorkers?: RespawningWorker[];
  workerSkillXp: Record<string, number>;
  claimedMilestones: string[];
  combatKillCounter?: number;
}

let nextAssignmentId = 1;
let milestoneCheckCounter = 0;

export const usePopulationStore = create<PopulationState & PopulationActions>((set, get) => ({
  availableWorkers: 3,
  totalWorkers: 3,
  totalWorkersLost: 0,
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
    // Check milestones every 5 ticks (5 seconds)
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
      set(s => ({
        respawningWorkers: stillRespawning,
        totalWorkers: s.totalWorkers + respawnedCount,
        availableWorkers: s.availableWorkers + respawnedCount,
      }));

      // Golden Cap: auto-reassign workers to their previous tasks
      if (getPremiumBonuses().autoAssignWorkers && autoAssignQueue.length > 0) {
        for (const rw of autoAssignQueue) {
          const skillDef = SKILLS[rw.lastSkillId!];
          if (!skillDef || skillDef.category !== 'gathering') continue;
          const sub = skillDef.subActivities?.find(a => a.id === rw.lastSubActivityId);
          if (!sub) continue;
          // Check level requirement
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

    for (const assignment of state.assignments) {
      const tripDuration = getTripDuration(assignment, state.workerSkillXp);
      const newProgress = assignment.tripProgress + 1;

      if (newProgress >= tripDuration) {
        // Trip complete - process results
        const result = processTrip(assignment, state.workerSkillXp);

        // Add resources to game store
        const resources = { ...gameStore.resources };
        const resNames: string[] = [];
        const skillDef = SKILLS[assignment.skillId];
        for (const r of result.resourcesGained) {
          resources[r.resourceId] = (resources[r.resourceId] || 0) + r.quantity;
          resNames.push(`${r.quantity}x ${r.resourceId.replace(/_/g, ' ')}`);
          useLootTrackerStore.getState().trackLoot(r.resourceId, r.quantity, 'worker', skillDef?.name || assignment.skillId);
        }
        useGameStore.setState({ resources });

        // Add worker XP (worker-specific progression)
        newWorkerSkillXp[assignment.skillId] = (newWorkerSkillXp[assignment.skillId] || 0) + result.xpGained;

        // Also grant a portion of XP to the player's skill (25% of worker XP)
        const playerXpShare = Math.max(1, Math.floor(result.xpGained * 0.25));
        const playerSkills = { ...gameStore.skills };
        const currentSkill = playerSkills[assignment.skillId];
        if (currentSkill) {
          const newTotalXp = currentSkill.xp + playerXpShare;
          const newLevel = Math.min(100, levelFromXp(newTotalXp));
          playerSkills[assignment.skillId] = { level: newLevel, xp: newTotalXp };
          useGameStore.setState({ skills: playerSkills });

          if (newLevel > currentSkill.level) {
            gameStore.addLog(`LEVEL UP! ${skillDef?.name || assignment.skillId} is now level ${newLevel}! (worker training)`, 'levelup');
            useStoryStore.getState().checkObjective('reach_skill_level', assignment.skillId, newLevel);
          }
        }

        // Update assignment totals
        const updatedTotals = { ...assignment.totalResourcesGathered };
        for (const r of result.resourcesGained) {
          updatedTotals[r.resourceId] = (updatedTotals[r.resourceId] || 0) + r.quantity;
        }

        if (result.workerDied && assignment.workerCount > 0) {
          // Worker died — enters respawn queue (3 min recovery)
          workersLostThisTick++;
          const deathNow = Date.now();
          const respawnMs = Math.floor(WORKER_RESPAWN_MS * getPremiumBonuses().workerRespawnMultiplier);
          newRespawning.push({ diedAt: deathNow, respawnAt: deathNow + respawnMs, lastSkillId: assignment.skillId, lastSubActivityId: assignment.subActivityId });
          const skillDef = SKILLS[assignment.skillId];
          gameStore.addLog(
            `A worker was injured during ${skillDef?.name || assignment.skillId} and needs 3 min to recover. (${assignment.workerCount - 1} remain on duty)`,
            'error',
          );

          if (assignment.workerCount <= 1) {
            // Last worker on this assignment, remove it
            gameStore.addLog(`All workers on this assignment are recovering. Task paused.`, 'error');
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

    set(s => ({
      assignments: newAssignments,
      workerSkillXp: newWorkerSkillXp,
      respawningWorkers: [...s.respawningWorkers, ...newRespawning],
      totalWorkersLost: s.totalWorkersLost + workersLostThisTick,
      totalWorkers: s.totalWorkers - workersLostThisTick,
      availableWorkers: s.availableWorkers + workersFreed,
    }));
  },

  checkMilestones: () => {
    const state = get();
    const gameStore = useGameStore.getState();
    const gatheringSkillIds = GATHERING_SKILLS.map(s => s.id);

    // Get current game state for checking conditions
    const heroCount = useHeroStore.getState().heroes.length;
    const skills = gameStore.skills;

    // Helper: highest gathering skill level
    const maxGatheringLevel = Math.max(0, ...gatheringSkillIds.map(id => skills[id]?.level || 0));
    const allGatheringAt100 = gatheringSkillIds.length > 0 && gatheringSkillIds.every(id => (skills[id]?.level || 0) >= 100);

    // Story completion check (tutorial = story 1 complete)
    const storyState = useStoryStore.getState();
    const tutorialComplete = storyState.completedStories?.includes(1) ?? false;

    // Check each milestone
    let workersGained = 0;
    const newClaimed = [...state.claimedMilestones];

    for (const milestone of POPULATION_MILESTONES) {
      if (newClaimed.includes(milestone.id)) continue; // Already claimed
      if (milestone.id === 'start') continue; // Auto-claimed at init

      let eligible = false;
      switch (milestone.id) {
        case 'tutorial_complete':
          eligible = tutorialComplete;
          break;
        case 'first_hero':
          eligible = heroCount >= 1;
          break;
        case 'gathering_15':
          eligible = maxGatheringLevel >= 15;
          break;
        case 'gathering_30':
          eligible = maxGatheringLevel >= 30;
          break;
        case 'gathering_45':
          eligible = maxGatheringLevel >= 45;
          break;
        case 'gathering_60':
          eligible = maxGatheringLevel >= 60;
          break;
        case 'gathering_80':
          eligible = maxGatheringLevel >= 80;
          break;
        case 'gathering_100':
          eligible = maxGatheringLevel >= 100;
          break;
        case 'all_gathering_100':
          eligible = allGatheringAt100;
          break;
        // PVP and clan milestones — skip for now (systems may not exist yet)
        case 'first_pvp_win':
        case 'join_clan':
          eligible = false;
          break;
      }

      if (eligible) {
        newClaimed.push(milestone.id);
        workersGained += milestone.workers;
        gameStore.addLog(
          `Milestone: ${milestone.description}! +${milestone.workers} worker${milestone.workers > 1 ? 's' : ''}.`,
          'levelup',
        );
      }
    }

    if (workersGained > 0) {
      set({
        claimedMilestones: newClaimed,
        totalWorkers: state.totalWorkers + workersGained,
        availableWorkers: state.availableWorkers + workersGained,
      });
    }
  },

  addCombatKill: (zoneTier) => {
    const state = get();
    const newCounter = state.combatKillCounter + 1;

    if (newCounter % 10 === 0) {
      // Every 10 kills, roll for population gain
      // Chance scales with tier: T1=10%, T2=15%, T3=20%, T4=25%, T5+=30%
      const chance = Math.min(0.30, 0.10 + (zoneTier - 1) * 0.05);
      const totalPop = state.totalWorkers + state.respawningWorkers.length;

      if (totalPop < POPULATION_CAP && Math.random() < chance) {
        useGameStore.getState().addLog(
          `A survivor was found during combat! +1 worker. (${state.totalWorkers + 1} total)`,
          'levelup',
        );
        set({
          combatKillCounter: newCounter,
          totalWorkers: state.totalWorkers + 1,
          availableWorkers: state.availableWorkers + 1,
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
      assignments: state.assignments,
      respawningWorkers: state.respawningWorkers,
      workerSkillXp: state.workerSkillXp,
      claimedMilestones: state.claimedMilestones,
      combatKillCounter: state.combatKillCounter,
    };
  },

  loadState: (saved) => {
    const assigned = saved.assignments.reduce((sum, a) => sum + a.workerCount, 0);
    set({
      totalWorkers: saved.totalWorkers,
      totalWorkersLost: saved.totalWorkersLost,
      assignments: saved.assignments,
      respawningWorkers: saved.respawningWorkers || [],
      workerSkillXp: saved.workerSkillXp,
      claimedMilestones: saved.claimedMilestones,
      combatKillCounter: saved.combatKillCounter || 0,
      availableWorkers: saved.totalWorkers - assigned,
    });
  },
}));
