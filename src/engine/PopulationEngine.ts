import { SKILLS } from '../config/skills';
import { getGatheringSpeedMultiplier } from '../types/skills';
import { getWorkerScaling, workerSkillLevel, workerSkillBonus, getSurvivabilityFactor, getWorkerRankBonuses, getWorkerRank } from '../types/population';
import type { WorkerAssignment, IndividualWorker } from '../types/population';
import { getPremiumBonuses } from './PremiumBonuses';
import { getEncampmentBonuses } from './EncampmentBonuses';

export interface TripResult {
  assignmentId: string;
  resourcesGained: { resourceId: string; quantity: number }[];
  xpGained: number;
  workerDied: boolean;
}

/**
 * Get the trip duration in seconds for an assignment.
 * Applies: base scaling, encampment worker_speed, encampment gathering_speed_[skill].
 */
export function getTripDuration(assignment: WorkerAssignment, workerSkillXp: Record<string, number>): number {
  const skillDef = SKILLS[assignment.skillId];
  if (!skillDef) return 10;

  const baseTime = skillDef.baseActionTime;
  const scaling = getWorkerScaling(assignment.workerCount);
  const encampment = getEncampmentBonuses();

  // Workers are slower than heroes - multiply base time by 2, then apply worker speed
  const workerBaseTime = baseTime * 2;
  const encampmentSpeedBonus = 1 + (encampment.worker_speed || 0) / 100;
  const gatheringSpeedKey = `gathering_speed_${assignment.skillId}` as keyof typeof encampment;
  const gatheringSpeedBonus = 1 + ((encampment[gatheringSpeedKey] as number) || 0) / 100;

  const tripTime = workerBaseTime / Math.max(0.1, scaling.speedMultiplier * encampmentSpeedBonus * gatheringSpeedBonus);

  return Math.max(2, Math.round(tripTime));
}

/**
 * Process a completed gathering trip for an assignment.
 * Applies encampment bonuses, worker rank bonuses, and individual worker stats.
 */
export function processTrip(
  assignment: WorkerAssignment,
  workerSkillXp: Record<string, number>,
  assignedWorkers?: IndividualWorker[],
): TripResult {
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
  const encampment = getEncampmentBonuses();

  // Compute average worker stat bonuses and rank bonuses from assigned workers
  let avgStrengthBonus = 0;
  let avgPerceptionBonus = 0;
  let avgIntellectBonus = 0;
  let avgRankYield = 0;
  let avgRankRareDrop = 0;
  let avgRankXp = 0;

  if (assignedWorkers && assignedWorkers.length > 0) {
    for (const w of assignedWorkers) {
      avgStrengthBonus += w.stats.strength * 0.005;
      avgPerceptionBonus += w.stats.perception * 0.003;
      avgIntellectBonus += w.stats.intellect * 0.004;
      const rankBonuses = getWorkerRankBonuses(w.rank);
      avgRankYield += rankBonuses.yield / 100;
      avgRankRareDrop += rankBonuses.rareDrop / 100;
      avgRankXp += rankBonuses.xp / 100;
    }
    const count = assignedWorkers.length;
    avgStrengthBonus /= count;
    avgPerceptionBonus /= count;
    avgIntellectBonus /= count;
    avgRankYield /= count;
    avgRankRareDrop /= count;
    avgRankXp /= count;
  }

  // Encampment yield bonus
  const encampmentYieldBonus = (encampment.gathering_yield_all || 0) / 100;

  // Calculate resource yields
  const resourcesGained: { resourceId: string; quantity: number }[] = [];
  for (const drop of subActivity.resourceDrops) {
    const baseQty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
    const totalYieldMult = scaling.yieldMultiplier
      * (1 + skillBonus)
      * (1 + encampmentYieldBonus)
      * (1 + avgStrengthBonus)
      * (1 + avgRankYield);
    const scaledQty = Math.max(1, Math.floor(baseQty * totalYieldMult));
    resourcesGained.push({ resourceId: drop.resourceId, quantity: scaledQty });
  }

  // Rare Icqor Chess Piece drop
  const activityTier = (subActivity.levelReq || 0) >= 30 ? 3 : (subActivity.levelReq || 0) >= 15 ? 2 : 1;
  const baseIcqorChance = activityTier === 3 ? 0.005 : activityTier === 2 ? 0.003 : 0.001;
  const rareDropMult = (1 + (encampment.rare_drop_chance || 0) / 100) * (1 + avgPerceptionBonus) * (1 + avgRankRareDrop);
  if (Math.random() < baseIcqorChance * rareDropMult) {
    resourcesGained.push({ resourceId: 'icqor_chess_piece', quantity: 1 });
  }

  // Calculate worker XP gain
  const xpGained = Math.floor(
    subActivity.xpPerAction * 0.5
    * getPremiumBonuses().xpMultiplier
    * (1 + avgIntellectBonus)
    * (1 + avgRankXp)
  );

  // Roll for worker death — apply individual survivability + encampment + rank bonuses
  let workerDied = false;
  const baseDeathRisk = scaling.deathRiskPerTrip;
  if (baseDeathRisk > 0 && assignedWorkers && assignedWorkers.length > 0) {
    // Use the average survivability of all assigned workers
    let avgSurvivabilityFactor = 0;
    let avgRankSurvivability = 0;
    for (const w of assignedWorkers) {
      avgSurvivabilityFactor += getSurvivabilityFactor(w.stats.endurance, w.totalDispatches);
      avgRankSurvivability += getWorkerRankBonuses(w.rank).survivability / 100;
    }
    avgSurvivabilityFactor /= assignedWorkers.length;
    avgRankSurvivability /= assignedWorkers.length;

    const encampmentSurvivability = (encampment.worker_survivability || 0) / 100;
    const effectiveDeathRisk = baseDeathRisk
      * avgSurvivabilityFactor
      * Math.max(0.01, 1 - encampmentSurvivability)
      * Math.max(0.01, 1 - avgRankSurvivability);

    workerDied = Math.random() < effectiveDeathRisk;
  } else if (baseDeathRisk > 0) {
    // Fallback: no individual workers available (shouldn't happen but safe)
    workerDied = Math.random() < baseDeathRisk;
  }

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
