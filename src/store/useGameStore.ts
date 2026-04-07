import { create } from 'zustand';
import { SKILL_LIST, SKILLS } from '../config/skills';
import { createInitialIdleState, checkDailyReset, calculateOfflineProgress } from '../engine/IdleEngine';
import { processSkillTick, getActionTime } from '../engine/SkillEngine';
import { craftGear } from '../engine/LootEngine';
import { GEAR_TEMPLATES } from '../config/gear';
import { levelFromXp } from '../types/skills';
import type { IdleState, OfflineResult } from '../engine/IdleEngine';
import { useEquipmentStore } from './useEquipmentStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';

export interface GameLog {
  id: number;
  message: string;
  timestamp: number;
  type: 'info' | 'levelup' | 'drop' | 'error' | 'system';
}

export interface QueuedAction {
  skillId: string;
  subActivityId: string;
  repeatCount: number;   // 0 = infinite
  completedCount: number;
}

export type GatheringGoalType = 'none' | 'collect_amount' | 'reach_level';

export interface GatheringGoal {
  type: GatheringGoalType;
  /** For collect_amount: resource ID to track */
  resourceId?: string;
  /** For collect_amount: target quantity */
  targetAmount?: number;
  /** For reach_level: target level */
  targetLevel?: number;
}

interface GameState {
  playerName: string;
  totalPlayTime: number;

  // Skills
  skills: Record<string, { level: number; xp: number }>;
  activeSkillId: string | null;
  /** Selected sub-activity for the active gathering skill */
  activeSubActivityId: string | null;
  actionProgress: number;
  /** Goal for current gathering/training session */
  gatheringGoal: GatheringGoal;

  // Action control
  isActionRunning: boolean;
  actionQueue: QueuedAction[];
  currentActionRepeatTarget: number;  // 0 = infinite, >0 = stop after N
  currentActionRepeatCount: number;   // how many completed

  // Resources
  resources: Record<string, number>;

  // Idle
  idle: IdleState;

  // XP multiplier (from boosts)
  xpMultiplier: number;

  // Game log
  logs: GameLog[];
  nextLogId: number;

  // Actions
  setActiveSkill: (skillId: string | null, subActivityId?: string | null) => void;
  setSubActivity: (subActivityId: string) => void;
  setGatheringGoal: (goal: GatheringGoal) => void;
  startAction: () => void;
  stopAction: () => void;
  setRepeatTarget: (count: number) => void;
  addToQueue: (skillId: string, subActivityId: string, repeatCount: number) => void;
  removeFromQueue: (index: number) => void;
  tick: () => void;
  processOfflineProgress: () => OfflineResult | null;
  addLog: (message: string, type: GameLog['type']) => void;
  resetGame: () => void;

  // Save/Load
  getSerializableState: () => SerializedGameState;
  loadState: (state: SerializedGameState) => void;
}

export interface SerializedGameState {
  playerName: string;
  totalPlayTime: number;
  skills: Record<string, { level: number; xp: number }>;
  activeSkillId: string | null;
  activeSubActivityId: string | null;
  resources: Record<string, number>;
  idle: IdleState;
  xpMultiplier: number;
  isActionRunning?: boolean;
  actionQueue?: QueuedAction[];
  currentActionRepeatTarget?: number;
  currentActionRepeatCount?: number;
  version: number;
}

const SAVE_VERSION = 3;

