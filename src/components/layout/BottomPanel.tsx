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
    <div>
      {/* Tab Bar */}
      <div
        className="flex"
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg-secondary)',
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
                backgroundColor: 'var(--color-accent)',
                color: '#000',
                fontSize: '11px',
                fontWeight: 'bold',
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
