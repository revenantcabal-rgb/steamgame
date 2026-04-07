import { create } from 'zustand';

export interface LootEntry {
  resourceId: string;
  quantity: number;
  source: 'gathering' | 'production' | 'combat' | 'worker' | 'boss';
  skillOrZone: string;
  timestamp: number;
}

interface LootTrackerState {
  entries: LootEntry[];
  trackingSince: number;
  isPremium: boolean; // Gold pass = 24h, free = 12h

  trackLoot: (resourceId: string, quantity: number, source: LootEntry['source'], skillOrZone: string) => void;
  getTrackedLoot: () => { byResource: Record<string, number>; bySource: Record<string, number>; entries: LootEntry[] };
  clearTracker: () => void;
  getMaxHistoryMs: () => number;

  getSerializableState: () => { entries: LootEntry[]; trackingSince: number; isPremium: boolean };
  loadState: (saved: { entries?: LootEntry[]; trackingSince?: number; isPremium?: boolean }) => void;
}

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const useLootTrackerStore = create<LootTrackerState>((set, get) => ({
  entries: [],
  trackingSince: Date.now(),
  isPremium: false,

  trackLoot: (resourceId, quantity, source, skillOrZone) => {
    const now = Date.now();
    const maxAge = get().getMaxHistoryMs();

    set(s => ({
      entries: [
        // Prune old entries
        ...s.entries.filter(e => now - e.timestamp < maxAge),
        { resourceId, quantity, source, skillOrZone, timestamp: now },
      ],
    }));
  },

  getTrackedLoot: () => {
    const state = get();
    const now = Date.now();
    const maxAge = state.getMaxHistoryMs();
    const valid = state.entries.filter(e => now - e.timestamp < maxAge);

    const byResource: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    for (const e of valid) {
      byResource[e.resourceId] = (byResource[e.resourceId] || 0) + e.quantity;
      bySource[e.source] = (bySource[e.source] || 0) + e.quantity;
    }

    return { byResource, bySource, entries: valid };
  },

  clearTracker: () => {
    set({ entries: [], trackingSince: Date.now() });
  },

  getMaxHistoryMs: () => {
    return get().isPremium ? TWENTY_FOUR_HOURS_MS : TWELVE_HOURS_MS;
  },

  getSerializableState: () => ({
    entries: get().entries,
    trackingSince: get().trackingSince,
    isPremium: get().isPremium,
  }),

  loadState: (saved) => {
    const now = Date.now();
    const isPremium = saved.isPremium ?? false;
    const maxAge = isPremium ? TWENTY_FOUR_HOURS_MS : TWELVE_HOURS_MS;
    set({
      entries: (saved.entries || []).filter(e => now - e.timestamp < maxAge),
      trackingSince: saved.trackingSince || now,
      isPremium,
    });
  },
}));
