import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePopulationStore } from '../store/usePopulationStore';
import { useHeroStore } from '../store/useHeroStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { useCombatZoneStore } from '../store/useCombatZoneStore';
import { useMarketStore } from '../store/useMarketStore';

const TICK_INTERVAL_MS = 1000;
const SAVE_INTERVAL_MS = 30_000;
const SAVE_KEY = 'wasteland_grind_save';

const FULL_SAVE_VERSION = 7; // Bumped for marketplace + abilities

export function useGameTick() {
  const gameTick = useGameStore(s => s.tick);
  const populationTick = usePopulationStore(s => s.tick);
  const combatTick = useCombatZoneStore(s => s.tick);
  const hasLoadedRef = useRef(false);

  // Load save on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const gameStore = useGameStore.getState();

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === FULL_SAVE_VERSION) {
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          gameStore.addLog('Save data loaded.', 'system');
          setTimeout(() => useGameStore.getState().processOfflineProgress(), 100);
        } else {
          gameStore.addLog('Save data from old version. Starting fresh.', 'system');
        }
      } else {
        gameStore.addLog('Welcome to the Wasteland, Survivor. Select a skill to begin.', 'system');
      }
    } catch (e) {
      console.error('Failed to load save:', e);
      gameStore.addLog('Failed to load save data. Starting fresh.', 'error');
    }
  }, []);

  // Game tick loop - all systems
  useEffect(() => {
    const interval = setInterval(() => {
      gameTick();
      populationTick();
      combatTick();
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [gameTick, populationTick, combatTick]);

  // Periodic market cleanup (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      useMarketStore.getState().cleanExpired();
    }, 300_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save loop
  useEffect(() => {
    const save = () => {
      try {
        const fullSave = {
          game: useGameStore.getState().getSerializableState(),
          population: usePopulationStore.getState().getSerializableState(),
          heroes: useHeroStore.getState().getSerializableState(),
          equipment: useEquipmentStore.getState().getSerializableState(),
          combat: useCombatZoneStore.getState().getSerializableState(),
          market: useMarketStore.getState().getSerializableState(),
          version: FULL_SAVE_VERSION,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(fullSave));
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    };

    const interval = setInterval(save, SAVE_INTERVAL_MS);
    window.addEventListener('beforeunload', save);
    return () => { clearInterval(interval); window.removeEventListener('beforeunload', save); };
  }, []);
}
