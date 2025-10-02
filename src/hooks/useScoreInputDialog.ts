import { useCallback, useMemo, useState } from "react";
import type { PlayerId } from "../types";

export interface ScoreInputDialogState {
  /** ID of the player whose score is input. */
  readonly playerId?: PlayerId;
  /** Number of the round being input. */
  readonly roundNumber?: number;
  /** Whether the dialog should be rendered. */
  readonly isOpen: boolean;
  /** Function to close the dialog. */
  readonly close: () => void;
  /** Function to open the dialog using the target player and round. */
  readonly open: (playerId: PlayerId, roundNumber: number) => void;
}

/**
 * Custom hook to manage the state of a `ScoreInputDialog`.
 */
export function useScoreInputDialog(): ScoreInputDialogState {
  const [playerId, setPlayerId] = useState<PlayerId | undefined>(undefined);
  const [roundNumber, setRoundNumber] = useState<number | undefined>(undefined);

  const close = useCallback(() => {
    setPlayerId(undefined);
    setRoundNumber(undefined);
  }, []);

  const open = useCallback((pid: PlayerId, roundNumber: number) => {
    setPlayerId(pid);
    setRoundNumber(roundNumber);
  }, []);

  const isOpen = playerId !== undefined && roundNumber !== undefined;

  return useMemo(
    () =>
      ({
        playerId,
        roundNumber,
        isOpen,
        close,
        open,
      }) as const,
    [close, isOpen, open, playerId, roundNumber],
  );
}
