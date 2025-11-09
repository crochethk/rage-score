import { v4 as uuid } from "uuid";
import * as clr from "./color";
import type {
  ColorRgb,
  Player,
  PlayerId,
  PlayerRoundData,
  Round,
} from "./types";

/**
 * Creates an array with possible bid values from 0 to `cardsDealt` (including).
 */
export function getPossibleBids(cardsDealt: number): number[] {
  return range(0, cardsDealt + 1);
}

/**
 * Creates an array with bonus point values according to the amount of
 * `bonusCards` in the game.
 * Example: `bonusCards=3` creates an array witch -15 to +15 in steps of 5.
 */
export function getBonusPointsValues(bonusCards = 3): number[] {
  const bonusPerCard = 5;
  const min = bonusCards * -bonusPerCard;
  const max = bonusCards * bonusPerCard;
  return range(min, max + 1, bonusPerCard);
}

/**
 * Type guard function to check whether `PlayerRoundData` has all required
 * fields.
 */
export function isCompletePlayerRoundData(
  data: Partial<PlayerRoundData>,
): data is PlayerRoundData {
  return data.bid !== undefined && data.tricksTaken !== undefined;
}

/**
 * Calculates a player's points of a round based on the provided data.
 */
export function calculateRoundScore(roundData: PlayerRoundData): number {
  const { bid, tricksTaken, bonusCardPoints = 0 } = roundData;
  const bidBonus = tricksTaken === bid ? 10 : -5;
  return tricksTaken + bidBonus + bonusCardPoints;
}

export function calculateTotalScore(
  playerId: PlayerId,
  rounds: readonly Round[],
): number {
  const playerRoundsData = rounds.map((r) => r.playerData[playerId]);
  const score = playerRoundsData.reduce((acc, rd) => {
    return acc + (isCompletePlayerRoundData(rd) ? calculateRoundScore(rd) : 0);
  }, 0);
  return score;
}

/**
 * Tries to get the next or previous player in the given players array.
 */
export function getAdjacentPlayer(
  players: readonly Player[],
  pid: PlayerId,
  mode: "next" | "prev",
): Player {
  const currentIdx = findPlayerIndexOrThrow(players, pid);
  switch (mode) {
    case "next":
      return players[(currentIdx + 1) % players.length];
    case "prev":
      return players[currentIdx === 0 ? players.length - 1 : currentIdx - 1];
    default:
      throw new Error("Invalid mode: " + String(mode));
  }
}

/**
 * Returns the player identified by `pid`.
 * @throws {Error} When `pid` is undefined or when no player with the given ID exists.
 */
export function findPlayerOrThrow(
  players: readonly Player[],
  pid: PlayerId | undefined,
): Player {
  return players[findPlayerIndexOrThrow(players, pid)];
}

/**
 * Returns the index of the player identified by `pid`.
 * @throws {Error} When `pid` is undefined or when no player with the given ID exists.
 */
export function findPlayerIndexOrThrow(
  players: readonly Player[],
  pid: PlayerId | undefined,
): number {
  if (pid === undefined) {
    throw new Error("Player ID is undefined");
  }
  const index = players.findIndex((p) => p.id === pid);
  if (index === -1) {
    throw new Error(`Player with ID '${pid}' not found`);
  }
  return index;
}

/**
 * Returns the round identified by `roundNumber`.
 * @throws {Error} When `roundNumber` is undefined or when no such round exists.
 */
export function findRoundOrThrow(
  rounds: readonly Round[],
  roundNumber: number | undefined,
): Round {
  return rounds[findRoundIndexOrThrow(rounds, roundNumber)];
}

/**
 * Returns the index of the round identified by `roundNumber`.
 * @throws {Error} When `roundNumber` is undefined or when no such round exists.
 */
export function findRoundIndexOrThrow(
  rounds: readonly Round[],
  roundNumber: number | undefined,
): number {
  if (roundNumber === undefined) {
    throw new Error("Round number is undefined");
  }
  const index = rounds.findIndex((r) => r.roundNumber === roundNumber);
  if (index === -1) {
    throw new Error(`Round with roundNumber '${roundNumber}' not found`);
  }
  return index;
}

