/**
 * InventoryPanel — Full-page inventory and resources view.
 * Replaces the permanent right-side ResourcePanel with a dedicated destination.
 * Three tabs: Materials, Consumables, Equipment — laid out in a wide grid.
 */

import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { RESOURCES } from '../../config/resources';
import { CONSUMABLES } from '../../config/consumables';
import { GEAR_TEMPLATES } from '../../config/gear';
import { RARITY_COLORS, RARITY_LABELS } from '../../types/equipment';
import { ItemIcon } from '../../utils/itemIcons';

type InvTab = 'resources' | 'consumables' | 'equipment';

const SOURCE_SKILL_LABELS: Record<string, string> = {
  scavenging: 'Scavenging',
  foraging: 'Foraging',
  salvage_hunting: 'Salvage',
  water_reclamation: 'Water',
  prospecting: 'Prospecting',
};

const SOURCE_COLORS: Record<string, string> = {
  scavenging: '#e74c3c',
  foraging: '#27ae60',
  salvage_hunting: '#3498db',
  water_reclamation: '#1abc9c',
  prospecting: '#f39c12',
};

const TYPE_LABELS: Record<string, string> = { food: 'Food', medicine: 'Medicine', chemical: 'Chemical' };
const TYPE_COLORS: Record<string, string> = { food: '#f39c12', medicine: '#27ae60', chemical: '#9b59b6' };

