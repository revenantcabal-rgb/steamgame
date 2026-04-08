/**
 * BottomPanel — Collapsible game log and radio comms.
 *
 * Defaults to a single-line collapsed bar showing the latest log message.
 * Click to expand to full log/chat view. This recovers ~150px of vertical
 * space for the hub and active panels.
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
    // Collapsed: single-line bar with latest message
    return (
      <button
        onClick={() => setExpanded(true)}
        className="shrink-0 w-full flex items-center px-3 py-1 cursor-pointer text-left"
        style={{
          borderTop: '1px solid rgba(62, 54, 40, 0.2)',
          background: 'linear-gradient(0deg, #13110d 0%, #0e0c09 100%)',
          height: '26px',
          border: 'none',
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: 'rgba(62, 54, 40, 0.2)',
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider mr-2" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
          Log
        </span>
        <span className="text-[10px] flex-1 truncate" style={{
          color: latestLog?.type === 'error' ? 'var(--color-danger)'
            : latestLog?.type === 'levelup' ? 'var(--color-accent)'
            : 'var(--color-text-muted)',
        }}>
          {latestLog?.message || 'No activity yet.'}
        </span>
        {totalUnread > 0 && (
          <span
            className="ml-2 px-1.5 rounded-full text-[9px] font-bold"
            style={{
              background: 'var(--color-accent)',
              color: '#0c0a08',
            }}
          >
            {totalUnread}
          </span>
        )}
        <span className="ml-2 text-[10px]" style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}>{"\u25B2"}</span>
      </button>
    );
  }

  // Expanded: full log/chat with tab bar
  return (
    <div className="shrink-0" style={{ maxHeight: 'clamp(120px, 22vh, 220px)' }}>
      {/* Tab Bar */}
      <div
        className="flex items-center"
        style={{
          borderTop: '1px solid rgba(62, 54, 40, 0.3)',
          background: 'linear-gradient(0deg, #16130f 0%, #100e0a 100%)',
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

        {/* Collapse button */}
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
