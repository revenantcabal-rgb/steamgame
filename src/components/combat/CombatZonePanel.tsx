/**
 * CombatZonePanel — Orchestrator for combat deployment and visualization.
 *
 * Previously 601 lines of monolithic code mixing deployment forms, battle
 * rendering, hero cards, enemy cards, abilities, damage floaters, and stats.
 *
 * Now a thin shell delegating to:
 * - DeploymentForm — zone/target/tier/hero selection
 * - BattleView — side-by-side battle visualization with real HP/SP
 * - HeroBattleCard — individual hero in battle
 * - EnemyBattleCard — individual enemy in battle
 * - DeploymentStats — combat statistics footer
 */

import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useHeroStore } from '../../store/useHeroStore';
import { COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../../config/combatZones';
import { getFightDuration } from '../../engine/IdleCombatEngine';
import { ProgressBar } from '../common/ProgressBar';
// CLASSES used indirectly via child components
import { DeploymentForm } from './DeploymentForm';
import { BattleView } from './BattleView';
import { DeploymentStats } from './DeploymentStats';

interface CombatZonePanelProps {
  initialZoneId?: string | null;
}

export function CombatZonePanel({ initialZoneId }: CombatZonePanelProps) {
  const deployments = useCombatZoneStore(s => s.deployments);
  const recallParty = useCombatZoneStore(s => s.recallParty);
  const recallHero = useCombatZoneStore(s => s.recallHero);
  const heroes = useHeroStore(s => s.heroes);

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Combat Zones</h2>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          Deploy squads to idle-farm combat zones. Enemies scale every 10 kills. Bosses every 50 on Full Sweep.
        </p>
      </div>

      {/* Deploy form */}
      <div className="mb-4">
        <DeploymentForm initialZoneId={initialZoneId} />
      </div>

      {/* Active deployments */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Active Deployments
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(62, 54, 40, 0.3)' }} />
        <span className="text-[11px] font-data" style={{ color: 'var(--color-text-muted)' }}>
          {deployments.length}
        </span>
      </div>

      {deployments.length === 0 ? (
        <div className="p-6 rounded-lg text-center text-[11px]" style={{
          backgroundColor: 'rgba(22, 19, 15, 0.5)',
          border: '1px solid rgba(62, 54, 40, 0.2)',
          color: 'var(--color-text-muted)',
        }}>
          No squads deployed. Configure and deploy a squad above.
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map(dep => {
            const zone = COMBAT_ZONES[dep.zoneId];
            const target = zone?.targets.find(t => t.id === dep.targetId);
            const partyHeroes = dep.heroIds
              .map(id => heroes.find(h => h.id === id))
              .filter(Boolean) as typeof heroes;
            const fastestDuration = partyHeroes.length > 0 && zone
              ? Math.min(...partyHeroes.map(h => getFightDuration(h.level, zone.minLevel)))
              : 8;
            const tierInfo = ZONE_TIER_MULTIPLIERS[dep.zoneTier - 1];
            const allRecovering = partyHeroes.length > 0 &&
              partyHeroes.every(h => (dep.recoveryCooldowns[h.id] || 0) > 0);

            return (
              <div
                key={dep.partyId}
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: 'rgba(22, 19, 15, 0.65)',
                  border: `1px solid ${allRecovering ? 'rgba(224, 85, 69, 0.3)' : 'rgba(62, 54, 40, 0.3)'}`,
                }}
              >
                {/* Deployment header */}
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{ borderBottom: '1px solid rgba(62, 54, 40, 0.2)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
                      {zone?.name}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {target?.name} | {tierInfo?.name} (T{dep.zoneTier})
                    </span>
                  </div>
                  <button
                    onClick={() => recallParty(dep.partyId)}
                    className="px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer uppercase tracking-wider"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
                  >
                    Recall
                  </button>
                </div>

                {/* Party roster strip */}
                <div className="flex flex-wrap gap-1 px-3 py-1.5" style={{ borderBottom: '1px solid rgba(62, 54, 40, 0.1)' }}>
                  {partyHeroes.map(hero => {
                    const isRecovering = (dep.recoveryCooldowns[hero.id] || 0) > 0;
                    const cooldown = dep.recoveryCooldowns[hero.id] || 0;
                    return (
                      <div
                        key={hero.id}
                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                        style={{
                          backgroundColor: isRecovering ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${isRecovering ? 'rgba(239,68,68,0.2)' : 'rgba(62, 54, 40, 0.2)'}`,
                        }}
                      >
                        <span className="font-bold" style={{ color: isRecovering ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                          {hero.name}
                        </span>
                        <span style={{ color: 'var(--color-text-muted)' }}>
                          {isRecovering
                            ? `(${Math.floor(cooldown / 60)}m ${cooldown % 60}s)`
                            : `Lv.${hero.level}`
                          }
                        </span>
                        <button
                          onClick={() => recallHero(dep.partyId, hero.id)}
                          className="ml-0.5 cursor-pointer"
                          style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontSize: 10 }}
                          title="Recall hero"
                        >
                          {"\u2715"}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Battle visualization */}
                <div className="px-2 py-2">
                  {allRecovering ? (
                    <div className="p-4 rounded text-center" style={{ backgroundColor: 'rgba(239,68,68,0.04)' }}>
                      <div className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--color-danger)' }}>
                        All heroes recovering...
                      </div>
                      <ProgressBar value={1} max={1} color="var(--color-danger)" height="4px" />
                    </div>
                  ) : (
                    <BattleView
                      dep={dep}
                      partyHeroes={partyHeroes}
                      zone={zone!}
                      fastestDuration={fastestDuration}
                    />
                  )}
                </div>

                {/* Stats footer */}
                <div className="px-3 pb-2">
                  <DeploymentStats
                    totalKills={dep.totalKills}
                    bossKills={dep.bossKills}
                    heroCount={partyHeroes.length}
                    totalXpEarned={dep.totalXpEarned || 0}
                    deathCount={dep.deathCount || 0}
                    deployedAt={dep.deployedAt}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
