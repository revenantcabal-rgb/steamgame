/**
 * ScanTowerPanel — City intelligence and threat assessment.
 *
 * Presents scan results as discovered locations in the dead city,
 * not just a flat combat zone list. Each zone is framed as a
 * district/site with intel: danger, loot, survivor activity, and
 * recommended squad composition.
 *
 * Architected so real multiplayer districts/contested zones can
 * plug in later via the ScanResult interface.
 */

import { useHeroStore } from '../../store/useHeroStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useEncampmentStore } from '../../store/useEncampmentStore';
import { COMBAT_ZONE_LIST } from '../../config/combatZones';
import { CLASSES } from '../../config/classes';

// ── Scan result interface — future-ready for server-pushed data ──
interface ScanResult {
  id: string;
  name: string;
  description: string;
  /** Threat level 1-5 */
  threatLevel: number;
  threatLabel: string;
  /** Expected loot category */
  lootCategory: string;
  /** Possible survivor/conflict activity */
  activityNote: string;
  /** Recommended action */
  recommendation: string;
  /** Signal confidence 0-1 */
  signalClarity: number;
  /** Minimum hero level */
  minLevel: number;
  /** Boss name */
  bossName: string;
  /** Gear tier */
  gearTier: number;
  /** Max difficulty tiers */
  maxTier: number;
  /** Is this zone currently being farmed? */
  isActive: boolean;
  /** Number of heroes deployed here */
  deployedCount: number;
  /** Source: 'pve' | 'pvp' | 'scavenge' | 'event' */
  source: 'pve' | 'pvp' | 'scavenge' | 'event';
}

/** Generate scan results from combat zones + game state */
function generateScanResults(
  avgLevel: number,
  activeZoneIds: Set<string>,
  deployments: { zoneId: string; heroIds: string[] }[],
): ScanResult[] {
  return COMBAT_ZONE_LIST.map(zone => {
    const threatLevel = zone.minLevel >= 60 ? 5 : zone.minLevel >= 45 ? 4 : zone.minLevel >= 30 ? 3 : zone.minLevel >= 15 ? 2 : 1;
    const threatLabels = ['', 'Low', 'Moderate', 'High', 'Severe', 'Extreme'];
    const lootCategories = ['', 'Scrap & organics', 'Iron & components', 'Electronics & chemicals', 'Rare ores & icqor', 'Military-grade salvage'];
    const activityNotes = [
      '',
      'Mutant vermin nesting. Low survivor risk.',
      'Feral packs roaming. Occasional scavenger sightings.',
      'Chemical contamination. Drone activity detected.',
      'Raider camps spotted. High conflict probability.',
      'Automated defense grid active. Extreme hostility.',
    ];
    const recommendations: string[] = [];
    if (avgLevel < zone.minLevel) {
      recommendations.push(`Squad underleveled (Lv.${avgLevel} vs Lv.${zone.minLevel}+). Train first.`);
    } else if (avgLevel >= zone.minLevel + 20) {
      recommendations.push('Outleveled — fast sweep viable. Deploy for resource farming.');
    } else {
      recommendations.push('Within range. Deploy balanced squad for steady gains.');
    }

    const dep = deployments.find(d => d.zoneId === zone.id);

    return {
      id: zone.id,
      name: zone.name,
      description: zone.description,
      threatLevel,
      threatLabel: threatLabels[threatLevel],
      lootCategory: lootCategories[threatLevel],
      activityNote: activityNotes[threatLevel],
      recommendation: recommendations[0],
      signalClarity: Math.max(0.4, 1 - (zone.minLevel - avgLevel) * 0.015),
      minLevel: zone.minLevel,
      bossName: zone.boss.name,
      gearTier: zone.baseGearTier,
      maxTier: zone.maxTier,
      isActive: activeZoneIds.has(zone.id),
      deployedCount: dep ? dep.heroIds.length : 0,
      source: 'pve',
    };
  });
}

interface ScanTowerPanelProps {
  onNavigateToCombat: (zoneId: string) => void;
  onNavigateToExpedition: () => void;
}

