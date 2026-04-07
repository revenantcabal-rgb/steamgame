import { useState } from 'react';

// ── Shared layout for legal pages ──

function LegalPageWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 p-6 overflow-y-auto" style={{ color: 'var(--color-text-secondary)' }}>
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>{title}</h2>
      <div className="space-y-4 text-xs leading-relaxed">{children}</div>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--color-text-primary)' }}>{heading}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ── EULA ──

export function EULAPage() {
  return (
    <LegalPageWrapper title="End User License Agreement">
      <p>Last updated: April 7, 2026</p>
      <p>
        This End User License Agreement ("EULA") is a legal agreement between you ("User") and
        Wasteland Grind Studios ("Company", "we", "us") governing your use of the Wasteland Grind
        game ("Game"). By installing, accessing, or playing the Game, you agree to be bound by this
        EULA.
      </p>

      <Section heading="1. License Grant">
        <p>
          We grant you a limited, non-exclusive, non-transferable, revocable license to access and
          play the Game for personal, non-commercial entertainment purposes. This license does not
          include the right to sublicense, sell, resell, or commercially exploit the Game or any
          portion thereof.
        </p>
      </Section>

      <Section heading="2. Restrictions">
        <p>You agree not to:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Modify, decompile, reverse-engineer, or disassemble the Game or its source code.</li>
          <li>Use cheats, exploits, automation software, bots, hacks, or any unauthorized third-party tools.</li>
          <li>Attempt to manipulate game data, save files, or network traffic to gain an unfair advantage.</li>
          <li>Copy, distribute, or make the Game available over a network where it could be used by multiple users simultaneously except as intended.</li>
          <li>Remove, alter, or obscure any proprietary notices on the Game.</li>
        </ul>
      </Section>

      <Section heading="3. Ownership">
        <p>
          The Game and all copies thereof are owned by Wasteland Grind Studios and are protected by
          copyright laws and international treaty provisions. All rights not expressly granted in
          this EULA are reserved by the Company.
        </p>
      </Section>

      <Section heading="4. Virtual Items">
        <p>
          The Game may include virtual currencies, items, or other entitlements ("Virtual Items").
          Virtual Items have no real-world monetary value and cannot be redeemed for real money.
          We reserve the right to modify, manage, regulate, or eliminate Virtual Items at any time
          with or without notice.
        </p>
      </Section>

      <Section heading="5. Termination">
        <p>
          This EULA is effective until terminated. We may terminate or suspend your access to the
          Game at any time, with or without cause, including but not limited to violation of this
          EULA or our Terms of Service. Upon termination, you must cease all use of the Game.
        </p>
      </Section>

      <Section heading="6. Disclaimer of Warranties">
        <p>
          THE GAME IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
          FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE GAME WILL
          BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
        </p>
      </Section>

      <Section heading="7. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL WASTELAND GRIND
          STUDIOS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE GAME, EVEN IF ADVISED OF
          THE POSSIBILITY OF SUCH DAMAGES.
        </p>
      </Section>

      <Section heading="8. Governing Law">
        <p>
          This EULA shall be governed by and construed in accordance with the laws of the
          jurisdiction in which Wasteland Grind Studios is established, without regard to conflict
          of law principles.
        </p>
      </Section>

      <Section heading="9. Contact">
        <p>
          For questions about this EULA, contact us at legal@wastelandgrind.example.com.
        </p>
      </Section>
    </LegalPageWrapper>
  );
}

// ── Privacy Policy ──

