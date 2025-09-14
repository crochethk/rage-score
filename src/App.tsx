import { Container, Row } from "react-bootstrap";
import ScoreTable from "./ScoreTable";
import type { Player, Round } from "./types";
import { useEffect, useState } from "react";

import { dataSet3 as demoData } from "./exampleData";

export default function App() {
  const [players, _setPlayers] = useState<Player[]>(demoData.players);
  const [rounds, _setRounds] = useState<Round[]>(demoData.rounds);

  return (
    <Container fluid>
      <Row>
        <ScoreTable gameData={{ players, rounds }} />
      </Row>
    </Container>
  );
}
