import type { JSX } from "react";
import { dataSet3 as demoData } from "./exampleData";
import type { Player, PlayerRoundData, Round } from "./types";
import { Table } from "react-bootstrap";

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

interface ScoreTableBodyProps {
  players: Player[];
  rounds: Round[];
}

function ScoreTableBody({ players, rounds }: ScoreTableBodyProps) {
  const rows: JSX.Element[] = [];

  for (const round of rounds) {
    const rowLabel = (
      <th scope="row" className="table-secondary text-center">
        {round.cardsDealt} (Runde {round.roundNumber})
      </th>
    );

    const cells = players.map((p) => (
      <td key={p.id}>
        <PlayerRoundDataCell roundData={round.playerData[p.id]} />
      </td>
    ));

    const row = (
      <tr key={round.roundNumber}>
        {rowLabel}
        {cells}
      </tr>
    );
    rows.push(row);
  }

  return <tbody className="table-group-divider">{rows}</tbody>;
}

function ScoreTableFoot() {
  return (
    <tfoot className="table-info fw-bold text-center sticky-bottom">
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
      <Table className="table-light text-nowrap" bordered hover>
        <ScoreTableHead players={demoData.players} />
        <ScoreTableBody players={demoData.players} rounds={demoData.rounds} />
        <ScoreTableFoot />
      </Table>
    </>
  );
}
