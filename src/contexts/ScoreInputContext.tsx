import { createContext, use } from "react";
import type { PlayerId, PlayerRoundData} from "../types";

export interface ScoreInputContextType {
  /** Callback invoked when the score input changes for a player in a round. */
  onScoreInput: (
    playerId: PlayerId,
    newRoundData: Partial<PlayerRoundData>,
  ) => void;

  /** Callback triggered to move to the next player. */
  onNextPlayer: (currentPlayerId: PlayerId) => void;

  /** Callback triggered to move to the previous player. */
  onPrevPlayer: (currentPlayerId: PlayerId) => void;

  /** Callback called when score input is completed. */
  onDone: () => void;
}

export const ScoreInputContext = createContext<
  ScoreInputContextType | undefined
>(undefined);

export function useScoreInput() {
  const ctx = use(ScoreInputContext);
  if (ctx === undefined) {
    throw new Error("useScoreInput must be used within a ScoreInputContext");
  }
  return ctx;
}
