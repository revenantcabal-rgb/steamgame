/**
 * HeroBattleCard — Single hero card in the battle scene.
 * Shows name, icon, HP bar, SP bar, DPS, and attack state.
 */

import { ItemIcon } from '../../utils/itemIcons';
import type { Hero, DerivedStats } from '../../types/hero';

export const HERO_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'] as const;

export interface HeroBattleStats {
  hero: Hero;
  derived: DerivedStats;
  dps: number;
  maxHp: number;
  currentHp: number;
  maxSp: number;
  currentSp: number;
  justAttacked: boolean;
  colorIndex: number;
  isRecovering: boolean;
  recoverySecs: number;
}

interface HeroBattleCardProps {
  stats: HeroBattleStats;
}

export function HeroBattleCard({ stats }: HeroBattleCardProps) {
  const { hero, dps, maxHp, currentHp, maxSp, currentSp, justAttacked, colorIndex, isRecovering, recoverySecs } = stats;
  const heroColor = HERO_COLORS[colorIndex] || HERO_COLORS[0];
  const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;
  const spPct = maxSp > 0 ? Math.max(0, Math.min(100, (currentSp / maxSp) * 100)) : 0;

  if (isRecovering) {
    return (
      <div className="combat-card" style={{ width: 110, opacity: 0.5 }}>
        <div className="text-[11px] font-bold truncate" style={{ color: 'var(--color-danger)' }}>{hero.name}</div>
        <div className="my-1"><ItemIcon itemId={hero.classId} itemType="hero" size={48} fallbackLabel={hero.name.charAt(0)} /></div>
        <div className="text-[9px] mt-1" style={{ color: 'var(--color-danger)' }}>
          Recovering {Math.floor(recoverySecs / 60)}m {recoverySecs % 60}s
        </div>
      </div>
    );
  }

  return (
    <div className="combat-card" style={{
      width: 110,
      borderColor: justAttacked ? heroColor : undefined,
      boxShadow: justAttacked ? `0 0 8px ${heroColor}40` : undefined,
    }}>
      <div className="text-[11px] font-bold truncate" style={{ color: heroColor }}>{hero.name}</div>
      <div className="my-1"><ItemIcon itemId={hero.classId} itemType="hero" size={48} fallbackLabel={hero.name.charAt(0)} /></div>

      {/* HP bar */}
      <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3 }}>
        <div style={{
          width: `${hpPct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s ease',
          backgroundColor: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444',
        }} />
      </div>
      <div className="text-[10px] font-bold font-data" style={{ color: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444' }}>
        {Math.round(currentHp)}/{maxHp}
      </div>

      {/* SP bar */}
      <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, marginTop: 2 }}>
        <div style={{
          width: `${spPct}%`, height: '100%', borderRadius: 3, transition: 'width 0.4s ease',
          backgroundColor: '#3b82f6',
        }} />
      </div>
      <div className="text-[9px] font-data" style={{ color: '#3b82f6' }}>{Math.round(currentSp)}/{maxSp}</div>

      {/* Attack state */}
      <div className="text-[9px] mt-1.5 py-0.5 rounded" style={{
        backgroundColor: justAttacked ? `${heroColor}25` : 'rgba(255,255,255,0.04)',
        color: justAttacked ? heroColor : 'var(--color-text-muted)',
        border: justAttacked ? `1px solid ${heroColor}50` : '1px solid transparent',
        fontWeight: justAttacked ? 700 : 400,
      }}>
        {justAttacked ? 'Strike!' : 'Ready'}
      </div>

      {/* DPS */}
      <div className="text-[10px] font-bold font-data mt-0.5" style={{ color: heroColor }}>{dps} DPS</div>
    </div>
  );
}
