/**
 * WorkshopPanel — Crafting and skills sub-hub.
 *
 * Provides a visual entry point into the gathering, production, and
 * equipment crafting systems. Replaces the old pattern of routing
 * Workshop clicks to the generic EncampmentPanel.
 */

import { useGameStore } from '../../store/useGameStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { useEncampmentStore } from '../../store/useEncampmentStore';
import { GATHERING_SKILLS, PRODUCTION_SKILLS, SKILLS } from '../../config/skills';
import { BUILDINGS } from '../../config/buildings';
import { levelFromXp } from '../../types/skills';

interface WorkshopPanelProps {
  onSelectSkill: (skillId: string) => void;
}

export function WorkshopPanel({ onSelectSkill }: WorkshopPanelProps) {
  const skills = useGameStore(s => s.skills);
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const isActionRunning = useGameStore(s => s.isActionRunning);
  const workers = usePopulationStore(s => s.workers);
  const assignments = usePopulationStore(s => s.assignments);
  const encBuildings = useEncampmentStore(s => s.buildings);

  // Compute worker summary
  const totalWorkers = workers.length;
  const respawning = workers.filter(w => w.isRespawning).length;
  const gatheringWorkers = workers.filter(w => w.currentAssignmentId).length;
  const encampmentWorkers = workers.filter(w => w.encampmentBuildingId).length;
  const idleWorkers = totalWorkers - gatheringWorkers - encampmentWorkers - respawning;

  // Gathering breakdown by skill
  const gatheringBySkill: { skillId: string; skillName: string; count: number; activities: { name: string; count: number }[] }[] = [];
  const assignmentsBySkill: Record<string, typeof assignments> = {};
  for (const a of assignments) {
    if (!assignmentsBySkill[a.skillId]) assignmentsBySkill[a.skillId] = [];
    assignmentsBySkill[a.skillId].push(a);
  }
  for (const [skillId, skillAssignments] of Object.entries(assignmentsBySkill)) {
    const skillDef = SKILLS[skillId];
    const totalCount = skillAssignments.reduce((s, a) => s + a.assignedWorkerIds.length, 0);
    const activities = skillAssignments.map(a => {
      const sub = skillDef?.subActivities?.find((sa: any) => sa.id === a.subActivityId);
      return { name: sub?.name || a.subActivityId, count: a.assignedWorkerIds.length };
    });
    gatheringBySkill.push({ skillId, skillName: skillDef?.name || skillId, count: totalCount, activities });
  }

  // Encampment building breakdown (assignedWorker is boolean, so count from workers array)
  const buildingAssignments: { buildingId: string; buildingName: string; workerCount: number; hasLeader: boolean }[] = [];
  for (const [bId, built] of Object.entries(encBuildings)) {
    const workersInBuilding = workers.filter(w => w.encampmentBuildingId === bId).length;
    if (workersInBuilding > 0 || built.leaderId) {
      const bDef = BUILDINGS[bId];
      buildingAssignments.push({
        buildingId: bId,
        buildingName: bDef?.name || bId,
        workerCount: workersInBuilding,
        hasLeader: !!built.leaderId,
      });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* Header */}
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Workshop</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Gather resources, produce supplies, and forge equipment.
          </p>
        </div>

        {/* Worker assignment summary */}
        {totalWorkers > 0 && (
          <div className="p-3 rounded-lg" style={{
            background: 'linear-gradient(135deg, rgba(32, 28, 22, 0.7) 0%, rgba(26, 22, 17, 0.8) 100%)',
            border: '1px solid rgba(62, 54, 40, 0.25)',
          }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
                Worker Assignments
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(62, 54, 40, 0.3)' }} />
              <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {totalWorkers} total
              </span>
            </div>

            {/* Quick counts */}
            <div className="flex flex-wrap gap-3 mb-2">
              <span className="text-[11px]" style={{ color: idleWorkers > 0 ? '#27ae60' : 'var(--color-text-muted)' }}>
                <b>{idleWorkers}</b> idle
              </span>
              <span className="text-[11px]" style={{ color: gatheringWorkers > 0 ? '#f39c12' : 'var(--color-text-muted)' }}>
                <b>{gatheringWorkers}</b> gathering
              </span>
              <span className="text-[11px]" style={{ color: encampmentWorkers > 0 ? '#3498db' : 'var(--color-text-muted)' }}>
                <b>{encampmentWorkers}</b> encampment
              </span>
              {respawning > 0 && (
                <span className="text-[11px]" style={{ color: '#e74c3c' }}>
                  <b>{respawning}</b> recovering
                </span>
              )}
            </div>

            {/* Gathering detail */}
            {gatheringBySkill.length > 0 && (
              <div className="space-y-1">
                {gatheringBySkill.map(g => (
                  <div key={g.skillId} className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold" style={{ color: '#f39c12' }}>{g.skillName}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    {g.activities.map((a, i) => (
                      <span key={i} style={{ color: 'var(--color-text-secondary)' }}>
                        {a.name} <span className="font-mono font-bold">{a.count}</span>{i < g.activities.length - 1 ? ',' : ''}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Encampment detail */}
            {buildingAssignments.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                {buildingAssignments.map(b => (
                  <span key={b.buildingId} className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: '#3498db' }}>{b.buildingName}</span>{' '}
                    <span className="font-mono font-bold">{b.workerCount}</span>
                    {b.hasLeader && <span style={{ color: '#a78bfa' }}> +Leader</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active skill indicator */}
        {activeSkillId && isActionRunning && (
          <div
            className="p-2.5 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(212, 168, 67, 0.06)',
              border: '1px solid rgba(212, 168, 67, 0.2)',
              borderLeft: '3px solid var(--color-accent)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-accent)', animation: 'hub-signal 2s ease-in-out infinite' }} />
            <span className="text-[11px]" style={{ color: 'var(--color-accent)' }}>
              Active: <b>{SKILLS[activeSkillId]?.name || activeSkillId}</b>
            </span>
            <button
              onClick={() => onSelectSkill(activeSkillId)}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer ml-auto"
              style={{ backgroundColor: 'rgba(212, 168, 67, 0.1)', color: 'var(--color-accent)', border: '1px solid rgba(212, 168, 67, 0.2)' }}
            >
              View
            </button>
          </div>
        )}

        {/* Gathering skills */}
        <SkillSection
          title="Gathering"
          description="Collect raw materials from the wasteland."
          skills={GATHERING_SKILLS}
          playerSkills={skills}
          onSelect={onSelectSkill}
          accentColor="#27ae60"
        />

        {/* Production skills */}
        <SkillSection
          title="Production"
          description="Craft consumables, tools, and supplies."
          skills={PRODUCTION_SKILLS.filter(s => s.id !== 'weaponsmithing' && s.id !== 'armorcrafting')}
          playerSkills={skills}
          onSelect={onSelectSkill}
          accentColor="#f39c12"
        />

        {/* Equipment crafting */}
        <SkillSection
          title="Equipment Forging"
          description="Forge weapons and armor for your heroes."
          skills={PRODUCTION_SKILLS.filter(s => s.id === 'weaponsmithing' || s.id === 'armorcrafting')}
          playerSkills={skills}
          onSelect={onSelectSkill}
          accentColor="#e74c3c"
        />
      </div>
    </div>
  );
}

function SkillSection({
  title,
  description,
  skills,
  playerSkills,
  onSelect,
  accentColor,
}: {
  title: string;
  description: string;
  skills: { id: string; name: string; description: string }[];
  playerSkills: Record<string, { level: number; xp: number }>;
  onSelect: (skillId: string) => void;
  accentColor: string;
}) {
  if (skills.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <div className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: accentColor }}>
          {title}
        </div>
        <div className="flex-1 h-px" style={{ backgroundColor: `${accentColor}30` }} />
      </div>
      <p className="text-[10px] mb-2" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {skills.map(skill => {
          const ps = playerSkills[skill.id];
          const level = ps?.level || 1;
          return (
            <button
              key={skill.id}
              onClick={() => onSelect(skill.id)}
              className="flex items-center gap-2.5 p-2.5 rounded text-left cursor-pointer transition-all"
              style={{
                backgroundColor: 'rgba(22, 19, 15, 0.5)',
                border: '1px solid rgba(62, 54, 40, 0.2)',
                borderLeft: `3px solid ${accentColor}`,
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{skill.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{skill.description}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold font-data" style={{ color: accentColor }}>Lv.{level}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
