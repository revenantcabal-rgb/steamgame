/**
 * Encampment Building Definitions
 *
 * 20 buildings across 7 categories providing passive bonuses and worker resource trickle.
 * Each building can be leveled 1-10, costs scale exponentially.
 * Exactly 1 worker can be assigned per building for passive resource generation.
 */

export type BuildingCategory = 'gathering' | 'production' | 'combat' | 'worker' | 'hero' | 'economy' | 'special';

export type BonusType =
  | 'gathering_speed_scavenging'
  | 'gathering_speed_foraging'
  | 'gathering_speed_salvage_hunting'
  | 'gathering_speed_water_reclamation'
  | 'gathering_speed_prospecting'
  | 'gathering_yield_all'
  | 'production_speed'
  | 'combat_damage'
  | 'combat_defense'
  | 'combat_hp'
  | 'worker_speed'
  | 'worker_survivability'
  | 'worker_capacity'
  | 'hero_xp'
  | 'hero_combat_damage'
  | 'marketplace_sell_bonus'
  | 'rare_drop_chance'
  | 'worker_respawn_speed'
  | 'expedition_reward';

export interface BuildingCost {
  resourceId: string;
  baseQuantity: number;
}

export interface BuildingDefinition {
  id: string;
  name: string;
  description: string;
  flavor: string;
  category: BuildingCategory;
  /** What bonus this building provides */
  bonusType: BonusType;
  /** Base bonus % at level 1 */
  baseBonusPercent: number;
  /** Additional bonus per level beyond 1 */
  bonusPerLevel: number;
  /** Is the bonus flat (not %) — e.g., worker_capacity adds flat pop cap */
  isFlatBonus: boolean;
  /** Maximum building level */
  maxLevel: number;
  /** Resource the assigned worker passively generates */
  workerResourceId: string;
  /** Base seconds between worker trickle ticks */
  workerTickSeconds: number;
  /** Base quantity per worker tick */
  workerBaseYield: number;
  /** Resources required to build/upgrade */
  buildCosts: BuildingCost[];
}

/** Cost at a given level: baseQuantity * (1.8 ^ (level - 1)) */
export function getBuildCost(building: BuildingDefinition, level: number): { resourceId: string; quantity: number }[] {
  return building.buildCosts.map(c => ({
    resourceId: c.resourceId,
    quantity: Math.floor(c.baseQuantity * Math.pow(1.8, level - 1)),
  }));
}

/** Get bonus % (or flat value) at a given level */
export function getBonusAtLevel(building: BuildingDefinition, level: number): number {
  if (level <= 0) return 0;
  return building.baseBonusPercent + building.bonusPerLevel * (level - 1);
}

/** Worker trickle interval at a given building level (seconds) */
export function getWorkerTickInterval(building: BuildingDefinition, level: number): number {
  return building.workerTickSeconds / (1 + 0.15 * (level - 1));
}

