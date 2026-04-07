/**
 * Marketplace Engine
 *
 * BDO-inspired pricing with anti-ghost-trading mechanics:
 * - Each item has a base price determined by its type/tier/rarity
 * - Tradable range: base ±15% (rarity-adjusted for equipment)
 * - Prices adjust with supply/demand (±2% per sale near extremes)
 * - 5% tax on sales
 * - Purchase order lottery: random winner among highest equal bids
 * - Bot POs at base price as floor buyers
 */

import { RESOURCES } from '../config/resources';
import { GEAR_TEMPLATES } from '../config/gear';
import { MARKET_TAX_RATE, PRICE_RANGE_PERCENT, PO_DURATION_MS } from '../types/marketplace';
import type { MarketPriceInfo, MarketCategory, MarketPurchaseOrder, PriceHistoryPoint, ItemPriceSnapshot } from '../types/marketplace';
import type { ItemRarity } from '../types/equipment';

// ═══════════════════════════════════════════
// RARITY PRICING
// ═══════════════════════════════════════════

/** Get rarity multiplier for equipment/accessories pricing */
export function getRarityMultiplier(rarity?: ItemRarity): number {
  if (!rarity) return 1;
  switch (rarity) {
    case 'common': return 1;
    case 'rare': return 2.5;
    case 'unique': return 6;
    case 'plague': return 15;
    default: return 1;
  }
}

// ═══════════════════════════════════════════
// BASE PRICING
// ═══════════════════════════════════════════

/** Get the developer-set base price for an item */
export function getBasePrice(itemId: string, category: MarketCategory, rarity?: ItemRarity): number {
  switch (category) {
    case 'resources': {
      const res = RESOURCES[itemId];
      return res ? res.sellValue * 3 : 10; // Market price is ~3x NPC sell value
    }
    case 'equipment':
    case 'accessories': {
      const template = GEAR_TEMPLATES[itemId];
      if (!template) return 100;
      // Price scales with tier and slot importance
      const tierMultiplier = [0, 50, 150, 400, 1000, 2500, 6000, 15000, 40000];
      const base = tierMultiplier[template.tier] || 100;
      return Math.floor(base * getRarityMultiplier(rarity));
    }
    case 'consumables':
      return 20; // Base consumable price
    case 'abilities':
      return 500; // Base ability price
    case 'expedition_passes':
      return 200; // Base pass price
    case 'tools':
      return 100; // Base tool price
    default:
      return 10;
  }
}

/** Get developer price caps (absolute floor/ceiling) */
export function getDevCaps(itemId: string, category: MarketCategory, rarity?: ItemRarity): { floor: number; ceiling: number } {
  const base = getBasePrice(itemId, category, rarity);
  return {
    floor: Math.max(1, Math.floor(base * 0.5)),    // Can't drop below 50% of base
    ceiling: Math.floor(base * 3.0),                // Can't exceed 300% of base
  };
}

/** Calculate current min/max price range from a base price */
export function getPriceRange(basePrice: number, devFloor: number, devCeiling: number): { min: number; max: number } {
  const rawMin = Math.floor(basePrice * (1 - PRICE_RANGE_PERCENT));
  const rawMax = Math.ceil(basePrice * (1 + PRICE_RANGE_PERCENT));
  return {
    min: Math.max(devFloor, rawMin),
    max: Math.min(devCeiling, rawMax),
  };
}

/** Calculate price info for an item */
export function calculatePriceInfo(
  itemId: string,
  category: MarketCategory,
  currentBasePrice?: number,
  supply: number = 0,
  demand: number = 0,
  rarity?: ItemRarity,
): MarketPriceInfo {
  const defaultBase = getBasePrice(itemId, category, rarity);
  const base = currentBasePrice || defaultBase;
  const caps = getDevCaps(itemId, category, rarity);
  const range = getPriceRange(base, caps.floor, caps.ceiling);

  let trend: 'rising' | 'falling' | 'stable' = 'stable';
  if (demand > supply * 1.5) trend = 'rising';
  else if (supply > demand * 1.5) trend = 'falling';

  return {
    itemId,
    basePrice: base,
    minPrice: range.min,
    maxPrice: range.max,
    devFloor: caps.floor,
    devCeiling: caps.ceiling,
    trend,
    supply,
    demand,
  };
}

// ═══════════════════════════════════════════
// PRICE ADJUSTMENT
// ═══════════════════════════════════════════

/** Adjust base price after a sale (supply/demand dynamics) — ±2% per sale near extremes */
export function adjustBasePrice(
  currentBase: number,
  salePrice: number,
  devFloor: number,
  devCeiling: number,
): number {
  const range = getPriceRange(currentBase, devFloor, devCeiling);

  // If sold at max: base price rises by 2%
  if (salePrice >= range.max * 0.98) {
    return Math.min(devCeiling, Math.floor(currentBase * 1.02));
  }
  // If sold at min: base price drops by 2%
  if (salePrice <= range.min * 1.02) {
    return Math.max(devFloor, Math.floor(currentBase * 0.98));
  }
  return currentBase;
}

