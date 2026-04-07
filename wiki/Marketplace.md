# Marketplace

A **BDO-style marketplace** with listings, purchase orders, price bands, and anti-manipulation mechanics.

---

## Overview

- **Tax Rate**: 5% on all sales
- **Listing Duration**: 48 hours
- **Purchase Order Duration**: 7 days
- **Price Updates**: Dynamic, based on supply/demand

---

## Selling (Listings)

1. Set a price within the allowed price band
2. If a matching Purchase Order exists with `bidPrice >= listPrice`, sale executes immediately
3. Multiple matching POs at the same price: winner chosen by **lottery** (anti-manipulation)
4. Remaining quantity becomes a market listing
5. Seller receives: `salePrice - (salePrice × 0.05)` (5% tax)

---

## Buying (Purchase Orders)

1. Place a bid within the allowed price band
2. WC is **escrowed** (locked) immediately
3. If matching listings exist with `pricePerUnit <= bidPrice`, sale executes immediately (cheapest first)
4. Remaining quantity waits as an active PO
5. Can cancel PO to get escrow back

---

## Price Mechanics

### Base Price Calculation
| Item Type | Base Price Formula |
|-----------|-------------------|
| Resources | `resource.sellValue × 3` |
| Equipment | `tierMultiplier[tier] × rarityMultiplier` |
| Consumables | 20 WC |
| Abilities | 500 WC |
| Expedition Passes | 200 WC |
| Tools | 100 WC |

### Equipment Tier Multipliers
| Tier | Multiplier |
|------|-----------|
| T1 | 50 |
| T2 | 150 |
| T3 | 400 |
| T4 | 1,000 |
| T5 | 2,500 |
| T6 | 6,000 |
| T7 | 15,000 |
| T8 | 40,000 |

### Rarity Multipliers
| Rarity | Multiplier |
|--------|-----------|
| Common | 1× |
| Rare | 2.5× |
| Unique | 6× |
| Plague | 15× |

### Price Bands
- **Min Price**: `max(devFloor, floor(basePrice × 0.85))` (−15%)
- **Max Price**: `min(devCeiling, ceil(basePrice × 1.15))` (+15%)
- **Dev Floor**: 50% of base price (absolute minimum)
- **Dev Ceiling**: 300% of base price (absolute maximum)

### Dynamic Price Adjustment
After each sale:
- Sold at ≥ 98% of max → base price increases 2%
- Sold at ≤ 102% of min → base price decreases 2%
- Otherwise → no change

---

## Bot/NPC Floor

- 1–3 bot Purchase Orders per item type
- Bots bid at base price
- Provides price floor support to prevent crashes

---

## Anti-Manipulation

- **Lottery system**: Equal highest bids resolved randomly (prevents predetermined trades)
- **Price bands**: ±15% with hard dev caps
- **Escrow**: All PO funds locked immediately
- **Transaction logging**: All trades logged with metadata for audit
- **Rate limiting**: Per-item-type acquisition tracking
