import { createContext, use } from "react";
import type { Player, Round } from "../types";

export interface GameInteractionContextType {
  openScoreInputDialog: (player: Player, round: Round) => void;
  openEditPlayerDialog: (player: Player) => void;
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
