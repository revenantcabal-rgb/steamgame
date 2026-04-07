export interface ConsumableMechanicalEffect {
  type: 'instant_heal_hp' | 'instant_heal_sp' | 'instant_heal_both' | 'buff';
  stats?: { stat: string; value: number; isPercentage: boolean }[];
  healValue?: number;
  healPercentage?: number;
}

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
  /** Mechanical effect for combat integration */
  mechanicalEffect?: ConsumableMechanicalEffect;
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
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'maxHp', value: 5, isPercentage: true }] },
  },
  irradiated_jerky: {
    id: 'irradiated_jerky', name: 'Irradiated Jerky', type: 'food',
    description: 'Sun-dried meat strips with a slight glow. Tastes like copper but packs a punch.',
    effect: '+5% All Attack for 5 minutes', duration: 300, cooldown: 60, sellValue: 10,
    craftSkillId: 'cooking', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 2 }, { resourceId: 'scrap_metal', quantity: 1 }, { resourceId: 'well_water', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'meleeAttack', value: 5, isPercentage: true }, { stat: 'rangedAttack', value: 5, isPercentage: true }, { stat: 'blastAttack', value: 5, isPercentage: true }] },
  },
  herbal_tea: {
    id: 'herbal_tea', name: 'Herbal Tea', type: 'food',
    description: 'Brewed from wasteland herbs. Soothes wounds and accelerates natural healing.',
    effect: '+3 HP Regen/turn for 5 minutes', duration: 300, cooldown: 60, sellValue: 6,
    craftSkillId: 'cooking', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'rainwater', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'hpRegen', value: 3, isPercentage: false }] },
  },
  fire_roasted_root: {
    id: 'fire_roasted_root', name: 'Fire-Roasted Root', type: 'food',
    description: 'Mutant root charred over an open flame. Sharpens reflexes and critical instinct.',
    effect: '+5% Crit Chance for 3 minutes', duration: 180, cooldown: 60, sellValue: 8,
    craftSkillId: 'cooking', craftSkillLevel: 10,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'critChance', value: 5, isPercentage: false }] },
  },
  fortified_rations: {
    id: 'fortified_rations', name: 'Fortified Rations', type: 'food',
    description: 'Dense nutrient bars packed with minerals. Hardens the body against punishment.',
    effect: '+5% Defense for 5 minutes', duration: 300, cooldown: 60, sellValue: 10,
    craftSkillId: 'cooking', craftSkillLevel: 15,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'wild_herbs', quantity: 2 }, { resourceId: 'well_water', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'defense', value: 5, isPercentage: true }] },
  },
  scavengers_meal: {
    id: 'scavengers_meal', name: "Scavenger's Meal", type: 'food',
    description: 'A filling meal that energizes the body for long gathering expeditions.',
    effect: '+10% Gathering Speed for 10 minutes', duration: 600, cooldown: 120, sellValue: 12,
    craftSkillId: 'cooking', craftSkillLevel: 20,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'well_water', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'gatheringSpeed', value: 10, isPercentage: true }] },
  },
  commanders_feast: {
    id: 'commanders_feast', name: "Commander's Feast", type: 'food',
    description: 'A lavish wasteland banquet. Invigorates every aspect of the consumer.',
    effect: '+3% All Stats for 2 minutes', duration: 120, cooldown: 120, sellValue: 25,
    craftSkillId: 'cooking', craftSkillLevel: 40,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'wasteland_berries', quantity: 3 }, { resourceId: 'river_water', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'meleeAttack', value: 3, isPercentage: true }, { stat: 'rangedAttack', value: 3, isPercentage: true }, { stat: 'blastAttack', value: 3, isPercentage: true }, { stat: 'defense', value: 3, isPercentage: true }, { stat: 'maxHp', value: 3, isPercentage: true }] },
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
    mechanicalEffect: { type: 'instant_heal_hp', healValue: 50 },
  },
  antidote: {
    id: 'antidote', name: 'Antidote', type: 'medicine',
    description: 'Neutralizes toxins and radiation in the bloodstream.',
    effect: 'Cure poison and radiation effects', duration: 0, cooldown: 45, sellValue: 10,
    craftSkillId: 'biochemistry', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'statusResist', value: 20, isPercentage: false }] },
  },
  combat_serum: {
    id: 'combat_serum', name: 'Combat Serum', type: 'chemical',
    description: 'A volatile cocktail that supercharges combat ability. Use with caution.',
    effect: '+10% All Attack for 2 minutes', duration: 120, cooldown: 60, sellValue: 18,
    craftSkillId: 'biochemistry', craftSkillLevel: 15,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'meleeAttack', value: 10, isPercentage: true }, { stat: 'rangedAttack', value: 10, isPercentage: true }, { stat: 'blastAttack', value: 10, isPercentage: true }] },
  },
  adrenaline_shot: {
    id: 'adrenaline_shot', name: 'Adrenaline Shot', type: 'chemical',
    description: 'Pure synthetic adrenaline. Everything moves in slow motion.',
    effect: '+15 Turn Speed for 2 minutes', duration: 120, cooldown: 60, sellValue: 15,
    craftSkillId: 'biochemistry', craftSkillLevel: 10,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'electronic_components', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'turnSpeed', value: 15, isPercentage: false }] },
  },
  rad_shield_pill: {
    id: 'rad_shield_pill', name: 'Rad-Shield Pill', type: 'medicine',
    description: 'Anti-radiation medicine that hardens cells against status effects.',
    effect: '+20% Status Resistance for 5 minutes', duration: 300, cooldown: 90, sellValue: 14,
    craftSkillId: 'biochemistry', craftSkillLevel: 20,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'chemical_fluids', quantity: 2 }, { resourceId: 'iron_ore', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'statusResist', value: 20, isPercentage: false }] },
  },
  berserker_compound: {
    id: 'berserker_compound', name: 'Berserker Compound', type: 'chemical',
    description: 'A dangerous stimulant that pushes the body past its limits.',
    effect: '+15% Crit Damage for 2 minutes', duration: 120, cooldown: 60, sellValue: 20,
    craftSkillId: 'biochemistry', craftSkillLevel: 25,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 4 }, { resourceId: 'wasteland_berries', quantity: 2 }, { resourceId: 'copper_ore', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'critDamage', value: 15, isPercentage: false }] },
  },
  cleansing_agent: {
    id: 'cleansing_agent', name: 'Cleansing Agent', type: 'medicine',
    description: 'A broad-spectrum purifier that flushes all toxins from the body.',
    effect: 'Cure all debuffs instantly', duration: 0, cooldown: 60, sellValue: 22,
    craftSkillId: 'biochemistry', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'well_water', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'statusResist', value: 30, isPercentage: false }] },
  },

  // ============================
  // NEW COOKING - Food Buffs
  // ============================
  sp_tonic: {
    id: 'sp_tonic', name: 'SP Tonic', type: 'food',
    description: '+2 SP Regen for 5 min',
    effect: '+2 SP Regen', duration: 300, cooldown: 60, sellValue: 8,
    craftSkillId: 'cooking', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 2 }, { resourceId: 'rainwater', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'spRegen', value: 2, isPercentage: false }] },
  },
  vitality_soup: {
    id: 'vitality_soup', name: 'Vitality Soup', type: 'food',
    description: '+15 Max HP for 5 min',
    effect: '+15 Max HP', duration: 300, cooldown: 60, sellValue: 10,
    craftSkillId: 'cooking', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'well_water', quantity: 1 }, { resourceId: 'wild_herbs', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'maxHp', value: 15, isPercentage: false }] },
  },
  spirit_broth: {
    id: 'spirit_broth', name: 'Spirit Broth', type: 'food',
    description: '+5 Max SP for 5 min',
    effect: '+5 Max SP', duration: 300, cooldown: 90, sellValue: 12,
    craftSkillId: 'cooking', craftSkillLevel: 10,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'rainwater', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'maxSp', value: 5, isPercentage: false }] },
  },
  warriors_ration: {
    id: 'warriors_ration', name: "Warrior's Ration", type: 'food',
    description: '+8% Melee Attack for 3 min',
    effect: '+8% Melee Attack', duration: 180, cooldown: 120, sellValue: 14,
    craftSkillId: 'cooking', craftSkillLevel: 15,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 2 }, { resourceId: 'scrap_metal', quantity: 2 }, { resourceId: 'well_water', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'meleeAttack', value: 8, isPercentage: true }] },
  },
  marksmans_snack: {
    id: 'marksmans_snack', name: "Marksman's Snack", type: 'food',
    description: '+8% Ranged Attack for 3 min',
    effect: '+8% Ranged Attack', duration: 180, cooldown: 120, sellValue: 16,
    craftSkillId: 'cooking', craftSkillLevel: 20,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'rangedAttack', value: 8, isPercentage: true }] },
  },
  demolitions_mix: {
    id: 'demolitions_mix', name: 'Demolitions Mix', type: 'food',
    description: '+8% Blast Attack for 3 min',
    effect: '+8% Blast Attack', duration: 180, cooldown: 120, sellValue: 18,
    craftSkillId: 'cooking', craftSkillLevel: 25,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 2 }, { resourceId: 'mutant_roots', quantity: 2 }, { resourceId: 'well_water', quantity: 1 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'blastAttack', value: 8, isPercentage: true }] },
  },
  endurance_meal: {
    id: 'endurance_meal', name: 'Endurance Meal', type: 'food',
    description: '+10% Defense, +20 Max HP for 5 min',
    effect: '+10% Defense, +20 Max HP', duration: 300, cooldown: 180, sellValue: 20,
    craftSkillId: 'cooking', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'river_water', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'defense', value: 10, isPercentage: true }, { stat: 'maxHp', value: 20, isPercentage: false }] },
  },
  spirit_feast: {
    id: 'spirit_feast', name: 'Spirit Feast', type: 'food',
    description: '+10 Max SP, +3 SP Regen for 3 min',
    effect: '+10 Max SP, +3 SP Regen', duration: 180, cooldown: 180, sellValue: 22,
    craftSkillId: 'cooking', craftSkillLevel: 35,
    craftingInputs: [{ resourceId: 'wasteland_berries', quantity: 4 }, { resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'river_water', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'maxSp', value: 10, isPercentage: false }, { stat: 'spRegen', value: 3, isPercentage: false }] },
  },

  // ============================
  // NEW BIOCHEMISTRY - Medicines & Chemicals
  // ============================
  minor_sp_potion: {
    id: 'minor_sp_potion', name: 'Minor SP Potion', type: 'medicine',
    description: 'Restore 15 SP instantly',
    effect: 'Restore 15 SP', duration: 0, cooldown: 30, sellValue: 8,
    craftSkillId: 'biochemistry', craftSkillLevel: 1,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 2 }, { resourceId: 'chemical_fluids', quantity: 1 }],
    mechanicalEffect: { type: 'instant_heal_sp', healValue: 15 },
  },
  hp_potion: {
    id: 'hp_potion', name: 'HP Potion', type: 'medicine',
    description: 'Restore 80 HP instantly',
    effect: 'Restore 80 HP', duration: 0, cooldown: 45, sellValue: 12,
    craftSkillId: 'biochemistry', craftSkillLevel: 5,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 2 }, { resourceId: 'rainwater', quantity: 1 }],
    mechanicalEffect: { type: 'instant_heal_hp', healValue: 80 },
  },
  sp_potion: {
    id: 'sp_potion', name: 'SP Potion', type: 'medicine',
    description: 'Restore 30 SP instantly',
    effect: 'Restore 30 SP', duration: 0, cooldown: 45, sellValue: 14,
    craftSkillId: 'biochemistry', craftSkillLevel: 10,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 2 }],
    mechanicalEffect: { type: 'instant_heal_sp', healValue: 30 },
  },
  greater_hp_potion: {
    id: 'greater_hp_potion', name: 'Greater HP Potion', type: 'medicine',
    description: 'Restore 150 HP instantly',
    effect: 'Restore 150 HP', duration: 0, cooldown: 60, sellValue: 18,
    craftSkillId: 'biochemistry', craftSkillLevel: 15,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 4 }, { resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'well_water', quantity: 2 }],
    mechanicalEffect: { type: 'instant_heal_hp', healValue: 150 },
  },
  greater_sp_potion: {
    id: 'greater_sp_potion', name: 'Greater SP Potion', type: 'medicine',
    description: 'Restore 50 SP instantly',
    effect: 'Restore 50 SP', duration: 0, cooldown: 60, sellValue: 20,
    craftSkillId: 'biochemistry', craftSkillLevel: 20,
    craftingInputs: [{ resourceId: 'mutant_roots', quantity: 3 }, { resourceId: 'chemical_fluids', quantity: 3 }, { resourceId: 'well_water', quantity: 1 }],
    mechanicalEffect: { type: 'instant_heal_sp', healValue: 50 },
  },
  berserk_injection: {
    id: 'berserk_injection', name: 'Berserk Injection', type: 'chemical',
    description: '+20% All Attack, -10% Defense for 2 min',
    effect: '+20% All Attack, -10% Defense', duration: 120, cooldown: 180, sellValue: 25,
    craftSkillId: 'biochemistry', craftSkillLevel: 30,
    craftingInputs: [{ resourceId: 'chemical_fluids', quantity: 5 }, { resourceId: 'electronic_components', quantity: 2 }],
    mechanicalEffect: { type: 'buff', stats: [{ stat: 'meleeAttack', value: 20, isPercentage: true }, { stat: 'rangedAttack', value: 20, isPercentage: true }, { stat: 'blastAttack', value: 20, isPercentage: true }, { stat: 'defense', value: -10, isPercentage: true }] },
  },
  full_restore: {
    id: 'full_restore', name: 'Full Restore', type: 'medicine',
    description: 'Restore 50% HP and 50% SP',
    effect: 'Restore 50% HP and SP', duration: 0, cooldown: 120, sellValue: 30,
    craftSkillId: 'biochemistry', craftSkillLevel: 35,
    craftingInputs: [{ resourceId: 'wild_herbs', quantity: 5 }, { resourceId: 'chemical_fluids', quantity: 4 }, { resourceId: 'river_water', quantity: 3 }],
    mechanicalEffect: { type: 'instant_heal_both', healPercentage: 50 },
  },
};

export const CONSUMABLE_LIST = Object.values(CONSUMABLES);
export function getConsumableById(id: string): Consumable | undefined { return CONSUMABLES[id]; }
