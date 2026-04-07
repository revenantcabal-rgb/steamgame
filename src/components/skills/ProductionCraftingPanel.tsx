import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SKILLS } from '../../config/skills';
import { CONSUMABLES } from '../../config/consumables';
import type { Consumable } from '../../config/consumables';
import { TOOLS } from '../../config/tools';
import type { WastelandTool } from '../../config/tools';
import { RESOURCES } from '../../config/resources';
import { xpForLevel } from '../../types/skills';
import { ItemIcon } from '../../utils/itemIcons';
import { getResourceSources } from '../../utils/resourceSources';
import { useNavigation } from '../../utils/NavigationContext';
import { ProgressBar } from '../common/ProgressBar';

const SKILL_COLORS: Record<string, string> = {
  cooking: '#f39c12',
  biochemistry: '#9b59b6',
  tinkering: '#3498db',
};

const SKILL_ICONS: Record<string, string> = {
  cooking: '\u{1F372}',
  biochemistry: '\u{1F9EA}',
  tinkering: '\u{1F527}',
};

const TYPE_LABELS: Record<string, string> = {
  food: 'Food Buff',
  medicine: 'Medicine',
  chemical: 'Chemical',
  tool: 'Tool',
};

const TYPE_COLORS: Record<string, string> = {
  food: '#f39c12',
  medicine: '#27ae60',
  chemical: '#e74c3c',
  tool: '#3498db',
};

type RecipeItem = {
  id: string;
  name: string;
  description: string;
  effect: string;
  type: string;
  skillLevel: number;
  xp: number;
  duration: number;
  cooldown: number;
  craftingInputs: { resourceId: string; quantity: number }[];
  subActivityId: string;
  // Tool-specific
  speedBonus?: number;
  targetSkillId?: string;
  tier?: number;
  // Consumable-specific
  mechanicalEffect?: Consumable['mechanicalEffect'];
};

const REPEAT_OPTIONS = [
  { label: '1', value: 1 },
  { label: '10', value: 10 },
  { label: '50', value: 50 },
  { label: '\u221E', value: 0 },
];

