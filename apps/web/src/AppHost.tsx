import { useCallback, useMemo, useRef } from "react";
import App from "./App";
import { GameState, type StateUpdater } from "./classes/GameState";
import * as clr from "./color";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { GameData, Player } from "./types";

export function AppHost() {
  const defaultData = useMemo(() => GameState.createDefaultGameData(), []);

  // --- Main application state
  const handleInitialLoad = (gd: GameData) => ({
    players: sanitizePlayerColors(gd.players),
    rounds: gd.rounds,
  });

  // This automatically persists to local storage and loads from it initially
  const [data, setData] = useLocalStorage<GameData>(
    "gameData",
    defaultData,
    handleInitialLoad,
  );

  // TODO ------------------------------------------------NEW STUFF-----

  const dataRef = useRef<GameData>(data);
  const setDataWithRefSync = useCallback(
    (updater: StateUpdater<GameData>) => {
      setData((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        dataRef.current = next;
        return next;
      });
    },
    [setData],
  );

  const gameState = useMemo(
    () =>
      new GameState({
        get: () => dataRef.current,
        set: setDataWithRefSync,
      }),
    [setDataWithRefSync],
  );

  // const gs = useGameState();

  // TODO add socket connection logic for hosting a game

  return <App gs={gameState} />;
}

function sanitizePlayerColors(players: readonly Player[]) {
  // Migration from state yet missing player colors
  return players.map((p) => (p.color ? p : { ...p, color: clr.randomRgb() }));
}
