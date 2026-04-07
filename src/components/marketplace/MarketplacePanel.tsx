import { useState, useMemo } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { useGameStore } from '../../store/useGameStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { RESOURCES } from '../../config/resources';
import { GEAR_TEMPLATES, GEAR_TEMPLATE_LIST } from '../../config/gear';
import { ABILITIES, ABILITY_LIST, ABILITY_COLOR_HEX, ABILITY_COLOR_LABELS } from '../../config/abilities';
import type { AbilityColor } from '../../config/abilities';
import { CONSUMABLES, CONSUMABLE_LIST } from '../../config/consumables';
import { TOOLS, TOOL_LIST } from '../../config/tools';
import { MARKET_CATEGORY_LABELS } from '../../types/marketplace';
import type { MarketCategory } from '../../types/marketplace';

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

const CATEGORY_COLORS: Record<MarketCategory, string> = {
  resources: '#8B6914', consumables: '#2d8b2d', abilities: '#6b2d8b',
  expedition_passes: '#8b2d2d', equipment: '#4a5568', accessories: '#8b7a2d', tools: '#2d6b6b',
};

const TREND_COLORS = { rising: '#e74c3c', falling: '#3498db', stable: '#9ca3af' };
const TREND_ICONS = { rising: '\u25B2', falling: '\u25BC', stable: '\u25CF' };

// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

interface CatalogItem {
  id: string;
  name: string;
  category: MarketCategory;
  itemType: 'resource' | 'equipment' | 'ability' | 'consumable' | 'tool' | 'pass';
  sellPrice: number;
  color?: string;
  sortOrder?: number;
}

// Expedition pass data (hardcoded since they're simple)
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
// CATALOG BUILDER
// ═══════════════════════════════════════════

function buildCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];

  // Resources
  Object.values(RESOURCES).forEach((r, i) => {
    items.push({ id: r.id, name: r.name, category: 'resources', itemType: 'resource', sellPrice: r.sellValue, sortOrder: i });
  });

  // Consumables
  CONSUMABLE_LIST.forEach((c, i) => {
    items.push({ id: c.id, name: c.name, category: 'consumables', itemType: 'consumable', sellPrice: c.sellValue, sortOrder: i });
  });

  // Abilities (sorted by color then RES req)
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

  // Equipment (weapons, armor, legs, gloves, boots, shields)
  const equipSlots = ['weapon', 'armor', 'legs', 'gloves', 'boots', 'shield'];
  const equipTemplates = GEAR_TEMPLATE_LIST.filter(t => equipSlots.includes(t.slot));
  equipTemplates.sort((a, b) => {
    const si = equipSlots.indexOf(a.slot) - equipSlots.indexOf(b.slot);
    if (si !== 0) return si;
    return a.tier - b.tier;
  });
  const tierPrices = [0, 10, 50, 150, 400, 1000, 2500, 6000, 15000];
  equipTemplates.forEach((t, i) => {
    items.push({ id: t.id, name: t.name, category: 'equipment', itemType: 'equipment', sellPrice: tierPrices[t.tier] || 100, sortOrder: i });
  });

  // Accessories (rings, earrings, necklaces)
  const accSlots = ['ring', 'earring', 'necklace'];
  const accTemplates = GEAR_TEMPLATE_LIST.filter(t => accSlots.includes(t.slot));
  accTemplates.sort((a, b) => {
    const si = accSlots.indexOf(a.slot) - accSlots.indexOf(b.slot);
    if (si !== 0) return si;
    return a.tier - b.tier;
  });
  accTemplates.forEach((t, i) => {
    items.push({ id: t.id, name: t.name, category: 'accessories', itemType: 'equipment', sellPrice: tierPrices[t.tier] || 100, sortOrder: i });
  });

  // Tools
  TOOL_LIST.forEach((t, i) => {
    items.push({ id: t.id, name: t.name, category: 'tools', itemType: 'tool', sellPrice: t.sellValue, sortOrder: i });
  });

  return items;
}

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
  const sign = isDownside ? (value > 0 ? '' : '') : (value > 0 ? '+' : '');
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

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════

type MarketView = 'browse' | 'my_listings' | 'history' | 'sell';

