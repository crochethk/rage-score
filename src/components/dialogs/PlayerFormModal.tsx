import { useState, type JSX } from "react";
import type { FormGroupProps } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import * as clr from "../../color";
import * as gu from "../../gameUtils";
import { DialogButton } from "../ui/Button/DialogButton";
import { ClearableFormControl } from "../ui/Input/ClearableFormControl";
import { Modal } from "./Modal";

interface PlayerFormModalProps {
  isOpen: boolean;

  // Header properties
  label: string;
  title?: string;

  // Initial form values
  initialName: string;
  initialColorHex: string;

  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (name: string, colorHex: string) => void;
  onCancel: () => void;

  // Optional additional header content (e.g. a Remove button)
  headerChildren?: React.ReactNode;
}

export function PlayerFormModal(props: PlayerFormModalProps) {
  const {
    isOpen,
    label,
    title,
    initialName,
    initialColorHex = "#000000",
    confirmLabel = "Ok",
    cancelLabel = "Abbrechen",
    onConfirm,
    onCancel,
    headerChildren,
  } = props;

  const [newName, setNewName] = useState(initialName);
  const [newColorHex, setNewColorHex] = useState(initialColorHex);

  const trimmedName = newName.trim();

  const isUnchanged =
    initialName === trimmedName && initialColorHex === newColorHex;
  const confirmDisabled = trimmedName === "" || isUnchanged;

  // Only allow confirming if save is enabled
  const handleConfirm = () => {
    if (!confirmDisabled) onConfirm(trimmedName, newColorHex);
  };

  return (
    <Modal
      show={isOpen}
      label={label}
      title={title}
      bgColor={gu.toPlayerThemeBg(clr.fromCssHex(newColorHex))}
      closeButton
      onHide={onCancel}
      onEscapeKeyDown={(ev) => {
        if (!confirmDisabled) ev.preventDefault();
      }}
      backdrop={confirmDisabled || "static"}
    >
      <Modal.Header>{headerChildren}</Modal.Header>
      <Modal.Body>
        <LabeledFormGroup label="Name" controlId="playerForm.name">
          <ClearableFormControl
            value={newName}
            onChange={(ev) => setNewName(ev.target.value)}
            onClear={() => setNewName("")}
            isInvalid={trimmedName === ""}
            showClear={trimmedName !== ""}
            placeholder="Name eingeben..."
            onKeyDown={(ev) => {
              if (ev.key === "Enter") handleConfirm();
            }}
          />
        </LabeledFormGroup>
        <LabeledFormGroup label="Farbe" controlId="playerForm.color">
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
            onClick={handleConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </DialogButton>
          <DialogButton
            variant="secondary"
            className="ms-2 py-1"
            onClick={onCancel}
          >
            {cancelLabel}
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
      <Form.Label column className={"col-2 text-end " + (labelClassName ?? "")}>
        {label}
      </Form.Label>
      <Col>{children}</Col>
    </Form.Group>
  );
}
