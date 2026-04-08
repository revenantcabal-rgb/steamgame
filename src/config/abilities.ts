/**
 * Ability Tome System
 *
 * 150 total abilities across 7 color-coded categories:
 * - Red (13): Melee combat abilities, RES required
 * - Green (13): Ranged combat abilities, RES required
 * - Blue (13): Demolitions/tech abilities, RES required
 * - White (13): Support/healing abilities, RES + CON required
 * - Orange (13): Passive abilities, RES required
 * - Purple (13): Special/Warband Decree abilities, RES + secondary stat required
 * - Gold (72): Job2 Advancement abilities (6 per Job2 class, 12 classes)
 *
 * Heroes equip these into their 4 ability slots (gated by RES thresholds).
 * Purple abilities go into the Decree slot (RES 50+, 1 per party).
 * Gold abilities require a specific Job2 class promotion.
 */

export type AbilityColor = 'red' | 'green' | 'blue' | 'white' | 'orange' | 'purple' | 'gold';

export interface MechanicalEffect {
  type: 'damage' | 'buff' | 'debuff' | 'heal' | 'dot' | 'shield' | 'passive_stat';
  stat?: string;           // which DerivedStat is affected (for buffs/passives)
  value: number;           // base value
  isPercentage: boolean;   // true = % modifier, false = flat
  scaling: number;         // additional value per point of abilityPower (RES)
}

export interface AbilityTome {
  id: string;
  name: string;
  description: string;
  color: AbilityColor;
  /** Cooldown in combat turns (0 = passive) */
  cooldown: number;
  /** Requirements to equip */
  requirements: { stat: string; value: number }[];
  /** What the ability does at base level */
  effect: string;
  /** How it scales with RES */
  scaling: string;
  /** Where it can be found */
  source: string;
  /** Is this a passive ability? */
  isPassive: boolean;
  /** Is this a Warband Decree? (goes in decree slot, 1 per party) */
  isDecree: boolean;
  /** SP consumed per use (0 for passives) */
  spCost: number;
  /** Turns the effect lasts (0 = instant damage/heal) */
  duration: number;
  /** Mechanical effect for combat engine integration */
  mechanicalEffect: MechanicalEffect;
  /** Job2 class requirement (only for Job2 abilities) */
  job2ClassReq?: string;
  /** Crafting recipe to create this ability tome */
  craftRecipe?: { resourceId: string; quantity: number }[];
}

export const ABILITY_COLOR_LABELS: Record<AbilityColor, string> = {
  red: 'Crimson Tome',
  green: 'Verdant Tome',
  blue: 'Cobalt Tome',
  white: 'Silver Tome',
  orange: 'Amber Tome',
  purple: 'Violet Decree',
  gold: 'Golden Tome',
};

export const ABILITY_COLOR_HEX: Record<AbilityColor, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  white: '#c0c0c0',
  orange: '#f97316',
  purple: '#a855f7',
  gold: '#fbbf24',
};

