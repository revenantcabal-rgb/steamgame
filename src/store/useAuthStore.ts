import { create } from 'zustand';
import type { BanRecord } from '../types/anticheat';
import {
  authService,
  _getLocalAccounts,
  _saveLocalAccounts,
  _saveLocalSession,
  _clearLocalSession,
  _loadLocalGuestSlots,
  _simpleHash,
} from '../lib/authService';
import { isSupabaseConfigured } from '../lib/supabase';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  isGuest: boolean;
  createdAt: number;
  banRecord?: BanRecord;
}

export interface CharacterSlot {
  slotIndex: number;
  name: string;
  /** Summary info for the select screen */
  level: number;
  heroCount: number;
  lastPlayedAt: number;
  /** The localStorage key holding the full save */
  saveKey: string;
  /** Whether the player has chosen their starter hero for this slot */
  starterHeroChosen?: boolean;
  /** The class ID of the starter hero chosen for this slot */
  starterClassId?: string | null;
}

const MAX_SLOTS = 4;

interface AuthState {
  user: UserAccount | null;
  isGuest: boolean;
  activeSlot: number | null;
  characterSlots: CharacterSlot[];
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  loginWithEmail: (emailOrUsername: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeGuest: (email: string, username: string, password: string) => Promise<boolean>;
  clearError: () => void;

  selectSlot: (slotIndex: number) => void;
  createCharacter: (slotIndex: number, name: string) => void;
  deleteCharacter: (slotIndex: number) => void;
  updateSlotMetadata: (slotIndex: number, meta: Partial<Pick<CharacterSlot, 'level' | 'heroCount' | 'lastPlayedAt'>>) => void;
  backToSlotSelect: () => void;

  getSaveKey: () => string | null;
  checkBan: () => boolean;
}

// ── Slot persistence helpers (localStorage-only, shared between modes) ──

interface StoredAccountCompat {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  slots: CharacterSlot[];
  banRecord?: BanRecord;
}

function persistSlots(userId: string, isGuest: boolean, slots: CharacterSlot[]) {
  if (isGuest) {
    localStorage.setItem(`wasteland_guest_slots_${userId}`, JSON.stringify(slots));
  } else {
    const accounts = _getLocalAccounts() as StoredAccountCompat[];
    const idx = accounts.findIndex(a => a.id === userId);
    if (idx >= 0) {
      accounts[idx].slots = slots;
      _saveLocalAccounts(accounts);
    }
  }
}

function loadGuestSlots(guestId: string): CharacterSlot[] {
  return _loadLocalGuestSlots(guestId) as CharacterSlot[];
}

// ── Store ──

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isGuest: false,
  activeSlot: null,
  characterSlots: [],
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const sessionUser = await authService.getSession();

      if (!sessionUser) {
        set({ isLoading: false });
        return;
      }

      // For local-mode guests, load their slots from localStorage
      let slots: CharacterSlot[] = [];
      if (sessionUser.isGuest && !isSupabaseConfigured()) {
        slots = loadGuestSlots(sessionUser.id);
      } else if (!sessionUser.isGuest && !isSupabaseConfigured()) {
        const accounts = _getLocalAccounts() as StoredAccountCompat[];
        const account = accounts.find(a => a.id === sessionUser.id);
        slots = (account?.slots as CharacterSlot[]) || [];
      }

