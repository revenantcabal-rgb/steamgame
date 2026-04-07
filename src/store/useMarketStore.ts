import { create } from 'zustand';
import { useGameStore } from './useGameStore';
import {
  calculatePriceInfo, calculateTax, sellerReceives, adjustBasePrice,
  isValidPrice, generateMarketId, getBasePrice, getDevCaps,
} from '../engine/MarketEngine';
import { LISTING_DURATION_MS } from '../types/marketplace';
import type {
  MarketListing, MarketPreOrder, MarketTransaction,
  MarketPriceInfo, MarketCategory,
} from '../types/marketplace';

interface MarketState {
  /** All active listings */
  listings: MarketListing[];
  /** Player's pre-orders (buy orders) */
  preOrders: MarketPreOrder[];
  /** Transaction history */
  history: MarketTransaction[];
  /** Dynamic base prices (itemId -> current base price) */
  basePrices: Record<string, number>;
  /** Player's WC balance is in the game store's resources as 'wasteland_credits' */

  // Actions
  listItem: (itemId: string, itemName: string, category: MarketCategory, quantity: number, pricePerUnit: number, gearData?: any) => boolean;
  buyItem: (listingId: string, quantity?: number) => boolean;
  cancelListing: (listingId: string) => void;
  placePreOrder: (itemId: string, itemName: string, category: MarketCategory, bidPrice: number, quantity: number) => boolean;
  cancelPreOrder: (preOrderId: string) => void;
  getPriceInfo: (itemId: string, category: MarketCategory) => MarketPriceInfo;
  getListingsByCategory: (category: MarketCategory) => MarketListing[];
  getMyListings: () => MarketListing[];
  searchListings: (query: string) => MarketListing[];
  /** Clean up expired listings */
  cleanExpired: () => void;

  getSerializableState: () => SerializedMarketState;
  loadState: (state: SerializedMarketState) => void;
}

export interface SerializedMarketState {
  listings: MarketListing[];
  preOrders: MarketPreOrder[];
  history: MarketTransaction[];
  basePrices: Record<string, number>;
}

const PLAYER_ID = 'player';
const PLAYER_NAME = 'You';

function getPlayerWC(): number {
  return useGameStore.getState().resources['wasteland_credits'] || 0;
}

function adjustPlayerWC(amount: number): void {
  const resources = { ...useGameStore.getState().resources };
  resources['wasteland_credits'] = (resources['wasteland_credits'] || 0) + amount;
  useGameStore.setState({ resources });
}

