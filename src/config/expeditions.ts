import type { Enemy } from './combatZones';

// ──────────────────────────────────────────────
// Expedition Difficulty
// ──────────────────────────────────────────────
export type ExpeditionDifficulty = 'normal' | 'hard' | 'extreme';

export interface DifficultyScaling {
  name: string;
  hpMult: number;
  dmgMult: number;
  xpMult: number;
  /** Extra loot drop chance multiplier */
  lootMult: number;
  /** Minimum recommended total hero level */
  recommendedPower: number;
}

export const DIFFICULTY_SCALING: Record<ExpeditionDifficulty, DifficultyScaling> = {
  normal:  { name: 'Normal',  hpMult: 3.0,  dmgMult: 2.0,  xpMult: 2.0,  lootMult: 1.0, recommendedPower: 50 },
  hard:    { name: 'Hard',    hpMult: 6.0,  dmgMult: 4.0,  xpMult: 4.0,  lootMult: 2.0, recommendedPower: 100 },
  extreme: { name: 'Extreme', hpMult: 12.0, dmgMult: 8.0,  xpMult: 8.0,  lootMult: 4.0, recommendedPower: 200 },
};

// ──────────────────────────────────────────────
// Expedition Wave
// ──────────────────────────────────────────────
export interface ExpeditionWave {
  id: string;
  name: string;
  enemies: Enemy[];
  /** Number of sequential fights in this wave (each enemy is fought in order) */
  isBossWave: boolean;
}

// ──────────────────────────────────────────────
// Expedition Definition
// ──────────────────────────────────────────────
export interface ExpeditionDef {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  maxPartySize: number;
  waves: ExpeditionWave[];
  /** Gear template IDs that can drop from the final boss */
  rewardPool: string[];
  /** Resource rewards on completion */
  completionRewards: { resourceId: string; minQty: number; maxQty: number }[];
  /** Fight duration per enemy (in ticks) */
  fightDuration: number;
}

