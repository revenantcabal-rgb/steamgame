export type GoldenCapSku =
  | 'golden_cap_7d'
  | 'golden_cap_15d'
  | 'golden_cap_30d'
  | 'golden_cap_90d'
  | 'golden_cap_365d';

export interface GoldenCapProduct {
  sku: GoldenCapSku;
  label: string;
  durationDays: number;
  priceInCents: number;
  savingsPercent: number | null;
}

export interface GoldenCapEntitlement {
  startedAt: number | null;   // ms epoch
  expiresAt: number | null;   // ms epoch
  skuHistory: { sku: string; purchasedAt: number; durationDays: number }[];
}

export interface PremiumBonuses {
  xpMultiplier: number;              // 1.0 or 1.2
  workerRespawnMultiplier: number;   // 1.0 or 0.75
  heroRecruitCostMultiplier: number; // 1.0 or 0.85
  waveScaleMultiplier: number;       // 1.0 or 0.75
  dropChanceBonus: number;           // 0 or 20
  isPremiumLootTracker: boolean;
  autoAssignWorkers: boolean;        // Golden Cap: auto-reassign workers on respawn
}
