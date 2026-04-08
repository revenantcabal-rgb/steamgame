export type CombatStyle = 'melee' | 'ranged' | 'demolitions';
export type HeroType = 'combat' | 'specialist';
export type CategoryId = 'skirmisher' | 'control' | 'support' | 'assault' | 'artisan';

export interface PrimaryStats {
  str: number;
  dex: number;
  int: number;
  con: number;
  per: number;
  luk: number;
  res: number;
}

export interface DerivedStats {
  maxHp: number;
  meleeAttack: number;
  rangedAttack: number;
  blastAttack: number;
  defense: number;
  evasion: number;
  accuracy: number;
  critChance: number;
  critDamage: number;
  turnSpeed: number;
  hpRegen: number;
  statusResist: number;
  abilityPower: number;
  abilitySlots: number;
  /** Whether this hero can equip a Warband Decree (party-wide buff, 1 per party) */
  canEquipAura: boolean;
  // Extended combat stats
  lifesteal: number;
  burnDot: number;
  poisonDot: number;
  radiationDot: number;
  bleedDot: number;
  frostSlow: number;
  thornsDamage: number;
  blockChance: number;
  armorPen: number;
  damageReduction: number;
  dropChance: number;
  // SP (Spirit Point) stats
  maxSp: number;           // Max spirit points (30 + RES*3)
  spRegen: number;         // SP regen per combat turn (2 + RES*0.1)
  spCostReduction: number; // % reduction to ability SP costs (0-50)
  /** Number of consumable slots unlocked (1 base + 1 per level threshold) */
  consumableSlots: number;
  // Gathering/production stats
  gatheringSpeed: number;
  gatheringYield: number;
  productionSpeed: number;
  xpBonus: number;
  rareResourceChance: number;
  rarityUpgrade: number;
  doubleOutput: number;
}

export interface ClassDefinition {
  id: string;
  name: string;
  description: string;
  categoryId: CategoryId;
  heroType: HeroType;
  primaryCombatStyle: CombatStyle;
  /** Primary + secondary stat focus */
  primaryStats: [keyof PrimaryStats, keyof PrimaryStats];
  /** Base stat roll ranges at recruitment */
  baseStatRanges: Record<keyof PrimaryStats, [number, number]>;
}

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  description: string;
  /** Team decree per hero of this category in squad */
  decreeDescription: string;
  /** Skirmish bonus when assigned to population */
  skirmishDescription: string;
}

export interface Hero {
  id: string;
  name: string;
  classId: string;
  level: number;
  xp: number;
  /** Base stats rolled at recruitment */
  baseStats: PrimaryStats;
  /** Player-allocated stat points */
  allocatedStats: PrimaryStats;
  /** Unspent stat points */
  unspentPoints: number;
  /** Timestamp of recruitment */
  recruitedAt: number;
  /** 4 ability slots (ability IDs) */
  equippedAbilities: (string | null)[];
  /** 1 decree slot (ability ID) */
  equippedDecree: string | null;
  /** Consumable slots (consumable IDs) */
  equippedConsumables: (string | null)[];
}

/** Stat points per hero level */
export const STAT_POINTS_PER_LEVEL = 6;

/** Roll a random stat within a range */
export function rollStat(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate a random wasteland name */
const FIRST_NAMES = [
  'Ash', 'Blaze', 'Cinder', 'Dust', 'Echo', 'Flint', 'Grim', 'Haze', 'Iron', 'Jett',
  'Knox', 'Lynx', 'Moss', 'Nyx', 'Onyx', 'Pike', 'Quill', 'Rust', 'Scar', 'Thorn',
  'Vex', 'Wolf', 'Xeno', 'Yara', 'Zero', 'Bolt', 'Crow', 'Dusk', 'Ember', 'Fang',
  'Ghost', 'Hawk', 'Ivory', 'Jade', 'Kale', 'Lark', 'Mire', 'Nova', 'Opal', 'Pulse',
  'Raze', 'Slate', 'Talon', 'Umber', 'Viper', 'Wren', 'Zinc', 'Bone', 'Char', 'Drake',
];
const LAST_NAMES = [
  'Walker', 'Runner', 'Breaker', 'Hunter', 'Finder', 'Keeper', 'Warden', 'Striker',
  'Drifter', 'Crawler', 'Stalker', 'Burner', 'Cutter', 'Grinder', 'Scrapper',
  'Digger', 'Forger', 'Ranger', 'Seeker', 'Mender', 'Smasher', 'Blaster',
  'Sniper', 'Tanker', 'Healer', 'Bomber', 'Raider', 'Trader', 'Builder', 'Slayer',
];

export function generateHeroName(): string {
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
}
