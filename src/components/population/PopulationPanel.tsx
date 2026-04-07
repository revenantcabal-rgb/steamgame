import { useState, useEffect } from 'react';
import { usePopulationStore } from '../../store/usePopulationStore';
import { GATHERING_SKILLS, SKILLS } from '../../config/skills';
import { RESOURCES } from '../../config/resources';
import { getWorkerScaling, workerSkillLevel, workerSkillBonus } from '../../types/population';
import { getTripDuration } from '../../engine/PopulationEngine';
import { ProgressBar } from '../common/ProgressBar';

export function PopulationPanel() {
  const state = usePopulationStore();
  const assignedCount = state.getAssignedWorkerCount();

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          Settlement Population
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Assign workers to gather resources. More workers = faster, safer, higher yield.
        </p>
      </div>

      {/* Worker Summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <StatBox label="Total Workers" value={state.totalWorkers} color="var(--color-accent)" />
        <StatBox label="Available" value={state.availableWorkers} color="var(--color-success)" />
        <StatBox label="Assigned" value={assignedCount} color="var(--color-info)" />
        <StatBox label="Lost (Dead)" value={state.totalWorkersLost} color="var(--color-danger)" />
      </div>

      {/* New Assignment */}
      <NewAssignmentForm />

      {/* Active Assignments */}
      <div className="mt-4">
        <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
          Active Assignments ({state.assignments.length})
        </h3>
        {state.assignments.length === 0 ? (
          <div className="p-6 rounded text-center text-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
            No workers deployed. Create an assignment above.
          </div>
        ) : (
          <div className="space-y-3">
            {state.assignments.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  );
}

function NewAssignmentForm() {
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const createAssignment = usePopulationStore(s => s.createAssignment);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [workerCount, setWorkerCount] = useState(() => Math.max(1, Math.min(1, availableWorkers)));

  useEffect(() => {
    setWorkerCount(prev => availableWorkers <= 0 ? 0 : Math.max(1, Math.min(prev, availableWorkers)));
  }, [availableWorkers]);

  const skillDef = selectedSkill ? SKILLS[selectedSkill] : null;
  const activities = skillDef?.subActivities || [];
  const scaling = getWorkerScaling(workerCount);

  const handleCreate = () => {
    if (!selectedSkill || !selectedActivity || workerCount <= 0) return;
    const success = createAssignment(selectedSkill, selectedActivity, workerCount);
    if (success) {
      setSelectedSkill('');
      setSelectedActivity('');
      setWorkerCount(1);
    }
  };

  return (
    <div className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Deploy Workers
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Skill Select */}
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Gathering Skill</label>
          <select
            value={selectedSkill}
            onChange={e => { setSelectedSkill(e.target.value); setSelectedActivity(''); }}
            className="w-full p-2 rounded text-sm"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
          >
            <option value="">-- Select --</option>
            {GATHERING_SKILLS.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Activity Select */}
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Activity</label>
          <select
            value={selectedActivity}
            onChange={e => setSelectedActivity(e.target.value)}
            className="w-full p-2 rounded text-sm"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            disabled={!selectedSkill}
          >
            <option value="">-- Select --</option>
            {activities.map(a => (
              <option key={a.id} value={a.id}>{a.isMixed ? '>> ' : ''}{a.name}</option>
            ))}
          </select>
        </div>

        {/* Worker Count */}
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Workers ({availableWorkers} free)</label>
          <div className="flex gap-1">
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
      </div>

      {/* Scaling Preview */}
      {selectedSkill && selectedActivity && (
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
        disabled={!selectedSkill || !selectedActivity || availableWorkers <= 0}
        className="w-full p-2 rounded text-sm font-bold cursor-pointer transition-all"
        style={{
          backgroundColor: selectedSkill && selectedActivity ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
          color: selectedSkill && selectedActivity ? '#000' : 'var(--color-text-muted)',
          border: 'none',
        }}
      >
        Deploy {workerCount} Worker{workerCount > 1 ? 's' : ''}
      </button>
    </div>
  );
}

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
            {skillDef?.name}: {activity?.name || assignment.subActivityId}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {assignment.workerCount} worker{assignment.workerCount > 1 ? 's' : ''} |
            Trips: {assignment.tripsCompleted} |
            Lost: {assignment.workersLost}
            {scaling.deathRiskPerTrip > 0 && (
              <span style={{ color: 'var(--color-danger)' }}> | Risk: {(scaling.deathRiskPerTrip * 100).toFixed(1)}%</span>
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

      {/* Trip Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>Trip Progress</span>
          <span>{assignment.tripProgress}s / {tripDuration}s</span>
        </div>
        <ProgressBar value={assignment.tripProgress} max={tripDuration} color="var(--color-energy)" height="6px" />
      </div>

      {/* Total Gathered */}
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
