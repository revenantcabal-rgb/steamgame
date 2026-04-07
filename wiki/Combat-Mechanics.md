# Combat Mechanics & Formulas

## Fight Simulation Overview

Combat in Wasteland Survivor is **idle/auto-resolved**. Each fight is simulated using DPS calculations, not turn-by-turn animations.

---

## Hero Damage Calculation

### Base Attack
`baseAttack = max(meleeAttack, rangedAttack, blastAttack)`

### Hit Rate
`hitRate = accuracy / 100` (min 0%, capped at 99%)

### Critical Multiplier
`critMult = 1 + (critChance / 100) × (critDamage / 100 - 1)`

Default crit damage is 150%, so: `critMult = 1 + (critChance / 100) × (critDamage - 150) / 100`

### Armor Penetration
Enemy base defense is 10%, reduced by armor pen:
`effectiveEnemyDefense = enemyDefense × (1 - armorPen / 100)`
Armor pen capped at **50%**.

### DoT Bonuses
- Burn: `(heroAttack × burnDot%) / 100` added to DPS
- Poison: `(heroAttack × poisonDot%) / 100` added to DPS

### Final Hero DPS
```
heroDps = attack × hitRate × critMult × (1 - effectiveEnemyDefense)
        + burnDot + poisonDot + abilityBonus
```

---

## Enemy Scaling

### HP Scaling
`scaledHp = enemy.hp × zoneTierMult × waveMultiplier × difficultyMult`

### Damage Scaling
`scaledDmg = enemy.damage × zoneTierMult × waveMultiplier × difficultyMult`

### XP Scaling
`scaledXp = enemy.xpReward × zoneTierMult × waveMultiplier`

### Boss Multiplier
Bosses get: `waveMultiplier × 1.5` (50% stronger than current wave)

---

## Fight Duration

Based on hero level vs zone minimum level:

| Level Difference | Base Turns |
|-----------------|------------|
| +20 or more | 3 (overkill) |
| +10 to +20 | 5 |
| 0 to +10 | 8 (ideal) |
| -10 to 0 | 12 (underleveled) |
| Below -10 | 99 (near impossible) |

**Turn Speed Adjustment:**
`speedFactor = max(0.3, 100 / turnSpeed)`
`finalDuration = max(2, round(baseDuration × speedFactor))`

---

## Defense Calculation (Hero Taking Damage)

### Armor Defense (Diminishing Returns)
`armorMult = max(0.2, 1 - defense / (defense + 200))`

### Evasion
`evasionMult = 1 - min(0.5, evasion / 100)` (cap 50%)

### Block
`blockMult = 1 - (blockChance / 100) × 0.5` (blocks reduce damage by 50%)

### Damage Reduction
`drMult = 1 - damageReduction / 100` (cap 30%)

### Combined Defense Multiplier
`totalDefense = armorMult × evasionMult × blockMult × drMult`

---

## Healing Sources

### Lifesteal
`lifestealHealing = heroDps × adjustedTurns × (lifesteal / 100)` (cap 25%)

### HP Regen
`regenHealing = hpRegen × adjustedTurns` (no cap, scales with CON)

### Consumable Heal
Applied once at fight start.

### Thorns Damage
`thornsReflect = damageTaken × (thornsDamage / 100)` (cap 30%)

---

## Victory Condition

Win if:
`finalDamageTaken < (maxHp + lifestealHealing + regenHealing + consumableHeals)`

### XP on Win/Loss
- **Win**: Full `scaledXp`
- **Loss**: `scaledXp × 0.2` (20% penalty)

### Recovery Cooldown on Death
| Max HP | Cooldown |
|--------|----------|
| > 1000 | 30 minutes |
| > 300 | 15 minutes |
| Otherwise | 5 minutes |

Modified by: `max(0.3, 1 - statusResist / 200)` (status resist reduces cooldown)

---

## Turn Speed & Frost Slow

`speedRatio = max(0.5, turnSpeed / (100 + frostSlow))`
`enemyEffectiveTurns = ceil(turnsToKillEnemy / speedRatio)`
Frost slow caps at 50% slowdown.

---

## Dynamic Difficulty Scaling

When multiple heroes deploy to the same zone:

### Hero Count Multiplier
`heroCountMult = 1 + max(0, heroCount - 1) × 0.15` (15% harder per additional hero)

### Overlevel Multiplier
If `avgHeroLevel > zoneMinLevel + 20`:
`overlevelMult = 1 + (levelDiff - 20) × 0.02` (2% per level over +20)

### Combined Difficulty
`difficultyMult = heroCountMult × overlevelMult`

### XP Bonus
`xpBonus = 1 + (difficultyMult - 1) × 0.6` (60% efficiency on difficulty multiplier)

---

## Resource Drops

`adjustedChance = min(1, drop.chance × (1 + (dropChance + premiumDropBonus) / 100))`
`quantity = floor(random(minQty, maxQty))`
Premium (Golden Cap): +20% drop chance bonus.

---

## Ability DPS Contribution

For each equipped ability (4 slots):

1. **SP Cost**: `max(1, round(spCost × (1 - spCostReduction / 100)))`
2. **Casts from cooldown**: `floor(fightDuration / cooldown)`
3. **Casts from SP**: `floor(totalSp / actualCost)` where `totalSp = maxSp + spRegen × turns`
4. **Actual casts**: `min(cooldownCasts, spCasts)`

### By Ability Type:
- **Damage**: `(scaledValue / 100) × attack × castCount / fightDuration`
- **DoT**: `(scaledValue / 100) × attack × min(1, (duration × castCount) / fightDuration)`
- **Buff**: `scaledValue × min(1, duration / cooldown)` as stat modifier
- **Debuff**: `(scaledValue / 100) × attack × min(1, (duration × castCount) / fightDuration) × 0.5`

### Ability Scaling
`scaledValue = baseValue + scaling × (abilityPower / 100) × baseValue`
