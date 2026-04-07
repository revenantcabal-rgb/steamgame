import { create } from 'zustand';
import type { GoldenCapEntitlement, GoldenCapSku } from '../types/premium';
import { GOLDEN_CAP_PRODUCTS, MAX_STACK_MS } from '../config/premiumCatalog';
import { useLootTrackerStore } from './useLootTrackerStore';
import { useGameStore } from './useGameStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAuthStore } from './useAuthStore';

interface GoldenCapState {
  entitlement: GoldenCapEntitlement;
  purchaseInProgress: boolean;
  purchaseError: string | null;

  /** Computed — always derive from expiresAt, never store separately */
  isActive: () => boolean;
  getRemainingMs: () => number;
  getRemainingLabel: () => string;

  /** Activate entitlement (called after verified purchase). Stacks duration if already active. */
  activate: (sku: GoldenCapSku, durationDays: number) => void;

  /** Purchase flow state machine */
  startPurchase: (sku: GoldenCapSku) => void;
  completePurchase: (sku: GoldenCapSku) => void;
  failPurchase: (error: string) => void;

  /** Called each game tick to check expiry */
  checkExpiry: () => void;

  /** Persistence */
  getSerializableState: () => { entitlement: GoldenCapEntitlement };
  loadState: (saved: { entitlement?: GoldenCapEntitlement }) => void;
}

const EMPTY_ENTITLEMENT: GoldenCapEntitlement = {
  startedAt: null,
  expiresAt: null,
  skuHistory: [],
};

export const useGoldenCapStore = create<GoldenCapState>((set, get) => ({
  entitlement: { ...EMPTY_ENTITLEMENT },
  purchaseInProgress: false,
  purchaseError: null,

  isActive: () => {
    const { expiresAt } = get().entitlement;
    return expiresAt !== null && Date.now() < expiresAt;
  },

  getRemainingMs: () => {
    const { expiresAt } = get().entitlement;
    if (expiresAt === null) return 0;
    return Math.max(0, expiresAt - Date.now());
  },

  getRemainingLabel: () => {
    const ms = get().getRemainingMs();
    if (ms <= 0) return '';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  },

  activate: (sku, durationDays) => {
    const now = Date.now();
    const durationMs = durationDays * 24 * 60 * 60 * 1000;

    set(s => {
      const currentExpiry = s.entitlement.expiresAt;
      const base = currentExpiry !== null && currentExpiry > now ? currentExpiry : now;
      const newExpiry = Math.min(base + durationMs, now + MAX_STACK_MS);

      const newEntitlement: GoldenCapEntitlement = {
        startedAt: s.entitlement.startedAt ?? now,
        expiresAt: newExpiry,
        skuHistory: [
          ...s.entitlement.skuHistory,
          { sku, purchasedAt: now, durationDays },
        ],
      };

      return { entitlement: newEntitlement };
    });

    // Sync loot tracker premium flag
    useLootTrackerStore.setState({ isPremium: true });

    // Anti-cheat: log premium activation
    const actorId = useAuthStore.getState().user?.id || 'system';
    useAnticheatStore.getState().logItemEvent(
      `golden_cap_${sku}`, 'craft', actorId, undefined, 1,
      { sku, durationDays, type: 'premium_activation' },
    );

    useGameStore.getState().addLog(
      `Golden Cap activated! ${durationDays}-day premium benefits are now active.`,
      'levelup',
    );
  },

  startPurchase: (_sku) => {
    set({ purchaseInProgress: true, purchaseError: null });
  },

  completePurchase: (sku) => {
    const product = GOLDEN_CAP_PRODUCTS.find(p => p.sku === sku);
    if (!product) {
      set({ purchaseInProgress: false, purchaseError: 'Unknown product' });
      return;
    }
    get().activate(sku, product.durationDays);
    set({ purchaseInProgress: false, purchaseError: null });
  },

  failPurchase: (error) => {
    set({ purchaseInProgress: false, purchaseError: error });
    useGameStore.getState().addLog(`Purchase failed: ${error}`, 'error');
  },

  checkExpiry: () => {
    const state = get();
    const { expiresAt } = state.entitlement;
    if (expiresAt === null) return;

    if (Date.now() >= expiresAt) {
      // Sync loot tracker
      useLootTrackerStore.setState({ isPremium: false });

      useGameStore.getState().addLog(
        'Your Golden Cap has expired. Visit the Shop to renew!',
        'info',
      );

      // Clear expiresAt to prevent repeated log messages
      set(s => ({
        entitlement: { ...s.entitlement, expiresAt: null },
      }));
    }
  },

  getSerializableState: () => ({
    entitlement: get().entitlement,
  }),

  loadState: (saved) => {
    if (!saved.entitlement) return;
    const ent = saved.entitlement;
    const now = Date.now();
    const isActive = ent.expiresAt !== null && now < ent.expiresAt;

    set({ entitlement: ent });

    // Sync loot tracker on load
    useLootTrackerStore.setState({ isPremium: isActive });
  },
}));