export function ScanTowerPanel({ onNavigateToCombat, onNavigateToExpedition }: ScanTowerPanelProps) {
  const heroes = useHeroStore(s => s.heroes);
  const deployments = useCombatZoneStore(s => s.deployments);
  const isFeatureUnlocked = useStoryStore(s => s.isFeatureUnlocked);
  const buildings = useEncampmentStore(s => s.buildings);

  const avgLevel = heroes.length > 0 ? Math.round(heroes.reduce((s, h) => s + h.level, 0) / heroes.length) : 0;
  const deployedHeroCount = deployments.reduce((s, d) => s + d.heroIds.length, 0);
  const activeZoneIds = new Set(deployments.map(d => d.zoneId));
  const scanResults = generateScanResults(avgLevel, activeZoneIds, deployments);
  const hasRadioTower = !!buildings['radio_tower'];

  const threatLevel = activeZoneIds.size > 2 ? 'HIGH' : activeZoneIds.size > 0 ? 'ACTIVE' : 'NOMINAL';
  const threatColor = threatLevel === 'HIGH' ? 'var(--color-danger)' : threatLevel === 'ACTIVE' ? 'var(--color-energy)' : 'var(--color-success)';

  // Recommended next action
  const bestUndeployed = scanResults.find(r => !r.isActive && avgLevel >= r.minLevel);
  const recommendation = deployments.length === 0 && bestUndeployed
    ? `Deploy to ${bestUndeployed.name} — threat level ${bestUndeployed.threatLabel.toLowerCase()}, within squad range.`
    : deployments.length > 0
      ? `${deployedHeroCount} hero${deployedHeroCount !== 1 ? 'es' : ''} in field across ${activeZoneIds.size} zone${activeZoneIds.size !== 1 ? 's' : ''}. Monitor for boss encounters.`
      : 'No deployments and no viable targets. Level up your squad.';

  return (
    <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 space-y-4">

        {/* ─── Terminal Header ─── */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(22, 19, 15, 0.9) 0%, rgba(12, 10, 8, 0.95) 100%)',
            border: '1px solid rgba(62, 54, 40, 0.3)',
            borderTop: '2px solid var(--color-info)',
          }}
        >
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid rgba(62, 54, 40, 0.2)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-info)', boxShadow: '0 0 6px var(--color-info)', animation: 'hub-signal 2s ease-in-out infinite' }} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-info)' }}>
                Scan Tower — {hasRadioTower ? 'Enhanced Signal' : 'Standard Sweep'}
              </span>
            </div>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: threatColor }} />
              <span className="text-[10px] font-bold font-data tracking-wider" style={{ color: threatColor }}>{threatLevel}</span>
            </span>
          </div>

          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
              <ScanField label="Roster" value={`${heroes.length} heroes`} color="var(--color-xp)" />
              <ScanField label="Avg Level" value={String(avgLevel)} color="var(--color-text-primary)" />
              <ScanField label="Deployed" value={deployedHeroCount > 0 ? `${deployedHeroCount} in field` : 'None'} color={deployedHeroCount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)'} />
              <ScanField label="Zones Scanned" value={String(scanResults.length)} color="var(--color-info)" />
              <ScanField label="Active Zones" value={String(activeZoneIds.size)} color={activeZoneIds.size > 0 ? 'var(--color-energy)' : 'var(--color-text-muted)'} />
            </div>

            {/* Recommendation */}
            <div className="p-2 rounded text-[11px]" style={{ backgroundColor: 'rgba(75, 163, 212, 0.06)', border: '1px solid rgba(75, 163, 212, 0.15)', color: 'var(--color-info)' }}>
              <span className="font-bold uppercase tracking-wider text-[9px]" style={{ color: 'var(--color-text-muted)' }}>Recommendation: </span>
              {recommendation}
            </div>
          </div>
        </div>

        {/* ─── Active Engagements ─── */}
        {deployments.length > 0 && (
          <div>
            <SectionLine text="Active Engagements" color="var(--color-danger)" />
            <div className="space-y-1.5">
              {deployments.map(d => {
                const scan = scanResults.find(r => r.id === d.zoneId);
                return (
                  <button key={d.zoneId} onClick={() => onNavigateToCombat(d.zoneId)} className="w-full text-left p-3 rounded cursor-pointer" style={{
                    background: 'linear-gradient(90deg, rgba(224, 85, 69, 0.08) 0%, rgba(22, 19, 15, 0.6) 100%)',
                    border: '1px solid rgba(224, 85, 69, 0.2)', borderLeft: '3px solid var(--color-danger)',
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="combat-swords-icon" style={{ fontSize: '12px' }}>{"\u2694\uFE0F"}</span>
                        <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{scan?.name || d.zoneId}</span>
                      </div>
                      <span className="text-[10px] font-data font-bold" style={{ color: 'var(--color-danger)' }}>
                        {d.heroIds.length} hero{d.heroIds.length !== 1 ? 'es' : ''} in combat
                      </span>
                    </div>
                    {scan && <div className="text-[10px] mt-1 ml-6" style={{ color: 'var(--color-text-muted)' }}>{scan.activityNote}</div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Scan Results ─── */}
        <div>
          <SectionLine text="Detected Sites" color="var(--color-text-muted)" />
          <div className="space-y-2">
            {scanResults.map(scan => (
              <ScanResultCard key={scan.id} scan={scan} onClick={() => onNavigateToCombat(scan.id)} />
            ))}
          </div>
        </div>

        {/* ─── Expeditions ─── */}
        {isFeatureUnlocked('expedition') && (
          <div>
            <SectionLine text="Expedition Intel" color="var(--color-info)" />
            <button onClick={onNavigateToExpedition} className="w-full text-left p-3 rounded cursor-pointer" style={{
              backgroundColor: 'rgba(75, 163, 212, 0.04)', border: '1px solid rgba(75, 163, 212, 0.2)', borderLeft: '3px solid var(--color-info)',
            }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{"\uD83C\uDFF0"}</span>
                <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>Dungeon Expeditions Available</span>
              </div>
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Abandoned facilities beyond the wall. Squad-based encounters with boss targets and salvageable gear.
              </div>
            </button>
          </div>
        )}

        {/* ─── Locked Intel ─── */}
        <div className="p-3 rounded text-center" style={{ backgroundColor: 'rgba(22, 19, 15, 0.3)', border: '1px dashed rgba(62, 54, 40, 0.2)' }}>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}>
            PvP threat assessment {"\u2022"} Contested district scanning {"\u2022"} Survivor faction tracking
          </div>
          <div className="text-[9px] mt-1 uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', opacity: 0.3 }}>
            Requires tower upgrade — future update
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ScanResultCard({ scan, onClick }: { scan: ScanResult; onClick: () => void }) {
  const threatColors = ['', 'var(--color-success)', '#8bc34a', 'var(--color-energy)', 'var(--color-danger)', '#d32f2f'];
  const tColor = threatColors[scan.threatLevel] || 'var(--color-text-muted)';
  const clarityPct = Math.round(scan.signalClarity * 100);

  return (
    <button onClick={onClick} className="w-full text-left p-3 rounded cursor-pointer transition-all" style={{
      backgroundColor: scan.isActive ? 'rgba(224, 85, 69, 0.04)' : 'rgba(22, 19, 15, 0.5)',
      border: scan.isActive ? '1px solid rgba(224, 85, 69, 0.2)' : '1px solid rgba(62, 54, 40, 0.2)',
      borderLeft: `3px solid ${scan.isActive ? 'var(--color-danger)' : tColor}`,
    }}>
      {/* Row 1: Name + threat + signal */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {scan.isActive && <span className="combat-swords-icon" style={{ fontSize: '11px' }}>{"\u2694\uFE0F"}</span>}
          <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>{scan.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider" style={{ backgroundColor: `${tColor}15`, color: tColor }}>
            {scan.threatLabel}
          </span>
          <span className="text-[9px] font-data" style={{ color: clarityPct >= 70 ? 'var(--color-text-muted)' : 'var(--color-energy)', opacity: 0.7 }}>
            {clarityPct}% signal
          </span>
        </div>
      </div>

      {/* Row 2: Description */}
      <div className="text-[10px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
        {scan.description}
      </div>

      {/* Row 3: Intel grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[10px]">
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Loot: </span>
          <span style={{ color: 'var(--color-energy)' }}>{scan.lootCategory}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Activity: </span>
          <span style={{ color: 'var(--color-text-secondary)' }}>{scan.activityNote.split('.')[0]}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Boss: </span>
          <span style={{ color: 'var(--color-danger)' }}>{scan.bossName}</span>
        </div>
        <div>
          <span style={{ color: 'var(--color-text-muted)' }}>Gear: </span>
          <span style={{ color: 'var(--color-info)' }}>T{scan.gearTier} | {scan.maxTier} tiers</span>
        </div>
      </div>

      {/* Row 4: Recommendation */}
      <div className="text-[10px] mt-1.5 pt-1.5" style={{ borderTop: '1px solid rgba(62, 54, 40, 0.15)', color: 'var(--color-info)' }}>
        {scan.recommendation}
      </div>
    </button>
  );
}

function ScanField({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      <div className="text-xs font-bold font-data" style={{ color }}>{value}</div>
    </div>
  );
}

function SectionLine({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap" style={{ color }}>{text}</div>
      <div className="flex-1 h-px" style={{ backgroundColor: `${color}30` }} />
    </div>
  );
}
