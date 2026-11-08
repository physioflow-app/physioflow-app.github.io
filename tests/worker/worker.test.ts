// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error -- plain JavaScript Worker
import worker, { sanitize } from '../../worker/index.js';

const origin = 'https://physioflow-app.github.io';
const body = {
  system_instruction: { parts: [{ text: 'system' }] },
  contents: [{ role: 'user', parts: [{ text: 'user' }] }],
  generationConfig: { temperature: 0.3, maxOutputTokens: 999999, responseMimeType: 'application/json' },
  tools: [{ googleSearch: {} }],
};
const post = (headers: Record<string, string> = {}, payload: unknown = body) =>
  new Request('https://worker.test/', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(payload) });

afterEach(() => vi.unstubAllGlobals());

describe('Gemini proxy Worker', () => {
  it('forwards only allowlisted fields with capped limits', async () => {
    const upstream = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', upstream);
    const response = await worker.fetch(post(), { GEMINI_API_KEY: 'key' });
    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
    const [url, init] = upstream.mock.calls[0];
    expect(url).toContain('gemini-2.5-flash:generateContent');
    expect(init.headers['x-goog-api-key']).toBe('key');
    const sent = JSON.parse(init.body);
    expect(sent.tools).toBeUndefined();
    expect(sent.generationConfig.maxOutputTokens).toBe(8192);
  });

  it('refuses other origins, bad requests, and rate-limited clients', async () => {
    vi.stubGlobal('fetch', vi.fn());
    expect((await worker.fetch(post({ Origin: 'https://evil.test' }), {})).status).toBe(403);
    expect((await worker.fetch(post({}, { contents: [] }), {})).status).toBe(400);
    const limited = { RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: false }) } };
    expect((await worker.fetch(post(), limited)).status).toBe(429);
    expect(sanitize({ ...body, contents: [...body.contents, ...body.contents] })).toBeNull();
  });
});
