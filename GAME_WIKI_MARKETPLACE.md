# Wasteland Grind - Marketplace Reference

BDO-style Central Market, purchase orders (PO lottery system), price bands, rarity-adjusted pricing, bot POs, warehouse/collectables, tax system, anti-ghost-trading design.

See also: [Equipment](GAME_WIKI_EQUIPMENT.md) | [Skills](GAME_WIKI_SKILLS.md) | [Systems](GAME_WIKI_SYSTEMS.md) | [Main Hub](GAME_WIKI.md)

---

## TABLE OF CONTENTS

1. [Wasteland Exchange Overview](#wasteland-exchange-overview)
2. [BDO-Style Central Market Design](#bdo-style-central-market-design)
3. [Price System & Price Bands](#price-system--price-bands)
4. [Purchase Orders (PO Lottery)](#purchase-orders)
5. [Rarity-Adjusted Pricing](#rarity-adjusted-pricing)
6. [Bot POs (NPC Buyers)](#bot-pos)
7. [Warehouse & Collectables](#warehouse--collectables)
8. [Tax System](#tax-system)
9. [Anti-Ghost-Trading Design](#anti-ghost-trading-design)
10. [Listings & Expiry](#listings--expiry)
11. [Categories](#categories)
12. [UI Views](#ui-views)
13. [Ability Tome Trading](#ability-tome-trading)

---

## WASTELAND EXCHANGE OVERVIEW

The Wasteland Exchange is a **BDO-inspired central marketplace** where players buy and sell items using Wasteland Credits (WC). Unlike a traditional auction house, this marketplace uses fixed price bands, purchase order lotteries, and server-controlled pricing to maintain a healthy economy.

Sources:
- [BDO Central Market Guide](https://grumpygreen.cricket/bdo-central-market/)
- [BDO Marketplace Wiki](https://blackdesertonline.fandom.com/wiki/Marketplace)

---

## BDO-STYLE CENTRAL MARKET DESIGN

### Key Differences from Traditional Auction Houses

| Feature | Traditional AH | Wasteland Exchange (BDO-style) |
|---------|---------------|-------------------------------|
| Pricing | Seller sets any price | Price constrained to base +/-15% band |
| Buying | Instant buy at listed price | Purchase orders compete via lottery |
| Supply/Demand | Free market, unlimited swings | Server adjusts base price gradually |
| Sniping | Last-second bidding | No bidding - PO lottery is fair |
| Price manipulation | Easy (buy out and relist) | Hard (price bands + rate limits) |
| Gold trading (RMT) | Easy via overpriced listings | Nearly impossible (see anti-ghost-trading) |

---

## PRICE SYSTEM & PRICE BANDS

### Base Price
- Every item has a **base price** determined by its type, tier, and rarity
- Base price is set by the server and adjusts slowly based on supply/demand

### Price Bands (+/-15%)
- **Sellers** must list items within **base price +/-15%**
- **Purchase orders** can be placed within **base price +/-15%**
- Players cannot list items below 85% or above 115% of base price

### Price Adjustment
- When items consistently sell at **max price (115%)**: base price increases by 1% per day
- When items consistently sell at **min price (85%)**: base price decreases by 1% per day
- **Developer caps:** Hard floor (50% of original base) and ceiling (300% of original base) prevent extreme swings

### Trend Indicators
- Rising (red arrow): Base price has increased over past 3 days
- Falling (blue arrow): Base price has decreased over past 3 days
- Stable (gray dot): Base price unchanged for 3+ days

---

## PURCHASE ORDERS

### How PO Lottery Works

Unlike traditional "highest bid wins," the Wasteland Exchange uses a **lottery system** for purchase orders:

1. **Player places a PO** at a price within the allowed band
2. **Multiple POs** can exist at the same price point
3. When a seller lists an item, **all POs at or above the listing price are eligible**
4. A **random PO is selected** from eligible orders (lottery)
5. The selected buyer pays their PO price (not the listing price)
6. The seller receives the PO price minus tax

### PO Priority Tiers

While the lottery is random, there are priority tiers:
1. **Highest price POs** get entered into lottery first
2. If multiple POs at the same price, lottery is pure random
3. POs from accounts with fewer total marketplace transactions get a slight weight bonus (helps new players)

### PO Rules
- WC is **locked in escrow** when PO is placed
- POs last **7 days** before expiring (WC returned)
- Players can cancel POs at any time (WC returned immediately)
- Maximum 30 active POs per player

---

## RARITY-ADJUSTED PRICING

Item rarity significantly affects base pricing:

| Rarity | Price Multiplier | Example (T4 Iron Breastplate) |
|--------|-----------------|-------------------------------|
| Common | x1.0 | 5,000 WC base |
| Rare | x3.0 | 15,000 WC base |
| Unique | x8.0 | 40,000 WC base |
| Plague | x25.0 | 125,000 WC base |

### Source Tag Modifiers

| Source | Price Modifier |
|--------|---------------|
| [Forged] (Crafted) | x1.0 (full price) |
| [Salvaged] (Boss drop) | x0.6 |
| [Scavenged] (Mob drop) | x0.4 |
| [Issued] (Quest) | x0.7 |
| [Decorated] (PVP) | x0.9 |

*A [Salvaged] Plague T4 Breastplate base price: 125,000 x 0.6 = 75,000 WC*

---

## BOT POS

### NPC Purchase Orders

The server maintains **bot POs** (NPC buyers) to ensure items always have a minimum buyer:

- Bot POs exist at **50% of base price** for all items
- Bot POs have unlimited quantity (they always buy)
- Bot POs act as a **price floor** - you can always sell to the NPC
- Bot POs do NOT compete in the player PO lottery - player POs always take priority

### Why Bot POs Exist
- Prevents items from being unsellable
- Provides a guaranteed gold sink (items sold to bots are destroyed)
- Sets a floor for the economy
- New players can always liquidate unwanted items

---

## WAREHOUSE & COLLECTABLES

### Marketplace Warehouse
- Items purchased on the marketplace go to a **warehouse** (not inventory directly)
- Players must **collect** items from the warehouse to use them
- Warehouse has 100 slots (expandable via premium)
- Items in warehouse are safe from loss and cannot be traded until collected

### Why a Warehouse?
- Prevents accidental purchases from cluttering inventory
- Creates a natural delay between purchase and use
- Allows batch collection when convenient
- Prevents marketplace sniping bots from instantly equipping items

---

## TAX SYSTEM

### Marketplace Tax
- **5% tax** on all player-to-player sales
- Tax is deducted from the seller's proceeds
- Seller receives: (Sale Price x 0.95)
- Tax is a **gold sink** to prevent WC inflation

### Tax Destination
- 100% of tax is removed from the economy (destroyed)
- No tax on:
  - Cancelled listings (items returned)
  - Expired listings (items returned)
  - PO cancellations (WC returned in full)
  - Bot PO sales (already at 50% price)

---

## ANTI-GHOST-TRADING DESIGN

Ghost trading (transferring wealth between accounts, often for RMT) is prevented through multiple layers:

### Layer 1: Price Bands
- Items can only be listed within +/-15% of server-set base price
- Prevents listing a worthless item for 1,000,000 WC to transfer gold

### Layer 2: PO Lottery
- Buyers compete via random lottery, not highest-bid-wins
- Prevents a specific buyer from guaranteeing they get a specific listing
- Even with only one PO, there's a server-side delay and queue

### Layer 3: Account Linking Detection
- Same IP address, device fingerprint, or payment method triggers review
- Repeated trades between the same two accounts are flagged
- Accounts created within 24 hours of each other trading are flagged

### Layer 4: Rate Limiting
- Maximum 20 marketplace transactions per hour per account
- Maximum 100 transactions per day
- Suspicious patterns (rapid buy-sell cycles) trigger cooldowns

### Layer 5: Value Monitoring
- Trades significantly above or below market average are flagged
- Accounts receiving large WC transfers from marketplace are audited
- Bot PO sales below 60% of base price are reviewed

---

## LISTINGS & EXPIRY

- Items listed for **48 hours** before expiring
- Expired items return to seller automatically
- Sellers can cancel listings at any time (items returned)
- Items must be unequipped to list
- Heroes for sale lose all equipped gear (returned to seller)
- No listing limit (list as many items as you want)

---

## CATEGORIES

| Category | What It Contains |
|----------|-----------------|
| **Resources** | Raw materials: ores, wood, herbs, water, salvage |
| **Consumables** | Food buffs, medicines, combat chemicals |
| **Ability Tomes** | Dropped/crafted ability tomes for hero ability slots |
| **Expedition Passes** | Passes required for expedition dungeons |
| **Equipment** | Weapons, armor, legs, gloves, boots, shields |
| **Accessories** | Rings, earrings, necklaces, stat focus rings |
| **Skills** | Equippable combat skills (melee, ranged, demo, utility) |
| **Wasteland Tools** | Gathering and production tools |
| **Heroes** | Recruited heroes for sale |
| **Enhancement Materials** | Facet Stones, Enhancement Shards |

---

## UI VIEWS

| View | Purpose |
|------|---------|
| **Browse** | Search and buy items by category with price info and trend indicators |
| **Purchase Orders** | Place and manage POs for items you want to buy |
| **Sell Items** | List your resources/gear for sale within price bands |
| **My Listings** | Manage active listings and active POs |
| **Warehouse** | Collect purchased items |
| **History** | View past transactions with price and date |
| **Price Charts** | View 30-day price history for any item |

---

## ABILITY TOME TRADING

Ability Tomes are one of the most actively traded items on the marketplace. See [Abilities](GAME_WIKI_ABILITIES.md) for the full tome list.

### Tome Pricing
- Tome base price scales with RES requirement and zone drop source
- Higher-zone tomes are naturally more expensive
- Purple (Decree) tomes command the highest prices due to rarity and party utility
- Duplicate tomes are valuable for ability power investment

### Market Demand Patterns
- Red tomes: Steady demand from melee-focused players
- Green tomes: High demand for ranged builds
- Blue tomes: Moderate demand, spikes during expedition seasons
- Orange tomes: Very high demand (passive buffs are universally useful)
- Purple tomes: Extreme demand, very limited supply (boss-only drops)
