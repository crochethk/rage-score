import { useState } from "react";
import type { Player, Round } from "../types";
import { useSwitch } from "./useSwitch";

/**
 * Custom hook to manage the state of a `ScoreInputDialog`.
 */
export function useScoreInputDialog(
  initialPlayer: Player,
  initialRound: Round,
) {
  const [player, setPlayer] = useState(initialPlayer);
  const [round, setRound] = useState(initialRound);

  const [isOpen, close, open] = useSwitch(false);

  return {
    /** The player whose score is input. */
    player,
    setPlayer,
    /** The round being input. */
    round,
    setRound,
    /** Whether the dialog should be rendered. */
    isOpen,
    /** Function to close the dialog. */
    close,
    /** Function to open the dialog. */
    open,
  } as const;
}