export function PrivacyPolicyPage() {
  return (
    <LegalPageWrapper title="Privacy Policy">
      <p>Last updated: April 7, 2026</p>
      <p>
        Wasteland Grind Studios ("Company", "we", "us") respects your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information when you use the
        Wasteland Grind game ("Game").
      </p>

      <Section heading="1. Information We Collect">
        <p><strong>Account Data:</strong> When you register, we collect your email address, username, and a hashed password. Guest players are assigned a random identifier stored locally.</p>
        <p><strong>Game Data:</strong> We collect gameplay progress including character data, inventory, achievements, market activity, and skill levels to provide the Game experience and enable cloud saves.</p>
        <p><strong>Device Data:</strong> We may collect basic technical information such as browser type, operating system, and screen resolution for analytics and compatibility purposes.</p>
      </Section>

      <Section heading="2. Cookies and Local Storage">
        <p>
          The Game uses browser localStorage to store your game saves, session tokens, and user
          preferences (such as audio volume and display settings). This data remains on your device
          and is not transmitted to our servers unless you opt in to cloud saves by creating a
          registered account.
        </p>
      </Section>

      <Section heading="3. Third-Party Services">
        <p>We may use the following third-party services:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li><strong>Supabase:</strong> For authentication, cloud save storage, and database services. Supabase processes your account and save data on our behalf.</li>
          <li><strong>Steam (Valve Corporation):</strong> If you access the Game through Steam, Valve may collect additional data as described in the Steam Privacy Policy. Steam achievements and overlay features may interact with your game data.</li>
        </ul>
      </Section>

      <Section heading="4. How We Use Your Information">
        <ul className="list-disc ml-4 space-y-1">
          <li>Provide, maintain, and improve the Game.</li>
          <li>Synchronize game saves across devices (for registered users).</li>
          <li>Detect and prevent cheating, exploits, and abusive behavior.</li>
          <li>Communicate important service updates.</li>
        </ul>
      </Section>

      <Section heading="5. Data Retention">
        <p>
          We retain your account and game data for as long as your account is active. If you delete
          your account, we will remove your personal data within 30 days, except where retention is
          required by law.
        </p>
      </Section>

      <Section heading="6. Your Rights (GDPR / EEA Users)">
        <p>If you are located in the European Economic Area, you have the right to:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your personal data ("right to be forgotten").</li>
          <li>Object to or restrict processing of your data.</li>
          <li>Data portability: receive your data in a structured, machine-readable format.</li>
          <li>Withdraw consent at any time where processing is based on consent.</li>
        </ul>
        <p>To exercise these rights, contact us at privacy@wastelandgrind.example.com.</p>
      </Section>

      <Section heading="7. Children's Privacy">
        <p>
          The Game is not directed at children under 13. We do not knowingly collect personal
          information from children under 13. If we discover we have collected data from a child
          under 13, we will delete it promptly.
        </p>
      </Section>

      <Section heading="8. Security">
        <p>
          We implement reasonable technical and organizational measures to protect your data.
          However, no method of electronic storage or transmission is 100% secure, and we cannot
          guarantee absolute security.
        </p>
      </Section>

      <Section heading="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by posting the updated policy in the Game. Your continued use of the Game
          after changes constitutes acceptance of the revised policy.
        </p>
      </Section>

      <Section heading="10. Contact">
        <p>
          For privacy inquiries, contact us at privacy@wastelandgrind.example.com.
        </p>
      </Section>
    </LegalPageWrapper>
  );
}

// ── Terms of Service ──

