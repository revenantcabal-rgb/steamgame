/**
 * ScanTowerPanel — City intelligence and threat assessment.
 *
 * Presents scan results as discovered locations in the dead city,
 * not just a flat combat zone list. Each zone is framed as a
 * district/site with intel: danger, loot, survivor activity, and
 * recommended squad composition.
 *
 * Features:
 * - Manual scan with 3h cooldown (auto-scan with Gold Pass)
 * - Scan buff: +15% drop chance, +10 turn speed
 * - Tower upgrades (levels 1-3) for placement buff scaling
 * - Placement buffs by zone signal level when scan active
 */

import { useState, useEffect } from 'react';
import { useHeroStore } from '../../store/useHeroStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useEncampmentStore } from '../../store/useEncampmentStore';
import { useGameStore } from '../../store/useGameStore';
import { useScanTowerStore, getUpgradeCosts } from '../../store/useScanTowerStore';
import { useGoldenCapStore } from '../../store/useGoldenCapStore';
import { COMBAT_ZONE_LIST } from '../../config/combatZones';
import { RESOURCES } from '../../config/resources';

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

/** Format milliseconds as "Xh Ym Zs" */
function formatMs(ms: number): string {
  if (ms <= 0) return '0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
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
  const resources = useGameStore(s => s.resources);

  // Scan tower state
  const towerLevel = useScanTowerStore(s => s.towerLevel);
  const scanBuffExpiresAt = useScanTowerStore(s => s.scanBuffExpiresAt);
  const performScan = useScanTowerStore(s => s.performScan);
  const upgradeTower = useScanTowerStore(s => s.upgradeTower);
  const isScanBuffActive = useScanTowerStore(s => s.isScanBuffActive);
  const getScanCooldownRemaining = useScanTowerStore(s => s.getScanCooldownRemaining);
  const getPlacementBuff = useScanTowerStore(s => s.getPlacementBuff);
  const getScanBuffBonuses = useScanTowerStore(s => s.getScanBuffBonuses);

  const isGoldPass = useGoldenCapStore(s => s.isActive)();

  const [showUpgradePanel, setShowUpgradePanel] = useState(false);

  // Force re-render every second for countdown timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const buffActive = isScanBuffActive();
  const cooldownMs = getScanCooldownRemaining();
  const buffBonuses = getScanBuffBonuses();
  const buffRemainingMs = scanBuffExpiresAt ? Math.max(0, scanBuffExpiresAt - Date.now()) : 0;

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

  // Upgrade costs
  const upgradeCosts = getUpgradeCosts(towerLevel);
  const canAffordUpgrade = upgradeCosts ? upgradeCosts.every(c => (resources[c.resourceId] || 0) >= c.quantity) : false;

  // Placement buff labels
  const placementLabels = ['Low', 'Moderate', 'High', 'Severe', 'Extreme'];

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
                Scan Tower Lv.{towerLevel} — {hasRadioTower ? 'Enhanced Signal' : 'Standard Sweep'}
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

        {/* ─── Scan Controls ─── */}
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(22, 19, 15, 0.9) 0%, rgba(12, 10, 8, 0.95) 100%)',
            border: buffActive ? '1px solid rgba(75, 163, 212, 0.4)' : '1px solid rgba(62, 54, 40, 0.3)',
            boxShadow: buffActive ? '0 0 12px rgba(75, 163, 212, 0.15)' : 'none',
          }}
        >
          <div className="px-4 py-3 space-y-3">
            {/* Scan button row */}
            <div className="flex items-center gap-3 flex-wrap">
              {isGoldPass ? (
                <div
                  className="px-4 py-2 rounded text-xs font-bold uppercase tracking-widest"
                  style={{
                    background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                  }}
                >
                  AUTO-SCAN ACTIVE
                </div>
              ) : (
                <button
                  onClick={() => performScan()}
                  disabled={cooldownMs > 0}
                  className="px-5 py-2.5 rounded font-bold uppercase tracking-wider text-xs transition-all"
                  style={{
                    backgroundColor: cooldownMs > 0 ? 'rgba(62, 54, 40, 0.3)' : 'rgba(75, 163, 212, 0.15)',
                    border: cooldownMs > 0 ? '1px solid rgba(62, 54, 40, 0.3)' : '1px solid rgba(75, 163, 212, 0.5)',
                    color: cooldownMs > 0 ? 'var(--color-text-muted)' : 'var(--color-info)',
                    cursor: cooldownMs > 0 ? 'not-allowed' : 'pointer',
                    opacity: cooldownMs > 0 ? 0.6 : 1,
                  }}
                >
                  {cooldownMs > 0 ? `SCAN (${formatMs(cooldownMs)})` : 'SCAN'}
                </button>
              )}

              {/* Tower level + upgrade toggle */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Tower Level {towerLevel}/3
                </span>
                {towerLevel < 3 ? (
                  <button
                    onClick={() => setShowUpgradePanel(!showUpgradePanel)}
                    className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(75, 163, 212, 0.08)',
                      border: '1px solid rgba(75, 163, 212, 0.25)',
                      color: 'var(--color-info)',
                    }}
                  >
                    {showUpgradePanel ? 'CLOSE' : 'UPGRADE'}
                  </button>
                ) : (
                  <span
                    className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      color: '#d4af37',
                    }}
                  >
                    MAX LEVEL
                  </span>
                )}
              </div>
            </div>

            {/* Buff status */}
            {buffActive && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{
                  background: 'linear-gradient(90deg, rgba(75, 163, 212, 0.1) 0%, rgba(75, 163, 212, 0.03) 100%)',
                  border: '1px solid rgba(75, 163, 212, 0.25)',
                  animation: 'hub-signal 3s ease-in-out infinite',
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-info)', boxShadow: '0 0 8px var(--color-info)' }} />
                <span className="text-xs font-bold" style={{ color: 'var(--color-info)' }}>
                  SCAN ACTIVE
                </span>
                <span className="text-[10px] font-data" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatMs(buffRemainingMs)} remaining
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ─── Buff Display ─── */}
        {buffActive && (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(22, 19, 15, 0.9) 0%, rgba(12, 10, 8, 0.95) 100%)',
              border: '1px solid rgba(75, 163, 212, 0.2)',
            }}
          >
            <div className="px-4 py-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-info)' }}>
                Active Scan Buffs
              </div>

              {/* Combat bonuses */}
              <div className="flex flex-wrap gap-3">
                <div className="px-2.5 py-1.5 rounded" style={{ backgroundColor: 'rgba(75, 163, 212, 0.06)', border: '1px solid rgba(75, 163, 212, 0.15)' }}>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--color-success)' }}>+{buffBonuses.dropChanceBonus}%</span>
                  <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-muted)' }}>Drop Rate</span>
                </div>
                <div className="px-2.5 py-1.5 rounded" style={{ backgroundColor: 'rgba(75, 163, 212, 0.06)', border: '1px solid rgba(75, 163, 212, 0.15)' }}>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--color-energy)' }}>+{buffBonuses.turnSpeedBonus}</span>
                  <span className="text-[10px] ml-1" style={{ color: 'var(--color-text-muted)' }}>Turn Speed</span>
                </div>
              </div>

              {/* Placement buffs by signal level */}
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Placement Buffs (All Stats)
                </div>
                <div className="flex flex-wrap gap-2">
                  {placementLabels.map(label => {
                    const buff = getPlacementBuff(label);
                    return (
                      <span key={label} className="text-[10px] px-1.5 py-0.5 rounded" style={{
                        backgroundColor: 'rgba(62, 54, 40, 0.3)',
                        border: '1px solid rgba(62, 54, 40, 0.2)',
                      }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>{label} </span>
                        <span style={{ color: 'var(--color-success)' }}>+{buff}%</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tower Upgrade Panel (collapsible) ─── */}
        {showUpgradePanel && towerLevel < 3 && upgradeCosts && (
          <div
            className="rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(22, 19, 15, 0.9) 0%, rgba(12, 10, 8, 0.95) 100%)',
              border: '1px solid rgba(62, 54, 40, 0.3)',
            }}
          >
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-energy)' }}>
                  Upgrade: Level {towerLevel} &rarr; {towerLevel + 1}
                </div>
              </div>

              {/* Material costs */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {upgradeCosts.map(c => {
                  const have = resources[c.resourceId] || 0;
                  const enough = have >= c.quantity;
                  const resName = RESOURCES[c.resourceId]?.name || c.resourceId;
                  return (
                    <div key={c.resourceId} className="flex items-center gap-2 px-2 py-1.5 rounded" style={{
                      backgroundColor: 'rgba(62, 54, 40, 0.2)',
                      border: enough ? '1px solid rgba(62, 54, 40, 0.2)' : '1px solid rgba(224, 85, 69, 0.2)',
                    }}>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold" style={{ color: 'var(--color-text-secondary)' }}>{resName}</div>
                        <div className="text-[10px] font-data">
                          <span style={{ color: enough ? 'var(--color-success)' : 'var(--color-danger)' }}>{have}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}> / {c.quantity}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Upgrade button */}
              <button
                onClick={() => upgradeTower()}
                disabled={!canAffordUpgrade}
                className="w-full py-2 rounded font-bold uppercase tracking-wider text-xs transition-all"
                style={{
                  backgroundColor: canAffordUpgrade ? 'rgba(75, 163, 212, 0.15)' : 'rgba(62, 54, 40, 0.2)',
                  border: canAffordUpgrade ? '1px solid rgba(75, 163, 212, 0.4)' : '1px solid rgba(62, 54, 40, 0.2)',
                  color: canAffordUpgrade ? 'var(--color-info)' : 'var(--color-text-muted)',
                  cursor: canAffordUpgrade ? 'pointer' : 'not-allowed',
                  opacity: canAffordUpgrade ? 1 : 0.5,
                }}
              >
                UPGRADE TO LEVEL {towerLevel + 1}
              </button>

              {/* What you get */}
              <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                Higher tower level increases placement buff multiplier across all signal levels.
              </div>
            </div>
          </div>
        )}

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
              <ScanResultCard
                key={scan.id}
                scan={scan}
                onClick={() => onNavigateToCombat(scan.id)}
                placementBuff={buffActive ? getPlacementBuff(scan.threatLabel) : 0}
              />
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
            Requires further tower upgrades — future update
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function ScanResultCard({ scan, onClick, placementBuff }: { scan: ScanResult; onClick: () => void; placementBuff: number }) {
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
          {placementBuff > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{
              backgroundColor: 'rgba(75, 163, 212, 0.1)',
              border: '1px solid rgba(75, 163, 212, 0.2)',
              color: 'var(--color-info)',
            }}>
              +{placementBuff}% stats
            </span>
          )}
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
