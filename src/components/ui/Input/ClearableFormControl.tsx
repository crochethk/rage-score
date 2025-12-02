import { type FormControlProps as BsFormControlProps } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./ClearableFormControl.css";

interface FormControlProps extends BsFormControlProps {
  value: string;
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  /** Whether to show the clear button. */
  showClear?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

/** A text input field (`Form.Control`) with a clear button inside it. */
export function ClearableFormControl({
  value,
  isInvalid,
  onChange,
  onClear,
  showClear = true,
  ref,
  ...bsProps
}: FormControlProps) {
  return (
    <div className="position-relative">
      <Form.Control
        ref={ref}
        value={value}
        onChange={onChange}
        isInvalid={isInvalid}
        {...bsProps}
      />
      {showClear && (
        <Button
          variant="clear"
          size="sm"
          className="position-absolute top-50 end-0 px-3 translate-middle-y"
          onClick={onClear}
          // Prevent text input losing focus
          onPointerDown={(ev) => ev.preventDefault()}
          title="Eingabe leeren"
        >
          <i className="bi bi-x-circle-fill" />
          <span className="visually-hidden">Eingabe leeren</span>
        </Button>
      )}
    </div>
  );
}
