/**
 * HubLocation — A clickable location in the encampment hub.
 *
 * Supports two visual weights:
 * - "primary" (default): Larger card with art icon, description, and status.
 * - "compact": Smaller inline row for secondary/operations locations.
 *
 * Uses LocationIcon for art-slot rendering: real asset if available,
 * styled glyph fallback otherwise.
 */

import { LocationIcon } from './LocationIcon';
import type { ItemIconType } from '../../utils/itemIcons';

interface HubLocationProps {
  id: string;
  label: string;
  /** Fallback glyph (emoji/symbol) */
  icon: string;
  /** Asset ID for real art lookup (e.g., building ID) */
  assetId?: string;
  /** Asset type for path resolution */
  assetType?: ItemIconType;
  description: string;
  flavor?: string;
  status?: string;
  alert?: boolean;
  tint?: string;
  variant?: 'primary' | 'compact';
  locked?: boolean;
  onClick: () => void;
}

export function HubLocation({
  label,
  icon,
  assetId,
  assetType,
  description,
  flavor,
  status,
  alert,
  tint,
  variant = 'primary',
  locked,
  onClick,
}: HubLocationProps) {
  const accentColor = tint || 'rgba(212, 168, 67, 0.5)';
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <button
        onClick={locked ? undefined : onClick}
        className="group relative flex items-center gap-2.5 px-3 py-2 rounded transition-all cursor-pointer"
        style={{
          backgroundColor: locked ? 'rgba(22, 19, 15, 0.3)' : 'rgba(22, 19, 15, 0.5)',
          border: '1px solid rgba(62, 54, 40, 0.2)',
          borderLeft: `3px solid ${locked ? 'rgba(62, 54, 40, 0.15)' : accentColor}`,
          opacity: locked ? 0.45 : 1,
          cursor: locked ? 'not-allowed' : 'pointer',
        }}
        title={locked ? `${label} — Coming Soon` : description}
      >
        <LocationIcon assetId={assetId} assetType={assetType} glyph={icon} tint={accentColor} size={24} locked={locked} />
        <span
          className="text-[11px] font-semibold"
          style={{ color: locked ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}
        >
          {label}
        </span>
        {locked && (
          <span className="text-[9px] uppercase tracking-wider ml-auto" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
            locked
          </span>
        )}
        {status && !locked && (
          <span className="text-[10px] ml-auto font-data" style={{ color: 'var(--color-text-muted)' }}>{status}</span>
        )}
      </button>
    );
  }

  // Primary variant
  return (
    <button
      onClick={locked ? undefined : onClick}
      className="group relative flex flex-col p-3 rounded-lg text-left transition-all cursor-pointer hub-location"
      style={{
        backgroundColor: locked ? 'rgba(22, 19, 15, 0.3)' : 'rgba(22, 19, 15, 0.65)',
        border: '1px solid rgba(62, 54, 40, 0.25)',
        borderLeft: `3px solid ${locked ? 'rgba(62, 54, 40, 0.15)' : accentColor}`,
        opacity: locked ? 0.45 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
      }}
      title={locked ? `${label} — Coming Soon` : description}
    >
      {/* Alert signal */}
      {alert && !locked && (
        <span
          className="absolute top-2 right-2 w-2 h-2 rounded-full"
          style={{
            backgroundColor: tint || 'var(--color-danger)',
            boxShadow: `0 0 8px ${tint || 'var(--color-danger)'}`,
            animation: 'hub-signal 2s ease-in-out infinite',
          }}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Art icon */}
        <LocationIcon assetId={assetId} assetType={assetType} glyph={icon} tint={accentColor} size={40} locked={locked} />

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold tracking-wide" style={{ color: locked ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
            {label}
          </div>
          {flavor && !locked && (
            <div className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--color-text-muted)' }}>{flavor}</div>
          )}
          {status && !locked && (
            <div className="text-[10px] mt-1 font-data font-semibold" style={{ color: tint || 'var(--color-text-secondary)' }}>{status}</div>
          )}
        </div>
      </div>

      {locked && (
        <div className="text-[9px] uppercase font-bold tracking-widest mt-2" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
          Sealed — future update
        </div>
      )}
    </button>
  );
}
