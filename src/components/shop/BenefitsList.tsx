import { GOLDEN_CAP_BENEFITS } from '../../config/premiumCatalog';

export function BenefitsList() {
  return (
    <div
      className="rounded p-3 mb-4"
      style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border)' }}
    >
      <h3 className="text-sm font-bold mb-2" style={{ color: '#FFD700' }}>
        Premium Benefits
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {GOLDEN_CAP_BENEFITS.map((b, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className="text-base leading-none mt-0.5">{b.icon}</span>
            <div>
              <div style={{ color: 'var(--color-text-primary)' }}>{b.label}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>{b.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
