import { useState } from 'react';
import { usePopulationStore } from '../../store/usePopulationStore';
import { SKILLS } from '../../config/skills';
import { WORKER_RANKS, getWorkerRankDef } from '../../types/population';
import type { IndividualWorker, WorkerRank, WorkerStats } from '../../types/population';
import { getSurvivabilityPercent } from '../../types/population';
import { ProgressBar } from '../common/ProgressBar';

const STAT_COLORS: Record<keyof WorkerStats, string> = {
  strength: '#e74c3c',
  endurance: '#f39c12',
  perception: '#9b59b6',
  agility: '#27ae60',
  intellect: '#3498db',
};

const STAT_LABELS: Record<keyof WorkerStats, string> = {
  strength: 'STR',
  endurance: 'END',
  perception: 'PER',
  agility: 'AGI',
  intellect: 'INT',
};

const RANK_BONUS_DESCRIPTIONS: Record<WorkerRank, string> = {
  recruit: 'No bonuses (learning the ropes)',
  veteran: '+5% Yield, +5% Survivability, +3% Trip Speed',
  grandfather: '+12% Yield, +12% Survivability, +8% Trip Speed, +5% Rare Drop',
  legend: '+20% Yield, +20% Survivability, +15% Trip Speed, +10% Rare Drop, +10% XP',
};

function getTopStat(stats: WorkerStats): { key: keyof WorkerStats; value: number } {
  const entries = Object.entries(stats) as [keyof WorkerStats, number][];
  return entries.reduce((best, [k, v]) => (v > best.value ? { key: k, value: v } : best), { key: entries[0][0], value: entries[0][1] });
}

function getWorkerStatus(worker: IndividualWorker, assignments: any[]): { label: string; color: string } {
  if (worker.isRespawning) {
    return { label: 'Recovering', color: 'var(--color-danger)' };
  }
  if (worker.currentAssignmentId) {
    const assignment = assignments.find((a: any) => a.id === worker.currentAssignmentId);
    if (assignment) {
      const skillDef = SKILLS[assignment.skillId];
      return { label: `Gathering: ${skillDef?.name || assignment.skillId}`, color: 'var(--color-info)' };
    }
    return { label: 'Gathering', color: 'var(--color-info)' };
  }
  if (worker.encampmentBuildingId) {
    // Dynamically import building names
    try {
      const { BUILDINGS } = require('../../config/buildings');
      const building = BUILDINGS[worker.encampmentBuildingId];
      return { label: `Building: ${building?.name || worker.encampmentBuildingId}`, color: '#9b59b6' };
    } catch {
      return { label: 'Building duty', color: '#9b59b6' };
    }
  }
  return { label: 'Idle', color: 'var(--color-success)' };
}

function getSurvivabilityColor(pct: number): string {
  if (pct >= 95) return 'var(--color-success)';
  if (pct >= 85) return 'var(--color-energy)';
  return 'var(--color-danger)';
}

function getNextRank(rank: WorkerRank): typeof WORKER_RANKS[number] | null {
  const idx = WORKER_RANKS.findIndex(r => r.id === rank);
  if (idx < 0 || idx >= WORKER_RANKS.length - 1) return null;
  return WORKER_RANKS[idx + 1];
}

