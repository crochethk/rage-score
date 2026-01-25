import { useState } from "react";
import { useParams } from "react-router";
import App from "./App";
import * as mock from "./exampleData";
import { useGameState } from "./hooks/useGameState";
import type { GameData } from "./types";

// TODO: remove Mock rooms with example data
const rooms = new Map<string, GameData>([
  ["1", mock.dataSet1],
  ["2", mock.dataSet2],
  ["3", mock.dataSet3],
  ["4", mock.dataSet4],
  ["5", mock.dataSet5],
  ["42", mock.dataSet42],
]);

const emptyData = { players: [], rounds: [] };

export function AppSpectator() {
  const { roomId } = useParams();
  const [data, setData] = useState<GameData>(() => {
    const d = rooms.get(roomId ?? "");
    if (!d) {
      return emptyData;
    }
    return d;
  });
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
