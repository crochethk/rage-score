import { useState, type JSX } from "react";
import type { FormGroupProps } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import * as clr from "../../color";
import {
  EditPlayerProvider,
  useEditPlayer,
  type StateArgs,
} from "../../contexts/EditPlayerContext";
import * as gu from "../../gameUtils";
import type { Player } from "../../types";
import { DialogButton } from "../ui/Button/DialogButton";
import { RemoveButton } from "../ui/Button/RemoveButton";
import { ClearableFormControl } from "../ui/Input/ClearableFormControl";
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
  const [newColorHex, setNewColorHex] = useState(clr.toCssHex(player.color));
  const { onSave, onCancel, onRemovePlayer } = useEditPlayer();

  const trimmedName = newName.trim();
  const saveDisabled =
    trimmedName === "" ||
    (player.name === trimmedName && clr.toCssHex(player.color) === newColorHex);

  return (
    <Modal
      show={isOpen}
      label={`Spieler bearbeiten`}
      title={player.name}
      bgColor={gu.toPlayerThemeBg(clr.fromCssHex(newColorHex))}
      closeButton
      onHide={onCancel}
      onEscapeKeyDown={(ev) => {
        if (!saveDisabled) ev.preventDefault();
      }}
      backdrop={saveDisabled || "static"}
    >
      <Modal.Header>
        <RemoveButton
          description="Spieler löschen"
          size="sm"
          className="position-absolute start-0 top-0 m-3"
          onClick={() => onRemovePlayer(player.id)}
        />
      </Modal.Header>
      <Modal.Body>
        <LabeledFormGroup label="Neuer Name" controlId="editPlayer.name">
          <ClearableFormControl
            value={newName}
            onChange={(ev) => setNewName(ev.target.value)}
            onClear={() => setNewName("")}
            isInvalid={trimmedName === ""}
            showClear={trimmedName !== ""}
            placeholder="Name eingeben..."
          />
        </LabeledFormGroup>
        <LabeledFormGroup label="Farbe" controlId="editPlayer.color">
          <Form.Control
            type="color"
            value={newColorHex}
            onChange={(ev) => setNewColorHex(ev.target.value)}
          />
        </LabeledFormGroup>
      </Modal.Body>
      <Modal.Footer>
        <div className="text-end m-0">
          <DialogButton
            variant="primary"
            className="ms-2 py-1"
            onClick={() => {
              onSave(player.id, {
                name: trimmedName,
                color: clr.fromCssHex(newColorHex),
              });
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

interface LabeledFormGroupProps extends FormGroupProps {
  label: string | JSX.Element;
  labelClassName?: string;
}

/**
 * Renders a `Form.Group` in a `Row` with a label in the first `Col`. `children`
 * is placed in the second `Col` and should typically be a form control.
 * By default, the label column has a fixed grid width but can be overridden via
 * `labelClassName`.
 */
function LabeledFormGroup({
  controlId,
  className,
  label,
  labelClassName,
  children,
  ...bsFormGroupProps
}: LabeledFormGroupProps) {
  return (
    <Form.Group
      as={Row}
      controlId={controlId}
      className={"py-1 " + (className ?? "")}
      {...bsFormGroupProps}
    >
      <Form.Label column className={"col-3 text-end " + (labelClassName ?? "")}>
        {label}
      </Form.Label>
      <Col>{children}</Col>
    </Form.Group>
  );
}
