import { useGameStore } from '../../store/useGameStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { SKILLS } from '../../config/skills';
import { xpForLevel } from '../../types/skills';
import { ProgressBar } from '../common/ProgressBar';

interface SkillListItemProps {
  skillId: string;
  /** Called when this skill item is clicked (in addition to setting active skill in store) */
  onSelect?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  gathering: '#27ae60',
  production: '#3498db',
  combat: '#e74c3c',
};

export function SkillListItem({ skillId, onSelect }: SkillListItemProps) {
  const skillDef = SKILLS[skillId];
  const playerSkill = useGameStore(s => s.skills[skillId]);
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const isActionRunning = useGameStore(s => s.isActionRunning);
  const setActiveSkill = useGameStore(s => s.setActiveSkill);

  const assignments = usePopulationStore(s => s.assignments);
  const workerCount = assignments.filter(a => a.skillId === skillId).reduce((sum, a) => sum + a.workerCount, 0);

  if (!skillDef || !playerSkill) return null;

  const isActive = activeSkillId === skillId;
  const isRunning = isActive && isActionRunning;
  const hasWorkers = workerCount > 0;
  const currentLevelXp = xpForLevel(playerSkill.level);
  const nextLevelXp = xpForLevel(playerSkill.level + 1);
  const xpIntoLevel = playerSkill.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  const handleClick = () => {
    if (isActive) {
      setActiveSkill(null);
    } else {
      setActiveSkill(skillId);
    }
    onSelect?.();
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-3 rounded border transition-all cursor-pointer"
      style={{
        backgroundColor: isActive ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
        borderColor: isActive ? CATEGORY_COLORS[skillDef.category] : 'var(--color-border)',
        borderWidth: isActive ? '2px' : '1px',
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          {hasWorkers && (
            <span className="worker-active-icon" style={{ fontSize: '11px', lineHeight: 1 }}>&#9935;</span>
          )}
          <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {skillDef.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasWorkers && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#27ae6022', color: '#27ae60', fontSize: '10px' }}>
              {workerCount}w
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              backgroundColor: CATEGORY_COLORS[skillDef.category] + '22',
              color: CATEGORY_COLORS[skillDef.category],
            }}
          >
            Lv.{playerSkill.level}
          </span>
        </div>
      </div>
      {playerSkill.level < 100 ? (
        <ProgressBar
          value={xpIntoLevel}
          max={xpNeeded}
          color={CATEGORY_COLORS[skillDef.category]}
          height="4px"
        />
      ) : (
        <div className="text-xs" style={{ color: 'var(--color-accent)' }}>MAX LEVEL</div>
      )}
      {isRunning && (
        <div className="mt-1 text-xs" style={{ color: CATEGORY_COLORS[skillDef.category] }}>
          <span className="worker-active-icon" style={{ color: CATEGORY_COLORS[skillDef.category] }}>&#9654;</span>{' '}
          {skillDef.category === 'gathering' ? 'SCROUNGING...' : skillDef.category === 'production' ? 'CRAFTING...' : 'FIGHTING...'}
        </div>
      )}
      {isActive && !isRunning && !hasWorkers && (
        <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Viewing
        </div>
      )}
      {hasWorkers && !isRunning && (
        <div className="mt-1 text-xs" style={{ color: '#27ae60' }}>
          &#9935; {workerCount} worker{workerCount !== 1 ? 's' : ''} gathering
        </div>
      )}

      <style>{`
        @keyframes worker-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
        .worker-active-icon {
          animation: worker-pulse 2s ease-in-out infinite;
          display: inline-block;
          color: #27ae60;
        }
      `}</style>
    </button>
  );
}
