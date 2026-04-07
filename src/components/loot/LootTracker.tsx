import { useState, useMemo } from 'react';
import { useLootTrackerStore } from '../../store/useLootTrackerStore';
import { RESOURCES } from '../../config/resources';
import { CONSUMABLES } from '../../config/consumables';
import { ItemIcon } from '../../utils/itemIcons';

type ViewMode = 'summary' | 'by_source' | 'timeline';

const SOURCE_COLORS: Record<string, string> = {
  gathering: '#27ae60',
  production: '#3498db',
  combat: '#e74c3c',
  worker: '#f39c12',
  boss: '#a855f7',
};

const SOURCE_LABELS: Record<string, string> = {
  gathering: 'Manual Gathering',
  production: 'Production',
  combat: 'Combat Drops',
  worker: 'Worker Trips',
  boss: 'Boss Kills',
};

export function LootTracker() {
  // Subscribe to stable primitives/arrays — NOT to getTrackedLoot() which returns new objects every call
  const entries = useLootTrackerStore(s => s.entries);
  const trackingSince = useLootTrackerStore(s => s.trackingSince);
  const isPremium = useLootTrackerStore(s => s.isPremium);
  const clearTracker = useLootTrackerStore(s => s.clearTracker);
  const [view, setView] = useState<ViewMode>('summary');

  const maxHours = isPremium ? 24 : 12;
  const maxAge = isPremium ? 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
  const elapsedMs = Date.now() - trackingSince;
  const elapsedHrs = Math.min(maxHours, elapsedMs / 3600000);
  const elapsedStr = elapsedHrs < 1 ? `${Math.floor(elapsedHrs * 60)}m` : `${elapsedHrs.toFixed(1)}h`;

  // Derive aggregated data with useMemo (stable references, no infinite re-render)
  const { byResource, bySourceEntries, validEntries } = useMemo(() => {
    const now = Date.now();
    const valid = entries.filter(e => now - e.timestamp < maxAge);
    const byRes: Record<string, number> = {};
    const bySrc: Record<string, Record<string, number>> = {};
    for (const e of valid) {
      byRes[e.resourceId] = (byRes[e.resourceId] || 0) + e.quantity;
      if (!bySrc[e.source]) bySrc[e.source] = {};
      bySrc[e.source][e.resourceId] = (bySrc[e.source][e.resourceId] || 0) + e.quantity;
    }
    return { byResource: byRes, bySourceEntries: bySrc, validEntries: valid };
  }, [entries, maxAge]);

  const totalItems = Object.values(byResource).reduce((sum, qty) => sum + qty, 0);
  const uniqueItems = Object.keys(byResource).length;

  // Sort resources by quantity descending
  const sortedResources = Object.entries(byResource)
    .sort(([, a], [, b]) => b - a)
    .map(([id, qty]) => {
      const res = RESOURCES[id] || CONSUMABLES[id];
      return {
        id,
        name: res?.name || id.replace(/_/g, ' '),
        qty,
        isRare: id === 'icqor_chess_piece',
      };
    });

  // Recent entries for timeline (last 50)
  const recentEntries = [...validEntries].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-accent)' }}>Loot Tracker</h2>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Tracking for {elapsedStr} | {maxHours}h history {isPremium ? '(Gold Pass)' : '(Free)'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearTracker} className="px-3 py-1 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            Reset
          </button>
          {!isPremium && (
            <button className="px-3 py-1 rounded text-xs cursor-pointer"
              style={{ backgroundColor: '#f39c1233', color: '#f39c12', border: '1px solid #f39c12' }}>
              Upgrade to Gold Pass (24h)
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>{totalItems.toLocaleString()}</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Total Items</div>
        </div>
        <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-info)' }}>{uniqueItems}</div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Unique Types</div>
        </div>
        <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-lg font-bold" style={{ color: 'var(--color-success)' }}>
            {elapsedHrs > 0 ? Math.round(totalItems / elapsedHrs).toLocaleString() : 0}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Items/Hour</div>
        </div>
        <div className="p-3 rounded text-center" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <div className="text-lg font-bold" style={{ color: '#a855f7' }}>
            {byResource['icqor_chess_piece'] || 0}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Icqor Pieces</div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex gap-1 mb-4">
        {([
          { id: 'summary' as ViewMode, label: 'All Loot' },
          { id: 'by_source' as ViewMode, label: 'By Source' },
          { id: 'timeline' as ViewMode, label: 'Recent' },
        ]).map(tab => (
          <button key={tab.id} onClick={() => setView(tab.id)}
            className="px-3 py-1.5 rounded text-xs font-bold cursor-pointer"
            style={{
              backgroundColor: view === tab.id ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
              color: view === tab.id ? '#000' : 'var(--color-text-muted)',
              border: 'none',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'summary' && (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
          {sortedResources.map(r => (
            <div key={r.id} className="flex items-center gap-2 p-2 rounded" style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: r.isRare ? '1px solid #a855f7' : '1px solid var(--color-border)',
            }}>
              <ItemIcon itemId={r.id} itemType={CONSUMABLES[r.id] ? 'consumable' : 'resource'} size={28} fallbackLabel={r.name.charAt(0)} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: r.isRare ? '#a855f7' : 'var(--color-text-primary)' }}>
                  {r.name}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {elapsedHrs > 0 ? `${Math.round(r.qty / elapsedHrs).toLocaleString()}/hr` : ''}
                </div>
              </div>
              <span className="text-sm font-bold font-mono" style={{ color: r.isRare ? '#a855f7' : 'var(--color-accent)' }}>
                {r.qty.toLocaleString()}
              </span>
            </div>
          ))}
          {sortedResources.length === 0 && (
            <div className="col-span-full text-center p-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No loot tracked yet. Start gathering, crafting, or fighting!
            </div>
          )}
        </div>
      )}

      {view === 'by_source' && (
        <div className="space-y-4">
          {Object.entries(bySourceEntries).map(([source, items]) => (
            <div key={source}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: SOURCE_COLORS[source] || '#888' }} />
                <span className="text-xs font-bold" style={{ color: SOURCE_COLORS[source] || '#888' }}>
                  {SOURCE_LABELS[source] || source}
                </span>
                <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  ({Object.values(items).reduce((s, q) => s + q, 0).toLocaleString()} items)
                </span>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-1">
                {Object.entries(items).sort(([, a], [, b]) => b - a).map(([id, qty]) => {
                  const res = RESOURCES[id] || CONSUMABLES[id];
                  return (
                    <div key={id} className="flex items-center gap-1.5 p-1.5 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                      <ItemIcon itemId={id} itemType="resource" size={16} fallbackLabel={(res?.name || id).charAt(0)} />
                      <span className="text-xs truncate flex-1" style={{ color: 'var(--color-text-primary)' }}>{res?.name || id}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: SOURCE_COLORS[source] }}>{qty.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(bySourceEntries).length === 0 && (
            <div className="text-center p-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>No loot tracked yet.</div>
          )}
        </div>
      )}

      {view === 'timeline' && (
        <div className="space-y-1">
          {recentEntries.map((e, i) => {
            const res = RESOURCES[e.resourceId] || CONSUMABLES[e.resourceId];
            const ago = Math.floor((Date.now() - e.timestamp) / 1000);
            const agoStr = ago < 60 ? `${ago}s ago` : ago < 3600 ? `${Math.floor(ago / 60)}m ago` : `${(ago / 3600).toFixed(1)}h ago`;
            return (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded text-xs" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SOURCE_COLORS[e.source] || '#888' }} />
                <ItemIcon itemId={e.resourceId} itemType="resource" size={14} fallbackLabel="" />
                <span style={{ color: 'var(--color-text-primary)' }}>
                  +{e.quantity} {res?.name || e.resourceId}
                </span>
                <span className="ml-auto text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  {e.skillOrZone} · {agoStr}
                </span>
              </div>
            );
          })}
          {recentEntries.length === 0 && (
            <div className="text-center p-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>No recent loot.</div>
          )}
        </div>
      )}
    </div>
  );
}
