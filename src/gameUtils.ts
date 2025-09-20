import type { Player, PlayerId, PlayerRoundData, Round } from "./types";

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
  rounds: Round[],
): number {
  const playerRoundsData = rounds.map((r) => r.playerData[playerId]);
  const score = playerRoundsData.reduce((acc, rd) => {
    return acc + (isCompletePlayerRoundData(rd) ? calculateRoundScore(rd) : 0);
  }, 0);
  return score;
}

export function getAdjacentPlayer(
  players: Player[],
  pid: PlayerId,
  mode: "next" | "prev",
): Player {
  const currentIdx = players.findIndex((p) => p.id === pid);
  if (currentIdx >= 0) {
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

export function isEmptyColumn(playerId: PlayerId, rounds: Round[]) {
  return rounds.every(
    (r) => !isCompletePlayerRoundData(r.playerData[playerId]),
  );
}

/**
 * Creates the given number of empty rounds associated with the given players.
 * The number of cards dealt in each round decreases from `roundsCount` to 1,
 * alike in the standard game rules.
 */
export function createEmptyRounds(roundsCount: number, players: Player[]) {
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
  players: Player[],
  cardsDealtFn: (i: number) => number,
) {
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
  players: Player[],
): Record<PlayerId, Partial<PlayerRoundData>> {
  return Object.fromEntries(players.map((p) => [p.id, {}]));
}

export function range(start: number, stop: number, step = 1) {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step,
  );
}
