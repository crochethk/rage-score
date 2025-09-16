import ScoreTable from "./ScoreTable";
import type { Player, PlayerId, Round } from "./types";
import { useLocalStorage } from "./hooks";
import { useCallback, useEffect, useMemo } from "react";
import { GameInteractionContext } from "./contexts/GameInteractionContext";

import { dataSet42 as demoData } from "./exampleData";

export default function App() {
  const [players, setPlayers] = useLocalStorage<Player[]>("players", []);
  const [rounds, setRounds] = useLocalStorage<Round[]>("rounds", []);

  // TODO Remove this when integrating real data input
  // --- Initialize with demo data for testing purposes only ---
  useEffect(() => {
    setPlayers(demoData.players);
    setRounds(demoData.rounds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openScoreInputDialog = useCallback((pid: PlayerId, round: Round) => {
    console.log("Open score input dialog requested for", pid, round);
  }, []);

  const contextValue = useMemo(
    () => ({
      openScoreInputDialog,
    }),
    [openScoreInputDialog],
  );
  return (
    <>
      <GameInteractionContext value={contextValue}>
        <ScoreTable gameData={{ players, rounds }} />
      </GameInteractionContext>
    </>
  );
}
