import type { ClassDefinition, Job2ClassDefinition } from '../types/hero';

/**
 * 36 Heroes across 4 Base Classes (9 per class).
 * Each hero starts with 10 in every stat.
 * Stat emphasis: first stat gets +3, second stat gets +2.
 * Primary attribute is randomly assigned from the class's primaryAttributePool at recruitment.
 * At level 15, player chooses a Job2 branch.
 */

// ============================
// MELEE (9 heroes)
// ============================
// Primary attribute pool: STR or CON
// Combat style: melee

const MELEE_ATTR_POOL: (keyof import('../types/hero').PrimaryStats)[] = ['str', 'con'];

const meleeHeroes: ClassDefinition[] = [
  {
    id: 'iron_fist', name: 'Iron Fist', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Scarred pit fighter from the arena wastes.',
    statEmphasis: ['str', 'con'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'scrap_knight', name: 'Scrap Knight', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Armored warrior in salvaged plate.',
    statEmphasis: ['str', 'str'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'rust_blade', name: 'Rust Blade', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Quick melee fighter with corroded blades.',
    statEmphasis: ['str', 'dex'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'slag_breaker', name: 'Slag Breaker', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Foundry worker turned brawler.',
    statEmphasis: ['str', 'str'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'ash_warden', name: 'Ash Warden', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Stoic defender of burned settlements.',
    statEmphasis: ['con', 'str'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'bone_crusher', name: 'Bone Crusher', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Brute enforcer from raider clans.',
    statEmphasis: ['str', 'con'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'chain_runner', name: 'Chain Runner', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Chain-wielding skirmisher.',
    statEmphasis: ['str', 'spd'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'vault_guard', name: 'Vault Guard', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Former bunker protector.',
    statEmphasis: ['con', 'con'], primaryAttributePool: MELEE_ATTR_POOL,
  },
  {
    id: 'wasteland_edge', name: 'Wasteland Edge', baseClass: 'melee', primaryCombatStyle: 'melee',
    description: 'Knife fighter with keen senses.',
    statEmphasis: ['str', 'per'], primaryAttributePool: MELEE_ATTR_POOL,
  },
];

// ============================
// RANGER (9 heroes)
// ============================
// Primary attribute pool: DEX or PER
// Combat style: ranger

const RANGER_ATTR_POOL: (keyof import('../types/hero').PrimaryStats)[] = ['dex', 'per'];

const rangerHeroes: ClassDefinition[] = [
  {
    id: 'dead_shot', name: 'Dead Shot', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Cold-blooded marksman.',
    statEmphasis: ['dex', 'per'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'dust_hawk', name: 'Dust Hawk', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Nomadic sharpshooter from the dunes.',
    statEmphasis: ['dex', 'dex'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'scrap_archer', name: 'Scrap Archer', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Crafts bows from salvaged materials.',
    statEmphasis: ['dex', 'str'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'neon_trigger', name: 'Neon Trigger', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Quick-draw gunfighter from neon city ruins.',
    statEmphasis: ['dex', 'spd'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'wind_stalker', name: 'Wind Stalker', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Silent tracker of the wastes.',
    statEmphasis: ['dex', 'per'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'iron_sight', name: 'Iron Sight', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Disciplined military sniper.',
    statEmphasis: ['dex', 'per'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'flash_bang', name: 'Flash Bang', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Unpredictable trickster with pistols.',
    statEmphasis: ['dex', 'luk'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'longbow_jack', name: 'Longbow Jack', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Endurance hunter who outlasts prey.',
    statEmphasis: ['dex', 'con'], primaryAttributePool: RANGER_ATTR_POOL,
  },
  {
    id: 'ruin_scout', name: 'Ruin Scout', baseClass: 'ranger', primaryCombatStyle: 'ranger',
    description: 'Urban explorer and spotter.',
    statEmphasis: ['dex', 'dex'], primaryAttributePool: RANGER_ATTR_POOL,
  },
];

// ============================
// DEMOLITION (9 heroes)
// ============================
// Primary attribute pool: INT (always)
// Combat style: demolitions

const DEMO_ATTR_POOL: (keyof import('../types/hero').PrimaryStats)[] = ['int'];

const demolitionHeroes: ClassDefinition[] = [
  {
    id: 'blast_core', name: 'Blast Core', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Obsessive explosives savant.',
    statEmphasis: ['int', 'int'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'cinder_maw', name: 'Cinder Maw', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Fire-scarred pyromaniac.',
    statEmphasis: ['int', 'con'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'fuse_wire', name: 'Fuse Wire', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Precise bomb technician.',
    statEmphasis: ['int', 'dex'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'acid_rain', name: 'Acid Rain', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Chemical weapons specialist.',
    statEmphasis: ['int', 'int'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'smoke_stack', name: 'Smoke Stack', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Industrial demolitions expert.',
    statEmphasis: ['int', 'con'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'volt_crash', name: 'Volt Crash', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Electrical saboteur.',
    statEmphasis: ['int', 'spd'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'shard_bomb', name: 'Shard Bomb', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Shrapnel specialist.',
    statEmphasis: ['int', 'str'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'rad_flask', name: 'Rad Flask', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Radiation chemist.',
    statEmphasis: ['int', 'res'], primaryAttributePool: DEMO_ATTR_POOL,
  },
  {
    id: 'scorch_mark', name: 'Scorch Mark', baseClass: 'demolition', primaryCombatStyle: 'demolitions',
    description: 'Precision arsonist.',
    statEmphasis: ['int', 'per'], primaryAttributePool: DEMO_ATTR_POOL,
  },
];

// ============================
// SUPPORT (9 heroes)
// ============================
// Primary attribute pool: CON or RES
// Combat style: melee (support uses melee combat style for triangle purposes)

const SUPPORT_ATTR_POOL: (keyof import('../types/hero').PrimaryStats)[] = ['con', 'res'];

const supportHeroes: ClassDefinition[] = [
  {
    id: 'patch_work', name: 'Patch Work', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Field medic with improvised tools.',
    statEmphasis: ['con', 'res'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'iron_will', name: 'Iron Will', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Unbreakable morale officer.',
    statEmphasis: ['con', 'con'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'signal_flare', name: 'Signal Flare', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Communications and coordination.',
    statEmphasis: ['con', 'per'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'haven_keeper', name: 'Haven Keeper', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Settlement healer and protector.',
    statEmphasis: ['con', 'res'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'war_drum', name: 'War Drum', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Battlefield drummer who rallies troops.',
    statEmphasis: ['con', 'str'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'spark_plug', name: 'Spark Plug', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Scrap-tech engineer and tinkerer.',
    statEmphasis: ['con', 'int'], primaryAttributePool: ['con', 'res', 'int'],
  },
  {
    id: 'life_line', name: 'Life Line', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Emergency rescue specialist.',
    statEmphasis: ['con', 'con'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'grid_lock', name: 'Grid Lock', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Tactical planner and strategist.',
    statEmphasis: ['con', 'int'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
  {
    id: 'supply_run', name: 'Supply Run', baseClass: 'support', primaryCombatStyle: 'melee',
    description: 'Logistics runner, always finds what\'s needed.',
    statEmphasis: ['con', 'luk'], primaryAttributePool: SUPPORT_ATTR_POOL,
  },
];

// ============================
// Combined class registry
// ============================

export const CLASSES: Record<string, ClassDefinition> = {};
for (const hero of [...meleeHeroes, ...rangerHeroes, ...demolitionHeroes, ...supportHeroes]) {
  CLASSES[hero.id] = hero;
}

export const CLASS_LIST = Object.values(CLASSES);
export const MELEE_CLASSES = CLASS_LIST.filter(c => c.baseClass === 'melee');
export const RANGER_CLASSES = CLASS_LIST.filter(c => c.baseClass === 'ranger');
export const DEMOLITION_CLASSES = CLASS_LIST.filter(c => c.baseClass === 'demolition');
export const SUPPORT_CLASSES = CLASS_LIST.filter(c => c.baseClass === 'support');

export function getClassById(id: string): ClassDefinition | undefined {
  return CLASSES[id];
}

// ============================
// JOB2 CLASS DEFINITIONS (12 total)
// ============================

export const JOB2_CLASSES: Record<string, Job2ClassDefinition> = {
  // Melee branches
  sentinel: {
    id: 'sentinel', name: 'Sentinel', parentBaseClass: 'melee',
    description: 'Immovable front-line defender with sword and shield.',
    signatureWeaponType: 'sword_shield',
    primaryAttributePool: ['str', 'con'],
  },
  bruiser: {
    id: 'bruiser', name: 'Bruiser', parentBaseClass: 'melee',
    description: 'Combo brawler who fights with fists and builds momentum.',
    signatureWeaponType: 'fists',
    primaryAttributePool: ['str', 'con'],
  },
  crusher: {
    id: 'crusher', name: 'Crusher', parentBaseClass: 'melee',
    description: 'Devastating slow heavy hitter with two-handed weapons.',
    signatureWeaponType: 'two_handed',
    primaryAttributePool: ['str', 'con'],
  },

  // Ranger branches
  sniper: {
    id: 'sniper', name: 'Sniper', parentBaseClass: 'ranger',
    description: 'Extremely slow but lethal marksman with collateral damage.',
    signatureWeaponType: 'scoped_rifle',
    primaryAttributePool: ['dex', 'per'],
  },
  gunslinger: {
    id: 'gunslinger', name: 'Gunslinger', parentBaseClass: 'ranger',
    description: 'Lightning-fast dual-pistol wielder with trick shots.',
    signatureWeaponType: 'dual_pistols',
    primaryAttributePool: ['dex', 'luk'],
  },
  hunter: {
    id: 'hunter', name: 'Hunter', parentBaseClass: 'ranger',
    description: 'Wasteland tracker with bow, traps, and poison arrows.',
    signatureWeaponType: 'bow',
    primaryAttributePool: ['dex', 'per'],
  },

  // Demolition branches
  bombardier: {
    id: 'bombardier', name: 'Bombardier', parentBaseClass: 'demolition',
    description: 'AoE saturation bombing with grenades and mortars.',
    signatureWeaponType: 'grenade_launcher',
    primaryAttributePool: ['int'],
  },
  arsonist: {
    id: 'arsonist', name: 'Arsonist', parentBaseClass: 'demolition',
    description: 'Fire spread specialist with flamethrower and burn DoTs.',
    signatureWeaponType: 'flamethrower',
    primaryAttributePool: ['int'],
  },
  chemist: {
    id: 'chemist', name: 'Chemist', parentBaseClass: 'demolition',
    description: 'Chemical warfare with acid, poison, and smoke flasks.',
    signatureWeaponType: 'flask_satchel',
    primaryAttributePool: ['int'],
  },

  // Support branches
  medic: {
    id: 'medic', name: 'Medic', parentBaseClass: 'support',
    description: 'Battlefield surgeon with heals, cleanses, and revives.',
    signatureWeaponType: 'book',
    primaryAttributePool: ['con', 'res'],
  },
  tactician: {
    id: 'tactician', name: 'Tactician', parentBaseClass: 'support',
    description: 'Battlefield commander with party buffs and formations.',
    signatureWeaponType: 'flagpole',
    primaryAttributePool: ['con', 'res'],
  },
  engineer: {
    id: 'engineer', name: 'Engineer', parentBaseClass: 'support',
    description: 'Wasteland techie deploying turrets, drones, and shields.',
    signatureWeaponType: 'tech_dispenser',
    primaryAttributePool: ['con', 'res', 'int'],
  },
};

export const JOB2_CLASS_LIST = Object.values(JOB2_CLASSES);

export function getJob2ClassById(id: string): Job2ClassDefinition | undefined {
  return JOB2_CLASSES[id];
}

/** Get the Job2 branches available for a given base class */
export function getJob2BranchesForBaseClass(baseClass: string): Job2ClassDefinition[] {
  return JOB2_CLASS_LIST.filter(j => j.parentBaseClass === baseClass);
}
