import { describe, expect, it, vi } from 'vitest';
import { render } from '../../src/entry-server';

describe('crawlable homepage', () => {
  it('renders meaningful HTML without a browser or an AI request', () => {
    vi.stubGlobal('window', undefined);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    try {
      const html = render();
      expect(html).toContain('Free personalized exercise programs');
      expect(html).toContain('How PhysioFlow works');
      expect(html).toContain('href="https://itzsid.github.io/"');
      expect(html).toContain('Siddharth Choudhary');
      expect(html).not.toContain('Saved Programs');
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
