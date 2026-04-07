/**
 * Marketplace System - BDO-inspired with min/max price bidding
 *
 * Adapted from Black Desert Online's Central Market:
 * - Each item type has a Base Price determined by tier/rarity
 * - Tradable range: Base Price ±10%
 * - Prices shift with supply/demand (buy at max = base rises, sell at min = base drops)
 * - Pre-orders: place buy orders for items not yet listed
 * - 5% tax on all sales (seller receives 95%)
 * - Developer price caps prevent extreme inflation/deflation
 */

export type MarketCategory = 'resources' | 'consumables' | 'abilities' | 'expedition_passes' | 'equipment' | 'accessories' | 'tools';

export const MARKET_CATEGORY_LABELS: Record<MarketCategory, string> = {
  resources: 'Resources',
  consumables: 'Consumables',
  abilities: 'Ability Tomes',
  expedition_passes: 'Expedition Passes', // Post-apocalyptic rename of "Dungeon Keys"
  equipment: 'Equipment',
  accessories: 'Accessories',
  tools: 'Wasteland Tools',
};

export const MARKET_CATEGORY_DESCRIPTIONS: Record<MarketCategory, string> = {
  resources: 'Raw materials from gathering: ores, wood, herbs, water, salvage.',
  consumables: 'Food buffs, medicines, and combat chemicals.',
  abilities: 'Dropped and crafted ability tomes for hero skill slots.',
  expedition_passes: 'Passes required to enter high-level expedition zones.',
  equipment: 'Weapons, armor, legs, gloves, boots, shields.',
  accessories: 'Rings, earrings, necklaces, and stat focus rings.',
  tools: 'Gathering and production tools: pickaxes, filters, drills.',
};

/** A listed item on the marketplace */
export interface MarketListing {
  id: string;
  /** Who listed it (player ID, or 'npc' for system listings) */
  sellerId: string;
  sellerName: string;
  /** Category for browsing */
  category: MarketCategory;
  /** Item identifier (resource ID, gear template ID, ability ID, etc.) */
  itemId: string;
  /** Display name */
  itemName: string;
  /** Quantity (for stackable items like resources) */
  quantity: number;
  /** Listed price per unit in Wasteland Credits (WC) */
  pricePerUnit: number;
  /** When this listing was created */
  listedAt: number;
  /** When this listing expires (48 hours after listing) */
  expiresAt: number;
  /** For gear: the full gear instance data */
  gearData?: any;
}

/** A pre-order (buy order) placed by a player */
export interface MarketPreOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  /** What item they want */
  itemId: string;
  itemName: string;
  category: MarketCategory;
  /** Max price they're willing to pay per unit */
  bidPrice: number;
  /** Quantity wanted */
  quantity: number;
  /** WC locked in escrow */
  escrowAmount: number;
  createdAt: number;
}

/** A completed transaction for history */
export interface MarketTransaction {
  id: string;
  itemId: string;
  itemName: string;
  category: MarketCategory;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  taxAmount: number;
  sellerName: string;
  buyerName: string;
  completedAt: number;
}

/** Price info for an item type */
export interface MarketPriceInfo {
  itemId: string;
  basePrice: number;
  /** Current min price (base - 10%, floored by dev cap) */
  minPrice: number;
  /** Current max price (base + 10%, capped by dev cap) */
  maxPrice: number;
  /** Developer-set absolute floor */
  devFloor: number;
  /** Developer-set absolute ceiling */
  devCeiling: number;
  /** Price trend: 'rising' | 'falling' | 'stable' */
  trend: 'rising' | 'falling' | 'stable';
  /** How many listed currently */
  supply: number;
  /** How many pre-orders exist */
  demand: number;
}

/** Market tax rate */
export const MARKET_TAX_RATE = 0.05; // 5%
/** Listing duration in ms (48 hours) */
export const LISTING_DURATION_MS = 48 * 60 * 60 * 1000;
/** Price range percentage above/below base */
export const PRICE_RANGE_PERCENT = 0.10; // ±10%
