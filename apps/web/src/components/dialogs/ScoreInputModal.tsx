import clsx from "clsx";
import { useState } from "react";
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

export type ScoreInputModalProps = StateArgs & {
  readonly: boolean;
};

export function ScoreInputModal(props: ScoreInputModalProps) {
  const { gs, scoreInputState, readonly } = props;
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
      <ScoreInputProvider state={props}>
        <Modal
          show={scoreInputState.isOpen}
          label={`Angaben für Runde ${currentRound.roundNumber}`}
          title={currentPlayer.name}
          bgColor={gu.toPlayerThemeBg(currentPlayer.color)}
          closeButton
          onHide={scoreInputState.close}
        >
          {readonly && <SpectatorModeIcon />}
          <Modal.Body>
            <ScoreInputDialog
              player={currentPlayer}
              round={currentRound}
              readonly={readonly}
            />
          </Modal.Body>
          <Modal.Footer>
            <ScoreInputNavigation playerId={currentPlayer.id} />
          </Modal.Footer>
        </Modal>
      </ScoreInputProvider>
    </>
  );
}

function SpectatorModeIcon() {
  const description = "Bearbeitung deaktiviert (Zuschauer-Modus)";

  // TODO decide on __one__ icon
  const icons = [
    "bi-lock",
    "bi-eye",
    "bi-binoculars",
    "bi-person-workspace",
    "bi-incognito",
    "bi-ban",
  ];
  const [iconIdx, setIconIdx] = useState(0);

  return (
    <span
      className="position-absolute fs-2 opacity-75"
      aria-label={description}
      title={description}
      onClick={() => setIconIdx((i) => (i + 1) % icons.length)}
    >
      <i className={clsx("bi", icons[iconIdx])} />
    </span>
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
                  <i className="bi bi-arrow-left" />
                </DialogButton>
                <DialogButton
                  variant="primary"
                  aria-label="Nächster Spieler"
                  onClick={() => onNextPlayer(playerId)}
                >
                  <i className="bi bi-arrow-right" />
                </DialogButton>
              </ButtonGroup>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
