import { useCallback, useState } from "react";

export function useHexHex() {
  const [hexHexActive, setHexHexActive] = useState(false);
  const runHexHex = useCallback(() => {
    if (!hexHexActive) {
      setHexHexActive(true);
      setTimeout(() => {
        setHexHexActive(false);
      }, 10000);
    }
  }, [hexHexActive]);
  return [hexHexActive, runHexHex] as const;
}