function createInitialSkills(): Record<string, { level: number; xp: number }> {
  const skills: Record<string, { level: number; xp: number }> = {};
  for (const skill of SKILL_LIST) {
    skills[skill.id] = { level: 1, xp: 0 };
  }
  return skills;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: 'Survivor',
  totalPlayTime: 0,
  skills: createInitialSkills(),
  activeSkillId: null,
  activeSubActivityId: null,
  actionProgress: 0,
  gatheringGoal: { type: 'none' },
  isActionRunning: false,
  actionQueue: [],
  currentActionRepeatTarget: 0,
  currentActionRepeatCount: 0,
  resources: {},
  idle: createInitialIdleState(),
  xpMultiplier: 1,
  logs: [],
  nextLogId: 1,

  setActiveSkill: (skillId, subActivityId) => {
    if (!skillId) {
      set({ activeSkillId: null, activeSubActivityId: null, actionProgress: 0, isActionRunning: false });
      return;
    }
    // If switching skills while running, stop the current action
    const state = get();
    const wasRunning = state.isActionRunning;
    const subId = subActivityId ?? null;
    set({
      activeSkillId: skillId,
      activeSubActivityId: subId,
      actionProgress: 0,
      isActionRunning: false,
      currentActionRepeatCount: 0,
    });
    const skillDef = SKILLS[skillId];
    if (wasRunning && state.activeSkillId && state.activeSkillId !== skillId) {
      get().addLog(`Stopped action. Viewing ${skillDef?.name || skillId}.`, 'info');
    } else {
      get().addLog(`Viewing ${skillDef?.name || skillId}.`, 'info');
    }
  },

  setSubActivity: (subActivityId) => {
    // If changing sub-activity while running, stop the action and reset progress
    set({ activeSubActivityId: subActivityId, actionProgress: 0, isActionRunning: false, currentActionRepeatCount: 0 });
    const state = get();
    const skillDef = state.activeSkillId ? SKILLS[state.activeSkillId] : null;
    const activity = skillDef?.subActivities?.find(a => a.id === subActivityId);
    if (activity) {
      get().addLog(`Selected ${activity.name}.`, 'info');
    }
  },

  setGatheringGoal: (goal) => {
    set({ gatheringGoal: goal });
    if (goal.type === 'collect_amount') {
      get().addLog(`Goal set: gather ${goal.targetAmount?.toLocaleString()} ${goal.resourceId?.replace(/_/g, ' ')}.`, 'system');
    } else if (goal.type === 'reach_level') {
      get().addLog(`Goal set: train until level ${goal.targetLevel}.`, 'system');
    } else {
      get().addLog('Goal cleared. Training indefinitely.', 'system');
    }
  },

  startAction: () => {
    const state = get();
    if (!state.activeSkillId || !state.activeSubActivityId) return;
    set({ isActionRunning: true, currentActionRepeatCount: 0 });
    const skillDef = SKILLS[state.activeSkillId];
    const activity = skillDef?.subActivities?.find(a => a.id === state.activeSubActivityId);
    const activityName = activity?.name || state.activeSubActivityId;
    get().addLog(`Started ${skillDef?.name}: ${activityName}.`, 'info');
  },

  stopAction: () => {
    set({ isActionRunning: false, actionProgress: 0 });
    get().addLog('Action stopped.', 'info');
  },

  setRepeatTarget: (count) => {
    set({ currentActionRepeatTarget: count });
  },

  addToQueue: (skillId, subActivityId, repeatCount) => {
    const state = get();
    const newQueue = [...state.actionQueue, { skillId, subActivityId, repeatCount, completedCount: 0 }];
    set({ actionQueue: newQueue });
    const skillDef = SKILLS[skillId];
    const activity = skillDef?.subActivities?.find(a => a.id === subActivityId);
    const countLabel = repeatCount === 0 ? 'infinite' : `${repeatCount}`;
    get().addLog(`Queued: ${skillDef?.name} - ${activity?.name || subActivityId} (x${countLabel})`, 'system');
  },

  removeFromQueue: (index) => {
    const state = get();
    const newQueue = [...state.actionQueue];
    newQueue.splice(index, 1);
    set({ actionQueue: newQueue });
  },

  tick: () => {
    const state = get();
    const now = Date.now();

    // Check daily idle reset
    const newIdle = checkDailyReset(state.idle, now);

    // Check idle cap
    if (newIdle.idleSecondsUsedToday >= newIdle.idleCapSeconds) {
      set({ idle: newIdle, totalPlayTime: state.totalPlayTime + 1 });
      return;
    }

    // No active skill, not running, or no sub-activity selected? Just update timers
    if (!state.activeSkillId || !state.isActionRunning || !state.activeSubActivityId) {
      set({
        idle: { ...newIdle, lastActiveTime: now },
        totalPlayTime: state.totalPlayTime + 1,
      });
      return;
    }

    const skillDef = SKILL_LIST.find(s => s.id === state.activeSkillId);
    if (!skillDef) return;

    const skillState = state.skills[state.activeSkillId];
    const actionTime = getActionTime(state.activeSkillId, skillState.level);
    const newProgress = state.actionProgress + 1;

    // Helper: after a successful action completion, handle repeat count & queue transitions
    const handleActionCompletion = () => {
      const s = get();
      const newCount = s.currentActionRepeatCount + 1;
      const target = s.currentActionRepeatTarget;

      // If target > 0 and we've reached it, check queue or stop
      if (target > 0 && newCount >= target) {
        if (s.actionQueue.length > 0) {
          const next = s.actionQueue[0];
          const remainingQueue = s.actionQueue.slice(1);
          set({
            activeSkillId: next.skillId,
            activeSubActivityId: next.subActivityId,
            currentActionRepeatTarget: next.repeatCount,
            currentActionRepeatCount: 0,
            actionQueue: remainingQueue,
            actionProgress: 0,
          });
          const nextSkillDef = SKILLS[next.skillId];
          const nextActivity = nextSkillDef?.subActivities?.find(a => a.id === next.subActivityId);
          get().addLog(`Queue: starting ${nextSkillDef?.name} - ${nextActivity?.name || next.subActivityId}.`, 'system');
        } else {
          set({ isActionRunning: false, actionProgress: 0, currentActionRepeatCount: newCount });
          get().addLog('Action complete.', 'system');
        }
      } else {
        set({ currentActionRepeatCount: newCount });
      }
    };

    // Check if action is complete
    if (newProgress >= actionTime) {
      // ── Production skill: check resource inputs before completing ──
      const activity = skillDef.subActivities?.find(a => a.id === state.activeSubActivityId);

      if (skillDef.category === 'production' && activity?.resourceInputs) {
        // Check level requirement
        if (activity.levelReq && skillState.level < activity.levelReq) {
          // Should not happen if UI prevents selection, but safety check
          set({
            actionProgress: 0,
            idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
            totalPlayTime: state.totalPlayTime + 1,
          });
          return;
        }

        // Check if we have enough resources
        const resources = state.resources;
        let hasAll = true;
        for (const input of activity.resourceInputs) {
          if ((resources[input.resourceId] || 0) < input.quantity) {
            hasAll = false;
            break;
          }
        }

        if (!hasAll) {
          // Not enough resources - stall at max progress, wait
          get().addLog(`Not enough materials for ${activity.name}. Gathering more...`, 'error');
          set({
            actionProgress: 0, // Reset, don't freeze at max
            idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
            totalPlayTime: state.totalPlayTime + 1,
          });
          return;
        }

        // Consume resources
        const newResources = { ...resources };
        for (const input of activity.resourceInputs) {
          newResources[input.resourceId] -= input.quantity;
        }

        // ── Gear recipe: produce via LootEngine ──
        if (activity.gearTemplateId) {
          const template = GEAR_TEMPLATES[activity.gearTemplateId];

          // Check gear chaining (previous tier requirement)
          if (template?.requiresPreviousTier) {
            const eqStore = useEquipmentStore.getState();
            const hasPrevTier = eqStore.inventory.some(g => {
              if (g.templateId !== template.requiresPreviousTier) return false;
              // Must not be equipped
              for (const eq of Object.values(eqStore.heroEquipment)) {
                for (const slotVal of Object.values(eq)) {
                  if (slotVal === g.instanceId) return false;
                }
              }
              return true;
            });
            if (!hasPrevTier) {
              const prevTemplate = GEAR_TEMPLATES[template.requiresPreviousTier];
              get().addLog(`Need an unequipped ${prevTemplate?.name || template.requiresPreviousTier} to forge ${template.name}.`, 'error');
              set({
                actionProgress: 0,
                idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
                totalPlayTime: state.totalPlayTime + 1,
              });
              return;
            }
          }

          const gear = craftGear(activity.gearTemplateId, skillState.level);
          if (gear) {
            // Remove previous tier gear if chained
            const eqStore = useEquipmentStore.getState();
            let newInv = [...eqStore.inventory];
            if (template?.requiresPreviousTier) {
              const idx = newInv.findIndex(g => {
                if (g.templateId !== template.requiresPreviousTier) return false;
                for (const eq of Object.values(eqStore.heroEquipment)) {
                  for (const slotVal of Object.values(eq)) {
                    if (slotVal === g.instanceId) return false;
                  }
                }
                return true;
              });
              if (idx >= 0) newInv.splice(idx, 1);
            }
            newInv.push(gear);
            useEquipmentStore.setState({ inventory: newInv });

            const rarityLabel = gear.rarity.charAt(0).toUpperCase() + gear.rarity.slice(1);
            const facetPrefix = gear.facet ? `${gear.facet.name} ` : '';
            get().addLog(
              `Crafted [${rarityLabel}] ${facetPrefix}${template?.name || activity.gearTemplateId}!`,
              gear.rarity === 'plague' || gear.rarity === 'unique' ? 'levelup' : 'drop',
            );

            // Story: gear craft
            useStoryStore.getState().checkObjective('craft', activity.gearTemplateId, 1);
          }

          // Give XP but no resource drops for gear
          const xpGained = activity.xpPerAction;
          const newTotalXp = skillState.xp + xpGained;
          const newLevel = Math.min(100, levelFromXp(newTotalXp));
          const leveledUp = newLevel > skillState.level;

          const newSkills = {
            ...state.skills,
            [state.activeSkillId!]: { level: newLevel, xp: newTotalXp },
          };

          if (leveledUp) {
            get().addLog(`LEVEL UP! ${skillDef.name} is now level ${newLevel}!`, 'levelup');
            useAchievementStore.getState().setMaxStat('maxSkillLevel', newLevel);
            // Story: skill level up (production)
            useStoryStore.getState().checkObjective('reach_skill_level', state.activeSkillId!, newLevel);
          }

          set({
            skills: newSkills,
            resources: newResources,
            actionProgress: 0,
            idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
            totalPlayTime: state.totalPlayTime + 1,
          });
          handleActionCompletion();
          return;
        }

        // ── Consumable/Tool recipe: produce as resource ──
        for (const drop of activity.resourceDrops) {
          const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
          newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + qty;
        }

        const xpGained = activity.xpPerAction;
        const newTotalXp = skillState.xp + xpGained;
        const newLevel = Math.min(100, levelFromXp(newTotalXp));
        const leveledUp = newLevel > skillState.level;

        const newSkills = {
          ...state.skills,
          [state.activeSkillId!]: { level: newLevel, xp: newTotalXp },
        };

        const dropStr = activity.resourceDrops.map(d => `1x ${d.resourceId.replace(/_/g, ' ')}`).join(', ');
        const inputStr = activity.resourceInputs.map(i => `${i.quantity}x ${i.resourceId.replace(/_/g, ' ')}`).join(', ');
        get().addLog(`+${xpGained} XP | Crafted: ${dropStr} (used: ${inputStr})`, 'drop');

        // Story: craft consumable/tool
        for (const drop of activity.resourceDrops) {
          useStoryStore.getState().checkObjective('craft', drop.resourceId, 1);
          // If this is a cooking skill, also fire 'cook'
          if (skillDef.id === 'cooking') {
            useStoryStore.getState().checkObjective('cook', drop.resourceId, 1);
          }
        }

        if (leveledUp) {
          get().addLog(`LEVEL UP! ${skillDef.name} is now level ${newLevel}!`, 'levelup');
          useAchievementStore.getState().setMaxStat('maxSkillLevel', newLevel);
          // Story: skill level up (production)
          useStoryStore.getState().checkObjective('reach_skill_level', state.activeSkillId!, newLevel);
        }

        set({
          skills: newSkills,
          resources: newResources,
          actionProgress: 0,
          idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
          totalPlayTime: state.totalPlayTime + 1,
        });
        handleActionCompletion();
        return;
      }

      // ── Standard gathering/training tick ──
      const result = processSkillTick(
        state.activeSkillId,
        state.activeSubActivityId,
        skillState.xp,
        skillState.level,
        state.xpMultiplier,
      );

      if (result) {
        const newSkills = {
          ...state.skills,
          [state.activeSkillId]: { level: result.newLevel, xp: result.newTotalXp },
        };

        const newResources = { ...state.resources };
        for (const drop of result.resourcesGained) {
          newResources[drop.resourceId] = (newResources[drop.resourceId] || 0) + drop.quantity;
        }

        if (result.resourcesGained.length > 0) {
          const dropStr = result.resourcesGained
            .map(d => `${d.quantity}x ${d.resourceId.replace(/_/g, ' ')}`)
            .join(', ');
          get().addLog(`+${result.xpGained} XP | Found: ${dropStr}`, 'drop');

          // Story: resource gather
          for (const drop of result.resourcesGained) {
            useStoryStore.getState().checkObjective('gather', drop.resourceId, drop.quantity);
          }
        } else {
          get().addLog(`+${result.xpGained} XP`, 'drop');
        }

        if (result.leveledUp) {
          get().addLog(`LEVEL UP! ${skillDef.name} is now level ${result.newLevel}!`, 'levelup');
          useAchievementStore.getState().setMaxStat('maxSkillLevel', result.newLevel);
          // Story: skill level up (gathering)
          useStoryStore.getState().checkObjective('reach_skill_level', state.activeSkillId, result.newLevel);
        }

        // Check gathering goal completion
        let goalMet = false;
        const goal = state.gatheringGoal;
        if (goal.type === 'collect_amount' && goal.resourceId && goal.targetAmount) {
          if ((newResources[goal.resourceId] || 0) >= goal.targetAmount) {
            goalMet = true;
            get().addLog(`Goal complete! Gathered ${goal.targetAmount.toLocaleString()} ${goal.resourceId.replace(/_/g, ' ')}.`, 'levelup');
          }
        } else if (goal.type === 'reach_level' && goal.targetLevel) {
          if (result.newLevel >= goal.targetLevel) {
            goalMet = true;
            get().addLog(`Goal complete! Reached level ${goal.targetLevel} in ${skillDef.name}!`, 'levelup');
          }
        }

        set({
          skills: newSkills,
          resources: newResources,
          actionProgress: 0,
          idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
          totalPlayTime: state.totalPlayTime + 1,
          ...(goalMet ? { gatheringGoal: { type: 'none' as const } } : {}),
        });
        handleActionCompletion();
      }
    } else {
      set({
        actionProgress: newProgress,
        idle: { ...newIdle, lastActiveTime: now, idleSecondsUsedToday: newIdle.idleSecondsUsedToday + 1 },
        totalPlayTime: state.totalPlayTime + 1,
      });
    }
  },

  processOfflineProgress: () => {
    const state = get();
    const now = Date.now();
    const result = calculateOfflineProgress(
      state.activeSkillId,
      state.activeSubActivityId,
      state.skills,
      state.idle,
      now,
      state.xpMultiplier,
    );

    if (result.secondsProcessed > 0 && result.skillResults.length > 0) {
      const newSkills = { ...state.skills };
      const newResources = { ...state.resources };

      for (const sr of result.skillResults) {
        newSkills[sr.skillId] = {
          level: levelFromXp(newSkills[sr.skillId].xp + sr.xpGained),
          xp: newSkills[sr.skillId].xp + sr.xpGained,
        };
        for (const r of sr.resourcesGained) {
          newResources[r.resourceId] = (newResources[r.resourceId] || 0) + r.quantity;
        }
      }

      set({
        skills: newSkills,
        resources: newResources,
        idle: {
          ...state.idle,
          idleSecondsUsedToday: state.idle.idleSecondsUsedToday + result.secondsProcessed,
          lastActiveTime: now,
        },
      });

      const hours = Math.floor(result.secondsProcessed / 3600);
      const mins = Math.floor((result.secondsProcessed % 3600) / 60);
      get().addLog(`Welcome back! Processed ${hours}h ${mins}m of offline progress.`, 'system');
      return result;
    }

    set({ idle: { ...state.idle, lastActiveTime: now } });
    return null;
  },

  addLog: (message, type) => {
    set(state => {
      const newLogs = [
        { id: state.nextLogId, message, timestamp: Date.now(), type },
        ...state.logs,
      ].slice(0, 100);
      return { logs: newLogs, nextLogId: state.nextLogId + 1 };
    });
  },

  resetGame: () => {
    set({
      playerName: 'Survivor',
      totalPlayTime: 0,
      skills: createInitialSkills(),
      activeSkillId: null,
      activeSubActivityId: null,
      actionProgress: 0,
      isActionRunning: false,
      actionQueue: [],
      currentActionRepeatTarget: 0,
      currentActionRepeatCount: 0,
      resources: {},
      idle: createInitialIdleState(),
      xpMultiplier: 1,
      logs: [],
      nextLogId: 1,
    });
  },

  getSerializableState: () => {
    const state = get();
    return {
      playerName: state.playerName,
      totalPlayTime: state.totalPlayTime,
      skills: state.skills,
      activeSkillId: state.activeSkillId,
      activeSubActivityId: state.activeSubActivityId,
      resources: state.resources,
      idle: state.idle,
      xpMultiplier: state.xpMultiplier,
      isActionRunning: state.isActionRunning,
      actionQueue: state.actionQueue,
      currentActionRepeatTarget: state.currentActionRepeatTarget,
      currentActionRepeatCount: state.currentActionRepeatCount,
      version: SAVE_VERSION,
    };
  },

  loadState: (saved) => {
    // Allow loading older saves by migrating
    if (saved.version && saved.version >= 2) {
      // Ensure all skills exist (in case new skills were added)
      const allSkills = createInitialSkills();
      const mergedSkills = { ...allSkills, ...saved.skills };

      set({
        playerName: saved.playerName,
        totalPlayTime: saved.totalPlayTime,
        skills: mergedSkills,
        activeSkillId: saved.activeSkillId,
        activeSubActivityId: saved.activeSubActivityId,
        resources: saved.resources,
        idle: saved.idle,
        xpMultiplier: saved.xpMultiplier,
        isActionRunning: saved.isActionRunning ?? false,
        actionQueue: saved.actionQueue ?? [],
        currentActionRepeatTarget: saved.currentActionRepeatTarget ?? 0,
        currentActionRepeatCount: saved.currentActionRepeatCount ?? 0,
      });
    } else {
      console.warn('Save version too old, starting fresh');
      get().addLog('Save data from old version detected. Starting fresh.', 'system');
    }
  },
}));
