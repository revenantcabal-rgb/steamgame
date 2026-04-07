// ──────────────────────────────────────────────
// Starlight Sphere Grid — 7 Paths, 105 Nodes
// ──────────────────────────────────────────────

export interface StarlightNode {
  id: string;
  pathId: string;
  ring: number;       // 1-5 (distance from center, 3 nodes per ring)
  name: string;
  description: string;
  cost: number;       // Icqor Chess Pieces
  effect: { stat: string; value: number; isPercentage: boolean };
  /** Optional second effect for capstone nodes */
  effect2?: { stat: string; value: number; isPercentage: boolean };
  requires: string[]; // prerequisite node IDs (nodes from previous ring)
}

export interface StarlightPath {
  id: string;
  name: string;
  color: string;
  description: string;
}

export const STARLIGHT_PATHS: StarlightPath[] = [
  { id: 'warfare', name: 'Warfare', color: '#e74c3c', description: 'Melee combat mastery. STR-focused with balanced defense.' },
  { id: 'marksmanship', name: 'Marksmanship', color: '#27ae60', description: 'Ranged precision. DEX-focused with high crit.' },
  { id: 'demolitions', name: 'Demolitions', color: '#3498db', description: 'Explosive power. INT-focused with ability scaling.' },
  { id: 'fortification', name: 'Fortification', color: '#f39c12', description: 'Maximum survivability. CON-focused tank path.' },
  { id: 'spirit', name: 'Spirit', color: '#9b59b6', description: 'Ability mastery. RES-focused with SP scaling.' },
  { id: 'survival', name: 'Survival', color: '#1abc9c', description: 'Luck and evasion. Gathering and drop bonuses.' },
  { id: 'industry', name: 'Industry', color: '#e67e22', description: 'Production mastery. Crafting and XP bonuses.' },
];

// ──────────────────────────────────────────────
// All 105 Starlight Nodes (15 per path × 7 paths)
// ──────────────────────────────────────────────

