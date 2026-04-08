import { useState, useEffect, useRef, useCallback } from 'react';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useHeroStore } from '../../store/useHeroStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { COMBAT_ZONE_LIST, COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../../config/combatZones';
import { CLASSES } from '../../config/classes';
import { ABILITIES } from '../../config/abilities';
import { ABILITY_COLOR_HEX } from '../../config/abilities';
import { getFightDuration, canEnterZone, calculateAbilityContribution, getCombatTriangleMultiplier } from '../../engine/IdleCombatEngine';
import { calculateDerivedStats, getEquippedGear } from '../../engine/HeroEngine';
import { getEncampmentBonuses, getCombatDamageBonus } from '../../engine/EncampmentBonuses';
import { useGameStore } from '../../store/useGameStore';
import { ProgressBar } from '../common/ProgressBar';
import { ItemIcon } from '../../utils/itemIcons';
import type { Hero } from '../../types/hero';
import type { SpawnedEnemy } from '../../store/useCombatZoneStore';

/** Hook for smooth progress bar interpolation between integer ticks */
function useSmoothProgress(intProgress: number, max: number): number {
  const [smooth, setSmooth] = useState(intProgress);
  const lastTickRef = useRef(Date.now());
  const lastIntRef = useRef(intProgress);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (intProgress !== lastIntRef.current) {
      lastTickRef.current = Date.now();
      lastIntRef.current = intProgress;
    }
  }, [intProgress]);

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - lastTickRef.current) / 1000;
      const val = Math.min(max, lastIntRef.current + elapsed);
      setSmooth(val);
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [max]);

  return smooth;
}

/** Floating damage number component with hero initial */
function FloatingDamage({ value, color, id, initial }: { value: number; color: string; id: string; initial?: string }) {
  return (
    <div key={id} className="float-damage" style={{ color, top: '10%', left: '40%' }}>
      {initial && <span style={{ fontSize: 10, opacity: 0.7 }}>{initial} </span>}
      {value > 0 ? `-${Math.round(value)}` : `+${Math.round(-value)}`}
    </div>
  );
}

/** Format seconds as Xm Ys */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

