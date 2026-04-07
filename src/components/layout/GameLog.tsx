import { useGameStore } from '../../store/useGameStore';

const TYPE_COLORS: Record<string, string> = {
  info: 'var(--color-text-secondary)',
  levelup: 'var(--color-accent)',
  drop: 'var(--color-success)',
  error: 'var(--color-danger)',
  system: 'var(--color-info)',
};

export function GameLog() {
  const logs = useGameStore(s => s.logs);

  return (
    <div
      className="h-48 overflow-y-auto p-3 text-xs font-mono"
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {logs.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)' }}>
          No activity yet...
        </div>
      ) : (
        logs.map(log => (
          <div key={log.id} className="py-0.5" style={{ color: TYPE_COLORS[log.type] || 'var(--color-text-secondary)' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>{' '}
            {log.message}
          </div>
        ))
      )}
    </div>
  );
}
