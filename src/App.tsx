import { useCallback, useMemo } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { ScoreInputModal } from "./components/dialogs/ScoreInputModal";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import * as gu from "./gameUtils";
import { useGameState } from "./hooks/useGameState";
import { useScoreInputDialog } from "./hooks/useScoreInputDialog";
import ScoreTable from "./ScoreTable";
import type { PlayerId } from "./types";

export default function App() {
  const gs = useGameState();
  const scoreInput = useScoreInputDialog();

  // --- GameInteractionContext Value

  const openScoreInputDialog = useCallback(
    (playerId: PlayerId, roundNumber: number) => {
      scoreInput.open(playerId, roundNumber);
    },
    [scoreInput],
  );

  const openEditPlayerDialog = useCallback(
    (playerId: PlayerId) => {
      const player = gu.findPlayerOrThrow(gs.players, playerId);

      const newName = (window.prompt("Name ändern:", player.name) ?? "").trim();
      if (newName.length === 0) {
        console.log("Aborted editing player: No name given");
        return;
      }

      gs.updatePlayer(player.id, { name: newName });
    },
    [gs],
  );

  const openAddPlayerDialog = useCallback(() => {
    const name = (window.prompt("Name eingeben:") ?? "").trim();
    if (name.length === 0) {
      console.log("Aborted adding player: No name given");
      return;
    }

    gs.addPlayer(name);
  }, [gs]);

  const reverseRounds = useCallback(() => gs.reverseRounds(), [gs]);

  const gameInteractionValue = useMemo(
    () => ({
      openScoreInputDialog,
      openEditPlayerDialog,
      openAddPlayerDialog,
      reverseRounds,
    }),
    [
      openScoreInputDialog,
      openEditPlayerDialog,
      openAddPlayerDialog,
      reverseRounds,
    ],
  );

  // --- Handlers for Game Management Panel ---

  const handleFullReset = () => {
    if (window.confirm("Sicher ALLES zurücksetzen?")) {
      gs.resetGame();
      scoreInput.close();
    }
  };

  const handleScoreReset = () => {
    if (
      window.confirm("Sicher alle Punkte löschen? \n(Spieler bleiben erhalten)")
    )
      gs.resetScores();
  };

  return (
    <>
      <Container fluid>
        <Row>
          <Col className="px-0 px-sm-3 col-sm-auto mx-sm-auto">
            {/* --- Score Table --- */}
            <GameInteractionContext value={gameInteractionValue}>
              <ScoreTable gameData={gs} />
            </GameInteractionContext>
          </Col>
        </Row>

        {/* --- Game Management Panel --- */}
        <Row className="mt-2">
          <Col className="col-12 mx-auto text-start text-sm-center">
            <Button
              variant="danger"
              className="fw-bold m-1"
              onClick={handleFullReset}
            >
              <i className="bi bi-trash" /> Alles Löschen
            </Button>
            <Button
              variant="danger"
              className="fw-bold m-1"
              onClick={handleScoreReset}
            >
              <i className="bi bi-trash fw-bold" /> Punkte Löschen
            </Button>
          </Col>
        </Row>
      </Container>

      {/* --- Modals --- */}
      {scoreInput.isOpen && <ScoreInputModal gs={gs} scoreInput={scoreInput} />}
    </>
  );
}
