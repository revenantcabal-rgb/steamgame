interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: string;
  showText?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max,
  color = 'var(--color-accent)',
  height = '8px',
  showText = false,
  label,
}: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
          <span>{label}</span>
          {showText && <span className="font-data">{Math.floor(percent)}%</span>}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{
          height,
          backgroundColor: 'var(--color-bg-tertiary)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
          border: '1px solid rgba(0,0,0,0.2)',
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
            backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            boxShadow: percent > 0 ? `0 0 6px ${color}40, inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
          }}
        />
      </div>
    </div>
  );
}
