/**
 * The app used hash URLs (e.g. /#/program/neck) before it had real paths.
 * Rewrite them in place so old bookmarks and shared links keep working.
 */
export function redirectLegacyHashUrl() {
  if (typeof window === 'undefined') return;
  const { hash } = window.location;
  if (hash.startsWith('#/')) window.history.replaceState(window.history.state, '', hash.slice(1) || '/');
}
