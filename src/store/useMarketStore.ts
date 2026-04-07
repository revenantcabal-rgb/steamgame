import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import { useAnticheatStore } from './useAnticheatStore';
import { useAchievementStore } from './useAchievementStore';
import { useStoryStore } from './useStoryStore';
import { useAuthStore } from './useAuthStore';
import { useEquipmentStore } from './useEquipmentStore';
import {
  calculatePriceInfo, calculateTax, sellerReceives, adjustBasePrice,
  isValidPrice, generateMarketId, getBasePrice, getDevCaps,
  selectPurchaseOrderWinner, generateBotPurchaseOrders, recordPriceHistory,
  validateListingPrice,
} from '../engine/MarketEngine';
import { LISTING_DURATION_MS, PO_DURATION_MS } from '../types/marketplace';
import type {
  MarketListing, MarketPurchaseOrder, MarketTransaction,
  MarketPriceInfo, MarketCategory, MarketCollectable,
  ItemPriceSnapshot,
} from '../types/marketplace';
import type { ItemRarity } from '../types/equipment';

interface MarketState {
  /** All active listings */
  listings: MarketListing[];
  /** All active purchase orders (replaces preOrders) */
  purchaseOrders: MarketPurchaseOrder[];
  /** Items waiting to be collected from market warehouse */
  collectables: MarketCollectable[];
  /** Transaction history */
  history: MarketTransaction[];
  /** Dynamic base prices (itemId -> current base price) */
  basePrices: Record<string, number>;
  /** Price snapshots for charts and display */
  priceSnapshots: Record<string, ItemPriceSnapshot>;

  // Actions
  listItem: (itemId: string, itemName: string, category: MarketCategory, quantity: number, pricePerUnit: number, gearData?: any, rarity?: ItemRarity) => boolean;
  placePurchaseOrder: (itemId: string, itemName: string, category: MarketCategory, bidPrice: number, quantity: number, rarity?: ItemRarity) => boolean;
  cancelListing: (listingId: string) => void;
  cancelPurchaseOrder: (orderId: string) => void;
  collectItem: (collectableId: string) => void;
  collectAll: () => void;
  getPriceInfo: (itemId: string, category: MarketCategory, rarity?: ItemRarity) => MarketPriceInfo;
  getListingsByCategory: (category: MarketCategory) => MarketListing[];
  getMyListings: () => MarketListing[];
  getMyPurchaseOrders: () => MarketPurchaseOrder[];
  getMyCollectables: () => MarketCollectable[];
  searchListings: (query: string) => MarketListing[];
  ensureBotPOs: (itemId: string, itemName: string, category: MarketCategory) => void;
  cleanExpired: () => void;

  getSerializableState: () => SerializedMarketState;
  loadState: (state: SerializedMarketState) => void;
}

export interface SerializedMarketState {
  listings: MarketListing[];
  purchaseOrders: MarketPurchaseOrder[];
  collectables: MarketCollectable[];
  history: MarketTransaction[];
  basePrices: Record<string, number>;
  priceSnapshots: Record<string, ItemPriceSnapshot>;
  /** @deprecated v9 field, migrated on load */
  preOrders?: any[];
}

function getPlayerId(): string {
  return useAuthStore.getState().user?.id || 'player';
}

function getPlayerName(): string {
  return useAuthStore.getState().user?.username || 'You';
}

function getPlayerWC(): number {
  return useGameStore.getState().resources['wasteland_credits'] || 0;
}

function adjustPlayerWC(amount: number): void {
  const resources = { ...useGameStore.getState().resources };
  resources['wasteland_credits'] = (resources['wasteland_credits'] || 0) + amount;
  useGameStore.setState({ resources });
}

function logAnticheat(gameId: string, action: 'market_list' | 'market_buy' | 'market_cancel', targetId?: string, quantity?: number, metadata?: Record<string, unknown>): void {
  const actorId = getPlayerId();
  useAnticheatStore.getState().logItemEvent(gameId, action, actorId, targetId, quantity, metadata);
}

