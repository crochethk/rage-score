import * as clr from "../../color";
import {
  EditPlayerProvider,
  useEditPlayer,
  type StateArgs,
} from "../../contexts/EditPlayerContext";
import * as gu from "../../gameUtils";
import type { Player } from "../../types";
import { RemoveButton } from "../ui/Button/RemoveButton";
import { PlayerFormModal } from "./PlayerFormModal";

export function EditPlayerModal(stateArgs: StateArgs) {
  const { gs, dialogState } = stateArgs;
  const player = gu.findPlayerOrThrow(gs.players, dialogState.data!.playerId);
  return (
    <EditPlayerProvider state={stateArgs}>
      <InternalEditPlayerModal isOpen={dialogState.isOpen} player={player} />
    </EditPlayerProvider>
  );
}

interface InternalEditPlayerModalProps {
  isOpen: boolean;
  player: Player;
}

/** `EditPlayerModal` for use inside a wrapping `EditPlayerProvider` */
function InternalEditPlayerModal(props: InternalEditPlayerModalProps) {
  const { isOpen, player } = props;
  const { onSave, onCancel, onRemovePlayer } = useEditPlayer();

  return (
    <PlayerFormModal
      isOpen={isOpen}
      label={"Spieler bearbeiten"}
      title={player.name}
      initialName={player.name}
      initialColorHex={clr.toCssHex(player.color)}
      confirmLabel="Speichern"
      onConfirm={(name, colorHex) =>
        onSave(player.id, {
          name,
          color: clr.fromCssHex(colorHex),
        })
      }
      onCancel={onCancel}
      headerChildren={
        <RemoveButton
          description="Spieler löschen"
          size="sm"
          className="position-absolute start-0 top-0 m-3"
          onClick={() => onRemovePlayer(player.id)}
        />
      }
    />
  );
}
