/**
 * HeroBattleCard — Hero card in the battle scene.
 * v3: Added level + class label, thicker HP/SP bars, low-HP pulse.
 */

import { CLASSES } from '../../config/classes';
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
  onRecall?: () => void;
}

export function HeroBattleCard({ stats, onRecall }: HeroBattleCardProps) {
  const { hero, dps, maxHp, currentHp, maxSp, currentSp, justAttacked, colorIndex, isRecovering, recoverySecs } = stats;
  const heroColor = HERO_COLORS[colorIndex] || HERO_COLORS[0];
  const hpPct = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;
  const spPct = maxSp > 0 ? Math.max(0, Math.min(100, (currentSp / maxSp) * 100)) : 0;
  const cls = CLASSES[hero.classId];
  const isLowHp = hpPct > 0 && hpPct <= 25;

  if (isRecovering) {
    return (
      <div className="combat-card" style={{ width: 130, opacity: 0.4 }}>
        <div className="text-[11px] font-bold truncate" style={{ color: 'var(--color-danger)' }}>{hero.name}</div>
        <div className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Lv.{hero.level} {cls?.name || ''}</div>
        <div className="my-1"><ItemIcon itemId={hero.classId} itemType="hero" size={52} fallbackLabel={hero.name.charAt(0)} /></div>
        <div className="text-[9px] mt-1 font-bold" style={{ color: 'var(--color-danger)' }}>
          Recovering {Math.floor(recoverySecs / 60)}m {recoverySecs % 60}s
        </div>
      </div>
    );
  }

  return (
    <div
      className={`combat-card ${isLowHp ? 'combat-card--low-hp' : ''}`}
      style={{
        width: 130,
        borderColor: justAttacked ? heroColor : undefined,
        boxShadow: justAttacked ? `0 0 10px ${heroColor}50` : undefined,
      }}
    >
      {/* Name + recall */}
      <div className="flex items-center justify-between w-full">
        <div className="text-[11px] font-bold truncate" style={{ color: heroColor }}>{hero.name}</div>
        {onRecall && (
          <button
            onClick={(e) => { e.stopPropagation(); onRecall(); }}
            className="cursor-pointer"
            style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', fontSize: 10, lineHeight: 1, padding: '0 2px', flexShrink: 0, opacity: 0.5 }}
            title="Recall hero"
          >
            {"\u2715"}
          </button>
        )}
      </div>

      {/* Level + class */}
      <div className="text-[9px] truncate" style={{ color: 'var(--color-text-muted)' }}>
        Lv.{hero.level} {cls?.name || ''}
      </div>

      {/* Portrait */}
      <div className="my-1"><ItemIcon itemId={hero.classId} itemType="hero" size={52} fallbackLabel={hero.name.charAt(0)} /></div>

      {/* HP bar */}
      <div style={{ width: '100%', height: 7, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${hpPct}%`, height: '100%', borderRadius: 3,
          transition: 'width 0.4s ease',
          backgroundColor: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444',
        }} />
      </div>
      <div className="text-[10px] font-bold font-data" style={{ color: hpPct > 50 ? '#22c55e' : hpPct > 25 ? '#f59e0b' : '#ef4444' }}>
        {Math.round(currentHp)}/{maxHp}
      </div>

      {/* SP bar */}
      <div style={{ width: '100%', height: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 3, marginTop: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${spPct}%`, height: '100%', borderRadius: 3,
          transition: 'width 0.4s ease',
          backgroundColor: '#3b82f6',
        }} />
      </div>
      <div className="text-[9px] font-data" style={{ color: '#3b82f6' }}>{Math.round(currentSp)}/{maxSp}</div>

      {/* DPS + attack state */}
      <div className="flex items-center justify-between w-full mt-1">
        <div className="text-[9px] py-0.5 px-1.5 rounded" style={{
          backgroundColor: justAttacked ? `${heroColor}25` : 'rgba(255,255,255,0.04)',
          color: justAttacked ? heroColor : 'var(--color-text-muted)',
          border: justAttacked ? `1px solid ${heroColor}50` : '1px solid transparent',
          fontWeight: justAttacked ? 700 : 400,
        }}>
          {justAttacked ? 'Strike!' : 'Ready'}
        </div>
        <div className="text-[10px] font-bold font-data" style={{ color: heroColor }}>{dps} DPS</div>
      </div>
    </div>
  );
}
