import { useState, useEffect } from 'react';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useHeroStore } from '../../store/useHeroStore';
import { COMBAT_ZONE_LIST, COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../../config/combatZones';
import { CLASSES } from '../../config/classes';
import { getFightDuration, canEnterZone } from '../../engine/IdleCombatEngine';
import { ProgressBar } from '../common/ProgressBar';
import { ItemIcon } from '../../utils/itemIcons';

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
  const heroes = useHeroStore(s => s.heroes);
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
                return (
                  <button key={h.id} onClick={() => toggleHero(h.id)}
                    className="flex items-center gap-2 p-2 rounded text-xs text-left cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                      color: isSelected ? '#000' : 'var(--color-text-primary)',
                      border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
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
                    <span style={{ color: isSelected ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)' }}>
                      Lv.{h.level} {cls?.name}
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
                  <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                    {/* Visual Battle Scene */}
                    <div className="flex items-center justify-between mb-2">
                      {/* Hero Side */}
                      <div className="flex gap-1 items-end">
                        {partyHeroes.filter(h => !(dep.recoveryCooldowns[h.id] > 0)).slice(0, 3).map(hero => (
                          <div key={hero.id} className="text-center" style={{
                            animation: dep.fightProgress > 0 && dep.fightProgress % 2 === 0 ? 'combat-pulse 0.5s ease' : 'none',
                          }}>
                            <ItemIcon itemId={hero.classId} itemType="hero" size={32} fallbackLabel={hero.name.charAt(0)} />
                            <div className="text-[8px] truncate" style={{ color: 'var(--color-text-muted)', maxWidth: 40 }}>{hero.name.split(' ')[0]}</div>
                          </div>
                        ))}
                      </div>

                      {/* Battle Indicator */}
                      <div className="flex flex-col items-center px-3">
                        <div className="text-lg font-bold combat-swords-icon">&#9876;</div>
                        <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{dep.fightProgress}s / {fastestDuration}s</div>
                      </div>

                      {/* Enemy Side */}
                      <div className="text-center" style={{
                        animation: dep.fightProgress > 0 && dep.fightProgress % 2 === 1 ? 'combat-pulse 0.5s ease' : 'none',
                      }}>
                        <ItemIcon itemId={target?.enemy.id || 'unknown'} itemType="resource" size={40} fallbackLabel="?" fallbackColor="#e74c3c" />
                        <div className="text-[11px] font-bold" style={{ color: 'var(--color-danger)' }}>{target?.enemy.name || '...'}</div>
                        {dep.waveMultiplier > 1 && (
                          <div className="text-[8px]" style={{ color: 'var(--color-energy)' }}>+{Math.round((dep.waveMultiplier - 1) * 100)}%</div>
                        )}
                      </div>
                    </div>

                    {/* Fight Progress Bar */}
                    <ProgressBar value={dep.fightProgress} max={fastestDuration} color="var(--color-energy)" height="5px" />
                    {target?.isSweep && (
                      <div className="text-[11px] text-center mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Fight {dep.fightCount}/50 to boss
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Kills: <b style={{ color: 'var(--color-success)' }}>{dep.totalKills}</b></span>
                  <span>Bosses: <b style={{ color: 'var(--color-accent)' }}>{dep.bossKills}</b></span>
                  <span>Party: <b>{partyHeroes.length}</b> heroes</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
