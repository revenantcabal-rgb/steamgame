/**
 * NavBar — Compact utility navigation bar.
 *
 * Trimmed to essential destinations only. The hub and sidebar
 * provide full access to all systems — the NavBar is for fast
 * switching between the most-used panels during active play.
 *
 * Items removed vs original: Buildings (use hub → Operations),
 * Workers (use hub → Barracks), Loot (use hub → Loot Ledger).
 * These are still accessible from the hub and sidebar.
 */

import { GAME_NAME } from '../../config/branding';
import { useStoryStore } from '../../store/useStoryStore';

export type NavTarget =
  | 'hub'
  | 'story'
  | 'heroes'
  | 'encampment'
  | 'workshop'
  | 'population'
  | 'marketplace'
  | 'expedition'
  | 'starlight'
  | 'loot'
  | 'settings'
  | 'shop'
  | 'scan'
  | 'skill'
  | 'combat'
  | 'guild'
  | 'pvp';

interface NavItem {
  id: NavTarget;
  label: string;
  icon: string;
  featureKey: string | null;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hub',        label: 'Hub',        icon: '\uD83C\uDFE0', featureKey: null },
  { id: 'story',      label: 'Directives', icon: '\uD83D\uDCDC', featureKey: null },
  { id: 'heroes',     label: 'Heroes',     icon: '\u2694\uFE0F', featureKey: null },
  { id: 'workshop',   label: 'Workshop',   icon: '\u2692\uFE0F', featureKey: null },
  { id: 'scan',       label: 'Scan',       icon: '\uD83D\uDCE1', featureKey: null },
  { id: 'marketplace',label: 'Market',     icon: '\uD83C\uDFEA', featureKey: 'marketplace' },
  { id: 'expedition', label: 'Expedition', icon: '\uD83C\uDFF0', featureKey: 'expedition' },
  { id: 'settings',   label: 'Settings',   icon: '\u2699\uFE0F', featureKey: null },
];

interface NavBarProps {
  activeView: string;
  onNavigate: (target: NavTarget) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function NavBar({ activeView, onNavigate, sidebarOpen, onToggleSidebar }: NavBarProps) {
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);
  // Subscribe to unlockedFeatures so nav re-renders when features unlock
  useStoryStore(s => s.unlockedFeatures);

  const visibleItems = NAV_ITEMS.filter(item => {
    if (!item.featureKey) return true;
    return isFeatureUnlocked(item.featureKey);
  });

  return (
    <div
      className="flex items-center shrink-0 overflow-x-auto"
      style={{
        borderBottom: '1px solid rgba(62, 54, 40, 0.25)',
        background: 'linear-gradient(180deg, #13110d 0%, #0e0c09 100%)',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.4)',
        scrollbarWidth: 'none',
        height: '34px',
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="px-2.5 h-full text-xs font-bold cursor-pointer shrink-0"
        style={{
          backgroundColor: 'transparent',
          color: sidebarOpen ? 'var(--color-accent)' : 'var(--color-text-muted)',
          border: 'none',
          borderRight: '1px solid rgba(62, 54, 40, 0.2)',
        }}
        title={sidebarOpen ? 'Hide skills panel' : 'Show skills panel'}
      >
        {sidebarOpen ? '\u25C0' : '\u25B6'}
      </button>

      {/* Nav items — game name is now inline as the hub button */}
      {visibleItems.map(item => {
        const isActive = activeView === item.id;
        const isHub = item.id === 'hub';
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="px-2 lg:px-3 h-full text-[11px] font-semibold cursor-pointer shrink-0 whitespace-nowrap flex items-center gap-1"
            style={{
              backgroundColor: isActive ? 'rgba(212, 168, 67, 0.06)' : 'transparent',
              color: isHub
                ? 'var(--color-accent)'
                : isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: isActive ? 'var(--color-accent)' : 'transparent',
              fontWeight: isHub ? 800 : 600,
              letterSpacing: isHub ? '0.1em' : undefined,
              borderRight: isHub ? '1px solid rgba(62, 54, 40, 0.15)' : undefined,
            }}
            title={isHub ? 'Return to Hub' : item.label}
          >
            <span className="text-[10px]">{item.icon}</span>
            <span>{isHub ? GAME_NAME : item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
