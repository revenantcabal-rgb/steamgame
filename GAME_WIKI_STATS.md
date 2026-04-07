# Wasteland Grind - Stats Reference

Primary attributes, derived stats formulas, combat XP distribution, weapon stat XP, and the ring focus system.

See also: [Abilities](GAME_WIKI_ABILITIES.md) | [Combat](GAME_WIKI_COMBAT.md) | [Equipment](GAME_WIKI_EQUIPMENT.md) | [Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md)

---

## TABLE OF CONTENTS

1. [Primary Attributes - Per Point Breakdown](#primary-attributes---per-point-breakdown)
2. [Resolve (RES) - 7th Attribute](#resolve-res---7th-attribute)
3. [SP Stats (Spirit Points)](#sp-stats-spirit-points)
4. [Derived Stats Formula Table](#derived-stats-formula-table)
5. [Example Builds](#example-builds)
6. [Combat XP Distribution](#combat-xp-distribution)
7. [Weapon Stat XP](#weapon-stat-xp)
8. [Ring 3 Focus System](#ring-3-focus-system)
9. [XP Table](#xp-table)

---

## PRIMARY ATTRIBUTES - PER POINT BREAKDOWN

Players have 7 primary attributes. Heroes gain 3 points per level to allocate freely.

| Attribute | Per Point | What It Does |
|-----------|----------|-------------|
| **Strength (STR)** | +2 Melee Attack | Melee damage scaling. Required for heavy weapons & heavy armor. |
| **Dexterity (DEX)** | +2 Ranged Attack, +0.5 Turn Speed, +0.3% Evasion | Ranged damage, speed, dodge. Required for light weapons & light armor. |
| **Intelligence (INT)** | +2 Blast Attack, +1% Critical Damage | Demolitions damage, crit multiplier. Required for tech weapons & tech armor. |
| **Constitution (CON)** | +8 Max HP, +0.5 HP Regen/turn, +0.5% Status Resist | Health, sustain, debuff resistance. Tank stat. |
| **Perception (PER)** | +0.4% Crit Chance, +0.5% Accuracy | Crits and hit chance. Sniper/assassin stat. |
| **Luck (LUK)** | +0.1% Crit, +0.1% Evasion, +0.1% Accuracy, +0.2% rare drop chance | Small bonus to everything. Lucky finds. |
| **Resolve (RES)** | +1 Ability Power, unlocks ability slots at thresholds | Determines how many abilities a hero can equip and how strong they are. |

---

## RESOLVE (RES) - 7TH ATTRIBUTE

Resolve is the 7th primary attribute. It determines a hero's ability to channel combat techniques.

**What Resolve Does:**
- **Ability Power:** Each point of RES increases all ability effects by +1% (damage, healing, buff strength)
- **Ability Slot Unlocks:** Heroes need specific RES thresholds to unlock additional ability slots
- **Warband Decree Eligibility:** Only heroes with RES 50+ can equip a Warband Decree in the 5th slot
- **Status Effect Duration:** +0.3% longer buff/debuff duration per RES point
- **SP Pool:** RES contributes to maximum Spirit Points (see Spirit System)

**Resolve Thresholds:**

| RES Level | Unlock |
|-----------|--------|
| 1+ | Ability Slot 1 (always available) |
| 30+ | Ability Slot 2 |
| 60+ | Ability Slot 3 |
| 90+ | Ability Slot 4 |
| 50+ | Warband Decree Slot (5th slot, party-wide, once per party) |

---

## SP STATS (SPIRIT POINTS)

Spirit Points (SP) power active abilities. See [Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md) for the full breakdown.

| SP Stat | Base Formula | Sources |
|---------|-------------|---------|
| **maxSp** | 30 + (RES x 3) | Base pool + RES scaling + SP gear modifiers |
| **spRegen** | 2 + (RES x 0.1) per turn | Base regen + RES scaling + gear bonuses |
| **spCostReduction** | 0% | Gear facets, enchantments, set bonuses |

SP-related gear modifiers are found on facets and enchantments. See [Facets & Enchantments](GAME_WIKI_FACETS_ENCHANTS.md) for SP facets and enchantments.

---

## DERIVED STATS FORMULA TABLE

| Derived Stat | Base Value | Formula | Cap |
|-------------|-----------|---------|-----|
| **Max HP** | 100 | 100 + (CON x 8) + gear bonuses + (Fortification skill x 3) | None |
| **Melee Attack** | 5 | 5 + (STR x 2) + weapon bonus + (Close Combat skill x 1.5) | None |
| **Ranged Attack** | 5 | 5 + (DEX x 2) + weapon bonus + (Marksmanship skill x 1.5) | None |
| **Blast Attack** | 5 | 5 + (INT x 2) + weapon bonus + (Demolitions skill x 1.5) | None |
| **Defense** | 0 | 0 + armor bonuses + (Fortification skill x 1) | None |
| **Evasion** | 5% | 5% + (DEX x 0.3%) + (LUK x 0.1%) + gear | 50% |
| **Accuracy** | 80% | 80% + (PER x 0.5%) + (LUK x 0.1%) + gear | 99% |
| **Crit Chance** | 5% | 5% + (PER x 0.4%) + (LUK x 0.1%) + gear | 60% |
| **Crit Damage** | 150% | 150% + (INT x 1%) + gear | None |
| **Turn Speed** | 100 | 100 + (DEX x 0.5) + gear bonuses/penalties | None |
| **HP Regen** | 1/turn | 1 + (CON x 0.5) + gear | None |
| **Status Resist** | 0% | (CON x 0.5%) + gear | 80% |
| **Ability Power** | 0% | (RES x 1%) bonus to all ability effects | None |
| **Max SP** | 30 | 30 + (RES x 3) + gear | None |
| **SP Regen** | 2/turn | 2 + (RES x 0.1) + gear | None |

### Specialist Hero Penalty

All Specialist heroes (Scavenger, Ranger, Prospector, Artificer) have a **-20% combat stat penalty** applied to Melee Attack, Ranged Attack, and Blast Attack calculations. See [Heroes](GAME_WIKI_HEROES.md) for details.

---

## EXAMPLE BUILDS

| Build Name | Primary Stats | Playstyle |
|------------|--------------|-----------|
| **Tank** | CON + STR | Heavy armor, high HP, slow but unkillable. Melee fighter. |
| **Berserker** | STR + PER | Big melee hits, high crit, medium HP. Glass cannon. |
| **Sniper** | DEX + PER | Fast turns, high accuracy, devastating crits. Stays at range. |
| **Demolitionist** | INT + CON | Explosive AoE damage, survives own splash. |
| **Assassin** | DEX + LUK | Fast, evasive, lucky crits. Dodges everything. |
| **Juggernaut** | CON + STR + INT | Tanky bomber. Slow but survives and deals blast damage. |
| **Spirit Channeler** | RES + CON | Maximum ability slots, high SP pool, tanky sustain. |
| **Hybrid** | Even spread | Jack of all trades, master of none. Flexible but weaker peak. |

---

## COMBAT XP DISTRIBUTION

When a hero wins a fight, the XP earned is distributed to their attributes based on three factors:

### Priority Order:
1. **Ring 3 Focus Ring** (if equipped) - determines primary XP target
2. **Weapon Type** - determines secondary XP target
3. **Default spread** - if no focus ring

### Distribution Rules:

**WITH a Single Focus Ring (e.g., Ring of STR):**
- 70% of combat XP -> Ring's primary stat (STR)
- 30% of combat XP -> Weapon's primary stat (see Weapon Stat XP below)

**WITH a Dual Focus Ring (e.g., Ring of Providence = STR/CON):**
- 50% of combat XP -> First stat (STR)
- 50% of combat XP -> Second stat (CON)
- Weapon stat is ignored

**WITHOUT any Focus Ring:**
- 30% of combat XP -> Weapon's primary stat
- 70% of combat XP -> Split evenly across all 7 stats (~10% each: STR, DEX, INT, CON, PER, LUK, RES)

---

## WEAPON STAT XP

Each weapon type naturally trains specific stats when used in combat.

| Weapon Type | Primary Stat (70%) | Secondary Stat (30%) | Thematic Reason |
|-------------|-------------------|---------------------|-----------------|
| **Melee** (swords, axes, maces) | STR | PER | Strength from swinging + perception from reading enemy movements |
| **Ranged** (bows, guns, crossbows) | DEX | PER | Dexterity from aiming + perception from target tracking |
| **Demolitions** (bombs, launchers, mines) | INT | CON | Intelligence from engineering + constitution from surviving blasts |

When combined with a focus ring, only the weapon's primary stat matters for the 30% weapon portion:
- Ring of CON + Melee weapon = 70% CON + 30% STR
- Ring of CON + Ranged weapon = 70% CON + 30% DEX
- Ring of CON + Demolitions weapon = 70% CON + 30% INT

---

## RING 3 FOCUS SYSTEM

The 3rd ring slot is **restricted to stat-focus rings only.** Normal rings (Rusty Ring, Copper Band, etc.) CANNOT go in the 3rd slot.

### Available Focus Rings:

**Single Focus Rings (70/30 split):**
| Ring | Primary (70%) | Secondary (30%) | Base Stats |
|------|--------------|----------------|-----------|
| Ring of Strength | STR | From weapon | +3 Melee Attack |
| Ring of Dexterity | DEX | From weapon | +3 Ranged Attack |
| Ring of Intelligence | INT | From weapon | +3 Blast Attack |
| Ring of Constitution | CON | From weapon | +12 Max HP |
| Ring of Perception | PER | From weapon | +3% Accuracy |
| Ring of Luck | LUK | From weapon | +2% Crit Chance |

**Dual Focus Rings (50/50 split, ignores weapon):**
| Ring | Stat 1 (50%) | Stat 2 (50%) | Base Stats |
|------|-------------|-------------|-----------|
| Ring of Providence | STR | CON | +8 Max HP, +3 Melee Atk |
| Ring of Precision | DEX | PER | +3% Accuracy, +3 Ranged Atk |
| Ring of Destruction | INT | LUK | +4 Blast Atk, +3% Crit Dmg |

---

## XP TABLE (All Skills Use This)

**Design intent:** Levels 1-30 feel fast and rewarding. 30-60 is a steady climb. 60+ is where the real grind begins. 80+ is brutal. 90+ is for the dedicated.

Formula: `XP for level N = floor(50 * N^2.5)`

| Level | XP For This Level | Total XP (Cumulative) | Time Estimate (active) |
|-------|------------------|-----------------------|------------------------|
| 1     | 0                | 0                     | -                      |
| 2     | 283              | 283                   | ~1 minute              |
| 5     | 2,795            | 7,654                 | ~8 minutes             |
| 10    | 15,811           | 58,198                | ~45 minutes            |
| 15    | 43,528           | 196,436               | ~2 hours               |
| 20    | 89,442           | 489,898               | ~5 hours               |
| 25    | 156,250          | 993,304               | ~10 hours              |
| 30    | 246,475          | 1,767,767             | ~18 hours              |
| 35    | 362,434          | 2,878,805             | ~30 hours              |
| 40    | 506,231          | 4,397,606             | ~2 days                |
| 45    | 679,746          | 6,401,274             | ~3 days                |
| 50    | 884,628          | 8,973,259             | ~4 days                |
| 55    | 1,122,329        | 12,204,034            | ~5.5 days              |
| 60    | 1,394,098        | 16,192,595            | ~7.5 days (GRIND WALL) |
| 65    | 1,700,990        | 21,046,247            | ~10 days               |
| 70    | 2,043,880        | 26,880,508            | ~13 days               |
| 75    | 2,423,477        | 33,819,050            | ~16 days               |
| 80    | 2,840,335        | 41,993,660            | ~20 days               |
| 85    | 3,294,867        | 51,544,171            | ~25 days               |
| 90    | 3,787,340        | 62,618,439            | ~30 days               |
| 95    | 4,317,898        | 75,371,343            | ~36 days               |
| 100   | 5,000,000        | 90,000,000            | ~43 days               |

**Notes:**
- "Time Estimate" assumes active grinding at mid-tier XP rates (~15-25 XP/action, 3s actions)
- Idle play extends this by 2-3x since you're capped at 8h/day offline
- XP boosts from cash shop (+50%) or food buffs (+5-20%) help but don't trivialize it
- Reaching Level 100 in a single skill is a serious achievement taking 1-2 months of daily play
- Getting ALL skills to 100 is an endgame goal spanning 6-12+ months
