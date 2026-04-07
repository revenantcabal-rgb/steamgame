import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LegalModal } from '../legal/LegalPages';
import type { LegalPage } from '../legal/LegalPages';

type AuthTab = 'guest' | 'register' | 'login';

export function AuthScreen() {
  const [activeTab, setActiveTab] = useState<AuthTab>('guest');
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-wider" style={{ color: 'var(--color-accent)' }}>
            WASTELAND GRIND
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Survive. Recruit. Dominate.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {([
              { id: 'guest' as AuthTab, label: 'PLAY AS GUEST' },
              { id: 'register' as AuthTab, label: 'REGISTER' },
              { id: 'login' as AuthTab, label: 'LOGIN' },
            ]).map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex-1 py-3 text-xs font-bold cursor-pointer transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-2 rounded text-xs text-center" style={{ backgroundColor: 'rgba(231,76,60,0.15)', color: 'var(--color-danger)', border: '1px solid var(--color-danger)' }}>
                {error}
              </div>
            )}

            {activeTab === 'guest' && <GuestTab />}
            {activeTab === 'register' && <RegisterTab />}
            {activeTab === 'login' && <LoginTab />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Guest saves are stored locally. Register to enable cloud saves.
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
            By playing, you agree to our{' '}
            <button
              onClick={() => setLegalPage('terms')}
              className="underline cursor-pointer"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0, font: 'inherit' }}
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              onClick={() => setLegalPage('privacy')}
              className="underline cursor-pointer"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0, font: 'inherit' }}
            >
              Privacy Policy
            </button>.
          </p>
        </div>
      </div>

      {legalPage && <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />}
    </div>
  );
}

function GuestTab() {
  const loginAsGuest = useAuthStore(s => s.loginAsGuest);

  return (
    <div className="text-center">
      <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--color-text-primary)' }}>Quick Play</h3>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
        Jump straight in. No account needed. Your progress is saved locally on this device.
        You can upgrade to a full account later without losing progress.
      </p>
      <button
        onClick={() => void loginAsGuest()}
        className="w-full py-3 rounded text-sm font-bold cursor-pointer"
        style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}
      >
        PLAY AS GUEST
      </button>
    </div>
  );
}

function RegisterTab() {
  const register = useAuthStore(s => s.register);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      useAuthStore.setState({ error: 'Passwords do not match.' });
      return;
    }
    void register(email, username, password);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-bold text-lg mb-3 text-center" style={{ color: 'var(--color-text-primary)' }}>Create Account</h3>
      <div className="space-y-3 mb-4">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full p-3 rounded text-sm" style={inputStyle} />
        <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required
          minLength={3} maxLength={20}
          className="w-full p-3 rounded text-sm" style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
          minLength={6}
          className="w-full p-3 rounded text-sm" style={inputStyle} />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
          className="w-full p-3 rounded text-sm" style={inputStyle} />
      </div>
      <button type="submit" className="w-full py-3 rounded text-sm font-bold cursor-pointer"
        style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
        REGISTER
      </button>
    </form>
  );
}

function LoginTab() {
  const loginWithEmail = useAuthStore(s => s.loginWithEmail);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void loginWithEmail(emailOrUsername, password);
  };

  const inputStyle = {
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="font-bold text-lg mb-3 text-center" style={{ color: 'var(--color-text-primary)' }}>Login</h3>
      <div className="space-y-3 mb-4">
        <input type="text" placeholder="Email or Username" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} required
          className="w-full p-3 rounded text-sm" style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
          className="w-full p-3 rounded text-sm" style={inputStyle} />
      </div>
      <button type="submit" className="w-full py-3 rounded text-sm font-bold cursor-pointer"
        style={{ backgroundColor: 'var(--color-accent)', color: '#000', border: 'none' }}>
        LOGIN
      </button>
    </form>
  );
}
