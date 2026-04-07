/**
 * Ability Tome System
 *
 * 65 total abilities across 5 color-coded categories:
 * - Red (13): Melee combat abilities, RES required
 * - Green (13): Ranged combat abilities, RES required
 * - Blue (13): Demolitions/tech abilities, RES required
 * - Orange (13): Passive abilities, RES required
 * - Purple (13): Special/Warband Decree abilities, RES + secondary stat required
 *
 * Heroes equip these into their 4 ability slots (gated by RES thresholds).
 * Purple abilities go into the Decree slot (RES 50+, 1 per party).
 */

export type AbilityColor = 'red' | 'green' | 'blue' | 'orange' | 'purple';

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
}

export const ABILITY_COLOR_LABELS: Record<AbilityColor, string> = {
  red: 'Crimson Tome',
  green: 'Verdant Tome',
  blue: 'Cobalt Tome',
  orange: 'Amber Tome',
  purple: 'Violet Decree',
};

export const ABILITY_COLOR_HEX: Record<AbilityColor, string> = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  orange: '#f97316',
  purple: '#a855f7',
};

export const ABILITIES: Record<string, AbilityTome> = {
  // =====================================================================
  // RED TOMES (13) - Melee Combat - RES required only
  // =====================================================================
  r_crushing_blow: { id: 'r_crushing_blow', name: 'Crushing Blow', color: 'red', cooldown: 2, isPassive: false, isDecree: false,
    description: 'A devastating overhead strike that staggers the enemy.',
    effect: 'Deal 140% melee damage. 20% chance to stun for 1 turn.',
    scaling: '+2% damage per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  r_rending_slash: { id: 'r_rending_slash', name: 'Rending Slash', color: 'red', cooldown: 1, isPassive: false, isDecree: false,
    description: 'A fast slashing attack that leaves a bleeding wound.',
    effect: 'Deal 110% melee damage. Apply bleed: 3% dmg/turn for 3 turns.',
    scaling: '+1% bleed per 10 RES', source: 'Zone 1+ drops',
    requirements: [{ stat: 'res', value: 1 }] },

  r_shield_breaker: { id: 'r_shield_breaker', name: 'Shield Breaker', color: 'red', cooldown: 3, isPassive: false, isDecree: false,
    description: 'Smash through enemy defenses with raw force.',
    effect: 'Deal 120% melee damage. Ignore 30% of target defense.',
    scaling: '+1% armor pen per 5 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }] },

  r_double_strike: { id: 'r_double_strike', name: 'Double Strike', color: 'red', cooldown: 2, isPassive: false, isDecree: false,
    description: 'Attack twice in rapid succession.',
    effect: 'Deal 75% melee damage twice.',
    scaling: '+1% each hit per 5 RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 5 }] },

  r_battle_cry: { id: 'r_battle_cry', name: 'Battle Cry', color: 'red', cooldown: 5, isPassive: false, isDecree: false,
    description: 'A rallying war cry that boosts your combat prowess.',
    effect: 'Self: +20% melee damage and +10% defense for 3 turns.',
    scaling: '+0.5% per RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 15 }] },

  r_whirlwind_strike: { id: 'r_whirlwind_strike', name: 'Whirlwind Strike', color: 'red', cooldown: 5, isPassive: false, isDecree: false,
    description: 'Spin in a deadly arc, hitting all nearby enemies.',
    effect: 'Deal 70% melee damage to ALL enemies.',
    scaling: '+2% per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 20 }] },

  r_execution: { id: 'r_execution', name: 'Execution', color: 'red', cooldown: 6, isPassive: false, isDecree: false,
    description: 'A finishing blow against weakened foes.',
    effect: 'Deal 150% melee damage. If target <25% HP, deal 350% instead.',
    scaling: 'Execute threshold +0.5% per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 30 }] },

  r_iron_fortress: { id: 'r_iron_fortress', name: 'Iron Fortress', color: 'red', cooldown: 5, isPassive: false, isDecree: false,
    description: 'Harden your body into an immovable wall.',
    effect: 'Self: +30% defense, reflect 15% melee damage for 3 turns.',
    scaling: '+1% reflect per 10 RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 25 }] },

  r_berserker_rush: { id: 'r_berserker_rush', name: 'Berserker Rush', color: 'red', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Sacrifice defense for overwhelming offense.',
    effect: 'Attack 3 times at 55% damage each. Self: -15% defense for 2 turns.',
    scaling: '+1% each hit per 5 RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 40 }] },

  r_titan_strike: { id: 'r_titan_strike', name: 'Titan Strike', color: 'red', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Channel immense power into a single devastating blow.',
    effect: 'Deal 250% melee damage. Ignore 25% defense.',
    scaling: '+3% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 45 }] },

  r_blood_fury: { id: 'r_blood_fury', name: 'Blood Fury', color: 'red', cooldown: 6, isPassive: false, isDecree: false,
    description: 'Enter a blood-fueled rage, gaining power with each hit.',
    effect: 'For 3 turns: +40% melee damage, +15% crit, -20% defense.',
    scaling: '+1% damage bonus per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }] },

  r_annihilate: { id: 'r_annihilate', name: 'Annihilate', color: 'red', cooldown: 8, isPassive: false, isDecree: false,
    description: 'The ultimate melee technique. Obliterate a single target.',
    effect: 'Deal 400% melee damage. 50% armor penetration.',
    scaling: '+5% per RES', source: 'Zone 7 boss',
    requirements: [{ stat: 'res', value: 70 }] },

  r_undying_rage: { id: 'r_undying_rage', name: 'Undying Rage', color: 'red', cooldown: 0, isPassive: false, isDecree: false,
    description: 'Defy death itself through sheer willpower.',
    effect: 'Once per fight: survive lethal hit with 1 HP, +100% damage for 2 turns.',
    scaling: 'Duration +1 turn at RES 80+', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 80 }] },

  // =====================================================================
  // GREEN TOMES (13) - Ranged Combat - RES required only
  // =====================================================================
  g_quick_shot: { id: 'g_quick_shot', name: 'Quick Shot', color: 'green', cooldown: 1, isPassive: false, isDecree: false,
    description: 'Fire a rapid shot. The fastest attack in the wasteland.',
    effect: 'Deal 95% ranged damage. Fastest cooldown.',
    scaling: '+1% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  g_aimed_shot: { id: 'g_aimed_shot', name: 'Aimed Shot', color: 'green', cooldown: 2, isPassive: false, isDecree: false,
    description: 'Take careful aim for a precise, powerful shot.',
    effect: 'Deal 140% ranged damage. +20% accuracy. Cannot miss.',
    scaling: '+2% damage per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  g_double_tap: { id: 'g_double_tap', name: 'Double Tap', color: 'green', cooldown: 2, isPassive: false, isDecree: false,
    description: 'Fire two shots in quick succession.',
    effect: 'Deal 70% ranged damage twice.',
    scaling: '+1% each per 5 RES', source: 'Zone 1+ drops',
    requirements: [{ stat: 'res', value: 5 }] },

  g_crippling_shot: { id: 'g_crippling_shot', name: 'Crippling Shot', color: 'green', cooldown: 3, isPassive: false, isDecree: false,
    description: 'Target an enemy limb to slow their movements.',
    effect: 'Deal 100% ranged damage. Target: -15 Turn Speed for 2 turns.',
    scaling: '+1 speed reduction per 10 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }] },

  g_piercing_arrow: { id: 'g_piercing_arrow', name: 'Piercing Arrow', color: 'green', cooldown: 3, isPassive: false, isDecree: false,
    description: 'Fire an armor-piercing projectile.',
    effect: 'Deal 130% ranged damage. Ignore 20% defense.',
    scaling: '+1% armor pen per 5 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 15 }] },

  g_triple_strafe: { id: 'g_triple_strafe', name: 'Triple Strafe', color: 'green', cooldown: 3, isPassive: false, isDecree: false,
    description: 'Unleash three arrows in a devastating fan pattern.',
    effect: 'Fire 3 shots at 55% ranged damage each.',
    scaling: '+1% each per 5 RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 20 }] },

  g_headshot: { id: 'g_headshot', name: 'Headshot', color: 'green', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Aim for the head. Devastating if you land a critical.',
    effect: 'Guaranteed crit. +50% crit damage bonus on this attack.',
    scaling: '+2% crit dmg per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 25 }] },

  g_smoke_retreat: { id: 'g_smoke_retreat', name: 'Smoke Retreat', color: 'green', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Deploy a smoke bomb and reposition for advantage.',
    effect: 'Self: +30% Evasion for 2 turns. Next attack +25% damage.',
    scaling: '+1% evasion per 10 RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }] },

  g_barrage: { id: 'g_barrage', name: 'Barrage', color: 'green', cooldown: 5, isPassive: false, isDecree: false,
    description: 'Unleash a hail of projectiles at random enemies.',
    effect: 'Fire 5 shots at 40% damage each at random targets.',
    scaling: '+1% each per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 35 }] },

  g_snipers_mark: { id: 'g_snipers_mark', name: "Sniper's Mark", color: 'green', cooldown: 5, isPassive: false, isDecree: false,
    description: 'Mark a high-value target for coordinated attacks.',
    effect: 'Mark 1 enemy for 4 turns. All attacks +20% crit, +15% accuracy.',
    scaling: '+1% crit per 10 RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 40 }] },

  g_kill_confirm: { id: 'g_kill_confirm', name: 'Kill Confirm', color: 'green', cooldown: 6, isPassive: false, isDecree: false,
    description: 'Execute a precise finishing shot on a weakened target.',
    effect: 'Deal 200% ranged damage. If target <30% HP, deal 450%.',
    scaling: '+5% per RES on execute', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 50 }] },

  g_ghost_walk: { id: 'g_ghost_walk', name: 'Ghost Walk', color: 'green', cooldown: 6, isPassive: false, isDecree: false,
    description: 'Become invisible briefly. Next attack strikes from the shadows.',
    effect: 'Untargetable 1 turn. Next attack: guaranteed crit +60% damage.',
    scaling: '+3% dmg per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 60 }] },

  g_oblivion_volley: { id: 'g_oblivion_volley', name: 'Oblivion Volley', color: 'green', cooldown: 10, isPassive: false, isDecree: false,
    description: 'Rain death from above upon all enemies.',
    effect: 'Deal 250% ranged damage to ALL enemies. Each hit: 30% crit chance.',
    scaling: '+5% per RES', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 80 }] },

  // =====================================================================
  // BLUE TOMES (13) - Demolitions/Tech - RES required only
  // =====================================================================
  b_firebomb: { id: 'b_firebomb', name: 'Firebomb', color: 'blue', cooldown: 2, isPassive: false, isDecree: false,
    description: 'Hurl an incendiary device that sets enemies ablaze.',
    effect: 'Deal 120% blast damage. 25% chance: burn 5 dmg/turn for 2 turns.',
    scaling: '+2% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  b_frag_toss: { id: 'b_frag_toss', name: 'Frag Toss', color: 'blue', cooldown: 2, isPassive: false, isDecree: false,
    description: 'Throw fragmentation that sprays shrapnel in an area.',
    effect: 'Deal 100% blast to target + 45% to 1 adjacent enemy.',
    scaling: '+1.5% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  b_concussion_grenade: { id: 'b_concussion_grenade', name: 'Concussion Grenade', color: 'blue', cooldown: 3, isPassive: false, isDecree: false,
    description: 'A flashbang that disorients and stuns enemies.',
    effect: 'Deal 90% blast damage. 30% chance stun for 1 turn.',
    scaling: '+1% stun chance per 5 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }] },

  b_smoke_bomb: { id: 'b_smoke_bomb', name: 'Smoke Bomb', color: 'blue', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Deploy a thick smoke screen that blinds all enemies.',
    effect: 'All enemies: -25% accuracy for 2 turns.',
    scaling: '+1% per 10 RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }] },

  b_trip_mine: { id: 'b_trip_mine', name: 'Trip Mine', color: 'blue', cooldown: 3, isPassive: false, isDecree: false,
    description: 'Plant an invisible mine that detonates when triggered.',
    effect: 'Next enemy that acts takes 140% blast damage.',
    scaling: '+2% per RES', source: 'Zone 2+ boss',
    requirements: [{ stat: 'res', value: 15 }] },

  b_napalm_flask: { id: 'b_napalm_flask', name: 'Napalm Flask', color: 'blue', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Throw a canister of sticky fire that burns persistently.',
    effect: 'Deal 80% blast damage. Burn: 10 dmg/turn for 4 turns.',
    scaling: '+1 burn per 5 RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }] },

  b_cluster_bomb: { id: 'b_cluster_bomb', name: 'Cluster Bomb', color: 'blue', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Scatter multiple explosive charges across the battlefield.',
    effect: 'Deal 75% blast damage to ALL enemies.',
    scaling: '+2% per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 25 }] },

  b_emp_blast: { id: 'b_emp_blast', name: 'EMP Blast', color: 'blue', cooldown: 5, isPassive: false, isDecree: false,
    description: 'Emit an electromagnetic pulse that disrupts all technology.',
    effect: 'Deal 60% blast to all. Remove 1 buff from each enemy. Tech armor +25%.',
    scaling: '+2% per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 30 }] },

  b_toxic_cloud: { id: 'b_toxic_cloud', name: 'Toxic Cloud', color: 'blue', cooldown: 5, isPassive: false, isDecree: false,
    description: 'Release a cloud of corrosive gas that eats through armor.',
    effect: 'Deal 50% blast to all. Poison: 8 dmg/turn 3 turns. -10% enemy accuracy.',
    scaling: '+1 poison per 5 RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 35 }] },

  b_plasma_lance: { id: 'b_plasma_lance', name: 'Plasma Lance', color: 'blue', cooldown: 4, isPassive: false, isDecree: false,
    description: 'Fire a concentrated beam of superheated plasma.',
    effect: 'Deal 200% blast damage. Ignore 25% defense.',
    scaling: '+4% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 45 }] },

  b_radiation_burst: { id: 'b_radiation_burst', name: 'Radiation Burst', color: 'blue', cooldown: 6, isPassive: false, isDecree: false,
    description: 'Release a wave of lethal radiation.',
    effect: 'Deal 100% blast to all. Radiation: 15 dmg/turn 4 turns. -20% healing.',
    scaling: '+2 rad dmg per 5 RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }] },

  b_carpet_bomb: { id: 'b_carpet_bomb', name: 'Carpet Bomb', color: 'blue', cooldown: 7, isPassive: false, isDecree: false,
    description: 'Saturate the entire area with explosives.',
    effect: 'Deal 140% blast to ALL enemies over 2 turns. Self-damage: 6%.',
    scaling: '+3% per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 60 }] },

  b_singularity: { id: 'b_singularity', name: 'Singularity', color: 'blue', cooldown: 12, isPassive: false, isDecree: false,
    description: 'Create a localized gravitational collapse. The ultimate weapon.',
    effect: 'Deal 450% blast to 1 target, 180% to adjacent. Self-damage: 12%. Self-stun 1 turn.',
    scaling: '+8% per RES', source: 'Zone 7 final boss',
    requirements: [{ stat: 'res', value: 80 }] },

  // =====================================================================
  // ORANGE TOMES (13) - Passive Abilities - RES required only
  // =====================================================================
  o_thick_skin: { id: 'o_thick_skin', name: 'Thick Skin', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Hardened wasteland survivor. Takes less damage passively.',
    effect: '+5% Damage Reduction permanently.',
    scaling: '+0.1% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  o_scavengers_luck: { id: 'o_scavengers_luck', name: "Scavenger's Luck", color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Fortune favors the bold. Better loot from all sources.',
    effect: '+5% rare drop chance.',
    scaling: '+0.1% per RES', source: 'Zone 1+ drops, Vendor',
    requirements: [{ stat: 'res', value: 1 }] },

  o_quick_reflexes: { id: 'o_quick_reflexes', name: 'Quick Reflexes', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Enhanced reaction time from surviving the wastes.',
    effect: '+5 Turn Speed permanently.',
    scaling: '+0.2 per RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }] },

  o_keen_eyes: { id: 'o_keen_eyes', name: 'Keen Eyes', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Sharp vision honed by years of wasteland vigilance.',
    effect: '+5% Accuracy permanently.',
    scaling: '+0.1% per RES', source: 'Zone 2+ drops',
    requirements: [{ stat: 'res', value: 10 }] },

  o_regeneration: { id: 'o_regeneration', name: 'Regeneration', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Enhanced cellular repair from mutation exposure.',
    effect: '+2 HP Regen per turn permanently.',
    scaling: '+0.1 per RES', source: 'Zone 3+ drops',
    requirements: [{ stat: 'res', value: 20 }] },

  o_critical_mastery: { id: 'o_critical_mastery', name: 'Critical Mastery', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Expert knowledge of enemy weak points.',
    effect: '+5% Critical Chance permanently.',
    scaling: '+0.1% per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 20 }] },

  o_last_breath: { id: 'o_last_breath', name: 'Last Breath', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'The will to survive when everything goes wrong.',
    effect: 'Once per fight: survive lethal hit with 10% HP.',
    scaling: '+1% survive HP per 10 RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 30 }] },

  o_bloodthirst: { id: 'o_bloodthirst', name: 'Bloodthirst', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Heal from the damage you inflict.',
    effect: 'Lifesteal: heal 3% of damage dealt.',
    scaling: '+0.1% per RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 30 }] },

  o_iron_will: { id: 'o_iron_will', name: 'Iron Will', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Unshakeable mental fortitude against status effects.',
    effect: '+10% Status Resistance permanently.',
    scaling: '+0.2% per RES', source: 'Zone 4+ drops',
    requirements: [{ stat: 'res', value: 35 }] },

  o_precision_strikes: { id: 'o_precision_strikes', name: 'Precision Strikes', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Every hit counts. Increased critical damage.',
    effect: '+15% Critical Damage permanently.',
    scaling: '+0.3% per RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 45 }] },

  o_combat_veteran: { id: 'o_combat_veteran', name: 'Combat Veteran', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Battle-hardened survivor. More XP from all combat.',
    effect: '+10% combat XP gain permanently.',
    scaling: '+0.2% per RES', source: 'Zone 5+ drops',
    requirements: [{ stat: 'res', value: 40 }] },

  o_ghost_protocol: { id: 'o_ghost_protocol', name: 'Ghost Protocol', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Move like a shadow. Harder to hit, faster to strike.',
    effect: '+8% Evasion, +5 Turn Speed permanently.',
    scaling: '+0.1% evasion per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 55 }] },

  o_apex_predator: { id: 'o_apex_predator', name: 'Apex Predator', color: 'orange', cooldown: 0, isPassive: true, isDecree: false,
    description: 'Top of the food chain. All combat stats enhanced.',
    effect: '+5% to ALL attack types, +3% crit, +3% accuracy.',
    scaling: '+0.1% all per RES', source: 'Zone 7 boss',
    requirements: [{ stat: 'res', value: 70 }] },

  // =====================================================================
  // PURPLE TOMES (13) - Warband Decrees - RES + secondary stat required
  // Party-wide buffs, 1 per party, goes in Decree slot
  // Equippable in early-mid game (lower requirements)
  // =====================================================================
  p_decree_fury: { id: 'p_decree_fury', name: 'Wasteland Fury', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your fury ignites the fighting spirit of all allies.',
    effect: 'All party: +8% melee, ranged, and blast attack.',
    scaling: '+0.1% per RES', source: 'Zone 3+ boss, Biochem Lv.40',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'str', value: 15 }] },

  p_decree_resolve: { id: 'p_decree_resolve', name: 'Iron Resolve', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your unwavering determination shields all allies.',
    effect: 'All party: +5% defense, +30 Max HP.',
    scaling: '+0.5 HP per RES', source: 'Zone 2+ boss, Biochem Lv.30',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 20 }] },

  p_decree_instinct: { id: 'p_decree_instinct', name: "Predator's Instinct", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your predatory awareness sharpens the entire squad.',
    effect: 'All party: +5% Crit Chance, +10% Crit Damage.',
    scaling: '+0.1% crit per RES', source: 'Zone 4+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'per', value: 20 }] },

  p_decree_speed: { id: 'p_decree_speed', name: 'Swift Current', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your speed inspires the whole team to move faster.',
    effect: 'All party: +8 Turn Speed, +3% Evasion.',
    scaling: '+0.1 speed per RES', source: 'Zone 3+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'dex', value: 15 }] },

  p_decree_vitality: { id: 'p_decree_vitality', name: 'Vital Pulse', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your life force radiates outward, healing all allies.',
    effect: 'All party: +2 HP Regen/turn, +5% Status Resist.',
    scaling: '+0.05 regen per RES', source: 'Zone 2+ boss, Biochem Lv.35',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 15 }] },

  p_decree_fortune: { id: 'p_decree_fortune', name: "Fortune's Favor", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Luck smiles on you and everyone around you.',
    effect: 'All party: +5% rare drop chance, +3% double loot chance.',
    scaling: '+0.1% per RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'luk', value: 25 }] },

  p_decree_undying: { id: 'p_decree_undying', name: 'Unyielding Spirit', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your willpower keeps the entire squad alive against the odds.',
    effect: 'All party: survive first lethal hit with 1 HP (once per fight per member).',
    scaling: 'Heal % on survive per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 35 }] },

  p_decree_war: { id: 'p_decree_war', name: "Warmonger's Presence", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your bloodlust empowers the squad to finish wounded enemies.',
    effect: 'All party: +10% damage to enemies below 50% HP.',
    scaling: '+0.15% per RES', source: 'Zone 5+ boss, Biochem Lv.70',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'str', value: 25 }] },

  p_decree_null: { id: 'p_decree_null', name: 'Nullification Field', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Project a field that negates the first incoming debuff.',
    effect: 'All party: immune to first debuff each fight.',
    scaling: 'Duration per RES', source: 'Zone 6+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'int', value: 30 }] },

  p_decree_cataclysm: { id: 'p_decree_cataclysm', name: 'Decree of the Cataclysm', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Channel the power of the apocalypse itself.',
    effect: 'All party: +5% to ALL stats.',
    scaling: '+0.08% per RES', source: 'Zone 7 final boss only',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'str', value: 20 }, { stat: 'int', value: 20 }] },

  p_decree_harvest: { id: 'p_decree_harvest', name: 'Bountiful Harvest', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your presence boosts all resource gathering and production.',
    effect: 'All party: +15% gathering yield, +10% production speed.',
    scaling: '+0.2% yield per RES', source: 'Zone 4+ boss, Biochem Lv.50',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'luk', value: 15 }] },

  p_decree_accuracy: { id: 'p_decree_accuracy', name: "Hawk's Dominion", color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your piercing gaze guides every shot your allies take.',
    effect: 'All party: +8% Accuracy, +5% Armor Penetration.',
    scaling: '+0.1% acc per RES', source: 'Zone 5+ boss',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'per', value: 25 }] },

  p_decree_shield: { id: 'p_decree_shield', name: 'Bulwark Command', color: 'purple', cooldown: 0, isPassive: true, isDecree: true,
    description: 'Your defensive stance hardens the entire squad.',
    effect: 'All party: +8% Defense, +5% Damage Reduction.',
    scaling: '+0.1% def per RES', source: 'Zone 5+ boss, Biochem Lv.60',
    requirements: [{ stat: 'res', value: 50 }, { stat: 'con', value: 25 }] },
};

export const ABILITY_LIST = Object.values(ABILITIES);
export const RED_ABILITIES = ABILITY_LIST.filter(a => a.color === 'red');
export const GREEN_ABILITIES = ABILITY_LIST.filter(a => a.color === 'green');
export const BLUE_ABILITIES = ABILITY_LIST.filter(a => a.color === 'blue');
export const ORANGE_ABILITIES = ABILITY_LIST.filter(a => a.color === 'orange');
export const PURPLE_ABILITIES = ABILITY_LIST.filter(a => a.color === 'purple');

export function getAbilityById(id: string): AbilityTome | undefined {
  return ABILITIES[id];
}

export function getAbilitiesByColor(color: AbilityColor): AbilityTome[] {
  return ABILITY_LIST.filter(a => a.color === color);
}