export function TermsOfServicePage() {
  return (
    <LegalPageWrapper title="Terms of Service">
      <p>Last updated: April 7, 2026</p>
      <p>
        Welcome to Wasteland Grind. These Terms of Service ("Terms") govern your access to and use
        of the Wasteland Grind game ("Game") provided by Wasteland Grind Studios ("Company", "we",
        "us"). By accessing or using the Game, you agree to these Terms.
      </p>

      <Section heading="1. Eligibility">
        <p>
          You must be at least 13 years old to use the Game. If you are under the age of majority
          in your jurisdiction, you must have parental or guardian consent.
        </p>
      </Section>

      <Section heading="2. Account Responsibilities">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and
          for all activity that occurs under your account. You agree to notify us immediately of
          any unauthorized use of your account.
        </p>
      </Section>

      <Section heading="3. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc ml-4 space-y-1">
          <li>Use the Game for any illegal or unauthorized purpose.</li>
          <li>Harass, abuse, or threaten other players.</li>
          <li>Impersonate any person or entity.</li>
          <li>Exploit bugs or glitches for personal gain; instead, report them to us.</li>
          <li>Sell, trade, or transfer your account or in-game items for real-world value.</li>
          <li>Interfere with or disrupt the Game's servers or networks.</li>
        </ul>
      </Section>

      <Section heading="4. Anti-Cheat Policy">
        <p>
          We employ automated and manual anti-cheat measures to ensure fair play. These include
          server-side validation, statistical anomaly detection, and save-data integrity checks.
          Violations may result in warnings, temporary suspensions, or permanent bans at our sole
          discretion.
        </p>
        <p>
          Specifically prohibited: save file manipulation, memory editing, speed hacking, automated
          scripts or bots, exploiting synchronization bugs, and any other method that provides an
          unfair advantage.
        </p>
      </Section>

      <Section heading="5. Ban Policy">
        <p>
          We reserve the right to suspend or permanently ban accounts that violate these Terms or
          the EULA. Bans may be applied with or without prior warning. Ban reasons include but are
          not limited to: cheating, harassment, account sharing, and repeated violations.
        </p>
        <p>
          If you believe your ban was issued in error, you may appeal by contacting
          support@wastelandgrind.example.com within 30 days.
        </p>
      </Section>

      <Section heading="6. Virtual Items Disclaimer">
        <p>
          All virtual currencies, items, characters, and other in-game assets ("Virtual Items")
          are the property of Wasteland Grind Studios and are licensed, not sold, to you. Virtual
          Items have no real-world monetary value. We may modify, delete, or reset Virtual Items at
          any time for balancing, technical, or other reasons. You have no right to any refund or
          compensation for changes to Virtual Items.
        </p>
      </Section>

      <Section heading="7. Service Availability">
        <p>
          The Game is provided on an "as-available" basis. We do not guarantee uninterrupted
          access. We may modify, suspend, or discontinue the Game or any feature at any time
          without notice or liability.
        </p>
      </Section>

      <Section heading="8. Intellectual Property">
        <p>
          All content, artwork, code, trademarks, and other intellectual property in the Game are
          owned by Wasteland Grind Studios or its licensors. You may not reproduce, distribute, or
          create derivative works without our express written permission.
        </p>
      </Section>

      <Section heading="9. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WASTELAND GRIND STUDIOS SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE
          GAME, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR INTERRUPTION OF
          SERVICE.
        </p>
      </Section>

      <Section heading="10. Changes to Terms">
        <p>
          We may revise these Terms at any time. Material changes will be communicated through the
          Game. Continued use after changes constitutes acceptance.
        </p>
      </Section>

      <Section heading="11. Governing Law">
        <p>
          These Terms are governed by the laws of the jurisdiction in which Wasteland Grind Studios
          is established, without regard to conflict of law principles.
        </p>
      </Section>

      <Section heading="12. Contact">
        <p>
          For questions about these Terms, contact us at legal@wastelandgrind.example.com.
        </p>
      </Section>
    </LegalPageWrapper>
  );
}

// ── Legal Modal ──

export type LegalPage = 'eula' | 'privacy' | 'terms';

interface LegalModalProps {
  page: LegalPage;
  onClose: () => void;
}

export function LegalModal({ page, onClose }: LegalModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg p-0"
        style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded cursor-pointer text-sm font-bold"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
        >
          X
        </button>

        {page === 'eula' && <EULAPage />}
        {page === 'privacy' && <PrivacyPolicyPage />}
        {page === 'terms' && <TermsOfServicePage />}
      </div>
    </div>
  );
}

// ── Legal Links Component (for Settings panel footer) ──

export function LegalLinks() {
  const [activePage, setActivePage] = useState<LegalPage | null>(null);

  return (
    <>
      <div className="flex gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <button
          onClick={() => setActivePage('terms')}
          className="underline cursor-pointer"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0 }}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setActivePage('privacy')}
          className="underline cursor-pointer"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0 }}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setActivePage('eula')}
          className="underline cursor-pointer"
          style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', padding: 0 }}
        >
          EULA
        </button>
      </div>

      {activePage && <LegalModal page={activePage} onClose={() => setActivePage(null)} />}
    </>
  );
}
