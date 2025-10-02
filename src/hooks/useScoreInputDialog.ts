import { useState } from "react";
import type { Player, Round } from "../types";
import { useSwitch } from "./useSwitch";

export interface ScoreInputDialogState {
  /** The player whose score is input. */
  readonly player: Player;
  readonly setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  /** The round being input. */
  readonly round: Round;
  readonly setRound: React.Dispatch<React.SetStateAction<Round>>;
  /** Whether the dialog should be rendered. */
  readonly isOpen: boolean;
  /** Function to close the dialog. */
  readonly close: () => void;
  /** Function to open the dialog. */
  readonly open: () => void;
}

/**
 * Custom hook to manage the state of a `ScoreInputDialog`.
 */
export function useScoreInputDialog(
  initialPlayer: Player,
  initialRound: Round,
): ScoreInputDialogState {
  const [player, setPlayer] = useState(initialPlayer);
  const [round, setRound] = useState(initialRound);

  const [isOpen, close, open] = useSwitch(false);

  return {
    player,
    setPlayer,
    round,
    setRound,
    isOpen,
    close,
    open,
  } as const;
}
