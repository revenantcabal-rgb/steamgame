import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { useGoldenCapStore } from './useGoldenCapStore';

// ── Constants ──
const SCAN_COOLDOWN_MS = 10_800_000;      // 3 hours
const BUFF_DURATION_MS = 2_700_000;        // 45 minutes
const BUFF_DURATION_GOLD_MS = 5_400_000;   // 90 minutes (Gold Pass)
const MAX_TOWER_LEVEL = 3;

/** Upgrade costs per target level (index 0 = level 2, index 1 = level 3) */
const UPGRADE_COSTS: { resourceId: string; quantity: number }[][] = [
  // Level 1 → 2
  [
    { resourceId: 'iron_ore', quantity: 50 },
    { resourceId: 'salvaged_wood', quantity: 30 },
    { resourceId: 'scrap_metal', quantity: 20 },
    { resourceId: 'electronic_components', quantity: 10 },
  ],
  // Level 2 → 3
  [
    { resourceId: 'iron_ore', quantity: 100 },
    { resourceId: 'salvaged_wood', quantity: 60 },
    { resourceId: 'mechanical_parts', quantity: 40 },
    { resourceId: 'copper_ore', quantity: 25 },
    { resourceId: 'icqor_chess_piece', quantity: 10 },
  ],
];

/** Base placement buff % by threat label (applied when scan buff is active) */
const PLACEMENT_BASE_BUFF: Record<string, number> = {
  Low: 8,
  Moderate: 6,
  High: 4,
  Severe: 2,
  Extreme: 1,
};

export function getUpgradeCosts(currentLevel: number): { resourceId: string; quantity: number }[] | null {
  if (currentLevel >= MAX_TOWER_LEVEL) return null;
  return UPGRADE_COSTS[currentLevel - 1] || null;
}

interface ScanTowerState {
  towerLevel: number;
  lastScanTime: number | null;
  scanBuffExpiresAt: number | null;

  // Actions
  performScan: () => boolean;
  upgradeTower: () => boolean;
  scanTick: () => void;

  // Getters
  isScanBuffActive: () => boolean;
  getScanCooldownRemaining: () => number;
  getPlacementBuff: (threatLabel: string) => number;
  getScanBuffBonuses: () => { dropChanceBonus: number; turnSpeedBonus: number };

  getSerializableState: () => { towerLevel: number; lastScanTime: number | null; scanBuffExpiresAt: number | null };
  loadState: (state: any) => void;
}

export const useScanTowerStore = create<ScanTowerState>((set, get) => ({
  towerLevel: 1,
  lastScanTime: null,
  scanBuffExpiresAt: null,

  performScan: () => {
    const state = get();
    const now = Date.now();

    // Check cooldown
    if (state.lastScanTime !== null && (now - state.lastScanTime) < SCAN_COOLDOWN_MS) {
      return false;
    }

    const isGoldPass = useGoldenCapStore.getState().isActive();
    const buffDuration = isGoldPass ? BUFF_DURATION_GOLD_MS : BUFF_DURATION_MS;

    set({
      lastScanTime: now,
      scanBuffExpiresAt: now + buffDuration,
    });

    useGameStore.getState().addLog(
      `Scan Tower activated! Signal buff active for ${isGoldPass ? '90' : '45'} minutes.`,
      'system',
    );
    return true;
  },

  upgradeTower: () => {
    const state = get();
    if (state.towerLevel >= MAX_TOWER_LEVEL) return false;

    const costs = getUpgradeCosts(state.towerLevel);
    if (!costs) return false;

    const gameStore = useGameStore.getState();
    const resources = gameStore.resources;

    // Check resources
    for (const c of costs) {
      if ((resources[c.resourceId] || 0) < c.quantity) {
        gameStore.addLog('Not enough resources to upgrade Scan Tower.', 'error');
        return false;
      }
    }

    // Deduct resources
    const newResources = { ...resources };
    for (const c of costs) {
      newResources[c.resourceId] = (newResources[c.resourceId] || 0) - c.quantity;
    }
    useGameStore.setState({ resources: newResources });

    const newLevel = state.towerLevel + 1;
    set({ towerLevel: newLevel });
    gameStore.addLog(`Scan Tower upgraded to level ${newLevel}!`, 'levelup');
    return true;
  },

  scanTick: () => {
    const state = get();
    const now = Date.now();

    // Gold Pass auto-scan: if cooldown elapsed and no active buff, auto-trigger
    const isGoldPass = useGoldenCapStore.getState().isActive();
    if (!isGoldPass) return;

    const cooldownElapsed = state.lastScanTime === null || (now - state.lastScanTime) >= SCAN_COOLDOWN_MS;
    const buffExpired = state.scanBuffExpiresAt === null || now >= state.scanBuffExpiresAt;

    if (cooldownElapsed && buffExpired) {
      set({
        lastScanTime: now,
        scanBuffExpiresAt: now + BUFF_DURATION_GOLD_MS,
      });
      useGameStore.getState().addLog('Scan Tower auto-scan triggered (Gold Pass).', 'system');
    }
  },

  isScanBuffActive: () => {
    const { scanBuffExpiresAt } = get();
    return scanBuffExpiresAt !== null && Date.now() < scanBuffExpiresAt;
  },

  getScanCooldownRemaining: () => {
    const { lastScanTime } = get();
    if (lastScanTime === null) return 0;
    return Math.max(0, (lastScanTime + SCAN_COOLDOWN_MS) - Date.now());
  },

  getPlacementBuff: (threatLabel: string) => {
    if (!get().isScanBuffActive()) return 0;
    const base = PLACEMENT_BASE_BUFF[threatLabel] || 0;
    return base * get().towerLevel;
  },

  getScanBuffBonuses: () => {
    if (!get().isScanBuffActive()) {
      return { dropChanceBonus: 0, turnSpeedBonus: 0 };
    }
    return { dropChanceBonus: 15, turnSpeedBonus: 10 };
  },

  getSerializableState: () => ({
    towerLevel: get().towerLevel,
    lastScanTime: get().lastScanTime,
    scanBuffExpiresAt: get().scanBuffExpiresAt,
  }),

  loadState: (saved: any) => {
    if (!saved) return;
    set({
      towerLevel: saved.towerLevel ?? 1,
      lastScanTime: saved.lastScanTime ?? null,
      scanBuffExpiresAt: saved.scanBuffExpiresAt ?? null,
    });
  },
}));
