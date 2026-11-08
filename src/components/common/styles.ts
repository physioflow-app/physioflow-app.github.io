import type React from 'react';
import { brand, fonts } from '../../theme';

export const primaryButton: React.CSSProperties = {
  padding: '12px 24px', borderRadius: 100, border: 'none', background: brand.forest, color: 'white',
  fontFamily: fonts.body, fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
};

export const secondaryButton: React.CSSProperties = {
  ...primaryButton, border: `2px solid ${brand.forest}`, background: 'transparent', color: brand.forest,
};

export const textButton: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: fonts.body,
  fontSize: 13, color: brand.forest, textDecoration: 'underline', textUnderlineOffset: 3,
};

export const card: React.CSSProperties = {
  background: 'white', borderRadius: 20, padding: 'clamp(18px, 4vw, 28px)', border: `1px solid ${brand.warm}`,
};

export const pageWidth: React.CSSProperties = { maxWidth: 960, margin: '0 auto', padding: '0 16px' };
