export interface Resource {
  id: string;
  name: string;
  description: string;
  sourceSkillId: string;
  sellValue: number;
}

export const RESOURCES: Record<string, Resource> = {
  // === SCAVENGING ===
  scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', description: 'Bent and rusty metal sheets and bars.', sourceSkillId: 'scavenging', sellValue: 3 },
  salvaged_wood: { id: 'salvaged_wood', name: 'Salvaged Wood', description: 'Charred but usable lumber from old structures.', sourceSkillId: 'scavenging', sellValue: 3 },
  rusted_pipes: { id: 'rusted_pipes', name: 'Rusted Pipes', description: 'Plumbing and industrial piping.', sourceSkillId: 'scavenging', sellValue: 3 },

  // === FORAGING ===
  wild_herbs: { id: 'wild_herbs', name: 'Wild Herbs', description: 'Medicinal and aromatic plants.', sourceSkillId: 'foraging', sellValue: 2 },
  wasteland_berries: { id: 'wasteland_berries', name: 'Wasteland Berries', description: 'Mildly irradiated but edible fruit.', sourceSkillId: 'foraging', sellValue: 2 },
  mutant_roots: { id: 'mutant_roots', name: 'Mutant Roots', description: 'Oversized root vegetables mutated by radiation.', sourceSkillId: 'foraging', sellValue: 2 },

  // === SALVAGE HUNTING ===
  mechanical_parts: { id: 'mechanical_parts', name: 'Mechanical Parts', description: 'Gears, springs, bolts, and bearings.', sourceSkillId: 'salvage_hunting', sellValue: 5 },
  electronic_components: { id: 'electronic_components', name: 'Electronic Components', description: 'Wiring, circuit boards, and capacitors.', sourceSkillId: 'salvage_hunting', sellValue: 5 },
  chemical_fluids: { id: 'chemical_fluids', name: 'Chemical Fluids', description: 'Oil, coolant, and hydraulic fluid.', sourceSkillId: 'salvage_hunting', sellValue: 5 },

  // === WATER RECLAMATION ===
  rainwater: { id: 'rainwater', name: 'Rainwater', description: 'Collected from rooftop traps, mildly clean.', sourceSkillId: 'water_reclamation', sellValue: 2 },
  well_water: { id: 'well_water', name: 'Well Water', description: 'Deep underground water, mineral-rich.', sourceSkillId: 'water_reclamation', sellValue: 2 },
  river_water: { id: 'river_water', name: 'River Water', description: 'Surface water, needs filtering but abundant.', sourceSkillId: 'water_reclamation', sellValue: 2 },

  // === PROSPECTING ===
  iron_ore: { id: 'iron_ore', name: 'Iron Ore', description: 'Common but essential metal ore.', sourceSkillId: 'prospecting', sellValue: 4 },
  copper_ore: { id: 'copper_ore', name: 'Copper Ore', description: 'Conductive ore for electronics and alloys.', sourceSkillId: 'prospecting', sellValue: 4 },
  raw_stone: { id: 'raw_stone', name: 'Raw Stone', description: 'Rock and mineral chunks.', sourceSkillId: 'prospecting', sellValue: 4 },

  // =============================================
  // T2 RESOURCES (Tier 2 gathering, level 15+)
  // =============================================

  // === SCAVENGING T2 ===
  tempered_steel: { id: 'tempered_steel', name: 'Tempered Steel', description: 'Heat-treated steel from old foundries.', sourceSkillId: 'scavenging', sellValue: 8 },
  refined_lumber: { id: 'refined_lumber', name: 'Refined Lumber', description: 'Processed and treated wasteland wood.', sourceSkillId: 'scavenging', sellValue: 8 },
  chrome_pipes: { id: 'chrome_pipes', name: 'Chrome Pipes', description: 'Corrosion-resistant industrial piping.', sourceSkillId: 'scavenging', sellValue: 8 },

  // === FORAGING T2 ===
  irradiated_moss: { id: 'irradiated_moss', name: 'Irradiated Moss', description: 'Glowing medicinal moss.', sourceSkillId: 'foraging', sellValue: 6 },
  glow_berries: { id: 'glow_berries', name: 'Glow Berries', description: 'Luminescent mutant fruit.', sourceSkillId: 'foraging', sellValue: 6 },
  deep_roots: { id: 'deep_roots', name: 'Deep Roots', description: 'Ancient subterranean root systems.', sourceSkillId: 'foraging', sellValue: 6 },

  // === SALVAGE HUNTING T2 ===
  precision_gears: { id: 'precision_gears', name: 'Precision Gears', description: 'Military-spec mechanical components.', sourceSkillId: 'salvage_hunting', sellValue: 12 },
  quantum_chips: { id: 'quantum_chips', name: 'Quantum Chips', description: 'Advanced processing circuits.', sourceSkillId: 'salvage_hunting', sellValue: 12 },
  volatile_compounds: { id: 'volatile_compounds', name: 'Volatile Compounds', description: 'Unstable chemical mixtures.', sourceSkillId: 'salvage_hunting', sellValue: 12 },

  // === WATER RECLAMATION T2 ===
  purified_water: { id: 'purified_water', name: 'Purified Water', description: 'Chemically clean water.', sourceSkillId: 'water_reclamation', sellValue: 6 },
  mineral_water: { id: 'mineral_water', name: 'Mineral Water', description: 'Enriched underground water.', sourceSkillId: 'water_reclamation', sellValue: 6 },
  distilled_water: { id: 'distilled_water', name: 'Distilled Water', description: 'Laboratory-grade pure water.', sourceSkillId: 'water_reclamation', sellValue: 6 },

  // === PROSPECTING T2 ===
  steel_ore: { id: 'steel_ore', name: 'Steel Ore', description: 'Dense metallic ore.', sourceSkillId: 'prospecting', sellValue: 10 },
  titanium_ore: { id: 'titanium_ore', name: 'Titanium Ore', description: 'Lightweight super-metal.', sourceSkillId: 'prospecting', sellValue: 10 },
  crystal_stone: { id: 'crystal_stone', name: 'Crystal Stone', description: 'Semi-translucent mineral.', sourceSkillId: 'prospecting', sellValue: 10 },

  // =============================================
  // T3 RESOURCES (Tier 3 gathering, level 30+)
  // =============================================

  // === SCAVENGING T3 ===
  reinforced_alloy: { id: 'reinforced_alloy', name: 'Reinforced Alloy', description: 'Military-grade composite metal.', sourceSkillId: 'scavenging', sellValue: 15 },
  hardened_timber: { id: 'hardened_timber', name: 'Hardened Timber', description: 'Chemically treated structural wood.', sourceSkillId: 'scavenging', sellValue: 15 },
  plasma_conduits: { id: 'plasma_conduits', name: 'Plasma Conduits', description: 'High-energy transfer piping.', sourceSkillId: 'scavenging', sellValue: 15 },

  // === FORAGING T3 ===
  reactor_bloom: { id: 'reactor_bloom', name: 'Reactor Bloom', description: 'Flowers that thrive near radiation.', sourceSkillId: 'foraging', sellValue: 12 },
  void_berries: { id: 'void_berries', name: 'Void Berries', description: 'Dark berries with strange properties.', sourceSkillId: 'foraging', sellValue: 12 },
  titan_roots: { id: 'titan_roots', name: 'Titan Roots', description: 'Massive roots from mutant trees.', sourceSkillId: 'foraging', sellValue: 12 },

  // === SALVAGE HUNTING T3 ===
  fusion_cores: { id: 'fusion_cores', name: 'Fusion Cores', description: 'Miniature reactor components.', sourceSkillId: 'salvage_hunting', sellValue: 20 },
  neural_circuits: { id: 'neural_circuits', name: 'Neural Circuits', description: 'AI-grade processing hardware.', sourceSkillId: 'salvage_hunting', sellValue: 20 },
  dark_matter_fluid: { id: 'dark_matter_fluid', name: 'Dark Matter Fluid', description: 'Exotic pre-war research material.', sourceSkillId: 'salvage_hunting', sellValue: 20 },

  // === WATER RECLAMATION T3 ===
  reactor_coolant: { id: 'reactor_coolant', name: 'Reactor Coolant', description: 'Nuclear cooling fluid.', sourceSkillId: 'water_reclamation', sellValue: 12 },
  bio_solution: { id: 'bio_solution', name: 'Bio Solution', description: 'Organic nutrient solution.', sourceSkillId: 'water_reclamation', sellValue: 12 },
  void_extract: { id: 'void_extract', name: 'Void Extract', description: 'Mysterious dark liquid.', sourceSkillId: 'water_reclamation', sellValue: 12 },

  // === PROSPECTING T3 ===
  mythril_ore: { id: 'mythril_ore', name: 'Mythril Ore', description: 'Legendary post-apocalyptic metal.', sourceSkillId: 'prospecting', sellValue: 18 },
  obsidian_ore: { id: 'obsidian_ore', name: 'Obsidian Ore', description: 'Volcanic glass ore.', sourceSkillId: 'prospecting', sellValue: 18 },
  void_crystal: { id: 'void_crystal', name: 'Void Crystal', description: 'Reality-warping mineral.', sourceSkillId: 'prospecting', sellValue: 18 },

  // =============================================
  // SPECIAL / BOSS DROP RESOURCES
  // =============================================
  icqor_chess_piece: { id: 'icqor_chess_piece', name: 'Icqor Chess Piece', description: 'A mysterious artifact dropped by powerful bosses. Used to unlock Starlight nodes.', sourceSkillId: 'combat', sellValue: 50 },

  // =============================================
  // ENHANCEMENT MATERIALS
  // =============================================
  aspect_stone: { id: 'aspect_stone', name: 'Aspect Stone', description: 'A rare crystalline stone that can re-roll the aspect on a piece of gear. Craft via Tinkering.', sourceSkillId: 'tinkering', sellValue: 75 },

  // =============================================
  // EQUIPMENT UPGRADE MATERIALS
  // =============================================
  reinforcement_ore: { id: 'reinforcement_ore', name: 'Reinforcement Ore', description: 'Common ore for guaranteed equipment upgrades (+1 to +3).', sourceSkillId: 'prospecting', sellValue: 8 },
  refinement_metal: { id: 'refinement_metal', name: 'Refinement Metal', description: 'Processed metal for intermediate upgrades (+4 to +6). Chance of failure.', sourceSkillId: 'prospecting', sellValue: 20 },
  highgrade_alloy: { id: 'highgrade_alloy', name: 'High-grade Alloy', description: 'Premium alloy for advanced upgrades (+7 to +10). High failure risk.', sourceSkillId: 'combat', sellValue: 50 },
  masterwork_ore: { id: 'masterwork_ore', name: 'Masterwork Ore', description: 'Exceedingly rare ore for legendary upgrades (+11 to +12). Item destroyed on failure.', sourceSkillId: 'combat', sellValue: 100 },
  smelting_ore: { id: 'smelting_ore', name: 'Smelting Ore', description: 'Adds +5% success rate to upgrade attempts. Stackable.', sourceSkillId: 'prospecting', sellValue: 12 },
};

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES[id];
}

export function getResourcesBySkill(skillId: string): Resource[] {
  return Object.values(RESOURCES).filter(r => r.sourceSkillId === skillId);
}
