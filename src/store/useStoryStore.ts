import { create } from 'zustand';
import { STORY_CHAPTERS } from '../config/story';
import type { ObjectiveType, StoryChapter, StoryPart } from '../config/story';
import { GEAR_TEMPLATES } from '../config/gear';
import { SKILLS } from '../config/skills';
import { CLASSES } from '../config/classes';
import { useGameStore } from './useGameStore';
import { useChatStore } from './useChatStore';
import { useAuthStore } from './useAuthStore';

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/** T2 weapon template IDs */
const T2_WEAPON_IDS = Object.keys(GEAR_TEMPLATES).filter(id => {
  const t = GEAR_TEMPLATES[id];
  return t.tier === 2 && (t.slot === 'main_hand' || t.slot === 'off_hand');
});

/** T2 armor template IDs */
const T2_ARMOR_IDS = Object.keys(GEAR_TEMPLATES).filter(id => {
  const t = GEAR_TEMPLATES[id];
  return t.tier === 2 && (t.slot === 'armor' || t.slot === 'legs' || t.slot === 'gloves' || t.slot === 'boots');
});

/** T3 equipment IDs */
const T3_EQUIPMENT_IDS = Object.keys(GEAR_TEMPLATES).filter(id => GEAR_TEMPLATES[id].tier === 3);

/** Gathering skill IDs */
const GATHERING_SKILL_IDS = Object.keys(SKILLS).filter(id => SKILLS[id].category === 'gathering');

/** Production skill IDs */
const PRODUCTION_SKILL_IDS = Object.keys(SKILLS).filter(id => SKILLS[id].category === 'production');

/** T1 weapons by combat style for the starter_weapon objective */
const STARTER_WEAPONS: Record<string, string[]> = {
  melee: ['sharpened_pipe', 'rusty_machete'],
  ranged: ['scrap_bow', 'slingshot'],
  demolitions: ['pipe_bomb', 'molotov'],
};

/** All T1 weapon IDs (fallback when combat style is unknown) */
const ALL_T1_WEAPON_IDS = Object.values(STARTER_WEAPONS).flat();

// ──────────────────────────────────────────────
// State types
// ──────────────────────────────────────────────

interface StoryState {
  currentStoryNumber: number;  // 1-5, 6 = all complete
  currentPartIndex: number;    // 0-6
  completedStories: number[];
  partProgress: Record<string, number>;  // "s1_p3" → current count
  unlockedFeatures: string[];
  totalWcEarned: number;
  totalKills: number;
  bossesDefeated: string[];
  consumablesCrafted: number;
  slotsEquipped: number;
  starterCombatStyle: string | null;

  checkObjective: (type: ObjectiveType, target: string, incrementBy?: number) => void;
  completePart: () => void;
  isFeatureUnlocked: (feature: string) => boolean;
  getCurrentObjective: () => { chapter: StoryChapter; part: StoryPart; progress: number } | null;
  getSerializableState: () => SerializedStoryState;
  loadState: (state: SerializedStoryState) => void;
}

