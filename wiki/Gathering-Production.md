# Gathering & Production Skills

## Gathering Skills (5)

All gathering skills share the same leveling curve: `XP per level = 50 × level^2.5`. Level cap is 100.

### Skill List
| Skill | Base Action Time | Focus |
|-------|-----------------|-------|
| Scavenging | 4s base | Metals, wood, pipes |
| Foraging | 4s base | Herbs, berries, roots |
| Salvage Hunting | 5s base | Mechanical, electronic, chemical |
| Water Reclamation | 4s base | Water types |
| Prospecting | 5s base | Ores and stone |

### Gathering Speed by Skill Level
| Level Range | Action Time | Qty Multiplier | XP Multiplier |
|-------------|-------------|----------------|---------------|
| 1–10 | 4.0s | 1.0× | 1.0× |
| 11–25 | 3.5s | 1.2× | 1.3× |
| 26–40 | 3.0s | 1.5× | 1.6× |
| 41–60 | 2.5s | 1.8× | 2.0× |
| 61–80 | 2.0s | 2.2× | 2.5× |
| 81–100 | 1.5s | 2.8× | 3.0× |

### Sub-Activity Types
Each skill has activities per tier:
- **Focused activities**: Gather 1 specific resource
- **Sweep activities**: Gather a mix of all resources from that tier

### Activity Tiers
| Tier | Level Requirement | Resources |
|------|-------------------|-----------|
| T1 | 1+ | Basic resources |
| T2 | 15+ | Intermediate resources |
| T3 | 30+ | Advanced resources |

---

## Production Skills (5)

| Skill | Base Action Time | Inputs From | Produces |
|-------|-----------------|-------------|----------|
| Cooking | 3s base | Foraging, Water Reclamation | Food consumables |
| Tinkering | 5s base | Multiple gathering skills | Tools, Focus Rings |
| Weaponsmithing | 6s base | Prospecting, Salvage Hunting | All weapons |
| Armorcrafting | 6s base | Prospecting, Scavenging | Armor, shields |
| Biochemistry | 5s base | Foraging, Water Reclamation, Prospecting | Medicines, chemicals |

### Craft Time by Gear Tier
| Tier | Base Craft Time |
|------|----------------|
| T1 | 12s |
| T2 | 25s |
| T3 | 50s |
| T4 | 100s |
| T5 | 150s |
| T6 | 225s |
| T7 | 300s |
| T8 | 450s |

Production speed bonus: `base time × (1 - (level / 100) × 0.15)` — up to 15% faster at level 100. Minimum 1 second.

---

## Tools (10)

Tools boost gathering speed for their associated skill.

### T1 Tools (Level 1)
| Tool | Skill | Bonus |
|------|-------|-------|
| Salvage Prybar | Scavenging | +10% speed |
| Foraging Sickle | Foraging | +10% speed |
| Salvage Scanner | Salvage Hunting | +10% speed |
| Water Filter | Water Reclamation | +10% speed |
| Mining Pickaxe | Prospecting | +10% speed |

### T2 Tools (Level 30)
| Tool | Skill | Bonus |
|------|-------|-------|
| Reinforced Prybar | Scavenging | +20% speed |
| Carbon Sickle | Foraging | +20% speed |
| Advanced Scanner | Salvage Hunting | +20% speed |
| Purification System | Water Reclamation | +20% speed |
| Sonic Drill | Prospecting | +20% speed |

---

## Batch Crafting & Action Queue
- **Repeat target**: Set a number of actions to repeat (0 = infinite)
- **Action queue**: Queue up multiple skill/activity combos to auto-advance
- **Gathering goals**: Set collection goals (resource count or skill level target) to auto-stop

## Offline Progress
- **Idle cap**: 12 hours per day (resets at midnight UTC)
- Offline ticks are processed at the hero's gathering rate
- Returns `wasCapped = true` when idle cap exceeded