      set({
        user: sessionUser,
        isGuest: sessionUser.isGuest,
        characterSlots: slots,
        isLoading: false,
      });
    } catch (e) {
      console.error('[useAuthStore] initialize failed:', e);
      set({ isLoading: false });
    }
  },

  loginWithEmail: async (emailOrUsername, password) => {
    const { user, error } = await authService.login(emailOrUsername, password);
    if (error || !user) {
      set({ error: error ?? 'Login failed.' });
      return false;
    }

    // Load character slots (local mode)
    let slots: CharacterSlot[] = [];
    if (!isSupabaseConfigured()) {
      const accounts = _getLocalAccounts() as StoredAccountCompat[];
      const account = accounts.find(a => a.id === user.id);
      slots = (account?.slots as CharacterSlot[]) || [];
    }

    set({
      user,
      isGuest: false,
      characterSlots: slots,
      activeSlot: null,
      error: null,
    });
    return true;
  },

  register: async (email, username, password) => {
    const { user, error } = await authService.register(email, username, password);
    if (error || !user) {
      set({ error: error ?? 'Registration failed.' });
      return false;
    }

    set({
      user,
      isGuest: false,
      characterSlots: [],
      activeSlot: null,
      error: null,
    });
    return true;
  },

  loginAsGuest: async () => {
    const { user, error } = await authService.loginAsGuest();
    if (error || !user) {
      set({ error: error ?? 'Guest login failed.' });
      return;
    }

    set({
      user,
      isGuest: true,
      characterSlots: [],
      activeSlot: null,
      error: null,
    });
  },

  logout: async () => {
    await authService.logout();
    // Also clear local session in case we're in local mode
    if (!isSupabaseConfigured()) {
      _clearLocalSession();
    }
    set({
      user: null,
      isGuest: false,
      activeSlot: null,
      characterSlots: [],
      error: null,
    });
  },

  upgradeGuest: async (email, username, password) => {
    const state = get();
    if (!state.user || !state.isGuest) return false;

    const { error } = await authService.upgradeGuest(email, username, password);
    if (error) {
      set({ error });
      return false;
    }

    if (isSupabaseConfigured()) {
      // Supabase handles the upgrade internally; refresh session
      const updatedUser = await authService.getSession();
      if (updatedUser) {
        set({
          user: updatedUser,
          isGuest: false,
          error: null,
        });
      }
      return true;
    }

    // Local mode: create the real account, migrate saves
    const accounts = _getLocalAccounts() as StoredAccountCompat[];
    const id = state.user.id.replace('guest_', 'user_');
    const newAccount: StoredAccountCompat = {
      id,
      username,
      email,
      passwordHash: _simpleHash(password),
      createdAt: state.user.createdAt,
      slots: state.characterSlots,
    };
    accounts.push(newAccount);
    _saveLocalAccounts(accounts);

    // Migrate guest save keys to new user ID
    for (const slot of state.characterSlots) {
      const oldKey = slot.saveKey;
      const newKey = oldKey.replace(state.user.id, id);
      const data = localStorage.getItem(oldKey);
      if (data) {
        localStorage.setItem(newKey, data);
        localStorage.removeItem(oldKey);
      }
    }

    _saveLocalSession(id, false);
    set({
      user: { id, username, email, isGuest: false, createdAt: newAccount.createdAt },
      isGuest: false,
      characterSlots: newAccount.slots.map(s => ({ ...s, saveKey: s.saveKey.replace(state.user!.id, id) })),
      error: null,
    });
    return true;
  },

  clearError: () => set({ error: null }),

  selectSlot: (slotIndex) => {
    const slot = get().characterSlots.find(s => s.slotIndex === slotIndex);
    if (slot) {
      set({ activeSlot: slotIndex });
    }
  },

  createCharacter: (slotIndex, name) => {
    const state = get();
    if (!state.user) return;
    if (slotIndex < 0 || slotIndex >= MAX_SLOTS) return;
    if (state.characterSlots.find(s => s.slotIndex === slotIndex)) return;

    const saveKey = `wasteland_save_${state.user.id}_slot${slotIndex}`;
    const newSlot: CharacterSlot = {
      slotIndex,
      name: name || `Survivor ${slotIndex + 1}`,
      level: 1,
      heroCount: 0,
      lastPlayedAt: Date.now(),
      saveKey,
      starterHeroChosen: false,
      starterClassId: null,
    };

    const newSlots = [...state.characterSlots, newSlot];
    set({ characterSlots: newSlots, activeSlot: slotIndex });
    persistSlots(state.user.id, state.isGuest, newSlots);
  },

  deleteCharacter: (slotIndex) => {
    const state = get();
    if (!state.user) return;

    const slot = state.characterSlots.find(s => s.slotIndex === slotIndex);
    if (slot) {
      localStorage.removeItem(slot.saveKey);
    }

    const newSlots = state.characterSlots.filter(s => s.slotIndex !== slotIndex);
    set({ characterSlots: newSlots });
    persistSlots(state.user.id, state.isGuest, newSlots);
  },

  updateSlotMetadata: (slotIndex, meta) => {
    const state = get();
    if (!state.user) return;

    const newSlots = state.characterSlots.map(s =>
      s.slotIndex === slotIndex ? { ...s, ...meta, lastPlayedAt: Date.now() } : s
    );
    set({ characterSlots: newSlots });
    persistSlots(state.user.id, state.isGuest, newSlots);
  },

  backToSlotSelect: () => {
    set({ activeSlot: null });
  },

  getSaveKey: () => {
    const state = get();
    const slot = state.characterSlots.find(s => s.slotIndex === state.activeSlot);
    return slot?.saveKey || null;
  },

  checkBan: () => {
    const state = get();
    if (!state.user?.banRecord?.currentBanUntil) return false;
    return state.user.banRecord.currentBanUntil > Date.now();
  },
}));
