# Wasteland Grind - Marketplace & Ability Tomes

---

## WASTELAND EXCHANGE (Marketplace)

### Overview

The Wasteland Exchange is a BDO-inspired marketplace where players buy and sell items using
Wasteland Credits (WC). Prices fluctuate based on supply and demand.

Sources:
- [BDO Central Market Guide](https://grumpygreen.cricket/bdo-central-market/)
- [BDO Marketplace Wiki](https://blackdesertonline.fandom.com/wiki/Marketplace)

### Price System

- **Base Price:** Each item has a base value determined by its type, tier, and rarity
- **Tradable Range:** Base Price ±10% (sellers must price within this range)
- **Price Adjustment:** Buying at max nudges base price up 1%. Selling at min drops it 1%.
- **Developer Caps:** Hard floor (50% of base) and ceiling (300% of base) prevent extreme swings
- **Trend Indicators:** Rising (red arrow), Falling (blue arrow), Stable (gray dot)

### Tax

- **5% tax** on all sales (seller receives 95% of sale price)
- Tax is a gold sink to prevent inflation

### Listings

- Items listed for **48 hours** before expiring
- Expired items return to seller automatically
- Sellers can cancel listings at any time (items returned)

### Pre-Orders

- Place a buy order for items not yet listed
- WC is locked in escrow until order fills or is cancelled
- Highest bid wins when an item is listed matching the pre-order
- Pre-orders can exceed the normal max price (up to dev ceiling)

### Categories

| Category | What It Contains |
|----------|-----------------|
| **Resources** | Raw materials: ores, wood, herbs, water, salvage |
| **Consumables** | Food buffs, medicines, combat chemicals |
| **Ability Tomes** | Dropped/crafted ability tomes for hero skill slots |
| **Expedition Passes** | Passes required for high-level expedition zones |
| **Equipment** | Weapons, armor, legs, gloves, boots, shields |
| **Accessories** | Rings, earrings, necklaces, stat focus rings |
| **Wasteland Tools** | Gathering and production tools |

### UI Views

| View | Purpose |
|------|---------|
| **Browse** | Search and buy items by category with price info |
| **Sell Items** | List your resources/gear for sale |
| **My Listings** | Manage active listings and pre-orders |
| **History** | View past transactions |

---

## ABILITY TOME SYSTEM

### Heroes No Longer Have Innate Abilities

All 16 hero classes have had their built-in abilities removed. Heroes are now blank slates
that gain combat power through equippable **Ability Tomes** found in the wasteland.

### 5 Color Types (65 Total Abilities)

| Color | Name | Count | Type | Requirement | Slot |
|-------|------|-------|------|-------------|------|
| **Red** | Crimson Tome | 13 | Melee combat active skills | RES only | Ability Slots 1-4 |
| **Green** | Verdant Tome | 13 | Ranged combat active skills | RES only | Ability Slots 1-4 |
| **Blue** | Cobalt Tome | 13 | Demolitions/tech active skills | RES only | Ability Slots 1-4 |
| **Orange** | Amber Tome | 13 | Passive permanent buffs | RES only | Ability Slots 1-4 |
| **Purple** | Violet Decree | 13 | Warband Decrees (party-wide) | RES + secondary stat | Decree Slot |

### Ability Slot Requirements (Gated by RES)

| Slot | RES Needed | Available |
|------|-----------|-----------|
| Slot 1 | 1 (always) | Any Red/Green/Blue/Orange tome |
| Slot 2 | 30 | Any Red/Green/Blue/Orange tome |
| Slot 3 | 60 | Any Red/Green/Blue/Orange tome |
| Slot 4 | 90 | Any Red/Green/Blue/Orange tome |
| Decree Slot | 50 | Purple tomes only, 1 per party |

### How Abilities Scale

All ability effects scale with RES (Resolve):
- **Effect = Base Effect × (1 + RES × 0.01)**
- Example: 140% damage ability with 50 RES = 140% × 1.50 = 210% effective damage

---

## RED ABILITIES (13) - Crimson Tomes - Melee

| # | Name | CD | RES | Effect | Source |
|---|------|-----|-----|--------|--------|
| 1 | Crushing Blow | 2 | 1 | 140% melee dmg, 20% stun | Z1+ drops |
| 2 | Rending Slash | 1 | 1 | 110% melee + bleed 3%/turn 3t | Z1+ drops |
| 3 | Shield Breaker | 3 | 10 | 120% melee, ignore 30% def | Z2+ drops |
| 4 | Double Strike | 2 | 5 | 75% melee × 2 hits | Z1+ drops |
| 5 | Battle Cry | 5 | 15 | Self: +20% melee, +10% def 3t | Z2+ boss |
| 6 | Whirlwind Strike | 5 | 20 | 70% melee to ALL enemies | Z3+ boss |
| 7 | Execution | 6 | 30 | 150% dmg, 350% if <25% HP | Z4+ boss |
| 8 | Iron Fortress | 5 | 25 | +30% def, 15% reflect 3t | Z3+ drops |
| 9 | Berserker Rush | 4 | 40 | 55% × 3 hits, -15% def 2t | Z5+ boss |
| 10 | Titan Strike | 4 | 45 | 250% melee, 25% armor pen | Z5+ drops |
| 11 | Blood Fury | 6 | 55 | +40% melee, +15% crit 3t | Z6+ boss |
| 12 | Annihilate | 8 | 70 | 400% melee, 50% armor pen | Z7 boss |
| 13 | Undying Rage | 1/fight | 80 | Survive lethal, +100% dmg 2t | Z7 final |

## GREEN ABILITIES (13) - Verdant Tomes - Ranged

| # | Name | CD | RES | Effect | Source |
|---|------|-----|-----|--------|--------|
| 1 | Quick Shot | 1 | 1 | 95% ranged, fastest CD | Z1+ drops |
| 2 | Aimed Shot | 2 | 1 | 140% ranged, +20% acc, can't miss | Z1+ drops |
| 3 | Double Tap | 2 | 5 | 70% ranged × 2 | Z1+ drops |
| 4 | Crippling Shot | 3 | 10 | 100% ranged, -15 speed 2t | Z2+ drops |
| 5 | Piercing Arrow | 3 | 15 | 130% ranged, 20% armor pen | Z2+ drops |
| 6 | Triple Strafe | 3 | 20 | 55% ranged × 3 | Z2+ boss |
| 7 | Headshot | 4 | 25 | Guaranteed crit, +50% crit dmg | Z3+ boss |
| 8 | Smoke Retreat | 4 | 20 | +30% evasion 2t, next +25% dmg | Z3+ drops |
| 9 | Barrage | 5 | 35 | 40% × 5 random targets | Z4+ boss |
| 10 | Sniper's Mark | 5 | 40 | Mark 1 enemy 4t: +20% crit, +15% acc | Z4+ boss |
| 11 | Kill Confirm | 6 | 50 | 200% ranged, 450% if <30% HP | Z5+ boss |
| 12 | Ghost Walk | 6 | 60 | Untargetable 1t, crit +60% | Z6+ boss |
| 13 | Oblivion Volley | 10 | 80 | 250% ranged ALL, 30% crit each | Z7 final |

## BLUE ABILITIES (13) - Cobalt Tomes - Demolitions

| # | Name | CD | RES | Effect | Source |
|---|------|-----|-----|--------|--------|
| 1 | Firebomb | 2 | 1 | 120% blast, 25% burn | Z1+ drops |
| 2 | Frag Toss | 2 | 1 | 100% blast + 45% splash | Z1+ drops |
| 3 | Concussion Grenade | 3 | 10 | 90% blast, 30% stun | Z2+ drops |
| 4 | Smoke Bomb | 4 | 10 | All enemies -25% acc 2t | Z2+ drops |
| 5 | Trip Mine | 3 | 15 | 140% blast to next acting enemy | Z2+ boss |
| 6 | Napalm Flask | 4 | 20 | 80% blast + burn 10/t 4t | Z3+ drops |
| 7 | Cluster Bomb | 4 | 25 | 75% blast ALL enemies | Z3+ boss |
| 8 | EMP Blast | 5 | 30 | 60% all, strip buff, tech +25% | Z4+ boss |
| 9 | Toxic Cloud | 5 | 35 | 50% all, poison 8/t 3t, -10% acc | Z4+ drops |
| 10 | Plasma Lance | 4 | 45 | 200% blast, 25% armor pen | Z5+ drops |
| 11 | Radiation Burst | 6 | 55 | 100% all, rad 15/t 4t, -20% heal | Z6+ boss |
| 12 | Carpet Bomb | 7 | 60 | 140% all 2t, 6% self-dmg | Z6+ boss |
| 13 | Singularity | 12 | 80 | 450% + 180% adj, 12% self, stun self | Z7 final |

## ORANGE ABILITIES (13) - Amber Tomes - Passive

| # | Name | RES | Effect | Source |
|---|------|-----|--------|--------|
| 1 | Thick Skin | 1 | +5% Damage Reduction | Z1+ drops |
| 2 | Scavenger's Luck | 1 | +5% rare drop chance | Z1+ drops |
| 3 | Quick Reflexes | 10 | +5 Turn Speed | Z2+ drops |
| 4 | Keen Eyes | 10 | +5% Accuracy | Z2+ drops |
| 5 | Regeneration | 20 | +2 HP Regen/turn | Z3+ drops |
| 6 | Critical Mastery | 20 | +5% Crit Chance | Z3+ boss |
| 7 | Last Breath | 30 | Survive lethal once (10% HP) | Z4+ boss |
| 8 | Bloodthirst | 30 | 3% lifesteal on all damage | Z4+ drops |
| 9 | Iron Will | 35 | +10% Status Resistance | Z4+ drops |
| 10 | Precision Strikes | 45 | +15% Critical Damage | Z5+ boss |
| 11 | Combat Veteran | 40 | +10% combat XP gain | Z5+ drops |
| 12 | Ghost Protocol | 55 | +8% Evasion, +5 Turn Speed | Z6+ boss |
| 13 | Apex Predator | 70 | +5% all attack, +3% crit, +3% acc | Z7 boss |

## PURPLE ABILITIES (13) - Violet Decrees - Party-Wide

| # | Name | RES | Secondary Req | Effect (Party-Wide) | Source |
|---|------|-----|--------------|---------------------|--------|
| 1 | Wasteland Fury | 50 | STR 15 | +8% all attack | Z3+ boss |
| 2 | Iron Resolve | 50 | CON 20 | +5% def, +30 HP | Z2+ boss |
| 3 | Predator's Instinct | 50 | PER 20 | +5% crit, +10% crit dmg | Z4+ boss |
| 4 | Swift Current | 50 | DEX 15 | +8 speed, +3% evasion | Z3+ boss |
| 5 | Vital Pulse | 50 | CON 15 | +2 regen, +5% status resist | Z2+ boss |
| 6 | Fortune's Favor | 50 | LUK 25 | +5% rare drop, +3% double loot | Z5+ boss |
| 7 | Unyielding Spirit | 50 | CON 35 | Survive lethal 1HP (all, 1/fight) | Z6+ boss |
| 8 | Warmonger's Presence | 50 | STR 25 | +10% dmg to <50% HP enemies | Z5+ boss |
| 9 | Nullification Field | 50 | INT 30 | Immune to first debuff | Z6+ boss |
| 10 | Decree of the Cataclysm | 50 | STR 20, INT 20 | +5% ALL stats | Z7 final |
| 11 | Bountiful Harvest | 50 | LUK 15 | +15% gather yield, +10% prod speed | Z4+ boss |
| 12 | Hawk's Dominion | 50 | PER 25 | +8% accuracy, +5% armor pen | Z5+ boss |
| 13 | Bulwark Command | 50 | CON 25 | +8% defense, +5% dmg reduction | Z5+ boss |
