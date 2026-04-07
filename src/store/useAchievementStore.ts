import { create } from 'zustand';
import { ACHIEVEMENT_MAP } from '../config/achievements';
import { checkAchievements, createDefaultProgress } from '../engine/AchievementEngine';
import type { AchievementProgress } from '../engine/AchievementEngine';
import { unlockAchievement } from '../hooks/usePlatform';
import { useGameStore } from './useGameStore';
import { useChatStore } from './useChatStore';

interface AchievementState extends AchievementProgress {
  /** Increment a stat and check for newly unlocked achievements */
  incrementStat: (stat: keyof AchievementProgress['stats'], amount?: number) => void;
  /** Set a stat to the max of current and new value, then check */
  setMaxStat: (stat: keyof AchievementProgress['stats'], value: number) => void;
  /** Manually trigger achievement check */
  checkAndUnlock: () => void;

  getSerializableState: () => SerializedAchievementState;
  loadState: (state: SerializedAchievementState) => void;
}

export interface SerializedAchievementState {
  unlockedIds: string[];
  stats: AchievementProgress['stats'];
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  ...createDefaultProgress(),

  incrementStat: (stat, amount = 1) => {
    set(state => ({
      stats: { ...state.stats, [stat]: state.stats[stat] + amount },
    }));
    get().checkAndUnlock();
  },

  setMaxStat: (stat, value) => {
    const current = get().stats[stat];
    if (value > current) {
      set(state => ({
        stats: { ...state.stats, [stat]: value },
      }));
      get().checkAndUnlock();
    }
  },

  checkAndUnlock: () => {
    const state = get();

    // Compute live resource total from game store
    const resources = useGameStore.getState().resources;
    const resourceTotal = Object.values(resources).reduce((sum, qty) => sum + qty, 0);
    if (resourceTotal > state.stats.resourceTotal) {
      state.stats.resourceTotal = resourceTotal;
    }

    const progress: AchievementProgress = {
      unlockedIds: state.unlockedIds,
      stats: state.stats,
    };

    const newlyUnlocked = checkAchievements(progress);
    if (newlyUnlocked.length === 0) return;

    const gameStore = useGameStore.getState();

    for (const id of newlyUnlocked) {
      const def = ACHIEVEMENT_MAP[id];
      if (def) {
        gameStore.addLog(`Achievement Unlocked: ${def.icon} ${def.name} - ${def.description}`, 'levelup');
        useChatStore.getState().addSystemMessage('general', `Achievement Unlocked: ${def.name}!`);
      }
      // Fire-and-forget Steam unlock (no-ops on web)
      void unlockAchievement(id);
    }

    set(state => ({
      unlockedIds: [...state.unlockedIds, ...newlyUnlocked],
    }));
  },

  getSerializableState: () => ({
    unlockedIds: get().unlockedIds,
    stats: get().stats,
  }),

  loadState: (saved) => {
    const defaults = createDefaultProgress();
    set({
      unlockedIds: saved.unlockedIds || [],
      stats: { ...defaults.stats, ...saved.stats },
    });
  },
}));
