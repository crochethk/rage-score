import { ButtonGroup, Col, Form, Row } from "react-bootstrap";
import type { Player, PlayerId, PlayerRoundData, Round } from "../../types";
import {
  PrimaryDialogButton,
  SecondaryDialogButton,
} from "../ui/Button/DialogButton";

const range = (start: number, stop: number, step = 1) => {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step,
  );
};

interface ScoreInputDialogProps {
  /** The player whose score is being input. */
  player: Player;

  /** The current data of the round in question. */
  round: Round;

  /** Callback invoked when the score input changes for a player in a round. */
  onScoreInput: (playerId: PlayerId, newRoundData: PlayerRoundData) => void;

  /** Callback triggered to move to the next player. */
  onNextPlayer: () => void;

  /** Callback triggered to move to the previous player. */
  onPrevPlayer: () => void;

  /** Callback called when score input is completed. */
  onDone: () => void;
}

export function ScoreInputDialog(props: ScoreInputDialogProps) {
  const { player, round } = props;
  const roundData = round.playerData[player.id];

  const roundScore = isCompletePlayerRoundData(roundData)
    ? calculateRoundScore(roundData)
    : null;

  return (
    <>
      <Row className="text-center justify-content-center">
        <Col sm="8" style={{ maxWidth: "576px" }}>
          <h5>Runde 123</h5>
          <h3>Max Musterfrau</h3>
          <ScoreInputForm />

          <div id="roundPointsDisplay">
            {roundScore ?? <i>Warte auf Eingaben...</i>}
          </div>
        </Col>
      </Row>

      <Row className="mt-2 justify-content-center">
        <Col sm="8" style={{ maxWidth: "576px" }}>
          <div className="d-grid">
            <ButtonGroup vertical>
              <ButtonGroup size="lg" aria-label="Navigations-Buttons">
                <PrimaryDialogButton aria-label="Nächster Spieler">
                  ←
                </PrimaryDialogButton>
                <PrimaryDialogButton aria-label="Vorheriger Spieler">
                  →
                </PrimaryDialogButton>
              </ButtonGroup>
              <SecondaryDialogButton>Fertig</SecondaryDialogButton>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
    </>
  );
}

function ScoreInputForm() {
  // TODO the range should be based on passed props, so it depends on dealt cards
  const possibleBidsOptions = range(0, 10 + 1).map((b) => (
    <option key={b} value={b}>
      {b}
    </option>
  ));
  return (
    <Form.Floating>
      <Form.FloatingLabel
        label="Gewettet"
        controlId="bidInput"
        className="my-2"
      >
        <Form.Select required className="text-center" defaultValue="">
          <option value="">---</option>
          {possibleBidsOptions}
        </Form.Select>
      </Form.FloatingLabel>

      <Form.FloatingLabel
        label="Bekommen"
        controlId="tricksInput"
        className="my-2"
      >
        <Form.Select required className="text-center" defaultValue="">
          <option value="">---</option>
          {possibleBidsOptions}
        </Form.Select>
      </Form.FloatingLabel>

      <Form.FloatingLabel
        label="Bonus/Malus aus Karten"
        controlId="cardPointsInput"
        className="my-2"
      >
        <Form.Select defaultValue={0} className="text-center">
          {range(3 * -5, 3 * 5 + 1, 5).map((p) => (
            <option key={p} value={p}>
              {p > 0 ? "+" + p : p}
            </option>
          ))}
        </Form.Select>
      </Form.FloatingLabel>
    </Form.Floating>
  );
}

/**
 * Type guard function to check whether `PlayerRoundData` is complete.
 */
function isCompletePlayerRoundData(
  data: Partial<PlayerRoundData>,
): data is PlayerRoundData {
  return (
    data.bid !== undefined &&
    data.tricksTaken !== undefined &&
    data.bonusCardPoints !== undefined
  );
}

/**
 * Calculates a player's points of a round based on the provided data.
 */
function calculateRoundScore(roundData: PlayerRoundData): number {
  const { bid, tricksTaken, bonusCardPoints } = roundData;
  const bidBonus = tricksTaken === bid ? 10 : -5;
  return tricksTaken + bidBonus + bonusCardPoints;
}
