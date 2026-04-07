# Wasteland Grind - Skills, Specialist Heroes & Marketplace

Extends GAME_WIKI.md and GAME_WIKI_HEROES.md.

---

## TABLE OF CONTENTS

1. [Hero Split: Combat vs Specialist](#hero-split-combat-vs-specialist)
2. [Specialist Hero Classes](#specialist-hero-classes)
3. [Skill System](#skill-system)
4. [Skill List - Melee Skills](#skill-list---melee-skills)
5. [Skill List - Ranged Skills](#skill-list---ranged-skills)
6. [Skill List - Demolitions Skills](#skill-list---demolitions-skills)
7. [Skill List - Utility / Support Skills](#skill-list---utility--support-skills)
8. [Skill Acquisition](#skill-acquisition)
9. [Marketplace](#marketplace)
10. [Currency System](#currency-system)

---

## HERO SPLIT: COMBAT vs SPECIALIST

There are now two types of heroes:

### Combat Heroes (16 classes: 12 existing + see note)

These are the 12 classes already defined (Blade Dancer, Sharpshooter, Sapper, Warden, Trapper, Bombardier, Guardian, Field Medic, Chemist, Berserker, Deadeye, Demolisher).

**When assigned to gathering/production:**
- Give a base +15% gathering yield bonus
- Provide worker safety (no death risk)
- Hero earns combat XP from skirmish encounters
- Gathering speed bonus: +5%

**In combat:** Full combat effectiveness (100% stats)

### Specialist Heroes (4 new classes)

Specialist heroes are optimized for gathering and production. They provide much better bonuses when assigned to population tasks.

**When assigned to gathering/production:**
- Give a +40% gathering yield bonus (vs combat hero's +15%)
- Provide worker safety (no death risk)
- Reduce gathering time by -25% (vs combat hero's -5%)
- Workers under a Specialist gain +50% worker XP
- Specialist earns gathering/production XP (not combat XP)

**In combat:** -20% to all combat stats. They CAN fight, but they're weaker than combat heroes. They still equip gear, use skills, and join squads - just at reduced effectiveness.

### Comparison Table

| Aspect | Combat Hero | Specialist Hero |
|--------|------------|----------------|
| Combat stats | 100% | 80% (-20%) |
| Gathering yield bonus | +15% | +40% |
| Gathering speed bonus | -5% time | -25% time |
| Worker safety | Yes (no deaths) | Yes (no deaths) |
| Worker XP bonus | +0% | +50% |
| Can join PVP? | Yes (full power) | Yes (weakened) |
| Can join dungeons? | Yes (full power) | Yes (weakened) |
| Best used for | Fighting, PVP, GVG | Boosting population economy |

---

## SPECIALIST HERO CLASSES

### Category: ARTISAN (Production & Gathering)

**Team Aura (when in a combat squad, per Artisan hero):**
- +3% rare loot drop chance for all team members
- +10% resource drops from combat zones for all team members

### 13. SCAVENGER (Artisan / Close Combat primary)

> A wasteland survivalist who knows every ruin, wreck, and hideaway. Expert at finding materials that others miss.

**Primary Combat Style:** Close Combat (Melee) - but at 80% effectiveness
**Gathering Specialty:** Scavenging + Salvage Hunting

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 8-13 | 5-10 | 4-9 | 8-13 | 6-11 | 8-14 |

*Note: Higher LUK base - Scavengers are lucky finders.*

**Specialist Bonuses (when assigned to population):**
- Scavenging yield: +50% (instead of base +40%)
- Salvage Hunting yield: +50% (instead of base +40%)
- 10% chance to find bonus rare resources per gathering trip
- Workers assigned with Scavenger gain +75% XP in Scavenging/Salvage

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Resourceful Strike** | Lv.1 | 3 turns | Deal 90% melee damage. If kill, guaranteed resource drop. |
| **Salvage Instinct** | Lv.30 | Passive | +20% chance to find rare materials in combat loot. |
| **Treasure Sense** | Lv.60 | 8 turns | Reveal all hidden loot in current combat zone floor. Next 3 fights have guaranteed Rare+ drops. |

---

### 14. RANGER (Artisan / Marksmanship primary)

> A wilderness expert who navigates irradiated forests and swamps, finding edible plants and clean water where no one else can.

**Primary Combat Style:** Marksmanship (Ranged) - but at 80% effectiveness
**Gathering Specialty:** Foraging + Water Reclamation

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 4-9 | 8-13 | 5-10 | 8-13 | 8-14 | 6-11 |

*Note: Higher PER base - Rangers spot plants and water sources.*

**Specialist Bonuses (when assigned to population):**
- Foraging yield: +50%
- Water Reclamation yield: +50%
- Foraged items have 10% chance to be higher tier (e.g., Wild Herbs → Mutant Roots)
- Workers assigned with Ranger gain +75% XP in Foraging/Water Reclamation

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Survival Shot** | Lv.1 | 3 turns | Deal 90% ranged damage. Heal self for 10% max HP (foraging instinct). |
| **Nature's Bounty** | Lv.30 | Passive | +20% food buff duration when this hero consumes food. |
| **Wild Harvest** | Lv.60 | 8 turns | For 5 turns, all team members regen 5% max HP per turn (herbal aura). |

---

### 15. PROSPECTOR (Artisan / Demolitions primary)

> A mining expert who uses controlled blasts to extract ores and minerals. Knows where every vein runs.

**Primary Combat Style:** Demolitions (Blast) - but at 80% effectiveness
**Gathering Specialty:** Prospecting

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 8-13 | 4-9 | 8-13 | 8-13 | 5-10 | 6-11 |

*Note: Higher STR and INT - Prospectors are tough and know explosives.*

**Specialist Bonuses (when assigned to population):**
- Prospecting yield: +60% (highest single-skill bonus)
- 15% chance to find gem-tier resources (Starfall Crystals, etc.)
- Workers assigned with Prospector gain +75% XP in Prospecting
- Prospecting speed bonus: -30% time (better than base specialist)

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Controlled Blast** | Lv.1 | 3 turns | Deal 90% blast damage. No self-damage (unlike other demolitions). |
| **Mineral Sense** | Lv.30 | Passive | +25% ore drops from combat zones. Can detect hidden ore veins in dungeon maps. |
| **Seismic Charge** | Lv.60 | 8 turns | Deal 120% blast to all enemies. Stun for 1 turn. No self-damage. Generate 5-10 random ores. |

---

### 16. ARTIFICER (Artisan / Marksmanship secondary)

> A master crafter who can produce higher-quality items and speeds up all production tasks.

**Primary Combat Style:** Marksmanship (Ranged) - but at 80% effectiveness
**Production Specialty:** ALL Production skills (Cooking, Tinkering, Weaponsmithing, Armorcrafting, Biochemistry)

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 4-9 | 6-11 | 10-16 | 6-11 | 6-11 | 8-14 |

*Note: Highest INT and LUK base - Artificers are smart and lucky crafters.*

**Specialist Bonuses (when assigned to production):**
- ALL production speed: +35%
- Rarity upgrade chance: +10% (shifts rarity table up)
  - With Artificer: Common 50% → 40%, Rare 25% → 30%, Unique 12% → 17%, Plague 3% → 8% (at skill level 1)
- Workers assigned with Artificer gain +100% production XP
- 5% chance to produce double output on any craft

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Precision Tinker** | Lv.1 | Passive | All crafted items by this hero's squad have +5% bonus stat rolls. |
| **Quality Control** | Lv.30 | Passive | When this hero crafts, Common items are automatically upgraded to Rare (free). |
| **Masterwork** | Lv.60 | 10 turns (in combat) / 1 per day (in production) | In combat: Repair all team gear, removing Corroded debuff and healing 20% team HP. In production: Guarantee next craft is Unique or higher rarity. |

---

## SKILL SYSTEM

### What Are Skills?

Skills are **equippable active abilities** that heroes use in combat. They are separate from the 3 innate class abilities. Skills are items - they can be found, bought, sold, and traded.

### How Skills Work

- Each hero has **4 Skill Slots** (unlocked at Lv.1, Lv.15, Lv.30, Lv.50)
- Skills have **stat requirements** - if the hero doesn't meet the requirement, they can't equip it
- Skills have **cooldowns** (in turns)
- Skills **scale** with the relevant stat (damage increases as stat increases)
- Skills can be **upgraded** by finding duplicate copies (Rank 1→2→3→4→5, each rank = +15% effect)

### Skill Properties

Each skill has:
- **Name**
- **Type:** Melee, Ranged, Demolitions, or Utility
- **Rank:** 1-5 (find duplicates to upgrade)
- **Stat Requirement:** Minimum stat needed to equip (e.g., 25 DEX)
- **Cooldown:** Turns between uses
- **Base Effect:** What it does at Rank 1
- **Scaling:** How it improves per point of the scaling stat
- **Rarity:** Common, Rare, Unique, Plague (determines base power)

### Skill Rank Upgrades

| Rank | How to Reach | Effect Bonus |
|------|-------------|-------------|
| Rank 1 | Find/buy the skill | Base effect |
| Rank 2 | Merge 2 copies of same skill | +15% effect |
| Rank 3 | Merge 3 copies (total 6 from R1) | +30% effect |
| Rank 4 | Merge 4 copies (total 24 from R1) | +50% effect |
| Rank 5 | Merge 5 copies (total 120 from R1) | +75% effect |

*This creates demand for duplicate skill drops and drives marketplace trading.*

---

## SKILL LIST - MELEE SKILLS

### Tier 1 (Req: 1-15 STR)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Smash** | 1 STR | 2 | Deal 120% melee damage. | +2% per STR | Zone 1 mobs, vendor |
| **Slash** | 5 STR | 1 | Deal 100% melee damage. Fast attack. | +1.5% per STR | Zone 1 mobs, vendor |
| **Gut Punch** | 10 STR | 3 | Deal 110% melee damage. Reduce enemy defense by 10% for 2 turns. | +1% def reduction per 5 STR | Zone 1-2 mobs |
| **Taunt** | 10 CON | 4 | Force 1 enemy to attack you for 2 turns. Gain +15% defense during taunt. | +1% def per 3 CON | Zone 1-2, vendor |
| **Cleave** | 15 STR | 3 | Deal 90% melee damage to target and 50% to 1 adjacent enemy. | +2% per STR | Zone 2 boss |

### Tier 2 (Req: 20-40 STR)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Power Strike** | 20 STR | 3 | Deal 160% melee damage. +10% armor penetration. | +3% per STR | Zone 2-3 mobs |
| **Shield Bash** | 20 STR, 10 CON | 3 | Deal 100% melee damage. 30% stun for 1 turn. Requires shield equipped. | +2% stun chance per 5 STR | Zone 3 mobs |
| **Whirlwind Slash** | 25 STR | 5 | Deal 80% melee damage to ALL enemies. | +2% per STR | Zone 3 boss |
| **Reckless Blow** | 30 STR | 3 | Deal 200% melee damage. Self-take 10% of damage dealt. | +3% per STR, -0.5% self-dmg per 10 CON | Zone 3-4 mobs |
| **Execution** | 35 STR, 15 PER | 6 | Deal 150% melee damage. If enemy <25% HP, deal 300% instead. | +5% per STR on execute threshold | Zone 4 boss |
| **Iron Fortress** | 25 CON, 15 STR | 5 | Gain +30% defense and reflect 15% melee damage for 3 turns. | +1% reflect per 5 CON | Zone 4, marketplace |

### Tier 3 (Req: 45-70 STR)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Titan Strike** | 45 STR | 4 | Deal 220% melee damage. Ignore 20% of target's defense. | +4% per STR | Zone 5 mobs |
| **Earthquake** | 50 STR, 20 CON | 7 | Deal 120% melee damage to ALL enemies. Reduce all enemy Turn Speed by 15 for 2 turns. | +3% per STR, +1 speed reduction per 10 STR | Zone 5 boss |
| **Blood Fury** | 55 STR | 5 | For 3 turns: +40% melee damage, +15% crit chance, -20% defense. | +2% dmg bonus per STR | Zone 6 mobs |
| **Annihilate** | 70 STR | 8 | Deal 350% melee damage to 1 target. 50% armor penetration. | +5% per STR | Zone 6-7 boss |

### Tier 4 (Req: 80+ STR) - Legendary Skills

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Apocalypse Slam** | 80 STR, 30 CON | 10 | Deal 300% melee damage to ALL enemies. Stun all for 1 turn. Self-stun for 1 turn after. | +5% per STR | Zone 7 final boss only |
| **Undying Rage** | 85 STR | Once per fight | When reduced to 0 HP, survive with 1 HP and gain +100% damage for 2 turns. | Duration +1 turn at 100 STR | Zone 7 final boss, Plague rarity only |

---

## SKILL LIST - RANGED SKILLS

### Tier 1 (Req: 1-15 DEX)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Quick Shot** | 1 DEX | 1 | Deal 95% ranged damage. Fastest skill in the game. | +1% per DEX | Zone 1 mobs, vendor |
| **Aimed Shot** | 5 DEX | 2 | Deal 130% ranged damage. +15% accuracy on this attack. | +2% per DEX | Zone 1 mobs, vendor |
| **Double Tap** | 10 DEX | 2 | Fire 2 shots at 70% damage each. | +1.5% per DEX each shot | Zone 1-2 mobs |
| **Crippling Shot** | 10 DEX, 5 PER | 3 | Deal 100% ranged damage. Slow target -15 Turn Speed for 2 turns. | +1 speed reduction per 5 DEX | Zone 2 mobs |
| **Piercing Arrow** | 15 DEX | 3 | Deal 120% ranged damage. Ignore 15% defense. | +2% per DEX | Zone 2, vendor |

### Tier 2 (Req: 20-40 DEX)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Triple Strafe** | 25 DEX | 3 | Fire 3 shots at 55% damage each. | +1.5% per DEX each | Zone 2-3 mobs |
| **Headshot** | 25 DEX, 20 PER | 4 | Deal 100% ranged damage. Guaranteed crit. +30% crit damage bonus. | +2% crit dmg per PER | Zone 3 mobs |
| **Barrage** | 30 DEX | 5 | Fire 5 shots at 40% damage each at random enemies. | +1% per DEX each | Zone 3 boss |
| **Smoke Retreat** | 20 DEX | 4 | Gain +30% Evasion for 2 turns. Next attack deals +20% damage. | +1% Evasion per 5 DEX | Zone 3-4, marketplace |
| **Sniper's Mark** | 35 DEX, 25 PER | 5 | Mark 1 enemy for 4 turns. All attacks on marked target +20% crit, +15% accuracy. | +1% crit per 5 PER | Zone 4 boss |

### Tier 3 (Req: 45-70 DEX)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Bullet Storm** | 45 DEX | 5 | Fire 7 shots at 30% damage each at random enemies. | +1% per DEX each | Zone 5 mobs |
| **Kill Confirm** | 50 DEX, 35 PER | 6 | Deal 200% ranged damage. If enemy <30% HP, deal 400%. | +5% per DEX on execute | Zone 5 boss |
| **Ghost Walk** | 55 DEX | 6 | Become untargetable for 1 turn. Next attack is guaranteed crit with +50% damage. | +3% dmg per DEX | Zone 6 mobs |
| **Rain of Arrows** | 65 DEX | 8 | Deal 100% ranged damage to ALL enemies over 2 turns (50% per turn). | +3% per DEX | Zone 6 boss |

### Tier 4 (Req: 80+ DEX) - Legendary Skills

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Oblivion Volley** | 80 DEX, 40 PER | 10 | Deal 250% ranged damage to all enemies. Each hit has 30% crit chance with +50% crit damage. | +5% per DEX | Zone 7 final boss only |
| **Perfect Shot** | 90 DEX | 12 | Deal 500% ranged damage to 1 target. Cannot miss. Cannot be evaded. | +8% per DEX | Zone 7 final boss, Plague rarity only |

---

## SKILL LIST - DEMOLITIONS SKILLS

### Tier 1 (Req: 1-15 INT)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Firebomb** | 1 INT | 2 | Deal 110% blast damage. 20% chance to apply burn (5 dmg/turn, 2 turns). | +2% per INT | Zone 1 mobs, vendor |
| **Frag Toss** | 5 INT | 2 | Deal 100% blast damage to target + 40% to 1 adjacent. | +1.5% per INT | Zone 1 mobs, vendor |
| **Smoke Bomb** | 10 INT | 4 | All enemies lose 20% accuracy for 2 turns. | +1% per 5 INT | Zone 1-2 mobs |
| **Trip Mine** | 10 INT, 5 PER | 3 | Place mine. Next enemy that acts takes 130% blast damage. | +2% per INT | Zone 2 mobs |
| **Concussion Grenade** | 15 INT | 3 | Deal 90% blast damage. 25% chance to stun for 1 turn. | +1% stun chance per 5 INT | Zone 2, vendor |

### Tier 2 (Req: 20-40 INT)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Napalm Flask** | 20 INT | 4 | Deal 80% blast damage. Apply burn: 10 dmg/turn for 4 turns. | +1 burn dmg per 5 INT | Zone 2-3 mobs |
| **Cluster Bomb** | 25 INT | 4 | Deal 70% blast damage to ALL enemies. | +2% per INT | Zone 3 mobs |
| **EMP Blast** | 25 INT, 15 PER | 5 | Deal 60% blast damage to all. Remove 1 buff from each enemy. Tech armor enemies take +25%. | +2% per INT | Zone 3 boss |
| **Toxic Cloud** | 30 INT, 15 CON | 5 | Deal 50% blast damage to all enemies. Poison: 8 dmg/turn for 3 turns. -10% enemy accuracy. | +1 poison dmg per 5 INT | Zone 3-4 mobs |
| **Rocket Salvo** | 40 INT | 5 | Deal 150% blast damage to 1 target. Self-damage: 5%. | +3% per INT, -0.5% self-dmg per 10 CON | Zone 4 boss |

### Tier 3 (Req: 45-70 INT)

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Plasma Lance** | 45 INT | 4 | Deal 180% blast damage. Ignore 25% defense. | +4% per INT | Zone 5 mobs |
| **Carpet Bomb** | 50 INT | 7 | Deal 130% blast damage to ALL enemies over 2 turns. Self-damage: 8%. | +3% per INT | Zone 5 boss |
| **Radiation Burst** | 55 INT, 25 CON | 6 | Deal 100% blast to all. Apply radiation: 15 dmg/turn for 4 turns. -20% enemy healing. | +2 rad dmg per 5 INT | Zone 6 mobs |
| **Siege Breaker** | 65 INT | 8 | Deal 250% blast damage to 1 target. +50% damage vs structures (GVG). Self-damage: 10%. | +5% per INT | Zone 6 boss |

### Tier 4 (Req: 80+ INT) - Legendary Skills

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Armageddon** | 80 INT | 10 | Deal 200% blast damage to ALL enemies. Burn all for 20 dmg/turn, 3 turns. Self-damage: 12%. | +5% per INT | Zone 7 final boss only |
| **Singularity** | 90 INT | 12 | Deal 400% blast damage to 1 target. Pulls adjacent enemies in for 150% each. Self-damage: 15%. Self-stun 1 turn. | +8% per INT | Zone 7 final boss, Plague rarity only |

---

## SKILL LIST - UTILITY / SUPPORT SKILLS

These skills have mixed stat requirements and work for any hero type.

### Healing & Buffs

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **First Aid** | 10 CON | 3 | Heal self for 15% max HP. | +1% per 5 CON | Zone 1-2, vendor |
| **War Cry** | 15 STR, 10 CON | 5 | All allies gain +10% damage for 3 turns. | +1% per 5 STR | Zone 3 mobs |
| **Iron Will** | 20 CON | 4 | Gain +20% Status Resist and +15% defense for 3 turns. | +1% per 5 CON | Zone 3-4 |
| **Healing Pulse** | 25 CON, 15 INT | 5 | Heal all allies for 8% max HP. | +0.5% per 5 CON | Zone 4 boss |
| **Adrenaline Surge** | 30 DEX, 15 CON | 5 | All allies gain +15 Turn Speed for 3 turns. | +1 speed per 5 DEX | Zone 4-5 |
| **Tactical Shield** | 35 CON | 5 | Create shield on 1 ally absorbing damage equal to 20% of caster's max HP for 3 turns. | +2% per 5 CON | Zone 5 boss |
| **Mass Purge** | 40 INT, 25 CON | 6 | Remove all debuffs from all allies. Heal each ally for 5% max HP. | +0.5% heal per 5 INT | Zone 5-6 |
| **Phoenix Blessing** | 50 CON, 30 INT | Once per fight | Next ally that would die instead survives with 25% HP. | +5% HP per 10 CON | Zone 6 boss |

### Debuffs & Control

| Skill | Req | CD | Effect (R1) | Scaling | Drop Source |
|-------|-----|-----|------------|---------|-------------|
| **Intimidate** | 10 STR | 4 | Reduce 1 enemy's damage by 15% for 3 turns. | +1% per 5 STR | Zone 2, vendor |
| **Weaken** | 15 INT | 4 | Reduce 1 enemy's defense by 20% for 3 turns. | +1% per 5 INT | Zone 2-3 |
| **Blind** | 20 PER | 4 | Reduce 1 enemy's accuracy by 25% for 2 turns. | +2% per 5 PER | Zone 3 |
| **Mass Slow** | 30 INT, 20 DEX | 6 | All enemies lose 20 Turn Speed for 3 turns. | +1 per 5 INT | Zone 4-5 |
| **Doom Mark** | 45 PER, 25 INT | 7 | Mark 1 enemy. They take +25% damage from all sources for 4 turns. | +2% per 5 PER | Zone 5-6 boss |
| **Soul Drain** | 60 INT, 30 CON | 8 | Deal 80% damage to 1 target. Heal self for 100% of damage dealt. | +3% per INT | Zone 6-7 |

---

## SKILL ACQUISITION

### How Players Get Skills

| Source | Skill Types | Rarity Chance | Notes |
|--------|------------|---------------|-------|
| **NPC Vendor** | Tier 1 basics only | Always Common | Buy with gold. Limited stock, refreshes daily. |
| **Combat Zone drops** | Based on zone tier | Zone rarity table | Random drop after kills. Higher zones = better skills. |
| **Boss drops** | Tier matching zone | Better rarity odds | Bosses always drop 1 skill. |
| **Dungeon rewards** | Tier matching dungeon | Boosted rarity | End-of-dungeon chest. |
| **Marketplace** | Any skill players sell | Varies | Player-to-player trading. |
| **Quest rewards** | Specific useful skills | Usually Rare+ | Questline milestones. |

### Skill Rarity (separate from equipment rarity)

| Rarity | Effect | Drop Rate (normal mob) | Drop Rate (boss) |
|--------|--------|----------------------|-------------------|
| **Common** (White) | Base effect | 70% | 30% |
| **Rare** (Blue) | +15% base effect, -1 turn cooldown | 22% | 35% |
| **Unique** (Purple) | +30% base effect, -1 turn cooldown, +1 extra scaling | 7% | 25% |
| **Plague** (Orange) | +50% base effect, -2 turn cooldown, +2 extra scaling, unique visual effect | 1% | 10% |

*Example: Smash (Common) deals 120% damage. Smash (Plague) deals 180% damage with -2 CD and extra scaling.*

---

## MARKETPLACE

### What Is It?

A player-to-player auction house where players can buy and sell:
- Equipment (all slots, all rarities)
- Skills (all types, all rarities)
- Resources (all gathering materials)
- Consumables (food, medicine)
- Heroes (yes, players can sell recruited heroes they don't want)

### Currency: Wasteland Credits (WC)

The primary currency. Earned and spent throughout the game.

### How the Marketplace Works

1. **Listing:** Player sets a price in WC and lists the item. Listing lasts 48 hours.
2. **Buying:** Other players browse, search, filter, and buy instantly.
3. **Tax:** 5% marketplace tax on the seller (gold sink to prevent inflation).
4. **Search filters:** By item type, slot, rarity, level requirement, stat bonuses, price range.
5. **Price history:** Shows average sale price for the last 7 days (helps players price fairly).

### Marketplace Rules
- Items must be unequipped to list
- Heroes for sale lose all equipped gear (returned to seller)
- No listing limit (list as many items as you want)
- Cancelled listings are returned immediately
- Expired listings (48h) return the item automatically

---

## CURRENCY SYSTEM

### Wasteland Credits (WC) - Primary Currency

| Source | Amount | Notes |
|--------|--------|-------|
| Selling resources to NPC | 1-500 WC per stack | Based on resource tier and quantity |
| Completing quests | 50-5,000 WC | Based on quest difficulty |
| PVP win | 50-500 WC | Based on ELO tier |
| Dungeon clear | 200-10,000 WC | Based on dungeon difficulty |
| Clan War win | 500-5,000 WC | Based on war tier |
| Selling items on marketplace | Varies | Player-set prices |
| Daily login bonus | 100-500 WC | Scales with consecutive days |
| Boss kills | 100-2,000 WC | Based on boss tier |

### WC Sinks (things that cost WC)

| Sink | Cost | Notes |
|------|------|-------|
| NPC Vendor purchases (basic skills, consumables) | 50-5,000 WC | |
| Hero recruitment (Recruitment Post) | 500-50,000 WC | Plus resource cost |
| Marketplace purchases | Varies | Player-set prices |
| Stat Respec (if no Respec Serum) | 10,000 WC | Alternative to crafting the serum |
| Gear repair (Corroded items) | 100-5,000 WC | Based on gear tier |
| Skill upgrading (merge fee) | 500-10,000 WC | Per rank upgrade |
| Clan creation | 5,000 WC | One-time cost |
| Clan War entry | 1,000 WC per war | War participation fee |

### Premium Currency: Irradiated Gems (IG)

- Bought with real money (cash shop) or earned very slowly in-game
- Used for: Cosmetics, XP boosts, idle cap extensions, convenience features
- **NOT used for:** Gear, skills, combat power, marketplace
- See GAME_WIKI.md Cash Shop section for details
- Can be earned in-game: 1 IG per daily login (7th day streak = 10 IG bonus), 5 IG per season PVP reward
