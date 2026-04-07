# Wasteland Grind - Complete Game Wiki & Data Reference

---

## TABLE OF CONTENTS

1. [Core Rules](#core-rules)
2. [XP Table](#xp-table)
3. [Combat Attributes & Stats](#combat-attributes--stats)
4. [Gathering Skills](#gathering-skills)
5. [Production Skills](#production-skills)
6. [Combat Skills](#combat-skills)
7. [Equipment System](#equipment-system)
8. [Weapons - Full List](#weapons---full-list)
9. [Armor - Full List](#armor---full-list)
10. [Tools - Full List](#tools---full-list)
11. [Consumables & Medicine](#consumables--medicine)
12. [Resource Flow Chart](#resource-flow-chart)
13. [Combat Simulation](#combat-simulation)
14. [PVP & GVG](#pvp--gvg)
15. [Cash Shop](#cash-shop)

---

## CORE RULES

- **No Energy System** - Players can train freely without stamina/energy gates
- **Level Cap:** 100 for every skill
- **Idle Cap:** 8 hours/day (free), extendable via cash shop
- **Offline Progress:** Calculated on login up to idle cap
- **Auto-save:** Every 30 seconds + on browser close
- **Stat Points:** Players get 3 stat points per combat level to allocate freely
- **No fixed builds** - Mix and match gear, stats, and combat styles

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

---

## COMBAT ATTRIBUTES & STATS

### Primary Attributes (Player Allocated)

Players earn **3 attribute points per character level** (character level = average of all combat skill levels, rounded down). They allocate these freely. **Respec available** via rare consumable.

| Attribute | Abbrev | What It Does |
|-----------|--------|-------------|
| **Strength** | STR | Increases Close Combat damage (+2 per point). Required for heavy weapons and heavy armor. Increases carry capacity. |
| **Dexterity** | DEX | Increases Marksmanship damage (+2 per point). Increases Turn Speed (+0.5 per point). Increases Evasion (+0.3% per point). Required for light weapons and light armor. |
| **Intelligence** | INT | Increases Demolitions damage (+2 per point). Increases Critical Damage multiplier (+1% per point). Required for tech weapons and tech armor. |
| **Constitution** | CON | Increases Max HP (+8 per point). Increases HP Regen (+0.5 per turn per point). Increases Status Resistance (+0.5% per point). |
| **Perception** | PER | Increases Critical Hit Chance (+0.4% per point). Increases Accuracy (+0.5% per point). Better loot detection in PVE. |
| **Luck** | LUK | Increases rare drop chance (+0.2% per point). Small bonus to Crit (+0.1%), Evasion (+0.1%), and Accuracy (+0.1%) per point. Better loot quality in PVE. |

### Derived Stats (Calculated from Attributes + Gear)

| Stat | Base Value | Sources |
|------|-----------|---------|
| **Max HP** | 100 | +8 per CON, +gear bonuses, +Fortification skill level * 3 |
| **Melee Attack** | 5 | +2 per STR, +weapon bonus, +Close Combat skill level * 1.5 |
| **Ranged Attack** | 5 | +2 per DEX, +weapon bonus, +Marksmanship skill level * 1.5 |
| **Blast Attack** | 5 | +2 per INT, +weapon bonus, +Demolitions skill level * 1.5 |
| **Defense** | 0 | +armor bonus, +Fortification skill level * 1 |
| **Evasion** | 5% | +0.3% per DEX, +gear bonuses, cap 50% |
| **Accuracy** | 80% | +0.5% per PER, +0.1% per LUK, +gear bonuses, cap 99% |
| **Critical Chance** | 5% | +0.4% per PER, +0.1% per LUK, +gear bonuses, cap 60% |
| **Critical Damage** | 150% | +1% per INT, +gear bonuses |
| **Turn Speed** | 100 | +0.5 per DEX, +gear bonuses/penalties. Determines action order in combat. |
| **HP Regen** | 1/turn | +0.5 per CON, +gear bonuses |
| **Status Resistance** | 0% | +0.5% per CON, +gear bonuses. Chance to resist debuffs. |
| **Damage Reduction** | 0% | From armor passive effects. Flat % reduction after defense calc. |

### Example Builds

| Build Name | Primary Stats | Playstyle |
|------------|--------------|-----------|
| **Tank** | CON + STR | Heavy armor, high HP, slow but unkillable. Melee fighter. |
| **Berserker** | STR + PER | Big melee hits, high crit, medium HP. Glass cannon. |
| **Sniper** | DEX + PER | Fast turns, high accuracy, devastating crits. Stays at range. |
| **Demolitionist** | INT + CON | Explosive AoE damage, survives own splash. |
| **Assassin** | DEX + LUK | Fast, evasive, lucky crits. Dodges everything. |
| **Juggernaut** | CON + STR + INT | Tanky bomber. Slow but survives and deals blast damage. |
| **Hybrid** | Even spread | Jack of all trades, master of none. Flexible but weaker peak. |

---

## GATHERING SKILLS

Each gathering skill has **3 focused activities** and **1 mixed activity**.
- **Focused** = higher quantity of 1 specific resource (2-4 base)
- **Mixed** = get all 3 resources but at reduced quantity (1-2 each)

### Gathering Speed & Scaling

| Level Range | Action Time | Qty Multiplier | XP/Action Multiplier |
|-------------|-------------|----------------|---------------------|
| 1-10        | 4.0s        | x1.0           | x1.0                |
| 11-25       | 3.5s        | x1.2           | x1.3                |
| 26-40       | 3.0s        | x1.5           | x1.6                |
| 41-60       | 2.5s        | x1.8           | x2.0                |
| 61-80       | 2.0s        | x2.2           | x2.5                |
| 81-100      | 1.5s        | x2.8           | x3.0                |

### 1. SCAVENGING (Searching ruins, buildings, urban wreckage)

> You dig through collapsed buildings, abandoned houses, and urban rubble for construction materials.

| Activity | Resource | Base Qty | XP/Action |
|----------|----------|----------|-----------|
| Scrap Yard | Scrap Metal | 2-4 | 15 |
| Lumber Ruins | Salvaged Wood | 2-4 | 15 |
| Pipe Network | Rusted Pipes | 2-4 | 15 |
| Collapsed District (mixed) | All three | 1-2 each | 20 |

**Resources:**
| Resource | Description | Used In |
|----------|-------------|---------|
| Scrap Metal | Bent and rusty metal sheets and bars | Armorcrafting, Tinkering |
| Salvaged Wood | Charred but usable lumber | Tinkering, Weaponsmithing |
| Rusted Pipes | Plumbing and industrial piping | Weaponsmithing, Tinkering |

### 2. FORAGING (Wilderness plants and organic material)

> Trek through irradiated forests, swamps, and plains for edible and useful plant life.

| Activity | Resource | Base Qty | XP/Action |
|----------|----------|----------|-----------|
| Herb Patch | Wild Herbs | 2-4 | 12 |
| Berry Thicket | Wasteland Berries | 2-4 | 12 |
| Root Dig | Mutant Roots | 2-4 | 12 |
| Overgrown Trail (mixed) | All three | 1-2 each | 16 |

**Resources:**
| Resource | Description | Used In |
|----------|-------------|---------|
| Wild Herbs | Medicinal and aromatic plants | Cooking, Biochemistry |
| Wasteland Berries | Mildly irradiated but edible fruit | Cooking, Biochemistry |
| Mutant Roots | Oversized root vegetables | Cooking, Biochemistry |

### 3. SALVAGE HUNTING (Stripping vehicles, machines, tech)

> Dismantle wrecked cars, factory equipment, and old-world machines for precision parts. **Different from Scavenging:** Scavenging = buildings for raw materials. Salvage Hunting = machines for precision parts.

| Activity | Resource | Base Qty | XP/Action |
|----------|----------|----------|-----------|
| Wreck Yard | Mechanical Parts | 2-4 | 18 |
| Tech Lab | Electronic Components | 2-4 | 18 |
| Fuel Depot | Chemical Fluids | 2-4 | 18 |
| Abandoned Factory (mixed) | All three | 1-2 each | 24 |

**Resources:**
| Resource | Description | Used In |
|----------|-------------|---------|
| Mechanical Parts | Gears, springs, bolts, bearings | Tinkering, Weaponsmithing, Engineering |
| Electronic Components | Wiring, circuit boards, capacitors | Tinkering, Engineering |
| Chemical Fluids | Oil, coolant, hydraulic fluid | Biochemistry, Weaponsmithing |

### 4. WATER RECLAMATION (Collecting and filtering water)

> Find, collect, and process water from various contaminated sources.

| Activity | Resource | Base Qty | XP/Action |
|----------|----------|----------|-----------|
| Rain Collectors | Rainwater | 2-4 | 14 |
| Deep Well | Well Water | 2-4 | 14 |
| River Filter | River Water | 2-4 | 14 |
| Water Survey (mixed) | All three | 1-2 each | 18 |

**Resources:**
| Resource | Description | Used In |
|----------|-------------|---------|
| Rainwater | Collected from rooftop traps, mildly clean | Cooking |
| Well Water | Deep underground, mineral-rich | Biochemistry |
| River Water | Surface water, needs filtering but abundant | Cooking, Biochemistry |

### 5. PROSPECTING (Mining ores and minerals)

> Mine exposed rock faces, cave systems, and craters for ores and minerals.

| Activity | Resource | Base Qty | XP/Action |
|----------|----------|----------|-----------|
| Iron Vein | Iron Ore | 2-4 | 18 |
| Copper Deposit | Copper Ore | 2-4 | 18 |
| Stone Quarry | Raw Stone | 2-4 | 18 |
| Open Pit Mine (mixed) | All three | 1-2 each | 24 |

**Resources:**
| Resource | Description | Used In |
|----------|-------------|---------|
| Iron Ore | Common but essential metal | Weaponsmithing, Armorcrafting |
| Copper Ore | Conductive ore for electronics and alloys | Tinkering, Armorcrafting |
| Raw Stone | Rock and mineral chunks | Engineering, Armorcrafting |

---

## PRODUCTION SKILLS

### 6. COOKING (Foraging + Water → Food Buffs)

See [Consumables & Medicine](#consumables--medicine) for full recipe list.

### 7. TINKERING (Scavenging + Salvage Hunting → Tools)

See [Tools - Full List](#tools---full-list) for full recipe list.

### 8. WEAPONSMITHING (Prospecting + Salvage + Scavenging → Weapons)

See [Weapons - Full List](#weapons---full-list) for full recipe list.

### 9. ARMORCRAFTING (Prospecting + Scavenging → Armor)

See [Armor - Full List](#armor---full-list) for full recipe list.

### 10. BIOCHEMISTRY (Foraging + Water + Prospecting → Medicine & Chems)

See [Consumables & Medicine](#consumables--medicine) for full recipe list.

---

## COMBAT SKILLS

### 11. CLOSE COMBAT (Melee fighting)
- **Primary scaling:** Strength
- **Damage type:** Melee
- **Per level:** +1.5 base Melee Attack
- **XP sources:** PVE melee fights, PVP, dungeons
- **Weapons used:** Pipes, blades, hammers, axes, fists

### 12. MARKSMANSHIP (Ranged fighting)
- **Primary scaling:** Dexterity
- **Damage type:** Ranged
- **Per level:** +1.5 base Ranged Attack
- **XP sources:** PVE ranged fights, PVP, dungeons
- **Weapons used:** Bows, crossbows, rifles, pistols

### 13. DEMOLITIONS (Explosive/AoE fighting)
- **Primary scaling:** Intelligence
- **Damage type:** Blast (AoE in GVG, single-target in PVP)
- **Per level:** +1.5 base Blast Attack
- **XP sources:** PVE blast fights, PVP, dungeons, crafting explosives
- **Weapons used:** Grenades, mines, launchers, pipe bombs, molotovs

### 14. FORTIFICATION (Defense & HP)
- **Primary scaling:** Constitution
- **Per level:** +3 Max HP, +1 Defense
- **XP sources:** Taking damage in PVE/PVP, blocking, surviving fights
- **Passive:** Higher Fortification = more effective armor

### 15. TACTICS (Speed, crits, evasion)
- **Primary scaling:** Perception + Dexterity
- **Per level:** +0.2% Crit Chance, +0.15% Evasion, +0.5 Turn Speed
- **XP sources:** Winning fights, landing crits, dodging attacks
- **Passive:** Higher Tactics = smarter auto-combat AI decisions

### 16. ENGINEERING (Structures, siege, GVG)
- **Primary scaling:** Intelligence
- **Per level:** +1 Structure HP, +1 Siege Damage
- **XP sources:** Building clan war structures, crafting siege items
- **Unique:** Feeds directly into GVG system

---

## EQUIPMENT SYSTEM

### Equipment Slots (11 total)

| Slot | Count | Source | Notes |
|------|-------|--------|-------|
| **Main Hand** | 1 | Weaponsmithing | Weapon. If 2-handed, Off Hand is locked. |
| **Off Hand** | 1 | Weaponsmithing / Armorcrafting | Shield, secondary weapon, ammo pouch. Blocked by 2H weapons. |
| **Armor** (Body) | 1 | Armorcrafting | Chest armor - highest defense slot. |
| **Legs** | 1 | Armorcrafting | Leg guards, greaves. |
| **Gloves** | 1 | Armorcrafting | Gauntlets, wraps. Often accuracy/crit bonuses. |
| **Boots** | 1 | Armorcrafting | Footwear. Often Turn Speed or Evasion bonuses. |
| **Ring** | 3 | Tinkering / Drops | Small stat bonuses. 3 slots allow stacking. |
| **Earring** | 2 | Tinkering / Drops | Utility bonuses (Status Resist, HP Regen). |
| **Necklace** | 1 | Tinkering / Drops | Major stat bonus, often unique effects. |

### Item Rarity

| Rarity | Color | Bonus Attributes | Negative Effects | Drop Rate |
|--------|-------|-----------------|-----------------|-----------|
| **Common** | White | 0 | 0 | 60% |
| **Rare** | Blue | 2 random bonuses | 0 | 25% |
| **Unique** | Purple | 3 random bonuses (20% stronger) | 0 | 12% |
| **Plague** | Orange | 6 random bonuses (50% stronger) | 2 random negatives | 3% |

See GAME_WIKI_HEROES.md for full rarity details, bonus pools, and crafting rarity chances.

### Gear Tiers & Level Gates

All equipment comes in 8 tiers matching level gates:

| Tier | Level Gate | Gear Quality | Positive Effects | Negative Effects |
|------|-----------|-------------|-----------------|-----------------|
| T1   | Level 1   | Scrap       | 1-2 positives   | 0-1 negative    |
| T2   | Level 15  | Makeshift   | 2 positives     | 1 negative      |
| T3   | Level 30  | Sturdy      | 2-3 positives   | 1 negative      |
| T4   | Level 45  | Reinforced  | 3 positives     | 1 negative      |
| T5   | Level 60  | Military    | 3-4 positives   | 1 negative      |
| T6   | Level 80  | Elite       | 4 positives     | 1 negative      |
| T7   | Level 90  | Masterwork  | 4-5 positives   | 1 negative      |
| T8   | Level 100 | Legendary   | 5 positives     | 1 negative      |

### The Trade-off Rule

**Every piece of gear T2+ has at least 1 downside.** This is the core of build diversity. Players must choose what weakness they're willing to accept.

**Possible downsides:**
| Downside | Effect | Thematic Reason |
|----------|--------|-----------------|
| **Sluggish** | -10 to -30 Turn Speed | Heavy/bulky gear slows you down |
| **Fragile** | -5% to -15% Max HP | Light gear doesn't protect vitals |
| **Tunnel Vision** | -5% to -15% Evasion | Restricted visibility/mobility |
| **Unstable** | -3% to -10% Accuracy | Recoil, weight imbalance |
| **Draining** | -1 to -3 HP Regen per turn | Gear is uncomfortable, chafes, or irradiated |
| **Conspicuous** | -5% to -15% Crit Chance | Makes you obvious, harder to surprise enemies |
| **Volatile** | Self-damage (2-5% of blast) on use | Explosives are dangerous to the user |
| **Corroded** | Loses durability 20-50% faster | Wasteland materials degrade |

---

## WEAPONS - FULL LIST

### MELEE WEAPONS (Close Combat / Strength)

| Weapon | Tier | Lvl Req | Stat Req | Positives | Negative | Crafting Inputs |
|--------|------|---------|----------|-----------|----------|-----------------|
| **Sharpened Pipe** | T1 | 1 | - | +8 Melee Atk | - | 3 Rusted Pipes, 2 Scrap Metal |
| **Rusty Machete** | T1 | 1 | - | +10 Melee Atk, +2% Crit | - | 4 Scrap Metal, 2 Iron Ore |
| **Spiked Club** | T2 | 15 | 10 STR | +22 Melee Atk, +15 Max HP | Sluggish: -8 Turn Speed | 8 Salvaged Wood, 5 Iron Ore, 3 Scrap Metal |
| **Raider's Cleaver** | T2 | 15 | 8 STR, 5 DEX | +20 Melee Atk, +3% Crit | Fragile: -5% Max HP | 6 Iron Ore, 4 Scrap Metal, 3 Chemical Fluids |
| **War Axe** | T3 | 30 | 20 STR | +38 Melee Atk, +25 Max HP, +3% Crit | Sluggish: -12 Turn Speed | 12 Iron Ore, 8 Scrap Metal, 4 Salvaged Wood |
| **Serrated Blade** | T3 | 30 | 15 STR, 10 DEX | +35 Melee Atk, +5% Crit, +5 Turn Speed | Fragile: -8% Max HP | 10 Iron Ore, 6 Copper Ore, 5 Chemical Fluids |
| **Reinforced Mace** | T4 | 45 | 30 STR | +55 Melee Atk, +40 Max HP, +5% Crit | Sluggish: -15 Turn Speed | 18 Iron Ore, 12 Scrap Metal, 6 Mechanical Parts |
| **Assassin's Dirk** | T4 | 45 | 20 STR, 20 DEX | +48 Melee Atk, +8% Crit, +10 Turn Speed | Fragile: -10% Max HP | 15 Iron Ore, 8 Copper Ore, 8 Chemical Fluids |
| **Warlord's Hammer** | T5 | 60 | 45 STR | +78 Melee Atk, +60 Max HP, +8% Crit, +2 HP Regen | Sluggish: -20 Turn Speed | 25 Iron Ore, 15 Scrap Metal, 10 Mechanical Parts, 5 Chemical Fluids |
| **Shadow Fang** | T5 | 60 | 30 STR, 30 DEX | +70 Melee Atk, +12% Crit, +15 Turn Speed | Fragile: -12% Max HP, Draining: -1 HP Regen | 20 Iron Ore, 12 Copper Ore, 10 Chemical Fluids, 5 Electronic Components |
| **Titan Cleaver** | T6 | 80 | 60 STR | +110 Melee Atk, +80 Max HP, +10% Crit, +3 HP Regen | Sluggish: -25 Turn Speed | 40 Iron Ore, 25 Scrap Metal, 15 Mechanical Parts, 10 Chemical Fluids |
| **Phantom Blade** | T6 | 80 | 40 STR, 40 DEX | +95 Melee Atk, +15% Crit, +20 Turn Speed, +8% Evasion | Fragile: -15% Max HP | 30 Iron Ore, 20 Copper Ore, 15 Chemical Fluids, 10 Electronic Components |
| **Apocalypse Edge** | T7 | 90 | 75 STR | +140 Melee Atk, +100 Max HP, +12% Crit, +20% Crit Dmg, +4 HP Regen | Sluggish: -28 Turn Speed | 55 Iron Ore, 35 Scrap Metal, 20 Mechanical Parts, 15 Chemical Fluids |
| **Doomsday Maul** | T8 | 100 | 90 STR | +180 Melee Atk, +130 Max HP, +15% Crit, +30% Crit Dmg, +5 HP Regen | Sluggish: -30 Turn Speed | 80 Iron Ore, 50 Scrap Metal, 30 Mechanical Parts, 20 Chemical Fluids, 10 Raw Stone |

### RANGED WEAPONS (Marksmanship / Dexterity)

| Weapon | Tier | Lvl Req | Stat Req | Positives | Negative | Crafting Inputs |
|--------|------|---------|----------|-----------|----------|-----------------|
| **Slingshot** | T1 | 1 | - | +6 Ranged Atk, +3 Turn Speed | - | 2 Salvaged Wood, 2 Rusted Pipes |
| **Scrap Bow** | T1 | 1 | - | +9 Ranged Atk, +2% Accuracy | - | 3 Salvaged Wood, 2 Scrap Metal, 1 Chemical Fluids |
| **Pipe Pistol** | T2 | 15 | 10 DEX | +20 Ranged Atk, +8 Turn Speed | Unstable: -5% Accuracy | 6 Rusted Pipes, 4 Mechanical Parts, 3 Chemical Fluids |
| **Hunting Crossbow** | T2 | 15 | 8 DEX, 5 PER | +18 Ranged Atk, +5% Accuracy, +3% Crit | Sluggish: -5 Turn Speed (reload) | 5 Salvaged Wood, 4 Mechanical Parts, 3 Iron Ore |
| **Bolt-Action Rifle** | T3 | 30 | 20 DEX | +35 Ranged Atk, +8% Accuracy, +5% Crit | Sluggish: -10 Turn Speed | 10 Iron Ore, 6 Rusted Pipes, 5 Mechanical Parts, 3 Chemical Fluids |
| **Twin Pistols** | T3 | 30 | 15 DEX, 10 PER | +30 Ranged Atk, +15 Turn Speed, +4% Crit | Unstable: -8% Accuracy | 8 Rusted Pipes, 6 Mechanical Parts, 5 Copper Ore |
| **Scoped Carbine** | T4 | 45 | 30 DEX | +52 Ranged Atk, +12% Accuracy, +8% Crit | Sluggish: -12 Turn Speed | 15 Iron Ore, 10 Rusted Pipes, 8 Mechanical Parts, 4 Electronic Components |
| **Repeater Crossbow** | T4 | 45 | 20 DEX, 15 PER | +48 Ranged Atk, +10 Turn Speed, +10% Crit | Fragile: -8% Max HP | 12 Salvaged Wood, 10 Mechanical Parts, 6 Iron Ore, 4 Chemical Fluids |
| **Marksman's Rifle** | T5 | 60 | 45 DEX | +75 Ranged Atk, +15% Accuracy, +10% Crit, +5 Turn Speed | Conspicuous: -8% Crit Chance (scope glint) | 20 Iron Ore, 15 Rusted Pipes, 10 Mechanical Parts, 8 Electronic Components |
| **Dual Revolvers** | T5 | 60 | 30 DEX, 25 PER | +68 Ranged Atk, +20 Turn Speed, +12% Crit | Unstable: -10% Accuracy | 18 Iron Ore, 12 Mechanical Parts, 10 Copper Ore, 8 Chemical Fluids |
| **Anti-Material Rifle** | T6 | 80 | 60 DEX | +105 Ranged Atk, +18% Accuracy, +12% Crit, +25% Crit Dmg | Sluggish: -20 Turn Speed | 35 Iron Ore, 20 Rusted Pipes, 15 Mechanical Parts, 10 Electronic Components |
| **Storm Repeater** | T6 | 80 | 40 DEX, 35 PER | +90 Ranged Atk, +25 Turn Speed, +15% Crit, +10% Evasion | Unstable: -12% Accuracy | 30 Iron Ore, 15 Mechanical Parts, 15 Copper Ore, 10 Chemical Fluids |
| **Railgun** | T7 | 90 | 75 DEX | +135 Ranged Atk, +20% Accuracy, +15% Crit, +35% Crit Dmg, +8 Turn Speed | Draining: -2 HP Regen | 50 Iron Ore, 25 Copper Ore, 20 Electronic Components, 15 Chemical Fluids |
| **Oblivion Cannon** | T8 | 100 | 90 DEX | +175 Ranged Atk, +22% Accuracy, +18% Crit, +45% Crit Dmg, +15 Turn Speed | Draining: -3 HP Regen | 70 Iron Ore, 40 Copper Ore, 30 Electronic Components, 25 Chemical Fluids, 10 Mechanical Parts |

### DEMOLITIONS WEAPONS (Demolitions / Intelligence)

| Weapon | Tier | Lvl Req | Stat Req | Positives | Negative | Crafting Inputs |
|--------|------|---------|----------|-----------|----------|-----------------|
| **Molotov Cocktail** | T1 | 1 | - | +7 Blast Atk | - | 2 Chemical Fluids, 1 Salvaged Wood |
| **Pipe Bomb** | T1 | 1 | - | +10 Blast Atk | Volatile: 3% self-damage | 3 Rusted Pipes, 2 Chemical Fluids, 1 Scrap Metal |
| **Frag Grenade** | T2 | 15 | 10 INT | +22 Blast Atk, +5% Crit Dmg | Volatile: 4% self-damage | 5 Scrap Metal, 4 Chemical Fluids, 3 Iron Ore |
| **Incendiary Mine** | T2 | 15 | 8 INT, 5 PER | +20 Blast Atk, +5% Crit, DoT 3/turn for 3 turns | Conspicuous: -5% Crit Chance (visible placement) | 6 Chemical Fluids, 4 Electronic Components, 3 Scrap Metal |
| **Concussion Launcher** | T3 | 30 | 20 INT | +38 Blast Atk, +10% Crit Dmg, Stun 15% chance | Volatile: 5% self-damage | 10 Rusted Pipes, 8 Chemical Fluids, 5 Mechanical Parts |
| **Cluster Mine** | T3 | 30 | 15 INT, 10 PER | +34 Blast Atk, +8% Crit, Hit 1-3 targets (GVG) | Sluggish: -8 Turn Speed (setup time) | 8 Scrap Metal, 6 Chemical Fluids, 5 Electronic Components |
| **Rocket Launcher** | T4 | 45 | 30 INT | +55 Blast Atk, +15% Crit Dmg, Stun 20% chance | Volatile: 6% self-damage, Sluggish: -10 Turn Speed | 15 Rusted Pipes, 12 Chemical Fluids, 8 Mechanical Parts, 5 Electronic Components |
| **Toxic Gas Canister** | T4 | 45 | 20 INT, 15 CON | +48 Blast Atk, DoT 8/turn for 4 turns, -10% enemy Evasion | Volatile: 4% self-damage | 12 Chemical Fluids, 8 Mutant Roots, 5 Well Water, 5 Electronic Components |
| **Siege Mortar** | T5 | 60 | 45 INT | +78 Blast Atk, +20% Crit Dmg, Stun 25% chance, +15% in GVG | Volatile: 7% self-damage, Sluggish: -15 Turn Speed | 25 Rusted Pipes, 18 Chemical Fluids, 12 Mechanical Parts, 8 Electronic Components |
| **Napalm Launcher** | T5 | 60 | 35 INT, 20 CON | +70 Blast Atk, DoT 15/turn for 5 turns, -15% enemy Evasion | Volatile: 6% self-damage, Draining: -1 HP Regen | 20 Chemical Fluids, 15 Rusted Pipes, 10 Mechanical Parts, 8 Mutant Roots |
| **Plasma Bombard** | T6 | 80 | 60 INT | +110 Blast Atk, +30% Crit Dmg, Stun 30%, +25% in GVG | Volatile: 8% self-damage, Sluggish: -20 Turn Speed | 40 Chemical Fluids, 25 Electronic Components, 20 Copper Ore, 15 Mechanical Parts |
| **Radiation Emitter** | T6 | 80 | 45 INT, 30 CON | +95 Blast Atk, DoT 20/turn for 5 turns, -20% enemy Evasion, +10% Status Resist | Volatile: 7% self-damage | 35 Chemical Fluids, 20 Iron Ore, 15 Mutant Roots, 15 Well Water |
| **Orbital Strike Beacon** | T7 | 90 | 75 INT | +140 Blast Atk, +40% Crit Dmg, Stun 35%, +35% in GVG, -10% enemy Defense | Volatile: 9% self-damage, Sluggish: -25 Turn Speed | 55 Electronic Components, 40 Chemical Fluids, 30 Copper Ore, 20 Mechanical Parts |
| **Apocalypse Device** | T8 | 100 | 90 INT | +180 Blast Atk, +50% Crit Dmg, Stun 40%, +50% in GVG, -15% enemy Defense, DoT 25/turn for 3 turns | Volatile: 10% self-damage, Sluggish: -28 Turn Speed | 80 Electronic Components, 60 Chemical Fluids, 40 Copper Ore, 30 Mechanical Parts, 20 Iron Ore |

---

## ARMOR - FULL LIST

### BODY ARMOR

Three armor archetypes per tier: **Heavy** (STR req, high def, slow), **Medium** (balanced), **Light** (DEX req, fast, evasive), **Tech** (INT req, blast bonuses).

#### Tier 1 (Level 1)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Patched Vest** | - | +5 Defense, +10 Max HP | - |
| **Cloth Wrappings** | - | +3 Defense, +3 Turn Speed | - |

#### Tier 2 (Level 15)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Scrap Plate Chest** | 10 STR | +18 Defense, +30 Max HP | Sluggish: -10 Turn Speed |
| **Leather Duster** | 8 DEX | +12 Defense, +8 Turn Speed, +3% Evasion | Fragile: -5% Max HP |
| **Padded Lab Coat** | 8 INT | +10 Defense, +5% Status Resist, +3% Crit Dmg | Fragile: -5% Max HP |
| **Survivalist Jacket** | 8 CON | +14 Defense, +20 Max HP, +1 HP Regen | Sluggish: -5 Turn Speed |

#### Tier 3 (Level 30)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Iron Breastplate** | 20 STR | +32 Defense, +50 Max HP, +1 HP Regen | Sluggish: -15 Turn Speed |
| **Ranger's Hide** | 18 DEX | +22 Defense, +12 Turn Speed, +6% Evasion | Fragile: -8% Max HP |
| **Insulated Tech Vest** | 18 INT | +20 Defense, +10% Status Resist, +8% Crit Dmg | Fragile: -8% Max HP |
| **Endurance Harness** | 18 CON | +26 Defense, +40 Max HP, +2 HP Regen | Conspicuous: -5% Crit Chance |

#### Tier 4 (Level 45)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Plated War Armor** | 30 STR | +48 Defense, +80 Max HP, +2 HP Regen | Sluggish: -20 Turn Speed |
| **Shadow Leathers** | 28 DEX | +34 Defense, +18 Turn Speed, +10% Evasion | Fragile: -10% Max HP |
| **Hazmat Suit** | 28 INT | +30 Defense, +15% Status Resist, +12% Crit Dmg | Tunnel Vision: -8% Evasion |
| **Juggernaut Vest** | 28 CON | +40 Defense, +70 Max HP, +3 HP Regen | Sluggish: -12 Turn Speed |

#### Tier 5 (Level 60)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Fortress Plate** | 45 STR | +68 Defense, +120 Max HP, +3 HP Regen, +5% Dmg Reduction | Sluggish: -25 Turn Speed |
| **Nightstalker Suit** | 42 DEX | +48 Defense, +22 Turn Speed, +14% Evasion, +5% Crit | Fragile: -12% Max HP |
| **Reactor Vest** | 42 INT | +42 Defense, +20% Status Resist, +18% Crit Dmg, +5% Blast Atk | Draining: -2 HP Regen |
| **Titan Frame** | 42 CON | +55 Defense, +100 Max HP, +4 HP Regen, +5% Status Resist | Sluggish: -18 Turn Speed |

#### Tier 6 (Level 80)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Siege Bulwark** | 60 STR | +95 Defense, +160 Max HP, +4 HP Regen, +10% Dmg Reduction | Sluggish: -30 Turn Speed |
| **Wraith Armor** | 55 DEX | +68 Defense, +28 Turn Speed, +18% Evasion, +8% Crit | Fragile: -15% Max HP |
| **Fusion Core Suit** | 55 INT | +60 Defense, +25% Status Resist, +25% Crit Dmg, +10% Blast Atk | Draining: -3 HP Regen |
| **Immortal Chassis** | 55 CON | +80 Defense, +150 Max HP, +5 HP Regen, +10% Status Resist | Sluggish: -22 Turn Speed |

#### Tier 7 (Level 90)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Dreadnought Plate** | 75 STR | +125 Defense, +200 Max HP, +5 HP Regen, +15% Dmg Reduction, +5% Crit | Sluggish: -35 Turn Speed |
| **Phantom Shroud** | 70 DEX | +90 Defense, +35 Turn Speed, +22% Evasion, +12% Crit, +10% Accuracy | Fragile: -18% Max HP |
| **Quantum Harness** | 70 INT | +80 Defense, +30% Status Resist, +35% Crit Dmg, +15% Blast Atk, +5% Crit | Draining: -4 HP Regen |

#### Tier 8 (Level 100)
| Armor | Stat Req | Positives | Negative |
|-------|----------|-----------|----------|
| **Apocalypse Aegis** | 90 STR | +160 Defense, +250 Max HP, +6 HP Regen, +20% Dmg Reduction, +8% Crit, +3% Status Resist | Sluggish: -38 Turn Speed |
| **Void Walker Suit** | 85 DEX | +115 Defense, +40 Turn Speed, +28% Evasion, +15% Crit, +12% Accuracy, +5% Crit Dmg | Fragile: -20% Max HP |
| **Singularity Frame** | 85 INT | +100 Defense, +35% Status Resist, +45% Crit Dmg, +20% Blast Atk, +8% Crit, +5% Evasion | Draining: -5 HP Regen |
| **Eternity Shell** | 85 CON | +130 Defense, +300 Max HP, +8 HP Regen, +15% Status Resist, +10% Dmg Reduction, +5% Crit | Sluggish: -30 Turn Speed |

### HEAD ARMOR

| Helmet | Tier | Lvl | Stat Req | Positives | Negative |
|--------|------|-----|----------|-----------|----------|
| **Scrap Helmet** | T1 | 1 | - | +3 Defense | - |
| **Welding Mask** | T2 | 15 | 8 STR | +8 Defense, +10 Max HP | Tunnel Vision: -3% Evasion |
| **Scout Goggles** | T2 | 15 | 8 DEX | +5 Defense, +5% Accuracy | Fragile: -3% Max HP |
| **Night Vision Helm** | T3 | 30 | 18 DEX | +10 Defense, +8% Accuracy, +3% Crit | Draining: -1 HP Regen |
| **Blast Shield** | T3 | 30 | 18 STR | +15 Defense, +20 Max HP | Tunnel Vision: -5% Evasion |
| **Tactical HUD** | T4 | 45 | 28 INT | +12 Defense, +10% Accuracy, +5% Crit, +5% Crit Dmg | Draining: -1 HP Regen |
| **Juggernaut Helm** | T4 | 45 | 28 STR | +22 Defense, +35 Max HP, +1 HP Regen | Tunnel Vision: -8% Evasion |
| **Predator Visor** | T5 | 60 | 42 PER | +15 Defense, +12% Accuracy, +8% Crit, +10% Crit Dmg | Fragile: -8% Max HP |
| **Fortress Helm** | T5 | 60 | 42 STR | +30 Defense, +50 Max HP, +2 HP Regen | Tunnel Vision: -10% Evasion |
| **Wasteland Crown** | T6 | 80 | 55 PER | +20 Defense, +15% Accuracy, +12% Crit, +15% Crit Dmg | Fragile: -10% Max HP |
| **Doom Bastion** | T6 | 80 | 55 STR | +40 Defense, +70 Max HP, +3 HP Regen | Tunnel Vision: -12% Evasion |
| **All-Seeing Helm** | T7 | 90 | 70 PER | +28 Defense, +18% Accuracy, +15% Crit, +20% Crit Dmg, +5 Turn Speed | Fragile: -12% Max HP |
| **Omega Bastion** | T8 | 100 | 85 STR | +55 Defense, +100 Max HP, +4 HP Regen, +5% Dmg Reduction | Tunnel Vision: -15% Evasion |

---

## TOOLS - FULL LIST

| Tool | Tier | Lvl | Crafting Inputs | Effect | Negative |
|------|------|-----|-----------------|--------|----------|
| **Basic Toolkit** | T1 | 1 | 5 Scrap Metal, 3 Mechanical Parts | +5% all gathering speed | - |
| **Reinforced Axe** | T2 | 15 | 8 Scrap Metal, 5 Salvaged Wood, 3 Iron Ore | +10% Scavenging speed, +5% Foraging speed | Corroded: -20% durability |
| **Advanced Filter** | T2 | 15 | 6 Rusted Pipes, 4 Electronic Components | +12% Water Reclamation speed | Corroded: -20% durability |
| **Mining Drill** | T3 | 30 | 8 Mechanical Parts, 6 Rusted Pipes, 5 Copper Ore | +15% Prospecting speed, +5% all gathering | Corroded: -30% durability |
| **Multi-Tool** | T4 | 45 | 12 Scrap Metal, 8 Mechanical Parts, 5 Electronic Components | +12% all gathering speed | Corroded: -30% durability |
| **Automated Harvester** | T5 | 60 | 18 Electronic Components, 12 Mechanical Parts, 8 Chemical Fluids | +18% all gathering speed, +8% production speed | Corroded: -40% durability |
| **Master Toolkit** | T6 | 80 | 25 Electronic Components, 20 Mechanical Parts, 12 Chemical Fluids, 10 Copper Ore | +22% all gathering speed, +12% production speed | Corroded: -40% durability |
| **Quantum Fabricator** | T7 | 90 | 40 Electronic Components, 30 Mechanical Parts, 20 Chemical Fluids, 15 Copper Ore | +28% all gathering, +18% production | Corroded: -50% durability |
| **Singularity Engine** | T8 | 100 | 60 Electronic Components, 45 Mechanical Parts, 30 Chemical Fluids, 20 Copper Ore, 15 Iron Ore | +35% all gathering, +25% production | Corroded: -50% durability |

---

## CONSUMABLES & MEDICINE

### FOOD (from Cooking)

| Item | Cook Lvl | Inputs | Effect | Duration |
|------|----------|--------|--------|----------|
| **Herb Soup** | 1 | 3 Wild Herbs, 2 Rainwater | +5% XP gain | 10 min |
| **Berry Mash** | 5 | 4 Wasteland Berries, 1 Rainwater | Heal 25 HP | Instant |
| **Root Stew** | 10 | 3 Mutant Roots, 2 Well Water | +10% gathering speed | 10 min |
| **Grilled Roots** | 15 | 5 Mutant Roots, 3 Rainwater | +8 STR | 15 min |
| **Berry Wine** | 20 | 6 Wasteland Berries, 3 River Water | +8 DEX, +5 Turn Speed | 15 min |
| **Herb Tea** | 25 | 5 Wild Herbs, 3 Well Water | +8 INT, +3% Crit Dmg | 15 min |
| **Trail Rations** | 30 | 3 each: Herbs, Berries, Roots + 4 Rainwater | +5% all stats | 15 min |
| **Spiced Stew** | 40 | 8 Mutant Roots, 5 Wild Herbs, 5 Rainwater | +15 STR, +15 CON | 20 min |
| **Hunter's Meal** | 45 | 8 Wasteland Berries, 5 Mutant Roots, 5 River Water | +15 DEX, +15 PER | 20 min |
| **Alchemist's Feast** | 50 | 8 Wild Herbs, 5 Wasteland Berries, 5 Well Water | +15 INT, +15 LUK | 20 min |
| **Wasteland Feast** | 60 | 6 each: all 3 forage + 6 River Water | +10% all stats | 20 min |
| **Mutant Brew** | 70 | 10 Wasteland Berries, 8 Well Water, 5 Mutant Roots | +15% combat stats | 20 min |
| **Survivor's Banquet** | 80 | 12 each: all 3 forage + 10 Rainwater + 5 River Water | +20% all stats | 30 min |
| **Legendary Feast** | 90 | 20 each: all 3 forage + 15 each: all 3 water | +25% all stats, +10% XP | 45 min |

### MEDICINE (from Biochemistry)

| Item | Bio Lvl | Inputs | Effect | Duration |
|------|---------|--------|--------|----------|
| **Basic Bandage** | 1 | 3 Wild Herbs, 2 Rainwater | Heal 20 HP | Instant |
| **Herbal Poultice** | 5 | 4 Wild Herbs, 2 Mutant Roots | Heal 15 HP/turn for 3 turns | 3 turns |
| **Antidote** | 10 | 4 Wild Herbs, 3 Wasteland Berries, 2 Well Water | Cure poison + heal 15 HP | Instant |
| **Stimpack** | 20 | 5 Mutant Roots, 4 Well Water, 3 Copper Ore | Heal 60 HP | Instant |
| **Adrenaline Shot** | 30 | 6 Wasteland Berries, 5 Chemical Fluids, 3 Well Water | +20% attack, +10 Turn Speed | 1 fight |
| **Iron Skin Serum** | 35 | 5 Iron Ore, 4 Mutant Roots, 4 Well Water | +25% defense, +5% Dmg Reduction | 1 fight |
| **Rad Shield** | 40 | 8 Mutant Roots, 5 River Water, 4 Iron Ore | +30% Status Resist, +20% defense | 1 fight |
| **Focus Drops** | 45 | 6 Wild Herbs, 5 Well Water, 4 Chemical Fluids | +15% Accuracy, +10% Crit | 1 fight |
| **Berserker Serum** | 50 | 8 Chemical Fluids, 6 Wasteland Berries, 4 Well Water | +35% Melee Atk, -15% Defense | 1 fight |
| **Eagle Eye Drops** | 55 | 8 Wild Herbs, 6 Chemical Fluids, 5 Well Water | +35% Ranged Atk, +20% Accuracy | 1 fight |
| **Demolition Catalyst** | 55 | 10 Chemical Fluids, 6 Mutant Roots, 5 Well Water | +35% Blast Atk, +15% Crit Dmg | 1 fight |
| **Combat Serum** | 60 | 10 Wild Herbs, 8 Chemical Fluids, 5 Well Water | +20% all combat stats | 1 fight |
| **Regeneration Gel** | 65 | 10 Mutant Roots, 8 Well Water, 5 Copper Ore | +8 HP Regen/turn | 1 fight |
| **Perfect Stimpack** | 75 | 15 Mutant Roots, 10 Well Water, 8 Copper Ore | Heal 200 HP | Instant |
| **Phoenix Elixir** | 80 | 15 each: Herbs, Berries, Roots + 10 Well Water + 5 Copper Ore | Full heal + auto-revive from KO once | 1 fight |
| **Respec Serum** | 85 | 20 each: all 3 forage + 15 each: all 3 water + 10 each: all 3 ore | Reset all attribute points | Permanent |
| **War Drug** | 90 | 20 Chemical Fluids, 15 each: Herbs, Berries + 10 Well Water | +30% all combat stats, -20% defense | 1 fight |

---

## RESOURCE FLOW CHART

```
GATHERING                     PRODUCTION                  USE
─────────                     ──────────                  ───

Scavenging ──┬─ Scrap Metal ─────┬──→ Armorcrafting ────→ Heavy/Med Armor
             ├─ Salvaged Wood ───┤──→ Tinkering ────────→ Tools & Gadgets
             └─ Rusted Pipes ────┘──→ Weaponsmithing ──→ Weapons

Foraging ────┬─ Wild Herbs ──────┬──→ Cooking ──────────→ Food Buffs
             ├─ Wasteland Berries┤──→ Biochemistry ────→ Medicine & Chems
             └─ Mutant Roots ────┘

Salvage ─────┬─ Mechanical Parts ┬──→ Tinkering
Hunting      ├─ Electronic Comp. ┤──→ Engineering ─────→ War Structures
             └─ Chemical Fluids ─┘──→ Weaponsmithing (tempering)
                                    → Biochemistry (solvents)

Water ───────┬─ Rainwater ───────┬──→ Cooking
Reclamation  ├─ Well Water ──────┤──→ Biochemistry
             └─ River Water ─────┘

Prospecting ─┬─ Iron Ore ────────┬──→ Weaponsmithing
             ├─ Copper Ore ──────┤──→ Armorcrafting
             └─ Raw Stone ───────┘──→ Engineering
```

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
8. Next combatant's turn
9. Repeat until one side reaches 0 HP

### Damage Formula
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

## SCAVENGING vs SALVAGE HUNTING

| Aspect | Scavenging | Salvage Hunting |
|--------|-----------|-----------------|
| **Where** | Collapsed buildings, houses, urban ruins | Wrecked vehicles, factories, tech labs |
| **What** | Raw construction materials | Precision mechanical & electronic parts |
| **Outputs** | Scrap Metal, Salvaged Wood, Rusted Pipes | Mechanical Parts, Electronic Components, Chemical Fluids |
| **Feeds Into** | Armorcrafting, Tinkering, Weaponsmithing | Tinkering, Engineering, Weaponsmithing, Biochemistry |
| **Theme** | "Tearing down walls for materials" | "Dismantling machines for parts" |

---

## LEVEL MILESTONES (All Skills)

| Level | Milestone |
|-------|-----------|
| 1     | Skill unlocked, T1 gear/recipes |
| 15    | T2 gear/recipes unlock, first speed boost |
| 30    | T3 gear/recipes unlock |
| 45    | T4 gear/recipes unlock |
| 60    | T5 gear/recipes unlock (GRIND WALL begins) |
| 80    | T6 gear/recipes unlock |
| 90    | T7 gear/recipes unlock |
| 100   | T8 Legendary gear, Mastery title, prestige badge |
