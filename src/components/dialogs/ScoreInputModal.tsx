import { Modal } from "react-bootstrap";
import {
  ScoreInputProvider,
  type StateArgs,
} from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
import { ScoreInputDialog } from "./ScoreInputDialog";

export function ScoreInputModal({ gs, scoreInputState }: StateArgs) {
  // playerId and roundNumber must be defined here if dialog isOpen
  const currentPlayer = gu.findPlayerOrThrow(
    gs.players,
    scoreInputState.data!.playerId,
  );
  const currentRound = gu.findRoundOrThrow(
    gs.rounds,
    scoreInputState.data!.roundNumber,
  );

  //TODO memoize literal object passed to provider
  return (
    <>
      <ScoreInputProvider state={{ gs, scoreInputState }}>
        <Modal
          show={scoreInputState.isOpen}
          centered
          fullscreen="xs-down"
          onHide={scoreInputState.close}
        >
          <Modal.Body
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
