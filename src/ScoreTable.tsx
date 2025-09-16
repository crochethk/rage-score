import * as gu from "./gameUtils";
import type { Player, PlayerRoundData, Round, GameData } from "./types";
import { Table } from "react-bootstrap";
import "./ScoreTable.style.css";

export default function ScoreTable({ gameData }: { gameData: GameData }) {
  const { players, rounds } = gameData;
  return (
    <>
      <Table variant="light" className="text-nowrap" bordered>
        <ScoreTableHead players={players} />
        <ScoreTableBody players={players} rounds={rounds} />
        <ScoreTableFoot players={players} rounds={rounds} />
      </Table>
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

function RoundDataRow({ players, round }: { players: Player[]; round: Round }) {
  const cells = players.map((p) => (
    <PlayerRoundDataCell key={p.id} roundData={round.playerData[p.id]} />
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
}

function PlayerRoundDataCell({ roundData }: PlayerRoundDataCellProps) {
  const { bid, tricksTaken, bonusCardPoints } = roundData;
  const colClassName =
    "col flex-grow-1 flex-shrink-1" +
    " p-0" +
    " border border-dark-subtle border-end-0" +
    " xsmall";
  return (
    <>
      <td className="p-0 cell-hover">
        <div className="d-flex flex-column w-100">
          <div className="d-flex text-center">
            <div className={colClassName}> {bid ?? ""}</div>
            <div className={colClassName}> {tricksTaken ?? ""}</div>
            <div className={colClassName}> {bonusCardPoints ?? ""}</div>
          </div>
          <div className="p-0 text-center">
            <div className="fw-bold">
              {gu.isCompletePlayerRoundData(roundData)
                ? gu.calculateRoundScore(roundData)
                : "---"}
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
        {players.map((p) => (
          <td key={p.id}>{gu.calculateTotalScore(p.id, rounds)}</td>
        ))}
      </tr>
    </tfoot>
  );
}
