export type ItemType = 'resource' | 'equipment' | 'consumable' | 'material';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface Resource {
  id: string;
  name: string;
  description: string;
  /** Tier 1-5 indicating rarity */
  tier: number;
  /** Which skill produces this resource */
  sourceSkillId: string;
  /** Stack limit per inventory slot */
  stackLimit: number;
  /** Base sell value */
  sellValue: number;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  slot: EquipmentSlot;
  tier: number;
  /** Required skill level to equip */
  requiredLevel: number;
  /** Required skill to equip (e.g. 'close_combat' for melee weapons) */
  requiredSkill: string;
  stats: EquipmentStats;
}

export interface EquipmentStats {
  meleeAttack?: number;
  rangedAttack?: number;
  defense?: number;
  evasion?: number;
  critChance?: number;
  maxHp?: number;
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  tier: number;
  effects: ConsumableEffect[];
  /** Duration in seconds, 0 for instant */
  duration: number;
}

export interface ConsumableEffect {
  stat: string;
  value: number;
  isPercentage: boolean;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  /** Skill required to craft */
  skillId: string;
  /** Minimum level in that skill */
  requiredLevel: number;
  /** Input resources and quantities */
  inputs: { resourceId: string; quantity: number }[];
  /** Output item */
  output: { itemId: string; quantity: number };
  /** XP awarded for crafting */
  xpReward: number;
  /** Seconds to craft */
  craftTime: number;
}

export interface InventoryItem {
  itemId: string;
  itemType: ItemType;
  quantity: number;
}

export interface EquippedGear {
  weapon: string | null;
  armor: string | null;
  accessory: string | null;
}
