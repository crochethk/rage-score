import { ButtonGroup, Col, Form, Row } from "react-bootstrap";
import { useScoreInput } from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
import type { Player, PlayerId, PlayerRoundData, Round } from "../../types";
import {
  PrimaryDialogButton,
  SecondaryDialogButton,
} from "../ui/Button/DialogButton";

interface ScoreInputDialogProps {
  /** The player whose score is being input. */
  player: Player;

  /** The current data of the round in question. */
  round: Round;
}

export function ScoreInputDialog(props: ScoreInputDialogProps) {
  const { player, round } = props;
  const roundData = round.playerData[player.id];

  const roundScore = gu.isCompletePlayerRoundData(roundData)
    ? gu.calculateRoundScore(roundData)
    : null;

  const { onNextPlayer, onPrevPlayer, onDone } = useScoreInput();

  return (
    <>
      <Row className="text-center justify-content-center">
        <Col sm="8" style={{ maxWidth: "576px" }}>
          <h5>Runde {round.roundNumber}</h5>
          <h3>{player.name}</h3>
          <ScoreInputForm
            playerId={player.id}
            roundData={roundData}
            cardsDealt={round.cardsDealt}
          />

          <div id="roundPointsDisplay">
            {roundScore ?? <i>Warte auf Eingaben...</i>}
          </div>
        </Col>
      </Row>

      {/* --- Navigation Buttons --- */}
      <Row className="mt-2 justify-content-center">
        <Col sm="8" style={{ maxWidth: "576px" }}>
          <div className="d-grid">
            <ButtonGroup vertical>
              <ButtonGroup size="lg" aria-label="Navigations-Buttons">
                <PrimaryDialogButton
                  aria-label="Vorheriger Spieler"
                  onClick={() => onPrevPlayer(player.id)}
                >
                  ←
                </PrimaryDialogButton>
                <PrimaryDialogButton
                  aria-label="Nächster Spieler"
                  onClick={() => onNextPlayer(player.id)}
                >
                  →
                </PrimaryDialogButton>
              </ButtonGroup>
              <SecondaryDialogButton onClick={onDone}>
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
  cardsDealt: number;
}

function ScoreInputForm(props: ScoreInputFormProps) {
  const { playerId, roundData, cardsDealt } = props;
  const { onScoreInput } = useScoreInput();
  const possibleBidsOptions = gu.getPossibleBids(cardsDealt).map((b) => (
    <option key={b} value={b}>
      {b}
    </option>
  ));

  const bonusPointsOptions = gu.getBonusPointsValues().map((p) => (
    <option key={p} value={p}>
      {p > 0 ? "+" + p : p}
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
              bonusCardPoints: Number(ev.target.value),
            })
          }
          value={roundData.bonusCardPoints ?? 0}
        >
          {bonusPointsOptions}
        </Form.Select>
      </Form.FloatingLabel>
    </Form.Floating>
  );
}
