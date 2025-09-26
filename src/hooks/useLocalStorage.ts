import { useEffect, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  defaultState: T,
  onLoad?: (o: T) => T,
) {
  const [state, setState] = useState<T>(() => {
    // Try to initialize to state stored in localStorage
    try {
      const storedJson = localStorage.getItem(key);
      if (storedJson) {
        const loaded = JSON.parse(storedJson) as T;
        return onLoad ? onLoad(loaded) : loaded;
      } else {
        return defaultState;
      }
    } catch (error) {
      console.error("Failed to parse stored JSON from localStorage", error);
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}
