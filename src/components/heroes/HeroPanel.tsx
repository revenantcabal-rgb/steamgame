import { useState } from 'react';
import { useHeroStore } from '../../store/useHeroStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { CLASS_LIST, CLASSES } from '../../config/classes';
import { CATEGORIES } from '../../config/categories';
import { getTotalStats, calculateDerivedStats, getEquippedGear, getBaseStatTotal } from '../../engine/HeroEngine';
import type { Hero, PrimaryStats } from '../../types/hero';
import { ProgressBar } from '../common/ProgressBar';
import { xpForLevel } from '../../types/skills';

const CATEGORY_COLORS: Record<string, string> = {
  skirmisher: '#27ae60',
  control: '#3498db',
  support: '#9b59b6',
  assault: '#e74c3c',
  artisan: '#f39c12',
};

const STAT_COLORS: Record<string, string> = {
  str: '#e74c3c',
  dex: '#27ae60',
  int: '#3498db',
  con: '#f39c12',
  per: '#9b59b6',
  luk: '#1abc9c',
  res: '#e879f9',
};

const STAT_LABELS: Record<string, string> = {
  str: 'STR', dex: 'DEX', int: 'INT', con: 'CON', per: 'PER', luk: 'LUK', res: 'RES',
};

const STAT_FULL_NAMES: Record<string, string> = {
  str: 'Strength', dex: 'Dexterity', int: 'Intelligence', con: 'Constitution', per: 'Perception', luk: 'Luck', res: 'Resolve',
};

const STAT_DESCRIPTIONS: Record<string, string> = {
  str: '+2 Melee Attack, +1 Defense per point',
  dex: '+2 Ranged Attack, +0.5 Turn Speed per point',
  int: '+2 Blast Attack, +1% Crit Damage per point',
  con: '+10 Max HP, +1.5 Defense, +0.5 HP Regen per point',
  per: '+0.8% Accuracy, +0.5% Crit Chance per point',
  luk: '+0.5% Evasion, +0.5% Status Resist per point',
  res: '+1% Ability Power, Unlock Ability Slots per point',
};

