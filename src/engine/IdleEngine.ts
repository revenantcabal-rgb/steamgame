import { SKILLS } from '../config/skills';
import { processSkillTick, getActionTime } from './SkillEngine';

const DEFAULT_IDLE_CAP_HOURS = 12;

export interface IdleState {
  idleSecondsUsedToday: number;
  idleCapSeconds: number;
  lastDailyReset: number;
  lastActiveTime: number;
}

export interface OfflineResult {
  secondsProcessed: number;
  skillResults: {
    skillId: string;
    xpGained: number;
    levelsGained: number;
    resourcesGained: { resourceId: string; quantity: number }[];
  }[];
  wasCapped: boolean;
}

export function createInitialIdleState(): IdleState {
  return {
    idleSecondsUsedToday: 0,
    idleCapSeconds: DEFAULT_IDLE_CAP_HOURS * 3600,
    lastDailyReset: getStartOfDay(Date.now()),
    lastActiveTime: Date.now(),
  };
}

export function checkDailyReset(state: IdleState, now: number): IdleState {
  const todayStart = getStartOfDay(now);
  if (todayStart > state.lastDailyReset) {
    return { ...state, idleSecondsUsedToday: 0, lastDailyReset: todayStart };
  }
  return state;
}

export function calculateOfflineProgress(
  activeSkillId: string | null,
  activeSubActivityId: string | null,
  skillLevels: Record<string, { level: number; xp: number }>,
  idleState: IdleState,
  now: number,
  xpMultiplier: number = 1,
): OfflineResult {
  if (!activeSkillId) {
    return { secondsProcessed: 0, skillResults: [], wasCapped: false };
  }

  const skillDef = SKILLS[activeSkillId];
  if (!skillDef) {
    return { secondsProcessed: 0, skillResults: [], wasCapped: false };
  }

  const elapsedSeconds = Math.floor((now - idleState.lastActiveTime) / 1000);
  const remainingCap = idleState.idleCapSeconds - idleState.idleSecondsUsedToday;
  const secondsToProcess = Math.min(elapsedSeconds, remainingCap);
  const wasCapped = elapsedSeconds > remainingCap;

  if (secondsToProcess <= 0) {
    return { secondsProcessed: 0, skillResults: [], wasCapped };
  }

  const skillState = skillLevels[activeSkillId] || { level: 1, xp: 0 };
  let currentXp = skillState.xp;
  let currentLevel = skillState.level;
  const startLevel = currentLevel;
  let totalXpGained = 0;
  const totalResources: Record<string, number> = {};

  const actionTime = getActionTime(activeSkillId, currentLevel);
  const totalActions = Math.floor(secondsToProcess / actionTime);

  for (let i = 0; i < totalActions; i++) {
    const result = processSkillTick(activeSkillId, activeSubActivityId, currentXp, currentLevel, xpMultiplier);
    if (!result) break;

    currentXp = result.newTotalXp;
    currentLevel = result.newLevel;
    totalXpGained += result.xpGained;

    for (const r of result.resourcesGained) {
      totalResources[r.resourceId] = (totalResources[r.resourceId] || 0) + r.quantity;
    }
  }

  return {
    secondsProcessed: secondsToProcess,
    skillResults: [{
      skillId: activeSkillId,
      xpGained: totalXpGained,
      levelsGained: currentLevel - startLevel,
      resourcesGained: Object.entries(totalResources).map(([resourceId, quantity]) => ({ resourceId, quantity })),
    }],
    wasCapped,
  };
}

function getStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
