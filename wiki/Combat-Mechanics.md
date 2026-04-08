# Combat Mechanics & Formulas

## Fight Simulation Overview

Combat in Wasteland Survivor is **idle/auto-resolved**. Heroes are deployed to combat zones and automatically fight enemies. Each tick (1 second), heroes deal damage to the first alive enemy based on their individual turn speed. When all enemies in a group are dead, the fight resolves and new enemies spawn.

### Per-Hero Attack Timing

Each hero attacks independently based on their turn speed:
- `attackInterval = max(1, round(100 / turnSpeed × 3))` ticks
- Heroes are staggered by their index so they don't all attack on the same tick
- A hero attacks when `(globalTick + heroIndex) % attackInterval === 0`
- Faster heroes (higher turnSpeed) attack more frequently
- Heroes are sorted by turn speed (fastest displayed left, attacks first)

---

## Hero Damage Calculation

### Base Attack
`baseAttack = max(meleeAttack, rangedAttack, blastAttack)`

### Hit Rate
`hitRate = accuracy / 100` (min 0%, capped at 99%)

### Critical Multiplier
`critMult = 1 + (critChance / 100) × (critDamage / 100 - 1)`

Default crit damage is 150%.

### Armor Penetration
Enemy base defense is 10%, reduced by armor pen:
`effectiveEnemyDefense = 0.10 × max(0, 1 - armorPen / 100)`

### Combat Triangle
- Melee beats Demolitions (+10%)
- Demolitions beats Ranged (+10%)
- Ranged beats Melee (+10%)
- Disadvantage: -10%

### DoT Bonuses
Added to DPS as percentage of hero attack:
- Burn: `heroAttack × burnDot / 100`
- Poison: `heroAttack × poisonDot / 100`
- Radiation: `heroAttack × radiationDot / 100`
- Bleed: `heroAttack × bleedDot / 100`

### Encampment Bonuses
`encampmentDamageMult = 1 + combatDamageBonus / 100`

### Final Hero DPS
```
heroDps = baseAttack × hitRate × critMult × (1 - effectiveEnemyDefense)
          × combatTriangleMult × encampmentDamageMult
        + dotBonuses
        + abilityBonusDps
```

---

## Enemy Scaling

### HP Scaling
`scaledHp = enemy.baseHp × zoneTierMult.hpMult × waveMultiplier × difficultyMult`

### Damage Scaling
`scaledDmg = enemy.baseDmg × zoneTierMult.dmgMult × waveMultiplier × difficultyMult`

### XP Scaling
`scaledXp = enemy.baseXp × zoneTierMult.xpMult × waveMultiplier`

Note: XP does NOT scale with `difficultyMult`.

### Boss Multiplier
Bosses receive: `waveMultiplier × 1.5` (50% stronger than current wave enemies)

### Wave Scaling
- Every **10 fights**, enemies get **+2%** stats (HP, damage, XP)
- Formula: `waveMultiplier = 1.0 + floor(fightCount / 10) × 0.02`
- Wave multiplier resets to 1.0 after boss defeat
- Boss appears every **50 fights** on Full Sweep

---

## Fight Duration

Based on hero level vs zone minimum level:

| Level Difference | Base Duration (seconds) |
|-----------------|------------------------|
| +20 or more | 3 |
| +10 to +20 | 5 |
| 0 to +10 | 8 (balanced) |
| -10 to 0 | 10 (underleveled) |
| -20 to -10 | 12 (hard) |
| Below -20 | 15 (very hard) |

**Turn Speed Adjustment:**
```
speedFactor = max(0.3, 100 / turnSpeed)
finalDuration = max(4, round(baseDuration × speedFactor))
```

Minimum fight duration is **4 seconds** regardless of hero power.

### Zone Level Gating
There is **no level gate** — all zones are accessible at any hero level. The zone's `minLevel` is a **recommended level** indicator only. Underleveled heroes face longer fights and tougher enemies naturally.

---

## Defense Calculation (Hero Taking Damage)

### Armor Defense (Diminishing Returns)
`armorMult = max(0.2, 1 - defense / (defense + 200))`

### Evasion
`evasionMult = 1 - min(0.5, evasion / 100)` (capped at 50% reduction)

### Block
`blockMult = 1 - (blockChance / 100) × 0.5` (blocks reduce damage by 50%)