export function InventoryPanel() {
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);
  const [activeTab, setActiveTab] = useState<InvTab>('resources');
  const [searchText, setSearchText] = useState('');

  const wcAmount = resources['wasteland_credits'] || 0;
  const query = searchText.toLowerCase();

  const ownedResources = Object.entries(resources)
    .filter(([id, qty]) => qty > 0 && id !== 'wasteland_credits' && RESOURCES[id] && !CONSUMABLES[id])
    .map(([id, qty]) => ({ ...RESOURCES[id], quantity: qty }))
    .filter(r => !query || r.name.toLowerCase().includes(query))
    .sort((a, b) => a.sourceSkillId.localeCompare(b.sourceSkillId) || a.name.localeCompare(b.name));

  const ownedConsumables = Object.entries(resources)
    .filter(([id, qty]) => qty > 0 && CONSUMABLES[id])
    .map(([id, qty]) => ({ ...CONSUMABLES[id], quantity: qty }))
    .filter(c => !query || c.name.toLowerCase().includes(query))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

  const gearItems = (inventory.map(g => {
    const tmpl = GEAR_TEMPLATES[g.templateId];
    return tmpl ? { ...g, template: tmpl } : null;
  }).filter(Boolean) as (typeof inventory[number] & { template: typeof GEAR_TEMPLATES[string] })[])
    .filter(g => !query || g.template.name.toLowerCase().includes(query) || g.template.slot.toLowerCase().includes(query));

  const tabCounts = {
    resources: ownedResources.length,
    consumables: ownedConsumables.length,
    equipment: gearItems.length,
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
      {/* Header with currency */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Inventory</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Materials, consumables, and equipment
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
          background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.08) 0%, rgba(212, 168, 67, 0.03) 100%)',
          border: '1px solid rgba(212, 168, 67, 0.2)',
        }}>
          <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>WC</span>
          <span className="text-sm font-mono font-bold" style={{ color: 'var(--color-accent)', textShadow: '0 0 8px rgba(212, 168, 67, 0.3)' }}>
            {wcAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="Search items..."
          className="w-full px-3 py-1.5 rounded text-xs"
          style={{
            backgroundColor: 'rgba(22, 19, 15, 0.7)',
            border: '1px solid rgba(62, 54, 40, 0.3)',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {([
          { id: 'resources' as InvTab, label: 'Materials' },
          { id: 'consumables' as InvTab, label: 'Consumables' },
          { id: 'equipment' as InvTab, label: 'Equipment' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-1.5 rounded text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--color-accent)' : 'rgba(22, 19, 15, 0.7)',
              color: activeTab === tab.id ? '#000' : 'var(--color-text-muted)',
              border: activeTab === tab.id ? 'none' : '1px solid rgba(62, 54, 40, 0.3)',
            }}
          >
            {tab.label} ({tabCounts[tab.id]})
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'resources' && <ResourcesGrid resources={ownedResources} />}
      {activeTab === 'consumables' && <ConsumablesGrid consumables={ownedConsumables} />}
      {activeTab === 'equipment' && <EquipmentGrid items={gearItems} />}
    </div>
  );
}

// ── Materials tab ──

function ResourcesGrid({ resources }: { resources: { id: string; name: string; description: string; sourceSkillId: string; quantity: number }[] }) {
  if (resources.length === 0) {
    return <EmptyState text="No materials yet. Gather resources from skills." />;
  }

  const grouped: Record<string, typeof resources> = {};
  for (const r of resources) {
    const key = r.sourceSkillId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([skillId, items]) => (
        <div key={skillId}>
          <div className="text-[11px] font-bold uppercase mb-2 flex items-center gap-2" style={{ color: SOURCE_COLORS[skillId] || 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
            {SOURCE_SKILL_LABELS[skillId] || skillId}
            <div className="flex-1 h-px" style={{ backgroundColor: `${SOURCE_COLORS[skillId] || 'rgba(62,54,40,0.3)'}30` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {items.map(r => (
              <div key={r.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(32, 28, 22, 0.7) 0%, rgba(26, 22, 17, 0.8) 100%)',
                border: '1px solid rgba(62, 54, 40, 0.2)',
              }}>
                <ItemIcon itemId={r.id} itemType="resource" size={24} fallbackLabel={r.name.charAt(0)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{r.name}</div>
                  <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{r.description}</div>
                </div>
                <span className="text-sm font-mono font-bold font-data shrink-0" style={{ color: SOURCE_COLORS[r.sourceSkillId] || 'var(--color-text-secondary)' }}>
                  {r.quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Consumables tab ──

function ConsumablesGrid({ consumables }: { consumables: { id: string; name: string; type: string; effect: string; quantity: number }[] }) {
  if (consumables.length === 0) {
    return <EmptyState text="No consumables yet. Craft food, medicine, or chemicals." />;
  }

  const grouped: Record<string, typeof consumables> = {};
  for (const c of consumables) {
    if (!grouped[c.type]) grouped[c.type] = [];
    grouped[c.type].push(c);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <div className="text-[11px] font-bold uppercase mb-2 flex items-center gap-2" style={{ color: TYPE_COLORS[type] || 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
            {TYPE_LABELS[type] || type}
            <div className="flex-1 h-px" style={{ backgroundColor: `${TYPE_COLORS[type] || 'rgba(62,54,40,0.3)'}30` }} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {items.map(c => (
              <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(32, 28, 22, 0.7) 0%, rgba(26, 22, 17, 0.8) 100%)',
                border: '1px solid rgba(62, 54, 40, 0.2)',
              }}>
                <ItemIcon itemId={c.id} itemType="consumable" size={24} fallbackLabel={c.name.charAt(0)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{c.name}</div>
                  <div className="text-[10px] truncate" style={{ color: TYPE_COLORS[c.type] || 'var(--color-text-muted)' }}>{c.effect}</div>
                </div>
                <span className="text-sm font-mono font-bold font-data shrink-0" style={{ color: TYPE_COLORS[c.type] || 'var(--color-text-secondary)' }}>
                  x{c.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Equipment tab ──

function EquipmentGrid({ items }: { items: { instanceId: string; rarity: string; aspect: any; upgradeLevel: number; template: { id: string; name: string; slot: string; tier: number; baseStats: { stat: string; value: number; isPercentage: boolean }[] } }[] }) {
  if (items.length === 0) {
    return <EmptyState text="No equipment yet. Defeat bosses or craft gear." />;
  }

  const sorted = [...items].sort((a, b) => b.template.tier - a.template.tier || a.template.slot.localeCompare(b.template.slot));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {sorted.map(item => {
        const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#9ca3af';
        return (
          <div key={item.instanceId} className="p-3 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(32, 28, 22, 0.7) 0%, rgba(26, 22, 17, 0.8) 100%)',
            border: '1px solid rgba(62, 54, 40, 0.2)',
            borderLeft: `3px solid ${rarityColor}`,
          }}>
            <div className="flex items-center gap-2">
              <ItemIcon itemId={item.template.id} itemType="equipment" gearSlot={item.template.slot as any} size={28} fallbackLabel={item.template.name.charAt(0)} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: rarityColor }}>
                  {item.aspect ? `${item.aspect.name} ` : ''}{item.template.name}
                  {item.upgradeLevel > 0 && <span style={{ color: '#d4a843' }}> +{item.upgradeLevel}</span>}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  T{item.template.tier} {item.template.slot} | {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS] || item.rarity}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
              {item.template.baseStats.map((s, i) => (
                <span key={i} className="text-[11px]" style={{ color: 'var(--color-success)' }}>+{s.value} {s.stat}{s.isPercentage ? '%' : ''}</span>
              ))}
            </div>
            {item.aspect && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                <span className="text-[11px]" style={{ color: '#a78bfa' }}>
                  [{item.aspect.name}] +{item.aspect.upside?.value}{item.aspect.upside?.isPercentage ? '%' : ''} {item.aspect.upside?.stat}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Empty state ──

function EmptyState({ text }: { text: string }) {
  return (
    <div className="p-8 rounded-lg text-center text-[11px]" style={{
      backgroundColor: 'rgba(22, 19, 15, 0.5)',
      border: '1px solid rgba(62, 54, 40, 0.2)',
      color: 'var(--color-text-muted)',
    }}>
      {text}
    </div>
  );
}
