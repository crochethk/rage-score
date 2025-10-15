import { Col, Container, Form, Row } from "react-bootstrap";
import { useScoreInput } from "../../contexts/ScoreInputContext";
import * as gu from "../../gameUtils";
import type { Player, PlayerId, PlayerRoundData, Round } from "../../types";

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
      <Container fluid className="p-0">
        <Row className="text-center justify-content-center">
          <Col sm="8">
            <ScoreInputForm
              playerId={player.id}
              roundData={roundData}
              cardsDealt={round.cardsDealt}
            />
            <RoundResultDisplay roundData={roundData} />
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
        label="Gewettet"
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
  onChange: (val: string) => void;
  children: React.ReactNode;
}

function ScoreSelect({
  label,
  controlId,
  required,
  value,
  onChange,
  children: options,
}: ScoreSelectProps) {
  return (
    <Form.FloatingLabel label={label} controlId={controlId} className={"my-2"}>
      <Form.Select
        required={required}
        className="text-center"
        onChange={(ev) => onChange(ev.target.value)}
        value={value}
      >
        {options}
      </Form.Select>
    </Form.FloatingLabel>
  );
}

interface RoundResultDisplayProps {
  roundData: Partial<PlayerRoundData>;
}

function RoundResultDisplay({ roundData }: RoundResultDisplayProps) {
  const roundScore = gu.isCompletePlayerRoundData(roundData)
    ? gu.calculateRoundScore(roundData)
    : null;
  return (
    <div>
      {roundScore ? (
        <span className="fw-bold">{roundScore}</span>
      ) : (
        <span className="fst-italic fw-light">Warte auf Eingaben...</span>
      )}
    </div>
  );
}
