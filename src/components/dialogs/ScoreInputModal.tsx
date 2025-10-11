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
          contentClassName="border-0 rounded-4"
        >
          <Modal.Body
            className="rounded-4"
            style={{
              backgroundColor: gu.toPlayerThemeBg(currentPlayer.color),
            }}
          >
            <ScoreInputDialog player={currentPlayer} round={currentRound} />
          </Modal.Body>
        </Modal>
      </ScoreInputProvider>
    </>
  );
}
