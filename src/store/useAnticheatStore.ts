import { create } from 'zustand';
import { checkRateLimit, escalateBan } from '../engine/AnticheatEngine';
import type { TransactionLogEntry, TransactionAction, RateLimitRecord, AnticheatFlag, BanRecord } from '../types/anticheat';

const MAX_TRANSACTION_LOG = 1000;

export interface SerializedAnticheatState {
  transactionLog: TransactionLogEntry[];
  rateLimits: Record<string, RateLimitRecord>;
  flags: AnticheatFlag[];
  banRecord: BanRecord;
  sequenceCounter: number;
}

interface AnticheatState {
  transactionLog: TransactionLogEntry[];
  rateLimits: Record<string, RateLimitRecord>;
  flags: AnticheatFlag[];
  banRecord: BanRecord;
  sequenceCounter: number;

  logItemEvent: (gameId: string, action: TransactionAction, actorId: string, targetId?: string, quantity?: number, metadata?: Record<string, unknown>) => void;
  checkAndRecordAcquisition: (itemType: string) => boolean;
  isBanned: () => boolean;
  getBanExpiry: () => number | null;

  getSerializableState: () => SerializedAnticheatState;
  loadState: (state: SerializedAnticheatState) => void;
}

function createInitialBanRecord(): BanRecord {
  return {
    offenseCount: 0,
    currentBanUntil: null,
    banHistory: [],
  };
}

export const useAnticheatStore = create<AnticheatState>((set, get) => ({
  transactionLog: [],
  rateLimits: {},
  flags: [],
  banRecord: createInitialBanRecord(),
  sequenceCounter: 0,

  logItemEvent: (gameId, action, actorId, targetId?, quantity?, metadata?) => {
    const state = get();
    const now = Date.now();
    const newSeq = state.sequenceCounter + 1;

    const entry: TransactionLogEntry = {
      id: `txn_${now}_${Math.random().toString(36).slice(2, 8)}`,
      gameId,
      action,
      actorId,
      targetId,
      quantity,
      metadata,
      timestamp: now,
      sequenceNum: newSeq,
    };

    // Cap at MAX_TRANSACTION_LOG (drop oldest)
    const newLog = [...state.transactionLog, entry];
    if (newLog.length > MAX_TRANSACTION_LOG) {
      newLog.splice(0, newLog.length - MAX_TRANSACTION_LOG);
    }

    set({
      transactionLog: newLog,
      sequenceCounter: newSeq,
    });
  },

  checkAndRecordAcquisition: (itemType) => {
    const state = get();
    const now = Date.now();

    // Get or create rate limit record for this item type
    const record: RateLimitRecord = state.rateLimits[itemType] || {
      itemType,
      timestamps: [],
    };

    // Check rate limit
    const result = checkRateLimit(record, now);

    if (!result.allowed) {
      // Flag the violation
      const newFlags = [...state.flags];
      if (result.flag) {
        newFlags.push(result.flag);
      }

      // Escalate ban
      const newBanRecord = escalateBan(state.banRecord, `Rate limit violation: ${itemType}`);

      set({
        flags: newFlags,
        banRecord: newBanRecord,
      });

      return false;
    }

    // Record the acquisition timestamp
    // Clean up timestamps outside the window (keep last 60 seconds)
    const cleanedTimestamps = record.timestamps.filter(t => now - t < 60_000);
    cleanedTimestamps.push(now);

    set({
      rateLimits: {
        ...state.rateLimits,
        [itemType]: {
          itemType,
          timestamps: cleanedTimestamps,
        },
      },
    });

    return true;
  },

  isBanned: () => {
    const { banRecord } = get();
    if (banRecord.currentBanUntil === null) return false;
    return banRecord.currentBanUntil > Date.now();
  },

  getBanExpiry: () => {
    const { banRecord } = get();
    if (banRecord.currentBanUntil === null) return null;
    if (banRecord.currentBanUntil <= Date.now()) return null;
    return banRecord.currentBanUntil;
  },

  getSerializableState: () => {
    const state = get();
    return {
      transactionLog: state.transactionLog,
      rateLimits: state.rateLimits,
      flags: state.flags,
      banRecord: state.banRecord,
      sequenceCounter: state.sequenceCounter,
    };
  },

  loadState: (saved) => {
    set({
      transactionLog: saved.transactionLog || [],
      rateLimits: saved.rateLimits || {},
      flags: saved.flags || [],
      banRecord: saved.banRecord || createInitialBanRecord(),
      sequenceCounter: saved.sequenceCounter || 0,
    });
  },
}));
