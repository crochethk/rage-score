import { Container, Row } from "react-bootstrap";
import ScoreTable from "./ScoreTable";

export default function App() {
  return (
    <Container fluid>
      <Row>
        <ScoreTable />
      </Row>
    </Container>
  );
}
