# Story Progression

The story system gates feature unlocks behind **7 chapters**, each with **7 sequential objectives (parts)**. Most features unlock when an entire chapter is completed, but some features unlock at specific **part** completions within a chapter (noted below).

---

## Chapter 1 — Survival Basics
> *Unlocks: Marketplace*

| Part | Objective | Type |
|------|-----------|------|
| 1 | Gather 10 Scrap Metal | gather |
| 2 | Gather 10 Salvaged Wood | gather |
| 3 | Craft a starter weapon | craft |
| 4 | Equip a weapon | equip |
| 5 | Enter The Outskirts | combat_zone |
| 6 | Kill 10 enemies | kill_enemies |
| 7 | Cook a Wasteland Stew | cook |

---

## Chapter 2 — Scavenger's Path
> *Unlocks: Accessories (earring, necklace, ring slots)*

| Part | Objective | Type |
|------|-----------|------|
| 1 | Reach Scavenging Level 5 | reach_skill_level |
| 2 | Craft Patched Vest | craft |
| 3 | Equip gear in 3 slots | equip |
| 4 | Reach Prospecting Level 3 | reach_skill_level |
| 5 | Craft 3 consumables | craft |
| 6 | Kill 50 enemies | kill_enemies |
| 7 | Defeat Giant Roach boss | kill_boss |

---

## Chapter 3 — The Wasteland Calls
> *Part 1 Unlocks: **Hero Recruitment** (unlocks immediately on completing Part 1, not the full chapter)*

| Part | Objective | Type | Notes |
|------|-----------|------|-------|
| 1 | Reach hero level **5** | reach_hero_level | **Unlocks Hero Recruitment** |
| 2 | Equip gear in 5+ slots | equip | |
| 3 | Defeat Giant Roach (Full Sweep boss) | kill_boss | |
| 4 | Craft T2 weapon | craft | |
| 5 | Reach any gathering skill level 10 | reach_skill_level | |
| 6 | Accumulate 500 WC | earn_currency | |
| 7 | Defeat boss on Hard (T2) difficulty | kill_boss | |

---

## Chapter 4 — Strength in Numbers
> *Unlocks: Guild*

| Part | Objective | Type |
|------|-----------|------|
| 1 | Recruit second hero | recruit_hero |
| 2 | Deploy 2+ heroes simultaneously | deploy_heroes |
| 3 | Complete expedition on Normal | complete_expedition |
| 4 | Craft T2 armor | craft |
| 5 | Reach any production skill level 15 | reach_skill_level |
| 6 | Equip ability tome | equip_ability |
| 7 | Defeat 3 different boss types | kill_boss |

---

## Chapter 5 — Proving Grounds
> *Unlocks: PVP*

| Part | Objective | Type |
|------|-----------|------|
| 1 | Reach hero level 25 | reach_hero_level |
| 2 | Complete expedition on Hard | complete_expedition |
| 3 | Have 3+ heroes | recruit_hero |
| 4 | Craft T3 equipment | craft |
| 5 | Equip 3+ ability tomes | equip_ability |
| 6 | Accumulate 5000 total WC | earn_wc |
| 7 | Defeat boss on Elite (T3) difficulty | kill_boss |

---

## Chapter 6 — Beyond the Horizon
> *Unlocks: Expeditions*

| Part | Objective | Type |
|------|-----------|------|
| 1 | Raise hero to level 15 | reach_hero_level |
| 2 | Eliminate 50 enemies | kill_enemies |
| 3 | Craft T2 weapon | craft |
| 4 | Reach gathering skill level 15 | reach_skill_level |
| 5 | Defeat 3 unique bosses | kill_boss |
| 6 | Equip 6 gear slots on 1 hero | equip |
| 7 | Earn 2000 WC total | earn_wc |

---

## Chapter 7 — The Icqor Convergence
> *Unlocks: Starlight Constellation*

| Part | Objective | Type |
|------|-----------|------|
| 1 | Reach gathering skill level 30 | reach_skill_level |
| 2 | Craft T3 equipment | craft |
| 3 | Defeat T3+ boss | kill_boss |
| 4 | Reach hero level 25 | reach_hero_level |
| 5 | Obtain Icqor Chess Piece | gather |
| 6 | Reach production skill level 15 | reach_skill_level |
| 7 | Deploy 3 heroes simultaneously | deploy_heroes |

---

## Feature Unlock Summary

| Trigger | Feature Unlocked |
|---------|------------------|
| Chapter 1 complete | Marketplace |
| Chapter 2 complete | Accessories (ring, earring, necklace) |
| Chapter 3, **Part 1** complete | Hero Recruitment |
| Chapter 4 complete | Guild |
| Chapter 5 complete | PVP |
| Chapter 6 complete | Expeditions |
| Chapter 7 complete | Starlight Constellation |

### Icqor Chess Piece Gating

Icqor Chess Pieces (used for Starlight Constellation) are **gated behind Chapter 7 being started**. They will not drop from any source (bosses, combat, gathering, production, workers) until the player's current story chapter reaches Chapter 7. This ensures players discover the Starlight system through the story before collecting Icqor pieces.

---

## Story Tracking
- **Cumulative counters**: Total kills, total WC earned, bosses defeated, consumables crafted
- **State-based checks**: Skill levels, hero count, gear slots equipped (rechecked on game load)
- **Rewards**: WC + resources granted per part completion
- Objectives must be completed **sequentially** within each chapter
- Part-level unlocks trigger immediately upon completing that specific part
- Chapter-level unlocks (if any) trigger when the final part of the chapter is completed
