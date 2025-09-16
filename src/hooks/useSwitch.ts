import { useState } from "react";

/**
 * @returns A tuple of `[state, setFalse, setTrue]`.
 */
export function useSwitch(initialState: boolean) {
  const [state, setState] = useState(initialState);
  return [state, () => setState(false), () => setState(true)] as const;
}
