import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/useGameStore';
import { usePopulationStore } from '../store/usePopulationStore';
import { useHeroStore } from '../store/useHeroStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { useCombatZoneStore } from '../store/useCombatZoneStore';
import { useExpeditionStore } from '../store/useExpeditionStore';
import { useMarketStore } from '../store/useMarketStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAnticheatStore } from '../store/useAnticheatStore';
import { useAchievementStore } from '../store/useAchievementStore';
import { useStoryStore } from '../store/useStoryStore';
import { useStarlightStore } from '../store/useStarlightStore';
import { useLootTrackerStore } from '../store/useLootTrackerStore';
import { useGoldenCapStore } from '../store/useGoldenCapStore';
import { syncSave, flushPendingWrites } from '../lib/saveService';

const TICK_INTERVAL_MS = 1000;
const SAVE_INTERVAL_MS = 30_000;

const FULL_SAVE_VERSION = 14;

export function useGameTick() {
  const gameTick = useGameStore(s => s.tick);
  const populationTick = usePopulationStore(s => s.tick);
  const combatTick = useCombatZoneStore(s => s.tick);
  const expeditionTick = useExpeditionStore(s => s.tick);
  const craftTick = useEquipmentStore(s => s.tickCraft);
  const hasLoadedRef = useRef(false);
  const saveKeyRef = useRef<string | null>(null);

  // Get save key from auth store
  useEffect(() => {
    const saveKey = useAuthStore.getState().getSaveKey();
    saveKeyRef.current = saveKey;
  });

  // Load save on mount
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const saveKey = useAuthStore.getState().getSaveKey();
    saveKeyRef.current = saveKey;
    if (!saveKey) return;

    const gameStore = useGameStore.getState();

    try {
      const saved = localStorage.getItem(saveKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.version === FULL_SAVE_VERSION) {
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          if (parsed.achievements) useAchievementStore.getState().loadState(parsed.achievements);
          if (parsed.story) useStoryStore.getState().loadState(parsed.story);
          if (parsed.starlight) useStarlightStore.getState().loadState(parsed.starlight);
          if (parsed.lootTracker) useLootTrackerStore.getState().loadState(parsed.lootTracker);
          if (parsed.goldenCap) useGoldenCapStore.getState().loadState(parsed.goldenCap);
          gameStore.addLog('Save data loaded.', 'system');
          setTimeout(() => useGameStore.getState().processOfflineProgress(), 100);
        } else if (parsed.version === 13) {
          // Migrate v13 → v14: add Golden Cap premium system
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          if (parsed.achievements) useAchievementStore.getState().loadState(parsed.achievements);
          if (parsed.story) useStoryStore.getState().loadState(parsed.story);
          if (parsed.starlight) useStarlightStore.getState().loadState(parsed.starlight);
          if (parsed.lootTracker) useLootTrackerStore.getState().loadState(parsed.lootTracker);
          // Golden Cap store starts fresh (no data to migrate)
          gameStore.addLog('Save data migrated from v13 to v14 (Golden Cap system added).', 'system');
          setTimeout(() => useGameStore.getState().processOfflineProgress(), 100);
        } else if (parsed.version === 12) {
          // Migrate v12 → v13: add story system
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          if (parsed.achievements) useAchievementStore.getState().loadState(parsed.achievements);

          // Auto-complete stories for existing players
          const heroCount = parsed.heroes?.heroes?.length || 0;
          const expeditionCompletions = parsed.expedition?.completions || {};
          const anyExpeditionDone = Object.values(expeditionCompletions).some((v: any) => v > 0);

          if (heroCount > 0) {
            // Player already has heroes → auto-complete stories 1-3
            const autoState: any = {
              currentStoryNumber: 4,
              currentPartIndex: 0,
              completedStories: [1, 2, 3],
              partProgress: {},
              unlockedFeatures: ['marketplace', 'accessories', 'hero_recruitment'],
              totalWcEarned: 0,
              totalKills: 0,
              bossesDefeated: [],
              consumablesCrafted: 0,
              slotsEquipped: 0,
            };

            if (anyExpeditionDone) {
              // Also auto-complete story 4
              autoState.currentStoryNumber = 5;
              autoState.completedStories = [1, 2, 3, 4];
              autoState.unlockedFeatures = ['marketplace', 'accessories', 'hero_recruitment', 'guild'];
            }

            useStoryStore.getState().loadState(autoState);
          }
          // story store starts fresh for new players (no heroes)

          // Mark starterHeroChosen for existing character slots
          const authState = useAuthStore.getState();
          if (heroCount > 0 && authState.activeSlot !== null) {
            const updatedSlots = authState.characterSlots.map(s => ({
              ...s,
              starterHeroChosen: true,
            }));
            useAuthStore.setState({ characterSlots: updatedSlots });
          }

          gameStore.addLog('Save data migrated from v12 to v13 (story system added).', 'system');
          setTimeout(() => useGameStore.getState().processOfflineProgress(), 100);
        } else if (parsed.version === 11) {
          // Migrate v11 → v12: add SP system, abilities, ownedAbilities
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) {
            const heroSave = parsed.heroes;
            // Ensure heroes have ability fields
            if (heroSave.heroes) {
              heroSave.heroes = heroSave.heroes.map((h: any) => ({
                ...h,
                equippedAbilities: h.equippedAbilities || [null, null, null, null],
                equippedDecree: h.equippedDecree ?? null,
              }));
            }
            // Ensure ownedAbilities exists
            if (!heroSave.ownedAbilities) {
              heroSave.ownedAbilities = ['o_thick_skin', 'r_crushing_blow', 'g_quick_shot'];
            }
            useHeroStore.getState().loadState(heroSave);
          }
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          if (parsed.achievements) useAchievementStore.getState().loadState(parsed.achievements);
          gameStore.addLog('Save data migrated from v11 to v12 (SP system added).', 'system');
          setTimeout(() => useGameStore.getState().processOfflineProgress(), 100);
        } else if (parsed.version === 10) {
          // Migrate v10 → v11: add achievements store
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          // achievements store starts fresh (no data to migrate)
          gameStore.addLog('Save data migrated from v10 to v11.', 'system');
          setTimeout(() => useGameStore.getState().processOfflineProgress(), 100);
        } else if (parsed.version === 9) {
          // Migrate v9 → v10: preOrders → purchaseOrders, add collectables/priceSnapshots
          gameStore.loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          if (parsed.market) {
            const migratedMarket = {
              listings: parsed.market.listings || [],
              purchaseOrders: (parsed.market.preOrders || []).map((po: any) => ({
                ...po,
                quantityFilled: 0,
                expiresAt: po.createdAt + 7 * 24 * 60 * 60 * 1000,
                isBot: false,
              })),
              collectables: [],
              history: parsed.market.history || [],
              basePrices: parsed.market.basePrices || {},
              priceSnapshots: {},
            };
            useMarketStore.getState().loadState(migratedMarket);
          }
          gameStore.addLog('Save data migrated from v9 to v10.', 'system');
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
      expeditionTick();
      craftTick();
      useGoldenCapStore.getState().checkExpiry();
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [gameTick, populationTick, combatTick, expeditionTick, craftTick]);

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
      const saveKey = saveKeyRef.current;
      if (!saveKey) return;

      try {
        const fullSave = {
          game: useGameStore.getState().getSerializableState(),
          population: usePopulationStore.getState().getSerializableState(),
          heroes: useHeroStore.getState().getSerializableState(),
          equipment: useEquipmentStore.getState().getSerializableState(),
          combat: useCombatZoneStore.getState().getSerializableState(),
          expedition: useExpeditionStore.getState().getSerializableState(),
          market: useMarketStore.getState().getSerializableState(),
          anticheat: useAnticheatStore.getState().getSerializableState(),
          achievements: useAchievementStore.getState().getSerializableState(),
          story: useStoryStore.getState().getSerializableState(),
          starlight: useStarlightStore.getState().getSerializableState(),
          lootTracker: useLootTrackerStore.getState().getSerializableState(),
          goldenCap: useGoldenCapStore.getState().getSerializableState(),
          version: FULL_SAVE_VERSION,
        };
        const serialized = JSON.stringify(fullSave);
        localStorage.setItem(saveKey, serialized);

        // Cloud sync (debounced, non-blocking)
        syncSave(saveKey, serialized);

        // Update character slot metadata
        const authState = useAuthStore.getState();
        if (authState.activeSlot !== null) {
          const heroes = useHeroStore.getState().heroes;
          authState.updateSlotMetadata(authState.activeSlot, {
            heroCount: heroes.length,
            level: heroes.length > 0 ? Math.max(...heroes.map(h => h.level)) : 1,
          });
        }
      } catch (e) {
        console.error('Auto-save failed:', e);
      }
    };

    const handleBeforeUnload = () => {
      save();
      flushPendingWrites();
    };

    const interval = setInterval(save, SAVE_INTERVAL_MS);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => { clearInterval(interval); window.removeEventListener('beforeunload', handleBeforeUnload); };
  }, []);
}
