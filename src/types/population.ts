// ============================
// Worker Rank System
// ============================
export type WorkerRank = 'recruit' | 'veteran' | 'grandfather' | 'legend';

export interface WorkerRankDefinition {
  id: WorkerRank;
  name: string;
  color: string;
  minDispatches: number;
  bonuses: {
    yield: number;           // % yield bonus
    survivability: number;   // % survivability bonus
    tripSpeed: number;       // % trip speed bonus
    rareDrop: number;        // % rare drop bonus
    xp: number;              // % XP bonus
  };
}

export const WORKER_RANKS: WorkerRankDefinition[] = [
  { id: 'recruit', name: 'Recruit', color: '#888888', minDispatches: 0, bonuses: { yield: 0, survivability: 0, tripSpeed: 0, rareDrop: 0, xp: 0 } },
  { id: 'veteran', name: 'Veteran', color: '#27ae60', minDispatches: 50, bonuses: { yield: 5, survivability: 5, tripSpeed: 3, rareDrop: 0, xp: 0 } },
  { id: 'grandfather', name: 'Grandfather', color: '#3498db', minDispatches: 250, bonuses: { yield: 12, survivability: 12, tripSpeed: 8, rareDrop: 5, xp: 0 } },
  { id: 'legend', name: 'Legend', color: '#f1c40f', minDispatches: 1000, bonuses: { yield: 20, survivability: 20, tripSpeed: 15, rareDrop: 10, xp: 10 } },
];

export function getWorkerRank(totalDispatches: number): WorkerRank {
  if (totalDispatches >= 1000) return 'legend';
  if (totalDispatches >= 250) return 'grandfather';
  if (totalDispatches >= 50) return 'veteran';
  return 'recruit';
}

export function getWorkerRankDef(rank: WorkerRank): WorkerRankDefinition {
  return WORKER_RANKS.find(r => r.id === rank) || WORKER_RANKS[0];
}

export function getWorkerRankBonuses(rank: WorkerRank): WorkerRankDefinition['bonuses'] {
  return getWorkerRankDef(rank).bonuses;
}

// ============================
// Individual Worker Stats
// ============================
export interface WorkerStats {
  strength: number;     // Yield bonus (+0.5%/pt)
  endurance: number;    // Survivability formula input
  perception: number;   // Rare drop chance (+0.3%/pt)
  agility: number;      // Trip speed reduction (+0.3%/pt)
  intellect: number;    // XP gain bonus (+0.4%/pt)
}

export interface IndividualWorker {
  id: string;
  name: string;
  stats: WorkerStats;
  rank: WorkerRank;
  totalDispatches: number;
  dispatchesBySkill: Record<string, number>;
  /** Worker level: floor(1 + sqrt(totalDispatches / 5)) */
  level: number;
  /** Current assignment ID (null if idle) */
  currentAssignmentId: string | null;
  /** Building this worker is assigned to (null if not in encampment) */
  encampmentBuildingId: string | null;
  /** Is this worker currently respawning? */
  isRespawning: boolean;
  respawnAt: number | null;
}

/** Stat growth mapping: which stats grow from which gathering skill */
export const STAT_GROWTH_MAP: Record<string, { primary: keyof WorkerStats; secondary: keyof WorkerStats }> = {
  scavenging: { primary: 'strength', secondary: 'endurance' },
  foraging: { primary: 'perception', secondary: 'intellect' },
  salvage_hunting: { primary: 'intellect', secondary: 'strength' },
  water_reclamation: { primary: 'endurance', secondary: 'agility' },
  prospecting: { primary: 'strength', secondary: 'perception' },
};

/** Calculate worker level from total dispatches */
export function getWorkerLevel(totalDispatches: number): number {
  return Math.floor(1 + Math.sqrt(totalDispatches / 5));
}

/** Calculate survivability factor (0-1 multiplier on base death risk) */
export function getSurvivabilityFactor(endurance: number, totalDispatches: number): number {
  return 1 / (1 + 0.02 * endurance + 0.005 * totalDispatches);
}

