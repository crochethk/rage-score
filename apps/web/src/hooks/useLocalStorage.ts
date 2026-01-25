import { useEffect, useState } from "react";

/**
 * A React hook that keeps a piece of state persisted in `localStorage` and synced
 * across browser tabs/windows. This is done using "storage" events emitted by
 * Web Storage API on changes to the storage area.
 *
 * When this hook is first called, it attempts to load the value from `localStorage`.
 * If no or an invalid value is found in storage, `defaultValue` is used instead.
 *
 * Cross-tab synchronization ignores invalid values (indicated by a parsing error)
 * and does not support removal of the full key. Both cases will log an error to
 * the console and keep the current state.
 *
 * `onInitialLoad` is a transformation function applied once if the value is
 * initially loaded from storage (useful for migration or sanitization purposes).
 *
 * @template T - Type of the managed state.
 * @param key - Key to use for the storage entry.
 * @param defaultValue - Fallback value. Should be stable (primitive or memoized object).
 * @param onInitialLoad - Transformation applied only on initial load from storage.
 * @returns A readonly tuple [state, setState] (similar to `useState`).
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  onInitialLoad?: (o: T) => T,
) {
  const [state, setState] = useState<T>(() => {
    const storedJson = localStorage.getItem(key);
    if (storedJson === null) {
      // no previous value
      return defaultValue;
    }
    // try parse stored value
    try {
      const loaded = JSON.parse(storedJson) as T;
      return onInitialLoad ? onInitialLoad(loaded) : loaded;
    } catch (error) {
      console.error(`Failed to parse '${key}': '${storedJson}'.`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  // Listen to storage events to sync state across tabs/windows
  useEffect(() => {
    const syncHandler = (e: StorageEvent) => {
      if (e.storageArea === localStorage && e.key === key) {
        if (e.newValue === null) {
          console.warn(
            `Ignored external localStorage change: key "${key}" was removed, which is not supported.`,
          );
          return;
        }

        try {
          setState(JSON.parse(e.newValue) as T);
        } catch (error) {
          console.error(`Failed to parse '${e.key}': '${e.newValue}'.`, error);
          return;
        }
      }
    };
    window.addEventListener("storage", syncHandler);
    return () => window.removeEventListener("storage", syncHandler);
  }, [key]);

  return [state, setState] as const;
}
