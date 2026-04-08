/**
 * WorkshopPanel — Crafting and skills sub-hub.
 *
 * Provides a visual entry point into the gathering, production, and
 * equipment crafting systems. Replaces the old pattern of routing
 * Workshop clicks to the generic EncampmentPanel.
 */

import { useGameStore } from '../../store/useGameStore';
import { GATHERING_SKILLS, PRODUCTION_SKILLS, SKILLS } from '../../config/skills';
import { levelFromXp } from '../../types/skills';

interface WorkshopPanelProps {
  onSelectSkill: (skillId: string) => void;
}

export function WorkshopPanel({ onSelectSkill }: WorkshopPanelProps) {
  const skills = useGameStore(s => s.skills);
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const isActionRunning = useGameStore(s => s.isActionRunning);

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
