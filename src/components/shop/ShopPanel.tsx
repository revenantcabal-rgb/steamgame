import { useEffect, useState } from 'react';
import { useGoldenCapStore } from '../../store/useGoldenCapStore';
import { GOLDEN_CAP_PRODUCTS } from '../../config/premiumCatalog';
import { usePlatform } from '../../hooks/usePlatform';
import { GoldenCapBadge } from '../common/GoldenCapBadge';
import { GoldenCapCard } from './GoldenCapCard';
import { BenefitsList } from './BenefitsList';

export function ShopPanel() {
  const isActive = useGoldenCapStore(s => s.isActive);
  const getRemainingLabel = useGoldenCapStore(s => s.getRemainingLabel);
  const purchaseInProgress = useGoldenCapStore(s => s.purchaseInProgress);
  const purchaseError = useGoldenCapStore(s => s.purchaseError);
  const startPurchase = useGoldenCapStore(s => s.startPurchase);
  const completePurchase = useGoldenCapStore(s => s.completePurchase);
  const entitlement = useGoldenCapStore(s => s.entitlement);

  const { isSteam } = usePlatform();
  const active = isActive();

  // Live-update remaining time every second
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  const remaining = getRemainingLabel();
  const expiryDate = entitlement.expiresAt
    ? new Date(entitlement.expiresAt).toLocaleDateString()
    : null;

  const handlePurchase = (sku: string) => {
    if (!isSteam) return;
    startPurchase(sku as any);

    // In production, this would go through Steam Microtransaction API.
    // For now, complete immediately for testing/development.
    // TODO: Replace with actual Steam purchase flow via Supabase Edge Functions
    setTimeout(() => {
      completePurchase(sku as any);
    }, 500);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ maxWidth: 800 }}>
      {/* Header */}
      <div
        className="rounded p-4 mb-4 text-center"
        style={{
          background: active
            ? 'linear-gradient(135deg, #2a1f00 0%, #1a1200 100%)'
            : 'var(--color-bg-secondary)',
          border: active ? '1px solid #DAA520' : '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <GoldenCapBadge size="md" />
          <h2 className="text-xl font-bold" style={{ color: '#FFD700' }}>
            Golden Cap
          </h2>
        </div>
        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          Premium benefits for Wasteland survivors
        </p>

        {active && (
          <div
            className="inline-block rounded px-3 py-1.5 mt-1"
            style={{ backgroundColor: 'rgba(218, 165, 32, 0.15)', border: '1px solid #DAA520' }}
          >
            <span className="text-sm font-bold" style={{ color: '#FFD700' }}>
              Active
            </span>
            {remaining && (
              <span className="text-xs ml-2" style={{ color: 'var(--color-text-secondary)' }}>
                {remaining}
              </span>
            )}
            {expiryDate && (
              <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
                (expires {expiryDate})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Benefits */}
      <BenefitsList />

      {/* Duration Options */}
      <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
        {active ? 'Extend Your Golden Cap' : 'Choose Your Duration'}
      </h3>

      <div className="flex gap-3 flex-wrap mb-4">
        {GOLDEN_CAP_PRODUCTS.map(product => (
          <GoldenCapCard
            key={product.sku}
            product={product}
            isActive={active}
            purchasing={purchaseInProgress}
            isSteam={isSteam}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {/* Purchase Error */}
      {purchaseError && (
        <div
          className="rounded p-2 text-xs mb-4"
          style={{ backgroundColor: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid #e74c3c' }}
        >
          {purchaseError}
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>
        {isSteam ? (
          <>
            Purchases are processed through Steam Wallet.
            <br />
            Purchasing while active extends your current duration.
          </>
        ) : (
          <>
            Premium purchases are currently available through Steam only.
            <br />
            Web store coming soon.
          </>
        )}
      </div>
    </div>
  );
}
