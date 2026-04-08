# Population & Workers

Workers are a passive gathering workforce that collect resources on auto-pilot through trip-based assignments.

---

## Worker Basics

- **Population Cap**: 50 workers maximum
- **Starting Workers**: 3 (from tutorial)
- **Respawn Time**: 3 minutes (2 min 15 sec with Golden Cap)
- Workers gain their own skill XP and also grant XP to the player's skill

---

## Worker Scaling (by Workers Assigned)

| Workers | Speed Mult | Yield Mult | Death Risk/Trip |
|---------|-----------|------------|-----------------|
| 1 | 0.5× | 0.6× | 15% |
| 2 | 0.8× | 0.8× | 5% |
| 3 | 1.0× | 1.0× | 1% |
| 4 | 1.2× | 1.2× | 0.5% |
| 5 | 1.4× | 1.4× | 0.1% |
| 6+ | 1.4 + (n-5)×0.1 | 1.4 + (n-5)×0.1 | 0% |

**Optimal strategy**: Groups of 5+ eliminate death risk entirely.

---

## Trip Duration
`tripTime = skillDef.baseActionTime × 2 / scaling.speedMultiplier`
Minimum: 2 seconds. Workers are inherently **2× slower** than heroes.

---

## Worker Skill Bonuses (Yield)

| Worker Skill Level | Yield Bonus |
|--------------------|-------------|
| 1–10 | 0% |
| 11–25 | +10% |
| 26–50 | +20% |
| 51–75 | +35% |
| 76–100 | +50% |

---

## Worker XP

- Workers gain **50% of normal XP** per trip
- Workers also grant **25% of their XP** to the player's corresponding skill
- Golden Cap adds **1.2× XP multiplier**

---

## Worker Death & Recovery

- Death risk is rolled once per trip
- Dead workers enter a **3-minute respawn** (2:15 with Golden Cap)
- Respawning workers do **not** count against population cap
- **Golden Cap**: Auto-reassign workers to their previous task after respawning

---

## Population Milestones (Worker Grants)

| Milestone | Condition | Workers Granted |
|-----------|-----------|-----------------|
| Start | Game start | 3 |
| Tutorial Complete | Complete tutorial | 2 |
| First Hero | Recruit first hero | 1 |
| Gathering 15 | Any gathering skill Lv.15 | 2 |
| Gathering 30 | Any gathering skill Lv.30 | 2 |
| First PvP Win | Win a PvP match | 1 |
| Join Clan | Join a clan | 2 |
| Gathering 45 | Any gathering skill Lv.45 | 2 |
| Gathering 60 | Any gathering skill Lv.60 | 2 |
| Gathering 80 | Any gathering skill Lv.80 | 2 |
| Gathering 100 | Any gathering skill Lv.100 | 3 |
| All Gathering 100 | All 5 gathering skills at Lv.100 | 2 |
| **Total** | | **23 workers** |

Additional workers can be gained through **combat kills**: every 10 kills triggers a tier-based population roll (10%–30% chance).

---

## Rare Worker Drops

Workers can find Icqor Chess Pieces during trips (gated behind Chapter 7):
- T3 activities (level ≥ 30): **0.5% per trip**
- T2 activities (level 15–29): **0.3% per trip**
- T1 activities (level < 15): **0.1% per trip**

Modified by encampment rare drop bonus, worker perception bonus, and rank rare drop bonus.

---

## Worker Rank System

Each individual worker has a **rank** that improves with dispatches:

| Rank | Dispatches Required | Yield Bonus | Survivability | Speed | Rare Drop | XP |
|------|-------------------|-------------|--------------|-------|-----------|-----|
| Recruit | 0 | +0% | +0% | +0% | +0% | +0% |
| Veteran | 50 | +5% | +10% | +5% | +3% | +5% |
| Grandfather | 250 | +12% | +25% | +10% | +8% | +12% |
| Legend | 1,000 | +25% | +50% | +20% | +15% | +25% |

Rank bonuses stack with other modifiers.

---

## Individual Worker Stats

Each worker has **5 individual stats** that grow with each trip based on the gathering skill:

| Stat | Growth Source | Effect |
|------|-------------|--------|
| Strength | Scavenging | +yield bonus |
| Endurance | Water Reclamation | +survivability (reduces death risk) |
| Perception | Foraging | +rare drop chance |
| Agility | Salvage Hunting | +speed bonus |
| Intellect | Prospecting | +XP bonus |

### Survivability Formula
`survivabilityFactor = 1 / (1 + 0.02 × endurance + 0.005 × totalDispatches)`

This factor multiplies the base death risk, reducing it as workers gain experience.
