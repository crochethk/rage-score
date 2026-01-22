import { useMemo } from "react";
import App from "./App";
import { GameState } from "./classes/GameState";
import * as clr from "./color";
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

  // TODO ------------------------------------------------NEW STUFF-----

  const gs = useGameState(() => data, setData);

  // TODO add socket connection logic for hosting a game

  return <App gs={gs} />;
}

function sanitizePlayerColors(players: readonly Player[]) {
  // Migration from state yet missing player colors
  return players.map((p) => (p.color ? p : { ...p, color: clr.randomRgb() }));
}
