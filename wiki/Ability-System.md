# Ability System

Heroes can equip up to **4 ability tomes** (based on RES stat) plus **1 Warband Decree** (Purple tome, requires RES ≥ 50). There are **78 total abilities** across **6 color-coded tome types**.

Abilities scale with **Ability Power** (from RES stat): `scaledValue = baseValue + scaling × (abilityPower / 100) × baseValue`

---

## Red Tomes — Melee Combat (13)
> *Physical melee attacks. Scale with STR/Melee Attack.*

| # | Name | Effect | Cooldown | SP Cost | RES Req |
|---|------|--------|----------|---------|---------|
| 1 | Crushing Blow | 140% melee damage + 20% stun chance | 3 | 8 | 0 |
| 2 | Rending Slash | 110% melee + bleed (3% dmg/turn × 3 turns) | 3 | 7 | 0 |
| 3 | Shield Breaker | 120% melee, ignore 30% defense | 4 | 10 | 10 |
| 4 | Double Strike | 75% melee × 2 hits | 3 | 9 | 10 |
| 5 | Battle Cry | +20% melee damage & +10% defense (3 turns) | 5 | 12 | 20 |
| 6 | Whirlwind Strike | 70% melee to ALL enemies | 4 | 14 | 20 |
| 7 | Execution | 150% melee (350% if target < 25% HP) | 5 | 15 | 30 |
| 8 | Iron Fortress | +30% defense, reflect 15% melee damage (3 turns) | 6 | 16 | 30 |
| 9 | Berserker Rush | 3 attacks at 55% + self -15% defense (2 turns) | 4 | 18 | 40 |
| 10 | Titan Strike | 250% melee, ignore 25% defense | 6 | 22 | 50 |
| 11 | Blood Fury | +40% melee, +15% crit, -20% defense (3 turns) | 5 | 25 | 60 |
| 12 | Annihilate | 400% melee, 50% armor penetration | 8 | 35 | 70 |
| 13 | Undying Rage | Passive: survive lethal hit with 1 HP, +100% damage (2 turns). Once per fight | — | — | 80 |

---

## Green Tomes — Ranged Combat (13)
> *Ranged attacks. Scale with DEX/Ranged Attack.*

| # | Name | Effect | Cooldown | SP Cost | RES Req |
|---|------|--------|----------|---------|---------|
| 1 | Quick Shot | 95% ranged (fastest cooldown) | 2 | 5 | 0 |
| 2 | Aimed Shot | 140% ranged, +20% accuracy | 3 | 8 | 0 |
| 3 | Double Tap | 70% ranged × 2 | 3 | 9 | 10 |
| 4 | Crippling Shot | 100% ranged + -15 turn speed (2 turns) | 3 | 8 | 10 |
| 5 | Piercing Arrow | 130% ranged, ignore 20% defense | 4 | 10 | 20 |
| 6 | Triple Strafe | 55% ranged × 3 arrows | 4 | 14 | 20 |
| 7 | Headshot | Guaranteed crit + 50% crit damage bonus | 5 | 15 | 30 |
| 8 | Smoke Retreat | +30% evasion (2 turns), next attack +25% | 5 | 13 | 30 |
| 9 | Barrage | 5 shots at 40% each at random targets | 5 | 20 | 40 |
| 10 | Sniper's Mark | Mark 1 enemy (4 turns): all attacks +20% crit, +15% accuracy | 6 | 18 | 50 |
| 11 | Kill Confirm | 200% ranged (450% if target < 30% HP) | 6 | 22 | 60 |
| 12 | Ghost Walk | Untargetable 1 turn, next attack guaranteed crit + 60% damage | 7 | 28 | 70 |
| 13 | Oblivion Volley | 250% ranged to ALL enemies, 30% crit each | 8 | 35 | 80 |

---

## Blue Tomes — Demolitions/Tech (13)
> *Blast/AoE attacks. Scale with INT/Blast Attack.*

| # | Name | Effect | Cooldown | SP Cost | RES Req |
|---|------|--------|----------|---------|---------|
| 1 | Firebomb | 120% blast, 25% chance burn (5 dmg/turn × 2 turns) | 3 | 8 | 0 |
| 2 | Frag Toss | 100% blast + 45% to adjacent enemies | 3 | 9 | 0 |
| 3 | Concussion Grenade | 90% blast, 30% stun chance | 3 | 8 | 10 |
| 4 | Smoke Bomb | -25% accuracy to all enemies (2 turns) | 4 | 10 | 10 |
| 5 | Trip Mine | 140% blast to next acting enemy | 4 | 12 | 20 |
| 6 | Napalm Flask | 80% blast + burn (10 dmg/turn × 4 turns) | 4 | 14 | 20 |
| 7 | Cluster Bomb | 75% blast to ALL enemies | 5 | 16 | 30 |
| 8 | EMP Blast | 60% to all, remove 1 buff/enemy, +25% tech armor | 5 | 18 | 30 |
| 9 | Toxic Cloud | 50% to all, poison (8 dmg/turn × 3 turns), -10% accuracy | 5 | 20 | 40 |
| 10 | Plasma Lance | 200% blast, ignore 25% defense | 6 | 22 | 50 |
| 11 | Radiation Burst | 100% to all, radiation (15 dmg/turn × 4 turns), -20% healing | 6 | 28 | 60 |
| 12 | Carpet Bomb | 140% to ALL enemies (2 turns), self-damage 6% | 7 | 32 | 70 |
| 13 | Singularity | 450% to 1 target + 180% to adjacent, self-damage 12%, self-stun 1 turn | 8 | 40 | 80 |

