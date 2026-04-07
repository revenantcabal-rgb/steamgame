import { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { SkillDetail } from './components/skills/SkillDetail';
import { HeroPanel } from './components/heroes/HeroPanel';
import { CombatZonePanel } from './components/combat/CombatZonePanel';
import { MarketplacePanel } from './components/marketplace/MarketplacePanel';
import { ResourcePanel } from './components/layout/ResourcePanel';
import { GameLog } from './components/layout/GameLog';
import { useGameTick } from './hooks/useGameTick';

// ──────────────────────────────────────────────
// Top-level menu tabs (non-sidebar panels)
// ──────────────────────────────────────────────
type TopTab = 'heroes' | 'marketplace' | 'pvp' | 'guild' | 'settings';

/** The center panel can show sidebar-driven views OR a top tab */
type ActiveView = 'skill' | 'combat' | TopTab;

const TOP_TABS: { id: TopTab; label: string }[] = [
  { id: 'heroes', label: 'Heroes' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'pvp', label: 'PVP Zone' },
  { id: 'guild', label: 'Guild' },
  { id: 'settings', label: 'Settings' },
];

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
function App() {
  useGameTick();

  const [activeView, setActiveView] = useState<ActiveView>('skill');
  const [activeCombatZoneId, setActiveCombatZoneId] = useState<string | null>(null);

  // Sidebar: skill clicked → show SkillDetail
  const handleSelectSkill = () => {
    setActiveView('skill');
    setActiveCombatZoneId(null);
  };

  // Sidebar: combat zone clicked → show CombatZonePanel with that zone pre-selected
  const handleSelectCombatZone = (zoneId: string) => {
    setActiveView('combat');
    setActiveCombatZoneId(zoneId);
  };

  // Top tab clicked → switch to that panel
  const handleTabClick = (tab: TopTab) => {
    setActiveView(tab);
    setActiveCombatZoneId(null);
  };

  // Is a top tab currently active? (for highlighting)
  const activeTopTab: TopTab | null =
    (['heroes', 'marketplace', 'pvp', 'guild', 'settings'] as TopTab[]).includes(activeView as TopTab)
      ? (activeView as TopTab)
      : null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Sidebar (Gathering / Production / Combat Zones) */}
      <Sidebar
        onSelectSkill={handleSelectSkill}
        onSelectCombatZone={handleSelectCombatZone}
        activeCombatZoneId={activeCombatZoneId}
      />

      {/* Center: Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Tab Bar */}
        <div
          className="flex shrink-0"
          style={{
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
        >
          {TOP_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="px-6 py-3 text-sm font-bold cursor-pointer transition-all"
              style={{
                backgroundColor: activeTopTab === tab.id ? 'var(--color-bg-primary)' : 'transparent',
                color: activeTopTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                border: 'none',
                borderBottomWidth: '2px',
                borderBottomStyle: 'solid',
                borderBottomColor: activeTopTab === tab.id ? 'var(--color-accent)' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Content */}
        {activeView === 'skill' && <SkillDetail />}
        {activeView === 'combat' && <CombatZonePanel initialZoneId={activeCombatZoneId} />}
        {activeView === 'heroes' && <HeroPanel />}
        {activeView === 'marketplace' && <MarketplacePanel />}
        {activeView === 'pvp' && (
          <PlaceholderPanel
            title="PVP Zone"
            description="Arena battles, ranked ladders, and hero-vs-hero combat. Coming soon."
          />
        )}
        {activeView === 'guild' && (
          <PlaceholderPanel
            title="Guild"
            description="Guild management, clan wars, territory control, and shared resources. Coming soon."
          />
        )}
        {activeView === 'settings' && (
          <PlaceholderPanel
            title="Settings"
            description="Audio, display, save/load, keybindings, and account management. Coming soon."
          />
        )}

        <GameLog />
      </div>

      {/* Right: Resource panel */}
      <ResourcePanel />
    </div>
  );
}

// ──────────────────────────────────────────────
// Placeholder for tabs not yet implemented
// ──────────────────────────────────────────────
function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {description}
        </p>
        <div
          className="text-xs px-4 py-2 rounded inline-block"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
          }}
        >
          COMING SOON
        </div>
      </div>
    </div>
  );
}

export default App;
