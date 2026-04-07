import type { GoldenCapProduct } from '../types/premium';

export const GOLDEN_CAP_PRODUCTS: GoldenCapProduct[] = [
  {
    sku: 'golden_cap_7d',
    label: 'Golden Cap - 1 Week',
    durationDays: 7,
    priceInCents: 599,
    savingsPercent: null,
  },
  {
    sku: 'golden_cap_15d',
    label: 'Golden Cap - 2 Weeks',
    durationDays: 15,
    priceInCents: 999,
    savingsPercent: 22,
  },
  {
    sku: 'golden_cap_30d',
    label: 'Golden Cap - 1 Month',
    durationDays: 30,
    priceInCents: 1699,
    savingsPercent: 34,
  },
  {
    sku: 'golden_cap_90d',
    label: 'Golden Cap - 3 Months',
    durationDays: 90,
    priceInCents: 3999,
    savingsPercent: 48,
  },
  {
    sku: 'golden_cap_365d',
    label: 'Golden Cap - 1 Year',
    durationDays: 365,
    priceInCents: 11999,
    savingsPercent: 62,
  },
];

/** Max stacked duration: 2 years */
export const MAX_STACK_DAYS = 730;
export const MAX_STACK_MS = MAX_STACK_DAYS * 24 * 60 * 60 * 1000;

/** Golden Cap benefit descriptions for UI display */
export const GOLDEN_CAP_BENEFITS = [
  { icon: '⚡', label: '+20% XP on all activities', detail: 'Hero combat, skills, and worker experience' },
  { icon: '⏱️', label: '25% faster worker respawn', detail: 'Workers return in 2:15 instead of 3:00' },
  { icon: '🛡️', label: '15% hero recruitment discount', detail: 'Reduced Wasteland Credits cost for new heroes' },
  { icon: '📉', label: 'Reduced enemy scaling', detail: 'Enemies grow 25% slower every 10 fights' },
  { icon: '🎲', label: '+20% resource drop chance', detail: 'Better odds on combat and gathering drops' },
  { icon: '📜', label: '24-hour drop history', detail: 'Extended loot tracking (vs 12h free)' },
  { icon: '🔄', label: 'Worker auto-reassign', detail: 'Workers return to their last task after respawning' },
] as const;
