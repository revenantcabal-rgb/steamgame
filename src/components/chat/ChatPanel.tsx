import { useState, useRef, useEffect } from 'react';
import {
  useChatStore,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  type ChatChannel,
} from '../../store/useChatStore';
import { GoldenCapBadge } from '../common/GoldenCapBadge';

const ALL_CHANNELS: ChatChannel[] = ['general', 'trade', 'recruitment', 'beginner', 'guild', 'party', 'whisper'];

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function ChatPanel() {
  const messages = useChatStore(s => s.messages);
  const activeChannel = useChatStore(s => s.activeChannel);
  const unreadCounts = useChatStore(s => s.unreadCounts);
  const isChatOpen = useChatStore(s => s.isChatOpen);
  const sendMessage = useChatStore(s => s.sendMessage);
  const switchChannel = useChatStore(s => s.switchChannel);
  const toggleChat = useChatStore(s => s.toggleChat);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages[activeChannel];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && isChatOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMessages.length, isChatOpen]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const totalUnread = ALL_CHANNELS.reduce((sum, ch) => sum + (unreadCounts[ch] || 0), 0);

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 cursor-pointer"
        onClick={toggleChat}
        style={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderBottom: isChatOpen ? '1px solid var(--color-border)' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Chat
          </span>
          {!isChatOpen && totalUnread > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: 'var(--color-accent)', color: '#000', fontSize: '11px' }}
            >
              {totalUnread}
            </span>
          )}
        </div>
        <button
          className="text-xs cursor-pointer"
          style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none' }}
        >
          {isChatOpen ? '\u25BC' : '\u25B2'}
        </button>
      </div>

      {isChatOpen && (
        <>
          {/* Channel Tabs */}
          <div
            className="flex overflow-x-auto"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            {ALL_CHANNELS.map(ch => {
              const isActive = ch === activeChannel;
              const unread = unreadCounts[ch] || 0;
              return (
                <button
                  key={ch}
                  onClick={() => switchChannel(ch)}
                  className="px-3 py-1.5 text-xs font-bold cursor-pointer whitespace-nowrap"
                  style={{
                    backgroundColor: isActive ? 'var(--color-bg-primary)' : 'transparent',
                    color: isActive ? CHANNEL_COLORS[ch] : 'var(--color-text-muted)',
                    border: 'none',
                    borderBottom: isActive ? `2px solid ${CHANNEL_COLORS[ch]}` : '2px solid transparent',
                    position: 'relative',
                  }}
                >
                  {CHANNEL_LABELS[ch]}
                  {unread > 0 && (
                    <span
                      className="ml-1 px-1 py-0 rounded-full"
                      style={{
                        backgroundColor: CHANNEL_COLORS[ch],
                        color: '#000',
                        fontSize: '11px',
                        fontWeight: 'bold',
                      }}
                    >
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Message Area */}
          <div
            ref={messageContainerRef}
            className="overflow-y-auto p-2 text-xs font-mono"
            style={{
              maxHeight: '200px',
              minHeight: '100px',
              backgroundColor: 'var(--color-bg-primary)',
            }}
          >
            {channelMessages.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)' }}>
                No messages in {CHANNEL_LABELS[activeChannel]} yet...
              </div>
            ) : (
              channelMessages.map(msg => (
                <div key={msg.id} className="py-0.5">
                  <span style={{ color: 'var(--color-text-muted)' }}>
                    [{formatTime(msg.timestamp)}]
                  </span>{' '}
                  {msg.isSystem ? (
                    <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                      {msg.text}
                    </span>
                  ) : msg.channel === 'whisper' ? (
                    <>
                      {msg.isPremium && <GoldenCapBadge size="sm" />}
                      <span style={{ color: msg.isPremium ? '#FFD700' : CHANNEL_COLORS.whisper, fontWeight: 'bold' }}>
                        {msg.senderName}
                      </span>
                      <span style={{ color: CHANNEL_COLORS.whisper }}>
                        {' '}&rarr; {msg.whisperTargetName}:
                      </span>{' '}
                      <span style={{ color: '#f0d0ff' }}>{msg.text}</span>
                    </>
                  ) : (
                    <>
                      {msg.isPremium && <GoldenCapBadge size="sm" />}
                      <span style={{ color: msg.isPremium ? '#FFD700' : CHANNEL_COLORS[activeChannel], fontWeight: 'bold' }}>
                        {msg.senderName}:
                      </span>{' '}
                      <span style={{ color: 'var(--color-text-secondary)' }}>{msg.text}</span>
                    </>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div
            className="flex gap-1 p-1.5"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeChannel === 'whisper' ? '/w PlayerName message' : `Chat in ${CHANNEL_LABELS[activeChannel]}...`}
              className="flex-1 px-2 py-1 text-xs rounded"
              style={{
                backgroundColor: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              className="px-3 py-1 text-xs font-bold rounded cursor-pointer"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: '#000',
                border: 'none',
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}
