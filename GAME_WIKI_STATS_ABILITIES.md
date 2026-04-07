# Wasteland Grind - Stats, Abilities, XP & Systems Reference

Covers: Per-point stat breakdown, Ability system, Weapon XP, Ring focus system,
Goal system, Gear chaining, Boss cycles, Idle cap, Dynamic difficulty.

---

## TABLE OF CONTENTS

1. [Primary Attributes - Per Point Breakdown](#primary-attributes---per-point-breakdown)
2. [New Stat: Resolve (RES)](#new-stat-resolve)
3. [Derived Stats Formula Table](#derived-stats-formula-table)
4. [Combat XP Distribution](#combat-xp-distribution)
5. [Weapon Stat XP](#weapon-stat-xp)
6. [Ring 3 Focus System](#ring-3-focus-system)
7. [Ability System](#ability-system)
8. [Ability Slot Unlocks](#ability-slot-unlocks)
9. [Warband Decree System (5th Slot)](#aura-system)
10. [All Class Abilities](#all-class-abilities)
11. [Equippable Skills (Dropped/Bought)](#equippable-skills)
12. [Warband Decree List](#aura-list)
13. [Goal System](#goal-system)
14. [Gear Chaining](#gear-chaining)
15. [Boss Cycle & Wave Scaling](#boss-cycle--wave-scaling)
16. [Idle Cap](#idle-cap)
17. [Dynamic Combat Difficulty](#dynamic-combat-difficulty)
18. [Green Set Equipment](#green-set-equipment)

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

### Resolve (RES) - NEW STAT

Resolve is the 7th primary attribute. It determines a hero's ability to channel combat techniques.

**What Resolve Does:**
- **Ability Power:** Each point of RES increases all ability effects by +1% (damage, healing, buff strength)
- **Ability Slot Unlocks:** Heroes need specific RES thresholds to unlock additional ability slots
- **Warband Decree Eligibility:** Only heroes with RES 50+ can equip an Warband Decree in the 5th slot
- **Status Effect Duration:** +0.3% longer buff/debuff duration per RES point

**Resolve Thresholds:**

| RES Level | Unlock |
|-----------|--------|
| 1+ | Ability Slot 1 (always available) |
| 30+ | Ability Slot 2 |
| 60+ | Ability Slot 3 |
| 90+ | Ability Slot 4 |
| 50+ | Warband Decree Slot (5th slot, party-wide, once per party) |

---

## DERIVED STATS FORMULA TABLE

| Derived Stat | Base Value | Formula | Cap |
|-------------|-----------|---------|-----|
| **Max HP** | 100 | 100 + (CON × 8) + gear bonuses + (Fortification skill × 3) | None |
| **Melee Attack** | 5 | 5 + (STR × 2) + weapon bonus + (Close Combat skill × 1.5) | None |
| **Ranged Attack** | 5 | 5 + (DEX × 2) + weapon bonus + (Marksmanship skill × 1.5) | None |
| **Blast Attack** | 5 | 5 + (INT × 2) + weapon bonus + (Demolitions skill × 1.5) | None |
| **Defense** | 0 | 0 + armor bonuses + (Fortification skill × 1) | None |
| **Evasion** | 5% | 5% + (DEX × 0.3%) + (LUK × 0.1%) + gear | 50% |
| **Accuracy** | 80% | 80% + (PER × 0.5%) + (LUK × 0.1%) + gear | 99% |
| **Crit Chance** | 5% | 5% + (PER × 0.4%) + (LUK × 0.1%) + gear | 60% |
| **Crit Damage** | 150% | 150% + (INT × 1%) + gear | None |
| **Turn Speed** | 100 | 100 + (DEX × 0.5) + gear bonuses/penalties | None |
| **HP Regen** | 1/turn | 1 + (CON × 0.5) + gear | None |
| **Status Resist** | 0% | (CON × 0.5%) + gear | 80% |
| **Ability Power** | 0% | (RES × 1%) bonus to all ability effects | None |

### Specialist Hero Penalty
All Specialist heroes (Scavenger, Ranger, Prospector, Artificer) have a **-20% combat stat penalty** applied to Melee Attack, Ranged Attack, and Blast Attack calculations.

---

## COMBAT XP DISTRIBUTION

When a hero wins a fight, the XP earned is distributed to their attributes based on three factors:

### Priority Order:
1. **Ring 3 Focus Ring** (if equipped) - determines primary XP target
2. **Weapon Type** - determines secondary XP target
3. **Default spread** - if no focus ring

### Distribution Rules:

**WITH a Single Focus Ring (e.g., Ring of STR):**
- 70% of combat XP → Ring's primary stat (STR)
- 30% of combat XP → Weapon's primary stat (see Weapon Stat XP below)

**WITH a Dual Focus Ring (e.g., Ring of Providence = STR/CON):**
- 50% of combat XP → First stat (STR)
- 50% of combat XP → Second stat (CON)
- Weapon stat is ignored

**WITHOUT any Focus Ring:**
- 30% of combat XP → Weapon's primary stat
- 70% of combat XP → Split evenly across all 7 stats (~10% each: STR, DEX, INT, CON, PER, LUK, RES)

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

## ABILITY SYSTEM

### Overview

Heroes have two types of combat abilities:
1. **Innate Class Abilities** (3 per class, unlock at Lv.1/30/60) - permanent, cannot be changed
2. **Equippable Skills** (up to 4 slots, gated by RES) - found, bought, traded, swappable
3. **Warband Decree** (1 slot, RES 50+, party-wide buff, once per party)

### How It Works

Each hero has:
```
[Class Ability 1] - Always active (Lv.1+)
[Class Ability 2] - Always active (Lv.30+)
[Class Ability 3] - Always active (Lv.60+)
[Skill Slot 1]    - RES 1+  (always available)
[Skill Slot 2]    - RES 30+ (need 30 Resolve to unlock)
[Skill Slot 3]    - RES 60+ (need 60 Resolve to unlock)
[Skill Slot 4]    - RES 90+ (need 90 Resolve to unlock)
[Warband Decree Slot]       - RES 50+ (party-wide, once per party)
```

### Ability Power Scaling

All ability effects scale with RES:
- **Effect = Base Effect × (1 + RES × 0.01)**
- Example: A skill that heals 100 HP with 50 RES = 100 × 1.50 = 150 HP
- Example: A skill that deals 200% damage with 80 RES = 200% × 1.80 = 360% damage

---

## ABILITY SLOT UNLOCKS

| Slot | RES Required | What Goes Here |
|------|-------------|----------------|
| Slot 1 | 1 (always) | Any equippable skill |
| Slot 2 | 30 | Any equippable skill |
| Slot 3 | 60 | Any equippable skill |
| Slot 4 | 90 | Any equippable skill |
| Decree | 50 | Warband Decree (1 per party) |

**Key Rule:** If a hero doesn't invest in RES, they're limited to 1 skill slot + their 3 innate abilities. Investing heavily in RES (90+) gives access to all 4 skill slots plus an aura, making them a versatile fighter but sacrificing raw combat stats.

---

## WARBAND DECREE SYSTEM

### What Are Warband Decrees?

Warband Decrees are commanding orders that a hero issues to all 5 squad members during combat, providing party-wide passive buffs.

### Rules:
1. **Only 1 decree per party** - if two heroes equip decrees, only the one from the hero with highest RES activates
2. **Requires RES 50+** to equip
3. **Not permanent** - only active during combat/dungeon runs
4. **Dropped from bosses** or crafted via Biochemistry
5. **Cannot be stacked** - even if 3 heroes have decrees, only 1 activates

### Decree Selection Priority:
If multiple heroes have decrees equipped, the one with the **highest RES** gets their decree activated.

---

## ALL CLASS ABILITIES

### SKIRMISHER Classes

**Blade Dancer (Close Combat):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Quick Strike | 1 | 2 | Attack twice at 70% damage each |
| Evasive Maneuver | 30 | 4 | +40% Evasion 2 turns. Next attack after dodge +50% damage |
| Whirlwind | 60 | 6 | Hit all enemies for 60% damage |

**Sharpshooter (Ranged):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Aimed Shot | 1 | 2 | +30% Accuracy, +50% damage. Cannot miss |
| Reposition | 30 | 4 | +20 Turn Speed 3 turns. Next 2 attacks +15% Crit |
| Killshot | 60 | 6 | If enemy <30% HP: 200% damage. Otherwise 120% |

**Sapper (Demolitions):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Quick Charge | 1 | 2 | Plant charge, detonates next turn for 130% Blast |
| Smoke Screen | 30 | 4 | Enemies -20% Accuracy 3 turns. Team +15% Evasion |
| Chain Blast | 60 | 6 | 100% to target, 50% splash to 2 adjacent |

### CONTROL Classes

**Warden (Close Combat):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Grapple | 1 | 3 | Stun 1 enemy 1 turn. +20% damage from all while stunned |
| Lockdown | 30 | 5 | -50% Turn Speed on 1 enemy for 3 turns |
| Submission Hold | 60 | 7 | Stun 1 enemy 2 turns. Warden also stunned (channeled) |

**Trapper (Ranged):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Net Shot | 1 | 3 | -25% Evasion, -15 Turn Speed on 1 enemy for 2 turns |
| Crippling Arrow | 30 | 4 | 80% damage + -20% enemy attack for 3 turns |
| Snare Field | 60 | 7 | All enemies -20 Turn Speed, -10% Evasion for 3 turns |

**Bombardier (Demolitions):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Flashbang | 1 | 3 | All enemies -30% Accuracy for 2 turns |
| Concussion Blast | 30 | 5 | 40% stun chance each enemy. 50% Blast to all |
| EMP Pulse | 60 | 7 | Remove all enemy buffs. Tech armor enemies +30% damage taken 2 turns |

### SUPPORT Classes

**Guardian (Close Combat):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Shield Ally | 1 | 3 | Redirect 50% of 1 ally damage to self for 2 turns |
| Rally Cry | 30 | 5 | All allies +15% damage, +10% defense for 3 turns |
| Last Stand | 60 | 1/fight | Below 20% HP: heal 40% + 30% defense for 3 turns |

**Field Medic (Ranged):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Healing Dart | 1 | 2 | Heal 1 ally for 15% max HP |
| Stimulant Round | 30 | 4 | Heal 10% HP + 10 Turn Speed + 10% damage for 2 turns |
| Emergency Revive | 60 | 1/fight | Revive KO ally with 30% HP + 20% defense |

**Chemist (Demolitions):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Healing Mist | 1 | 3 | Heal all allies 8% max HP |
| Fortifying Cloud | 30 | 5 | All allies +15% defense, +10% Status Resist for 3 turns |
| Purge Canister | 60 | 5 | Remove all debuffs from allies + heal 5% each |

### ASSAULT Classes

**Berserker (Close Combat):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Rage | 1 | Passive | Each hit +5% damage stacking to +30%. Stun resets |
| Frenzy | 30 | 5 | Attack 3× at 60% each. Each builds Rage |
| Bloodlust | 60 | 7 | 3 turns: heal 20% of damage dealt. Boosted by Rage % |

**Deadeye (Ranged):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Headshot | 1 | 3 | +100% Crit Chance next attack. If crit: +50% Crit Dmg |
| Mark Target | 30 | 4 | Mark 1 enemy 3 turns: +20% Crit, +15% damage from all |
| Assassinate | 60 | 8 | 300% damage. If target dies, CD resets to 4 |

**Demolisher (Demolitions):**
| Ability | Lv | CD | Effect |
|---------|-----|-----|--------|
| Heavy Payload | 1 | 3 | 150% Blast + 75% splash. Self-damage: 5% |
| Carpet Bomb | 30 | 6 | 80% Blast to ALL. Self-damage: 8% |
| Nuclear Option | 60 | 10 | 250% Blast to ALL. Self-damage: 15%. Self-stun 1 turn |

### ARTISAN Classes (Specialist)

**Scavenger:** Resourceful Strike (Lv.1), Salvage Instinct (Lv.30), Treasure Sense (Lv.60)
**Ranger:** Survival Shot (Lv.1), Nature's Bounty (Lv.30), Wild Harvest (Lv.60)
**Prospector:** Controlled Blast (Lv.1), Mineral Sense (Lv.30), Seismic Charge (Lv.60)
**Artificer:** Precision Tinker (Lv.1), Quality Control (Lv.30), Masterwork (Lv.60)

See GAME_WIKI_HEROES.md for full Artisan ability details.

---

## EQUIPPABLE SKILLS

Equippable skills are items that heroes slot into their ability slots. They are separate from innate class abilities.

See GAME_WIKI_SKILLS_MARKET.md for full skill lists organized by:
- Melee Skills (Tier 1-4, STR requirements)
- Ranged Skills (Tier 1-4, DEX requirements)
- Demolitions Skills (Tier 1-4, INT requirements)
- Utility/Support Skills (mixed requirements)

### Key Differences: Innate vs Equippable

| | Innate Class Ability | Equippable Skill |
|---|---------------------|-----------------|
| Source | Comes with class | Dropped, bought, traded |
| Changeable? | No, permanent | Yes, swap anytime |
| Slots | 3 (Lv.1/30/60) | Up to 4 (gated by RES) |
| Upgradeable? | No | Yes (merge duplicates R1→R5) |
| Tradeable? | No | Yes (marketplace) |
| Stat requirement? | Hero level only | Specific stat threshold |

---

## WARBAND DECREE LIST

Warband Decrees are party-wide passive buffs. Only 1 active per party. Requires RES 50+.

| Warband Decree | Effect | Source | RES Scaling |
|------|--------|--------|-------------|
| **Wasteland Fury** | +8% melee, ranged, and blast attack for all party members | Zone 3+ boss drop, Biochem Lv.40 craft | +0.1% per RES |
| **Iron Resolve** | +5% defense, +30 Max HP for all party members | Zone 2+ boss drop, Biochem Lv.30 craft | +0.5 HP per RES |
| **Predator's Instinct** | +5% Crit Chance, +10% Crit Damage for all party members | Zone 4+ boss drop | +0.1% Crit per RES |
| **Swift Current** | +8 Turn Speed, +3% Evasion for all party members | Zone 3+ boss drop | +0.1 Speed per RES |
| **Vital Pulse** | +2 HP Regen per turn, +5% Status Resist for all party members | Zone 2+ boss drop, Biochem Lv.35 craft | +0.05 Regen per RES |
| **Fortune's Favor** | +5% rare drop chance, +3% double loot chance for all party members | Zone 5+ boss drop | +0.1% per RES |
| **Unyielding Spirit** | All party members survive first lethal hit with 1 HP (once per fight per member) | Zone 6+ boss drop | Heal amount per RES |
| **Warmonger's Presence** | +10% damage to enemies below 50% HP for all party members | Zone 5+ boss drop, Biochem Lv.70 craft | +0.15% per RES |
| **Nullification Field** | All party members immune to first debuff each fight | Zone 6+ boss drop | Duration +0.1s per RES |
| **Decree of the Cataclysm** | +5% all stats for all party members | Zone 7 final boss only | +0.08% per RES |

---

## GOAL SYSTEM

Players can set goals for gathering, production, and combat to auto-stop when the target is reached.

### Gathering Goals
| Goal Type | Example | How It Works |
|-----------|---------|-------------|
| **Gather Amount** | "Gather 10,000 Iron Ore" | Stops gathering when resource count reaches target |
| **Reach Level** | "Train Scavenging to Lv.30" | Stops when skill hits target level |
| **No Goal** | Train indefinitely | Default behavior, never stops |

### Combat Goals
| Goal Type | Example | How It Works |
|-----------|---------|-------------|
| **Fight Count** | "Fight 100 times" | Stops after N fights (boss at 50) |
| **Level Stat** | "Level STR to 50" | Stops when stat reaches target |
| **No Goal** | Fight indefinitely | Default behavior |

The game auto-calculates estimated completion time based on:
- Current gathering speed + bonuses
- Hero stats + equipment + food buffs
- Worker count + skill levels
- Displayed as "~estimated X hours Y minutes"

---

## GEAR CHAINING

**Rule:** To craft a higher-tier piece, you must sacrifice the previous tier version.

### Example Chain (Melee - Heavy):
```
T1: Sharpened Pipe (Lv.1, free craft)
  ↓ consumed
T2: Spiked Club (Lv.15, needs Sharpened Pipe + materials)
  ↓ consumed
T3: War Axe (Lv.30, needs Spiked Club + materials)
  ↓ consumed
T4: Reinforced Mace (Lv.45, needs War Axe + materials)
  ↓ consumed
T5: Warlord's Hammer (Lv.60, needs Reinforced Mace + materials)
  ↓ consumed
T6: Titan Cleaver (Lv.80, needs Warlord's Hammer + materials)
  ↓ consumed
T7: Apocalypse Edge (Lv.90, needs Titan Cleaver + materials)
  ↓ consumed
T8: Doomsday Maul (Lv.100, needs Apocalypse Edge + materials)
```

**Why:** This ensures players engage with every tier of content and can't skip ahead. Every piece matters.

---

## BOSS CYCLE & WAVE SCALING

### Full Sweep Mode (Combat Zones)

- **Boss appears every 50 fights** (not 10)
- **Every 10 fights**, enemies get +12% stronger (compounding)
- After boss kill, wave resets to base

| Fight # | Wave | Enemy Power | Notes |
|---------|------|------------|-------|
| 1-10 | Wave 1 | x1.0 (base) | Easy warm-up |
| 11-20 | Wave 2 | x1.12 (+12%) | Slightly harder |
| 21-30 | Wave 3 | x1.24 (+24%) | Noticeable increase |
| 31-40 | Wave 4 | x1.36 (+36%) | Getting tough |
| 41-49 | Wave 5 | x1.48 (+48%) | Real challenge |
| **50** | **BOSS** | x1.48 × 1.5 = **x2.22** | Boss is 50% stronger than current wave |
| 51-60 | Wave 1 | x1.0 (reset) | Cycle restarts |

**Why wave scaling matters:**
- Players can't idle indefinitely at low zones - enemies eventually overwhelm them
- Forces players to check back, re-gear, or move to appropriate zones
- Boss is a real challenge after 50 fights of scaling

---

## IDLE CAP

- **Default:** 12 hours per day (free players)
- **Premium extension:** Purchase additional hours via Irradiated Gems (cash shop)
- **Daily reset:** Cap resets at midnight local time
- **Offline progress:** Calculated on login, capped by idle hours remaining

---

## DYNAMIC COMBAT DIFFICULTY

Combat zones scale based on who's deployed:

### Hero Count Scaling
Each hero deployed to the **same zone** increases difficulty by +15%:
- 1 hero: x1.0 difficulty
- 2 heroes: x1.15
- 3 heroes: x1.30
- 4 heroes: x1.45
- 5 heroes: x1.60

### Overlevel Scaling
If average hero level exceeds zone level by 20+, enemies scale up:
- Overlevel by 20: +0% (threshold)
- Overlevel by 30: +20%
- Overlevel by 40: +40%
- etc. (+2% per level above 20 difference)

### XP Bonus
Higher difficulty = better XP. The XP bonus is 60% of the difficulty increase:
- x1.30 difficulty → x1.18 XP bonus

---

## GREEN SET EQUIPMENT

Green set items appear with a green border. Wearing multiple pieces from the same set activates progressive bonuses.

### Survivor's Outfit (T1, Early, Gathering)
6 pieces: Vest, Pants, Gloves, Boots, Ring, Earring
- (2) +5% gathering speed
- (3) +10% gathering yield
- (4) +20 Max HP, +1 HP Regen
- (5) +5% XP gain
- (6) +15% gathering speed, +10% rare resource, -50% worker death

### Raider's Armor (T3, Mid, Combat Plate)
6 pieces: Plate, Legguards, Gauntlets, Boots, Shield, Ring
- (2) +15 Defense, +20 Max HP
- (3) +5% Damage Reduction
- (4) +10% melee attack, +3 HP Regen
- (5) +25% Block Chance, +50 Max HP
- (6) +10% all combat, +8% Dmg Reduction, stun immunity once

### Forager's Garb (T3, Mid, Gathering Leather)
6 pieces: Vest, Pants, Gloves, Boots, Pendant, Earring
- (2) +10% gathering speed
- (3) +15% yield, +5% production speed
- (4) +8% XP, +10% Turn Speed
- (5) +20% rare resource, +10% production speed
- (6) +25% yield, +15% rarity upgrade, no worker deaths

### Warlord's Regalia (T6, Endgame, Heavy Combat)
7 pieces: Breastplate, Legplates, Gauntlets, Boots, Shield, Ring, Pendant
- (2) +30 Defense, +50 Max HP
- (3) +8% Dmg Reduction, +4 HP Regen
- (4) +15% melee attack, +8% Crit Chance
- (5) +100 Max HP, +10% all attack, +5% Evasion
- (6) +15% Dmg Reduction, +20% all combat, auto-revive once
- (7) +25% all stats, +200 Max HP, immune to first 2 debuffs

### Artisan's Ensemble (T6, Endgame, Production)
6 pieces: Vest, Pants, Gloves, Boots, Earring, Pendant
- (2) +15% gathering speed, +10% production speed
- (3) +20% yield, +15% rarity upgrade
- (4) +15% XP, +10% rare resource, +5% all attack
- (5) +30% yield, +20% production speed, +10% worker XP
- (6) +25% rarity upgrade, +40% yield, +10% double output, no worker deaths
