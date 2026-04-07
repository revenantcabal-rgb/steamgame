import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { SKILLS } from '../../config/skills';
import { RESOURCES } from '../../config/resources';
import { xpForLevel, xpForSingleLevel, getGatheringSpeedMultiplier } from '../../types/skills';
import { getWorkerScaling } from '../../types/population';
import { getTripDuration } from '../../engine/PopulationEngine';
import { ProgressBar } from '../common/ProgressBar';
import { ItemIcon } from '../../utils/itemIcons';
import type { WorkerAssignment } from '../../types/population';

const SKILL_COLORS: Record<string, string> = {
  scavenging: '#e67e22',
  foraging: '#27ae60',
  salvage_hunting: '#e74c3c',
  water_reclamation: '#3498db',
  prospecting: '#f1c40f',
};
const SKILL_ICONS: Record<string, string> = {
  scavenging: '\u{1F3DA}',
  foraging: '\u{1F33F}',
  salvage_hunting: '\u{1F529}',
  water_reclamation: '\u{1F4A7}',
  prospecting: '\u26CF',
};

export function GatheringPanel() {
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const activeSubActivityId = useGameStore(s => s.activeSubActivityId);
  const setSubActivity = useGameStore(s => s.setSubActivity);
  const skills = useGameStore(s => s.skills);
  const resources = useGameStore(s => s.resources);
  const gatheringGoal = useGameStore(s => s.gatheringGoal);
  const setGatheringGoal = useGameStore(s => s.setGatheringGoal);

  if (!activeSkillId) return null;
  const skillDef = SKILLS[activeSkillId];
  const playerSkill = skills[activeSkillId];
  if (!skillDef || !playerSkill) return null;

  const skillColor = SKILL_COLORS[activeSkillId] || '#888';
  const scaling = getGatheringSpeedMultiplier(playerSkill.level);
  const activities = skillDef.subActivities || [];
  const regular = activities.filter(a => !a.isMixed);
  const sweeps = activities.filter(a => a.isMixed);

  const currentLevelXp = xpForLevel(playerSkill.level);
  const nextLevelXp = xpForLevel(playerSkill.level + 1);
  const xpIntoLevel = playerSkill.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return (
    <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
      {/* ═══ LEFT PANEL: Skill Info + Activities ═══ */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col" style={{ borderRight: '1px solid var(--color-border)' }}>
        {/* Sticky header with level + XP */}
        <div className="p-3 pb-0 shrink-0">
          {/* Skill name + level badge */}
          <div className="flex items-center gap-2 mb-2">
            <ItemIcon itemId={activeSkillId} itemType="skill" size={24} fallbackLabel={SKILL_ICONS[activeSkillId] || '\u2699'} />
            <h3 className="font-bold text-base" style={{ color: 'var(--color-text-primary)' }}>{skillDef.name}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded font-bold" style={{ backgroundColor: skillColor + '22', color: skillColor }}>
              Lv.{playerSkill.level}
            </span>
            {playerSkill.level >= 100 && (
              <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--color-accent)22', color: 'var(--color-accent)' }}>MAX</span>
            )}
          </div>

          {/* XP Bar */}
          {playerSkill.level < 100 && (
            <div className="mb-2">
              <div className="flex justify-between text-[11px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                <span>Level {playerSkill.level} &rarr; {playerSkill.level + 1}</span>
                <span>{xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP</span>
              </div>
              <ProgressBar value={xpIntoLevel} max={xpNeeded} color={skillColor} height="6px" />
            </div>
          )}

          {/* Speed / Yield / XP multipliers */}
          <div className="flex gap-3 mb-2 text-xs">
            <div className="flex-1 p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <div className="font-bold" style={{ color: skillColor }}>{scaling.actionTime}s</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Speed</div>
            </div>
            <div className="flex-1 p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <div className="font-bold" style={{ color: '#27ae60' }}>x{scaling.qtyMultiplier}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>Yield</div>
            </div>
            <div className="flex-1 p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
              <div className="font-bold" style={{ color: 'var(--color-xp)' }}>x{scaling.xpMultiplier}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>XP Mult</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{skillDef.description}</p>
        </div>

        {/* Activity list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="text-[11px] font-bold uppercase mb-1.5 mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Activities ({regular.length + sweeps.length})
          </div>

          <div className="space-y-1">
            {regular.map(activity => {
              const isSelected = activity.id === activeSubActivityId;
              const isLocked = (activity.levelReq || 0) > playerSkill.level;
              const primaryDrop = activity.resourceDrops[0];
              const owned = primaryDrop ? (resources[primaryDrop.resourceId] || 0) : 0;

              return (
                <button
                  key={activity.id}
                  onClick={() => !isLocked && setSubActivity(activity.id)}
                  className="w-full text-left p-2.5 rounded transition-all"
                  style={{
                    backgroundColor: isSelected ? skillColor + '15' : 'var(--color-bg-secondary)',
                    border: isSelected ? `2px solid ${skillColor}` : '1px solid var(--color-border)',
                    opacity: isLocked ? 0.4 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {primaryDrop ? (
                      <ItemIcon itemId={primaryDrop.resourceId} itemType="resource" size={28} fallbackLabel={activity.name.charAt(0)} />
                    ) : (
                      <div className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>{activity.name.charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs" style={{ color: isSelected ? skillColor : 'var(--color-text-primary)' }}>
                        {activity.name}
                      </div>
                      <div className="flex gap-1 mt-0.5 flex-wrap">
                        {isLocked ? (
                          <span className="px-1 py-0 rounded" style={{ backgroundColor: '#e74c3c22', color: '#e74c3c', fontSize: 11 }}>Lv.{activity.levelReq}</span>
                        ) : (
                          <>
                            {activity.resourceDrops.map(d => {
                              const res = RESOURCES[d.resourceId];
                              const scaledMin = Math.max(1, Math.floor(d.minQty * scaling.qtyMultiplier));
                              const scaledMax = Math.max(1, Math.floor(d.maxQty * scaling.qtyMultiplier));
                              return (
                                <span key={d.resourceId} className="px-1 py-0 rounded" style={{ backgroundColor: '#27ae6018', color: '#27ae60', fontSize: 11 }}>
                                  {res?.name || d.resourceId}: {scaledMin}-{scaledMax}
                                </span>
                              );
                            })}
                            <span className="px-1 py-0 rounded" style={{ backgroundColor: 'var(--color-xp)18', color: 'var(--color-xp)', fontSize: 11 }}>
                              {activity.xpPerAction} XP
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {!isLocked && primaryDrop && (
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{owned.toLocaleString()}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>owned</div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Sweep activities */}
            {sweeps.map(activity => {
              const isSelected = activity.id === activeSubActivityId;
              const isLocked = (activity.levelReq || 0) > playerSkill.level;
              return (
                <button
                  key={activity.id}
                  onClick={() => !isLocked && setSubActivity(activity.id)}
                  className="w-full text-left p-2.5 rounded transition-all"
                  style={{
                    backgroundColor: isSelected ? 'var(--color-accent)11' : 'var(--color-bg-secondary)',
                    border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-accent)33',
                    borderLeft: `4px solid var(--color-accent)`,
                    opacity: isLocked ? 0.4 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--color-accent)22', color: 'var(--color-accent)' }}>SWEEP</span>
                    <span className="font-bold text-xs" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{activity.name}</span>
                    {isLocked && <span className="text-[11px] px-1 py-0.5 rounded" style={{ backgroundColor: '#e74c3c', color: '#fff' }}>Lv.{activity.levelReq}</span>}
                    <span className="text-[11px] ml-auto" style={{ color: 'var(--color-xp)' }}>{activity.xpPerAction} XP</span>
                  </div>
                  {!isLocked && (
                    <div className="flex gap-2 ml-0.5 flex-wrap">
                      {activity.resourceDrops.map(d => {
                        const res = RESOURCES[d.resourceId];
                        const scaledMin = Math.max(1, Math.floor(d.minQty * scaling.qtyMultiplier));
                        const scaledMax = Math.max(1, Math.floor(d.maxQty * scaling.qtyMultiplier));
                        return (
                          <span key={d.resourceId} style={{ color: '#27ae60', fontSize: 11 }}>
                            {res?.name || d.resourceId}: {scaledMin}-{scaledMax}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Goal Setter (compact) */}
          <CompactGoalSetter skillId={activeSkillId} />
        </div>
      </div>

      {/* ═══ RIGHT PANEL: Workers + Assignments ═══ */}
      <div className="w-full lg:w-1/2 overflow-y-auto flex flex-col">
        <div className="p-3 shrink-0">
          {/* Worker summary */}
          <CompactWorkerSummary />

          {/* Deploy form */}
          <CompactDeployForm skillId={activeSkillId} />
        </div>

        {/* Assignments */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <CompactAssignments skillId={activeSkillId} />
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Worker Summary ─────────────────────────────── */
function CompactWorkerSummary() {
  const totalWorkers = usePopulationStore(s => s.totalWorkers);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const getAssignedWorkerCount = usePopulationStore(s => s.getAssignedWorkerCount);
  const totalWorkersLost = usePopulationStore(s => s.totalWorkersLost);
  const respawningWorkers = usePopulationStore(s => s.respawningWorkers);

  const assigned = getAssignedWorkerCount();
  const recovering = respawningWorkers.length;

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Workers</span>
        <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
          Settlement Population
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {[
          { label: 'Total', value: totalWorkers, color: 'var(--color-accent)' },
          { label: 'Free', value: availableWorkers, color: 'var(--color-success)' },
          { label: 'Working', value: assigned, color: 'var(--color-info)' },
          { label: 'Healing', value: recovering, color: 'var(--color-energy)' },
          { label: 'Deaths', value: totalWorkersLost, color: 'var(--color-danger)' },
        ].map(s => (
          <div key={s.label} className="p-1.5 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <div className="text-base font-bold" style={{ color: s.color }}>{s.value}</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Respawning countdown */}
      {recovering > 0 && (
        <div className="mt-1.5 p-1.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-energy)' }}>
          {respawningWorkers.map((rw, i) => {
            const remaining = Math.max(0, Math.ceil((rw.respawnAt - Date.now()) / 1000));
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            return (
              <span key={i} style={{ color: 'var(--color-energy)' }}>
                {i > 0 && ' | '}Recovering: {mins}:{secs.toString().padStart(2, '0')}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Compact Deploy Form ────────────────────────────────── */
function CompactDeployForm({ skillId }: { skillId: string }) {
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const createAssignment = usePopulationStore(s => s.createAssignment);
  const removeAssignment = usePopulationStore(s => s.removeAssignment);
  const assignments = usePopulationStore(s => s.assignments);
  const skills = useGameStore(s => s.skills);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [workerCount, setWorkerCount] = useState(() => Math.max(1, Math.min(1, availableWorkers)));

  const otherAssignments = assignments.filter(a => a.skillId !== skillId);

  useEffect(() => {
    setWorkerCount(prev => availableWorkers <= 0 ? 0 : Math.max(1, Math.min(prev, availableWorkers)));
  }, [availableWorkers]);

  const skillDef = SKILLS[skillId];
  const playerSkill = skills[skillId];
  const activities = skillDef?.subActivities || [];
  const unlockedActivities = activities.filter(a => (a.levelReq || 0) <= (playerSkill?.level || 0));
  const scaling = getWorkerScaling(workerCount);

  const handleCreate = () => {
    if (!selectedActivity || workerCount <= 0) return;
    const success = createAssignment(skillId, selectedActivity, workerCount);
    if (success) {
      setSelectedActivity('');
      setWorkerCount(1);
    }
  };

  return (
    <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="font-bold text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Deploy to {skillDef?.name}
      </div>

      <div className="flex gap-2 mb-2">
        <select
          value={selectedActivity}
          onChange={e => setSelectedActivity(e.target.value)}
          className="flex-1 p-1.5 rounded text-xs"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
        >
          <option value="">-- Activity --</option>
          {unlockedActivities.map(a => (
            <option key={a.id} value={a.id}>{a.isMixed ? '\u00BB ' : ''}{a.name}</option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          max={availableWorkers}
          value={workerCount}
          onChange={e => setWorkerCount(availableWorkers <= 0 ? 0 : Math.max(1, Math.min(availableWorkers, parseInt(e.target.value) || 1)))}
          disabled={availableWorkers <= 0}
          className="w-16 p-1.5 rounded text-xs text-center"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
        />
      </div>

      {selectedActivity && (
        <div className="flex gap-3 text-[11px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
          <span>Speed: <b style={{ color: 'var(--color-text-primary)' }}>x{scaling.speedMultiplier}</b></span>
          <span>Yield: <b style={{ color: 'var(--color-text-primary)' }}>x{scaling.yieldMultiplier}</b></span>
          <span>Risk: <b style={{ color: scaling.deathRiskPerTrip > 0.05 ? 'var(--color-danger)' : scaling.deathRiskPerTrip > 0 ? 'var(--color-energy)' : 'var(--color-success)' }}>
            {scaling.deathRiskPerTrip === 0 ? 'None' : `${(scaling.deathRiskPerTrip * 100).toFixed(1)}%`}
          </b></span>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={!selectedActivity || availableWorkers <= 0}
        className="w-full p-2 rounded text-xs font-bold cursor-pointer"
        style={{
          backgroundColor: selectedActivity && availableWorkers > 0 ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
          color: selectedActivity && availableWorkers > 0 ? '#000' : 'var(--color-text-muted)',
          border: 'none',
          cursor: selectedActivity && availableWorkers > 0 ? 'pointer' : 'not-allowed',
        }}
      >
        Deploy {workerCount} Worker{workerCount > 1 ? 's' : ''}
      </button>

      {/* Recall from other skills when no workers available */}
      {availableWorkers <= 0 && otherAssignments.length > 0 && (
        <div className="mt-2 p-2 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-energy)' }}>
          <div className="font-bold mb-1" style={{ color: 'var(--color-energy)' }}>All workers deployed elsewhere:</div>
          {otherAssignments.map(a => {
            const sk = SKILLS[a.skillId];
            const act = sk?.subActivities?.find(sa => sa.id === a.subActivityId);
            return (
              <div key={a.id} className="flex justify-between items-center py-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>{a.workerCount}w &rarr; {sk?.name}: {act?.name}</span>
                <button onClick={() => removeAssignment(a.id)} className="px-1.5 py-0.5 rounded cursor-pointer"
                  style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', fontSize: 10 }}>Recall</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Compact Assignments ─────────────────────────────────── */
function CompactAssignments({ skillId }: { skillId: string }) {
  const assignments = usePopulationStore(s => s.assignments);
  const removeAssignment = usePopulationStore(s => s.removeAssignment);
  const adjustWorkers = usePopulationStore(s => s.adjustWorkers);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const workerSkillXp = usePopulationStore(s => s.workerSkillXp);

  const skillAssignments = assignments.filter(a => a.skillId === skillId);
  const otherAssignments = assignments.filter(a => a.skillId !== skillId);
  const otherCount = otherAssignments.reduce((s, a) => s + a.workerCount, 0);

  return (
    <div>
      <div className="font-bold text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Active on {SKILLS[skillId]?.name} ({skillAssignments.length})
      </div>

      {skillAssignments.length === 0 ? (
        <div className="p-4 rounded text-center text-xs" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
          No workers deployed here yet. Select an activity and deploy workers above.
        </div>
      ) : (
        <div className="space-y-2">
          {skillAssignments.map(a => {
            const activity = SKILLS[a.skillId]?.subActivities?.find(sa => sa.id === a.subActivityId);
            const scaling = getWorkerScaling(a.workerCount);
            const tripDuration = getTripDuration(a, workerSkillXp);
            const totalGathered = Object.entries(a.totalResourcesGathered).filter(([, qty]) => qty > 0);

            return (
              <div key={a.id} className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                {/* Header row */}
                <div className="flex justify-between items-start mb-1.5">
                  <div>
                    <div className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>
                      {activity?.name || a.subActivityId}
                    </div>
                    <div className="flex gap-2 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                      <span>{a.workerCount}w</span>
                      <span>Trips: {a.tripsCompleted}</span>
                      {a.workersLost > 0 && <span style={{ color: 'var(--color-danger)' }}>Lost: {a.workersLost}</span>}
                      {scaling.deathRiskPerTrip > 0 && (
                        <span style={{ color: scaling.deathRiskPerTrip > 0.05 ? 'var(--color-danger)' : 'var(--color-energy)' }}>
                          Risk: {(scaling.deathRiskPerTrip * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => adjustWorkers(a.id, a.workerCount + 1)} disabled={availableWorkers <= 0}
                      className="px-1.5 py-0.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>+</button>
                    <button onClick={() => { if (a.workerCount > 1) adjustWorkers(a.id, a.workerCount - 1); else removeAssignment(a.id); }}
                      className="px-1.5 py-0.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>-</button>
                    <button onClick={() => removeAssignment(a.id)}
                      className="px-1.5 py-0.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Recall</button>
                  </div>
                </div>

                {/* Trip progress */}
                <div className="mb-1.5">
                  <div className="flex justify-between text-[11px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Trip</span>
                    <span>{a.tripProgress}s / {tripDuration}s</span>
                  </div>
                  <ProgressBar value={a.tripProgress} max={tripDuration} color="var(--color-energy)" height="5px" />
                </div>

                {/* Gathered resources */}
                {totalGathered.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {totalGathered.map(([id, qty]) => (
                      <span key={id} className="px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-success)', fontSize: 11 }}>
                        {RESOURCES[id]?.name || id}: {qty.toLocaleString()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Other skills summary */}
      {otherAssignments.length > 0 && (
        <OtherSkillsSummary assignments={otherAssignments} totalWorkers={otherCount} />
      )}
    </div>
  );
}

/* ─── Other Skills Summary (collapsed) ────────────────────── */
function OtherSkillsSummary({ assignments, totalWorkers }: { assignments: WorkerAssignment[]; totalWorkers: number }) {
  const removeAssignment = usePopulationStore(s => s.removeAssignment);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex justify-between items-center cursor-pointer"
        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}>
        <span className="text-xs font-bold">Other Skills: {totalWorkers} worker{totalWorkers !== 1 ? 's' : ''}</span>
        <span className="text-xs">{expanded ? '[-]' : '[+]'}</span>
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-0.5">
          {assignments.map(a => {
            const sk = SKILLS[a.skillId];
            const act = sk?.subActivities?.find(sa => sa.id === a.subActivityId);
            return (
              <div key={a.id} className="flex justify-between items-center text-[11px] py-0.5">
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {a.workerCount}w &rarr; {sk?.name}: {act?.name}
                </span>
                <button onClick={() => removeAssignment(a.id)} className="px-1.5 py-0.5 rounded cursor-pointer"
                  style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', fontSize: 10 }}>Recall</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Compact Goal Setter ─────────────────────────────────── */
function CompactGoalSetter({ skillId }: { skillId: string }) {
  const gatheringGoal = useGameStore(s => s.gatheringGoal);
  const setGatheringGoal = useGameStore(s => s.setGatheringGoal);
  const resources = useGameStore(s => s.resources);
  const skills = useGameStore(s => s.skills);
  const activeSubActivityId = useGameStore(s => s.activeSubActivityId);
  const skillDef = SKILLS[skillId];
  const playerSkill = skills[skillId];
  const [goalType, setGoalType] = useState<'none' | 'collect_amount' | 'reach_level'>(gatheringGoal.type);
  const [targetAmount, setTargetAmount] = useState(1000);
  const [targetLevel, setTargetLevel] = useState(playerSkill ? playerSkill.level + 5 : 10);
  const [selectedResource, setSelectedResource] = useState('');

  const activity = skillDef?.subActivities?.find(a => a.id === activeSubActivityId);
  const availableResources = activity?.resourceDrops.map(d => d.resourceId) || [];

  const handleSetGoal = () => {
    if (goalType === 'collect_amount' && selectedResource) {
      setGatheringGoal({ type: 'collect_amount', resourceId: selectedResource, targetAmount });
    } else if (goalType === 'reach_level') {
      setGatheringGoal({ type: 'reach_level', targetLevel });
    } else {
      setGatheringGoal({ type: 'none' });
    }
  };

  return (
    <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="font-bold text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>Goal</div>

      {gatheringGoal.type !== 'none' && (
        <div className="p-2 rounded mb-2 flex justify-between items-center text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-accent)' }}>
          <span style={{ color: 'var(--color-accent)' }}>
            {gatheringGoal.type === 'collect_amount'
              ? `${(resources[gatheringGoal.resourceId!] || 0).toLocaleString()} / ${gatheringGoal.targetAmount?.toLocaleString()} ${gatheringGoal.resourceId?.replace(/_/g, ' ')}`
              : `Lv.${playerSkill?.level} / ${gatheringGoal.targetLevel}`}
          </span>
          <button onClick={() => setGatheringGoal({ type: 'none' })}
            className="px-1.5 py-0.5 rounded cursor-pointer" style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', fontSize: 10 }}>Clear</button>
        </div>
      )}

      <div className="flex gap-1 mb-2">
        {(['none', 'collect_amount', 'reach_level'] as const).map(t => (
          <button key={t} onClick={() => setGoalType(t)}
            className="px-2 py-1 rounded text-[11px] cursor-pointer"
            style={{ backgroundColor: goalType === t ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: goalType === t ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
            {t === 'none' ? 'No Goal' : t === 'collect_amount' ? 'Gather' : 'Level'}
          </button>
        ))}
      </div>

      {goalType === 'collect_amount' && (
        <div className="flex gap-1.5 mb-2">
          <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)}
            className="flex-1 p-1.5 rounded text-[11px]" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
            <option value="">-- Resource --</option>
            {availableResources.map(r => (
              <option key={r} value={r}>{RESOURCES[r]?.name || r} ({resources[r] || 0})</option>
            ))}
          </select>
          <input type="number" min={1} value={targetAmount} onChange={e => setTargetAmount(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-20 p-1.5 rounded text-[11px] text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
        </div>
      )}
      {goalType === 'reach_level' && (
        <div className="flex gap-1.5 items-center mb-2">
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Target Lv.</span>
          <input type="number" min={(playerSkill?.level || 0) + 1} max={100} value={targetLevel}
            onChange={e => setTargetLevel(Math.max((playerSkill?.level || 0) + 1, Math.min(100, parseInt(e.target.value) || 0)))}
            className="w-16 p-1.5 rounded text-[11px] text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
        </div>
      )}

      {goalType !== 'none' && (
        <button onClick={handleSetGoal}
          className="w-full p-1.5 rounded text-xs font-bold cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
          Set Goal
        </button>
      )}
    </div>
  );
}
