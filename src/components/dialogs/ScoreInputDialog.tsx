import { ButtonGroup, Col, Form, Row } from "react-bootstrap";
import type { Player, PlayerId, PlayerRoundData, Round } from "../../types";
import {
  PrimaryDialogButton,
  SecondaryDialogButton,
} from "../ui/Button/DialogButton";
import {
  isCompletePlayerRoundData,
  calculateRoundScore,
} from "../../gameUtils";

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
  onScoreInput: (
    playerId: PlayerId,
    newRoundData: Partial<PlayerRoundData>,
  ) => void;

  /** Callback triggered to move to the next player. */
  onNextPlayer: (currentPlayerId: PlayerId) => void;

  /** Callback triggered to move to the previous player. */
  onPrevPlayer: (currentPlayerId: PlayerId) => void;

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
          <ScoreInputForm
            playerId={player.id}
            roundData={roundData}
            maxBid={round.cardsDealt}
            onScoreInput={(playerId, newRoundData) =>
              props.onScoreInput(playerId, newRoundData)
            }
          />

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
                <PrimaryDialogButton
                  aria-label="Vorheriger Spieler"
                  onClick={() => props.onPrevPlayer(player.id)}
                >
                  ←
                </PrimaryDialogButton>
                <PrimaryDialogButton
                  aria-label="Nächster Spieler"
                  onClick={() => props.onNextPlayer(player.id)}
                >
                  →
                </PrimaryDialogButton>
              </ButtonGroup>
              <SecondaryDialogButton onClick={props.onDone}>
                Fertig
              </SecondaryDialogButton>
            </ButtonGroup>
          </div>
        </Col>
      </Row>
    </>
  );
}

interface ScoreInputFormProps {
  /** The player whose score is being input. */
  playerId: PlayerId;

  /** The player's data for the current round. */
  roundData: Partial<PlayerRoundData>;

  /** The largest possible bid for this round. */
  maxBid: number;

  /** Callback invoked when the score input changes for a player in a round. */
  onScoreInput: (
    playerId: PlayerId,
    newRoundData: Partial<PlayerRoundData>,
  ) => void;
}

function ScoreInputForm(props: ScoreInputFormProps) {
  const { playerId, roundData, maxBid, onScoreInput } = props;
  const possibleBidsOptions = range(0, maxBid + 1).map((b) => (
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
        <Form.Select
          required
          className="text-center"
          onChange={(ev) =>
            onScoreInput(playerId, {
              ...roundData,
              bid: ev.target.value === "" ? undefined : Number(ev.target.value),
            })
          }
          value={roundData.bid ?? ""}
        >
          <option value="">---</option>
          {possibleBidsOptions}
        </Form.Select>
      </Form.FloatingLabel>

      <Form.FloatingLabel
        label="Bekommen"
        controlId="tricksInput"
        className="my-2"
      >
        <Form.Select
          required
          className="text-center"
          onChange={(ev) =>
            onScoreInput(playerId, {
              ...roundData,
              tricksTaken:
                ev.target.value === "" ? undefined : Number(ev.target.value),
            })
          }
          value={roundData.tricksTaken ?? ""}
        >
          <option value="">---</option>
          {possibleBidsOptions}
        </Form.Select>
      </Form.FloatingLabel>

      <Form.FloatingLabel
        label="Bonus/Malus aus Karten"
        controlId="cardPointsInput"
        className="my-2"
      >
        <Form.Select
          className="text-center"
          onChange={(ev) =>
            onScoreInput(playerId, {
              ...roundData,
              bonusCardPoints: Number(ev.target.value),
            })
          }
          value={roundData.bonusCardPoints ?? 0}
        >
          {
            // Generate option -15 to +15 in steps of 5
            range(3 * -5, 3 * 5 + 1, 5).map((p) => (
              <option key={p} value={p}>
                {p > 0 ? "+" + p : p}
              </option>
            ))
          }
        </Form.Select>
      </Form.FloatingLabel>
    </Form.Floating>
  );
}
