export type CombatStyle = 'melee' | 'ranger' | 'demolitions';
export type BaseClass = 'melee' | 'ranger' | 'demolition' | 'support';

export type Job2ClassId =
  // Melee branches
  | 'sentinel' | 'bruiser' | 'crusher'
  // Ranger branches
  | 'sniper' | 'gunslinger' | 'hunter'
  // Demolition branches
  | 'bombardier' | 'arsonist' | 'chemist'
  // Support branches
  | 'medic' | 'tactician' | 'engineer';

export interface PrimaryStats {
  str: number;
  dex: number;
  int: number;
  con: number;
  per: number;
  luk: number;
  res: number;
  spd: number;
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
  baseClass: BaseClass;
  primaryCombatStyle: CombatStyle;
  /** Primary + secondary stat emphasis (first gets +3, second gets +2 at recruitment) */
  statEmphasis: [keyof PrimaryStats, keyof PrimaryStats];
  /** Primary attribute pool for this hero (randomly assigned at recruitment) */
  primaryAttributePool: (keyof PrimaryStats)[];
}

export interface Job2ClassDefinition {
  id: Job2ClassId;
  name: string;
  parentBaseClass: BaseClass;
  description: string;
  signatureWeaponType: string;
  /** Primary attribute pool (used if different from base class) */
  primaryAttributePool: (keyof PrimaryStats)[];
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
  /** Job2 class chosen at level 15 (null before advancement) */
  job2ClassId: Job2ClassId | null;
  /** Randomly assigned primary attribute from class pool */
  primaryAttribute: keyof PrimaryStats;
}

/** Stat points per hero level */
export const STAT_POINTS_PER_LEVEL = 6;

/** SPD bonus per point invested in hero's primary attribute */
export const PRIMARY_ATTR_SPD_BONUS = 0.35;

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
