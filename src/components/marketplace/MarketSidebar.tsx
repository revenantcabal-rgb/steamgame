import { useState } from 'react';
import { useMarketStore } from '../../store/useMarketStore';
import type { MarketCategory } from '../../types/marketplace';

interface CategoryNode {
  id: MarketCategory;
  label: string;
  color: string;
  subcategories?: { id: string; label: string }[];
}

const CATEGORIES: CategoryNode[] = [
  {
    id: 'equipment', label: 'Equipment', color: '#4a5568',
    subcategories: [
      { id: 'weapon', label: 'Weapons' },
      { id: 'armor', label: 'Body Armor' },
      { id: 'legs', label: 'Leg Armor' },
      { id: 'gloves', label: 'Gloves' },
      { id: 'boots', label: 'Boots' },
      { id: 'shield', label: 'Shields' },
    ],
  },
  {
    id: 'accessories', label: 'Accessories', color: '#8b7a2d',
    subcategories: [
      { id: 'ring', label: 'Rings' },
      { id: 'earring', label: 'Earrings' },
      { id: 'necklace', label: 'Necklaces' },
    ],
  },
  { id: 'resources', label: 'Material', color: '#8B6914' },
  { id: 'consumables', label: 'Consumables', color: '#2d8b2d' },
  { id: 'tools', label: 'Tools', color: '#2d6b6b' },
  { id: 'abilities', label: 'Abilities', color: '#6b2d8b' },
  { id: 'expedition_passes', label: 'Passes', color: '#8b2d2d' },
];

interface MarketSidebarProps {
  selectedCategory: MarketCategory;
  selectedSubcategory: string | null;
  onSelectCategory: (cat: MarketCategory, sub?: string | null) => void;
}

export function MarketSidebar({ selectedCategory, selectedSubcategory, onSelectCategory }: MarketSidebarProps) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(['equipment', 'accessories']));
  const listings = useMarketStore(s => s.listings);

  function getCount(catId: MarketCategory): number {
    return listings.filter(l => l.category === catId && l.expiresAt > Date.now()).reduce((s, l) => s + l.quantity, 0);
  }

  function toggleExpand(catId: string) {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  return (
    <div style={{
      width: 160, minWidth: 160, borderRight: '1px solid var(--color-border)',
      backgroundColor: 'var(--color-bg-secondary)', overflowY: 'auto',
    }}>
      <div style={{ padding: '8px 6px', fontSize: 11, fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' }}>
        Categories
      </div>
      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id && !selectedSubcategory;
        const isExpanded = expandedCats.has(cat.id);
        const count = getCount(cat.id);

        return (
          <div key={cat.id}>
            <div
              onClick={() => {
                onSelectCategory(cat.id, null);
                if (cat.subcategories) toggleExpand(cat.id);
              }}
              style={{
                padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'transparent',
                borderLeft: isSelected ? `3px solid ${cat.color}` : '3px solid transparent',
                transition: 'background-color 0.1s',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {cat.subcategories && (
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 10 }}>
                    {isExpanded ? '\u25BC' : '\u25B6'}
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#fff' : 'var(--color-text-primary)' }}>
                  {cat.label}
                </span>
              </div>
              {count > 0 && (
                <span style={{ fontSize: 11, color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 8, padding: '1px 5px' }}>
                  {count}
                </span>
              )}
            </div>

            {/* Subcategories */}
            {cat.subcategories && isExpanded && cat.subcategories.map(sub => {
              const isSub = selectedCategory === cat.id && selectedSubcategory === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => onSelectCategory(cat.id, sub.id)}
                  style={{
                    padding: '4px 8px 4px 28px', cursor: 'pointer', fontSize: 11,
                    color: isSub ? '#fff' : 'var(--color-text-muted)',
                    backgroundColor: isSub ? 'var(--color-bg-tertiary)' : 'transparent',
                    fontWeight: isSub ? 'bold' : 'normal',
                  }}
                  onMouseEnter={e => { if (!isSub) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isSub) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {sub.label}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