function formatDuration(seconds: number): string {
  if (seconds === 0) return 'Instant';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m`;
}

function buildRecipeList(skillId: string): RecipeItem[] {
  if (skillId === 'tinkering') {
    return Object.values(TOOLS)
      .sort((a, b) => a.craftSkillLevel - b.craftSkillLevel)
      .map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        effect: t.effect,
        type: 'tool',
        skillLevel: t.craftSkillLevel,
        xp: Math.floor(t.craftSkillLevel * 3 + 18),
        duration: 0,
        cooldown: 0,
        craftingInputs: t.craftingInputs,
        subActivityId: `craft_${t.id}`,
        speedBonus: t.speedBonus,
        targetSkillId: t.targetSkillId,
        tier: t.tier,
      }));
  }
  return Object.values(CONSUMABLES)
    .filter(c => c.craftSkillId === skillId)
    .sort((a, b) => a.craftSkillLevel - b.craftSkillLevel)
    .map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      effect: c.effect,
      type: c.type,
      skillLevel: c.craftSkillLevel,
      xp: Math.floor(c.craftSkillLevel * 3 + 15),
      duration: c.duration,
      cooldown: c.cooldown,
      craftingInputs: c.craftingInputs,
      subActivityId: `craft_${c.id}`,
      mechanicalEffect: c.mechanicalEffect,
    }));
}

export function ProductionCraftingPanel() {
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const skills = useGameStore(s => s.skills);
  const resources = useGameStore(s => s.resources);
  const activeSubActivityId = useGameStore(s => s.activeSubActivityId);
  const setSubActivity = useGameStore(s => s.setSubActivity);
  const isActionRunning = useGameStore(s => s.isActionRunning);
  const actionProgress = useGameStore(s => s.actionProgress);
  const startAction = useGameStore(s => s.startAction);
  const stopAction = useGameStore(s => s.stopAction);
  const currentActionRepeatTarget = useGameStore(s => s.currentActionRepeatTarget);
  const currentActionRepeatCount = useGameStore(s => s.currentActionRepeatCount);
  const setRepeatTarget = useGameStore(s => s.setRepeatTarget);
  const addToQueue = useGameStore(s => s.addToQueue);
  const removeFromQueue = useGameStore(s => s.removeFromQueue);
  const actionQueue = useGameStore(s => s.actionQueue);
  const navigation = useNavigation();

  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [craftableOnly, setCraftableOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!activeSkillId) return null;

  const skillDef = SKILLS[activeSkillId];
  const playerSkill = skills[activeSkillId];
  if (!skillDef || !playerSkill) return null;

  const skillColor = SKILL_COLORS[activeSkillId] || '#888';
  const allRecipes = buildRecipeList(activeSkillId);

  const canAfford = (recipe: RecipeItem): boolean => {
    return recipe.craftingInputs.every(i => (resources[i.resourceId] || 0) >= i.quantity);
  };

  // Get type filter options for this skill
  const typeOptions = [...new Set(allRecipes.map(r => r.type))];

  const filtered = allRecipes.filter(r => {
    if (r.skillLevel > playerSkill.level) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchText && !r.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (craftableOnly && !canAfford(r)) return false;
    return true;
  });

  // Group by tier
  const tierGroups: Record<string, RecipeItem[]> = {};
  for (const r of filtered) {
    const tier = r.skillLevel >= 30 ? 'Advanced' : r.skillLevel >= 15 ? 'Intermediate' : 'Basic';
    if (!tierGroups[tier]) tierGroups[tier] = [];
    tierGroups[tier].push(r);
  }
  const tierOrder = ['Basic', 'Intermediate', 'Advanced'];

  const selectedRecipe = selectedId ? allRecipes.find(r => r.id === selectedId) : null;

  const handleSelectRecipe = (recipe: RecipeItem) => {
    const isAlreadySelected = selectedId === recipe.id;
    setSelectedId(isAlreadySelected ? null : recipe.id);
    setSubActivity(recipe.subActivityId);
  };

  const actionTime = skillDef.baseActionTime;
  const currentLevelXp = xpForLevel(playerSkill.level);
  const nextLevelXp = xpForLevel(playerSkill.level + 1);
  const xpIntoLevel = playerSkill.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  // Count locked recipes
  const lockedCount = allRecipes.filter(r => r.skillLevel > playerSkill.level).length;

  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
      {/* Left: Recipe List */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Header */}
        <div className="p-3 pb-0 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <ItemIcon itemId={activeSkillId} itemType="skill" size={22} fallbackLabel={SKILL_ICONS[activeSkillId] || '\u2699'} />
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{skillDef.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ backgroundColor: skillColor + '22', color: skillColor }}>
                Lv.{playerSkill.level}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} recipes{lockedCount > 0 && ` (+${lockedCount} locked)`}
            </span>
          </div>

          {/* XP Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[11px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
              <span>XP Progress</span>
              <span>{xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()}</span>
            </div>
            <ProgressBar value={xpIntoLevel} max={xpNeeded} color={skillColor} height="4px" />
          </div>

          {/* Batch Repeat Selector */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Quantity:</span>
            <div className="flex gap-1">
              {REPEAT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRepeatTarget(opt.value)}
                  className="px-2.5 py-1 rounded text-xs font-bold cursor-pointer"
                  style={{
                    backgroundColor: currentActionRepeatTarget === opt.value ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                    color: currentActionRepeatTarget === opt.value ? '#000' : 'var(--color-text-muted)',
                    border: currentActionRepeatTarget === opt.value ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {isActionRunning && (
              <span className="text-[11px] ml-1" style={{ color: 'var(--color-text-muted)' }}>
                {currentActionRepeatTarget === 0
                  ? `Crafted ${currentActionRepeatCount} (\u221E)`
                  : `${currentActionRepeatCount + 1} of ${currentActionRepeatTarget}`}
              </span>
            )}
          </div>

          {/* Active Craft Progress */}
          {isActionRunning && activeSubActivityId && (
            <div className="mb-2 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: `1px solid ${skillColor}` }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold" style={{ color: skillColor }}>
                  Crafting: {allRecipes.find(r => r.subActivityId === activeSubActivityId)?.name || 'Unknown'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{actionProgress.toFixed(0)}s / {actionTime}s</span>
                  <button onClick={stopAction} className="px-2 py-0.5 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Cancel</button>
                </div>
              </div>
              <ProgressBar value={actionProgress} max={actionTime} color={skillColor} height="6px" />
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

          {/* Type filter pills */}
          <div className="flex gap-1 mb-2 flex-wrap">
            <button onClick={() => setFilterType('all')}
              className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
              style={{
                backgroundColor: filterType === 'all' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                color: filterType === 'all' ? '#000' : 'var(--color-text-muted)',
                border: 'none',
              }}>All</button>
            {typeOptions.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                style={{
                  backgroundColor: filterType === t ? (TYPE_COLORS[t] || skillColor) : 'var(--color-bg-tertiary)',
                  color: filterType === t ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                }}>
                {TYPE_LABELS[t] || t}
              </button>
            ))}
            <button onClick={() => setCraftableOnly(!craftableOnly)}
              className="px-2 py-0.5 rounded text-[11px] cursor-pointer ml-1"
              style={{
                backgroundColor: craftableOnly ? 'var(--color-success)' : 'var(--color-bg-tertiary)',
                color: craftableOnly ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
              }}>
              {craftableOnly ? '\u2713 Craftable' : 'Craftable'}
            </button>
          </div>
        </div>

        {/* Recipe List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {filtered.length === 0 ? (
            <div className="text-xs p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              No recipes match your filters.
            </div>
          ) : (
            <div className="space-y-3">
              {tierOrder.filter(t => tierGroups[t]).map(tier => (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-1.5 pb-1" style={{ borderBottom: `2px solid ${skillColor}` }}>
                    <span className="text-xs font-bold" style={{ color: skillColor }}>{tier}</span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      ({tierGroups[tier].length} recipes)
                    </span>
                  </div>
                  <div className="space-y-1">
                    {tierGroups[tier].map(recipe => {
                      const affordable = canAfford(recipe);
                      const isSelected = selectedId === recipe.id;
                      const typeColor = TYPE_COLORS[recipe.type] || '#888';
                      const owned = resources[recipe.id] || 0;

                      return (
                        <button
                          key={recipe.id}
                          onClick={() => handleSelectRecipe(recipe)}
                          className="w-full text-left p-2 rounded text-xs transition-all cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                            border: isSelected ? `2px solid ${skillColor}` : '1px solid var(--color-border)',
                            opacity: affordable ? 1 : 0.6,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <ItemIcon itemId={recipe.id} itemType="consumable" size={28} fallbackLabel={recipe.name.charAt(0)} />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-xs truncate" style={{ color: 'var(--color-text-primary)' }}>{recipe.name}</div>
                              <div className="flex gap-1 mt-0.5 flex-wrap">
                                <span className="px-1 py-0 rounded" style={{ backgroundColor: typeColor + '22', color: typeColor, fontSize: 11 }}>
                                  {TYPE_LABELS[recipe.type] || recipe.type}
                                </span>
                                <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', fontSize: 11 }}>
                                  Lv.{recipe.skillLevel}
                                </span>
                                <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-xp)22', color: 'var(--color-xp)', fontSize: 11 }}>
                                  {recipe.xp}xp
                                </span>
                                {recipe.duration > 0 && (
                                  <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)', fontSize: 11 }}>
                                    {formatDuration(recipe.duration)}
                                  </span>
                                )}
                                {owned > 0 && (
                                  <span className="px-1 py-0 rounded" style={{ backgroundColor: '#27ae6022', color: '#27ae60', fontSize: 11 }}>
                                    Owned: {owned}
                                  </span>
                                )}
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
                          {/* Compact material costs */}
                          <div className="flex gap-1.5 mt-1 ml-9">
                            {recipe.craftingInputs.map(i => {
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
          )}
        </div>
      </div>

      {/* Right: Detail Panel + Queue + Inventory */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col">
        {/* Detail Panel */}
        {selectedRecipe ? (
          <RecipeDetail
            recipe={selectedRecipe}
            skillId={activeSkillId}
            skillColor={skillColor}
            affordable={canAfford(selectedRecipe)}
            isCrafting={isActionRunning}
            actionTime={actionTime}
            resources={resources}
            navigation={navigation}
            owned={resources[selectedRecipe.id] || 0}
            onCraft={() => {
              setSubActivity(selectedRecipe.subActivityId);
              startAction();
            }}
            onQueue={() => {
              if (activeSkillId) {
                addToQueue(activeSkillId, selectedRecipe.subActivityId, currentActionRepeatTarget);
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center p-8" style={{ color: 'var(--color-text-muted)', flex: '1 0 200px' }}>
            <div className="text-center">
              <div className="mb-3" style={{ opacity: 0.4 }}><ItemIcon itemId={activeSkillId} itemType="skill" size={48} /></div>
              <div className="text-sm mb-1">Select a Recipe</div>
              <div className="text-xs" style={{ opacity: 0.6 }}>Choose a recipe from the list to view details and craft.</div>
            </div>
          </div>
        )}

        {/* Action Queue */}
        {actionQueue.length > 0 && (
          <div className="p-3 shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
            <h4 className="font-bold text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Queue ({actionQueue.length})
            </h4>
            <div className="space-y-1">
              {actionQueue.map((item, idx) => {
                const qSkillDef = SKILLS[item.skillId];
                const qActivity = qSkillDef?.subActivities?.find(a => a.id === item.subActivityId);
                return (
                  <div key={idx} className="flex items-center justify-between p-2 rounded text-xs"
                    style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}>
                    <div className="flex-1">
                      <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{qActivity?.name || item.subActivityId}</span>
                      <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>
                        {item.repeatCount === 0 ? '\u221E' : `${item.completedCount}/${item.repeatCount}`}
                      </span>
                    </div>
                    <button onClick={() => removeFromQueue(idx)} className="px-2 py-0.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>x</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Inventory for this skill */}
        <div className="flex-1 overflow-y-auto p-3" style={{ borderTop: '1px solid var(--color-border)' }}>
          <h4 className="font-bold text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {activeSkillId === 'tinkering' ? 'Crafted Tools' : 'Crafted Items'}
          </h4>
          <ProductionInventory skillId={activeSkillId} resources={resources} />
        </div>
      </div>
    </div>
  );
}

/* Recipe Detail Panel */
function RecipeDetail({ recipe, skillId, skillColor, affordable, isCrafting, actionTime, resources, navigation, owned, onCraft, onQueue }: {
  recipe: RecipeItem;
  skillId: string;
  skillColor: string;
  affordable: boolean;
  isCrafting: boolean;
  actionTime: number;
  resources: Record<string, number>;
  navigation: ReturnType<typeof useNavigation>;
  owned: number;
  onCraft: () => void;
  onQueue: () => void;
}) {
  const typeColor = TYPE_COLORS[recipe.type] || '#888';

  return (
    <div className="p-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div style={{
          width: 52, height: 52, borderRadius: 10,
          backgroundColor: typeColor + '18', border: `2px solid ${typeColor}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <ItemIcon itemId={recipe.id} itemType="consumable" size={36} fallbackLabel={recipe.name.charAt(0)} />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{recipe.name}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            <span className="px-1.5 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: typeColor + '22', color: typeColor }}>
              {TYPE_LABELS[recipe.type] || recipe.type}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
              Lv.{recipe.skillLevel}+
            </span>
            <span className="px-1.5 py-0.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-xp)22', color: 'var(--color-xp)' }}>
              {recipe.xp} XP
            </span>
            {owned > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: '#27ae6022', color: '#27ae60' }}>
                Owned: {owned}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
        {recipe.description}
      </div>

      {/* Effect */}
      <div className="mb-3 p-2.5 rounded" style={{ backgroundColor: skillColor + '0D', border: `1px solid ${skillColor}22` }}>
        <div className="text-[11px] font-bold mb-1" style={{ color: skillColor }}>Effect</div>
        <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{recipe.effect}</div>
        {recipe.duration > 0 && (
          <div className="flex gap-3 mt-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            <span>Duration: <b style={{ color: 'var(--color-text-secondary)' }}>{formatDuration(recipe.duration)}</b></span>
            <span>Cooldown: <b style={{ color: 'var(--color-text-secondary)' }}>{formatDuration(recipe.cooldown)}</b></span>
          </div>
        )}
        {recipe.speedBonus != null && (
          <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Speed Bonus: <b style={{ color: '#27ae60' }}>+{recipe.speedBonus}%</b>
            {recipe.targetSkillId && (
              <span> for <b style={{ color: 'var(--color-text-secondary)' }}>{SKILLS[recipe.targetSkillId]?.name || recipe.targetSkillId}</b></span>
            )}
          </div>
        )}
        {recipe.tier != null && (
          <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Tier: <b style={{ color: 'var(--color-text-secondary)' }}>T{recipe.tier}</b>
          </div>
        )}
      </div>

      {/* Stat Breakdown (for consumables with mechanical effects) */}
      {recipe.mechanicalEffect?.stats && recipe.mechanicalEffect.stats.length > 0 && (
        <div className="mb-3">
          <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Stat Bonuses</div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {recipe.mechanicalEffect.stats.map((s, i) => (
              <span key={i} className="text-xs" style={{ color: 'var(--color-success)' }}>
                +{s.value}{s.isPercentage ? '%' : ''} {s.stat.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      {recipe.mechanicalEffect?.healValue != null && (
        <div className="mb-3">
          <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Healing</div>
          <span className="text-xs" style={{ color: '#27ae60' }}>
            Restore {recipe.mechanicalEffect.healValue} HP
          </span>
        </div>
      )}

      {/* Materials */}
      <div className="mb-3">
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Materials</div>
        <div className="space-y-1">
          {recipe.craftingInputs.map(i => {
            const have = resources[i.resourceId] || 0;
            const enough = have >= i.quantity;
            const resName = RESOURCES[i.resourceId]?.name || i.resourceId.replace(/_/g, ' ');
            const sources = !enough ? getResourceSources(i.resourceId) : null;
            return (
              <div key={i.resourceId} className="flex items-center gap-1.5 text-xs">
                <ItemIcon itemId={i.resourceId} itemType="resource" size={14} fallbackLabel={resName.charAt(0)} />
                <span style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)' }}>{resName}</span>
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onCraft}
          disabled={!affordable || isCrafting}
          className="flex-1 p-2 rounded text-xs font-bold cursor-pointer"
          style={{
            backgroundColor: affordable && !isCrafting ? skillColor : 'var(--color-bg-tertiary)',
            color: affordable && !isCrafting ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            cursor: affordable && !isCrafting ? 'pointer' : 'not-allowed',
          }}
        >
          {isCrafting ? 'Crafting...' : affordable ? `Craft (${actionTime}s)` : 'Missing Materials'}
        </button>
        <button
          onClick={onQueue}
          disabled={!affordable}
          className="px-4 py-2 rounded text-xs font-bold cursor-pointer"
          style={{
            backgroundColor: affordable ? 'var(--color-info)' : 'var(--color-bg-tertiary)',
            color: affordable ? '#fff' : 'var(--color-text-muted)',
            border: 'none',
            cursor: affordable ? 'pointer' : 'not-allowed',
          }}
        >
          + Queue
        </button>
      </div>
    </div>
  );
}

/* Inventory section showing crafted consumables/tools */
function ProductionInventory({ skillId, resources }: { skillId: string; resources: Record<string, number> }) {
  let items: { id: string; name: string; type: string; qty: number; effect: string; tier?: number }[] = [];

  if (skillId === 'tinkering') {
    items = Object.values(TOOLS)
      .map(t => ({ id: t.id, name: t.name, type: 'tool', qty: resources[t.id] || 0, effect: t.effect, tier: t.tier }))
      .filter(i => i.qty > 0)
      .sort((a, b) => (b.tier || 0) - (a.tier || 0));
  } else {
    items = Object.values(CONSUMABLES)
      .filter(c => c.craftSkillId === skillId)
      .map(c => ({ id: c.id, name: c.name, type: c.type, qty: resources[c.id] || 0, effect: c.effect }))
      .filter(i => i.qty > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  if (items.length === 0) {
    return (
      <div className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
        No items crafted yet. Start crafting to build your stockpile!
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map(item => {
        const typeColor = TYPE_COLORS[item.type] || '#888';
        return (
          <div key={item.id} className="p-1.5 rounded flex items-center gap-2"
            style={{ backgroundColor: 'var(--color-bg-secondary)', borderLeft: `3px solid ${typeColor}` }}>
            <ItemIcon itemId={item.id} itemType="consumable" size={20} fallbackLabel={item.name.charAt(0)} />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                {item.name}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{item.effect}</div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: typeColor + '22', color: typeColor }}>
              x{item.qty}
            </span>
          </div>
        );
      })}
    </div>
  );
}
