import { useGameStore } from '../../store/useGameStore';
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

  if (!skillDef || !playerSkill) return null;

  const isActive = activeSkillId === skillId;
  const isRunning = isActive && isActionRunning;
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
        <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {skillDef.name}
        </span>
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
          &#9654; {skillDef.category === 'gathering' ? 'SCROUNGING...' : skillDef.category === 'production' ? 'CRAFTING...' : 'FIGHTING...'}
        </div>
      )}
      {isActive && !isRunning && (
        <div className="mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Viewing
        </div>
      )}
    </button>
  );
}
