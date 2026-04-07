import { useState } from 'react';
import { useEncampmentStore } from '../../store/useEncampmentStore';
import { useGameStore } from '../../store/useGameStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { BUILDINGS, BUILDING_LIST, BUILDING_CATEGORIES, getBuildCost, getBonusAtLevel, getWorkerTickInterval } from '../../config/buildings';
import type { BuildingDefinition, BuildingCategory } from '../../config/buildings';
import { RESOURCES } from '../../config/resources';

const BONUS_LABELS: Record<string, string> = {
  gathering_speed_scavenging: 'Scavenging Speed',
  gathering_speed_foraging: 'Foraging Speed',
  gathering_speed_salvage_hunting: 'Salvage Hunting Speed',
  gathering_speed_water_reclamation: 'Water Reclamation Speed',
  gathering_speed_prospecting: 'Prospecting Speed',
  gathering_yield_all: 'All Gathering Yield',
  production_speed: 'Production Speed',
  combat_damage: 'Combat Damage',
  combat_defense: 'Combat Defense',
  combat_hp: 'Max HP',
  worker_speed: 'Worker Speed',
  worker_survivability: 'Worker Survivability',
  worker_capacity: 'Population Cap',
  hero_xp: 'Hero XP Gain',
  hero_combat_damage: 'Hero Combat Damage',
  marketplace_sell_bonus: 'Marketplace Sell Value',
  rare_drop_chance: 'Rare Drop Chance',
  worker_respawn_speed: 'Worker Respawn Speed',
  expedition_reward: 'Expedition Rewards',
};

function getCategoryColor(category: BuildingCategory): string {
  return BUILDING_CATEGORIES.find(c => c.id === category)?.color || '#888';
}

function getCategoryName(category: BuildingCategory): string {
  return BUILDING_CATEGORIES.find(c => c.id === category)?.name || category;
}