export const BUILDINGS: Record<string, BuildingDefinition> = {
  // ============================
  // GATHERING (5)
  // ============================
  scrap_forge: {
    id: 'scrap_forge',
    name: 'Scrap Forge',
    description: 'Increases scavenging speed for all workers and heroes.',
    flavor: 'A rusted furnace repurposed to process scavenged metals faster.',
    category: 'gathering',
    bonusType: 'gathering_speed_scavenging',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'scrap_metal', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'scrap_metal', baseQuantity: 20 },
      { resourceId: 'salvaged_wood', baseQuantity: 15 },
      { resourceId: 'rusted_pipes', baseQuantity: 10 },
    ],
  },
  greenhouse_dome: {
    id: 'greenhouse_dome',
    name: 'Greenhouse Dome',
    description: 'Increases foraging speed for all workers and heroes.',
    flavor: 'A cracked dome of pre-war glass sheltering mutant plants.',
    category: 'gathering',
    bonusType: 'gathering_speed_foraging',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'wild_herbs', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'wild_herbs', baseQuantity: 20 },
      { resourceId: 'wasteland_berries', baseQuantity: 15 },
      { resourceId: 'salvaged_wood', baseQuantity: 10 },
    ],
  },
  salvage_workshop: {
    id: 'salvage_workshop',
    name: 'Salvage Workshop',
    description: 'Increases salvage hunting speed for all workers and heroes.',
    flavor: 'A workbench strewn with tools for dismantling old-world machinery.',
    category: 'gathering',
    bonusType: 'gathering_speed_salvage_hunting',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'mechanical_parts', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'mechanical_parts', baseQuantity: 20 },
      { resourceId: 'electronic_components', baseQuantity: 15 },
      { resourceId: 'scrap_metal', baseQuantity: 10 },
    ],
  },
  water_cistern: {
    id: 'water_cistern',
    name: 'Water Cistern',
    description: 'Increases water reclamation speed for all workers and heroes.',
    flavor: 'A reinforced concrete tank that collects and filters water.',
    category: 'gathering',
    bonusType: 'gathering_speed_water_reclamation',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'rainwater', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'rainwater', baseQuantity: 20 },
      { resourceId: 'rusted_pipes', baseQuantity: 15 },
      { resourceId: 'raw_stone', baseQuantity: 10 },
    ],
  },
  mine_shaft: {
    id: 'mine_shaft',
    name: 'Mine Shaft',
    description: 'Increases prospecting speed for all workers and heroes.',
    flavor: 'A shored-up tunnel descending into ore-rich earth.',
    category: 'gathering',
    bonusType: 'gathering_speed_prospecting',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'iron_ore', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'iron_ore', baseQuantity: 20 },
      { resourceId: 'salvaged_wood', baseQuantity: 15 },
      { resourceId: 'raw_stone', baseQuantity: 10 },
    ],
  },

  // ============================
  // PRODUCTION (2)
  // ============================
  assembly_line: {
    id: 'assembly_line',
    name: 'Assembly Line',
    description: 'Increases production crafting speed for cooking, tinkering, and biochemistry.',
    flavor: 'Conveyor belts and pneumatic tools from a lost age of manufacturing.',
    category: 'production',
    bonusType: 'production_speed',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'mechanical_parts', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'mechanical_parts', baseQuantity: 25 },
      { resourceId: 'electronic_components', baseQuantity: 15 },
      { resourceId: 'scrap_metal', baseQuantity: 15 },
    ],
  },
  alchemists_lab: {
    id: 'alchemists_lab',
    name: "Alchemist's Lab",
    description: 'Increases rare drop chance from gathering and combat.',
    flavor: 'Bubbling vials and stained journals — a haven for biochemists.',
    category: 'production',
    bonusType: 'rare_drop_chance',
    baseBonusPercent: 1.5, bonusPerLevel: 1.5, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'chemical_fluids', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'chemical_fluids', baseQuantity: 20 },
      { resourceId: 'wild_herbs', baseQuantity: 15 },
      { resourceId: 'copper_ore', baseQuantity: 10 },
    ],
  },

  // ============================
  // COMBAT (3)
  // ============================
  armory: {
    id: 'armory',
    name: 'Armory',
    description: 'Increases all hero combat damage.',
    flavor: 'Racks of weapons, maintained and sharpened for battle.',
    category: 'combat',
    bonusType: 'combat_damage',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'iron_ore', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'iron_ore', baseQuantity: 25 },
      { resourceId: 'scrap_metal', baseQuantity: 20 },
      { resourceId: 'salvaged_wood', baseQuantity: 10 },
    ],
  },
  fortified_wall: {
    id: 'fortified_wall',
    name: 'Fortified Wall',
    description: 'Increases all hero defense in combat.',
    flavor: 'Layered concrete and rebar shielding the encampment perimeter.',
    category: 'combat',
    bonusType: 'combat_defense',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'raw_stone', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'raw_stone', baseQuantity: 25 },
      { resourceId: 'scrap_metal', baseQuantity: 15 },
      { resourceId: 'salvaged_wood', baseQuantity: 15 },
    ],
  },
  medic_tent: {
    id: 'medic_tent',
    name: 'Medic Tent',
    description: 'Increases all hero max HP in combat.',
    flavor: 'Stretchers, bandages, and a faint smell of antiseptic.',
    category: 'combat',
    bonusType: 'combat_hp',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'wild_herbs', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'wild_herbs', baseQuantity: 20 },
      { resourceId: 'rainwater', baseQuantity: 15 },
      { resourceId: 'mutant_roots', baseQuantity: 10 },
    ],
  },

  // ============================
  // WORKER (3)
  // ============================
  barracks: {
    id: 'barracks',
    name: 'Barracks',
    description: 'Increases worker trip speed globally.',
    flavor: 'Bunk beds and gear lockers — rest means better performance.',
    category: 'worker',
    bonusType: 'worker_speed',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'salvaged_wood', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'salvaged_wood', baseQuantity: 20 },
      { resourceId: 'scrap_metal', baseQuantity: 15 },
      { resourceId: 'rusted_pipes', baseQuantity: 10 },
    ],
  },
  training_ground: {
    id: 'training_ground',
    name: 'Training Ground',
    description: 'Increases worker survivability on gathering trips.',
    flavor: 'An obstacle course built from rubble. Workers train here to survive the wastes.',
    category: 'worker',
    bonusType: 'worker_survivability',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'raw_stone', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'raw_stone', baseQuantity: 20 },
      { resourceId: 'salvaged_wood', baseQuantity: 15 },
      { resourceId: 'iron_ore', baseQuantity: 10 },
    ],
  },
  bunkhouse: {
    id: 'bunkhouse',
    name: 'Bunkhouse',
    description: 'Expands population cap by +2 per level.',
    flavor: 'Additional housing to support a larger workforce.',
    category: 'worker',
    bonusType: 'worker_capacity',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: true, maxLevel: 10,
    workerResourceId: 'salvaged_wood', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'salvaged_wood', baseQuantity: 25 },
      { resourceId: 'scrap_metal', baseQuantity: 15 },
      { resourceId: 'rusted_pipes', baseQuantity: 10 },
    ],
  },

  // ============================
  // HERO (2)
  // ============================
  war_room: {
    id: 'war_room',
    name: 'War Room',
    description: 'Increases hero XP gained from combat and expeditions.',
    flavor: 'Maps, intel reports, and tactical planning tables.',
    category: 'hero',
    bonusType: 'hero_xp',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'electronic_components', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'electronic_components', baseQuantity: 20 },
      { resourceId: 'mechanical_parts', baseQuantity: 15 },
      { resourceId: 'scrap_metal', baseQuantity: 10 },
    ],
  },
  sparring_ring: {
    id: 'sparring_ring',
    name: 'Sparring Ring',
    description: 'Provides an additional combat damage bonus to all heroes.',
    flavor: 'A roped-off area where heroes hone their combat skills.',
    category: 'hero',
    bonusType: 'hero_combat_damage',
    baseBonusPercent: 1.5, bonusPerLevel: 1.5, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'scrap_metal', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'scrap_metal', baseQuantity: 20 },
      { resourceId: 'iron_ore', baseQuantity: 15 },
      { resourceId: 'salvaged_wood', baseQuantity: 10 },
    ],
  },

  // ============================
  // ECONOMY (2)
  // ============================
  trading_post: {
    id: 'trading_post',
    name: 'Trading Post',
    description: 'Increases marketplace sell value for all items.',
    flavor: 'A counter and lockbox — the hub of wasteland commerce.',
    category: 'economy',
    bonusType: 'marketplace_sell_bonus',
    baseBonusPercent: 3, bonusPerLevel: 3, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'copper_ore', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'copper_ore', baseQuantity: 20 },
      { resourceId: 'salvaged_wood', baseQuantity: 15 },
      { resourceId: 'mechanical_parts', baseQuantity: 10 },
    ],
  },
  supply_depot: {
    id: 'supply_depot',
    name: 'Supply Depot',
    description: 'Increases all gathering yield globally.',
    flavor: 'Organized shelving maximizes how much gatherers bring home.',
    category: 'economy',
    bonusType: 'gathering_yield_all',
    baseBonusPercent: 1.5, bonusPerLevel: 1.5, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'scrap_metal', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'scrap_metal', baseQuantity: 20 },
      { resourceId: 'salvaged_wood', baseQuantity: 15 },
      { resourceId: 'mechanical_parts', baseQuantity: 10 },
    ],
  },

  // ============================
  // SPECIAL (3)
  // ============================
  radio_tower: {
    id: 'radio_tower',
    name: 'Radio Tower',
    description: 'Increases expedition reward bonuses.',
    flavor: 'A crackling transmitter that picks up signals from distant expeditions.',
    category: 'special',
    bonusType: 'expedition_reward',
    baseBonusPercent: 2, bonusPerLevel: 2, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'electronic_components', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'electronic_components', baseQuantity: 25 },
      { resourceId: 'copper_ore', baseQuantity: 15 },
      { resourceId: 'mechanical_parts', baseQuantity: 10 },
    ],
  },
  infirmary: {
    id: 'infirmary',
    name: 'Infirmary',
    description: 'Reduces worker respawn time after death.',
    flavor: 'A proper medical facility that gets injured workers back on their feet faster.',
    category: 'special',
    bonusType: 'worker_respawn_speed',
    baseBonusPercent: 5, bonusPerLevel: 5, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'wild_herbs', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'wild_herbs', baseQuantity: 20 },
      { resourceId: 'chemical_fluids', baseQuantity: 15 },
      { resourceId: 'rainwater', baseQuantity: 10 },
    ],
  },
  watchtower: {
    id: 'watchtower',
    name: 'Watchtower',
    description: 'Additional worker survivability bonus (stacks with Training Ground).',
    flavor: 'Eyes on the horizon. Early warning saves lives.',
    category: 'special',
    bonusType: 'worker_survivability',
    baseBonusPercent: 1.5, bonusPerLevel: 1.5, isFlatBonus: false, maxLevel: 10,
    workerResourceId: 'salvaged_wood', workerTickSeconds: 60, workerBaseYield: 1,
    buildCosts: [
      { resourceId: 'salvaged_wood', baseQuantity: 20 },
      { resourceId: 'iron_ore', baseQuantity: 15 },
      { resourceId: 'raw_stone', baseQuantity: 10 },
    ],
  },
};

export const BUILDING_LIST = Object.values(BUILDINGS);

export const BUILDING_CATEGORIES: { id: BuildingCategory; name: string; color: string }[] = [
  { id: 'gathering', name: 'Gathering', color: '#27ae60' },
  { id: 'production', name: 'Production', color: '#f39c12' },
  { id: 'combat', name: 'Combat', color: '#e74c3c' },
  { id: 'worker', name: 'Workers', color: '#3498db' },
  { id: 'hero', name: 'Heroes', color: '#9b59b6' },
  { id: 'economy', name: 'Economy', color: '#1abc9c' },
  { id: 'special', name: 'Special', color: '#e67e22' },
];

export function getBuildingsByCategory(category: BuildingCategory): BuildingDefinition[] {
  return BUILDING_LIST.filter(b => b.category === category);
}
