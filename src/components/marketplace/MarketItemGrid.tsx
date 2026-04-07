import { useMemo } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { useGameStore } from '../../store/useGameStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { RESOURCES } from '../../config/resources';
import { GEAR_TEMPLATES, GEAR_TEMPLATE_LIST } from '../../config/gear';
import { ABILITY_LIST, ABILITY_COLOR_HEX } from '../../config/abilities';
import type { AbilityColor } from '../../config/abilities';
import { CONSUMABLE_LIST } from '../../config/consumables';
import { TOOL_LIST } from '../../config/tools';
import type { MarketCategory } from '../../types/marketplace';
import { ItemIcon } from '../../utils/itemIcons';
import type { GearSlotCategory } from '../../types/equipment';

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export interface CatalogItem {
  id: string;
  name: string;
  category: MarketCategory;
  itemType: 'resource' | 'equipment' | 'ability' | 'consumable' | 'tool' | 'pass';
  sellPrice: number;
  color?: string;
  sortOrder?: number;
  slot?: string;
}

// Expedition pass data
const PASS_DATA = [
  { id: 'pass_outskirts', name: 'Outskirts Pass', sellValue: 50 },
  { id: 'pass_rust_belt', name: 'Rust Belt Pass', sellValue: 100 },
  { id: 'pass_dead_sector', name: 'Dead Sector Pass', sellValue: 200 },
  { id: 'pass_scorch_lands', name: 'Scorch Lands Pass', sellValue: 400 },
  { id: 'pass_fallout_core', name: 'Fallout Core Pass', sellValue: 700 },
  { id: 'pass_extinction_zone', name: 'Extinction Zone Pass', sellValue: 1200 },
  { id: 'pass_ground_zero', name: 'Ground Zero Pass', sellValue: 2000 },
];

// ═══════════════════════════════════════════
// CATALOG BUILDER
// ═══════════════════════════════════════════

export function buildCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];

  // Resources
  Object.values(RESOURCES).forEach((r, i) => {
    items.push({ id: r.id, name: r.name, category: 'resources', itemType: 'resource', sellPrice: r.sellValue, sortOrder: i });
  });

  // Consumables
  CONSUMABLE_LIST.forEach((c, i) => {
    items.push({ id: c.id, name: c.name, category: 'consumables', itemType: 'consumable', sellPrice: c.sellValue, sortOrder: i });
  });

  // Abilities
  const colorOrder: AbilityColor[] = ['red', 'green', 'blue', 'orange', 'purple'];
  const sortedAbilities = [...ABILITY_LIST].sort((a, b) => {
    const ci = colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
    if (ci !== 0) return ci;
    return (a.requirements[0]?.value || 0) - (b.requirements[0]?.value || 0);
  });
  sortedAbilities.forEach((a, i) => {
    const resReq = a.requirements[0]?.value || 1;
    items.push({ id: a.id, name: a.name, category: 'abilities', itemType: 'ability', sellPrice: Math.max(100, Math.floor(resReq * 100)), color: ABILITY_COLOR_HEX[a.color], sortOrder: i });
  });

  // Expedition Passes
  PASS_DATA.forEach((p, i) => {
    items.push({ id: p.id, name: p.name, category: 'expedition_passes', itemType: 'pass', sellPrice: p.sellValue, sortOrder: i });
  });

  // Equipment
  const equipSlots = ['weapon', 'armor', 'legs', 'gloves', 'boots', 'shield'];
  const equipTemplates = GEAR_TEMPLATE_LIST.filter(t => equipSlots.includes(t.slot));
  equipTemplates.sort((a, b) => {
    const si = equipSlots.indexOf(a.slot) - equipSlots.indexOf(b.slot);
    if (si !== 0) return si;
    return a.tier - b.tier;
  });
  const tierPrices = [0, 10, 50, 150, 400, 1000, 2500, 6000, 15000];
  equipTemplates.forEach((t, i) => {
    items.push({ id: t.id, name: t.name, category: 'equipment', itemType: 'equipment', sellPrice: tierPrices[t.tier] || 100, sortOrder: i, slot: t.slot });
  });

  // Accessories
  const accSlots = ['ring', 'earring', 'necklace'];
  const accTemplates = GEAR_TEMPLATE_LIST.filter(t => accSlots.includes(t.slot));
  accTemplates.sort((a, b) => {
    const si = accSlots.indexOf(a.slot) - accSlots.indexOf(b.slot);
    if (si !== 0) return si;
    return a.tier - b.tier;
  });
  accTemplates.forEach((t, i) => {
    items.push({ id: t.id, name: t.name, category: 'accessories', itemType: 'equipment', sellPrice: tierPrices[t.tier] || 100, sortOrder: i, slot: t.slot });
  });

  // Tools
  TOOL_LIST.forEach((t, i) => {
    items.push({ id: t.id, name: t.name, category: 'tools', itemType: 'tool', sellPrice: t.sellValue, sortOrder: i });
  });

  return items;
}

