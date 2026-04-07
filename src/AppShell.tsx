import { useEffect } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { useAnticheatStore } from './store/useAnticheatStore';
import { LandingPage } from './components/auth/LandingPage';
import { CharacterSelect } from './components/auth/CharacterSelect';
import { StarterHeroSelect } from './components/auth/StarterHeroSelect';
import App from './App';

function BanScreen({ expiryDate }: { expiryDate: number }) {
  const logout = useAuthStore(s => s.logout);
  const expiry = new Date(expiryDate);
  const now = Date.now();
  const remainingMs = expiryDate - now;
  const days = Math.floor(remainingMs / 86_400_000);
  const hours = Math.floor((remainingMs % 86_400_000) / 3_600_000);

  return (
    <div className="min-h-screen min-h-dvh w-full flex-1 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="text-center w-full max-w-md p-4 md:p-8 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '2px solid #ef4444' }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ef4444' }}>ACCOUNT SUSPENDED</h1>
        <p className="mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Your account has been suspended due to violations of the game's anti-cheat policy.
        </p>
        <div className="mb-6 p-4 rounded" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>Ban expires:</p>
          <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {expiry.toLocaleDateString()} {expiry.toLocaleTimeString()}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            ({days} days, {hours} hours remaining)
          </p>
        </div>
        <button
          onClick={() => void logout()}
          className="px-6 py-2 rounded font-medium"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)' }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export function AppShell() {
  const user = useAuthStore(s => s.user);
  const activeSlot = useAuthStore(s => s.activeSlot);
  const characterSlots = useAuthStore(s => s.characterSlots);
  const isLoading = useAuthStore(s => s.isLoading);
  const initialize = useAuthStore(s => s.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-dvh w-full flex-1 flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ color: 'var(--color-accent)' }}>WASTELAND GRIND</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show auth screen
  if (!user) {
    return <LandingPage />;
  }

  // Check if banned
  const banExpiry = useAnticheatStore.getState().getBanExpiry();
  if (banExpiry !== null) {
    return <BanScreen expiryDate={banExpiry} />;
  }

  // Logged in but no slot selected → show character select
  if (activeSlot === null) {
    return <CharacterSelect />;
  }

  // Logged in + slot selected → check starter hero
  const currentSlot = characterSlots.find(s => s.slotIndex === activeSlot);
  if (currentSlot && !currentSlot.starterHeroChosen) {
    return <StarterHeroSelect />;
  }

  // Starter hero chosen → game
  return <App />;
}
