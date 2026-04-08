# Ability System

Heroes can equip up to **4 active ability tomes** (based on RES stat) plus **1 Warband Decree** (Purple tome, requires RES >= 50). There are **78 total abilities** across **6 color-coded tome types**.

Abilities scale with **Ability Power** (derived from RES stat): `scaledValue = baseValue + scaling * (abilityPower / 100) * baseValue`

---

## Ability Slot Unlocking

Active ability slots are gated by the hero's RES stat:

| RES Range | Slots Unlocked |
|-----------|----------------|
| 1-29      | 1              |
| 30-59     | 2              |
| 60-89     | 3              |
| 90+       | 4              |

The first slot requires only RES 1. Each additional slot unlocks at the thresholds shown above.

The **Decree slot** is a separate 5th slot for Purple tomes only. It requires RES >= 50 (`canEquipAura`). Only 1 Warband Decree can be active per party.

---

## Cooldown Behavior

Ability cooldowns are tracked via `globalTick` -- a counter that **never resets between fights**. Cooldowns persist across encounters. When a hero uses an ability, it records the globalTick at time of use, and the ability becomes available again after its cooldown in ticks has elapsed. There is no cooldown reset between fights.

Cooldown values in the tables below are in **combat ticks** (the `cooldown` field in code). Passive abilities have cooldown 0.

---

## Tome Color Labels

| Color  | Label         | Hex     |
|--------|---------------|---------|
| Red    | Crimson Tome  | #ef4444 |
| Green  | Verdant Tome  | #22c55e |
| Blue   | Cobalt Tome   | #3b82f6 |
| White  | Silver Tome   | #c0c0c0 |
| Orange | Amber Tome    | #f97316 |
| Purple | Violet Decree | #a855f7 |

---

## Red Tomes -- Melee Combat (13)

> Physical melee attacks. Scale with STR/Melee Attack. RES required only.

| # | Name | Cooldown | SP Cost | RES Req | Effect | Type | Source |
|---|------|----------|---------|---------|--------|------|--------|
| 1 | Crushing Blow | 8 | 15 | 1 | Deal 140% melee damage. 20% chance to stun for 1 turn. | damage | Zone 1+ drops, Vendor |
| 2 | Rending Slash | 10 | 5 | 1 | Deal 110% melee damage. Apply bleed: 3% dmg/turn for 3 turns. | dot | Zone 1+ drops |
| 3 | Shield Breaker | 10 | 10 | 10 | Deal 120% melee damage. Ignore 30% of target defense. | damage | Zone 2+ drops |
| 4 | Double Strike | 14 | 8 | 5 | Deal 75% melee damage twice. | damage | Zone 1+ drops, Vendor |
| 5 | Battle Cry | 18 | 15 | 15 | Self: +20% melee damage and +10% defense for 3 turns. | buff | Zone 2+ boss |
| 6 | Whirlwind Strike | 16 | 20 | 20 | Deal 70% melee damage to ALL enemies. | damage | Zone 3+ boss |
| 7 | Execution | 20 | 25 | 30 | Deal 150% melee damage. If target <25% HP, deal 350% instead. | damage | Zone 4+ boss |
| 8 | Iron Fortress | 18 | 18 | 25 | Self: +30% defense, reflect 15% melee damage for 3 turns. | buff | Zone 3+ drops |
| 9 | Berserker Rush | 16 | 22 | 40 | Attack 3 times at 55% damage each. Self: -15% defense for 2 turns. | damage | Zone 5+ boss |
| 10 | Titan Strike | 12 | 22 | 45 | Deal 250% melee damage. Ignore 25% defense. | damage | Zone 5+ drops |
| 11 | Blood Fury | 20 | 25 | 55 | For 3 turns: +40% melee damage, +15% crit, -20% defense. | buff | Zone 6+ boss |
| 12 | Annihilate | 8 | 30 | 70 | Deal 400% melee damage. 50% armor penetration. | damage | Zone 7 boss |
| 13 | Undying Rage | 0 | 0 | 80 | Once per fight: survive lethal hit with 1 HP, +100% damage for 2 turns. | buff | Zone 7 final boss |

**Note:** Undying Rage has cooldown 0 and spCost 0, but `isPassive: false`. It is a once-per-fight triggered effect, not a standard passive.

---

