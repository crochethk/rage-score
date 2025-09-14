import { Container, Row } from "react-bootstrap";
import ScoreTable from "./ScoreTable";
import type { Player, Round } from "./types";

import { dataSet3 as demoData } from "./exampleData";
import { useLocalStorage } from "./hooks";

export default function App() {
  const [players, _setPlayers] = useLocalStorage<Player[]>(
    "players",
    demoData.players,
  );
  const [rounds, _setRounds] = useLocalStorage<Round[]>(
    "rounds",
    demoData.rounds,
  );

  return (
    <Container fluid>
      <Row>
        <ScoreTable gameData={{ players, rounds }} />
      </Row>
    </Container>
  );
}
