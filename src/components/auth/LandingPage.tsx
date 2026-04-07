import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { LegalModal } from '../legal/LegalPages';
import type { LegalPage } from '../legal/LegalPages';

type AuthTab = 'guest' | 'register' | 'login';

// ── Styles ──

const glassPanel: React.CSSProperties = {
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  background: 'rgba(22, 19, 15, 0.85)',
  border: '1px solid rgba(212, 168, 67, 0.2)',
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(12, 10, 8, 0.8)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  padding: '10px 14px',
  color: 'var(--color-text-primary)',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
};

const goldGradientBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #d4a843 0%, #b8860b 50%, #d4a843 100%)',
  color: '#0c0a08',
  fontWeight: 700,
  fontSize: '15px',
  letterSpacing: '0.08em',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  cursor: 'pointer',
  textTransform: 'uppercase' as const,
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--color-accent)',
  fontWeight: 600,
  fontSize: '14px',
  border: '1px solid var(--color-accent)',
  borderRadius: '8px',
  padding: '12px 28px',
  cursor: 'pointer',
  letterSpacing: '0.04em',
  transition: 'background 0.2s, color 0.2s',
};

const featureCardStyle: React.CSSProperties = {
  ...glassPanel,
  padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
  textAlign: 'center',
  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
  cursor: 'default',
};

// ── Auth Card ──

function AuthCard() {
  const [tab, setTab] = useState<AuthTab>('guest');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const error = useAuthStore((s) => s.error);

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    border: 'none',
    borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
    background: 'transparent',
    color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
    transition: 'color 0.2s, border-color 0.2s',
  });

  const handleLogin = async () => {
    const { loginWithEmail } = useAuthStore.getState();
    await loginWithEmail(email || username, password);
  };

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      useAuthStore.setState({ error: 'Passwords do not match' });
      return;
    }
    const { register: reg } = useAuthStore.getState();
    await reg(email, username, password);
  };

  const handleGuest = async () => {
    await useAuthStore.getState().loginAsGuest();
  };

  return (
    <div style={{ ...glassPanel, padding: '24px 20px', width: '100%', maxWidth: 'min(380px, 92vw)' }}>
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid rgba(212, 168, 67, 0.15)', marginBottom: 20 }}>
        <button style={tabBtnStyle(tab === 'guest')} onClick={() => setTab('guest')}>Guest</button>
        <button style={tabBtnStyle(tab === 'register')} onClick={() => setTab('register')}>Register</button>
        <button style={tabBtnStyle(tab === 'login')} onClick={() => setTab('login')}>Login</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(200, 50, 50, 0.15)',
          border: '1px solid rgba(200, 50, 50, 0.4)',
          borderRadius: 6,
          padding: '8px 12px',
          marginBottom: 16,
          fontSize: 12,
          color: '#e57373',
        }}>
          {error}
        </div>
      )}

      {/* Guest Tab */}
      {tab === 'guest' && (
        <div className="flex flex-col gap-4" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.5 }}>
            Jump in instantly. No account required. Your progress saves locally.
          </p>
          <button
            style={{ ...goldGradientBtn, width: '100%' }}
            onClick={handleGuest}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 168, 67, 0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Play as Guest
          </button>
        </div>
      )}

      {/* Register Tab */}
      {tab === 'register' && (
        <div className="flex flex-col gap-3">
          <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={inputStyle} type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input style={inputStyle} type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <button
            style={{ ...goldGradientBtn, width: '100%', marginTop: 4 }}
            onClick={handleRegister}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 168, 67, 0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Register
          </button>
        </div>
      )}

      {/* Login Tab */}
      {tab === 'login' && (
        <div className="flex flex-col gap-3">
          <input style={inputStyle} type="text" placeholder="Email or Username" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button
            style={{ ...goldGradientBtn, width: '100%', marginTop: 4 }}
            onClick={handleLogin}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 168, 67, 0.35)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
}

// ── Feature Card ──

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div
      style={featureCardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.6)';
        e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.45)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.2)';
      }}
    >
      <div style={{ fontSize: 'clamp(36px, 8vw, 48px)', marginBottom: 12, lineHeight: 1 }}>{icon}</div>
      <h3 style={{
        color: 'var(--color-accent)',
        fontSize: 16,
        fontWeight: 700,
        letterSpacing: '0.06em',
        marginBottom: 10,
      }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
}