---

## White Tomes — Support/Healing (13)
> *Healing and buffs. Require both RES and CON.*

| # | Name | Effect | Cooldown | SP Cost | RES Req | CON Req |
|---|------|--------|----------|---------|---------|---------|
| 1 | First Aid | Restore 15% Max HP | 3 | 8 | 0 | 0 |
| 2 | Mending Salve | 4% Max HP/turn × 4 turns (HoT) | 4 | 7 | 0 | 0 |
| 3 | Rally Cry | +15% damage all allies (3 turns) | 5 | 12 | 10 | 10 |
| 4 | Suppressive Smoke | -15% accuracy to enemies (3 turns) | 4 | 10 | 10 | 10 |
| 5 | Fortify | +20% defense self (4 turns) | 5 | 12 | 20 | 15 |
| 6 | Adrenaline Shot | +20% turn speed, +10% crit (3 turns) | 5 | 14 | 20 | 15 |
| 7 | Triage | Restore 30% Max HP, self-stun 1 turn | 4 | 18 | 30 | 20 |
| 8 | Iron Guard | +25% damage reduction, -15% attack (3 turns) | 5 | 16 | 30 | 20 |
| 9 | Purifying Light | +20% status resist (4 turns) | 5 | 14 | 40 | 25 |
| 10 | Battlefield Command | +10% accuracy, +10% crit damage all allies (3 turns) | 6 | 20 | 50 | 30 |
| 11 | Shield Wall | +15% defense, +10% damage reduction all allies (3 turns) | 6 | 22 | 60 | 35 |
| 12 | Lifeblood Surge | Restore 50% Max HP, +5 HP Regen (5 turns) | 7 | 30 | 70 | 40 |
| 13 | Undying Covenant | Passive: +3 HP Regen, +50 Max HP, +5% Status Resist | — | — | 70 | 45 |

---

## Orange Tomes — Passive Abilities (13)
> *Permanent passive bonuses. No cooldown, no SP cost. Always active.*

| # | Name | Effect | RES Req |
|---|------|--------|---------|
| 1 | Thick Skin | +5% damage reduction permanently | 0 |
| 2 | Scavenger's Luck | +5% rare drop chance | 0 |
| 3 | Quick Reflexes | +5 turn speed permanently | 10 |
| 4 | Keen Eyes | +5% accuracy permanently | 10 |
| 5 | Regeneration | +2 HP Regen/turn permanently | 20 |
| 6 | Critical Mastery | +5% crit chance permanently | 20 |
| 7 | Last Breath | Survive lethal hit with 10% HP (once per fight) | 30 |
| 8 | Bloodthirst | Lifesteal 3% of damage dealt | 30 |
| 9 | Iron Will | +10% status resist permanently | 40 |
| 10 | Precision Strikes | +15% crit damage permanently | 50 |
| 11 | Combat Veteran | +10% combat XP gain permanently | 60 |
| 12 | Ghost Protocol | +8% evasion, +5 turn speed permanently | 70 |
| 13 | Apex Predator | +5% all attack types, +3% crit, +3% accuracy | 80 |

---

## Purple Tomes — Warband Decrees (13)
> *Party-wide auras. Only 1 decree per party. Requires RES + a secondary stat. Equipped in the special Decree slot (RES ≥ 50).*

| # | Name | Effect | RES Req | Secondary Req |
|---|------|--------|---------|---------------|
| 1 | Wasteland Fury | +8% melee, ranged, and blast damage | 10 | STR |
| 2 | Iron Resolve | +5% defense, +30 Max HP | 10 | CON |
| 3 | Predator's Instinct | +5% crit chance, +10% crit damage | 20 | PER |
| 4 | Swift Current | +8 turn speed, +3% evasion | 20 | DEX |
| 5 | Vital Pulse | +2 HP Regen/turn, +5% status resist | 30 | CON |
| 6 | Fortune's Favor | +5% rare drops, +3% double loot | 30 | LUK |
| 7 | Unyielding Spirit | Each member survives first lethal hit with 1 HP | 40 | CON |
| 8 | Warmonger's Presence | +10% damage to enemies below 50% HP | 40 | STR |
| 9 | Nullification Field | Party immune to first debuff per fight | 50 | INT |
| 10 | Decree of Cataclysm | +5% to ALL stats | 60 | STR 20 + INT 20 |
| 11 | Bountiful Harvest | +15% gathering yield, +10% production speed | 50 | LUK |
| 12 | Hawk's Dominion | +8% accuracy, +5% armor penetration | 60 | PER |
| 13 | Bulwark Command | +8% defense, +5% damage reduction | 70 | CON |

---

## Ability DPS Contribution Formula

Each equipped ability contributes to hero DPS during idle combat:

1. **Actual SP Cost**: `max(1, round(spCost × (1 - spCostReduction / 100)))`
2. **Casts from cooldown**: `floor(fightDuration / cooldown)`
3. **Casts from SP**: `floor((maxSp + spRegen × turns) / actualCost)`
4. **Actual casts**: `min(cooldownCasts, spCasts)`
5. **Damage per cast**: `(scaledValue / 100) × attack`
6. **DPS contribution**: `damagPerCast × castCount / fightDuration`

For buffs: `scaledValue × min(1, duration / cooldown)` applied as stat modifier.
For DoTs: `(scaledValue / 100) × attack × min(1, (duration × castCount) / fightDuration)`
