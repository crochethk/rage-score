import { v4 as uuid } from "uuid";
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

export function getAdjacentPlayer(
  players: readonly Player[],
  pid: PlayerId,
  mode: "next" | "prev",
): Player {
  const currentIdx = findPlayerIndex(players, pid);
  if (currentIdx !== -1) {
    if (mode === "next") {
      return players[(currentIdx + 1) % players.length];
    } else if (mode === "prev") {
      const index = currentIdx === 0 ? players.length - 1 : currentIdx - 1;
      const thePlayer = players[index];
      return thePlayer;
    } else {
      throw new Error("Invalid mode: " + String(mode));
    }
  } else {
    throw new Error("Player not found: " + pid);
  }
}

/**
 * Returns the index of the player identified by `pid`. Returns -1 if not found.
 */
export function findPlayerIndex(
  players: readonly Player[],
  pid: PlayerId,
): number {
  return players.findIndex((p) => p.id === pid);
}

/**
 * Returns the index of the round identified by `roundNumber`. Returns -1 if not found.
 */
export function findRoundIndex(
  rounds: readonly Round[],
  roundNumber: number,
): number {
  return rounds.findIndex((r) => r.roundNumber === roundNumber);
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
  return { id: uuid(), name, color: color ?? randomRgb() };
}

export function randomRgb(): ColorRgb {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

/** Creates a CSS string which computes the background color given a player's theme color. */
export function toPlayerThemeBg(color: ColorRgb): string {
  return `color-mix(in srgb-linear, rgb(${color.r}, ${color.g}, ${color.b}) 50%, var(--bs-gray-900) 100%)`;
}
