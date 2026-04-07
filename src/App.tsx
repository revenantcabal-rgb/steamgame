import { useState, useMemo, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { SkillDetail } from './components/skills/SkillDetail';
import { CraftingPanel } from './components/equipment/CraftingPanel';
import { ProductionCraftingPanel } from './components/skills/ProductionCraftingPanel';
import { GatheringPanel } from './components/skills/GatheringPanel';
import { HeroPanel } from './components/heroes/HeroPanel';
import { CombatZonePanel } from './components/combat/CombatZonePanel';
import { MarketplacePanel } from './components/marketplace/MarketplacePanel';
import { ResourcePanel } from './components/layout/ResourcePanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { ExpeditionPanel } from './components/expedition/ExpeditionPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { StoryPanel } from './components/story/StoryPanel';
import { StarlightPanel } from './components/starlight/StarlightPanel';
import { LootTracker } from './components/loot/LootTracker';
import { ShopPanel } from './components/shop/ShopPanel';
import { PopulationPanel } from './components/population/PopulationPanel';
import { EncampmentPanel } from './components/encampment/EncampmentPanel';
import { useGameTick } from './hooks/useGameTick';
import { NavigationContext } from './utils/NavigationContext';
import { useGameStore } from './store/useGameStore';
import { useStoryStore } from './store/useStoryStore';

// ──────────────────────────────────────────────
// Top-level menu tabs (non-sidebar panels)
// ──────────────────────────────────────────────
type TopTab = 'encampment' | 'story' | 'heroes' | 'population' | 'marketplace' | 'expedition' | 'starlight' | 'loot' | 'shop' | 'pvp' | 'guild' | 'settings';

/** The center panel can show sidebar-driven views OR a top tab */
type ActiveView = 'skill' | 'combat' | TopTab;

/** Feature key required for each tab (null = always visible) */
const ALL_TOP_TABS: { id: TopTab; label: string; featureKey: string | null }[] = [
  { id: 'encampment', label: 'Encampment', featureKey: null },
  { id: 'population', label: 'Population', featureKey: null },
  { id: 'story', label: 'Story', featureKey: null },
  { id: 'heroes', label: 'Heroes', featureKey: null },
  { id: 'marketplace', label: 'Marketplace', featureKey: 'marketplace' },
  { id: 'expedition', label: 'Expedition', featureKey: 'expedition' },
  { id: 'starlight', label: 'Starlight', featureKey: 'starlight' },
  { id: 'guild', label: 'Guild', featureKey: 'guild' },
  { id: 'pvp', label: 'PVP Zone', featureKey: 'pvp' },
  { id: 'settings', label: 'Settings', featureKey: null },
];

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
function App() {
  useGameTick();

  const [activeView, setActiveView] = useState<ActiveView>('story');
  const [activeCombatZoneId, setActiveCombatZoneId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);
  const unlockedFeatures = useStoryStore(s => s.unlockedFeatures);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

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
    (['story', 'heroes', 'population', 'marketplace', 'expedition', 'starlight', 'loot', 'shop', 'pvp', 'guild', 'settings'] as TopTab[]).includes(activeView as TopTab)
      ? (activeView as TopTab)
      : null;

  return (
    <NavigationContext.Provider value={navigationActions}>
    <div className="flex flex-1 w-full h-screen h-dvh overflow-hidden relative" style={{ backgroundColor: '#0c0a08' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Left: Sidebar (Gathering / Production / Combat Zones) */}
      <div className={`
        fixed lg:relative z-40 lg:z-auto
        transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarOpen ? '' : 'lg:hidden'}
      `}>
        <Sidebar
          onSelectSkill={() => { handleSelectSkill(); if (window.innerWidth < 1024) setSidebarOpen(false); }}
          onSelectCombatZone={(zoneId) => { handleSelectCombatZone(zoneId); if (window.innerWidth < 1024) setSidebarOpen(false); }}
          activeCombatZoneId={activeCombatZoneId}
          onNavigateToStory={() => { handleTabClick('story'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
        />
      </div>

      {/* Center: Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Top Tab Bar */}
        <div
          className="flex shrink-0 overflow-x-auto"
          style={{
            borderBottom: '1px solid rgba(62, 54, 40, 0.3)',
            background: 'linear-gradient(180deg, #16130f 0%, #100e0a 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            scrollbarWidth: 'none',
          }}
        >
          {/* Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="px-3 py-3 md:py-2.5 text-sm font-bold cursor-pointer shrink-0"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              border: 'none',
              borderRight: '1px solid var(--color-border)',
            }}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? '\u25C0' : '\u25B6'}
          </button>
          {TOP_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="px-2 md:px-3 lg:px-4 xl:px-6 py-2.5 xl:py-3 text-xs md:text-xs lg:text-sm font-semibold cursor-pointer transition-all shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: activeTopTab === tab.id ? 'rgba(212, 168, 67, 0.06)' : 'transparent',
                color: activeTopTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                border: 'none',
                borderBottomWidth: '2px',
                borderBottomStyle: 'solid',
                borderBottomColor: activeTopTab === tab.id ? 'var(--color-accent)' : 'transparent',
                boxShadow: activeTopTab === tab.id ? '0 2px 6px rgba(212, 168, 67, 0.15)' : 'none',
                letterSpacing: '0.02em',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Content — bounded so child panels can scroll */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {activeView === 'encampment' && <EncampmentPanel />}
          {activeView === 'story' && <StoryPanel />}
          {activeView === 'skill' && <SkillOrCraftRouter />}
          {activeView === 'combat' && <CombatZonePanel initialZoneId={activeCombatZoneId} />}
          {activeView === 'heroes' && <HeroPanel />}
          {activeView === 'population' && <PopulationPanel />}
          {activeView === 'marketplace' && <MarketplacePanel />}
          {activeView === 'expedition' && <ExpeditionPanel />}
          {activeView === 'starlight' && <StarlightPanel />}
          {activeView === 'loot' && <LootTracker />}
          {activeView === 'shop' && <ShopPanel />}
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
        </div>

        <BottomPanel />
      </div>

      {/* Right: Resource panel — hidden on small screens, togglable */}
      <div className="hidden xl:block">
        <ResourcePanel />
      </div>
    </div>
    </NavigationContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Skill/Craft Router — reactively subscribes to activeSkillId
// ──────────────────────────────────────────────
function SkillOrCraftRouter() {
  const activeSkillId = useGameStore(s => s.activeSkillId);
  const isGearCraft = activeSkillId === 'weaponsmithing' || activeSkillId === 'armorcrafting';
  const isProductionCraft = activeSkillId === 'cooking' || activeSkillId === 'tinkering' || activeSkillId === 'biochemistry';
  const isGathering = activeSkillId === 'scavenging' || activeSkillId === 'foraging' || activeSkillId === 'salvage_hunting' || activeSkillId === 'water_reclamation' || activeSkillId === 'prospecting';
  if (isGearCraft) return <CraftingPanel />;
  if (isProductionCraft) return <ProductionCraftingPanel />;
  if (isGathering) return <GatheringPanel />;
  return <SkillDetail />;
}

// ──────────────────────────────────────────────
// Placeholder for tabs not yet implemented
// ──────────────────────────────────────────────
function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="text-4xl mb-4" style={{ opacity: 0.3 }}>&#128679;</div>
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
          IN DEVELOPMENT
        </div>
      </div>
    </div>
  );
}

export default App;
