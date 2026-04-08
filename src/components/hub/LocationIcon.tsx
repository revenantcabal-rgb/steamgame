/**
 * LocationIcon — Art-slot component for hub locations.
 *
 * Tries to load a real asset via ItemIcon path conventions.
 * Falls back to a styled glyph if no asset exists.
 *
 * Art slots:
 * - Buildings: /assets/buildings-128/{id}.png (all 20 exist)
 * - Heroes: /assets/heroes-128/{classId}.png (all 16 exist)
 * - Custom hub locations: /assets/hub-128/{id}.png (future)
 *
 * To add art for a hub location, drop a PNG into the appropriate
 * assets folder. The component picks it up automatically.
 */

import { getItemIconPath } from '../../utils/itemIcons';
import type { ItemIconType } from '../../utils/itemIcons';

interface LocationIconProps {
  /** Asset ID for icon lookup */
  assetId?: string;
  /** Asset type for path resolution */
  assetType?: ItemIconType;
  /** Fallback glyph if no asset or asset fails to load */
  glyph: string;
  /** Tint color for the fallback glyph background */
  tint?: string;
  /** Icon size */
  size?: number;
  /** Locked / greyed out */
  locked?: boolean;
}

export function LocationIcon({
  assetId,
  assetType,
  glyph,
  tint,
  size = 36,
  locked,
}: LocationIconProps) {
  const hasAsset = assetId && assetType;
  const iconPath = hasAsset ? getItemIconPath(assetId, assetType) : null;

  return (
    <div
      className="location-icon"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: 6,
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        filter: locked ? 'grayscale(1) brightness(0.5)' : 'none',
        backgroundColor: iconPath ? 'rgba(0,0,0,0.3)' : `${tint || 'rgba(212, 168, 67, 0.15)'}`,
        border: `1px solid ${locked ? 'rgba(62, 54, 40, 0.15)' : 'rgba(62, 54, 40, 0.3)'}`,
      }}
    >
      {iconPath ? (
        <>
          <img
            src={iconPath}
            alt={assetId}
            width={size}
            height={size}
            style={{ display: 'block', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fb = e.currentTarget.nextElementSibling as HTMLElement;
              if (fb) fb.style.display = 'flex';
            }}
          />
          <div
            style={{
              display: 'none',
              position: 'absolute',
              inset: 0,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size * 0.5,
              backgroundColor: `${tint || 'rgba(212, 168, 67, 0.15)'}`,
            }}
          >
            {glyph}
          </div>
        </>
      ) : (
        <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{glyph}</span>
      )}
    </div>
  );
}
