import { useLayoutEffect, useRef } from "react";
import { Button, Table } from "react-bootstrap";
import { useGameInteraction } from "./contexts/GameInteractionContext";
import * as gu from "./gameUtils";
import "./ScoreTable.style.css";
import type { GameData, Player, PlayerRoundData, Round } from "./types";

interface ScoreTableProps {
  gameData: GameData;
}

export default function ScoreTable(props: ScoreTableProps) {
  const { players, rounds } = props.gameData;
  const scrollToEndRef = useScrollToXEndOnLengthChange<HTMLDivElement, Player>(
    players,
  );

  return (
    <>
      <div
        ref={scrollToEndRef}
        className="table-responsive"
        style={{ overscrollBehaviorX: "none" }}
      >
        <Table className="score-table text-nowrap w-auto h-100 m-0 bg-body-tertiary bg-opacity-50 rounded-end-4">
          <ScoreTableHead players={players} />
          <ScoreTableBody players={players} rounds={rounds} />
          <ScoreTableFoot players={players} rounds={rounds} />
        </Table>
      </div>
    </>
  );
}

function ScoreTableHead({ players }: { players: readonly Player[] }) {
  const gic = useGameInteraction();
  const names = players.map((p) => (
    <th
      key={p.id}
      className="text-truncate cursor-pointer text-light"
      scope="col"
      style={{
        backgroundColor: gu.toPlayerThemeBg(p.color),
        // Fixate column width
        minWidth: "7em",
        maxWidth: "7em",
      }}
      onClick={() => gic.openEditPlayerDialog(p.id)}
      role="button"
    >
      {p.name}
    </th>
  ));

  return (
    <thead className="text-center align-middle sticky-top">
      <tr>
        <th className="table-secondary" scope="col">
          <Button
            className="p-1"
            variant="secondary"
            size="sm"
            aria-label="Rundenreihenfolge umkehren"
            onClick={() => gic.reverseRounds()}
          >
            <i className="bi bi-arrow-down-up"></i>
          </Button>
        </th>
        {names}
        <th
          scope="col"
          className="bg-primary rounded-end-4 border-bottom-0 cursor-pointer text-light"
          style={{ minWidth: "3.5em", maxWidth: "3.5em" }}
          onClick={gic.openAddPlayerDialog}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault(); // prevent spacebar scroll
              gic.openAddPlayerDialog();
            }
          }}
          role="button"
          title="Spieler hinzufügen"
        >
          <i
            className="bi bi-person-plus-fill"
            aria-label="Spieler hinzufügen"
          ></i>
        </th>
      </tr>
    </thead>
  );
}

type ScoreTableBodyProps = GameData;

function ScoreTableBody({ players, rounds }: ScoreTableBodyProps) {
  return (
    <tbody className="table-light">
      {rounds.map((round) => (
        <RoundDataRow key={round.roundNumber} players={players} round={round} />
      ))}
    </tbody>
  );
}

interface RoundDataRowProps {
  players: readonly Player[];
  round: Round;
}

function RoundDataRow({ players, round }: RoundDataRowProps) {
  const gic = useGameInteraction();

  const cells = players.map((p) => (
    <PlayerRoundDataCell
      key={p.id}
      roundData={round.playerData[p.id]}
      onClick={() => gic.openScoreInputDialog(p.id, round.roundNumber)}
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

function PlayerRoundDataCell(props: PlayerRoundDataCellProps) {
  const { roundData, onClick } = props;
  const { bid, tricksTaken, bonusCardPoints = 0 } = roundData;
  const roundScore = gu.isCompletePlayerRoundData(roundData)
    ? gu.calculateRoundScore(roundData)
    : null;

  const colClassName =
    "col flex-grow-1 flex-shrink-1" +
    " p-0" +
    " border-end border-dark-subtle" +
    " xsmall" +
    " align-content-center";

  return (
    <>
      <td
        className="p-0 cell-hover cursor-pointer border border-dark-subtle h-100"
        onClick={onClick}
        role="button"
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
              <span className={bonusCardPoints === 0 ? "invisible" : ""}>
                {bonusCardPoints > 0 ? "+" + bonusCardPoints : bonusCardPoints}
              </span>
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
            <td key={p.id} className="border border-dark-subtle">
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

interface ScrollableElement {
  scrollLeft: number;
  scrollWidth: number;
}

/**
 * Custom hook to auto-scroll a scrollable element to its horizontal end when the length of a monitored array changes.
 * @param arr Array to monitor for length changes. Should be a stable reference (e.g. from `useState`).
 * @returns A `ref` to be attached to the scrollable element.
 */
function useScrollToXEndOnLengthChange<E extends ScrollableElement, T>(
  arr: readonly T[],
) {
  // Scroll to horizontal end when new player has been added
  const scrollElementRef = useRef<E | null>(null);
  const prevArrLengthRef = useRef(arr.length);

  useLayoutEffect(() => {
    // Check to prevent scrolling on page reload
    if (prevArrLengthRef.current !== arr.length) {
      const elem = scrollElementRef.current;
      if (elem) {
        elem.scrollLeft = elem.scrollWidth;
      }
      prevArrLengthRef.current = arr.length;
    }
  }, [arr.length]);
  return scrollElementRef;
}
