/**
 * BattleView — Side-by-side squad combat visualization.
 *
 * Key fix: Hero HP and SP now reflect estimated mid-fight state instead of
 * always showing 100%. We use fight progress ratio to interpolate between
 * full health and the expected damage taken by fight end.
 *
 * Enemy HP is tracked live in the store (already correct).
 */

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { CLASSES } from '../../config/classes';
import { ABILITIES, ABILITY_COLOR_HEX } from '../../config/abilities';
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
}

export function BattleView({ dep, partyHeroes, zone, fastestDuration }: BattleViewProps) {
  const heroEquipment = useEquipmentStore(s => s.heroEquipment);
  const inventory = useEquipmentStore(s => s.inventory);
  const resources = useGameStore(s => s.resources);
  const prevEnemyHpRef = useRef<number[]>([]);
  const [floatingDmgs, setFloatingDmgs] = useState<{ id: string; value: number; color: string; initial: string }[]>([]);

  const gt = dep.globalTick || 0;
  const enemies: SpawnedEnemy[] = dep.currentEnemies || [];
  const firstAliveIdx = enemies.findIndex(e => e.currentHp > 0);
  const target = zone.targets.find(t => t.id === dep.targetId);

  // Sort heroes by turn speed (fastest first)
  const activeHeroesUnsorted = partyHeroes.filter(h => !(dep.recoveryCooldowns[h.id] > 0));
  const activeHeroes = [...activeHeroesUnsorted].sort((a, b) => {
    const gearA = getEquippedGear(a.id, heroEquipment, inventory);
    const gearB = getEquippedGear(b.id, heroEquipment, inventory);
    return calculateDerivedStats(b, gearB).turnSpeed - calculateDerivedStats(a, gearA).turnSpeed;
  });

  const encampmentDamageMult = 1 + getCombatDamageBonus() / 100;
  const encampmentHpMult = 1 + (getEncampmentBonuses().combat_hp || 0) / 100;

  // Fight progress ratio (0 to 1)
  const progressRatio = fastestDuration > 0 ? Math.min(1, dep.fightProgress / fastestDuration) : 0;

  // Determine which hero attacked this tick
  const attackingHeroIdx = (() => {
    for (let hi = 0; hi < activeHeroes.length; hi++) {
      const hero = activeHeroes[hi];
      const gear = getEquippedGear(hero.id, heroEquipment, inventory);
      const d = calculateDerivedStats(hero, gear);
      const interval = Math.max(1, Math.round(100 / Math.max(1, d.turnSpeed) * 3));
      if ((gt + hi) % interval === 0) return hi;
    }
    return -1;
  })();

  // Floating damage tracking
  useEffect(() => {
    const currentHps = enemies.map(e => e.currentHp);
    const prev = prevEnemyHpRef.current;
    if (prev.length === currentHps.length) {
      const newDmgs: { id: string; value: number; color: string; initial: string }[] = [];
      for (let i = 0; i < currentHps.length; i++) {
        const delta = prev[i] - currentHps[i];
        if (delta > 1) {
          const heroIdx = attackingHeroIdx >= 0 ? attackingHeroIdx : 0;
          const heroColor = HERO_COLORS[heroIdx] || HERO_COLORS[0];
          const heroInitial = activeHeroes[heroIdx]?.name?.charAt(0) || '?';
          newDmgs.push({ id: `${gt}-${i}-${Date.now()}`, value: delta, color: heroColor, initial: heroInitial });
        }
      }
      if (newDmgs.length > 0) {
        setFloatingDmgs(d => [...d.slice(-6), ...newDmgs]);
        setTimeout(() => setFloatingDmgs(d => d.filter(dd => !newDmgs.some(n => n.id === dd.id))), 900);
      }
    }
    prevEnemyHpRef.current = currentHps;
  }, [enemies.map(e => Math.round(e.currentHp)).join(',')]);

  // Compute per-hero battle stats with REAL estimated HP/SP
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

    // Read authoritative HP/SP from store (tracked per-tick in useCombatZoneStore)
    const currentHp = dep.heroHpMap?.[hero.id] ?? effectiveMaxHp;
    const currentSp = dep.heroSpMap?.[hero.id] ?? derived.maxSp;

    // Attack timing — connected to real tick intervals
    const attackInterval = Math.max(1, Math.round(100 / Math.max(1, derived.turnSpeed) * 3));
    const justAttacked = gt > 0 && (gt + heroIndex) % attackInterval === 0;

    return {
      hero,
      derived,
      dps: Math.round(heroDps),
      maxHp: effectiveMaxHp,
      currentHp,
      maxSp: derived.maxSp,
      currentSp: Math.min(derived.maxSp, currentSp),
      justAttacked,
      colorIndex: heroIndex,
      isRecovering: false,
      recoverySecs: 0,
    };
  });

  // Add recovering heroes
  const recoveringHeroes: HeroBattleStats[] = partyHeroes
    .filter(h => (dep.recoveryCooldowns[h.id] || 0) > 0)
    .map(hero => {
      const equippedGear = getEquippedGear(hero.id, heroEquipment, inventory);
      const derived = calculateDerivedStats(hero, equippedGear);
      return {
        hero, derived, dps: 0, maxHp: 0, currentHp: 0, maxSp: 0, currentSp: 0,
        justAttacked: false, colorIndex: 0,
        isRecovering: true, recoverySecs: dep.recoveryCooldowns[hero.id] || 0,
      };
    });

  const totalPartyDps = heroStats.reduce((s, h) => s + h.dps, 0);

  // Abilities bar
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

      {/* Battle header */}
      <div style={{ position: 'relative', zIndex: 1, padding: '6px 12px 0' }}>
        <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex items-center gap-2">
            {target?.isSweep && <span>Battle {dep.fightCount + 1}/50</span>}
            {dep.waveMultiplier > 1 && (
              <span className="font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: 'var(--color-energy)' }}>
                Wave +{Math.round((dep.waveMultiplier - 1) * 100)}%
              </span>
            )}
          </div>
          <div>
            {enemies.length > 1 && `${enemies.filter(e => e.currentHp <= 0).length}/${enemies.length} slain`}
          </div>
        </div>
      </div>

      {/* Battle scene — 3-column: heroes | center | enemies */}
      <div style={{
        position: 'relative', zIndex: 1, padding: '10px 12px',
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'center', minHeight: 180,
      }}>
        {/* LEFT: Heroes */}
        <div className="flex gap-1.5 justify-start flex-wrap">
          {heroStats.map(s => <HeroBattleCard key={s.hero.id} stats={s} />)}
          {recoveringHeroes.map(s => <HeroBattleCard key={s.hero.id} stats={s} />)}
        </div>

        {/* CENTER: Battle info */}
        <div className="flex flex-col items-center justify-center gap-1" style={{ minWidth: 70 }}>
          <div className="text-2xl combat-swords-icon">{"\u2694\uFE0F"}</div>
          <div className="text-sm font-bold font-data" style={{ color: 'var(--color-text-primary)' }}>{totalPartyDps}</div>
          <div className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Party DPS</div>
          {/* Fight progress */}
          <div className="w-full mt-1" style={{ maxWidth: 60 }}>
            <div style={{ height: 3, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
              <div style={{
                height: '100%', borderRadius: 2, transition: 'width 0.3s ease',
                width: `${progressRatio * 100}%`,
                backgroundColor: 'var(--color-accent)',
              }} />
            </div>
          </div>
        </div>

        {/* RIGHT: Enemies */}
        <div className="flex gap-1.5 justify-end flex-wrap" style={{ position: 'relative' }}>
          {/* Floating damage */}
          {floatingDmgs.map(d => (
            <div key={d.id} className="float-damage" style={{ color: d.color, top: '10%', left: '30%' }}>
              {d.initial && <span style={{ fontSize: 9, opacity: 0.7 }}>{d.initial} </span>}
              -{Math.round(d.value)}
            </div>
          ))}

          {enemies.map((enemy, idx) => (
            <EnemyBattleCard key={idx} enemy={enemy} isTarget={idx === firstAliveIdx} />
          ))}
        </div>
      </div>

      {/* Abilities & consumables bar */}
      {(allAbilities.length > 0 || activeHeroes.some(h => h.equippedConsumables?.some(c => c))) && (
        <div style={{ position: 'relative', zIndex: 1, padding: '0 12px 8px' }}>
          <div className="flex gap-3 overflow-x-auto">
            {activeHeroes.map((hero, heroIdx) => {
              const heroAbilities = (hero.equippedAbilities || [])
                .filter((a): a is string => a != null)
                .map(aId => ABILITIES[aId])
                .filter(Boolean);
              const heroConsumables = (hero.equippedConsumables || [])
                .filter((c): c is string => c != null);
              if (heroAbilities.length === 0 && heroConsumables.length === 0) return null;
              return (
                <div key={hero.id} className="flex items-center gap-1">
                  <span className="text-[9px] font-bold mr-0.5" style={{ color: HERO_COLORS[heroIdx] || 'var(--color-text-muted)' }}>
                    {hero.name.split(' ')[0]}:
                  </span>
                  {heroAbilities.map(ability => {
                    const cd = ability.cooldown;
                    const isPassive = cd <= 0 || ability.isPassive;
                    const cdRemaining = !isPassive && gt > 0 ? cd - (gt % cd) : 0;
                    const isReady = isPassive || gt === 0 || gt % cd === 0;
                    const abilityColor = ABILITY_COLOR_HEX[ability.color];
                    return (
                      <div
                        key={ability.id}
                        className={`ability-slot ${isReady ? 'ability-slot--ready' : ''}`}
                        title={`${ability.name} — ${ability.effect}\nCD: ${cd}s | SP: ${ability.spCost}`}
                        style={{ padding: 2, backgroundColor: 'rgba(0,0,0,0.5)', borderColor: isReady ? abilityColor : 'transparent' }}
                      >
                        <ItemIcon itemId={ability.id} itemType="ability" size={22} fallbackColor={abilityColor} />
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
                      <div
                        key={`c-${i}`}
                        className="ability-slot"
                        style={{ padding: 2, backgroundColor: 'rgba(0,0,0,0.4)', borderColor: qty > 0 ? 'rgba(100,200,100,0.3)' : 'rgba(200,50,50,0.3)' }}
                        title={`${cId.replace(/_/g, ' ')} (${qty} left)`}
                      >
                        <ItemIcon itemId={cId} itemType="consumable" size={18} fallbackColor="#27ae60" />
                        <span
                          className="absolute text-[8px] font-bold rounded-sm px-0.5"
                          style={{
                            top: -2, right: -2, lineHeight: 1,
                            backgroundColor: qty > 0 ? 'rgba(39,174,96,0.9)' : 'rgba(200,50,50,0.9)',
                            color: '#fff', minWidth: 12, textAlign: 'center',
                          }}
                        >
                          {qty}
                        </span>
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