// ═══════════════════════════════════════════
// ICON HELPERS
// ═══════════════════════════════════════════

export function getCatalogIconProps(item: CatalogItem): { itemId: string; itemType: 'weapon' | 'armor' | 'accessory' | 'resource' | 'consumable' | 'tool' | 'hero' | 'equipment'; gearSlot?: GearSlotCategory } {
  if (item.itemType === 'resource') return { itemId: item.id, itemType: 'resource' };
  if (item.itemType === 'consumable') return { itemId: item.id, itemType: 'consumable' };
  if (item.itemType === 'tool') return { itemId: item.id, itemType: 'tool' };
  if (item.itemType === 'equipment') {
    const tmpl = GEAR_TEMPLATES[item.id];
    if (tmpl) return { itemId: item.id, itemType: 'equipment', gearSlot: tmpl.slot };
    return { itemId: item.id, itemType: 'equipment' };
  }
  return { itemId: item.id, itemType: 'resource' };
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

interface MarketItemGridProps {
  category: MarketCategory;
  subcategory: string | null;
  searchQuery: string;
  selectedItemId: string | null;
  onSelectItem: (itemId: string) => void;
}

export function MarketItemGrid({ category, subcategory, searchQuery, selectedItemId, onSelectItem }: MarketItemGridProps) {
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);
  const listings = useMarketStore(s => s.listings);
  const getPriceInfo = useMarketStore(s => s.getPriceInfo);

  const catalog = useMemo(() => buildCatalog(), []);

  const filteredItems = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return catalog.filter(i => i.name.toLowerCase().includes(q));
    }
    let items = catalog.filter(i => i.category === category);
    if (subcategory) {
      items = items.filter(i => {
        if (i.itemType === 'equipment') {
          const tmpl = GEAR_TEMPLATES[i.id];
          return tmpl && tmpl.slot === subcategory;
        }
        return true;
      });
    }
    return items.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [catalog, category, subcategory, searchQuery]);

  function getAmount(item: CatalogItem): number {
    if (item.itemType === 'equipment') return inventory.filter(g => g.templateId === item.id).length;
    return resources[item.id] || 0;
  }

  function getInStock(item: CatalogItem): number {
    return listings.filter(l => l.itemId === item.id && l.expiresAt > Date.now()).reduce((s, l) => s + l.quantity, 0);
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
      <div style={{ fontSize: 10, marginBottom: 6, color: 'var(--color-text-muted)' }}>
        {searchQuery ? `Search: "${searchQuery}" (${filteredItems.length} results)` : `${filteredItems.length} items`}
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '32px 1fr 70px 70px 50px',
        padding: '4px 6px', fontSize: 9, fontWeight: 'bold', color: 'var(--color-text-muted)',
        borderBottom: '1px solid var(--color-border)', gap: 4, textTransform: 'uppercase',
      }}>
        <span />
        <span>Item</span>
        <span style={{ textAlign: 'right' }}>Base</span>
        <span style={{ textAlign: 'right' }}>Current</span>
        <span style={{ textAlign: 'right' }}>Stock</span>
      </div>

      {/* Rows */}
      {filteredItems.map(item => {
        const isSelected = selectedItemId === item.id;
        const iconProps = getCatalogIconProps(item);
        const stock = getInStock(item);
        const owned = getAmount(item);
        const priceInfo = getPriceInfo(item.id, item.category);
        const currentPrice = priceInfo.basePrice;
        const delta = currentPrice - item.sellPrice;

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 70px 70px 50px',
              padding: '5px 6px', cursor: 'pointer', alignItems: 'center', gap: 4,
              backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'transparent',
              borderBottom: '1px solid rgba(55,65,81,0.3)',
              borderLeft: isSelected ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = isSelected ? 'var(--color-bg-tertiary)' : 'transparent'; }}
          >
            <ItemIcon {...iconProps} size={28} fallbackColor={item.color || '#4a5568'} fallbackLabel={item.name.charAt(0)} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 'bold', color: item.color || 'var(--color-text-primary)', lineHeight: 1.2 }}>
                {item.name}
              </div>
              {owned > 0 && (
                <div style={{ fontSize: 9, color: 'var(--color-accent)' }}>Owned: {owned}</div>
              )}
            </div>
            <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--color-text-muted)' }}>
              {item.sellPrice.toLocaleString()}
            </div>
            <div style={{ textAlign: 'right', fontSize: 10 }}>
              <span style={{ color: delta > 0 ? '#22c55e' : delta < 0 ? '#ef4444' : 'var(--color-text-primary)' }}>
                {currentPrice.toLocaleString()}
              </span>
            </div>
            <div style={{ textAlign: 'right', fontSize: 10, color: stock > 0 ? '#22c55e' : 'var(--color-text-muted)' }}>
              {stock}
            </div>
          </div>
        );
      })}

      {filteredItems.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
          No items found.
        </div>
      )}
    </div>
  );
}
