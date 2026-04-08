/**
 * EnemyBattleCard — Single enemy card in the battle scene.
 * Shows name, icon, HP bar, and targeting state.
 */

import { ItemIcon } from '../../utils/itemIcons';
import type { SpawnedEnemy } from '../../store/useCombatZoneStore';

interface EnemyBattleCardProps {
  enemy: SpawnedEnemy;
  isTarget: boolean;
}

export function EnemyBattleCard({ enemy, isTarget }: EnemyBattleCardProps) {
  const isDead = enemy.currentHp <= 0;
  const hpPct = enemy.maxHp > 0 ? Math.max(0, Math.min(100, (enemy.currentHp / enemy.maxHp) * 100)) : 0;

  return (
    <div
      className={`combat-card ${isTarget ? 'combat-card--targeted' : ''} ${isDead ? 'combat-card--dead' : ''}`}
      style={{ width: 100 }}
    >
      <div className="text-[11px] font-bold truncate" style={{
        color: isDead ? 'var(--color-text-muted)' : 'var(--color-danger)',
      }}>
        {enemy.name}
      </div>
      <div className="my-1">
        <ItemIcon itemId={enemy.enemyId} itemType="monster" size={48} fallbackLabel="?" fallbackColor="#e74c3c" />
      </div>

      {/* HP bar */}
      <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3 }}>
        <div style={{
          width: `${hpPct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s ease',
          backgroundColor: hpPct > 50 ? '#ef4444' : hpPct > 25 ? '#f59e0b' : '#22c55e',
        }} />
      </div>
      <div className="text-[10px] font-bold font-data" style={{
        color: isDead ? 'var(--color-text-muted)' : '#ef4444',
      }}>
        {isDead ? 'SLAIN' : `${Math.round(enemy.currentHp)}/${enemy.maxHp}`}
      </div>

      {/* Status */}
      <div className="text-[9px] mt-1.5 py-0.5 rounded" style={{
        backgroundColor: isDead ? 'transparent' : isTarget ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.06)',
        color: isDead ? 'var(--color-text-muted)' : 'var(--color-danger)',
        border: isDead ? 'none' : isTarget ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(239,68,68,0.1)',
      }}>
        {isDead ? 'Defeated' : isTarget ? 'Targeted' : 'Waiting'}
      </div>

      <div className="text-[10px] font-bold font-data mt-0.5" style={{
        color: isDead ? 'var(--color-text-muted)' : '#ef4444',
      }}>
        {enemy.damage} ATK
      </div>
    </div>
  );
}
