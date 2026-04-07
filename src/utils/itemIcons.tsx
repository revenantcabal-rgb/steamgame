import type { GearSlotCategory } from '../types/equipment';

/** Map class IDs to available hero PNG filenames where names don't match */
const HERO_ICON_MAP: Record<string, string> = {
  warden: 'vanguard',
  trapper: 'scout',
  bombardier: 'mad_bomber',
  deadeye: 'sniper',
  demolisher: 'demolitionist',
  scavenger: 'gladiator',
  ranger: 'gunslinger',
  prospector: 'war_engineer',
  artificer: 'pyromaniac',
};

/**
 * Returns the icon path for a given item.
 * itemType: 'weapon' | 'armor' | 'accessory' | 'resource' | 'consumable' | 'tool' | 'hero'
 * gearSlot: for equipment, the GearSlotCategory to determine the correct asset folder
 */
export function getItemIconPath(
  itemId: string,
  itemType: 'weapon' | 'armor' | 'accessory' | 'resource' | 'consumable' | 'tool' | 'hero' | 'equipment',
  gearSlot?: GearSlotCategory
): string {
  // If itemType is 'equipment', use gearSlot to determine the folder
  if (itemType === 'equipment' && gearSlot) {
    if (gearSlot === 'weapon') return `/assets/weapons/${itemId}.png`;
    if (gearSlot === 'ring' || gearSlot === 'earring' || gearSlot === 'necklace') {
      return `/assets/accessories/${itemId}.png`;
    }
    // armor, legs, gloves, boots, shield
    return `/assets/armor/${itemId}.png`;
  }

  switch (itemType) {
    case 'weapon':
      return `/assets/weapons/${itemId}.png`;
    case 'armor':
      return `/assets/armor/${itemId}.png`;
    case 'accessory':
      return `/assets/accessories/${itemId}.png`;
    case 'resource':
      return `/assets/resources/${itemId}.png`;
    case 'consumable':
      return `/assets/consumables/${itemId}.png`;
    case 'tool':
      return `/assets/tools/${itemId}.png`;
    case 'hero':
      return `/assets/heroes/${HERO_ICON_MAP[itemId] || itemId}.png`;
    default:
      return `/assets/resources/${itemId}.png`;
  }
}

/** Resolve itemType from a GearSlotCategory for icon lookup */
export function getIconTypeFromSlot(slot: GearSlotCategory): 'weapon' | 'armor' | 'accessory' {
  if (slot === 'weapon') return 'weapon';
  if (slot === 'ring' || slot === 'earring' || slot === 'necklace') return 'accessory';
  return 'armor';
}

interface ItemIconProps {
  itemId: string;
  itemType: 'weapon' | 'armor' | 'accessory' | 'resource' | 'consumable' | 'tool' | 'hero' | 'equipment';
  gearSlot?: GearSlotCategory;
  size?: number;
  fallbackColor?: string;
  fallbackLabel?: string;
  style?: React.CSSProperties;
}

export function ItemIcon({
  itemId,
  itemType,
  gearSlot,
  size = 24,
  fallbackColor = '#4a5568',
  fallbackLabel,
  style,
}: ItemIconProps) {
  const iconPath = getItemIconPath(itemId, itemType, gearSlot);
  const letter = fallbackLabel || itemId.charAt(0).toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        overflow: 'hidden',
        ...style,
      }}
    >
      <img
        src={iconPath}
        alt={itemId}
        width={size}
        height={size}
        style={{ display: 'block', imageRendering: 'pixelated' }}
        onError={(e) => {
          // On error, hide the img and show fallback
          const target = e.currentTarget;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div
        style={{
          display: 'none',
          position: 'absolute',
          inset: 0,
          backgroundColor: fallbackColor,
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: Math.max(8, size * 0.5),
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}
      >
        {letter}
      </div>
    </div>
  );
}