export function PopulationPanel() {
  const workers = usePopulationStore(s => s.workers);
  const assignments = usePopulationStore(s => s.assignments);
  const totalWorkers = usePopulationStore(s => s.totalWorkers);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const totalWorkersLost = usePopulationStore(s => s.totalWorkersLost);
  const respawningWorkers = usePopulationStore(s => s.respawningWorkers);
  const assignedCount = usePopulationStore(s => s.getAssignedWorkerCount());

  const [selectedRank, setSelectedRank] = useState<WorkerRank>('recruit');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [hoveredRank, setHoveredRank] = useState<WorkerRank | null>(null);

  const recoveringCount = workers.filter(w => w.isRespawning).length;
  const filteredWorkers = workers.filter(w => w.rank === selectedRank);
  const selectedWorker = selectedWorkerId ? workers.find(w => w.id === selectedWorkerId) || null : null;

  const rankCounts: Record<WorkerRank, number> = {
    recruit: workers.filter(w => w.rank === 'recruit').length,
    veteran: workers.filter(w => w.rank === 'veteran').length,
    grandfather: workers.filter(w => w.rank === 'grandfather').length,
    legend: workers.filter(w => w.rank === 'legend').length,
  };

  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
      {/* Left Panel - Roster */}
      <div
        className="w-full lg:w-1/2 overflow-y-auto p-4"
        style={{ borderRight: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Settlement Population
        </h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <StatBox label="Total" value={totalWorkers} color="var(--color-accent)" />
          <StatBox label="Available" value={availableWorkers} color="var(--color-success)" />
          <StatBox label="Assigned" value={assignedCount} color="var(--color-info)" />
          <StatBox label="Recovering" value={recoveringCount} color="var(--color-danger)" />
        </div>

        {/* Rank Tabs */}
        <div className="flex gap-1 mb-3 relative">
          {WORKER_RANKS.map(rankDef => {
            const isActive = selectedRank === rankDef.id;
            const isHovered = hoveredRank === rankDef.id;
            return (
              <div key={rankDef.id} className="relative flex-1">
                <button
                  onClick={() => setSelectedRank(rankDef.id)}
                  onMouseEnter={() => setHoveredRank(rankDef.id)}
                  onMouseLeave={() => setHoveredRank(null)}
                  className="w-full px-2 py-2 rounded text-xs font-bold cursor-pointer transition-all"
                  style={{
                    backgroundColor: isActive ? rankDef.color + '30' : 'var(--color-bg-secondary)',
                    color: isActive ? rankDef.color : 'var(--color-text-muted)',
                    border: isActive ? `1px solid ${rankDef.color}` : '1px solid var(--color-border)',
                  }}
                >
                  <div>{rankDef.name}</div>
                  <div style={{ fontSize: '10px', opacity: 0.8 }}>{rankCounts[rankDef.id]}</div>
                </button>
                {/* Hover Tooltip */}
                {isHovered && (
                  <div
                    className="absolute z-50 p-2 rounded text-xs"
                    style={{
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      marginTop: '4px',
                      backgroundColor: 'var(--color-bg-secondary)',
                      border: `1px solid ${rankDef.color}`,
                      color: 'var(--color-text-primary)',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                  >
                    <div className="font-bold mb-1" style={{ color: rankDef.color }}>{rankDef.name} Bonuses</div>
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {RANK_BONUS_DESCRIPTIONS[rankDef.id]}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Worker List */}
        <div className="space-y-1">
          {filteredWorkers.length === 0 ? (
            <div
              className="p-4 rounded text-center text-sm"
              style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}
            >
              No {getWorkerRankDef(selectedRank).name.toLowerCase()} workers in the settlement.
            </div>
          ) : (
            filteredWorkers.map(worker => {
              const status = getWorkerStatus(worker, assignments);
              const topStat = getTopStat(worker.stats);
              const survivability = getSurvivabilityPercent(worker.stats.endurance, worker.totalDispatches, 0.15);
              const isSelected = selectedWorkerId === worker.id;
              const rankDef = getWorkerRankDef(worker.rank);

              return (
                <div
                  key={worker.id}
                  onClick={() => setSelectedWorkerId(worker.id)}
                  className="p-2 rounded cursor-pointer transition-all"
                  style={{
                    backgroundColor: isSelected ? rankDef.color + '18' : 'var(--color-bg-secondary)',
                    border: isSelected ? `1px solid ${rankDef.color}60` : '1px solid transparent',
                    borderLeft: isSelected ? `3px solid ${rankDef.color}` : '3px solid transparent',
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Left: Name + Level */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                        {worker.name}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: 'var(--color-bg-tertiary)',
                          color: 'var(--color-xp)',
                          fontSize: '10px',
                        }}
                      >
                        Lv.{worker.level}
                      </span>
                    </div>

                    {/* Right: Status */}
                    <span
                      className="px-2 py-0.5 rounded text-xs flex-shrink-0"
                      style={{
                        backgroundColor: status.color + '20',
                        color: status.color,
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Bottom row: top stat + survivability */}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: STAT_COLORS[topStat.key], fontSize: '10px' }}>
                      {STAT_LABELS[topStat.key]} {topStat.value}
                    </span>
                    <span className="text-xs" style={{ color: getSurvivabilityColor(survivability), fontSize: '10px' }}>
                      {survivability.toFixed(1)}% surv.
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Worker Detail */}
      <div className="w-full lg:w-1/2 overflow-y-auto p-4">
        {selectedWorker ? (
          <WorkerDetail worker={selectedWorker} assignments={assignments} />
        ) : (
          <div
            className="h-full flex items-center justify-center p-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <div className="text-center">
              <div className="text-4xl mb-3" style={{ opacity: 0.3 }}>&#9878;</div>
              <div className="text-sm">Select a worker from the roster to view details</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="p-2 rounded text-center"
      style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
    >
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>{label}</div>
    </div>
  );
}

function WorkerDetail({ worker, assignments }: { worker: IndividualWorker; assignments: any[] }) {
  const rankDef = getWorkerRankDef(worker.rank);
  const nextRank = getNextRank(worker.rank);
  const survivability = getSurvivabilityPercent(worker.stats.endurance, worker.totalDispatches, 0.15);
  const status = getWorkerStatus(worker, assignments);

  // Dispatch history sorted by count
  const dispatchHistory = Object.entries(worker.dispatchesBySkill)
    .map(([skillId, count]) => ({
      skillId,
      name: SKILLS[skillId]?.name || skillId,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  const statKeys: (keyof WorkerStats)[] = ['strength', 'endurance', 'perception', 'agility', 'intellect'];
  const maxStat = Math.max(...statKeys.map(k => worker.stats[k]), 30); // min bar scale of 30

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {worker.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            {/* Rank Badge */}
            <span
              className="px-2 py-1 rounded text-xs font-bold"
              style={{
                backgroundColor: rankDef.color + '30',
                color: rankDef.color,
                border: `1px solid ${rankDef.color}`,
              }}
            >
              {rankDef.name}
            </span>
            {/* Level */}
            <span
              className="px-2 py-1 rounded text-xs font-bold"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-xp)',
              }}
            >
              Level {worker.level}
            </span>
          </div>
        </div>
      </div>

      {/* Dispatch Count + Rank Progress */}
      <div
        className="p-3 rounded mb-4"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Dispatches</span>
          <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {worker.totalDispatches}
          </span>
        </div>
        {nextRank ? (
          <div>
            <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              <span>Progress to {nextRank.name}</span>
              <span style={{ color: nextRank.color }}>
                {worker.totalDispatches} / {nextRank.minDispatches}
              </span>
            </div>
            <ProgressBar
              value={worker.totalDispatches}
              max={nextRank.minDispatches}
              color={nextRank.color}
              height="6px"
            />
          </div>
        ) : (
          <div className="text-xs" style={{ color: rankDef.color, fontStyle: 'italic' }}>
            Maximum rank achieved
          </div>
        )}
      </div>

      {/* Stats */}
      <div
        className="p-3 rounded mb-4"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Attributes
        </div>
        <div className="space-y-2">
          {statKeys.map(key => {
            const value = worker.stats[key];
            const color = STAT_COLORS[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="text-xs font-bold"
                  style={{ color, width: '32px', textAlign: 'right' }}
                >
                  {STAT_LABELS[key]}
                </span>
                <div className="flex-1">
                  <ProgressBar value={value} max={maxStat} color={color} height="8px" />
                </div>
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--color-text-primary)', width: '28px', textAlign: 'right' }}
                >
                  {value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Survivability */}
      <div
        className="p-3 rounded mb-4 text-center"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Survivability</div>
        <div
          className="text-3xl font-bold"
          style={{ color: getSurvivabilityColor(survivability) }}
        >
          {survivability.toFixed(1)}%
        </div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Based on endurance and experience (solo risk)
        </div>
      </div>

      {/* Current Assignment */}
      <div
        className="p-3 rounded mb-4"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Current Assignment
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <span className="text-sm" style={{ color: status.color, fontWeight: 600 }}>
            {status.label}
          </span>
        </div>
        {worker.currentAssignmentId && (() => {
          const assignment = assignments.find(a => a.id === worker.currentAssignmentId);
          if (!assignment) return null;
          const skillDef = SKILLS[assignment.skillId];
          const activity = skillDef?.subActivities?.find((a: any) => a.id === assignment.subActivityId);
          return (
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {skillDef?.name} &mdash; {activity?.name || assignment.subActivityId}
            </div>
          );
        })()}
      </div>

      {/* Dispatch History */}
      <div
        className="p-3 rounded mb-4"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Dispatch History
        </div>
        {dispatchHistory.length === 0 ? (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No dispatches yet
          </div>
        ) : (
          <div className="space-y-1">
            {dispatchHistory.map(entry => (
              <div key={entry.skillId} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
                  {entry.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: 'var(--color-accent)',
                    fontSize: '10px',
                  }}
                >
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rank Bonuses */}
      <div
        className="p-3 rounded"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
      >
        <div className="text-xs font-bold mb-2" style={{ color: rankDef.color }}>
          {rankDef.name} Rank Bonuses
        </div>
        {worker.rank === 'recruit' ? (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            No bonuses yet. Complete dispatches to rank up!
          </div>
        ) : (
          <div className="space-y-1">
            {rankDef.bonuses.yield > 0 && (
              <BonusRow label="Yield" value={`+${rankDef.bonuses.yield}%`} color="var(--color-success)" />
            )}
            {rankDef.bonuses.survivability > 0 && (
              <BonusRow label="Survivability" value={`+${rankDef.bonuses.survivability}%`} color="var(--color-energy)" />
            )}
            {rankDef.bonuses.tripSpeed > 0 && (
              <BonusRow label="Trip Speed" value={`+${rankDef.bonuses.tripSpeed}%`} color="var(--color-info)" />
            )}
            {rankDef.bonuses.rareDrop > 0 && (
              <BonusRow label="Rare Drop" value={`+${rankDef.bonuses.rareDrop}%`} color="#9b59b6" />
            )}
            {rankDef.bonuses.xp > 0 && (
              <BonusRow label="XP Gain" value={`+${rankDef.bonuses.xp}%`} color="var(--color-xp)" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BonusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
