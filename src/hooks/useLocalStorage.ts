import { useCallback, useRef, useSyncExternalStore } from 'react';

type Setter<T> = (value: T | ((prev: T) => T)) => void;

// One shared store per key, so every component using the same key sees the
// same value, and an update in one place is never overwritten by stale state
// held elsewhere. localStorage stays the source of truth.
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();
// Values kept in memory when the browser refuses to store them (e.g. storage full or disabled).
const memoryOnly = new Map<string, unknown>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function read<T>(key: string, initialValue: T): T {
  if (memoryOnly.has(key)) return memoryOnly.get(key) as T;
  const raw = readRaw(key);
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;
  let value = initialValue;
  if (raw) {
    try {
      value = JSON.parse(raw);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function notify(key: string) {
  listeners.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, listener: () => void) {
  const set = listeners.get(key) ?? new Set();
  set.add(listener);
  listeners.set(key, set);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    set.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Reads a stored value outside React. */
export function readLocalStorage<T>(key: string, initialValue: T): T {
  return read(key, initialValue);
}

export function writeLocalStorage<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
    memoryOnly.delete(key);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
    memoryOnly.set(key, value);
  }
  cache.set(key, { raw, value });
  notify(key);
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, Setter<T>] {
  // Keep the first initial value so its identity is stable across renders.
  const initial = useRef(initialValue).current;
  const value = useSyncExternalStore(
    useCallback((listener) => subscribe(key, listener), [key]),
    () => read(key, initial),
    () => initial,
  );
  const setValue = useCallback<Setter<T>>((next) => {
    const previous = read(key, initial);
    writeLocalStorage(key, typeof next === 'function' ? (next as (prev: T) => T)(previous) : next);
  }, [key, initial]);
  return [value, setValue];
}
