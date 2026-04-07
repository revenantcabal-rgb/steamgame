# Wasteland Grind - Combat Reference

Idle combat formula, DPS, defense curve, evasion, block, armor pen, DoTs, lifesteal, thorns, turnSpeed, combat zones, boss cycles, wave scaling, expeditions, and party system.

See also: [Stats](GAME_WIKI_STATS.md) | [Abilities](GAME_WIKI_ABILITIES.md) | [Equipment](GAME_WIKI_EQUIPMENT.md) | [Heroes](GAME_WIKI_HEROES.md)

---

## TABLE OF CONTENTS

1. [Combat Simulation](#combat-simulation)
2. [Damage Formula](#damage-formula)
3. [Turn Speed & Action Order](#turn-speed--action-order)
4. [Defense Curve](#defense-curve)
5. [Evasion & Accuracy](#evasion--accuracy)
6. [Block System](#block-system)
7. [Armor Penetration](#armor-penetration)
8. [DoTs (Damage over Time)](#dots-damage-over-time)
9. [Lifesteal & Thorns](#lifesteal--thorns)
10. [Idle Combat Zones](#idle-combat-zones)
11. [All Combat Zones](#all-combat-zones)
12. [Boss Cycle & Wave Scaling](#boss-cycle--wave-scaling)
13. [Combat Zone Tiers](#combat-zone-tiers)
14. [Zone Tier Scaling Tables](#zone-tier-scaling-tables)
15. [Expeditions (Dungeons)](#expeditions)
16. [Dynamic Combat Difficulty](#dynamic-combat-difficulty)
17. [The Combat Triangle](#the-combat-triangle)
18. [Squad Building (5v5)](#squad-building)
19. [PVP Format](#pvp-format)
20. [GVG / Clan Wars](#gvg--clan-wars)

---

## COMBAT SIMULATION

### Turn Order
1. Calculate Turn Speed for all combatants
2. Highest Turn Speed goes first
3. Each turn: choose attack type based on equipped weapon
4. Roll Accuracy vs Evasion to determine hit
5. If hit: Roll for Critical (Crit Chance)
6. Calculate damage: `(Attack - Defense) * (1 + Crit Dmg if crit) * (1 - Dmg Reduction)`
7. Apply DoT effects, regen, status effects
8. Deduct SP for abilities used
9. Next combatant's turn
10. Repeat until one side reaches 0 HP

---

## DAMAGE FORMULA

```
Raw Damage = Base Attack + Weapon Attack + (Primary Stat * 2) + (Skill Level * 1.5)
Mitigated = Raw Damage - Defense
Reduced = Mitigated * (1 - Damage Reduction%)
Final = max(1, Reduced) * (Crit Multiplier if crit)
```

### Why Turn Speed Matters
- A player with 130 Turn Speed vs 100 Turn Speed gets ~30% more turns
- Heavy armor players hit harder but act less often
- Light armor players act more often but hit softer
- This is the core trade-off: **Slow and strong vs Fast and nimble**

---

## DEFENSE CURVE

Defense provides linear damage reduction. Each point of Defense reduces incoming raw damage by 1 point before Damage Reduction percentage is applied.

---

## EVASION & ACCURACY

- Hit chance = Accuracy - Evasion (minimum 5%, maximum 99%)
- Accuracy base: 80% + (PER x 0.5%) + (LUK x 0.1%) + gear
- Evasion base: 5% + (DEX x 0.3%) + (LUK x 0.1%) + gear
- Evasion cap: 50%
- Accuracy cap: 99%

---

## BLOCK SYSTEM

Shields provide a Block Chance. When blocking:
- Blocked attacks deal reduced damage (50% reduction baseline)
- Block Chance comes from shield base stats + facets + enchantments
- Block-related enchantments can add counterattack, HP regen on block, or damage reflection

---

## ARMOR PENETRATION

Armor Penetration ignores a percentage of the target's Defense stat.

- Armor Pen comes from gear bonuses, abilities, and enchantments
- Formula: `Effective Defense = Defense * (1 - Armor Pen%)`
- Example: 100 Defense vs 25% Armor Pen = 75 Effective Defense

---

## DOTS (DAMAGE OVER TIME)

| DoT Type | Damage | Duration | Source |
|----------|--------|----------|--------|
| **Burn** | % of weapon damage per turn | 2-4 turns | Scorching facet, Elemental enchant, Blue abilities |
| **Poison** | % of weapon damage per turn | 3-5 turns | Toxic facet, Elemental enchant, Blue abilities |
| **Radiation** | Flat damage per turn + healing reduction | 3-4 turns | Demolitions abilities (Radiation Burst) |
| **Bleed** | % of melee damage per turn | 2-3 turns | Red abilities (Rending Slash) |

DoTs stack from different sources but not from the same source.

---

## LIFESTEAL & THORNS

**Lifesteal:**
- Heals the attacker for a percentage of damage dealt
- Sources: Vampiric facet (5-7%), Bloodthirst passive (3%), Health enchantments (2-6%)
- Lifesteal is calculated on final damage dealt (after defense and reduction)

**Thorns:**
- Reflects a percentage of melee damage taken back to the attacker
- Sources: Spiked facet (8-10%), Utility enchantments (3-10%)
- Thorns damage ignores attacker's defense

---

## IDLE COMBAT ZONES

Heroes can be set to **idle farm** in combat zones, just like workers idle in gathering.

### How It Works

1. Player selects a hero (or squad for harder zones)
2. Player selects a Combat Zone (unlocked through progression)
3. Player selects a **target** within that zone:
   - **3 focused targets** (specific enemy, higher XP per kill, focused loot)
   - **1 full sweep** (fight everything, every 50 fights = boss battle, varied loot)
4. Hero auto-fights on a timer (similar to gathering actions)
5. Hero earns Combat XP, loot drops, and resources
6. Hero can die if the zone is too hard (returns after a cooldown penalty)

### Combat Zone Actions

| Action Type | What Happens | XP/Fight | Loot |
|-------------|-------------|----------|------|
| **Solo Target** (focused) | Fight 1 specific enemy type repeatedly | Higher XP | Focused drops from that enemy |
| **Full Sweep** (mixed) | Fight random enemies from the zone. Every 50th fight is a boss. | Lower XP per fight, but boss XP is huge | Varied drops from all enemies + boss chest |

### Idle Combat Speed

| Hero Level vs Zone Level | Fight Duration | Notes |
|-------------------------|---------------|-------|
| Overlevel by 20+ | 3 seconds | Farming easy content |
| Overlevel by 10-19 | 5 seconds | Comfortable farming |
| At zone level | 8 seconds | Challenging, hero may lose |
| Underlevel by 5-10 | 12 seconds | Dangerous, high death risk |
| Underlevel by 10+ | Cannot enter | Zone is locked |

### Hero Death in Combat Zones

- If a hero dies during idle combat, they enter a **recovery cooldown**
- Recovery time: 5 minutes (normal enemy), 15 minutes (boss), 30 minutes (zone 6-7 boss)
- During recovery, the hero cannot fight, join squads, or go on skirmishes
- NO permanent death for heroes (workers can die permanently, heroes cannot)

---

## ALL COMBAT ZONES

### Zone 1: The Outskirts (Level 1+, Solo hero)

> The edges of the wasteland. Mutated vermin and small creatures. Perfect for new heroes.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Marshland | Mutated Mosquito | 20 | 3 | 15 | Insect Chitin, Toxic Gland |
| Bog | Mutated Frog | 30 | 5 | 18 | Frog Skin, Mutant Slime |
| Burrows | Mutated Centipede | 25 | 7 | 20 | Chitin Plates, Venom Sac |
| Full Sweep | All + Boss: Giant Roach | - | - | varies | All drops + boss chest |

**Boss: Giant Roach** - HP: 90, Damage: 15, XP: 100
Boss Chest: T1-T2 gear, 10-20 random resources

### Zone 2: Ruined Suburbs (Level 15+, Solo hero)

> Abandoned neighborhoods overrun by mutant animals.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Alleys | Feral Dog Pack | 60 | 12 | 35 | Leather Scraps, Fang |
| Rooftops | Mutant Hawk | 45 | 18 | 40 | Feathers, Talons |
| Basements | Rad Rat Swarm | 80 | 10 | 38 | Rat Pelts, Glowing Eyes |
| Full Sweep | All + Boss: Alpha Wolf | - | - | varies | All drops + boss chest |

**Boss: Alpha Wolf** - HP: 250, Damage: 30, XP: 250
Boss Chest: T2-T3 gear, 20-40 resources

### Zone 3: Toxic Industrial District (Level 30+, Solo or 3-hero squad)

> A poisoned factory district with chemical mutants and rogue machines.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Chemical Vats | Slime Crawler | 120 | 22 | 65 | Toxic Residue, Acid Flask |
| Assembly Line | Rogue Drone | 100 | 30 | 70 | Drone Core, Servo Motor |
| Waste Tunnels | Sewer Beast | 150 | 25 | 75 | Beast Hide, Sewer Crystal |
| Full Sweep | All + Boss: Factory Overseer | - | - | varies | All drops + boss chest |

**Boss: Factory Overseer (Mech)** - HP: 500, Damage: 50, XP: 500
Boss Chest: T3-T4 gear, 30-60 resources, rare crafting materials

### Zone 4: The Deadlands (Level 45+, 3-hero squad recommended)

> An irradiated desert wasteland with dangerous creatures and raiders.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Sand Dunes | Sandworm | 200 | 35 | 100 | Worm Carapace, Sand Pearl |
| Raider Camps | Raider Gang (3 enemies) | 120 ea | 28 ea | 120 | Raider Gear, Ammo Cache |
| Radiation Craters | Glowing Ghoul | 180 | 45 | 110 | Ghoul Marrow, Rad Crystal |
| Full Sweep | All + Boss: Raider Warlord | - | - | varies | All drops + boss chest |

**Boss: Raider Warlord** - HP: 800, Damage: 70, XP: 800
Boss Chest: T4-T5 gear, 50-100 resources, rare materials

### Zone 5: Military Exclusion Zone (Level 60+, 5-hero squad required)

> A walled-off military installation with automated defenses and bio-weapons.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Perimeter | Turret Array (2 turrets) | 250 ea | 40 ea | 160 | Turret Parts, Targeting Module |
| Barracks | Bio-Soldier Squad (3) | 200 ea | 50 ea | 180 | Military Gear, Dog Tags |
| Research Lab | Escaped Experiment | 400 | 80 | 200 | Mutagen Sample, Lab Data |
| Full Sweep | All + Boss: Commander Mech | - | - | varies | All drops + boss chest |

**Boss: Commander Mech** - HP: 1500, Damage: 120, XP: 1200
Boss Chest: T5-T6 gear, 80-150 resources, rare/unique materials

### Zone 6: The Core (Level 80+, 5-hero squad, endgame)

> The reactor core where the apocalypse began. Maximum radiation and danger.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Outer Ring | Radiation Elemental | 500 | 100 | 300 | Core Fragment, Isotope |
| Inner Chamber | Mutant Abomination | 600 | 130 | 350 | Abomination Heart, Mutant DNA |
| Reactor Room | Fusion Golem | 700 | 150 | 400 | Fusion Core, Plasma Crystal |
| Full Sweep | All + Boss: The Source | - | - | varies | All drops + boss chest |

**Boss: The Source** - HP: 3000, Damage: 200, XP: 2500
Boss Chest: T7-T8 gear, 150-300 resources, legendary materials, Plague rarity chance: 15%

### Zone 7: Ground Zero (Level 95+, 5-hero squad, ultimate endgame)

> The epicenter. Reality warps here. Only the strongest survive.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Crater Edge | Phase Walker | 800 | 180 | 500 | Phase Shard, Void Dust |
| Anomaly Field | Reality Breaker | 1000 | 200 | 600 | Anomaly Core, Warped Metal |
| Epicenter | Apocalypse Herald | 1200 | 250 | 700 | Herald Fragment, Doom Essence |
| Full Sweep | All + Boss: The Cataclysm | - | - | varies | All drops + boss chest |

**Boss: The Cataclysm** - HP: 5000, Damage: 300, XP: 5000
Boss Chest: T8 gear guaranteed, legendary materials, Plague rarity chance: 25%

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
| **50** | **BOSS** | x1.48 x 1.5 = **x2.22** | Boss is 50% stronger than current wave |
| 51-60 | Wave 1 | x1.0 (reset) | Cycle restarts |

**Why wave scaling matters:**
- Players can't idle indefinitely at low zones - enemies eventually overwhelm them
- Forces players to check back, re-gear, or move to appropriate zones
- Boss is a real challenge after 50 fights of scaling

---

## COMBAT ZONE TIERS

Each combat zone has **multiple difficulty tiers** that unlock as the player's heroes grow stronger. Higher tiers have stronger enemies, better XP, and better (but still weaker-than-crafted) drops.

### How Tiers Work

- Each zone starts at **Tier 1** (Normal)
- Player unlocks the next tier by **clearing the boss 5 times** at the current tier
- Higher tiers multiply enemy stats and rewards
- Maximum tier varies by zone (early zones max out sooner)

### Tier Scaling

| Tier | Name | Enemy HP Mult | Enemy Dmg Mult | XP Mult | Drop Rarity Boost | Max Drop Gear Tier |
|------|------|-------------|---------------|---------|-------------------|-------------------|
| T1 | Normal | x1.0 | x1.0 | x1.0 | +0% | Zone's base tier |
| T2 | Hard | x1.5 | x1.3 | x1.5 | +5% Rare chance | +0 |
| T3 | Elite | x2.2 | x1.7 | x2.2 | +10% Rare, +3% Unique | +0 |
| T4 | Nightmare | x3.0 | x2.2 | x3.0 | +15% Rare, +5% Unique, +1% Plague | +1 tier above base |
| T5 | Apocalypse | x4.5 | x3.0 | x4.5 | +20% Rare, +10% Unique, +3% Plague | +1 tier above base |
| T6 | Extinction | x7.0 | x4.0 | x7.0 | +25% Rare, +15% Unique, +5% Plague | +2 tiers above base |

### Tier Unlock Requirements

| Zone | Max Tier | Unlock Each Next Tier |
|------|---------|----------------------|
| Zone 1: The Outskirts | T4 (Nightmare) | Clear boss 5 times at current tier |
| Zone 2: Ruined Suburbs | T5 (Apocalypse) | Clear boss 5 times at current tier |
| Zone 3: Toxic Industrial | T5 (Apocalypse) | Clear boss 5 times at current tier |
| Zone 4: The Deadlands | T5 (Apocalypse) | Clear boss 5 times at current tier |
| Zone 5: Military Zone | T6 (Extinction) | Clear boss 5 times at current tier |
| Zone 6: The Core | T6 (Extinction) | Clear boss 5 times at current tier |
| Zone 7: Ground Zero | T6 (Extinction) | Clear boss 5 times at current tier |

---

## ZONE TIER SCALING TABLES

### Boss Loot Table by Zone Tier

Every 50 fights, the boss appears. Boss ALWAYS drops 1 piece of gear. Here's the rarity and power:

**All boss drops are [Salvaged] = 75% base stats, 80% bonus rolls compared to [Forged] crafted.**

| Zone + Tier | Boss Drop Gear Tier | Common% | Rare% | Unique% | Plague% |
|-------------|-------------------|---------|-------|---------|---------|
| Z1 T1 Normal | T1 gear | 50% | 35% | 13% | 2% |
| Z1 T2 Hard | T1 gear | 40% | 38% | 18% | 4% |
| Z1 T3 Elite | T1 gear | 30% | 38% | 25% | 7% |
| Z1 T4 Nightmare | T2 gear | 25% | 35% | 30% | 10% |
| Z2 T1 Normal | T2 gear | 45% | 35% | 16% | 4% |
| Z2 T3 Elite | T2 gear | 25% | 35% | 30% | 10% |
| Z2 T5 Apocalypse | T3 gear | 15% | 30% | 38% | 17% |
| Z3 T1 Normal | T3 gear | 40% | 36% | 19% | 5% |
| Z3 T5 Apocalypse | T4 gear | 15% | 30% | 38% | 17% |
| Z4 T1 Normal | T4 gear | 40% | 35% | 20% | 5% |
| Z4 T5 Apocalypse | T5 gear | 12% | 28% | 40% | 20% |
| Z5 T1 Normal | T5 gear | 35% | 35% | 23% | 7% |
| Z5 T6 Extinction | T6 gear | 10% | 25% | 42% | 23% |
| Z6 T1 Normal | T6-T7 gear | 30% | 35% | 27% | 8% |
| Z6 T6 Extinction | T7-T8 gear | 8% | 22% | 45% | 25% |
| Z7 T1 Normal | T7-T8 gear | 25% | 30% | 33% | 12% |
| Z7 T6 Extinction | T8 gear | 5% | 20% | 45% | 30% |

### Normal Mob Loot by Zone Tier

Normal mobs have a chance to drop gear, but it's always [Scavenged] (60% stats, 65% bonuses):

| Zone Tier | Gear Drop Chance per Kill | Rarity if Drop |
|-----------|--------------------------|----------------|
| T1 Normal | 5% | 80% Common, 15% Rare, 4% Unique, 1% Plague |
| T2 Hard | 6% | 70% Common, 22% Rare, 6% Unique, 2% Plague |
| T3 Elite | 7% | 60% Common, 27% Rare, 10% Unique, 3% Plague |
| T4 Nightmare | 8% | 50% Common, 30% Rare, 15% Unique, 5% Plague |
| T5 Apocalypse | 10% | 40% Common, 32% Rare, 20% Unique, 8% Plague |
| T6 Extinction | 12% | 30% Common, 33% Rare, 25% Unique, 12% Plague |

### Zone 1 Full Tier Breakdown (Example)

| Tier | Enemy Level | Mosquito HP/Dmg | Frog HP/Dmg | Centipede HP/Dmg | Boss HP/Dmg | XP/Kill | Recommended |
|------|-----------|-----------------|-------------|-----------------|-------------|---------|-------------|
| T1 Normal | 1-10 | 20/3 | 30/5 | 25/7 | 90/15 | 15-20 | Hero Lv.1-10 |
| T2 Hard | 5-15 | 30/4 | 45/7 | 38/9 | 135/20 | 23-30 | Hero Lv.10-20 |
| T3 Elite | 12-25 | 44/5 | 66/9 | 55/12 | 198/26 | 33-44 | Hero Lv.20-30 |
| T4 Nightmare | 20-35 | 60/7 | 90/11 | 75/15 | 270/33 | 45-60 | Hero Lv.30-40 |

### Zone 2 Full Tier Breakdown (Example)

| Tier | Enemy Level | Dog HP/Dmg | Hawk HP/Dmg | Rat HP/Dmg | Boss HP/Dmg | XP/Kill | Recommended |
|------|-----------|------------|-------------|------------|-------------|---------|-------------|
| T1 Normal | 15-25 | 60/12 | 45/18 | 80/10 | 250/30 | 35-40 | Hero Lv.15-25 |
| T2 Hard | 20-30 | 90/16 | 68/23 | 120/13 | 375/39 | 53-60 | Hero Lv.25-35 |
| T3 Elite | 28-40 | 132/20 | 99/31 | 176/17 | 550/51 | 77-88 | Hero Lv.35-45 |
| T4 Nightmare | 35-50 | 180/26 | 135/40 | 240/22 | 750/66 | 105-120 | Hero Lv.45-55 |
| T5 Apocalypse | 45-60 | 270/36 | 203/54 | 360/30 | 1125/90 | 158-180 | Hero Lv.55-65 |

Zones 3-7 follow the same scaling pattern with base stats multiplied by tier multipliers.

---

## EXPEDITIONS

Expeditions are multi-fight PVE dungeon encounters that drop rare resources and equipment. They represent the structured endgame PVE content beyond idle combat zones.

### 3 Expedition Dungeons

| Expedition | Rec. Level | Floors | Theme | Notable Drops |
|------------|-----------|--------|-------|---------------|
| **The Undercity** | 40+ | 10 | Underground ruins, mutant swarms | T4-T5 gear, rare crafting recipes |
| **The Proving Grounds** | 65+ | 15 | Military training gauntlet | T5-T6 gear, Warband Decree drops |
| **The Singularity** | 85+ | 20 | Reality-warped endgame dungeon | T7-T8 gear, legendary materials, Plague rarity chance |

### 3 Difficulty Levels

| Difficulty | Enemy Scaling | Rewards | Party Size |
|-----------|--------------|---------|-----------|
| **Normal** | x1.0 | Standard drop tables | 3-hero squad |
| **Heroic** | x2.0 HP, x1.5 Dmg | +50% drop rates, higher rarity | 5-hero squad |
| **Mythic** | x3.5 HP, x2.5 Dmg | +100% drop rates, guaranteed Unique+, Plague chance | 5-hero squad, all Lv.80+ |

### Expedition Rules
- Each expedition consumes an **Expedition Pass** (crafted via Tinkering or bought on marketplace)
- Expeditions are NOT idle - they run in real-time with sequential floor clearing
- Party wipes return you to the entrance with partial loot
- Boss floors (every 5 floors) have guaranteed drops
- Final floor boss has the best loot table in the game

### Legacy Dungeons

The original 7 dungeons remain as progression content:

| Dungeon | Rec. Level | Floors | Theme | Notable Drops |
|---------|-----------|--------|-------|---------------|
| The Ruins | 10+ | 5 | Collapsed city | T2 gear, basic recipes |
| Abandoned Factory | 25+ | 8 | Industrial complex | T3 gear, Mechanical Parts |
| The Wasteland | 40+ | 10 | Open desert, mutant beasts | T4 gear, rare forage |
| Toxic Sewers | 55+ | 12 | Underground, poison enemies | T5 gear, Chemical Fluids |
| Military Bunker | 70+ | 15 | Pre-war military base | T6 gear, Electronic Components |
| The Core | 85+ | 18 | Reactor facility, radiation | T7 gear, rare ore |
| Ground Zero | 95+ | 20 | The epicenter, final challenge | T8 gear, legendary materials |

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
- x1.30 difficulty -> x1.18 XP bonus

---

## THE COMBAT TRIANGLE

```
Close Combat (STR) beats Demolitions (INT) -- Melee closes distance, disrupts setup
Demolitions (INT) beats Marksmanship (DEX) -- AoE forces repositioning, splash unavoidable
Marksmanship (DEX) beats Close Combat (STR) -- Kite and shoot before they reach you
```
- +10% damage bonus when attacking the type you counter
- -10% damage penalty when attacking the type that counters you
- This adds another layer of squad composition strategy

### Weapon Penalty
- Heroes deal **-30% damage** when using a weapon outside their primary combat style
- Example: A Blade Dancer (Close Combat primary) using a Marksman Rifle deals 70% of its listed damage

---

## SQUAD BUILDING

### Rules
- Player selects 5 heroes from their roster for any combat encounter
- Each hero must be a unique individual (can't use same hero twice)
- CAN use multiple heroes of the same class (e.g., 2 Berserkers)
- Category auras stack (e.g., 3 Assault heroes = +24% damage, +15% Crit Dmg for all)

### Diminishing Returns
- Stacking 5 heroes of the same category gives massive aura bonuses but you lack versatility
- Category auras have soft diminishing returns after 3 stacks:
  - 1 hero: 100% aura value
  - 2 heroes: 100% each (200% total)
  - 3 heroes: 100% each (300% total)
  - 4th hero: 50% aura value (350% total)
  - 5th hero: 25% aura value (375% total)

### Recommended Compositions

| Comp Name | Heroes | Strategy |
|-----------|--------|----------|
| **Balanced** | 1 Skirmisher, 1 Control, 1 Support, 2 Assault | Standard well-rounded team |
| **Rush** | 3 Assault, 1 Skirmisher, 1 Support | Kill fast before they can react. Aura: +24% dmg |
| **Turtle** | 2 Support, 2 Control, 1 Assault | Outheal and outlast. Win by attrition. |
| **Blitz** | 3 Skirmisher, 1 Assault, 1 Support | Maximum speed. Act first, kill priority targets. Aura: +15 Turn Speed |
| **Lockdown** | 3 Control, 1 Support, 1 Assault | Enemy can barely act. Stuns, slows, debuffs. Aura: -15 enemy Turn Speed |
| **GVG Siege** | 2 Demolisher, 1 Chemist, 1 Bombardier, 1 Guardian | AoE everything. Demolishers nuke, Chemist heals splash, Bombardier disables, Guardian tanks. |

---

## PVP FORMAT

### Ranked PVP (5v5)
- Player selects 5 heroes as their squad
- Combat auto-resolves based on stats, gear, abilities, and turn order
- ELO matchmaking (starts at 1000)
- 3-month seasons with rank tiers:

| Rank | ELO Range | Season Reward |
|------|-----------|---------------|
| Bronze | 0-1099 | Basic resource pack |
| Silver | 1100-1299 | Moderate resource pack + cosmetic |
| Gold | 1300-1499 | Large resource pack + cosmetic + 1 hero recruit |
| Platinum | 1500-1699 | Huge resource pack + rare cosmetic + high-stat hero |
| Diamond | 1700-1899 | Massive resource pack + legendary cosmetic + guaranteed top-stat hero |
| Wasteland Champion | 1900+ | All of above + unique title + profile border |

### Quick Match (unranked)
- Same 5v5 format but no ELO changes
- For testing comps and practicing

---

## GVG / CLAN WARS

### War Format
- Clans of up to 30 members
- **War declaration:** Leader/Officers start war search
- **Matchmaking:** Clans matched by total hero power
- **Prep Phase (24 hours):** Members assign heroes to defense, build structures (Engineering skill)
- **Battle Phase (24 hours):** Each member gets 2 attacks using their 5-hero squad
- **Each attack:** Your 5-hero squad vs defender's 5-hero squad
- **Stars:** 1 star = deal >33% total damage. 2 stars = deal >66%. 3 stars = full wipe.
- **Winner:** Most total stars. Tiebreaker: most total damage %.

### Hero Role in GVG
- Each member sets a **Defense Squad** (5 heroes who defend when attacked)
- Each member uses an **Attack Squad** (5 heroes for their 2 attacks, can be different from defense)
- Demolitions heroes get bonus damage vs structures
- Engineering skill determines defense structure HP
- Support heroes are critical for keeping attackers alive through defenses

### Drop Rules (Who Drops What)

| Source | Drops Gear? | Drops Skills? | Drops Resources? | Drops Currency (WC)? |
|--------|------------|--------------|-----------------|---------------------|
| **Normal Mobs** | **NO** | Yes (low chance) | Yes | Yes (small) |
| **Zone Boss (every 50 fights)** | **YES** (guaranteed 1 piece) | Yes (guaranteed 1) | Yes (bonus) | Yes (moderate) |
| **Dungeon Boss** | **YES** (guaranteed 1-2 pieces) | Yes (guaranteed 1) | Yes (large) | Yes (large) |
| **PVP Rewards** | Season rewards only | Season rewards | No | Yes |
| **Crafting** | Player creates | No | No | No |
| **Quest Rewards** | Specific quest gear | Specific quest skills | Yes | Yes |

### Normal Mob Drops (NO GEAR)

| Drop Type | Chance per Kill | What Drops |
|-----------|----------------|------------|
| Resources | 30-50% | 1-5 of the zone's resource type |
| Currency (WC) | 80% | 5-50 WC based on zone level |
| Skills | 2-5% | Random skill from zone's tier pool |
| Consumables | 10-20% | Basic consumables (bandages, food) |
| Enhancement Shards | 5-10% | Used for re-rolling enchantments |
| **Gear** | **0% - NEVER** | **Normal mobs NEVER drop equipment** |

### Boss Drops (GEAR SOURCE)

| Drop | Count | Notes |
|------|-------|-------|
| Equipment piece | 1 guaranteed | Always [Salvaged] tag. Rarity based on zone tier table. |
| Skill | 1 guaranteed | Rarity based on zone tier table. |
| Resources | 5-20 | Bonus zone resources. |
| Currency (WC) | 100-2000 | Based on zone level. |
| Enhancement Shards | 1-5 | Guaranteed from bosses. |
| Facet Stone (rare) | 10-20% chance | Used to re-roll a facet on equipment. |
