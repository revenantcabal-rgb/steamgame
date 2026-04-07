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

export function ResourcePanel() {
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);
  const [activeTab, setActiveTab] = useState<InvTab>('resources');

  const wcAmount = resources['wasteland_credits'] || 0;

  // Resources: raw materials
  const ownedResources = Object.entries(resources)
    .filter(([id, qty]) => qty > 0 && id !== 'wasteland_credits' && RESOURCES[id] && !CONSUMABLES[id])
    .map(([id, qty]) => ({ ...RESOURCES[id], quantity: qty }))
    .sort((a, b) => a.sourceSkillId.localeCompare(b.sourceSkillId) || a.name.localeCompare(b.name));

  // Consumables: food, medicine, chemicals owned as resources
  const ownedConsumables = Object.entries(resources)
    .filter(([id, qty]) => qty > 0 && CONSUMABLES[id])
    .map(([id, qty]) => ({ ...CONSUMABLES[id], quantity: qty }))
    .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

  // Equipment: gear instances
  const gearItems = inventory.map(g => {
    const tmpl = GEAR_TEMPLATES[g.templateId];
    return tmpl ? { ...g, template: tmpl } : null;
  }).filter(Boolean) as (typeof inventory[number] & { template: typeof GEAR_TEMPLATES[string] })[];

  const tabCounts = {
    resources: ownedResources.length,
    consumables: ownedConsumables.length,
    equipment: gearItems.length,
  };

  return (
    <div
      className="w-44 lg:w-48 xl:w-56 min-w-40 h-screen overflow-y-auto flex flex-col shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      {/* Currency */}
      <div className="p-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center p-1.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>WC</span>
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{wcAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        {([
          { id: 'resources' as InvTab, label: 'Mats' },
          { id: 'consumables' as InvTab, label: 'Items' },
          { id: 'equipment' as InvTab, label: 'Gear' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-1.5 text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--color-bg-tertiary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            }}
          >
            {tab.label} ({tabCounts[tab.id]})
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-1.5">
        {activeTab === 'resources' && (
          <ResourcesTab resources={ownedResources} />
        )}
        {activeTab === 'consumables' && (
          <ConsumablesTab consumables={ownedConsumables} />
        )}
        {activeTab === 'equipment' && (
          <EquipmentTab items={gearItems} />
        )}
      </div>
    </div>
  );
}

function ResourcesTab({ resources }: { resources: { id: string; name: string; description: string; sourceSkillId: string; quantity: number }[] }) {
  if (resources.length === 0) {
    return <div className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>No materials yet.</div>;
  }

  // Group by source skill
  const grouped: Record<string, typeof resources> = {};
  for (const r of resources) {
    const key = r.sourceSkillId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([skillId, items]) => (
        <div key={skillId}>
          <div className="text-[11px] font-bold uppercase px-1 mb-1" style={{ color: SOURCE_COLORS[skillId] || 'var(--color-text-muted)' }}>
            {SOURCE_SKILL_LABELS[skillId] || skillId}
          </div>
          <div className="space-y-0.5">
            {items.map(r => (
              <div key={r.id} className="flex items-center gap-1.5 p-1.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <ItemIcon itemId={r.id} itemType="resource" size={16} fallbackLabel={r.name.charAt(0)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{r.name}</div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>{r.description}</div>
                </div>
                <span className="text-xs font-mono font-bold shrink-0" style={{ color: SOURCE_COLORS[r.sourceSkillId] || 'var(--color-text-secondary)' }}>
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

const TYPE_LABELS: Record<string, string> = { food: 'Food', medicine: 'Medicine', chemical: 'Chemical' };
const TYPE_COLORS: Record<string, string> = { food: '#f39c12', medicine: '#27ae60', chemical: '#9b59b6' };

function ConsumablesTab({ consumables }: { consumables: { id: string; name: string; type: string; effect: string; quantity: number }[] }) {
  if (consumables.length === 0) {
    return <div className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>No consumables yet.</div>;
  }

  const grouped: Record<string, typeof consumables> = {};
  for (const c of consumables) {
    if (!grouped[c.type]) grouped[c.type] = [];
    grouped[c.type].push(c);
  }

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <div className="text-[11px] font-bold uppercase px-1 mb-1" style={{ color: TYPE_COLORS[type] || 'var(--color-text-muted)' }}>
            {TYPE_LABELS[type] || type}
          </div>
          <div className="space-y-0.5">
            {items.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 p-1.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <ItemIcon itemId={c.id} itemType="consumable" size={16} fallbackLabel={c.name.charAt(0)} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{c.name}</div>
                  <div className="text-[11px] truncate" style={{ color: TYPE_COLORS[c.type] || 'var(--color-text-muted)' }}>{c.effect}</div>
                </div>
                <span className="text-xs font-mono font-bold shrink-0" style={{ color: TYPE_COLORS[c.type] || 'var(--color-text-secondary)' }}>
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

function EquipmentTab({ items }: { items: { instanceId: string; rarity: string; facet: any; template: { id: string; name: string; slot: string; tier: number; baseStats: { stat: string; value: number; isPercentage: boolean }[] } }[] }) {
  if (items.length === 0) {
    return <div className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>No equipment yet.</div>;
  }

  // Sort by tier desc, then slot
  const sorted = [...items].sort((a, b) => b.template.tier - a.template.tier || a.template.slot.localeCompare(b.template.slot));

  return (
    <div className="space-y-0.5">
      {sorted.map(item => {
        const rarityColor = RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS] || '#9ca3af';
        return (
          <div key={item.instanceId} className="p-1.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderLeft: `2px solid ${rarityColor}` }}>
            <div className="flex items-center gap-1.5">
              <ItemIcon itemId={item.template.id} itemType="equipment" gearSlot={item.template.slot as any} size={16} fallbackLabel={item.template.name.charAt(0)} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: rarityColor }}>
                  {item.facet ? `${item.facet.name} ` : ''}{item.template.name}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  T{item.template.tier} {item.template.slot} | {RARITY_LABELS[item.rarity as keyof typeof RARITY_LABELS] || item.rarity}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {item.template.baseStats.slice(0, 2).map((s, i) => (
                <span key={i} style={{ color: 'var(--color-success)', fontSize: 11 }}>+{s.value} {s.stat}{s.isPercentage ? '%' : ''}</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