export const useMarketStore = create<MarketState>((set, get) => ({
  listings: [],
  purchaseOrders: [],
  collectables: [],
  history: [],
  basePrices: {},
  priceSnapshots: {},

  /**
   * List an item for sale on the market.
   * BDO flow:
   * 1. Validate price within band
   * 2. Deduct from player inventory
   * 3. Find POs with bidPrice >= listing price
   * 4. Group by highest bid -> randomly select winner (lottery)
   * 5. If winner: execute sale at PO's bidPrice, create collectable for buyer
   * 6. If no match: create listing on market
   */
  listItem: (itemId, itemName, category, quantity, pricePerUnit, gearData, rarity) => {
    const state = get();
    const PLAYER_ID = getPlayerId();
    const PLAYER_NAME = getPlayerName();
    const priceInfo = state.getPriceInfo(itemId, category, rarity);

    // Validate price within rarity-adjusted band
    const validation = validateListingPrice(pricePerUnit, priceInfo, rarity);
    if (!validation.valid) {
      useGameStore.getState().addLog(
        validation.reason || `Price ${pricePerUnit} WC is outside the allowed range (${priceInfo.minPrice}-${priceInfo.maxPrice}).`,
        'error',
      );
      return false;
    }

    const now = Date.now();

    // Log anticheat event
    logAnticheat(generateMarketId(), 'market_list', undefined, quantity, { itemId, pricePerUnit, category });

    // Find all POs with bidPrice >= listing price for this item
    const eligiblePOs = state.purchaseOrders.filter(po =>
      po.itemId === itemId &&
      po.bidPrice >= pricePerUnit &&
      po.quantityFilled < po.quantity &&
      po.expiresAt > now
    );

    // Try to match with a PO (BDO lottery system)
    const winner = selectPurchaseOrderWinner(eligiblePOs);

    if (winner) {
      // Execute sale at PO's bidPrice (seller may get MORE than listed price)
      const salePrice = winner.bidPrice;
      const saleQty = Math.min(quantity, winner.quantity - winner.quantityFilled);
      const totalCost = salePrice * saleQty;
      const tax = calculateTax(totalCost);
      const sellerPayout = sellerReceives(totalCost);

      // Pay seller
      if (winner.isBot) {
        // Bot PO: seller gets paid from "the system"
        adjustPlayerWC(sellerPayout);
      } else {
        // Player PO: funds come from escrow (already deducted when PO was placed)
        adjustPlayerWC(sellerPayout);
      }

      // Create collectable for buyer (if not a bot)
      const newCollectables = [...state.collectables];
      if (!winner.isBot) {
        newCollectables.push({
          id: generateMarketId(),
          itemId,
          itemName,
          category,
          quantity: saleQty,
          gearData,
          completedAt: now,
        });
      }

      // Record transaction
      const transaction: MarketTransaction = {
        id: generateMarketId(),
        itemId,
        itemName,
        category,
        quantity: saleQty,
        pricePerUnit: salePrice,
        totalPrice: totalCost,
        taxAmount: tax,
        sellerName: PLAYER_NAME,
        buyerName: winner.buyerName,
        completedAt: now,
      };

      // Adjust base price
      const caps = getDevCaps(itemId, category, rarity);
      const currentBase = state.basePrices[itemId] || getBasePrice(itemId, category, rarity);
      const newBase = adjustBasePrice(currentBase, salePrice, caps.floor, caps.ceiling);

      // Record price history
      const newSnapshots = recordPriceHistory(state.priceSnapshots, itemId, salePrice, saleQty, category, rarity);

      // Update PO (fill or remove)
      const newFilled = winner.quantityFilled + saleQty;
      let newPOs: MarketPurchaseOrder[];
      if (newFilled >= winner.quantity) {
        newPOs = state.purchaseOrders.filter(po => po.id !== winner.id);
      } else {
        newPOs = state.purchaseOrders.map(po =>
          po.id === winner.id ? { ...po, quantityFilled: newFilled } : po
        );
      }

      // If there's remaining quantity not matched, create a listing
      const remainingQty = quantity - saleQty;
      const newListings = [...state.listings];
      if (remainingQty > 0) {
        newListings.push({
          id: generateMarketId(),
          sellerId: PLAYER_ID,
          sellerName: PLAYER_NAME,
          category,
          itemId,
          itemName,
          quantity: remainingQty,
          pricePerUnit,
          listedAt: now,
          expiresAt: now + LISTING_DURATION_MS,
          gearData,
        });
      }

      set({
        listings: newListings,
        purchaseOrders: newPOs,
        collectables: newCollectables,
        history: [transaction, ...state.history].slice(0, 200),
        basePrices: { ...state.basePrices, [itemId]: newBase },
        priceSnapshots: newSnapshots,
      });

      // Achievement: track market trade
      useAchievementStore.getState().incrementStat('marketTrades');

      // Story: market action
      useStoryStore.getState().checkObjective('market_action', 'any', 1);
      useStoryStore.getState().checkObjective('earn_currency', 'wc', sellerPayout);

      useGameStore.getState().addLog(
        `Sold ${saleQty}x ${itemName} for ${salePrice} WC each to ${winner.buyerName} (received ${sellerPayout} WC after tax).`,
        'info',
      );

      if (remainingQty > 0) {
        useGameStore.getState().addLog(
          `Listed remaining ${remainingQty}x ${itemName} on the market at ${pricePerUnit} WC each.`,
          'info',
        );
      }

      return true;
    }

    // No matching PO found — create listing on market
    const listing: MarketListing = {
      id: generateMarketId(),
      sellerId: PLAYER_ID,
      sellerName: PLAYER_NAME,
      category,
      itemId,
      itemName,
      quantity,
      pricePerUnit,
      listedAt: now,
      expiresAt: now + LISTING_DURATION_MS,
      gearData,
    };

    set({ listings: [...state.listings, listing] });
    useGameStore.getState().addLog(`Listed ${quantity}x ${itemName} on the market at ${pricePerUnit} WC each.`, 'info');
    return true;
  },

  /**
   * Place a purchase order (buy order).
   * BDO flow:
   * 1. Validate bid within band
   * 2. Escrow WC from buyer
   * 3. Check existing listings at <= bid price
   * 4. If match: execute sale, create collectable
   * 5. If no match: PO waits
   */
  placePurchaseOrder: (itemId, itemName, category, bidPrice, quantity, rarity) => {
    const state = get();
    const PLAYER_ID = getPlayerId();
    const PLAYER_NAME = getPlayerName();
    const priceInfo = state.getPriceInfo(itemId, category, rarity);

    if (bidPrice < priceInfo.minPrice || bidPrice > priceInfo.maxPrice) {
      useGameStore.getState().addLog(`Bid price must be between ${priceInfo.minPrice} and ${priceInfo.maxPrice} WC.`, 'error');
      return false;
    }

    const escrow = bidPrice * quantity;
    if (getPlayerWC() < escrow) {
      useGameStore.getState().addLog(`Not enough WC for purchase order escrow (${escrow} WC needed).`, 'error');
      return false;
    }

    const now = Date.now();

    // Check existing listings that match (price <= bidPrice)
    const matchingListings = state.listings
      .filter(l => l.itemId === itemId && l.pricePerUnit <= bidPrice && l.expiresAt > now)
      .sort((a, b) => a.pricePerUnit - b.pricePerUnit); // cheapest first

    if (matchingListings.length > 0) {
      const listing = matchingListings[0];
      const buyQty = Math.min(quantity, listing.quantity);
      const salePrice = listing.pricePerUnit;
      const totalCost = salePrice * buyQty;
      const tax = calculateTax(totalCost);
      const sellerPayout = sellerReceives(totalCost);

      // Deduct buyer's WC
      adjustPlayerWC(-totalCost);

      // Pay seller if it's the player
      if (listing.sellerId === getPlayerId()) {
        adjustPlayerWC(sellerPayout);
      }

      // Create collectable for buyer
      const newCollectables = [...state.collectables, {
        id: generateMarketId(),
        itemId,
        itemName,
        category,
        quantity: buyQty,
        gearData: listing.gearData,
        completedAt: now,
      }];

      // Record transaction
      const transaction: MarketTransaction = {
        id: generateMarketId(),
        itemId,
        itemName,
        category,
        quantity: buyQty,
        pricePerUnit: salePrice,
        totalPrice: totalCost,
        taxAmount: tax,
        sellerName: listing.sellerName,
        buyerName: PLAYER_NAME,
        completedAt: now,
      };

      // Update listing
      const remainingQty = listing.quantity - buyQty;
      const newListings = remainingQty > 0
        ? state.listings.map(l => l.id === listing.id ? { ...l, quantity: remainingQty } : l)
        : state.listings.filter(l => l.id !== listing.id);

      // Adjust base price
      const caps = getDevCaps(itemId, category, rarity);
      const currentBase = state.basePrices[itemId] || getBasePrice(itemId, category, rarity);
      const newBase = adjustBasePrice(currentBase, salePrice, caps.floor, caps.ceiling);
      const newSnapshots = recordPriceHistory(state.priceSnapshots, itemId, salePrice, buyQty, category, rarity);

      // Log anticheat
      logAnticheat(generateMarketId(), 'market_buy', listing.id, buyQty, { itemId, salePrice, category });

      set({
        listings: newListings,
        collectables: newCollectables,
        history: [transaction, ...state.history].slice(0, 200),
        basePrices: { ...state.basePrices, [itemId]: newBase },
        priceSnapshots: newSnapshots,
      });

      // Achievement: track market trade
      useAchievementStore.getState().incrementStat('marketTrades');

      // Story: market action
      useStoryStore.getState().checkObjective('market_action', 'any', 1);

      useGameStore.getState().addLog(
        `Bought ${buyQty}x ${itemName} for ${totalCost} WC. Collect from warehouse.`,
        'info',
      );

      // If there's remaining quantity, create a PO for it
      const remainingWanted = quantity - buyQty;
      if (remainingWanted > 0) {
        const remainingEscrow = bidPrice * remainingWanted;
        adjustPlayerWC(-remainingEscrow);

        const po: MarketPurchaseOrder = {
          id: generateMarketId(),
          buyerId: PLAYER_ID,
          buyerName: PLAYER_NAME,
          itemId,
          itemName,
          category,
          bidPrice,
          quantity: remainingWanted,
          quantityFilled: 0,
          escrowAmount: remainingEscrow,
          createdAt: now,
          expiresAt: now + PO_DURATION_MS,
          isBot: false,
        };
        set(s => ({ purchaseOrders: [...s.purchaseOrders, po] }));
        useGameStore.getState().addLog(
          `Purchase order placed for remaining ${remainingWanted}x ${itemName} at ${bidPrice} WC (${remainingEscrow} WC escrowed).`,
          'system',
        );
      }

      return true;
    }

    // No matching listing — create PO and escrow WC
    adjustPlayerWC(-escrow);

    const po: MarketPurchaseOrder = {
      id: generateMarketId(),
      buyerId: PLAYER_ID,
      buyerName: PLAYER_NAME,
      itemId,
      itemName,
      category,
      bidPrice,
      quantity,
      quantityFilled: 0,
      escrowAmount: escrow,
      createdAt: now,
      expiresAt: now + PO_DURATION_MS,
      isBot: false,
    };

    set(s => ({ purchaseOrders: [...s.purchaseOrders, po] }));
    useGameStore.getState().addLog(
      `Purchase order placed: ${quantity}x ${itemName} at ${bidPrice} WC each (${escrow} WC escrowed).`,
      'system',
    );
    return true;
  },

  cancelListing: (listingId) => {
    const state = get();
    const PLAYER_ID = getPlayerId();
    const listing = state.listings.find(l => l.id === listingId);
    if (!listing || listing.sellerId !== PLAYER_ID) return;

    // Return items to player
    if (listing.category === 'resources') {
      const resources = { ...useGameStore.getState().resources };
      resources[listing.itemId] = (resources[listing.itemId] || 0) + listing.quantity;
      useGameStore.setState({ resources });
    } else if ((listing.category === 'equipment' || listing.category === 'accessories') && listing.gearData) {
      const equipStore = useEquipmentStore.getState();
      const newInventory = [...equipStore.inventory, listing.gearData];
      useEquipmentStore.setState({ inventory: newInventory });
    }

    // Log anticheat
    logAnticheat(listing.id, 'market_cancel', undefined, listing.quantity, { itemId: listing.itemId });

    set({ listings: state.listings.filter(l => l.id !== listingId) });
    useGameStore.getState().addLog(`Cancelled listing: ${listing.quantity}x ${listing.itemName}.`, 'info');
  },

  cancelPurchaseOrder: (orderId) => {
    const state = get();
    const PLAYER_ID = getPlayerId();
    const order = state.purchaseOrders.find(o => o.id === orderId);
    if (!order || order.buyerId !== PLAYER_ID) return;

    // Return remaining escrow
    const filledCost = order.bidPrice * order.quantityFilled;
    const remainingEscrow = order.escrowAmount - filledCost;
    if (remainingEscrow > 0) {
      adjustPlayerWC(remainingEscrow);
    }

    // Log anticheat
    logAnticheat(order.id, 'market_cancel', undefined, order.quantity, { itemId: order.itemId });

    set({ purchaseOrders: state.purchaseOrders.filter(o => o.id !== orderId) });
    useGameStore.getState().addLog(
      `Cancelled purchase order: ${order.itemName}. ${remainingEscrow > 0 ? remainingEscrow + ' WC returned.' : ''}`,
      'info',
    );
  },

  /** Collect a purchased item from the market warehouse */
  collectItem: (collectableId) => {
    const state = get();
    const collectable = state.collectables.find(c => c.id === collectableId);
    if (!collectable) return;

    // Add to player inventory based on category
    if (collectable.category === 'resources') {
      const resources = { ...useGameStore.getState().resources };
      resources[collectable.itemId] = (resources[collectable.itemId] || 0) + collectable.quantity;
      useGameStore.setState({ resources });
    } else if ((collectable.category === 'equipment' || collectable.category === 'accessories') && collectable.gearData) {
      const equipStore = useEquipmentStore.getState();
      const newInventory = [...equipStore.inventory, collectable.gearData];
      useEquipmentStore.setState({ inventory: newInventory });
    } else if (collectable.category === 'consumables' || collectable.category === 'tools' || collectable.category === 'abilities' || collectable.category === 'expedition_passes') {
      // These are stored as resources
      const resources = { ...useGameStore.getState().resources };
      resources[collectable.itemId] = (resources[collectable.itemId] || 0) + collectable.quantity;
      useGameStore.setState({ resources });
    }

    set({ collectables: state.collectables.filter(c => c.id !== collectableId) });
    useGameStore.getState().addLog(`Collected ${collectable.quantity}x ${collectable.itemName} from market warehouse.`, 'info');
  },

  /** Collect all items from market warehouse */
  collectAll: () => {
    const state = get();
    if (state.collectables.length === 0) return;

    // Group by category and add all to inventory
    for (const collectable of state.collectables) {
      if (collectable.category === 'resources' || collectable.category === 'consumables' || collectable.category === 'tools' || collectable.category === 'abilities' || collectable.category === 'expedition_passes') {
        const resources = { ...useGameStore.getState().resources };
        resources[collectable.itemId] = (resources[collectable.itemId] || 0) + collectable.quantity;
        useGameStore.setState({ resources });
      } else if ((collectable.category === 'equipment' || collectable.category === 'accessories') && collectable.gearData) {
        const equipStore = useEquipmentStore.getState();
        const newInventory = [...equipStore.inventory, collectable.gearData];
        useEquipmentStore.setState({ inventory: newInventory });
      }
    }

    const count = state.collectables.length;
    set({ collectables: [] });
    useGameStore.getState().addLog(`Collected ${count} item(s) from market warehouse.`, 'info');
  },

  getPriceInfo: (itemId, category, rarity) => {
    const state = get();
    const storedBase = state.basePrices[itemId];
    const defaultBase = getBasePrice(itemId, category, rarity);
    const base = storedBase || defaultBase;

    const supply = state.listings.filter(l => l.itemId === itemId).reduce((s, l) => s + l.quantity, 0);
    const demand = state.purchaseOrders.filter(o => o.itemId === itemId).reduce((s, o) => s + (o.quantity - o.quantityFilled), 0);

    return calculatePriceInfo(itemId, category, base, supply, demand, rarity);
  },

  getListingsByCategory: (category) => {
    return get().listings.filter(l => l.category === category && l.expiresAt > Date.now());
  },

  getMyListings: () => {
    const PLAYER_ID = getPlayerId();
    return get().listings.filter(l => l.sellerId === PLAYER_ID);
  },

  getMyPurchaseOrders: () => {
    const PLAYER_ID = getPlayerId();
    return get().purchaseOrders.filter(o => o.buyerId === PLAYER_ID);
  },

  getMyCollectables: () => {
    return get().collectables;
  },

  searchListings: (query) => {
    const lower = query.toLowerCase();
    return get().listings.filter(l =>
      l.itemName.toLowerCase().includes(lower) && l.expiresAt > Date.now()
    );
  },

  /** Ensure bot POs exist for an item (floor buyers) */
  ensureBotPOs: (itemId, itemName, category) => {
    const state = get();
    const existingPOs = state.purchaseOrders.filter(po => po.itemId === itemId && po.expiresAt > Date.now());

    if (existingPOs.length === 0) {
      const basePrice = state.basePrices[itemId] || getBasePrice(itemId, category);
      const botPOs = generateBotPurchaseOrders(itemId, itemName, category, basePrice);
      set({ purchaseOrders: [...state.purchaseOrders, ...botPOs] });
    }
  },

  /** Clean expired listings (return items) and expired POs (return escrow) */
  cleanExpired: () => {
    const now = Date.now();
    const state = get();
    const PLAYER_ID = getPlayerId();

    // Expired listings — return items to player
    const expiredListings = state.listings.filter(l => l.expiresAt <= now && l.sellerId === PLAYER_ID);
    for (const listing of expiredListings) {
      if (listing.category === 'resources') {
        const resources = { ...useGameStore.getState().resources };
        resources[listing.itemId] = (resources[listing.itemId] || 0) + listing.quantity;
        useGameStore.setState({ resources });
      } else if ((listing.category === 'equipment' || listing.category === 'accessories') && listing.gearData) {
        const equipStore = useEquipmentStore.getState();
        const newInventory = [...equipStore.inventory, listing.gearData];
        useEquipmentStore.setState({ inventory: newInventory });
      }
    }

    if (expiredListings.length > 0) {
      useGameStore.getState().addLog(`${expiredListings.length} expired market listing(s) returned.`, 'system');
    }

    // Expired POs — return escrow to player
    const expiredPOs = state.purchaseOrders.filter(po => po.expiresAt <= now && po.buyerId === PLAYER_ID && !po.isBot);
    for (const po of expiredPOs) {
      const filledCost = po.bidPrice * po.quantityFilled;
      const remainingEscrow = po.escrowAmount - filledCost;
      if (remainingEscrow > 0) {
        adjustPlayerWC(remainingEscrow);
      }
    }

    if (expiredPOs.length > 0) {
      useGameStore.getState().addLog(`${expiredPOs.length} expired purchase order(s). Escrow returned.`, 'system');
    }

    set({
      listings: state.listings.filter(l => l.expiresAt > now || (l.sellerId !== PLAYER_ID && l.expiresAt > now)),
      purchaseOrders: state.purchaseOrders.filter(po => po.expiresAt > now),
    });
  },

  getSerializableState: () => ({
    listings: get().listings,
    purchaseOrders: get().purchaseOrders.filter(po => !po.isBot), // Don't persist bot POs
    collectables: get().collectables,
    history: get().history,
    basePrices: get().basePrices,
    priceSnapshots: get().priceSnapshots,
  }),

  loadState: (saved) => {
    set({
      listings: saved.listings || [],
      purchaseOrders: saved.purchaseOrders || [],
      collectables: saved.collectables || [],
      history: saved.history || [],
      basePrices: saved.basePrices || {},
      priceSnapshots: saved.priceSnapshots || {},
    });
  },
}));
