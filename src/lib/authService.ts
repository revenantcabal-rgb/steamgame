import { supabase, isSupabaseConfigured } from './supabase';
import type { BanRecord } from '../types/anticheat';

// ── Public types ──

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isGuest: boolean;
  createdAt: number;
  banRecord?: BanRecord;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

export interface SteamUserInfo {
  steamId: string;
  name: string;
}

export interface AuthService {
  login(emailOrUsername: string, password: string): Promise<AuthResult>;
  register(email: string, username: string, password: string): Promise<AuthResult>;
  loginAsGuest(): Promise<AuthResult>;
  loginWithSteam(steamTicketOrInfo: string | SteamUserInfo): Promise<AuthResult>;
  logout(): Promise<void>;
  getSession(): Promise<AuthUser | null>;
  upgradeGuest(email: string, username: string, password: string): Promise<{ error: string | null }>;
}

// ── localStorage mock helpers (extracted from old useAuthStore) ──

const AUTH_STORAGE_KEY = 'wasteland_auth';
const ACCOUNTS_STORAGE_KEY = 'wasteland_accounts';

interface StoredAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  slots: unknown[];
  banRecord?: BanRecord;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

function loadAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function saveSession(userId: string, isGuest: boolean) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId, isGuest }));
}

function loadSession(): { userId: string; isGuest: boolean } | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function loadGuestSlots(guestId: string): unknown[] {
  try {
    const raw = localStorage.getItem(`wasteland_guest_slots_${guestId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ── Supabase implementation ──

const supabaseAuth: AuthService = {
  async login(emailOrUsername, password) {
    if (!supabase) return { user: null, error: 'Supabase not configured' };

    // Supabase auth requires email; if the user entered a username, look it up
    let email = emailOrUsername;
    if (!emailOrUsername.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', emailOrUsername)
        .maybeSingle();

      if (!profile) {
        return { user: null, error: 'Account not found.' };
      }

      // Retrieve the email from auth.users via a profile lookup is not directly possible,
      // so we try signing in with the username as email as a fallback. In practice the
      // client should pass the email. For now, return an error asking for email.
      return { user: null, error: 'Please sign in with your email address.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Login failed.' };
    }

    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, is_banned, ban_until, ban_count')
      .eq('id', data.user.id)
      .maybeSingle();

    const authUser: AuthUser = {
      id: data.user.id,
      username: profile?.username ?? data.user.email ?? 'User',
      email: data.user.email ?? '',
      isGuest: false,
      createdAt: new Date(data.user.created_at).getTime(),
      banRecord: profile?.is_banned
        ? { offenseCount: profile.ban_count ?? 0, currentBanUntil: profile.ban_until ? new Date(profile.ban_until).getTime() : null, banHistory: [] }
        : undefined,
    };

    return { user: authUser, error: null };
  },

  async register(email, username, password) {
    if (!supabase) return { user: null, error: 'Supabase not configured' };

    if (!email || !username || !password) {
      return { user: null, error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters.' };
    }
    if (username.length < 3) {
      return { user: null, error: 'Username must be at least 3 characters.' };
    }

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .maybeSingle();

    if (existing) {
      return { user: null, error: 'Username already taken.' };
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Registration failed.' };
    }

    // Create profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id, username });

    if (profileError) {
      console.error('[authService] Profile creation failed:', profileError.message);
      // Auth user was created but profile failed — still return user
    }

    const authUser: AuthUser = {
      id: data.user.id,
      username,
      email,
      isGuest: false,
      createdAt: new Date(data.user.created_at).getTime(),
    };

    return { user: authUser, error: null };
  },

  async loginAsGuest() {
    if (!supabase) return { user: null, error: 'Supabase not configured' };

    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      return { user: null, error: error.message };
    }

    if (!data.user) {
      return { user: null, error: 'Guest login failed.' };
    }

    // Create a minimal profile for the anonymous user
    await supabase
      .from('profiles')
      .upsert({ id: data.user.id, username: `Guest_${data.user.id.slice(0, 8)}` })
      .select();

    const authUser: AuthUser = {
      id: data.user.id,
      username: 'Guest',
      email: '',
      isGuest: true,
      createdAt: new Date(data.user.created_at).getTime(),
    };

    return { user: authUser, error: null };
  },

  async loginWithSteam(steamTicketOrInfo) {
    // If we receive a SteamUserInfo object, create a local session as offline fallback.
    // Real server-side ticket validation will be handled by Supabase Edge Functions later.
    if (typeof steamTicketOrInfo === 'object' && steamTicketOrInfo !== null) {
      const info = steamTicketOrInfo as SteamUserInfo;
      const steamId = info.steamId;
      const name = info.name || `Steam_${steamId.slice(-8)}`;
      const id = `steam_${steamId}`;

      saveSession(id, false);

      // Persist the account locally so getSession can restore it
      const accounts = loadAccounts();
      let account = accounts.find(a => a.id === id);
      if (!account) {
        account = {
          id,
          username: name,
          email: `${steamId}@steam.local`,
          passwordHash: '',
          createdAt: Date.now(),
          slots: [],
        };
        accounts.push(account);
        saveAccounts(accounts);
      }

      return {
        user: {
          id,
          username: name,
          email: `${steamId}@steam.local`,
          isGuest: false,
          createdAt: account.createdAt,
        },
        error: null,
      };
    }

    // String ticket: requires server-side validation via Edge Functions (not yet implemented)
    return { user: null, error: 'Steam login requires server-side validation. Not yet implemented.' };
  },

  async logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getSession() {
    if (!supabase) return null;

    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.user) return null;

    const user = session.user;
    const isAnonymous = user.is_anonymous ?? false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, is_banned, ban_until, ban_count')
      .eq('id', user.id)
      .maybeSingle();

    return {
      id: user.id,
      username: profile?.username ?? (isAnonymous ? 'Guest' : user.email ?? 'User'),
      email: user.email ?? '',
      isGuest: isAnonymous,
      createdAt: new Date(user.created_at).getTime(),
      banRecord: profile?.is_banned
        ? { offenseCount: profile.ban_count ?? 0, currentBanUntil: profile.ban_until ? new Date(profile.ban_until).getTime() : null, banHistory: [] }
        : undefined,
    };
  },

  async upgradeGuest(email, username, password) {
    if (!supabase) return { error: 'Supabase not configured' };

    if (!email || !username || !password) {
      return { error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    // Check username uniqueness
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .maybeSingle();

    if (existing) {
      return { error: 'Username already taken.' };
    }

    // Update the anonymous user's credentials
    const { error } = await supabase.auth.updateUser({ email, password });
    if (error) {
      return { error: error.message };
    }

    // Update profile
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.user) {
      await supabase
        .from('profiles')
        .update({ username })
        .eq('id', session.session.user.id);
    }

    return { error: null };
  },
};

// ── localStorage (mock/offline) implementation ──

const localAuth: AuthService = {
  async login(emailOrUsername, password) {
    const accounts = loadAccounts();
    const account = accounts.find(a =>
      a.email.toLowerCase() === emailOrUsername.toLowerCase() ||
      a.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (!account) {
      return { user: null, error: 'Account not found.' };
    }

    if (account.passwordHash !== simpleHash(password)) {
      return { user: null, error: 'Invalid password.' };
    }

    saveSession(account.id, false);

    return {
      user: {
        id: account.id,
        username: account.username,
        email: account.email,
        isGuest: false,
        createdAt: account.createdAt,
        banRecord: account.banRecord,
      },
      error: null,
    };
  },

  async register(email, username, password) {
    if (!email || !username || !password) {
      return { user: null, error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { user: null, error: 'Password must be at least 6 characters.' };
    }
    if (username.length < 3) {
      return { user: null, error: 'Username must be at least 3 characters.' };
    }

    const accounts = loadAccounts();
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: 'Email already registered.' };
    }
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
      return { user: null, error: 'Username already taken.' };
    }

    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const newAccount: StoredAccount = {
      id,
      username,
      email,
      passwordHash: simpleHash(password),
      createdAt: Date.now(),
      slots: [],
    };
    accounts.push(newAccount);
    saveAccounts(accounts);
    saveSession(id, false);

    return {
      user: { id, username, email, isGuest: false, createdAt: newAccount.createdAt },
      error: null,
    };
  },

  async loginAsGuest() {
    const guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    saveSession(guestId, true);

    return {
      user: { id: guestId, username: 'Guest', email: '', isGuest: true, createdAt: Date.now() },
      error: null,
    };
  },

  async loginWithSteam(steamTicketOrInfo) {
    // Offline fallback: accept a SteamUserInfo object and create a local session
    if (typeof steamTicketOrInfo === 'object' && steamTicketOrInfo !== null) {
      const info = steamTicketOrInfo as SteamUserInfo;
      const steamId = info.steamId;
      const name = info.name || `Steam_${steamId.slice(-8)}`;
      const id = `steam_${steamId}`;

      saveSession(id, false);

      // Persist the account locally so getSession can restore it
      const accounts = loadAccounts();
      let account = accounts.find(a => a.id === id);
      if (!account) {
        account = {
          id,
          username: name,
          email: `${steamId}@steam.local`,
          passwordHash: '',
          createdAt: Date.now(),
          slots: [],
        };
        accounts.push(account);
        saveAccounts(accounts);
      }

      return {
        user: {
          id,
          username: name,
          email: `${steamId}@steam.local`,
          isGuest: false,
          createdAt: account.createdAt,
        },
        error: null,
      };
    }

    return { user: null, error: 'Steam login is not available in offline mode.' };
  },

  async logout() {
    clearSession();
  },

  async getSession() {
    const session = loadSession();
    if (!session) return null;

    const accounts = loadAccounts();
    const account = accounts.find(a => a.id === session.userId);

    if (account) {
      return {
        id: account.id,
        username: account.username,
        email: account.email,
        isGuest: false,
        createdAt: account.createdAt,
        banRecord: account.banRecord,
      };
    }

    if (session.isGuest) {
      // Restore guest — we don't have full info, just the id
      return {
        id: session.userId,
        username: 'Guest',
        email: '',
        isGuest: true,
        createdAt: Date.now(),
      };
    }

    // Stale session
    clearSession();
    return null;
  },

  async upgradeGuest(email, username, password) {
    if (!email || !username || !password) {
      return { error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters.' };
    }

    const accounts = loadAccounts();
    if (accounts.find(a => a.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Email already registered.' };
    }
    if (accounts.find(a => a.username.toLowerCase() === username.toLowerCase())) {
      return { error: 'Username already taken.' };
    }

    return { error: null };
    // The actual account creation + save migration is handled by the auth store,
    // since it needs access to characterSlots and localStorage save keys.
  },
};

// Returns the stored accounts (for the local-auth slot persistence path)
export function _getLocalAccounts(): StoredAccount[] {
  return loadAccounts();
}
export function _saveLocalAccounts(accounts: StoredAccount[]): void {
  saveAccounts(accounts);
}
export function _saveLocalSession(userId: string, isGuest: boolean): void {
  saveSession(userId, isGuest);
}
export function _clearLocalSession(): void {
  clearSession();
}
export function _loadLocalGuestSlots(guestId: string): unknown[] {
  return loadGuestSlots(guestId);
}
export { simpleHash as _simpleHash };

// ── Exported singleton — picks the right implementation at startup ──

export const authService: AuthService = isSupabaseConfigured() ? supabaseAuth : localAuth;