## Green Tomes -- Ranged Combat (13)

> Ranged attacks. Scale with DEX/Ranged Attack. RES required only.

| # | Name | Cooldown | SP Cost | RES Req | Effect | Type | Source |
|---|------|----------|---------|---------|--------|------|--------|
| 1 | Quick Shot | 8 | 5 | 1 | Deal 95% ranged damage. Fastest cooldown. | damage | Zone 1+ drops, Vendor |
| 2 | Aimed Shot | 9 | 10 | 1 | Deal 140% ranged damage. +20% accuracy. Cannot miss. | damage | Zone 1+ drops, Vendor |
| 3 | Double Tap | 14 | 8 | 5 | Deal 70% ranged damage twice. | damage | Zone 1+ drops |
| 4 | Crippling Shot | 12 | 12 | 10 | Deal 100% ranged damage. Target: -15 Turn Speed for 2 turns. | debuff | Zone 2+ drops |
| 5 | Piercing Arrow | 10 | 12 | 15 | Deal 130% ranged damage. Ignore 20% defense. | damage | Zone 2+ drops |
| 6 | Triple Strafe | 15 | 15 | 20 | Fire 3 shots at 55% ranged damage each. | damage | Zone 2+ boss |
| 7 | Headshot | 12 | 15 | 25 | Guaranteed crit. +50% crit damage bonus on this attack. | damage | Zone 3+ boss |
| 8 | Smoke Retreat | 16 | 14 | 20 | Self: +30% Evasion for 2 turns. Next attack +25% damage. | buff | Zone 3+ drops |
| 9 | Barrage | 18 | 20 | 35 | Fire 5 shots at 40% damage each at random targets. | damage | Zone 4+ boss |
| 10 | Sniper's Mark | 18 | 18 | 40 | Mark 1 enemy for 4 turns. All attacks +20% crit, +15% accuracy. | buff | Zone 4+ boss |
| 11 | Kill Confirm | 20 | 22 | 50 | Deal 200% ranged damage. If target <30% HP, deal 450%. | damage | Zone 5+ boss |
| 12 | Ghost Walk | 20 | 25 | 60 | Untargetable 1 turn. Next attack: guaranteed crit +60% damage. | buff | Zone 6+ boss |
| 13 | Oblivion Volley | 10 | 30 | 80 | Deal 250% ranged damage to ALL enemies. Each hit: 30% crit chance. | damage | Zone 7 final boss |

---

## Blue Tomes -- Demolitions/Tech (13)

> Blast/AoE attacks. Scale with INT/Blast Attack. RES required only.

| # | Name | Cooldown | SP Cost | RES Req | Effect | Type | Source |
|---|------|----------|---------|---------|--------|------|--------|
| 1 | Firebomb | 8 | 10 | 1 | Deal 120% blast damage. 25% chance: burn 5 dmg/turn for 2 turns. | damage | Zone 1+ drops, Vendor |
| 2 | Frag Toss | 9 | 8 | 1 | Deal 100% blast to target + 45% to 1 adjacent enemy. | damage | Zone 1+ drops, Vendor |
| 3 | Concussion Grenade | 10 | 12 | 10 | Deal 90% blast damage. 30% chance stun for 1 turn. | damage | Zone 2+ drops |
| 4 | Smoke Bomb | 14 | 12 | 10 | All enemies: -25% accuracy for 2 turns. | debuff | Zone 2+ drops |
| 5 | Trip Mine | 10 | 12 | 15 | Next enemy that acts takes 140% blast damage. | damage | Zone 2+ boss |
| 6 | Napalm Flask | 14 | 18 | 20 | Deal 80% blast damage. Burn: 10 dmg/turn for 4 turns. | dot | Zone 3+ drops |
| 7 | Cluster Bomb | 16 | 20 | 25 | Deal 75% blast damage to ALL enemies. | damage | Zone 3+ boss |
| 8 | EMP Blast | 16 | 20 | 30 | Deal 60% blast to all. Remove 1 buff from each enemy. Tech armor +25%. | damage | Zone 4+ boss |
| 9 | Toxic Cloud | 15 | 22 | 35 | Deal 50% blast to all. Poison: 8 dmg/turn 3 turns. -10% enemy accuracy. | dot | Zone 4+ drops |
| 10 | Plasma Lance | 12 | 22 | 45 | Deal 200% blast damage. Ignore 25% defense. | damage | Zone 5+ drops |
| 11 | Radiation Burst | 18 | 28 | 55 | Deal 100% blast to all. Radiation: 15 dmg/turn 4 turns. -20% healing. | dot | Zone 6+ boss |
| 12 | Carpet Bomb | 20 | 28 | 60 | Deal 140% blast to ALL enemies over 2 turns. Self-damage: 6%. | damage | Zone 6+ boss |
| 13 | Singularity | 12 | 30 | 80 | Deal 450% blast to 1 target, 180% to adjacent. Self-damage: 12%. Self-stun 1 turn. | damage | Zone 7 final boss |

