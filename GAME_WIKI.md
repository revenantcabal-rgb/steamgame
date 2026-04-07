# Wasteland Grind - Complete Game Wiki & Data Reference

The central hub for all game design documentation. Each topic links to a dedicated reference file.

---

## WIKI FILES

| # | File | Covers |
|---|------|--------|
| 1 | **[Heroes](GAME_WIKI_HEROES.md)** | 16 classes (12 combat + 4 specialist), categories, recruitment, leveling, population system |
| 2 | **[Stats](GAME_WIKI_STATS.md)** | Primary attributes (STR/DEX/INT/CON/PER/LUK/RES), derived stats, XP table, ring focus system |
| 3 | **[Abilities](GAME_WIKI_ABILITIES.md)** | 5 ability colors, 65 ability tomes, SP costs, cooldowns, decree system, innate class abilities |
| 4 | **[Equipment](GAME_WIKI_EQUIPMENT.md)** | 12 equipment slots, gear tiers T1-T8, rarity, gear sources, crafting chains, full weapon/armor catalog |
| 5 | **[Facets & Enchantments](GAME_WIKI_FACETS_ENCHANTS.md)** | Facet system (all slots + SP facets), enchantment system (all groups + SP enchants), stacking rules |
| 6 | **[Sets](GAME_WIKI_SETS.md)** | 5 equipment sets (Survivor, Raider, Forager, Warlord, Artisan) with piece lists and set bonuses |
| 7 | **[Skills](GAME_WIKI_SKILLS.md)** | 5 gathering skills, 5 production skills, 6 combat skills, equippable skills, resource flow |
| 8 | **[Marketplace](GAME_WIKI_MARKETPLACE.md)** | BDO-style Central Market, PO lottery, price bands, rarity pricing, anti-ghost-trading |
| 9 | **[Combat](GAME_WIKI_COMBAT.md)** | Damage formula, combat zones 1-7, boss cycles, wave scaling, expeditions, PVP, GVG |
| 10 | **[Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md)** | SP pool, SP regen, SP cost reduction, ability SP costs, SP gear modifiers |
| 11 | **[Game Systems](GAME_WIKI_SYSTEMS.md)** | Anti-cheat, achievements, auth, character slots, cloud saves, settings, currency, cash shop |
| 12 | **[Story Progression](GAME_WIKI_STORY.md)** | 5-chapter story system, 35 tasks, feature unlock progression, starter hero, recruitment costs |
| 13 | **[Starlight Sphere Grid](GAME_WIKI_STARLIGHT.md)** | 7 paths, 105 nodes, Icqor Chess Piece drops, account-wide passive bonuses |
| 14 | **[Consumables & Combat Bags](GAME_WIKI_CONSUMABLE.md)** | 29 consumables, recipes, effects, cooldowns, bag/slot progression (1-6 slots) |
| 15 | **This file (Hub)** | Overview of all systems, core rules, quick references |

---

## CORE RULES

- **No Energy System** - Players can train freely without stamina/energy gates
- **Level Cap:** 100 for every skill
- **Idle Cap:** 12 hours/day (free), extendable via cash shop
- **Offline Progress:** Calculated on login up to idle cap
- **Auto-save:** Every 30 seconds + on browser close
- **Stat Points:** Players get 3 stat points per combat level to allocate freely
- **No fixed builds** - Mix and match gear, stats, and combat styles
- **7 Primary Attributes:** STR, DEX, INT, CON, PER, LUK, RES

---

## SYSTEM OVERVIEWS

### Two Gameplay Layers

**Layer 1: Settlement (Population + Economy)**
- Workers handle Gathering and Production
- 5 gathering skills: Scavenging, Foraging, Salvage Hunting, Water Reclamation, Prospecting
- 5 production skills: Cooking, Tinkering, Weaponsmithing, Armorcrafting, Biochemistry
- See [Skills](GAME_WIKI_SKILLS.md) for full details

**Layer 2: Combat (Heroes + Squads)**
- 16 hero classes across 5 categories (Skirmisher, Control, Support, Assault, Artisan)
- 5-hero squads for PVP, GVG, expeditions, and idle combat zones
- See [Heroes](GAME_WIKI_HEROES.md) and [Combat](GAME_WIKI_COMBAT.md)

### Spirit Points (SP) System

SP is the resource that powers active abilities. See [Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md).
- Base SP: 30 + (RES x 3)
- SP regenerates each turn: 2 + (RES x 0.1) per turn
- Active ability tomes (Red/Green/Blue) consume SP when used
- Passive tomes (Orange) and Decrees (Purple) do not consume SP
- SP gear modifiers available through facets, enchantments, and sets

### Expeditions

