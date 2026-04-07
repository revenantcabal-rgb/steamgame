import { useGameStore } from '../../store/useGameStore';
import { RESOURCES } from '../../config/resources';

const TIER_COLORS: Record<number, string> = {
  1: '#9ca3af',
  2: '#27ae60',
  3: '#3498db',
  4: '#9b59b6',
  5: '#f39c12',
};

export function ResourcePanel() {
  const resources = useGameStore(s => s.resources);

  const wcAmount = resources['wasteland_credits'] || 0;
  const ownedResources = Object.entries(resources)
    .filter(([id, qty]) => qty > 0 && id !== 'wasteland_credits')
    .map(([id, qty]) => ({ ...(RESOURCES[id] || { id, name: id.replace(/_/g, ' '), tier: 1 }), quantity: qty }))
    .filter(r => r.id)
    .sort((a, b) => (a as any).tier - (b as any).tier || a.name.localeCompare(b.name));

  return (
    <div
      className="w-56 min-w-48 h-screen overflow-y-auto flex flex-col shrink-0"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderLeft: '1px solid var(--color-border)',
      }}
    >
      <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>Resources ({ownedResources.length})</div>
        <div className="flex justify-between items-center mt-1 p-1.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--color-accent)' }}>Wasteland Credits</span>
          <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-accent)' }}>{wcAmount.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {ownedResources.length === 0 ? (
          <div className="text-xs p-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
            No resources yet. Start training a gathering skill!
          </div>
        ) : (
          <div className="space-y-1">
            {ownedResources.map(resource => (
              <div
                key={resource.id}
                className="flex justify-between items-center p-2 rounded text-sm"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                title={resource.description}
              >
                <span style={{ color: TIER_COLORS[resource.tier] || '#9ca3af' }}>
                  {resource.name}
                </span>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  x{resource.quantity.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