export function HeroPanel() {
  const heroes = useHeroStore(s => s.heroes);
  const selectedHeroId = useHeroStore(s => s.selectedHeroId);
  const selectHero = useHeroStore(s => s.selectHero);
  const [showRecruit, setShowRecruit] = useState(false);

  const selectedHero = heroes.find(h => h.id === selectedHeroId);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Hero List */}
      <div className="w-72 shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Roster ({heroes.length})
          </h3>
          <button
            onClick={() => setShowRecruit(!showRecruit)}
            className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}
          >
            + Recruit
          </button>
        </div>

        {showRecruit && <RecruitPanel onClose={() => setShowRecruit(false)} />}

        {heroes.length === 0 ? (
          <div className="text-xs text-center p-4" style={{ color: 'var(--color-text-muted)' }}>
            No heroes yet. Click Recruit to enlist your first fighter.
          </div>
        ) : (
          heroes.map(hero => (
            <HeroListCard
              key={hero.id}
              hero={hero}
              isSelected={hero.id === selectedHeroId}
              onClick={() => selectHero(hero.id === selectedHeroId ? null : hero.id)}
            />
          ))
        )}
      </div>

      {/* Hero Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedHero ? (
          <HeroDetail hero={selectedHero} />
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <div className="text-4xl mb-4">&#9876;</div>
              <div className="text-lg mb-2">Select a Hero</div>
              <div className="text-sm">Choose a hero from the roster or recruit a new one.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroListCard({ hero, isSelected, onClick }: { hero: Hero; isSelected: boolean; onClick: () => void }) {
  const classDef = CLASSES[hero.classId];
  const catColor = CATEGORY_COLORS[classDef?.categoryId || ''] || '#888';

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded border transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
        borderColor: isSelected ? catColor : 'var(--color-border)',
        borderWidth: isSelected ? '2px' : '1px',
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</span>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: catColor + '22', color: catColor }}>
          Lv.{hero.level}
        </span>
      </div>
      <div className="text-xs" style={{ color: catColor }}>
        {classDef?.name || hero.classId}
        <span style={{ color: 'var(--color-text-muted)' }}> | {classDef?.heroType === 'specialist' ? 'Specialist' : 'Combat'}</span>
      </div>
      {hero.unspentPoints > 0 && (
        <div className="text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
          {hero.unspentPoints} unspent points!
        </div>
      )}
    </button>
  );
}

function HeroDetail({ hero }: { hero: Hero }) {
  const allocateStat = useHeroStore(s => s.allocateStat);
  const allocateMultiple = useHeroStore(s => s.allocateMultiple);
  const dismissHero = useHeroStore(s => s.dismissHero);
  const classDef = CLASSES[hero.classId];
  const category = CATEGORIES[classDef?.categoryId || ''];
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const totalStats = getTotalStats(hero);
  const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
  const derived = calculateDerivedStats(hero, equippedGear);
  const catColor = CATEGORY_COLORS[classDef?.categoryId || ''] || '#888';

  const currentLevelXp = xpForLevel(hero.level);
  const nextLevelXp = xpForLevel(hero.level + 1);
  const xpIntoLevel = hero.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</h2>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-sm font-bold" style={{ color: catColor }}>{classDef?.name}</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: catColor + '22', color: catColor }}>
              {category?.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{
              backgroundColor: classDef?.heroType === 'specialist' ? '#f39c1222' : '#e74c3c22',
              color: classDef?.heroType === 'specialist' ? '#f39c12' : '#e74c3c',
            }}>
              {classDef?.heroType === 'specialist' ? 'Specialist' : 'Combat'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{classDef?.description}</p>
        </div>
        <button
          onClick={() => { if (confirm(`Dismiss ${hero.name}? This is permanent.`)) dismissHero(hero.id); }}
          className="px-3 py-1 rounded text-xs cursor-pointer"
          style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
        >
          Dismiss
        </button>
      </div>

      {/* Level & XP */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-sm">Level {hero.level}</span>
          {hero.level < 100 && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {xpIntoLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
            </span>
          )}
        </div>
        <ProgressBar value={xpIntoLevel} max={xpNeeded} color="var(--color-xp)" height="8px" />
      </div>

      {/* Primary Stats + Allocation */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm">Primary Attributes</h3>
          {hero.unspentPoints > 0 && (
            <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
              {hero.unspentPoints} points to spend
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(STAT_LABELS) as (keyof PrimaryStats)[]).map(stat => (
            <div key={stat} className="p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold" style={{ color: STAT_COLORS[stat] }}>{STAT_LABELS[stat]}</span>
                  <span className="text-sm font-bold ml-2" style={{ color: 'var(--color-text-primary)' }}>{totalStats[stat]}</span>
                  <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                    ({hero.baseStats[stat]}+{hero.allocatedStats[stat]})
                  </span>
                </div>
                {hero.unspentPoints > 0 && (
                  <div className="flex gap-1">
                    <button onClick={() => allocateStat(hero.id, stat)}
                      className="w-6 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                      style={{ backgroundColor: STAT_COLORS[stat], color: '#000', border: 'none' }}>+</button>
                    {hero.unspentPoints >= 5 && (
                      <button onClick={() => allocateMultiple(hero.id, stat, 5)}
                        className="w-8 h-6 rounded text-xs font-bold cursor-pointer flex items-center justify-center"
                        style={{ backgroundColor: STAT_COLORS[stat] + '88', color: '#000', border: 'none' }}>+5</button>
                    )}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '9px', color: STAT_COLORS[stat] + 'aa', marginTop: '2px', lineHeight: '1.2' }}>
                {STAT_FULL_NAMES[stat]}: {STAT_DESCRIPTIONS[stat]}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Base stat total: {getBaseStatTotal(hero)} | Combat style: {classDef?.primaryCombatStyle}
        </div>
      </div>

      {/* Derived Stats */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-2">Combat Stats</h3>
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
          <DerivedRow label="Max HP" value={derived.maxHp.toFixed(0)} />
          <DerivedRow label="Melee Atk" value={derived.meleeAttack.toFixed(0)} />
          <DerivedRow label="Ranged Atk" value={derived.rangedAttack.toFixed(0)} />
          <DerivedRow label="Blast Atk" value={derived.blastAttack.toFixed(0)} />
          <DerivedRow label="Defense" value={derived.defense.toFixed(0)} suffix="(gear)" />
          <DerivedRow label="Evasion" value={derived.evasion.toFixed(1) + '%'} />
          <DerivedRow label="Accuracy" value={derived.accuracy.toFixed(1) + '%'} />
          <DerivedRow label="Crit Chance" value={derived.critChance.toFixed(1) + '%'} />
          <DerivedRow label="Crit Dmg" value={derived.critDamage.toFixed(0) + '%'} />
          <DerivedRow label="Turn Speed" value={derived.turnSpeed.toFixed(1)} />
          <DerivedRow label="HP Regen" value={derived.hpRegen.toFixed(1) + '/turn'} />
          <DerivedRow label="Status Resist" value={derived.statusResist.toFixed(1) + '%'} />
          <DerivedRow label="Ability Power" value={'+' + derived.abilityPower + '%'} />
          <DerivedRow label="Skill Slots" value={derived.abilitySlots + '/4'} />
          <DerivedRow label="Decree Slot" value={derived.canEquipAura ? 'Unlocked' : 'Need RES 50'} />
        </div>
      </div>

      {/* Ability Slots */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-2">Ability Slots ({derived.abilitySlots}/4 unlocked)</h3>
        <div className="space-y-1">
          {[1, 2, 3, 4].map(slot => {
            const resNeeded = [1, 30, 60, 90][slot - 1];
            const unlocked = slot <= derived.abilitySlots;
            return (
              <div key={slot} className="p-2 rounded flex justify-between items-center" style={{
                backgroundColor: unlocked ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                opacity: unlocked ? 1 : 0.4,
              }}>
                <span className="text-xs" style={{ color: unlocked ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                  Slot {slot}: {unlocked ? 'Empty (equip an Ability Tome)' : `Locked (need RES ${resNeeded})`}
                </span>
              </div>
            );
          })}
          <div className="p-2 rounded flex justify-between items-center" style={{
            backgroundColor: derived.canEquipAura ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
            opacity: derived.canEquipAura ? 1 : 0.4,
            borderLeft: `3px solid ${derived.canEquipAura ? '#a855f7' : 'transparent'}`,
          }}>
            <span className="text-xs" style={{ color: derived.canEquipAura ? '#a855f7' : 'var(--color-text-muted)' }}>
              Decree Slot: {derived.canEquipAura ? 'Empty (equip a Warband Decree)' : 'Locked (need RES 50)'}
            </span>
          </div>
        </div>
        <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          Equip Ability Tomes from drops, crafting, or the market. 5 color types: Red (melee), Green (ranged), Blue (tech), Orange (passive), Purple (special).
        </div>
      </div>

      {/* Category Aura */}
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-1" style={{ color: catColor }}>{category?.name} Bonus</h3>
        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{category?.decreeDescription}</div>
        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Skirmish: {category?.skirmishDescription}</div>
      </div>
    </div>
  );
}

function DerivedRow({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span style={{ color: 'var(--color-text-primary)' }}>
        {value} {suffix && <span style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>}
      </span>
    </div>
  );
}

function RecruitPanel({ onClose }: { onClose: () => void }) {
  const recruit = useHeroStore(s => s.recruit);
  const [filter, setFilter] = useState<'all' | 'combat' | 'specialist'>('all');

  const filtered = CLASS_LIST.filter(c =>
    filter === 'all' ? true : filter === 'combat' ? c.heroType === 'combat' : c.heroType === 'specialist'
  );

  const handleRecruit = (classId: string) => {
    recruit(classId);
  };

  return (
    <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-accent)' }}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-xs" style={{ color: 'var(--color-accent)' }}>Recruitment Post</h4>
        <button onClick={onClose} className="text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}>Close</button>
      </div>
      <div className="flex gap-1 mb-2">
        {(['all', 'combat', 'specialist'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-2 py-1 rounded text-xs cursor-pointer"
            style={{
              backgroundColor: filter === f ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
              color: filter === f ? '#000' : 'var(--color-text-muted)',
              border: 'none',
            }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {filtered.map(cls => {
          const catColor = CATEGORY_COLORS[cls.categoryId] || '#888';
          return (
            <div key={cls.id} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <div>
                <span className="text-xs font-bold" style={{ color: catColor }}>{cls.name}</span>
                <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>
                  ({CATEGORIES[cls.categoryId]?.name} / {cls.primaryCombatStyle})
                </span>
              </div>
              <button onClick={() => handleRecruit(cls.id)}
                className="px-2 py-1 rounded text-xs font-bold cursor-pointer"
                style={{ backgroundColor: catColor, color: '#000', border: 'none' }}>
                Recruit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
