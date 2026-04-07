import { create } from 'zustand';
import { recruitHero, allocateStatPoint } from '../engine/HeroEngine';
import { useGameStore } from './useGameStore';
import type { Hero, PrimaryStats } from '../types/hero';
import { CLASSES } from '../config/classes';

interface HeroState {
  heroes: Hero[];
  selectedHeroId: string | null;

  recruit: (classId: string) => Hero | null;
  dismissHero: (heroId: string) => void;
  selectHero: (heroId: string | null) => void;
  allocateStat: (heroId: string, stat: keyof PrimaryStats) => void;
  allocateMultiple: (heroId: string, stat: keyof PrimaryStats, count: number) => void;

  getSerializableState: () => SerializedHeroState;
  loadState: (state: SerializedHeroState) => void;
}

export interface SerializedHeroState {
  heroes: Hero[];
}

export const useHeroStore = create<HeroState>((set, get) => ({
  heroes: [],
  selectedHeroId: null,

  recruit: (classId) => {
    const hero = recruitHero(classId);
    if (!hero) return null;

    set(state => ({ heroes: [...state.heroes, hero] }));

    const classDef = CLASSES[classId];
    const gameStore = useGameStore.getState();
    gameStore.addLog(
      `Recruited ${hero.name}, a ${classDef?.name || classId}!`,
      'system',
    );
    return hero;
  },

  dismissHero: (heroId) => {
    const hero = get().heroes.find(h => h.id === heroId);
    if (!hero) return;

    set(state => ({
      heroes: state.heroes.filter(h => h.id !== heroId),
      selectedHeroId: state.selectedHeroId === heroId ? null : state.selectedHeroId,
    }));

    const gameStore = useGameStore.getState();
    gameStore.addLog(`Dismissed ${hero.name}.`, 'system');
  },

  selectHero: (heroId) => {
    set({ selectedHeroId: heroId });
  },

  allocateStat: (heroId, stat) => {
    set(state => ({
      heroes: state.heroes.map(h => {
        if (h.id !== heroId) return h;
        const updated = allocateStatPoint(h, stat);
        return updated || h;
      }),
    }));
  },

  allocateMultiple: (heroId, stat, count) => {
    set(state => ({
      heroes: state.heroes.map(h => {
        if (h.id !== heroId) return h;
        let current = h;
        for (let i = 0; i < count; i++) {
          const updated = allocateStatPoint(current, stat);
          if (!updated) break;
          current = updated;
        }
        return current;
      }),
    }));
  },

  getSerializableState: () => ({ heroes: get().heroes }),

  loadState: (saved) => {
    // Migrate legacy heroes missing RES stat
    const migratedHeroes = saved.heroes.map(h => ({
      ...h,
      baseStats: { ...h.baseStats, res: h.baseStats.res ?? Math.floor(Math.random() * 6) + 3 },
      allocatedStats: { ...h.allocatedStats, res: h.allocatedStats.res ?? 0 },
    }));
    set({ heroes: migratedHeroes, selectedHeroId: null });
  },
}));