// ──────────────────────────────────────────────
// Expedition Definitions
// ──────────────────────────────────────────────
export const EXPEDITIONS: Record<string, ExpeditionDef> = {
  sewers: {
    id: 'sewers',
    name: 'The Forgotten Sewers',
    description: 'A labyrinth of toxic tunnels beneath the ruins. Mutated creatures lurk in the dark.',
    minLevel: 1,
    maxPartySize: 5,
    fightDuration: 10,
    waves: [
      {
        id: 'sewers_w1', name: 'Tunnel Entrance', isBossWave: false,
        enemies: [
          { id: 'sewer_rat', name: 'Sewer Rat Swarm', hp: 60, damage: 8, xpReward: 25, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.4, minQty: 1, maxQty: 3 }] },
          { id: 'sewer_slug', name: 'Toxic Slug', hp: 80, damage: 10, xpReward: 30, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.3, minQty: 1, maxQty: 2 }] },
        ],
      },
      {
        id: 'sewers_w2', name: 'Flooded Chambers', isBossWave: false,
        enemies: [
          { id: 'sewer_croc', name: 'Wasteland Crocodile', hp: 120, damage: 18, xpReward: 45, resourceDrops: [{ resourceId: 'scrap_metal', chance: 0.3, minQty: 2, maxQty: 4 }] },
          { id: 'sewer_leech', name: 'Giant Leech', hp: 90, damage: 14, xpReward: 35, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.4, minQty: 1, maxQty: 3 }] },
          { id: 'sewer_jelly', name: 'Acid Jellyfish', hp: 100, damage: 20, xpReward: 40, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.5, minQty: 2, maxQty: 4 }] },
        ],
      },
      {
        id: 'sewers_w3', name: 'The Drain King\'s Lair', isBossWave: true,
        enemies: [
          { id: 'drain_king', name: 'The Drain King', hp: 400, damage: 35, xpReward: 200, resourceDrops: [{ resourceId: 'scrap_metal', chance: 1, minQty: 8, maxQty: 15 }, { resourceId: 'chemical_fluids', chance: 1, minQty: 5, maxQty: 10 }] },
        ],
      },
    ],
    rewardPool: ['sharpened_pipe', 'rusty_machete', 'scrap_bow', 'patched_vest', 'scrap_buckler'],
    completionRewards: [
      { resourceId: 'scrap_metal', minQty: 10, maxQty: 25 },
      { resourceId: 'chemical_fluids', minQty: 5, maxQty: 12 },
    ],
  },
  bunker: {
    id: 'bunker',
    name: 'Abandoned Military Bunker',
    description: 'A pre-war military installation crawling with rogue drones and automated defenses.',
    minLevel: 15,
    maxPartySize: 5,
    fightDuration: 12,
    waves: [
      {
        id: 'bunker_w1', name: 'Perimeter Breach', isBossWave: false,
        enemies: [
          { id: 'turret', name: 'Auto-Turret', hp: 150, damage: 22, xpReward: 50, resourceDrops: [{ resourceId: 'mechanical_parts', chance: 0.4, minQty: 1, maxQty: 3 }] },
          { id: 'scout_drone', name: 'Scout Drone', hp: 100, damage: 18, xpReward: 40, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.5, minQty: 1, maxQty: 2 }] },
        ],
      },
      {
        id: 'bunker_w2', name: 'Armory Corridor', isBossWave: false,
        enemies: [
          { id: 'war_bot', name: 'War Bot', hp: 250, damage: 30, xpReward: 65, resourceDrops: [{ resourceId: 'mechanical_parts', chance: 0.5, minQty: 2, maxQty: 4 }] },
          { id: 'shock_trap', name: 'Shock Trap', hp: 80, damage: 40, xpReward: 45, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.3, minQty: 1, maxQty: 2 }] },
          { id: 'patrol_unit', name: 'Patrol Unit', hp: 180, damage: 25, xpReward: 55, resourceDrops: [{ resourceId: 'rusted_pipes', chance: 0.4, minQty: 2, maxQty: 5 }] },
        ],
      },
      {
        id: 'bunker_w3', name: 'Security Wing', isBossWave: false,
        enemies: [
          { id: 'elite_drone', name: 'Elite Combat Drone', hp: 300, damage: 35, xpReward: 75, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.6, minQty: 2, maxQty: 4 }] },
          { id: 'flame_bot', name: 'Flame Bot', hp: 200, damage: 45, xpReward: 70, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.5, minQty: 2, maxQty: 5 }] },
        ],
      },
      {
        id: 'bunker_w4', name: 'Command Center', isBossWave: true,
        enemies: [
          { id: 'commander_unit', name: 'Commander Unit MK-IV', hp: 800, damage: 55, xpReward: 400, resourceDrops: [{ resourceId: 'mechanical_parts', chance: 1, minQty: 10, maxQty: 20 }, { resourceId: 'electronic_components', chance: 1, minQty: 8, maxQty: 15 }] },
        ],
      },
    ],
    rewardPool: ['spiked_club', 'hunters_crossbow', 'scrap_plate_chest', 'reinforced_pants', 'iron_gauntlets', 'combat_boots', 'reinforced_buckler'],
    completionRewards: [
      { resourceId: 'mechanical_parts', minQty: 12, maxQty: 30 },
      { resourceId: 'electronic_components', minQty: 8, maxQty: 20 },
      { resourceId: 'iron_ore', minQty: 10, maxQty: 25 },
    ],
  },
  reactor: {
    id: 'reactor',
    name: 'The Molten Reactor',
    description: 'A collapsed nuclear facility. Radiation-mutated horrors guard the unstable core.',
    minLevel: 30,
    maxPartySize: 5,
    fightDuration: 15,
    waves: [
      {
        id: 'reactor_w1', name: 'Outer Containment', isBossWave: false,
        enemies: [
          { id: 'rad_zombie', name: 'Irradiated Shambler', hp: 300, damage: 35, xpReward: 80, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.4, minQty: 2, maxQty: 5 }] },
          { id: 'rad_hound', name: 'Glowing Hound', hp: 220, damage: 45, xpReward: 70, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.5, minQty: 3, maxQty: 6 }] },
        ],
      },
      {
        id: 'reactor_w2', name: 'Cooling Tunnels', isBossWave: false,
        enemies: [
          { id: 'rad_spider', name: 'Reactor Spider', hp: 350, damage: 50, xpReward: 90, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.5, minQty: 3, maxQty: 6 }] },
          { id: 'meltdown_slug', name: 'Meltdown Slug', hp: 400, damage: 40, xpReward: 85, resourceDrops: [{ resourceId: 'iron_ore', chance: 0.4, minQty: 3, maxQty: 7 }] },
          { id: 'rad_swarm', name: 'Rad-Fly Swarm', hp: 200, damage: 60, xpReward: 75, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.6, minQty: 2, maxQty: 5 }] },
        ],
      },
      {
        id: 'reactor_w3', name: 'Inner Chamber', isBossWave: false,
        enemies: [
          { id: 'rad_golem', name: 'Slag Golem', hp: 600, damage: 55, xpReward: 120, resourceDrops: [{ resourceId: 'iron_ore', chance: 0.6, minQty: 4, maxQty: 8 }] },
          { id: 'rad_wraith', name: 'Radiation Wraith', hp: 450, damage: 65, xpReward: 110, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.5, minQty: 3, maxQty: 6 }] },
        ],
      },
      {
        id: 'reactor_w4', name: 'The Core', isBossWave: true,
        enemies: [
          { id: 'core_beast', name: 'Core Beast — Isotope Prime', hp: 1500, damage: 80, xpReward: 800, resourceDrops: [{ resourceId: 'iron_ore', chance: 1, minQty: 15, maxQty: 30 }, { resourceId: 'chemical_fluids', chance: 1, minQty: 10, maxQty: 20 }, { resourceId: 'electronic_components', chance: 0.8, minQty: 8, maxQty: 15 }] },
        ],
      },
    ],
    rewardPool: ['reinforced_machete', 'compound_bow', 'blast_charge', 'plated_vest', 'plate_greaves', 'tactical_gloves', 'steel_boots', 'tower_shield'],
    completionRewards: [
      { resourceId: 'iron_ore', minQty: 20, maxQty: 40 },
      { resourceId: 'chemical_fluids', minQty: 15, maxQty: 30 },
      { resourceId: 'electronic_components', minQty: 10, maxQty: 25 },
    ],
  },
};

export const EXPEDITION_LIST = Object.values(EXPEDITIONS);
