import { Modal } from "react-bootstrap";
import { ScoreInputProvider } from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
import type { GameState } from "../../hooks/useGameState";
import { type ScoreInputDialogState } from "../../hooks/useScoreInputDialog";
import { ScoreInputDialog } from "./ScoreInputDialog";

interface ScoreInputModalProps {
  gs: GameState;
  scoreInput: ScoreInputDialogState;
}

export function ScoreInputModal({ gs, scoreInput }: ScoreInputModalProps) {
  // playerId and roundNumber must be defined here if dialog isOpen
  const currentPlayer = gu.findPlayerOrThrow(gs.players, scoreInput.playerId);
  const currentRound = gu.findRoundOrThrow(gs.rounds, scoreInput.roundNumber);

  //TODO memoize literal object passed to provider
  return (
    <>
      <ScoreInputProvider state={{ gs, scoreInput }}>
        <Modal
          show={scoreInput.isOpen}
          centered
          fullscreen="xs-down"
          onHide={scoreInput.close}
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
