import clsx from "clsx";
import Button from "react-bootstrap/Button";
import BsModal, {
  type ModalProps as BsModalProps,
} from "react-bootstrap/Modal";

import { type ModalBodyProps as BsModalBodyProps } from "react-bootstrap/ModalBody";
import { type ModalFooterProps as BsModalFooterProps } from "react-bootstrap/ModalFooter";
import { type ModalHeaderProps as BsModalHeaderProps } from "react-bootstrap/ModalHeader";

declare module "react" {
  /**
   * Extension of React's CSSProperties to allow CSS custom properties (variables).
   */
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export type ModalProps = Required<Pick<BsModalProps, "show">> &
  BsModalProps & {
    /** Text for the default header describing the modal's purpose/context. */
    label?: string;
    /** Title to use for the default modal header. */
    title?: string;
    /** Background color for the modal. Must be a valid CSS color string. */
    bgColor?: string;
    /** Whether to create an "X" close button which will trigger the `onHide` handler. */
    closeButton?: boolean;
  };

export function Modal({
  show,
  label,
  title,
  bgColor,
  closeButton,
  contentClassName,
  style,
  onHide,
  children,
  ...bsModalProps
}: ModalProps) {
  const bgStyle: React.CSSProperties = bgColor
    ? { "--bs-modal-bg": bgColor }
    : {};

  return (
    <BsModal
      show={show}
      centered
      {...bsModalProps}
      contentClassName={clsx("border-0 rounded-4 p-3", contentClassName)}
      style={{ ...bgStyle, ...style }}
      onHide={onHide}
    >
      <Modal.Header
        label={label}
        title={title}
        closeButton={closeButton}
        onHide={onHide}
      />
      {children}
    </BsModal>
  );
}

type ModalHeaderProps =
  /**
   * Removing "withCloseButton" and related props to avoid confusion:
   * It seems to not have any effect (bug? "closeButton" works despite not being documented)
   */
  Omit<
    BsModalHeaderProps,
    "closeLabel" | "closeVariant" | "withCloseButton"
  > & {
    /** Text to show in the header above the title describing the modal's purpose/context. */
    label?: string;
    /** Title text to show in the header. */
    title?: string;
    /** Whether to create an "X" close button which will trigger the `onHide` handler. */
    closeButton?: boolean;
  };

function ModalHeader(props: ModalHeaderProps) {
  const {
    label,
    title,
    closeButton,
    className,
    children,
    onHide,
    ...bsHeaderProps
  } = props;
  return (
    <BsModal.Header
      {...bsHeaderProps}
      className={clsx("border-0 justify-content-center p-0", className)}
    >
      {
        // Omit title section if there is no title nor label
        (label ?? title) && (
          <BsModal.Title className="text-center text-truncate">
            {label && <h1 className="h6 text-muted mb-1">{label}</h1>}
            {title && <h2 className="h4 m-0">{title}</h2>}
          </BsModal.Title>
        )
      }
      {closeButton && <Modal.CloseButton onClick={onHide} />}
      {children}
    </BsModal.Header>
  );
}

type ModalBodyProps = BsModalBodyProps;

function ModalBody({ className, ...bsBodyProps }: ModalBodyProps) {
  return (
    <BsModal.Body {...bsBodyProps} className={clsx("p-0 my-1", className)} />
  );
}

type ModalFooterProps = BsModalFooterProps;

function ModalFooter({ className, ...bsFooterProps }: ModalFooterProps) {
  return (
    <BsModal.Footer
      {...bsFooterProps}
      className={clsx("border-0 p-0 mt-1", className)}
    />
  );
}

export function ModalCloseButton(props: { onClick?: () => void }) {
  return (
    <Button
      variant="close"
      aria-label="Schließen"
      className="position-absolute top-0 end-0 z-1 m-3 shadow-none"
      data-bs-dismiss="modal"
      onClick={props.onClick}
    />
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.CloseButton = ModalCloseButton;
