export interface GameItemId {
  gameId: string; // Full ID string: {type}_{creatorId}_{timestamp}_{nonce}_{checksum}
  type: 'gear' | 'resource' | 'consumable' | 'tool' | 'ability' | 'pass';
  creatorId: string;
  createdAt: number;
  nonce: string;
  checksum: string;
}

export type TransactionAction = 'create' | 'trade' | 'drop' | 'craft' | 'discard' | 'market_list' | 'market_buy' | 'market_cancel' | 'loot' | 'expedition_reward';

export interface TransactionLogEntry {
  id: string;
  gameId: string;
  action: TransactionAction;
  actorId: string;
  targetId?: string;
  quantity?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sequenceNum: number;
}

export interface RateLimitRecord {
  itemType: string;
  timestamps: number[];
}

export interface BanRecord {
  offenseCount: number;
  currentBanUntil: number | null;
  banHistory: { bannedAt: number; expiresAt: number; reason: string }[];
}

export type FlagSeverity = 'warning' | 'suspicious' | 'violation';

export interface AnticheatFlag {
  id: string;
  severity: FlagSeverity;
  reason: string;
  timestamp: number;
  evidence: Record<string, unknown>;
}
