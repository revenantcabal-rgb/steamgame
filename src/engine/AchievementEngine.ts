import { ACHIEVEMENTS } from '../config/achievements';
import type { AchievementDef } from '../config/achievements';

export interface AchievementProgress {
  unlockedIds: string[];
  stats: {
    heroCount: number;
    maxHeroLevel: number;
    gearCrafted: number;
    expeditionsCompleted: number;
    expeditionsHard: number;
    expeditionsExtreme: number;
    bossKills: number;
    marketTrades: number;
    maxSkillLevel: number;
    resourceTotal: number;
  };
}

export function createDefaultProgress(): AchievementProgress {
  return {
    unlockedIds: [],
    stats: {
      heroCount: 0, maxHeroLevel: 0, gearCrafted: 0,
      expeditionsCompleted: 0, expeditionsHard: 0, expeditionsExtreme: 0,
      bossKills: 0, marketTrades: 0, maxSkillLevel: 0, resourceTotal: 0,
    },
  };
}

export function checkAchievements(progress: AchievementProgress): string[] {
  const newlyUnlocked: string[] = [];

  for (const ach of ACHIEVEMENTS) {
    if (progress.unlockedIds.includes(ach.id)) continue;
    if (isConditionMet(ach, progress)) {
      newlyUnlocked.push(ach.id);
    }
  }

  return newlyUnlocked;
}

function isConditionMet(ach: AchievementDef, progress: AchievementProgress): boolean {
  const s = progress.stats;
  switch (ach.condition.type) {
    case 'hero_count': return s.heroCount >= ach.condition.target;
    case 'hero_level': return s.maxHeroLevel >= ach.condition.target;
    case 'gear_crafted': return s.gearCrafted >= ach.condition.target;
    case 'expedition_complete':
      if (ach.condition.difficulty === 'hard') return s.expeditionsHard >= ach.condition.target;
      if (ach.condition.difficulty === 'extreme') return s.expeditionsExtreme >= ach.condition.target;
      return s.expeditionsCompleted >= ach.condition.target;
    case 'boss_kills': return s.bossKills >= ach.condition.target;
    case 'market_trades': return s.marketTrades >= ach.condition.target;
    case 'skill_level': return s.maxSkillLevel >= ach.condition.target;
    case 'resource_total': return s.resourceTotal >= ach.condition.target;
    default: return false;
  }
}
