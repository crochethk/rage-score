import type { Player, PlayerRoundData, Round, GameData } from "./types";
import { Table } from "react-bootstrap";

export default function ScoreTable({ gameData }: { gameData: GameData }) {
  const { players, rounds } = gameData;
  return (
    <>
      <Table className="table-light text-nowrap" bordered hover>
        <ScoreTableHead players={players} />
        <ScoreTableBody players={players} rounds={rounds} />
        <ScoreTableFoot players={players} rounds={rounds} />
      </Table>
    </>
  );
}

function ScoreTableHead({ players }: { players: Player[] }) {
  const names = players.map((p) => (
    <th key={p.id} scope="col">
      {p.name}
    </th>
  ));
  return (
    <thead className="text-center table-dark bg-dark sticky-top">
      <tr>
        <th scope="col"># Karten</th>
        {names}
      </tr>
    </thead>
  );
}

type ScoreTableBodyProps = GameData;

function ScoreTableBody({ players, rounds }: ScoreTableBodyProps) {
  return (
    <tbody className="table-group-divider">
      {rounds.map((round) => RoundDataRow({ players, round }))}
    </tbody>
  );
}

function RoundDataRow({ players, round }: { players: Player[]; round: Round }) {
  const cells = players.map((p) => (
    <td key={p.id}>
      <PlayerRoundDataCell roundData={round.playerData[p.id]} />
    </td>
  ));

  return (
    <tr key={round.roundNumber}>
      <th scope="row" className="table-secondary text-center">
        {round.cardsDealt} (Runde {round.roundNumber})
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
  return (
    <ul>
      <li>Wette: {bid ?? ""}</li>
      <li>Ergebnis: {tricksTaken ?? ""}</li>
      <li>Bonus/Malus: {bonusCardPoints ?? ""}</li>
    </ul>
  );
}

type ScoreTableFootProps = GameData;

function ScoreTableFoot({ players, rounds }: ScoreTableFootProps) {
  return (
    <tfoot className="table-info fw-bold text-center sticky-bottom">
      <tr>
        <th scope="row">Gesamtpunkte</th>
        {/* Add some example values to the footer */}
        {players.map((p, i) => (
          <td key={p.id}>{42 + Math.floor(Math.sin(i) * 15)}</td>
        ))}

        {
          // TODO Actual total score calculation using rounds data
        }
      </tr>
    </tfoot>
  );
}
