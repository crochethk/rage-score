import { Modal } from "react-bootstrap";
import {
  ScoreInputProvider,
  type StateArgs,
} from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
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
          centered
          fullscreen="xs-down"
          onHide={scoreInputState.close}
          contentClassName="border-0 rounded-4 bg-transparent"
        >
          <Modal.Header
            className="border-0 rounded-top-4 justify-content-center pb-2"
            style={{ backgroundColor: gu.toPlayerThemeBg(currentPlayer.color) }}
          >
            <Modal.Title className="text-center">
              <h1 className="h6 text-muted mb-1">
                Runde {currentRound.roundNumber}
              </h1>
              <h2 className="h4 m-0">{currentPlayer.name}</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            className="rounded-bottom-4 pt-1"
            style={{ backgroundColor: gu.toPlayerThemeBg(currentPlayer.color) }}
          >
            <ScoreInputDialog player={currentPlayer} round={currentRound} />
          </Modal.Body>
        </Modal>
      </ScoreInputProvider>
    </>
  );
}
