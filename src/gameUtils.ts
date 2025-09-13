import type { PlayerRoundData } from "./types";

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
