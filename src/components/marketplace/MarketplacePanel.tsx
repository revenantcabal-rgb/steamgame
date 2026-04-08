import { useState, useMemo } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import { useGameStore } from '../../store/useGameStore';
import type { MarketCategory } from '../../types/marketplace';
import { MarketSidebar } from './MarketSidebar';
import { MarketItemGrid, buildCatalog } from './MarketItemGrid';
import { MarketItemDetail } from './MarketItemDetail';
import { MarketStatusPanel } from './MarketStatusPanel';

// ═══════════════════════════════════════════
// MAIN MARKETPLACE PANEL
// ═══════════════════════════════════════════

export function MarketplacePanel() {
  const [showStatus, setShowStatus] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('resources');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const playerWC = useGameStore(s => s.resources['wasteland_credits'] || 0);
  const collectables = useMarketStore(s => s.collectables);

  const catalog = useMemo(() => buildCatalog(), []);
  const selectedItem = selectedItemId ? catalog.find(i => i.id === selectedItemId) || null : null;

  const handleCategorySelect = (cat: MarketCategory, sub?: string | null) => {
    setSelectedCategory(cat);
    setSelectedSubcategory(sub ?? null);
    setSelectedItemId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>
              Trade Post
            </h2>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, letterSpacing: '0.05em' }}>
              Local market — NPC floor buyers maintain price stability
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--color-accent)' }}>
              {playerWC.toLocaleString()} WC
            </div>
            <button
              onClick={() => setShowStatus(!showStatus)}
              style={{
                padding: '4px 12px', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 'bold', cursor: 'pointer',
                backgroundColor: showStatus ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
                color: showStatus ? '#000' : 'var(--color-text-muted)',
                position: 'relative',
              }}
            >
              Status
              {collectables.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  backgroundColor: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 'bold',
                  borderRadius: 8, padding: '1px 4px', minWidth: 14, textAlign: 'center',
                }}>
                  {collectables.length}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Search bar (only in market view) */}
        {!showStatus && (
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            style={{
              width: '100%', padding: '6px 10px', borderRadius: 4, fontSize: 12,
              backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)', outline: 'none',
            }}
          />
        )}
      </div>

      {/* Main Content */}
      {showStatus ? (
        <MarketStatusPanel />
      ) : (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar */}
          <MarketSidebar
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={handleCategorySelect}
          />

          {/* Item Grid */}
          <MarketItemGrid
            category={selectedCategory}
            subcategory={selectedSubcategory}
            searchQuery={searchQuery}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
          />

          {/* Detail Panel */}
          {selectedItem ? (
            <MarketItemDetail item={selectedItem} />
          ) : (
            <div style={{
              width: 300, minWidth: 300, borderLeft: '1px solid var(--color-border)',
              backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 11 }}>
                Click an item to view details
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
