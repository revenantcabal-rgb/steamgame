/**
 * Platform detection hook for Steam vs Web.
 *
 * When running in Electron (Steam build), window.__STEAM__ will be set by the preload script.
 * On the web version, it's always false.
 *
 * This hook provides a clean abstraction so game code never directly checks for Electron.
 * All Steam-specific features (achievements, cloud saves, overlay, microtransactions)
 * go through this hook.
 */

declare global {
  interface Window {
    /**
     * Set to `true` by the Electron preload script when running the Steam build.
     * Legacy shape (object with initialized/appId/etc.) is also supported.
     */
    __STEAM__?: boolean | {
      initialized: boolean;
      appId: number;
      userId: string;
      userName: string;
    };
    __STEAM_API__?: {
      isAvailable: () => Promise<boolean>;
      getUserInfo: () => Promise<{ steamId: string; name: string; appId: number } | null>;
      unlockAchievement: (achievementId: string) => Promise<boolean>;
      setStat: (statName: string, value: number) => Promise<boolean>;
      cloudSave: (key: string, data: string) => Promise<boolean>;
      cloudLoad: (key: string) => Promise<string | null>;
    };
  }
}

export interface PlatformInfo {
  isSteam: boolean;
  isWeb: boolean;
  steamUserId: string | null;
  steamUserName: string | null;
  appId: number | null;
}

export function usePlatform(): PlatformInfo {
  const steam = window.__STEAM__;
  const isSteam = steam === true || (typeof steam === 'object' && !!steam?.initialized);

  return {
    isSteam,
    isWeb: !isSteam,
    steamUserId: typeof steam === 'object' ? steam?.userId ?? null : null,
    steamUserName: typeof steam === 'object' ? steam?.userName ?? null : null,
    appId: typeof steam === 'object' ? steam?.appId ?? null : null,
  };
}

/**
 * Achievement unlock wrapper. No-ops on web.
 */
export async function unlockAchievement(achievementId: string): Promise<boolean> {
  try {
    if (window.__STEAM_API__?.unlockAchievement) {
      return await window.__STEAM_API__.unlockAchievement(achievementId);
    }
  } catch (e) {
    console.warn('Steam achievement unlock failed:', e);
  }
  // Web: log for debugging, could track locally
  console.log(`[Achievement] ${achievementId} (web - not sent to Steam)`);
  return false;
}

/**
 * Steam stat tracking wrapper. No-ops on web.
 */
export async function setSteamStat(statId: string, value: number): Promise<boolean> {
  try {
    if (window.__STEAM_API__?.setStat) {
      return await window.__STEAM_API__.setStat(statId, value);
    }
  } catch (e) {
    console.warn('Steam stat update failed:', e);
  }
  return false;
}

/**
 * Steam Cloud save wrapper. Falls back to localStorage on web.
 */
export async function cloudSave(key: string, data: string): Promise<boolean> {
  try {
    if (window.__STEAM_API__?.cloudSave) {
      return await window.__STEAM_API__.cloudSave(key, data);
    }
  } catch (e) {
    console.warn('Steam cloud save failed:', e);
  }
  // Web fallback: localStorage
  try {
    localStorage.setItem(key, data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Steam Cloud load wrapper. Falls back to localStorage on web.
 */
export async function cloudLoad(key: string): Promise<string | null> {
  try {
    if (window.__STEAM_API__?.cloudLoad) {
      return await window.__STEAM_API__.cloudLoad(key);
    }
  } catch (e) {
    console.warn('Steam cloud load failed:', e);
  }
  return localStorage.getItem(key);
}
