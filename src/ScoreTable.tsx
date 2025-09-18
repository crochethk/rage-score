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
      <div className="table-responsive" style={{ overscrollBehaviorX: "none" }}>
        <Table variant="light" className="text-nowrap w-auto h-100 m-0">
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
    <thead className="text-center table-dark sticky-top">
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
        className="table-secondary text-center align-middle w-auto"
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
    " border-end border-dark-subtle" +
    " xsmall" +
    " align-content-center";

  // Prepare values for display
  const bonus: number = bonusCardPoints ?? 0;
  const roundScore = gu.isCompletePlayerRoundData(roundData)
    ? gu.calculateRoundScore(roundData)
    : null;

  return (
    <>
      <td
        className="p-0 cell-hover cursor-pointer border border-dark-subtle h-100"
        onClick={onClick}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClick();
        }}
      >
        <div className="d-flex flex-column w-100 h-100">
          <div className="d-flex flex-grow-1 text-center border-top border-bottom border-dark-subtle">
            <div className={colClassName}>{bid ?? ""}</div>
            <div className={colClassName}>{tricksTaken ?? ""}</div>
            <div className={colClassName + " border-end-0"}>
              <span className={bonus === 0 ? "invisible" : ""}>{bonus}</span>
            </div>
          </div>
          <div className="d-flex flex-grow-1 justify-content-center align-items-center p-1 p-sm-0">
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
        <th scope="row">
          <span id="totalLabel" className="d-none d-sm-inline">
            Total
          </span>
          <span className="d-inline d-sm-none" aria-labelledby="totalLabel">
            &Sigma;
          </span>
        </th>
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
