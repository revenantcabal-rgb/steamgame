# Wasteland Grind - Abilities Reference

Ability system overview, 5 ability colors, SP costs, cooldowns, durations, mechanical effects, ability slots (RES gating), decree system, and all 65 abilities.

See also: [Stats](GAME_WIKI_STATS.md) | [Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md) | [Heroes](GAME_WIKI_HEROES.md) | [Combat](GAME_WIKI_COMBAT.md)

---

## TABLE OF CONTENTS

1. [Ability System Overview](#ability-system-overview)
2. [Ability Tome System](#ability-tome-system)
3. [5 Ability Colors](#5-ability-colors)
4. [Ability Slot Requirements (RES Gating)](#ability-slot-requirements)
5. [Ability Power Scaling](#ability-power-scaling)
6. [SP Costs & Cooldowns](#sp-costs--cooldowns)
7. [Red Abilities (13) - Crimson Tomes - Melee](#red-abilities)
8. [Green Abilities (13) - Verdant Tomes - Ranged](#green-abilities)
9. [Blue Abilities (13) - Cobalt Tomes - Demolitions](#blue-abilities)
10. [Orange Abilities (13) - Amber Tomes - Passive](#orange-abilities)
11. [Purple Abilities (13) - Violet Decrees - Party-Wide](#purple-abilities)
12. [Warband Decree System](#warband-decree-system)
13. [Warband Decree List (with RES scaling)](#warband-decree-list)
14. [Innate Class Abilities](#innate-class-abilities)
15. [Innate vs Equippable Comparison](#innate-vs-equippable-comparison)

---

## ABILITY SYSTEM OVERVIEW

Heroes have two types of combat abilities:
1. **Innate Class Abilities** (3 per class, unlock at Lv.1/30/60) - permanent, cannot be changed
2. **Equippable Ability Tomes** (up to 4 slots, gated by RES) - found, bought, traded, swappable
3. **Warband Decree** (1 slot, RES 50+, party-wide buff, once per party)

### How It Works

Each hero has:
```
[Class Ability 1] - Always active (Lv.1+)
[Class Ability 2] - Always active (Lv.30+)
[Class Ability 3] - Always active (Lv.60+)
[Ability Slot 1]  - RES 1+  (always available)
[Ability Slot 2]  - RES 30+ (need 30 Resolve to unlock)
[Ability Slot 3]  - RES 60+ (need 60 Resolve to unlock)
[Ability Slot 4]  - RES 90+ (need 90 Resolve to unlock)
[Warband Decree]  - RES 50+ (party-wide, once per party)
```

**Key Rule:** If a hero doesn't invest in RES, they're limited to 1 ability slot + their 3 innate abilities. Investing heavily in RES (90+) gives access to all 4 ability slots plus a decree, making them a versatile fighter but sacrificing raw combat stats.

---

## ABILITY TOME SYSTEM

All 16 hero classes have had their built-in abilities removed from the equippable system. Heroes are now blank slates that gain combat power through equippable **Ability Tomes** found in the wasteland (on top of their 3 innate class abilities).

Ability Tomes are items - they can be found, bought on the [Marketplace](GAME_WIKI_MARKETPLACE.md), and traded.

---

## 5 ABILITY COLORS

| Color | Name | Count | Type | Requirement | Slot |
|-------|------|-------|------|-------------|------|
| **Red** | Crimson Tome | 13 | Melee combat active skills | RES only | Ability Slots 1-4 |
| **Green** | Verdant Tome | 13 | Ranged combat active skills | RES only | Ability Slots 1-4 |
| **Blue** | Cobalt Tome | 13 | Demolitions/tech active skills | RES only | Ability Slots 1-4 |
| **Orange** | Amber Tome | 13 | Passive permanent buffs | RES only | Ability Slots 1-4 |
| **Purple** | Violet Decree | 13 | Warband Decrees (party-wide) | RES + secondary stat | Decree Slot |

---

## ABILITY SLOT REQUIREMENTS

| Slot | RES Needed | Available |
|------|-----------|-----------|
| Slot 1 | 1 (always) | Any Red/Green/Blue/Orange tome |
| Slot 2 | 30 | Any Red/Green/Blue/Orange tome |
| Slot 3 | 60 | Any Red/Green/Blue/Orange tome |
| Slot 4 | 90 | Any Red/Green/Blue/Orange tome |
| Decree Slot | 50 | Purple tomes only, 1 per party |

---

## ABILITY POWER SCALING

All ability effects scale with RES (Resolve):
- **Effect = Base Effect x (1 + RES x 0.01)**
- Example: 140% damage ability with 50 RES = 140% x 1.50 = 210% effective damage
- Example: A skill that heals 100 HP with 50 RES = 100 x 1.50 = 150 HP

---

## SP COSTS & COOLDOWNS

Active abilities (Red, Green, Blue) consume SP when used. See [Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md) for full SP mechanics.

- Each active ability has an SP cost proportional to its power level
- Passive abilities (Orange) do not consume SP
- Warband Decrees (Purple) do not consume SP - they are passive party-wide effects
- SP regenerates each turn based on spRegen stat
- SP cost can be reduced via gear with spCostReduction modifiers

---

## RED ABILITIES (13) - Crimson Tomes - Melee

| # | Name | CD | RES | Effect | Source |
|---|------|-----|-----|--------|--------|
| 1 | Crushing Blow | 2 | 1 | 140% melee dmg, 20% stun | Z1+ drops |
| 2 | Rending Slash | 1 | 1 | 110% melee + bleed 3%/turn 3t | Z1+ drops |
| 3 | Shield Breaker | 3 | 10 | 120% melee, ignore 30% def | Z2+ drops |
| 4 | Double Strike | 2 | 5 | 75% melee x 2 hits | Z1+ drops |
| 5 | Battle Cry | 5 | 15 | Self: +20% melee, +10% def 3t | Z2+ boss |
| 6 | Whirlwind Strike | 5 | 20 | 70% melee to ALL enemies | Z3+ boss |
| 7 | Execution | 6 | 30 | 150% dmg, 350% if <25% HP | Z4+ boss |
| 8 | Iron Fortress | 5 | 25 | +30% def, 15% reflect 3t | Z3+ drops |
| 9 | Berserker Rush | 4 | 40 | 55% x 3 hits, -15% def 2t | Z5+ boss |
| 10 | Titan Strike | 4 | 45 | 250% melee, 25% armor pen | Z5+ drops |
| 11 | Blood Fury | 6 | 55 | +40% melee, +15% crit 3t | Z6+ boss |
| 12 | Annihilate | 8 | 70 | 400% melee, 50% armor pen | Z7 boss |
| 13 | Undying Rage | 1/fight | 80 | Survive lethal, +100% dmg 2t | Z7 final |

---

## GREEN ABILITIES (13) - Verdant Tomes - Ranged

| # | Name | CD | RES | Effect | Source |
|---|------|-----|-----|--------|--------|
| 1 | Quick Shot | 1 | 1 | 95% ranged, fastest CD | Z1+ drops |
| 2 | Aimed Shot | 2 | 1 | 140% ranged, +20% acc, can't miss | Z1+ drops |
| 3 | Double Tap | 2 | 5 | 70% ranged x 2 | Z1+ drops |
| 4 | Crippling Shot | 3 | 10 | 100% ranged, -15 speed 2t | Z2+ drops |
| 5 | Piercing Arrow | 3 | 15 | 130% ranged, 20% armor pen | Z2+ drops |
| 6 | Triple Strafe | 3 | 20 | 55% ranged x 3 | Z2+ boss |
| 7 | Headshot | 4 | 25 | Guaranteed crit, +50% crit dmg | Z3+ boss |
| 8 | Smoke Retreat | 4 | 20 | +30% evasion 2t, next +25% dmg | Z3+ drops |
| 9 | Barrage | 5 | 35 | 40% x 5 random targets | Z4+ boss |
| 10 | Sniper's Mark | 5 | 40 | Mark 1 enemy 4t: +20% crit, +15% acc | Z4+ boss |
| 11 | Kill Confirm | 6 | 50 | 200% ranged, 450% if <30% HP | Z5+ boss |
| 12 | Ghost Walk | 6 | 60 | Untargetable 1t, crit +60% | Z6+ boss |
| 13 | Oblivion Volley | 10 | 80 | 250% ranged ALL, 30% crit each | Z7 final |

---

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

---

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

---

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

## WARBAND DECREE LIST

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

## INNATE CLASS ABILITIES

Every hero class has 3 innate abilities that unlock at Lv.1, Lv.30, and Lv.60. These are permanent and cannot be changed.

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
| Frenzy | 30 | 5 | Attack 3x at 60% each. Each builds Rage |
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

See [Heroes](GAME_WIKI_HEROES.md) for full Artisan ability details.

---

## INNATE VS EQUIPPABLE COMPARISON

| | Innate Class Ability | Equippable Ability Tome |
|---|---------------------|------------------------|
| Source | Comes with class | Dropped, bought, traded |
| Changeable? | No, permanent | Yes, swap anytime |
| Slots | 3 (Lv.1/30/60) | Up to 4 (gated by RES) |
| Upgradeable? | No | Yes (via RES scaling) |
| Tradeable? | No | Yes (marketplace) |
| Stat requirement? | Hero level only | RES threshold |
| SP Cost? | No (innate abilities are free) | Yes (active tomes consume SP) |
