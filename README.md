# Dead City Directive

Post-apocalyptic city-survival RPG. Build an encampment, recruit heroes, deploy squads, craft gear, and survive the dead city.

**Status:** Single-player with multiplayer-ready architecture. No live backend or real-time multiplayer yet.

## Quick Start

```bash
npm install
npm run dev          # Vite dev server (browser)
npm run electron:dev # Electron desktop app
npm run build        # Production build (TypeScript check + Vite)
```

## Architecture

| Layer | Tech | Purpose |
|-------|------|---------|
| UI | React 19 + TypeScript | Component rendering |
| State | Zustand (17 stores) | Game state management |
| Styling | Tailwind CSS 4 + CSS variables | Theme + layout |
| Shell | Electron + Steamworks.js | Desktop distribution |
| Auth | Supabase (optional) | Cloud saves, accounts |
| Saves | localStorage JSON | Per-slot persistence |

### Project Structure

```
src/
  App.tsx              — Main game shell (hub + nav + panel routing)
  AppShell.tsx          — Auth flow router (loading → login → char select → game)
  config/               — Declarative game data (skills, gear, abilities, zones, buildings, story)
  engine/               — Pure-function game logic (combat, heroes, loot, skills, bonuses)
  store/                — Zustand stores (17 stores, each with serialize/load)
  components/
    hub/                — Encampment hub + Scan Tower
    combat/             — Decomposed combat UI (BattleView, HeroBattleCard, EnemyBattleCard, etc.)
    encampment/         — Building management
    heroes/             — Hero roster + equipment
    marketplace/        — BDO-style local market
    population/         — Worker management
    skills/             — Gathering + production skills
    story/              — Story progression
    layout/             — NavBar, Sidebar, ResourcePanel, BottomPanel
    auth/               — Landing page, character select, starter hero
  hooks/
    useGameTick.ts      — 1Hz game loop orchestrating all system ticks
  lib/
    saveService.ts      — localStorage + Supabase cloud sync
    authService.ts      — Auth abstraction
  types/                — TypeScript interfaces (Hero, Equipment, Population, etc.)
  utils/                — Navigation context, icon utilities
electron/
  main.js              — Electron main process + Steam IPC
  preload.js           — Context-isolated Steam API bridge
```

### State Architecture

All game state lives in Zustand stores. Each store exposes:
- `getSerializableState()` — extract JSON-safe state
- `loadState(saved)` — restore from saved data

The `useGameTick` hook runs at 1Hz and orchestrates:
- Skill progression
- Combat simulation (per-tick enemy/hero damage)
- Population worker trips
- Equipment crafting
- Encampment resource production
- Market price adjustment (every 5 min)
- Auto-save (every 30s)

### Save System

- **Format:** JSON in localStorage, key: `wasteland_save_{userId}_slot{slotIndex}`
- **Version:** Currently v15. Migrations chain forward from v9.
- **Slots:** 4 character slots per account
- **Cloud:** Optional Supabase sync (debounced 60s)
- **Offline progress:** Calculated on app launch, respects daily idle cap

Save key format is internal and does not change with game branding.

## Game Systems

### Combat
Idle auto-battle with per-tick simulation. Heroes attack enemies based on turn speed intervals. Enemy and hero HP tracked authoritatively in the store. Fight outcomes resolved by `simulateFight()` in IdleCombatEngine. Combat triangle: melee > demolitions > ranged > melee.

### Heroes
16 classes across 5 categories (Skirmisher, Control, Support, Assault, Artisan). 7 primary stats, 4 ability slots + 1 decree slot. Specialist heroes (Artisan category) can serve as building leaders in the encampment.

### Encampment
20 buildings across 7 categories. Each provides passive bonuses and can have 1 worker assigned for resource production. Specialist heroes can be assigned as building leaders for bonus multipliers (1% per hero level, max 50%).

### Marketplace
BDO-inspired local market with price bands, purchase order lottery, and NPC floor buyers. Currently single-player with bot traders. Architected for future server-backed trading.

### Scan Tower
City intelligence system. Scans zones for threat level, loot category, survivor activity, boss intel, and squad recommendations. Provides actionable deployment guidance. Future-ready for PvP threat assessment and contested district scanning.

## Single-Player vs Multiplayer

This game is currently **single-player only**. Systems that appear social are local simulations:

| System | Current State | Future Target |
|--------|--------------|---------------|
| Marketplace | Local with NPC bot traders | Server-backed player trading |
| Chat | Local activity log (radio comms) | Real-time multiplayer chat |
| PvP | Locked placeholder | Player-vs-player arena |
| Guild | Locked placeholder | Faction system |
| Leaderboards | Not implemented | Server-backed rankings |

No system falsely claims to be multiplayer. Bot traders are labeled as NPCs. Locked features state "future update."

## Wiki Documentation

Detailed game design documentation lives in `GAME_WIKI*.md` files:
- `GAME_WIKI.md` — Hub index
- `GAME_WIKI_COMBAT.md` — Damage formulas, zones, expeditions
- `GAME_WIKI_HEROES.md` — Classes, stats, recruitment
- `GAME_WIKI_EQUIPMENT.md` — Gear tiers, slots, crafting
- `GAME_WIKI_FACETS_ENCHANTS.md` — Itemization depth
- `GAME_WIKI_SKILLS.md` — Gathering + production
- `GAME_WIKI_MARKETPLACE.md` — Trading system
- And more (abilities, story, starlight, consumables, sets, systems)

## Development

```bash
npm run dev          # Dev server on localhost:5173
npm run build        # TypeScript + Vite production build
npm run lint         # ESLint
npm run electron:dev # Electron with hot reload
npm run electron:build # Packaged desktop build
```

### Known Pre-existing Type Warnings

The codebase has some pre-existing TypeScript warnings (unused variables, a `require()` call in PopulationPanel, gear.ts type narrowing). These are tracked and do not affect runtime behavior.

## License

Private repository. Not open source.
