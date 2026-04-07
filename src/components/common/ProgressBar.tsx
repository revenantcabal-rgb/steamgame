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
          {showText && <span>{Math.floor(percent)}%</span>}
        </div>
      )}
      <div
        className="w-full rounded overflow-hidden"
        style={{ height, backgroundColor: 'var(--color-bg-tertiary)' }}
      >
        <div
          className="h-full rounded transition-all duration-300"
          style={{
            width: `${percent}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
