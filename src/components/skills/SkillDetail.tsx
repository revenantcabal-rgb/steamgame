import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { SKILLS } from '../../config/skills';
import { RESOURCES } from '../../config/resources';
import { xpForLevel, xpForSingleLevel, getGatheringSpeedMultiplier } from '../../types/skills';
import { getActionTime } from '../../engine/SkillEngine';
import { getWorkerScaling } from '../../types/population';
import { getTripDuration } from '../../engine/PopulationEngine';
import { ProgressBar } from '../common/ProgressBar';
import { ItemIcon } from '../../utils/itemIcons';
import type { GatheringGoal } from '../../store/useGameStore';
import type { WorkerAssignment } from '../../types/population';
import type { SubActivity } from '../../types/skills';

export function SkillDetail() {
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const activeSubActivityId = useGameStore(s => s.activeSubActivityId);
  const skills = useGameStore(s => s.skills);
  const actionProgress = useGameStore(s => s.actionProgress);
  const setSubActivity = useGameStore(s => s.setSubActivity);
  const resources = useGameStore(s => s.resources);
  const isActionRunning = useGameStore(s => s.isActionRunning);
  const actionQueue = useGameStore(s => s.actionQueue);
  const currentActionRepeatTarget = useGameStore(s => s.currentActionRepeatTarget);
  const currentActionRepeatCount = useGameStore(s => s.currentActionRepeatCount);
  const startAction = useGameStore(s => s.startAction);
  const stopAction = useGameStore(s => s.stopAction);
  const setRepeatTarget = useGameStore(s => s.setRepeatTarget);
  const addToQueue = useGameStore(s => s.addToQueue);
  const removeFromQueue = useGameStore(s => s.removeFromQueue);

  if (!activeSkillId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8" style={{ color: 'var(--color-text-muted)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">&#9760;</div>
          <div className="text-lg mb-2">Select a Skill</div>
          <div className="text-sm">Choose a skill from the sidebar to begin training.</div>
        </div>
      </div>
    );
  }

  const skillDef = SKILLS[activeSkillId];
  const playerSkill = skills[activeSkillId];
  if (!skillDef || !playerSkill) return null;

  const currentLevelXp = xpForLevel(playerSkill.level);
  const nextLevelXp = xpForLevel(playerSkill.level + 1);
  const xpIntoLevel = playerSkill.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const actionTime = getActionTime(activeSkillId, playerSkill.level);
  const hasSubActivities = skillDef.subActivities && skillDef.subActivities.length > 0;
  const activeActivity = hasSubActivities
    ? skillDef.subActivities!.find(a => a.id === activeSubActivityId)
    : null;
  const isGathering = skillDef.category === 'gathering';
  const isProduction = skillDef.category === 'production';
  const scaling = isGathering ? getGatheringSpeedMultiplier(playerSkill.level) : null;

  const REPEAT_OPTIONS = [
    { label: '1', value: 1 },
    { label: '10', value: 10 },
    { label: '100', value: 100 },
    { label: '1000', value: 1000 },
    { label: '\u221E', value: 0 },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {skillDef.name}
        </h2>
        <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
          {skillDef.description}
        </p>
        {isGathering && scaling && (
          <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span>Speed: <b>{scaling.actionTime}s</b>/action</span>
            <span>Yield: <b>x{scaling.qtyMultiplier}</b></span>
            <span>XP: <b>x{scaling.xpMultiplier}</b></span>
          </div>
        )}
      </div>

      {/* Action Controls (Production skills only — gathering uses worker deployment) */}
      {!isGathering && (
        <div className="mb-4 p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Action Controls</h3>

          {/* Repeat selector */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Repeat:</span>
            <div className="flex gap-1">
              {REPEAT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRepeatTarget(opt.value)}
                  className="px-3 py-1 rounded text-xs font-bold cursor-pointer transition-all"
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
            <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
              {isActionRunning
                ? currentActionRepeatTarget === 0
                  ? `Running (\u221E)`
                  : `Action ${currentActionRepeatCount} of ${currentActionRepeatTarget}`
                : currentActionRepeatTarget === 0
                  ? 'Infinite'
                  : `${currentActionRepeatTarget} actions`}
            </span>
          </div>

          {/* Start / Stop / Queue buttons */}
          <div className="flex gap-2">
            {!isActionRunning ? (
              <button
                onClick={startAction}
                disabled={!activeSubActivityId}
                className="flex-1 px-4 py-2 rounded font-bold text-sm cursor-pointer transition-all"
                style={{
                  backgroundColor: activeSubActivityId ? '#27ae60' : 'var(--color-bg-tertiary)',
                  color: activeSubActivityId ? '#fff' : 'var(--color-text-muted)',
                  border: 'none',
                  opacity: activeSubActivityId ? 1 : 0.5,
                  cursor: activeSubActivityId ? 'pointer' : 'not-allowed',
                }}
              >
                &#9654; Start
              </button>
            ) : (
              <button
                onClick={stopAction}
                className="flex-1 px-4 py-2 rounded font-bold text-sm cursor-pointer transition-all"
                style={{
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                }}
              >
                &#9632; Stop
              </button>
            )}
            <button
              onClick={() => {
                if (activeSkillId && activeSubActivityId) {
                  addToQueue(activeSkillId, activeSubActivityId, currentActionRepeatTarget);
                }
              }}
              disabled={!activeSubActivityId}
              className="px-4 py-2 rounded font-bold text-sm cursor-pointer transition-all"
              style={{
                backgroundColor: activeSubActivityId ? 'var(--color-info)' : 'var(--color-bg-tertiary)',
                color: activeSubActivityId ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
                opacity: activeSubActivityId ? 1 : 0.5,
                cursor: activeSubActivityId ? 'pointer' : 'not-allowed',
              }}
            >
              + Queue
            </button>
          </div>
        </div>
      )}

      {/* Action Progress (only when running, production only) */}
      {!isGathering && isActionRunning && activeSubActivityId && (
        <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">
              {activeActivity ? (isProduction ? `Crafting: ${activeActivity.name}` : activeActivity.name) : 'Action Progress'}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {actionProgress.toFixed(0)}s / {actionTime.toFixed(1)}s
            </span>
          </div>
          <ProgressBar value={actionProgress} max={actionTime} color={isProduction ? 'var(--color-accent)' : 'var(--color-energy)'} height="10px" />

          {/* Show current recipe costs while crafting */}
          {isProduction && activeActivity?.resourceInputs && (
            <div className="mt-2 flex flex-wrap gap-2">
              {activeActivity.resourceInputs.map(input => {
                const have = resources[input.resourceId] || 0;
                const enough = have >= input.quantity;
                return (
                  <span key={input.resourceId} className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    color: enough ? 'var(--color-success)' : 'var(--color-danger)',
                  }}>
                    {input.resourceId.replace(/_/g, ' ')}: {have}/{input.quantity}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action Queue (production only) */}
      {!isGathering && actionQueue.length > 0 && (
        <div className="mb-4 p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Action Queue ({actionQueue.length})
          </h3>
          <div className="space-y-2">
            {actionQueue.map((item, idx) => {
              const qSkillDef = SKILLS[item.skillId];
              const qActivity = qSkillDef?.subActivities?.find(a => a.id === item.subActivityId);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded text-xs"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex-1">
                    <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {qSkillDef?.name || item.skillId}
                    </span>
                    <span style={{ color: 'var(--color-text-muted)' }}> - </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {qActivity?.name || item.subActivityId}
                    </span>
                    <span className="ml-2" style={{ color: 'var(--color-text-muted)' }}>
                      {item.repeatCount === 0 ? '\u221E' : `${item.completedCount}/${item.repeatCount}`}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="px-2 py-0.5 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                  >
                    x
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* WORKERS SECTION (Gathering skills only) */}
      {/* ============================================================ */}
      {isGathering && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
            <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Workers</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
              Settlement Population
            </span>
          </div>

          <WorkerSummaryBar />
          <WorkerDeployForm skillId={activeSkillId} />
          <WorkerAssignments skillId={activeSkillId} />
        </div>
      )}

      {/* Gathering Goal (gathering only) */}
      {isGathering && activeSkillId && <GoalSetter skillId={activeSkillId} />}

      {/* Sub-Activity / Recipe Selector — Horizontal Card Layout */}
      {hasSubActivities && (() => {
        const activities = skillDef.subActivities!;
        const regular = activities.filter(a => !a.isMixed);
        const sweeps = activities.filter(a => a.isMixed);

        // Group regular activities by tier
        const tierGroups: Record<string, typeof regular> = {};
        for (const a of regular) {
          const tier = (a.levelReq || 0) >= 30 ? 'Tier 3' : (a.levelReq || 0) >= 15 ? 'Tier 2' : 'Tier 1';
          if (!tierGroups[tier]) tierGroups[tier] = [];
          tierGroups[tier].push(a);
        }

        // Same for sweeps
        const sweepGroups: Record<string, typeof sweeps> = {};
        for (const a of sweeps) {
          const tier = (a.levelReq || 0) >= 30 ? 'Tier 3' : (a.levelReq || 0) >= 15 ? 'Tier 2' : 'Tier 1';
          if (!sweepGroups[tier]) sweepGroups[tier] = [];
          sweepGroups[tier].push(a);
        }

        const allTiers = [...new Set([...Object.keys(tierGroups), ...Object.keys(sweepGroups)])].sort();

        return (
          <div className="mb-4 p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-bold text-sm mb-3">
              {isProduction ? 'Choose Recipe' : 'Choose Activity'}
            </h3>

            {allTiers.map(tier => (
              <div key={tier} className="mb-4">
                {allTiers.length > 1 && (
                  <div className="text-[10px] font-bold uppercase mb-2 px-1" style={{ color: 'var(--color-text-muted)' }}>{tier}</div>
                )}

                {/* Regular activities — horizontal scrollable row */}
                {tierGroups[tier] && tierGroups[tier].length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-2" style={{ scrollbarWidth: 'thin' }}>
                    {tierGroups[tier].map(activity => {
                      const isSelected = activity.id === activeSubActivityId;
                      const isLocked = (activity.levelReq || 0) > playerSkill.level;
                      const canAfford = isProduction ? checkCanAfford(activity, resources) : true;
                      const primaryDrop = activity.resourceDrops[0];
                      const primaryRes = primaryDrop ? RESOURCES[primaryDrop.resourceId] : null;

                      return (
                        <button
                          key={activity.id}
                          onClick={() => !isLocked && setSubActivity(activity.id)}
                          className="shrink-0 rounded text-center transition-all p-3"
                          style={{
                            width: '150px',
                            minHeight: '140px',
                            backgroundColor: isLocked ? 'var(--color-bg-primary)' : isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                            border: isSelected ? '2px solid var(--color-accent)' : isLocked ? '1px solid var(--color-border)' : !canAfford && isProduction ? '1px solid #ef444444' : '1px solid var(--color-border)',
                            opacity: isLocked ? 0.4 : 1,
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {/* Icon */}
                          <div className="flex justify-center mb-2">
                            {primaryDrop ? (
                              <ItemIcon itemId={primaryDrop.resourceId} itemType={isProduction ? 'consumable' : 'resource'} size={32} fallbackLabel={activity.name.charAt(0)} />
                            ) : (
                              <div className="w-8 h-8 rounded flex items-center justify-center text-sm" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>{activity.name.charAt(0)}</div>
                            )}
                          </div>

                          {/* Name */}
                          <div className="font-bold text-xs mb-1" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>
                            {activity.name}
                          </div>

                          {/* Lock badge */}
                          {isLocked && (
                            <div className="text-[10px] px-1.5 py-0.5 rounded inline-block mb-1" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>Lv.{activity.levelReq}</div>
                          )}

                          {/* Resource info */}
                          {!isLocked && !isProduction && primaryDrop && (
                            <div className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                              {primaryRes?.name || primaryDrop.resourceId}: {primaryDrop.minQty}-{primaryDrop.maxQty}
                            </div>
                          )}
                          {!isLocked && isProduction && activity.resourceInputs && (
                            <div className="text-[10px]" style={{ color: canAfford ? 'var(--color-success)' : 'var(--color-danger)' }}>
                              {canAfford ? 'Ready' : 'Need mats'}
                            </div>
                          )}

                          {/* XP badge */}
                          {!isLocked && (
                            <div className="text-[10px] mt-1" style={{ color: 'var(--color-xp)' }}>{activity.xpPerAction} XP</div>
                          )}

                          {/* Gear badge */}
                          {activity.gearTemplateId && (
                            <div className="text-[10px] px-1 py-0 rounded inline-block mt-1" style={{ backgroundColor: 'var(--color-info)', color: '#fff' }}>GEAR</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sweep activities — full width */}
                {sweepGroups[tier] && sweepGroups[tier].map(activity => {
                  const isSelected = activity.id === activeSubActivityId;
                  const isLocked = (activity.levelReq || 0) > playerSkill.level;

                  return (
                    <button
                      key={activity.id}
                      onClick={() => !isLocked && setSubActivity(activity.id)}
                      className="w-full text-left p-3 rounded mb-2 transition-all"
                      style={{
                        backgroundColor: isLocked ? 'var(--color-bg-primary)' : isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                        border: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-accent)44',
                        borderLeft: isSelected ? '4px solid var(--color-accent)' : '4px solid var(--color-accent)',
                        opacity: isLocked ? 0.4 : 1,
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: 'var(--color-accent)22', color: 'var(--color-accent)' }}>SWEEP ALL</span>
                        <span className="font-bold text-xs" style={{ color: isSelected ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{activity.name}</span>
                        {isLocked && <span className="text-[10px] px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>Lv.{activity.levelReq}</span>}
                        <span className="text-[10px] ml-auto" style={{ color: 'var(--color-xp)' }}>{activity.xpPerAction} XP</span>
                      </div>
                      {!isLocked && (
                        <div className="flex gap-3 text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
                          {activity.resourceDrops.map(d => {
                            const res = RESOURCES[d.resourceId];
                            return <span key={d.resourceId}>{res?.name || d.resourceId}: {d.minQty}-{d.maxQty}</span>;
                          })}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Level & XP */}
      <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-bold">Level {playerSkill.level}</span>
          {playerSkill.level < 100 && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </span>
          )}
        </div>
        {playerSkill.level < 100 ? (
          <ProgressBar value={xpIntoLevel} max={xpNeeded} color="var(--color-xp)" height="12px" showText label="Experience" />
        ) : (
          <div className="text-center py-2" style={{ color: 'var(--color-accent)' }}>
            &#9733; MAXIMUM LEVEL REACHED &#9733;
          </div>
        )}
        <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Total XP: {playerSkill.xp.toLocaleString()}
          {playerSkill.level < 100 && (
            <> | Lv.{playerSkill.level + 1} requires {xpForSingleLevel(playerSkill.level + 1).toLocaleString()} XP ({(xpForLevel(playerSkill.level + 1) - playerSkill.xp).toLocaleString()} remaining)</>
          )}
        </div>
      </div>

      {/* Current Drops (gathering only) */}
      {isGathering && activeActivity && scaling && (
        <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-bold text-sm mb-3">Resources Per Action</h3>
          <div className="space-y-2">
            {activeActivity.resourceDrops.map((drop) => {
              const resource = RESOURCES[drop.resourceId];
              if (!resource) return null;
              const scaledMin = Math.max(1, Math.floor(drop.minQty * scaling.qtyMultiplier));
              const scaledMax = Math.max(1, Math.floor(drop.maxQty * scaling.qtyMultiplier));
              return (
                <div key={drop.resourceId} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {resource.name}
                  </span>
                  <span style={{ color: 'var(--color-success)' }}>
                    {scaledMin}-{scaledMax}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Check if player can afford a recipe */
function checkCanAfford(activity: SubActivity, resources: Record<string, number>): boolean {
  if (!activity.resourceInputs) return true;
  return activity.resourceInputs.every(input => (resources[input.resourceId] || 0) >= input.quantity);
}

/* ─── Worker Summary Bar ────────────────────────────────────── */
function WorkerSummaryBar() {
  const totalWorkers = usePopulationStore(s => s.totalWorkers);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const getAssignedWorkerCount = usePopulationStore(s => s.getAssignedWorkerCount);
  const totalWorkersLost = usePopulationStore(s => s.totalWorkersLost);
  const respawningWorkers = usePopulationStore(s => s.respawningWorkers);
  const assignments = usePopulationStore(s => s.assignments);
  const removeAssignment = usePopulationStore(s => s.removeAssignment);

  const assigned = getAssignedWorkerCount();
  const recovering = respawningWorkers.length;

  return (
    <div className="mb-4">
      <div className="grid grid-cols-5 gap-2 mb-2">
        <MiniStat label="Total" value={totalWorkers} color="var(--color-accent)" />
        <MiniStat label="Available" value={availableWorkers} color="var(--color-success)" />
        <MiniStat label="Assigned" value={assigned} color="var(--color-info)" />
        <MiniStat label="Recovering" value={recovering} color="var(--color-energy)" />
        <MiniStat label="Deaths" value={totalWorkersLost} color="var(--color-danger)" />
      </div>

      {/* Respawning workers countdown */}
      {recovering > 0 && (
        <div className="p-2 rounded text-xs mb-2" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-energy)' }}>
          <div className="font-bold mb-1" style={{ color: 'var(--color-energy)' }}>
            Recovering Workers ({recovering})
          </div>
          {respawningWorkers.map((rw, i) => {
            const remaining = Math.max(0, Math.ceil((rw.respawnAt - Date.now()) / 1000));
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            return (
              <div key={i} style={{ color: 'var(--color-text-muted)' }}>
                Worker recovering: {mins}:{secs.toString().padStart(2, '0')} remaining
              </div>
            );
          })}
        </div>
      )}

      {/* Compact assignment breakdown */}
      {assignments.length > 0 && (
        <div className="p-2 rounded text-xs space-y-1" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          {assignments.map(a => {
            const sk = SKILLS[a.skillId];
            const act = sk?.subActivities?.find(sa => sa.id === a.subActivityId);
            const resNames = act?.resourceDrops.map(d => RESOURCES[d.resourceId]?.name || d.resourceId).join(', ') || '?';
            return (
              <div key={a.id} className="flex justify-between items-center">
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {a.workerCount}w → <span style={{ color: 'var(--color-text-primary)' }}>{sk?.name}</span>: {act?.name} <span style={{ color: 'var(--color-accent)' }}>({resNames})</span>
                </span>
                <button
                  onClick={() => removeAssignment(a.id)}
                  className="px-1.5 py-0.5 rounded cursor-pointer ml-1"
                  style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', fontSize: '9px' }}
                >Recall</button>
              </div>
            );
          })}
          {assignments.length > 1 && (
            <button
              onClick={() => assignments.forEach(a => removeAssignment(a.id))}
              className="w-full p-1 rounded text-xs font-bold cursor-pointer mt-1"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
            >
              Recall All
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  );
}

/* ─── Worker Deploy Form (skill pre-selected) ──────────────── */
function WorkerDeployForm({ skillId }: { skillId: string }) {
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const createAssignment = usePopulationStore(s => s.createAssignment);
  const removeAssignment = usePopulationStore(s => s.removeAssignment);
  const assignments = usePopulationStore(s => s.assignments);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [workerCount, setWorkerCount] = useState(() => Math.max(1, Math.min(1, availableWorkers)));

  const otherAssignments = assignments.filter(a => a.skillId !== skillId);

  useEffect(() => {
    setWorkerCount(prev => availableWorkers <= 0 ? 0 : Math.max(1, Math.min(prev, availableWorkers)));
  }, [availableWorkers]);

  const skillDef = SKILLS[skillId];
  const activities = skillDef?.subActivities || [];
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
    <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Deploy Workers &mdash; {skillDef?.name}
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Activity</label>
          <select
            value={selectedActivity}
            onChange={e => setSelectedActivity(e.target.value)}
            className="w-full p-2 rounded text-sm"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          >
            <option value="">-- Select Activity --</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.isMixed ? '>> ' : ''}{a.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Workers ({availableWorkers} free)</label>
          <input
            type="number"
            min={1}
            max={availableWorkers}
            value={workerCount}
            onChange={e => setWorkerCount(availableWorkers <= 0 ? 0 : Math.max(1, Math.min(availableWorkers, parseInt(e.target.value) || 1)))}
            disabled={availableWorkers <= 0}
            className="w-full p-2 rounded text-sm"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          />
        </div>
      </div>

      {selectedActivity && (
        <div className="flex gap-4 text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          <span>Speed: <b style={{ color: 'var(--color-text-primary)' }}>x{scaling.speedMultiplier}</b></span>
          <span>Yield: <b style={{ color: 'var(--color-text-primary)' }}>x{scaling.yieldMultiplier}</b></span>
          <span>Death Risk: <b style={{ color: scaling.deathRiskPerTrip > 0.05 ? 'var(--color-danger)' : scaling.deathRiskPerTrip > 0 ? 'var(--color-energy)' : 'var(--color-success)' }}>
            {scaling.deathRiskPerTrip === 0 ? 'None' : `${(scaling.deathRiskPerTrip * 100).toFixed(1)}%`}
          </b></span>
        </div>
      )}

      <button
        onClick={handleCreate}
        disabled={!selectedActivity || availableWorkers <= 0}
        className="w-full p-2 rounded text-sm font-bold cursor-pointer transition-all"
        style={{
          backgroundColor: selectedActivity && availableWorkers > 0 ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
          color: selectedActivity && availableWorkers > 0 ? '#000' : 'var(--color-text-muted)',
          border: 'none',
        }}
      >
        Deploy {workerCount} Worker{workerCount > 1 ? 's' : ''}
      </button>

      {/* Cross-category reassignment prompt when no workers available */}
      {availableWorkers <= 0 && otherAssignments.length > 0 && (
        <div className="mt-3 p-3 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-energy)' }}>
          <div className="text-xs font-bold mb-2" style={{ color: 'var(--color-energy)' }}>
            All workers are currently assigned elsewhere:
          </div>
          <div className="space-y-1 mb-2">
            {otherAssignments.map(a => {
              const sk = SKILLS[a.skillId];
              const act = sk?.subActivities?.find(sa => sa.id === a.subActivityId);
              const resNames = act?.resourceDrops.map(d => RESOURCES[d.resourceId]?.name || d.resourceId).join(', ') || '?';
              return (
                <div key={a.id} className="flex justify-between items-center text-xs">
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {a.workerCount}w → {sk?.name}: {act?.name} <span style={{ color: 'var(--color-accent)' }}>({resNames})</span>
                  </span>
                  <button
                    onClick={() => removeAssignment(a.id)}
                    className="px-2 py-0.5 rounded text-xs cursor-pointer ml-2"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', fontSize: '9px' }}
                  >Recall</button>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => otherAssignments.forEach(a => removeAssignment(a.id))}
            className="w-full p-1.5 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-energy)', color: '#000', border: 'none' }}
          >
            Recall All Workers
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Active Worker Assignments for this skill ──────────────── */
function WorkerAssignments({ skillId }: { skillId: string }) {
  const assignments = usePopulationStore(s => s.assignments);
  const skillAssignments = assignments.filter(a => a.skillId === skillId);
  const otherAssignments = assignments.filter(a => a.skillId !== skillId);
  const otherWorkerCount = otherAssignments.reduce((sum, a) => sum + a.workerCount, 0);

  return (
    <div>
      <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--color-text-primary)' }}>
        Active on {SKILLS[skillId]?.name} ({skillAssignments.length})
      </h3>
      {skillAssignments.length === 0 ? (
        <div className="p-4 rounded text-center text-sm mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
          No workers deployed to this skill yet.
        </div>
      ) : (
        <div className="space-y-3 mb-3">
          {skillAssignments.map(assignment => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </div>
      )}

      {otherAssignments.length > 0 && (
        <OtherAssignments assignments={otherAssignments} totalWorkers={otherWorkerCount} />
      )}
    </div>
  );
}

/* ─── Assignment Card ────────────────────────────────────────── */
function AssignmentCard({ assignment }: { assignment: WorkerAssignment }) {
  const removeAssignment = usePopulationStore(s => s.removeAssignment);
  const adjustWorkers = usePopulationStore(s => s.adjustWorkers);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const workerSkillXp = usePopulationStore(s => s.workerSkillXp);

  const skillDef = SKILLS[assignment.skillId];
  const activity = skillDef?.subActivities?.find(a => a.id === assignment.subActivityId);
  const scaling = getWorkerScaling(assignment.workerCount);
  const tripDuration = getTripDuration(assignment, workerSkillXp);

  const totalGathered = Object.entries(assignment.totalResourcesGathered)
    .map(([id, qty]) => ({ name: RESOURCES[id]?.name || id, qty }))
    .filter(r => r.qty > 0);

  return (
    <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {activity?.name || assignment.subActivityId}
          </div>
          {activity && activity.resourceDrops.length > 0 && (
            <div className="text-xs" style={{ color: 'var(--color-accent)' }}>
              Gathering: {activity.resourceDrops.map(d => {
                const res = RESOURCES[d.resourceId];
                return `${res?.name || d.resourceId} (${d.minQty}-${d.maxQty}/trip)`;
              }).join(', ')}
            </div>
          )}
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {assignment.workerCount} worker{assignment.workerCount > 1 ? 's' : ''} |
            Trips: {assignment.tripsCompleted} |
            Lost: {assignment.workersLost}
            {scaling.deathRiskPerTrip > 0 && (
              <span style={{ color: 'var(--color-danger)' }} title="Death risk per trip. Assign more workers together to reduce risk."> | Risk: {(scaling.deathRiskPerTrip * 100).toFixed(1)}%</span>
            )}
            {scaling.deathRiskPerTrip >= 0.05 && (
              <span style={{ color: 'var(--color-danger)', fontSize: '9px' }}> (add workers to reduce)</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => adjustWorkers(assignment.id, assignment.workerCount + 1)}
            disabled={availableWorkers <= 0}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            title="Add worker"
          >+</button>
          <button
            onClick={() => {
              if (assignment.workerCount > 1) adjustWorkers(assignment.id, assignment.workerCount - 1);
              else removeAssignment(assignment.id);
            }}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            title="Remove worker"
          >-</button>
          <button
            onClick={() => removeAssignment(assignment.id)}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
            title="Recall all"
          >Recall</button>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>Trip Progress</span>
          <span>{assignment.tripProgress}s / {tripDuration}s</span>
        </div>
        <ProgressBar value={assignment.tripProgress} max={tripDuration} color="var(--color-energy)" height="6px" />
      </div>

      {totalGathered.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {totalGathered.map(r => (
            <span key={r.name} className="px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-success)' }}>
              {r.name}: {r.qty.toLocaleString()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Collapsed summary of workers on other skills ──────────── */
function OtherAssignments({ assignments, totalWorkers }: { assignments: WorkerAssignment[]; totalWorkers: number }) {
  const removeAssignment = usePopulationStore(s => s.removeAssignment);
  const [expanded, setExpanded] = useState(false);

  const grouped = assignments.reduce<Record<string, { skillName: string; workers: number; trips: number; details: { activityName: string; resources: string; workerCount: number; assignmentId: string }[] }>>((acc, a) => {
    const key = a.skillId;
    if (!acc[key]) acc[key] = { skillName: SKILLS[key]?.name || key, workers: 0, trips: 0, details: [] };
    acc[key].workers += a.workerCount;
    acc[key].trips += a.tripsCompleted;
    const activity = SKILLS[key]?.subActivities?.find(sa => sa.id === a.subActivityId);
    const resourceNames = activity?.resourceDrops.map(d => RESOURCES[d.resourceId]?.name || d.resourceId).join(', ') || '?';
    acc[key].details.push({ activityName: activity?.name || a.subActivityId, resources: resourceNames, workerCount: a.workerCount, assignmentId: a.id });
    return acc;
  }, {});

  return (
    <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center cursor-pointer"
        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)' }}
      >
        <span className="text-xs font-bold">
          Other Skills: {totalWorkers} worker{totalWorkers !== 1 ? 's' : ''} deployed
        </span>
        <span className="text-xs">{expanded ? '[-]' : '[+]'}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {Object.entries(grouped).map(([skillId, info]) => (
            <div key={skillId} className="px-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold" style={{ color: 'var(--color-text-primary)' }}>{info.skillName}</span>
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {info.workers} worker{info.workers !== 1 ? 's' : ''} | {info.trips} trips
                </span>
              </div>
              {info.details.map(d => (
                <div key={d.assignmentId} className="flex justify-between items-center text-xs pl-2 py-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  <span>
                    {d.workerCount}w → {d.activityName} <span style={{ color: 'var(--color-accent)' }}>({d.resources})</span>
                  </span>
                  <button
                    onClick={() => removeAssignment(d.assignmentId)}
                    className="px-1.5 py-0.5 rounded text-xs cursor-pointer ml-1"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none', fontSize: '9px' }}
                  >Recall</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Goal Setter (gathering only) ──────────────────────────── */
function GoalSetter({ skillId }: { skillId: string }) {
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
    <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-3">Set Goal</h3>

      {gatheringGoal.type !== 'none' && (
        <div className="p-2 rounded mb-3 flex justify-between items-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-accent)' }}>
          <span className="text-xs" style={{ color: 'var(--color-accent)' }}>
            {gatheringGoal.type === 'collect_amount'
              ? `Gathering ${gatheringGoal.targetAmount?.toLocaleString()} ${gatheringGoal.resourceId?.replace(/_/g, ' ')} (have: ${(resources[gatheringGoal.resourceId!] || 0).toLocaleString()})`
              : `Training to level ${gatheringGoal.targetLevel} (current: ${playerSkill?.level})`}
          </span>
          <button onClick={() => setGatheringGoal({ type: 'none' })}
            className="px-2 py-0.5 rounded text-xs cursor-pointer" style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Clear</button>
        </div>
      )}

      <div className="flex gap-2 mb-2">
        {(['none', 'collect_amount', 'reach_level'] as const).map(t => (
          <button key={t} onClick={() => setGoalType(t)}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: goalType === t ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: goalType === t ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
            {t === 'none' ? 'No Goal' : t === 'collect_amount' ? 'Gather Amount' : 'Reach Level'}
          </button>
        ))}
      </div>

      {goalType === 'collect_amount' && (
        <div className="flex gap-2 mb-2">
          <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)}
            className="flex-1 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
            <option value="">-- Resource --</option>
            {availableResources.map(r => (
              <option key={r} value={r}>{RESOURCES[r]?.name || r} (have: {resources[r] || 0})</option>
            ))}
          </select>
          <input type="number" value={targetAmount} onChange={e => setTargetAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} min={1} />
        </div>
      )}

      {goalType === 'reach_level' && (
        <div className="flex gap-2 mb-2 items-center">
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Target Level:</span>
          <input type="number" value={targetLevel} onChange={e => setTargetLevel(Math.max((playerSkill?.level || 1) + 1, Math.min(100, parseInt(e.target.value) || 1)))}
            className="w-20 p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            min={(playerSkill?.level || 1) + 1} max={100} />
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>(current: {playerSkill?.level})</span>
        </div>
      )}

      {goalType !== 'none' && (
        <button onClick={handleSetGoal}
          className="w-full p-2 rounded text-xs font-bold cursor-pointer"
          style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
          Set Goal
        </button>
      )}
    </div>
  );
}
