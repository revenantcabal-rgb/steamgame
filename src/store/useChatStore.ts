import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { useGoldenCapStore } from './useGoldenCapStore';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type ChatChannel = 'general' | 'trade' | 'recruitment' | 'beginner' | 'guild' | 'party' | 'whisper';

export interface ChatMessage {
  id: string;
  channel: ChatChannel;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  isPremium?: boolean;
  whisperTargetId?: string;
  whisperTargetName?: string;
}

export const CHANNEL_LABELS: Record<ChatChannel, string> = {
  general: 'Radio',
  trade: 'Trade Log',
  recruitment: 'Recruit',
  beginner: 'Field Notes',
  guild: 'Faction',
  party: 'Squad',
  whisper: 'Personal',
};

export const CHANNEL_COLORS: Record<ChatChannel, string> = {
  general: '#9ca3af',
  trade: '#f39c12',
  recruitment: '#27ae60',
  beginner: '#3498db',
  guild: '#9b59b6',
  party: '#e74c3c',
  whisper: '#e879f9',
};

const MAX_MESSAGES_PER_CHANNEL = 200;

const ALL_CHANNELS: ChatChannel[] = ['general', 'trade', 'recruitment', 'beginner', 'guild', 'party', 'whisper'];

function createEmptyMessages(): Record<ChatChannel, ChatMessage[]> {
  const result = {} as Record<ChatChannel, ChatMessage[]>;
  for (const ch of ALL_CHANNELS) result[ch] = [];
  return result;
}

function createEmptyUnread(): Record<ChatChannel, number> {
  const result = {} as Record<ChatChannel, number>;
  for (const ch of ALL_CHANNELS) result[ch] = 0;
  return result;
}

let _msgCounter = 0;
function nextId(): string {
  return `chat_${Date.now()}_${++_msgCounter}`;
}

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────

interface ChatState {
  messages: Record<ChatChannel, ChatMessage[]>;
  activeChannel: ChatChannel;
  unreadCounts: Record<ChatChannel, number>;
  isChatOpen: boolean;

  sendMessage: (text: string) => void;
  sendWhisper: (targetName: string, text: string) => void;
  switchChannel: (channel: ChatChannel) => void;
  toggleChat: () => void;
  addSystemMessage: (channel: ChatChannel, text: string) => void;
  clearChannel: (channel: ChatChannel) => void;
}

// ──────────────────────────────────────────────
// Helper: append message and cap at MAX
// ──────────────────────────────────────────────

function appendMessage(
  messages: Record<ChatChannel, ChatMessage[]>,
  channel: ChatChannel,
  msg: ChatMessage,
): Record<ChatChannel, ChatMessage[]> {
  const list = [...messages[channel], msg];
  if (list.length > MAX_MESSAGES_PER_CHANNEL) {
    list.splice(0, list.length - MAX_MESSAGES_PER_CHANNEL);
  }
  return { ...messages, [channel]: list };
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useChatStore = create<ChatState>((set, get) => ({
  messages: createEmptyMessages(),
  activeChannel: 'general',
  unreadCounts: createEmptyUnread(),
  isChatOpen: true,

  sendMessage: (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Handle /w whisper command
    const whisperMatch = trimmed.match(/^\/w\s+(\S+)\s+(.+)$/i);
    if (whisperMatch) {
      get().sendWhisper(whisperMatch[1], whisperMatch[2]);
      return;
    }

    const auth = useAuthStore.getState();
    const senderId = auth.user?.id ?? 'unknown';
    const senderName = auth.user?.username ?? 'Player';
    const state = get();

    const msg: ChatMessage = {
      id: nextId(),
      channel: state.activeChannel,
      senderId,
      senderName,
      text: trimmed,
      timestamp: Date.now(),
      isPremium: useGoldenCapStore.getState().isActive(),
    };

    set(s => ({
      messages: appendMessage(s.messages, s.activeChannel, msg),
    }));
  },

  sendWhisper: (targetName: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const auth = useAuthStore.getState();
    const senderId = auth.user?.id ?? 'unknown';
    const senderName = auth.user?.username ?? 'Player';

    const msg: ChatMessage = {
      id: nextId(),
      channel: 'whisper',
      senderId,
      senderName,
      text: trimmed,
      timestamp: Date.now(),
      whisperTargetId: targetName,
      whisperTargetName: targetName,
    };

    set(s => {
      const newMessages = appendMessage(s.messages, 'whisper', msg);
      const newUnread = { ...s.unreadCounts };
      if (s.activeChannel !== 'whisper') {
        newUnread.whisper = (newUnread.whisper || 0) + 1;
      }
      return { messages: newMessages, unreadCounts: newUnread };
    });
  },

  switchChannel: (channel: ChatChannel) => {
    set(s => ({
      activeChannel: channel,
      unreadCounts: { ...s.unreadCounts, [channel]: 0 },
    }));
  },

  toggleChat: () => {
    set(s => ({ isChatOpen: !s.isChatOpen }));
  },

  addSystemMessage: (channel: ChatChannel, text: string) => {
    const msg: ChatMessage = {
      id: nextId(),
      channel,
      senderId: 'system',
      senderName: 'System',
      text,
      timestamp: Date.now(),
      isSystem: true,
    };

    set(s => {
      const newMessages = appendMessage(s.messages, channel, msg);
      const newUnread = { ...s.unreadCounts };
      if (s.activeChannel !== channel) {
        newUnread[channel] = (newUnread[channel] || 0) + 1;
      }
      return { messages: newMessages, unreadCounts: newUnread };
    });
  },

  clearChannel: (channel: ChatChannel) => {
    set(s => ({
      messages: { ...s.messages, [channel]: [] },
      unreadCounts: { ...s.unreadCounts, [channel]: 0 },
    }));
  },
}));

// ──────────────────────────────────────────────
// Initialization: welcome messages
// ──────────────────────────────────────────────

useChatStore.getState().addSystemMessage('general', 'Welcome to Wasteland Grind! Type /help for commands.');
useChatStore.getState().addSystemMessage('beginner', 'This channel is for new players. Ask anything!');
