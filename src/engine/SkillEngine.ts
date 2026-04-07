import { SKILLS } from '../config/skills';
import { levelFromXp, getGatheringSpeedMultiplier } from '../types/skills';
import type { SubActivity } from '../types/skills';

export interface SkillTickResult {
  skillId: string;
  xpGained: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  previousLevel: number;
  resourcesGained: { resourceId: string; quantity: number }[];
}

/**
 * Process one action tick for a gathering skill with a selected sub-activity.
 */
export function processSkillTick(
  skillId: string,
  subActivityId: string | null,
  currentXp: number,
  currentLevel: number,
  xpMultiplier: number = 1,
  heroBonuses?: { gatheringSpeed: number; gatheringYield: number; xpBonus: number; rareResourceChance: number },
): SkillTickResult | null {
  const skillDef = SKILLS[skillId];
  if (!skillDef) return null;

  const scaling = getGatheringSpeedMultiplier(currentLevel);

  // Determine XP and drops based on sub-activity
  let baseXp = skillDef.baseXp;
  let activity: SubActivity | undefined;

  if (skillDef.subActivities && subActivityId) {
    activity = skillDef.subActivities.find(a => a.id === subActivityId);
    if (activity) {
      baseXp = activity.xpPerAction;
    }
  }

  const xpGained = Math.floor(baseXp * scaling.xpMultiplier * xpMultiplier * (1 + (heroBonuses?.xpBonus || 0) / 100));
  const newTotalXp = currentXp + xpGained;
  const newLevel = Math.min(100, levelFromXp(newTotalXp));
  const leveledUp = newLevel > currentLevel;

  // Roll resource drops
  const resourcesGained: { resourceId: string; quantity: number }[] = [];

  if (activity) {
    for (const drop of activity.resourceDrops) {
      const baseQty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
      const scaledQty = Math.max(1, Math.floor(baseQty * scaling.qtyMultiplier * (1 + (heroBonuses?.gatheringYield || 0) / 100)));
      const existing = resourcesGained.find(r => r.resourceId === drop.resourceId);
      if (existing) {
        existing.quantity += scaledQty;
      } else {
        resourcesGained.push({ resourceId: drop.resourceId, quantity: scaledQty });
      }
    }
  }

  return {
    skillId,
    xpGained,
    newTotalXp,
    newLevel,
    leveledUp,
    previousLevel: currentLevel,
    resourcesGained,
  };
}

/**
 * Get the action time for a skill at a given level.
 */
export function getActionTime(skillId: string, level: number): number {
  const skillDef = SKILLS[skillId];
  if (!skillDef) return 4;

  if (skillDef.category === 'gathering') {
    return getGatheringSpeedMultiplier(level).actionTime;
  }

  // Non-gathering skills get a small speed boost with level
  const speedBonus = 1 - (level / 100) * 0.15;
  return Math.max(1, Math.round(skillDef.baseActionTime * speedBonus * 10) / 10);
}
