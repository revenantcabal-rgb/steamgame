export type SkillCategory = 'gathering' | 'production' | 'combat';

export interface SubActivity {
  id: string;
  name: string;
  description: string;
  /** Resource(s) gained from this activity */
  resourceDrops: { resourceId: string; minQty: number; maxQty: number }[];
  /** XP per action for this activity */
  xpPerAction: number;
  /** Is this the mixed/sweep activity? */
  isMixed: boolean;
  /** Resources consumed per action (production recipes) */
  resourceInputs?: { resourceId: string; quantity: number }[];
  /** Minimum skill level to unlock this recipe */
  levelReq?: number;
  /** If set, produces a gear item via LootEngine instead of resources */
  gearTemplateId?: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  /** Base seconds per action */
  baseActionTime: number;
  /** Base XP per action (used for non-gathering skills or as fallback) */
  baseXp: number;
  /** Sub-activities (gathering skills have 3 focused + 1 mixed) */
  subActivities?: SubActivity[];
  /** IDs of skills whose outputs are required as inputs (for production skills) */
  inputSkills?: string[];
}

export interface PlayerSkill {
  skillId: string;
  level: number;
  xp: number;
  isActive: boolean;
}

const MAX_LEVEL = 100;

/** XP required for a single level (not cumulative) */
export function xpForSingleLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(50 * Math.pow(level, 2.5));
}

/** Total cumulative XP required to reach a given level */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 2; i <= level; i++) {
    total += xpForSingleLevel(i);
  }
  return total;
}

/** XP needed for just the next level */
export function xpToNextLevel(currentLevel: number, currentXp: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  return xpForLevel(currentLevel + 1) - currentXp;
}

/** Calculate level from total XP */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && xpForLevel(level + 1) <= totalXp) {
    level++;
  }
  return level;
}

/** Get gathering speed multiplier based on level */
export function getGatheringSpeedMultiplier(level: number): { actionTime: number; qtyMultiplier: number; xpMultiplier: number } {
  if (level >= 81) return { actionTime: 1.5, qtyMultiplier: 2.8, xpMultiplier: 3.0 };
  if (level >= 61) return { actionTime: 2.0, qtyMultiplier: 2.2, xpMultiplier: 2.5 };
  if (level >= 41) return { actionTime: 2.5, qtyMultiplier: 1.8, xpMultiplier: 2.0 };
  if (level >= 26) return { actionTime: 3.0, qtyMultiplier: 1.5, xpMultiplier: 1.6 };
  if (level >= 11) return { actionTime: 3.5, qtyMultiplier: 1.2, xpMultiplier: 1.3 };
  return { actionTime: 4.0, qtyMultiplier: 1.0, xpMultiplier: 1.0 };
}
