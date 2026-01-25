import { createContext, use } from "react";
import type { PlayerId } from "../types";

export interface GameInteractionContextType {
  openScoreInputDialog: (playerId: PlayerId, roundNumber: number) => void;
  openEditPlayerDialog: (playerId: PlayerId) => void;
  openAddPlayerDialog: () => void;
  reverseRounds: () => void;
}

export const GameInteractionContext = createContext<
  GameInteractionContextType | undefined
>(undefined);

export function useGameInteraction() {
  const ctx = use(GameInteractionContext);
  if (ctx === undefined) {
    throw new Error(
      "useGameInteraction must be used within a GameInteractionContext",
    );
  }
  return ctx;
}