export function isEmptyColumn(
  playerId: PlayerId,
  rounds: readonly Round[],
): boolean {
  return rounds.every(
    (r) => !isCompletePlayerRoundData(r.playerData[playerId]),
  );
}

/**
 * Creates the given number of empty rounds associated with the given players.
 * The number of cards dealt in each round decreases from `roundsCount` to 1,
 * alike in the standard game rules.
 */
export function createEmptyRounds(
  roundsCount: number,
  players: readonly Player[],
): Round[] {
  const cardsDealt = (i: number) => roundsCount - i + 1;
  return createEmptyRoundsArbitrary(roundsCount, players, cardsDealt);
}

/**
 * Creates the given number of empty rounds associated with the given players.
 * The number of cards dealt in each round is determined by the provided function.
 * @param cardsDealtFn The function to determine cardsDealt for the i-th round.
 * i starts at 1.
 */
function createEmptyRoundsArbitrary(
  roundsCount: number,
  players: readonly Player[],
  cardsDealtFn: (i: number) => number,
): Round[] {
  const rounds = range(1, roundsCount + 1).map((i) => {
    return {
      roundNumber: i,
      cardsDealt: cardsDealtFn(i),
      playerData: createEmptyPlayerDataRecords(players),
    };
  });
  return rounds;
}

/**
 * Utility to create empty partial `PlayerRoundData` records for the given players.
 * This is useful as a starting point for the `Round.playerData` property.
 */
export function createEmptyPlayerDataRecords(
  players: readonly Player[],
): Record<PlayerId, Partial<PlayerRoundData>> {
  return Object.fromEntries(players.map((p) => [p.id, {}]));
}

export function range(start: number, stop: number, step = 1) {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step,
  );
}

export function createPlayer(name: string, color?: ColorRgb): Player {
  return { id: uuid(), name, color: color ?? clr.randomRgb() };
}

/** Creates a CSS string which computes the background color given a player's theme color. */
export function toPlayerThemeBg(color: ColorRgb): string {
  return `color-mix(in srgb-linear, ${clr.toCssRgb(color)} 50%, var(--bs-gray-900) 100%)`;
}

/**
 * Performs validity check of the specified round.
 */
export function isValidRound(
  rounds: readonly Round[],
  roundIndex: number,
  players: readonly Player[],
): boolean {
  const round = rounds[roundIndex];

  // Empty rounds are valid
  if (isEmptyRound(round, players)) {
    return true;
  }

  let pendingBids = 0;
  let pendingTricksTaken = 0;
  let tricksSum = 0;
  for (const p of players) {
    const playerRoundData = round.playerData[p.id];
    pendingBids += playerRoundData.bid === undefined ? 1 : 0;
    pendingTricksTaken += playerRoundData.tricksTaken === undefined ? 1 : 0;
    tricksSum += playerRoundData.tricksTaken ?? 0;
  }

  // Check whether bids are incomplete but any tricksTaken is already specified
  const bidsPlausible =
    pendingBids === 0 || pendingTricksTaken === players.length;

  const tricksTakenPlausible =
    tricksSum === round.cardsDealt ||
    // allow incomplete tricks when correct sum still could be achieved
    (tricksSum < round.cardsDealt && pendingTricksTaken > 0);

  return bidsPlausible && tricksTakenPlausible;
}

function isEmptyRound(round: Round, players: readonly Player[]): boolean {
  return players.every((p) => isEmptyPlayerRoundData(round.playerData[p.id]));
}

/**
 * Check whether `PlayerRoundData` has none of its fields set.
 */
function isEmptyPlayerRoundData(data: Partial<PlayerRoundData>): boolean {
  return (
    data.bid === undefined &&
    data.tricksTaken === undefined &&
    data.bonusCardPoints === undefined
  );
}
