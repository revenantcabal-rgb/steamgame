export interface Consumable {
  id: string;
  name: string;
  description: string;
  type: 'food' | 'medicine' | 'chemical';
  effect: string;
  /** Duration in seconds (0 = instant) */
  duration: number;
  /** Cooldown between uses in seconds */
  cooldown: number;
  sellValue: number;
  craftSkillId: string;
  craftSkillLevel: number;
  craftingInputs: { resourceId: string; quantity: number }[];
}

export const CONSUMABLES: Record<string, Consumable> = {
  // ============================
  // COOKING - Food Buffs
  // ============================
  wasteland_stew: {
    id: 'wasteland_stew', name: 'Wasteland Stew', type: 'food',
    description: 'A hearty stew made from whatever the wasteland provides. Warms the belly and strengthens the body.',
    effect: '+5% Max HP for 5 minutes', duration: 300, cooldown: 60, sellValue: 8,
    craftSkillId: 'cooking', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 2 }, { resourceId: 'mutant_roots', quantity: 1 }, { resourceId: 'rainwater', quantity: 1 }],
  },
  irradiated_jerky: {
    id: 'irradiated_jerky', name: 'Irradiated Jerky', type: 'food',
    description: 'Sun-dried meat strips with a slight glow. Tastes like copper but packs a punch.',
    effect: '+5% All Attack for 5 minutes', duration: 300, cooldown: 60, sellValue: 10,
    craftSkillId: 'cooking', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 2 }, { resourceId: 'scrap_metal', quantity: 1 }, { resourceId: 'well_water', quantity: 1 }],
  },
  herbal_tea: {
    id: 'herbal_tea', name: 'Herbal Tea', type: 'food',
    description: 'Brewed from wasteland herbs. Soothes wounds and accelerates natural healing.',
    effect: '+3 HP Regen/turn for 5 minutes', duration: 300, cooldown: 60, sellValue: 6,
    craftSkillId: 'cooking', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'rainwater', quantity: 2 }],
  },
  fire_roasted_root: {
    id: 'fire_roasted_root', name: 'Fire-Roasted Root', type: 'food',
    description: 'Mutant root charred over an open flame. Sharpens reflexes and critical instinct.',
    effect: '+5% Crit Chance for 3 minutes', duration: 180, cooldown: 60, sellValue: 8,
    craftSkillId: 'cooking', craftSkillLevel: 10,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 1 }],
  },
  fortified_rations: {
    id: 'fortified_rations', name: 'Fortified Rations', type: 'food',
    description: 'Dense nutrient bars packed with minerals. Hardens the body against punishment.',
    effect: '+5% Defense for 5 minutes', duration: 300, cooldown: 60, sellValue: 10,
    craftSkillId: 'cooking', craftSkillLevel: 15,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'wild_herbs', quantity: 2 }, { resourceId: 'well_water', quantity: 1 }],
  },
  scavengers_meal: {
    id: 'scavengers_meal', name: "Scavenger's Meal", type: 'food',
    description: 'A filling meal that energizes the body for long gathering expeditions.',
    effect: '+10% Gathering Speed for 10 minutes', duration: 600, cooldown: 120, sellValue: 12,
    craftSkillId: 'cooking', craftSkillLevel: 20,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'well_water', quantity: 2 }],
  },
  commanders_feast: {
    id: 'commanders_feast', name: "Commander's Feast", type: 'food',
    description: 'A lavish wasteland banquet. Invigorates every aspect of the consumer.',
    effect: '+3% All Stats for 2 minutes', duration: 120, cooldown: 120, sellValue: 25,
    craftSkillId: 'cooking', craftSkillLevel: 40,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'wasteland_berries', quantity: 3 }, { resourceId: 'river_water', quantity: 2 }],
  },

  // ============================
  // BIOCHEMISTRY - Medicines & Chemicals
  // ============================
  stimpak: {
    id: 'stimpak', name: 'Stimpak', type: 'medicine',
    description: 'A pressurized syringe of concentrated healing compound. Works instantly.',
    effect: 'Restore 50 HP instantly', duration: 0, cooldown: 30, sellValue: 12,
    craftSkillId: 'biochemistry', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 2 }, { resourceId: 'chemical_fluids', quantity: 2 }, { resourceId: 'rainwater', quantity: 1 }],
  },
  antidote: {
    id: 'antidote', name: 'Antidote', type: 'medicine',
    description: 'Neutralizes toxins and radiation in the bloodstream.',
    effect: 'Cure poison and radiation effects', duration: 0, cooldown: 45, sellValue: 10,
    craftSkillId: 'biochemistry', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 2 }],
  },
  combat_serum: {
    id: 'combat_serum', name: 'Combat Serum', type: 'chemical',
    description: 'A volatile cocktail that supercharges combat ability. Use with caution.',
    effect: '+10% All Attack for 2 minutes', duration: 120, cooldown: 60, sellValue: 18,
    craftSkillId: 'biochemistry', craftSkillLevel: 15,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 2 }],
  },
  adrenaline_shot: {
    id: 'adrenaline_shot', name: 'Adrenaline Shot', type: 'chemical',
    description: 'Pure synthetic adrenaline. Everything moves in slow motion.',
    effect: '+15 Turn Speed for 2 minutes', duration: 120, cooldown: 60, sellValue: 15,
    craftSkillId: 'biochemistry', craftSkillLevel: 10,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'electronic_components', quantity: 1 }],
  },
  rad_shield_pill: {
    id: 'rad_shield_pill', name: 'Rad-Shield Pill', type: 'medicine',
    description: 'Anti-radiation medicine that hardens cells against status effects.',
    effect: '+20% Status Resistance for 5 minutes', duration: 300, cooldown: 90, sellValue: 14,
    craftSkillId: 'biochemistry', craftSkillLevel: 20,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'chemical_fluids', quantity: 2 }, { resourceId: 'iron_ore', quantity: 1 }],
  },
  berserker_compound: {
    id: 'berserker_compound', name: 'Berserker Compound', type: 'chemical',
    description: 'A dangerous stimulant that pushes the body past its limits.',
    effect: '+15% Crit Damage for 2 minutes', duration: 120, cooldown: 60, sellValue: 20,
    craftSkillId: 'biochemistry', craftSkillLevel: 25,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 4 }, { resourceId: 'wasteland_berries', quantity: 2 }, { resourceId: 'copper_ore', quantity: 1 }],
  },
  cleansing_agent: {
    id: 'cleansing_agent', name: 'Cleansing Agent', type: 'medicine',
    description: 'A broad-spectrum purifier that flushes all toxins from the body.',
    effect: 'Cure all debuffs instantly', duration: 0, cooldown: 60, sellValue: 22,
    craftSkillId: 'biochemistry', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'well_water', quantity: 2 }],
  },
};

export const CONSUMABLE_LIST = Object.values(CONSUMABLES);
export function getConsumableById(id: string): Consumable | undefined { return CONSUMABLES[id]; }
