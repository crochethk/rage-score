import { useEffect, useState } from "react";

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
