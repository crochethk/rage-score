import { Button } from "react-bootstrap";
import type { ReactNode } from "react";

export interface DialogButtonProps {
  children?: ReactNode;
  "aria-label"?: string;
  onClick?: () => void;
}

export function PrimaryDialogButton(props: DialogButtonProps) {
  return (
    <Button
      variant="primary"
      className="border border-primary-subtle border-1"
      aria-label={props["aria-label"]}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

export function SecondaryDialogButton(props: DialogButtonProps) {
  return (
    <Button
      variant="secondary"
      className="border border-secondary-subtle border-1"
      aria-label={props["aria-label"]}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
