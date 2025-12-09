import { useCallback, useState } from "react";
import * as clr from "../../color";
import type { DialogState } from "../../hooks/useDialogState";
import type { GameState } from "../../hooks/useGameState";
import { PlayerFormModal } from "./PlayerFormModal";

interface AddPlayerModalProps {
  gs: GameState;
  dialogState: DialogState<null>;
}

export function AddPlayerModal(props: AddPlayerModalProps) {
  const { gs, dialogState } = props;

  const [formVersion, setFormVersion] = useState(0);
  const handleConfirm = useCallback(
    (name: string, colorHex: string) => {
      gs.addPlayer({ name, color: clr.fromCssHex(colorHex) });
      // Trigger re-mount of the component by changing the key
      setFormVersion((v) => v + 1);
    },
    [gs],
  );

  return (
    <PlayerFormModal
      key={formVersion} // Remounts the component when formVersion changes
      isOpen={dialogState.isOpen}
      label={"Spieler hinzufügen"}
      initialName={""}
      initialColorHex={clr.toCssHex(clr.randomRgb())}
      confirmLabel="Hinzufügen"
      cancelLabel="Schließen"
      onConfirm={handleConfirm}
      onCancel={dialogState.close}
    />
  );
}
