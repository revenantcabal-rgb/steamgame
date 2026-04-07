import { useState } from 'react';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { useGameStore } from '../../store/useGameStore';
import { GEAR_TEMPLATE_LIST, GEAR_TEMPLATES } from '../../config/gear';
import { RESOURCES } from '../../config/resources';
import { RARITY_COLORS, RARITY_LABELS, getCraftTime } from '../../types/equipment';
import type { GearTemplate, GearInstance } from '../../types/equipment';
import { ItemIcon } from '../../utils/itemIcons';
import { getResourceSources } from '../../utils/resourceSources';
import { useNavigation } from '../../utils/NavigationContext';
import { ProgressBar } from '../common/ProgressBar';

const SKILL_LABELS: Record<string, string> = {
  weaponsmithing: 'Weaponsmithing',
  armorcrafting: 'Armorcrafting',
  tinkering: 'Tinkering',
};
const SKILL_COLORS: Record<string, string> = {
  weaponsmithing: '#e74c3c',
  armorcrafting: '#3498db',
  tinkering: '#f39c12',
};
const SLOT_LABELS: Record<string, string> = {
  weapon: 'Weapon', shield: 'Shield', armor: 'Armor', legs: 'Legs',
  gloves: 'Gloves', boots: 'Boots', ring: 'Ring', earring: 'Earring', necklace: 'Necklace',
};

const CRAFT_REPEAT_OPTIONS = [
  { label: '1', value: 1 },
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '\u221E', value: 0 },
];

