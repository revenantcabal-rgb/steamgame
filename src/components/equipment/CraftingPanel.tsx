import { useState } from 'react';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { useGameStore } from '../../store/useGameStore';
import { GEAR_TEMPLATE_LIST, GEAR_TEMPLATES } from '../../config/gear';
import { RESOURCES } from '../../config/resources';
import { RARITY_COLORS, RARITY_LABELS } from '../../types/equipment';
import type { GearInstance } from '../../types/equipment';

export function CraftingPanel() {
  const skills = useGameStore(s => s.skills);
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);
  const craftItem = useEquipmentStore(s => s.craftItem);
  const discardItem = useEquipmentStore(s => s.discardItem);
  const [filterSlot, setFilterSlot] = useState<string>('all');

  // Get craftable items based on player's production skill levels
  const craftable = GEAR_TEMPLATE_LIST.filter(t => {
    const skill = skills[t.craftSkillId];
    if (!skill || skill.level < t.craftSkillLevel) return false;
    if (filterSlot !== 'all' && t.slot !== filterSlot) return false;
    return true;
  });

  const handleCraft = (templateId: string) => {
    const template = GEAR_TEMPLATES[templateId];
    if (!template) return;
    const skill = skills[template.craftSkillId];
    craftItem(templateId, skill?.level || 1);
  };

  const canAfford = (templateId: string): boolean => {
    const template = GEAR_TEMPLATES[templateId];
    if (!template) return false;
    const hasResources = template.craftingInputs.every(i => (resources[i.resourceId] || 0) >= i.quantity);
    if (!hasResources) return false;
    // Check gear chaining requirement
    if (template.requiresPreviousTier) {
      const hasGear = inventory.some(g => {
        if (g.templateId !== template.requiresPreviousTier) return false;
        // Must not be equipped
        const heroEq = useEquipmentStore.getState().heroEquipment;
        for (const eq of Object.values(heroEq)) {
          for (const v of Object.values(eq)) { if (v === g.instanceId) return false; }
        }
        return true;
      });
      if (!hasGear) return false;
    }
    return true;
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Crafting recipes */}
      <div className="w-1/2 overflow-y-auto p-4" style={{ borderRight: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>Forge Equipment</h3>
        <div className="flex gap-1 mb-3 flex-wrap">
          {['all', 'weapon', 'armor', 'legs', 'gloves', 'boots', 'shield', 'ring', 'earring', 'necklace'].map(s => (
            <button key={s} onClick={() => setFilterSlot(s)}
              className="px-2 py-1 rounded text-xs cursor-pointer"
              style={{ backgroundColor: filterSlot === s ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: filterSlot === s ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {craftable.length === 0 ? (
          <div className="text-xs p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
            No recipes available. Level up Weaponsmithing, Armorcrafting, or Tinkering.
          </div>
        ) : (
          <div className="space-y-2">
            {craftable.map(t => {
              const affordable = canAfford(t.id);
              return (
                <div key={t.id} className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                      {t.name} <span style={{ color: 'var(--color-text-muted)' }}>(T{t.tier} {t.slot})</span>
                    </span>
                    <button onClick={() => handleCraft(t.id)} disabled={!affordable}
                      className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
                      style={{ backgroundColor: affordable ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: affordable ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
                      Craft
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {t.craftingInputs.map(i => {
                      const have = resources[i.resourceId] || 0;
                      const enough = have >= i.quantity;
                      return (
                        <span key={i.resourceId} style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)' }}>
                          {RESOURCES[i.resourceId]?.name || i.resourceId}: {have}/{i.quantity}
                        </span>
                      );
                    })}
                  </div>
                  {t.requiresPreviousTier && (
                    <div className="text-xs mt-1" style={{ color: 'var(--color-energy)' }}>
                      Chain: requires {GEAR_TEMPLATES[t.requiresPreviousTier]?.name || t.requiresPreviousTier} (consumed)
                    </div>
                  )}
                  {t.statRequirements.length > 0 && (
                    <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Equip requires: {t.statRequirements.map(r => `${r.stat.toUpperCase()} ${r.value}`).join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="w-1/2 overflow-y-auto p-4">
        <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Inventory ({inventory.length})
        </h3>
        {inventory.length === 0 ? (
          <div className="text-xs p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
            No gear yet. Craft or find some!
          </div>
        ) : (
          <div className="space-y-2">
            {inventory.map(gear => (
              <GearCard key={gear.instanceId} gear={gear} onDiscard={() => discardItem(gear.instanceId)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function GearCard({ gear, onDiscard, compact }: { gear: GearInstance; onDiscard?: () => void; compact?: boolean }) {
  const template = GEAR_TEMPLATES[gear.templateId];
  if (!template) return null;

  const rarityColor = RARITY_COLORS[gear.rarity];
  const facetPrefix = gear.facet ? `${gear.facet.name} ` : '';
  const sourceLabel = gear.source === 'forged' ? '[Forged]' : gear.source === 'salvaged' ? '[Salvaged]' : `[${gear.source}]`;

  return (
    <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${rarityColor}44` }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{sourceLabel}</div>
          <div className="font-bold text-xs" style={{ color: rarityColor }}>
            {facetPrefix}{template.name} [{RARITY_LABELS[gear.rarity]}]
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            T{template.tier} {template.slot} | Lv.{template.levelReq}+
            {template.weaponType && ` | ${template.weaponType}`}
            {template.isTwoHanded && ' (2H)'}
          </div>
        </div>
        {onDiscard && !compact && (
          <button onClick={onDiscard} className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>X</button>
        )}
      </div>

      {!compact && (
        <>
          {/* Base stats */}
          <div className="flex flex-wrap gap-2 text-xs mt-1">
            {template.baseStats.map((s, i) => (
              <span key={i} style={{ color: 'var(--color-success)' }}>
                +{Math.round(s.value * gear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
              </span>
            ))}
            {template.inherentDownside && (
              <span style={{ color: 'var(--color-danger)' }}>
                {template.inherentDownside.value} {template.inherentDownside.stat}{template.inherentDownside.isPercentage ? '%' : ''}
              </span>
            )}
          </div>

          {/* Facet */}
          {gear.facet && gear.facet.upside.stat !== 'none' && (
            <div className="text-xs mt-1" style={{ color: 'var(--color-energy)' }}>
              [{gear.facet.name}] +{gear.facet.upside.value}{gear.facet.upside.isPercentage ? '%' : ''} {gear.facet.upside.stat} / {gear.facet.downside.value}{gear.facet.downside.isPercentage ? '%' : ''} {gear.facet.downside.stat}
            </div>
          )}

          {/* Rarity bonuses */}
          {gear.rarityBonuses.length > 0 && (
            <div className="flex flex-wrap gap-1 text-xs mt-1">
              {gear.rarityBonuses.map((b, i) => (
                <span key={i} style={{ color: rarityColor }}>+{b.value}{b.isPercentage ? '%' : ''} {b.stat}</span>
              ))}
            </div>
          )}

          {/* Plague curses */}
          {gear.rarityCurses.length > 0 && (
            <div className="flex flex-wrap gap-1 text-xs mt-1">
              {gear.rarityCurses.map((c, i) => (
                <span key={i} style={{ color: '#ff4444' }}>CURSE: {c.value}{c.isPercentage ? '%' : ''} {c.stat}</span>
              ))}
            </div>
          )}

          {/* Enchantments */}
          {gear.enchantments.length > 0 && (
            <div className="space-y-0.5 text-xs mt-1">
              {gear.enchantments.map((e, i) => (
                <div key={i} style={{ color: e.isLegendary ? '#f97316' : '#60a5fa' }}>
                  [{e.group}] {e.name}: +{e.effect.value}{e.effect.isPercentage ? '%' : ''} {e.effect.stat}
                  {e.isLegendary && e.legendaryBonus && <span style={{ color: '#f97316' }}> ★ {e.legendaryBonus}</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
