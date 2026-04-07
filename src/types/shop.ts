export type ShopItemCategory = 'boost' | 'cosmetic' | 'convenience';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopItemCategory;
  /** Price in cents (e.g. 299 = $2.99) */
  priceInCents: number;
  /** Duration in seconds for boosts, 0 for permanent */
  duration: number;
  /** Effect details */
  effect: ShopEffect;
  /** Icon/emoji for display */
  icon: string;
}

export interface ShopEffect {
  type: 'xp_boost' | 'idle_cap_extend' | 'cosmetic_border' | 'cosmetic_name_color' |
        'cosmetic_title' | 'inventory_expand' | 'auto_sell';
  value: number; // e.g. 50 for +50% XP, 4 for +4 hours idle
  description: string;
}

export interface ActiveBoost {
  shopItemId: string;
  activatedAt: number;
  expiresAt: number;
}

export interface PlayerCosmetics {
  border: string | null;
  nameColor: string | null;
  title: string | null;
}
