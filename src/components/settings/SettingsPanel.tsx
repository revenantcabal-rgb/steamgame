import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAchievementStore } from '../../store/useAchievementStore';
import { useGameStore } from '../../store/useGameStore';
import { usePopulationStore } from '../../store/usePopulationStore';
import { useHeroStore } from '../../store/useHeroStore';
import { useEquipmentStore } from '../../store/useEquipmentStore';
import { useCombatZoneStore } from '../../store/useCombatZoneStore';
import { useExpeditionStore } from '../../store/useExpeditionStore';
import { useStoryStore } from '../../store/useStoryStore';
import { useMarketStore } from '../../store/useMarketStore';
import { useAnticheatStore } from '../../store/useAnticheatStore';
import { ACHIEVEMENTS } from '../../config/achievements';
import { LegalLinks } from '../legal/LegalPages';

// ── Volume Slider ──

function VolumeSlider({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs w-16 shrink-0" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex-1 h-1 cursor-pointer"
        style={{ accentColor: 'var(--color-accent)' }}
      />
      <span className="text-xs w-8 text-right" style={{ color: disabled ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
        {value}
      </span>
    </div>
  );
}

// ── Toggle Switch ──

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-10 h-5 rounded-full cursor-pointer relative transition-colors"
        style={{
          backgroundColor: checked ? 'var(--color-accent)' : 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <div
          className="w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all"
          style={{
            backgroundColor: checked ? '#000' : 'var(--color-text-muted)',
            left: checked ? '20px' : '2px',
          }}
        />
      </button>
    </div>
  );
}

// ── Section wrapper ──

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded mb-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-bold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

// ── Main Settings Panel ──

export function SettingsPanel() {
  const user = useAuthStore(s => s.user);
  const isGuest = useAuthStore(s => s.isGuest);
  const activeSlot = useAuthStore(s => s.activeSlot);
  const characterSlots = useAuthStore(s => s.characterSlots);
  const backToSlotSelect = useAuthStore(s => s.backToSlotSelect);
  const logout = useAuthStore(s => s.logout);
  const upgradeGuest = useAuthStore(s => s.upgradeGuest);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const currentSlot = characterSlots.find(s => s.slotIndex === activeSlot);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await upgradeGuest(email, username, password);
    if (ok) setShowUpgrade(false);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Settings</h2>

      {/* 1. Account Info */}
      <SettingsSection title="Account">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Username</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{user?.username || 'Unknown'}</span>
          </div>
          {!isGuest && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Email</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{user?.email}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Account Type</span>
            <span style={{ color: isGuest ? 'var(--color-energy)' : 'var(--color-success)' }}>
              {isGuest ? 'Guest' : 'Registered'}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--color-text-muted)' }}>Character</span>
            <span style={{ color: 'var(--color-text-primary)' }}>{currentSlot?.name || `Slot ${(activeSlot || 0) + 1}`}</span>
          </div>
        </div>

        {isGuest && !showUpgrade && (
          <button onClick={() => { setShowUpgrade(true); clearError(); }}
            className="w-full mt-3 py-2 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
            Upgrade to Full Account
          </button>
        )}

        {isGuest && showUpgrade && (
          <form onSubmit={handleUpgrade} className="mt-3 space-y-2">
            {error && (
              <div className="p-2 rounded text-xs" style={{ backgroundColor: 'rgba(231,76,60,0.15)', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full p-2 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
              className="w-full p-2 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
            <input type="password" placeholder="Password (6+ chars)" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full p-2 rounded text-xs"
              style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }} />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 rounded text-xs font-bold cursor-pointer"
                style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
                Upgrade
              </button>
              <button type="button" onClick={() => setShowUpgrade(false)}
                className="flex-1 py-2 rounded text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </SettingsSection>

      {/* 2. Audio Settings */}
      <AudioSettings />

      {/* 3. Display Settings */}
      <DisplaySettings />

      {/* 4. Achievements */}
      <AchievementsSection />

      {/* 5. Data Management */}
      <DataManagementSection />

      {/* Story Repair */}
      <SettingsSection title="Story Progress">
        <div className="space-y-2">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            If your Story progress appears stuck, click below to recheck your current objective against your actual game state.
          </p>
          <button
            onClick={() => {
              useStoryStore.getState().recheckCurrentObjective();
              useGameStore.getState().addLog('Story progress rechecked.', 'system');
            }}
            className="w-full py-2 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-info)', color: '#fff', border: 'none' }}
          >
            Recheck Story Progress
          </button>
        </div>
      </SettingsSection>

      {/* 6. Actions */}
      <SettingsSection title="Actions">
        <div className="space-y-2">
          <button onClick={backToSlotSelect}
            className="w-full py-2 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}>
            Switch Character
          </button>
          <button onClick={() => void logout()}
            className="w-full py-2 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}>
            Logout
          </button>
        </div>
      </SettingsSection>

      {/* Legal Links */}
      <div className="pb-4">
        <LegalLinks />
      </div>
    </div>
  );
}

// ── Audio Settings ──

function AudioSettings() {
  const masterVolume = useSettingsStore(s => s.masterVolume);
  const sfxVolume = useSettingsStore(s => s.sfxVolume);
  const musicVolume = useSettingsStore(s => s.musicVolume);
  const isMuted = useSettingsStore(s => s.isMuted);
  const setMasterVolume = useSettingsStore(s => s.setMasterVolume);
  const setSfxVolume = useSettingsStore(s => s.setSfxVolume);
  const setMusicVolume = useSettingsStore(s => s.setMusicVolume);
  const setMuted = useSettingsStore(s => s.setMuted);

  return (
    <SettingsSection title="Audio">
      <div className="space-y-3">
        <VolumeSlider label="Master" value={masterVolume} onChange={setMasterVolume} disabled={isMuted} />
        <VolumeSlider label="SFX" value={sfxVolume} onChange={setSfxVolume} disabled={isMuted} />
        <VolumeSlider label="Music" value={musicVolume} onChange={setMusicVolume} disabled={isMuted} />
        <ToggleSwitch label="Mute All" checked={isMuted} onChange={setMuted} />
      </div>
    </SettingsSection>
  );
}

// ── Display Settings ──

function DisplaySettings() {
  const showDamageNumbers = useSettingsStore(s => s.showDamageNumbers);
  const compactMode = useSettingsStore(s => s.compactMode);
  const autoCollectMarket = useSettingsStore(s => s.autoCollectMarket);
  const setShowDamageNumbers = useSettingsStore(s => s.setShowDamageNumbers);
  const setCompactMode = useSettingsStore(s => s.setCompactMode);
  const setAutoCollectMarket = useSettingsStore(s => s.setAutoCollectMarket);

  return (
    <SettingsSection title="Display">
      <div className="space-y-3">
        <ToggleSwitch
          label="Show Damage Numbers"
          description="Display floating damage numbers in combat"
          checked={showDamageNumbers}
          onChange={setShowDamageNumbers}
        />
        <ToggleSwitch
          label="Compact UI Mode"
          description="Reduce spacing and element sizes"
          checked={compactMode}
          onChange={setCompactMode}
        />
        <ToggleSwitch
          label="Auto-collect Market Items"
          description="Automatically collect completed market orders"
          checked={autoCollectMarket}
          onChange={setAutoCollectMarket}
        />
      </div>
    </SettingsSection>
  );
}

// ── Achievements Section ──

function AchievementsSection() {
  const unlockedIds = useAchievementStore(s => s.unlockedIds);
  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <SettingsSection title="Achievements">
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        <span style={{ color: 'var(--color-accent)' }}>{unlockedCount}</span> / {totalCount} unlocked
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {ACHIEVEMENTS.map(ach => {
          const unlocked = unlockedIds.includes(ach.id);
          return (
            <div
              key={ach.id}
              className="flex items-center gap-3 p-2 rounded"
              style={{
                backgroundColor: unlocked ? 'rgba(241, 196, 15, 0.08)' : 'var(--color-bg-tertiary)',
                border: unlocked ? '1px solid rgba(241, 196, 15, 0.3)' : '1px solid transparent',
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <span className="text-lg" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>
                {ach.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold" style={{ color: unlocked ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                  {ach.name}
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {ach.description}
                </div>
              </div>
              {unlocked && (
                <span className="text-xs" style={{ color: 'var(--color-success)' }}>Unlocked</span>
              )}
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}

// ── Data Management ──

const FULL_SAVE_VERSION = 11;

function DataManagementSection() {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const saveKey = useAuthStore.getState().getSaveKey();
    if (!saveKey) return;

    const data = localStorage.getItem(saveKey);
    if (!data) return;

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wasteland-grind-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed.version || !parsed.game) {
          alert('Invalid save file: missing required fields.');
          return;
        }

        const saveKey = useAuthStore.getState().getSaveKey();
        if (!saveKey) {
          alert('No active save slot. Please select a character first.');
          return;
        }

        localStorage.setItem(saveKey, text);

        // Reload stores from the imported data
        if (parsed.version === FULL_SAVE_VERSION) {
          useGameStore.getState().loadState(parsed.game);
          usePopulationStore.getState().loadState(parsed.population);
          if (parsed.heroes) useHeroStore.getState().loadState(parsed.heroes);
          if (parsed.equipment) useEquipmentStore.getState().loadState(parsed.equipment);
          if (parsed.combat) useCombatZoneStore.getState().loadState(parsed.combat);
          if (parsed.expedition) useExpeditionStore.getState().loadState(parsed.expedition);
          if (parsed.market) useMarketStore.getState().loadState(parsed.market);
          if (parsed.anticheat) useAnticheatStore.getState().loadState(parsed.anticheat);
          if (parsed.achievements) useAchievementStore.getState().loadState(parsed.achievements);
          useGameStore.getState().addLog('Save data imported successfully.', 'system');
        } else {
          alert(`Unsupported save version: ${parsed.version}. Expected version ${FULL_SAVE_VERSION}.`);
        }
      } catch {
        alert('Failed to import save: invalid JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = () => {
    const saveKey = useAuthStore.getState().getSaveKey();
    if (saveKey) {
      localStorage.removeItem(saveKey);
    }
    localStorage.removeItem('wasteland_settings');
    setShowClearConfirm(false);
    window.location.reload();
  };

  const btnStyle = {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  };

  return (
    <SettingsSection title="Data Management">
      <div className="space-y-2">
        <button
          onClick={handleExport}
          className="w-full py-2 rounded text-xs font-bold cursor-pointer"
          style={btnStyle}
        >
          Export Save
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 rounded text-xs font-bold cursor-pointer"
          style={btnStyle}
        >
          Import Save
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-2 rounded text-xs font-bold cursor-pointer"
            style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
          >
            Clear Local Data
          </button>
        ) : (
          <div className="p-3 rounded" style={{ backgroundColor: 'rgba(231,76,60,0.1)', border: '1px solid var(--color-danger)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--color-danger)' }}>
              This will permanently delete all local save data and settings. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClearData}
                className="flex-1 py-2 rounded text-xs font-bold cursor-pointer"
                style={{ backgroundColor: 'var(--color-danger)', color: '#fff', border: 'none' }}
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded text-xs cursor-pointer"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </SettingsSection>
  );
}
