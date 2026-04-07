import type { SkillDefinition, SubActivity } from '../types/skills';
import { CONSUMABLE_LIST } from './consumables';
import { TOOL_LIST } from './tools';
import { GEAR_TEMPLATES } from './gear';
import { RESOURCES } from './resources';

// ──────────────────────────────────────────────
// Helper: build production sub-activities from configs
// ──────────────────────────────────────────────

function buildConsumableRecipes(skillId: string): SubActivity[] {
  return CONSUMABLE_LIST
    .filter(c => c.craftSkillId === skillId)
    .sort((a, b) => a.craftSkillLevel - b.craftSkillLevel)
    .map(c => ({
      id: `craft_${c.id}`,
      name: c.name,
      description: c.effect,
      xpPerAction: Math.floor(c.craftSkillLevel * 3 + 15),
      isMixed: false,
      levelReq: c.craftSkillLevel,
      resourceDrops: [{ resourceId: c.id, minQty: 1, maxQty: 1 }],
      resourceInputs: c.craftingInputs.map(i => ({ resourceId: i.resourceId, quantity: i.quantity })),
    }));
}

function buildToolRecipes(): SubActivity[] {
  return TOOL_LIST
    .sort((a, b) => a.craftSkillLevel - b.craftSkillLevel)
    .map(t => ({
      id: `craft_${t.id}`,
      name: t.name,
      description: `${t.effect}. ${t.description}`,
      xpPerAction: Math.floor(t.craftSkillLevel * 3 + 18),
      isMixed: false,
      levelReq: t.craftSkillLevel,
      resourceDrops: [{ resourceId: t.id, minQty: 1, maxQty: 1 }],
      resourceInputs: t.craftingInputs.map(i => ({ resourceId: i.resourceId, quantity: i.quantity })),
    }));
}

function buildGearRecipes(skillId: string): SubActivity[] {
  return Object.values(GEAR_TEMPLATES)
    .filter(g => g.craftSkillId === skillId)
    .sort((a, b) => a.tier - b.tier || a.craftSkillLevel - b.craftSkillLevel)
    .map(g => ({
      id: `forge_${g.id}`,
      name: `${g.name} (T${g.tier})`,
      description: `Tier ${g.tier} ${g.slot}. Level ${g.levelReq} required to equip.`,
      xpPerAction: g.craftXp,
      isMixed: false,
      levelReq: g.craftSkillLevel,
      resourceDrops: [], // Gear goes to equipment inventory, not resources
      resourceInputs: g.craftingInputs.map(i => ({ resourceId: i.resourceId, quantity: i.quantity })),
      gearTemplateId: g.id,
    }));
}

// ──────────────────────────────────────────────
// SKILL DEFINITIONS
// ──────────────────────────────────────────────