export const ABILITIES: Record<string, AbilityTome> = {
  // =====================================================================
  // RED TOMES (13) - Melee Combat - RES required only
  // =====================================================================
  r_crushing_blow: { id: 'r_crushing_blow', name: 'Crushing Blow', color: 'red', cooldown: 14, isPassive: false, isDecree: false,
    description: 'A devastating overhead strike that staggers the enemy.',
    effect: 'Deal 140% melee damage. 20% chance to stun for 1 turn.',
    scaling: '+2% damage per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 53, duration: 0, mechanicalEffect: { type: 'damage', value: 30, isPercentage: true, scaling: 1 } },

  r_rending_slash: { id: 'r_rending_slash', name: 'Rending Slash', color: 'red', cooldown: 18, isPassive: false, isDecree: false,
    description: 'A fast slashing attack that leaves a bleeding wound.',
    effect: 'Deal 110% melee damage. Apply bleed: 3% dmg/turn for 3 turns.',
    scaling: '+1% bleed per 10 RES', source: 'Zone 1+ drops',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 18, duration: 3, mechanicalEffect: { type: 'dot', stat: 'bleedDot', value: 3, isPercentage: true, scaling: 0.5 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 5 }, { resourceId: 'scrap_metal', quantity: 4 }] },

  r_shield_breaker: { id: 'r_shield_breaker', name: 'Shield Breaker', color: 'red', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Smash through enemy defenses with raw force.',
    effect: 'Deal 120% melee damage. Ignore 30% of target defense.',
    scaling: '+1% armor pen per 5 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 35, duration: 0, mechanicalEffect: { type: 'damage', value: 35, isPercentage: true, scaling: 1 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 8 }, { resourceId: 'scrap_metal', quantity: 6 }] },

  r_double_strike: { id: 'r_double_strike', name: 'Double Strike', color: 'red', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Attack twice in rapid succession.',
    effect: 'Deal 75% melee damage twice.',
    scaling: '+1% each hit per 5 RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 28, duration: 0, mechanicalEffect: { type: 'damage', value: 40, isPercentage: true, scaling: 0.8 } },

  r_battle_cry: { id: 'r_battle_cry', name: 'Battle Cry', color: 'red', cooldown: 32, isPassive: false, isDecree: false,
    description: 'A rallying war cry that boosts your combat prowess.',
    effect: 'Self: +20% melee damage and +10% defense for 3 turns.',
    scaling: '+0.5% per RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 15 }],
    spCost: 53, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 20, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 8 }, { resourceId: 'scrap_metal', quantity: 6 }, { resourceId: 'chemical_fluids', quantity: 4 }] },

  r_whirlwind_strike: { id: 'r_whirlwind_strike', name: 'Whirlwind Strike', color: 'red', cooldown: 28, isPassive: false, isDecree: false,
    description: 'Spin in a deadly arc, hitting all nearby enemies.',
    effect: 'Deal 70% melee damage to ALL enemies.',
    scaling: '+2% per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 70, duration: 0, mechanicalEffect: { type: 'damage', value: 50, isPercentage: true, scaling: 1.5 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 11 }, { resourceId: 'scrap_metal', quantity: 8 }, { resourceId: 'chemical_fluids', quantity: 6 }] },

  r_execution: { id: 'r_execution', name: 'Execution', color: 'red', cooldown: 35, isPassive: false, isDecree: false,
    description: 'A finishing blow against weakened foes.',
    effect: 'Deal 150% melee damage. If target <25% HP, deal 350% instead.',
    scaling: 'Execute threshold +0.5% per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 88, duration: 0, mechanicalEffect: { type: 'damage', value: 80, isPercentage: true, scaling: 2 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 14 }, { resourceId: 'scrap_metal', quantity: 10 }, { resourceId: 'chemical_fluids', quantity: 7 }] },

  r_iron_fortress: { id: 'r_iron_fortress', name: 'Iron Fortress', color: 'red', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Harden your body into an immovable wall.',
    effect: 'Self: +30% defense, reflect 15% melee damage for 3 turns.',
    scaling: '+1% reflect per 10 RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 25 }],
    spCost: 63, duration: 3, mechanicalEffect: { type: 'buff', stat: 'defense', value: 30, isPercentage: true, scaling: 1 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 11 }, { resourceId: 'scrap_metal', quantity: 8 }] },

  r_berserker_rush: { id: 'r_berserker_rush', name: 'Berserker Rush', color: 'red', cooldown: 28, isPassive: false, isDecree: false,
    description: 'Sacrifice defense for overwhelming offense.',
    effect: 'Attack 3 times at 55% damage each. Self: -15% defense for 2 turns.',
    scaling: '+1% each hit per 5 RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', value: 55, isPercentage: true, scaling: 1.5 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 20 }, { resourceId: 'scrap_metal', quantity: 12 }, { resourceId: 'chemical_fluids', quantity: 9 }, { resourceId: 'precision_gears', quantity: 10 }] },

  r_titan_strike: { id: 'r_titan_strike', name: 'Titan Strike', color: 'red', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Channel immense power into a single devastating blow.',
    effect: 'Deal 250% melee damage. Ignore 25% defense.',
    scaling: '+3% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 45 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', value: 65, isPercentage: true, scaling: 1.8 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 17 }, { resourceId: 'scrap_metal', quantity: 12 }, { resourceId: 'chemical_fluids', quantity: 7 }] },

  r_blood_fury: { id: 'r_blood_fury', name: 'Blood Fury', color: 'red', cooldown: 35, isPassive: false, isDecree: false,
    description: 'Enter a blood-fueled rage, gaining power with each hit.',
    effect: 'For 3 turns: +40% melee damage, +15% crit, -20% defense.',
    scaling: '+1% damage bonus per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }],
    spCost: 88, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 40, isPercentage: true, scaling: 1.5 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 24 }, { resourceId: 'scrap_metal', quantity: 14 }, { resourceId: 'chemical_fluids', quantity: 10 }, { resourceId: 'precision_gears', quantity: 12 }] },

  r_annihilate: { id: 'r_annihilate', name: 'Annihilate', color: 'red', cooldown: 14, isPassive: false, isDecree: false,
    description: 'The ultimate melee technique. Obliterate a single target.',
    effect: 'Deal 400% melee damage. 50% armor penetration.',
    scaling: '+5% per RES', source: 'Zone 7 boss',
    requirements: [{ stat: 'res', value: 70 }],
    spCost: 105, duration: 0, mechanicalEffect: { type: 'damage', value: 100, isPercentage: true, scaling: 2.5 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 28 }, { resourceId: 'scrap_metal', quantity: 16 }, { resourceId: 'chemical_fluids', quantity: 12 }, { resourceId: 'fusion_cores', quantity: 10 }, { resourceId: 'precision_gears', quantity: 14 }] },

  r_undying_rage: { id: 'r_undying_rage', name: 'Undying Rage', color: 'red', cooldown: 0, isPassive: false, isDecree: false,
    description: 'Defy death itself through sheer willpower.',
    effect: 'Once per fight: survive lethal hit with 1 HP, +100% damage for 2 turns.',
    scaling: 'Duration +1 turn at RES 80+', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 80 }],
    spCost: 0, duration: 2, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 100, isPercentage: true, scaling: 2 }, craftRecipe: [{ resourceId: 'iron_ore', quantity: 28 }, { resourceId: 'scrap_metal', quantity: 16 }, { resourceId: 'chemical_fluids', quantity: 12 }, { resourceId: 'fusion_cores', quantity: 10 }, { resourceId: 'precision_gears', quantity: 14 }] },

  // =====================================================================
  // GREEN TOMES (13) - Ranged Combat - RES required only
  // =====================================================================
  g_quick_shot: { id: 'g_quick_shot', name: 'Quick Shot', color: 'green', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Fire a rapid shot. The fastest attack in the wasteland.',
    effect: 'Deal 95% ranged damage. Fastest cooldown.',
    scaling: '+1% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 18, duration: 0, mechanicalEffect: { type: 'damage', value: 20, isPercentage: true, scaling: 0.5 } },

  g_aimed_shot: { id: 'g_aimed_shot', name: 'Aimed Shot', color: 'green', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Take careful aim for a precise, powerful shot.',
    effect: 'Deal 140% ranged damage. +20% accuracy. Cannot miss.',
    scaling: '+2% damage per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 35, duration: 0, mechanicalEffect: { type: 'damage', value: 40, isPercentage: true, scaling: 1 } },

  g_double_tap: { id: 'g_double_tap', name: 'Double Tap', color: 'green', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Fire two shots in quick succession.',
    effect: 'Deal 70% ranged damage twice.',
    scaling: '+1% each per 5 RES', source: 'Zone 1+ drops',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 28, duration: 0, mechanicalEffect: { type: 'damage', value: 35, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 5 }, { resourceId: 'mechanical_parts', quantity: 4 }] },

  g_crippling_shot: { id: 'g_crippling_shot', name: 'Crippling Shot', color: 'green', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Target an enemy limb to slow their movements.',
    effect: 'Deal 100% ranged damage. Target: -15 Turn Speed for 2 turns.',
    scaling: '+1 speed reduction per 10 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 2, mechanicalEffect: { type: 'debuff', stat: 'defense', value: 15, isPercentage: true, scaling: 0.5 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 8 }, { resourceId: 'mechanical_parts', quantity: 6 }] },

  g_piercing_arrow: { id: 'g_piercing_arrow', name: 'Piercing Arrow', color: 'green', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Fire an armor-piercing projectile.',
    effect: 'Deal 130% ranged damage. Ignore 20% defense.',
    scaling: '+1% armor pen per 5 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 15 }],
    spCost: 42, duration: 0, mechanicalEffect: { type: 'damage', value: 40, isPercentage: true, scaling: 1.2 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 8 }, { resourceId: 'mechanical_parts', quantity: 6 }] },

  g_triple_strafe: { id: 'g_triple_strafe', name: 'Triple Strafe', color: 'green', cooldown: 26, isPassive: false, isDecree: false,
    description: 'Unleash three arrows in a devastating fan pattern.',
    effect: 'Fire 3 shots at 55% ranged damage each.',
    scaling: '+1% each per 5 RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 53, duration: 0, mechanicalEffect: { type: 'damage', value: 50, isPercentage: true, scaling: 1.2 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 8 }, { resourceId: 'mechanical_parts', quantity: 6 }, { resourceId: 'electronic_components', quantity: 4 }] },

  g_headshot: { id: 'g_headshot', name: 'Headshot', color: 'green', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Aim for the head. Devastating if you land a critical.',
    effect: 'Guaranteed crit. +50% crit damage bonus on this attack.',
    scaling: '+2% crit dmg per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 25 }],
    spCost: 53, duration: 0, mechanicalEffect: { type: 'damage', value: 60, isPercentage: true, scaling: 1.5 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 11 }, { resourceId: 'mechanical_parts', quantity: 8 }, { resourceId: 'electronic_components', quantity: 6 }] },

  g_smoke_retreat: { id: 'g_smoke_retreat', name: 'Smoke Retreat', color: 'green', cooldown: 28, isPassive: false, isDecree: false,
    description: 'Deploy a smoke bomb and reposition for advantage.',
    effect: 'Self: +30% Evasion for 2 turns. Next attack +25% damage.',
    scaling: '+1% evasion per 10 RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 49, duration: 2, mechanicalEffect: { type: 'buff', stat: 'evasion', value: 30, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 11 }, { resourceId: 'mechanical_parts', quantity: 8 }] },

  g_barrage: { id: 'g_barrage', name: 'Barrage', color: 'green', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Unleash a hail of projectiles at random enemies.',
    effect: 'Fire 5 shots at 40% damage each at random targets.',
    scaling: '+1% each per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 35 }],
    spCost: 70, duration: 0, mechanicalEffect: { type: 'damage', value: 65, isPercentage: true, scaling: 1.5 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 14 }, { resourceId: 'mechanical_parts', quantity: 10 }, { resourceId: 'electronic_components', quantity: 7 }] },

  g_snipers_mark: { id: 'g_snipers_mark', name: "Sniper's Mark", color: 'green', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Mark a high-value target for coordinated attacks.',
    effect: 'Mark 1 enemy for 4 turns. All attacks +20% crit, +15% accuracy.',
    scaling: '+1% crit per 10 RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 63, duration: 4, mechanicalEffect: { type: 'buff', stat: 'critChance', value: 20, isPercentage: true, scaling: 1 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 14 }, { resourceId: 'mechanical_parts', quantity: 10 }, { resourceId: 'electronic_components', quantity: 7 }] },

  g_kill_confirm: { id: 'g_kill_confirm', name: 'Kill Confirm', color: 'green', cooldown: 35, isPassive: false, isDecree: false,
    description: 'Execute a precise finishing shot on a weakened target.',
    effect: 'Deal 200% ranged damage. If target <30% HP, deal 450%.',
    scaling: '+5% per RES on execute', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 50 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', value: 75, isPercentage: true, scaling: 2 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 20 }, { resourceId: 'mechanical_parts', quantity: 12 }, { resourceId: 'electronic_components', quantity: 9 }, { resourceId: 'precision_gears', quantity: 10 }] },

  g_ghost_walk: { id: 'g_ghost_walk', name: 'Ghost Walk', color: 'green', cooldown: 35, isPassive: false, isDecree: false,
    description: 'Become invisible briefly. Next attack strikes from the shadows.',
    effect: 'Untargetable 1 turn. Next attack: guaranteed crit +60% damage.',
    scaling: '+3% dmg per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 60 }],
    spCost: 88, duration: 1, mechanicalEffect: { type: 'buff', stat: 'critDamage', value: 60, isPercentage: true, scaling: 1.8 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 24 }, { resourceId: 'mechanical_parts', quantity: 14 }, { resourceId: 'electronic_components', quantity: 10 }, { resourceId: 'precision_gears', quantity: 12 }] },

  g_oblivion_volley: { id: 'g_oblivion_volley', name: 'Oblivion Volley', color: 'green', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Rain death from above upon all enemies.',
    effect: 'Deal 250% ranged damage to ALL enemies. Each hit: 30% crit chance.',
    scaling: '+5% per RES', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 80 }],
    spCost: 105, duration: 0, mechanicalEffect: { type: 'damage', value: 100, isPercentage: true, scaling: 2.5 }, craftRecipe: [{ resourceId: 'copper_ore', quantity: 28 }, { resourceId: 'mechanical_parts', quantity: 16 }, { resourceId: 'electronic_components', quantity: 12 }, { resourceId: 'fusion_cores', quantity: 10 }, { resourceId: 'precision_gears', quantity: 14 }] },

  // =====================================================================
  // BLUE TOMES (13) - Demolitions/Tech - RES required only
  // =====================================================================
  b_firebomb: { id: 'b_firebomb', name: 'Firebomb', color: 'blue', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Hurl an incendiary device that sets enemies ablaze.',
    effect: 'Deal 120% blast damage. 25% chance: burn 5 dmg/turn for 2 turns.',
    scaling: '+2% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 35, duration: 0, mechanicalEffect: { type: 'damage', value: 35, isPercentage: true, scaling: 1 } },

  b_frag_toss: { id: 'b_frag_toss', name: 'Frag Toss', color: 'blue', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Throw fragmentation that sprays shrapnel in an area.',
    effect: 'Deal 100% blast to target + 45% to 1 adjacent enemy.',
    scaling: '+1.5% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 0, mechanicalEffect: { type: 'damage', value: 30, isPercentage: true, scaling: 0.8 } },

  b_concussion_grenade: { id: 'b_concussion_grenade', name: 'Concussion Grenade', color: 'blue', cooldown: 18, isPassive: false, isDecree: false,
    description: 'A flashbang that disorients and stuns enemies.',
    effect: 'Deal 90% blast damage. 30% chance stun for 1 turn.',
    scaling: '+1% stun chance per 5 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 0, mechanicalEffect: { type: 'damage', value: 30, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 8 }, { resourceId: 'chemical_fluids', quantity: 6 }] },

  b_smoke_bomb: { id: 'b_smoke_bomb', name: 'Smoke Bomb', color: 'blue', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Deploy a thick smoke screen that blinds all enemies.',
    effect: 'All enemies: -25% accuracy for 2 turns.',
    scaling: '+1% per 10 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 2, mechanicalEffect: { type: 'debuff', stat: 'accuracy', value: 25, isPercentage: true, scaling: 0.5 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 8 }, { resourceId: 'chemical_fluids', quantity: 6 }] },

  b_trip_mine: { id: 'b_trip_mine', name: 'Trip Mine', color: 'blue', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Plant an invisible mine that detonates when triggered.',
    effect: 'Next enemy that acts takes 140% blast damage.',
    scaling: '+2% per RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 15 }],
    spCost: 42, duration: 0, mechanicalEffect: { type: 'damage', value: 40, isPercentage: true, scaling: 1 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 8 }, { resourceId: 'chemical_fluids', quantity: 6 }, { resourceId: 'volatile_compounds', quantity: 4 }] },

  b_napalm_flask: { id: 'b_napalm_flask', name: 'Napalm Flask', color: 'blue', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Throw a canister of sticky fire that burns persistently.',
    effect: 'Deal 80% blast damage. Burn: 10 dmg/turn for 4 turns.',
    scaling: '+1 burn per 5 RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 63, duration: 4, mechanicalEffect: { type: 'dot', stat: 'burnDot', value: 5, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 11 }, { resourceId: 'chemical_fluids', quantity: 8 }] },

  b_cluster_bomb: { id: 'b_cluster_bomb', name: 'Cluster Bomb', color: 'blue', cooldown: 28, isPassive: false, isDecree: false,
    description: 'Scatter multiple explosive charges across the battlefield.',
    effect: 'Deal 75% blast damage to ALL enemies.',
    scaling: '+2% per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 25 }],
    spCost: 70, duration: 0, mechanicalEffect: { type: 'damage', value: 50, isPercentage: true, scaling: 1.3 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 11 }, { resourceId: 'chemical_fluids', quantity: 8 }, { resourceId: 'volatile_compounds', quantity: 6 }] },

  b_emp_blast: { id: 'b_emp_blast', name: 'EMP Blast', color: 'blue', cooldown: 28, isPassive: false, isDecree: false,
    description: 'Emit an electromagnetic pulse that disrupts all technology.',
    effect: 'Deal 60% blast to all. Remove 1 buff from each enemy. Tech armor +25%.',
    scaling: '+2% per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 70, duration: 0, mechanicalEffect: { type: 'damage', value: 45, isPercentage: true, scaling: 1.2 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 14 }, { resourceId: 'chemical_fluids', quantity: 10 }, { resourceId: 'volatile_compounds', quantity: 7 }] },

  b_toxic_cloud: { id: 'b_toxic_cloud', name: 'Toxic Cloud', color: 'blue', cooldown: 26, isPassive: false, isDecree: false,
    description: 'Release a cloud of corrosive gas that eats through armor.',
    effect: 'Deal 50% blast to all. Poison: 8 dmg/turn 3 turns. -10% enemy accuracy.',
    scaling: '+1 poison per 5 RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 35 }],
    spCost: 77, duration: 3, mechanicalEffect: { type: 'dot', stat: 'poisonDot', value: 6, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 14 }, { resourceId: 'chemical_fluids', quantity: 10 }] },

  b_plasma_lance: { id: 'b_plasma_lance', name: 'Plasma Lance', color: 'blue', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Fire a concentrated beam of superheated plasma.',
    effect: 'Deal 200% blast damage. Ignore 25% defense.',
    scaling: '+4% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 45 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', value: 70, isPercentage: true, scaling: 1.8 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 17 }, { resourceId: 'chemical_fluids', quantity: 12 }, { resourceId: 'volatile_compounds', quantity: 7 }] },

  b_radiation_burst: { id: 'b_radiation_burst', name: 'Radiation Burst', color: 'blue', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Release a wave of lethal radiation.',
    effect: 'Deal 100% blast to all. Radiation: 15 dmg/turn 4 turns. -20% healing.',
    scaling: '+2 rad dmg per 5 RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }],
    spCost: 98, duration: 4, mechanicalEffect: { type: 'dot', stat: 'radiationDot', value: 8, isPercentage: true, scaling: 1.2 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 24 }, { resourceId: 'chemical_fluids', quantity: 14 }, { resourceId: 'volatile_compounds', quantity: 10 }, { resourceId: 'precision_gears', quantity: 12 }] },

  b_carpet_bomb: { id: 'b_carpet_bomb', name: 'Carpet Bomb', color: 'blue', cooldown: 35, isPassive: false, isDecree: false,
    description: 'Saturate the entire area with explosives.',
    effect: 'Deal 140% blast to ALL enemies over 2 turns. Self-damage: 6%.',
    scaling: '+3% per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 60 }],
    spCost: 98, duration: 0, mechanicalEffect: { type: 'damage', value: 85, isPercentage: true, scaling: 2 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 24 }, { resourceId: 'chemical_fluids', quantity: 14 }, { resourceId: 'volatile_compounds', quantity: 10 }, { resourceId: 'precision_gears', quantity: 12 }] },

  b_singularity: { id: 'b_singularity', name: 'Singularity', color: 'blue', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Create a localized gravitational collapse. The ultimate weapon.',
    effect: 'Deal 450% blast to 1 target, 180% to adjacent. Self-damage: 12%. Self-stun 1 turn.',
    scaling: '+8% per RES', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 80 }],
    spCost: 105, duration: 0, mechanicalEffect: { type: 'damage', value: 100, isPercentage: true, scaling: 2.5 }, craftRecipe: [{ resourceId: 'electronic_components', quantity: 28 }, { resourceId: 'chemical_fluids', quantity: 16 }, { resourceId: 'volatile_compounds', quantity: 12 }, { resourceId: 'fusion_cores', quantity: 10 }, { resourceId: 'precision_gears', quantity: 14 }] },

  // =====================================================================
  // WHITE / SILVER TOMES (13) - Support/Healing - RES + CON required
  // =====================================================================
  w_first_aid: { id: 'w_first_aid', name: 'First Aid', color: 'white', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Apply emergency first aid to stabilize wounds.',
    effect: 'Restore 15% of Max HP instantly.',
    scaling: '+0.5% heal per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 21, duration: 0, mechanicalEffect: { type: 'heal', value: 15, isPercentage: true, scaling: 0.5 } },

  w_mending_salve: { id: 'w_mending_salve', name: 'Mending Salve', color: 'white', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Apply a slow-acting healing compound that restores health over time.',
    effect: 'Heal 4% Max HP per turn for 4 turns.',
    scaling: '+0.3% per RES', source: 'Zone 1+ drops',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 28, duration: 4, mechanicalEffect: { type: 'heal', value: 4, isPercentage: true, scaling: 0.3 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 5 }, { resourceId: 'wild_herbs', quantity: 4 }] },

  w_rally_cry: { id: 'w_rally_cry', name: 'Rally Cry', color: 'white', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Shout encouragement to bolster ally morale and fighting spirit.',
    effect: 'All allies: +15% damage for 3 turns.',
    scaling: '+0.5% per RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }, { stat: 'con', value: 12 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 15, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 8 }, { resourceId: 'wild_herbs', quantity: 6 }] },

  w_suppressive_smoke: { id: 'w_suppressive_smoke', name: 'Suppressive Smoke', color: 'white', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Deploy a smoke screen that obscures enemy targeting.',
    effect: 'Enemy accuracy -15% for 3 turns.',
    scaling: '-0.3% enemy accuracy per RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 15 }],
    spCost: 35, duration: 3, mechanicalEffect: { type: 'debuff', stat: 'accuracy', value: 15, isPercentage: true, scaling: 0.5 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 8 }, { resourceId: 'wild_herbs', quantity: 6 }] },

  w_fortify: { id: 'w_fortify', name: 'Fortify', color: 'white', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Brace and harden defenses against incoming attacks.',
    effect: 'Self: +20% defense for 4 turns.',
    scaling: '+0.5% per RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 15 }, { stat: 'con', value: 15 }],
    spCost: 42, duration: 4, mechanicalEffect: { type: 'buff', stat: 'defense', value: 20, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 8 }, { resourceId: 'wild_herbs', quantity: 6 }, { resourceId: 'chemical_fluids', quantity: 4 }] },

  w_adrenaline_shot: { id: 'w_adrenaline_shot', name: 'Adrenaline Shot', color: 'white', cooldown: 35, isPassive: false, isDecree: false,
    description: 'Inject a stimulant that temporarily boosts combat reflexes.',
    effect: 'Self or ally: +20% turn speed, +10% crit for 3 turns.',
    scaling: '+0.3% per RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }, { stat: 'con', value: 15 }],
    spCost: 49, duration: 3, mechanicalEffect: { type: 'buff', stat: 'turnSpeed', value: 20, isPercentage: true, scaling: 0.6 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 11 }, { resourceId: 'wild_herbs', quantity: 8 }] },

  w_triage: { id: 'w_triage', name: 'Triage', color: 'white', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Emergency field surgery that restores a large amount of health.',
    effect: 'Restore 30% Max HP. Self-stun 1 turn.',
    scaling: '+1% heal per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 25 }, { stat: 'con', value: 18 }],
    spCost: 63, duration: 0, mechanicalEffect: { type: 'heal', value: 30, isPercentage: true, scaling: 1.0 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 11 }, { resourceId: 'wild_herbs', quantity: 8 }, { resourceId: 'chemical_fluids', quantity: 6 }] },

  w_iron_guard: { id: 'w_iron_guard', name: 'Iron Guard', color: 'white', cooldown: 32, isPassive: false, isDecree: false,
    description: 'Adopt a defensive stance that absorbs incoming damage.',
    effect: '+25% damage reduction for 3 turns. -15% attack.',
    scaling: '+0.5% DR per RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 25 }, { stat: 'con', value: 20 }],
    spCost: 53, duration: 3, mechanicalEffect: { type: 'buff', stat: 'damageReduction', value: 25, isPercentage: true, scaling: 0.8 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 11 }, { resourceId: 'wild_herbs', quantity: 8 }] },

  w_purifying_light: { id: 'w_purifying_light', name: 'Purifying Light', color: 'white', cooldown: 28, isPassive: false, isDecree: false,
    description: 'Cleanse toxins and debilitating effects with concentrated UV treatment.',
    effect: '+20% status resistance for 4 turns.',
    scaling: '+0.5% per RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 30 }, { stat: 'con', value: 20 }],
    spCost: 49, duration: 4, mechanicalEffect: { type: 'buff', stat: 'statusResist', value: 20, isPercentage: true, scaling: 0.6 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 14 }, { resourceId: 'wild_herbs', quantity: 10 }] },

  w_battlefield_command: { id: 'w_battlefield_command', name: 'Battlefield Command', color: 'white', cooldown: 39, isPassive: false, isDecree: false,
    description: 'Issue tactical orders that coordinate ally attacks.',
    effect: 'All allies: +10% accuracy, +10% crit damage for 3 turns.',
    scaling: '+0.3% per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 35 }, { stat: 'con', value: 22 }],
    spCost: 63, duration: 3, mechanicalEffect: { type: 'buff', stat: 'accuracy', value: 10, isPercentage: true, scaling: 0.6 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 14 }, { resourceId: 'wild_herbs', quantity: 10 }, { resourceId: 'chemical_fluids', quantity: 7 }] },

  w_shield_wall: { id: 'w_shield_wall', name: 'Shield Wall', color: 'white', cooldown: 39, isPassive: false, isDecree: false,
    description: 'Raise a barrier that absorbs incoming damage for the team.',
    effect: 'All allies: +15% defense, +10% damage reduction for 3 turns.',
    scaling: '+0.5% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 45 }, { stat: 'con', value: 25 }],
    spCost: 77, duration: 3, mechanicalEffect: { type: 'buff', stat: 'defense', value: 15, isPercentage: true, scaling: 1.0 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 17 }, { resourceId: 'wild_herbs', quantity: 12 }, { resourceId: 'chemical_fluids', quantity: 7 }] },

  w_lifeblood_surge: { id: 'w_lifeblood_surge', name: 'Lifeblood Surge', color: 'white', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Channel vital energy into a massive wave of healing.',
    effect: 'Restore 50% Max HP. +5 HP Regen for 5 turns.',
    scaling: '+1.5% heal per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }, { stat: 'con', value: 30 }],
    spCost: 88, duration: 0, mechanicalEffect: { type: 'heal', value: 50, isPercentage: true, scaling: 1.5 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 24 }, { resourceId: 'wild_herbs', quantity: 14 }, { resourceId: 'chemical_fluids', quantity: 10 }, { resourceId: 'precision_gears', quantity: 12 }] },

  w_undying_covenant: { id: 'w_undying_covenant', name: 'Undying Covenant', color: 'white', cooldown: 0, isPassive: true, isDecree: false,
    description: 'A pact with the wasteland itself. Your will to protect sustains the team.',
    effect: 'Passive: +3 HP Regen, +50 Max HP, +5% Status Resist.',
    scaling: 'Static', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 70 }, { stat: 'con', value: 35 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'hpRegen', value: 3, isPercentage: false, scaling: 0 }, craftRecipe: [{ resourceId: 'mutant_roots', quantity: 28 }, { resourceId: 'wild_herbs', quantity: 16 }, { resourceId: 'chemical_fluids', quantity: 12 }, { resourceId: 'fusion_cores', quantity: 10 }, { resourceId: 'precision_gears', quantity: 14 }] },

  // =====================================================================
  // ORANGE TOMES (13) - Passive Abilities - RES required only
  // =====================================================================
  o_thick_skin: { id: 'o_thick_skin', name: 'Thick Skin', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Hardened wasteland survivor. Takes less damage passively.',
    effect: '+5% Damage Reduction permanently.',
    scaling: '+0.1% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'damageReduction', value: 5, isPercentage: true, scaling: 0.1 } },

  o_scavengers_luck: { id: 'o_scavengers_luck', name: "Scavenger's Luck", color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Fortune favors the bold. Better loot from all sources.',
    effect: '+5% rare drop chance.',
    scaling: '+0.1% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'dropChance', value: 5, isPercentage: true, scaling: 0.1 } },

  o_quick_reflexes: { id: 'o_quick_reflexes', name: 'Quick Reflexes', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Enhanced reaction time from surviving the wastes.',
    effect: '+5 Turn Speed permanently.',
    scaling: '+0.2 per RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'turnSpeed', value: 5, isPercentage: false, scaling: 0.2 } },

  o_keen_eyes: { id: 'o_keen_eyes', name: 'Keen Eyes', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Sharp vision honed by years of wasteland vigilance.',
    effect: '+5% Accuracy permanently.',
    scaling: '+0.1% per RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'accuracy', value: 5, isPercentage: true, scaling: 0.1 } },

  o_regeneration: { id: 'o_regeneration', name: 'Regeneration', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Enhanced cellular repair from mutation exposure.',
    effect: '+2 HP Regen per turn permanently.',
    scaling: '+0.1 per RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'hpRegen', value: 2, isPercentage: false, scaling: 0.1 } },

  o_critical_mastery: { id: 'o_critical_mastery', name: 'Critical Mastery', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Expert knowledge of enemy weak points.',
    effect: '+5% Critical Chance permanently.',
    scaling: '+0.1% per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'critChance', value: 5, isPercentage: true, scaling: 0.1 } },

  o_last_breath: { id: 'o_last_breath', name: 'Last Breath', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'The will to survive when everything goes wrong.',
    effect: 'Once per fight: survive lethal hit with 10% HP.',
    scaling: '+1% survive HP per 10 RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'maxHp', value: 5, isPercentage: true, scaling: 0.3 } },

  o_bloodthirst: { id: 'o_bloodthirst', name: 'Bloodthirst', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Heal from the damage you inflict.',
    effect: 'Lifesteal: heal 3% of damage dealt.',
    scaling: '+0.1% per RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'lifesteal', value: 3, isPercentage: false, scaling: 0.1 } },

  o_iron_will: { id: 'o_iron_will', name: 'Iron Will', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Unshakeable mental fortitude against status effects.',
    effect: '+10% Status Resistance permanently.',
    scaling: '+0.2% per RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 35 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'statusResist', value: 10, isPercentage: true, scaling: 0.2 } },

  o_precision_strikes: { id: 'o_precision_strikes', name: 'Precision Strikes', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Every hit counts. Increased critical damage.',
    effect: '+15% Critical Damage permanently.',
    scaling: '+0.3% per RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 45 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'critDamage', value: 15, isPercentage: true, scaling: 0.3 } },

  o_combat_veteran: { id: 'o_combat_veteran', name: 'Combat Veteran', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Battle-hardened survivor. More XP from all combat.',
    effect: '+10% combat XP gain permanently.',
    scaling: '+0.2% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'xpBonus', value: 10, isPercentage: true, scaling: 0.2 } },

  o_ghost_protocol: { id: 'o_ghost_protocol', name: 'Ghost Protocol', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Move like a shadow. Harder to hit, faster to strike.',
    effect: '+8% Evasion, +5 Turn Speed permanently.',
    scaling: '+0.1% evasion per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'evasion', value: 8, isPercentage: true, scaling: 0.1 } },

  o_apex_predator: { id: 'o_apex_predator', name: 'Apex Predator', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Top of the food chain. All combat stats enhanced.',
    effect: '+5% to ALL attack types, +3% crit, +3% accuracy.',
    scaling: '+0.1% all per RES', source: 'Zone 7 boss',
    requirements: [{ stat: 'res', value: 70 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'meleeAttack', value: 5, isPercentage: true, scaling: 0.1 } },

  // =====================================================================
  // PURPLE TOMES (13) - Warband Decrees - RES + secondary stat required
  // Party-wide buffs, 1 per party, goes in Decree slot
  // Equippable in early-mid game (lower requirements)
  // =====================================================================
  p_decree_fury: { id: 'p_decree_fury', name: 'Wasteland Fury', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your fury ignites the fighting spirit of all allies.',
    effect: 'All party: +8% melee, ranged, and blast attack.',
    scaling: '+0.1% per RES', source: 'Zone 3+ boss, Biochem Lv.40',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'str', value: 15 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'meleeAttack', value: 8, isPercentage: true, scaling: 0.3 } },

  p_decree_resolve: { id: 'p_decree_resolve', name: 'Iron Resolve', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your unwavering determination shields all allies.',
    effect: 'All party: +5% defense, +30 Max HP.',
    scaling: '+0.5 HP per RES', source: 'Zone 2+ boss, Biochem Lv.30',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 20 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'defense', value: 5, isPercentage: true, scaling: 0.2 } },

  p_decree_instinct: { id: 'p_decree_instinct', name: "Predator's Instinct", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your predatory awareness sharpens the entire squad.',
    effect: 'All party: +5% Crit Chance, +10% Crit Damage.',
    scaling: '+0.1% crit per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'per', value: 20 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'critChance', value: 5, isPercentage: true, scaling: 0.1 } },

  p_decree_speed: { id: 'p_decree_speed', name: 'Swift Current', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your speed inspires the whole team to move faster.',
    effect: 'All party: +8 Turn Speed, +3% Evasion.',
    scaling: '+0.1 speed per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'dex', value: 15 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'turnSpeed', value: 8, isPercentage: false, scaling: 0.1 } },

  p_decree_vitality: { id: 'p_decree_vitality', name: 'Vital Pulse', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your life force radiates outward, healing all allies.',
    effect: 'All party: +2 HP Regen/turn, +5% Status Resist.',
    scaling: '+0.05 regen per RES', source: 'Zone 2+ boss, Biochem Lv.35',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 15 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'hpRegen', value: 2, isPercentage: false, scaling: 0.05 } },

  p_decree_fortune: { id: 'p_decree_fortune', name: "Fortune's Favor", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Luck smiles on you and everyone around you.',
    effect: 'All party: +5% rare drop chance, +3% double loot chance.',
    scaling: '+0.1% per RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'luk', value: 25 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'dropChance', value: 5, isPercentage: true, scaling: 0.1 } },

  p_decree_undying: { id: 'p_decree_undying', name: 'Unyielding Spirit', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your willpower keeps the entire squad alive against the odds.',
    effect: 'All party: survive first lethal hit with 1 HP (once per fight per member).',
    scaling: 'Heal % on survive per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 35 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'maxHp', value: 8, isPercentage: true, scaling: 0.2 } },

  p_decree_war: { id: 'p_decree_war', name: "Warmonger's Presence", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your bloodlust empowers the squad to finish wounded enemies.',
    effect: 'All party: +10% damage to enemies below 50% HP.',
    scaling: '+0.15% per RES', source: 'Zone 5+ boss, Biochem Lv.70',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'str', value: 25 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'meleeAttack', value: 10, isPercentage: true, scaling: 0.15 } },

  p_decree_null: { id: 'p_decree_null', name: 'Nullification Field', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Project a field that negates the first incoming debuff.',
    effect: 'All party: immune to first debuff each fight.',
    scaling: 'Duration per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'int', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'statusResist', value: 10, isPercentage: true, scaling: 0.2 } },

  p_decree_cataclysm: { id: 'p_decree_cataclysm', name: 'Decree of the Cataclysm', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Channel the power of the apocalypse itself.',
    effect: 'All party: +5% to ALL stats.',
    scaling: '+0.08% per RES', source: 'Zone 7 final boss only',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'str', value: 20 }, { stat: 'int', value: 20 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'meleeAttack', value: 5, isPercentage: true, scaling: 0.08 } },

  p_decree_harvest: { id: 'p_decree_harvest', name: 'Bountiful Harvest', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your presence boosts all resource gathering and production.',
    effect: 'All party: +15% gathering yield, +10% production speed.',
    scaling: '+0.2% yield per RES', source: 'Zone 4+ boss, Biochem Lv.50',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'luk', value: 15 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'gatheringYield', value: 15, isPercentage: true, scaling: 0.2 } },

  p_decree_accuracy: { id: 'p_decree_accuracy', name: "Hawk's Dominion", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your piercing gaze guides every shot your allies take.',
    effect: 'All party: +8% Accuracy, +5% Armor Penetration.',
    scaling: '+0.1% acc per RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'per', value: 25 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'accuracy', value: 8, isPercentage: true, scaling: 0.1 } },

  p_decree_shield: { id: 'p_decree_shield', name: 'Bulwark Command', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your defensive stance hardens the entire squad.',
    effect: 'All party: +8% Defense, +5% Damage Reduction.',
    scaling: '+0.1% def per RES', source: 'Zone 5+ boss, Biochem Lv.60',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 25 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'defense', value: 8, isPercentage: true, scaling: 0.1 } },

  // =====================================================================
  // GOLD TOMES (72) - Job2 Advancement Abilities
  // =====================================================================

  // --- SENTINEL (6) ---
  j2_scrap_wall: { id: 'j2_scrap_wall', name: 'Scrap Wall', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Erect a barrier of salvaged scrap to absorb incoming damage.',
    effect: 'Barrier equal to 15% max HP for 3 turns.',
    scaling: '+0.2% barrier per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 3, mechanicalEffect: { type: 'shield', stat: 'maxHp', value: 15, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'sentinel' },

  j2_rusted_taunt: { id: 'j2_rusted_taunt', name: 'Rusted Taunt', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Clang rusted armor to force enemies to target the Sentinel.',
    effect: 'Force enemies to target Sentinel 2 turns, +15% def.',
    scaling: '+0.15% def per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 35, duration: 2, mechanicalEffect: { type: 'debuff', stat: 'defense', value: 15, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'sentinel' },

  j2_fortress_bash: { id: 'j2_fortress_bash', name: 'Fortress Bash', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Slam enemies with your shield in a devastating charge.',
    effect: 'Deal 130% melee shield slam, 30% chance to stun.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 130, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'sentinel' },

  j2_iron_curtain: { id: 'j2_iron_curtain', name: 'Iron Curtain', color: 'gold', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Intercept all damage headed for your weakest ally.',
    effect: 'Intercept damage for lowest-HP ally 3 turns.',
    scaling: '+0.3% shield per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 53, duration: 3, mechanicalEffect: { type: 'shield', stat: 'maxHp', value: 20, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'sentinel' },

  j2_counterfort: { id: 'j2_counterfort', name: 'Counterfort', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Blocked attacks reflect damage and boost Turn Speed.',
    effect: 'Blocked attacks reflect 20% + +5 Turn Speed.',
    scaling: '+0.1% thorns per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'thornsDamage', value: 20, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'sentinel' },

  j2_citadel_protocol: { id: 'j2_citadel_protocol', name: 'Citadel Protocol', color: 'gold', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Activate full defensive protocols for maximum fortification.',
    effect: '+25% def, +20% block, +10% dmg reduction 4 turns.',
    scaling: '+0.3% def per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 70, duration: 4, mechanicalEffect: { type: 'buff', stat: 'defense', value: 25, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'sentinel' },

  // --- BRUISER (6) ---
  j2_jab_combo: { id: 'j2_jab_combo', name: 'Jab Combo', color: 'gold', cooldown: 9, isPassive: false, isDecree: false,
    description: 'Unleash a rapid three-hit combo on the target.',
    effect: '3 hits at 50% melee damage each.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 21, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 150, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'bruiser' },

  j2_gut_check: { id: 'j2_gut_check', name: 'Gut Check', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'A body blow that disorients and slows the target.',
    effect: '90% melee + -15% acc, -10 Turn Speed 2 turns.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 28, duration: 2, mechanicalEffect: { type: 'debuff', stat: 'accuracy', value: 15, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'bruiser' },

  j2_haymaker: { id: 'j2_haymaker', name: 'Haymaker', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Consume all Momentum stacks for a devastating punch.',
    effect: 'Consume Momentum, 100%+30%/stack melee damage.',
    scaling: '+0.8% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 250, isPercentage: true, scaling: 0.8 }, job2ClassReq: 'bruiser' },

  j2_slip_counter: { id: 'j2_slip_counter', name: 'Slip Counter', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Enter a counter stance, dodging and retaliating.',
    effect: 'Counter stance 2 turns, 50% dodge + 120% retaliate.',
    scaling: '+0.2% evasion per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 35, duration: 2, mechanicalEffect: { type: 'buff', stat: 'evasion', value: 50, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'bruiser' },

  j2_brawlers_instinct: { id: 'j2_brawlers_instinct', name: "Brawler's Instinct", color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Honed reflexes grant evasion and bonus damage after dodging.',
    effect: '+3% evasion, post-dodge +25% dmg.',
    scaling: '+0.05% evasion per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'evasion', value: 3, isPercentage: true, scaling: 0.05 }, job2ClassReq: 'bruiser' },

  j2_annihilation_rush: { id: 'j2_annihilation_rush', name: 'Annihilation Rush', color: 'gold', cooldown: 21, isPassive: false, isDecree: false,
    description: 'A relentless flurry of six devastating strikes.',
    effect: '6 hits at 45% melee damage each.',
    scaling: '+1.0% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 270, isPercentage: true, scaling: 1.0 }, job2ClassReq: 'bruiser' },

  // --- CRUSHER (6) ---
  j2_overhead_smash: { id: 'j2_overhead_smash', name: 'Overhead Smash', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Bring a massive weapon crashing down on the target.',
    effect: 'Deal 180% melee damage, 25% chance to stagger.',
    scaling: '+0.6% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 35, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 180, isPercentage: true, scaling: 0.6 }, job2ClassReq: 'crusher' },

  j2_tremor_strike: { id: 'j2_tremor_strike', name: 'Tremor Strike', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Strike the ground to send shockwaves through all enemies.',
    effect: '90% melee to ALL enemies, 15% stun chance.',
    scaling: '+0.4% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 53, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 90, isPercentage: true, scaling: 0.4 }, job2ClassReq: 'crusher' },

  j2_bone_splinter: { id: 'j2_bone_splinter', name: 'Bone Splinter', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Shatter enemy defenses with a brutal crushing blow.',
    effect: '120% melee + -20% def, -15% armor 3 turns.',
    scaling: '+0.15% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'debuff', stat: 'defense', value: 20, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'crusher' },

  j2_momentum_swing: { id: 'j2_momentum_swing', name: 'Momentum Swing', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'A sweeping attack that chains to additional targets on kill.',
    effect: '140% melee, chains on kill up to 2 additional targets.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 49, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 140, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'crusher' },

  j2_juggernaut: { id: 'j2_juggernaut', name: 'Juggernaut', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Unstoppable force grants melee power and stun immunity.',
    effect: '+10% melee, stun immune >50% HP, -5% evasion.',
    scaling: '+0.1% melee per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'meleeAttack', value: 10, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'crusher' },

  j2_cataclysm: { id: 'j2_cataclysm', name: 'Cataclysm', color: 'gold', cooldown: 26, isPassive: false, isDecree: false,
    description: 'Wind up for a cataclysmic strike with devastating splash.',
    effect: 'Wind-up then 350% melee + 150% splash damage.',
    scaling: '+1.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 88, duration: 0, mechanicalEffect: { type: 'damage', stat: 'meleeAttack', value: 350, isPercentage: true, scaling: 1.5 }, job2ClassReq: 'crusher' },

  // --- SNIPER (6) ---
  j2_steady_aim: { id: 'j2_steady_aim', name: 'Steady Aim', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Take careful aim to empower your next shot.',
    effect: 'Next attack +60% dmg, +20% acc, -15 Turn Speed.',
    scaling: '+0.3% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 1, mechanicalEffect: { type: 'buff', stat: 'rangedAttack', value: 60, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'sniper' },

  j2_penetrating_round: { id: 'j2_penetrating_round', name: 'Penetrating Round', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Fire a piercing round that punches through multiple targets.',
    effect: '160% ranged, pierces 2nd enemy at 80%.',
    scaling: '+0.6% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 49, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 160, isPercentage: true, scaling: 0.6 }, job2ClassReq: 'sniper' },

  j2_suppressive_position: { id: 'j2_suppressive_position', name: 'Suppressive Position', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Mark a target for increased vulnerability.',
    effect: 'Mark target 3 turns: +15% dmg taken, -20% evasion.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 35, duration: 3, mechanicalEffect: { type: 'debuff', stat: 'evasion', value: 20, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'sniper' },

  j2_collateral_shot: { id: 'j2_collateral_shot', name: 'Collateral Shot', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Fire a fragmenting round that sprays shrapnel to nearby foes.',
    effect: '130% ranged + shrapnel 60% to 2 adjacent enemies.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 56, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 130, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'sniper' },

  j2_dead_calm: { id: 'j2_dead_calm', name: 'Dead Calm', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Absolute focus sharpens critical strikes at the cost of speed.',
    effect: '+8% crit dmg, +5% acc, -10 Turn Speed.',
    scaling: '+0.1% crit dmg per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'critDamage', value: 8, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'sniper' },

  j2_killzone: { id: 'j2_killzone', name: 'Killzone', color: 'gold', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Wind up a devastating shot that ignores enemy defenses.',
    effect: 'Wind-up then 300% ranged ignoring 40% def.',
    scaling: '+1.2% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 300, isPercentage: true, scaling: 1.2 }, job2ClassReq: 'sniper' },

  // --- GUNSLINGER (6) ---
  j2_fan_the_hammer: { id: 'j2_fan_the_hammer', name: 'Fan the Hammer', color: 'gold', cooldown: 9, isPassive: false, isDecree: false,
    description: 'Rapidly fire four shots at random enemies.',
    effect: '4 shots at 40% ranged each at random enemies.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 160, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'gunslinger' },

  j2_bullet_dodge: { id: 'j2_bullet_dodge', name: 'Bullet Dodge', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Deftly dodge incoming fire and power up your next attack.',
    effect: '+30% evasion 2 turns, post-dodge +40% dmg.',
    scaling: '+0.15% evasion per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 25, duration: 2, mechanicalEffect: { type: 'buff', stat: 'evasion', value: 30, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'gunslinger' },

  j2_ricochet: { id: 'j2_ricochet', name: 'Ricochet', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Fire a trick shot that bounces between multiple targets.',
    effect: '110% ranged, bounces to 2 more at 70%/40%.',
    scaling: '+0.4% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 110, isPercentage: true, scaling: 0.4 }, job2ClassReq: 'gunslinger' },

  j2_quickdraw: { id: 'j2_quickdraw', name: 'Quickdraw', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Draw and fire with blinding speed, always acting first.',
    effect: '150% ranged damage, always acts first.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 49, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 150, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'gunslinger' },

  j2_gunslingers_luck: { id: 'j2_gunslingers_luck', name: "Gunslinger's Luck", color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Fortune favors the quick — crits boost speed.',
    effect: '+3% crit, +3% evasion, crits +5 Turn Speed.',
    scaling: '+0.05% crit per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'critChance', value: 3, isPercentage: true, scaling: 0.05 }, job2ClassReq: 'gunslinger' },

  j2_bullet_storm: { id: 'j2_bullet_storm', name: 'Bullet Storm', color: 'gold', cooldown: 21, isPassive: false, isDecree: false,
    description: 'Unleash a hail of eight shots at random targets.',
    effect: '8 shots at 30% ranged each at random targets.',
    scaling: '+0.8% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 77, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 240, isPercentage: true, scaling: 0.8 }, job2ClassReq: 'gunslinger' },

  // --- HUNTER (6) ---
  j2_toxic_arrow: { id: 'j2_toxic_arrow', name: 'Toxic Arrow', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Loose a poison-tipped arrow that festers in the wound.',
    effect: '80% ranged + poison 5% HP/turn 3 turns.',
    scaling: '+0.2% poison per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 3, mechanicalEffect: { type: 'dot', stat: 'poisonDot', value: 5, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'hunter' },

  j2_leg_trap: { id: 'j2_leg_trap', name: 'Leg Trap', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Set a hidden trap that snares and slows the next enemy.',
    effect: 'Trap: triggers 100% ranged + -30% Turn Speed.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 35, duration: 2, mechanicalEffect: { type: 'debuff', stat: 'turnSpeed', value: 30, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'hunter' },

  j2_mark_prey: { id: 'j2_mark_prey', name: 'Mark Prey', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Mark an enemy as prey, increasing damage and crits against it.',
    effect: 'Mark 4 turns: +20% dmg, +10% crit vs marked.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 28, duration: 4, mechanicalEffect: { type: 'debuff', stat: 'damageReduction', value: 20, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'hunter' },

  j2_barbed_snare: { id: 'j2_barbed_snare', name: 'Barbed Snare', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Ensnare the target with barbed wire that bleeds over time.',
    effect: '60% ranged + bleed 4% HP/turn 4 turns.',
    scaling: '+0.15% bleed per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 42, duration: 4, mechanicalEffect: { type: 'dot', stat: 'bleedDot', value: 4, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'hunter' },

  j2_predators_patience: { id: 'j2_predators_patience', name: "Predator's Patience", color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Patient focus grants accuracy and execute damage on wounded prey.',
    effect: '+5% acc, enemies <40% HP take +15% damage.',
    scaling: '+0.05% acc per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'accuracy', value: 5, isPercentage: true, scaling: 0.05 }, job2ClassReq: 'hunter' },

  j2_wasteland_ambush: { id: 'j2_wasteland_ambush', name: 'Wasteland Ambush', color: 'gold', cooldown: 23, isPassive: false, isDecree: false,
    description: 'Vanish into the wastes and strike with a guaranteed critical.',
    effect: 'Vanish then 250% ranged guaranteed crit.',
    scaling: '+1.0% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 70, duration: 0, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 250, isPercentage: true, scaling: 1.0 }, job2ClassReq: 'hunter' },

  // --- BOMBARDIER (6) ---
  j2_cluster_charge: { id: 'j2_cluster_charge', name: 'Cluster Charge', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Lob a cluster charge that explodes with splash damage.',
    effect: '80% blast to target, 50% splash to adjacent.',
    scaling: '+0.4% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 35, duration: 0, mechanicalEffect: { type: 'damage', stat: 'blastAttack', value: 80, isPercentage: true, scaling: 0.4 }, job2ClassReq: 'bombardier' },

  j2_minefield: { id: 'j2_minefield', name: 'Minefield', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Deploy three mines that detonate over successive turns.',
    effect: '3 mines at 70% blast each over 3 turns.',
    scaling: '+0.7% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 49, duration: 3, mechanicalEffect: { type: 'damage', stat: 'blastAttack', value: 210, isPercentage: true, scaling: 0.7 }, job2ClassReq: 'bombardier' },

  j2_concussive_barrage: { id: 'j2_concussive_barrage', name: 'Concussive Barrage', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Rain concussive shells that stun and disorient.',
    effect: '3 shells 40% each, 20% stun, -15% acc.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 56, duration: 2, mechanicalEffect: { type: 'debuff', stat: 'accuracy', value: 15, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'bombardier' },

  j2_scorched_earth: { id: 'j2_scorched_earth', name: 'Scorched Earth', color: 'gold', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Set the battlefield ablaze, burning all enemies over time.',
    effect: 'All enemies burn 3% HP/turn 4 turns, -10% evasion.',
    scaling: '+0.15% burn per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 42, duration: 4, mechanicalEffect: { type: 'dot', stat: 'burnDot', value: 3, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'bombardier' },

  j2_blast_radius: { id: 'j2_blast_radius', name: 'Blast Radius', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Expertise with explosives increases blast power and splash.',
    effect: '+10% blast, AoE +15% splash.',
    scaling: '+0.1% blast per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'blastAttack', value: 10, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'bombardier' },

  j2_carpet_annihilation: { id: 'j2_carpet_annihilation', name: 'Carpet Annihilation', color: 'gold', cooldown: 26, isPassive: false, isDecree: false,
    description: 'Blanket the entire battlefield with explosives over two turns.',
    effect: '120% blast ALL enemies 2 turns.',
    scaling: '+1.0% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 88, duration: 2, mechanicalEffect: { type: 'damage', stat: 'blastAttack', value: 240, isPercentage: true, scaling: 1.0 }, job2ClassReq: 'bombardier' },

  // --- ARSONIST (6) ---
  j2_flame_jet: { id: 'j2_flame_jet', name: 'Flame Jet', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Spray a jet of flame that burns multiple enemies.',
    effect: '70% blast to 3 enemies + burn 4% HP/turn 3 turns.',
    scaling: '+0.2% burn per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 3, mechanicalEffect: { type: 'dot', stat: 'burnDot', value: 4, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'arsonist' },

  j2_wildfire_spread: { id: 'j2_wildfire_spread', name: 'Wildfire Spread', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Spread existing burns to all enemies, refreshing duration.',
    effect: 'Spread burn to all enemies, refresh duration.',
    scaling: '+0.15% burn per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'dot', stat: 'burnDot', value: 3, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'arsonist' },

  j2_panic_blaze: { id: 'j2_panic_blaze', name: 'Panic Blaze', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Engulf the target in panic-inducing flames.',
    effect: '5% burn + Panic: -25% acc, -15% def.',
    scaling: '+0.15% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 49, duration: 3, mechanicalEffect: { type: 'debuff', stat: 'accuracy', value: 25, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'arsonist' },

  j2_heat_shield: { id: 'j2_heat_shield', name: 'Heat Shield', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Create a heat barrier that burns melee attackers.',
    effect: 'Barrier 12% HP, melee attackers take 8% blast.',
    scaling: '+0.15% shield per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 35, duration: 3, mechanicalEffect: { type: 'shield', stat: 'maxHp', value: 12, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'arsonist' },

  j2_pyromaniac: { id: 'j2_pyromaniac', name: 'Pyromaniac', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Obsession with fire enhances burn damage and rewards kills.',
    effect: '+5% burn DoT, kill on burning = +10% blast 2 turns.',
    scaling: '+0.05% burn per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'burnDot', value: 5, isPercentage: true, scaling: 0.05 }, job2ClassReq: 'arsonist' },

  j2_conflagration: { id: 'j2_conflagration', name: 'Conflagration', color: 'gold', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Engulf the entire battlefield in an inferno.',
    effect: 'All enemies: 60% blast + burn 6% HP/turn 4 turns.',
    scaling: '+0.3% burn per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 84, duration: 4, mechanicalEffect: { type: 'dot', stat: 'burnDot', value: 6, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'arsonist' },

  // --- CHEMIST (6) ---
  j2_acid_flask: { id: 'j2_acid_flask', name: 'Acid Flask', color: 'gold', cooldown: 11, isPassive: false, isDecree: false,
    description: 'Hurl a flask of corrosive acid that eats through armor.',
    effect: '80% blast + corrosion -10% def/turn 3 turns.',
    scaling: '+0.15% corrosion per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 3, mechanicalEffect: { type: 'dot', stat: 'poisonDot', value: 3, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'chemist' },

  j2_smoke_canister: { id: 'j2_smoke_canister', name: 'Smoke Canister', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Deploy a smoke canister that blinds enemies and covers allies.',
    effect: 'All enemies -25% acc 3 turns, allies +10% evasion.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 35, duration: 3, mechanicalEffect: { type: 'debuff', stat: 'accuracy', value: 25, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'chemist' },

  j2_neurotoxin_vial: { id: 'j2_neurotoxin_vial', name: 'Neurotoxin Vial', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Inject a potent neurotoxin that slows and weakens.',
    effect: 'Poison 3% HP/turn + -20% Turn Speed, -15% crit.',
    scaling: '+0.1% debuff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'debuff', stat: 'turnSpeed', value: 20, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'chemist' },

  j2_volatile_mixture: { id: 'j2_volatile_mixture', name: 'Volatile Mixture', color: 'gold', cooldown: 18, isPassive: false, isDecree: false,
    description: 'Hurl an unstable concoction that detonates active DoTs.',
    effect: '150% blast, detonates DoTs on target.',
    scaling: '+0.6% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 56, duration: 0, mechanicalEffect: { type: 'damage', stat: 'blastAttack', value: 150, isPercentage: true, scaling: 0.6 }, job2ClassReq: 'chemist' },

  j2_chemical_expertise: { id: 'j2_chemical_expertise', name: 'Chemical Expertise', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Mastery of chemicals enhances DoT damage and debuff duration.',
    effect: '+10% DoT dmg, debuffs +1 turn.',
    scaling: '+0.1% DoT per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'poisonDot', value: 10, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'chemist' },

  j2_plague_bomb: { id: 'j2_plague_bomb', name: 'Plague Bomb', color: 'gold', cooldown: 23, isPassive: false, isDecree: false,
    description: 'Unleash a plague bomb that poisons all enemies.',
    effect: 'All enemies: 50% blast + poison 4% HP/turn 4 turns.',
    scaling: '+0.2% poison per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 77, duration: 4, mechanicalEffect: { type: 'dot', stat: 'poisonDot', value: 4, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'chemist' },

  // --- MEDIC (6) ---
  j2_triage: { id: 'j2_triage', name: 'Triage', color: 'gold', cooldown: 9, isPassive: false, isDecree: false,
    description: 'Emergency healing on the most wounded ally.',
    effect: 'Heal lowest-HP ally 20% max HP (30% if <30%).',
    scaling: '+0.3% heal per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 28, duration: 0, mechanicalEffect: { type: 'heal', stat: 'maxHp', value: 20, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'medic' },

  j2_purify: { id: 'j2_purify', name: 'Purify', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Cleanse an ally of all debuffs and restore health.',
    effect: 'Remove debuffs + 10% HP + +10% status resist.',
    scaling: '+0.15% heal per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 35, duration: 0, mechanicalEffect: { type: 'heal', stat: 'maxHp', value: 10, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'medic' },

  j2_resuscitate: { id: 'j2_resuscitate', name: 'Resuscitate', color: 'gold', cooldown: 99, isPassive: false, isDecree: false,
    description: 'Revive a knocked-out ally back into the fight. Once per battle.',
    effect: "Revive KO'd ally at 25% HP. Once per fight.",
    scaling: '+0.2% revive HP per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 63, duration: 0, mechanicalEffect: { type: 'heal', stat: 'maxHp', value: 25, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'medic' },

  j2_field_dressing: { id: 'j2_field_dressing', name: 'Field Dressing', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Apply a field dressing that heals over time with regen.',
    effect: 'HoT +5% HP/turn 4 turns + +2 regen.',
    scaling: '+0.2% heal per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 35, duration: 4, mechanicalEffect: { type: 'heal', stat: 'hpRegen', value: 5, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'medic' },

  j2_medical_mastery: { id: 'j2_medical_mastery', name: 'Medical Mastery', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Deep medical knowledge enhances all healing, especially on critical patients.',
    effect: '+10% healing, heals on <25% HP +15%.',
    scaling: '+0.1% heal per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'hpRegen', value: 10, isPercentage: true, scaling: 0.1 }, job2ClassReq: 'medic' },

  j2_miracle_drug: { id: 'j2_miracle_drug', name: 'Miracle Drug', color: 'gold', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Administer a powerful drug that heals and empowers all allies.',
    effect: 'All allies: 15% HP + remove debuffs + +10% stats 2 turns.',
    scaling: '+0.3% heal per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 84, duration: 2, mechanicalEffect: { type: 'heal', stat: 'maxHp', value: 15, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'medic' },

  // --- TACTICIAN (6) ---
  j2_rally_standard: { id: 'j2_rally_standard', name: 'Rally Standard', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Raise the rally standard to boost all allies.',
    effect: 'All allies +10% attack, +5% def 3 turns.',
    scaling: '+0.15% buff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 35, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 10, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'tactician' },

  j2_defensive_formation: { id: 'j2_defensive_formation', name: 'Defensive Formation', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Order allies into a defensive formation for increased protection.',
    effect: 'All allies +15% def, +10% block.',
    scaling: '+0.2% def per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'buff', stat: 'defense', value: 15, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'tactician' },

  j2_war_cry: { id: 'j2_war_cry', name: 'War Cry', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'A thunderous war cry that emboldens allies to strike true.',
    effect: 'All allies +15% crit chance, +10% crit dmg 2 turns.',
    scaling: '+0.15% crit per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 49, duration: 2, mechanicalEffect: { type: 'buff', stat: 'critChance', value: 15, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'tactician' },

  j2_coordinated_assault: { id: 'j2_coordinated_assault', name: 'Coordinated Assault', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Mark an enemy for coordinated focus fire.',
    effect: 'Mark enemy: allies deal +25% dmg 3 turns.',
    scaling: '+0.2% buff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 25, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'tactician' },

  j2_inspiring_presence: { id: 'j2_inspiring_presence', name: 'Inspiring Presence', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Your mere presence inspires allies to fight harder.',
    effect: '+5% all stats for allies, +3% def per ally.',
    scaling: '+0.05% stats per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'defense', value: 5, isPercentage: true, scaling: 0.05 }, job2ClassReq: 'tactician' },

  j2_supreme_command: { id: 'j2_supreme_command', name: 'Supreme Command', color: 'gold', cooldown: 26, isPassive: false, isDecree: false,
    description: 'Issue a supreme command that massively empowers all allies.',
    effect: 'All allies: +20% atk, +15% def, +10% crit, +10 Turn Speed 3 turns.',
    scaling: '+0.3% buff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 88, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 20, isPercentage: true, scaling: 0.3 }, job2ClassReq: 'tactician' },

  // --- ENGINEER (6) ---
  j2_deploy_turret: { id: 'j2_deploy_turret', name: 'Deploy Turret', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Deploy an automated turret that fires each turn.',
    effect: 'Turret fires 50% ranged/turn 4 turns.',
    scaling: '+0.5% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 1 }],
    spCost: 35, duration: 4, mechanicalEffect: { type: 'damage', stat: 'rangedAttack', value: 200, isPercentage: true, scaling: 0.5 }, job2ClassReq: 'engineer' },

  j2_energy_barrier: { id: 'j2_energy_barrier', name: 'Energy Barrier', color: 'gold', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Project an energy barrier on an ally that reflects damage.',
    effect: 'Ally barrier 20% HP 3 turns, reflects 10%.',
    scaling: '+0.2% shield per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 5 }],
    spCost: 35, duration: 3, mechanicalEffect: { type: 'shield', stat: 'maxHp', value: 20, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'engineer' },

  j2_repair_drone: { id: 'j2_repair_drone', name: 'Repair Drone', color: 'gold', cooldown: 14, isPassive: false, isDecree: false,
    description: 'Deploy a repair drone that heals the most damaged ally.',
    effect: 'Drone heals lowest-HP ally 8% HP/turn 3 turns.',
    scaling: '+0.15% heal per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 10 }],
    spCost: 42, duration: 3, mechanicalEffect: { type: 'heal', stat: 'maxHp', value: 8, isPercentage: true, scaling: 0.15 }, job2ClassReq: 'engineer' },

  j2_overclock: { id: 'j2_overclock', name: 'Overclock', color: 'gold', cooldown: 16, isPassive: false, isDecree: false,
    description: 'Overclock an ally to dramatically boost their combat output.',
    effect: 'One ally: +20% atk, +15 Turn Speed, +10% crit 3 turns.',
    scaling: '+0.2% buff per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 20 }],
    spCost: 49, duration: 3, mechanicalEffect: { type: 'buff', stat: 'meleeAttack', value: 20, isPercentage: true, scaling: 0.2 }, job2ClassReq: 'engineer' },

  j2_adaptive_plating: { id: 'j2_adaptive_plating', name: 'Adaptive Plating', color: 'gold', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Adaptive plating enhances defenses, shields, and deployables.',
    effect: '+5% def, shields +15% durability, turrets +10%.',
    scaling: '+0.05% def per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 30 }],
    spCost: 0, duration: 0, mechanicalEffect: { type: 'passive_stat', stat: 'defense', value: 5, isPercentage: true, scaling: 0.05 }, job2ClassReq: 'engineer' },

  j2_siege_platform: { id: 'j2_siege_platform', name: 'Siege Platform', color: 'gold', cooldown: 25, isPassive: false, isDecree: false,
    description: 'Deploy a heavy siege platform that bombards all enemies.',
    effect: 'Heavy platform fires 70% blast all enemies/turn 3 turns.',
    scaling: '+0.8% damage per RES', source: 'Job2 Advancement',
    requirements: [{ stat: 'res', value: 40 }],
    spCost: 84, duration: 3, mechanicalEffect: { type: 'damage', stat: 'blastAttack', value: 210, isPercentage: true, scaling: 0.8 }, job2ClassReq: 'engineer' },
};

export const ABILITY_LIST = Object.values(ABILITIES);
export const RED_ABILITIES = ABILITY_LIST.filter(a => a.color === 'red');
export const GREEN_ABILITIES = ABILITY_LIST.filter(a => a.color === 'green');
export const BLUE_ABILITIES = ABILITY_LIST.filter(a => a.color === 'blue');
export const ORANGE_ABILITIES = ABILITY_LIST.filter(a => a.color === 'orange');
export const PURPLE_ABILITIES = ABILITY_LIST.filter(a => a.color === 'purple');
export const GOLD_ABILITIES = ABILITY_LIST.filter(a => a.color === 'gold');

export function getAbilityById(id: string): AbilityTome | undefined {
  return ABILITIES[id];
}

export function getAbilitiesByColor(color: AbilityColor): AbilityTome[] {
  return ABILITY_LIST.filter(a => a.color === color);
}