export function MarketplacePanel() {
  const [view, setView] = useState<MarketView>('browse');
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('resources');
  const [searchQuery, setSearchQuery] = useState('');
  const playerWC = useGameStore(s => s.resources['wasteland_credits'] || 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Wasteland Exchange</h2>
          <div className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
            {playerWC.toLocaleString()} WC
          </div>
        </div>
        {/* View tabs */}
        <div className="flex gap-1 mb-2">
          {([['browse', 'Market Listings'], ['sell', 'Sell Items'], ['my_listings', 'My Listings'], ['history', 'Market History']] as [MarketView, string][]).map(([v, label]) => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
              style={{ backgroundColor: view === v ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: view === v ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
              {label}
            </button>
          ))}
        </div>
        {/* Search */}
        {view === 'browse' && (
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full p-2 rounded text-sm"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {view === 'browse' && <BrowseView category={selectedCategory} setCategory={setSelectedCategory} searchQuery={searchQuery} />}
        {view === 'sell' && <SellView />}
        {view === 'my_listings' && <MyListingsView />}
        {view === 'history' && <HistoryView />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// BROWSE VIEW - Full item catalog grid
// ═══════════════════════════════════════════

function BrowseView({ category, setCategory, searchQuery }: { category: MarketCategory; setCategory: (c: MarketCategory) => void; searchQuery: string }) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);

  const catalog = useMemo(() => buildCatalog(), []);

  const filteredItems = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return catalog.filter(i => i.name.toLowerCase().includes(q));
    }
    return catalog.filter(i => i.category === category).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [catalog, category, searchQuery]);

  const selectedItem = filteredItems.find(i => i.id === selectedItemId) || null;

  function getAmount(item: CatalogItem): number {
    if (item.itemType === 'equipment') return inventory.filter(g => g.templateId === item.id).length;
    return resources[item.id] || 0;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Category tabs */}
      <div className="flex gap-1 p-2 shrink-0 flex-wrap" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {(Object.keys(MARKET_CATEGORY_LABELS) as MarketCategory[]).map(cat => (
          <button key={cat} onClick={() => { setCategory(cat); setSelectedItemId(null); }}
            className="px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: category === cat ? CATEGORY_COLORS[cat] : 'var(--color-bg-tertiary)',
              color: category === cat ? '#fff' : 'var(--color-text-muted)',
              border: category === cat ? `1px solid ${CATEGORY_COLORS[cat]}` : '1px solid transparent',
              opacity: category === cat ? 1 : 0.7,
            }}>
            {MARKET_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {searchQuery ? `Search: "${searchQuery}" (${filteredItems.length} results)` : `${MARKET_CATEGORY_LABELS[category]} (${filteredItems.length} items)`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(95px, 1fr))', gap: '4px' }}>
            {filteredItems.map(item => {
              const amt = getAmount(item);
              const isSelected = selectedItemId === item.id;
              return (
                <div key={item.id} onClick={() => setSelectedItemId(item.id)}
                  style={{
                    padding: '6px', borderRadius: '4px', cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                    border: isSelected ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    minHeight: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    transition: 'border-color 0.1s',
                  }}>
                  <div style={{
                    fontSize: '10px', fontWeight: 'bold',
                    color: item.color || 'var(--color-text-primary)',
                    lineHeight: '1.2', overflow: 'hidden', maxHeight: '2.4em',
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontSize: '10px', textAlign: 'right',
                    color: amt > 0 ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    fontWeight: amt > 0 ? 'bold' : 'normal',
                  }}>
                    {amt > 0 ? amt.toLocaleString() : '\u00A0'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="shrink-0 overflow-y-auto" style={{ width: '280px', borderLeft: '1px solid var(--color-border)', backgroundColor: '#111827' }}>
          {selectedItem ? (
            <ItemDetailPanel item={selectedItem} amount={getAmount(selectedItem)} />
          ) : (
            <div className="p-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Click an item to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ITEM DETAIL PANEL
// ═══════════════════════════════════════════

function ItemDetailPanel({ item, amount }: { item: CatalogItem; amount: number }) {
  const getPriceInfo = useMarketStore(s => s.getPriceInfo);
  const priceInfo = getPriceInfo(item.id, item.category);

  return (
    <div style={{ padding: '12px' }}>
      {/* Name */}
      <div style={{ fontSize: '14px', fontWeight: 'bold', color: item.color || '#fff', marginBottom: '6px' }}>
        {item.name}
      </div>
      <InfoLine label="Amount" value={amount.toLocaleString()} />
      <InfoLine label="Sell Price" value={`${item.sellPrice.toLocaleString()}`} />
      <Sep />

      {/* Type-specific info */}
      {item.itemType === 'resource' && <ResourceInfo id={item.id} />}
      {item.itemType === 'equipment' && <EquipmentInfo id={item.id} />}
      {item.itemType === 'ability' && <AbilityInfo id={item.id} />}
      {item.itemType === 'consumable' && <ConsumableInfo id={item.id} />}
      {item.itemType === 'tool' && <ToolInfo id={item.id} />}
      {item.itemType === 'pass' && <PassInfo id={item.id} />}

      {/* Market info */}
      <Sep />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Market Info</div>
      <InfoLine label="Base Price" value={`${priceInfo.basePrice.toLocaleString()} WC`} />
      <InfoLine label="Price Range" value={`${priceInfo.minPrice.toLocaleString()} / ${priceInfo.maxPrice.toLocaleString()} WC`} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
        <span style={{ color: '#78909c' }}>Trend</span>
        <span style={{ color: TREND_COLORS[priceInfo.trend], fontWeight: 'bold' }}>
          {TREND_ICONS[priceInfo.trend]} {priceInfo.trend}
        </span>
      </div>
    </div>
  );
}

// --- Resource detail ---
function ResourceInfo({ id }: { id: string }) {
  const res = RESOURCES[id];
  if (!res) return null;
  return (
    <>
      <InfoLine label="Type" value="Resource" valueColor="#4fc3f7" />
      <InfoLine label="Source" value={SKILL_LABELS[res.sourceSkillId] || res.sourceSkillId} />
      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', marginTop: '4px' }}>{res.description}</div>
    </>
  );
}

// --- Equipment detail ---
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
      {t.statRequirements.map((req, i) => (
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
        <InfoLine label="Set" value={t.setId.replace('set_', '').replace(/^\w/, c => c.toUpperCase()) + "'s Set"} valueColor="#22c55e" />
      )}
      <Sep />
      {t.baseStats.map((s, i) => (
        <StatLine key={i} label={STAT_LABELS[s.stat] || s.stat} value={s.value} isPercent={s.isPercentage} />
      ))}
      {t.inherentDownside && (
        <StatLine label={STAT_LABELS[t.inherentDownside.stat] || t.inherentDownside.stat} value={t.inherentDownside.value} isPercent={t.inherentDownside.isPercentage} isDownside />
      )}
      <Sep />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Crafting</div>
      <InfoLine label="Skill" value={`${SKILL_LABELS[t.craftSkillId] || t.craftSkillId} Lv.${t.craftSkillLevel}`} />
      {t.craftingInputs.map((inp, i) => (
        <div key={i} style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '8px' }}>
          {inp.quantity}x {RESOURCES[inp.resourceId]?.name || inp.resourceId.replace(/_/g, ' ')}
        </div>
      ))}
      {t.requiresPreviousTier && (
        <InfoLine label="Chains From" value={GEAR_TEMPLATES[t.requiresPreviousTier]?.name || t.requiresPreviousTier} valueColor="#f59e0b" />
      )}
    </>
  );
}

// --- Ability detail ---
function AbilityInfo({ id }: { id: string }) {
  const a = ABILITIES[id];
  if (!a) return null;
  return (
    <>
      <InfoLine label="Type" value={ABILITY_COLOR_LABELS[a.color]} valueColor={ABILITY_COLOR_HEX[a.color]} />
      <InfoLine label="Requires" value={a.requirements.map(r => `${r.value} ${STAT_LABELS[r.stat] || r.stat}`).join(', ')} />
      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', margin: '4px 0' }}>{a.description}</div>
      {a.cooldown > 0 && <InfoLine label="Cooldown" value={`${a.cooldown} turns`} />}
      {a.isPassive && <InfoLine label="Passive" value="Always Active" valueColor="#22c55e" />}
      {a.isDecree && <InfoLine label="Slot" value="Decree Slot (1 per party)" valueColor="#a855f7" />}
      <Sep />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#4fc3f7', marginBottom: '2px' }}>Effect</div>
      <div style={{ fontSize: '10px', color: '#e2e8f0', marginBottom: '4px' }}>{a.effect}</div>
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#4fc3f7', marginBottom: '2px' }}>Scaling</div>
      <div style={{ fontSize: '10px', color: '#e2e8f0', marginBottom: '4px' }}>{a.scaling}</div>
      <InfoLine label="Source" value={a.source} />
    </>
  );
}

// --- Consumable detail ---
function ConsumableInfo({ id }: { id: string }) {
  const c = CONSUMABLES[id];
  if (!c) return null;
  const typeLabel = c.type === 'food' ? 'Food' : c.type === 'medicine' ? 'Medicine' : 'Chemical';
  return (
    <>
      <InfoLine label="Type" value={`Consumable (${typeLabel})`} valueColor="#4fc3f7" />
      {c.duration > 0 && <InfoLine label="Duration" value={`${c.duration}s`} />}
      <InfoLine label="Cooldown" value={`${c.cooldown}s`} />
      <Sep />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#4fc3f7', marginBottom: '2px' }}>Effect</div>
      <div style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold', marginBottom: '4px' }}>{c.effect}</div>
      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', marginBottom: '4px' }}>{c.description}</div>
      <Sep />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Crafting</div>
      <InfoLine label="Skill" value={`${SKILL_LABELS[c.craftSkillId] || c.craftSkillId} Lv.${c.craftSkillLevel}`} />
      {c.craftingInputs.map((inp, i) => (
        <div key={i} style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '8px' }}>
          {inp.quantity}x {RESOURCES[inp.resourceId]?.name || inp.resourceId.replace(/_/g, ' ')}
        </div>
      ))}
    </>
  );
}

// --- Tool detail ---
function ToolInfo({ id }: { id: string }) {
  const t = TOOLS[id];
  if (!t) return null;
  return (
    <>
      <InfoLine label="Type" value={`${SKILL_LABELS[t.targetSkillId] || t.targetSkillId} Tool`} valueColor="#4fc3f7" />
      <InfoLine label="Requires" value={`${t.levelReq} ${SKILL_LABELS[t.targetSkillId] || t.targetSkillId}`} />
      <StatLine label={`${SKILL_LABELS[t.targetSkillId]} Speed`} value={t.speedBonus} isPercent />
      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', margin: '4px 0' }}>{t.description}</div>
      <Sep />
      <div style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Crafting</div>
      <InfoLine label="Skill" value={`${SKILL_LABELS[t.craftSkillId] || t.craftSkillId} Lv.${t.craftSkillLevel}`} />
      {t.craftingInputs.map((inp, i) => (
        <div key={i} style={{ fontSize: '10px', color: '#9ca3af', marginLeft: '8px' }}>
          {inp.quantity}x {RESOURCES[inp.resourceId]?.name || inp.resourceId.replace(/_/g, ' ')}
        </div>
      ))}
    </>
  );
}

// --- Expedition Pass detail ---
function PassInfo({ id }: { id: string }) {
  const p = PASS_DATA.find(pass => pass.id === id);
  if (!p) return null;
  return (
    <>
      <InfoLine label="Type" value="Expedition Pass" valueColor="#4fc3f7" />
      <InfoLine label="Zone" value={p.zone} />
      <InfoLine label="Min Level" value={`${p.level}`} />
      <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic', margin: '4px 0' }}>{p.description}</div>
    </>
  );
}

// ═══════════════════════════════════════════
// SELL VIEW
// ═══════════════════════════════════════════

function SellView() {
  const resources = useGameStore(s => s.resources);
  const listItem = useMarketStore(s => s.listItem);
  const getPriceInfo = useMarketStore(s => s.getPriceInfo);
  const [selectedResource, setSelectedResource] = useState('');
  const [sellQty, setSellQty] = useState(1);
  const [sellPrice, setSellPrice] = useState(0);

  const availableResources = Object.entries(resources)
    .filter(([id, qty]) => qty > 0 && id !== 'wasteland_credits')
    .map(([id, qty]) => ({ id, qty, name: RESOURCES[id]?.name || id.replace(/_/g, ' ') }));

  const selectedPriceInfo = selectedResource ? getPriceInfo(selectedResource, 'resources') : null;

  const handleSelectResource = (resId: string) => {
    setSelectedResource(resId);
    const info = getPriceInfo(resId, 'resources');
    setSellPrice(info.basePrice);
  };

  const handleSell = () => {
    if (!selectedResource || sellQty <= 0) return;
    const available = resources[selectedResource] || 0;
    if (sellQty > available) return;

    const newResources = { ...resources };
    newResources[selectedResource] -= sellQty;
    useGameStore.setState({ resources: newResources });

    const resName = RESOURCES[selectedResource]?.name || selectedResource.replace(/_/g, ' ');
    listItem(selectedResource, resName, 'resources', sellQty, sellPrice);

    setSelectedResource('');
    setSellQty(1);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>List Items for Sale</h3>

      {/* Resource selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {availableResources.map(r => (
          <button key={r.id} onClick={() => handleSelectResource(r.id)}
            className="p-2 rounded text-left cursor-pointer text-xs"
            style={{
              backgroundColor: selectedResource === r.id ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
              border: selectedResource === r.id ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
            }}>
            <div className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{r.name}</div>
            <div style={{ color: 'var(--color-text-muted)' }}>x{r.qty.toLocaleString()}</div>
          </button>
        ))}
      </div>

      {selectedPriceInfo && (
        <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            Price range: <b style={{ color: 'var(--color-text-primary)' }}>{selectedPriceInfo.minPrice} - {selectedPriceInfo.maxPrice} WC</b>
            {' | '}Base: {selectedPriceInfo.basePrice} WC
            {' | '}Trend: <span style={{ color: TREND_COLORS[selectedPriceInfo.trend] }}>{TREND_ICONS[selectedPriceInfo.trend]} {selectedPriceInfo.trend}</span>
          </div>
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Quantity</label>
              <input type="number" value={sellQty} onChange={e => setSellQty(Math.max(1, parseInt(e.target.value) || 1))}
                min={1} max={resources[selectedResource] || 1}
                className="w-full p-2 rounded text-xs"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
            </div>
            <div className="flex-1">
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Price per unit (WC)</label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(Math.max(selectedPriceInfo.minPrice, Math.min(selectedPriceInfo.maxPrice, parseInt(e.target.value) || 0)))}
                min={selectedPriceInfo.minPrice} max={selectedPriceInfo.maxPrice}
                className="w-full p-2 rounded text-xs"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
            </div>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span style={{ color: 'var(--color-text-muted)' }}>Total: {(sellQty * sellPrice).toLocaleString()} WC</span>
            <span style={{ color: 'var(--color-text-muted)' }}>After 5% tax: {Math.floor(sellQty * sellPrice * 0.95).toLocaleString()} WC</span>
          </div>
          <button onClick={handleSell}
            className="w-full p-2 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
            List for Sale
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MY LISTINGS VIEW
// ═══════════════════════════════════════════

function MyListingsView() {
  const myListings = useMarketStore(s => s.getMyListings());
  const cancelListing = useMarketStore(s => s.cancelListing);
  const preOrders = useMarketStore(s => s.preOrders);
  const cancelPreOrder = useMarketStore(s => s.cancelPreOrder);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>My Active Listings ({myListings.length})</h3>
      {myListings.length === 0 ? (
        <div className="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No active listings.</div>
      ) : (
        <div className="space-y-2 mb-4">
          {myListings.map(l => (
            <div key={l.id} className="p-3 rounded flex justify-between items-center"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{l.itemName}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {l.quantity}x at {l.pricePerUnit} WC | Expires: {new Date(l.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => cancelListing(l.id)}
                className="px-2 py-1 rounded text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Cancel</button>
            </div>
          ))}
        </div>
      )}

      <h3 className="font-bold text-sm mb-3 mt-4" style={{ color: 'var(--color-text-primary)' }}>My Pre-Orders ({preOrders.length})</h3>
      {preOrders.length === 0 ? (
        <div className="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No active pre-orders.</div>
      ) : (
        <div className="space-y-2">
          {preOrders.map(o => (
            <div key={o.id} className="p-3 rounded flex justify-between items-center"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <div>
                <div className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{o.itemName}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {o.quantity}x at {o.bidPrice} WC | Escrowed: {o.escrowAmount} WC
                </div>
              </div>
              <button onClick={() => cancelPreOrder(o.id)}
                className="px-2 py-1 rounded text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Cancel</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// HISTORY VIEW
// ═══════════════════════════════════════════

function HistoryView() {
  const history = useMarketStore(s => s.history);

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Market History ({history.length})</h3>
      {history.length === 0 ? (
        <div className="p-4 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No transactions yet.</div>
      ) : (
        <div className="space-y-1">
          {history.map(t => (
            <div key={t.id} className="p-2 rounded flex justify-between text-xs"
              style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <span style={{ color: 'var(--color-text-primary)' }}>{t.quantity}x {t.itemName}</span>
                <span style={{ color: 'var(--color-text-muted)' }}> | {t.sellerName} {'>'} {t.buyerName}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-accent)' }}>{t.totalPrice.toLocaleString()} WC</span>
                <span style={{ color: 'var(--color-text-muted)' }}> (tax: {t.taxAmount})</span>
                <span style={{ color: 'var(--color-text-muted)' }}> {new Date(t.completedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
