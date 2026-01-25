import { useCallback, useMemo } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { AddPlayerModal } from "./components/dialogs/AddPlayerModal";
import { EditPlayerModal } from "./components/dialogs/EditPlayerModal";
import { ScoreInputModal } from "./components/dialogs/ScoreInputModal";
import type { EditPlayerDialogData } from "./contexts/EditPlayerContext";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import type { ScoreInputData } from "./contexts/ScoreInputContext";
import { useDialogState } from "./hooks/useDialogState";
import { useGameState } from "./hooks/useGameState";
import ScoreTable from "./ScoreTable";
import type { PlayerId } from "./types";

export default function App() {
  const gs = useGameState();
  const scoreInputState = useDialogState<ScoreInputData>();
  const editPlayerState = useDialogState<EditPlayerDialogData>();
  const addPlayerState = useDialogState<null>();

  // --- GameInteractionContext Value

  const openScoreInputDialog = useCallback(
    (playerId: PlayerId, roundNumber: number) => {
      scoreInputState.open({ playerId, roundNumber });
    },
    [scoreInputState],
  );

  const openEditPlayerDialog = useCallback(
    (playerId: PlayerId) => {
      editPlayerState.open({ playerId });
    },
    [editPlayerState],
  );

  const openAddPlayerDialog = useCallback(
    () => addPlayerState.open(null),
    [addPlayerState],
  );

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
      scoreInputState.close();
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
      {scoreInputState.isOpen && (
        <ScoreInputModal gs={gs} scoreInputState={scoreInputState} />
      )}
      {editPlayerState.isOpen && (
        <EditPlayerModal gs={gs} dialogState={editPlayerState} />
      )}
      {addPlayerState.isOpen && (
        <AddPlayerModal gs={gs} dialogState={addPlayerState} />
      )}
    </>
  );
}
