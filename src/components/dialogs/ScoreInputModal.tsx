import {
  ScoreInputProvider,
  type StateArgs,
} from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
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
        </Modal>
      </ScoreInputProvider>
    </>
  );
}
