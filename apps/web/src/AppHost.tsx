import App from "./App";
import { useGameState } from "./hooks/useGameState";

export function AppHost() {
  const gs = useGameState();

  // TODO add socket connection logic for hosting a game

  return <App gs={gs} />;
}
