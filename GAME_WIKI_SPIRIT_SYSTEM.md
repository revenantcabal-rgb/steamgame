# Wasteland Grind - Spirit System (SP)

Spirit Points (SP), base formula, SP regen, SP cost reduction, how abilities consume SP, SP gear modifiers, and SP in combat vs expeditions.

See also: [Stats](GAME_WIKI_STATS.md) | [Abilities](GAME_WIKI_ABILITIES.md) | [Combat](GAME_WIKI_COMBAT.md) | [Equipment](GAME_WIKI_EQUIPMENT.md)

---

## TABLE OF CONTENTS

1. [What Are Spirit Points?](#what-are-spirit-points)
2. [SP Base Formula](#sp-base-formula)
3. [SP Regen](#sp-regen)
4. [SP Cost Reduction](#sp-cost-reduction)
5. [How Abilities Consume SP](#how-abilities-consume-sp)
6. [SP Gear Modifiers](#sp-gear-modifiers)
7. [SP in Combat vs Expeditions](#sp-in-combat-vs-expeditions)
8. [SP Build Strategy](#sp-build-strategy)

---

## WHAT ARE SPIRIT POINTS?

Spirit Points (SP) are the resource that powers active abilities (Red, Green, and Blue tomes). Without SP, a hero cannot use their equipped active abilities and must rely on basic attacks and innate class abilities.

**Key Principles:**
- SP creates a resource management layer during combat
- Heroes must balance ability usage with SP conservation
- Passive abilities (Orange tomes) and Warband Decrees (Purple) do NOT consume SP
- Innate class abilities do NOT consume SP - they use cooldowns only
- SP resets to full at the start of each combat encounter

---

## SP BASE FORMULA

| Component | Formula | Notes |
|-----------|---------|-------|
| **Base maxSp** | 30 | Every hero starts with 30 SP |
| **RES scaling** | + (RES x 3) | Each point of RES adds 3 to max SP |
| **Gear bonuses** | + gear modifiers | From facets, enchantments, and set bonuses |

**Total maxSp = 30 + (RES x 3) + gear bonuses**

### Example SP Pools

| RES Investment | maxSp (no gear) | maxSp (with typical endgame gear) |
|---------------|-----------------|----------------------------------|
| 0 RES | 30 SP | ~40-50 SP |
| 30 RES | 120 SP | ~140-160 SP |
| 50 RES | 180 SP | ~200-230 SP |
| 90 RES | 300 SP | ~330-370 SP |

A hero with 0 RES can still use Slot 1 abilities but will run out of SP quickly. Investing in RES provides both more ability slots AND a larger SP pool to fuel them.

---

## SP REGEN

SP regenerates each combat turn automatically.

| Component | Formula | Notes |
|-----------|---------|-------|
| **Base spRegen** | 2 per turn | Every hero regenerates 2 SP per turn |
| **RES scaling** | + (RES x 0.1) per turn | Each point of RES adds 0.1 SP regen per turn |
| **Gear bonuses** | + gear modifiers | From SP-specific facets and enchantments |

**Total spRegen = 2 + (RES x 0.1) + gear bonuses (per turn)**

### Example SP Regen

| RES Investment | spRegen/turn (no gear) | spRegen/turn (with gear) |
|---------------|----------------------|-------------------------|
| 0 RES | 2.0 SP/turn | ~3-4 SP/turn |
| 30 RES | 5.0 SP/turn | ~7-8 SP/turn |
| 50 RES | 7.0 SP/turn | ~9-11 SP/turn |
| 90 RES | 11.0 SP/turn | ~14-17 SP/turn |

---

## SP COST REDUCTION

SP cost reduction is a percentage that reduces the SP cost of all active abilities.

| Component | Formula | Notes |
|-----------|---------|-------|
| **Base spCostReduction** | 0% | No innate cost reduction |
| **Gear sources** | Varies | From SP facets, enchantments, set bonuses |

**Effective SP Cost = Base SP Cost x (1 - spCostReduction%)**

SP cost reduction is capped at 40% to prevent abilities from becoming free.

---

## HOW ABILITIES CONSUME SP

Active abilities (Red, Green, Blue tomes) have an SP cost proportional to their power:

### SP Cost by Ability Tier

| Ability Power Level | Typical SP Cost | Examples |
|-------------------|----------------|---------|
| **Basic** (RES 1-5) | 5-10 SP | Crushing Blow, Quick Shot, Firebomb |
| **Intermediate** (RES 10-25) | 12-20 SP | Shield Breaker, Piercing Arrow, Cluster Bomb |
| **Advanced** (RES 30-45) | 22-35 SP | Execution, Sniper's Mark, Plasma Lance |
| **Expert** (RES 50-60) | 38-50 SP | Kill Confirm, Ghost Walk, Carpet Bomb |
| **Ultimate** (RES 70-80) | 55-75 SP | Annihilate, Oblivion Volley, Singularity |

### SP Economy in Combat

A typical combat turn cycle:
1. Start of fight: SP = maxSp (full)
2. Hero uses ability: SP reduced by ability cost
3. End of turn: SP regenerates by spRegen amount
4. If SP < ability cost: hero uses basic attack instead (no SP cost)
5. Repeat until combat ends

**Example:** Hero with 180 maxSp, 7 spRegen/turn, using a 20 SP ability every 3 turns:
- Turn 1: Use ability (180 -> 160 SP), regen (+7) = 167 SP
- Turn 2: Basic attack, regen (+7) = 174 SP
- Turn 3: Basic attack, regen (+7) = 181 SP (capped at 180)
- Turn 4: Use ability (180 -> 160 SP), cycle repeats

This hero can sustain one ability every 3 turns indefinitely.

---

## SP GEAR MODIFIERS

SP-related bonuses can appear on equipment through several systems:

### SP Facets
See [Facets & Enchantments](GAME_WIKI_FACETS_ENCHANTS.md) for the full list. SP facets include:

| Facet | Slot | Upside | Downside |
|-------|------|--------|----------|
| **Channeling** | Weapons | +15% maxSp | -8% Weapon Damage |
| **Meditative** | Shields | +3 SP Regen when blocking | -5% Block Chance |
| **Focused** | Accessories | +4% Crit Chance | -3% Evasion |

### SP Enchantments
Enchantments in the Focus group can roll SP modifiers:

| Enchantment | Effect Range | Group |
|-------------|-------------|-------|
| Max SP increased | +10 to +30 maxSp | Focus |
| SP Regen increased | +1 to +3 spRegen/turn | Focus |
| SP Cost Reduction | +3% to +10% spCostReduction | Focus |

### SP Set Bonuses
Some equipment sets provide SP bonuses at higher piece counts. Check [Sets](GAME_WIKI_SETS.md) for details.

---

## SP IN COMBAT VS EXPEDITIONS

### Idle Combat (Zones)
- SP resets to full at the start of each fight
- Fights are short (3-12 seconds), so SP is rarely a constraint for heroes with moderate RES
- The auto-combat AI prioritizes high-value abilities and conserves SP for boss fights
- During wave scaling (fights 41-50), SP management becomes more important as fights get longer

### Expeditions (Dungeons)
- SP resets to full at the start of each floor
- Multi-fight floors mean SP conservation matters more
- Boss floors (every 5 floors) are long fights where SP can run dry
- Heroes with high RES and SP regen shine in expeditions
- Party composition should include at least one high-SP hero for sustained damage

### PVP
- SP resets to full at fight start
- PVP fights are typically 10-20 turns
- High-SP-cost ultimate abilities may only be usable once per PVP match
- SP cost reduction gear becomes very valuable in PVP for ability spam builds

---

## SP BUILD STRATEGY

### Low RES Build (0-20 RES)
- **SP Pool:** 30-90
- **Abilities:** 1 slot only
- **Strategy:** Focus on raw combat stats (STR/DEX/INT). Use one powerful ability sparingly. Rely on innate class abilities and basic attacks.
- **Best for:** Pure damage dealers, specialists who don't need many abilities

### Medium RES Build (30-50 RES)
- **SP Pool:** 120-180
- **Abilities:** 2-3 slots, possibly a Decree
- **Strategy:** Good balance of combat stats and ability usage. Can sustain 2 abilities in rotation. Decree access at 50 RES adds party utility.
- **Best for:** Versatile fighters, party leaders (Decree holders)

### High RES Build (60-90 RES)
- **SP Pool:** 210-300
- **Abilities:** 3-4 slots
- **Strategy:** Maximum ability flexibility. Can chain multiple abilities per fight. Excellent SP sustain. Sacrifice some raw damage for versatility.
- **Best for:** Support-oriented heroes, ability-focused builds, expedition specialists
