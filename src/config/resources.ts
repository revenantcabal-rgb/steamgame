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
};

export function getResourceById(id: string): Resource | undefined {
  return RESOURCES[id];
}

export function getResourcesBySkill(skillId: string): Resource[] {
  return Object.values(RESOURCES).filter(r => r.sourceSkillId === skillId);
}
