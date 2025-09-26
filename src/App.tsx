import { useCallback, useMemo } from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import { ScoreInputDialog } from "./components/dialogs/ScoreInputDialog";
import { GameInteractionContext } from "./contexts/GameInteractionContext";
import { ScoreInputContext } from "./contexts/ScoreInputContext";
import * as gu from "./gameUtils";
import { useGameState, type PlayerRoundDataUpdate } from "./hooks/useGameState";
import { useScoreInputDialog } from "./hooks/useScoreInputDialog";
import ScoreTable from "./ScoreTable";
import type { Player, PlayerId, Round } from "./types";

export default function App() {
  const gs = useGameState();

  // --- Handlers for ScoreInputContext ---

  /* ---✓--- */
  const scoreInput = useScoreInputDialog(gs.players[0], gs.rounds[0]);

  /* ---✓--- */
  const handleScoreInput = useCallback(
    (pid: PlayerId, newPlayerRoundData: PlayerRoundDataUpdate) => {
      gs.updatePlayerRoundData(
        pid,
        scoreInput.round.roundNumber,
        newPlayerRoundData,
      );
      // ...
      // scoreInput.setRound(updatedRound); // no need to set/change this if only round number is used
      // ...
    },
    [gs, scoreInput.round.roundNumber],
  );

  const handleNextPlayer = useCallback(
    (currentId: PlayerId) => {
      const next = gu.getAdjacentPlayer(gs.players, currentId, "next");
      scoreInput.setPlayer(next);
    },
    [gs.players, scoreInput],
  );

  const handlePrevPlayer = useCallback(
    (currentId: PlayerId) => {
      const prev = gu.getAdjacentPlayer(gs.players, currentId, "prev");
      scoreInput.setPlayer(prev);
    },
    [gs.players, scoreInput],
  );

  const scoreInputCtxValue = useMemo(
    () => ({
      onScoreInput: handleScoreInput,
      onNextPlayer: handleNextPlayer,
      onPrevPlayer: handlePrevPlayer,
      onDone: scoreInput.close,
    }),
    [handleNextPlayer, handlePrevPlayer, handleScoreInput, scoreInput.close],
  );

  // --- GameInteractionContext Value

  const openScoreInputDialog = useCallback(
    (player: Player, round: Round) => {
      scoreInput.setPlayer(player);
      scoreInput.setRound(round);
      scoreInput.open();
    },
    [scoreInput],
  );

  /* ---✓--- */
  const openEditPlayerDialog = useCallback(
    (player: Player) => {
      // For now just prompt for a new name
      const newName = (window.prompt("Name ändern:", player.name) ?? "").trim();
      if (newName.length === 0) {
        console.log("Aborted editing player: No name given");
        return;
      }

      gs.updatePlayer(player.id, { name: newName });
    },
    [gs],
  );

  /* ---✓--- */
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

  /* ---✓--- */
  const handleFullReset = () => {
    if (window.confirm("Sicher ALLES zurücksetzen?")) {
      gs.resetGame();
    }
  };

  /* ---✓--- */
  const handleScoreReset = () => {
    if (
      window.confirm("Sicher alle Punkte löschen? \n(Spieler bleiben erhalten)")
    )
      gs.resetScores();
  };

  const { players, rounds } = gs;
  return (
    <>
      <Container fluid="lg">
        <Row>
          <Col className="px-0 px-sm-3 col-lg-auto mx-lg-auto">
            {/* --- Score Table --- */}
            <GameInteractionContext value={gameInteractionValue}>
              <ScoreTable gameData={{ players, rounds }} />
            </GameInteractionContext>
          </Col>
        </Row>

        {/* --- Game Management Panel --- */}
        <Row className="mt-2">
          <Col className="col-12 mx-auto text-start text-lg-center">
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

      {/* --- ScoreInputDialog Modal --- */}
      <ScoreInputContext value={scoreInputCtxValue}>
        <Modal
          show={scoreInput.isOpen}
          centered
          fullscreen="xs-down"
          onHide={scoreInput.close}
        >
          <Modal.Body
            style={{
              backgroundColor: gu.toPlayerThemeBg(scoreInput.player.color),
            }}
          >
            <ScoreInputDialog
              player={scoreInput.player}
              round={scoreInput.round}
            />
          </Modal.Body>
        </Modal>
      </ScoreInputContext>
    </>
  );
}
