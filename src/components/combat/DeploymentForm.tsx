/**
 * DeploymentForm — Zone, target, tier, and hero selection for combat deployment.
 *
 * v3: Used in two contexts:
 * - Inline (deployment mode): shown directly when no deployments exist
 * - Modal (battle mode): opened via toolbar button as an overlay
 */

import { useState, useEffect } from 'react';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useHeroStore } from '../../store/useHeroStore';
import { COMBAT_ZONE_LIST, COMBAT_ZONES, ZONE_TIER_MULTIPLIERS } from '../../config/combatZones';

interface DeploymentFormProps {
  initialZoneId?: string | null;
  isModal: boolean;
  onClose: () => void;
}

export function DeploymentForm({ initialZoneId, isModal, onClose }: DeploymentFormProps) {
  const tierUnlocks = useCombatZoneStore(s => s.tierUnlocks);
  const deployParty = useCombatZoneStore(s => s.deployParty);
  const deployments = useCombatZoneStore(s => s.deployments);
  const heroRecoveryCooldowns = useCombatZoneStore(s => s.heroRecoveryCooldowns);
  const heroes = useHeroStore(s => s.heroes);

  const [selectedZone, setSelectedZone] = useState<string>(initialZoneId || '');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState(1);

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

  const handleDeploy = () => {
    if (!selectedZone || !selectedTarget || selectedHeroIds.length === 0) return;
    deployParty(selectedHeroIds, selectedZone, selectedTarget, selectedTier);
    setSelectedHeroIds([]);
    onClose();
  };

  const canDeploy = selectedZone && selectedTarget && selectedHeroIds.length > 0;

  return (
    <div className="rounded-lg overflow-hidden" style={{
      backgroundColor: isModal ? '#16130f' : 'rgba(22, 19, 15, 0.7)',
      border: isModal ? 'none' : '1px solid rgba(62, 54, 40, 0.3)',
    }}>
      {/* Header */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{
        borderBottom: '1px solid rgba(62, 54, 40, 0.2)',
        background: 'linear-gradient(90deg, rgba(212, 168, 67, 0.04) 0%, transparent 60%)',
      }}>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Deploy Squad
        </span>
        {isModal && (
          <button
            onClick={onClose}
            className="text-sm px-1.5 cursor-pointer"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
          >
            {"\u2715"}
          </button>
        )}
      </div>

      <div className="p-3 space-y-2">
        {/* Zone / Target / Tier selectors */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Zone</label>
            <select
              value={selectedZone}
              onChange={e => { setSelectedZone(e.target.value); setSelectedTarget(''); setSelectedTier(1); }}
              className="w-full p-1.5 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              <option value="">-- Select --</option>
              {COMBAT_ZONE_LIST.map(z => (
                <option key={z.id} value={z.id}>{z.name} (Lv.{z.minLevel}+)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Target</label>
            <select
              value={selectedTarget}
              onChange={e => setSelectedTarget(e.target.value)}
              disabled={!zone}
              className="w-full p-1.5 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              <option value="">-- Select --</option>
              {zone?.targets.map(t => (
                <option key={t.id} value={t.id}>{t.isSweep ? '>> ' : ''}{t.name} ({t.enemy.name})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1" style={{ color: 'var(--color-text-muted)' }}>Tier (max: {maxTier})</label>
            <select
              value={selectedTier}
              onChange={e => setSelectedTier(parseInt(e.target.value))}
              disabled={!zone}
              className="w-full p-1.5 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
            >
              {Array.from({ length: maxTier }, (_, i) => i + 1).map(t => (
                <option key={t} value={t}>{ZONE_TIER_MULTIPLIERS[t-1]?.name || `T${t}`} (x{ZONE_TIER_MULTIPLIERS[t-1]?.xpMult} XP)</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hero selection */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Squad ({selectedHeroIds.length}/{availableHeroes.length} available)
            </label>
            <div className="flex gap-1.5">
              <button
                onClick={() => setSelectedHeroIds(availableHeroes.filter(h => !(heroRecoveryCooldowns[h.id] > 0)).map(h => h.id))}
                className="text-[10px] px-2 py-0.5 rounded cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                All
              </button>
              <button
                onClick={() => setSelectedHeroIds([])}
                className="text-[10px] px-2 py-0.5 rounded cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
              >
                None
              </button>
            </div>
          </div>

          {availableHeroes.length === 0 ? (
            <div className="p-2 rounded text-[11px] text-center" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }}>
              No heroes available — all deployed or none recruited.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {availableHeroes.map(h => {
                const isSelected = selectedHeroIds.includes(h.id);
                const recoverySecs = heroRecoveryCooldowns[h.id] || 0;
                const isRecovering = recoverySecs > 0;
                return (
                  <button
                    key={h.id}
                    onClick={() => !isRecovering && toggleHero(h.id)}
                    className="flex items-center gap-1.5 p-1 rounded text-[10px] text-left cursor-pointer"
                    style={{
                      backgroundColor: isRecovering ? 'rgba(239,68,68,0.08)' : isSelected ? 'var(--color-accent)' : 'var(--color-bg-primary)',
                      color: isRecovering ? 'var(--color-danger)' : isSelected ? '#000' : 'var(--color-text-primary)',
                      border: `1px solid ${isRecovering ? 'var(--color-danger)' : isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      cursor: isRecovering ? 'not-allowed' : 'pointer',
                      opacity: isRecovering ? 0.6 : 1,
                    }}
                  >
                    <span style={{
                      width: 11, height: 11, borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: isSelected ? '#000' : 'transparent',
                      border: isSelected ? 'none' : '1px solid var(--color-text-muted)',
                      color: isSelected ? 'var(--color-accent)' : 'transparent', fontSize: 8, flexShrink: 0,
                    }}>
                      {isSelected ? '\u2713' : ''}
                    </span>
                    <span className="font-bold truncate">{h.name}</span>
                    <span className="truncate" style={{ color: isRecovering ? 'var(--color-danger)' : isSelected ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)' }}>
                      {isRecovering
                        ? `(${Math.floor(recoverySecs / 60)}m ${recoverySecs % 60}s)`
                        : `Lv.${h.level}`
                      }
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Deploy button + zone description */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeploy}
            disabled={!canDeploy}
            className="px-6 py-1.5 rounded text-xs font-bold cursor-pointer uppercase tracking-wider"
            style={{
              backgroundColor: canDeploy ? 'var(--color-accent)' : 'var(--color-bg-primary)',
              color: canDeploy ? '#000' : 'var(--color-text-muted)',
              border: 'none',
              flexShrink: 0,
            }}
          >
            Deploy {selectedHeroIds.length > 0 ? `${selectedHeroIds.length} Hero${selectedHeroIds.length > 1 ? 'es' : ''}` : 'Squad'}
          </button>
          {zone && selectedTarget && (
            <div className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
              {zone.description} — T{zone.baseGearTier} gear from bosses
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
