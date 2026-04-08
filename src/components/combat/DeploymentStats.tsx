/**
 * DeploymentStats — Combat statistics footer for an active deployment.
 */

interface DeploymentStatsProps {
  totalKills: number;
  bossKills: number;
  heroCount: number;
  totalXpEarned: number;
  deathCount: number;
  deployedAt: number;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function DeploymentStats({ totalKills, bossKills, heroCount, totalXpEarned, deathCount, deployedAt }: DeploymentStatsProps) {
  const elapsed = Math.floor((Date.now() - deployedAt) / 1000);
  const killsPerHour = elapsed > 0 ? Math.round(totalKills / (elapsed / 3600)) : 0;

  return (
    <div className="flex gap-4 text-[11px] mt-2 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
      <span>Kills: <b className="font-data" style={{ color: 'var(--color-success)' }}>{totalKills}</b></span>
      <span>Bosses: <b className="font-data" style={{ color: 'var(--color-accent)' }}>{bossKills}</b></span>
      <span>Squad: <b className="font-data">{heroCount}</b></span>
      <span>XP: <b className="font-data" style={{ color: 'var(--color-energy)' }}>{totalXpEarned.toLocaleString()}</b></span>
      <span>Deaths: <b className="font-data" style={{ color: deathCount > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>{deathCount}</b></span>
      <span>Time: <b className="font-data">{formatDuration(elapsed)}</b></span>
      <span>Kills/hr: <b className="font-data">{killsPerHour}</b></span>
    </div>
  );
}
