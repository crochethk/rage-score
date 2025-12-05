import { createContext, use, useCallback, useMemo } from "react";
import * as gu from "../gameUtils";
import type { DialogState } from "../hooks/useDialogState";
import type { GameState, PlayerUpdate } from "../hooks/useGameState";
import type { PlayerId } from "../types";

export interface StateArgs {
  gs: GameState;
  dialogState: DialogState<EditPlayerDialogData>;
}

export interface EditPlayerDialogData {
  playerId: PlayerId;
}

export interface EditPlayerContextValue {
  /** Callback called when the dialog should be closed keeping changes. */
  onSave: (playerId: PlayerId, updateData: PlayerUpdate) => void;
  /** Callback called when the dialog should be closed discarding changes. */
  onCancel: () => void;
  /** Callback called when the current player should be removed from the game. */
  onRemovePlayer: (playerId: PlayerId) => void;
  /** Callback called when the current player's column should be shifted left or right. */
  onShiftPlayer: (playerId: PlayerId, direction: "right" | "left") => void;
}

const EditPlayerContext = createContext<EditPlayerContextValue | undefined>(
  undefined,
);

export function EditPlayerProvider({
  state,
  children,
}: {
  state: StateArgs;
  children: React.ReactNode;
}) {
  return (
    <EditPlayerContext value={useContextValue(state)}>
      {children}
    </EditPlayerContext>
  );
}

function useContextValue(stateArgs: StateArgs): EditPlayerContextValue {
  const { gs, dialogState } = stateArgs;

  const onSave = useCallback(
    (playerId: PlayerId, updateData: PlayerUpdate) => {
      gs.updatePlayer(playerId, updateData);
      dialogState.close();
    },
    [dialogState, gs],
  );

  const onCancel = useCallback(() => {
    dialogState.close();
  }, [dialogState]);

  const onRemovePlayer = useCallback(
    (playerId: PlayerId) => {
      gs.removePlayer(playerId);
      dialogState.close();
    },
    [dialogState, gs],
  );

  const onShiftPlayer = useCallback(
    (playerId: PlayerId, direction: "left" | "right") => {
      switch (direction) {
        case "left":
          gs.setState({
            players: gu.shiftPlayerLeft(gs.players, playerId),
            rounds: gs.rounds,
          });
          break;
        case "right":
          gs.setState({
            players: gu.shiftPlayerRight(gs.players, playerId),
            rounds: gs.rounds,
          });
          break;
      }
    },
    [gs],
  );

  return useMemo(
    () => ({
      onSave,
      onCancel,
      onRemovePlayer,
      onShiftPlayer,
    }),
    [onCancel, onRemovePlayer, onSave, onShiftPlayer],
  );
}

export function useEditPlayer() {
  const ctx = use(EditPlayerContext);
  if (ctx === undefined) {
    throw new Error("useEditPlayer must be used within an EditPlayerContext");
  }
  return ctx;
}
