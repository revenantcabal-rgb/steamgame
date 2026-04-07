import { useState } from 'react';
import { useExpeditionStore } from '../../store/useExpeditionStore';
import { useHeroStore } from '../../store/useHeroStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { EXPEDITIONS, EXPEDITION_LIST, DIFFICULTY_SCALING } from '../../config/expeditions';
import type { ExpeditionDifficulty } from '../../config/expeditions';
import { CLASSES } from '../../config/classes';
import { ProgressBar } from '../common/ProgressBar';

export function ExpeditionPanel() {
  const active = useExpeditionStore(s => s.active);
  const completions = useExpeditionStore(s => s.completions);
  const startExpedition = useExpeditionStore(s => s.startExpedition);
  const abandonExpedition = useExpeditionStore(s => s.abandonExpedition);
  const claimRewards = useExpeditionStore(s => s.claimRewards);
  const heroes = useHeroStore(s => s.heroes);
  const combatDeployments = useCombatZoneStore(s => s.deployments);

  const [selectedExpedition, setSelectedExpedition] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ExpeditionDifficulty>('normal');
  const [selectedHeroIds, setSelectedHeroIds] = useState<string[]>([]);

  // Heroes not deployed to combat zones
  const deployedInCombat = new Set(combatDeployments.flatMap(d => d.heroIds));
  const availableHeroes = heroes.filter(h => !deployedInCombat.has(h.id));

  const expedition = selectedExpedition ? EXPEDITIONS[selectedExpedition] : null;

  const toggleHero = (heroId: string) => {
    setSelectedHeroIds(prev => {
      if (prev.includes(heroId)) return prev.filter(id => id !== heroId);
      if (expedition && prev.length >= expedition.maxPartySize) return prev;
      return [...prev, heroId];
    });
  };

  const handleStart = () => {
    if (!expedition || selectedHeroIds.length === 0) return;
    const ok = startExpedition(expedition.id, selectedDifficulty, selectedHeroIds);
    if (ok) setSelectedHeroIds([]);
  };

  // If expedition is active, show the battle view
  if (active) {
    return <ActiveExpeditionView />;
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>Expeditions</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Send a party of up to 5 heroes into multi-wave dungeons. Party fights together — heroes share damage and combine DPS.
      </p>

      {/* Expedition Selection */}
      <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-3">Launch Expedition</h3>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Dungeon</label>
            <select value={selectedExpedition} onChange={e => { setSelectedExpedition(e.target.value); setSelectedHeroIds([]); }}
              className="w-full p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              <option value="">-- Select --</option>
              {EXPEDITION_LIST.map(exp => (
                <option key={exp.id} value={exp.id}>{exp.name} (Lv.{exp.minLevel}+)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Difficulty</label>
            <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value as ExpeditionDifficulty)}
              className="w-full p-2 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
              {(Object.keys(DIFFICULTY_SCALING) as ExpeditionDifficulty[]).map(diff => {
                const s = DIFFICULTY_SCALING[diff];
                return <option key={diff} value={diff}>{s.name} (x{s.xpMult} XP, x{s.lootMult} Loot)</option>;
              })}
            </select>
          </div>
        </div>

        {expedition && (
          <div className="text-xs mb-3 p-2 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
            <p>{expedition.description}</p>
            <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {expedition.waves.length} waves | Party size: up to {expedition.maxPartySize} | Min Lv.{expedition.minLevel}
              {completions[`${expedition.id}:${selectedDifficulty}`] > 0 && (
                <span style={{ color: 'var(--color-success)' }}> | Cleared {completions[`${expedition.id}:${selectedDifficulty}`]}x</span>
              )}
            </p>
          </div>
        )}

        {/* Hero Selection */}
        {expedition && (
          <div className="mb-3">
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>
              Select Party ({selectedHeroIds.length}/{expedition.maxPartySize})
            </label>
            {availableHeroes.length === 0 ? (
              <div className="p-2 rounded text-xs text-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>
                No heroes available — all deployed to combat zones or none recruited.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1">
                {availableHeroes.map(h => {
                  const cls = CLASSES[h.classId];
                  const isSelected = selectedHeroIds.includes(h.id);
                  const meetsLevel = h.level >= expedition.minLevel;
                  return (
                    <button key={h.id}
                      onClick={() => meetsLevel && toggleHero(h.id)}
                      className="flex items-center gap-2 p-2 rounded text-xs text-left cursor-pointer"
                      style={{
                        backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                        color: isSelected ? '#000' : meetsLevel ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                        border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        opacity: meetsLevel ? 1 : 0.5,
                      }}>
                      <span style={{
                        width: 14, height: 14, borderRadius: 3, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isSelected ? '#000' : 'transparent',
                        border: isSelected ? 'none' : '1px solid var(--color-text-muted)',
                        color: isSelected ? 'var(--color-accent)' : 'transparent', fontSize: 10,
                      }}>
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="font-bold">{h.name}</span>
                      <span style={{ color: isSelected ? 'rgba(0,0,0,0.6)' : 'var(--color-text-muted)' }}>
                        Lv.{h.level} {cls?.name}
                      </span>
                      {!meetsLevel && <span style={{ color: 'var(--color-danger)', fontSize: 9 }}>Too low</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <button onClick={handleStart}
          disabled={!expedition || selectedHeroIds.length === 0}
          className="w-full p-2 rounded text-sm font-bold cursor-pointer"
          style={{
            backgroundColor: expedition && selectedHeroIds.length > 0 ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
            color: expedition && selectedHeroIds.length > 0 ? '#000' : 'var(--color-text-muted)',
            border: 'none',
          }}>
          Launch Expedition {selectedHeroIds.length > 0 ? `(${selectedHeroIds.length} heroes)` : ''}
        </button>
      </div>

      {/* Expedition List Overview */}
      <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Available Dungeons</h3>
      <div className="space-y-2">
        {EXPEDITION_LIST.map(exp => (
          <div key={exp.id} className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <div className="flex justify-between items-start">
              <div>
                <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>{exp.name}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>Lv.{exp.minLevel}+</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{exp.waves.length} waves</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{exp.description}</p>
            <div className="flex gap-3 mt-1">
              {(Object.keys(DIFFICULTY_SCALING) as ExpeditionDifficulty[]).map(diff => {
                const key = `${exp.id}:${diff}`;
                const count = completions[key] || 0;
                return (
                  <span key={diff} className="text-xs" style={{ color: count > 0 ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                    {DIFFICULTY_SCALING[diff].name}: {count > 0 ? `${count}x` : '--'}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveExpeditionView() {
  const active = useExpeditionStore(s => s.active)!;
  const abandonExpedition = useExpeditionStore(s => s.abandonExpedition);
  const claimRewards = useExpeditionStore(s => s.claimRewards);
  const heroes = useHeroStore(s => s.heroes);

  const expedition = EXPEDITIONS[active.expeditionId];
  const scaling = DIFFICULTY_SCALING[active.difficulty];
  const isFinished = active.status === 'victory' || active.status === 'defeat';

  const currentWave = expedition?.waves[active.currentWave];
  const currentEnemy = currentWave?.enemies[active.currentEnemy];
  const totalEnemies = expedition?.waves.reduce((s, w) => s + w.enemies.length, 0) || 1;
  const defeatedEnemies = expedition?.waves.slice(0, active.currentWave).reduce((s, w) => s + w.enemies.length, 0) + active.currentEnemy || 0;

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{expedition?.name}</h2>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-xs px-2 py-0.5 rounded" style={{
              backgroundColor: active.difficulty === 'extreme' ? '#e74c3c22' : active.difficulty === 'hard' ? '#f39c1222' : '#27ae6022',
              color: active.difficulty === 'extreme' ? '#e74c3c' : active.difficulty === 'hard' ? '#f39c12' : '#27ae60',
            }}>
              {scaling.name}
            </span>
            <span className="text-xs" style={{
              color: active.status === 'victory' ? 'var(--color-success)' : active.status === 'defeat' ? 'var(--color-danger)' : 'var(--color-energy)',
            }}>
              {active.status === 'victory' ? 'VICTORY' : active.status === 'defeat' ? 'DEFEATED' : 'In Progress'}
            </span>
          </div>
        </div>
        {isFinished ? (
          <button onClick={claimRewards} className="px-4 py-2 rounded text-sm font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
            Claim Rewards
          </button>
        ) : (
          <button onClick={abandonExpedition} className="px-3 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
            Abandon
          </button>
        )}
      </div>

      {/* Overall Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
          <span>
            {isFinished
              ? (active.status === 'victory' ? 'All waves complete!' : `Failed at Wave ${active.currentWave + 1}`)
              : `Wave ${active.currentWave + 1}/${expedition?.waves.length}: ${currentWave?.name}`
            }
          </span>
          <span>{defeatedEnemies}/{totalEnemies} enemies</span>
        </div>
        <ProgressBar value={defeatedEnemies} max={totalEnemies} color={active.status === 'defeat' ? 'var(--color-danger)' : 'var(--color-accent)'} height="8px" />
      </div>

      {/* Current Fight */}
      {!isFinished && currentEnemy && (
        <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm" style={{ color: currentWave?.isBossWave ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
              {currentWave?.isBossWave ? 'BOSS: ' : ''}{currentEnemy.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              HP: {Math.floor(currentEnemy.hp * scaling.hpMult).toLocaleString()} | DMG: {Math.floor(currentEnemy.damage * scaling.dmgMult)}
            </span>
          </div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
            <span>Fighting...</span>
            <span>{active.fightProgress}s / {expedition?.fightDuration}s</span>
          </div>
          <ProgressBar value={active.fightProgress} max={expedition?.fightDuration || 10} color="var(--color-energy)" height="6px" />
        </div>
      )}

      {/* Party Status */}
      <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-2">Party</h3>
        <div className="space-y-2">
          {active.heroIds.map(heroId => {
            const hero = heroes.find(h => h.id === heroId);
            const cls = hero ? CLASSES[hero.classId] : null;
            const hp = active.heroHp[heroId] || 0;
            const maxHp = active.heroMaxHp[heroId] || 1;
            const isDead = hp <= 0;
            const xpEarned = active.xpEarned[heroId] || 0;

            return (
              <div key={heroId} className="flex items-center gap-3" style={{ opacity: isDead ? 0.4 : 1 }}>
                <div className="w-40 shrink-0">
                  <span className="text-xs font-bold" style={{ color: isDead ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
                    {hero?.name || '?'} <span style={{ color: 'var(--color-text-muted)' }}>Lv.{hero?.level} {cls?.name}</span>
                  </span>
                </div>
                <div className="flex-1">
                  <ProgressBar value={Math.max(0, hp)} max={maxHp} color={isDead ? 'var(--color-danger)' : hp / maxHp < 0.3 ? '#f39c12' : 'var(--color-success)'} height="8px" />
                </div>
                <div className="w-24 text-right">
                  <span className="text-xs" style={{ color: isDead ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                    {isDead ? 'DOWNED' : `${hp}/${maxHp}`}
                  </span>
                </div>
                <div className="w-20 text-right">
                  <span className="text-xs" style={{ color: 'var(--color-xp)' }}>+{xpEarned} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards Summary (on finish) */}
      {isFinished && (
        <div className="p-3 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: `1px solid ${active.status === 'victory' ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
          <h3 className="font-bold text-sm mb-2" style={{ color: active.status === 'victory' ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {active.status === 'victory' ? 'Rewards' : 'Partial Rewards (defeat)'}
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span style={{ color: 'var(--color-text-muted)' }}>XP Earned:</span>
              <div className="space-y-0.5 mt-1">
                {Object.entries(active.xpEarned).map(([heroId, xp]) => {
                  const hero = heroes.find(h => h.id === heroId);
                  return (
                    <div key={heroId} style={{ color: 'var(--color-xp)' }}>
                      {hero?.name}: +{xp} XP
                    </div>
                  );
                })}
              </div>
            </div>
            {active.status === 'victory' && Object.keys(active.resourcesEarned).length > 0 && (
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Resources:</span>
                <div className="space-y-0.5 mt-1">
                  {Object.entries(active.resourcesEarned).map(([resId, qty]) => (
                    <div key={resId} style={{ color: 'var(--color-success)' }}>
                      +{qty} {resId.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Battle Log */}
      <div className="p-3 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-bold text-sm mb-2">Battle Log</h3>
        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {active.battleLog.map((line, i) => (
            <div key={i} className="text-xs" style={{
              color: line.includes('VICTORY') ? 'var(--color-success)'
                : line.includes('fallen') || line.includes('failed') || line.includes('overwhelmed') ? 'var(--color-danger)'
                : line.includes('---') ? 'var(--color-accent)'
                : line.includes('Loot') ? 'var(--color-energy)'
                : 'var(--color-text-secondary)',
            }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
