import { Col, Container, Form, Row } from "react-bootstrap";
import { useScoreInput } from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
import type { Player, PlayerId, PlayerRoundData, Round } from "../../types";
import "./ScoreInputDialog.css";

interface ScoreInputDialogProps {
  /** The player whose score is being input. */
  player: Player;

  /** The current data of the round in question. */
  round: Round;
}

export function ScoreInputDialog(props: ScoreInputDialogProps) {
  const { player, round } = props;
  const roundData = round.playerData[player.id];
  return (
    <>
      <Container fluid className="p-0 pt-md-2">
        <Row className="text-center justify-content-center">
          <Col xs="12" sm="6" className="mb-2 mb-sm-0">
            <ScoreInputForm
              playerId={player.id}
              roundData={roundData}
              cardsDealt={round.cardsDealt}
            />
          </Col>
          <Col>
            <RoundInfoDisplay playerId={player.id} round={round} />
          </Col>
        </Row>
      </Container>
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

  const parseTricksValue = (v: string) => (v === "" ? undefined : Number(v));
  return (
    <Form.Floating>
      <ScoreSelect
        label="Geboten"
        controlId="bidInput"
        required
        value={roundData.bid ?? ""}
        onChange={(val) =>
          onScoreInput(playerId, { bid: parseTricksValue(val) })
        }
      >
        <option value="">---</option>
        {possibleBidsOptions}
      </ScoreSelect>
      <ScoreSelect
        label="Bekommen"
        controlId="tricksInput"
        required
        value={roundData.tricksTaken ?? ""}
        onChange={(val) =>
          onScoreInput(playerId, { tricksTaken: parseTricksValue(val) })
        }
      >
        <option value="">---</option>
        {possibleBidsOptions}
      </ScoreSelect>
      <ScoreSelect
        label="Bonus/Malus aus Karten"
        controlId="bonusPointsInput"
        value={roundData.bonusCardPoints ?? 0}
        onChange={(val) =>
          onScoreInput(playerId, { bonusCardPoints: Number(val) })
        }
        disabled={!roundData.tricksTaken}
      >
        {bonusPointsOptions}
      </ScoreSelect>
    </Form.Floating>
  );
}

interface ScoreSelectProps {
  label: string;
  controlId: string;
  required?: boolean;
  value: number | "";
  disabled?: boolean;
  onChange: (val: string) => void;
  children: React.ReactNode;
}

function ScoreSelect({
  label,
  controlId,
  required,
  value,
  disabled,
  onChange,
  children: options,
}: ScoreSelectProps) {
  return (
    <Form.FloatingLabel label={label} controlId={controlId} className={"mb-2"}>
      <Form.Select
        required={required}
        className="text-center"
        onChange={(ev) => onChange(ev.target.value)}
        value={value}
        disabled={disabled}
      >
        {options}
      </Form.Select>
    </Form.FloatingLabel>
  );
}

interface RoundInfoDisplayProps {
  playerId: PlayerId;
  round: Round;
}

function RoundInfoDisplay({ playerId, round }: RoundInfoDisplayProps) {
  const playerRoundData = round.playerData[playerId];
  const roundScore = gu.isCompletePlayerRoundData(playerRoundData)
    ? gu.calculateRoundScore(playerRoundData)
    : null;
  const totalBids = Object.values(round.playerData).reduce(
    (sum, prd) => sum + (prd.bid ?? 0),
    0,
  );

  return (
    <>
      <dl className="kv info-box rounded-2">
        <dt className="fw-light">Gebote gesamt</dt>
        <dd>{totalBids}</dd>
        <dt className="fw-light">Ergebnis (Runde)</dt>
        <dd className="text-truncate">
          {roundScore ?? (
            <span className="fst-italic fw-light">Warte auf Eingaben...</span>
          )}
        </dd>
      </dl>
    </>
  );
}
