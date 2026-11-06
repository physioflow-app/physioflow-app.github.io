import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWebLLM } from '../../src/hooks/useWebLLM';

const program = { weeks: [{ exercises: [{ name: 'Heel Slides', instructions: ['Slide your heel.'] }] }] };
const success = {
  ok: true,
  json: async () => ({ candidates: [{ content: { parts: [
    { thought: true, text: 'Hidden reasoning' }, { text: JSON.stringify(program) },
  ] } }] }),
};

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('AI request recovery', () => {
  it('retries rate limits with backoff and reads the final text instead of thought parts', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 429 }).mockResolvedValue(success);
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWebLLM());
    await act(async () => {
      const pending = result.current.generate('Synthetic input');
      await vi.runAllTimersAsync();
      expect((await pending).searchQuery).toBe('Synthetic input');
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('ready');
  });

  it('stops after three service failures and reports an actionable error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 503 });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWebLLM());
    await act(async () => {
      const pending = result.current.generate('Synthetic input').catch((error: Error) => error);
      await vi.runAllTimersAsync();
      expect(await pending).toEqual(new Error('AI service error (503). Please try again.'));
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.current.status).toBe('error');
  });

  it('aborts requests that never complete and eventually restores the error state', async () => {
    const fetchMock = vi.fn().mockImplementation((_url, options: RequestInit) => new Promise((_resolve, reject) => {
      options.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useWebLLM());
    await act(async () => {
      const pending = result.current.generate('Synthetic input').catch((error: Error) => error);
      await vi.runAllTimersAsync();
      expect(await pending).toEqual(new Error('AI service timed out. Please try again.'));
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.current.status).toBe('error');
  });
});