---

## White Tomes -- Support/Healing (13)

> Healing and buffs. Require RES (and some require CON as a secondary stat).

| # | Name | Cooldown | SP Cost | Requirements | Effect | Type | Source |
|---|------|----------|---------|--------------|--------|------|--------|
| 1 | First Aid | 10 | 6 | RES 1 | Restore 15% of Max HP instantly. | heal | Zone 1+ drops, Vendor |
| 2 | Mending Salve | 12 | 8 | RES 5 | Heal 4% Max HP per turn for 4 turns. | heal | Zone 1+ drops |
| 3 | Rally Cry | 18 | 12 | RES 10, CON 12 | All allies: +15% damage for 3 turns. | buff | Zone 2+ drops |
| 4 | Suppressive Smoke | 14 | 10 | RES 15 | Enemy accuracy -15% for 3 turns. | debuff | Zone 2+ drops |
| 5 | Fortify | 18 | 12 | RES 15, CON 15 | Self: +20% defense for 4 turns. | buff | Zone 2+ boss |
| 6 | Adrenaline Shot | 20 | 14 | RES 20, CON 15 | Self or ally: +20% turn speed, +10% crit for 3 turns. | buff | Zone 3+ drops |
| 7 | Triage | 14 | 18 | RES 25, CON 18 | Restore 30% Max HP. Self-stun 1 turn. | heal | Zone 3+ boss |
| 8 | Iron Guard | 18 | 15 | RES 25, CON 20 | +25% damage reduction for 3 turns. -15% attack. | buff | Zone 3+ drops |
| 9 | Purifying Light | 16 | 14 | RES 30, CON 20 | +20% status resistance for 4 turns. | buff | Zone 4+ drops |
| 10 | Battlefield Command | 22 | 18 | RES 35, CON 22 | All allies: +10% accuracy, +10% crit damage for 3 turns. | buff | Zone 4+ boss |
| 11 | Shield Wall | 22 | 22 | RES 45, CON 25 | All allies: +15% defense, +10% damage reduction for 3 turns. | buff | Zone 5+ drops |
| 12 | Lifeblood Surge | 8 | 25 | RES 55, CON 30 | Restore 50% Max HP. +5 HP Regen for 5 turns. | heal | Zone 6+ boss |
| 13 | Undying Covenant | 0 | 0 | RES 70, CON 35 | Passive: +3 HP Regen, +50 Max HP, +5% Status Resist. | passive | Zone 7 final boss |

**Note:** Undying Covenant is the only White tome with `isPassive: true`. Cooldown 0, SP Cost 0.

---

## Orange Tomes -- Passive Abilities (13)

> Permanent passive bonuses. All have `cooldown: 0`, `spCost: 0`, `isPassive: true`. Always active when equipped. RES required only.

