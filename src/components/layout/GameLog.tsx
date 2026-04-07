import { useGameStore } from '../../store/useGameStore';

const TYPE_COLORS: Record<string, string> = {
  info: 'var(--color-text-secondary)',
  levelup: 'var(--color-accent)',
  drop: 'var(--color-success)',
  error: 'var(--color-danger)',
  system: 'var(--color-info)',
};

const TYPE_BORDER_COLORS: Record<string, string> = {
  info: 'rgba(168, 155, 134, 0.3)',
  levelup: 'rgba(212, 168, 67, 0.5)',
  drop: 'rgba(61, 189, 110, 0.5)',
  error: 'rgba(224, 85, 69, 0.5)',
  system: 'rgba(75, 163, 212, 0.5)',
};

export function GameLog() {
  const logs = useGameStore(s => s.logs);

  return (
    <div
      className="h-48 overflow-y-auto p-3 text-xs font-data"
      style={{
        background: 'linear-gradient(180deg, #0c0a08 0%, #080605 100%)',
        borderTop: '1px solid rgba(62, 54, 40, 0.2)',
        fontFamily: 'var(--font-data)',
      }}
    >
      {logs.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)' }}>
          No activity yet...
        </div>
      ) : (
        logs.map((log, index) => (
          <div
            key={log.id}
            className="py-0.5"
            style={{
              color: TYPE_COLORS[log.type] || 'var(--color-text-secondary)',
              borderLeft: `2px solid ${TYPE_BORDER_COLORS[log.type] || 'transparent'}`,
              paddingLeft: '8px',
              marginBottom: '1px',
              backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
            }}
          >
            <span style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>{' '}
            {log.message}
          </div>
        ))
      )}
    </div>
  );
}