export const SKILLS: Record<string, SkillDefinition> = {
  // ============================
  // GATHERING SKILLS
  // ============================
  scavenging: {
    id: 'scavenging',
    name: 'Scavenging',
    description: 'Search through collapsed buildings, abandoned houses, and urban rubble for construction materials.',
    category: 'gathering',
    baseActionTime: 4,
    baseXp: 15,
    subActivities: [
      { id: 'scrap_yard', name: 'Scrap Yard', description: 'Focus on metal salvage from wreckage.', xpPerAction: 15, isMixed: false, resourceDrops: [{ resourceId: 'scrap_metal', minQty: 2, maxQty: 4 }] },
      { id: 'lumber_ruins', name: 'Lumber Ruins', description: 'Harvest usable wood from collapsed structures.', xpPerAction: 15, isMixed: false, resourceDrops: [{ resourceId: 'salvaged_wood', minQty: 2, maxQty: 4 }] },
      { id: 'pipe_network', name: 'Pipe Network', description: 'Extract pipes from old plumbing systems.', xpPerAction: 15, isMixed: false, resourceDrops: [{ resourceId: 'rusted_pipes', minQty: 2, maxQty: 4 }] },
      { id: 'collapsed_district', name: 'Collapsed District', description: 'Sweep an entire block. Less yield per resource, but get everything.', xpPerAction: 20, isMixed: true, resourceDrops: [
        { resourceId: 'scrap_metal', minQty: 1, maxQty: 2 },
        { resourceId: 'salvaged_wood', minQty: 1, maxQty: 2 },
        { resourceId: 'rusted_pipes', minQty: 1, maxQty: 2 },
      ] },
      // T2 sub-activities (level 15+)
      { id: 'foundry_ruins', name: 'Foundry Ruins', description: 'Scavenge heat-treated metals from old foundries.', levelReq: 15, xpPerAction: 30, isMixed: false,
        resourceDrops: [{ resourceId: 'tempered_steel', minQty: 3, maxQty: 6 }] },
      { id: 'lumber_mill', name: 'Lumber Mill', description: 'Salvage processed wood from old mills.', levelReq: 15, xpPerAction: 30, isMixed: false,
        resourceDrops: [{ resourceId: 'refined_lumber', minQty: 3, maxQty: 6 }] },
      { id: 'chrome_works', name: 'Chrome Works', description: 'Extract chrome piping from industrial facilities.', levelReq: 15, xpPerAction: 30, isMixed: false,
        resourceDrops: [{ resourceId: 'chrome_pipes', minQty: 3, maxQty: 6 }] },
      { id: 'industrial_sweep', name: 'Industrial Sweep', description: 'Sweep through industrial zones for mixed materials.', levelReq: 15, xpPerAction: 35, isMixed: true,
        resourceDrops: [{ resourceId: 'tempered_steel', minQty: 1, maxQty: 3 }, { resourceId: 'refined_lumber', minQty: 1, maxQty: 3 }, { resourceId: 'chrome_pipes', minQty: 1, maxQty: 3 }] },
      // T3 sub-activities (level 30+)
      { id: 'military_depot', name: 'Military Depot', description: 'Scavenge military-grade alloys.', levelReq: 30, xpPerAction: 45, isMixed: false,
        resourceDrops: [{ resourceId: 'reinforced_alloy', minQty: 4, maxQty: 8 }] },
      { id: 'timber_fortress', name: 'Timber Fortress', description: 'Salvage hardened timber from fortified structures.', levelReq: 30, xpPerAction: 45, isMixed: false,
        resourceDrops: [{ resourceId: 'hardened_timber', minQty: 4, maxQty: 8 }] },
      { id: 'plasma_facility', name: 'Plasma Facility', description: 'Extract plasma conduits from energy plants.', levelReq: 30, xpPerAction: 45, isMixed: false,
        resourceDrops: [{ resourceId: 'plasma_conduits', minQty: 4, maxQty: 8 }] },
      { id: 'military_sweep', name: 'Military Sweep', description: 'Sweep military installations for advanced materials.', levelReq: 30, xpPerAction: 50, isMixed: true,
        resourceDrops: [{ resourceId: 'reinforced_alloy', minQty: 2, maxQty: 4 }, { resourceId: 'hardened_timber', minQty: 2, maxQty: 4 }, { resourceId: 'plasma_conduits', minQty: 2, maxQty: 4 }] },
    ],
  },

  foraging: {
    id: 'foraging',
    name: 'Foraging',
    description: 'Trek through irradiated forests, swamps, and plains for edible and useful plant life.',
    category: 'gathering',
    baseActionTime: 4,
    baseXp: 12,
    subActivities: [
      { id: 'herb_patch', name: 'Herb Patch', description: 'Gather medicinal herbs from sheltered areas.', xpPerAction: 12, isMixed: false, resourceDrops: [{ resourceId: 'wild_herbs', minQty: 2, maxQty: 4 }] },
      { id: 'berry_thicket', name: 'Berry Thicket', description: 'Pick berries from irradiated bushes.', xpPerAction: 12, isMixed: false, resourceDrops: [{ resourceId: 'wasteland_berries', minQty: 2, maxQty: 4 }] },
      { id: 'root_dig', name: 'Root Dig', description: 'Dig up mutated root vegetables.', xpPerAction: 12, isMixed: false, resourceDrops: [{ resourceId: 'mutant_roots', minQty: 2, maxQty: 4 }] },
      { id: 'overgrown_trail', name: 'Overgrown Trail', description: 'Follow a wild trail. Find a bit of everything.', xpPerAction: 16, isMixed: true, resourceDrops: [
        { resourceId: 'wild_herbs', minQty: 1, maxQty: 2 },
        { resourceId: 'wasteland_berries', minQty: 1, maxQty: 2 },
        { resourceId: 'mutant_roots', minQty: 1, maxQty: 2 },
      ] },
      // T2 sub-activities (level 15+)
      { id: 'glowing_cavern', name: 'Glowing Cavern', description: 'Harvest irradiated moss from cave walls.', levelReq: 15, xpPerAction: 24, isMixed: false,
        resourceDrops: [{ resourceId: 'irradiated_moss', minQty: 3, maxQty: 6 }] },
      { id: 'luminous_grove', name: 'Luminous Grove', description: 'Pick glow berries from mutant bushes.', levelReq: 15, xpPerAction: 24, isMixed: false,
        resourceDrops: [{ resourceId: 'glow_berries', minQty: 3, maxQty: 6 }] },
      { id: 'deep_burrows', name: 'Deep Burrows', description: 'Dig deep roots from underground tunnels.', levelReq: 15, xpPerAction: 24, isMixed: false,
        resourceDrops: [{ resourceId: 'deep_roots', minQty: 3, maxQty: 6 }] },
      { id: 'irradiated_trail', name: 'Irradiated Trail', description: 'Forage through irradiated zones for mixed flora.', levelReq: 15, xpPerAction: 28, isMixed: true,
        resourceDrops: [{ resourceId: 'irradiated_moss', minQty: 1, maxQty: 3 }, { resourceId: 'glow_berries', minQty: 1, maxQty: 3 }, { resourceId: 'deep_roots', minQty: 1, maxQty: 3 }] },
      // T3 sub-activities (level 30+)
      { id: 'reactor_garden', name: 'Reactor Garden', description: 'Harvest blooms from reactor-adjacent zones.', levelReq: 30, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'reactor_bloom', minQty: 4, maxQty: 8 }] },
      { id: 'void_thicket', name: 'Void Thicket', description: 'Pick void berries from dark mutant bushes.', levelReq: 30, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'void_berries', minQty: 4, maxQty: 8 }] },
      { id: 'titan_grove', name: 'Titan Grove', description: 'Dig massive roots from mutant tree groves.', levelReq: 30, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'titan_roots', minQty: 4, maxQty: 8 }] },
      { id: 'mutant_forest_sweep', name: 'Mutant Forest Sweep', description: 'Forage through the most dangerous forests.', levelReq: 30, xpPerAction: 40, isMixed: true,
        resourceDrops: [{ resourceId: 'reactor_bloom', minQty: 2, maxQty: 4 }, { resourceId: 'void_berries', minQty: 2, maxQty: 4 }, { resourceId: 'titan_roots', minQty: 2, maxQty: 4 }] },
    ],
  },

  salvage_hunting: {
    id: 'salvage_hunting',
    name: 'Salvage Hunting',
    description: 'Dismantle wrecked vehicles, factory equipment, and old-world machines for precision parts.',
    category: 'gathering',
    baseActionTime: 5,
    baseXp: 18,
    subActivities: [
      { id: 'wreck_yard', name: 'Wreck Yard', description: 'Strip mechanical parts from wrecked vehicles.', xpPerAction: 18, isMixed: false, resourceDrops: [{ resourceId: 'mechanical_parts', minQty: 2, maxQty: 4 }] },
      { id: 'tech_lab', name: 'Tech Lab', description: 'Salvage electronics from old laboratories.', xpPerAction: 18, isMixed: false, resourceDrops: [{ resourceId: 'electronic_components', minQty: 2, maxQty: 4 }] },
      { id: 'fuel_depot', name: 'Fuel Depot', description: 'Drain fluids from storage tanks and pipes.', xpPerAction: 18, isMixed: false, resourceDrops: [{ resourceId: 'chemical_fluids', minQty: 2, maxQty: 4 }] },
      { id: 'abandoned_factory', name: 'Abandoned Factory', description: 'Tear apart everything in an abandoned factory.', xpPerAction: 24, isMixed: true, resourceDrops: [
        { resourceId: 'mechanical_parts', minQty: 1, maxQty: 2 },
        { resourceId: 'electronic_components', minQty: 1, maxQty: 2 },
        { resourceId: 'chemical_fluids', minQty: 1, maxQty: 2 },
      ] },
      // T2 sub-activities (level 15+)
      { id: 'precision_workshop', name: 'Precision Workshop', description: 'Salvage precision gears from military workshops.', levelReq: 15, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'precision_gears', minQty: 3, maxQty: 6 }] },
      { id: 'quantum_lab', name: 'Quantum Lab', description: 'Extract quantum chips from research facilities.', levelReq: 15, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'quantum_chips', minQty: 3, maxQty: 6 }] },
      { id: 'chemical_plant', name: 'Chemical Plant', description: 'Collect volatile compounds from processing plants.', levelReq: 15, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'volatile_compounds', minQty: 3, maxQty: 6 }] },
      { id: 'tech_complex_sweep', name: 'Tech Complex Sweep', description: 'Sweep a technology complex for advanced salvage.', levelReq: 15, xpPerAction: 42, isMixed: true,
        resourceDrops: [{ resourceId: 'precision_gears', minQty: 1, maxQty: 3 }, { resourceId: 'quantum_chips', minQty: 1, maxQty: 3 }, { resourceId: 'volatile_compounds', minQty: 1, maxQty: 3 }] },
      // T3 sub-activities (level 30+)
      { id: 'fusion_reactor', name: 'Fusion Reactor', description: 'Extract fusion cores from reactor ruins.', levelReq: 30, xpPerAction: 54, isMixed: false,
        resourceDrops: [{ resourceId: 'fusion_cores', minQty: 4, maxQty: 8 }] },
      { id: 'ai_mainframe', name: 'AI Mainframe', description: 'Salvage neural circuits from AI systems.', levelReq: 30, xpPerAction: 54, isMixed: false,
        resourceDrops: [{ resourceId: 'neural_circuits', minQty: 4, maxQty: 8 }] },
      { id: 'dark_matter_lab', name: 'Dark Matter Lab', description: 'Collect dark matter fluid from research vaults.', levelReq: 30, xpPerAction: 54, isMixed: false,
        resourceDrops: [{ resourceId: 'dark_matter_fluid', minQty: 4, maxQty: 8 }] },
      { id: 'black_site_sweep', name: 'Black Site Sweep', description: 'Sweep classified facilities for exotic salvage.', levelReq: 30, xpPerAction: 60, isMixed: true,
        resourceDrops: [{ resourceId: 'fusion_cores', minQty: 2, maxQty: 4 }, { resourceId: 'neural_circuits', minQty: 2, maxQty: 4 }, { resourceId: 'dark_matter_fluid', minQty: 2, maxQty: 4 }] },
    ],
  },

  water_reclamation: {
    id: 'water_reclamation',
    name: 'Water Reclamation',
    description: 'Find, collect, and process water from various contaminated sources.',
    category: 'gathering',
    baseActionTime: 4,
    baseXp: 14,
    subActivities: [
      { id: 'rain_collectors', name: 'Rain Collectors', description: 'Gather water from rooftop traps.', xpPerAction: 14, isMixed: false, resourceDrops: [{ resourceId: 'rainwater', minQty: 2, maxQty: 4 }] },
      { id: 'deep_well', name: 'Deep Well', description: 'Pump mineral-rich water from deep underground.', xpPerAction: 14, isMixed: false, resourceDrops: [{ resourceId: 'well_water', minQty: 2, maxQty: 4 }] },
      { id: 'river_filter', name: 'River Filter', description: 'Filter surface water from rivers and streams.', xpPerAction: 14, isMixed: false, resourceDrops: [{ resourceId: 'river_water', minQty: 2, maxQty: 4 }] },
      { id: 'water_survey', name: 'Water Survey', description: 'Survey multiple water sources in the area.', xpPerAction: 18, isMixed: true, resourceDrops: [
        { resourceId: 'rainwater', minQty: 1, maxQty: 2 },
        { resourceId: 'well_water', minQty: 1, maxQty: 2 },
        { resourceId: 'river_water', minQty: 1, maxQty: 2 },
      ] },
      // T2 sub-activities (level 15+)
      { id: 'purification_plant', name: 'Purification Plant', description: 'Process water through old purification systems.', levelReq: 15, xpPerAction: 28, isMixed: false,
        resourceDrops: [{ resourceId: 'purified_water', minQty: 3, maxQty: 6 }] },
      { id: 'mineral_springs', name: 'Mineral Springs', description: 'Collect enriched mineral water from deep springs.', levelReq: 15, xpPerAction: 28, isMixed: false,
        resourceDrops: [{ resourceId: 'mineral_water', minQty: 3, maxQty: 6 }] },
      { id: 'distillation_lab', name: 'Distillation Lab', description: 'Distill water in an old laboratory.', levelReq: 15, xpPerAction: 28, isMixed: false,
        resourceDrops: [{ resourceId: 'distilled_water', minQty: 3, maxQty: 6 }] },
      { id: 'advanced_water_survey', name: 'Advanced Water Survey', description: 'Survey advanced water sources for mixed yields.', levelReq: 15, xpPerAction: 32, isMixed: true,
        resourceDrops: [{ resourceId: 'purified_water', minQty: 1, maxQty: 3 }, { resourceId: 'mineral_water', minQty: 1, maxQty: 3 }, { resourceId: 'distilled_water', minQty: 1, maxQty: 3 }] },
      // T3 sub-activities (level 30+)
      { id: 'reactor_cooling_system', name: 'Reactor Cooling System', description: 'Extract coolant from reactor cooling loops.', levelReq: 30, xpPerAction: 42, isMixed: false,
        resourceDrops: [{ resourceId: 'reactor_coolant', minQty: 4, maxQty: 8 }] },
      { id: 'bio_vat_farm', name: 'Bio Vat Farm', description: 'Harvest bio solution from organic vats.', levelReq: 30, xpPerAction: 42, isMixed: false,
        resourceDrops: [{ resourceId: 'bio_solution', minQty: 4, maxQty: 8 }] },
      { id: 'void_well', name: 'Void Well', description: 'Extract mysterious void liquid from deep wells.', levelReq: 30, xpPerAction: 42, isMixed: false,
        resourceDrops: [{ resourceId: 'void_extract', minQty: 4, maxQty: 8 }] },
      { id: 'exotic_fluid_sweep', name: 'Exotic Fluid Sweep', description: 'Survey exotic fluid sources for mixed yields.', levelReq: 30, xpPerAction: 46, isMixed: true,
        resourceDrops: [{ resourceId: 'reactor_coolant', minQty: 2, maxQty: 4 }, { resourceId: 'bio_solution', minQty: 2, maxQty: 4 }, { resourceId: 'void_extract', minQty: 2, maxQty: 4 }] },
    ],
  },

  prospecting: {
    id: 'prospecting',
    name: 'Prospecting',
    description: 'Mine exposed rock faces, cave systems, and craters for ores and minerals.',
    category: 'gathering',
    baseActionTime: 5,
    baseXp: 18,
    subActivities: [
      { id: 'iron_vein', name: 'Iron Vein', description: 'Mine iron deposits in exposed cliff faces.', xpPerAction: 18, isMixed: false, resourceDrops: [{ resourceId: 'iron_ore', minQty: 2, maxQty: 4 }] },
      { id: 'copper_deposit', name: 'Copper Deposit', description: 'Extract copper from conductive veins.', xpPerAction: 18, isMixed: false, resourceDrops: [{ resourceId: 'copper_ore', minQty: 2, maxQty: 4 }] },
      { id: 'stone_quarry', name: 'Stone Quarry', description: 'Break apart rock formations for raw stone.', xpPerAction: 18, isMixed: false, resourceDrops: [{ resourceId: 'raw_stone', minQty: 2, maxQty: 4 }] },
      { id: 'open_pit_mine', name: 'Open Pit Mine', description: 'Mine everything in an open pit. Less per ore, more variety.', xpPerAction: 24, isMixed: true, resourceDrops: [
        { resourceId: 'iron_ore', minQty: 1, maxQty: 2 },
        { resourceId: 'copper_ore', minQty: 1, maxQty: 2 },
        { resourceId: 'raw_stone', minQty: 1, maxQty: 2 },
      ] },
      // T2 sub-activities (level 15+)
      { id: 'steel_mine', name: 'Steel Mine', description: 'Mine dense steel ore from deep veins.', levelReq: 15, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'steel_ore', minQty: 3, maxQty: 6 }] },
      { id: 'titanium_deposit', name: 'Titanium Deposit', description: 'Extract titanium from rare deposits.', levelReq: 15, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'titanium_ore', minQty: 3, maxQty: 6 }] },
      { id: 'crystal_cavern', name: 'Crystal Cavern', description: 'Mine crystal stones from luminous caverns.', levelReq: 15, xpPerAction: 36, isMixed: false,
        resourceDrops: [{ resourceId: 'crystal_stone', minQty: 3, maxQty: 6 }] },
      { id: 'advanced_mine_sweep', name: 'Advanced Mine Sweep', description: 'Sweep advanced mining sites for mixed ores.', levelReq: 15, xpPerAction: 42, isMixed: true,
        resourceDrops: [{ resourceId: 'steel_ore', minQty: 1, maxQty: 3 }, { resourceId: 'titanium_ore', minQty: 1, maxQty: 3 }, { resourceId: 'crystal_stone', minQty: 1, maxQty: 3 }] },
      // T3 sub-activities (level 30+)
      { id: 'mythril_vein', name: 'Mythril Vein', description: 'Mine legendary mythril ore from deep veins.', levelReq: 30, xpPerAction: 54, isMixed: false,
        resourceDrops: [{ resourceId: 'mythril_ore', minQty: 4, maxQty: 8 }] },
      { id: 'obsidian_flow', name: 'Obsidian Flow', description: 'Extract obsidian from volcanic formations.', levelReq: 30, xpPerAction: 54, isMixed: false,
        resourceDrops: [{ resourceId: 'obsidian_ore', minQty: 4, maxQty: 8 }] },
      { id: 'void_crystal_rift', name: 'Void Crystal Rift', description: 'Mine void crystals from reality rifts.', levelReq: 30, xpPerAction: 54, isMixed: false,
        resourceDrops: [{ resourceId: 'void_crystal', minQty: 4, maxQty: 8 }] },
      { id: 'deep_core_sweep', name: 'Deep Core Sweep', description: 'Sweep the deepest mines for exotic minerals.', levelReq: 30, xpPerAction: 60, isMixed: true,
        resourceDrops: [{ resourceId: 'mythril_ore', minQty: 2, maxQty: 4 }, { resourceId: 'obsidian_ore', minQty: 2, maxQty: 4 }, { resourceId: 'void_crystal', minQty: 2, maxQty: 4 }] },
    ],
  },

  // ============================
  // PRODUCTION SKILLS (recipes auto-built from configs)
  // ============================
  cooking: {
    id: 'cooking', name: 'Cooking',
    description: 'Prepare wasteland ingredients into nourishing meals and combat food.',
    category: 'production', baseActionTime: 3, baseXp: 18,
    inputSkills: ['foraging', 'water_reclamation'],
    subActivities: buildConsumableRecipes('cooking'),
  },
  tinkering: {
    id: 'tinkering', name: 'Tinkering',
    description: 'Build tools and gadgets that boost gathering speed.',
    category: 'production', baseActionTime: 5, baseXp: 22,
    inputSkills: ['scavenging', 'salvage_hunting'],
    subActivities: buildToolRecipes(),
  },
  weaponsmithing: {
    id: 'weaponsmithing', name: 'Weaponsmithing',
    description: 'Forge melee, ranged, and explosive weapons from raw materials.',
    category: 'production', baseActionTime: 6, baseXp: 25,
    inputSkills: ['prospecting', 'salvage_hunting'],
    subActivities: buildGearRecipes('weaponsmithing'),
  },
  armorcrafting: {
    id: 'armorcrafting', name: 'Armorcrafting',
    description: 'Craft protective armor, shields, and defensive gear.',
    category: 'production', baseActionTime: 6, baseXp: 25,
    inputSkills: ['prospecting', 'scavenging'],
    subActivities: buildGearRecipes('armorcrafting'),
  },
  biochemistry: {
    id: 'biochemistry', name: 'Biochemistry',
    description: 'Synthesize medicines, antidotes, and combat chemicals.',
    category: 'production', baseActionTime: 5, baseXp: 24,
    inputSkills: ['foraging', 'water_reclamation', 'prospecting'],
    subActivities: buildConsumableRecipes('biochemistry'),
  },

  // ============================
  // COMBAT SKILLS (trained passively via combat zones, not in sidebar)
  // ============================
  close_combat: { id: 'close_combat', name: 'Close Combat', description: 'Melee fighting with fists, clubs, blades, and axes.', category: 'combat', baseActionTime: 6, baseXp: 30 },
  marksmanship: { id: 'marksmanship', name: 'Marksmanship', description: 'Ranged combat with bows, crossbows, and firearms.', category: 'combat', baseActionTime: 6, baseXp: 30 },
  demolitions: { id: 'demolitions', name: 'Demolitions', description: 'Explosive combat with grenades, mines, and launchers.', category: 'combat', baseActionTime: 6, baseXp: 30 },
  fortification: { id: 'fortification', name: 'Fortification', description: 'Defensive combat. Reduces damage and increases HP.', category: 'combat', baseActionTime: 5, baseXp: 25 },
  tactics: { id: 'tactics', name: 'Tactics', description: 'Strategic combat. Improves initiative, evasion, and crits.', category: 'combat', baseActionTime: 5, baseXp: 22 },
  engineering: { id: 'engineering', name: 'Engineering', description: 'Build structures for clan wars and defenses.', category: 'combat', baseActionTime: 7, baseXp: 28 },
};

export const SKILL_LIST = Object.values(SKILLS);
export const GATHERING_SKILLS = SKILL_LIST.filter(s => s.category === 'gathering');
export const PRODUCTION_SKILLS = SKILL_LIST.filter(s => s.category === 'production');
export const COMBAT_SKILLS = SKILL_LIST.filter(s => s.category === 'combat');

export function getSkillById(id: string): SkillDefinition | undefined {
  return SKILLS[id];
}
