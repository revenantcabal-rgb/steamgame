/**
 * EnemyBattleCard — Enemy card in the battle scene.
 * v3: Added HP percentage, improved targeted pulse, cleaner dead state.
 */

import { ItemIcon } from '../../utils/itemIcons';
import type { SpawnedEnemy } from '../../store/useCombatZoneStore';

interface EnemyBattleCardProps {
  enemy: SpawnedEnemy;
  isTarget: boolean;
  /** Unique index for floating damage positioning */
  index: number;
}

export function EnemyBattleCard({ enemy, isTarget, index }: EnemyBattleCardProps) {
  const isDead = enemy.currentHp <= 0;
  const hpPct = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100)) : 0;

  return (
    <div
      className={`combat-card ${isTarget ? 'combat-card--targeted' : ''} ${isDead ? 'combat-card--dead' : ''}`}
      style={{ width: 120, position: 'relative' }}
      data-enemy-index={index}
    >
      <div className="text-[11px] font-bold truncate" style={{
        color: isDead ? 'var(--color-text-muted)' : 'var(--color-danger)',
      }}>
        {enemy.name}
      </div>
      <div className="my-1">
        <ItemIcon itemId={enemy.enemyId} itemType="monster" size={52} fallbackLabel="?" fallbackColor="#e74c3c" />
      </div>

      {/* HP bar */}
      <div style={{ width: '100%', height: 7, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${hpPct}%`, height: '100%', borderRadius: 3,
          transition: 'width 0.4s ease',
          backgroundColor: hpPct > 50 ? '#ef4444' : hpPct > 25 ? '#f59e0b' : '#22c55e',
        }} />
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="text-[10px] font-bold font-data" style={{
          color: isDead ? 'var(--color-text-muted)' : '#ef4444',
        }}>
          {isDead ? 'SLAIN' : `${Math.round(enemy.currentHp)}/${enemy.maxHp}`}
        </div>
        {!isDead && (
          <div className="text-[9px] font-data" style={{ color: 'var(--color-text-muted)' }}>
            {Math.round(hpPct)}%
          </div>
        )}
      </div>

      {/* Status + ATK */}
      <div className="flex items-center justify-between w-full mt-1">
        <div className="text-[9px] py-0.5 px-1.5 rounded" style={{
          backgroundColor: isDead ? 'transparent' : isTarget ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.06)',
          color: isDead ? 'var(--color-text-muted)' : 'var(--color-danger)',
          border: isDead ? 'none' : isTarget ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.1)',
        }}>
          {isDead ? 'Defeated' : isTarget ? 'Targeted' : 'Waiting'}
        </div>
        {!isDead && (
          <div className="text-[10px] font-bold font-data" style={{ color: '#ef4444' }}>
            {enemy.damage} ATK
          </div>
        )}
      </div>
    </div>
  );
}
