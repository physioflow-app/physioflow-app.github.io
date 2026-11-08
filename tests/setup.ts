import '@testing-library/jest-dom';
import { vi } from 'vitest';

// localStorage backed by an in-memory store that is emptied between tests.
const store = new Map<string, string>();
const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { store.set(key, String(value)); }),
  removeItem: vi.fn((key: string) => { store.delete(key); }),
  clear: vi.fn(() => { store.clear(); }),
};

// Node-environment tests (e.g. the Worker) have no window.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
}

beforeEach(() => {
  store.clear();
  localStorageMock.getItem.mockReset().mockImplementation((key: string) => store.get(key) ?? null);
  localStorageMock.setItem.mockReset().mockImplementation((key: string, value: string) => { store.set(key, String(value)); });
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
