import { useEffect, useMemo, useRef } from "react";
import App from "./App";
import { GameState } from "./classes/GameState";
import * as clr from "./color";
import { useHostClient } from "./contexts/socket/SocketContext";
import { useGameState } from "./hooks/useGameState";
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

  const gs = useGameState(() => data, setData);
  const { client } = useHostClient();

  useEffect(() => {
    // emit on every change (client debounces)
    client.emitStateSnapshot(data);
  }, [client, data]);

  // Needed to cleanly emit state once on connect, without re-registering the
  // handler on every data change
  const latestDataRef = useRef(data);
  useEffect(() => {
    latestDataRef.current = data;
  }, [data]);

  useEffect(() => {
    return client.onConnected(() => {
      client.emitStateSnapshot(latestDataRef.current);
    });
  }, [client]);

  return (
    <>
      <App gs={gs} />
    </>
  );
}

function sanitizePlayerColors(players: readonly Player[]) {
  // Migration from state yet missing player colors
  return players.map((p) => (p.color ? p : { ...p, color: clr.randomRgb() }));
}
