export interface WastelandTool {
  id: string;
  name: string;
  description: string;
  /** Which gathering skill this tool enhances */
  targetSkillId: string;
  effect: string;
  /** Speed bonus percentage */
  speedBonus: number;
  /** Skill level required to use */
  levelReq: number;
  tier: number;
  sellValue: number;
  craftSkillId: string;
  craftSkillLevel: number;
  craftingInputs: { resourceId: string; quantity: number }[];
}

export const TOOLS: Record<string, WastelandTool> = {
  // ============================
  // T1 TOOLS (Level 1)
  // ============================
  salvage_prybar: {
    id: 'salvage_prybar', name: 'Salvage Prybar', targetSkillId: 'scavenging',
    description: 'A heavy-duty prybar for wrenching apart wreckage and rubble.',
    effect: '+10% Scavenging Speed', speedBonus: 10, levelReq: 1, tier: 1, sellValue: 15,
    craftSkillId: 'tinkering', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'scrap_metal', quantity: 5 }, { resourceId: 'rusted_pipes', quantity: 3 }],
  },
  foraging_sickle: {
    id: 'foraging_sickle', name: 'Foraging Sickle', targetSkillId: 'foraging',
    description: 'A curved blade for harvesting herbs, berries, and roots efficiently.',
    effect: '+10% Foraging Speed', speedBonus: 10, levelReq: 1, tier: 1, sellValue: 12,
    craftSkillId: 'tinkering', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'scrap_metal', quantity: 4 }, { resourceId: 'salvaged_wood', quantity: 3 }],
  },
  salvage_scanner: {
    id: 'salvage_scanner', name: 'Salvage Scanner', targetSkillId: 'salvage_hunting',
    description: 'An electronic scanner that detects valuable components buried in wreckage.',
    effect: '+10% Salvage Hunting Speed', speedBonus: 10, levelReq: 1, tier: 1, sellValue: 18,
    craftSkillId: 'tinkering', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'electronic_components', quantity: 4 }, { resourceId: 'mechanical_parts', quantity: 3 }],
  },
  water_filter: {
    id: 'water_filter', name: 'Water Filter', targetSkillId: 'water_reclamation',
    description: 'A basic filtration device for purifying collected water faster.',
    effect: '+10% Water Reclamation Speed', speedBonus: 10, levelReq: 1, tier: 1, sellValue: 12,
    craftSkillId: 'tinkering', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'rusted_pipes', quantity: 4 }, { resourceId: 'chemical_fluids', quantity: 2 }],
  },
  mining_pickaxe: {
    id: 'mining_pickaxe', name: 'Mining Pickaxe', targetSkillId: 'prospecting',
    description: 'A reinforced pickaxe for breaking through rock and extracting ore.',
    effect: '+10% Prospecting Speed', speedBonus: 10, levelReq: 1, tier: 1, sellValue: 15,
    craftSkillId: 'tinkering', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'iron_ore', quantity: 4 }, { resourceId: 'salvaged_wood', quantity: 3 }],
  },

  // ============================
  // T2 TOOLS (Level 30)
  // ============================
  reinforced_prybar: {
    id: 'reinforced_prybar', name: 'Reinforced Prybar', targetSkillId: 'scavenging',
    description: 'An iron-reinforced prybar that tears through heavier wreckage with ease.',
    effect: '+20% Scavenging Speed', speedBonus: 20, levelReq: 30, tier: 2, sellValue: 45,
    craftSkillId: 'tinkering', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'iron_ore', quantity: 8 }, { resourceId: 'mechanical_parts', quantity: 5 }],
  },
  carbon_sickle: {
    id: 'carbon_sickle', name: 'Carbon Sickle', targetSkillId: 'foraging',
    description: 'A lightweight carbon-fiber blade. Cuts through vegetation effortlessly.',
    effect: '+20% Foraging Speed', speedBonus: 20, levelReq: 30, tier: 2, sellValue: 40,
    craftSkillId: 'tinkering', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'iron_ore', quantity: 6 }, { resourceId: 'copper_ore', quantity: 4 }],
  },
  advanced_scanner: {
    id: 'advanced_scanner', name: 'Advanced Scanner', targetSkillId: 'salvage_hunting',
    description: 'A multi-spectrum scanner with enhanced detection range and precision.',
    effect: '+20% Salvage Hunting Speed', speedBonus: 20, levelReq: 30, tier: 2, sellValue: 55,
    craftSkillId: 'tinkering', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'electronic_components', quantity: 8 }, { resourceId: 'copper_ore', quantity: 5 }, { resourceId: 'mechanical_parts', quantity: 3 }],
  },
  purification_system: {
    id: 'purification_system', name: 'Purification System', targetSkillId: 'water_reclamation',
    description: 'A multi-stage filtration and chemical purification unit.',
    effect: '+20% Water Reclamation Speed', speedBonus: 20, levelReq: 30, tier: 2, sellValue: 42,
    craftSkillId: 'tinkering', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'mechanical_parts', quantity: 6 }, { resourceId: 'chemical_fluids', quantity: 4 }, { resourceId: 'copper_ore', quantity: 3 }],
  },
  sonic_drill: {
    id: 'sonic_drill', name: 'Sonic Drill', targetSkillId: 'prospecting',
    description: 'Uses sonic vibrations to shatter rock and extract ore with precision.',
    effect: '+20% Prospecting Speed', speedBonus: 20, levelReq: 30, tier: 2, sellValue: 50,
    craftSkillId: 'tinkering', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'electronic_components', quantity: 6 }, { resourceId: 'iron_ore', quantity: 5 }, { resourceId: 'mechanical_parts', quantity: 4 }],
  },
};

export const TOOL_LIST = Object.values(TOOLS);
export function getToolById(id: string): WastelandTool | undefined { return TOOLS[id]; }
