import tokens from './tokens.json';

/** Brand colours. Single source of truth, shared with tailwind.config.js. */
export const brand = tokens;

export const fonts = {
  display: "'DM Serif Display', Georgia, serif",
  body: "'DM Sans', sans-serif",
} as const;
