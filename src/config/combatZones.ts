export type CombatStyle = 'melee' | 'ranger' | 'demolitions';

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  damage: number;
  xpReward: number;
  combatStyle?: CombatStyle;
  resourceDrops: { resourceId: string; chance: number; minQty: number; maxQty: number }[];
}

export interface CombatZone {
  id: string;
  name: string;
  description: string;
  minLevel: number;
  maxTier: number; // max difficulty tier (1-6)
  baseGearTier: number; // what tier gear drops from bosses at T1
  /** 3 focused targets + 1 sweep */
  targets: ZoneTarget[];
  boss: Enemy;
  /** What gear template IDs can drop from the boss */
  bossDropPool: string[];
}

export interface ZoneTarget {
  id: string;
  name: string;
  description: string;
  enemy: Enemy;
  isSweep: boolean;
}

/** Tier multipliers for scaling zone difficulty */
export const ZONE_TIER_MULTIPLIERS = [
  { tier: 1, name: 'Normal',     hpMult: 1.0, dmgMult: 1.0, xpMult: 1.0 },
  { tier: 2, name: 'Hard',       hpMult: 2.5, dmgMult: 1.5, xpMult: 2.0 },
  { tier: 3, name: 'Elite',      hpMult: 5.0, dmgMult: 2.0, xpMult: 3.5 },
  { tier: 4, name: 'Nightmare',  hpMult: 10.0, dmgMult: 3.0, xpMult: 6.0 },
  { tier: 5, name: 'Apocalypse', hpMult: 20.0, dmgMult: 5.0, xpMult: 10.0 },
  { tier: 6, name: 'Extinction', hpMult: 40.0, dmgMult: 8.0, xpMult: 18.0 },
];

