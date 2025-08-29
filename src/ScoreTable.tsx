import { dataSet1 as demoData } from "./exampleData";
import type { Player, PlayerRoundData, Round } from "./types";

function ScoreTableHead({ players }: { players: Player[] }) {
  const names = players.map((p) => (
    <th key={p.id} scope="col">
      {p.name}
    </th>
  ));
  return (
    <thead>
      <tr>
        <th scope="col"># Karten</th>
        {names}
      </tr>
    </thead>
  );
}

function PlayerRoundDataCell({ roundData }: { roundData: PlayerRoundData }) {
  const { bid, tricksTaken, bonusCardPoints } = roundData;
  return (
    <ul>
      <li>Wette: {bid}</li>
      <li>Ergebnis: {tricksTaken}</li>
      <li>Bonus/Malus: {bonusCardPoints}</li>
    </ul>
  );
}

interface RoundDataCellsProps {
  players: Player[];
  round: Round;
}

function RoundDataCells({ players, round }: RoundDataCellsProps) {
  const cells = players.map((p) => (
    <td key={p.id}>
      <PlayerRoundDataCell roundData={round.playerData[p.id]} />
    </td>
  ));
  return cells;
}

interface ScoreTableBodyProps {
  players: Player[];
  rounds: Round[];
}

function ScoreTableBody({ players, rounds }: ScoreTableBodyProps) {
  const rows = rounds.map((round, roundIdx, _) => (
    <tr key={roundIdx}>
      <th scope="row">
        {round.cardsDealt} (Runde {roundIdx + 1})
      </th>
      <RoundDataCells players={players} round={round} />
    </tr>
  ));
  return <tbody>{rows}</tbody>;
}

function ScoreTableFoot() {
  return (
    <tfoot>
      <tr>
        <th scope="row">Gesamtpunkte</th>
        {/* Add some example values to the footer */}
        {demoData.players.map((p, i) => (
          <td key={p.id}>{42 + Math.floor(Math.sin(i) * 15)}</td>
        ))}
      </tr>
    </tfoot>
  );
}

export default function ScoreTable() {
  return (
    <>
      <table className="scoreTable">
        <ScoreTableHead players={demoData.players} />
        <ScoreTableBody players={demoData.players} rounds={demoData.rounds} />
        <ScoreTableFoot />
      </table>
    </>
  );
}