export function CraftingPanel() {
  const skills = useGameStore(s => s.skills);
  const resources = useGameStore(s => s.resources);
  const inventory = useEquipmentStore(s => s.inventory);
  const startCraft = useEquipmentStore(s => s.startCraft);
  const cancelCraft = useEquipmentStore(s => s.cancelCraft);
  const activeCraft = useEquipmentStore(s => s.activeCraft);
  const discardItem = useEquipmentStore(s => s.discardItem);
  const craftRepeatTarget = useEquipmentStore(s => s.craftRepeatTarget);
  const craftRepeatCount = useEquipmentStore(s => s.craftRepeatCount);
  const setCraftRepeatTarget = useEquipmentStore(s => s.setCraftRepeatTarget);
  const navigation = useNavigation();

  const [filterSlot, setFilterSlot] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<number>(0); // 0 = all
  const [craftableOnly, setCraftableOnly] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canAfford = (templateId: string): boolean => {
    const template = GEAR_TEMPLATES[templateId];
    if (!template) return false;
    const hasResources = template.craftingInputs.every(i => (resources[i.resourceId] || 0) >= i.quantity);
    if (!hasResources) return false;
    if (template.requiresPreviousTier) {
      const hasGear = inventory.some(g => {
        if (g.templateId !== template.requiresPreviousTier) return false;
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

  const handleCraft = (templateId: string) => {
    const template = GEAR_TEMPLATES[templateId];
    if (!template) return;
    const skill = skills[template.craftSkillId];
    startCraft(templateId, skill?.level || 1);
  };

  // Filter recipes
  const craftable = GEAR_TEMPLATE_LIST.filter(t => {
    const skill = skills[t.craftSkillId];
    if (!skill || skill.level < t.craftSkillLevel) return false;
    if (filterSlot !== 'all' && t.slot !== filterSlot) return false;
    if (filterTier > 0 && t.tier !== filterTier) return false;
    if (searchText && !t.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (craftableOnly && !canAfford(t.id)) return false;
    return true;
  }).sort((a, b) => a.tier - b.tier || a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));

  // Group by skill, then tier
  const grouped: Record<string, Record<number, GearTemplate[]>> = {};
  for (const t of craftable) {
    if (!grouped[t.craftSkillId]) grouped[t.craftSkillId] = {};
    if (!grouped[t.craftSkillId][t.tier]) grouped[t.craftSkillId][t.tier] = [];
    grouped[t.craftSkillId][t.tier].push(t);
  }

  const selectedTemplate = selectedId ? GEAR_TEMPLATES[selectedId] : null;

  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
      {/* Left: Recipe List */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Header + Search */}
        <div className="p-3 pb-0 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Forge Equipment</h3>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{craftable.length} recipes</span>
          </div>

          {/* Batch Repeat Selector */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Quantity:</span>
            <div className="flex gap-1">
              {CRAFT_REPEAT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCraftRepeatTarget(opt.value)}
                  className="px-2.5 py-1 rounded text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: craftRepeatTarget === opt.value ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                    color: craftRepeatTarget === opt.value ? '#000' : 'var(--color-text-muted)',
                    border: craftRepeatTarget === opt.value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {activeCraft && (
              <span className="text-[11px] ml-1" style={{ color: 'var(--color-text-muted)' }}>
                {craftRepeatTarget === 0
                  ? `Crafted ${craftRepeatCount} (\u221E)`
                  : `${craftRepeatCount + 1} of ${craftRepeatTarget}`}
              </span>
            )}
          </div>

          {/* Active Craft Progress */}
          {activeCraft && (
            <div className="mb-2 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-accent)' }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
                  Crafting: {GEAR_TEMPLATES[activeCraft.templateId]?.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{activeCraft.progress}s / {activeCraft.duration}s</span>
                  <button onClick={cancelCraft} className="px-2 py-0.5 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Cancel</button>
                </div>
              </div>
              <ProgressBar value={activeCraft.progress} max={activeCraft.duration} color="var(--color-accent)" height="6px" />
            </div>
          )}

          {/* Search */}
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="w-full p-1.5 rounded text-xs mb-2"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          />

          {/* Slot filter pills */}
          <div className="flex gap-1 mb-2 flex-wrap">
            {['all', 'weapon', 'armor', 'legs', 'gloves', 'boots', 'shield', 'ring', 'earring', 'necklace'].map(s => (
              <button key={s} onClick={() => setFilterSlot(s)}
                className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                style={{
                  backgroundColor: filterSlot === s ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                  color: filterSlot === s ? '#000' : 'var(--color-text-muted)',
                  border: 'none',
                }}>
                {SLOT_LABELS[s] || 'All'}
              </button>
            ))}
          </div>

          {/* Tier filter + craftable toggle */}
          <div className="flex gap-1 items-center mb-2 flex-wrap">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Tier:</span>
            {[0, 1, 2, 3, 4, 5].map(t => (
              <button key={t} onClick={() => setFilterTier(t)}
                className="px-1.5 py-0.5 rounded text-[11px] cursor-pointer"
                style={{
                  backgroundColor: filterTier === t ? 'var(--color-info)' : 'var(--color-bg-tertiary)',
                  color: filterTier === t ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                }}>
                {t === 0 ? 'All' : `T${t}`}
              </button>
            ))}
            <button onClick={() => setCraftableOnly(!craftableOnly)}
              className="px-2 py-0.5 rounded text-[11px] cursor-pointer ml-1"
              style={{
                backgroundColor: craftableOnly ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                color: craftableOnly ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
              }}>
              {craftableOnly ? '✓ Craftable' : 'Craftable'}
            </button>
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {craftable.length === 0 ? (
            <div className="text-xs p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              No recipes match your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([skillId, tiers]) => (
                <div key={skillId}>
                  {/* Skill Header */}
                  <div className="flex items-center gap-2 mb-1.5 pb-1" style={{ borderBottom: `2px solid ${SKILL_COLORS[skillId] || '#888'}` }}>
                    <span className="text-xs font-bold" style={{ color: SKILL_COLORS[skillId] || '#888' }}>
                      {SKILL_LABELS[skillId] || skillId}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      Lv.{skills[skillId]?.level || 0}
                    </span>
                  </div>

                  {Object.entries(tiers).sort(([a], [b]) => Number(a) - Number(b)).map(([tier, items]) => (
                    <div key={tier} className="mb-2">
                      {/* Tier Sub-header */}
                      <div className="text-[11px] font-bold mb-1 px-1" style={{ color: 'var(--color-text-muted)' }}>
                        Tier {tier} ({items.length})
                      </div>

                      <div className="space-y-1">
                        {items.map(t => {
                          const affordable = canAfford(t.id);
                          const isSelected = selectedId === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setSelectedId(isSelected ? null : t.id)}
                              className="w-full text-left p-2 rounded text-xs transition-all cursor-pointer"
                              style={{
                                backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                                border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                opacity: affordable ? 1 : 0.6,
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <ItemIcon itemId={t.id} itemType="equipment" gearSlot={t.slot} size={28} fallbackLabel={t.name.charAt(0)} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>{t.name}</div>
                                  <div className="flex gap-1 mt-0.5 flex-wrap">
                                    <span className="px-1 py-0 rounded" style={{ backgroundColor: SKILL_COLORS[t.craftSkillId] + '33', color: SKILL_COLORS[t.craftSkillId], fontSize: 11 }}>T{t.tier}</span>
                                    <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', fontSize: 11 }}>{SLOT_LABELS[t.slot] || t.slot}</span>
                                    <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-xp)22', color: 'var(--color-xp)', fontSize: 11 }}>{t.craftXp}xp</span>
                                    <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', fontSize: 11 }}>{getCraftTime(t)}s</span>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {affordable ? (
                                    <span className="text-[11px] font-bold" style={{ color: 'var(--color-success)' }}>Ready</span>
                                  ) : (
                                    <span className="text-[11px]" style={{ color: 'var(--color-danger)' }}>Need mats</span>
                                  )}
                                </div>
                              </div>
                              {/* Compact material icons */}
                              <div className="flex gap-1.5 mt-1 ml-9">
                                {t.craftingInputs.map(i => {
                                  const have = resources[i.resourceId] || 0;
                                  const enough = have >= i.quantity;
                                  return (
                                    <span key={i.resourceId} className="flex items-center gap-0.5" style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)', fontSize: 11 }}>
                                      <ItemIcon itemId={i.resourceId} itemType="resource" size={10} fallbackLabel="" />
                                      {have}/{i.quantity}
                                    </span>
                                  );
                                })}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail Panel + Inventory */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col">
        {/* Detail Panel */}
        {selectedTemplate && (
          <RecipeDetail
            template={selectedTemplate}
            affordable={canAfford(selectedTemplate.id)}
            isCrafting={!!activeCraft}
            onCraft={() => handleCraft(selectedTemplate.id)}
            resources={resources}
            navigation={navigation}
          />
        )}

        {/* Inventory */}
        <div className="flex-1 overflow-y-auto p-3">
          <h3 className="font-bold text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Crafted Gear ({inventory.length})
          </h3>
          {inventory.length === 0 ? (
            <div className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>No gear yet. Craft or find some!</div>
          ) : (
            <div className="space-y-1">
              {[...inventory]
                .sort((a, b) => {
                  const ta = GEAR_TEMPLATES[a.templateId];
                  const tb = GEAR_TEMPLATES[b.templateId];
                  if (!ta || !tb) return 0;
                  return tb.tier - ta.tier || ta.slot.localeCompare(tb.slot);
                })
                .map(gear => (
                  <CompactGearCard key={gear.instanceId} gear={gear} onDiscard={() => discardItem(gear.instanceId)} />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Recipe Detail Panel ──────────────────────────────────── */
function RecipeDetail({ template, affordable, isCrafting, onCraft, resources, navigation }: {
  template: GearTemplate;
  affordable: boolean;
  isCrafting: boolean;
  onCraft: () => void;
  resources: Record<string, number>;
  navigation: ReturnType<typeof useNavigation>;
}) {
  return (
    <div className="p-3 shrink-0" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <ItemIcon itemId={template.id} itemType="equipment" gearSlot={template.slot} size={48} fallbackLabel={template.name.charAt(0)} />
        <div className="flex-1">
          <div className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{template.name}</div>
          <div className="flex gap-1 mt-0.5 flex-wrap">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: SKILL_COLORS[template.craftSkillId] + '33', color: SKILL_COLORS[template.craftSkillId] }}>T{template.tier}</span>
            <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>{SLOT_LABELS[template.slot] || template.slot}</span>
            <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>Lv.{template.levelReq}+</span>
            {template.weaponType && (
              <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>{template.weaponType}</span>
            )}
            {template.isTwoHanded && (
              <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: '#e74c3c22', color: '#e74c3c' }}>2H</span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {template.description && (
        <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{template.description}</div>
      )}

      {/* Stats */}
      <div className="mb-2">
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Base Stats</div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {template.baseStats.map((s, i) => (
            <span key={i} className="text-xs" style={{ color: 'var(--color-success)' }}>+{s.value} {s.stat}{s.isPercentage ? '%' : ''}</span>
          ))}
          {template.inherentDownside && (
            <span className="text-xs" style={{ color: 'var(--color-danger)' }}>{template.inherentDownside.value} {template.inherentDownside.stat}{template.inherentDownside.isPercentage ? '%' : ''}</span>
          )}
        </div>
      </div>

      {/* Stat Requirements */}
      {template.statRequirements.length > 0 && (
        <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Requires: {template.statRequirements.map(r => `${r.stat.toUpperCase()} ${r.value}`).join(', ')}
        </div>
      )}

      {/* Gear Chain */}
      {template.requiresPreviousTier && (
        <div className="text-xs mb-2" style={{ color: 'var(--color-energy)' }}>
          Upgrade from: {GEAR_TEMPLATES[template.requiresPreviousTier]?.name || template.requiresPreviousTier} (consumed)
        </div>
      )}

      {/* Materials */}
      <div className="mb-2">
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Materials</div>
        <div className="space-y-0.5">
          {template.craftingInputs.map(i => {
            const have = resources[i.resourceId] || 0;
            const enough = have >= i.quantity;
            const resName = RESOURCES[i.resourceId]?.name || i.resourceId;
            const sources = !enough ? getResourceSources(i.resourceId) : null;
            return (
              <div key={i.resourceId} className="flex items-center gap-1.5 text-xs">
                <ItemIcon itemId={i.resourceId} itemType="resource" size={14} fallbackLabel={resName.charAt(0)} />
                <span style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {resName}
                </span>
                <span className="font-mono" style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {have}/{i.quantity}
                </span>
                {!enough && sources?.skill && (
                  <span
                    className="cursor-pointer"
                    style={{ color: 'var(--color-text-muted)', fontSize: 11, textDecoration: 'underline' }}
                    onClick={() => navigation.navigateToSkill(sources.skill!.id)}
                  >
                    [{sources.skill.name}]
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Craft Button */}
      <button
        onClick={onCraft}
        disabled={!affordable || isCrafting}
        className="w-full p-2 rounded text-xs font-bold cursor-pointer"
        style={{
          backgroundColor: affordable && !isCrafting ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
          color: affordable && !isCrafting ? '#000' : 'var(--color-text-muted)',
          border: 'none',
        }}
      >
        {isCrafting ? 'Crafting...' : affordable ? `Craft (${getCraftTime(template)}s)` : 'Missing Materials'}
      </button>
    </div>
  );
}

/* ─── Compact Gear Card for Inventory ──────────────────────── */
function CompactGearCard({ gear, onDiscard }: { gear: GearInstance; onDiscard: () => void }) {
  const template = GEAR_TEMPLATES[gear.templateId];
  if (!template) return null;

  const rarityColor = RARITY_COLORS[gear.rarity];
  const facetPrefix = gear.facet ? `${gear.facet.name} ` : '';

  return (
    <div className="p-1.5 rounded flex items-center gap-2" style={{ backgroundColor: 'var(--color-bg-secondary)', borderLeft: `3px solid ${rarityColor}` }}>
      <ItemIcon itemId={template.id} itemType="equipment" gearSlot={template.slot} size={20} fallbackLabel={template.name.charAt(0)} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold truncate" style={{ color: rarityColor }}>
          {facetPrefix}{template.name}
        </div>
        <div className="flex gap-1">
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>T{template.tier} {template.slot}</span>
          <span style={{ fontSize: 11, color: rarityColor }}>{RARITY_LABELS[gear.rarity]}</span>
        </div>
      </div>
      <button onClick={onDiscard} className="px-1.5 py-0.5 rounded text-xs cursor-pointer shrink-0"
        style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', fontSize: 11 }}>
        ✕
      </button>
    </div>
  );
}

/* ─── Legacy export for other components using GearCard ───── */
export function GearCard({ gear, onDiscard, compact }: { gear: GearInstance; onDiscard?: () => void; compact?: boolean }) {
  const template = GEAR_TEMPLATES[gear.templateId];
  if (!template) return null;

  const rarityColor = RARITY_COLORS[gear.rarity];
  const facetPrefix = gear.facet ? `${gear.facet.name} ` : '';

  return (
    <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${rarityColor}44` }}>
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-xs flex items-center gap-1" style={{ color: rarityColor }}>
            <ItemIcon itemId={template.id} itemType="equipment" gearSlot={template.slot} size={20} fallbackLabel={template.name.charAt(0)} />
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
        <div className="flex flex-wrap gap-2 text-xs mt-1">
          {template.baseStats.map((s, i) => (
            <span key={i} style={{ color: 'var(--color-success)' }}>
              +{Math.round(s.value * gear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
