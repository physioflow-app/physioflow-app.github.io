import { describe, expect, it, vi } from 'vitest';
import { getPageMeta, indexableRoutes, render } from '../../src/entry-server';
// @ts-expect-error -- plain JavaScript build script
import { applyMeta } from '../../scripts/meta.mjs';

const template = `<head><title>Old</title><meta name="description" content="old" /><link rel="canonical" href="https://x/" />
<meta property="og:url" content="https://x/" /><meta property="og:title" content="old" /></head>`;

function serverRender(url?: string) {
  vi.stubGlobal('window', undefined);
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  try {
    return { html: render(url), fetchMock };
  } finally {
    vi.unstubAllGlobals();
  }
}

describe('crawlable pages', () => {
  it('renders a meaningful homepage without a browser or an AI request', () => {
    const { html, fetchMock } = serverRender();
    expect(html).toContain('Free personalized exercise programs');
    expect(html).toContain('How PhysioFlow works');
    expect(html).toContain('Browse ready-made programs');
    expect(html).toContain('href="/program/neck"');
    expect(html).toContain('href="https://itzsid.github.io/"');
    expect(html).toContain('Siddharth Choudhary');
    expect(html).not.toContain('Your Programs');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renders each ready-made program page with its exercises', () => {
    expect(indexableRoutes()).toHaveLength(16);
    expect(indexableRoutes()).not.toContain('/program/neck-back');
    const { html } = serverRender('/program/neck');
    expect(html).toContain('Neck Pain Relief');
    expect(html).toContain('Chin Tucks');
  });

  it('gives program pages their own title and canonical URL, and keeps personal pages out of search', () => {
    expect(getPageMeta('/program/neck-back').canonical).toBe('https://physioflow-app.github.io/program/neck');
    expect(getPageMeta('/').canonical).toBe('https://physioflow-app.github.io/');
    expect(getPageMeta('/plan/ai-123').canonical).toBeNull();
    const page = applyMeta(template, { title: 'A & B', description: 'Desc "quoted"', canonical: 'https://y/p' });
    expect(page).toContain('<title>A &amp; B</title>');
    expect(page).toContain('content="Desc &quot;quoted&quot;"');
    expect(page).toContain('href="https://y/p"');
    expect(page).toContain('og:url" content="https://y/p"');
    const hidden = applyMeta(template, { title: 'T', description: 'D', canonical: null });
    expect(hidden).not.toContain('rel="canonical"');
    expect(hidden).toContain('<meta name="robots" content="noindex" />');
  });
});
