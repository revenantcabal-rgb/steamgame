import { useState, useCallback, useEffect, useRef } from 'react';
import { useHeroStore } from '../../store/useHeroStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useGameStore } from '../../store/useGameStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { COMBAT_ZONES } from '../../config/combatZones';
import { CLASS_LIST, CLASSES, getJob2ClassById } from '../../config/classes';
import { GEAR_TEMPLATES } from '../../config/gear';
import { ABILITIES, ABILITY_COLOR_HEX } from '../../config/abilities';
import type { AbilityTome } from '../../config/abilities';
import { CONSUMABLES } from '../../config/consumables';
import { getTotalStats, calculateDerivedStats, getEquippedGear, getBaseStatTotal } from '../../engine/HeroEngine';
import type { Hero, PrimaryStats } from '../../types/hero';
import { ALL_EQUIPMENT_SLOTS, RARITY_COLORS, RARITY_LABELS } from '../../types/equipment';
import type { EquipmentSlot, GearInstance } from '../../types/equipment';
import { ProgressBar } from '../common/ProgressBar';
import { xpForLevel } from '../../types/skills';
import { ItemIcon } from '../../utils/itemIcons';

const BASE_CLASS_COLORS: Record<string, string> = {
  melee: '#ef4444',
  ranger: '#22c55e',
  demolition: '#3b82f6',
  support: '#f59e0b',
};

const STAT_COLORS: Record<string, string> = {
  str: '#e74c3c',
  dex: '#27ae60',
  int: '#3498db',
  con: '#f39c12',
  per: '#9b59b6',
  luk: '#1abc9c',
  res: '#e879f9',
  spd: '#06b6d4',
};

const STAT_LABELS: Record<string, string> = {
  str: 'STR', dex: 'DEX', int: 'INT', con: 'CON', per: 'PER', luk: 'LUK', res: 'RES', spd: 'SPD',
};

const STAT_FULL_NAMES: Record<string, string> = {
  str: 'Strength', dex: 'Dexterity', int: 'Intelligence', con: 'Constitution', per: 'Perception', luk: 'Luck', res: 'Resolve', spd: 'Speed',
};

