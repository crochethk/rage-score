import ButtonGroup from "react-bootstrap/ButtonGroup";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import {
  ScoreInputProvider,
  useScoreInput,
  type StateArgs,
} from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
import type { PlayerId } from "../../types";
import { DialogButton } from "../ui/Button/DialogButton";
import { Modal } from "./Modal";
import { ScoreInputDialog } from "./ScoreInputDialog";

export function ScoreInputModal(stateArgs: StateArgs) {
  const { gs, scoreInputState } = stateArgs;
  // playerId and roundNumber must be defined here if dialog isOpen
  const currentPlayer = gu.findPlayerOrThrow(
    gs.players,
    scoreInputState.data!.playerId,
  );
  const currentRound = gu.findRoundOrThrow(
    gs.rounds,
    scoreInputState.data!.roundNumber,
  );

  return (
    <>
      <ScoreInputProvider state={stateArgs}>
        <Modal
          show={scoreInputState.isOpen}
          label={`Angaben für Runde ${currentRound.roundNumber}`}
          title={currentPlayer.name}
          bgColor={gu.toPlayerThemeBg(currentPlayer.color)}
          closeButton
          onHide={scoreInputState.close}
        >
          <Modal.Body>
            <ScoreInputDialog player={currentPlayer} round={currentRound} />
          </Modal.Body>
          <Modal.Footer>
            <ScoreInputNavigation playerId={currentPlayer.id} />
          </Modal.Footer>
        </Modal>
      </ScoreInputProvider>
    </>
  );
}

function ScoreInputNavigation({ playerId }: { playerId: PlayerId }) {
  const { onNextPlayer, onPrevPlayer } = useScoreInput();
  return (
    <Container fluid className="px-0 mx-0">
      <Row className="justify-content-center">
        <Col>
          <div className="d-grid">
            <ButtonGroup vertical>
              <ButtonGroup size="lg" aria-label="Navigations-Buttons">
                <DialogButton
                  variant="primary"
                  aria-label="Vorheriger Spieler"
                  onClick={() => onPrevPlayer(playerId)}
                >
                  ←
                </DialogButton>
                <DialogButton
                  variant="primary"
                  aria-label="Nächster Spieler"
                  onClick={() => onNextPlayer(playerId)}
                >
                  →
                </DialogButton>
              </ButtonGroup>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
