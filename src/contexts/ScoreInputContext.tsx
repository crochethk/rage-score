import { createContext, use, useCallback, useMemo } from "react";
import * as gu from "../gameUtils";
import type { GameState, PlayerRoundDataUpdate } from "../hooks/useGameState";
import type { ScoreInputDialogState } from "../hooks/useScoreInputDialog";
import type { PlayerId } from "../types";

export interface ScoreInputContextValue {
  /** Callback invoked when the score input changes for a player in a round. */
  onScoreInput: (
    playerId: PlayerId,
    newRoundData: PlayerRoundDataUpdate,
  ) => void;

  /** Callback triggered to change dialog context to the next player. */
  onNextPlayer: (currentPlayerId: PlayerId) => void;

  /** Callback triggered to change dialog context to the previous player. */
  onPrevPlayer: (currentPlayerId: PlayerId) => void;

  /** Callback called when score input is completed. */
  onDone: () => void;
}

const ScoreInputContext = createContext<ScoreInputContextValue | undefined>(
  undefined,
);

interface StateArgs {
  gs: GameState;
  scoreInput: ScoreInputDialogState;
}

export function ScoreInputProvider({
  state,
  children,
}: {
  state: StateArgs;
  children: React.ReactNode;
}) {
  return (
    <ScoreInputContext value={useContextValue(state)}>
      {children}
    </ScoreInputContext>
  );
}

function useContextValue(stateArgs: StateArgs) {
  const { gs, scoreInput } = stateArgs;
  const handleScoreInput = useCallback(
    (pid: PlayerId, newPlayerRoundData: PlayerRoundDataUpdate) => {
      gs.updatePlayerRoundData(pid, scoreInput.roundNumber!, newPlayerRoundData);
    },
    [gs, scoreInput.roundNumber],
  );

  const handleNextPlayer = useCallback(
    (currentId: PlayerId) => {
      const next = gu.getAdjacentPlayer(gs.players, currentId, "next");
      scoreInput.open(next.id, scoreInput.roundNumber!);
    },
    [gs.players, scoreInput],
  );

  const handlePrevPlayer = useCallback(
    (currentId: PlayerId) => {
      const prev = gu.getAdjacentPlayer(gs.players, currentId, "prev");
      scoreInput.open(prev.id, scoreInput.roundNumber!);
    },
    [gs.players, scoreInput],
  );

  return useMemo(
    () => ({
      onScoreInput: handleScoreInput,
      onNextPlayer: handleNextPlayer,
      onPrevPlayer: handlePrevPlayer,
      onDone: scoreInput.close,
    }),
    [handleNextPlayer, handlePrevPlayer, handleScoreInput, scoreInput.close],
  );
}

export function useScoreInput() {
  const ctx = use(ScoreInputContext);
  if (ctx === undefined) {
    throw new Error("useScoreInput must be used within a ScoreInputContext");
  }
  return ctx;
}
