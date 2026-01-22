import { useMemo, useRef } from "react";
import { GameState, type StateStrategy } from "../classes/GameState";
import type { GameData } from "../types";

export function useGameState(
  gameData: () => GameData,
  setGameData: React.Dispatch<React.SetStateAction<GameData>>,
): GameState {
  const strategy = useStableStrategy(gameData, setGameData);
  const gameState = useMemo(() => new GameState(strategy), [strategy]);
  return gameState;
}

function useStableStrategy(
  gameData: () => GameData,
  setGameData: React.Dispatch<React.SetStateAction<GameData>>,
) {
  const strategyRef = useRef<StateStrategy<GameData>>({
    get: gameData,
    set: setGameData,
  });

  // ref is intentionally updated during render to keep a stable
  // imperative strategy container. This does not affect render output
  // and is safe for concurrent rendering because it is not read by React.
  // eslint-disable-next-line react-hooks/refs
  strategyRef.current.get = gameData;
  // eslint-disable-next-line react-hooks/refs
  strategyRef.current.set = setGameData;
  // eslint-disable-next-line react-hooks/refs
  return strategyRef.current;
}
