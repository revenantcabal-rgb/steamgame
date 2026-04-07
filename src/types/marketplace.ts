/**
 * Marketplace System - BDO-inspired Central Market
 *
 * Anti-ghost-trading design from Black Desert Online:
 * - Sellers list at a set price within ±15% band (rarity-adjusted for gear)
 * - Purchase Orders (POs) compete; highest bid group wins via random lottery
 * - Bot/NPC POs at base price ensure every item has a floor buyer
 * - No direct trade — random selection prevents ghost trading
 * - Price band shifts with supply/demand (±15%, hard floor 50% / ceiling 300% of initial base)
 * - 5% tax on all sales
 */

export type MarketCategory = 'resources' | 'consumables' | 'abilities' | 'expedition_passes' | 'equipment' | 'accessories' | 'tools';

export const MARKET_CATEGORY_LABELS: Record<MarketCategory, string> = {
  resources: 'Resources',
  consumables: 'Consumables',
  abilities: 'Ability Tomes',
  expedition_passes: 'Expedition Passes',
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

/** A purchase order (buy order) placed by a player or bot */
export interface MarketPurchaseOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  /** What item they want */
  itemId: string;
  itemName: string;
  category: MarketCategory;
  /** Bid price per unit */
  bidPrice: number;
  /** Quantity wanted */
  quantity: number;
  /** Quantity already filled */
  quantityFilled: number;
  /** WC locked in escrow */
  escrowAmount: number;
  createdAt: number;
  /** When this PO expires (7 days after creation) */
  expiresAt: number;
  /** Whether this is a bot/NPC purchase order */
  isBot: boolean;
}

/** @deprecated Use MarketPurchaseOrder instead */
export interface MarketPreOrder {
  id: string;
  buyerId: string;
  buyerName: string;
  itemId: string;
  itemName: string;
  category: MarketCategory;
  bidPrice: number;
  quantity: number;
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
  /** Current min price (base - 15%, floored by dev cap) */
  minPrice: number;
  /** Current max price (base + 15%, capped by dev cap) */
  maxPrice: number;
  /** Developer-set absolute floor */
  devFloor: number;
  /** Developer-set absolute ceiling */
  devCeiling: number;
  /** Price trend: 'rising' | 'falling' | 'stable' */
  trend: 'rising' | 'falling' | 'stable';
  /** How many listed currently */
  supply: number;
  /** How many purchase orders exist */
  demand: number;
}

/** A single point in the price history chart */
export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  volume: number;
}

/** Snapshot of an item's pricing state for charts and display */
export interface ItemPriceSnapshot {
  itemId: string;
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  priceHistory: PriceHistoryPoint[];
  lastSalePrice: number;
  lastSaleAt: number;
}

/** An item waiting to be collected from the market warehouse */
export interface MarketCollectable {
  id: string;
  itemId: string;
  itemName: string;
  category: MarketCategory;
  quantity: number;
  /** For gear purchases, contains the gear instance data */
  gearData?: any;
  /** When this transaction completed */
  completedAt: number;
}

/** Market tax rate */
export const MARKET_TAX_RATE = 0.05; // 5%
/** Listing duration in ms (48 hours) */
export const LISTING_DURATION_MS = 48 * 60 * 60 * 1000;
/** Price range percentage above/below base (±15%) */
export const PRICE_RANGE_PERCENT = 0.15;
/** Purchase order duration in ms (7 days) */
export const PO_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
