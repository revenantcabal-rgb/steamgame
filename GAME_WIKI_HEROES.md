# Wasteland Grind - Heroes, Classes & Population System

This document covers the Hero system, 12 classes, population mechanics, and 5v5 PVP.
It extends the main GAME_WIKI.md.

---

## TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Population System](#population-system)
3. [Hero System](#hero-system)
4. [Class Categories](#class-categories)
5. [All 12 Classes - Full Detail](#all-12-classes---full-detail)
6. [Hero Recruitment & Leveling](#hero-recruitment--leveling)
7. [Equipment Slots & Rarity](#equipment-slots--rarity)
8. [Idle Combat Zones](#idle-combat-zones)
9. [Squad Building (5v5)](#squad-building-5v5)
10. [Combat Balance Rules](#combat-balance-rules)
11. [PVP Format](#pvp-format)
12. [GVG / Clan Wars](#gvg--clan-wars)
13. [PVE Dungeons & Skirmishes](#pve-dungeons--skirmishes)

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

Heroes gain **3 attribute points per level** to allocate freely across STR, DEX, INT, CON, PER, LUK.

By Level 100, a hero has: Base Stats (~50 total) + 297 allocated points = ~347 total stat points.

---

## EQUIPMENT SLOTS & RARITY

### Equipment Slots (11 total)

Each hero has 11 equipment slots:

| Slot | Count | Source | Notes |
|------|-------|--------|-------|
| **Main Hand** | 1 | Weaponsmithing | Melee, Ranged, or Demolitions weapon. If 2-handed, Off Hand is locked. |
| **Off Hand** | 1 | Weaponsmithing / Armorcrafting | Shield, secondary weapon, or ammo pouch. Blocked by 2H weapons. |
| **Armor** (Body) | 1 | Armorcrafting | Chest armor - highest defense slot. |
| **Legs** | 1 | Armorcrafting | Leg guards, pants, greaves. |
| **Gloves** | 1 | Armorcrafting | Gauntlets, gloves, wraps. Often have accuracy/crit bonuses. |
| **Boots** | 1 | Armorcrafting | Footwear. Often have Turn Speed or Evasion bonuses. |
| **Ring** | 3 | Tinkering / Dungeon drops | Small stat bonuses. 3 slots allow stacking. |
| **Earring** | 2 | Tinkering / Dungeon drops | Utility bonuses (Status Resist, HP Regen). |
| **Necklace** | 1 | Tinkering / Dungeon drops | Major stat bonus, often unique effects. |

### Item Rarity System

Every equipment piece drops or is crafted in one of 4 rarities. Higher rarity = more bonus attributes. Rarity is determined at creation time (crafting has a chance for higher rarity based on production skill level).

| Rarity | Color | Base Stats | Bonus Attributes | Negative Effects | Drop Rate |
|--------|-------|-----------|-----------------|-----------------|-----------|
| **Common** | White | Yes | 0 | 0 | 60% |
| **Rare** | Blue | Yes | 2 random bonuses | 0 | 25% |
| **Unique** | Purple | Yes | 3 random bonuses | 0 | 12% |
| **Plague** | Orange | Yes | 6 random bonuses | 2 random negatives | 3% |

### How Rarity Works

**Common (White):**
- Only the base stats of the item (Defense, Attack, etc. as listed in the gear tables)
- No bonus attributes
- Example: `Iron Breastplate [Common] - +32 Defense, +50 Max HP, +1 HP Regen | Sluggish: -15 Turn Speed`

**Rare (Blue):**
- Base stats + 2 randomly rolled bonus attributes
- Bonuses are rolled from the bonus pool (see below)
- Example: `Iron Breastplate [Rare] - +32 Defense, +50 Max HP, +1 HP Regen | Sluggish: -15 Turn Speed | BONUS: +8% Accuracy, +12 Max HP`

**Unique (Purple):**
- Base stats + 3 randomly rolled bonus attributes
- Bonus values are 20% higher than Rare rolls
- Example: `Iron Breastplate [Unique] - +32 Defense, +50 Max HP, +1 HP Regen | Sluggish: -15 Turn Speed | BONUS: +10% Accuracy, +18 Max HP, +3% Crit Chance`

**Plague (Orange):**
- Base stats + 6 randomly rolled bonus attributes + 2 randomly rolled negative effects
- Bonus values are 50% higher than Rare rolls
- The 2 negatives come from the downside pool (Sluggish, Fragile, etc.) - these stack with the item's inherent downside
- Plague items are the most powerful but come with real trade-offs
- Example: `Iron Breastplate [Plague] - +32 Defense, +50 Max HP, +1 HP Regen | Sluggish: -15 Turn Speed | BONUS: +15% Accuracy, +25 Max HP, +5% Crit, +4% Evasion, +10 Turn Speed, +2 HP Regen | CURSE: Draining: -2 HP Regen, Fragile: -8% Max HP`

### Bonus Attribute Pool (randomly rolled for Rare/Unique/Plague)

| Bonus | Rare Range | Unique Range | Plague Range |
|-------|-----------|-------------|-------------|
| +Max HP | +8 to +20 | +10 to +24 | +12 to +30 |
| +Defense | +3 to +8 | +4 to +10 | +5 to +12 |
| +Melee Attack | +3 to +8 | +4 to +10 | +5 to +12 |
| +Ranged Attack | +3 to +8 | +4 to +10 | +5 to +12 |
| +Blast Attack | +3 to +8 | +4 to +10 | +5 to +12 |
| +Turn Speed | +3 to +8 | +4 to +10 | +5 to +12 |
| +Accuracy | +2% to +6% | +3% to +8% | +4% to +10% |
| +Evasion | +1% to +4% | +2% to +5% | +2% to +6% |
| +Crit Chance | +1% to +4% | +2% to +5% | +2% to +6% |
| +Crit Damage | +3% to +8% | +4% to +10% | +5% to +12% |
| +HP Regen | +1 to +3 | +1 to +4 | +2 to +5 |
| +Status Resist | +2% to +6% | +3% to +8% | +4% to +10% |
| +Damage Reduction | +1% to +3% | +1% to +4% | +2% to +5% |

### Crafting Rarity Chances

When crafting an item, the player's production skill level affects rarity outcome:

| Skill Level | Common | Rare | Unique | Plague |
|-------------|--------|------|--------|--------|
| 1-14 | 90% | 10% | 0% | 0% |
| 15-29 | 75% | 22% | 3% | 0% |
| 30-44 | 60% | 30% | 9% | 1% |
| 45-59 | 50% | 32% | 15% | 3% |
| 60-79 | 40% | 35% | 20% | 5% |
| 80-89 | 30% | 35% | 27% | 8% |
| 90-99 | 20% | 35% | 33% | 12% |
| 100 | 15% | 30% | 37% | 18% |

### Dungeon Drop Rarity

Dungeon bosses have better rarity rates:

| Enemy Type | Common | Rare | Unique | Plague |
|------------|--------|------|--------|--------|
| Normal mob | 70% | 22% | 7% | 1% |
| Elite mob | 50% | 30% | 16% | 4% |
| Boss (every 10th fight) | 25% | 35% | 30% | 10% |
| Final dungeon boss | 10% | 30% | 40% | 20% |

---

## IDLE COMBAT ZONES

Heroes can be set to **idle farm** in combat zones, just like workers idle in gathering.
The player selects a combat zone, picks a target type, and the hero auto-fights.

### How It Works

1. Player selects a hero (or squad for harder zones)
2. Player selects a Combat Zone (unlocked through progression)
3. Player selects a **target** within that zone:
   - **3 focused targets** (specific enemy, higher XP per kill, focused loot)
   - **1 full sweep** (fight everything, every 10 fights = boss battle, varied loot)
4. Hero auto-fights on a timer (similar to gathering actions)
5. Hero earns Combat XP, loot drops, and resources
6. Hero can die if the zone is too hard (returns after a cooldown penalty)

### Combat Zone Actions

| Action Type | What Happens | XP/Fight | Loot |
|-------------|-------------|----------|------|
| **Solo Target** (focused) | Fight 1 specific enemy type repeatedly | Higher XP | Focused drops from that enemy |
| **Full Sweep** (mixed) | Fight random enemies from the zone. Every 10th fight is a boss. | Lower XP per fight, but boss XP is huge | Varied drops from all enemies + boss chest |

### Boss Battle (Full Sweep Mode)

- Every 10 normal fights, a zone boss appears
- Boss has 3x normal enemy HP and damage
- Defeating the boss gives:
  - 5x normal XP
  - Guaranteed equipment drop (rarity based on zone tier)
  - Bonus resources
- If the hero loses to a boss, they get a 5-minute recovery cooldown
- Progress resets to 0/10 after boss (win or lose)

### All Combat Zones

#### Zone 1: The Outskirts (Level 1+, Solo hero)

> The edges of the wasteland. Mutated vermin and small creatures. Perfect for new heroes.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Marshland | Mutated Mosquito | 20 | 3 | 15 | Insect Chitin, Toxic Gland |
| Bog | Mutated Frog | 30 | 5 | 18 | Frog Skin, Mutant Slime |
| Burrows | Mutated Centipede | 25 | 7 | 20 | Chitin Plates, Venom Sac |
| Full Sweep | All + Boss: Giant Roach | - | - | varies | All drops + boss chest |

**Boss: Giant Roach** - HP: 90, Damage: 15, XP: 100
Boss Chest: T1-T2 gear, 10-20 random resources

#### Zone 2: Ruined Suburbs (Level 15+, Solo hero)

> Abandoned neighborhoods overrun by mutant animals.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Alleys | Feral Dog Pack | 60 | 12 | 35 | Leather Scraps, Fang |
| Rooftops | Mutant Hawk | 45 | 18 | 40 | Feathers, Talons |
| Basements | Rad Rat Swarm | 80 | 10 | 38 | Rat Pelts, Glowing Eyes |
| Full Sweep | All + Boss: Alpha Wolf | - | - | varies | All drops + boss chest |

**Boss: Alpha Wolf** - HP: 250, Damage: 30, XP: 250
Boss Chest: T2-T3 gear, 20-40 resources

#### Zone 3: Toxic Industrial District (Level 30+, Solo or 3-hero squad)

> A poisoned factory district with chemical mutants and rogue machines.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Chemical Vats | Slime Crawler | 120 | 22 | 65 | Toxic Residue, Acid Flask |
| Assembly Line | Rogue Drone | 100 | 30 | 70 | Drone Core, Servo Motor |
| Waste Tunnels | Sewer Beast | 150 | 25 | 75 | Beast Hide, Sewer Crystal |
| Full Sweep | All + Boss: Factory Overseer | - | - | varies | All drops + boss chest |

**Boss: Factory Overseer (Mech)** - HP: 500, Damage: 50, XP: 500
Boss Chest: T3-T4 gear, 30-60 resources, rare crafting materials

#### Zone 4: The Deadlands (Level 45+, 3-hero squad recommended)

> An irradiated desert wasteland with dangerous creatures and raiders.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Sand Dunes | Sandworm | 200 | 35 | 100 | Worm Carapace, Sand Pearl |
| Raider Camps | Raider Gang (3 enemies) | 120 ea | 28 ea | 120 | Raider Gear, Ammo Cache |
| Radiation Craters | Glowing Ghoul | 180 | 45 | 110 | Ghoul Marrow, Rad Crystal |
| Full Sweep | All + Boss: Raider Warlord | - | - | varies | All drops + boss chest |

**Boss: Raider Warlord** - HP: 800, Damage: 70, XP: 800
Boss Chest: T4-T5 gear, 50-100 resources, rare materials

#### Zone 5: Military Exclusion Zone (Level 60+, 5-hero squad required)

> A walled-off military installation with automated defenses and bio-weapons.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Perimeter | Turret Array (2 turrets) | 250 ea | 40 ea | 160 | Turret Parts, Targeting Module |
| Barracks | Bio-Soldier Squad (3) | 200 ea | 50 ea | 180 | Military Gear, Dog Tags |
| Research Lab | Escaped Experiment | 400 | 80 | 200 | Mutagen Sample, Lab Data |
| Full Sweep | All + Boss: Commander Mech | - | - | varies | All drops + boss chest |

**Boss: Commander Mech** - HP: 1500, Damage: 120, XP: 1200
Boss Chest: T5-T6 gear, 80-150 resources, rare/unique materials

#### Zone 6: The Core (Level 80+, 5-hero squad, endgame)

> The reactor core where the apocalypse began. Maximum radiation and danger.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Outer Ring | Radiation Elemental | 500 | 100 | 300 | Core Fragment, Isotope |
| Inner Chamber | Mutant Abomination | 600 | 130 | 350 | Abomination Heart, Mutant DNA |
| Reactor Room | Fusion Golem | 700 | 150 | 400 | Fusion Core, Plasma Crystal |
| Full Sweep | All + Boss: The Source | - | - | varies | All drops + boss chest |

**Boss: The Source** - HP: 3000, Damage: 200, XP: 2500
Boss Chest: T7-T8 gear, 150-300 resources, legendary materials, Plague rarity chance: 15%

#### Zone 7: Ground Zero (Level 95+, 5-hero squad, ultimate endgame)

> The epicenter. Reality warps here. Only the strongest survive.

| Target | Enemy | HP | Damage | XP/Kill | Notable Drops |
|--------|-------|-----|--------|---------|---------------|
| Crater Edge | Phase Walker | 800 | 180 | 500 | Phase Shard, Void Dust |
| Anomaly Field | Reality Breaker | 1000 | 200 | 600 | Anomaly Core, Warped Metal |
| Epicenter | Apocalypse Herald | 1200 | 250 | 700 | Herald Fragment, Doom Essence |
| Full Sweep | All + Boss: The Cataclysm | - | - | varies | All drops + boss chest |

**Boss: The Cataclysm** - HP: 5000, Damage: 300, XP: 5000
Boss Chest: T8 gear guaranteed, legendary materials, Plague rarity chance: 25%

### Idle Combat Speed

| Hero Level vs Zone Level | Fight Duration | Notes |
|-------------------------|---------------|-------|
| Overlevel by 20+ | 3 seconds | Farming easy content |
| Overlevel by 10-19 | 5 seconds | Comfortable farming |
| At zone level | 8 seconds | Challenging, hero may lose |
| Underlevel by 5-10 | 12 seconds | Dangerous, high death risk |
| Underlevel by 10+ | Cannot enter | Zone is locked |

### Hero Death in Combat Zones

- If a hero dies during idle combat, they enter a **recovery cooldown**
- Recovery time: 5 minutes (normal enemy), 15 minutes (boss), 30 minutes (zone 6-7 boss)
- During recovery, the hero cannot fight, join squads, or go on skirmishes
- NO permanent death for heroes (workers can die permanently, heroes cannot)

---

## SQUAD BUILDING (5v5)

### Rules
- Player selects 5 heroes from their roster for any combat encounter
- Each hero must be a unique individual (can't use same hero twice)
- CAN use multiple heroes of the same class (e.g., 2 Berserkers)
- Category auras stack (e.g., 3 Assault heroes = +24% damage, +15% Crit Dmg for all)

### Recommended Compositions

| Comp Name | Heroes | Strategy |
|-----------|--------|----------|
| **Balanced** | 1 Skirmisher, 1 Control, 1 Support, 2 Assault | Standard well-rounded team |
| **Rush** | 3 Assault, 1 Skirmisher, 1 Support | Kill fast before they can react. Aura: +24% dmg |
| **Turtle** | 2 Support, 2 Control, 1 Assault | Outheal and outlast. Win by attrition. |
| **Blitz** | 3 Skirmisher, 1 Assault, 1 Support | Maximum speed. Act first, kill priority targets. Aura: +15 Turn Speed |
| **Lockdown** | 3 Control, 1 Support, 1 Assault | Enemy can barely act. Stuns, slows, debuffs. Aura: -15 enemy Turn Speed |
| **GVG Siege** | 2 Demolisher, 1 Chemist, 1 Bombardier, 1 Guardian | AoE everything. Demolishers nuke, Chemist heals splash, Bombardier disables, Guardian tanks. |

---

## COMBAT BALANCE RULES

### Weapon Penalty
- Heroes deal **-30% damage** when using a weapon outside their primary combat style
- Example: A Blade Dancer (Close Combat primary) using a Marksman Rifle deals 70% of its listed damage
- This prevents heroes from being good at everything

### Stat Requirement Gate
- Equipment has stat requirements (STR, DEX, INT, etc.)
- A hero who doesn't meet requirements **cannot equip** the item
- This naturally prevents ranged heroes from wearing full heavy armor (needs STR they don't have)
- A Deadeye (DEX/PER focused) would need to sacrifice ~40 DEX/PER points to get enough STR for T5 heavy armor, making their damage terrible

### The Triangle
```
Close Combat (STR) beats Demolitions (INT) ── Melee closes distance, disrupts setup
Demolitions (INT) beats Marksmanship (DEX) ── AoE forces repositioning, splash unavoidable
Marksmanship (DEX) beats Close Combat (STR) ── Kite and shoot before they reach you
```
- +10% damage bonus when attacking the type you counter
- -10% damage penalty when attacking the type that counters you
- This adds another layer of squad composition strategy

### Diminishing Returns
- Stacking 5 heroes of the same category gives massive aura bonuses but you lack versatility
- Category auras have soft diminishing returns after 3 stacks:
  - 1 hero: 100% aura value
  - 2 heroes: 100% each (200% total)
  - 3 heroes: 100% each (300% total)
  - 4th hero: 50% aura value (350% total)
  - 5th hero: 25% aura value (375% total)

---

## PVP FORMAT

### Ranked PVP (5v5)
- Player selects 5 heroes as their squad
- Combat auto-resolves based on stats, gear, abilities, and turn order
- ELO matchmaking (starts at 1000)
- 3-month seasons with rank tiers:

| Rank | ELO Range | Season Reward |
|------|-----------|---------------|
| Bronze | 0-1099 | Basic resource pack |
| Silver | 1100-1299 | Moderate resource pack + cosmetic |
| Gold | 1300-1499 | Large resource pack + cosmetic + 1 hero recruit |
| Platinum | 1500-1699 | Huge resource pack + rare cosmetic + high-stat hero |
| Diamond | 1700-1899 | Massive resource pack + legendary cosmetic + guaranteed top-stat hero |
| Wasteland Champion | 1900+ | All of above + unique title + profile border |

### Quick Match (unranked)
- Same 5v5 format but no ELO changes
- For testing comps and practicing

---

## GVG / CLAN WARS

### War Format
- Clans of up to 30 members
- **War declaration:** Leader/Officers start war search
- **Matchmaking:** Clans matched by total hero power
- **Prep Phase (24 hours):** Members assign heroes to defense, build structures (Engineering skill)
- **Battle Phase (24 hours):** Each member gets 2 attacks using their 5-hero squad
- **Each attack:** Your 5-hero squad vs defender's 5-hero squad
- **Stars:** 1 star = deal >33% total damage. 2 stars = deal >66%. 3 stars = full wipe.
- **Winner:** Most total stars. Tiebreaker: most total damage %.

### Hero Role in GVG
- Each member sets a **Defense Squad** (5 heroes who defend when attacked)
- Each member uses an **Attack Squad** (5 heroes for their 2 attacks, can be different from defense)
- Demolitions heroes get bonus damage vs structures
- Engineering skill determines defense structure HP
- Support heroes are critical for keeping attackers alive through defenses

---

## PVE DUNGEONS & SKIRMISHES

### Dungeons

Dungeons are multi-fight PVE encounters that drop rare resources and equipment.

| Dungeon | Rec. Level | Floors | Theme | Notable Drops |
|---------|-----------|--------|-------|---------------|
| The Ruins | 10+ | 5 | Collapsed city | T2 gear, basic recipes |
| Abandoned Factory | 25+ | 8 | Industrial complex | T3 gear, Mechanical Parts |
| The Wasteland | 40+ | 10 | Open desert, mutant beasts | T4 gear, rare forage |
| Toxic Sewers | 55+ | 12 | Underground, poison enemies | T5 gear, Chemical Fluids |
| Military Bunker | 70+ | 15 | Pre-war military base | T6 gear, Electronic Components |
| The Core | 85+ | 18 | Reactor facility, radiation | T7 gear, rare ore |
| Ground Zero | 95+ | 20 | The epicenter, final challenge | T8 gear, legendary materials |

### Skirmishes

Skirmishes are short PVE encounters where heroes escort gathering parties.

- Duration: 1-4 hours (based on gathering task difficulty)
- Hero earns combat XP during skirmish
- Eliminates worker death risk
- +25% yield bonus (more with Skirmisher/Assault category heroes)
- Hero is locked out of PVP/Dungeons while on skirmish duty

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
