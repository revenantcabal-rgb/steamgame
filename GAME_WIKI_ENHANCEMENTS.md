# Wasteland Grind - Enhancement Bonuses, Zone Tiers & Gear Source Rules

Extends GAME_WIKI.md, GAME_WIKI_HEROES.md, GAME_WIKI_SKILLS_MARKET.md.

---

## TABLE OF CONTENTS

1. [Crafted vs Dropped Gear](#crafted-vs-dropped-gear)
2. [Enhancement Bonus Pools by Slot](#enhancement-bonus-pools-by-slot)
3. [Rarity Enhancement Rules](#rarity-enhancement-rules)
4. [Downside Pools by Slot](#downside-pools-by-slot)
5. [Example Items at Every Rarity](#example-items-at-every-rarity)
6. [Combat Zone Tiers](#combat-zone-tiers)
7. [Zone Tier Scaling Tables](#zone-tier-scaling-tables)
8. [Full Zone Tier Breakdown](#full-zone-tier-breakdown)

---

## CRAFTED vs DROPPED GEAR

**Core Rule: Crafted gear is ALWAYS stronger than boss-dropped gear of the same tier and rarity.**

This ensures players engage with the gathering/production loop instead of just farming bosses.

### Gear Sources

| Source | Label | Base Stat Power | Can Roll Rarity? | Enhancement Bonus Power |
|--------|-------|----------------|-----------------|------------------------|
| **Crafted** (Production skills) | [Forged] | 100% (full) | Yes (based on craft skill level) | 100% (full bonus rolls) |
| **Boss Drop** (combat zones) | [Salvaged] | 75% of crafted | Yes (based on zone/boss tier) | 80% of crafted bonus rolls |
| **Normal Mob Drop** | [Scavenged] | 60% of crafted | Yes (mostly Common/Rare) | 65% of crafted bonus rolls |
| **Quest Reward** | [Issued] | 85% of crafted | Fixed rarity (usually Rare) | 90% of crafted bonus rolls |
| **PVP Season Reward** | [Decorated] | 90% of crafted | Fixed rarity (Unique+) | 95% of crafted bonus rolls |

### Example: T4 Iron Chestplate (Level 45)

| Source | Defense | Max HP | HP Regen | Enhancement Power |
|--------|---------|--------|----------|-------------------|
| [Forged] Crafted | +48 | +80 | +2 | 100% bonus rolls |
| [Salvaged] Boss Drop | +36 | +60 | +1 | 80% bonus rolls |
| [Scavenged] Mob Drop | +29 | +48 | +1 | 65% bonus rolls |
| [Issued] Quest Reward | +41 | +68 | +2 | 90% bonus rolls |

**Why this matters:**
- Early game: Boss drops are great as stepping stones
- Mid game: Players realize crafted gear is significantly better
- Late game: Only crafted Plague-rarity gear is endgame viable
- This drives demand for resources → drives population/gathering gameplay
- Boss gear is still useful for alt heroes, disenchanting, or selling on marketplace

### Disenchanting

Players can **disenchant** any gear to recover partial materials:
- Common: 20% of crafting cost returned
- Rare: 25% + 1 Enhancement Shard
- Unique: 30% + 2 Enhancement Shards
- Plague: 35% + 5 Enhancement Shards

Enhancement Shards are used to re-roll bonus attributes on existing gear (see marketplace uses).

---

## ENHANCEMENT BONUS POOLS BY SLOT

Each equipment slot draws bonus attributes from a specific pool. This prevents nonsensical rolls like "boots with +Blast Attack" and makes each slot feel purposeful.

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

### OFF HAND (Shields, secondary weapons, ammo)

**If Shield:**
| Bonus | Rare Roll Range | Unique Roll Range | Plague Roll Range |
|-------|----------------|-------------------|-------------------|
| +Defense | +5 to +12 | +7 to +16 | +10 to +22 |
| +Max HP | +15 to +35 | +20 to +45 | +30 to +60 |
| +Block Chance (new stat, shields only) | +5% to +10% | +7% to +14% | +10% to +18% |
| +HP Regen | +1 to +2 | +1 to +3 | +2 to +4 |
| +Status Resistance | +3% to +8% | +5% to +10% | +7% to +14% |
| +Damage Reduction | +1% to +3% | +2% to +4% | +3% to +6% |

**If Secondary Weapon / Ammo:**
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
| +Movement (affects Turn Speed in GVG positioning) | +2 to +5 | +3 to +7 | +5 to +10 |

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

## RARITY ENHANCEMENT RULES

### Common (White)
- **Base stats ONLY** (as listed in gear tables)
- **No bonus attributes**
- **No downsides** (beyond the gear's inherent trade-off)
- Good early game, replaced quickly

### Rare (Blue)
- Base stats + **2 random bonuses** from the slot's bonus pool
- **No extra downsides**
- Bonuses roll at base range
- Solid mid-game gear, competitive early endgame

### Unique (Purple)
- Base stats + **3 random bonuses** from the slot's bonus pool
- **No extra downsides**
- Bonuses roll at **+30% higher values** compared to Rare
- Very good endgame gear, hard to replace

### Plague (Orange)
- Base stats + **6 random bonuses** from the slot's bonus pool
- **2 random downsides** from the downside pool (on top of the gear's inherent downside)
- Bonuses roll at **+50% higher values** compared to Rare
- Strongest possible gear, but the downsides are significant
- True endgame min-max gear

### Enhancement Rules
1. **No duplicate bonuses** - An item cannot roll the same bonus twice
2. **Downsides cannot duplicate** - A Plague item's 2 curse downsides must be different from each other AND different from the item's inherent downside
3. **Slot-appropriate only** - Bonuses only roll from the slot's specific pool
4. **Source scaling** - [Salvaged] boss drops roll at 80% of listed ranges, [Scavenged] mob drops at 65%

---

## DOWNSIDE POOLS BY SLOT

Not every downside makes sense on every slot. Here are the valid downsides per slot for Plague rarity curse rolls:

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

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Sluggish** | -5 to -15 Turn Speed | Heavy leg armor |
| **Fragile** | -3% to -8% Max HP | Thin material |
| **Tunnel Vision** | -2% to -6% Evasion | Restricts leg movement |
| **Corroded** | -20% to -40% durability | |
| **Stumble** | -2% to -5% Accuracy | Unstable footing |

### Gloves

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Clumsy** | -2% to -6% Accuracy | Thick, unwieldy |
| **Numb** | -1% to -4% Crit Chance | Reduced feeling |
| **Fragile** | -2% to -5% Max HP | |
| **Sluggish** | -3 to -8 Turn Speed | Heavy gauntlets |
| **Corroded** | -20% to -40% durability | |

### Boots

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Sluggish** | -5 to -15 Turn Speed | Heavy boots |
| **Noisy** | -2% to -6% Evasion | Loud footsteps |
| **Fragile** | -2% to -5% Max HP | |
| **Draining** | -1 to -2 HP Regen | Uncomfortable |
| **Corroded** | -20% to -40% durability | |

### Rings

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Cursed** | -1 to -3 to a random primary stat | Corrupted gem |
| **Draining** | -1 to -2 HP Regen | Life-sapping gem |
| **Fragile** | -2% to -4% Max HP | Irradiated material |

### Earrings

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Disorienting** | -2% to -5% Accuracy | Throws off balance |
| **Draining** | -1 to -2 HP Regen | |
| **Cursed** | -1 to -3 to a random primary stat | |

### Necklace

| Downside | Effect Range | Thematic |
|----------|-------------|----------|
| **Draining** | -1 to -3 HP Regen | Heavy, irradiated pendant |
| **Conspicuous** | -2% to -5% Crit Chance | Glowing/visible |
| **Cursed** | -2 to -4 to a random primary stat | Ancient wasteland curse |
| **Fragile** | -3% to -6% Max HP | Irradiated core |

---

## EXAMPLE ITEMS AT EVERY RARITY

### Example: T4 Plated War Armor (Level 45, STR requirement 30)

**[Forged] Common (White):**
```
Plated War Armor [Common]
Level Req: 45 | STR Req: 30
+48 Defense
+80 Max HP
+2 HP Regen
INHERENT: Sluggish -20 Turn Speed
```

**[Forged] Rare (Blue):**
```
Plated War Armor [Rare]
Level Req: 45 | STR Req: 30
+48 Defense
+80 Max HP
+2 HP Regen
INHERENT: Sluggish -20 Turn Speed
BONUS: +6% Status Resistance
BONUS: +35 Max HP
```

**[Forged] Unique (Purple):**
```
Plated War Armor [Unique]
Level Req: 45 | STR Req: 30
+48 Defense
+80 Max HP
+2 HP Regen
INHERENT: Sluggish -20 Turn Speed
BONUS: +9% Status Resistance (+30% over Rare)
BONUS: +48 Max HP (+30% over Rare)
BONUS: +3% Damage Reduction
```

**[Forged] Plague (Orange):**
```
Plated War Armor [Plague]
Level Req: 45 | STR Req: 30
+48 Defense
+80 Max HP
+2 HP Regen
INHERENT: Sluggish -20 Turn Speed
BONUS: +12% Status Resistance (+50% over Rare)
BONUS: +62 Max HP (+50% over Rare)
BONUS: +5% Damage Reduction
BONUS: +4 HP Regen
BONUS: +8 Defense
BONUS: +6 All Attack
CURSE: Draining -3 HP Regen
CURSE: Conspicuous -6% Crit Chance
```

**[Salvaged] Boss Drop - Same armor at Plague rarity:**
```
Plated War Armor [Plague] [Salvaged]
Level Req: 45 | STR Req: 30
+36 Defense (75% of crafted)
+60 Max HP (75% of crafted)
+1 HP Regen (75% of crafted)
INHERENT: Sluggish -20 Turn Speed
BONUS: +10% Status Resistance (80% of crafted Plague roll)
BONUS: +50 Max HP (80%)
BONUS: +4% Damage Reduction (80%)
BONUS: +3 HP Regen (80%)
BONUS: +6 Defense (80%)
BONUS: +5 All Attack (80%)
CURSE: Draining -3 HP Regen
CURSE: Conspicuous -6% Crit Chance
```

*Notice: Same Plague rarity, but the [Salvaged] version has weaker base stats AND weaker bonus rolls.*

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

### Why Tiers Matter

1. **Prevents out-leveling:** Zone 1 at T1 is level 1-10 content. Zone 1 at T4 Nightmare is level 30-40 content. Old zones stay relevant.
2. **Gear progression:** T4+ tiers in early zones drop gear one tier above the zone's base. Zone 2 T4 Nightmare can drop T3 gear.
3. **XP farming:** High-tier low zones give competitive XP for the time investment.
4. **Boss farming:** Even veteran players have a reason to revisit early zones at max tier for rare drops.
5. **All drops are still [Salvaged]:** So even at Extinction tier, boss drops are weaker than crafted gear. The crafting loop is always the endgame.

---

## ZONE TIER SCALING TABLES

### Boss Loot Table by Zone Tier

Every 10 fights, the boss appears. Boss ALWAYS drops 1 piece of gear. Here's the rarity and power:

**Remember: All boss drops are [Salvaged] = 75% base stats, 80% bonus rolls compared to [Forged] crafted.**

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

---

## FULL ZONE TIER BREAKDOWN

### Zone 1: The Outskirts (Base Level 1+)

| Tier | Enemy Level | Mosquito HP/Dmg | Frog HP/Dmg | Centipede HP/Dmg | Boss HP/Dmg | XP/Kill | Recommended |
|------|-----------|-----------------|-------------|-----------------|-------------|---------|-------------|
| T1 Normal | 1-10 | 20/3 | 30/5 | 25/7 | 90/15 | 15-20 | Hero Lv.1-10 |
| T2 Hard | 5-15 | 30/4 | 45/7 | 38/9 | 135/20 | 23-30 | Hero Lv.10-20 |
| T3 Elite | 12-25 | 44/5 | 66/9 | 55/12 | 198/26 | 33-44 | Hero Lv.20-30 |
| T4 Nightmare | 20-35 | 60/7 | 90/11 | 75/15 | 270/33 | 45-60 | Hero Lv.30-40 |

### Zone 2: Ruined Suburbs (Base Level 15+)

| Tier | Enemy Level | Dog HP/Dmg | Hawk HP/Dmg | Rat HP/Dmg | Boss HP/Dmg | XP/Kill | Recommended |
|------|-----------|------------|-------------|------------|-------------|---------|-------------|
| T1 Normal | 15-25 | 60/12 | 45/18 | 80/10 | 250/30 | 35-40 | Hero Lv.15-25 |
| T2 Hard | 20-30 | 90/16 | 68/23 | 120/13 | 375/39 | 53-60 | Hero Lv.25-35 |
| T3 Elite | 28-40 | 132/20 | 99/31 | 176/17 | 550/51 | 77-88 | Hero Lv.35-45 |
| T4 Nightmare | 35-50 | 180/26 | 135/40 | 240/22 | 750/66 | 105-120 | Hero Lv.45-55 |
| T5 Apocalypse | 45-60 | 270/36 | 203/54 | 360/30 | 1125/90 | 158-180 | Hero Lv.55-65 |

### Zone 3-7: Follow same scaling pattern with base stats from GAME_WIKI_HEROES.md multiplied by tier multipliers.

---

## GEAR POWER HIERARCHY (Summary)

From weakest to strongest for any given tier:

```
[Scavenged] Common (mob drop)        ← Weakest. Vendor trash or early stepping stone.
[Scavenged] Rare (mob drop)
[Salvaged] Common (boss drop)        ← Boss common is still weaker than crafted common.
[Scavenged] Unique (mob drop)
[Salvaged] Rare (boss drop)
[Issued] Rare (quest reward)
[Forged] Common (crafted)            ← CRAFTED STARTS HERE - always stronger base.
[Salvaged] Unique (boss drop)
[Forged] Rare (crafted)              ← The mid-game sweet spot.
[Decorated] Unique (PVP reward)
[Salvaged] Plague (boss drop)        ← Strong bonuses but weaker base than crafted.
[Forged] Unique (crafted)            ← Late-game goal.
[Forged] Plague (crafted)            ← TRUE ENDGAME. Best possible gear in the game.
```

**Key takeaway:** A [Forged] Rare piece beats a [Salvaged] Unique piece. Crafting is king.
