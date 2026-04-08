/**
 * BattleView — Full self-contained battle card.
 *
 * v3 polish: Stats integrated into header bar, floating damage anchored per-enemy,
 * DeploymentStats footer removed (kills/XP in header), center column refined.
 */

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { CLASSES } from '../../config/classes';
import { ABILITIES, ABILITY_COLOR_HEX } from '../../config/abilities';
import { CONSUMABLES } from '../../config/consumables';
import { calculateAbilityContribution, getCombatTriangleMultiplier } from '../../engine/IdleCombatEngine';
import { calculateDerivedStats, getEquippedGear } from '../../engine/HeroEngine';
import { getEncampmentBonuses, getCombatDamageBonus } from '../../engine/EncampmentBonuses';
import { HeroBattleCard, HERO_COLORS } from './HeroBattleCard';
import { EnemyBattleCard } from './EnemyBattleCard';
import { ItemIcon } from '../../utils/itemIcons';
import type { HeroBattleStats } from './HeroBattleCard';
import type { Hero } from '../../types/hero';
import type { SpawnedEnemy } from '../../store/useCombatZoneStore';
import type { CombatStyle } from '../../config/combatZones';

interface BattleViewProps {
  dep: {
    zoneId: string;
    targetId: string;
    zoneTier: number;
    fightProgress: number;
    fightCount: number;
    waveMultiplier: number;
    currentEnemies?: SpawnedEnemy[];
    globalTick: number;
    recoveryCooldowns: Record<string, number>;
    heroIds: string[];
    heroHpMap?: Record<string, number>;
    heroSpMap?: Record<string, number>;
  };
  partyHeroes: Hero[];
  zone: { minLevel: number; targets: { id: string; isSweep: boolean; enemy: any }[] };
  fastestDuration: number;
  zoneName: string;
  targetName: string;
  tierName: string;
  zoneTier: number;
  onRecallParty: () => void;
  onRecallHero: (heroId: string) => void;
  totalKills: number;
  bossKills: number;
  totalXpEarned: number;
  deathCount: number;
  deployedAt: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function BattleView({
  dep, partyHeroes, zone, fastestDuration,
  zoneName, targetName, tierName, zoneTier,
  onRecallParty, onRecallHero,
  totalKills, bossKills, totalXpEarned, deathCount, deployedAt,
}: BattleViewProps) {
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const resources = useGameStore(s => s.resources);
  const prevEnemyHpRef = useRef<number[]>([]);
  const [floatingDmgs, setFloatingDmgs] = useState<{ id: string; value: number; color: string; initial: string; enemyIdx: number }[]>([]);

  const gt = dep.globalTick || 0;
  const enemies: SpawnedEnemy[] = dep.currentEnemies || [];
  const firstAliveIdx = enemies.findIndex(e => e.currentHp > 0);
  const target = zone.targets.find(t => t.id === dep.targetId);

  // Sort heroes by turn speed
  const activeHeroesUnsorted = partyHeroes.filter(h => !(dep.recoveryCooldowns[h.id] > 0));
  const activeHeroes = [...activeHeroesUnsorted].sort((a, b) => {
    const gearA = getEquippedGear(a.id, heroEquipment, inventory);
    const gearB = getEquippedGear(b.id, heroEquipment, inventory);
    return calculateDerivedStats(b, gearB).turnSpeed - calculateDerivedStats(a, gearA).turnSpeed;
  });

  const encampmentDamageMult = 1 + getCombatDamageBonus() / 100;
  const encampmentHpMult = 1 + (getEncampmentBonuses().combat_hp || 0) / 100;
  const progressRatio = fastestDuration > 0 ? Math.min(1, dep.fightProgress / fastestDuration) : 0;
  const elapsed = Math.floor((Date.now() - deployedAt) / 1000);

  // Determine which hero attacked this tick (ATB gauge-based)
  const attackingHeroIdx = (() => {
    for (let hi = 0; hi < activeHeroes.length; hi++) {
      if (dep.heroLastAttackTick?.[activeHeroes[hi].id] === gt) return hi;
    }
    return -1;
  })();

  // Floating damage tracking — per enemy
  useEffect(() => {
    const currentHps = enemies.map(e => e.currentHp);
    const prev = prevEnemyHpRef.current;
    if (prev.length === currentHps.length) {
      const newDmgs: typeof floatingDmgs = [];
      for (let i = 0; i < currentHps.length; i++) {
        const delta = prev[i] - currentHps[i];
        if (delta > 1) {
          const heroIdx = attackingHeroIdx >= 0 ? attackingHeroIdx : 0;
          const heroColor = HERO_COLORS[heroIdx] || HERO_COLORS[0];
          const heroInitial = activeHeroes[heroIdx]?.name?.charAt(0) || '?';
          newDmgs.push({ id: `${gt}-${i}-${Date.now()}`, value: delta, color: heroColor, initial: heroInitial, enemyIdx: i });
        }
      }
      if (newDmgs.length > 0) {
        setFloatingDmgs(d => [...d.slice(-8), ...newDmgs]);
        setTimeout(() => setFloatingDmgs(d => d.filter(dd => !newDmgs.some(n => n.id === dd.id))), 1000);
      }
    }
    prevEnemyHpRef.current = currentHps;
  }, [enemies.map(e => Math.round(e.currentHp)).join(',')]);

  // Compute per-hero battle stats
  const heroStats: HeroBattleStats[] = activeHeroes.map((hero, heroIndex) => {
    const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
    const derived = calculateDerivedStats(hero, equippedGear);
    const cls = CLASSES[hero.classId];
    const heroAttack = Math.max(derived.meleeAttack, derived.rangedAttack, derived.blastAttack);
    const triangleMult = getCombatTriangleMultiplier(cls?.primaryCombatStyle as CombatStyle, target?.enemy?.combatStyle);
    const hitRate = Math.min(1, derived.accuracy / 100);
    const critMult = 1 + (derived.critChance / 100) * (derived.critDamage / 100 - 1);
    const effectiveEnemyDefense = 0.10 * Math.max(0, 1 - derived.armorPen / 100);
    let heroDps = heroAttack * hitRate * critMult * (1 - effectiveEnemyDefense) * triangleMult * encampmentDamageMult;
    heroDps += heroAttack * (derived.burnDot / 100 + derived.poisonDot / 100 + derived.radiationDot / 100 + derived.bleedDot / 100);
    const abilityContrib = calculateAbilityContribution(hero, derived, fastestDuration);
    heroDps += abilityContrib.bonusDps;

    const effectiveMaxHp = Math.round(derived.maxHp * encampmentHpMult);
    const currentHp = dep.heroHpMap?.[hero.id] ?? effectiveMaxHp;
    const currentSp = dep.heroSpMap?.[hero.id] ?? derived.maxSp;
    const justAttacked = dep.heroLastAttackTick?.[hero.id] === gt;
    const gaugeProgress = Math.min(99, dep.heroGaugeMap?.[hero.id] ?? 0);

    return {
      hero, derived, dps: Math.round(heroDps),
      maxHp: effectiveMaxHp, currentHp,
      maxSp: derived.maxSp, currentSp: Math.min(derived.maxSp, currentSp),
      justAttacked, colorIndex: heroIndex, gaugeProgress,
      isRecovering: false, recoverySecs: 0,
    };
  });

  const recoveringHeroes: HeroBattleStats[] = partyHeroes
    .filter(h => (dep.recoveryCooldowns[h.id] || 0) > 0)
    .map(hero => {
      const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
      const derived = calculateDerivedStats(hero, equippedGear);
      return {
        hero, derived, dps: 0, maxHp: 0, currentHp: 0, maxSp: 0, currentSp: 0,
        justAttacked: false, colorIndex: 0, gaugeProgress: 0,
        isRecovering: true, recoverySecs: dep.recoveryCooldowns[hero.id] || 0,
      };
    });

  const totalPartyDps = heroStats.reduce((s, h) => s + h.dps, 0);

  return (
    <div className="rounded-lg overflow-hidden" style={{
      backgroundImage: `url(/assets/battle-backgrounds/${dep.zoneId}.png)`,
      backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', zIndex: 0 }} />

      {/* Header: zone info | stats | recall */}
      <div className="flex items-center justify-between px-4 py-1.5" style={{
        position: 'relative', zIndex: 1,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(90deg, rgba(0,0,0,0.15) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)',
      }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold shrink-0" style={{ color: 'var(--color-text-primary)' }}>{zoneName}</span>
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>{"\u2022"}</span>
          <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {targetName}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>{"\u2022"}</span>
          <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {tierName}
          </span>
          {target?.isSweep && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>{"\u2022"}</span>
              <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                {dep.fightCount + 1}/50
              </span>
            </>
          )}
          {dep.waveMultiplier > 1 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: 'var(--color-energy)' }}>
              +{Math.round((dep.waveMultiplier - 1) * 100)}%
            </span>
          )}
        </div>

        {/* Compact stats — dot-separated */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-data font-bold" style={{ color: 'var(--color-success)' }}>{totalKills}</span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>{"\u2022"}</span>
          {bossKills > 0 && (
            <>
              <span className="text-[10px] font-data" style={{ color: 'var(--color-accent)' }}>{bossKills}B</span>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>{"\u2022"}</span>
            </>
          )}
          <span className="text-[10px] font-data" style={{ color: 'var(--color-energy)' }}>
            {totalXpEarned >= 1000 ? `${(totalXpEarned / 1000).toFixed(1)}k` : totalXpEarned} XP
          </span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>{"\u2022"}</span>
          <span className="text-[10px] font-data" style={{ color: 'var(--color-text-muted)' }}>{formatDuration(elapsed)}</span>
          {deathCount > 0 && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>{"\u2022"}</span>
              <span className="text-[10px] font-data" style={{ color: 'var(--color-danger)' }}>{deathCount}D</span>
            </>
          )}
          <button
            onClick={onRecallParty}
            className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(239,68,68,0.8)', color: '#fff', border: 'none' }}
          >
            Recall
          </button>
        </div>
      </div>

      {/* Battle scene — 3 column */}
      <div style={{
        position: 'relative', zIndex: 1, padding: '14px 16px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', minHeight: 260,
      }}>
        {/* LEFT: Heroes */}
        <div className="flex gap-2 justify-start flex-wrap">
          {heroStats.map(s => (
            <HeroBattleCard key={s.hero.id} stats={s} onRecall={() => onRecallHero(s.hero.id)} />
          ))}
          {recoveringHeroes.map(s => (
            <HeroBattleCard key={s.hero.id} stats={s} />
          ))}
        </div>

        {/* CENTER: Battle info */}
        <div className="flex flex-col items-center justify-center" style={{ minWidth: 90 }}>
          {/* Swords icon */}
          <div className="text-3xl combat-swords-icon" style={{ marginBottom: 4 }}>{"\u2694\uFE0F"}</div>

          {/* DPS readout */}
          <div className="text-xl font-bold font-data" style={{ color: '#fff', lineHeight: 1, textShadow: '0 0 12px rgba(212,168,67,0.2)' }}>{totalPartyDps}</div>
          <div className="text-[8px] uppercase tracking-[0.15em] mt-0.5" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>DPS</div>

          {/* Fight progress */}
          <div className="w-full mt-2.5 mb-1" style={{ maxWidth: 90 }}>
            <div style={{ height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, transition: 'width 0.3s ease',
                width: `${progressRatio * 100}%`,
                background: 'linear-gradient(90deg, var(--color-accent) 0%, rgba(212,168,67,0.7) 100%)',
                boxShadow: progressRatio > 0.1 ? '0 0 6px rgba(212,168,67,0.3)' : 'none',
              }} />
            </div>
          </div>

          {enemies.length > 1 && (
            <div className="text-[9px] font-data" style={{ color: 'var(--color-text-muted)' }}>
              {enemies.filter(e => e.currentHp <= 0).length}/{enemies.length} slain
            </div>
          )}
        </div>

        {/* RIGHT: Enemies + floating damage */}
        <div className="flex gap-2 justify-end flex-wrap" style={{ position: 'relative' }}>
          {enemies.map((enemy, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Floating damage anchored to this enemy */}
              {floatingDmgs
                .filter(d => d.enemyIdx === idx)
                .map((d, di) => (
                  <div
                    key={d.id}
                    className="float-damage"
                    style={{
                      color: d.color,
                      top: -8 - (di * 16),
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <span style={{ fontSize: 9, opacity: 0.7 }}>{d.initial} </span>
                    -{Math.round(d.value)}
                  </div>
                ))}
              <EnemyBattleCard enemy={enemy} isTarget={idx === firstAliveIdx} index={idx} gaugeProgress={Math.min(99, dep.enemyGaugeMap?.[idx] ?? 0)} />
            </div>
          ))}
        </div>
      </div>

      {/* Loadout bar — abilities & consumables per hero */}
      <div className="ability-bar" style={{ position: 'relative', zIndex: 1, padding: '6px 16px 8px' }}>
        <div className="flex gap-2 overflow-x-auto">
          {heroStats.map((hs) => {
            const { hero, derived, colorIndex } = hs;
            const hColor = HERO_COLORS[colorIndex] || HERO_COLORS[0];
            const abilitySlots = derived.abilitySlots;
            const consumableSlots = derived.consumableSlots;
            const allAbilitySlots = Array.from({ length: 4 }, (_, i) => {
              const aId = (hero.equippedAbilities || [])[i] || null;
              const ability = aId ? ABILITIES[aId] : null;
              const unlocked = i < abilitySlots;
              return { index: i, aId, ability, unlocked };
            });
            const allConsumableSlots = Array.from({ length: consumableSlots }, (_, i) => {
              const cId = (hero.equippedConsumables || [])[i] || null;
              return { index: i, cId };
            });

            return (
              <div key={hero.id} className="ability-bar-group" style={{ padding: '5px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Hero label */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold" style={{ color: hColor }}>
                    {hero.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Lv.{hero.level}</span>
                </div>

                {/* Slots row */}
                <div className="flex items-center gap-1">
                  {/* Ability slots */}
                  {allAbilitySlots.map(slot => {
                    if (!slot.unlocked) {
                      return (
                        <div key={`a-${slot.index}`} className="ability-slot ability-slot--locked" title={`Locked (need RES ${[1, 30, 60, 90][slot.index]})`}>
                          <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>{"\u{1F512}"}</span>
                          </div>
                        </div>
                      );
                    }
                    if (!slot.ability) {
                      return (
                        <div key={`a-${slot.index}`} className="ability-slot ability-slot--empty" title="Empty ability slot" />
                      );
                    }
                    const ability = slot.ability;
                    const cd = ability.cooldown;
                    const isPassive = cd <= 0 || ability.isPassive;
                    const cdRemaining = !isPassive && gt > 0 ? cd - (gt % cd) : 0;
                    const isReady = isPassive || gt === 0 || gt % cd === 0;
                    const abilityColor = ABILITY_COLOR_HEX[ability.color];
                    return (
                      <div
                        key={`a-${slot.index}`}
                        className={`ability-slot ${isReady ? 'ability-slot--ready' : ''}`}
                        title={`${ability.name} — ${ability.effect}\nCD: ${cd}s | SP: ${ability.spCost}`}
                        style={{
                          padding: 3,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderColor: isReady ? abilityColor : `${abilityColor}40`,
                          boxShadow: isReady ? `0 0 8px ${abilityColor}40` : undefined,
                        }}
                      >
                        <ItemIcon itemId={ability.id} itemType="ability" size={32} fallbackColor={abilityColor} />
                        {isPassive && (
                          <div className="ability-cooldown-overlay" style={{ fontSize: 9, backgroundColor: `${abilityColor}30`, color: abilityColor, fontWeight: 800, letterSpacing: 1 }}>
                            ON
                          </div>
                        )}
                        {!isPassive && !isReady && cdRemaining > 0 && (
                          <div className="ability-cooldown-overlay">
                            <span style={{ fontSize: 13, fontWeight: 800 }}>{cdRemaining}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Separator between abilities and consumables */}
                  {allConsumableSlots.length > 0 && (
                    <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.08)', margin: '0 2px', flexShrink: 0 }} />
                  )}

                  {/* Consumable slots */}
                  {allConsumableSlots.map(slot => {
                    if (!slot.cId) {
                      return (
                        <div key={`c-${slot.index}`} className="ability-slot ability-slot--empty ability-slot--consumable-empty" title="Empty consumable slot" />
                      );
                    }
                    const cId = slot.cId;
                    const qty = resources[cId] || 0;
                    const cDef = CONSUMABLES[cId];
                    const typeColor = cDef?.type === 'food' ? '#f39c12' : cDef?.type === 'medicine' ? '#22c55e' : '#a855f7';
                    return (
                      <div
                        key={`c-${slot.index}`}
                        className="ability-slot"
                        style={{
                          padding: 3,
                          backgroundColor: 'rgba(0,0,0,0.45)',
                          borderColor: qty > 0 ? `${typeColor}50` : 'rgba(200,50,50,0.3)',
                        }}
                        title={`${cDef?.name || cId.replace(/_/g, ' ')} — ${cDef?.effect || ''}\n${qty} remaining`}
                      >
                        <ItemIcon itemId={cId} itemType="consumable" size={28} fallbackColor={typeColor} />
                        <span
                          className="absolute font-bold rounded-sm px-0.5"
                          style={{
                            top: -3, right: -3, lineHeight: 1, fontSize: 8,
                            backgroundColor: qty > 0 ? `${typeColor}dd` : 'rgba(200,50,50,0.9)',
                            color: '#fff', minWidth: 14, textAlign: 'center', padding: '1px 2px',
                            borderRadius: 3,
                          }}
                        >
                          {qty > 999 ? '999+' : qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
