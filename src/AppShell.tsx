import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProgramPage } from './pages/ProgramPage';

const brand = {
  forest: '#1B3A2D',
  sage: '#6B8F71',
  mint: '#A8D5BA',
  cream: '#FAF6F1',
  warm: '#F0E6D8',
  terracotta: '#C4704B',
  charcoal: '#2C2C2C',
  stone: '#8C8577',
};

function LogoMark({ size = 36, color = brand.mint }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M32 4C32 4 20 16 20 32C20 48 32 60 32 60" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M32 4C32 4 44 16 44 32C44 48 32 60 32 60" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" />
      <circle cx="32" cy="14" r="3" fill={color} />
      <circle cx="32" cy="26" r="3" fill={color} opacity="0.7" />
      <circle cx="32" cy="38" r="3" fill={color} opacity="0.5" />
      <circle cx="32" cy="50" r="3" fill={color} opacity="0.3" />
    </svg>
  );
}

const AppShell: React.FC = () => {
  return (
      <div style={{ minHeight: '100vh', background: brand.cream, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ background: brand.forest, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <LogoMark size={36} />
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: brand.cream, letterSpacing: '-0.02em' }}>
                  Physio<span style={{ color: brand.sage }}>Flow</span>
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: brand.mint, letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginTop: 2, opacity: 0.7 }}>
                  Move Better. Heal Smarter.
                </div>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/program/:bodyPartId" element={<ProgramPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: `1px solid ${brand.warm}`, background: 'white', padding: '20px 24px', textAlign: 'center' as const }}>
          <p style={{ fontSize: 12, color: brand.stone, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
            Always consult with a healthcare professional before starting any exercise program.
          </p>
          <p style={{ fontSize: 11, color: brand.stone, fontFamily: "'DM Sans', sans-serif", marginTop: 4, opacity: 0.6 }}>
            Progress is saved locally in your browser.
          </p>
          <p style={{ fontSize: 12, color: brand.stone, fontFamily: "'DM Sans', sans-serif", margin: '12px 0 0' }}>
            © {new Date().getFullYear()} · Created by{' '}
            <a href="https://itzsid.github.io/" style={{ color: brand.forest, textUnderlineOffset: 3 }}>
              Siddharth Choudhary
            </a>
          </p>
        </footer>
      </div>
  );
};

export default AppShell;