// ── Stat Item ──

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 clamp(12px, 3vw, 24px)' }}>
      <div style={{
        color: 'var(--color-accent)',
        fontSize: 'clamp(24px, 5vw, 32px)',
        fontWeight: 800,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{
        color: 'var(--color-text-muted)',
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

// ── Main Landing Page ──

export function LandingPage() {
  const [legalPage, setLegalPage] = useState<LegalPage | null>(null);

  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    { icon: '\u26CF\uFE0F', title: 'Gather & Craft', description: '5 gathering skills, 5 production skills. Mine ore, forge weapons, brew potions, and build tools.' },
    { icon: '\u2694\uFE0F', title: 'Recruit Heroes', description: '16 unique hero classes across 5 categories. Build your perfect squad for combat and expeditions.' },
    { icon: '\uD83C\uDFD7\uFE0F', title: 'Build Your Encampment', description: '20 buildings providing passive bonuses. Assign workers, upgrade structures, and grow your settlement.' },
    { icon: '\uD83D\uDC80', title: 'Idle Combat', description: 'Deploy heroes to combat zones. Auto-battle enemies, defeat bosses, and collect rare loot drops.' },
    { icon: '\uD83D\uDC65', title: 'Worker Population', description: 'Individual workers with stats, ranks, and specializations. From Recruit to Legend \u2014 each worker is unique.' },
    { icon: '\uD83C\uDFEA', title: 'Trade & Compete', description: 'Player marketplace, guild system, PVP arenas, and Starlight ascension tree.' },
  ];

  const stats = [
    { value: '16', label: 'Hero Classes' },
    { value: '20', label: 'Buildings' },
    { value: '40+', label: 'Resources' },
    { value: '78', label: 'Abilities' },
  ];

  return (
    <div className="flex-1 w-full" style={{ scrollBehavior: 'smooth', overflowY: 'auto', overflowX: 'hidden', height: '100dvh' }}>

      {/* ── Section 1: Hero ── */}
      <section
        id="hero-section"
        className="flex items-center justify-center"
        style={{ minHeight: '100dvh', padding: 'clamp(20px, 4vw, 40px) clamp(16px, 4vw, 24px)' }}
      >
        <div
          className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-12"
          style={{ maxWidth: 1100, width: '100%', margin: '0 auto' }}
        >
          {/* Left: Copy */}
          <div className="flex-1 lg:flex-[0_0_55%] text-center lg:text-left" style={{ minWidth: 0 }}>
            <h1 style={{
              color: 'var(--color-accent)',
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textShadow: '0 0 30px rgba(212, 168, 67, 0.4)',
              lineHeight: 1.1,
              marginBottom: 12,
            }}>
              WASTELAND GRIND
            </h1>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'clamp(16px, 2vw, 22px)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              marginBottom: 20,
            }}>
              Post-Apocalyptic Idle RPG
            </p>
            <p style={{
              color: 'var(--color-text-muted)',
              fontSize: 'clamp(13px, 2vw, 15px)',
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: 'clamp(20px, 4vw, 32px)',
              margin: '0 auto 32px',
            }}>
              Survive the irradiated wasteland. Build your encampment, recruit heroes, train workers,
              craft gear, and dominate the apocalypse. Solo or with friends.
            </p>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button
                style={goldGradientBtn}
                onClick={scrollToTop}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212, 168, 67, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Enter the Wasteland
              </button>
              <button
                style={ghostBtn}
                onClick={scrollToFeatures}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 168, 67, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="w-full lg:flex-[0_0_40%] flex justify-center" style={{ minWidth: 0 }}>
            <AuthCard />
          </div>
        </div>
      </section>

      {/* ── Section 2: Feature Showcase ── */}
      <section
        id="features-section"
        style={{ padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)', background: 'rgba(12, 10, 8, 0.6)' }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            color: 'var(--color-accent)',
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textShadow: '0 0 20px rgba(212, 168, 67, 0.3)',
            marginBottom: 48,
          }}>
            FORGE YOUR DESTINY
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
            className="feature-grid"
          >
            {features.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
            ))}
          </div>
        </div>

        {/* Responsive grid overrides via inline style tag */}
        <style>{`
          @media (max-width: 900px) {
            .feature-grid { grid-template-columns: repeat(2, 1fr) !important; }
          }
          @media (max-width: 560px) {
            .feature-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ── Section 3: Stats Banner ── */}
      <section style={{
        padding: '48px 24px',
        background: 'rgba(8, 6, 4, 0.85)',
        borderTop: '1px solid rgba(212, 168, 67, 0.1)',
        borderBottom: '1px solid rgba(212, 168, 67, 0.1)',
      }}>
        <div
          className="flex flex-wrap justify-center items-center gap-4 sm:gap-8"
          style={{ maxWidth: 900, margin: '0 auto' }}
        >
          {stats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4 sm:gap-8">
              <StatItem value={s.value} label={s.label} />
              {i < stats.length - 1 && (
                <div style={{
                  width: 1,
                  height: 40,
                  background: 'rgba(212, 168, 67, 0.2)',
                }} className="hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 4: Call to Action ── */}
      <section style={{
        padding: 'clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px)',
        textAlign: 'center',
        background: 'rgba(12, 10, 8, 0.4)',
      }}>
        <h2 style={{
          color: 'var(--color-text-primary)',
          fontSize: 'clamp(24px, 3vw, 36px)',
          fontWeight: 800,
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}>
          Ready to Survive?
        </h2>
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 15,
          marginBottom: 28,
          lineHeight: 1.6,
        }}>
          Join the wasteland and start your journey today.
        </p>
        <button
          style={{ ...goldGradientBtn, fontSize: 16, padding: '16px 48px' }}
          onClick={scrollToTop}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(212, 168, 67, 0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Play Now
        </button>

        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 11,
          marginTop: 32,
          lineHeight: 1.6,
        }}>
          By playing, you agree to our{' '}
          <span
            onClick={() => setLegalPage('terms')}
            style={{
              color: 'var(--color-accent)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Terms of Service
          </span>{' '}
          and{' '}
          <span
            onClick={() => setLegalPage('privacy')}
            style={{
              color: 'var(--color-accent)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            Privacy Policy
          </span>
        </p>
      </section>

      {/* ── Legal Modal ── */}
      {legalPage && <LegalModal page={legalPage} onClose={() => setLegalPage(null)} />}
    </div>
  );
}
