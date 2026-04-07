import { GATHERING_SKILLS, PRODUCTION_SKILLS } from '../../config/skills';
import { COMBAT_ZONE_LIST } from '../../config/combatZones';
import { SkillListItem } from '../skills/SkillListItem';
import { useGameStore } from '../../store/useGameStore';
import { useStoryStore } from '../../store/useStoryStore';
import { ProgressBar } from '../common/ProgressBar';

interface SidebarProps {
  /** Callback when any skill is clicked in sidebar (to switch center panel view) */
  onSelectSkill?: () => void;
  /** Callback when a combat zone is selected in sidebar */
  onSelectCombatZone?: (zoneId: string) => void;
  /** Currently selected combat zone id (for highlighting) */
  activeCombatZoneId?: string | null;
  /** Callback when story section is clicked */
  onNavigateToStory?: () => void;
}

export function Sidebar({ onSelectSkill, onSelectCombatZone, activeCombatZoneId, onNavigateToStory }: SidebarProps) {
  const idle = useGameStore(s => s.idle);
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const currentObjective = useStoryStore(s => s.getCurrentObjective);

  const idleHoursUsed = Math.floor(idle.idleSecondsUsedToday / 3600);
  const idleMinutesUsed = Math.floor((idle.idleSecondsUsedToday % 3600) / 60);
  const idleCapHours = Math.floor(idle.idleCapSeconds / 3600);

  return (
    <div
      className="w-64 min-w-56 h-screen overflow-y-auto flex flex-col shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Game Title */}
      <div className="p-4 text-center" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>
          &#9760; WASTELAND GRIND
        </h1>
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Post-Apocalyptic Idle RPG
        </div>
      </div>

      {/* Idle Cap */}
      <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex justify-between text-xs mb-1">
          <span style={{ color: 'var(--color-info)' }}>Idle Time</span>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {idleHoursUsed}h {idleMinutesUsed}m / {idleCapHours}h
          </span>
        </div>
        <ProgressBar
          value={idle.idleSecondsUsedToday}
          max={idle.idleCapSeconds}
          color="var(--color-info)"
          height="6px"
        />
      </div>

      {/* Story objective indicator */}
      <StoryIndicator objective={currentObjective()} onClick={onNavigateToStory} />

      {/* Skill + Zone Lists */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <SkillSection title="Gathering" skills={GATHERING_SKILLS} onSelectSkill={onSelectSkill} />
        <SkillSection title="Production" skills={PRODUCTION_SKILLS} onSelectSkill={onSelectSkill} />
        <CombatZoneSection
          onSelectZone={onSelectCombatZone}
          activeZoneId={activeCombatZoneId}
          activeSkillId={activeSkillId}
        />
      </div>
    </div>
  );
}

function SkillSection({ title, skills, onSelectSkill }: { title: string; skills: { id: string }[]; onSelectSkill?: () => void }) {
  return (
    <div>
      <div
        className="text-xs uppercase font-bold tracking-wider mb-2 px-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {title}
      </div>
      <div className="space-y-1">
        {skills.map(skill => (
          <SkillListItem key={skill.id} skillId={skill.id} onSelect={onSelectSkill} />
        ))}
      </div>
    </div>
  );
}

function StoryIndicator({
  objective,
  onClick,
}: {
  objective: ReturnType<ReturnType<typeof useStoryStore.getState>['getCurrentObjective']>;
  onClick?: () => void;
}) {
  if (!objective) {
    return (
      <button
        onClick={onClick}
        className="w-full p-3 text-left cursor-pointer"
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'var(--color-border)',
        }}
      >
        <div className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
          Story
        </div>
        <div className="text-xs" style={{ color: 'var(--color-success)' }}>
          All chapters complete!
        </div>
      </button>
    );
  }

  const progress = Math.min(objective.progress, objective.part.objective.count);
  const pct = Math.floor((progress / objective.part.objective.count) * 100);

  return (
    <button
      onClick={onClick}
      className="w-full p-3 text-left cursor-pointer"
      style={{
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'var(--color-border)',
      }}
    >
      <div className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
        Story {objective.chapter.number}
      </div>
      <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
        {objective.part.title}
      </div>
      <div className="text-[10px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {objective.part.objective.description}
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-primary)', height: '4px' }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: 'var(--color-accent)' }}
        />
      </div>
      <div className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--color-text-muted)' }}>
        {progress}/{objective.part.objective.count}
      </div>
    </button>
  );
}

function CombatZoneSection({
  onSelectZone,
  activeZoneId,
  activeSkillId,
}: {
  onSelectZone?: (zoneId: string) => void;
  activeZoneId?: string | null;
  activeSkillId: string | null;
}) {
  return (
    <div>
      <div
        className="text-xs uppercase font-bold tracking-wider mb-2 px-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Combat Zones
      </div>
      <div className="space-y-1">
        {COMBAT_ZONE_LIST.map(zone => {
          const isSelected = activeZoneId === zone.id && !activeSkillId;
          return (
            <button
              key={zone.id}
              onClick={() => onSelectZone?.(zone.id)}
              className="w-full text-left p-2 rounded text-xs transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'transparent',
                borderLeft: isSelected ? '3px solid var(--color-danger)' : '3px solid transparent',
                color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                border: 'none',
                borderLeftWidth: '3px',
                borderLeftStyle: 'solid',
                borderLeftColor: isSelected ? 'var(--color-danger)' : 'transparent',
              }}
            >
              <div className="font-bold" style={{ color: isSelected ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                {zone.name}
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Lv.{zone.minLevel}+ | T{zone.baseGearTier} Drops
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