export function EncampmentPanel() {
  const buildings = useEncampmentStore(s => s.buildings);
  const buildOrUpgrade = useEncampmentStore(s => s.buildOrUpgrade);
  const assignWorker = useEncampmentStore(s => s.assignWorker);
  const removeWorker = useEncampmentStore(s => s.removeWorker);
  const resources = useGameStore(s => s.resources);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<BuildingCategory | 'all'>('all');

  const totalBuilt = Object.keys(buildings).length;

  const filtered = BUILDING_LIST.filter(b =>
    filterCategory === 'all' || b.category === filterCategory
  );

  // Group by category
  const grouped: Record<string, BuildingDefinition[]> = {};
  for (const b of filtered) {
    if (!grouped[b.category]) grouped[b.category] = [];
    grouped[b.category].push(b);
  }

  const selectedDef = selectedId ? BUILDINGS[selectedId] : null;
  const selectedBuilding = selectedId ? buildings[selectedId] : null;

  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
      {/* Left: Building List */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Header */}
        <div className="p-3 pb-0 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Encampment</h3>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {totalBuilt} / {BUILDING_LIST.length} built
            </span>
          </div>

          {/* Category filter tabs */}
          <div className="flex gap-1 mb-2 flex-wrap">
            <button
              onClick={() => setFilterCategory('all')}
              className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
              style={{
                backgroundColor: filterCategory === 'all' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                color: filterCategory === 'all' ? '#000' : 'var(--color-text-muted)',
                border: 'none',
              }}
            >
              All
            </button>
            {BUILDING_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className="px-2 py-0.5 rounded text-[11px] cursor-pointer"
                style={{
                  backgroundColor: filterCategory === cat.id ? cat.color : 'var(--color-bg-tertiary)',
                  color: filterCategory === cat.id ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Building List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {filtered.length === 0 ? (
            <div className="text-xs p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
              No buildings in this category.
            </div>
          ) : (
            <div className="space-y-3">
              {BUILDING_CATEGORIES.filter(cat => grouped[cat.id]).map(cat => (
                <div key={cat.id}>
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-1.5 pb-1" style={{ borderBottom: `2px solid ${cat.color}` }}>
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      {cat.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      ({grouped[cat.id].length})
                    </span>
                  </div>

                  <div className="space-y-1">
                    {grouped[cat.id].map(def => {
                      const built = buildings[def.id];
                      const level = built?.level || 0;
                      const isSelected = selectedId === def.id;
                      const bonus = level > 0 ? getBonusAtLevel(def, level) : 0;

                      return (
                        <button
                          key={def.id}
                          onClick={() => setSelectedId(isSelected ? null : def.id)}
                          className="w-full text-left p-2 rounded text-xs cursor-pointer"
                          style={{
                            backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
                            border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                            borderLeft: isSelected
                              ? `4px solid ${cat.color}`
                              : `3px solid ${cat.color}`,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                                  {def.name}
                                </span>
                                {level > 0 ? (
                                  <span
                                    className="px-1.5 py-0 rounded text-[11px] font-bold"
                                    style={{
                                      backgroundColor: cat.color + '33',
                                      color: cat.color,
                                    }}
                                  >
                                    Lv.{level}
                                  </span>
                                ) : (
                                  <span
                                    className="px-1.5 py-0 rounded text-[11px]"
                                    style={{
                                      backgroundColor: 'var(--color-bg-primary)',
                                      color: 'var(--color-text-muted)',
                                    }}
                                  >
                                    Not Built
                                  </span>
                                )}
                              </div>
                              {level > 0 && (
                                <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-success)' }}>
                                  +{bonus}{def.isFlatBonus ? '' : '%'} {BONUS_LABELS[def.bonusType] || def.bonusType}
                                </div>
                              )}
                            </div>
                            <div className="shrink-0 text-right">
                              {built?.assignedWorker ? (
                                <span className="text-[11px] font-bold" style={{ color: 'var(--color-success)' }}>
                                  Worker Assigned
                                </span>
                              ) : level > 0 ? (
                                <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                                  No Worker
                                </span>
                              ) : null}
                            </div>
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

      {/* Right: Detail Panel */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col">
        {selectedDef ? (
          <BuildingDetail
            def={selectedDef}
            built={selectedBuilding}
            resources={resources}
            availableWorkers={availableWorkers}
            onBuild={() => buildOrUpgrade(selectedDef.id)}
            onAssignWorker={() => assignWorker(selectedDef.id)}
            onRemoveWorker={() => removeWorker(selectedDef.id)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Select a building to view details
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
                Build and upgrade structures to strengthen your encampment
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Building Detail Panel ──────────────────────────────────── */
function BuildingDetail({
  def,
  built,
  resources,
  availableWorkers,
  onBuild,
  onAssignWorker,
  onRemoveWorker,
}: {
  def: BuildingDefinition;
  built: { level: number; assignedWorker: boolean; workerTickProgress: number } | null | undefined;
  resources: Record<string, number>;
  availableWorkers: number;
  onBuild: () => void;
  onAssignWorker: () => void;
  onRemoveWorker: () => void;
}) {
  const level = built?.level || 0;
  const targetLevel = level + 1;
  const isMaxLevel = level >= def.maxLevel;
  const catColor = getCategoryColor(def.category);
  const catName = getCategoryName(def.category);

  const costs = isMaxLevel ? [] : getBuildCost(def, targetLevel);
  const canAfford = costs.every(c => (resources[c.resourceId] || 0) >= c.quantity);

  const currentBonus = level > 0 ? getBonusAtLevel(def, level) : 0;
  const nextBonus = !isMaxLevel ? getBonusAtLevel(def, targetLevel) : 0;
  const bonusSuffix = def.isFlatBonus ? '' : '%';
  const bonusLabel = BONUS_LABELS[def.bonusType] || def.bonusType;

  const tickInterval = level > 0 ? getWorkerTickInterval(def, level) : getWorkerTickInterval(def, 1);
  const workerResName = RESOURCES[def.workerResourceId]?.name || def.workerResourceId;

  return (
    <div className="p-4 flex flex-col gap-3" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>
            {def.name}
          </span>
          {level > 0 && (
            <span
              className="px-2 py-0.5 rounded text-[11px] font-bold"
              style={{ backgroundColor: catColor + '33', color: catColor }}
            >
              Level {level}{isMaxLevel ? ' (MAX)' : ''}
            </span>
          )}
        </div>
        <span
          className="px-1.5 py-0.5 rounded text-[11px]"
          style={{ backgroundColor: catColor + '22', color: catColor }}
        >
          {catName}
        </span>
      </div>

      {/* Description */}
      <div>
        <div className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
          {def.description}
        </div>
        <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          {def.flavor}
        </div>
      </div>

      {/* Current Bonus + Progression */}
      <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Bonus: {bonusLabel}
        </div>
        {level > 0 ? (
          <div className="text-xs">
            <span style={{ color: 'var(--color-success)' }}>
              Level {level}: +{currentBonus}{bonusSuffix}
            </span>
            {!isMaxLevel && (
              <>
                <span style={{ color: 'var(--color-text-muted)' }}> &rarr; </span>
                <span style={{ color: 'var(--color-info)' }}>
                  Level {targetLevel}: +{nextBonus}{bonusSuffix}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Build to gain +{getBonusAtLevel(def, 1)}{bonusSuffix} {bonusLabel}
          </div>
        )}
      </div>

      {/* Worker Trickle Info */}
      <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
        <div className="text-[11px] font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Worker Production
        </div>
        <div className="text-xs" style={{ color: 'var(--color-energy)' }}>
          Assigned worker produces {def.workerBaseYield} {workerResName} every {tickInterval.toFixed(1)}s
        </div>

        {/* Worker assignment */}
        {level > 0 && (
          <div className="mt-2">
            {built?.assignedWorker ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold" style={{ color: 'var(--color-success)' }}>
                  Worker Assigned
                </span>
                {built.workerTickProgress > 0 && (
                  <div className="flex-1">
                    <div
                      className="rounded"
                      style={{
                        height: '4px',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        className="rounded"
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (built.workerTickProgress / tickInterval) * 100)}%`,
                          backgroundColor: 'var(--color-energy)',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                  </div>
                )}
                <button
                  onClick={onRemoveWorker}
                  className="px-2 py-1 rounded text-[11px] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--color-danger)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={onAssignWorker}
                disabled={availableWorkers <= 0}
                className="px-3 py-1 rounded text-[11px] font-bold cursor-pointer"
                style={{
                  backgroundColor: availableWorkers > 0 ? 'var(--color-info)' : 'var(--color-bg-tertiary)',
                  color: availableWorkers > 0 ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                }}
              >
                {availableWorkers > 0
                  ? `Assign Worker (${availableWorkers} available)`
                  : 'No Workers Available'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Build / Upgrade Section */}
      {!isMaxLevel && (
        <div className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
          <div className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            {level === 0 ? 'Build Cost' : `Upgrade to Level ${targetLevel}`}
          </div>

          {/* Resource cost list */}
          <div className="space-y-1 mb-2">
            {costs.map(c => {
              const have = resources[c.resourceId] || 0;
              const enough = have >= c.quantity;
              const resName = RESOURCES[c.resourceId]?.name || c.resourceId;
              return (
                <div key={c.resourceId} className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--color-text-primary)' }}>{resName}</span>
                  <span className="font-mono" style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {have} / {c.quantity}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Build/Upgrade Button */}
          <button
            onClick={onBuild}
            disabled={!canAfford}
            className="w-full p-2 rounded text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: canAfford ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
              color: canAfford ? '#000' : 'var(--color-text-muted)',
              border: 'none',
              fontSize: '13px',
            }}
          >
            {level === 0
              ? (canAfford ? 'Build' : 'Missing Resources')
              : (canAfford ? `Upgrade to Level ${targetLevel}` : 'Missing Resources')}
          </button>
        </div>
      )}

      {isMaxLevel && (
        <div className="p-2 rounded text-center" style={{ backgroundColor: catColor + '15', border: `1px solid ${catColor}44` }}>
          <span className="text-xs font-bold" style={{ color: catColor }}>
            Maximum Level Reached
          </span>
        </div>
      )}
    </div>
  );
}
