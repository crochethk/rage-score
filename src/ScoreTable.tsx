import clsx from "clsx";
import { useLayoutEffect, useRef } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import { useGameInteraction } from "./contexts/GameInteractionContext";
import * as gu from "./gameUtils";
import "./ScoreTable.css";
import type { GameData, Player, PlayerRoundData, Round } from "./types";

interface ScoreTableProps {
  gameData: GameData;
}

export default function ScoreTable(props: ScoreTableProps) {
  const { players, rounds } = props.gameData;
  const scrollToEndRef = useScrollToXEndOnLengthChange<HTMLDivElement, Player>(
    players,
  );

  const scores = players.map((p) =>
    gu.isEmptyColumn(p.id, rounds)
      ? null
      : gu.calculateTotalScore(p.id, rounds),
  );

  return (
    <>
      <div
        ref={scrollToEndRef}
        className="table-responsive"
        style={{ overscrollBehaviorX: "none" }}
      >
        <Table className="score-table text-nowrap w-auto h-100 m-0 bg-body-tertiary bg-opacity-50 rounded-end-4">
          <ScoreTableHead players={players} scores={scores} />
          <ScoreTableBody players={players} rounds={rounds} />
          <ScoreTableFoot players={players} scores={scores} />
        </Table>
      </div>
    </>
  );
}

interface ScoreTableHeadProps {
  players: readonly Player[];
  scores: (number | null)[];
}

function ScoreTableHead({ players, scores }: ScoreTableHeadProps) {
  const gic = useGameInteraction();

  const sortedUniqueScoresDesc = Array.from(new Set(scores)).sort((a, b) =>
    a === null ? 1 : b === null ? -1 : b - a,
  );

  const names = players.map((p, idx) => {
    const totalScore = scores[idx];
    const isEmptyColumn = totalScore === null;
    const rank = sortedUniqueScoresDesc.indexOf(totalScore);
    return (
      <th
        key={p.id}
        className="text-light position-relative"
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
        {!isEmptyColumn && <RankBadge rank={rank} limit={3} />}
        <div className="text-truncate">{p.name}</div>
      </th>
    );
  });

  return (
    <thead className="text-center align-middle sticky-top">
      <tr>
        <th className="table-secondary z-1" scope="col">
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
      {rounds.map((round, idx) => {
        const isValidRound = gu.isValidRound(rounds, idx, players);
        return (
          <RoundDataRow
            key={round.roundNumber}
            players={players}
            round={round}
            isValid={isValidRound}
            isFirst={idx === 0}
          />
        );
      })}
    </tbody>
  );
}

interface RoundDataRowProps {
  players: readonly Player[];
  round: Round;
  isValid: boolean;
  isFirst: boolean;
}

function RoundDataRow({ players, round, isValid, isFirst }: RoundDataRowProps) {
  const gic = useGameInteraction();

  const cells = players.map((p) => (
    <PlayerRoundDataCell
      key={p.id}
      roundData={round.playerData[p.id]}
      onClick={() => gic.openScoreInputDialog(p.id, round.roundNumber)}
    />
  ));

  const invalidRoundClass = "table-error";

  return (
    <tr key={round.roundNumber} className={clsx(!isValid && invalidRoundClass)}>
      <th
        scope="row"
        className={clsx(
          isValid ? "table-secondary" : invalidRoundClass,
          "text-center align-middle w-auto",
        )}
      >
        <span className="d-none d-sm-block fs-6 fw-light">
          Runde {round.roundNumber}
        </span>
        {round.cardsDealt}
      </th>
      {cells}
      {isFirst && <td rowSpan={0}></td>}
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

  const colClassName = clsx(
    "col flex-grow-1 flex-shrink-1",
    "p-0",
    "border-end border-dark border-opacity-25",
    "xsmall",
    "align-content-center",
  );

  return (
    <>
      <td className="p-0 border border-secondary h-100">
        <Button
          variant="scoreCell"
          as="a" // required for cross-browser compatibility
          href={undefined}
          className="d-flex flex-column w-100 h-100"
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onClick();
          }}
          aria-label="Daten bearbeiten"
        >
          <div className="d-flex flex-grow-1 text-center border-bottom border-dark border-opacity-25">
            <div className={colClassName}>{bid ?? ""}</div>
            <div className={colClassName}>{tricksTaken ?? ""}</div>
            <div className={clsx(colClassName, "border-end-0")}>
              <span className={clsx(bonusCardPoints === 0 && "invisible")}>
                {bonusCardPoints > 0 ? "+" + bonusCardPoints : bonusCardPoints}
              </span>
            </div>
          </div>
          <div className="d-flex flex-grow-1 justify-content-center align-items-center p-1 p-sm-0">
            <div className={"fw-bold"}>
              <span className={clsx(roundScore === null && "invisible")}>
                {roundScore ?? "n/a"}
              </span>
            </div>
          </div>
        </Button>
      </td>
    </>
  );
}

interface ScoreTableFootProps {
  players: readonly Player[];
  scores: (number | null)[];
}

function ScoreTableFoot({ players, scores }: ScoreTableFootProps) {
  return (
    <tfoot className="table-info fw-bold text-center sticky-bottom">
      <tr>
        <th scope="row" className="table-secondary">
          <span id="totalLabel" className="d-none d-sm-inline">
            Total
          </span>
          <span className="d-inline d-sm-none" aria-labelledby="totalLabel">
            &Sigma;
          </span>
        </th>
        {players.map((p, idx) => {
          const score = scores[idx];
          const isEmptyColumn = score === null;
          return (
            <td key={p.id} className="border border-secondary">
              <span className={clsx(isEmptyColumn && "invisible")}>
                {score}
              </span>
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
}

/** This component should be used within a `.position-relative` container. */
function RankBadge({ rank, limit }: { rank: number; limit?: number }) {
  if (rank < 0) {
    console.error("RankBadge: rank must be non-negative");
    return null;
  }
  if (limit !== undefined && rank >= limit) {
    return null;
  }
  rank = rank + 1;
  return (
    <Badge
      className="position-absolute bottom-0 end-0 bg-dark text-warning rounded-0 py-1 px-1"
      title={`Platz ${rank}`}
    >
      <span className="visually-hidden">Platz</span>
      {rank}
    </Badge>
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
