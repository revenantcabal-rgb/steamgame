import { useState } from 'react';
import { GameLog } from './GameLog';
import { ChatPanel } from '../chat/ChatPanel';
import { useChatStore } from '../../store/useChatStore';

type BottomTab = 'log' | 'chat';

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState<BottomTab>('log');
  const unreadCounts = useChatStore(s => s.unreadCounts);

  const totalUnread = Object.values(unreadCounts).reduce((sum, n) => sum + n, 0);

  return (
    <div className="shrink-0" style={{ maxHeight: 'clamp(120px, 25vh, 250px)' }}>
      {/* Tab Bar */}
      <div
        className="flex"
        style={{
          borderTop: '1px solid rgba(62, 54, 40, 0.3)',
          background: 'linear-gradient(0deg, #16130f 0%, #100e0a 100%)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        <button
          onClick={() => setActiveTab('log')}
          className="px-4 py-1.5 text-xs font-bold cursor-pointer"
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
          className="px-4 py-1.5 text-xs font-bold cursor-pointer"
          style={{
            backgroundColor: activeTab === 'chat' ? 'var(--color-bg-primary)' : 'transparent',
            color: activeTab === 'chat' ? 'var(--color-accent)' : 'var(--color-text-muted)',
            border: 'none',
            borderBottom: activeTab === 'chat' ? '2px solid var(--color-accent)' : '2px solid transparent',
            position: 'relative',
          }}
        >
          Chat
          {totalUnread > 0 && activeTab !== 'chat' && (
            <span
              className="ml-1 px-1.5 py-0 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #e6be5a 0%, #d4a843 100%)',
                color: '#0c0a08',
                fontSize: '11px',
                fontWeight: 'bold',
                boxShadow: '0 0 6px rgba(212, 168, 67, 0.4)',
              }}
            >
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'log' && <GameLog />}
      {activeTab === 'chat' && <ChatPanel />}
    </div>
  );
}