/** ─── Battle Scene Sub-component (IdleOn-style card layout) ─── */
function BattleScene({ dep, partyHeroes, zone, target, fastestDuration, heroEquipment, inventory }: {
  dep: any; partyHeroes: Hero[]; zone: any; target: any; fastestDuration: number;
  heroEquipment: any; inventory: any;
}) {
  const smoothProgress = useSmoothProgress(dep.fightProgress, fastestDuration);
  const resources = useGameStore(s => s.resources);
  const prevEnemyHpRef = useRef<number[]>([]);
  const [floatingDmgs, setFloatingDmgs] = useState<{ id: string; value: number; color: string; initial?: string }[]>([]);

  // Sort heroes by turn speed (fastest attacks first, displayed on left)
  const HERO_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'] as const;
  const activeHeroesUnsorted = partyHeroes.filter(h => !(dep.recoveryCooldowns[h.id] > 0)).slice(0, 5);
  const activeHeroes = [...activeHeroesUnsorted].sort((a, b) => {
    const gearA = getEquippedGear(a.id, heroEquipment, inventory);
    const gearB = getEquippedGear(b.id, heroEquipment, inventory);
    const dA = calculateDerivedStats(a, gearA);
    const dB = calculateDerivedStats(b, gearB);
    return dB.turnSpeed - dA.turnSpeed; // highest speed first (left)
  });
  const encampmentBonuses = getEncampmentBonuses();
  const encampmentDamageMult = 1 + getCombatDamageBonus() / 100;
  const encampmentDefenseMult = 1 + (encampmentBonuses.combat_defense || 0) / 100;
  const encampmentHpMult = 1 + (encampmentBonuses.combat_hp || 0) / 100;
  const progress = dep.fightProgress / Math.max(1, fastestDuration);

  const enemies: SpawnedEnemy[] = dep.currentEnemies || [];
  const totalEnemyDmg = enemies.reduce((s: number, e: SpawnedEnemy) => s + (e.currentHp > 0 ? e.damage : 0), 0);
  const firstAliveIdx = enemies.findIndex((e: SpawnedEnemy) => e.currentHp > 0);

  // Determine which hero attacked this tick (for damage color)
  const gt = dep.globalTick || 0;
  const attackingHeroIdx = (() => {
    for (let hi = 0; hi < activeHeroes.length; hi++) {
      const hero = activeHeroes[hi];
      const gear = getEquippedGear(hero.id, heroEquipment, inventory);
      const d = calculateDerivedStats(hero, gear);
      const interval = Math.max(1, Math.round(100 / Math.max(1, d.turnSpeed) * 3));
      if ((gt + hi) % interval === 0) return hi;
    }
    return 0;
  })();

  // Floating damage tracking with per-hero colors
  useEffect(() => {
    const currentHps = enemies.map((e: SpawnedEnemy) => e.currentHp);
    const prev = prevEnemyHpRef.current;
    if (prev.length === currentHps.length) {
      const newDmgs: { id: string; value: number; color: string; initial: string }[] = [];
      for (let i = 0; i < currentHps.length; i++) {
        const delta = prev[i] - currentHps[i];
        if (delta > 1) {
          const heroColor = HERO_COLORS[attackingHeroIdx] || HERO_COLORS[0];
          const heroInitial = activeHeroes[attackingHeroIdx]?.name?.charAt(0) || '?';
          newDmgs.push({ id: `${gt}-${i}-${Date.now()}`, value: delta, color: heroColor, initial: heroInitial });
        }
      }
      if (newDmgs.length > 0) {
        setFloatingDmgs(d => [...d.slice(-8), ...newDmgs]);
        setTimeout(() => setFloatingDmgs(d => d.filter(dd => !newDmgs.some(n => n.id === dd.id))), 900);
      }
    }
    prevEnemyHpRef.current = currentHps;
  }, [enemies.map((e: SpawnedEnemy) => Math.round(e.currentHp)).join(',')]);

  // Compute per-hero stats
  const heroStats = activeHeroes.map(hero => {
    const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
    const derived = calculateDerivedStats(hero, equippedGear);
    const cls = CLASSES[hero.classId];
    const heroAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);
    const triangleMult = getCombatTriangleMultiplier(cls?.primaryCombatStyle as any, (target?.enemy as any)?.combatStyle);
    const hitRate = Math.min(1, derived.accuracy / 100);
    const critMult = 1 + (derived.critChance / 100) * (derived.critDamage / 100 - 1);
    const effectiveEnemyDefense = 0.10 * Math.max(0, 1 - derived.armorPen / 100);
    let heroDps = heroAttack * hitRate * critMult * (1 - effectiveEnemyDefense) * triangleMult * encampmentDamageMult;
    heroDps += heroAttack * (derived.burnDot / 100 + derived.poisonDot / 100 + derived.radiationDot / 100 + derived.bleedDot / 100);
    const abilityContrib = calculateAbilityContribution(hero, derived, fastestDuration);
    heroDps += abilityContrib.bonusDps;
    // Show actual HP/SP — heroes are either alive (fighting) or recovering (not shown here)
    // Don't estimate damage taken during fight; simulateFight resolves at tick end
    const effectiveMaxHp = Math.round(derived.maxHp * encampmentHpMult);
    const currentHp = effectiveMaxHp; // alive = full HP (fight hasn't resolved yet)
    const hpPct = 100;
    const currentSp = derived.maxSp;
    const spPct = 100;
    // Match the store's per-hero attack timing using globalTick
    const heroIdx = activeHeroes.indexOf(hero);
    const attackInterval = Math.max(1, Math.round(100 / Math.max(1, derived.turnSpeed) * 3));
    const justAttacked = gt > 0 && (gt + heroIdx) % attackInterval === 0;
    return { hero, derived, heroDps: Math.round(heroDps), effectiveMaxHp, currentHp, hpPct, currentSp, spPct, justAttacked, heroIndex: heroIdx };
  });

  const totalPartyDps = heroStats.reduce((s, h) => s + h.heroDps, 0);

  // Abilities with cooldowns
  const allAbilities = activeHeroes.flatMap(hero =>
    (hero.equippedAbilities || []).filter((a): a is string => a != null).map(aId => {
      const ability = ABILITIES[aId];
      return ability ? { hero, ability } : null;
    }).filter(Boolean)
  ) as { hero: Hero; ability: typeof ABILITIES[string] }[];

  return (
    <div className="rounded-lg overflow-hidden" style={{
      backgroundImage: `url(/assets/battle-backgrounds/${dep.zoneId}.png)`,
      backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 0 }} />

      {/* ── Battle Header ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '8px 16px 0' }}>
        <div className="flex items-center justify-between">
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {target?.isSweep ? `Battle ${dep.fightCount + 1}/50` : 'Fighting'}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {enemies.length > 1 && `${enemies.filter((e: SpawnedEnemy) => e.currentHp <= 0).length}/${enemies.length} slain`}
          </div>
        </div>
      </div>

      {/* ── Battle Scene (3-column grid: heroes | center | enemies) ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', minHeight: 200 }}>

        {/* LEFT: Hero Cards */}
        <div className="flex gap-2 justify-start">
          {heroStats.map(({ hero, derived, heroDps, effectiveMaxHp, currentHp, hpPct, currentSp, spPct, justAttacked, heroIndex }) => {
            const heroColor = HERO_COLORS[heroIndex] || HERO_COLORS[0];
            return (
            <div key={hero.id} className="combat-card" style={{
              width: 110, animation: justAttacked ? 'combat-pulse 0.3s ease' : 'none',
              borderColor: justAttacked ? heroColor : undefined,
            }}>
              <div className="text-[11px] font-bold truncate" style={{ color: heroColor }}>{hero.name}</div>
              <div className="my-1"><ItemIcon itemId={hero.classId} itemType="hero" size={52} fallbackLabel={hero.name.charAt(0)} /></div>
              {/* HP */}
              <div style={{ width: '100%', height: 7, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3 }}>
                <div style={{ width: `${hpPct}%`, height: '100%', backgroundColor: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
              <div className="text-[10px] font-bold" style={{ color: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444' }}>{currentHp}/{effectiveMaxHp}</div>
              {/* SP */}
              <div style={{ width: '100%', height: 5, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, marginTop: 2 }}>
                <div style={{ width: `${spPct}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
              <div className="text-[10px]" style={{ color: '#3b82f6' }}>{currentSp}/{derived.maxSp}</div>
              {/* Action + DPS */}
              <div className="text-[9px] mt-2 py-0.5 rounded" style={{ backgroundColor: justAttacked ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', color: justAttacked ? '#f59e0b' : 'var(--color-text-muted)', border: justAttacked ? '1px solid rgba(245,158,11,0.4)' : '1px solid transparent' }}>
                {justAttacked ? 'Attack!' : 'Auto Attack'}
              </div>
              <div className="text-[11px] font-bold mt-1" style={{ color: heroColor }}>DPS: {heroDps}</div>
            </div>
          );})}
        </div>

        {/* CENTER: Battle Info */}
        <div className="flex flex-col items-center justify-center gap-1" style={{ minWidth: 80 }}>
          <div className="text-3xl combat-swords-icon">&#9876;</div>
          <div className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>{totalPartyDps}</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Total DPS</div>
          {dep.waveMultiplier > 1 && (
            <div className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: 'var(--color-energy)' }}>
              Wave +{Math.round((dep.waveMultiplier - 1) * 100)}%
            </div>
          )}
        </div>

        {/* RIGHT: Enemy Cards */}
        <div className="flex gap-2 justify-end" style={{ position: 'relative' }}>
          {/* Floating damage */}
          {floatingDmgs.map(d => <FloatingDamage key={d.id} id={d.id} value={d.value} color={d.color} initial={d.initial} />)}

          {enemies.map((enemy, idx) => {
            const isDead = enemy.currentHp <= 0;
            const isTarget = idx === firstAliveIdx;
            const eHpPct = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100)) : 0;
            return (
              <div key={idx} className={`combat-card ${isTarget ? 'combat-card--targeted' : ''} ${isDead ? 'combat-card--dead' : ''}`}
                style={{ width: 100 }}>
                <div className="text-[11px] font-bold truncate" style={{ color: isDead ? 'var(--color-text-muted)' : 'var(--color-danger)' }}>
                  {enemy.name}
                </div>
                <div className="my-1"><ItemIcon itemId={enemy.enemyId} itemType="monster" size={52} fallbackLabel="?" fallbackColor="#e74c3c" /></div>
                {/* HP */}
                <div style={{ width: '100%', height: 7, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3 }}>
                  <div style={{ width: `${eHpPct}%`, height: '100%', backgroundColor: eHpPct > 50 ? '#ef4444' : eHpPct > 25 ? '#f59e0b' : '#22c55e', borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                <div className="text-[10px] font-bold" style={{ color: isDead ? 'var(--color-text-muted)' : '#ef4444' }}>
                  {isDead ? 'DEAD' : `${Math.round(enemy.currentHp)}/${enemy.maxHp}`}
                </div>
                {/* Action + ATK */}
                <div className="text-[9px] mt-2 py-0.5 rounded" style={{ backgroundColor: isDead ? 'transparent' : 'rgba(239,68,68,0.1)', color: isDead ? 'var(--color-text-muted)' : 'var(--color-danger)', border: isDead ? 'none' : '1px solid rgba(239,68,68,0.2)' }}>
                  {isDead ? 'Defeated' : 'Auto Attack'}
                </div>
                <div className="text-[10px] font-bold mt-1" style={{ color: isDead ? 'var(--color-text-muted)' : '#ef4444' }}>{enemy.damage} ATK</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Abilities & Consumables Bar (BOTTOM) ── */}
      {(allAbilities.length > 0 || activeHeroes.some(h => h.equippedConsumables?.some(c => c))) && (
        <div style={{ position: 'relative', zIndex: 1, padding: '0 16px 12px' }}>
          <div className="flex gap-4 overflow-x-auto">
            {/* Abilities grouped by hero */}
            {activeHeroes.map(hero => {
              const heroAbilities = (hero.equippedAbilities || [])
                .filter((a): a is string => a != null)
                .map(aId => ABILITIES[aId])
                .filter(Boolean);
              const heroConsumables = (hero.equippedConsumables || [])
                .filter((c): c is string => c != null);
              if (heroAbilities.length === 0 && heroConsumables.length === 0) return null;
              return (
                <div key={hero.id} className="flex items-center gap-1">
                  <span className="text-[9px] font-bold mr-0.5" style={{ color: HERO_COLORS[activeHeroes.indexOf(hero)] || 'var(--color-text-muted)' }}>{hero.name.split(' ')[0]}:</span>
                  {heroAbilities.map(ability => {
                    const cd = ability.cooldown;
                    const gt = dep.globalTick || 0;
                    const isPassive = cd <= 0 || ability.isPassive;
                    const cdRemaining = !isPassive && gt > 0 ? cd - (gt % cd) : 0;
                    const isReady = isPassive || gt === 0 || gt % cd === 0;
                    const abilityColor = ABILITY_COLOR_HEX[ability.color];
                    return (
                      <div key={ability.id}
                        className={`ability-slot ${isReady ? 'ability-slot--ready' : ''}`}
                        title={`${ability.name} — ${ability.effect}\nCD: ${cd}s · SP: ${ability.spCost}`}
                        style={{ padding: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderColor: isReady ? abilityColor : 'transparent' }}>
                        <ItemIcon itemId={ability.id} itemType="ability" size={24} fallbackColor={abilityColor} />
                        {isPassive && (
                          <div className="ability-cooldown-overlay" style={{ fontSize: 8, backgroundColor: 'rgba(0,0,0,0.4)' }}>P</div>
                        )}
                        {!isPassive && !isReady && cdRemaining > 0 && (
                          <div className="ability-cooldown-overlay">{cdRemaining}</div>
                        )}
                      </div>
                    );
                  })}
                  {heroConsumables.map((cId, i) => {
                    const qty = resources[cId] || 0;
                    return (
                      <div key={`c-${i}`} className="ability-slot" style={{ padding: 2, backgroundColor: 'rgba(0,0,0,0.4)', borderColor: qty > 0 ? 'rgba(100,200,100,0.3)' : 'rgba(200,50,50,0.3)' }}
                        title={`${cId.replace(/_/g, ' ')} (${qty} left)`}>
                        <ItemIcon itemId={cId} itemType="consumable" size={20} fallbackColor="#27ae60" />
                        <span className="absolute text-[8px] font-bold rounded-sm px-0.5" style={{
                          top: -2, right: -2, lineHeight: 1,
                          backgroundColor: qty > 0 ? 'rgba(39,174,96,0.9)' : 'rgba(200,50,50,0.9)',
                          color: '#fff', minWidth: 12, textAlign: 'center',
                        }}>{qty}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface CombatZonePanelProps {
  /** Pre-select a zone when navigating from the sidebar */
  initialZoneId?: string | null;
}

export function CombatZonePanel({ initialZoneId }: CombatZonePanelProps) {
  const deployments = useCombatZoneStore(s => s.deployments);
  const tierUnlocks = useCombatZoneStore(s => s.tierUnlocks);
  const deployParty = useCombatZoneStore(s => s.deployParty);
  const recallParty = useCombatZoneStore(s => s.recallParty);
  const recallHero = useCombatZoneStore(s => s.recallHero);
  const heroRecoveryCooldowns = useCombatZoneStore(s => s.heroRecoveryCooldowns);
  const heroes = useHeroStore(s => s.heroes);
  const inventory = useEquipmentStore(s => s.inventory);
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const [selectedZone, setSelectedZone] = useState<string>(initialZoneId || '');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState(1);

  // Sync when sidebar zone selection changes
  useEffect(() => {
    if (initialZoneId) {
      setSelectedZone(initialZoneId);
      setSelectedTarget('');
      setSelectedTier(1);
    }
  }, [initialZoneId]);

  const zone = selectedZone ? COMBAT_ZONES[selectedZone] : null;
  const maxTier = zone ? (tierUnlocks[zone.id] || 1) : 1;
  const deployedHeroIds = new Set(deployments.flatMap(d => d.heroIds));
  const availableHeroes = heroes.filter(h => !deployedHeroIds.has(h.id));

  const toggleHero = (heroId: string) => {
    setSelectedHeroIds(prev =>
      prev.includes(heroId) ? prev.filter(id => id !== heroId) : [...prev, heroId]
    );
  };

  const selectAll = () => {
    setSelectedHeroIds(availableHeroes.map(h => h.id));
  };

  const selectNone = () => {
    setSelectedHeroIds([]);
  };

  const handleDeploy = () => {
    if (!selectedZone || !selectedTarget || selectedHeroIds.length === 0) return;
    deployParty(selectedHeroIds, selectedZone, selectedTarget, selectedTier);
    setSelectedHeroIds([]);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Combat Zones</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Deploy hero parties to idle-farm combat zones. Enemies grow stronger every 10 kills. Bosses appear every 50 kills on Full Sweep.
      </p>

      {/* Deploy Form */}
      <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-3">Deploy Party to Zone</h3>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Zone</label>
            <select value={selectedZone} onChange={e => { setSelectedZone(e.target.value); setSelectedTarget(''); setSelectedTier(1); }}
              className="w-full p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              <option value="">-- Select --</option>
              {COMBAT_ZONE_LIST.map(z => (
                <option key={z.id} value={z.id}>{z.name} (Lv.{z.minLevel}+)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Target</label>
            <select value={selectedTarget} onChange={e => setSelectedTarget(e.target.value)} disabled={!zone}
              className="w-full p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              <option value="">-- Select --</option>
              {zone?.targets.map(t => (
                <option key={t.id} value={t.id}>{t.isSweep ? '>> ' : ''}{t.name} ({t.enemy.name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Tier (max: {maxTier})</label>
            <select value={selectedTier} onChange={e => setSelectedTier(parseInt(e.target.value))} disabled={!zone}
              className="w-full p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              {Array.from({ length: maxTier }, (_, i) => i + 1).map(t => (
                <option key={t} value={t}>{ZONE_TIER_MULTIPLIERS[t-1]?.name || `T${t}`} (x{ZONE_TIER_MULTIPLIERS[t-1]?.xpMult} XP)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hero Selection - Multi-select checkboxes */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Select Heroes ({selectedHeroIds.length}/{availableHeroes.length} available)
            </label>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs px-2 py-0.5 rounded cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                All
              </button>
              <button onClick={selectNone} className="text-xs px-2 py-0.5 rounded cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                None
              </button>
            </div>
          </div>
          {availableHeroes.length === 0 ? (
            <div className="p-2 rounded text-xs text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
              No heroes available — all deployed or none recruited.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {availableHeroes.map(h => {
                const cls = CLASSES[h.classId];
                const isSelected = selectedHeroIds.includes(h.id);
                const recoverySecs = heroRecoveryCooldowns[h.id] || 0;
                const isRecovering = recoverySecs > 0;
                return (
                  <button key={h.id} onClick={() => !isRecovering && toggleHero(h.id)}
                    className="flex items-center gap-2 p-2 rounded text-xs text-left"
                    style={{
                      backgroundColor: isRecovering ? 'rgba(239,68,68,0.1)' : isSelected ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                      color: isRecovering ? 'var(--color-danger)' : isSelected ? '#000' : 'var(--color-text-primary)',
                      border: `1px solid ${isRecovering ? 'var(--color-danger)' : isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      cursor: isRecovering ? 'not-allowed' : 'pointer',
                      opacity: isRecovering ? 0.6 : 1,
                    }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? '#000' : 'transparent',
                      border: isSelected ? 'none' : '1px solid var(--color-text-muted)',
                      color: isSelected ? 'var(--color-accent)' : 'transparent', fontSize: 11,
                    }}>
                      {isSelected ? '✓' : ''}
                    </span>
                    <span className="font-bold">{h.name}</span>
                    <span style={{ color: isRecovering ? 'var(--color-danger)' : isSelected ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)' }}>
                      {isRecovering
                        ? `Recovering (${Math.floor(recoverySecs / 60)}m ${recoverySecs % 60}s)`
                        : `Lv.${h.level} ${cls?.name}`
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {zone && selectedTarget && (
          <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {zone.description} | Drops T{zone.baseGearTier} gear from bosses [Salvaged]
          </div>
        )}
        <button onClick={handleDeploy} disabled={!selectedZone || !selectedTarget || selectedHeroIds.length === 0}
          className="w-full p-2 rounded text-sm font-bold cursor-pointer"
          style={{
            backgroundColor: selectedZone && selectedTarget && selectedHeroIds.length > 0 ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            color: selectedZone && selectedTarget && selectedHeroIds.length > 0 ? '#000' : 'var(--color-text-muted)',
            border: 'none',
          }}>
          Deploy {selectedHeroIds.length > 0 ? `${selectedHeroIds.length} Hero${selectedHeroIds.length > 1 ? 'es' : ''}` : 'Party'} to Combat
        </button>
      </div>

      {/* Active Deployments */}
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Active Parties ({deployments.length})
      </h3>
      {deployments.length === 0 ? (
        <div className="p-6 rounded text-center text-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
          No parties in combat. Deploy a party above.
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map(dep => {
            const zone = COMBAT_ZONES[dep.zoneId];
            const target = zone?.targets.find(t => t.id === dep.targetId);
            const partyHeroes = dep.heroIds.map(id => heroes.find(h => h.id === id)).filter(Boolean) as typeof heroes;
            const fastestDuration = partyHeroes.length > 0 && zone
              ? Math.min(...partyHeroes.map(h => getFightDuration(h.level, zone.minLevel)))
              : 8;
            const tierInfo = ZONE_TIER_MULTIPLIERS[dep.zoneTier - 1];
            const allRecovering = partyHeroes.length > 0 && partyHeroes.every(h => (dep.recoveryCooldowns[h.id] || 0) > 0);

            return (
              <div key={dep.partyId} className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${allRecovering ? 'var(--color-danger)' : 'var(--color-border)'}` }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {zone?.name}: {target?.name} <span style={{ color: 'var(--color-text-muted)' }}>| {tierInfo?.name} (T{dep.zoneTier})</span>
                    </span>
                  </div>
                  <button onClick={() => recallParty(dep.partyId)}
                    className="px-3 py-1 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Recall All</button>
                </div>

                {/* Party Members */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {partyHeroes.map(hero => {
                    const cls = CLASSES[hero.classId];
                    const isRecovering = (dep.recoveryCooldowns[hero.id] || 0) > 0;
                    const cooldown = dep.recoveryCooldowns[hero.id] || 0;
                    return (
                      <div key={hero.id} className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: isRecovering ? 'rgba(255,50,50,0.15)' : 'var(--color-bg-tertiary)',
                          border: `1px solid ${isRecovering ? 'var(--color-danger)' : 'var(--color-border)'}`,
                        }}>
                        <span className="font-bold" style={{ color: isRecovering ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                          {hero.name}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>Lv.{hero.level} {cls?.name}</span>
                        {(() => {
                          const equipped = hero.equippedAbilities?.filter(a => a != null).length || 0;
                          const totalSlots = hero.equippedAbilities?.length || 4;
                          return equipped > 0 ? (
                            <span style={{ color: 'var(--color-accent)', fontSize: 11, fontWeight: 'bold' }} title={`${equipped}/${totalSlots} abilities equipped`}>
                              {equipped}/{totalSlots} AB
                            </span>
                          ) : null;
                        })()}
                        {isRecovering && (
                          <span style={{ color: 'var(--color-danger)' }}> ({Math.floor(cooldown / 60)}m {cooldown % 60}s)</span>
                        )}
                        <button onClick={() => recallHero(dep.partyId, hero.id)}
                          className="ml-1 cursor-pointer" style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontSize: 11 }}
                          title="Recall this hero">✕</button>
                      </div>
                    );
                  })}
                </div>

                {/* Combat Visualization */}
                {allRecovering ? (
                  <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-danger)' }}>All heroes recovering...</div>
                    <ProgressBar value={1} max={1} color="var(--color-danger)" height="6px" />
                  </div>
                ) : (
                  <BattleScene dep={dep} partyHeroes={partyHeroes} zone={zone!} target={target!} fastestDuration={fastestDuration} heroEquipment={heroEquipment} inventory={inventory} />
                )}

                {/* Combat Stats Footer */}
                <div className="flex gap-4 text-xs mt-2 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Kills: <b style={{ color: 'var(--color-success)' }}>{dep.totalKills}</b></span>
                  <span>Bosses: <b style={{ color: 'var(--color-accent)' }}>{dep.bossKills}</b></span>
                  <span>Party: <b>{partyHeroes.length}</b> heroes</span>
                  <span>XP: <b style={{ color: 'var(--color-energy)' }}>{(dep.totalXpEarned || 0).toLocaleString()}</b></span>
                  <span>Deaths: <b style={{ color: 'var(--color-danger)' }}>{dep.deathCount || 0}</b></span>
                  {dep.deployedAt && (() => {
                    const elapsed = Math.floor((Date.now() - dep.deployedAt) / 1000);
                    const killsPerHour = elapsed > 0 ? Math.round(dep.totalKills / (elapsed / 3600)) : 0;
                    return <>
                      <span>Duration: <b>{formatDuration(elapsed)}</b></span>
                      <span>Kills/hr: <b>{killsPerHour}</b></span>
                    </>;
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
