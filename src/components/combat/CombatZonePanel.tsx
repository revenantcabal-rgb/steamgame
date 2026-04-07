import { useState, useEffect } from 'react';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useHeroStore } from '../../store/useHeroStore';
import { COMBAT_ZONE_LIST, COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../../config/combatZones';
import { CLASSES } from '../../config/classes';
import { getFightDuration, canEnterZone } from '../../engine/IdleCombatEngine';
import { ProgressBar } from '../common/ProgressBar';

interface CombatZonePanelProps {
  /** Pre-select a zone when navigating from the sidebar */
  initialZoneId?: string | null;
}

export function CombatZonePanel({ initialZoneId }: CombatZonePanelProps) {
  const deployments = useCombatZoneStore(s => s.deployments);
  const tierUnlocks = useCombatZoneStore(s => s.tierUnlocks);
  const deployHero = useCombatZoneStore(s => s.deployHero);
  const recallHero = useCombatZoneStore(s => s.recallHero);
  const heroes = useHeroStore(s => s.heroes);
  const [selectedZone, setSelectedZone] = useState<string>(initialZoneId || '');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedHero, setSelectedHero] = useState<string>('');
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
  const availableHeroes = heroes.filter(h => !deployments.find(d => d.heroId === h.id));

  const handleDeploy = () => {
    if (!selectedZone || !selectedTarget || !selectedHero) return;
    deployHero(selectedHero, selectedZone, selectedTarget, selectedTier);
    setSelectedHero('');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Combat Zones</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Deploy heroes to idle-farm combat zones. Bosses appear every 10 kills on Full Sweep.
      </p>

      {/* Deploy Form */}
      <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-3">Deploy Hero to Zone</h3>
        <div className="grid grid-cols-4 gap-2 mb-3">
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
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Hero ({availableHeroes.length} free)</label>
            <select value={selectedHero} onChange={e => setSelectedHero(e.target.value)}
              className="w-full p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              <option value="">-- Select --</option>
              {availableHeroes.map(h => {
                const cls = CLASSES[h.classId];
                return <option key={h.id} value={h.id}>{h.name} (Lv.{h.level} {cls?.name})</option>;
              })}
            </select>
          </div>
        </div>
        {zone && selectedTarget && (
          <div className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {zone.description} | Drops T{zone.baseGearTier} gear from bosses [Salvaged]
          </div>
        )}
        <button onClick={handleDeploy} disabled={!selectedZone || !selectedTarget || !selectedHero}
          className="w-full p-2 rounded text-sm font-bold cursor-pointer"
          style={{ backgroundColor: selectedZone && selectedTarget && selectedHero ? 'var(--color-accent)' : 'var(--color-bg-tertiary)', color: selectedZone && selectedTarget && selectedHero ? '#000' : 'var(--color-text-muted)', border: 'none' }}>
          Deploy to Combat
        </button>
      </div>

      {/* Active Deployments */}
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Active Deployments ({deployments.length})
      </h3>
      {deployments.length === 0 ? (
        <div className="p-6 rounded text-center text-sm" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
          No heroes in combat. Deploy a hero above.
        </div>
      ) : (
        <div className="space-y-3">
          {deployments.map(dep => {
            const hero = heroes.find(h => h.id === dep.heroId);
            const zone = COMBAT_ZONES[dep.zoneId];
            const target = zone?.targets.find(t => t.id === dep.targetId);
            const cls = hero ? CLASSES[hero.classId] : null;
            const fightDuration = hero && zone ? getFightDuration(hero.level, zone.minLevel) : 8;
            const tierInfo = ZONE_TIER_MULTIPLIERS[dep.zoneTier - 1];
            const isRecovering = dep.recoveryCooldown > 0;

            return (
              <div key={dep.heroId} className="p-4 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${isRecovering ? 'var(--color-danger)' : 'var(--color-border)'}` }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {hero?.name || 'Unknown'} <span style={{ color: 'var(--color-text-muted)' }}>Lv.{hero?.level} {cls?.name}</span>
                    </span>
                    <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {zone?.name}: {target?.name} | {tierInfo?.name} (T{dep.zoneTier})
                    </div>
                  </div>
                  <button onClick={() => recallHero(dep.heroId)}
                    className="px-3 py-1 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>Recall</button>
                </div>

                {isRecovering ? (
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-danger)' }}>
                      <span>Recovering from defeat...</span>
                      <span>{Math.floor(dep.recoveryCooldown / 60)}m {dep.recoveryCooldown % 60}s</span>
                    </div>
                    <ProgressBar value={dep.recoveryCooldown} max={dep.recoveryCooldown + dep.fightProgress} color="var(--color-danger)" height="6px" />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      <span>
                        Fighting {target?.enemy.name || '...'}
                        {target?.isSweep && ` (${dep.fightCount}/50 to boss)`}
                        {dep.waveMultiplier > 1 && <span style={{ color: 'var(--color-energy)' }}> [Wave +{Math.round((dep.waveMultiplier - 1) * 100)}%]</span>}
                      </span>
                      <span>{dep.fightProgress}s / {fightDuration}s</span>
                    </div>
                    <ProgressBar value={dep.fightProgress} max={fightDuration} color="var(--color-energy)" height="6px" />
                  </div>
                )}

                <div className="flex gap-4 text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Kills: <b style={{ color: 'var(--color-success)' }}>{dep.totalKills}</b></span>
                  <span>Bosses: <b style={{ color: 'var(--color-accent)' }}>{dep.bossKills}</b></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
