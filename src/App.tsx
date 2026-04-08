import { useState, useMemo, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { NavBar } from './components/layout/NavBar';
import type { NavTarget } from './components/layout/NavBar';
import { SkillDetail } from './components/skills/SkillDetail';
import { CraftingPanel } from './components/equipment/CraftingPanel';
import { ProductionCraftingPanel } from './components/skills/ProductionCraftingPanel';
import { GatheringPanel } from './components/skills/GatheringPanel';
import { HeroPanel } from './components/heroes/HeroPanel';
import { CombatZonePanel } from './components/combat/CombatZonePanel';
import { MarketplacePanel } from './components/marketplace/MarketplacePanel';
import { InventoryPanel } from './components/inventory/InventoryPanel';
import { BottomPanel } from './components/layout/BottomPanel';
import { ExpeditionPanel } from './components/expedition/ExpeditionPanel';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { StoryPanel } from './components/story/StoryPanel';
import { StarlightPanel } from './components/starlight/StarlightPanel';
import { LootTracker } from './components/loot/LootTracker';
import { ShopPanel } from './components/shop/ShopPanel';
import { PopulationPanel } from './components/population/PopulationPanel';
import { EncampmentPanel } from './components/encampment/EncampmentPanel';
import { EncampmentHub } from './components/hub/EncampmentHub';
import { ScanTowerPanel } from './components/hub/ScanTowerPanel';
import { WorkshopPanel } from './components/skills/WorkshopPanel';
import type { HubTarget } from './components/hub/EncampmentHub';
import { useGameTick } from './hooks/useGameTick';
import { NavigationContext } from './utils/NavigationContext';
import { useGameStore } from './store/useGameStore';

// ──────────────────────────────────────────────
// Active view — hub is the default home
// ──────────────────────────────────────────────
type ActiveView =
  | 'hub'
  | 'skill'
  | 'combat'
  | 'scan'
  | 'workshop'
  | 'encampment'
  | 'story'
  | 'heroes'
  | 'population'
  | 'tradepost'
  | 'expedition'
  | 'starlight'
  | 'loot'
  | 'shop'
  | 'pvp'
  | 'guild'
  | 'inventory'
  | 'settings';

// ──────────────────────────────────────────────
// App
// ──────────────────────────────────────────────
function App() {
  useGameTick();

  // Hub is the default view — the emotional home screen
  const [activeView, setActiveView] = useState<ActiveView>('hub');
  const [activeCombatZoneId, setActiveCombatZoneId] = useState<string | null>(null);
  // Sidebar starts collapsed — hub is the primary home, sidebar is for power users
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // ── Navigation handlers ──

  /** Unified navigation from NavBar */
  const handleNavBarNavigate = useCallback((target: NavTarget) => {
    setActiveView(target as ActiveView);
    if (target !== 'combat') setActiveCombatZoneId(null);
  }, []);

  /** Navigation from hub locations */
  const handleHubNavigate = useCallback((target: HubTarget, extra?: string) => {
    if (target === 'combat' && extra) {
      setActiveView('combat');
      setActiveCombatZoneId(extra);
    } else {
      setActiveView(target as ActiveView);
      setActiveCombatZoneId(null);
    }
  }, []);

  /** Sidebar: skill clicked */
  const handleSelectSkill = useCallback(() => {
    setActiveView('skill');
    setActiveCombatZoneId(null);
  }, []);

  /** Sidebar: combat zone clicked */
  const handleSelectCombatZone = useCallback((zoneId: string) => {
    setActiveView('combat');
    setActiveCombatZoneId(zoneId);
  }, []);

  // Navigation context for deep components
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
          onNavigateToStory={() => { setActiveView('story'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
          onNavigateToHub={() => { setActiveView('hub'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
        />
      </div>

      {/* Center: Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Compact Nav Bar */}
        <NavBar
          activeView={activeView}
          onNavigate={handleNavBarNavigate}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* View Content */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          {activeView === 'hub' && (
            <EncampmentHub onNavigate={handleHubNavigate} />
          )}
          {activeView === 'scan' && (
            <ScanTowerPanel
              onNavigateToCombat={(zoneId) => { setActiveView('combat'); setActiveCombatZoneId(zoneId); }}
              onNavigateToExpedition={() => setActiveView('expedition')}
            />
          )}
          {activeView === 'workshop' && (
            <WorkshopPanel onSelectSkill={(skillId) => {
              useGameStore.getState().setActiveSkill(skillId);
              setActiveView('skill');
            }} />
          )}
          {activeView === 'encampment' && <EncampmentPanel />}
          {activeView === 'story' && <StoryPanel />}
          {activeView === 'skill' && <SkillOrCraftRouter />}
          {activeView === 'combat' && <CombatZonePanel initialZoneId={activeCombatZoneId} />}
          {activeView === 'heroes' && <HeroPanel />}
          {activeView === 'population' && <PopulationPanel />}
          {activeView === 'tradepost' && <MarketplacePanel />}
          {activeView === 'expedition' && <ExpeditionPanel />}
          {activeView === 'starlight' && <StarlightPanel />}
          {activeView === 'inventory' && <InventoryPanel />}
          {activeView === 'loot' && <LootTracker />}
          {activeView === 'shop' && <ShopPanel />}
          {activeView === 'pvp' && (
            <PlaceholderPanel
              title="PVP Arena"
              description="Hero-vs-hero combat and ranked ladders. Coming in a future update."
            />
          )}
          {activeView === 'guild' && (
            <PlaceholderPanel
              title="Faction HQ"
              description="Faction operations, territory control, and shared resources. Coming in a future update."
            />
          )}
          {activeView === 'settings' && <SettingsPanel />}
        </div>

      </div>

      {/* Floating log/radio overlay — no longer in layout flow */}
      <BottomPanel />
    </div>
    </NavigationContext.Provider>
  );
}

// ──────────────────────────────────────────────
// Skill/Craft Router
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
// Placeholder for future systems (honest labeling)
// ──────────────────────────────────────────────
function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {title}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
          {description}
        </p>
        <div
          className="text-[11px] px-4 py-2 rounded inline-block uppercase tracking-wider font-bold"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}
        >
          Future Update
        </div>
      </div>
    </div>
  );
}

export default App;
