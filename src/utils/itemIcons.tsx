import type { GearSlotCategory } from '../types/equipment';

/** Map equipment IDs to PNG filenames where names don't match */
const EQUIPMENT_ICON_MAP: Record<string, string> = {
  rangers_hide: 'ranger_hide',
};

/** Map enemy IDs to monster PNG filenames where names don't match */
const MONSTER_ICON_MAP: Record<string, string> = {
  mosquito: 'mutated_mosquito',
  frog: 'mutated_frog',
  centipede: 'mutated_centipede',
  outskirts_mix: 'wasteland_vermin',
  feral_dog: 'feral_dog_pack',
  rad_rats: 'rad_rat_swarm',
  suburbs_mix: 'suburb_dweller',
  industrial_mix: 'factory_mutant',
  deadlands_mix: 'deadlands_dweller',
  experiment: 'escaped_experiment',
  military_mix: 'military_hazard',
  rad_elemental: 'radiation_elemental',
  abomination: 'mutant_abomination',
  core_mix: 'core_abomination',
  gz_mix: 'void_entity',
};

export type ItemIconType =
  | 'weapon' | 'armor' | 'accessory' | 'resource' | 'consumable'
  | 'tool' | 'hero' | 'equipment'
  | 'monster' | 'building' | 'skill' | 'ability' | 'avatar';

/**
 * Returns the icon path for a given item.
 * gearSlot: for equipment, the GearSlotCategory (kept for API compat but all equipment is in one folder now)
 */
export function getItemIconPath(
  itemId: string,
  itemType: ItemIconType,
  _gearSlot?: GearSlotCategory
): string {
  switch (itemType) {
    case 'equipment':
    case 'weapon':
    case 'armor':
    case 'accessory':
      return `/assets/equipment-128/${EQUIPMENT_ICON_MAP[itemId] || itemId}.png`;
    case 'resource':
      return `/assets/resources-128/${itemId}.png`;
    case 'consumable':
      return `/assets/consumables-128/${itemId}.png`;
    case 'tool':
      return `/assets/tools-128/${itemId}.png`;
    case 'hero':
      return `/assets/heroes-128/${itemId}.png`;
    case 'monster':
      return `/assets/monsters-128/${MONSTER_ICON_MAP[itemId] || itemId}.png`;
    case 'building':
      return `/assets/buildings-128/${itemId}.png`;
    case 'skill':
      return `/assets/skills-128/${itemId}.png`;
    case 'ability':
      return `/assets/abilities-128/${itemId}.png`;
    case 'avatar':
      return `/assets/avatars-128/${itemId}.png`;
    default:
      return `/assets/resources-128/${itemId}.png`;
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
  itemType: ItemIconType;
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
        style={{ display: 'block' }}
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
