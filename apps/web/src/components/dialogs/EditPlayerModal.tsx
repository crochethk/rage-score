import ButtonGroup from "react-bootstrap/ButtonGroup";
import * as clr from "../../color";
import {
  EditPlayerProvider,
  useEditPlayer,
  type StateArgs,
} from "../../contexts/EditPlayerContext";
import * as gu from "../../gameUtils";
import type { Player, PlayerId } from "../../types";
import { DialogButton } from "../ui/Button/DialogButton";
import { RemoveButton } from "../ui/Button/RemoveButton";
import { PlayerFormModal } from "./PlayerFormModal";

export function EditPlayerModal(stateArgs: StateArgs) {
  const { gs, dialogState } = stateArgs;
  return (
    <EditPlayerProvider state={stateArgs}>
      <InternalEditPlayerModal
        isOpen={dialogState.isOpen}
        playerId={dialogState.data!.playerId}
        players={gs.players}
      />
    </EditPlayerProvider>
  );
}

interface InternalEditPlayerModalProps {
  isOpen: boolean;
  playerId: PlayerId;
  players: readonly Player[];
}

/** `EditPlayerModal` for use inside a wrapping `EditPlayerProvider` */
function InternalEditPlayerModal(props: InternalEditPlayerModalProps) {
  const { isOpen, playerId, players } = props;
  const { onSave, onCancel, onRemovePlayer, onShiftPlayer } = useEditPlayer();
  const playerIndex = gu.findPlayerIndexOrThrow(players, playerId);
  const player = players[playerIndex];

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
      footerChildren={
        <ButtonGroup className="mt-2 d-inline-block">
          <DialogButton
            variant="secondary"
            onClick={() => onShiftPlayer(playerIndex, "prev")}
            disabled={playerIndex <= 0}
          >
            <i className="bi bi-arrow-bar-left"></i>
          </DialogButton>
          <DialogButton
            variant="secondary"
            onClick={() => onShiftPlayer(playerIndex, "next")}
            disabled={playerIndex >= players.length - 1}
          >
            <i className="bi bi-arrow-bar-right"></i>
          </DialogButton>
        </ButtonGroup>
      }
    ></PlayerFormModal>
  );
}
