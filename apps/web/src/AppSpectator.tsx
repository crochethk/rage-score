import { useState } from "react";
import { useParams } from "react-router";
import App from "./App";
import { useGameState } from "./hooks/useGameState";
import type { GameData } from "./types";

export function AppSpectator() {
  const { roomId } = useParams();
  const [data, setData] = useState<GameData>({ players: [], rounds: [] });
  const gs = useGameState(() => data, setData);

  // TODO add socket connection logic for spectating a game

  return (
    <>
      <hr />
      <h1 className="text-center">
        Spectating Room <code className="fw-bold text-white">{roomId}</code>
      </h1>
      <hr />
      <App gs={gs} readonly />
    </>
  );
}
