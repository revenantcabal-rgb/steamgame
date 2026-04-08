/**
 * EncampmentHub — Command center and home screen of Dead City Directive.
 *
 * This is the emotional core of the game. After login, the player enters here.
 * It should feel like walking into a fortified encampment in a dead city —
 * not like opening a spreadsheet.
 *
 * Structure:
 * 1. Situation report banner (field-report-style status)
 * 2. Active directive card (story objective)
 * 3. Core locations (the main places you go)
 * 4. Intel & readiness briefing (heroes, deployments, supplies)
 * 5. Secondary/locked locations
 */

import { GAME_NAME } from '../../config/branding';
import { useGameStore } from '../../store/useGameStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useHeroStore } from '../../store/useHeroStore';
import { useEncampmentStore } from '../../store/useEncampmentStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { HubLocation } from './HubLocation';
import { ProgressBar } from '../common/ProgressBar';
import { ItemIcon } from '../../utils/itemIcons';
import { COMBAT_ZONE_LIST } from '../../config/combatZones';

export type HubTarget =
  | 'story'
  | 'encampment'
  | 'population'
  | 'heroes'
  | 'marketplace'
  | 'expedition'
  | 'combat'
  | 'scan'
  | 'workshop'
  | 'settings'
  | 'loot'
  | 'starlight'
  | 'guild'
  | 'pvp';

interface EncampmentHubProps {
  onNavigate: (target: HubTarget, extra?: string) => void;
}