### Damage Reduction
`drMult = 1 - damageReduction / 100`

### Combined Defense
`totalDefense = armorMult × evasionMult × blockMult × drMult`

---

## Healing Sources

### Lifesteal
`lifestealHealing = heroDps × adjustedTurns × (lifesteal / 100)`

### HP Regen
`regenHealing = hpRegen × adjustedTurns` (scales with CON)

### Consumable Heal
Applied once per fight. One of each equipped consumable is consumed.

### Thorns Damage
`thornsReflect = damageTaken × (thornsDamage / 100)`

---

## Victory Condition

Hero wins if:
`finalDamageTaken < (maxHp × encampmentHpMult + lifestealHealing + regenHealing + consumableHeals)`

### XP on Win/Loss
- **Win**: Full `scaledXp`
- **Loss**: `scaledXp × 0.2` (20% penalty)

### Recovery Cooldown on Death

Based on the **scaled enemy HP** (not hero max HP):

| Scaled Enemy HP | Recovery Time |
|----------------|---------------|
| > 5000 | 3 minutes (180s) |
| > 1000 | 2 minutes (120s) |
| Otherwise | 1 minute (60s) |

Modified by: `max(0.3, 1 - statusResist / 200)` (status resist reduces cooldown)

Recovery cooldowns are **global** — they persist even if the hero is recalled from combat. A recovering hero cannot be redeployed until the timer expires.

---

## Turn Speed & Frost Slow

`speedRatio = max(0.5, turnSpeed / (100 + frostSlow))`
`enemyEffectiveTurns = ceil(turnsToKillEnemy / speedRatio)`

Higher turn speed = hero takes less total damage per fight (kills faster relative to enemy attack rate).

---

## Dynamic Difficulty Scaling

### Hero Count Multiplier
`heroCountMult = 1 + max(0, heroCount - 1) × 0.15` (15% harder per additional hero)

### Combined Difficulty
`difficultyMult = heroCountMult`

Note: There is **no level-based scaling**. Difficulty comes from tier selection and wave progression, not hero level.

### XP Bonus
`xpBonus = 1 + (heroCountMult - 1) × 0.6` (60% efficiency on hero count multiplier)

---

## Multi-Monster Fights (Full Sweep)

When selecting Full Sweep, **1-5 random enemies** spawn from the zone's single-target enemy pool:
- Each enemy has individual HP tracking
- Heroes target the **first alive enemy** (single-target)
- When an enemy dies, damage moves to the next
- Fight ends when ALL enemies are dead
- Dead enemies are visually greyed out with "Defeated" label
- Current target has a gold border highlight

---

## Resource Drops

`adjustedChance = min(1, drop.chance × (1 + (dropChance + premiumDropBonus + encampmentRareDropBonus) / 100))`
`quantity = floor(random(minQty, maxQty))`

---

## Ability DPS Contribution

For each equipped ability (up to 4 slots):

1. **SP Cost**: `max(1, round(spCost × (1 - spCostReduction / 100)))`
2. **Casts from cooldown**: `floor(fightDuration / cooldown)`
3. **Casts from SP**: `floor(totalSp / actualCost)` where `totalSp = maxSp + spRegen × turns + consumableSp`
4. **Actual casts**: `min(cooldownCasts, spCasts)`

### By Ability Type:
- **Damage**: `(scaledValue / 100) × attack × castCount / fightDuration`
- **DoT**: `(scaledValue / 100) × attack × min(1, (duration × castCount) / fightDuration)`
- **Buff**: `scaledValue × min(1, duration / cooldown)` as stat modifier uptime
- **Debuff**: `(scaledValue / 100) × attack × uptime × 0.5`
- **Heal**: Handled via lifesteal/regen mechanics

### Ability Scaling
`scaledValue = baseValue + scaling × (abilityPower / 100) × baseValue`

### Cooldown Behavior
- Ability cooldowns are tracked via `globalTick` (never resets between fights)
- Cooldowns persist across fights — no "reset" when new enemies spawn
- Passive abilities (cooldown 0) are always active with no cooldown display

---

## Equipment & Combat Locks

When a hero is deployed to a combat zone:
- **Equipment**: Locked — cannot change weapons, armor, or accessories
- **Abilities**: Locked — cannot equip/unequip ability tomes
- **Consumables**: Locked — cannot change equipped consumables
- All locks lift when the hero is recalled from combat
