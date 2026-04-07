import type { GoldenCapProduct } from '../../types/premium';

interface GoldenCapCardProps {
  product: GoldenCapProduct;
  isActive: boolean;
  purchasing: boolean;
  isSteam: boolean;
  onPurchase: (sku: string) => void;
}

export function GoldenCapCard({ product, isActive, purchasing, isSteam, onPurchase }: GoldenCapCardProps) {
  const priceStr = `$${(product.priceInCents / 100).toFixed(2)}`;
  const perDay = `$${(product.priceInCents / 100 / product.durationDays).toFixed(2)}/day`;

  return (
    <div
      className="rounded p-3 flex flex-col items-center text-center relative"
      style={{
        backgroundColor: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border)',
        minWidth: 130,
      }}
    >
      {product.savingsPercent && (
        <div
          className="absolute -top-2 -right-2 text-xs font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: '#27ae60', color: '#fff' }}
        >
          Save {product.savingsPercent}%
        </div>
      )}

      <div className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {product.label}
      </div>

      <div className="text-lg font-bold mb-0.5" style={{ color: '#FFD700' }}>
        {priceStr}
      </div>

      <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
        {perDay}
      </div>

      <button
        onClick={() => onPurchase(product.sku)}
        disabled={purchasing || !isSteam}
        className="w-full py-1.5 px-3 rounded text-xs font-bold"
        style={{
          backgroundColor: purchasing ? 'var(--color-bg-secondary)' : isSteam ? '#DAA520' : 'var(--color-bg-secondary)',
          color: purchasing ? 'var(--color-text-muted)' : isSteam ? '#1a1a1a' : 'var(--color-text-muted)',
          cursor: purchasing || !isSteam ? 'not-allowed' : 'pointer',
          border: 'none',
        }}
      >
        {purchasing ? 'Processing...' : !isSteam ? 'Steam Only' : isActive ? 'Extend' : 'Buy'}
      </button>
    </div>
  );
}
