import type { GameItemId, RateLimitRecord, AnticheatFlag, BanRecord } from '../types/anticheat';

const CLIENT_SALT = 'wasteland_v1';

/** Default rate limit thresholds per item type (max count per window) */
const DEFAULT_RATE_LIMITS: Record<string, { windowMs: number; maxCount: number }> = {
  gear: { windowMs: 60_000, maxCount: 5 },
  resource: { windowMs: 60_000, maxCount: 200 },
  consumable: { windowMs: 60_000, maxCount: 20 },
};

/** Ban escalation durations in milliseconds */
const BAN_DURATIONS = [
  86_400_000,       // 1st offense: 1 day
  604_800_000,      // 2nd offense: 7 days
  315_360_000_000,  // 3rd+ offense: 10 years
];

/**
 * Compute a simple deterministic hash (not crypto — structure for server to later validate with HMAC).
 */
export function computeChecksum(input: string, salt: string): string {
  const combined = input + salt;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate a verifiable game ID.
 * Format: {type}_{creatorId}_{timestamp}_{nonce}_{checksum}
 */
export function generateGameId(type: GameItemId['type'], creatorId: string): string {
  const timestamp = Date.now();
  const nonce = Math.random().toString(36).slice(2, 10); // 8 chars of random base36
  const checksumInput = `${type}_${creatorId}_${timestamp}_${nonce}`;
  const checksum = computeChecksum(checksumInput, CLIENT_SALT);
  return `${type}_${creatorId}_${timestamp}_${nonce}_${checksum}`;
}

/**
 * Parse and verify a game ID's checksum.
 */
export function validateGameId(gameId: string): { valid: boolean; parsed: GameItemId | null } {
  // Format: {type}_{creatorId}_{timestamp}_{nonce}_{checksum}
  // creatorId itself may contain underscores (e.g. "user_123456_abc123")
  // Strategy: type is first segment, checksum is last, nonce is second-to-last,
  // timestamp is third-to-last, everything in between is creatorId
  const parts = gameId.split('_');
  if (parts.length < 5) {
    return { valid: false, parsed: null };
  }

  const type = parts[0] as GameItemId['type'];
  const validTypes: GameItemId['type'][] = ['gear', 'resource', 'consumable', 'tool', 'ability', 'pass'];
  if (!validTypes.includes(type)) {
    return { valid: false, parsed: null };
  }

  const checksum = parts[parts.length - 1];
  const nonce = parts[parts.length - 2];
  const timestamp = parseInt(parts[parts.length - 3], 10);

  if (isNaN(timestamp)) {
    return { valid: false, parsed: null };
  }

  // creatorId is everything between type and timestamp
  const creatorId = parts.slice(1, parts.length - 3).join('_');
  if (!creatorId) {
    return { valid: false, parsed: null };
  }

  // Verify checksum
  const checksumInput = `${type}_${creatorId}_${timestamp}_${nonce}`;
  const expectedChecksum = computeChecksum(checksumInput, CLIENT_SALT);

  if (checksum !== expectedChecksum) {
    return { valid: false, parsed: null };
  }

  return {
    valid: true,
    parsed: {
      gameId,
      type,
      creatorId,
      createdAt: timestamp,
      nonce,
      checksum,
    },
  };
}

/**
 * Rolling-window rate limit check.
 * Returns whether the action is allowed, and optionally a flag if it's not.
 */
export function checkRateLimit(
  records: RateLimitRecord,
  now: number,
  windowMs?: number,
  maxCount?: number,
): { allowed: boolean; flag?: AnticheatFlag } {
  const defaults = DEFAULT_RATE_LIMITS[records.itemType] || { windowMs: 60_000, maxCount: 50 };
  const window = windowMs ?? defaults.windowMs;
  const max = maxCount ?? defaults.maxCount;

  // Filter timestamps to only those within the window
  const recentTimestamps = records.timestamps.filter(t => now - t < window);

  if (recentTimestamps.length >= max) {
    const flag: AnticheatFlag = {
      id: `flag_${now}_${Math.random().toString(36).slice(2, 8)}`,
      severity: 'violation',
      reason: `Rate limit exceeded for ${records.itemType}: ${recentTimestamps.length}/${max} in ${window}ms window`,
      timestamp: now,
      evidence: {
        itemType: records.itemType,
        count: recentTimestamps.length,
        maxAllowed: max,
        windowMs: window,
      },
    };
    return { allowed: false, flag };
  }

  return { allowed: true };
}

/**
 * Escalate a ban based on offense count.
 * Returns updated ban record with new ban applied.
 */
export function escalateBan(banRecord: BanRecord, reason: string): BanRecord {
  const now = Date.now();
  const newOffenseCount = banRecord.offenseCount + 1;
  const durationIndex = Math.min(newOffenseCount - 1, BAN_DURATIONS.length - 1);
  const duration = BAN_DURATIONS[durationIndex];
  const expiresAt = now + duration;

  return {
    offenseCount: newOffenseCount,
    currentBanUntil: expiresAt,
    banHistory: [
      ...banRecord.banHistory,
      { bannedAt: now, expiresAt, reason },
    ],
  };
}
