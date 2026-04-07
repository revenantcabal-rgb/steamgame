# Wasteland Grind - Game Systems Reference

Anti-cheat, achievements, auth system, character slots, cloud saves, settings, idle cap, goal system, and currency.

See also: [Main Hub](GAME_WIKI.md) | [Combat](GAME_WIKI_COMBAT.md) | [Marketplace](GAME_WIKI_MARKETPLACE.md)

---

## TABLE OF CONTENTS

1. [Anti-Cheat System](#anti-cheat-system)
2. [Achievements](#achievements)
3. [Auth System](#auth-system)
4. [Character Slots](#character-slots)
5. [Cloud Saves](#cloud-saves)
6. [Settings](#settings)
7. [Idle Cap](#idle-cap)
8. [Goal System](#goal-system)
9. [Currency System](#currency-system)
10. [Cash Shop](#cash-shop)

---

## ANTI-CHEAT SYSTEM

### Game IDs
- Every game action generates a unique Game ID for server validation
- Game IDs are cryptographically signed and timestamped
- Duplicate or out-of-sequence Game IDs are flagged for review
- IDs are tied to account session tokens

### Rate Limiting
- Actions per second are capped per activity type:
  - Gathering actions: max 1 per 1.5 seconds (matching fastest gathering speed at Lv.81-100)
  - Combat actions: max 1 per 3 seconds (matching fastest idle combat speed)
  - Marketplace actions: max 5 per second (browsing), 1 per 2 seconds (buying/selling)
  - Crafting actions: max 1 per 2 seconds
- Exceeding rate limits triggers a cooldown penalty (progressive: 5s, 30s, 5m, 1h)
- Sustained rate limit violations escalate to ban review

### Ban Escalation
| Offense | Action | Duration |
|---------|--------|----------|
| 1st offense (rate limit abuse) | Warning + 1-hour cooldown | Immediate |
| 2nd offense (repeated rate abuse) | 24-hour account suspension | Same day |
| 3rd offense (confirmed automation) | 7-day ban | Within a week |
| 4th offense (repeat offender) | 30-day ban | Within a month |
| 5th+ offense (persistent cheating) | Permanent ban | Permanent |
| Economy exploit (duping, ghost trading) | Immediate permanent ban | Immediate |

### Anti-Ghost-Trading
- All marketplace transactions are validated server-side
- Buyer and seller cannot be the same account or linked accounts
- Suspiciously matched transactions (same IP, same device fingerprint) are flagged
- See [Marketplace](GAME_WIKI_MARKETPLACE.md) for anti-ghost-trading design details

---

## ACHIEVEMENTS

20 achievements track major game milestones. Each achievement grants a reward upon completion.

| # | Achievement | Condition | Reward |
|---|------------|-----------|--------|
| 1 | **First Steps** | Complete the tutorial questline | +2 workers, Tutorial Badge |
| 2 | **Armed and Ready** | Equip a hero with a full set of gear (all slots) | 500 WC |
| 3 | **Bug Squasher** | Defeat the Giant Roach (Zone 1 Boss) | 100 WC, T1 gear chest |
| 4 | **Pack Hunter** | Defeat the Alpha Wolf (Zone 2 Boss) | 250 WC, T2 gear chest |
| 5 | **Factory Reset** | Defeat the Factory Overseer (Zone 3 Boss) | 500 WC, T3 gear chest |
| 6 | **Warlord Slayer** | Defeat the Raider Warlord (Zone 4 Boss) | 1,000 WC, T4 gear chest |
| 7 | **Machine Breaker** | Defeat the Commander Mech (Zone 5 Boss) | 2,500 WC, T5 gear chest |
| 8 | **Core Diver** | Defeat The Source (Zone 6 Boss) | 5,000 WC, T7 gear chest |
| 9 | **Apocalypse Survivor** | Defeat The Cataclysm (Zone 7 Boss) | 10,000 WC, T8 gear chest |
| 10 | **Master Gatherer** | Reach Lv.100 in any gathering skill | +3 workers, Master title |
| 11 | **Master Crafter** | Reach Lv.100 in any production skill | Guaranteed Plague craft (1 use) |
| 12 | **Full Roster** | Recruit 20 heroes | 5,000 WC, Hero Chest |
| 13 | **PVP Champion** | Reach Diamond rank in PVP | Unique cosmetic, 5,000 WC |
| 14 | **War Hero** | Win 10 Clan Wars | 10,000 WC, Unique title |
| 15 | **Plague Collector** | Own 5 Plague-rarity items | 2,500 WC |
| 16 | **Expedition Pioneer** | Complete all 3 expeditions on Normal | 3,000 WC, Expedition Badge |
| 17 | **Expedition Master** | Complete all 3 expeditions on Mythic | 15,000 WC, Legendary title |
| 18 | **Millionaire** | Accumulate 1,000,000 WC total earned | Gold Border profile |
| 19 | **Jack of All Trades** | Reach Lv.50 in all 16 skills | 5,000 WC, Versatile title |
| 20 | **Wasteland Legend** | Reach Lv.100 in all 16 skills | 50,000 WC, Legendary Border, unique cosmetic set |

---

## AUTH SYSTEM

### Login Methods

| Method | How It Works | Account Type |
|--------|-------------|-------------|
| **Email/Password** | Standard registration with email verification | Full account |
| **Steam Login** | OAuth via Steam - links to Steam account | Full account |
| **Guest Account** | Play immediately, no registration | Limited (can upgrade later) |

### Guest Account Limitations
- No marketplace access (cannot buy or sell)
- No PVP access
- No clan membership
- Progress is saved locally only (no cloud save)
- Can upgrade to full account at any time (progress preserved)

### Account Security
- Password hashing: bcrypt with salt
- Session tokens: JWT with 24-hour expiry, refresh tokens for 30 days
- Two-factor authentication: Optional, via authenticator app
- Account recovery: Via email verification

---

## CHARACTER SLOTS

- Each account has **1 character** (settlement + hero roster)
- Additional character slots available via premium currency (Irradiated Gems)
- Each character is a separate settlement with its own workers, heroes, resources, and progression
- Characters share: account-level achievements, premium currency, cosmetics
- Characters do NOT share: heroes, gear, resources, WC, marketplace listings

---

## CLOUD SAVES

- **Auto-save:** Every 30 seconds during active play
- **Browser close:** Save triggered on tab/window close
- **Offline progress:** Calculated on login up to idle cap
- **Cloud sync:** Saves uploaded to server every 60 seconds
- **Conflict resolution:** Server save takes priority over local save
- **Save size:** Typically 50-200 KB per character
- **Backup:** Server maintains last 7 days of save snapshots (rollback available via support)

---

## SETTINGS

### Game Settings
| Setting | Options | Default |
|---------|---------|---------|
| Auto-save frequency | 15s / 30s / 60s | 30s |
| Notification sounds | On / Off | On |
| Combat speed | 1x / 2x / 4x | 1x |
| Idle notification | Notify when idle cap reached | On |
| Low-power mode | Reduce animations when idle | Off |

### Display Settings
| Setting | Options | Default |
|---------|---------|---------|
| Theme | Light / Dark / Wasteland | Wasteland |
| Font size | Small / Medium / Large | Medium |
| Show damage numbers | On / Off | On |
| Show XP notifications | On / Off | On |
| Compact UI mode | On / Off | Off |

---

## IDLE CAP

- **Default:** 12 hours per day (free players)
- **Premium extension:** Purchase additional hours via Irradiated Gems (cash shop)
- **Daily reset:** Cap resets at midnight local time
- **Offline progress:** Calculated on login, capped by idle hours remaining
- **Activities affected:** Gathering, production, idle combat all share the same idle cap pool
- **Notification:** Players receive an alert when idle cap is within 30 minutes of expiring

---

## GOAL SYSTEM

Players can set goals for gathering, production, and combat to auto-stop when the target is reached.

### Gathering Goals
| Goal Type | Example | How It Works |
|-----------|---------|-------------|
| **Gather Amount** | "Gather 10,000 Iron Ore" | Stops gathering when resource count reaches target |
| **Reach Level** | "Train Scavenging to Lv.30" | Stops when skill hits target level |
| **No Goal** | Train indefinitely | Default behavior, never stops |

### Combat Goals
| Goal Type | Example | How It Works |
|-----------|---------|-------------|
| **Fight Count** | "Fight 100 times" | Stops after N fights (boss at 50) |
| **Level Stat** | "Level STR to 50" | Stops when stat reaches target |
| **No Goal** | Fight indefinitely | Default behavior |

The game auto-calculates estimated completion time based on:
- Current gathering speed + bonuses
- Hero stats + equipment + food buffs
- Worker count + skill levels
- Displayed as "~estimated X hours Y minutes"

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
- Can be earned in-game: 1 IG per daily login (7th day streak = 10 IG bonus), 5 IG per season PVP reward

---

## CASH SHOP

### Philosophy
The cash shop sells **convenience and cosmetics only**. No pay-to-win.

### Available Items

| Item | Cost (IG) | Effect |
|------|-----------|--------|
| XP Boost (+50%) | 50 IG | 24-hour +50% XP gain for all activities |
| Idle Cap Extension (+4h) | 30 IG | Extends daily idle cap by 4 hours for 7 days |
| Cosmetic Pack | 20-100 IG | Skins for heroes, gear, UI themes |
| Additional Character Slot | 200 IG | Permanently adds 1 extra character slot |
| Name Change | 50 IG | Change hero or settlement name |
| Inventory Expansion | 25 IG | +50 inventory slots (permanent) |

### What You CANNOT Buy
- Gear, weapons, armor
- Resources or crafting materials
- WC (Wasteland Credits)
- Heroes or hero stat rerolls
- Marketplace advantages
- Combat power of any kind
