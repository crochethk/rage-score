import { useState } from "react";
import {
  EditPlayerProvider,
  useEditPlayer,
  type StateArgs,
} from "../../contexts/EditPlayerContext";
import * as gu from "../../gameUtils";
import type { Player } from "../../types";
import { DialogButton } from "../ui/Button/DialogButton";
import { Modal } from "./Modal";

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
  const [newName, setNewName] = useState(player.name);
  const { onSave, onCancel } = useEditPlayer();

  const saveDisabled = newName.trim() === "" || player.name === newName.trim();

  return (
    <Modal
      show={isOpen}
      label={`Spieler bearbeiten`}
      title={player.name}
      bgColor={gu.toPlayerThemeBg(player.color)}
      closeButton
      onHide={onCancel}
      onEscapeKeyDown={(ev) => {
        if (!saveDisabled) ev.preventDefault();
      }}
      backdrop={saveDisabled || "static"}
    >
      <Modal.Body>
        <div className="col-sm-6">
          <label htmlFor="playerName" className="form-label">
            Name
          </label>
          <input
            id="playerName"
            type="text"
            className="form-control"
            value={newName}
            required
            onChange={(ev) => setNewName(ev.target.value)}
          />
        </div>
        {/* <div>Farbe: {"<COLOR PICKER>"}</div> */}
      </Modal.Body>
      <Modal.Footer>
        <div className="text-end m-0">
          <DialogButton
            variant="primary"
            className="ms-2 py-1"
            onClick={() => {
              onSave(player.id, { name: newName });
            }}
            disabled={saveDisabled}
          >
            Speichern
          </DialogButton>
          <DialogButton
            variant="secondary"
            className="ms-2 py-1"
            onClick={onCancel}
          >
            Abbrechen
          </DialogButton>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
