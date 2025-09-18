import { Table } from "react-bootstrap";
import { useGameInteraction } from "./contexts/GameInteractionContext";
import * as gu from "./gameUtils";
import "./ScoreTable.style.css";
import type { GameData, Player, PlayerRoundData, Round } from "./types";

interface ScoreTableProps {
  gameData: GameData;
}

export default function ScoreTable(props: ScoreTableProps) {
  const { players, rounds } = props.gameData;
  return (
    <>
      <div className="table-responsive">
        <Table variant="light" className="text-nowrap w-auto m-0" bordered>
          <ScoreTableHead players={players} />
          <ScoreTableBody players={players} rounds={rounds} />
          <ScoreTableFoot players={players} rounds={rounds} />
        </Table>
      </div>
    </>
  );
}

function ScoreTableHead({ players }: { players: Player[] }) {
  const names = players.map((p) => (
    <th key={p.id} scope="col" style={{ minWidth: "7em" }}>
      {p.name}
    </th>
  ));
  return (
    <thead className="text-center table-dark bg-dark sticky-top">
      <tr>
        <th scope="col">#</th>
        {names}
      </tr>
    </thead>
  );
}

type ScoreTableBodyProps = GameData;

function ScoreTableBody({ players, rounds }: ScoreTableBodyProps) {
  return (
    <tbody className="table-group-divider">
      {rounds.map((round) => (
        <RoundDataRow key={round.roundNumber} players={players} round={round} />
      ))}
    </tbody>
  );
}

interface RoundDataRowProps {
  players: Player[];
  round: Round;
}

function RoundDataRow({ players, round }: RoundDataRowProps) {
  const gic = useGameInteraction();

  const cells = players.map((p) => (
    <PlayerRoundDataCell
      key={p.id}
      roundData={round.playerData[p.id]}
      onClick={() => gic.openScoreInputDialog(p, round)}
    />
  ));

  return (
    <tr key={round.roundNumber}>
      <th
        scope="row"
        className="table-secondary text-center align-middle w-auto p-0"
      >
        <span className="d-none d-sm-block fs-6 fw-light">
          Runde {round.roundNumber}
        </span>
        {round.cardsDealt}
      </th>
      {cells}
    </tr>
  );
}

interface PlayerRoundDataCellProps {
  roundData: Partial<PlayerRoundData>;
  onClick: () => void;
}

function PlayerRoundDataCell({
  roundData,
  onClick: onClick,
}: PlayerRoundDataCellProps) {
  const { bid, tricksTaken, bonusCardPoints } = roundData;
  const colClassName =
    "col flex-grow-1 flex-shrink-1" +
    " p-0" +
    " border-dark-subtle" +
    " xsmall";

  // Prepare values for display
  const bonus: number = bonusCardPoints ?? 0;
  const roundScore = gu.isCompletePlayerRoundData(roundData)
    ? gu.calculateRoundScore(roundData)
    : null;

  return (
    <>
      <td
        className="p-0 cell-hover cursor-pointer border border-dark-subtle"
        onClick={onClick}
      >
        <div className="d-flex flex-column w-100">
          <div className="d-flex text-center border border-dark-subtle border-start-0 border-end-0">
            <div className={colClassName + " border-end"}>{bid ?? ""}</div>
            <div className={colClassName + " border-end"}>
              {tricksTaken ?? ""}
            </div>
            <div className={colClassName}>
              {/* Non-breaking space to maintain cell height */}
              <span className={bonus === 0 ? "invisible" : ""}>{bonus}</span>
            </div>
          </div>
          <div className="p-0 text-center">
            <div className={"fw-bold"}>
              <span className={roundScore === null ? " invisible" : ""}>
                {roundScore ?? "n/a"}
              </span>
            </div>
          </div>
        </div>
      </td>
    </>
  );
}

type ScoreTableFootProps = GameData;

function ScoreTableFoot({ players, rounds }: ScoreTableFootProps) {
  return (
    <tfoot className="table-info fw-bold text-center sticky-bottom">
      <tr>
        <th scope="row">Total</th>
        {players.map((p) => {
          const totalScore = gu.calculateTotalScore(p.id, rounds);
          const isEmptyColumn = gu.isEmptyColumn(p.id, rounds);
          return (
            <td key={p.id}>
              <span className={isEmptyColumn ? "invisible" : ""}>
                {totalScore}
              </span>
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
}
