import { useCallback, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import App from "./App";
import { GameState, type StateUpdater } from "./classes/GameState";
import type { GameData } from "./types";

export function AppSpectator() {
  const { roomId } = useParams();
  const [data, setData] = useState<GameData>(() => ({
    players: [],
    rounds: [],
  }));

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

  // TODO add socket connection logic for spectating a game

  return (
    <>
      <hr />
      <h1 className="text-center">
        Spectating Room <code className="fw-bold text-white">{roomId}</code>
      </h1>
      <hr />
      <App gs={gameState} readonly />
    </>
  );
}
