# Wasteland Grind - Equipment Reference

Equipment slots, gear tiers (T1-T8), rarity levels, gear sources, crafting chains, stat requirements, base stats by tier, full weapon/armor/accessory catalog.

See also: [Facets & Enchantments](GAME_WIKI_FACETS_ENCHANTS.md) | [Sets](GAME_WIKI_SETS.md) | [Stats](GAME_WIKI_STATS.md) | [Combat](GAME_WIKI_COMBAT.md)

---

## TABLE OF CONTENTS

1. [Equipment Slots](#equipment-slots)
2. [Gear Tiers & Level Gates](#gear-tiers--level-gates)
3. [Item Rarity System](#item-rarity-system)
4. [Rarity Enhancement Rules](#rarity-enhancement-rules)
5. [Crafting Rarity Chances](#crafting-rarity-chances)
6. [Gear Sources & Power Hierarchy](#gear-sources--power-hierarchy)
7. [Gear Chaining](#gear-chaining)
8. [The Trade-off Rule](#the-trade-off-rule)
9. [Enhancement Bonus Pools by Slot](#enhancement-bonus-pools-by-slot)
10. [Downside Pools by Slot](#downside-pools-by-slot)
11. [Reading an Item Card](#reading-an-item-card)
12. [Disenchanting](#disenchanting)
13. [Melee Weapons (Full List)](#melee-weapons)
14. [Ranged Weapons (Full List)](#ranged-weapons)
15. [Demolitions Weapons (Full List)](#demolitions-weapons)
16. [Body Armor (Full List)](#body-armor)
17. [Head Armor](#head-armor)
18. [Accessories](#accessories)
19. [Tools](#tools)
20. [Consumables & Medicine](#consumables--medicine)

---

## EQUIPMENT SLOTS

Each hero has 12 equipment slots:

| Slot | Count | Source | Notes |
|------|-------|--------|-------|
| **Main Hand** | 1 | Weaponsmithing | Weapon. If 2-handed, Off Hand is locked. |
| **Off Hand** | 1 | Weaponsmithing / Armorcrafting | Shield, secondary weapon, ammo pouch. Blocked by 2H weapons. |
| **Armor** (Body) | 1 | Armorcrafting | Chest armor - highest defense slot. |
| **Head** | 1 | Armorcrafting | Helmet - defense and utility. |
| **Legs** | 1 | Armorcrafting | Leg guards, greaves. |
| **Gloves** | 1 | Armorcrafting | Gauntlets, wraps. Often accuracy/crit bonuses. |
| **Boots** | 1 | Armorcrafting | Footwear. Often Turn Speed or Evasion bonuses. |
| **Ring** | 3 | Tinkering / Drops | Small stat bonuses. 3 slots allow stacking. Ring 3 is focus-ring only. |
| **Earring** | 2 | Tinkering / Drops | Utility bonuses (Status Resist, HP Regen). |
| **Necklace** | 1 | Tinkering / Drops | Major stat bonus, often unique effects. |

---

## GEAR TIERS & LEVEL GATES

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

---

## ITEM RARITY SYSTEM

| Rarity | Color | Bonus Attributes | Negative Effects | Bonus Rolls | Enchant Slots |
|--------|-------|-----------------|-----------------|------------|---------------|
| **Common** | White | 0 | 0 | - | 0 |
| **Rare** | Blue | 2 random bonuses | 0 | Base range | 1 |
| **Unique** | Purple | 3 random bonuses (+30% values) | 0 | +30% | 2 |
| **Plague** | Orange | 6 random bonuses (+50% values) | 2 random curses | +50% | 3 |

---

## RARITY ENHANCEMENT RULES

### Common (White)
- Base stats ONLY. No bonus attributes. No downsides beyond inherent.

### Rare (Blue)
- Base stats + **2 random bonuses** from the slot's bonus pool
- No extra downsides. Bonuses roll at base range.

### Unique (Purple)
- Base stats + **3 random bonuses** from the slot's bonus pool
- Bonuses roll at **+30% higher values** compared to Rare
- No extra downsides.

### Plague (Orange)
- Base stats + **6 random bonuses** from the slot's bonus pool
- **2 random downsides** from the downside pool (stack with inherent)
- Bonuses roll at **+50% higher values** compared to Rare
- True endgame min-max gear.

### Enhancement Rules
1. No duplicate bonuses on an item
2. Downsides cannot duplicate each other or the inherent downside
3. Slot-appropriate only
4. Source scaling: [Salvaged] 80% of listed ranges, [Scavenged] 65%

---

## CRAFTING RARITY CHANCES

| Skill Level | Common | Rare | Unique | Plague |
|-------------|--------|------|--------|--------|
| 1-14 | 90% | 10% | 0% | 0% |
| 15-29 | 75% | 22% | 3% | 0% |
| 30-44 | 60% | 30% | 9% | 1% |
| 45-59 | 50% | 32% | 15% | 3% |
| 60-79 | 40% | 35% | 20% | 5% |
| 80-89 | 30% | 35% | 27% | 8% |
| 90-99 | 20% | 35% | 33% | 12% |
| 100 | 15% | 30% | 37% | 18% |

---

## GEAR SOURCES & POWER HIERARCHY

**Core Rule: Crafted gear is ALWAYS stronger than boss-dropped gear of the same tier and rarity.**

| Source | Label | Base Stat Power | Can Roll Rarity? | Enhancement Bonus Power |
|--------|-------|----------------|-----------------|------------------------|
| **Crafted** (Production skills) | [Forged] | 100% (full) | Yes (based on craft skill level) | 100% (full bonus rolls) |
| **Boss Drop** (combat zones) | [Salvaged] | 75% of crafted | Yes (based on zone/boss tier) | 80% of crafted bonus rolls |
| **Normal Mob Drop** | [Scavenged] | 60% of crafted | Yes (mostly Common/Rare) | 65% of crafted bonus rolls |
| **Quest Reward** | [Issued] | 85% of crafted | Fixed rarity (usually Rare) | 90% of crafted bonus rolls |
| **PVP Season Reward** | [Decorated] | 90% of crafted | Fixed rarity (Unique+) | 95% of crafted bonus rolls |

### Full Power Hierarchy (weakest to strongest)

```
[Scavenged] Common (mob drop)        <- Weakest. Vendor trash or early stepping stone.
[Scavenged] Rare (mob drop)
[Salvaged] Common (boss drop)        <- Boss common is still weaker than crafted common.
[Scavenged] Unique (mob drop)
[Salvaged] Rare (boss drop)
[Issued] Rare (quest reward)
[Forged] Common (crafted)            <- CRAFTED STARTS HERE - always stronger base.
[Salvaged] Unique (boss drop)
[Forged] Rare (crafted)              <- The mid-game sweet spot.
[Decorated] Unique (PVP reward)
[Salvaged] Plague (boss drop)        <- Strong bonuses but weaker base than crafted.
[Forged] Unique (crafted)            <- Late-game goal.
[Forged] Plague (crafted)            <- TRUE ENDGAME. Best possible gear in the game.
```

**Key takeaway:** A [Forged] Rare piece beats a [Salvaged] Unique piece. Crafting is king.

---

## GEAR CHAINING

**Rule:** To craft a higher-tier piece, you must sacrifice the previous tier version.

### Example Chain (Melee - Heavy):
```
T1: Sharpened Pipe (Lv.1, free craft)
  -> consumed
T2: Spiked Club (Lv.15, needs Sharpened Pipe + materials)
  -> consumed
T3: War Axe (Lv.30, needs Spiked Club + materials)
  -> consumed
T4: Reinforced Mace (Lv.45, needs War Axe + materials)
  -> consumed
T5: Warlord's Hammer (Lv.60, needs Reinforced Mace + materials)
  -> consumed
T6: Titan Cleaver (Lv.80, needs Warlord's Hammer + materials)
  -> consumed
T7: Apocalypse Edge (Lv.90, needs Titan Cleaver + materials)
  -> consumed
T8: Doomsday Maul (Lv.100, needs Apocalypse Edge + materials)
```

**Why:** This ensures players engage with every tier of content and can't skip ahead.

---

## THE TRADE-OFF RULE

**Every piece of gear T2+ has at least 1 downside.** This is the core of build diversity.

| Downside | Effect | Thematic Reason |
|----------|--------|-----------------|
| **Sluggish** | -10 to -30 Turn Speed | Heavy/bulky gear slows you down |
| **Fragile** | -5% to -15% Max HP | Light gear doesn't protect vitals |
| **Tunnel Vision** | -5% to -15% Evasion | Restricted visibility/mobility |
| **Unstable** | -3% to -10% Accuracy | Recoil, weight imbalance |
| **Draining** | -1 to -3 HP Regen per turn | Gear is uncomfortable, irradiated |
| **Conspicuous** | -5% to -15% Crit Chance | Makes you obvious |
| **Volatile** | Self-damage (2-5% of blast) on use | Explosives are dangerous |
| **Corroded** | Loses durability 20-50% faster | Wasteland materials degrade |

---

## ENHANCEMENT BONUS POOLS BY SLOT

Each equipment slot draws bonus attributes from a specific pool. This prevents nonsensical rolls.

### MAIN HAND (Weapons)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Melee/Ranged/Blast Attack (matches weapon type) | +5 to +12 | +7 to +16 | +10 to +22 |
| +Critical Chance | +2% to +5% | +3% to +7% | +4% to +9% |
| +Critical Damage | +5% to +12% | +7% to +16% | +10% to +22% |
| +Accuracy | +3% to +8% | +4% to +10% | +6% to +14% |
| +Armor Penetration | +3% to +8% | +5% to +10% | +7% to +14% |
| +Turn Speed | +3 to +8 | +5 to +10 | +7 to +14 |
| +DoT Damage (bonus burn/poison per tick) | +2 to +5 | +3 to +7 | +5 to +10 |

### OFF HAND (Shields)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Defense | +5 to +12 | +7 to +16 | +10 to +22 |
| +Max HP | +15 to +35 | +20 to +45 | +30 to +60 |
| +Block Chance | +5% to +10% | +7% to +14% | +10% to +18% |
| +HP Regen | +1 to +2 | +1 to +3 | +2 to +4 |
| +Status Resistance | +3% to +8% | +5% to +10% | +7% to +14% |
| +Damage Reduction | +1% to +3% | +2% to +4% | +3% to +6% |

### OFF HAND (Secondary Weapon / Ammo)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Attack (matching type) | +3 to +8 | +5 to +10 | +7 to +14 |
| +Critical Chance | +1% to +3% | +2% to +5% | +3% to +7% |
| +Accuracy | +2% to +5% | +3% to +7% | +5% to +10% |
| +Turn Speed | +2 to +5 | +3 to +7 | +5 to +10 |

### ARMOR (Body)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Defense | +5 to +15 | +8 to +20 | +12 to +28 |
| +Max HP | +20 to +50 | +30 to +65 | +40 to +85 |
| +HP Regen | +1 to +3 | +2 to +4 | +3 to +6 |
| +Damage Reduction | +1% to +3% | +2% to +5% | +3% to +7% |
| +Status Resistance | +3% to +8% | +5% to +12% | +8% to +16% |
| +All Attack (small, all types) | +2 to +5 | +3 to +7 | +5 to +10 |

### LEGS

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Defense | +3 to +10 | +5 to +13 | +8 to +18 |
| +Max HP | +10 to +30 | +15 to +40 | +22 to +55 |
| +Evasion | +1% to +4% | +2% to +5% | +3% to +7% |
| +Turn Speed | +2 to +6 | +3 to +8 | +5 to +11 |
| +Status Resistance | +2% to +5% | +3% to +7% | +5% to +10% |
| +Movement | +2 to +5 | +3 to +7 | +5 to +10 |

### GLOVES

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Accuracy | +3% to +8% | +5% to +10% | +7% to +14% |
| +Critical Chance | +2% to +5% | +3% to +7% | +4% to +9% |
| +Critical Damage | +3% to +8% | +5% to +10% | +7% to +14% |
| +Attack (matching primary stat type) | +3 to +8 | +5 to +10 | +7 to +14 |
| +Defense | +2 to +6 | +3 to +8 | +5 to +11 |
| +Armor Penetration | +2% to +5% | +3% to +7% | +5% to +10% |

### BOOTS

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Turn Speed | +3 to +8 | +5 to +11 | +7 to +15 |
| +Evasion | +2% to +5% | +3% to +7% | +4% to +9% |
| +Movement | +2 to +6 | +3 to +8 | +5 to +11 |
| +Defense | +2 to +6 | +3 to +8 | +5 to +11 |
| +Max HP | +8 to +20 | +12 to +28 | +18 to +38 |
| +Status Resistance | +2% to +5% | +3% to +7% | +5% to +10% |

### RINGS (3 slots)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +STR | +2 to +5 | +3 to +7 | +5 to +10 |
| +DEX | +2 to +5 | +3 to +7 | +5 to +10 |
| +INT | +2 to +5 | +3 to +7 | +5 to +10 |
| +CON | +2 to +5 | +3 to +7 | +5 to +10 |
| +PER | +2 to +5 | +3 to +7 | +5 to +10 |
| +LUK | +2 to +5 | +3 to +7 | +5 to +10 |
| +Critical Chance | +1% to +3% | +2% to +4% | +3% to +6% |
| +Critical Damage | +2% to +5% | +3% to +7% | +5% to +10% |
| +Max HP | +5 to +15 | +8 to +20 | +12 to +28 |
| +Attack (any type) | +2 to +5 | +3 to +7 | +5 to +10 |

### EARRINGS (2 slots)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Status Resistance | +3% to +8% | +5% to +12% | +8% to +16% |
| +HP Regen | +1 to +3 | +2 to +4 | +3 to +6 |
| +Evasion | +1% to +3% | +2% to +5% | +3% to +7% |
| +Max HP | +8 to +20 | +12 to +28 | +18 to +38 |
| +CON | +2 to +5 | +3 to +7 | +5 to +10 |
| +PER | +2 to +5 | +3 to +7 | +5 to +10 |
| +Damage Reduction | +1% to +2% | +1% to +3% | +2% to +4% |

### NECKLACE (1 slot)

| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +All Attack (melee + ranged + blast) | +3 to +8 | +5 to +12 | +8 to +16 |
| +Critical Chance | +2% to +5% | +3% to +7% | +5% to +10% |
| +Critical Damage | +5% to +12% | +8% to +16% | +12% to +22% |
| +Max HP | +15 to +35 | +20 to +45 | +30 to +60 |
| +All Primary Stats | +1 to +3 | +2 to +4 | +3 to +6 |
| +Accuracy | +2% to +6% | +4% to +8% | +6% to +12% |
| +HP Regen | +1 to +3 | +2 to +4 | +3 to +6 |
| +Damage Reduction | +1% to +3% | +2% to +4% | +3% to +6% |

---

## DOWNSIDE POOLS BY SLOT

Valid downsides per slot for Plague rarity curse rolls:

### Weapons (Main Hand / Off Hand)

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Sluggish** | -5 to -20 Turn Speed | Heavy weapon slows attacks |
| **Unstable** | -3% to -10% Accuracy | Recoil, poor balance |
| **Volatile** | 2% to 8% self-damage per use | Explosive/unstable weapon |
| **Draining** | -1 to -3 HP Regen | Weapon saps life force |
| **Fragile Grip** | -2% to -6% Crit Chance | Awkward handling |
| **Corroded** | -30% to -60% durability | Faster wear and tear |

### Body Armor

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Sluggish** | -8 to -25 Turn Speed | Heavy armor restricts movement |
| **Fragile** | -5% to -15% Max HP | Armor has weak points |
| **Tunnel Vision** | -3% to -10% Evasion | Restricted peripheral vision |
| **Draining** | -1 to -4 HP Regen | Uncomfortable, chafes, irradiated |
| **Conspicuous** | -3% to -8% Crit Chance | Bulky, hard to surprise enemies |
| **Corroded** | -20% to -50% durability | Acid damage, rust |

### Legs

| Downside | Effect Range |
|----------|-------------|
| **Sluggish** | -5 to -15 Turn Speed |
| **Fragile** | -3% to -8% Max HP |
| **Tunnel Vision** | -2% to -6% Evasion |
| **Corroded** | -20% to -40% durability |
| **Stumble** | -2% to -5% Accuracy |

### Gloves

| Downside | Effect Range |
|----------|-------------|
| **Clumsy** | -2% to -6% Accuracy |
| **Numb** | -1% to -4% Crit Chance |
| **Fragile** | -2% to -5% Max HP |
| **Sluggish** | -3 to -8 Turn Speed |
| **Corroded** | -20% to -40% durability |

### Boots

| Downside | Effect Range |
|----------|-------------|
| **Sluggish** | -5 to -15 Turn Speed |
| **Noisy** | -2% to -6% Evasion |
| **Fragile** | -2% to -5% Max HP |
| **Draining** | -1 to -2 HP Regen |
| **Corroded** | -20% to -40% durability |

### Rings

| Downside | Effect Range |
|----------|-------------|
| **Cursed** | -1 to -3 to a random primary stat |
| **Draining** | -1 to -2 HP Regen |
| **Fragile** | -2% to -4% Max HP |

### Earrings

| Downside | Effect Range |
|----------|-------------|
| **Disorienting** | -2% to -5% Accuracy |
| **Draining** | -1 to -2 HP Regen |
| **Cursed** | -1 to -3 to a random primary stat |

### Necklace

| Downside | Effect Range |
|----------|-------------|
| **Draining** | -1 to -3 HP Regen |
| **Conspicuous** | -2% to -5% Crit Chance |
| **Cursed** | -2 to -4 to a random primary stat |
| **Fragile** | -3% to -6% Max HP |

---

## READING AN ITEM CARD

```
[Source] Facet Name [Rarity]
Slot | Tier | Level Req | Weapon Type | Stat Requirements

BASE STATS:
  +value stat (green = positive)
  -value stat (red = inherent downside)

FACET [Name]:
  +upside (yellow)
  -downside (yellow)

RARITY BONUSES (blue/purple/orange based on rarity):
  +bonus1, +bonus2, ...

RARITY CURSES (Plague only, dark red):
  CURSE: -stat

ENCHANTMENTS [Group] (blue or orange if legendary):
  [group] Name: +value stat
```

### Example: T4 Plated War Armor at Every Rarity

**[Forged] Common:**
```
Plated War Armor [Common]
Level Req: 45 | STR Req: 30
+48 Defense, +80 Max HP, +2 HP Regen
INHERENT: Sluggish -20 Turn Speed
```

**[Forged] Rare:**
```
Plated War Armor [Rare]
+48 Defense, +80 Max HP, +2 HP Regen
INHERENT: Sluggish -20 Turn Speed
BONUS: +6% Status Resistance, +35 Max HP
```

**[Forged] Plague:**
```
Plated War Armor [Plague]
+48 Defense, +80 Max HP, +2 HP Regen
INHERENT: Sluggish -20 Turn Speed
BONUS: +12% Status Resist, +62 Max HP, +5% Dmg Reduction,
       +4 HP Regen, +8 Defense, +6 All Attack
CURSE: Draining -3 HP Regen, Conspicuous -6% Crit Chance
```

---

## DISENCHANTING

Players can **disenchant** any gear to recover partial materials:
- Common: 20% of crafting cost returned
- Rare: 25% + 1 Enhancement Shard
- Unique: 30% + 2 Enhancement Shards
- Plague: 35% + 5 Enhancement Shards

Enhancement Shards are used to re-roll bonus attributes on existing gear.

---

## MELEE WEAPONS

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

---

## RANGED WEAPONS

| Weapon | Tier | Lvl Req | Stat Req | Positives | Negative |
|--------|------|---------|----------|-----------|----------|
| **Slingshot** | T1 | 1 | - | +6 Ranged Atk, +3 Turn Speed | - |
| **Scrap Bow** | T1 | 1 | - | +9 Ranged Atk, +2% Accuracy | - |
| **Pipe Pistol** | T2 | 15 | 10 DEX | +20 Ranged Atk, +8 Turn Speed | Unstable: -5% Accuracy |
| **Hunting Crossbow** | T2 | 15 | 8 DEX, 5 PER | +18 Ranged Atk, +5% Accuracy, +3% Crit | Sluggish: -5 Turn Speed |
| **Bolt-Action Rifle** | T3 | 30 | 20 DEX | +35 Ranged Atk, +8% Accuracy, +5% Crit | Sluggish: -10 Turn Speed |
| **Twin Pistols** | T3 | 30 | 15 DEX, 10 PER | +30 Ranged Atk, +15 Turn Speed, +4% Crit | Unstable: -8% Accuracy |
| **Scoped Carbine** | T4 | 45 | 30 DEX | +52 Ranged Atk, +12% Accuracy, +8% Crit | Sluggish: -12 Turn Speed |
| **Marksman's Rifle** | T5 | 60 | 45 DEX | +75 Ranged Atk, +15% Accuracy, +10% Crit, +5 Turn Speed | Conspicuous: -8% Crit Chance |
| **Anti-Material Rifle** | T6 | 80 | 60 DEX | +105 Ranged Atk, +18% Accuracy, +12% Crit, +25% Crit Dmg | Sluggish: -20 Turn Speed |
| **Railgun** | T7 | 90 | 75 DEX | +135 Ranged Atk, +20% Accuracy, +15% Crit, +35% Crit Dmg, +8 Turn Speed | Draining: -2 HP Regen |
| **Oblivion Cannon** | T8 | 100 | 90 DEX | +175 Ranged Atk, +22% Accuracy, +18% Crit, +45% Crit Dmg, +15 Turn Speed | Draining: -3 HP Regen |

---

## DEMOLITIONS WEAPONS

| Weapon | Tier | Lvl Req | Stat Req | Positives | Negative |
|--------|------|---------|----------|-----------|----------|
| **Molotov Cocktail** | T1 | 1 | - | +7 Blast Atk | - |
| **Pipe Bomb** | T1 | 1 | - | +10 Blast Atk | Volatile: 3% self-damage |
| **Frag Grenade** | T2 | 15 | 10 INT | +22 Blast Atk, +5% Crit Dmg | Volatile: 4% self-damage |
| **Concussion Launcher** | T3 | 30 | 20 INT | +38 Blast Atk, +10% Crit Dmg, 15% Stun | Volatile: 5% self-damage |
| **Rocket Launcher** | T4 | 45 | 30 INT | +55 Blast Atk, +15% Crit Dmg, 20% Stun | Volatile: 6%, Sluggish: -10 Turn Speed |
| **Siege Mortar** | T5 | 60 | 45 INT | +78 Blast Atk, +20% Crit Dmg, 25% Stun | Volatile: 7%, Sluggish: -15 Turn Speed |
| **Plasma Bombard** | T6 | 80 | 60 INT | +110 Blast Atk, +30% Crit Dmg, 30% Stun | Volatile: 8%, Sluggish: -20 Turn Speed |
| **Orbital Strike Beacon** | T7 | 90 | 75 INT | +140 Blast Atk, +40% Crit Dmg, 35% Stun | Volatile: 9%, Sluggish: -25 Turn Speed |
| **Apocalypse Device** | T8 | 100 | 90 INT | +180 Blast Atk, +50% Crit Dmg, 40% Stun | Volatile: 10%, Sluggish: -28 Turn Speed |

---

## BODY ARMOR

### T1-T4 (Levels 1-45)

| Armor | Tier | Stat Req | Positives | Negative |
|-------|------|----------|-----------|----------|
| **Patched Vest** | T1 | - | +5 Def, +10 Max HP | - |
| **Cloth Wrappings** | T1 | - | +3 Def, +3 Turn Speed | - |
| **Scrap Plate Chest** | T2 | 10 STR | +18 Def, +30 Max HP | Sluggish: -10 Turn Speed |
| **Leather Duster** | T2 | 8 DEX | +12 Def, +8 Turn Speed, +3% Evasion | Fragile: -5% Max HP |
| **Padded Lab Coat** | T2 | 8 INT | +10 Def, +5% Status Resist, +3% Crit Dmg | Fragile: -5% Max HP |
| **Iron Breastplate** | T3 | 20 STR | +32 Def, +50 Max HP, +1 HP Regen | Sluggish: -15 Turn Speed |
| **Plated War Armor** | T4 | 30 STR | +48 Def, +80 Max HP, +2 HP Regen | Sluggish: -20 Turn Speed |
| **Shadow Leathers** | T4 | 28 DEX | +34 Def, +18 Turn Speed, +10% Evasion | Fragile: -10% Max HP |

### T5-T8 (Levels 60-100)

| Armor | Tier | Stat Req | Positives | Negative |
|-------|------|----------|-----------|----------|
| **Fortress Plate** | T5 | 45 STR | +68 Def, +120 HP, +3 Regen, +5% Dmg Reduction | Sluggish: -25 Turn Speed |
| **Siege Bulwark** | T6 | 60 STR | +95 Def, +160 HP, +4 Regen, +10% Dmg Reduction | Sluggish: -30 Turn Speed |
| **Wraith Armor** | T6 | 55 DEX | +68 Def, +28 Speed, +18% Eva, +8% Crit | Fragile: -15% Max HP |
| **Dreadnought Plate** | T7 | 75 STR | +125 Def, +200 HP, +5 Regen, +15% Dmg Reduction, +5% Crit | Sluggish: -35 Turn Speed |
| **Phantom Shroud** | T7 | 70 DEX | +90 Def, +35 Speed, +22% Eva, +12% Crit, +10% Acc | Fragile: -18% Max HP |
| **Apocalypse Aegis** | T8 | 90 STR | +160 Def, +250 HP, +6 Regen, +20% Dmg Reduction, +8% Crit | Sluggish: -38 Turn Speed |
| **Void Walker Suit** | T8 | 85 DEX | +115 Def, +40 Speed, +28% Eva, +15% Crit, +12% Acc | Fragile: -20% Max HP |
| **Singularity Frame** | T8 | 85 INT | +100 Def, +35% Status Resist, +45% Crit Dmg, +8% Crit | Draining: -5 HP Regen |
| **Eternity Shell** | T8 | 85 CON | +130 Def, +300 HP, +8 Regen, +15% Status Resist | Sluggish: -30 Turn Speed |

---

## HEAD ARMOR

| Helmet | Tier | Stat Req | Positives | Negative |
|--------|------|----------|-----------|----------|
| **Scrap Helmet** | T1 | - | +3 Defense | - |
| **Welding Mask** | T2 | 8 STR | +8 Def, +10 Max HP | Tunnel Vision: -3% Evasion |
| **Scout Goggles** | T2 | 8 DEX | +5 Def, +5% Accuracy | Fragile: -3% Max HP |
| **Blast Shield** | T3 | 18 STR | +15 Def, +20 Max HP | Tunnel Vision: -5% Evasion |
| **Tactical HUD** | T4 | 28 INT | +12 Def, +10% Acc, +5% Crit, +5% Crit Dmg | Draining: -1 HP Regen |
| **Predator Visor** | T5 | 42 PER | +15 Def, +12% Acc, +8% Crit, +10% Crit Dmg | Fragile: -8% Max HP |
| **Wasteland Crown** | T6 | 55 PER | +20 Def, +15% Acc, +12% Crit, +15% Crit Dmg | Fragile: -10% Max HP |
| **Omega Bastion** | T8 | 85 STR | +55 Def, +100 HP, +4 Regen, +5% Dmg Reduction | Tunnel Vision: -15% Evasion |

---

## ACCESSORIES

### T1 Accessories
| Item | Slot | Base Stats | Craft |
|------|------|-----------|-------|
| Rusty Ring | Ring 1-2 | +5 Max HP | 3 Iron Ore + 2 Copper Ore |
| Bone Earring | Earring 1-2 | +2% Status Resist | 3 Mutant Roots + 1 Copper Ore |
| Scrap Pendant | Necklace | +8 Max HP, +0.5 HP Regen | 3 Copper Ore + 2 Iron Ore |

### Stat Focus Rings (Ring Slot 3 Only)
See [Stats - Ring 3 Focus System](GAME_WIKI_STATS.md#ring-3-focus-system) for the full focus ring system.

---

## TOOLS

| Tool | Tier | Lvl | Effect | Negative |
|------|------|-----|--------|----------|
| **Basic Toolkit** | T1 | 1 | +5% all gathering speed | - |
| **Reinforced Axe** | T2 | 15 | +10% Scavenging, +5% Foraging | Corroded: -20% durability |
| **Mining Drill** | T3 | 30 | +15% Prospecting, +5% all gathering | Corroded: -30% durability |
| **Multi-Tool** | T4 | 45 | +12% all gathering speed | Corroded: -30% durability |
| **Automated Harvester** | T5 | 60 | +18% all gathering, +8% production | Corroded: -40% durability |
| **Master Toolkit** | T6 | 80 | +22% all gathering, +12% production | Corroded: -40% durability |
| **Quantum Fabricator** | T7 | 90 | +28% all gathering, +18% production | Corroded: -50% durability |
| **Singularity Engine** | T8 | 100 | +35% all gathering, +25% production | Corroded: -50% durability |

---

## CONSUMABLES & MEDICINE

See [Skills - Cooking](GAME_WIKI_SKILLS.md#cooking) and [Skills - Biochemistry](GAME_WIKI_SKILLS.md#biochemistry) for full recipe lists.

### Consumable Items

| Consumable | Source | Effect |
|-----------|--------|--------|
| **Facet Stone** | 10-20% boss drop, dungeon reward | Re-roll facet on 1 equipment piece |
| **Enhancement Shard** | 5-10% mob drop, guaranteed from bosses | Re-roll 1 rarity bonus or 1 enchantment (costs 500-5,000 WC) |
| **Expedition Pass** | Crafted via Tinkering, Marketplace | Required to enter expedition dungeons |
