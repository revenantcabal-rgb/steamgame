import { useState } from 'react';
import { GEAR_TEMPLATE_LIST, GEAR_TEMPLATES, EQUIPMENT_SETS } from '../../config/gear';
import { RESOURCES } from '../../config/resources';
import { RARITY_COLORS } from '../../types/equipment';
import type { GearTemplate } from '../../types/equipment';
import { ItemIcon } from '../../utils/itemIcons';

type FilterSlot = 'all' | 'weapon' | 'armor' | 'legs' | 'gloves' | 'boots' | 'shield' | 'ring' | 'earring' | 'necklace';
type FilterTier = 'all' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const SET_COLOR = '#22c55e'; // Green for set items

export function EquipmentBrowser() {
  const [filterSlot, setFilterSlot] = useState<FilterSlot>('all');
  const [filterTier, setFilterTier] = useState<FilterTier>('all');
  const [showSetsOnly, setShowSetsOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'gear' | 'sets'>('gear');

  const filtered = GEAR_TEMPLATE_LIST.filter(t => {
    if (filterSlot !== 'all' && t.slot !== filterSlot) return false;
    if (filterTier !== 'all' && t.tier !== filterTier) return false;
    if (showSetsOnly && !t.setId) return false;
    return true;
  }).sort((a, b) => a.tier - b.tier || a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));

  const selected = selectedItem ? GEAR_TEMPLATES[selectedItem] : null;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left: Item list */}
      <div className="w-1/2 overflow-y-auto p-4" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* View toggle */}
        <div className="flex gap-2 mb-3">
          <button onClick={() => setViewMode('gear')}
            className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: viewMode === 'gear' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: viewMode === 'gear' ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
            All Gear
          </button>
          <button onClick={() => setViewMode('sets')}
            className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: viewMode === 'sets' ? SET_COLOR : 'var(--color-bg-tertiary)', color: viewMode === 'sets' ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
            Set Equipment
          </button>
        </div>

        {viewMode === 'sets' ? (
          <SetBrowser />
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-1 mb-2 flex-wrap">
              {(['all', 'weapon', 'armor', 'legs', 'gloves', 'boots', 'shield', 'ring', 'earring', 'necklace'] as FilterSlot[]).map(s => (
                <button key={s} onClick={() => setFilterSlot(s)}
                  className="px-2 py-0.5 rounded text-xs cursor-pointer"
                  style={{ backgroundColor: filterSlot === s ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: filterSlot === s ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1 mb-2 flex-wrap items-center">
              <span className="text-xs mr-1" style={{ color: 'var(--color-text-muted)' }}>Tier:</span>
              {(['all', 1, 2, 3, 4, 5, 6, 7, 8] as FilterTier[]).map(t => (
                <button key={String(t)} onClick={() => setFilterTier(t)}
                  className="px-2 py-0.5 rounded text-xs cursor-pointer"
                  style={{ backgroundColor: filterTier === t ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: filterTier === t ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
                  {t === 'all' ? 'All' : `T${t}`}
                </button>
              ))}
              <label className="flex items-center gap-1 ml-2 text-xs cursor-pointer" style={{ color: SET_COLOR }}>
                <input type="checkbox" checked={showSetsOnly} onChange={e => setShowSetsOnly(e.target.checked)} />
                Sets only
              </label>
            </div>

            <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} items
            </div>

            {/* Item list */}
            <div className="space-y-1">
              {filtered.map(t => {
                const isSet = !!t.setId;
                const isSelected = t.id === selectedItem;
                return (
                  <button key={t.id} onClick={() => setSelectedItem(t.id)}
                    className="w-full text-left p-2 rounded cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                      borderLeft: isSet ? `3px solid ${SET_COLOR}` : isSelected ? '3px solid var(--color-accent)' : '3px solid transparent',
                      border: 'none',
                      borderLeftWidth: '3px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: isSet ? SET_COLOR : isSelected ? 'var(--color-accent)' : 'transparent',
                    }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold flex items-center gap-1" style={{ color: isSet ? SET_COLOR : 'var(--color-text-primary)' }}>
                        <ItemIcon itemId={t.id} itemType="equipment" gearSlot={t.slot} size={24} fallbackLabel={t.name.charAt(0)} />
                        {t.name}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        T{t.tier} {t.slot} Lv.{t.levelReq}
                        {t.weaponType && ` ${t.weaponType}`}
                        {t.isTwoHanded && ' 2H'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Right: Item detail */}
      <div className="w-1/2 overflow-y-auto p-4">
        {selected ? (
          <ItemDetail template={selected} />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <div className="text-3xl mb-3">&#128218;</div>
              <div className="text-sm">Select an item to view its details.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemDetail({ template: t }: { template: GearTemplate }) {
  const isSet = !!t.setId;
  const setDef = t.setId ? EQUIPMENT_SETS[t.setId] : null;

  return (
    <div>
      <h3 className="text-xl font-bold mb-1" style={{ color: isSet ? SET_COLOR : 'var(--color-text-primary)' }}>
        {t.name}
      </h3>
      <div className="flex gap-2 text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
        <span>Tier {t.tier}</span>
        <span>|</span>
        <span>{t.slot}</span>
        <span>|</span>
        <span>Lv.{t.levelReq}+</span>
        {t.weaponType && <><span>|</span><span>{t.weaponType}</span></>}
        {t.isTwoHanded && <><span>|</span><span>Two-Handed</span></>}
      </div>
      {t.description && (
        <div className="text-xs mb-3" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
          {t.description}
        </div>
      )}

      {/* Base Stats */}
      <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h4 className="font-bold text-xs mb-2">Base Stats [Forged]</h4>
        <div className="space-y-1">
          {t.baseStats.map((s, i) => (
            <div key={i} className="text-xs" style={{ color: 'var(--color-success)' }}>
              +{s.value}{s.isPercentage ? '%' : ''} {s.stat}
            </div>
          ))}
          {t.inherentDownside && (
            <div className="text-xs" style={{ color: 'var(--color-danger)' }}>
              {t.inherentDownside.value}{t.inherentDownside.isPercentage ? '%' : ''} {t.inherentDownside.stat}
            </div>
          )}
        </div>
      </div>

      {/* Stat Requirements */}
      {t.statRequirements.length > 0 && (
        <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h4 className="font-bold text-xs mb-1">Equip Requirements</h4>
          <div className="text-xs" style={{ color: 'var(--color-energy)' }}>
            {t.statRequirements.map(r => `${r.stat.toUpperCase()} ${r.value}`).join(', ')}
          </div>
        </div>
      )}

      {/* Gear Chain */}
      {t.requiresPreviousTier && (
        <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-energy)' }}>
          <h4 className="font-bold text-xs mb-1" style={{ color: 'var(--color-energy)' }}>Crafting Chain</h4>
          <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            Requires: <b style={{ color: 'var(--color-energy)' }}>{GEAR_TEMPLATES[t.requiresPreviousTier]?.name || t.requiresPreviousTier}</b> (consumed in crafting)
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {getFullChain(t.id).join(' > ')}
          </div>
        </div>
      )}

      {/* Crafting Cost */}
      <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h4 className="font-bold text-xs mb-2">Crafting Materials</h4>
        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Skill: {t.craftSkillId} Lv.{t.craftSkillLevel}+ | XP: {t.craftXp}
        </div>
        <div className="space-y-1">
          {t.craftingInputs.map(i => (
            <div key={i.resourceId} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {RESOURCES[i.resourceId]?.name || i.resourceId}: {i.quantity}
            </div>
          ))}
        </div>
      </div>

      {/* Rarity Preview */}
      <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h4 className="font-bold text-xs mb-2">Rarity Levels</h4>
        <div className="space-y-1 text-xs">
          <div style={{ color: RARITY_COLORS.common }}>Common: Base stats only</div>
          <div style={{ color: RARITY_COLORS.rare }}>Rare: +2 random bonuses + 1 enchantment</div>
          <div style={{ color: RARITY_COLORS.unique }}>Unique: +3 bonuses (+30% power) + 2 enchantments</div>
          <div style={{ color: RARITY_COLORS.plague }}>Plague: +6 bonuses (+50% power) + 3 enchantments + 2 curses</div>
        </div>
      </div>

      {/* Set Bonus */}
      {setDef && (
        <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${SET_COLOR}` }}>
          <h4 className="font-bold text-xs mb-1" style={{ color: SET_COLOR }}>
            {setDef.name} ({setDef.pieces.length} pieces)
          </h4>
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {setDef.description} | {setDef.type} | {setDef.tier}
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Pieces: {setDef.pieces.map(p => GEAR_TEMPLATES[p]?.name || p).join(', ')}
          </div>
          <div className="space-y-2">
            {setDef.bonuses.map((b, i) => (
              <div key={i} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                <div className="font-bold text-xs" style={{ color: SET_COLOR }}>
                  ({b.piecesRequired}) Set Bonus:
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {b.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SetBrowser() {
  const sets = Object.values(EQUIPMENT_SETS);
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm" style={{ color: SET_COLOR }}>Equipment Sets</h3>
      {sets.map(s => (
        <div key={s.id} className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${SET_COLOR}44` }}>
          <div className="font-bold text-sm mb-1" style={{ color: SET_COLOR }}>{s.name}</div>
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {s.description} | {s.tier} | {s.type} | {s.pieces.length} pieces
          </div>
          <div className="text-xs mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {s.pieces.map(p => GEAR_TEMPLATES[p]?.name || p).join(' | ')}
          </div>
          <div className="space-y-1">
            {s.bonuses.map((b, i) => (
              <div key={i} className="text-xs">
                <span style={{ color: SET_COLOR }}>({b.piecesRequired})</span>{' '}
                <span style={{ color: 'var(--color-text-secondary)' }}>{b.description}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Trace back the full crafting chain for an item */
function getFullChain(templateId: string): string[] {
  const chain: string[] = [];
  let current = templateId;
  while (current) {
    const t = GEAR_TEMPLATES[current];
    if (!t) break;
    chain.unshift(t.name);
    current = t.requiresPreviousTier || '';
  }
  return chain;
}
