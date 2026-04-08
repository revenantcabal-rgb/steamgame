import { useState, useMemo } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { useGameStore } from '../../store/useGameStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { RESOURCES } from '../../config/resources';
import { GEAR_TEMPLATES } from '../../config/gear';
import { ABILITIES, ABILITY_COLOR_HEX, ABILITY_COLOR_LABELS } from '../../config/abilities';
import { CONSUMABLES } from '../../config/consumables';
import { TOOLS } from '../../config/tools';
import { calculateTax } from '../../engine/MarketEngine';
import { MARKET_TAX_RATE } from '../../types/marketplace';
import type { MarketCategory } from '../../types/marketplace';
import { ItemIcon } from '../../utils/itemIcons';
import { MarketPriceChart } from './MarketPriceChart';
import type { CatalogItem } from './MarketItemGrid';
import { getCatalogIconProps } from './MarketItemGrid';

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════

const STAT_LABELS: Record<string, string> = {
  str: 'STR', dex: 'DEX', int: 'INT', con: 'CON', per: 'PER', luk: 'LUK', res: 'RES',
  meleeAttack: 'Melee Attack', rangedAttack: 'Ranged Attack', blastAttack: 'Blast Attack',
  defense: 'Defense', maxHp: 'Max HP', critChance: 'Crit Chance', critDamage: 'Crit Damage',
  turnSpeed: 'Turn Speed', hpRegen: 'HP Regen', statusResist: 'Status Resist',
  accuracy: 'Accuracy', evasion: 'Evasion', blockChance: 'Block Chance', selfDamage: 'Self Damage',
  abilityPower: 'Ability Power',
};

const SKILL_LABELS: Record<string, string> = {
  scavenging: 'Scavenging', foraging: 'Foraging', salvage_hunting: 'Salvage Hunting',
  water_reclamation: 'Water Reclamation', prospecting: 'Prospecting',
  cooking: 'Cooking', tinkering: 'Tinkering', weaponsmithing: 'Weaponsmithing',
  armorcrafting: 'Armorcrafting', biochemistry: 'Biochemistry',
};

const SLOT_LABELS: Record<string, string> = {
  weapon: 'Weapon', shield: 'Shield', armor: 'Body Armor', legs: 'Leg Armor',
  gloves: 'Gloves', boots: 'Boots', ring: 'Ring', earring: 'Earring', necklace: 'Necklace',
};

const TREND_COLORS = { rising: '#e74c3c', falling: '#3498db', stable: '#9ca3af' };
const TREND_ICONS = { rising: '\u25B2', falling: '\u25BC', stable: '\u25CF' };

// ═══════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════

function InfoLine({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: label ? 'space-between' : 'flex-end', fontSize: '11px', marginBottom: '2px', gap: '8px' }}>
      {label && <span style={{ color: '#78909c' }}>{label}</span>}
      <span style={{ color: valueColor || 'var(--color-text-primary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function StatLine({ label, value, isPercent, isDownside }: { label: string; value: number; isPercent: boolean; isDownside?: boolean }) {
  const sign = isDownside ? '' : (value > 0 ? '+' : '');
  const color = isDownside ? '#ef4444' : value > 0 ? '#22c55e' : value < 0 ? '#ef4444' : 'var(--color-text-primary)';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
      <span style={{ color: '#78909c' }}>{label}</span>
      <span style={{ color, fontWeight: 'bold' }}>{sign}{value}{isPercent ? '%' : ''}</span>
    </div>
  );
}

function Sep() {
  return <div style={{ borderBottom: '1px solid #374151', margin: '6px 0' }} />;
}

// Expedition pass data
const PASS_DATA = [
  { id: 'pass_outskirts', name: 'Outskirts Pass', description: 'Required entry pass for the Outskirts combat zone.', zone: 'Outskirts', level: 1, sellValue: 50 },
  { id: 'pass_rust_belt', name: 'Rust Belt Pass', description: 'Required entry pass for the Rust Belt combat zone.', zone: 'Rust Belt', level: 15, sellValue: 100 },
  { id: 'pass_dead_sector', name: 'Dead Sector Pass', description: 'Required entry pass for the Dead Sector combat zone.', zone: 'Dead Sector', level: 30, sellValue: 200 },
  { id: 'pass_scorch_lands', name: 'Scorch Lands Pass', description: 'Required entry pass for the Scorch Lands combat zone.', zone: 'Scorch Lands', level: 45, sellValue: 400 },
  { id: 'pass_fallout_core', name: 'Fallout Core Pass', description: 'Required entry pass for the Fallout Core combat zone.', zone: 'Fallout Core', level: 60, sellValue: 700 },
  { id: 'pass_extinction_zone', name: 'Extinction Zone Pass', description: 'Required entry pass for the Extinction Zone.', zone: 'Extinction Zone', level: 80, sellValue: 1200 },
  { id: 'pass_ground_zero', name: 'Ground Zero Pass', description: 'Required entry pass for Ground Zero. The final challenge.', zone: 'Ground Zero', level: 95, sellValue: 2000 },
];

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

