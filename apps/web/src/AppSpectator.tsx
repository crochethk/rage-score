import { useParams } from "react-router";
import App from "./App";
import { useGameState } from "./hooks/useGameState";

export function AppSpectator() {
  const gs = useGameState();
  const { roomId } = useParams();

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
