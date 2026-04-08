/**
 * CombatZonePanel — Combat orchestrator with true mode split.
 *
 * v3: Two distinct modes:
 * - Deployment mode (no active deployments): full header + deploy form
 * - Battle mode (active deployments): compact toolbar + battle cards immediately
 *   Deploy form opens as a modal overlay, not inline.
 */

import { useState } from 'react';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useHeroStore } from '../../store/useHeroStore';
import { COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../../config/combatZones';
import { getFightDuration } from '../../engine/IdleCombatEngine';
import { ProgressBar } from '../common/ProgressBar';
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
  const [showDeployModal, setShowDeployModal] = useState(false);

  const hasDeployments = deployments.length > 0;
  const deployedHeroIds = new Set(deployments.flatMap(d => d.heroIds));
  const availableHeroCount = heroes.filter(h => !deployedHeroIds.has(h.id)).length;

  // ── DEPLOYMENT MODE: no active deployments ──
  if (!hasDeployments) {
    return (
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-3">
        <div className="mb-3">
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Combat Zones</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Deploy squads to idle-farm combat zones. Enemies scale every 10 kills. Bosses every 50 on Full Sweep.
          </p>
        </div>

        <DeploymentForm
          initialZoneId={initialZoneId}
          isModal={false}
          onClose={() => {}}
        />

        <div className="mt-4 p-6 rounded-lg text-center text-[11px]" style={{
          backgroundColor: 'rgba(22, 19, 15, 0.5)',
          border: '1px solid rgba(62, 54, 40, 0.2)',
          color: 'var(--color-text-muted)',
        }}>
          No squads deployed. Configure and deploy a squad above.
        </div>
      </div>
    );
  }

  // ── BATTLE MODE: active deployments ──
  return (
    <div className="flex-1 overflow-y-auto relative">
      {/* Compact toolbar */}
      <div
        className="flex items-center justify-between px-4 md:px-6 py-1 sticky top-0 z-10"
        style={{
          background: 'linear-gradient(180deg, rgba(12, 10, 8, 0.97) 0%, rgba(12, 10, 8, 0.88) 100%)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(62, 54, 40, 0.15)',
          minHeight: 30,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold font-data" style={{ color: 'var(--color-text-primary)' }}>
            {deployments.length}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            {deployments.length === 1 ? 'squad' : 'squads'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>{"\u2022"}</span>
          <span className="text-[10px] font-data" style={{ color: 'var(--color-success)' }}>
            {deployments.reduce((s, d) => s + d.totalKills, 0).toLocaleString()}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            kills
          </span>
        </div>
        <button
          onClick={() => setShowDeployModal(true)}
          className="flex items-center gap-1 px-2.5 py-0.5 rounded cursor-pointer"
          style={{
            backgroundColor: availableHeroCount > 0 ? 'var(--color-accent)' : 'rgba(255,255,255,0.04)',
            color: availableHeroCount > 0 ? '#000' : 'var(--color-text-muted)',
            border: availableHeroCount > 0 ? 'none' : '1px solid rgba(62, 54, 40, 0.2)',
          }}
        >
          <span className="text-[10px] font-bold">+ Deploy</span>
          {availableHeroCount > 0 && (
            <span className="text-[9px] opacity-60">({availableHeroCount})</span>
          )}
        </button>
      </div>

      {/* Battle cards — start immediately */}
      <div className="px-4 md:px-6 py-2 space-y-3">
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
            <div key={dep.partyId}>
              {allRecovering ? (
                <div className="rounded-lg overflow-hidden" style={{
                  backgroundColor: 'rgba(22, 19, 15, 0.65)',
                  border: '1px solid rgba(224, 85, 69, 0.3)',
                }}>
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(62, 54, 40, 0.2)' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{zone?.name}</span>
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
                  <div className="p-4 text-center" style={{ backgroundColor: 'rgba(239,68,68,0.04)' }}>
                    <div className="text-[11px] font-bold mb-1.5" style={{ color: 'var(--color-danger)' }}>
                      All heroes recovering...
                    </div>
                    <ProgressBar value={1} max={1} color="var(--color-danger)" height="4px" />
                  </div>
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
              ) : (
                <BattleView
                  dep={dep}
                  partyHeroes={partyHeroes}
                  zone={zone!}
                  fastestDuration={fastestDuration}
                  zoneName={zone?.name || ''}
                  targetName={target?.name || ''}
                  tierName={tierInfo?.name || `T${dep.zoneTier}`}
                  zoneTier={dep.zoneTier}
                  onRecallParty={() => recallParty(dep.partyId)}
                  onRecallHero={(heroId) => recallHero(dep.partyId, heroId)}
                  totalKills={dep.totalKills}
                  bossKills={dep.bossKills}
                  totalXpEarned={dep.totalXpEarned || 0}
                  deathCount={dep.deathCount || 0}
                  deployedAt={dep.deployedAt}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Deploy modal overlay */}
      {showDeployModal && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
            onClick={() => setShowDeployModal(false)}
          />
          <div
            className="fixed z-50"
            style={{
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 'min(560px, calc(100vw - 32px))',
              maxHeight: 'calc(100vh - 64px)',
              overflowY: 'auto',
              borderRadius: 12,
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8)',
            }}
          >
            <DeploymentForm
              initialZoneId={initialZoneId}
              isModal={true}
              onClose={() => setShowDeployModal(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