// ═══════════════════════════════════════════
// TAX CALCULATIONS
// ═══════════════════════════════════════════

/** Calculate tax amount */
export function calculateTax(totalPrice: number): number {
  return Math.floor(totalPrice * MARKET_TAX_RATE);
}

/** Calculate seller receives after tax */
export function sellerReceives(totalPrice: number): number {
  return totalPrice - calculateTax(totalPrice);
}

// ═══════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════

/** Validate a listing price is within allowed range */
export function isValidPrice(price: number, priceInfo: MarketPriceInfo): boolean {
  return price >= priceInfo.minPrice && price <= priceInfo.maxPrice;
}

/** Strict validation within rarity-adjusted band */
export function validateListingPrice(
  price: number,
  priceInfo: MarketPriceInfo,
  _rarity?: ItemRarity,
): { valid: boolean; reason?: string } {
  if (price < priceInfo.minPrice) {
    return { valid: false, reason: `Price ${price} is below minimum ${priceInfo.minPrice} WC.` };
  }
  if (price > priceInfo.maxPrice) {
    return { valid: false, reason: `Price ${price} is above maximum ${priceInfo.maxPrice} WC.` };
  }
  return { valid: true };
}

// ═══════════════════════════════════════════
// PURCHASE ORDER LOTTERY
// ═══════════════════════════════════════════

/**
 * Select a winner from eligible purchase orders.
 * Filters to the highest bidPrice group, then randomly picks one.
 * This is the core anti-ghost-trading mechanism.
 */
export function selectPurchaseOrderWinner(eligiblePOs: MarketPurchaseOrder[]): MarketPurchaseOrder | null {
  if (eligiblePOs.length === 0) return null;

  // Find the highest bid price
  const maxBid = Math.max(...eligiblePOs.map(po => po.bidPrice));

  // Filter to only those at the highest bid
  const topBidders = eligiblePOs.filter(po => po.bidPrice === maxBid);

  // Random selection among equal bids (lottery)
  const winnerIndex = Math.floor(Math.random() * topBidders.length);
  return topBidders[winnerIndex];
}

// ═══════════════════════════════════════════
// BOT PURCHASE ORDERS
// ═══════════════════════════════════════════

/**
 * Generate bot/NPC purchase orders at base price for an item.
 * Creates 1-3 bot POs to act as floor buyers.
 */
export function generateBotPurchaseOrders(
  itemId: string,
  itemName: string,
  category: MarketCategory,
  basePrice?: number,
  rarity?: ItemRarity,
): MarketPurchaseOrder[] {
  const price = basePrice || getBasePrice(itemId, category, rarity);
  const count = 1 + Math.floor(Math.random() * 3); // 1-3 bots
  const now = Date.now();
  const bots: MarketPurchaseOrder[] = [];

  for (let i = 0; i < count; i++) {
    const qty = 1 + Math.floor(Math.random() * 5); // 1-5 quantity each
    bots.push({
      id: `bot_${itemId}_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
      buyerId: `npc_trader_${i}`,
      buyerName: `NPC Trader`,
      itemId,
      itemName,
      category,
      bidPrice: price,
      quantity: qty,
      quantityFilled: 0,
      escrowAmount: price * qty,
      createdAt: now,
      expiresAt: now + PO_DURATION_MS,
      isBot: true,
    });
  }

  return bots;
}

// ═══════════════════════════════════════════
// PRICE HISTORY
// ═══════════════════════════════════════════

/**
 * Record a sale in the price history for an item.
 * Maintains a rolling 30-point history.
 */
export function recordPriceHistory(
  snapshots: Record<string, ItemPriceSnapshot>,
  itemId: string,
  price: number,
  volume: number,
  category: MarketCategory,
  rarity?: ItemRarity,
): Record<string, ItemPriceSnapshot> {
  const now = Date.now();
  const existing = snapshots[itemId];
  const basePrice = getBasePrice(itemId, category, rarity);
  const caps = getDevCaps(itemId, category, rarity);
  const range = getPriceRange(basePrice, caps.floor, caps.ceiling);

  const newPoint: PriceHistoryPoint = { timestamp: now, price, volume };

  const history = existing
    ? [...existing.priceHistory, newPoint].slice(-30) // rolling 30 points
    : [newPoint];

  const snapshot: ItemPriceSnapshot = {
    itemId,
    basePrice: existing?.basePrice || basePrice,
    minPrice: range.min,
    maxPrice: range.max,
    priceHistory: history,
    lastSalePrice: price,
    lastSaleAt: now,
  };

  return { ...snapshots, [itemId]: snapshot };
}

// ═══════════════════════════════════════════
// ID GENERATION & HELPERS
// ═══════════════════════════════════════════

/** Generate a unique ID */
export function generateMarketId(): string {
  return `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Get the market category for a resource */
export function getResourceCategory(): MarketCategory {
  return 'resources';
}

/** Determine market category from a gear template */
export function getGearCategory(slot: string): MarketCategory {
  if (['ring', 'earring', 'necklace'].includes(slot)) return 'accessories';
  return 'equipment';
}
