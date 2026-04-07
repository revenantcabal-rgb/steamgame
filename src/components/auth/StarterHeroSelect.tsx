import { CLASSES } from '../../config/classes';
import { useHeroStore } from '../../store/useHeroStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoryStore } from '../../store/useStoryStore';
import { ItemIcon } from '../../utils/itemIcons';

const STARTER_CLASSES = [
  {
    classId: 'blade_dancer',
    combatStyle: 'Melee',
    icon: '\u2694\uFE0F', // swords
    accentColor: '#e74c3c',
    primaryStat: 'STR',
  },
  {
    classId: 'sharpshooter',
    combatStyle: 'Ranged',
    icon: '\uD83C\uDFF9', // bow
    accentColor: '#27ae60',
    primaryStat: 'DEX',
  },
  {
    classId: 'demolisher',
    combatStyle: 'Demolitions',
    icon: '\uD83D\uDCA3', // bomb
    accentColor: '#3498db',
    primaryStat: 'INT',
  },
];

export function StarterHeroSelect() {
  const recruit = useHeroStore(s => s.recruit);
  const activeSlot = useAuthStore(s => s.activeSlot);
  const updateSlotMetadata = useAuthStore(s => s.updateSlotMetadata);

  const handleSelect = (classId: string) => {
    const hero = recruit(classId, true);
    if (!hero) return;

    // Mark starter hero as chosen on the character slot and save the class ID
    const authState = useAuthStore.getState();
    const slots = authState.characterSlots.map(s =>
      s.slotIndex === activeSlot ? { ...s, starterHeroChosen: true, starterClassId: classId } : s
    );
    useAuthStore.setState({ characterSlots: slots });

    // Set starterCombatStyle in the story store
    const classDef = CLASSES[classId];
    if (classDef) {
      useStoryStore.setState({ starterCombatStyle: classDef.primaryCombatStyle });
    }

    // Persist the slot update
    if (activeSlot !== null) {
      updateSlotMetadata(activeSlot, { heroCount: 1 });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="text-center max-w-3xl px-6">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: 'var(--color-accent)' }}
        >
          Choose Your Starter Hero
        </h1>
        <p
          className="text-sm mb-8"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Every survivor starts with one fighter. Choose your combat style.
        </p>

        <div className="flex gap-6 justify-center flex-wrap">
          {STARTER_CLASSES.map(starter => {
            const cls = CLASSES[starter.classId];
            if (!cls) return null;

            return (
              <button
                key={starter.classId}
                onClick={() => handleSelect(starter.classId)}
                className="p-6 rounded-lg cursor-pointer transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `2px solid var(--color-border)`,
                  width: '220px',
                  textAlign: 'center',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = starter.accentColor;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                <div className="mb-3">
                  <ItemIcon itemId={starter.classId} itemType="hero" size={64} fallbackLabel={starter.icon} fallbackColor={starter.accentColor} />
                </div>
                <div
                  className="text-lg font-bold mb-1"
                  style={{ color: starter.accentColor }}
                >
                  {cls.name}
                </div>
                <div
                  className="text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {starter.combatStyle}
                </div>
                <p
                  className="text-xs mb-3"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {cls.description}
                </p>
                <div
                  className="text-xs px-3 py-1 rounded inline-block"
                  style={{
                    backgroundColor: starter.accentColor + '22',
                    color: starter.accentColor,
                  }}
                >
                  Primary: {starter.primaryStat}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