| # | Name | RES Req | Effect | Type | Source |
|---|------|---------|--------|------|--------|
| 1 | Thick Skin | 1 | +5% Damage Reduction permanently. | passive | Zone 1+ drops, Vendor |
| 2 | Scavenger's Luck | 1 | +5% rare drop chance. | passive | Zone 1+ drops, Vendor |
| 3 | Quick Reflexes | 10 | +5 Turn Speed permanently. | passive | Zone 2+ drops |
| 4 | Keen Eyes | 10 | +5% Accuracy permanently. | passive | Zone 2+ drops |
| 5 | Regeneration | 20 | +2 HP Regen per turn permanently. | passive | Zone 3+ drops |
| 6 | Critical Mastery | 20 | +5% Critical Chance permanently. | passive | Zone 3+ boss |
| 7 | Last Breath | 30 | Once per fight: survive lethal hit with 10% HP. | passive | Zone 4+ boss |
| 8 | Bloodthirst | 30 | Lifesteal: heal 3% of damage dealt. | passive | Zone 4+ drops |
| 9 | Iron Will | 35 | +10% Status Resistance permanently. | passive | Zone 4+ drops |
| 10 | Precision Strikes | 45 | +15% Critical Damage permanently. | passive | Zone 5+ boss |
| 11 | Combat Veteran | 40 | +10% combat XP gain permanently. | passive | Zone 5+ drops |
| 12 | Ghost Protocol | 55 | +8% Evasion, +5 Turn Speed permanently. | passive | Zone 6+ boss |
| 13 | Apex Predator | 70 | +5% to ALL attack types, +3% crit, +3% accuracy. | passive | Zone 7 boss |

**All Orange tomes are passives** -- they have no cooldown, no SP cost, and are always active when equipped.

---

## Purple Tomes -- Warband Decrees (13)

> Party-wide passive auras. All have `cooldown: 0`, `spCost: 0`, `isPassive: true`, `isDecree: true`. Only **1 decree per party**. Equipped in the special Decree slot (requires RES >= 50). All Purple tomes require RES 50 as a base, plus a secondary stat.

| # | Name | RES Req | Secondary Req | Effect | Source |
|---|------|---------|---------------|--------|--------|
| 1 | Wasteland Fury | 50 | STR 15 | All party: +8% melee, ranged, and blast attack. | Zone 3+ boss, Biochem Lv.40 |
| 2 | Iron Resolve | 50 | CON 20 | All party: +5% defense, +30 Max HP. | Zone 2+ boss, Biochem Lv.30 |
| 3 | Predator's Instinct | 50 | PER 20 | All party: +5% Crit Chance, +10% Crit Damage. | Zone 4+ boss |
| 4 | Swift Current | 50 | DEX 15 | All party: +8 Turn Speed, +3% Evasion. | Zone 3+ boss |
| 5 | Vital Pulse | 50 | CON 15 | All party: +2 HP Regen/turn, +5% Status Resist. | Zone 2+ boss, Biochem Lv.35 |
| 6 | Fortune's Favor | 50 | LUK 25 | All party: +5% rare drop chance, +3% double loot chance. | Zone 5+ boss |
| 7 | Unyielding Spirit | 50 | CON 35 | All party: survive first lethal hit with 1 HP (once per fight per member). | Zone 6+ boss |
| 8 | Warmonger's Presence | 50 | STR 25 | All party: +10% damage to enemies below 50% HP. | Zone 5+ boss, Biochem Lv.70 |
| 9 | Nullification Field | 50 | INT 30 | All party: immune to first debuff each fight. | Zone 6+ boss |
| 10 | Decree of the Cataclysm | 50 | STR 20, INT 20 | All party: +5% to ALL stats. | Zone 7 final boss only |
| 11 | Bountiful Harvest | 50 | LUK 15 | All party: +15% gathering yield, +10% production speed. | Zone 4+ boss, Biochem Lv.50 |
| 12 | Hawk's Dominion | 50 | PER 25 | All party: +8% Accuracy, +5% Armor Penetration. | Zone 5+ boss |
| 13 | Bulwark Command | 50 | CON 25 | All party: +8% Defense, +5% Damage Reduction. | Zone 5+ boss, Biochem Lv.60 |

**All Purple tomes are Warband Decrees** -- party-wide passive auras. Only 1 per party. They all require RES 50.

---

## Ability DPS Contribution Formula

Each equipped ability contributes to hero DPS during idle combat:

1. **Actual SP Cost**: `max(1, round(spCost * (1 - spCostReduction / 100)))`
2. **Casts from cooldown**: `floor(fightDuration / cooldown)`
3. **Casts from SP**: `floor((maxSp + spRegen * turns) / actualCost)`
4. **Actual casts**: `min(cooldownCasts, spCasts)`
5. **Damage per cast**: `(scaledValue / 100) * attack`
6. **DPS contribution**: `damagePerCast * castCount / fightDuration`

For buffs: `scaledValue * min(1, duration / cooldown)` applied as stat modifier.
For DoTs: `(scaledValue / 100) * attack * min(1, (duration * castCount) / fightDuration)`
