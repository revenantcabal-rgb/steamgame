import { useState, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { SkillDetail } from './components/skills/SkillDetail';
import { HeroPanel } from './components/heroes/HeroPanel';
import { CombatZonePanel } from './components/combat/CombatZonePanel';
import { MarketplacePanel } from './components/marketplace/MarketplacePanel';
import { ResourcePanel } from './components/layout/ResourcePanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { ExpeditionPanel } from './components/expedition/ExpeditionPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { StoryPanel } from './components/story/StoryPanel';
import { StarlightPanel } from './components/starlight/StarlightPanel';
import { useGameTick } from './hooks/useGameTick';
import { NavigationContext } from './utils/NavigationContext';
import { useGameStore } from './store/useGameStore';
import { useStoryStore } from './store/useStoryStore';

// ──────────────────────────────────────────────
// Top-level menu tabs (non-sidebar panels)
// ──────────────────────────────────────────────
type TopTab = 'story' | 'heroes' | 'marketplace' | 'expedition' | 'starlight' | 'pvp' | 'guild' | 'settings';

/** The center panel can show sidebar-driven views OR a top tab */
type ActiveView = 'skill' | 'combat' | TopTab;

/** Feature key required for each tab (null = always visible) */
const ALL_TOP_TABS: { id: TopTab; label: string; featureKey: string | null }[] = [
  { id: 'story', label: 'Story', featureKey: null },
  { id: 'heroes', label: 'Heroes', featureKey: null },
  { id: 'marketplace', label: 'Marketplace', featureKey: 'marketplace' },
  { id: 'expedition', label: 'Expedition', featureKey: null },
  { id: 'starlight', label: 'Starlight', featureKey: null },
  { id: 'pvp', label: 'PVP Zone', featureKey: 'pvp' },
  { id: 'guild', label: 'Guild', featureKey: 'guild' },
  { id: 'settings', label: 'Settings', featureKey: null },
];

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
function App() {
  useGameTick();

  const [activeView, setActiveView] = useState<ActiveView>('story');
  const [activeCombatZoneId, setActiveCombatZoneId] = useState<string | null>(null);
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);
  const unlockedFeatures = useStoryStore(s => s.unlockedFeatures);

  // Filter tabs based on unlocked features
  const TOP_TABS = useMemo(() => {
    return ALL_TOP_TABS.filter(tab => {
      if (!tab.featureKey) return true;
      return isFeatureUnlocked(tab.featureKey);
    });
  }, [isFeatureUnlocked, unlockedFeatures]);

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

  // Navigation context for deep components (e.g. CraftingPanel resource links)
  const navigationActions = useMemo(() => ({
    navigateToSkill: (skillId: string) => {
      useGameStore.getState().setActiveSkill(skillId);
      setActiveView('skill');
      setActiveCombatZoneId(null);
    },
    navigateToCombatZone: (zoneId: string) => {
      setActiveView('combat');
      setActiveCombatZoneId(zoneId);
    },
  }), []);

  // Is a top tab currently active? (for highlighting)
  const activeTopTab: TopTab | null =
    (['story', 'heroes', 'marketplace', 'expedition', 'starlight', 'pvp', 'guild', 'settings'] as TopTab[]).includes(activeView as TopTab)
      ? (activeView as TopTab)
      : null;

  return (
    <NavigationContext.Provider value={navigationActions}>
    <div className="flex h-screen overflow-hidden">
      {/* Left: Sidebar (Gathering / Production / Combat Zones) */}
      <Sidebar
        onSelectSkill={handleSelectSkill}
        onSelectCombatZone={handleSelectCombatZone}
        activeCombatZoneId={activeCombatZoneId}
        onNavigateToStory={() => handleTabClick('story')}
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
              className="px-3 xl:px-6 py-2 xl:py-3 text-xs xl:text-sm font-bold cursor-pointer transition-all"
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
        {activeView === 'story' && <StoryPanel />}
        {activeView === 'skill' && <SkillDetail />}
        {activeView === 'combat' && <CombatZonePanel initialZoneId={activeCombatZoneId} />}
        {activeView === 'heroes' && <HeroPanel />}
        {activeView === 'marketplace' && <MarketplacePanel />}
        {activeView === 'expedition' && <ExpeditionPanel />}
        {activeView === 'starlight' && <StarlightPanel />}
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
        {activeView === 'settings' && <SettingsPanel />}

        <BottomPanel />
      </div>

      {/* Right: Resource panel */}
      <ResourcePanel />
    </div>
    </NavigationContext.Provider>
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
