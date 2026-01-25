import { createContext, use, useCallback, useMemo } from "react";
import * as gu from "../gameUtils";
import type { DialogState } from "../hooks/useDialogState";
import type { GameState, PlayerRoundDataUpdate } from "../hooks/useGameState";
import type { PlayerId } from "../types";

export interface StateArgs {
  gs: GameState;
  scoreInputState: DialogState<ScoreInputData>;
}

export interface ScoreInputData {
  playerId: PlayerId;
  roundNumber: number;
}

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
  const { gs, scoreInputState } = stateArgs;
  const handleScoreInput = useCallback(
    (pid: PlayerId, updateData: PlayerRoundDataUpdate) => {
      gs.updatePlayerRoundData(
        pid,
        scoreInputState.data!.roundNumber,
        updateData,
      );
    },
    [gs, scoreInputState.data],
  );

  const handleNextPlayer = useCallback(
    (currentId: PlayerId) => {
      const next = gu.getAdjacentPlayer(gs.players, currentId, "next");

      scoreInputState.open({ ...scoreInputState.data!, playerId: next.id });
    },
    [gs.players, scoreInputState],
  );

  const handlePrevPlayer = useCallback(
    (currentId: PlayerId) => {
      const prev = gu.getAdjacentPlayer(gs.players, currentId, "prev");
      scoreInputState.open({ ...scoreInputState.data!, playerId: prev.id });
    },
    [gs.players, scoreInputState],
  );

  return useMemo(
    () => ({
      onScoreInput: handleScoreInput,
      onNextPlayer: handleNextPlayer,
      onPrevPlayer: handlePrevPlayer,
      onDone: scoreInputState.close,
    }),
    [
      handleNextPlayer,
      handlePrevPlayer,
      handleScoreInput,
      scoreInputState.close,
    ],
  );
}

export function useScoreInput() {
  const ctx = use(ScoreInputContext);
  if (ctx === undefined) {
    throw new Error("useScoreInput must be used within a ScoreInputContext");
  }
  return ctx;
}