Three endgame expedition dungeons with three difficulty levels each. See [Combat](GAME_WIKI_COMBAT.md#expeditions).
- **The Undercity** (Lv.40+): Underground ruins, T4-T5 gear
- **The Proving Grounds** (Lv.65+): Military gauntlet, T5-T6 gear, Warband Decree drops
- **The Singularity** (Lv.85+): Reality-warped endgame, T7-T8 gear, Plague rarity chance
- Difficulties: Normal (3-hero), Heroic (5-hero, +50% drops), Mythic (5-hero Lv.80+, +100% drops)

### BDO-Style Marketplace

The Wasteland Exchange uses server-controlled pricing and purchase order lotteries. See [Marketplace](GAME_WIKI_MARKETPLACE.md).
- Price bands: Base price +/-15%
- PO lottery system (not highest-bid-wins)
- Rarity-adjusted pricing (Plague items worth 25x Common)
- Anti-ghost-trading: price bands + PO lottery + account linking detection + rate limiting
- 5% seller tax as gold sink

### Achievements

20 achievements tracking major milestones from tutorial completion to mastering all skills. See [Game Systems](GAME_WIKI_SYSTEMS.md#achievements).

### Anti-Cheat

Server-validated game IDs, rate limiting per activity type, progressive ban escalation, and anti-ghost-trading marketplace design. See [Game Systems](GAME_WIKI_SYSTEMS.md#anti-cheat-system).

---

## QUICK REFERENCE TABLES

### Gear Tiers

| Tier | Level | Quality |
|------|-------|---------|
| T1 | 1 | Scrap |
| T2 | 15 | Makeshift |
| T3 | 30 | Sturdy |
| T4 | 45 | Reinforced |
| T5 | 60 | Military |
| T6 | 80 | Elite |
| T7 | 90 | Masterwork |
| T8 | 100 | Legendary |

### Item Rarity

| Rarity | Color | Bonuses | Curses | Enchant Slots |
|--------|-------|---------|--------|---------------|
| Common | White | 0 | 0 | 0 |
| Rare | Blue | 2 | 0 | 1 |
| Unique | Purple | 3 (+30%) | 0 | 2 |
| Plague | Orange | 6 (+50%) | 2 | 3 |

### Combat Zones

| Zone | Level | Boss |
|------|-------|------|
| 1. The Outskirts | 1+ | Giant Roach |
| 2. Ruined Suburbs | 15+ | Alpha Wolf |
| 3. Toxic Industrial | 30+ | Factory Overseer |
| 4. The Deadlands | 45+ | Raider Warlord |
| 5. Military Zone | 60+ | Commander Mech |
| 6. The Core | 80+ | The Source |
| 7. Ground Zero | 95+ | The Cataclysm |

### Hero Categories

| Category | Classes | Team Aura |
|----------|---------|-----------|
| Skirmisher | Blade Dancer, Sharpshooter, Sapper | +5 Turn Speed, +5% Evasion per hero |
| Control | Warden, Trapper, Bombardier | -5 enemy Turn Speed, +5% Accuracy per hero |
| Support | Guardian, Field Medic, Chemist | +3 HP Regen, +50 Max HP per hero |
| Assault | Berserker, Deadeye, Demolisher | +8% Damage, +5% Crit Damage per hero |
| Artisan | Scavenger, Ranger, Prospector, Artificer | +3% rare loot, +10% resource drops per hero |

### Primary Attributes

| Stat | Per Point |
|------|----------|
| STR | +2 Melee Attack |
| DEX | +2 Ranged Attack, +0.5 Turn Speed, +0.3% Evasion |
| INT | +2 Blast Attack, +1% Crit Damage |
| CON | +8 Max HP, +0.5 HP Regen, +0.5% Status Resist |
| PER | +0.4% Crit Chance, +0.5% Accuracy |
| LUK | +0.1% Crit, +0.1% Evasion, +0.1% Accuracy, +0.2% rare drop |
| RES | +1% Ability Power, +3 maxSp, ability slot unlocks |

---

## RESOURCE FLOW (Quick Reference)

```
Scavenging -> Scrap Metal, Salvaged Wood, Rusted Pipes
Foraging -> Wild Herbs, Wasteland Berries, Mutant Roots
Salvage Hunting -> Mechanical Parts, Electronic Components, Chemical Fluids
Water Reclamation -> Rainwater, Well Water, River Water
Prospecting -> Iron Ore, Copper Ore, Raw Stone

Production:
  Cooking (Foraging + Water) -> Food Buffs
  Tinkering (Scavenging + Salvage) -> Tools, Accessories
  Weaponsmithing (Prospecting + Salvage + Scavenging) -> Weapons
  Armorcrafting (Prospecting + Scavenging) -> Armor
  Biochemistry (Foraging + Water + Prospecting) -> Medicine, Decrees
```

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

---

## GEAR POWER HIERARCHY (Quick Reference)

From weakest to strongest for any given tier:

```
[Scavenged] Common (mob drop)        <- Weakest
[Salvaged] Common (boss drop)
[Forged] Common (crafted)            <- CRAFTED STARTS HERE
[Salvaged] Rare (boss drop)
[Forged] Rare (crafted)              <- Mid-game sweet spot
[Salvaged] Unique (boss drop)
[Forged] Unique (crafted)            <- Late-game goal
[Salvaged] Plague (boss drop)
[Forged] Plague (crafted)            <- TRUE ENDGAME
```

A [Forged] Rare beats a [Salvaged] Unique. Crafting is king. See [Equipment](GAME_WIKI_EQUIPMENT.md) for full details.
