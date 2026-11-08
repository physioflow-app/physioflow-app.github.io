import React from 'react';
import { brand, fonts } from '../../theme';

export const GeneratingIndicator: React.FC = () => (
  <div role="status" aria-live="polite" style={{ background: 'white', borderRadius: 20, padding: 28, border: `1px solid ${brand.warm}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div aria-hidden="true" style={{
        width: 20, height: 20, borderRadius: '50%',
        border: `2px solid ${brand.terracotta}`,
        borderTopColor: brand.forest,
        animation: 'spin 1s linear infinite',
      }} />
      <h3 style={{ fontFamily: fonts.display, fontSize: 16, color: brand.forest, margin: 0 }}>
        Generating your program...
      </h3>
    </div>
    <div style={{ width: '100%', height: 8, borderRadius: 100, background: brand.warm, overflow: 'hidden' }}>
      <div className="shimmer-bar" style={{
        width: '100%', height: 8, borderRadius: 100,
        background: `linear-gradient(to right, ${brand.terracotta}, ${brand.sage})`,
        animation: 'pulseSoft 2s ease-in-out infinite',
      }} />
    </div>
    <p style={{ fontSize: 12, color: brand.stone, margin: '12px 0 0' }}>This usually takes 10-30 seconds.</p>
  </div>
);