export const COMBAT_ZONES: Record<string, CombatZone> = {
  outskirts: {
    id: 'outskirts', name: 'The Outskirts', description: 'Edges of the wasteland. Mutated vermin and small creatures.', minLevel: 1, maxTier: 4, baseGearTier: 1,
    targets: [
      { id: 'marshland', name: 'Marshland', description: 'Hunt mutated mosquitoes.', isSweep: false,
        enemy: { id: 'mosquito', name: 'Mutated Mosquito', hp: 80, damage: 6, xpReward: 15, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.3, minQty: 1, maxQty: 2 }] }},
      { id: 'bog', name: 'Bog', description: 'Hunt mutated frogs.', isSweep: false,
        enemy: { id: 'frog', name: 'Mutated Frog', hp: 120, damage: 10, xpReward: 18, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.2, minQty: 1, maxQty: 1 }] }},
      { id: 'burrows', name: 'Burrows', description: 'Hunt mutated centipedes.', isSweep: false,
        enemy: { id: 'centipede', name: 'Mutated Centipede', hp: 100, damage: 14, xpReward: 20, resourceDrops: [{ resourceId: 'scrap_metal', chance: 0.25, minQty: 1, maxQty: 2 }] }},
      { id: 'outskirts_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'outskirts_mix', name: 'Wasteland Vermin', hp: 100, damage: 10, xpReward: 17, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.2, minQty: 1, maxQty: 1 }, { resourceId: 'scrap_metal', chance: 0.2, minQty: 1, maxQty: 1 }] }},
    ],
    boss: { id: 'giant_roach', name: 'Giant Roach', hp: 360, damage: 30, xpReward: 100, resourceDrops: [{ resourceId: 'scrap_metal', chance: 1, minQty: 5, maxQty: 10 }, { resourceId: 'chemical_fluids', chance: 0.5, minQty: 2, maxQty: 5 }] },
    bossDropPool: ['sharpened_pipe', 'rusty_machete', 'scrap_bow', 'pipe_bomb', 'patched_vest', 'cloth_wrappings', 'scrap_greaves', 'worn_gloves', 'wasteland_boots', 'scrap_buckler', 'rusty_ring', 'bone_earring', 'scrap_pendant'],
  },
  suburbs: {
    id: 'suburbs', name: 'Ruined Suburbs', description: 'Abandoned neighborhoods overrun by mutant animals.', minLevel: 15, maxTier: 5, baseGearTier: 2,
    targets: [
      { id: 'alleys', name: 'Alleys', description: 'Hunt feral dog packs.', isSweep: false,
        enemy: { id: 'feral_dog', name: 'Feral Dog Pack', hp: 240, damage: 24, xpReward: 35, resourceDrops: [{ resourceId: 'mutant_roots', chance: 0.3, minQty: 1, maxQty: 3 }] }},
      { id: 'rooftops', name: 'Rooftops', description: 'Hunt mutant hawks.', isSweep: false,
        enemy: { id: 'mutant_hawk', name: 'Mutant Hawk', hp: 180, damage: 36, xpReward: 40, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.3, minQty: 1, maxQty: 2 }] }},
      { id: 'basements', name: 'Basements', description: 'Hunt rad rat swarms.', isSweep: false,
        enemy: { id: 'rad_rats', name: 'Rad Rat Swarm', hp: 320, damage: 20, xpReward: 38, resourceDrops: [{ resourceId: 'scrap_metal', chance: 0.3, minQty: 2, maxQty: 4 }] }},
      { id: 'suburbs_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'suburbs_mix', name: 'Suburb Dweller', hp: 240, damage: 26, xpReward: 37, resourceDrops: [{ resourceId: 'iron_ore', chance: 0.2, minQty: 1, maxQty: 2 }, { resourceId: 'scrap_metal', chance: 0.2, minQty: 1, maxQty: 2 }] }},
    ],
    boss: { id: 'alpha_wolf', name: 'Alpha Wolf', hp: 1000, damage: 60, xpReward: 250, resourceDrops: [{ resourceId: 'iron_ore', chance: 1, minQty: 8, maxQty: 15 }, { resourceId: 'mechanical_parts', chance: 0.5, minQty: 3, maxQty: 8 }] },
    bossDropPool: ['spiked_club', 'raiders_cleaver', 'pipe_pistol', 'hunting_crossbow', 'frag_grenade', 'incendiary_mine', 'scrap_plate_chest', 'leather_duster', 'padded_lab_coat', 'iron_legguards', 'iron_gauntlets', 'iron_boots', 'iron_shield', 'copper_band', 'wire_earring', 'gear_pendant'],
  },
  industrial: {
    id: 'industrial', name: 'Toxic Industrial', description: 'Poisoned factory district with chemical mutants.', minLevel: 30, maxTier: 5, baseGearTier: 3,
    targets: [
      { id: 'chemical_vats', name: 'Chemical Vats', description: 'Hunt slime crawlers.', isSweep: false,
        enemy: { id: 'slime_crawler', name: 'Slime Crawler', hp: 480, damage: 44, xpReward: 65, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.4, minQty: 2, maxQty: 4 }] }},
      { id: 'assembly_line', name: 'Assembly Line', description: 'Fight rogue drones.', isSweep: false,
        enemy: { id: 'rogue_drone', name: 'Rogue Drone', hp: 400, damage: 60, xpReward: 70, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.4, minQty: 2, maxQty: 4 }] }},
      { id: 'waste_tunnels', name: 'Waste Tunnels', description: 'Hunt sewer beasts.', isSweep: false,
        enemy: { id: 'sewer_beast', name: 'Sewer Beast', hp: 600, damage: 50, xpReward: 75, resourceDrops: [{ resourceId: 'mechanical_parts', chance: 0.4, minQty: 2, maxQty: 4 }] }},
      { id: 'industrial_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'industrial_mix', name: 'Factory Mutant', hp: 480, damage: 50, xpReward: 70, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.2, minQty: 1, maxQty: 2 }, { resourceId: 'chemical_fluids', chance: 0.2, minQty: 1, maxQty: 2 }] }},
    ],
    boss: { id: 'factory_overseer', name: 'Factory Overseer', hp: 2000, damage: 100, xpReward: 500, resourceDrops: [{ resourceId: 'electronic_components', chance: 1, minQty: 10, maxQty: 20 }, { resourceId: 'mechanical_parts', chance: 1, minQty: 8, maxQty: 15 }] },
    bossDropPool: ['war_axe', 'serrated_blade', 'bolt_action_rifle', 'twin_pistols', 'concussion_launcher', 'cluster_mine', 'iron_breastplate', 'rangers_hide', 'insulated_vest', 'iron_legplates', 'combat_gauntlets', 'strider_boots', 'tower_shield', 'alloy_ring', 'circuit_earring', 'motor_pendant'],
  },
  deadlands: {
    id: 'deadlands', name: 'The Deadlands', description: 'Irradiated desert with dangerous creatures and raiders.', minLevel: 45, maxTier: 5, baseGearTier: 4,
    targets: [
      { id: 'sand_dunes', name: 'Sand Dunes', description: 'Hunt sandworms.', isSweep: false,
        enemy: { id: 'sandworm', name: 'Sandworm', hp: 800, damage: 70, xpReward: 100, resourceDrops: [{ resourceId: 'raw_stone', chance: 0.4, minQty: 3, maxQty: 6 }] }},
      { id: 'raider_camps', name: 'Raider Camps', description: 'Fight raider gangs.', isSweep: false,
        enemy: { id: 'raider_gang', name: 'Raider Gang', hp: 720, damage: 80, xpReward: 120, resourceDrops: [{ resourceId: 'scrap_metal', chance: 0.4, minQty: 3, maxQty: 6 }] }},
      { id: 'radiation_craters', name: 'Radiation Craters', description: 'Hunt glowing ghouls.', isSweep: false,
        enemy: { id: 'glowing_ghoul', name: 'Glowing Ghoul', hp: 720, damage: 90, xpReward: 110, resourceDrops: [{ resourceId: 'copper_ore', chance: 0.4, minQty: 3, maxQty: 6 }] }},
      { id: 'deadlands_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'deadlands_mix', name: 'Deadlands Dweller', hp: 760, damage: 80, xpReward: 110, resourceDrops: [{ resourceId: 'iron_ore', chance: 0.2, minQty: 2, maxQty: 4 }, { resourceId: 'raw_stone', chance: 0.2, minQty: 2, maxQty: 4 }] }},
    ],
    boss: { id: 'raider_warlord', name: 'Raider Warlord', hp: 3200, damage: 140, xpReward: 800, resourceDrops: [{ resourceId: 'iron_ore', chance: 1, minQty: 15, maxQty: 30 }, { resourceId: 'copper_ore', chance: 1, minQty: 10, maxQty: 20 }, { resourceId: 'icqor_chess_piece', chance: 0.15, minQty: 1, maxQty: 1 }] },
    bossDropPool: ['reinforced_mace', 'assassins_dirk', 'scoped_carbine', 'repeater_crossbow', 'rocket_launcher', 'toxic_gas_canister', 'plated_war_armor', 'shadow_leathers', 'hazmat_suit', 'plated_legguards', 'precision_gauntlets', 'plated_boots', 'bulwark_shield', 'titanium_ring', 'hydraulic_earring', 'fusion_pendant'],
  },
  military: {
    id: 'military', name: 'Military Zone', description: 'Walled-off military installation with automated defenses.', minLevel: 60, maxTier: 6, baseGearTier: 5,
    targets: [
      { id: 'perimeter', name: 'Perimeter', description: 'Fight turret arrays.', isSweep: false,
        enemy: { id: 'turret_array', name: 'Turret Array', hp: 1200, damage: 100, xpReward: 160, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.5, minQty: 3, maxQty: 6 }] }},
      { id: 'barracks', name: 'Barracks', description: 'Fight bio-soldiers.', isSweep: false,
        enemy: { id: 'bio_soldier', name: 'Bio-Soldier', hp: 1120, damage: 120, xpReward: 180, resourceDrops: [{ resourceId: 'mechanical_parts', chance: 0.5, minQty: 3, maxQty: 6 }] }},
      { id: 'research_lab', name: 'Research Lab', description: 'Fight escaped experiments.', isSweep: false,
        enemy: { id: 'experiment', name: 'Escaped Experiment', hp: 1600, damage: 160, xpReward: 200, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.5, minQty: 4, maxQty: 8 }] }},
      { id: 'military_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'military_mix', name: 'Military Hazard', hp: 1280, damage: 120, xpReward: 180, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.2, minQty: 2, maxQty: 4 }, { resourceId: 'mechanical_parts', chance: 0.2, minQty: 2, maxQty: 4 }] }},
    ],
    boss: { id: 'commander_mech', name: 'Commander Mech', hp: 6000, damage: 240, xpReward: 1200, resourceDrops: [{ resourceId: 'electronic_components', chance: 1, minQty: 20, maxQty: 40 }, { resourceId: 'mechanical_parts', chance: 1, minQty: 15, maxQty: 30 }, { resourceId: 'icqor_chess_piece', chance: 0.30, minQty: 1, maxQty: 2 }] },
    bossDropPool: ['warlords_hammer', 'shadow_fang', 'marksmans_rifle', 'dual_revolvers', 'siege_mortar', 'napalm_launcher', 'fortress_plate', 'nightstalker_suit', 'reactor_vest', 'fortress_legplates', 'deadeye_gloves', 'fortress_boots', 'siege_shield', 'plasma_ring', 'resonance_earring', 'core_pendant'],
  },
  the_core: {
    id: 'the_core', name: 'The Core', description: 'Reactor core where the apocalypse began. Maximum radiation.', minLevel: 80, maxTier: 6, baseGearTier: 7,
    targets: [
      { id: 'outer_ring', name: 'Outer Ring', description: 'Fight radiation elementals.', isSweep: false,
        enemy: { id: 'rad_elemental', name: 'Radiation Elemental', hp: 2000, damage: 200, xpReward: 300, resourceDrops: [{ resourceId: 'copper_ore', chance: 0.5, minQty: 5, maxQty: 10 }] }},
      { id: 'inner_chamber', name: 'Inner Chamber', description: 'Fight mutant abominations.', isSweep: false,
        enemy: { id: 'abomination', name: 'Mutant Abomination', hp: 2400, damage: 260, xpReward: 350, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.5, minQty: 5, maxQty: 10 }] }},
      { id: 'reactor_room', name: 'Reactor Room', description: 'Fight fusion golems.', isSweep: false,
        enemy: { id: 'fusion_golem', name: 'Fusion Golem', hp: 2800, damage: 300, xpReward: 400, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.5, minQty: 5, maxQty: 10 }] }},
      { id: 'core_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'core_mix', name: 'Core Abomination', hp: 2400, damage: 250, xpReward: 350, resourceDrops: [{ resourceId: 'copper_ore', chance: 0.2, minQty: 3, maxQty: 6 }, { resourceId: 'electronic_components', chance: 0.2, minQty: 3, maxQty: 6 }] }},
    ],
    boss: { id: 'the_source', name: 'The Source', hp: 12000, damage: 400, xpReward: 2500, resourceDrops: [{ resourceId: 'electronic_components', chance: 1, minQty: 30, maxQty: 60 }, { resourceId: 'copper_ore', chance: 1, minQty: 25, maxQty: 50 }, { resourceId: 'icqor_chess_piece', chance: 0.50, minQty: 1, maxQty: 3 }] },
    bossDropPool: ['titan_cleaver', 'phantom_blade', 'anti_material_rifle', 'storm_repeater', 'plasma_bombard', 'radiation_emitter', 'siege_bulwark', 'wraith_armor', 'fusion_core_suit', 'titan_legplates', 'assassin_gloves', 'titan_boots', 'dreadnought_shield', 'quantum_ring', 'void_earring', 'stellar_pendant'],
  },
  ground_zero: {
    id: 'ground_zero', name: 'Ground Zero', description: 'The epicenter. Reality warps here. Only the strongest survive.', minLevel: 95, maxTier: 6, baseGearTier: 8,
    targets: [
      { id: 'crater_edge', name: 'Crater Edge', description: 'Fight phase walkers.', isSweep: false,
        enemy: { id: 'phase_walker', name: 'Phase Walker', hp: 3200, damage: 360, xpReward: 500, resourceDrops: [{ resourceId: 'iron_ore', chance: 0.5, minQty: 8, maxQty: 15 }] }},
      { id: 'anomaly_field', name: 'Anomaly Field', description: 'Fight reality breakers.', isSweep: false,
        enemy: { id: 'reality_breaker', name: 'Reality Breaker', hp: 4000, damage: 400, xpReward: 600, resourceDrops: [{ resourceId: 'electronic_components', chance: 0.5, minQty: 8, maxQty: 15 }] }},
      { id: 'epicenter', name: 'Epicenter', description: 'Fight apocalypse heralds.', isSweep: false,
        enemy: { id: 'apocalypse_herald', name: 'Apocalypse Herald', hp: 4800, damage: 500, xpReward: 700, resourceDrops: [{ resourceId: 'chemical_fluids', chance: 0.5, minQty: 8, maxQty: 15 }] }},
      { id: 'gz_sweep', name: 'Full Sweep', description: 'Clear everything. Boss every 10 kills.', isSweep: true,
        enemy: { id: 'gz_mix', name: 'Void Entity', hp: 4000, damage: 420, xpReward: 600, resourceDrops: [{ resourceId: 'iron_ore', chance: 0.3, minQty: 5, maxQty: 10 }, { resourceId: 'electronic_components', chance: 0.3, minQty: 5, maxQty: 10 }] }},
    ],
    boss: { id: 'the_cataclysm', name: 'The Cataclysm', hp: 20000, damage: 600, xpReward: 5000, resourceDrops: [{ resourceId: 'electronic_components', chance: 1, minQty: 50, maxQty: 100 }, { resourceId: 'iron_ore', chance: 1, minQty: 40, maxQty: 80 }, { resourceId: 'icqor_chess_piece', chance: 0.80, minQty: 2, maxQty: 5 }] },
    bossDropPool: ['apocalypse_edge', 'railgun', 'orbital_beacon', 'doomsday_maul', 'oblivion_cannon', 'apocalypse_device', 'apocalypse_aegis', 'void_walker_suit', 'singularity_frame', 'eternity_shell', 'doomsday_legplates', 'godhand_gloves', 'godstep_boots', 'world_shield', 'infinity_ring', 'void_earring_t8', 'eternity_amulet'],
  },
};

export const COMBAT_ZONE_LIST = Object.values(COMBAT_ZONES);
