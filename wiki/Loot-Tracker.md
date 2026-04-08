# Loot Tracker

The Loot Tracker records **all resource gains** across the game, providing a detailed history of what was obtained, from where, and when.

---

## Overview

The Loot Tracker is accessible from the top navigation bar (always visible, no story unlock required). It tracks every resource gain from 5 sources:

| Source | Color | Description |
|--------|-------|-------------|
| Gathering | Green | Resources from gathering skills (Scavenging, Foraging, etc.) |
| Production | Blue | Resources/items from production skills (Cooking, Tinkering, etc.) |
| Combat | Red | Drops from combat zone enemy kills |
| Boss | Purple | Drops from boss defeats |
| Worker | Orange | Resources brought back by deployed workers |

---

## History Duration

| Account Type | History |
|-------------|---------|
| Free | 12 hours |
| Gold Pass (Premium) | 24 hours |

Entries older than the history window are automatically purged.

---

## UI Views

### All Loot (Summary)
- Aggregates all resources by type
- Sorted by total quantity (highest first)
- Shows resource name and total count
- Icqor Chess Pieces highlighted in purple

### By Source
- Groups resources by their acquisition source
- Color-coded source labels (gathering=green, combat=red, etc.)
- Shows quantity per source per resource

### Recent
- Timeline view of the last 50 individual loot events
- Shows relative timestamps ("2m ago", "1h ago")
- Each entry shows: resource name, quantity, source, and origin (skill/zone name)

---

## Stats Bar

The top of the Loot Tracker displays quick stats:

| Stat | Description |
|------|-------------|
| Total Items | Sum of all resource quantities in history |
| Unique Types | Count of distinct resource types acquired |
| Items/Hour | Rate of resource acquisition |
| Icqor Pieces | Total Icqor Chess Pieces acquired in the history window |

---

## Integration

The Loot Tracker is integrated with:
- **Gathering** (`useGameStore`) — logs each gathering action result
- **Production** (`useGameStore`) — logs each crafting/production output
- **Combat kills** (`useCombatZoneStore`) — logs enemy resource drops
- **Boss kills** (`useCombatZoneStore`) — logs boss loot
- **Worker trips** (`usePopulationStore`) — logs worker return resources

All tracking is done via `useLootTrackerStore.trackLoot(resourceId, quantity, source, origin)`.

---

## Save/Load

Loot history is persisted in save data and restored on game load. The history array is serialized with timestamps for proper age-based pruning on reload.