/** Get survivability percentage for display */
export function getSurvivabilityPercent(endurance: number, totalDispatches: number, baseDeathRisk: number): number {
  const effectiveRisk = baseDeathRisk * getSurvivabilityFactor(endurance, totalDispatches);
  return Math.min(99.9, (1 - effectiveRisk) * 100);
}

/** Generate random starting stats for a new worker */
export function generateStartingStats(): WorkerStats {
  return {
    strength: 3 + Math.floor(Math.random() * 5),
    endurance: 3 + Math.floor(Math.random() * 5),
    perception: 3 + Math.floor(Math.random() * 5),
    agility: 3 + Math.floor(Math.random() * 5),
    intellect: 3 + Math.floor(Math.random() * 5),
  };
}

/** Worker name generator */
const WORKER_FIRST_NAMES = [
  'Ash', 'Blaze', 'Cinder', 'Dusk', 'Ember', 'Flint', 'Grit', 'Haze', 'Iron', 'Jolt',
  'Knox', 'Lynx', 'Mako', 'Nix', 'Onyx', 'Pike', 'Quill', 'Rust', 'Sable', 'Thorn',
  'Uri', 'Vex', 'Wren', 'Xander', 'Yara', 'Zeke', 'Bane', 'Cole', 'Drake', 'Fang',
  'Grex', 'Hawk', 'Jax', 'Kael', 'Lark', 'Moss', 'Nash', 'Orin', 'Pax', 'Rex',
  'Sage', 'Taz', 'Vale', 'Wolf', 'Zara', 'Bolt', 'Crow', 'Dirk', 'Edge', 'Fury',
];
const WORKER_LAST_NAMES = [
  'Ironhand', 'Ashwalker', 'Stonecarver', 'Dustborn', 'Rustbreaker', 'Thornback',
  'Darkwell', 'Scrapjaw', 'Boneyard', 'Sandwalker', 'Steelgut', 'Mudfoot',
  'Grimeknuckle', 'Cinderpath', 'Blackwater', 'Redearth', 'Smokesteel', 'Grimthorn',
  'Deadwire', 'Coldforge', 'Rattlesnag', 'Blightheart', 'Stormgrit', 'Wasteborn',
  'Shellback', 'Rubblekin', 'Vipercoil', 'Duststep', 'Slagarm', 'Burnside',
];

export function generateWorkerName(): string {
  const first = WORKER_FIRST_NAMES[Math.floor(Math.random() * WORKER_FIRST_NAMES.length)];
  const last = WORKER_LAST_NAMES[Math.floor(Math.random() * WORKER_LAST_NAMES.length)];
  return `${first} ${last}`;
}

/** Create a new individual worker */
export function createIndividualWorker(): IndividualWorker {
  return {
    id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: generateWorkerName(),
    stats: generateStartingStats(),
    rank: 'recruit',
    totalDispatches: 0,
    dispatchesBySkill: {},
    level: 1,
    currentAssignmentId: null,
    encampmentBuildingId: null,
    isRespawning: false,
    respawnAt: null,
  };
}

// ============================
// Original types (preserved)
// ============================
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
  /** IDs of individual workers assigned */
  assignedWorkerIds: string[];
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

/** Base population capacity */
export const BASE_POPULATION_CAP = 50;

/** Maximum population capacity (base + encampment bunkhouse bonus) */
export function getPopulationCap(): number {
  try {
    const { getEncampmentBonuses } = require('../engine/EncampmentBonuses');
    return BASE_POPULATION_CAP + (getEncampmentBonuses().worker_capacity || 0);
  } catch {
    return BASE_POPULATION_CAP;
  }
}

/** @deprecated Use getPopulationCap() instead */
export const POPULATION_CAP = BASE_POPULATION_CAP;

export interface PopulationState {
  /** Total workers available (not assigned) */
  availableWorkers: number;
  /** Total workers owned (available + assigned, NOT counting respawning) */
  totalWorkers: number;
  /** Total workers lost (cumulative death counter for stats) */
  totalWorkersLost: number;
  /** Individual worker roster */
  workers: IndividualWorker[];
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
