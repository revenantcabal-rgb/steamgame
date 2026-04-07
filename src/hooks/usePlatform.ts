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
    __STEAM__?: {
      initialized: boolean;
      appId: number;
      userId: string;
      userName: string;
    };
    __STEAM_API__?: {
      unlockAchievement: (achievementId: string) => Promise<boolean>;
      setStatInt: (statId: string, value: number) => Promise<boolean>;
      cloudSave: (key: string, data: string) => Promise<boolean>;
      cloudLoad: (key: string) => Promise<string | null>;
      activateOverlay: (url?: string) => void;
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

  return {
    isSteam: !!steam?.initialized,
    isWeb: !steam?.initialized,
    steamUserId: steam?.userId ?? null,
    steamUserName: steam?.userName ?? null,
    appId: steam?.appId ?? null,
  };
}

/**
 * Achievement unlock wrapper. No-ops on web.
 */
export async function unlockAchievement(achievementId: string): Promise<boolean> {
  if (window.__STEAM_API__?.unlockAchievement) {
    return window.__STEAM_API__.unlockAchievement(achievementId);
  }
  // Web: log for debugging, could track locally
  console.log(`[Achievement] ${achievementId} (web - not sent to Steam)`);
  return false;
}

/**
 * Steam stat tracking wrapper. No-ops on web.
 */
export async function setSteamStat(statId: string, value: number): Promise<boolean> {
  if (window.__STEAM_API__?.setStatInt) {
    return window.__STEAM_API__.setStatInt(statId, value);
  }
  return false;
}

/**
 * Steam Cloud save wrapper. Falls back to localStorage on web.
 */
export async function cloudSave(key: string, data: string): Promise<boolean> {
  if (window.__STEAM_API__?.cloudSave) {
    return window.__STEAM_API__.cloudSave(key, data);
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
  if (window.__STEAM_API__?.cloudLoad) {
    return window.__STEAM_API__.cloudLoad(key);
  }
  return localStorage.getItem(key);
}