interface MarketItemDetailProps {
  item: CatalogItem;
}

export function MarketItemDetail({ item }: MarketItemDetailProps) {
  const getPriceInfo = useMarketStore(s => s.getPriceInfo);
  const listItem = useMarketStore(s => s.listItem);
  const placePurchaseOrder = useMarketStore(s => s.placePurchaseOrder);
  const ensureBotPOs = useMarketStore(s => s.ensureBotPOs);
  const listings = useMarketStore(s => s.listings);
  const purchaseOrders = useMarketStore(s => s.purchaseOrders);
  const priceSnapshots = useMarketStore(s => s.priceSnapshots);
  const history = useMarketStore(s => s.history);
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);

  const priceInfo = getPriceInfo(item.id, item.category);
  const iconProps = getCatalogIconProps(item);
  const snapshot = priceSnapshots[item.id];

  // Ensure bot POs exist for this item
  useMemo(() => {
    ensureBotPOs(item.id, item.name, item.category);
  }, [item.id]);

  // Count stats
  const inStock = listings.filter(l => l.itemId === item.id && l.expiresAt > Date.now()).reduce((s, l) => s + l.quantity, 0);
  const totalTrades = history.filter(t => t.itemId === item.id).length;
  const itemPOs = purchaseOrders.filter(po => po.itemId === item.id && po.expiresAt > Date.now());

  // Price ladder data — distinguish player vs NPC buyers
  const priceLadder = useMemo(() => {
    const ladder: { price: number; listed: number; buyers: number; npcBuyers: number }[] = [];
    const step = Math.max(1, Math.floor((priceInfo.maxPrice - priceInfo.minPrice) / 8));
    for (let p = priceInfo.maxPrice; p >= priceInfo.minPrice; p -= step) {
      const listed = listings.filter(l => l.itemId === item.id && l.pricePerUnit === p && l.expiresAt > Date.now()).reduce((s, l) => s + l.quantity, 0);
      const matchingPOs = itemPOs.filter(po => po.bidPrice === p);
      const buyers = matchingPOs.reduce((s, po) => s + (po.quantity - po.quantityFilled), 0);
      const npcBuyers = matchingPOs.filter(po => po.isBot).reduce((s, po) => s + (po.quantity - po.quantityFilled), 0);
      ladder.push({ price: p, listed, buyers, npcBuyers });
    }
    return ladder;
  }, [priceInfo, listings, itemPOs, item.id]);

  // Player amount
  const playerAmount = item.itemType === 'equipment'
    ? inventory.filter(g => g.templateId === item.id).length
    : (resources[item.id] || 0);

  return (
    <div style={{
      width: 300, minWidth: 300, borderLeft: '1px solid var(--color-border)',
      backgroundColor: '#111827', overflowY: 'auto',
    }}>
      <div style={{ padding: 12 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <ItemIcon {...iconProps} size={40} fallbackColor={item.color || '#4a5568'} fallbackLabel={item.name.charAt(0)} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 'bold', color: item.color || '#fff' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Owned: {playerAmount}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 8 }}>
          <InfoLine label="In Stock" value={`${inStock}`} valueColor={inStock > 0 ? '#22c55e' : 'var(--color-text-muted)'} />
          <InfoLine label="Base Price" value={`${priceInfo.basePrice.toLocaleString()} WC`} />
          <InfoLine label="Recent" value={snapshot?.lastSalePrice ? `${snapshot.lastSalePrice.toLocaleString()} WC` : '-'} />
          <InfoLine label="Total Trades" value={`${totalTrades}`} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
          <span style={{ color: '#78909c' }}>Trend</span>
          <span style={{ color: TREND_COLORS[priceInfo.trend], fontWeight: 'bold' }}>
            {TREND_ICONS[priceInfo.trend]} {priceInfo.trend}
          </span>
        </div>

        <InfoLine label="Price Range" value={`${priceInfo.minPrice.toLocaleString()} - ${priceInfo.maxPrice.toLocaleString()} WC`} />

        <Sep />

        {/* Price Chart */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
          Price History
        </div>
        <MarketPriceChart data={snapshot?.priceHistory || []} width={276} height={80} />

        <Sep />

        {/* Price Ladder */}
        <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
          Price Ladder
        </div>
        <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
          {priceLadder.map((row, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 40px',
              fontSize: 11, padding: '2px 4px', alignItems: 'center',
              backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
            }}>
              <span style={{ color: row.listed > 0 ? '#ef4444' : 'var(--color-text-muted)', textAlign: 'left' }}>
                {row.listed > 0 ? `${row.listed}` : '-'}
              </span>
              <span style={{
                textAlign: 'center', fontWeight: 'bold',
                color: row.price > priceInfo.basePrice ? '#ef4444' : row.price < priceInfo.basePrice ? '#22c55e' : '#fff',
              }}>
                {row.price.toLocaleString()}
              </span>
              <span style={{ color: row.buyers > 0 ? '#22c55e' : 'var(--color-text-muted)', textAlign: 'right' }}>
                {row.buyers > 0 ? (
                  row.npcBuyers > 0 && row.npcBuyers === row.buyers
                    ? <span title="NPC floor buyers">{row.buyers}<span style={{ fontSize: 8, opacity: 0.6 }}> npc</span></span>
                    : row.npcBuyers > 0
                      ? <span title={`${row.npcBuyers} NPC`}>{row.buyers}<span style={{ fontSize: 8, opacity: 0.6 }}> +{row.npcBuyers}n</span></span>
                      : `${row.buyers}`
                ) : '-'}
              </span>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 40px', fontSize: 11, padding: '2px 4px', color: 'var(--color-text-muted)' }}>
            <span>Sellers</span>
            <span style={{ textAlign: 'center' }}>Price</span>
            <span style={{ textAlign: 'right' }}>Buyers</span>
          </div>
        </div>

        <Sep />

        {/* Type-specific info */}
        {item.itemType === 'resource' && <ResourceInfo id={item.id} />}
        {item.itemType === 'equipment' && <EquipmentInfo id={item.id} />}
        {item.itemType === 'ability' && <AbilityInfo id={item.id} />}
        {item.itemType === 'consumable' && <ConsumableInfo id={item.id} />}
        {item.itemType === 'tool' && <ToolInfo id={item.id} />}
        {item.itemType === 'pass' && <PassInfo id={item.id} />}

        <Sep />

        {/* Purchase Form */}
        <PurchaseForm item={item} priceInfo={priceInfo} />

        <Sep />

        {/* Sell Form */}
        {playerAmount > 0 && (
          <SellForm item={item} priceInfo={priceInfo} playerAmount={playerAmount} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PURCHASE FORM
// ═══════════════════════════════════════════

function PurchaseForm({ item, priceInfo }: { item: CatalogItem; priceInfo: ReturnType<typeof useMarketStore.getState>['getPriceInfo'] extends (a: any, b: any) => infer R ? R : never }) {
  const [buyPrice, setBuyPrice] = useState(priceInfo.basePrice);
  const [buyQty, setBuyQty] = useState(1);
  const placePurchaseOrder = useMarketStore(s => s.placePurchaseOrder);
  const playerWC = useGameStore(s => s.resources['wasteland_credits'] || 0);

  const totalCost = buyPrice * buyQty;

  const handleBuy = () => {
    if (buyQty <= 0 || buyPrice <= 0) return;
    placePurchaseOrder(item.id, item.name, item.category, buyPrice, buyQty);
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
        Purchase
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Desired Price</label>
          <div style={{ display: 'flex', gap: 2 }}>
            <button
              onClick={() => setBuyPrice(priceInfo.minPrice)}
              style={{ fontSize: 11, padding: '2px 4px', border: 'none', borderRadius: 2, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >MIN</button>
            <input
              type="number"
              value={buyPrice}
              onChange={e => setBuyPrice(Math.max(priceInfo.minPrice, Math.min(priceInfo.maxPrice, parseInt(e.target.value) || 0)))}
              min={priceInfo.minPrice}
              max={priceInfo.maxPrice}
              style={{ flex: 1, width: '100%', padding: '3px 4px', fontSize: 11, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 2 }}
            />
            <button
              onClick={() => setBuyPrice(priceInfo.maxPrice)}
              style={{ fontSize: 11, padding: '2px 4px', border: 'none', borderRadius: 2, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', cursor: 'pointer' }}
            >MAX</button>
          </div>
        </div>
        <div style={{ width: 60 }}>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Amount</label>
          <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <button onClick={() => setBuyQty(Math.max(1, buyQty - 1))} style={{ fontSize: 11, padding: '2px 5px', border: 'none', borderRadius: 2, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>-</button>
            <input type="number" value={buyQty} onChange={e => setBuyQty(Math.max(1, parseInt(e.target.value) || 1))} min={1}
              style={{ width: 28, textAlign: 'center', padding: '3px 2px', fontSize: 11, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 2 }} />
            <button onClick={() => setBuyQty(buyQty + 1)} style={{ fontSize: 11, padding: '2px 5px', border: 'none', borderRadius: 2, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}>+</button>
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
        Total: <b style={{ color: 'var(--color-accent)' }}>{totalCost.toLocaleString()} WC</b>
        <span style={{ marginLeft: 8 }}>After: {(playerWC - totalCost).toLocaleString()} WC</span>
      </div>
      <button
        onClick={handleBuy}
        disabled={totalCost > playerWC || buyQty <= 0}
        style={{
          width: '100%', padding: '6px 0', border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 'bold',
          cursor: totalCost > playerWC ? 'not-allowed' : 'pointer',
          backgroundColor: totalCost > playerWC ? '#374151' : 'var(--color-accent)',
          color: totalCost > playerWC ? 'var(--color-text-muted)' : '#000',
        }}
      >
        {totalCost > playerWC ? 'Not enough WC' : 'Buy'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// SELL FORM
// ═══════════════════════════════════════════

function SellForm({ item, priceInfo, playerAmount }: { item: CatalogItem; priceInfo: any; playerAmount: number }) {
  const [sellPrice, setSellPrice] = useState(priceInfo.basePrice);
  const [sellQty, setSellQty] = useState(1);
  const listItem = useMarketStore(s => s.listItem);

  const totalRevenue = sellPrice * sellQty;
  const tax = calculateTax(totalRevenue);
  const receives = totalRevenue - tax;

  const handleSell = () => {
    if (sellQty <= 0 || sellQty > playerAmount) return;

    // Deduct from player inventory
    if (item.itemType === 'resource' || item.itemType === 'consumable' || item.itemType === 'tool' || item.itemType === 'ability' || item.itemType === 'pass') {
      const resources = { ...useGameStore.getState().resources };
      resources[item.id] = (resources[item.id] || 0) - sellQty;
      useGameStore.setState({ resources });
    }
    // For equipment, handled differently (need gear instance)

    listItem(item.id, item.name, item.category, sellQty, sellPrice);
  };

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
        Sell (You have {playerAmount})
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Price per unit</label>
          <input
            type="number"
            value={sellPrice}
            onChange={e => setSellPrice(Math.max(priceInfo.minPrice, Math.min(priceInfo.maxPrice, parseInt(e.target.value) || 0)))}
            min={priceInfo.minPrice}
            max={priceInfo.maxPrice}
            style={{ width: '100%', padding: '3px 4px', fontSize: 11, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 2 }}
          />
        </div>
        <div style={{ width: 60 }}>
          <label style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Qty</label>
          <input
            type="number"
            value={sellQty}
            onChange={e => setSellQty(Math.max(1, Math.min(playerAmount, parseInt(e.target.value) || 1)))}
            min={1}
            max={playerAmount}
            style={{ width: '100%', padding: '3px 4px', fontSize: 11, backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 2 }}
          />
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>
        Total: {totalRevenue.toLocaleString()} WC | Tax ({(MARKET_TAX_RATE * 100).toFixed(0)}%): {tax.toLocaleString()} | <b style={{ color: '#22c55e' }}>Receive: {receives.toLocaleString()} WC</b>
      </div>
      <button
        onClick={handleSell}
        disabled={sellQty <= 0 || sellQty > playerAmount}
        style={{
          width: '100%', padding: '6px 0', border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 'bold',
          cursor: sellQty > playerAmount ? 'not-allowed' : 'pointer',
          backgroundColor: '#8b7a2d', color: '#fff',
        }}
      >
        List for Sale
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// TYPE-SPECIFIC INFO SECTIONS
// ═══════════════════════════════════════════

function ResourceInfo({ id }: { id: string }) {
  const res = RESOURCES[id];
  if (!res) return null;
  return (
    <>
      <InfoLine label="Type" value="Resource" valueColor="#4fc3f7" />
      <InfoLine label="Source" value={SKILL_LABELS[res.sourceSkillId] || res.sourceSkillId} />
      <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', marginTop: '4px' }}>{res.description}</div>
    </>
  );
}

function EquipmentInfo({ id }: { id: string }) {
  const t = GEAR_TEMPLATES[id];
  if (!t) return null;
  const typeLabel = t.slot === 'weapon'
    ? (t.isTwoHanded ? 'Two Hand' : 'One Hand')
    : (t.statFocusRing ? 'Stat Focus Ring' : (SLOT_LABELS[t.slot] || t.slot));

  return (
    <>
      <InfoLine label="Type" value={typeLabel} valueColor="#4fc3f7" />
      <InfoLine label="Tier" value={`T${t.tier}`} />
      <InfoLine label="Level Required" value={`${t.levelReq}`} />
      {t.statRequirements.map((req: any, i: number) => (
        <InfoLine key={i} label="Requires" value={`${req.value} ${STAT_LABELS[req.stat] || req.stat}`} />
      ))}
      {t.weaponType && <InfoLine label="Combat Style" value={t.weaponType.charAt(0).toUpperCase() + t.weaponType.slice(1)} />}
      {t.statFocusRing && (
        <InfoLine label="XP Focus" value={
          t.statFocusRing.isDual
            ? `${STAT_LABELS[t.statFocusRing.primaryStat]} / ${STAT_LABELS[t.statFocusRing.secondaryStat!]} (50/50)`
            : `${STAT_LABELS[t.statFocusRing.primaryStat]} (70/30)`
        } valueColor="#f59e0b" />
      )}
      {t.setId && (
        <InfoLine label="Set" value={t.setId.replace('set_', '').replace(/^\w/, (c: string) => c.toUpperCase()) + "'s Set"} valueColor="#22c55e" />
      )}
      <Sep />
      {t.baseStats.map((s: any, i: number) => (
        <StatLine key={i} label={STAT_LABELS[s.stat] || s.stat} value={s.value} isPercent={s.isPercentage} />
      ))}
      {t.inherentDownside && (
        <StatLine label={STAT_LABELS[t.inherentDownside.stat] || t.inherentDownside.stat} value={t.inherentDownside.value} isPercent={t.inherentDownside.isPercentage} isDownside />
      )}
    </>
  );
}

function AbilityInfo({ id }: { id: string }) {
  const a = ABILITIES[id];
  if (!a) return null;
  return (
    <>
      <InfoLine label="Type" value={ABILITY_COLOR_LABELS[a.color]} valueColor={ABILITY_COLOR_HEX[a.color]} />
      <InfoLine label="Requires" value={a.requirements.map((r: any) => `${r.value} ${STAT_LABELS[r.stat] || r.stat}`).join(', ')} />
      <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', margin: '4px 0' }}>{a.description}</div>
      {a.cooldown > 0 && <InfoLine label="Cooldown" value={`${a.cooldown} turns`} />}
    </>
  );
}

function ConsumableInfo({ id }: { id: string }) {
  const c = CONSUMABLES[id];
  if (!c) return null;
  const typeLabel = c.type === 'food' ? 'Food' : c.type === 'medicine' ? 'Medicine' : 'Chemical';
  return (
    <>
      <InfoLine label="Type" value={`Consumable (${typeLabel})`} valueColor="#4fc3f7" />
      {c.duration > 0 && <InfoLine label="Duration" value={`${c.duration}s`} />}
      <InfoLine label="Cooldown" value={`${c.cooldown}s`} />
      <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: 'bold', marginBottom: '4px' }}>{c.effect}</div>
    </>
  );
}

function ToolInfo({ id }: { id: string }) {
  const t = TOOLS[id];
  if (!t) return null;
  return (
    <>
      <InfoLine label="Type" value={`${SKILL_LABELS[t.targetSkillId] || t.targetSkillId} Tool`} valueColor="#4fc3f7" />
      <InfoLine label="Requires" value={`${t.levelReq} ${SKILL_LABELS[t.targetSkillId] || t.targetSkillId}`} />
      <StatLine label={`${SKILL_LABELS[t.targetSkillId]} Speed`} value={t.speedBonus} isPercent />
      <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', margin: '4px 0' }}>{t.description}</div>
    </>
  );
}

function PassInfo({ id }: { id: string }) {
  const p = PASS_DATA.find(pass => pass.id === id);
  if (!p) return null;
  return (
    <>
      <InfoLine label="Type" value="Expedition Pass" valueColor="#4fc3f7" />
      <InfoLine label="Zone" value={p.zone} />
      <InfoLine label="Min Level" value={`${p.level}`} />
      <div style={{ fontSize: '11px', color: '#9ca3af', fontStyle: 'italic', margin: '4px 0' }}>{p.description}</div>
    </>
  );
}
