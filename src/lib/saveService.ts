import { supabase, isSupabaseConfigured } from './supabase';

// ── Debounce tracking for Supabase writes ──
const SUPABASE_SYNC_INTERVAL_MS = 60_000;
const _pendingWrites = new Map<string, { data: string; timer: ReturnType<typeof setTimeout> }>();

/**
 * Save data to storage.
 * Always writes to localStorage immediately.
 * If Supabase is configured, also writes to the remote `saves` table.
 */
export async function saveToDB(saveKey: string, data: string): Promise<void> {
  // Always save locally (instant)
  try {
    localStorage.setItem(saveKey, data);
  } catch (e) {
    console.error('[saveService] localStorage write failed:', e);
  }

  // If Supabase configured, also persist remotely
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;

      const parsed = JSON.parse(data);

      // Upsert into saves table keyed by slot_id
      // The saveKey encodes slot info; we extract slot_id from metadata if available
      const { error } = await supabase
        .from('saves')
        .upsert(
          {
            user_id: userId,
            slot_id: parsed._slotId ?? saveKey, // caller should attach _slotId
            save_data: parsed,
            version: parsed.version ?? 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slot_id' }
        );

      if (error) {
        console.error('[saveService] Supabase save failed:', error.message);
      }
    } catch (e) {
      console.error('[saveService] Supabase save error:', e);
    }
  }
}

/**
 * Load data from storage.
 * If Supabase is configured, tries remote first; falls back to localStorage.
 * If Supabase is not configured, reads from localStorage directly.
 */
export async function loadFromDB(saveKey: string): Promise<string | null> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (userId) {
        const { data, error } = await supabase
          .from('saves')
          .select('save_data')
          .eq('user_id', userId)
          .limit(1)
          .maybeSingle();

        if (!error && data?.save_data) {
          // Also update local cache
          const json = JSON.stringify(data.save_data);
          localStorage.setItem(saveKey, json);
          return json;
        }
      }
    } catch (e) {
      console.error('[saveService] Supabase load error, falling back to localStorage:', e);
    }
  }

  // Fallback: localStorage
  return localStorage.getItem(saveKey);
}

/**
 * Debounced Supabase write (every 60s) + immediate localStorage write.
 * When Supabase is not configured, this behaves identically to a plain localStorage write.
 */
export function syncSave(saveKey: string, data: string): void {
  // Always write to localStorage immediately
  try {
    localStorage.setItem(saveKey, data);
  } catch (e) {
    console.error('[saveService] localStorage write failed:', e);
  }

  // If Supabase is not configured, we're done
  if (!isSupabaseConfigured() || !supabase) return;

  // Debounce the remote write
  const existing = _pendingWrites.get(saveKey);
  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(() => {
    _pendingWrites.delete(saveKey);
    void saveToDB(saveKey, data);
  }, SUPABASE_SYNC_INTERVAL_MS);

  _pendingWrites.set(saveKey, { data, timer });
}

/**
 * Flush any pending debounced writes immediately.
 * Call this on beforeunload or logout.
 */
export function flushPendingWrites(): void {
  for (const [saveKey, pending] of _pendingWrites) {
    clearTimeout(pending.timer);
    void saveToDB(saveKey, pending.data);
  }
  _pendingWrites.clear();
}
