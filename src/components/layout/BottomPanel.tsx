/**
 * BottomPanel — Floating game log and radio overlay.
 *
 * v2: No longer occupies layout flow. Renders as a floating pill (collapsed)
 * or overlay panel (expanded) in the bottom-right corner. Zero vertical
 * footprint on the main content area.
 */

import { useState } from 'react';
import { GameLog } from './GameLog';
import { ChatPanel } from '../chat/ChatPanel';
import { useChatStore } from '../../store/useChatStore';
import { useGameStore } from '../../store/useGameStore';

type BottomTab = 'log' | 'chat';

export function BottomPanel() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<BottomTab>('log');
  const unreadCounts = useChatStore(s => s.unreadCounts);
  const logs = useGameStore(s => s.logs);

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);
  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  if (!expanded) {
    // Collapsed: floating pill in bottom-right
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer"
        style={{
          position: 'fixed',
          bottom: 10,
          right: 10,
          zIndex: 50,
          background: 'linear-gradient(135deg, #1a1714 0%, #13110d 100%)',
          border: '1px solid rgba(62, 54, 40, 0.4)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
          maxWidth: 320,
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider shrink-0" style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}>
          Log
        </span>
        <span className="text-[10px] truncate" style={{
          color: latestLog?.type === 'error' ? 'var(--color-danger)'
            : latestLog?.type === 'levelup' ? 'var(--color-accent)'
            : latestLog?.type === 'drop' ? 'var(--color-success)'
            : 'var(--color-text-muted)',
        }}>
          {latestLog?.message || 'No activity yet.'}
        </span>
        {totalUnread > 0 && (
          <span
            className="px-1.5 rounded-full text-[9px] font-bold shrink-0"
            style={{ background: 'var(--color-accent)', color: '#0c0a08' }}
          >
            {totalUnread}
          </span>
        )}
        <span className="text-[10px] shrink-0" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}>{"\u25B2"}</span>
      </button>
    );
  }

  // Expanded: floating overlay panel
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      zIndex: 50,
      width: 'min(480px, calc(100vw - 20px))',
      maxHeight: 'clamp(140px, 28vh, 260px)',
      borderRadius: 8,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0, 0, 0, 0.7)',
      border: '1px solid rgba(62, 54, 40, 0.4)',
    }}>
      {/* Tab Bar */}
      <div
        className="flex items-center"
        style={{
          background: 'linear-gradient(0deg, #16130f 0%, #100e0a 100%)',
          borderBottom: '1px solid rgba(62, 54, 40, 0.3)',
        }}
      >
        <button
          onClick={() => setActiveTab('log')}
          className="px-3 py-1 text-[11px] font-bold cursor-pointer"
          style={{
            backgroundColor: activeTab === 'log' ? 'var(--color-bg-primary)' : 'transparent',
            color: activeTab === 'log' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            border: 'none',
            borderBottom: activeTab === 'log' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
        >
          Game Log
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className="px-3 py-1 text-[11px] font-bold cursor-pointer"
          style={{
            backgroundColor: activeTab === 'chat' ? 'var(--color-bg-primary)' : 'transparent',
            color: activeTab === 'chat' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '2px solid var(--color-accent)' : '2px solid transparent',
          }}
        >
          Radio
          {totalUnread > 0 && activeTab !== 'chat' && (
            <span
              className="ml-1 px-1 rounded-full text-[9px] font-bold"
              style={{ background: 'var(--color-accent)', color: '#0c0a08' }}
            >
              {totalUnread}
            </span>
          )}
        </button>

        <button
          onClick={() => setExpanded(false)}
          className="ml-auto px-2 py-1 text-[10px] cursor-pointer"
          style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', opacity: 0.5 }}
          title="Collapse"
        >
          {"\u25BC"}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'log' && <GameLog />}
      {activeTab === 'chat' && <ChatPanel />}
    </div>
  );
}