export interface SerializedStoryState {
  currentStoryNumber: number;
  currentPartIndex: number;
  completedStories: number[];
  partProgress: Record<string, number>;
  unlockedFeatures: string[];
  totalWcEarned: number;
  totalKills: number;
  bossesDefeated: string[];
  consumablesCrafted: number;
  slotsEquipped: number;
  starterCombatStyle?: string | null;
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useStoryStore = create<StoryState>((set, get) => ({
  currentStoryNumber: 1,
  currentPartIndex: 0,
  completedStories: [],
  partProgress: {},
  unlockedFeatures: [],
  totalWcEarned: 0,
  totalKills: 0,
  bossesDefeated: [],
  consumablesCrafted: 0,
  slotsEquipped: 0,
  starterCombatStyle: null,

  checkObjective: (type, target, incrementBy = 1) => {
    const state = get();

    // All stories complete
    if (state.currentStoryNumber > STORY_CHAPTERS.length) return;

    const chapter = STORY_CHAPTERS[state.currentStoryNumber - 1];
    if (!chapter) return;

    const part = chapter.parts[state.currentPartIndex];
    if (!part) return;

    const obj = part.objective;

    // ── Tracking counters regardless of current objective ──
    // Track total kills
    if (type === 'kill_enemies') {
      set(s => ({ totalKills: s.totalKills + incrementBy }));
    }
    // Track total WC earned
    if (type === 'earn_currency' && target === 'wc') {
      set(s => ({ totalWcEarned: s.totalWcEarned + incrementBy }));
    }
    // Track unique bosses defeated
    if (type === 'kill_boss' && target !== 'boss_hard' && target !== 'boss_elite' && target !== 'unique_3') {
      set(s => {
        if (s.bossesDefeated.includes(target)) return s;
        return { bossesDefeated: [...s.bossesDefeated, target] };
      });
    }
    // Track consumables crafted
    if (type === 'cook' || (type === 'craft' && target === 'consumable')) {
      set(s => ({ consumablesCrafted: s.consumablesCrafted + incrementBy }));
    }

    // ── Check if the event matches the current objective ──
    if (!doesMatch(obj.type, obj.target, type, target)) return;

    const partId = part.id;
    const currentProgress = state.partProgress[partId] || 0;

    // For "set max" style objectives (reach_hero_level, reach_skill_level, equip slots)
    const isSetMax = type === 'reach_hero_level' || type === 'reach_skill_level' ||
                     (type === 'equip' && obj.target === 'slots') ||
                     (type === 'recruit_hero') ||
                     (type === 'deploy_heroes') ||
                     (type === 'equip_ability');

    let newProgress: number;
    if (isSetMax) {
      newProgress = Math.max(currentProgress, incrementBy);
    } else if (type === 'earn_currency') {
      // Use the cumulative total
      const s = get();
      newProgress = s.totalWcEarned;
    } else if (type === 'kill_enemies' && obj.target === 'any') {
      // Use cumulative total kills
      const s = get();
      newProgress = s.totalKills;
    } else if (type === 'kill_boss' && obj.target === 'unique_3') {
      // Use unique bosses defeated count
      const s = get();
      newProgress = s.bossesDefeated.length;
    } else if ((type === 'craft' && obj.target === 'consumable') || type === 'cook') {
      const s = get();
      newProgress = s.consumablesCrafted;
    } else {
      newProgress = currentProgress + incrementBy;
    }

    if (newProgress === currentProgress) return; // no change

    set(s => ({ partProgress: { ...s.partProgress, [partId]: newProgress } }));

    // Check completion
    if (newProgress >= obj.count) {
      // Defer completion to avoid state conflicts
      setTimeout(() => get().completePart(), 0);
    }
  },

  completePart: () => {
    const state = get();
    if (state.currentStoryNumber > STORY_CHAPTERS.length) return;

    const chapter = STORY_CHAPTERS[state.currentStoryNumber - 1];
    if (!chapter) return;

    const part = chapter.parts[state.currentPartIndex];
    if (!part) return;

    const gameStore = useGameStore.getState();

    // Grant part rewards
    let wcEarned = 0;
    for (const reward of part.rewards) {
      if (reward.type === 'wc') {
        const resources = { ...gameStore.resources };
        resources['wasteland_credits'] = (resources['wasteland_credits'] || 0) + reward.quantity;
        useGameStore.setState({ resources });
        wcEarned += reward.quantity;
      } else if (reward.type === 'resource' && reward.itemId) {
        const resources = { ...gameStore.resources };
        resources[reward.itemId] = (resources[reward.itemId] || 0) + reward.quantity;
        useGameStore.setState({ resources });
      }
    }
    // Track WC earned from story rewards
    if (wcEarned > 0) {
      set(s => ({ totalWcEarned: s.totalWcEarned + wcEarned }));
    }

    const rewardStr = part.rewards.map(r => {
      if (r.type === 'wc') return `${r.quantity} WC`;
      if (r.type === 'resource' && r.itemId) return `${r.quantity}x ${r.itemId.replace(/_/g, ' ')}`;
      return '';
    }).filter(Boolean).join(', ');

    gameStore.addLog(`[STORY] Completed: ${part.title}! Rewards: ${rewardStr}`, 'levelup');

    // Check if this was the last part
    const isLastPart = state.currentPartIndex >= chapter.parts.length - 1;

    if (isLastPart) {
      // Chapter complete!
      // Grant completion reward
      let chapterWc = 0;
      for (const reward of chapter.completionReward) {
        if (reward.type === 'wc') {
          const resources = { ...gameStore.resources };
          resources['wasteland_credits'] = (resources['wasteland_credits'] || 0) + reward.quantity;
          useGameStore.setState({ resources });
          chapterWc += reward.quantity;
        } else if (reward.type === 'resource' && reward.itemId) {
          const resources = { ...gameStore.resources };
          resources[reward.itemId] = (resources[reward.itemId] || 0) + reward.quantity;
          useGameStore.setState({ resources });
        }
      }
      if (chapterWc > 0) {
        set(s => ({ totalWcEarned: s.totalWcEarned + chapterWc }));
      }

      gameStore.addLog(`[STORY] Chapter Complete: "${chapter.title}"! Feature Unlocked: ${chapter.unlocks.replace(/_/g, ' ')}!`, 'levelup');

      // Chat system message
      useChatStore.getState().addSystemMessage('general', `Story Chapter Complete: "${chapter.title}"! Feature Unlocked: ${chapter.unlocks.replace(/_/g, ' ')}.`);

      set(s => ({
        currentStoryNumber: s.currentStoryNumber + 1,
        currentPartIndex: 0,
        completedStories: [...s.completedStories, chapter.number],
        unlockedFeatures: [...s.unlockedFeatures, chapter.unlocks],
      }));
    } else {
      // Advance to next part
      set(s => ({ currentPartIndex: s.currentPartIndex + 1 }));
    }
  },

  isFeatureUnlocked: (feature) => {
    return get().unlockedFeatures.includes(feature);
  },

  getCurrentObjective: () => {
    const state = get();
    if (state.currentStoryNumber > STORY_CHAPTERS.length) return null;

    const chapter = STORY_CHAPTERS[state.currentStoryNumber - 1];
    if (!chapter) return null;

    const part = chapter.parts[state.currentPartIndex];
    if (!part) return null;

    return {
      chapter,
      part,
      progress: state.partProgress[part.id] || 0,
    };
  },

  getSerializableState: () => {
    const s = get();
    return {
      currentStoryNumber: s.currentStoryNumber,
      currentPartIndex: s.currentPartIndex,
      completedStories: s.completedStories,
      partProgress: s.partProgress,
      unlockedFeatures: s.unlockedFeatures,
      totalWcEarned: s.totalWcEarned,
      totalKills: s.totalKills,
      bossesDefeated: s.bossesDefeated,
      consumablesCrafted: s.consumablesCrafted,
      slotsEquipped: s.slotsEquipped,
      starterCombatStyle: s.starterCombatStyle,
    };
  },

  loadState: (saved) => {
    // Derive starterCombatStyle from saved data or from auth store's starterClassId
    let starterCombatStyle = saved.starterCombatStyle ?? null;
    if (!starterCombatStyle) {
      // Migration: try to derive from the character slot's starterClassId
      try {
        const authState = useAuthStore.getState();
        const slot = authState.characterSlots.find(s => s.slotIndex === authState.activeSlot);
        if (slot?.starterClassId) {
          const classDef = CLASSES[slot.starterClassId];
          if (classDef) {
            starterCombatStyle = classDef.primaryCombatStyle;
          }
        }
      } catch {
        // Ignore if auth store is not available during initialization
      }
    }

    set({
      currentStoryNumber: saved.currentStoryNumber ?? 1,
      currentPartIndex: saved.currentPartIndex ?? 0,
      completedStories: saved.completedStories ?? [],
      partProgress: saved.partProgress ?? {},
      unlockedFeatures: saved.unlockedFeatures ?? [],
      totalWcEarned: saved.totalWcEarned ?? 0,
      totalKills: saved.totalKills ?? 0,
      bossesDefeated: saved.bossesDefeated ?? [],
      consumablesCrafted: saved.consumablesCrafted ?? 0,
      slotsEquipped: saved.slotsEquipped ?? 0,
      starterCombatStyle,
    });
  },
}));

// ──────────────────────────────────────────────
// Matching helper
// ──────────────────────────────────────────────

function doesMatch(
  objType: ObjectiveType, objTarget: string,
  eventType: ObjectiveType, eventTarget: string,
): boolean {
  if (objType !== eventType) {
    // Special: 'cook' events also satisfy 'craft' with target 'consumable'
    if (objType === 'craft' && objTarget === 'consumable' && eventType === 'cook') return true;
    return false;
  }

  // Exact target match
  if (objTarget === eventTarget) return true;

  // Wildcard matches
  if (objTarget === 'any') return true;

  // Specific patterns
  switch (objType) {
    case 'equip':
      // 'slots' target matches any equip event
      if (objTarget === 'slots') return true;
      // 'any_weapon' matches any equip event (accepts any weapon)
      if (objTarget === 'any_weapon') return true;
      break;

    case 'craft':
      // starter_weapon: match T1 weapons for the player's combat style
      if (objTarget === 'starter_weapon') {
        const storyState = useStoryStore.getState();
        const style = storyState.starterCombatStyle;
        if (style && STARTER_WEAPONS[style]) {
          return STARTER_WEAPONS[style].includes(eventTarget);
        }
        // Fallback: accept any T1 weapon if combat style unknown
        return ALL_T1_WEAPON_IDS.includes(eventTarget);
      }
      // T2 weapon check
      if (objTarget === 'weapon_t2' && T2_WEAPON_IDS.includes(eventTarget)) return true;
      // T2 armor check
      if (objTarget === 'armor_t2' && T2_ARMOR_IDS.includes(eventTarget)) return true;
      // T3 equipment check
      if (objTarget === 'equipment_t3' && T3_EQUIPMENT_IDS.includes(eventTarget)) return true;
      // consumable check — any craft from cooking or tool production
      if (objTarget === 'consumable') return true;
      break;

    case 'reach_skill_level':
      // 'any_gathering' matches any gathering skill
      if (objTarget === 'any_gathering' && GATHERING_SKILL_IDS.includes(eventTarget)) return true;
      // 'any_production' matches any production skill
      if (objTarget === 'any_production' && PRODUCTION_SKILL_IDS.includes(eventTarget)) return true;
      break;

    case 'kill_boss':
      // 'boss_hard' matches any boss kill on tier 2+
      if (objTarget === 'boss_hard' && eventTarget === 'boss_hard') return true;
      // 'boss_elite' matches any boss kill on tier 3+
      if (objTarget === 'boss_elite' && eventTarget === 'boss_elite') return true;
      // 'unique_3' matches any boss kill
      if (objTarget === 'unique_3') return true;
      break;

    case 'complete_expedition':
      // 'normal' matches normal, 'hard' matches hard or extreme
      break;

    default:
      break;
  }

  return false;
}
