import { useState } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { useGameStore } from '../../store/useGameStore';
import type { MarketCategory } from '../../types/marketplace';

type StatusTab = 'sell' | 'buy';

export function MarketStatusPanel() {
  const [tab, setTab] = useState<StatusTab>('sell');

  const myListings = useMarketStore(s => s.getMyListings());
  const myPOs = useMarketStore(s => s.getMyPurchaseOrders());
  const collectables = useMarketStore(s => s.getMyCollectables());
  const history = useMarketStore(s => s.history);
  const cancelListing = useMarketStore(s => s.cancelListing);
  const cancelPurchaseOrder = useMarketStore(s => s.cancelPurchaseOrder);
  const collectItem = useMarketStore(s => s.collectItem);
  const collectAll = useMarketStore(s => s.collectAll);

  // Recent transactions (last 5)
  const recentTxns = history.slice(0, 5);

  // Collectables that are WC proceeds from sales (not items)
  const saleCollectables = collectables.filter(c => c.category === 'resources' || c.category === 'equipment' || c.category === 'accessories' || c.category === 'consumables' || c.category === 'tools' || c.category === 'abilities' || c.category === 'expedition_passes');

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Notification bar */}
      {recentTxns.length > 0 && (
        <div style={{
          padding: '6px 12px', backgroundColor: 'rgba(34,197,94,0.1)',
          borderBottom: '1px solid rgba(34,197,94,0.2)', overflowX: 'auto',
          whiteSpace: 'nowrap', fontSize: 11, color: '#22c55e',
        }}>
          {recentTxns.map((t, i) => (
            <span key={t.id}>
              {i > 0 && <span style={{ color: 'var(--color-text-muted)', margin: '0 8px' }}>|</span>}
              {t.quantity}x {t.itemName} @ {t.pricePerUnit.toLocaleString()} WC
            </span>
          ))}
        </div>
      )}

      {/* Header with tabs and collect all */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setTab('sell')}
            style={{
              padding: '4px 12px', border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: tab === 'sell' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
              color: tab === 'sell' ? '#000' : 'var(--color-text-muted)',
            }}
          >
            Sell ({myListings.length})
          </button>
          <button
            onClick={() => setTab('buy')}
            style={{
              padding: '4px 12px', border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: tab === 'buy' ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
              color: tab === 'buy' ? '#000' : 'var(--color-text-muted)',
            }}
          >
            Buy ({myPOs.length})
          </button>
        </div>
        {collectables.length > 0 && (
          <button
            onClick={() => collectAll()}
            style={{
              padding: '4px 12px', border: 'none', borderRadius: 3, fontSize: 11, fontWeight: 'bold', cursor: 'pointer',
              backgroundColor: '#22c55e', color: '#000',
            }}
          >
            Collect All ({collectables.length})
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {tab === 'sell' ? (
          <SellTab
            listings={myListings}
            collectables={saleCollectables}
            onCancel={cancelListing}
            onCollect={collectItem}
          />
        ) : (
          <BuyTab
            orders={myPOs}
            collectables={collectables}
            onCancel={cancelPurchaseOrder}
            onCollect={collectItem}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SELL TAB
// ═══════════════════════════════════════════

function SellTab({ listings, collectables, onCancel, onCollect }: {
  listings: ReturnType<typeof useMarketStore.getState>['getMyListings'] extends () => infer R ? R : never;
  collectables: any[];
  onCancel: (id: string) => void;
  onCollect: (id: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: 8 }}>
        Items Listed ({listings.length})
      </div>

      {listings.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
          No active listings.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {listings.map(l => (
            <div key={l.id} style={{
              padding: '8px 10px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{l.itemName}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {l.quantity}x at {l.pricePerUnit.toLocaleString()} WC | Exp: {new Date(l.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => onCancel(l.id)}
                style={{ padding: '3px 8px', border: 'none', borderRadius: 3, fontSize: 11, cursor: 'pointer', backgroundColor: 'var(--color-danger)', color: '#fff' }}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Collectables (completed sales) */}
      {collectables.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e', marginBottom: 8 }}>
            Items to Collect ({collectables.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {collectables.map(c => (
              <div key={c.id} style={{
                padding: '8px 10px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e' }}>{c.itemName}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {c.quantity}x | {new Date(c.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => onCollect(c.id)}
                  style={{ padding: '3px 8px', border: 'none', borderRadius: 3, fontSize: 11, cursor: 'pointer', backgroundColor: '#22c55e', color: '#000', fontWeight: 'bold' }}
                >
                  Collect
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// BUY TAB
// ═══════════════════════════════════════════

function BuyTab({ orders, collectables, onCancel, onCollect }: {
  orders: ReturnType<typeof useMarketStore.getState>['getMyPurchaseOrders'] extends () => infer R ? R : never;
  collectables: any[];
  onCancel: (id: string) => void;
  onCollect: (id: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: 8 }}>
        Orders ({orders.length})
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: 16, textAlign: 'center', fontSize: 11, color: 'var(--color-text-muted)' }}>
          No active purchase orders.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {orders.map(o => (
            <div key={o.id} style={{
              padding: '8px 10px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{o.itemName}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  {o.quantityFilled}/{o.quantity} filled at {o.bidPrice.toLocaleString()} WC | Esc: {o.escrowAmount.toLocaleString()} WC
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Exp: {new Date(o.expiresAt).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => onCancel(o.id)}
                style={{ padding: '3px 8px', border: 'none', borderRadius: 3, fontSize: 11, cursor: 'pointer', backgroundColor: 'var(--color-danger)', color: '#fff' }}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Collectables from PO fills */}
      {collectables.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e', marginBottom: 8 }}>
            Items to Collect ({collectables.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {collectables.map(c => (
              <div key={c.id} style={{
                padding: '8px 10px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
              }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 'bold', color: '#22c55e' }}>{c.itemName}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                    {c.quantity}x | {new Date(c.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => onCollect(c.id)}
                  style={{ padding: '3px 8px', border: 'none', borderRadius: 3, fontSize: 11, cursor: 'pointer', backgroundColor: '#22c55e', color: '#000', fontWeight: 'bold' }}
                >
                  Collect
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
