import type { ClassDefinition } from '../types/hero';

/**
 * All heroes start with 10 in every stat.
 * Primary stat based on combat style gets 13:
 *   - melee → STR 13
 *   - ranged → DEX 13
 *   - demolitions → INT 13
 *   - support category → CON 13 (overrides combat style)
 *
 * The baseStatRanges use [x,x] flat values (no randomness).
 */

const BASE = 10;
const PRIMARY = 13;

// Shorthand for flat stat ranges
const b = (v: number): [number, number] => [v, v];
const STR_PRIMARY = { str: b(PRIMARY), dex: b(BASE), int: b(BASE), con: b(BASE), per: b(BASE), luk: b(BASE), res: b(BASE) };
const DEX_PRIMARY = { str: b(BASE), dex: b(PRIMARY), int: b(BASE), con: b(BASE), per: b(BASE), luk: b(BASE), res: b(BASE) };
const INT_PRIMARY = { str: b(BASE), dex: b(BASE), int: b(PRIMARY), con: b(BASE), per: b(BASE), luk: b(BASE), res: b(BASE) };
const CON_PRIMARY = { str: b(BASE), dex: b(BASE), int: b(BASE), con: b(PRIMARY), per: b(BASE), luk: b(BASE), res: b(BASE) };

export const CLASSES: Record<string, ClassDefinition> = {
  // ============================
  // SKIRMISHER (Speed + Evasion)
  // ============================
  blade_dancer: {
    id: 'blade_dancer', name: 'Blade Dancer', categoryId: 'skirmisher', heroType: 'combat', primaryCombatStyle: 'melee',
    description: 'Lightning-fast melee fighter. Strikes and retreats before enemies can react.',
    primaryStats: ['str', 'dex'],
    baseStatRanges: STR_PRIMARY,
  },
  sharpshooter: {
    id: 'sharpshooter', name: 'Sharpshooter', categoryId: 'skirmisher', heroType: 'combat', primaryCombatStyle: 'ranged',
    description: 'Mobile ranged fighter who repositions constantly, landing precise shots.',
    primaryStats: ['dex', 'per'],
    baseStatRanges: DEX_PRIMARY,
  },
  sapper: {
    id: 'sapper', name: 'Sapper', categoryId: 'skirmisher', heroType: 'combat', primaryCombatStyle: 'demolitions',
    description: 'Mobile explosives expert who plants quick charges on the move.',
    primaryStats: ['int', 'dex'],
    baseStatRanges: INT_PRIMARY,
  },

  // ============================
  // CONTROL (CC + Debuffs)
  // ============================
  warden: {
    id: 'warden', name: 'Warden', categoryId: 'control', heroType: 'combat', primaryCombatStyle: 'melee',
    description: 'Grappling specialist who locks down enemies in melee range.',
    primaryStats: ['str', 'con'],
    baseStatRanges: STR_PRIMARY,
  },
  trapper: {
    id: 'trapper', name: 'Trapper', categoryId: 'control', heroType: 'combat', primaryCombatStyle: 'ranged',
    description: 'Tactical marksman with net arrows, snares, and debilitating shots.',
    primaryStats: ['dex', 'int'],
    baseStatRanges: DEX_PRIMARY,
  },
  bombardier: {
    id: 'bombardier', name: 'Bombardier', categoryId: 'control', heroType: 'combat', primaryCombatStyle: 'demolitions',
    description: 'Crowd-control explosives expert with flashbangs and EMP devices.',
    primaryStats: ['int', 'per'],
    baseStatRanges: INT_PRIMARY,
  },

  // ============================
  // SUPPORT (Tank + Healing → CON primary)
  // ============================
  guardian: {
    id: 'guardian', name: 'Guardian', categoryId: 'support', heroType: 'combat', primaryCombatStyle: 'melee',
    description: 'Front-line protector who shields allies and rallies the team.',
    primaryStats: ['con', 'str'],
    baseStatRanges: CON_PRIMARY,
  },
  field_medic: {
    id: 'field_medic', name: 'Field Medic', categoryId: 'support', heroType: 'combat', primaryCombatStyle: 'ranged',
    description: 'Combat medic who fires healing darts and buff rounds from range.',
    primaryStats: ['con', 'dex'],
    baseStatRanges: CON_PRIMARY,
  },
  chemist: {
    id: 'chemist', name: 'Chemist', categoryId: 'support', heroType: 'combat', primaryCombatStyle: 'demolitions',
    description: 'Biochemical support with healing mist, buff clouds, and cure grenades.',
    primaryStats: ['con', 'int'],
    baseStatRanges: CON_PRIMARY,
  },

  // ============================
  // ASSAULT (Damage + Burst)
  // ============================
  berserker: {
    id: 'berserker', name: 'Berserker', categoryId: 'assault', heroType: 'combat', primaryCombatStyle: 'melee',
    description: 'Raging melee powerhouse with escalating damage.',
    primaryStats: ['str', 'str'],
    baseStatRanges: STR_PRIMARY,
  },
  deadeye: {
    id: 'deadeye', name: 'Deadeye', categoryId: 'assault', heroType: 'combat', primaryCombatStyle: 'ranged',
    description: 'Sniper who sacrifices speed for devastating crits that one-shot.',
    primaryStats: ['dex', 'per'],
    baseStatRanges: DEX_PRIMARY,
  },
  demolisher: {
    id: 'demolisher', name: 'Demolisher', categoryId: 'assault', heroType: 'combat', primaryCombatStyle: 'demolitions',
    description: 'Heavy ordnance specialist. Maximum explosive firepower.',
    primaryStats: ['int', 'int'],
    baseStatRanges: INT_PRIMARY,
  },

  // ============================
  // ARTISAN (Specialist - Gathering/Production)
  // ============================
  scavenger: {
    id: 'scavenger', name: 'Scavenger', categoryId: 'artisan', heroType: 'specialist', primaryCombatStyle: 'melee',
    description: 'Wasteland survivalist. Expert at finding materials others miss.',
    primaryStats: ['str', 'luk'],
    baseStatRanges: STR_PRIMARY,
  },
  ranger: {
    id: 'ranger', name: 'Ranger', categoryId: 'artisan', heroType: 'specialist', primaryCombatStyle: 'ranged',
    description: 'Wilderness expert. Finds edible plants and water where no one else can.',
    primaryStats: ['dex', 'per'],
    baseStatRanges: DEX_PRIMARY,
  },
  prospector: {
    id: 'prospector', name: 'Prospector', categoryId: 'artisan', heroType: 'specialist', primaryCombatStyle: 'demolitions',
    description: 'Mining expert who uses controlled blasts to extract ores.',
    primaryStats: ['int', 'str'],
    baseStatRanges: INT_PRIMARY,
  },
  artificer: {
    id: 'artificer', name: 'Artificer', categoryId: 'artisan', heroType: 'specialist', primaryCombatStyle: 'ranged',
    description: 'Master crafter who produces higher-quality items.',
    primaryStats: ['int', 'luk'],
    baseStatRanges: DEX_PRIMARY,
  },
};

export const CLASS_LIST = Object.values(CLASSES);
export const COMBAT_CLASSES = CLASS_LIST.filter(c => c.heroType === 'combat');
export const SPECIALIST_CLASSES = CLASS_LIST.filter(c => c.heroType === 'specialist');

export function getClassById(id: string): ClassDefinition | undefined {
  return CLASSES[id];
}
