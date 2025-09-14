import { Container, Row } from "react-bootstrap";
import ScoreTable from "./ScoreTable";
import type { Player, Round } from "./types";
import { useLocalStorage } from "./hooks";
import { useEffect } from "react";

import { dataSet3 as demoData } from "./exampleData";

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
    <Container fluid>
      <Row>
        <ScoreTable gameData={{ players, rounds }} />
      </Row>
    </Container>
  );
}
