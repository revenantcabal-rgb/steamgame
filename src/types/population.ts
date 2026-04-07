export interface WorkerAssignment {
  id: string;
  /** Which gathering skill (scavenging, foraging, etc.) */
  skillId: string;
  /** Which sub-activity within that skill */
  subActivityId: string;
  /** Number of workers assigned */
  workerCount: number;
  /** Seconds elapsed on current gathering trip */
  tripProgress: number;
  /** Total trips completed */
  tripsCompleted: number;
  /** Total resources gathered by this assignment */
  totalResourcesGathered: Record<string, number>;
  /** Workers lost on this assignment (cumulative) */
  workersLost: number;
}

export interface RespawningWorker {
  /** Timestamp when the worker died */
  diedAt: number;
  /** Timestamp when the worker will be available again */
  respawnAt: number;
  /** Last assigned skill (for Golden Cap auto-reassign) */
  lastSkillId?: string;
  /** Last assigned sub-activity (for Golden Cap auto-reassign) */
  lastSubActivityId?: string;
}

/** Worker respawn time in milliseconds (3 minutes) */
export const WORKER_RESPAWN_MS = 180_000;

/** Maximum population capacity */
export const POPULATION_CAP = 50;

export interface PopulationState {
  /** Total workers available (not assigned) */
  availableWorkers: number;
  /** Total workers owned (available + assigned, NOT counting respawning) */
  totalWorkers: number;
  /** Total workers lost (cumulative death counter for stats) */
  totalWorkersLost: number;
  /** Active assignments */
  assignments: WorkerAssignment[];
  /** Workers currently respawning after death */
  respawningWorkers: RespawningWorker[];
  /** Worker skill levels (XP accumulated per gathering skill) */
  workerSkillXp: Record<string, number>;
  /** Milestones already claimed (to prevent double-claiming) */
  claimedMilestones: string[];
  /** Global combat kill counter for population growth */
  combatKillCounter: number;
}

/** Worker count scaling for gathering */
export interface WorkerScaling {
  speedMultiplier: number;
  yieldMultiplier: number;
  deathRiskPerTrip: number;
}

export function getWorkerScaling(workerCount: number): WorkerScaling {
  if (workerCount >= 6) return { speedMultiplier: 1.4 + (workerCount - 5) * 0.1, yieldMultiplier: 1.4 + (workerCount - 5) * 0.1, deathRiskPerTrip: 0 };
  switch (workerCount) {
    case 1: return { speedMultiplier: 0.5, yieldMultiplier: 0.6, deathRiskPerTrip: 0.15 };
    case 2: return { speedMultiplier: 0.8, yieldMultiplier: 0.8, deathRiskPerTrip: 0.05 };
    case 3: return { speedMultiplier: 1.0, yieldMultiplier: 1.0, deathRiskPerTrip: 0.01 };
    case 4: return { speedMultiplier: 1.2, yieldMultiplier: 1.2, deathRiskPerTrip: 0.005 };
    case 5: return { speedMultiplier: 1.4, yieldMultiplier: 1.4, deathRiskPerTrip: 0.001 };
    default: return { speedMultiplier: 0, yieldMultiplier: 0, deathRiskPerTrip: 0 };
  }
}

/** Worker skill level from XP (uses simplified curve) */
export function workerSkillLevel(xp: number): number {
  let level = 1;
  while (level < 100) {
    const needed = Math.floor(50 * Math.pow(level + 1, 2.5));
    if (xp < needed) break;
    xp -= needed;
    level++;
  }
  return level;
}

/** Yield bonus from worker skill level */
export function workerSkillBonus(level: number): number {
  if (level >= 76) return 0.50;
  if (level >= 51) return 0.35;
  if (level >= 26) return 0.20;
  if (level >= 11) return 0.10;
  return 0;
}
