# Wasteland Grind - Heroes, Classes & Population System

Hero system, 16 classes (12 combat + 4 specialist), population mechanics, recruitment, leveling, stat allocation, hero types (combat vs specialist).

See also: [Stats](GAME_WIKI_STATS.md) | [Abilities](GAME_WIKI_ABILITIES.md) | [Combat](GAME_WIKI_COMBAT.md) | [Equipment](GAME_WIKI_EQUIPMENT.md) | [Skills](GAME_WIKI_SKILLS.md)

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Population System](#population-system)
3. [Hero System](#hero-system)
4. [Class Categories](#class-categories)
5. [All 12 Combat Classes - Full Detail](#all-12-classes---full-detail)
6. [Combat vs Specialist Heroes](#combat-vs-specialist-heroes)
7. [Specialist Hero Classes (4)](#specialist-hero-classes)
8. [Hero Recruitment & Leveling](#hero-recruitment--leveling)
9. [Class Quick Reference Table](#class-quick-reference-table)

---

## SYSTEM OVERVIEW

The game has two layers of gameplay:

### Layer 1: Settlement (Population + Economy)
- **Population** (workers) handles Gathering and Production
- Player assigns workers to tasks (Scavenging, Foraging, etc.)
- More workers on a task = faster, safer, higher yield
- Workers are unlocked through quest milestones
- Workers level up their assigned skill over time

### Layer 2: Combat (Heroes + Squads)
- **Heroes** are unique combat characters the player recruits
- Each hero belongs to one of 12 classes across 4 categories
- Player builds squads of 5 heroes for PVP, GVG, and PVE dungeons
- Heroes can go on **Skirmishes** to protect gathering parties (bonus resources)
- Heroes earn XP from combat, level up, and equip gear

### How They Connect
```
Population gathers resources ──→ Production creates gear ──→ Heroes equip gear
Heroes do Skirmishes ──→ Bonus resources for population
Heroes clear Dungeons ──→ Unlock new areas for population to gather
Heroes win PVP/GVG ──→ Earn rare rewards, prestige
Quest milestones ──→ Unlock more population + new hero classes
```

---

## POPULATION SYSTEM

### What Are Workers?

Workers are unnamed NPCs that represent your settlement's population. They do the
manual labor of gathering and production so the player can focus on hero combat.

### Starting Population
- **New player starts with:** 3 workers
- **Maximum population (endgame):** 50 workers

### Unlocking More Workers

Workers are unlocked through quest milestones and achievements:

| Milestone | Workers Gained | Total |
|-----------|---------------|-------|
| Start of game | 3 | 3 |
| Complete Tutorial Questline | +2 | 5 |
| First hero recruited | +1 | 6 |
| Clear Dungeon 1 (The Ruins) | +2 | 8 |
| Reach any gathering skill Lv.15 | +2 | 10 |
| Clear Dungeon 2 (Abandoned Factory) | +2 | 12 |
| First PVP victory | +1 | 13 |
| Reach any gathering skill Lv.30 | +2 | 15 |
| Join a Clan | +2 | 17 |
| Clear Dungeon 3 (The Wasteland) | +3 | 20 |
| Reach any gathering skill Lv.45 | +2 | 22 |
| Win first Clan War | +3 | 25 |
| Clear Dungeon 4 (Toxic Sewers) | +3 | 28 |
| Reach any gathering skill Lv.60 | +2 | 30 |
| Clear Dungeon 5 (Military Bunker) | +3 | 33 |
| Reach any gathering skill Lv.80 | +2 | 35 |
| Clear Dungeon 6 (The Core) | +5 | 40 |
| Reach any gathering skill Lv.100 | +3 | 43 |
| Clear Dungeon 7 (Ground Zero) | +5 | 48 |
| Master all gathering skills (Lv.100) | +2 | 50 |

### Assigning Workers

Players assign workers to **Gathering** or **Production** tasks.

#### Gathering Assignment Rules

| Workers Assigned | Speed Modifier | Yield Modifier | Risk of Loss | Notes |
|-----------------|---------------|----------------|--------------|-------|
| 1 worker | x0.5 (slow) | x0.6 (low) | 15% per trip | Dangerous solo, can die |
| 2 workers | x0.8 | x0.8 | 5% per trip | Safer in pairs |
| 3 workers | x1.0 (base) | x1.0 (base) | 1% per trip | Standard crew |
| 4 workers | x1.2 | x1.2 | 0.5% per trip | Strong crew |
| 5 workers | x1.4 | x1.4 | 0.1% per trip | Very safe |
| 6+ workers | +0.1 per extra | +0.1 per extra | ~0% | Diminishing returns |

**Key mechanic: Risk of Loss**
- Workers sent on solo trips have a 15% chance of dying per trip
- This creates a real decision: spread workers thin for coverage, or concentrate for safety?
- Dead workers are gone permanently (must unlock new ones through quests/milestones)
- Players who are careless will lose workers and slow their progression

#### Production Assignment Rules

| Workers Assigned | Crafting Speed | Quality Bonus | Notes |
|-----------------|---------------|---------------|-------|
| 1 worker | x0.5 | +0% | Slow, basic quality |
| 2 workers | x0.8 | +0% | Moderate speed |
| 3 workers | x1.0 | +5% chance of bonus output | Standard |
| 4 workers | x1.2 | +10% chance of bonus output | |
| 5+ workers | x1.4 | +15% chance of bonus output | Diminishing returns |

### Worker Skill Levels

Workers gain XP in whatever skill they're assigned to. Their level affects yield:

| Worker Skill Level | Yield Bonus | Time to Reach |
|-------------------|-------------|---------------|
| Novice (1-10) | +0% | Starting |
| Apprentice (11-25) | +10% | ~2 days |
| Journeyman (26-50) | +20% | ~1 week |
| Expert (51-75) | +35% | ~3 weeks |
| Master (76-100) | +50% | ~2 months |

- Worker XP scales the same as player skill XP (uses the same XP table)
- Workers only gain XP while actively assigned
- Reassigning a worker to a different task KEEPS their old skill levels

### Hero Skirmish Bonus

When a hero is sent on a **Skirmish** (assigned to escort a gathering party):
- **No worker deaths** on that trip (hero protects them)
- **+25% yield bonus** from the hero's combat prowess
- **Hero earns combat XP** from fighting off threats
- **Hero is unavailable** for PVP/Dungeons during skirmish (takes 1-4 hours based on task)

Skirmisher-category heroes give EXTRA bonuses when on skirmish duty (see class details).

---

## HERO SYSTEM

### What Are Heroes?

Heroes are named combat characters with unique classes, stats, and abilities.
Players recruit heroes through quest rewards, dungeon clears, and special events.

### Hero Properties

Each hero has:
- **Name** (randomly generated wasteland name, or player-customized)
- **Class** (1 of 12, permanent)
- **Level** (1-100, uses same XP table as skills)
- **Primary Combat Style** (Close Combat, Marksmanship, or Demolitions - determined by class)
- **Base Stats** (STR, DEX, INT, CON, PER, LUK - random roll within class range at recruitment)
- **Stat Points** (3 per level to allocate freely)
- **Equipment** (6 slots: Main Hand, Off Hand, Head, Body, Accessory, Tool)
- **Class Abilities** (3 unique abilities per class, unlocked at Lv.1, Lv.30, Lv.60)
- **Category Aura** (passive bonus from their Skirmisher/Control/Support/Assault category)

### Stat Roll at Recruitment

When a hero is recruited, their 6 base stats are randomly rolled within their class range.
This means two heroes of the same class can have different strengths.

Example for a Blade Dancer (Skirmisher / Close Combat):
- STR: 8-14 (randomized)
- DEX: 10-16 (randomized, naturally high)
- INT: 3-8 (randomized, naturally low)
- CON: 5-10 (randomized)
- PER: 6-12 (randomized)
- LUK: 4-10 (randomized)

Players can recruit multiple heroes of the same class to try for better stat rolls.

---

## CLASS CATEGORIES

There are 4 categories, each with 3 classes (12 total).
Each category provides a **Team Aura** that benefits the entire 5-hero squad.

### SKIRMISHER (Speed & Resource)

**Theme:** Fast-moving fighters who excel at hit-and-run tactics.

**Team Aura (per Skirmisher in squad):**
- +5 Turn Speed for all team members (stacks per Skirmisher)
- +5% Evasion for all team members

**Skirmish Bonus (when assigned to population gathering):**
- -15% gathering time per Skirmisher hero assigned
- +10% additional yield per Skirmisher hero assigned
- Eliminates worker death risk on that task

**Classes:** Blade Dancer, Sharpshooter, Sapper

---

### CONTROL (Crowd Control & Debuffs)

**Theme:** Specialists who disable and weaken enemies, turning fights in their team's favor.

**Team Aura (per Control hero in squad):**
- -5 Turn Speed to all enemies (stacks per Control hero)
- +5% Accuracy for all team members

**Skirmish Bonus (when assigned to population gathering):**
- Reduces worker death risk by an additional 10% (stacks)
- +5% rare resource drop chance

**Classes:** Warden, Trapper, Bombardier

---

### SUPPORT (Healing & Buffs)

**Theme:** Healers, buffers, and protectors who keep the team alive and boosted.

**Team Aura (per Support hero in squad):**
- +3 HP Regen per turn for all team members (stacks per Support)
- +50 Max HP for all team members (stacks per Support)

**Skirmish Bonus (when assigned to population gathering):**
- Workers assigned with a Support hero gain +20% XP
- Support heroes can revive 1 dead worker per Skirmish (if worker would die, they survive instead)

**Classes:** Guardian, Field Medic, Chemist

---

### ASSAULT (Damage & Burst)

**Theme:** Pure damage dealers who end fights quickly through overwhelming force.

**Team Aura (per Assault hero in squad):**
- +8% Damage for all team members (stacks per Assault)
- +5% Critical Damage for all team members (stacks per Assault)

**Skirmish Bonus (when assigned to population gathering):**
- +20% yield from the skirmish bonus (stacks with base hero skirmish bonus)
- Clears elite monsters in the gathering area, unlocking bonus resource nodes for 24 hours

**Classes:** Berserker, Deadeye, Demolisher

---

## ALL 12 CLASSES - FULL DETAIL

---

### SKIRMISHER CLASSES

#### 1. BLADE DANCER (Skirmisher / Close Combat)

> A lightning-fast melee fighter who weaves between enemies, striking and retreating before they can retaliate.

**Primary Combat Style:** Close Combat (Melee)
**Primary Stat Scaling:** STR + DEX
**Weapon Penalty:** -30% damage with Ranged or Demolitions weapons

**Base Stat Ranges (at recruitment):**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 8-14 | 10-16 | 3-8 | 5-10 | 6-12 | 4-10 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Quick Strike** | Lv.1 | 2 turns | Attack twice in one turn at 70% damage each. |
| **Evasive Maneuver** | Lv.30 | 4 turns | +40% Evasion for 2 turns. Next attack after dodging deals +50% damage. |
| **Whirlwind** | Lv.60 | 6 turns | Hit all enemies for 60% damage. In GVG, hits up to 3 targets. |

**Playstyle:** High mobility, multiple hits, evasion-based survival. Fragile if caught, deadly if not.

---

#### 2. SHARPSHOOTER (Skirmisher / Marksmanship)

> A mobile ranged fighter who repositions constantly, landing precise shots while staying out of reach.

**Primary Combat Style:** Marksmanship (Ranged)
**Primary Stat Scaling:** DEX + PER
**Weapon Penalty:** -30% damage with Melee or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 10-16 | 4-9 | 5-10 | 8-14 | 5-11 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Aimed Shot** | Lv.1 | 2 turns | +30% Accuracy and +50% damage on next attack. Cannot miss. |
| **Reposition** | Lv.30 | 4 turns | Gain +20 Turn Speed for 3 turns. Next 2 attacks have +15% Crit. |
| **Killshot** | Lv.60 | 6 turns | If enemy is below 30% HP, deal 200% damage. Otherwise deal 120%. |

**Playstyle:** Precision damage, high accuracy, finisher potential. Weak in prolonged fights.

---

#### 3. SAPPER (Skirmisher / Demolitions)

> A mobile explosives expert who plants quick charges and detonates them while staying on the move.

**Primary Combat Style:** Demolitions (Blast)
**Primary Stat Scaling:** INT + DEX
**Weapon Penalty:** -30% damage with Melee or Ranged weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 8-14 | 10-16 | 5-10 | 5-11 | 4-10 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Quick Charge** | Lv.1 | 2 turns | Plant a charge that detonates next turn for 130% Blast damage. |
| **Smoke Screen** | Lv.30 | 4 turns | All enemies lose 20% Accuracy for 3 turns. Team gains +15% Evasion. |
| **Chain Blast** | Lv.60 | 6 turns | Hit primary target for 100% then splash 50% to 2 adjacent enemies. |

**Playstyle:** Mobile AoE damage, team utility via smoke screen. Fast but self-damage from Volatile weapons.

---

### CONTROL CLASSES

#### 4. WARDEN (Control / Close Combat)

> A grappling specialist who locks down enemies in melee range, preventing them from acting.

**Primary Combat Style:** Close Combat (Melee)
**Primary Stat Scaling:** STR + CON
**Weapon Penalty:** -30% damage with Ranged or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 10-16 | 4-9 | 3-8 | 8-14 | 5-10 | 4-9 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Grapple** | Lv.1 | 3 turns | Stun 1 enemy for 1 turn. That enemy takes +20% damage from all sources while stunned. |
| **Lockdown** | Lv.30 | 5 turns | Reduce 1 enemy's Turn Speed by 50% for 3 turns. |
| **Submission Hold** | Lv.60 | 7 turns | Stun 1 enemy for 2 turns. Warden also can't act during this time (channeled). |

**Playstyle:** Single-target lockdown. Shuts down the enemy's strongest hero. Tanky but low damage.

---

#### 5. TRAPPER (Control / Marksmanship)

> A tactical marksman who uses net arrows, snares, and debilitating shots to control the battlefield.

**Primary Combat Style:** Marksmanship (Ranged)
**Primary Stat Scaling:** DEX + INT
**Weapon Penalty:** -30% damage with Melee or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 9-15 | 8-14 | 5-10 | 6-12 | 4-9 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Net Shot** | Lv.1 | 3 turns | Reduce 1 enemy's Evasion by 25% and Turn Speed by 15 for 2 turns. |
| **Crippling Arrow** | Lv.30 | 4 turns | Deal 80% damage and reduce enemy's attack by 20% for 3 turns. |
| **Snare Field** | Lv.60 | 7 turns | All enemies lose 20 Turn Speed and 10% Evasion for 3 turns. |

**Playstyle:** Debuff-focused ranged support. Makes enemies slower and easier to hit for the whole team.

---

#### 6. BOMBARDIER (Control / Demolitions)

> A crowd-control explosives expert who uses flashbangs, concussion grenades, and EMP devices to disable groups.

**Primary Combat Style:** Demolitions (Blast)
**Primary Stat Scaling:** INT + PER
**Weapon Penalty:** -30% damage with Melee or Ranged weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 5-10 | 10-16 | 6-11 | 8-14 | 4-9 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Flashbang** | Lv.1 | 3 turns | All enemies lose 30% Accuracy for 2 turns. |
| **Concussion Blast** | Lv.30 | 5 turns | 40% chance to stun each enemy for 1 turn. Deal 50% Blast damage to all. |
| **EMP Pulse** | Lv.60 | 7 turns | Remove all buffs from all enemies. Tech-armor enemies take +30% damage for 2 turns. |

**Playstyle:** AoE disabler. Low single-target damage but cripples the entire enemy team.

---

### SUPPORT CLASSES

#### 7. GUARDIAN (Support / Close Combat)

> A front-line protector who shields allies, absorbs damage, and rallies the team to fight harder.

**Primary Combat Style:** Close Combat (Melee)
**Primary Stat Scaling:** STR + CON
**Weapon Penalty:** -30% damage with Ranged or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 8-14 | 3-8 | 3-8 | 10-16 | 4-9 | 5-10 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Shield Ally** | Lv.1 | 3 turns | Redirect 50% of damage from 1 ally to self for 2 turns. |
| **Rally Cry** | Lv.30 | 5 turns | All allies gain +15% damage and +10% defense for 3 turns. |
| **Last Stand** | Lv.60 | Once per fight | When Guardian drops below 20% HP, heal self for 40% max HP and gain +30% defense for 3 turns. |

**Playstyle:** Tank/protector. Low damage output but keeps squishier heroes alive. Essential in long fights.

---

#### 8. FIELD MEDIC (Support / Marksmanship)

> A combat medic who fires healing darts and buff rounds from range, keeping the team topped off.

**Primary Combat Style:** Marksmanship (Ranged)
**Primary Stat Scaling:** DEX + CON
**Weapon Penalty:** -30% damage with Melee or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 8-14 | 5-10 | 10-16 | 6-12 | 4-9 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Healing Dart** | Lv.1 | 2 turns | Heal 1 ally for 15% of their max HP. |
| **Stimulant Round** | Lv.30 | 4 turns | Heal 1 ally for 10% max HP and give them +10 Turn Speed and +10% damage for 2 turns. |
| **Emergency Revive** | Lv.60 | Once per fight | Revive 1 knocked-out ally with 30% HP. That ally gains +20% defense for 2 turns. |

**Playstyle:** Primary healer. Can still deal decent ranged damage between heals. Revive is a fight-changer.

---

#### 9. CHEMIST (Support / Demolitions)

> A biochemical support who throws healing mist canisters, buff clouds, and cure grenades.

**Primary Combat Style:** Demolitions (Blast)
**Primary Stat Scaling:** INT + CON
**Weapon Penalty:** -30% damage with Melee or Ranged weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 4-9 | 9-15 | 10-16 | 5-10 | 5-10 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Healing Mist** | Lv.1 | 3 turns | Heal all allies for 8% max HP. |
| **Fortifying Cloud** | Lv.30 | 5 turns | All allies gain +15% defense and +10% Status Resist for 3 turns. |
| **Purge Canister** | Lv.60 | 5 turns | Remove all debuffs from all allies and heal them for 5% max HP. |

**Playstyle:** AoE healer/cleanser. Heals less per target than Field Medic but heals everyone. Counter to debuff-heavy teams.

---

### ASSAULT CLASSES

#### 10. BERSERKER (Assault / Close Combat)

> A raging melee powerhouse who deals escalating damage the longer the fight goes on.

**Primary Combat Style:** Close Combat (Melee)
**Primary Stat Scaling:** STR + STR (double STR scaling: +3 per point instead of +2)
**Weapon Penalty:** -30% damage with Ranged or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 12-18 | 4-9 | 2-6 | 6-12 | 4-9 | 3-8 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Rage** | Lv.1 | Passive | Every attack that hits gives +5% damage stacking up to +30%. Resets if Berserker is stunned. |
| **Frenzy** | Lv.30 | 5 turns | Attack 3 times at 60% damage each. Each hit builds Rage. |
| **Bloodlust** | Lv.60 | 7 turns | For 3 turns, Berserker heals for 20% of damage dealt. Damage is increased by current Rage %. |

**Playstyle:** Ramps up damage over time. Weak start, terrifying in long fights. Countered by stuns (resets Rage).

---

#### 11. DEADEYE (Assault / Marksmanship)

> A sniper who sacrifices speed for devastating single-target critical hits that can one-shot heroes.

**Primary Combat Style:** Marksmanship (Ranged)
**Primary Stat Scaling:** DEX + PER (double PER scaling for crits: +0.6% Crit per PER point instead of +0.4%)
**Weapon Penalty:** -30% damage with Melee or Demolitions weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 2-6 | 10-16 | 3-8 | 4-9 | 12-18 | 4-9 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Headshot** | Lv.1 | 3 turns | +100% Crit Chance on next attack. If it crits, deal +50% bonus Crit Damage. |
| **Mark Target** | Lv.30 | 4 turns | Mark 1 enemy for 3 turns. All attacks against marked target have +20% Crit Chance and +15% damage. |
| **Assassinate** | Lv.60 | 8 turns | Deal 300% damage to 1 target. If the target dies, cooldown resets to 4 turns. |

**Playstyle:** Single-target assassin. Can delete one enemy hero per fight. Slow turn speed and low HP make them vulnerable.

---

#### 12. DEMOLISHER (Assault / Demolitions)

> A heavy ordnance specialist who brings maximum explosive firepower to obliterate groups.

**Primary Combat Style:** Demolitions (Blast)
**Primary Stat Scaling:** INT + INT (double INT scaling: +3 per point instead of +2)
**Weapon Penalty:** -30% damage with Melee or Ranged weapons

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 3-8 | 3-8 | 12-18 | 6-12 | 5-10 | 3-8 |

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Heavy Payload** | Lv.1 | 3 turns | Deal 150% Blast damage to 1 target and 75% to adjacent enemies. Self-damage: 5%. |
| **Carpet Bomb** | Lv.30 | 6 turns | Deal 80% Blast damage to ALL enemies. Self-damage: 8%. |
| **Nuclear Option** | Lv.60 | 10 turns | Deal 250% Blast damage to ALL enemies. Self-damage: 15%. Stun self for 1 turn after. |

**Playstyle:** Maximum AoE damage. Self-damage means they need a healer. In GVG, they're siege breakers.

---

## HERO RECRUITMENT & LEVELING

### Recruitment Methods

| Method | What You Get | Notes |
|--------|-------------|-------|
| **Main Questline** | 1 hero of a specific class (guaranteed) | Tutorial gives first hero. Major quest milestones give specific classes. |
| **Dungeon Clear (first time)** | Choice of 1 hero from 3 random classes | First clear only. Choose wisely. |
| **Recruitment Post** (building) | Recruit random class hero for resources | Costs resources. Random class, random stats. Can dismiss and try again. |
| **PVP Season Rewards** | High-stat hero of chosen class | Top rank rewards per season. Better stat rolls guaranteed. |
| **Clan War Rewards** | Random hero from winning war chest | Bonus hero from clan war victories. |

### Recruitment Post Costs

| Hero # | Cost | Notes |
|--------|------|-------|
| 1st-3rd hero | Free (quest rewards) | |
| 4th-6th | 500 of any 3 different resources | Affordable |
| 7th-10th | 1,500 of any 5 different resources | Moderate |
| 11th-15th | 5,000 of any 8 different resources | Expensive |
| 16th-20th | 15,000 of any 10 different resources | Very expensive |
| 21st+ | 50,000 of any 12 different resources | Endgame |

### Hero Level & XP

Heroes use the same XP table as skills (see GAME_WIKI.md XP TABLE).

Heroes gain XP from:
- PVE Dungeon fights (25-200 XP per fight based on dungeon tier)
- PVP matches (50-300 XP based on result and ELO difference)
- GVG battles (100-500 XP per war)
- Skirmish duty (50-150 XP per skirmish completion)

### Stat Points

Heroes gain **3 attribute points per level** to allocate freely across STR, DEX, INT, CON, PER, LUK, RES.

By Level 100, a hero has: Base Stats (~50 total) + 297 allocated points = ~347 total stat points.

See [Stats](GAME_WIKI_STATS.md) for per-point breakdowns of each attribute, and [Spirit System](GAME_WIKI_SPIRIT_SYSTEM.md) for how RES affects SP.

---

## COMBAT VS SPECIALIST HEROES

There are now two types of heroes:

### Combat Heroes (12 classes)

These are the 12 classes defined above (Blade Dancer, Sharpshooter, Sapper, Warden, Trapper, Bombardier, Guardian, Field Medic, Chemist, Berserker, Deadeye, Demolisher).

**When assigned to gathering/production:**
- Give a base +15% gathering yield bonus
- Provide worker safety (no death risk)
- Hero earns combat XP from skirmish encounters
- Gathering speed bonus: +5%

**In combat:** Full combat effectiveness (100% stats)

### Specialist Heroes (4 classes)

Specialist heroes are optimized for gathering and production. They provide much better bonuses when assigned to population tasks.

**When assigned to gathering/production:**
- Give a +40% gathering yield bonus (vs combat hero's +15%)
- Provide worker safety (no death risk)
- Reduce gathering time by -25% (vs combat hero's -5%)
- Workers under a Specialist gain +50% worker XP
- Specialist earns gathering/production XP (not combat XP)

**In combat:** -20% to all combat stats. They CAN fight, but they're weaker than combat heroes.

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

**Specialist Bonuses (when assigned to population):**
- Foraging yield: +50%
- Water Reclamation yield: +50%
- Foraged items have 10% chance to be higher tier
- Workers assigned with Ranger gain +75% XP in Foraging/Water Reclamation

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Survival Shot** | Lv.1 | 3 turns | Deal 90% ranged damage. Heal self for 10% max HP. |
| **Nature's Bounty** | Lv.30 | Passive | +20% food buff duration when this hero consumes food. |
| **Wild Harvest** | Lv.60 | 8 turns | For 5 turns, all team members regen 5% max HP per turn. |

---

### 15. PROSPECTOR (Artisan / Demolitions primary)

> A mining expert who uses controlled blasts to extract ores and minerals.

**Primary Combat Style:** Demolitions (Blast) - but at 80% effectiveness
**Gathering Specialty:** Prospecting

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 8-13 | 4-9 | 8-13 | 8-13 | 5-10 | 6-11 |

**Specialist Bonuses (when assigned to population):**
- Prospecting yield: +60% (highest single-skill bonus)
- 15% chance to find gem-tier resources
- Workers assigned with Prospector gain +75% XP in Prospecting
- Prospecting speed bonus: -30% time

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Controlled Blast** | Lv.1 | 3 turns | Deal 90% blast damage. No self-damage. |
| **Mineral Sense** | Lv.30 | Passive | +25% ore drops from combat zones. Can detect hidden ore veins. |
| **Seismic Charge** | Lv.60 | 8 turns | Deal 120% blast to all enemies. Stun 1 turn. No self-damage. Generate 5-10 random ores. |

---

### 16. ARTIFICER (Artisan / Marksmanship secondary)

> A master crafter who can produce higher-quality items and speeds up all production tasks.

**Primary Combat Style:** Marksmanship (Ranged) - but at 80% effectiveness
**Production Specialty:** ALL Production skills

**Base Stat Ranges:**
| STR | DEX | INT | CON | PER | LUK |
|-----|-----|-----|-----|-----|-----|
| 4-9 | 6-11 | 10-16 | 6-11 | 6-11 | 8-14 |

*Note: Highest INT and LUK base - Artificers are smart and lucky crafters.*

**Specialist Bonuses (when assigned to production):**
- ALL production speed: +35%
- Rarity upgrade chance: +10% (shifts rarity table up)
- Workers assigned with Artificer gain +100% production XP
- 5% chance to produce double output on any craft

**Class Abilities:**
| Ability | Unlock | Cooldown | Effect |
|---------|--------|----------|--------|
| **Precision Tinker** | Lv.1 | Passive | All crafted items by this hero's squad have +5% bonus stat rolls. |
| **Quality Control** | Lv.30 | Passive | When this hero crafts, Common items are automatically upgraded to Rare. |
| **Masterwork** | Lv.60 | 10 turns (combat) / 1 per day (production) | In combat: Repair all team gear, heal 20% team HP. In production: Guarantee next craft is Unique or higher. |

---

## CLASS QUICK REFERENCE TABLE

| # | Class | Category | Combat Style | Primary Stats | Role |
|---|-------|----------|-------------|---------------|------|
| 1 | Blade Dancer | Skirmisher | Close Combat | STR+DEX | Fast melee, multi-hit, evasive |
| 2 | Sharpshooter | Skirmisher | Marksmanship | DEX+PER | Mobile ranged, precision, finisher |
| 3 | Sapper | Skirmisher | Demolitions | INT+DEX | Mobile bombs, smoke screen, AoE |
| 4 | Warden | Control | Close Combat | STR+CON | Grapple, stun, single-target lockdown |
| 5 | Trapper | Control | Marksmanship | DEX+INT | Nets, snares, team-wide debuffs |
| 6 | Bombardier | Control | Demolitions | INT+PER | Flashbangs, AoE disable, EMP |
| 7 | Guardian | Support | Close Combat | STR+CON | Shield ally, rally, self-heal tank |
| 8 | Field Medic | Support | Marksmanship | DEX+CON | Single heal, buff shot, revive |
| 9 | Chemist | Support | Demolitions | INT+CON | AoE heal, buff cloud, debuff cleanse |
| 10 | Berserker | Assault | Close Combat | STR+STR | Ramping damage, frenzy, lifesteal |
| 11 | Deadeye | Assault | Marksmanship | DEX+PER | Crit assassin, headshot, one-shot |
| 12 | Demolisher | Assault | Demolitions | INT+INT | Max AoE, carpet bomb, nuke |
| 13 | Scavenger | Artisan | Close Combat | STR+LUK | Gathering specialist, lucky finds |
| 14 | Ranger | Artisan | Marksmanship | DEX+PER | Foraging specialist, wilderness expert |
| 15 | Prospector | Artisan | Demolitions | INT+STR | Mining specialist, ore extraction |
| 16 | Artificer | Artisan | Marksmanship | INT+LUK | Production specialist, master crafter |

For combat mechanics, squad building, and PVP, see [Combat](GAME_WIKI_COMBAT.md).
For equipment and gear, see [Equipment](GAME_WIKI_EQUIPMENT.md).
For abilities and skills, see [Abilities](GAME_WIKI_ABILITIES.md) and [Skills](GAME_WIKI_SKILLS.md).

---

*Content that was previously in this file has been reorganized:*
- *Equipment slots & rarity -> [Equipment](GAME_WIKI_EQUIPMENT.md)*
- *Idle combat zones -> [Combat](GAME_WIKI_COMBAT.md)*
- *Squad building & PVP -> [Combat](GAME_WIKI_COMBAT.md)*
- *Combat balance rules -> [Combat](GAME_WIKI_COMBAT.md)*
- *GVG / Clan Wars -> [Combat](GAME_WIKI_COMBAT.md)*
- *PVE Dungeons -> [Combat](GAME_WIKI_COMBAT.md)*
