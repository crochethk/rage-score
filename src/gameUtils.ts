import type { Player, PlayerId, PlayerRoundData, Round } from "./types";

/**
 * Type guard function to check whether `PlayerRoundData` is complete.
 */
export function isCompletePlayerRoundData(
  data: Partial<PlayerRoundData>,
): data is PlayerRoundData {
  return (
    data.bid !== undefined &&
    data.tricksTaken !== undefined &&
    data.bonusCardPoints !== undefined
  );
}

/**
 * Calculates a player's points of a round based on the provided data.
 */
export function calculateRoundScore(roundData: PlayerRoundData): number {
  const { bid, tricksTaken, bonusCardPoints } = roundData;
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
    (r) => isCompletePlayerRoundData(r.playerData[playerId]) === false,
  );
}

export function range(start: number, stop: number, step = 1) {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step,
  );
}