const STAT_DESCRIPTIONS: Record<string, string> = {
  str: '+2 Melee Attack, +1 Defense per point',
  dex: '+2 Ranged Attack, +0.3 Evasion per point',
  int: '+2 Blast Attack, +1% Crit Damage per point',
  con: '+10 Max HP, +1.5 Defense, +0.5 HP Regen per point',
  per: '+0.8% Accuracy, +0.5% Crit Chance per point',
  luk: '+0.5% Evasion, +0.5% Status Resist per point',
  res: '+1% Ability Power, Unlock Ability Slots per point',
  spd: '+1 Turn Speed per point (turn gauge fill rate)',
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
      <div className="w-56 xl:w-72 shrink-0 overflow-y-auto p-3 space-y-2" style={{ borderRight: '1px solid var(--color-border)' }}>
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

        {showRecruit && <RecruitModal onClose={() => setShowRecruit(false)} />}

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
  const classColor = BASE_CLASS_COLORS[classDef?.baseClass || ''] || '#888';
  const job2 = hero.job2ClassId ? getJob2ClassById(hero.job2ClassId) : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 rounded border transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'var(--color-bg-secondary)',
        borderColor: isSelected ? classColor : 'var(--color-border)',
        borderWidth: isSelected ? '2px' : '1px',
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <ItemIcon itemId={hero.classId} itemType="hero" size={28} fallbackLabel={hero.name.charAt(0)} fallbackColor={classColor} />
          <span className="font-bold text-xs" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: classColor + '22', color: classColor }}>
          Lv.{hero.level}
        </span>
      </div>
      <div className="text-xs flex items-center gap-1" style={{ color: classColor }}>
        {classDef?.name || hero.classId}
        {job2 && <span style={{ color: 'var(--color-text-muted)' }}> / {job2.name}</span>}
        {classDef?.statEmphasis?.[0] && (
          <span style={{ color: STAT_COLORS[classDef.statEmphasis[0] as keyof typeof STAT_COLORS], fontWeight: 'bold' }}>
            {STAT_LABELS[classDef.statEmphasis[0] as keyof PrimaryStats]}
          </span>
        )}
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
  const deployments = useCombatZoneStore(s => s.deployments);
  const recallHero = useCombatZoneStore(s => s.recallHero);
  const [dismissStep, setDismissStep] = useState(0);
  const [pendingAlloc, setPendingAlloc] = useState<Record<string, number>>({});
  const classDef = CLASSES[hero.classId];
  const job2 = hero.job2ClassId ? getJob2ClassById(hero.job2ClassId) : null;
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const totalStats = getTotalStats(hero);
  const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
  const derived = calculateDerivedStats(hero, equippedGear);
  const classColor = BASE_CLASS_COLORS[classDef?.baseClass || ''] || '#888';

  const currentLevelXp = xpForLevel(hero.level);
  const nextLevelXp = xpForLevel(hero.level + 1);
  const xpIntoLevel = hero.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const primaryStatKey = classDef?.statEmphasis?.[0] as keyof PrimaryStats | undefined;

  // Compute base stats (no gear) vs total to build per-stat tooltips
  const baseOnly = calculateDerivedStats(hero, []);

  const SLOT_COLORS: Record<string, string> = {
    weapon: '#e74c3c',
    shield: '#3498db',
    armor: '#27ae60',
    legs: '#27ae60',
    gloves: '#27ae60',
    boots: '#27ae60',
    ring: '#f39c12',
    earring: '#f39c12',
    necklace: '#f39c12',
  };
  const SLOT_TAGS: Record<string, string> = {
    weapon: 'WPN',
    shield: 'SHD',
    armor: 'ARM',
    legs: 'ARM',
    gloves: 'ARM',
    boots: 'ARM',
    ring: 'ACC',
    earring: 'ACC',
    necklace: 'ACC',
  };

  interface GearContrib { name: string; value: number; pct: boolean; slot: string }
  const gearContribs: Record<string, GearContrib[]> = {};
  if (equippedGear) {
    for (const gear of equippedGear) {
      const tmpl = GEAR_TEMPLATES[gear.templateId];
      if (!tmpl) continue;
      const gearName = (gear.aspect ? `${gear.aspect.name} ` : '') + tmpl.name;
      const slot = tmpl.slot;
      const allBonuses = [
        ...tmpl.baseStats.map(b => ({ ...b })),
        ...(tmpl.inherentDownside ? [{ stat: tmpl.inherentDownside.stat, value: tmpl.inherentDownside.value, isPercentage: tmpl.inherentDownside.isPercentage }] : []),
        ...gear.rarityBonuses.map(b => ({ ...b })),
        ...gear.rarityCurses.map(c => ({ stat: c.stat, value: -Math.abs(c.value), isPercentage: c.isPercentage })),
        ...(gear.aspect ? [gear.aspect.upside, gear.aspect.downside] : []),
      ];
      for (const b of allBonuses) {
        if (!b || b.stat === 'none') continue;
        if (!gearContribs[b.stat]) gearContribs[b.stat] = [];
        gearContribs[b.stat].push({ name: gearName, value: b.value, pct: b.isPercentage, slot });
      }
    }
  }

  function statTipData(statKey: string, baseVal: number, unit: string = '') {
    return { baseVal, unit, contribs: gearContribs[statKey] || [] };
  }

  return (
    <div>
      {/* ─── Compact Header ─── */}
      <div className="p-3 rounded mb-3" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <ItemIcon itemId={hero.classId} itemType="hero" size={52} fallbackLabel={hero.name.charAt(0)} fallbackColor={classColor} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="text-lg font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>{hero.name}</h2>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'var(--color-xp)' + '33', color: 'var(--color-xp)' }}>
                Lv.{hero.level}
              </span>
            </div>
            <div className="flex gap-1.5 items-center flex-wrap">
              <span className="text-xs font-bold" style={{ color: classColor }}>{classDef?.name}</span>
              {job2 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: classColor + '22', color: classColor }}>{job2.name}</span>
              )}
              <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: classColor + '22', color: classColor }}>
                {classDef?.baseClass ? classDef.baseClass.charAt(0).toUpperCase() + classDef.baseClass.slice(1) : ''}
              </span>
              {primaryStatKey && (
                <span className="text-[11px] px-1.5 py-0.5 rounded font-bold" style={{
                  backgroundColor: STAT_COLORS[primaryStatKey] + '22',
                  color: STAT_COLORS[primaryStatKey],
                }}>{STAT_LABELS[primaryStatKey]}</span>
              )}
              {hero.primaryAttribute && (
                <span className="text-[11px] px-1.5 py-0.5 rounded" style={{
                  backgroundColor: STAT_COLORS[hero.primaryAttribute] + '22',
                  color: STAT_COLORS[hero.primaryAttribute],
                }}>Pri: {STAT_LABELS[hero.primaryAttribute]}</span>
              )}
              {classDef?.primaryCombatStyle && (
                <span className="text-[11px] px-1.5 py-0.5 rounded font-bold" style={{
                  backgroundColor: classDef.primaryCombatStyle === 'melee' ? '#ef444422' : classDef.primaryCombatStyle === 'ranger' ? '#22c55e22' : '#3b82f622',
                  color: classDef.primaryCombatStyle === 'melee' ? '#ef4444' : classDef.primaryCombatStyle === 'ranger' ? '#22c55e' : '#3b82f6',
                }}>{classDef.primaryCombatStyle.charAt(0).toUpperCase() + classDef.primaryCombatStyle.slice(1)}</span>
              )}
            </div>
            {/* XP bar inline */}
            {hero.level < 100 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1"><ProgressBar value={xpIntoLevel} max={xpNeeded} color="var(--color-xp)" height="5px" /></div>
                <span className="text-[11px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>{xpIntoLevel.toLocaleString()}/{xpNeeded.toLocaleString()} XP</span>
              </div>
            )}
          </div>
          {dismissStep === 0 && (
            <button onClick={() => setDismissStep(1)} className="px-2 py-1 rounded text-[11px] cursor-pointer shrink-0"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* Dismiss confirmation */}
      {dismissStep >= 1 && (
        <div className="p-3 rounded mb-3" style={{ backgroundColor: dismissStep === 2 ? '#e74c3c22' : '#e74c3c15', border: `${dismissStep === 2 ? 2 : 1}px solid var(--color-danger)` }}>
          <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-danger)' }}>
            {dismissStep === 1 ? `Warning: Dismissing ${hero.name} costs 5,000 WC (no refund). They won't leave quietly.` : 'FINAL CONFIRMATION'}
          </div>
          {dismissStep === 2 && (
            <div className="text-xs mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Pay <b style={{ color: 'var(--color-accent)' }}>5,000 WC</b> to dismiss <b>{hero.name}</b> (Lv.{hero.level} {classDef?.name})? All progress will be lost.
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => dismissStep === 1 ? setDismissStep(2) : (() => { dismissHero(hero.id); setDismissStep(0); })()}
              className="px-3 py-1 rounded text-xs font-bold cursor-pointer"
              style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
              {dismissStep === 1 ? 'I understand, continue' : 'Yes, pay 5,000 WC & dismiss'}
            </button>
            <button onClick={() => setDismissStep(0)} className="px-3 py-1 rounded text-xs cursor-pointer"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Combat Deployment Status */}
      {(() => {
        const heroDeployments = deployments.filter(d => d.heroIds.includes(hero.id));
        if (heroDeployments.length === 0) return null;
        return (
          <div className="p-3 rounded mb-3" style={{ backgroundColor: '#e74c3c11', border: '1px solid var(--color-danger)' }}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-danger)' }}>
                <span className="combat-swords-icon" style={{ fontSize: '12px' }}>&#9876;</span> In Combat
              </h3>
            </div>
            {heroDeployments.map(dep => {
              const zone = COMBAT_ZONES[dep.zoneId];
              const target = zone?.targets?.find((t: any) => t.id === dep.targetId);
              const cooldown = dep.recoveryCooldowns[hero.id];
              return (
                <div key={dep.partyId} className="flex justify-between items-center text-xs mb-1">
                  <div>
                    <span style={{ color: 'var(--color-text-primary)' }}>{zone?.name || dep.zoneId}</span>
                    {target && <span style={{ color: 'var(--color-text-muted)' }}> — {target.name}</span>}
                    <span style={{ color: 'var(--color-text-muted)' }}> | {dep.totalKills} kills</span>
                    {cooldown > 0 && (
                      <span style={{ color: 'var(--color-energy)' }}> | Recovering: {Math.ceil(cooldown)}s</span>
                    )}
                  </div>
                  <button
                    onClick={() => recallHero(dep.partyId, hero.id)}
                    className="px-2 py-1 rounded text-xs cursor-pointer ml-2"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
                    Recall
                  </button>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ─── Quick Combat Summary ─── */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-xs font-bold" style={{ color: '#e74c3c' }}>
            {classDef?.primaryCombatStyle === 'melee' ? derived.meleeAttack.toFixed(0) : classDef?.primaryCombatStyle === 'ranger' ? derived.rangedAttack.toFixed(0) : derived.blastAttack.toFixed(0)}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Attack</div>
        </div>
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-xs font-bold" style={{ color: '#27ae60' }}>{derived.maxHp.toFixed(0)}</div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>HP</div>
        </div>
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-xs font-bold" style={{ color: '#27ae60' }}>{derived.defense.toFixed(0)}</div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Defense</div>
        </div>
        <div className="p-2 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-xs font-bold" style={{ color: '#9b59b6' }}>{derived.critChance.toFixed(1)}%</div>
          <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Crit</div>
        </div>
      </div>

      {/* ─── Two-Column Layout: Stats | Equipment ─── */}
      <div className="flex gap-3 mb-3" style={{ minHeight: 0 }}>
        {/* Left Column: Attributes + Combat Stats */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Primary Attributes */}
          <div className="p-2.5 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            {(() => {
              const totalPending = Object.values(pendingAlloc).reduce((s, v) => s + v, 0);
              const remainingPoints = hero.unspentPoints - totalPending;
              const hasPending = totalPending > 0;

              const addPending = (stat: string, amount: number) => {
                const capped = Math.min(amount, remainingPoints);
                if (capped <= 0) return;
                setPendingAlloc(p => ({ ...p, [stat]: (p[stat] || 0) + capped }));
              };

              const confirmAlloc = () => {
                for (const [stat, amount] of Object.entries(pendingAlloc)) {
                  if (amount > 0) allocateMultiple(hero.id, stat as keyof PrimaryStats, amount);
                }
                setPendingAlloc({});
              };

              return (<>
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="font-bold text-xs">Attributes</h3>
              {hero.unspentPoints > 0 && (
                <span className="text-[11px] font-bold" style={{ color: 'var(--color-accent)' }}>
                  {hasPending ? `${remainingPoints}/${hero.unspentPoints}` : hero.unspentPoints} pts
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(STAT_LABELS) as (keyof PrimaryStats)[]).map(stat => {
                const isPrimary = stat === primaryStatKey;
                const pending = pendingAlloc[stat] || 0;
                return (
                  <div key={stat} className="group relative flex items-center justify-between px-2 py-1 rounded" style={{
                    backgroundColor: 'var(--color-bg-tertiary)',
                    border: isPrimary ? `1px solid ${STAT_COLORS[stat]}` : pending > 0 ? `1px solid ${STAT_COLORS[stat]}55` : '1px solid transparent',
                    cursor: 'default',
                  }}>
                    {/* Instant tooltip */}
                    <div className="absolute left-0 bottom-full mb-1 px-2 py-1 rounded text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-100" style={{ backgroundColor: '#1a1a1a', border: '1px solid var(--color-border)', color: STAT_COLORS[stat] }}>
                      <b>{STAT_FULL_NAMES[stat]}</b>: <span style={{ color: 'var(--color-text-secondary)' }}>{STAT_DESCRIPTIONS[stat]}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold w-6" style={{ color: STAT_COLORS[stat] }}>{STAT_LABELS[stat]}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalStats[stat] + pending}</span>
                      <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>({hero.baseStats[stat]}+{hero.allocatedStats[stat]}{pending > 0 ? `+${pending}` : ''})</span>
                    </div>
                    {remainingPoints > 0 && (
                      <div className="flex gap-0.5">
                        <button onClick={() => addPending(stat, 1)}
                          className="w-5 h-5 rounded text-[11px] font-bold cursor-pointer flex items-center justify-center"
                          style={{ backgroundColor: STAT_COLORS[stat], color: '#000', border: 'none' }}>+</button>
                        {remainingPoints >= 5 && (
                          <button onClick={() => addPending(stat, 5)}
                            className="w-6 h-5 rounded text-[11px] font-bold cursor-pointer flex items-center justify-center"
                            style={{ backgroundColor: STAT_COLORS[stat] + 'bb', color: '#000', border: 'none' }}>+5</button>
                        )}
                        {remainingPoints > 1 && (
                          <button onClick={() => addPending(stat, remainingPoints)}
                            className="px-1 h-5 rounded text-[11px] font-bold cursor-pointer flex items-center justify-center"
                            style={{ backgroundColor: STAT_COLORS[stat] + '66', color: '#000', border: 'none' }}>Max</button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {hasPending && (
              <div className="flex gap-2 mt-2">
                <button onClick={confirmAlloc}
                  className="flex-1 py-1.5 rounded text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
                  Confirm ({totalPending} pts)
                </button>
                <button onClick={() => setPendingAlloc({})}
                  className="px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                  Cancel
                </button>
              </div>
            )}
              </>);
            })()}
          </div>

          {/* Combat Stats */}
          <div className="p-2.5 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-bold text-xs mb-1.5">Combat Stats</h3>
            <div className="space-y-2">
              <div>
                <div className="text-[11px] font-bold mb-0.5" style={{ color: '#e74c3c' }}>Offense</div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-xs">
                  <DerivedRow label="Melee" value={derived.meleeAttack.toFixed(0)} highlight={classDef?.primaryCombatStyle === 'melee'} tooltip={statTipData('meleeAttack', baseOnly.meleeAttack)} />
                  <DerivedRow label="Ranged" value={derived.rangedAttack.toFixed(0)} highlight={classDef?.primaryCombatStyle === 'ranger'} tooltip={statTipData('rangedAttack', baseOnly.rangedAttack)} />
                  <DerivedRow label="Blast" value={derived.blastAttack.toFixed(0)} highlight={classDef?.primaryCombatStyle === 'demolitions'} tooltip={statTipData('blastAttack', baseOnly.blastAttack)} />
                  <DerivedRow label="Crit" value={derived.critChance.toFixed(1) + '%'} tooltip={statTipData('critChance', baseOnly.critChance, '%')} />
                  <DerivedRow label="Crit Dmg" value={derived.critDamage.toFixed(0) + '%'} tooltip={statTipData('critDamage', baseOnly.critDamage, '%')} />
                  <DerivedRow label="Ability Pwr" value={'+' + derived.abilityPower + '%'} tooltip={statTipData('abilityPower', baseOnly.abilityPower, '%')} />
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold mb-0.5" style={{ color: '#27ae60' }}>Defense</div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-xs">
                  <DerivedRow label="HP" value={derived.maxHp.toFixed(0)} highlight tooltip={statTipData('maxHp', baseOnly.maxHp)} />
                  <DerivedRow label="Defense" value={derived.defense.toFixed(0)} tooltip={statTipData('defense', baseOnly.defense)} />
                  <DerivedRow label="Evasion" value={derived.evasion.toFixed(1) + '%'} tooltip={statTipData('evasion', baseOnly.evasion, '%')} />
                  <DerivedRow label="HP Regen" value={derived.hpRegen.toFixed(1)} tooltip={statTipData('hpRegen', baseOnly.hpRegen)} />
                  <DerivedRow label="Status Res" value={derived.statusResist.toFixed(1) + '%'} tooltip={statTipData('statusResist', baseOnly.statusResist, '%')} />
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold mb-0.5" style={{ color: '#3498db' }}>Speed</div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-xs">
                  <DerivedRow label="Turn Speed" value={derived.turnSpeed.toFixed(1)} tooltip={statTipData('turnSpeed', baseOnly.turnSpeed)} />
                  <DerivedRow label="Accuracy" value={derived.accuracy.toFixed(1) + '%'} tooltip={statTipData('accuracy', baseOnly.accuracy, '%')} />
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold mb-0.5" style={{ color: '#e879f9' }}>Spirit</div>
                <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 text-xs">
                  <DerivedRow label="Max SP" value={derived.maxSp.toFixed(0)} tooltip={statTipData('maxSp', baseOnly.maxSp)} />
                  <DerivedRow label="SP Regen" value={derived.spRegen.toFixed(1)} tooltip={statTipData('spRegen', baseOnly.spRegen)} />
                  <DerivedRow label="SP Cost" value={'-' + derived.spCostReduction.toFixed(0) + '%'} tooltip={statTipData('spCostReduction', baseOnly.spCostReduction, '%')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Equipment */}
        <div className="flex-1 min-w-0">
          <HeroEquipmentSection heroId={hero.id} />
        </div>
      </div>

      {/* ─── Advanced Stats (collapsible) ─── */}
      {(() => {
        const hasExtended = derived.lifesteal > 0 || derived.burnDot > 0 || derived.poisonDot > 0 || derived.frostSlow > 0 ||
          derived.thornsDamage > 0 || derived.blockChance > 0 || derived.armorPen > 0 || derived.damageReduction > 0;
        const hasUtility = derived.dropChance > 0 || derived.gatheringSpeed > 0 || derived.gatheringYield > 0 || derived.productionSpeed > 0 ||
          derived.xpBonus > 0 || derived.rareResourceChance > 0 || derived.rarityUpgrade > 0 || derived.doubleOutput > 0;
        if (!hasExtended && !hasUtility) return null;
        return <AdvancedStatsSection derived={derived} hasExtended={hasExtended} hasUtility={hasUtility} />;
      })()}

      {/* ─── Abilities & Consumables side by side ─── */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <HeroAbilitySection hero={hero} derived={derived} />
        </div>
        <div className="flex-1 min-w-0">
          <HeroConsumableSection hero={hero} derived={derived} />
        </div>
      </div>

      {/* Base Class Info */}
      <div className="p-2.5 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-xs mb-1" style={{ color: classColor }}>
          {classDef?.baseClass ? classDef.baseClass.charAt(0).toUpperCase() + classDef.baseClass.slice(1) : 'Unknown'} Class
        </h3>
        <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>{classDef?.description}</div>
      </div>
    </div>
  );
}

function HeroEquipmentSection({ heroId }: { heroId: string }) {
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const equipItem = useEquipmentStore(s => s.equipItem);
  const unequipItem = useEquipmentStore(s => s.unequipItem);
  const deployments = useCombatZoneStore(s => s.deployments);
  const resources = useGameStore(s => s.resources);
  const heroes = useHeroStore(s => s.heroes);
  const [expandedSlot, setExpandedSlot] = useState<EquipmentSlot | null>(null);

  const hero = heroes.find(h => h.id === heroId);
  const classDef = hero ? CLASSES[hero.classId] : null;
  const heroStyle = classDef?.primaryCombatStyle;
  const isDeployed = deployments.some(d => d.heroIds.includes(heroId));
  const equipped = heroEquipment[heroId] || {};

  // Get all equipped instance IDs across all heroes (to exclude from available list)
  const allEquippedIds = new Set<string>();
  for (const eq of Object.values(heroEquipment)) {
    for (const v of Object.values(eq)) {
      if (v) allEquippedIds.add(v);
    }
  }

  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Equipment</h3>
        {isDeployed && (
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-danger)', color: '#fff' }}>
            Deployed — Equipment Locked
          </span>
        )}
      </div>

      {/* Weapons Row */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {renderSlot('main_hand', 'Main Hand', 'weapon')}
        {renderSlot('off_hand', 'Off Hand', 'shield')}
      </div>

      {/* Armor Row */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {renderSlot('armor', 'Armor', 'armor')}
        {renderSlot('legs', 'Legs', 'legs')}
        {renderSlot('gloves', 'Gloves', 'gloves')}
        {renderSlot('boots', 'Boots', 'boots')}
      </div>

      {/* Accessories Row */}
      <div className="text-xs font-bold mb-1 mt-3" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>Accessories</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        {renderSlot('ring1', 'Ring 1', 'ring')}
        {renderSlot('ring2', 'Ring 2', 'ring')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {renderSlot('earring1', 'Earring 1', 'earring')}
        {renderSlot('earring2', 'Earring 2', 'earring')}
        {renderSlot('necklace', 'Necklace', 'necklace')}
      </div>
    </div>
  );

  function renderSlot(slot: EquipmentSlot, label: string, category: string) {
    const equippedId = (equipped as Record<string, string | null>)[slot] || null;
    const equippedGear = equippedId ? inventory.find(g => g.instanceId === equippedId) : null;
    const equippedTemplate = equippedGear ? GEAR_TEMPLATES[equippedGear.templateId] : null;
    const isExpanded = expandedSlot === slot;

    const available = inventory.filter(g => {
      if (equippedId && g.instanceId === equippedId) return false;
      if (allEquippedIds.has(g.instanceId)) return false;
      const tmpl = GEAR_TEMPLATES[g.templateId];
      if (!tmpl) return false;
      if (tmpl.slot !== category) return false;
      // Only show weapons matching hero's combat style
      if (tmpl.weaponType && heroStyle && tmpl.weaponType !== heroStyle) return false;
      return true;
    });

    return (
      <div key={slot}>
        <button
          onClick={() => !isDeployed && setExpandedSlot(isExpanded ? null : slot)}
          className="w-full text-left p-2 rounded text-xs"
          style={{
            backgroundColor: equippedGear ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
            border: isExpanded ? '2px solid var(--color-accent)' : equippedGear ? `1px solid ${RARITY_COLORS[equippedGear.rarity]}44` : '1px dashed var(--color-border)',
            opacity: isDeployed ? 0.6 : 1,
            cursor: isDeployed ? 'not-allowed' : 'pointer',
            minHeight: '44px',
          }}
        >
          <div className="text-[11px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
          {equippedGear && equippedTemplate ? (
            <>
              <div className="font-bold flex items-center gap-1" style={{ color: RARITY_COLORS[equippedGear.rarity], fontSize: 11 }}>
                <ItemIcon itemId={equippedTemplate.id} itemType="equipment" gearSlot={equippedTemplate.slot} size={16} fallbackLabel={equippedTemplate.name.charAt(0)} />
                {equippedGear.aspect ? `${equippedGear.aspect.name} ` : ''}{equippedTemplate.name}
                {equippedGear.upgradeLevel > 0 && <span style={{ color: '#d4a843' }}> +{equippedGear.upgradeLevel}</span>}
              </div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {equippedTemplate.baseStats.slice(0, 2).map((s, i) => (
                  <span key={i} style={{ color: 'var(--color-success)', fontSize: 11 }}>
                    +{Math.round(s.value * equippedGear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
                  </span>
                ))}
                {equippedTemplate.baseStats.length > 2 && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>+{equippedTemplate.baseStats.length - 2} more</span>
                )}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: 11 }}>Empty</div>
          )}
        </button>

        {isExpanded && (
                <div className="mt-1 p-2 rounded space-y-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', maxHeight: '240px' }}>
                  {equippedGear && (
                    <>
                      <button onClick={() => { unequipItem(heroId, slot); setExpandedSlot(null); }}
                        className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                        style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
                        Unequip {equippedTemplate?.name}
                      </button>
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => { useEquipmentStore.getState().rerollAspect(equippedGear.instanceId); }}
                          className="flex-1 p-1 rounded text-xs cursor-pointer"
                          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-info)', border: '1px solid var(--color-border)' }}>
                          Re-roll Aspect ({resources['aspect_stone'] || 0})
                        </button>
                      </div>
                    </>
                  )}
                  {available.length === 0 && !equippedGear && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No gear available for this slot.</div>
                  )}
                  {available.map(gear => {
                    const tmpl = GEAR_TEMPLATES[gear.templateId];
                    if (!tmpl) return null;
                    return (
                      <button key={gear.instanceId}
                        onClick={() => { equipItem(heroId, slot, gear.instanceId); setExpandedSlot(null); }}
                        className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                        style={{ backgroundColor: 'var(--color-bg-tertiary)', border: `1px solid ${RARITY_COLORS[gear.rarity]}44`, color: 'var(--color-text-primary)' }}>
                        <div className="font-bold flex items-center gap-1" style={{ color: RARITY_COLORS[gear.rarity] }}>
                          <ItemIcon itemId={tmpl.id} itemType="equipment" gearSlot={tmpl.slot} size={18} fallbackLabel={tmpl.name.charAt(0)} />
                          {gear.aspect ? `${gear.aspect.name} ` : ''}{tmpl.name}{gear.upgradeLevel > 0 ? ` +${gear.upgradeLevel}` : ''} [{RARITY_LABELS[gear.rarity]}]
                        </div>
                        {tmpl.description && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: 11, fontStyle: 'italic', marginTop: '2px' }}>
                            {tmpl.description}
                          </div>
                        )}
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)', fontSize: 11, marginTop: '2px' }}>
                          T{tmpl.tier} {tmpl.slot} | Lv.{tmpl.levelReq}+
                          {tmpl.weaponType && ` | ${tmpl.weaponType}`}
                          {tmpl.isTwoHanded && ' (2H)'}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tmpl.baseStats.map((s, i) => (
                            <span key={i} style={{ color: 'var(--color-success)', fontSize: 11 }}>
                              +{Math.round(s.value * gear.sourcePowerMultiplier)} {s.stat}{s.isPercentage ? '%' : ''}
                            </span>
                          ))}
                          {tmpl.inherentDownside && (
                            <span style={{ color: 'var(--color-danger)', fontSize: 11 }}>
                              {tmpl.inherentDownside.value} {tmpl.inherentDownside.stat}{tmpl.inherentDownside.isPercentage ? '%' : ''}
                            </span>
                          )}
                        </div>
                        {gear.aspect && gear.aspect.upside.stat !== 'none' && (
                          <div style={{ color: 'var(--color-energy)', fontSize: 11, marginTop: '2px' }}>
                            [{gear.aspect.name}] +{gear.aspect.upside.value}{gear.aspect.upside.isPercentage ? '%' : ''} {gear.aspect.upside.stat} / {gear.aspect.downside.value}{gear.aspect.downside.isPercentage ? '%' : ''} {gear.aspect.downside.stat}
                          </div>
                        )}
                        {gear.rarityBonuses.length > 0 && (
                          <div className="flex flex-wrap gap-1" style={{ marginTop: '2px' }}>
                            {gear.rarityBonuses.map((b, i) => (
                              <span key={i} style={{ color: RARITY_COLORS[gear.rarity], fontSize: 11 }}>+{b.value}{b.isPercentage ? '%' : ''} {b.stat}</span>
                            ))}
                          </div>
                        )}
                        {gear.rarityCurses.length > 0 && (
                          <div className="flex flex-wrap gap-1" style={{ marginTop: '2px' }}>
                            {gear.rarityCurses.map((c, i) => (
                              <span key={i} style={{ color: '#ff4444', fontSize: 11 }}>CURSE: {c.value}{c.isPercentage ? '%' : ''} {c.stat}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
  }
}

function HeroAbilitySection({ hero, derived }: { hero: Hero; derived: ReturnType<typeof calculateDerivedStats> }) {
  const ownedAbilities = useHeroStore(s => s.ownedAbilities);
  const equipAbility = useHeroStore(s => s.equipAbility);
  const unequipAbility = useHeroStore(s => s.unequipAbility);
  const equipDecree = useHeroStore(s => s.equipDecree);
  const unequipDecree = useHeroStore(s => s.unequipDecree);
  const heroes = useHeroStore(s => s.heroes);
  const deployments = useCombatZoneStore(s => s.deployments);
  const isDeployed = deployments.some(d => d.heroIds.includes(hero.id));
  const [expandedSlot, setExpandedSlot] = useState<number | 'decree' | null>(null);

  const equippedAbilities = hero.equippedAbilities || [null, null, null, null];
  const equippedDecree = hero.equippedDecree || null;
  const totalStats = getTotalStats(hero);

  // Collect all ability IDs equipped on OTHER heroes
  const equippedElsewhere = new Set<string>();
  for (const h of heroes) {
    if (h.id === hero.id) continue;
    for (const aid of (h.equippedAbilities || [])) {
      if (aid) equippedElsewhere.add(aid);
    }
    if (h.equippedDecree) equippedElsewhere.add(h.equippedDecree);
  }

  const meetsRequirements = (ability: AbilityTome): boolean => {
    for (const req of ability.requirements) {
      const statKey = req.stat as keyof PrimaryStats;
      if ((totalStats[statKey] || 0) < req.value) return false;
    }
    return true;
  };

  const getAvailableForSlot = (slotIndex: number): AbilityTome[] => {
    return ownedAbilities
      .map(id => ABILITIES[id])
      .filter((a): a is AbilityTome => {
        if (!a) return false;
        if (a.isDecree) return false; // decrees go in decree slot only
        if (equippedElsewhere.has(a.id)) return false;
        // Don't show abilities already equipped in other slots on this hero
        for (let i = 0; i < 4; i++) {
          if (i !== slotIndex && equippedAbilities[i] === a.id) return false;
        }
        if (equippedDecree === a.id) return false;
        return meetsRequirements(a);
      });
  };

  const getAvailableDecrees = (): AbilityTome[] => {
    return ownedAbilities
      .map(id => ABILITIES[id])
      .filter((a): a is AbilityTome => {
        if (!a) return false;
        if (!a.isDecree) return false;
        if (equippedElsewhere.has(a.id)) return false;
        return meetsRequirements(a);
      });
  };

  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Ability Slots ({derived.abilitySlots}/4 unlocked)</h3>
        {isDeployed && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
            Deployed — Abilities Locked
          </span>
        )}
      </div>
      <div className="space-y-1">
        {[0, 1, 2, 3].map(slotIndex => {
          const resNeeded = [1, 30, 60, 90][slotIndex];
          const unlocked = slotIndex < derived.abilitySlots;
          const equippedId = equippedAbilities[slotIndex];
          const equippedAbility = equippedId ? ABILITIES[equippedId] : null;
          const isExpanded = expandedSlot === slotIndex;

          return (
            <div key={slotIndex}>
              <button
                onClick={() => !isDeployed && unlocked && setExpandedSlot(isExpanded ? null : slotIndex)}
                className="w-full text-left p-2 rounded"
                style={{
                  backgroundColor: unlocked ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                  opacity: isDeployed ? 0.6 : unlocked ? 1 : 0.4,
                  cursor: isDeployed ? 'not-allowed' : unlocked ? 'pointer' : 'default',
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : equippedAbility ? ABILITY_COLOR_HEX[equippedAbility.color] + '66' : 'var(--color-border)'}`,
                  borderLeft: equippedAbility ? `3px solid ${ABILITY_COLOR_HEX[equippedAbility.color]}` : undefined,
                }}
              >
                {unlocked ? (
                  equippedAbility ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: ABILITY_COLOR_HEX[equippedAbility.color] }}>
                          <ItemIcon itemId={equippedAbility.id} itemType="ability" size={20} fallbackColor={ABILITY_COLOR_HEX[equippedAbility.color]} />
                          Slot {slotIndex + 1}: {equippedAbility.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {equippedAbility.isPassive ? 'Passive' : `SP: ${equippedAbility.spCost} | CD: ${equippedAbility.cooldown}t`}
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {equippedAbility.effect}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Slot {slotIndex + 1}: Empty (click to equip)
                    </span>
                  )
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Slot {slotIndex + 1}: Locked (need RES {resNeeded})
                  </span>
                )}
              </button>

              {isExpanded && unlocked && (
                <div className="mt-1 p-2 rounded space-y-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', maxHeight: '240px' }}>
                  {equippedAbility && (
                    <button
                      onClick={() => { unequipAbility(hero.id, slotIndex); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                    >
                      Unequip {equippedAbility.name}
                    </button>
                  )}
                  {getAvailableForSlot(slotIndex).map(ability => (
                    <button
                      key={ability.id}
                      onClick={() => { equipAbility(hero.id, slotIndex, ability.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: `1px solid ${ABILITY_COLOR_HEX[ability.color]}44`,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold flex items-center gap-1" style={{ color: ABILITY_COLOR_HEX[ability.color] }}>
                          <ItemIcon itemId={ability.id} itemType="ability" size={16} fallbackColor={ABILITY_COLOR_HEX[ability.color]} />
                          {ability.name}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {ability.isPassive ? 'Passive' : `SP: ${ability.spCost} | CD: ${ability.cooldown}t`}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 2 }}>
                        {ability.effect}
                      </div>
                    </button>
                  ))}
                  {getAvailableForSlot(slotIndex).length === 0 && !equippedAbility && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No abilities available. Acquire tomes from combat drops or the market.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Decree slot */}
        {(() => {
          const isExpanded = expandedSlot === 'decree';
          const decreeAbility = equippedDecree ? ABILITIES[equippedDecree] : null;
          return (
            <div>
              <button
                onClick={() => derived.canEquipAura && setExpandedSlot(isExpanded ? null : 'decree')}
                className="w-full text-left p-2 rounded cursor-pointer"
                style={{
                  backgroundColor: derived.canEquipAura ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                  opacity: derived.canEquipAura ? 1 : 0.4,
                  borderLeft: `3px solid ${derived.canEquipAura ? '#a855f7' : 'transparent'}`,
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : decreeAbility ? '#a855f766' : 'var(--color-border)'}`,
                }}
              >
                {derived.canEquipAura ? (
                  decreeAbility ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#a855f7' }}>
                          <ItemIcon itemId={decreeAbility.id} itemType="ability" size={20} fallbackColor="#a855f7" />
                          Decree: {decreeAbility.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Party-wide</span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {decreeAbility.effect}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: '#a855f7' }}>
                      Decree Slot: Empty (click to equip a Warband Decree)
                    </span>
                  )
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Decree Slot: Locked (need RES 50)
                  </span>
                )}
              </button>

              {isExpanded && derived.canEquipAura && (
                <div className="mt-1 p-2 rounded space-y-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', maxHeight: '240px' }}>
                  {decreeAbility && (
                    <button
                      onClick={() => { unequipDecree(hero.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                    >
                      Unequip {decreeAbility.name}
                    </button>
                  )}
                  {getAvailableDecrees().map(ability => (
                    <button
                      key={ability.id}
                      onClick={() => { equipDecree(hero.id, ability.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: '1px solid #a855f744',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="font-bold flex items-center gap-1" style={{ color: '#a855f7' }}>
                        <ItemIcon itemId={ability.id} itemType="ability" size={16} fallbackColor="#a855f7" />
                        {ability.name}
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 2 }}>
                        {ability.effect}
                      </div>
                    </button>
                  ))}
                  {getAvailableDecrees().length === 0 && !decreeAbility && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No decrees available.</div>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
      <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        Equip Ability Tomes from drops, crafting, or the market. 6 color types: Red (melee), Green (ranger), Blue (tech), Orange (passive), Purple (decree), Gold (job2).
      </div>
    </div>
  );
}

const CONSUMABLE_SLOT_THRESHOLDS = [1, 15, 30, 45, 60, 80];

function HeroConsumableSection({ hero, derived }: { hero: Hero; derived: ReturnType<typeof calculateDerivedStats> }) {
  const equipConsumable = useHeroStore(s => s.equipConsumable);
  const unequipConsumable = useHeroStore(s => s.unequipConsumable);
  const resources = useGameStore(s => s.resources);
  const deployments = useCombatZoneStore(s => s.deployments);
  const isDeployed = deployments.some(d => d.heroIds.includes(hero.id));
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);

  const equippedConsumables = hero.equippedConsumables || [null];
  const maxSlots = 6;

  // Get available consumables from player resources
  const getAvailableConsumables = (slotIndex: number) => {
    return Object.values(CONSUMABLES).filter(c => {
      const qty = resources[c.id] || 0;
      if (qty <= 0) return false;
      // Don't show consumables already equipped in other slots on this hero
      for (let i = 0; i < equippedConsumables.length; i++) {
        if (i !== slotIndex && equippedConsumables[i] === c.id) return false;
      }
      return true;
    });
  };

  const TYPE_COLORS: Record<string, string> = {
    food: '#f39c12',
    medicine: '#27ae60',
    chemical: '#e74c3c',
  };

  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-sm">Consumable Bag ({derived.consumableSlots}/{maxSlots} slots)</h3>
        {isDeployed && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
            Deployed — Consumables Locked
          </span>
        )}
      </div>
      <div className="space-y-1">
        {Array.from({ length: maxSlots }).map((_, slotIndex) => {
          const unlocked = slotIndex < derived.consumableSlots;
          const equippedId = equippedConsumables[slotIndex] || null;
          const equippedConsumable = equippedId ? CONSUMABLES[equippedId] : null;
          const isExpanded = expandedSlot === slotIndex;
          const unlockLevel = CONSUMABLE_SLOT_THRESHOLDS[slotIndex];

          return (
            <div key={slotIndex}>
              <button
                onClick={() => !isDeployed && unlocked && setExpandedSlot(isExpanded ? null : slotIndex)}
                className="w-full text-left p-2 rounded"
                style={{
                  backgroundColor: unlocked ? 'var(--color-bg-tertiary)' : 'var(--color-bg-primary)',
                  opacity: isDeployed ? 0.6 : unlocked ? 1 : 0.4,
                  cursor: isDeployed ? 'not-allowed' : unlocked ? 'pointer' : 'default',
                  border: `1px solid ${isExpanded ? 'var(--color-accent)' : equippedConsumable ? (TYPE_COLORS[equippedConsumable.type] || '#888') + '66' : 'var(--color-border)'}`,
                  borderLeft: equippedConsumable ? `3px solid ${TYPE_COLORS[equippedConsumable.type] || '#888'}` : undefined,
                }}
              >
                {unlocked ? (
                  equippedConsumable ? (
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold" style={{ color: TYPE_COLORS[equippedConsumable.type] || '#888' }}>
                          Slot {slotIndex + 1}: {equippedConsumable.name}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {equippedConsumable.duration > 0 ? `${Math.floor(equippedConsumable.duration / 60)}m` : 'Instant'} | CD: {equippedConsumable.cooldown}s
                        </span>
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {equippedConsumable.effect}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        Owned: {resources[equippedConsumable.id] || 0}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      Slot {slotIndex + 1}: Empty (click to equip)
                    </span>
                  )
                ) : (
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Slot {slotIndex + 1}: Unlocks at Lv.{unlockLevel}
                  </span>
                )}
              </button>

              {isExpanded && unlocked && (
                <div className="mt-1 p-2 rounded space-y-1" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', maxHeight: '200px', overflowY: 'auto' }}>
                  {equippedConsumable && (
                    <button
                      onClick={() => { unequipConsumable(hero.id, slotIndex); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                    >
                      Unequip {equippedConsumable.name}
                    </button>
                  )}
                  {getAvailableConsumables(slotIndex).map(consumable => (
                    <button
                      key={consumable.id}
                      onClick={() => { equipConsumable(hero.id, slotIndex, consumable.id); setExpandedSlot(null); }}
                      className="w-full text-left p-1.5 rounded text-xs cursor-pointer"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: `1px solid ${(TYPE_COLORS[consumable.type] || '#888')}44`,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: TYPE_COLORS[consumable.type] || '#888' }}>
                          {consumable.name}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          x{resources[consumable.id] || 0}
                        </span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: 11, marginTop: 2 }}>
                        {consumable.effect}
                        {consumable.duration > 0 && ` (${Math.floor(consumable.duration / 60)}m)`}
                      </div>
                    </button>
                  ))}
                  {getAvailableConsumables(slotIndex).length === 0 && !equippedConsumable && (
                    <div className="text-xs p-1" style={{ color: 'var(--color-text-muted)' }}>No consumables available. Craft food or potions first.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
        Equip crafted consumables for combat bonuses. Food (orange), Medicine (green), Chemical (red). New slots unlock at Lv.15, 30, 45, 60, 80.
      </div>
    </div>
  );
}

interface TipData { baseVal: number; unit: string; contribs: { name: string; value: number; pct: boolean; slot: string }[] }

const TIP_SLOT_COLORS: Record<string, string> = {
  weapon: '#e74c3c', shield: '#3498db',
  armor: '#27ae60', legs: '#27ae60', gloves: '#27ae60', boots: '#27ae60',
  ring: '#f39c12', earring: '#f39c12', necklace: '#f39c12',
};
const TIP_SLOT_TAGS: Record<string, string> = {
  weapon: 'WPN', shield: 'SHD',
  armor: 'ARM', legs: 'ARM', gloves: 'ARM', boots: 'ARM',
  ring: 'ACC', earring: 'ACC', necklace: 'ACC',
};

function DerivedRow({ label, value, suffix, highlight, tooltip }: { label: string; value: string; suffix?: string; highlight?: boolean; tooltip?: TipData }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className="flex justify-between"
      style={{ cursor: tooltip ? 'default' : undefined }}
      onMouseEnter={e => {
        if (!tooltip) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPos({ x: rect.left, y: rect.top });
      }}
      onMouseLeave={() => setPos(null)}
    >
      <span style={{ color: highlight ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: highlight ? 'bold' : 'normal' }}>{label}</span>
      <span style={{ color: highlight ? 'var(--color-accent)' : 'var(--color-text-primary)', fontWeight: highlight ? 'bold' : 'normal' }}>
        {value} {suffix && <span style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>}
      </span>
      {pos && tooltip && (
        <div className="fixed px-2 py-1.5 rounded text-[11px] pointer-events-none" style={{
          backgroundColor: '#111',
          border: '1px solid var(--color-border)',
          zIndex: 9998,
          left: pos.x,
          top: pos.y,
          transform: 'translateY(-100%) translateY(-4px)',
          maxWidth: '300px',
        }}>
          <div style={{ color: 'var(--color-text-muted)' }}>Base: {tooltip.baseVal.toFixed(tooltip.unit === '%' ? 1 : 0)}{tooltip.unit}</div>
          {tooltip.contribs.map((c, i) => {
            const sign = c.value >= 0 ? '+' : '';
            const color = c.value >= 0 ? (TIP_SLOT_COLORS[c.slot] || '#888') : 'var(--color-danger)';
            const tag = TIP_SLOT_TAGS[c.slot] || 'GER';
            return (
              <div key={i} style={{ color }}>
                <span style={{ opacity: 0.6 }}>[{tag}]</span> {c.name}: {sign}{c.value}{c.pct ? '%' : ''}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AdvancedStatsSection({ derived, hasExtended, hasUtility }: { derived: any; hasExtended: boolean; hasUtility: boolean }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center cursor-pointer"
        style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', padding: 0 }}
      >
        <h3 className="font-bold text-sm">Advanced Stats</h3>
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{expanded ? '▲ Collapse' : '▼ Expand'}</span>
      </button>
      {expanded && (
        <div className="mt-2 space-y-3">
          {hasExtended && (
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: '#f39c12' }}>Extended Combat</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                {derived.lifesteal > 0 && <DerivedRow label="Lifesteal" value={derived.lifesteal.toFixed(1) + '%'} />}
                {derived.burnDot > 0 && <DerivedRow label="Burn DoT" value={derived.burnDot.toFixed(1) + '%'} />}
                {derived.poisonDot > 0 && <DerivedRow label="Poison DoT" value={derived.poisonDot.toFixed(1) + '%'} />}
                {derived.frostSlow > 0 && <DerivedRow label="Frost Slow" value={derived.frostSlow.toFixed(1)} />}
                {derived.thornsDamage > 0 && <DerivedRow label="Thorns Dmg" value={derived.thornsDamage.toFixed(1) + '%'} />}
                {derived.blockChance > 0 && <DerivedRow label="Block Chance" value={derived.blockChance.toFixed(1) + '%'} />}
                {derived.armorPen > 0 && <DerivedRow label="Armor Pen" value={derived.armorPen.toFixed(1) + '%'} />}
                {derived.damageReduction > 0 && <DerivedRow label="Dmg Reduction" value={derived.damageReduction.toFixed(1) + '%'} />}
              </div>
            </div>
          )}
          {hasUtility && (
            <div>
              <div className="text-xs font-bold mb-1" style={{ color: '#1abc9c' }}>Utility Bonuses</div>
              <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                {derived.dropChance > 0 && <DerivedRow label="Drop Chance" value={'+' + derived.dropChance.toFixed(1) + '%'} />}
                {derived.gatheringSpeed > 0 && <DerivedRow label="Gather Speed" value={'+' + derived.gatheringSpeed.toFixed(1) + '%'} />}
                {derived.gatheringYield > 0 && <DerivedRow label="Gather Yield" value={'+' + derived.gatheringYield.toFixed(1) + '%'} />}
                {derived.productionSpeed > 0 && <DerivedRow label="Prod Speed" value={'+' + derived.productionSpeed.toFixed(1) + '%'} />}
                {derived.xpBonus > 0 && <DerivedRow label="XP Bonus" value={'+' + derived.xpBonus.toFixed(1) + '%'} />}
                {derived.rareResourceChance > 0 && <DerivedRow label="Rare Resource" value={'+' + derived.rareResourceChance.toFixed(1) + '%'} />}
                {derived.rarityUpgrade > 0 && <DerivedRow label="Rarity Upgrade" value={'+' + derived.rarityUpgrade.toFixed(1) + '%'} />}
                {derived.doubleOutput > 0 && <DerivedRow label="Double Output" value={'+' + derived.doubleOutput.toFixed(1) + '%'} />}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecruitModal({ onClose }: { onClose: () => void }) {
  const recruit = useHeroStore(s => s.recruit);
  const heroes = useHeroStore(s => s.heroes);
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);
  const playerWC = useGameStore(s => s.resources['wasteland_credits'] || 0);
  const [filter, setFilter] = useState<'all' | 'melee' | 'ranger' | 'demolition' | 'support'>('all');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [justRecruited, setJustRecruited] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const recruitmentUnlocked = isFeatureUnlocked('hero_recruitment');
  const isFree = heroes.length === 0;
  const cost = isFree ? 0 : Math.floor(1000 * Math.pow(3, Math.max(0, heroes.length - 1)));
  const canAfford = isFree || playerWC >= cost;

  const filtered = CLASS_LIST.filter(c =>
    filter === 'all' ? true : c.baseClass === filter
  );

  // Reset selection when filter changes
  useEffect(() => { setSelectedIdx(0); }, [filter]);

  // Scroll selected card into view
  useEffect(() => {
    if (carouselRef.current) {
      const cards = carouselRef.current.children;
      if (cards[selectedIdx]) {
        (cards[selectedIdx] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedIdx]);

  const navigate = useCallback((dir: -1 | 1) => {
    setSelectedIdx(prev => {
      const next = prev + dir;
      if (next < 0) return filtered.length - 1;
      if (next >= filtered.length) return 0;
      return next;
    });
  }, [filtered.length]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') navigate(-1);
      else if (e.key === 'ArrowRight') navigate(1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onClose]);

  const handleRecruit = (classId: string) => {
    recruit(classId);
    setJustRecruited(classId);
    setTimeout(() => setJustRecruited(null), 1500);
  };

  const selectedClass = filtered[selectedIdx];

  // Find relevant starting abilities for a class
  const getClassAbilities = (classId: string) => {
    const cls = CLASSES[classId];
    if (!cls) return [];
    const colorMap: Record<string, string[]> = {
      melee: ['red'],
      ranger: ['green'],
      demolitions: ['blue'],
    };
    const relevantColors = colorMap[cls.primaryCombatStyle] || [];
    relevantColors.push('white');
    return Object.values(ABILITIES)
      .filter(a => relevantColors.includes(a.color) && !a.isDecree)
      .slice(0, 4);
  };

  // Full-screen overlay
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 1100, padding: '0 24px', marginBottom: 16 }}>
        <div className="flex justify-between items-center">
          <div>
            <h2 style={{ color: 'var(--color-accent)', fontSize: 22, fontWeight: 'bold', margin: 0 }}>
              &#9876; Recruitment Post
            </h2>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12, marginTop: 4 }}>
              {isFree
                ? <span style={{ color: '#27ae60' }}>First recruit is FREE!</span>
                : <>Cost: <span style={{ color: canAfford ? 'var(--color-accent)' : '#ef4444', fontWeight: 'bold' }}>{cost} WC</span>
                  <span style={{ marginLeft: 8, opacity: 0.6 }}>({playerWC} available)</span></>
              }
              {' '}&middot; Use <span style={{ opacity: 0.7 }}>&larr; &rarr;</span> arrow keys to browse
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid var(--color-border)', borderRadius: 6,
              color: 'var(--color-text-muted)', padding: '6px 16px', cursor: 'pointer', fontSize: 13,
            }}
          >
            Close &times;
          </button>
        </div>

        {/* Locked message */}
        {!recruitmentUnlocked && heroes.length > 0 && (
          <div style={{
            marginTop: 12, padding: 16, borderRadius: 8,
            backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)', textAlign: 'center', fontSize: 13,
          }}>
            &#128274; Complete Story 3.1 to unlock hero recruitment.
          </div>
        )}

        {/* Filter tabs */}
        {(recruitmentUnlocked || heroes.length === 0) && (
          <div className="flex gap-2" style={{ marginTop: 12 }}>
            {(['all', 'melee', 'ranger', 'demolition', 'support'] as const).map(f => {
              const label = f === 'all' ? 'All Classes' : f.charAt(0).toUpperCase() + f.slice(1);
              const count = CLASS_LIST.filter(c => f === 'all' ? true : c.baseClass === f).length;
              return (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 18px', borderRadius: 6, fontSize: 12, fontWeight: 'bold',
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    backgroundColor: filter === f ? (f === 'all' ? 'var(--color-accent)' : BASE_CLASS_COLORS[f] || 'var(--color-accent)') : 'var(--color-bg-secondary)',
                    color: filter === f ? '#000' : 'var(--color-text-muted)',
                  }}
                >{label} ({count})</button>
              );
            })}
          </div>
        )}
      </div>

      {/* Carousel + Detail */}
      {(recruitmentUnlocked || heroes.length === 0) && filtered.length > 0 && (
        <div style={{ display: 'flex', gap: 20, width: '100%', maxWidth: 1100, padding: '0 24px', flex: '1 1 auto', minHeight: 0, maxHeight: 'calc(100vh - 180px)' }}>
          {/* Left: Card carousel */}
          <div style={{ width: 320, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            {/* Navigation */}
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <button onClick={() => navigate(-1)} style={{
                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', padding: '4px 12px', cursor: 'pointer', fontSize: 16,
              }}>&larr;</button>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                {selectedIdx + 1} / {filtered.length}
              </span>
              <button onClick={() => navigate(1)} style={{
                background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
                borderRadius: 6, color: 'var(--color-text-primary)', padding: '4px 12px', cursor: 'pointer', fontSize: 16,
              }}>&rarr;</button>
            </div>

            {/* Scrollable card list */}
            <div ref={carouselRef} style={{
              flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
              paddingRight: 4,
            }}>
              {filtered.map((cls, idx) => {
                const clsColor = BASE_CLASS_COLORS[cls.baseClass] || '#888';
                const isActive = idx === selectedIdx;
                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedIdx(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                      borderRadius: 8, cursor: 'pointer', border: 'none', textAlign: 'left',
                      transition: 'all 0.15s',
                      backgroundColor: isActive ? clsColor + '22' : 'var(--color-bg-secondary)',
                      outline: isActive ? `2px solid ${clsColor}` : '2px solid transparent',
                    }}
                  >
                    <ItemIcon itemId={cls.id} itemType="hero" size={36} fallbackLabel={cls.name.charAt(0)} fallbackColor={clsColor} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: clsColor, fontWeight: 'bold', fontSize: 13 }}>{cls.name}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>
                        {cls.baseClass.charAt(0).toUpperCase() + cls.baseClass.slice(1)} &middot; {cls.primaryCombatStyle}
                      </div>
                    </div>
                    {justRecruited === cls.id && (
                      <span style={{ color: '#27ae60', fontSize: 11, fontWeight: 'bold' }}>Recruited!</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Detail card */}
          {selectedClass && (
            <RecruitDetailCard
              cls={selectedClass}
              abilities={getClassAbilities(selectedClass.id)}
              cost={cost}
              isFree={isFree}
              canAfford={canAfford}
              justRecruited={justRecruited === selectedClass.id}
              onRecruit={() => handleRecruit(selectedClass.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function RecruitDetailCard({ cls, abilities, cost, isFree, canAfford, justRecruited, onRecruit }: {
  cls: (typeof CLASS_LIST)[number];
  abilities: AbilityTome[];
  cost: number;
  isFree: boolean;
  canAfford: boolean;
  justRecruited: boolean;
  onRecruit: () => void;
}) {
  const clsColor = BASE_CLASS_COLORS[cls.baseClass] || '#888';
  const primaryStatKeys = [...new Set(cls.statEmphasis || [])];

  // All heroes start with 10 in every stat; statEmphasis gives +3/+2
  const allStats: (keyof typeof STAT_LABELS)[] = ['str', 'dex', 'int', 'con', 'per', 'luk', 'res', 'spd'];
  const baseStats = allStats.map(stat => {
    let val = 10;
    if (cls.statEmphasis?.[0] === stat) val += 3;
    if (cls.statEmphasis?.[1] === stat) val += 2;
    return { stat, val, label: STAT_LABELS[stat] || stat.toUpperCase(), color: STAT_COLORS[stat] || '#888' };
  });

  const combatStyleIcon: Record<string, string> = { melee: '&#9876;', ranger: '&#127993;', demolitions: '&#128163;' };

  return (
    <div style={{
      flex: 1, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column',
      border: `2px solid ${clsColor}40`,
      backgroundColor: 'var(--color-bg-primary)',
    }}>
      {/* Card header with class color strip */}
      <div style={{
        background: `linear-gradient(135deg, ${clsColor}33, ${clsColor}11)`,
        padding: '20px 24px', borderBottom: `1px solid ${clsColor}30`,
      }}>
        <div className="flex items-start gap-4">
          <div style={{
            width: 64, height: 64, borderRadius: 12,
            backgroundColor: clsColor + '22', border: `2px solid ${clsColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ItemIcon itemId={cls.id} itemType="hero" size={48} fallbackLabel={cls.name.charAt(0)} fallbackColor={clsColor} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ color: clsColor, fontSize: 20, fontWeight: 'bold', margin: 0 }}>{cls.name}</h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{
                padding: '2px 10px', borderRadius: 4, fontSize: 11, fontWeight: 'bold',
                backgroundColor: clsColor + '22', color: clsColor,
              }}>{cls.baseClass.charAt(0).toUpperCase() + cls.baseClass.slice(1)}</span>
              <span style={{
                padding: '2px 10px', borderRadius: 4, fontSize: 11,
                backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)',
              }} dangerouslySetInnerHTML={{ __html: `${combatStyleIcon[cls.primaryCombatStyle] || ''} ${cls.primaryCombatStyle}` }} />
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 12, margin: '8px 0 0', lineHeight: 1.4 }}>
              {cls.description}
            </p>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {/* Base Stats */}
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Base Stats
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {baseStats.map(({ stat, val, label, color }) => {
              const isPrimary = primaryStatKeys.includes(stat as keyof PrimaryStats);
              return (
                <div key={stat} style={{
                  padding: '8px 6px', borderRadius: 6, textAlign: 'center',
                  backgroundColor: isPrimary ? color + '18' : 'var(--color-bg-secondary)',
                  border: isPrimary ? `1px solid ${color}44` : '1px solid transparent',
                }}>
                  <div style={{ color, fontWeight: 'bold', fontSize: 16 }}>{val}</div>
                  <div style={{
                    color: isPrimary ? color : 'var(--color-text-muted)',
                    fontSize: 10, fontWeight: isPrimary ? 'bold' : 'normal',
                  }}>
                    {label}{isPrimary ? ' ★' : ''}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 10, marginTop: 4, fontStyle: 'italic' }}>
            Stat emphasis &mdash; first stat gets +3, second gets +2 at recruitment
          </div>
        </div>

        {/* Relevant Abilities */}
        {abilities.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              Learnable Abilities
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {abilities.map(ab => (
                <div key={ab.id} style={{
                  padding: '8px 10px', borderRadius: 6,
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: `1px solid ${ABILITY_COLOR_HEX[ab.color]}33`,
                }}>
                  <div style={{
                    color: ABILITY_COLOR_HEX[ab.color], fontSize: 11, fontWeight: 'bold',
                    marginBottom: 2,
                  }}>
                    {ab.name}
                    {ab.isPassive && <span style={{ opacity: 0.6, fontWeight: 'normal' }}> (passive)</span>}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 10, lineHeight: 1.3 }}>
                    {ab.effect}
                  </div>
                  {ab.spCost > 0 && (
                    <div style={{ color: '#3498db', fontSize: 10, marginTop: 2 }}>
                      {ab.spCost} SP &middot; {ab.cooldown}t cooldown
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat Descriptions */}
        <div>
          <h4 style={{ color: 'var(--color-text-primary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Primary Stat Scaling
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {primaryStatKeys.map(statKey => {
              const color = STAT_COLORS[statKey] || '#888';
              return (
                <div key={statKey} style={{
                  padding: '6px 10px', borderRadius: 6,
                  backgroundColor: color + '0D', fontSize: 11,
                }}>
                  <span style={{ color, fontWeight: 'bold' }}>{STAT_FULL_NAMES[statKey]}</span>
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: 6 }}>
                    {STAT_DESCRIPTIONS[statKey]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recruit button footer */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {isFree
            ? <span style={{ color: '#27ae60', fontWeight: 'bold' }}>FREE first recruitment!</span>
            : <>Hire for <span style={{ color: canAfford ? 'var(--color-accent)' : '#ef4444', fontWeight: 'bold' }}>{cost} WC</span></>
          }
        </div>
        <button
          onClick={onRecruit}
          disabled={!canAfford || justRecruited}
          style={{
            padding: '10px 32px', borderRadius: 8, fontSize: 14, fontWeight: 'bold',
            cursor: canAfford && !justRecruited ? 'pointer' : 'not-allowed',
            border: 'none', transition: 'all 0.2s',
            backgroundColor: justRecruited ? '#27ae60' : canAfford ? clsColor : '#444',
            color: justRecruited || canAfford ? '#000' : '#888',
            opacity: justRecruited ? 0.9 : 1,
          }}
        >
          {justRecruited ? '✓ Recruited!' : canAfford ? `Recruit ${cls.name}` : 'Not Enough WC'}
        </button>
      </div>
    </div>
  );
}