export function EncampmentHub({ onNavigate }: EncampmentHubProps) {
  const currentObjective = useStoryStore(s => s.getCurrentObjective)();
  const heroes = useHeroStore(s => s.heroes);
  const buildings = useEncampmentStore(s => s.buildings);
  const deployments = useCombatZoneStore(s => s.deployments);
  const workers = usePopulationStore(s => s.workers);
  const availableWorkers = usePopulationStore(s => s.availableWorkers);
  const resources = useGameStore(s => s.resources);
  const idle = useGameStore(s => s.idle);
  const inventory = useEquipmentStore(s => s.inventory);
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);

  const builtCount = Object.keys(buildings).length;
  const heroCount = heroes.length;
  const deployedHeroCount = deployments.reduce((s, d) => s + d.heroIds.length, 0);
  const activeDeployments = deployments.length;
  const totalWorkers = workers.length;
  const aliveWorkers = workers.filter(w => !w.isRespawning).length;
  const gearCount = inventory.length;
  const idleHoursUsed = Math.floor(idle.idleSecondsUsedToday / 3600);
  const idleCapHours = Math.floor(idle.idleCapSeconds / 3600);
  const wc = resources['wasteland_currency'] || 0;

  // Threat assessment
  const threatLevel = activeDeployments > 2 ? 'HIGH' : activeDeployments > 0 ? 'ACTIVE' : 'CLEAR';
  const threatColor = threatLevel === 'HIGH' ? 'var(--color-danger)' : threatLevel === 'ACTIVE' ? 'var(--color-energy)' : 'var(--color-success)';

  return (
    <div className="flex-1 overflow-y-auto hub-scroll" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* ─── Scene backdrop ─── */}
      <div
        className="hub-scene-backdrop"
        style={{
          height: 80,
          backgroundImage: 'url(/assets/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(12, 10, 8, 0.3) 0%, rgba(12, 10, 8, 0.95) 80%, rgba(12, 10, 8, 1) 100%)',
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-4 space-y-4" style={{ marginTop: -32, position: 'relative', zIndex: 1 }}>

        {/* ════════════════════════════════════════════
            SITUATION REPORT
            ════════════════════════════════════════════ */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(22, 19, 15, 0.9) 0%, rgba(16, 14, 10, 0.95) 100%)',
            border: '1px solid rgba(62, 54, 40, 0.3)',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Report header bar */}
          <div
            className="flex items-center justify-between px-4 py-1.5"
            style={{
              borderBottom: '1px solid rgba(62, 54, 40, 0.2)',
              background: 'linear-gradient(90deg, rgba(212, 168, 67, 0.06) 0%, transparent 60%)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
                Situation Report
              </span>
              <span className="text-[9px] tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {GAME_NAME}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: threatColor, boxShadow: `0 0 4px ${threatColor}` }}
              />
              <span className="text-[10px] font-bold font-data tracking-wider" style={{ color: threatColor }}>
                {threatLevel}
              </span>
            </div>
          </div>

          {/* Report body — field-style readout */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-y-2.5 gap-x-4">
              <SitrepField label="Personnel" value={`${heroCount} hero${heroCount !== 1 ? 'es' : ''}`} color="var(--color-xp)" />
              <SitrepField label="Deployed" value={deployedHeroCount > 0 ? `${deployedHeroCount} in field` : 'None'} color={deployedHeroCount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)'} />
              <SitrepField label="Structures" value={`${builtCount} / 20`} color="var(--color-info)" />
              <SitrepField label="Workforce" value={`${aliveWorkers} / ${totalWorkers}`} color="var(--color-success)" />
              <SitrepField label="Armory" value={`${gearCount} items`} color="var(--color-energy)" />
              <SitrepField label="Treasury" value={`${wc.toLocaleString()} WC`} color="var(--color-accent)" />
            </div>

            {/* Idle progress — minimal */}
            <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid rgba(62, 54, 40, 0.15)' }}>
              <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Idle cycle</span>
              <div className="flex-1 max-w-[200px]">
                <ProgressBar value={idle.idleSecondsUsedToday} max={idle.idleCapSeconds} color="var(--color-info)" height="3px" />
              </div>
              <span className="text-[10px] font-data" style={{ color: 'var(--color-text-muted)' }}>
                {idleHoursUsed}h / {idleCapHours}h
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            ACTIVE DIRECTIVE (story objective)
            ════════════════════════════════════════════ */}
        <DirectiveCard objective={currentObjective} onNavigate={() => onNavigate('story')} />

        {/* ════════════════════════════════════════════
            CORE LOCATIONS
            ════════════════════════════════════════════ */}
        <div>
          <SectionLabel text="Encampment Locations" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <HubLocation
              id="scan_tower"
              label="Scan Tower"
              icon={"\uD83D\uDCE1"}
              assetId="watchtower" assetType="building"
              description="Scan the dead city for threats, targets, and scavenging opportunities."
              flavor="Threat assessment and deployment control."
              status={activeDeployments > 0 ? `${activeDeployments} zone${activeDeployments !== 1 ? 's' : ''} active` : 'Awaiting scan'}
              alert={activeDeployments > 0}
              tint={activeDeployments > 0 ? 'var(--color-danger)' : 'var(--color-info)'}
              onClick={() => onNavigate('scan')}
            />
            <HubLocation
              id="hero_quarters"
              label="Hero Quarters"
              icon={"\u2694\uFE0F"}
              assetId="sparring_ring" assetType="building"
              description="Recruit specialists, manage your squad, equip gear and abilities."
              flavor="Squad roster and loadout management."
              status={`${heroCount} active`}
              tint="var(--color-xp)"
              onClick={() => onNavigate('heroes')}
            />
            <HubLocation
              id="firecamp"
              label="Firecamp"
              icon={"\uD83D\uDD25"}
              assetId="war_room" assetType="building"
              description="Your current directive and story progression."
              flavor="Briefing and mission objectives."
              status={currentObjective ? `Directive ${currentObjective.chapter.number}` : 'All clear'}
              alert={!!currentObjective}
              tint="var(--color-accent)"
              onClick={() => onNavigate('story')}
            />
            <HubLocation
              id="shelter"
              label="Operations"
              icon={"\uD83C\uDFD7\uFE0F"}
              assetId="supply_depot" assetType="building"
              description="Build and upgrade encampment structures. Assign workers to buildings."
              flavor="Construction, upgrades, and worker assignment."
              status={`${builtCount} structures`}
              tint="var(--color-info)"
              onClick={() => onNavigate('encampment')}
            />
            <HubLocation
              id="workshop"
              label="Workshop"
              icon={"\u2692\uFE0F"}
              assetId="assembly_line" assetType="building"
              description="Gather resources, craft supplies, and forge equipment."
              flavor="Skills, production, and gear crafting."
              tint="var(--color-energy)"
              onClick={() => onNavigate('workshop')}
            />
            <HubLocation
              id="barracks"
              label="Barracks"
              icon={"\uD83D\uDC65"}
              assetId="barracks" assetType="building"
              description="Manage your workforce — dispatching, assignments, recruitment."
              flavor="Population and labor management."
              status={`${availableWorkers} idle / ${aliveWorkers} alive`}
              tint="var(--color-success)"
              onClick={() => onNavigate('population')}
            />
            <HubLocation
              id="gate"
              label="The Gate"
              icon={"\uD83D\uDEE1\uFE0F"}
              assetId="fortified_wall" assetType="building"
              description="Expedition staging area. Send squads into the ruins beyond the wall."
              flavor="Dungeon expeditions and boss encounters."
              locked={!isFeatureUnlocked('expedition')}
              tint="var(--color-energy)"
              onClick={() => onNavigate('expedition')}
            />
            <HubLocation
              id="trade_post"
              label="Trade Post"
              icon={"\uD83C\uDFEA"}
              assetId="trading_post" assetType="building"
              description="Buy and sell on the local market. Manage listings and orders."
              flavor="Marketplace and commerce."
              locked={!isFeatureUnlocked('marketplace')}
              tint="#1abc9c"
              onClick={() => onNavigate('marketplace')}
            />
          </div>
        </div>

        {/* ════════════════════════════════════════════
            INTEL BRIEFING — readiness overview
            ════════════════════════════════════════════ */}
        <div>
          <SectionLabel text="Intel Briefing" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <BriefingCard
              title="Squad Roster"
              accentColor="var(--color-xp)"
              onAction={() => onNavigate('heroes')}
              actionLabel="Roster"
            >
              {heroes.length === 0 ? (
                <div className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
                  No personnel recruited. Visit Hero Quarters.
                </div>
              ) : (
                <div className="space-y-1">
                  {heroes.slice(0, 5).map(h => {
                    const isDeployed = deployments.some(d => d.heroIds.includes(h.id));
                    return (
                      <div key={h.id} className="flex items-center gap-2">
                        <div style={{ position: 'relative' }}>
                          <ItemIcon itemId={h.classId} itemType="hero" size={22} fallbackLabel={h.name.charAt(0)} />
                          <span
                            className="absolute rounded-full"
                            style={{
                              width: 6, height: 6, bottom: -1, right: -1,
                              backgroundColor: isDeployed ? 'var(--color-danger)' : 'var(--color-success)',
                              border: '1px solid rgba(22, 19, 15, 0.8)',
                            }}
                          />
                        </div>
                        <span className="text-[11px] flex-1" style={{ color: 'var(--color-text-primary)' }}>{h.name}</span>
                        <span className="text-[10px] font-data" style={{ color: isDeployed ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                          {isDeployed ? 'In field' : `Lv.${h.level}`}
                        </span>
                      </div>
                    );
                  })}
                  {heroes.length > 5 && (
                    <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      +{heroes.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </BriefingCard>

            <BriefingCard
              title="Field Operations"
              accentColor="var(--color-danger)"
              onAction={() => onNavigate('scan')}
              actionLabel="Scan"
            >
              {deployments.length === 0 ? (
                <div className="text-[11px] py-2" style={{ color: 'var(--color-text-muted)' }}>
                  No active deployments. Open the Scan Tower.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {deployments.map(d => {
                    const zone = COMBAT_ZONE_LIST.find(z => z.id === d.zoneId);
                    return (
                      <div key={d.zoneId} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="combat-swords-icon"
                            style={{ fontSize: '10px', lineHeight: 1 }}
                          >
                            {"\u2694\uFE0F"}
                          </span>
                          <span className="text-[11px]" style={{ color: 'var(--color-text-primary)' }}>
                            {zone?.name || d.zoneId}
                          </span>
                        </div>
                        <span className="text-[10px] font-data" style={{ color: 'var(--color-danger)' }}>
                          {d.heroIds.length} fighting
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </BriefingCard>

            <BriefingCard
              title="Supply Status"
              accentColor="var(--color-energy)"
              onAction={() => onNavigate('encampment')}
              actionLabel="Gather"
            >
              <SupplyReadout resources={resources} />
            </BriefingCard>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            SECONDARY LOCATIONS — compact row
            ════════════════════════════════════════════ */}
        <div>
          <SectionLabel text="Other Facilities" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5">
            <HubLocation
              id="armory"
              variant="compact"
              label="Loot Ledger"
              icon={"\uD83D\uDCE6"}
              assetId="armory" assetType="building"
              description="Review loot drops and acquisition history."
              tint="var(--color-energy)"
              onClick={() => onNavigate('loot')}
            />
            <HubLocation
              id="clinic"
              variant="compact"
              label="Starlight"
              icon={"\u2728"}
              assetId="infirmary" assetType="building"
              description="Starlight progression and ascension paths."
              locked={!isFeatureUnlocked('starlight')}
              tint="var(--color-xp)"
              onClick={() => onNavigate('starlight')}
            />
            <HubLocation
              id="command_post"
              variant="compact"
              label="Command Post"
              icon={"\u2699\uFE0F"}
              assetId="radio_tower" assetType="building"
              description="Settings, saves, and account management."
              tint="var(--color-text-muted)"
              onClick={() => onNavigate('settings')}
            />
            <HubLocation
              id="guild_hall"
              variant="compact"
              label="Faction HQ"
              icon={"\uD83C\uDFF0"}
              description="Faction operations. Not yet constructed."
              locked={true}
              onClick={() => onNavigate('guild')}
            />
            <HubLocation
              id="arena"
              variant="compact"
              label="Arena District"
              icon={"\u2693"}
              description="PvP combat zone. Not yet operational."
              locked={true}
              onClick={() => onNavigate('pvp')}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function SitrepField({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
        {label}
      </div>
      <div className="text-xs font-bold font-data" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-2.5">
      <div
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}
      >
        {text}
      </div>
      <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(62, 54, 40, 0.3)' }} />
    </div>
  );
}

function DirectiveCard({
  objective,
  onNavigate,
}: {
  objective: ReturnType<ReturnType<typeof useStoryStore.getState>['getCurrentObjective']>;
  onNavigate: () => void;
}) {
  if (!objective) {
    return (
      <button
        onClick={onNavigate}
        className="w-full p-4 rounded-lg text-left cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(61, 189, 110, 0.05) 0%, rgba(22, 19, 15, 0.8) 100%)',
          border: '1px solid rgba(61, 189, 110, 0.2)',
          borderLeft: '3px solid var(--color-success)',
        }}
      >
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-success)' }}>
          All Directives Complete
        </div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          No active orders. The encampment is holding. Await further directives.
        </div>
      </button>
    );
  }

  const progress = Math.min(objective.progress, objective.part.objective.count);
  const pct = objective.part.objective.count > 0 ? Math.floor((progress / objective.part.objective.count) * 100) : 0;

  return (
    <button
      onClick={onNavigate}
      className="w-full rounded-lg text-left cursor-pointer overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.06) 0%, rgba(22, 19, 15, 0.85) 100%)',
        border: '1px solid rgba(212, 168, 67, 0.2)',
        borderLeft: '3px solid var(--color-accent)',
      }}
    >
      {/* Directive header */}
      <div
        className="flex items-center justify-between px-4 py-1.5"
        style={{
          borderBottom: '1px solid rgba(212, 168, 67, 0.1)',
          background: 'rgba(212, 168, 67, 0.03)',
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
          Active Directive
        </span>
        <span className="text-[10px] font-data font-bold" style={{ color: 'var(--color-accent)' }}>
          {pct}%
        </span>
      </div>

      {/* Directive body */}
      <div className="px-4 py-3">
        <div className="text-xs font-bold mb-0.5" style={{ color: 'var(--color-text-primary)' }}>
          Chapter {objective.chapter.number} — {objective.part.title}
        </div>
        <div className="text-[11px] mb-2.5" style={{ color: 'var(--color-text-muted)' }}>
          {objective.part.objective.description}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={progress} max={objective.part.objective.count} color="var(--color-accent)" height="4px" />
          </div>
          <span className="text-[10px] font-data shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {progress} / {objective.part.objective.count}
          </span>
        </div>
      </div>
    </button>
  );
}

function BriefingCard({
  title,
  accentColor,
  onAction,
  actionLabel,
  children,
}: {
  title: string;
  accentColor: string;
  onAction: () => void;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden flex flex-col"
      style={{
        backgroundColor: 'rgba(22, 19, 15, 0.65)',
        border: '1px solid rgba(62, 54, 40, 0.25)',
        borderTop: `2px solid ${accentColor}`,
      }}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(62, 54, 40, 0.15)' }}>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          {title}
        </span>
        <button
          onClick={onAction}
          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded cursor-pointer"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {actionLabel}
        </button>
      </div>

      {/* Card body */}
      <div className="px-3 py-2.5 flex-1">
        {children}
      </div>
    </div>
  );
}

/** Show resource status with visual indicators */
function SupplyReadout({ resources }: { resources: Record<string, number> }) {
  const tracked = [
    { id: 'scrap_metal', name: 'Scrap', threshold: 20 },
    { id: 'salvaged_wood', name: 'Wood', threshold: 20 },
    { id: 'rainwater', name: 'Water', threshold: 15 },
    { id: 'wild_herbs', name: 'Herbs', threshold: 15 },
    { id: 'iron_ore', name: 'Iron', threshold: 10 },
    { id: 'mechanical_parts', name: 'Mech Parts', threshold: 10 },
  ];

  return (
    <div className="space-y-1.5">
      {tracked.map(r => {
        const qty = resources[r.id] || 0;
        const isLow = qty < r.threshold;
        return (
          <div key={r.id} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isLow ? 'var(--color-danger)' : 'var(--color-success)',
                  boxShadow: isLow ? '0 0 4px var(--color-danger)' : 'none',
                }}
              />
              <span className="text-[11px]" style={{ color: 'var(--color-text-primary)' }}>{r.name}</span>
            </div>
            <span
              className="text-[10px] font-data font-semibold"
              style={{ color: isLow ? 'var(--color-danger)' : 'var(--color-text-muted)' }}
            >
              {qty}
            </span>
          </div>
        );
      })}
    </div>
  );
}
