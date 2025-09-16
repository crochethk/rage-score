import ScoreTable from "./ScoreTable";
import type { Player, Round } from "./types";
import { useLocalStorage } from "./hooks";
import { useEffect } from "react";

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

  return (
    <>
      <ScoreTable
        gameData={{ players, rounds }}
        handleOpenScoreInputDialog={() => {
          console.log("Open score input dialog");
          return;
        }}
      />
    </>
  );
}
