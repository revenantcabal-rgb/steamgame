import { create } from 'zustand';

const SETTINGS_KEY = 'wasteland_settings';

interface GameSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  isMuted: boolean;
  showDamageNumbers: boolean;
  autoCollectMarket: boolean;
  compactMode: boolean;

  setMasterVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  setMuted: (v: boolean) => void;
  setShowDamageNumbers: (v: boolean) => void;
  setAutoCollectMarket: (v: boolean) => void;
  setCompactMode: (v: boolean) => void;
}

function loadSettings(): Partial<GameSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as Partial<GameSettings>;
  } catch {
    // ignore
  }
  return {};
}

function saveSettings(state: GameSettings) {
  try {
    const data = {
      masterVolume: state.masterVolume,
      sfxVolume: state.sfxVolume,
      musicVolume: state.musicVolume,
      isMuted: state.isMuted,
      showDamageNumbers: state.showDamageNumbers,
      autoCollectMarket: state.autoCollectMarket,
      compactMode: state.compactMode,
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const defaults = {
  masterVolume: 80,
  sfxVolume: 80,
  musicVolume: 50,
  isMuted: false,
  showDamageNumbers: true,
  autoCollectMarket: false,
  compactMode: false,
};

const saved = loadSettings();

export const useSettingsStore = create<GameSettings>((set, get) => ({
  ...defaults,
  ...saved,

  setMasterVolume: (v) => { set({ masterVolume: v }); saveSettings({ ...get(), masterVolume: v }); },
  setSfxVolume: (v) => { set({ sfxVolume: v }); saveSettings({ ...get(), sfxVolume: v }); },
  setMusicVolume: (v) => { set({ musicVolume: v }); saveSettings({ ...get(), musicVolume: v }); },
  setMuted: (v) => { set({ isMuted: v }); saveSettings({ ...get(), isMuted: v }); },
  setShowDamageNumbers: (v) => { set({ showDamageNumbers: v }); saveSettings({ ...get(), showDamageNumbers: v }); },
  setAutoCollectMarket: (v) => { set({ autoCollectMarket: v }); saveSettings({ ...get(), autoCollectMarket: v }); },
  setCompactMode: (v) => { set({ compactMode: v }); saveSettings({ ...get(), compactMode: v }); },
}));