export const useMarketStore = create<MarketState>((set, get) => ({
  listings: [],
  preOrders: [],
  history: [],
  basePrices: {},

  listItem: (itemId, itemName, category, quantity, pricePerUnit, gearData) => {
    const state = get();
    const priceInfo = state.getPriceInfo(itemId, category);

    if (!isValidPrice(pricePerUnit, priceInfo)) {
      useGameStore.getState().addLog(
        `Price ${pricePerUnit} WC is outside the allowed range (${priceInfo.minPrice}-${priceInfo.maxPrice}).`,
        'error',
      );
      return false;
    }

    const now = Date.now();
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

  buyItem: (listingId, quantity) => {
    const state = get();
    const listing = state.listings.find(l => l.id === listingId);
    if (!listing) return false;

    const buyQty = quantity || listing.quantity;
    const totalCost = listing.pricePerUnit * buyQty;
    const currentWC = getPlayerWC();

    if (currentWC < totalCost) {
      useGameStore.getState().addLog(`Not enough WC! Need ${totalCost}, have ${currentWC}.`, 'error');
      return false;
    }

    // Deduct buyer's WC
    adjustPlayerWC(-totalCost);

    // Calculate seller's payout (after tax)
    const tax = calculateTax(totalCost);
    const sellerPayout = sellerReceives(totalCost);

    // If the seller is the player (buying own listing - shouldn't happen but handle)
    if (listing.sellerId === PLAYER_ID) {
      adjustPlayerWC(sellerPayout); // Return minus tax
    }

    // Add resources/items to buyer
    if (listing.category === 'resources') {
      const resources = { ...useGameStore.getState().resources };
      resources[listing.itemId] = (resources[listing.itemId] || 0) + buyQty;
      useGameStore.setState({ resources });
    }
    // For gear, abilities, etc. - would add to respective stores

    // Record transaction
    const transaction: MarketTransaction = {
      id: generateMarketId(),
      itemId: listing.itemId,
      itemName: listing.itemName,
      category: listing.category,
      quantity: buyQty,
      pricePerUnit: listing.pricePerUnit,
      totalPrice: totalCost,
      taxAmount: tax,
      sellerName: listing.sellerName,
      buyerName: PLAYER_NAME,
      completedAt: Date.now(),
    };

    // Adjust base price based on sale price
    const priceInfo = state.getPriceInfo(listing.itemId, listing.category);
    const newBase = adjustBasePrice(
      priceInfo.basePrice,
      listing.pricePerUnit,
      priceInfo.devFloor,
      priceInfo.devCeiling,
    );

    // Update state
    const remainingQty = listing.quantity - buyQty;
    const newListings = remainingQty > 0
      ? state.listings.map(l => l.id === listingId ? { ...l, quantity: remainingQty } : l)
      : state.listings.filter(l => l.id !== listingId);

    set({
      listings: newListings,
      history: [transaction, ...state.history].slice(0, 200),
      basePrices: { ...state.basePrices, [listing.itemId]: newBase },
    });

    useGameStore.getState().addLog(
      `Bought ${buyQty}x ${listing.itemName} for ${totalCost} WC (tax: ${tax} WC).`,
      'info',
    );
    return true;
  },

  cancelListing: (listingId) => {
    const state = get();
    const listing = state.listings.find(l => l.id === listingId);
    if (!listing || listing.sellerId !== PLAYER_ID) return;

    // Return items to player
    if (listing.category === 'resources') {
      const resources = { ...useGameStore.getState().resources };
      resources[listing.itemId] = (resources[listing.itemId] || 0) + listing.quantity;
      useGameStore.setState({ resources });
    }

    set({ listings: state.listings.filter(l => l.id !== listingId) });
    useGameStore.getState().addLog(`Cancelled listing: ${listing.quantity}x ${listing.itemName}.`, 'info');
  },

  placePreOrder: (itemId, itemName, category, bidPrice, quantity) => {
    const priceInfo = get().getPriceInfo(itemId, category);

    if (bidPrice < priceInfo.minPrice || bidPrice > priceInfo.devCeiling) {
      useGameStore.getState().addLog(`Bid price must be between ${priceInfo.minPrice} and ${priceInfo.devCeiling} WC.`, 'error');
      return false;
    }

    const escrow = bidPrice * quantity;
    if (getPlayerWC() < escrow) {
      useGameStore.getState().addLog(`Not enough WC for pre-order escrow (${escrow} WC needed).`, 'error');
      return false;
    }

    // Lock escrow
    adjustPlayerWC(-escrow);

    const preOrder: MarketPreOrder = {
      id: generateMarketId(),
      buyerId: PLAYER_ID,
      buyerName: PLAYER_NAME,
      itemId,
      itemName,
      category,
      bidPrice,
      quantity,
      escrowAmount: escrow,
      createdAt: Date.now(),
    };

    set(s => ({ preOrders: [...s.preOrders, preOrder] }));
    useGameStore.getState().addLog(`Pre-order placed: ${quantity}x ${itemName} at ${bidPrice} WC each (${escrow} WC escrowed).`, 'system');
    return true;
  },

  cancelPreOrder: (preOrderId) => {
    const state = get();
    const order = state.preOrders.find(o => o.id === preOrderId);
    if (!order || order.buyerId !== PLAYER_ID) return;

    // Return escrow
    adjustPlayerWC(order.escrowAmount);

    set({ preOrders: state.preOrders.filter(o => o.id !== preOrderId) });
    useGameStore.getState().addLog(`Cancelled pre-order: ${order.quantity}x ${order.itemName}. ${order.escrowAmount} WC returned.`, 'info');
  },

  getPriceInfo: (itemId, category) => {
    const state = get();
    const storedBase = state.basePrices[itemId];
    const defaultBase = getBasePrice(itemId, category);
    const base = storedBase || defaultBase;
    const caps = getDevCaps(itemId, category);

    const supply = state.listings.filter(l => l.itemId === itemId).reduce((s, l) => s + l.quantity, 0);
    const demand = state.preOrders.filter(o => o.itemId === itemId).reduce((s, o) => s + o.quantity, 0);

    return calculatePriceInfo(itemId, category, base, supply, demand);
  },

  getListingsByCategory: (category) => {
    return get().listings.filter(l => l.category === category && l.expiresAt > Date.now());
  },

  getMyListings: () => {
    return get().listings.filter(l => l.sellerId === PLAYER_ID);
  },

  searchListings: (query) => {
    const lower = query.toLowerCase();
    return get().listings.filter(l =>
      l.itemName.toLowerCase().includes(lower) && l.expiresAt > Date.now()
    );
  },

  cleanExpired: () => {
    const now = Date.now();
    const state = get();
    const expired = state.listings.filter(l => l.expiresAt <= now && l.sellerId === PLAYER_ID);

    // Return expired items to player
    for (const listing of expired) {
      if (listing.category === 'resources') {
        const resources = { ...useGameStore.getState().resources };
        resources[listing.itemId] = (resources[listing.itemId] || 0) + listing.quantity;
        useGameStore.setState({ resources });
      }
    }

    if (expired.length > 0) {
      useGameStore.getState().addLog(`${expired.length} expired market listing(s) returned.`, 'system');
    }

    set({ listings: state.listings.filter(l => l.expiresAt > now || l.sellerId !== PLAYER_ID) });
  },

  getSerializableState: () => ({
    listings: get().listings,
    preOrders: get().preOrders,
    history: get().history,
    basePrices: get().basePrices,
  }),

  loadState: (saved) => {
    set({
      listings: saved.listings || [],
      preOrders: saved.preOrders || [],
      history: saved.history || [],
      basePrices: saved.basePrices || {},
    });
  },
}));
