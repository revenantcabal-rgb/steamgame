import { SKILLS } from '../config/skills';
import { getGatheringSpeedMultiplier } from '../types/skills';
import { getWorkerScaling, workerSkillLevel, workerSkillBonus } from '../types/population';
import type { WorkerAssignment } from '../types/population';

export interface TripResult {
  assignmentId: string;
  resourcesGained: { resourceId: string; quantity: number }[];
  xpGained: number;
  workerDied: boolean;
}

/**
 * Get the trip duration in seconds for an assignment.
 * Base is the gathering skill's action time, modified by worker count.
 */
export function getTripDuration(assignment: WorkerAssignment, workerSkillXp: Record<string, number>): number {
  const skillDef = SKILLS[assignment.skillId];
  if (!skillDef) return 10;

  // Use level 1 base speed since workers have their own progression
  const baseTime = skillDef.baseActionTime;
  const scaling = getWorkerScaling(assignment.workerCount);

  // Workers are slower than heroes - multiply base time by 2, then apply worker speed
  const workerBaseTime = baseTime * 2;
  const tripTime = workerBaseTime / Math.max(0.1, scaling.speedMultiplier);

  return Math.max(2, Math.round(tripTime));
}

/**
 * Process a completed gathering trip for an assignment.
 */
export function processTrip(assignment: WorkerAssignment, workerSkillXp: Record<string, number>): TripResult {
  const skillDef = SKILLS[assignment.skillId];
  if (!skillDef) {
    return { assignmentId: assignment.id, resourcesGained: [], xpGained: 0, workerDied: false };
  }

  const subActivity = skillDef.subActivities?.find(a => a.id === assignment.subActivityId);
  if (!subActivity) {
    return { assignmentId: assignment.id, resourcesGained: [], xpGained: 0, workerDied: false };
  }

  const scaling = getWorkerScaling(assignment.workerCount);
  const wLevel = workerSkillLevel(workerSkillXp[assignment.skillId] || 0);
  const skillBonus = workerSkillBonus(wLevel);

  // Calculate resource yields
  const resourcesGained: { resourceId: string; quantity: number }[] = [];
  for (const drop of subActivity.resourceDrops) {
    const baseQty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
    const scaledQty = Math.max(1, Math.floor(baseQty * scaling.yieldMultiplier * (1 + skillBonus)));
    resourcesGained.push({ resourceId: drop.resourceId, quantity: scaledQty });
  }

  // Calculate worker XP gain
  const xpGained = Math.floor(subActivity.xpPerAction * 0.5); // Workers gain XP slower than player

  // Roll for worker death
  const workerDied = Math.random() < scaling.deathRiskPerTrip;

  return {
    assignmentId: assignment.id,
    resourcesGained,
    xpGained,
    workerDied,
  };
}

/**
 * Population milestones that grant workers.
 */
export const POPULATION_MILESTONES = [
  { id: 'start', description: 'Starting workers', workers: 3, auto: true },
  { id: 'tutorial_complete', description: 'Complete Tutorial', workers: 2 },
  { id: 'first_hero', description: 'First hero recruited', workers: 1 },
  { id: 'gathering_15', description: 'Any gathering skill Lv.15', workers: 2 },
  { id: 'gathering_30', description: 'Any gathering skill Lv.30', workers: 2 },
  { id: 'first_pvp_win', description: 'First PVP victory', workers: 1 },
  { id: 'join_clan', description: 'Join a Clan', workers: 2 },
  { id: 'gathering_45', description: 'Any gathering skill Lv.45', workers: 2 },
  { id: 'gathering_60', description: 'Any gathering skill Lv.60', workers: 2 },
  { id: 'gathering_80', description: 'Any gathering skill Lv.80', workers: 2 },
  { id: 'gathering_100', description: 'Any gathering skill Lv.100', workers: 3 },
  { id: 'all_gathering_100', description: 'All gathering skills Lv.100', workers: 2 },
] as const;