export const STARLIGHT_NODES: StarlightNode[] = [
  // ═══════════════════════════════════════════
  // PATH 1: WARFARE (Melee/STR focus)
  // ═══════════════════════════════════════════
  // Ring 1 — no prerequisites
  { id: 'war_r1_1', pathId: 'warfare', ring: 1, name: 'Iron Fist I', description: '+3 Melee Attack', cost: 1, effect: { stat: 'meleeAttack', value: 3, isPercentage: false }, requires: [] },
  { id: 'war_r1_2', pathId: 'warfare', ring: 1, name: 'Thick Hide I', description: '+5 Max HP', cost: 1, effect: { stat: 'maxHp', value: 5, isPercentage: false }, requires: [] },
  { id: 'war_r1_3', pathId: 'warfare', ring: 1, name: 'Battle Stance', description: '+2% Accuracy', cost: 1, effect: { stat: 'accuracy', value: 2, isPercentage: false }, requires: [] },
  // Ring 2 — requires at least 1 Ring 1 node
  { id: 'war_r2_1', pathId: 'warfare', ring: 2, name: 'Iron Fist II', description: '+5 Melee Attack', cost: 2, effect: { stat: 'meleeAttack', value: 5, isPercentage: false }, requires: ['war_r1_1'] },
  { id: 'war_r2_2', pathId: 'warfare', ring: 2, name: 'Steel Skin', description: '+3 Defense', cost: 2, effect: { stat: 'defense', value: 3, isPercentage: false }, requires: ['war_r1_2'] },
  { id: 'war_r2_3', pathId: 'warfare', ring: 2, name: 'Combat Reflexes', description: '+2% Evasion', cost: 2, effect: { stat: 'evasion', value: 2, isPercentage: false }, requires: ['war_r1_3'] },
  // Ring 3 — requires at least 1 Ring 2 node
  { id: 'war_r3_1', pathId: 'warfare', ring: 3, name: "Warrior's Focus", description: '+3% Crit Chance', cost: 3, effect: { stat: 'critChance', value: 3, isPercentage: false }, requires: ['war_r2_1'] },
  { id: 'war_r3_2', pathId: 'warfare', ring: 3, name: 'Berserker Blood', description: '+5% Melee Attack', cost: 3, effect: { stat: 'meleeAttack', value: 5, isPercentage: true }, requires: ['war_r2_2'] },
  { id: 'war_r3_3', pathId: 'warfare', ring: 3, name: 'Iron Will', description: '+10 Max HP', cost: 3, effect: { stat: 'maxHp', value: 10, isPercentage: false }, requires: ['war_r2_3'] },
  // Ring 4 — requires at least 1 Ring 3 node
  { id: 'war_r4_1', pathId: 'warfare', ring: 4, name: 'Devastating Blow', description: '+8% Crit Damage', cost: 5, effect: { stat: 'critDamage', value: 8, isPercentage: false }, requires: ['war_r3_1'] },
  { id: 'war_r4_2', pathId: 'warfare', ring: 4, name: "Veteran's Guard", description: '+5 Defense', cost: 5, effect: { stat: 'defense', value: 5, isPercentage: false }, requires: ['war_r3_2'] },
  { id: 'war_r4_3', pathId: 'warfare', ring: 4, name: 'Bloodlust', description: '+3% Lifesteal', cost: 5, effect: { stat: 'lifesteal', value: 3, isPercentage: false }, requires: ['war_r3_3'] },
  // Ring 5 — requires at least 1 Ring 4 node
  { id: 'war_r5_1', pathId: 'warfare', ring: 5, name: "Warlord's Might", description: '+10% Melee Attack', cost: 8, effect: { stat: 'meleeAttack', value: 10, isPercentage: true }, requires: ['war_r4_1'] },
  { id: 'war_r5_2', pathId: 'warfare', ring: 5, name: 'Unstoppable Force', description: '+5% Armor Pen', cost: 8, effect: { stat: 'armorPen', value: 5, isPercentage: false }, requires: ['war_r4_2'] },
  { id: 'war_r5_3', pathId: 'warfare', ring: 5, name: 'Champion', description: '+20 Max HP, +5% Melee Attack', cost: 10, effect: { stat: 'maxHp', value: 20, isPercentage: false }, effect2: { stat: 'meleeAttack', value: 5, isPercentage: true }, requires: ['war_r4_3'] },

  // ═══════════════════════════════════════════
  // PATH 2: MARKSMANSHIP (Ranged/DEX focus)
  // ═══════════════════════════════════════════
  // Ring 1
  { id: 'mark_r1_1', pathId: 'marksmanship', ring: 1, name: 'Steady Aim I', description: '+3 Ranged Attack', cost: 1, effect: { stat: 'rangedAttack', value: 3, isPercentage: false }, requires: [] },
  { id: 'mark_r1_2', pathId: 'marksmanship', ring: 1, name: 'Quick Draw I', description: '+3 Turn Speed', cost: 1, effect: { stat: 'turnSpeed', value: 3, isPercentage: false }, requires: [] },
  { id: 'mark_r1_3', pathId: 'marksmanship', ring: 1, name: 'Eagle Eye', description: '+2% Accuracy', cost: 1, effect: { stat: 'accuracy', value: 2, isPercentage: false }, requires: [] },
  // Ring 2
  { id: 'mark_r2_1', pathId: 'marksmanship', ring: 2, name: 'Steady Aim II', description: '+5 Ranged Attack', cost: 2, effect: { stat: 'rangedAttack', value: 5, isPercentage: false }, requires: ['mark_r1_1'] },
  { id: 'mark_r2_2', pathId: 'marksmanship', ring: 2, name: 'Precision', description: '+3% Crit Chance', cost: 2, effect: { stat: 'critChance', value: 3, isPercentage: false }, requires: ['mark_r1_2'] },
  { id: 'mark_r2_3', pathId: 'marksmanship', ring: 2, name: 'Wind Runner', description: '+5 Turn Speed', cost: 2, effect: { stat: 'turnSpeed', value: 5, isPercentage: false }, requires: ['mark_r1_3'] },
  // Ring 3
  { id: 'mark_r3_1', pathId: 'marksmanship', ring: 3, name: 'Lethal Shot', description: '+8% Crit Damage', cost: 3, effect: { stat: 'critDamage', value: 8, isPercentage: false }, requires: ['mark_r2_1'] },
  { id: 'mark_r3_2', pathId: 'marksmanship', ring: 3, name: "Sharpshooter's Eye", description: '+5% Ranged Attack', cost: 3, effect: { stat: 'rangedAttack', value: 5, isPercentage: true }, requires: ['mark_r2_2'] },
  { id: 'mark_r3_3', pathId: 'marksmanship', ring: 3, name: 'Ghost Step', description: '+3% Evasion', cost: 3, effect: { stat: 'evasion', value: 3, isPercentage: false }, requires: ['mark_r2_3'] },
  // Ring 4
  { id: 'mark_r4_1', pathId: 'marksmanship', ring: 4, name: 'Kill Confirm', description: '+5% Ranged Attack', cost: 5, effect: { stat: 'rangedAttack', value: 5, isPercentage: true }, requires: ['mark_r3_1'] },
  { id: 'mark_r4_2', pathId: 'marksmanship', ring: 4, name: "Sniper's Patience", description: '+5% Crit Chance', cost: 5, effect: { stat: 'critChance', value: 5, isPercentage: false }, requires: ['mark_r3_2'] },
  { id: 'mark_r4_3', pathId: 'marksmanship', ring: 4, name: 'Shadow Walk', description: '+5% Evasion', cost: 5, effect: { stat: 'evasion', value: 5, isPercentage: false }, requires: ['mark_r3_3'] },
  // Ring 5
  { id: 'mark_r5_1', pathId: 'marksmanship', ring: 5, name: 'Deadeye', description: '+10% Ranged Attack', cost: 8, effect: { stat: 'rangedAttack', value: 10, isPercentage: true }, requires: ['mark_r4_1'] },
  { id: 'mark_r5_2', pathId: 'marksmanship', ring: 5, name: 'Piercing Rounds', description: '+8% Armor Pen', cost: 8, effect: { stat: 'armorPen', value: 8, isPercentage: false }, requires: ['mark_r4_2'] },
  { id: 'mark_r5_3', pathId: 'marksmanship', ring: 5, name: 'Apex Predator', description: '+10% Crit Damage, +3% Crit Chance', cost: 10, effect: { stat: 'critDamage', value: 10, isPercentage: false }, effect2: { stat: 'critChance', value: 3, isPercentage: false }, requires: ['mark_r4_3'] },

  // ═══════════════════════════════════════════
  // PATH 3: DEMOLITIONS (Blast/INT focus)
  // ═══════════════════════════════════════════
  // Ring 1
  { id: 'demo_r1_1', pathId: 'demolitions', ring: 1, name: 'Volatile Mix I', description: '+3 Blast Attack', cost: 1, effect: { stat: 'blastAttack', value: 3, isPercentage: false }, requires: [] },
  { id: 'demo_r1_2', pathId: 'demolitions', ring: 1, name: 'Quick Fuse', description: '+3 Turn Speed', cost: 1, effect: { stat: 'turnSpeed', value: 3, isPercentage: false }, requires: [] },
  { id: 'demo_r1_3', pathId: 'demolitions', ring: 1, name: 'Blast Shield', description: '+5 Max HP', cost: 1, effect: { stat: 'maxHp', value: 5, isPercentage: false }, requires: [] },
  // Ring 2
  { id: 'demo_r2_1', pathId: 'demolitions', ring: 2, name: 'Volatile Mix II', description: '+5 Blast Attack', cost: 2, effect: { stat: 'blastAttack', value: 5, isPercentage: false }, requires: ['demo_r1_1'] },
  { id: 'demo_r2_2', pathId: 'demolitions', ring: 2, name: 'Spirit Spark', description: '+5 Max SP', cost: 2, effect: { stat: 'maxSp', value: 5, isPercentage: false }, requires: ['demo_r1_2'] },
  { id: 'demo_r2_3', pathId: 'demolitions', ring: 2, name: 'Reactive Armor', description: '+2% Evasion', cost: 2, effect: { stat: 'evasion', value: 2, isPercentage: false }, requires: ['demo_r1_3'] },
  // Ring 3
  { id: 'demo_r3_1', pathId: 'demolitions', ring: 3, name: 'Chain Reaction', description: '+3% Burn DoT', cost: 3, effect: { stat: 'burnDot', value: 3, isPercentage: false }, requires: ['demo_r2_1'] },
  { id: 'demo_r3_2', pathId: 'demolitions', ring: 3, name: 'Demolition Expert', description: '+5% Blast Attack', cost: 3, effect: { stat: 'blastAttack', value: 5, isPercentage: true }, requires: ['demo_r2_2'] },
  { id: 'demo_r3_3', pathId: 'demolitions', ring: 3, name: 'Spirit Surge', description: '+1 SP Regen', cost: 3, effect: { stat: 'spRegen', value: 1, isPercentage: false }, requires: ['demo_r2_3'] },
  // Ring 4
  { id: 'demo_r4_1', pathId: 'demolitions', ring: 4, name: 'Napalm Core', description: '+5% Burn DoT', cost: 5, effect: { stat: 'burnDot', value: 5, isPercentage: false }, requires: ['demo_r3_1'] },
  { id: 'demo_r4_2', pathId: 'demolitions', ring: 4, name: 'Toxic Cloud', description: '+3% Poison DoT', cost: 5, effect: { stat: 'poisonDot', value: 3, isPercentage: false }, requires: ['demo_r3_2'] },
  { id: 'demo_r4_3', pathId: 'demolitions', ring: 4, name: 'Spirit Mastery', description: '+10 Max SP', cost: 5, effect: { stat: 'maxSp', value: 10, isPercentage: false }, requires: ['demo_r3_3'] },
  // Ring 5
  { id: 'demo_r5_1', pathId: 'demolitions', ring: 5, name: 'Cataclysm', description: '+10% Blast Attack', cost: 8, effect: { stat: 'blastAttack', value: 10, isPercentage: true }, requires: ['demo_r4_1'] },
  { id: 'demo_r5_2', pathId: 'demolitions', ring: 5, name: 'Reality Warp', description: '+5% SP Cost Reduction', cost: 8, effect: { stat: 'spCostReduction', value: 5, isPercentage: false }, requires: ['demo_r4_2'] },
  { id: 'demo_r5_3', pathId: 'demolitions', ring: 5, name: 'Annihilator', description: '+8% Blast Attack, +5 Max SP', cost: 10, effect: { stat: 'blastAttack', value: 8, isPercentage: true }, effect2: { stat: 'maxSp', value: 5, isPercentage: false }, requires: ['demo_r4_3'] },

  // ═══════════════════════════════════════════
  // PATH 4: FORTIFICATION (Tank/CON focus)
  // ═══════════════════════════════════════════
  // Ring 1
  { id: 'fort_r1_1', pathId: 'fortification', ring: 1, name: 'Hardened Bones I', description: '+10 Max HP', cost: 1, effect: { stat: 'maxHp', value: 10, isPercentage: false }, requires: [] },
  { id: 'fort_r1_2', pathId: 'fortification', ring: 1, name: 'Thick Armor I', description: '+3 Defense', cost: 1, effect: { stat: 'defense', value: 3, isPercentage: false }, requires: [] },
  { id: 'fort_r1_3', pathId: 'fortification', ring: 1, name: 'Iron Stomach', description: '+1 HP Regen', cost: 1, effect: { stat: 'hpRegen', value: 1, isPercentage: false }, requires: [] },
  // Ring 2
  { id: 'fort_r2_1', pathId: 'fortification', ring: 2, name: 'Hardened Bones II', description: '+20 Max HP', cost: 2, effect: { stat: 'maxHp', value: 20, isPercentage: false }, requires: ['fort_r1_1'] },
  { id: 'fort_r2_2', pathId: 'fortification', ring: 2, name: 'Shield Master', description: '+5% Block Chance', cost: 2, effect: { stat: 'blockChance', value: 5, isPercentage: false }, requires: ['fort_r1_2'] },
  { id: 'fort_r2_3', pathId: 'fortification', ring: 2, name: 'Resilience', description: '+3% Status Resist', cost: 2, effect: { stat: 'statusResist', value: 3, isPercentage: false }, requires: ['fort_r1_3'] },
  // Ring 3
  { id: 'fort_r3_1', pathId: 'fortification', ring: 3, name: 'Stone Wall', description: '+5 Defense', cost: 3, effect: { stat: 'defense', value: 5, isPercentage: false }, requires: ['fort_r2_1'] },
  { id: 'fort_r3_2', pathId: 'fortification', ring: 3, name: 'Damage Absorb', description: '+3% Damage Reduction', cost: 3, effect: { stat: 'damageReduction', value: 3, isPercentage: false }, requires: ['fort_r2_2'] },
  { id: 'fort_r3_3', pathId: 'fortification', ring: 3, name: 'Regeneration', description: '+2 HP Regen', cost: 3, effect: { stat: 'hpRegen', value: 2, isPercentage: false }, requires: ['fort_r2_3'] },
  // Ring 4
  { id: 'fort_r4_1', pathId: 'fortification', ring: 4, name: 'Fortress', description: '+5% Block Chance', cost: 5, effect: { stat: 'blockChance', value: 5, isPercentage: false }, requires: ['fort_r3_1'] },
  { id: 'fort_r4_2', pathId: 'fortification', ring: 4, name: 'Bulwark', description: '+5% Damage Reduction', cost: 5, effect: { stat: 'damageReduction', value: 5, isPercentage: false }, requires: ['fort_r3_2'] },
  { id: 'fort_r4_3', pathId: 'fortification', ring: 4, name: 'Last Stand', description: '+30 Max HP', cost: 5, effect: { stat: 'maxHp', value: 30, isPercentage: false }, requires: ['fort_r3_3'] },
  // Ring 5
  { id: 'fort_r5_1', pathId: 'fortification', ring: 5, name: 'Immortal Shell', description: '+8% Damage Reduction', cost: 8, effect: { stat: 'damageReduction', value: 8, isPercentage: false }, requires: ['fort_r4_1'] },
  { id: 'fort_r5_2', pathId: 'fortification', ring: 5, name: 'Aegis', description: '+10% Block Chance', cost: 8, effect: { stat: 'blockChance', value: 10, isPercentage: false }, requires: ['fort_r4_2'] },
  { id: 'fort_r5_3', pathId: 'fortification', ring: 5, name: 'Living Fortress', description: '+50 Max HP, +5 Defense', cost: 10, effect: { stat: 'maxHp', value: 50, isPercentage: false }, effect2: { stat: 'defense', value: 5, isPercentage: false }, requires: ['fort_r4_3'] },

  // ═══════════════════════════════════════════
  // PATH 5: SPIRIT (RES/Ability focus)
  // ═══════════════════════════════════════════
  // Ring 1
  { id: 'spi_r1_1', pathId: 'spirit', ring: 1, name: 'Inner Calm I', description: '+5 Max SP', cost: 1, effect: { stat: 'maxSp', value: 5, isPercentage: false }, requires: [] },
  { id: 'spi_r1_2', pathId: 'spirit', ring: 1, name: 'Spirit Tap I', description: '+1 SP Regen', cost: 1, effect: { stat: 'spRegen', value: 1, isPercentage: false }, requires: [] },
  { id: 'spi_r1_3', pathId: 'spirit', ring: 1, name: 'Focus', description: '+2% SP Cost Reduction', cost: 1, effect: { stat: 'spCostReduction', value: 2, isPercentage: false }, requires: [] },
  // Ring 2
  { id: 'spi_r2_1', pathId: 'spirit', ring: 2, name: 'Inner Calm II', description: '+10 Max SP', cost: 2, effect: { stat: 'maxSp', value: 10, isPercentage: false }, requires: ['spi_r1_1'] },
  { id: 'spi_r2_2', pathId: 'spirit', ring: 2, name: 'Spirit Flow', description: '+1 SP Regen', cost: 2, effect: { stat: 'spRegen', value: 1, isPercentage: false }, requires: ['spi_r1_2'] },
  { id: 'spi_r2_3', pathId: 'spirit', ring: 2, name: 'Meditation', description: '+3% SP Cost Reduction', cost: 2, effect: { stat: 'spCostReduction', value: 3, isPercentage: false }, requires: ['spi_r1_3'] },
  // Ring 3
  { id: 'spi_r3_1', pathId: 'spirit', ring: 3, name: 'Overcharge', description: '+5% Crit Damage (Ability Power)', cost: 3, effect: { stat: 'critDamage', value: 5, isPercentage: false }, requires: ['spi_r2_1'] },
  { id: 'spi_r3_2', pathId: 'spirit', ring: 3, name: 'Spirit Vessel', description: '+15 Max SP', cost: 3, effect: { stat: 'maxSp', value: 15, isPercentage: false }, requires: ['spi_r2_2'] },
  { id: 'spi_r3_3', pathId: 'spirit', ring: 3, name: 'Efficient Cast', description: '+5% SP Cost Reduction', cost: 3, effect: { stat: 'spCostReduction', value: 5, isPercentage: false }, requires: ['spi_r2_3'] },
  // Ring 4
  { id: 'spi_r4_1', pathId: 'spirit', ring: 4, name: 'Transcendence', description: '+2 SP Regen', cost: 5, effect: { stat: 'spRegen', value: 2, isPercentage: false }, requires: ['spi_r3_1'] },
  { id: 'spi_r4_2', pathId: 'spirit', ring: 4, name: 'Spirit Storm', description: '+20 Max SP', cost: 5, effect: { stat: 'maxSp', value: 20, isPercentage: false }, requires: ['spi_r3_2'] },
  { id: 'spi_r4_3', pathId: 'spirit', ring: 4, name: 'Mystic Shield', description: '+5% Status Resist', cost: 5, effect: { stat: 'statusResist', value: 5, isPercentage: false }, requires: ['spi_r3_3'] },
  // Ring 5
  { id: 'spi_r5_1', pathId: 'spirit', ring: 5, name: 'Enlightenment', description: '+8% SP Cost Reduction', cost: 8, effect: { stat: 'spCostReduction', value: 8, isPercentage: false }, requires: ['spi_r4_1'] },
  { id: 'spi_r5_2', pathId: 'spirit', ring: 5, name: 'Spirit Overflow', description: '+30 Max SP, +2 SP Regen', cost: 8, effect: { stat: 'maxSp', value: 30, isPercentage: false }, effect2: { stat: 'spRegen', value: 2, isPercentage: false }, requires: ['spi_r4_2'] },
  { id: 'spi_r5_3', pathId: 'spirit', ring: 5, name: 'Ascendant', description: '+10% SP Cost Reduction, +20 Max SP', cost: 10, effect: { stat: 'spCostReduction', value: 10, isPercentage: false }, effect2: { stat: 'maxSp', value: 20, isPercentage: false }, requires: ['spi_r4_3'] },

  // ═══════════════════════════════════════════
  // PATH 6: SURVIVAL (Utility/LUK focus)
  // ═══════════════════════════════════════════
  // Ring 1
  { id: 'surv_r1_1', pathId: 'survival', ring: 1, name: "Scavenger's Eye I", description: '+3% Drop Chance', cost: 1, effect: { stat: 'dropChance', value: 3, isPercentage: false }, requires: [] },
  { id: 'surv_r1_2', pathId: 'survival', ring: 1, name: 'Quick Feet I', description: '+2% Evasion', cost: 1, effect: { stat: 'evasion', value: 2, isPercentage: false }, requires: [] },
  { id: 'surv_r1_3', pathId: 'survival', ring: 1, name: 'Lucky Find', description: '+3% Rare Resource Chance', cost: 1, effect: { stat: 'rareResourceChance', value: 3, isPercentage: false }, requires: [] },
  // Ring 2
  { id: 'surv_r2_1', pathId: 'survival', ring: 2, name: "Scavenger's Eye II", description: '+5% Drop Chance', cost: 2, effect: { stat: 'dropChance', value: 5, isPercentage: false }, requires: ['surv_r1_1'] },
  { id: 'surv_r2_2', pathId: 'survival', ring: 2, name: 'Nimble', description: '+3% Evasion', cost: 2, effect: { stat: 'evasion', value: 3, isPercentage: false }, requires: ['surv_r1_2'] },
  { id: 'surv_r2_3', pathId: 'survival', ring: 2, name: 'Efficient Harvest', description: '+5% Gathering Yield', cost: 2, effect: { stat: 'gatheringYield', value: 5, isPercentage: false }, requires: ['surv_r1_3'] },
  // Ring 3
  { id: 'surv_r3_1', pathId: 'survival', ring: 3, name: 'Treasure Sense', description: '+5% Drop Chance', cost: 3, effect: { stat: 'dropChance', value: 5, isPercentage: false }, requires: ['surv_r2_1'] },
  { id: 'surv_r3_2', pathId: 'survival', ring: 3, name: "Fortune's Favor", description: '+5% Rare Resource Chance', cost: 3, effect: { stat: 'rareResourceChance', value: 5, isPercentage: false }, requires: ['surv_r2_2'] },
  { id: 'surv_r3_3', pathId: 'survival', ring: 3, name: 'Quick Worker', description: '+5% Gathering Speed', cost: 3, effect: { stat: 'gatheringSpeed', value: 5, isPercentage: false }, requires: ['surv_r2_3'] },
  // Ring 4
  { id: 'surv_r4_1', pathId: 'survival', ring: 4, name: 'Luck of the Draw', description: '+5% Rarity Upgrade', cost: 5, effect: { stat: 'rarityUpgrade', value: 5, isPercentage: false }, requires: ['surv_r3_1'] },
  { id: 'surv_r4_2', pathId: 'survival', ring: 4, name: 'Ghost', description: '+5% Evasion', cost: 5, effect: { stat: 'evasion', value: 5, isPercentage: false }, requires: ['surv_r3_2'] },
  { id: 'surv_r4_3', pathId: 'survival', ring: 4, name: 'Master Gatherer', description: '+10% Gathering Yield', cost: 5, effect: { stat: 'gatheringYield', value: 10, isPercentage: false }, requires: ['surv_r3_3'] },
  // Ring 5
  { id: 'surv_r5_1', pathId: 'survival', ring: 5, name: 'Golden Touch', description: '+10% Drop Chance', cost: 8, effect: { stat: 'dropChance', value: 10, isPercentage: false }, requires: ['surv_r4_1'] },
  { id: 'surv_r5_2', pathId: 'survival', ring: 5, name: 'Shadow Dancer', description: '+8% Evasion', cost: 8, effect: { stat: 'evasion', value: 8, isPercentage: false }, requires: ['surv_r4_2'] },
  { id: 'surv_r5_3', pathId: 'survival', ring: 5, name: 'Providence', description: '+10% Rare Resource Chance, +5% Rarity Upgrade', cost: 10, effect: { stat: 'rareResourceChance', value: 10, isPercentage: false }, effect2: { stat: 'rarityUpgrade', value: 5, isPercentage: false }, requires: ['surv_r4_3'] },

  // ═══════════════════════════════════════════
  // PATH 7: INDUSTRY (Production/Crafting focus)
  // ═══════════════════════════════════════════
  // Ring 1
  { id: 'ind_r1_1', pathId: 'industry', ring: 1, name: 'Quick Hands I', description: '+3% Production Speed', cost: 1, effect: { stat: 'productionSpeed', value: 3, isPercentage: false }, requires: [] },
  { id: 'ind_r1_2', pathId: 'industry', ring: 1, name: 'Student I', description: '+3% XP Bonus', cost: 1, effect: { stat: 'xpBonus', value: 3, isPercentage: false }, requires: [] },
  { id: 'ind_r1_3', pathId: 'industry', ring: 1, name: 'Sturdy Build', description: '+5 Max HP', cost: 1, effect: { stat: 'maxHp', value: 5, isPercentage: false }, requires: [] },
  // Ring 2
  { id: 'ind_r2_1', pathId: 'industry', ring: 2, name: 'Quick Hands II', description: '+5% Production Speed', cost: 2, effect: { stat: 'productionSpeed', value: 5, isPercentage: false }, requires: ['ind_r1_1'] },
  { id: 'ind_r2_2', pathId: 'industry', ring: 2, name: 'Student II', description: '+5% XP Bonus', cost: 2, effect: { stat: 'xpBonus', value: 5, isPercentage: false }, requires: ['ind_r1_2'] },
  { id: 'ind_r2_3', pathId: 'industry', ring: 2, name: 'Bulk Processing', description: '+3% Double Output', cost: 2, effect: { stat: 'doubleOutput', value: 3, isPercentage: false }, requires: ['ind_r1_3'] },
  // Ring 3
  { id: 'ind_r3_1', pathId: 'industry', ring: 3, name: 'Master Crafter', description: '+8% Production Speed', cost: 3, effect: { stat: 'productionSpeed', value: 8, isPercentage: false }, requires: ['ind_r2_1'] },
  { id: 'ind_r3_2', pathId: 'industry', ring: 3, name: 'Scholar', description: '+8% XP Bonus', cost: 3, effect: { stat: 'xpBonus', value: 8, isPercentage: false }, requires: ['ind_r2_2'] },
  { id: 'ind_r3_3', pathId: 'industry', ring: 3, name: 'Quality Control', description: '+5% Rarity Upgrade', cost: 3, effect: { stat: 'rarityUpgrade', value: 5, isPercentage: false }, requires: ['ind_r2_3'] },
  // Ring 4
  { id: 'ind_r4_1', pathId: 'industry', ring: 4, name: 'Assembly Line', description: '+10% Production Speed', cost: 5, effect: { stat: 'productionSpeed', value: 10, isPercentage: false }, requires: ['ind_r3_1'] },
  { id: 'ind_r4_2', pathId: 'industry', ring: 4, name: 'Mentor', description: '+10% XP Bonus', cost: 5, effect: { stat: 'xpBonus', value: 10, isPercentage: false }, requires: ['ind_r3_2'] },
  { id: 'ind_r4_3', pathId: 'industry', ring: 4, name: 'Lucky Forge', description: '+5% Double Output', cost: 5, effect: { stat: 'doubleOutput', value: 5, isPercentage: false }, requires: ['ind_r3_3'] },
  // Ring 5
  { id: 'ind_r5_1', pathId: 'industry', ring: 5, name: 'Factory Owner', description: '+15% Production Speed', cost: 8, effect: { stat: 'productionSpeed', value: 15, isPercentage: false }, requires: ['ind_r4_1'] },
  { id: 'ind_r5_2', pathId: 'industry', ring: 5, name: 'Genius', description: '+15% XP Bonus', cost: 8, effect: { stat: 'xpBonus', value: 15, isPercentage: false }, requires: ['ind_r4_2'] },
  { id: 'ind_r5_3', pathId: 'industry', ring: 5, name: 'Industrial Revolution', description: '+10% Double Output, +10% Production Speed', cost: 10, effect: { stat: 'doubleOutput', value: 10, isPercentage: false }, effect2: { stat: 'productionSpeed', value: 10, isPercentage: false }, requires: ['ind_r4_3'] },
];

/** Lookup a single node by ID */
export function getStarlightNode(nodeId: string): StarlightNode | undefined {
  return STARLIGHT_NODES.find(n => n.id === nodeId);
}

/** Get all nodes for a given path */
export function getPathNodes(pathId: string): StarlightNode[] {
  return STARLIGHT_NODES.filter(n => n.pathId === pathId);
}
