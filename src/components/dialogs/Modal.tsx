import { Modal as BsModal, Button } from "react-bootstrap";

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
    /** Background color for the modal. Must be a CSS color string. */
    bgColor?: string;
    /** Whether to create an "X" close button which will trigger the `onHide` handler. */
    closeButton?: boolean;
  };
type BsModalProps = React.ComponentProps<typeof BsModal>;

export function Modal(props: ModalProps) {
  const { show, label, title, bgColor, closeButton, ...bsModalProps } = props;
  const bgStyle: React.CSSProperties = bgColor
    ? { "--bs-modal-bg": bgColor }
    : {};

  return (
    <BsModal
      show={show}
      centered
      fullscreen="xs-down"
      contentClassName="border-0 rounded-4 p-3"
      {...bsModalProps}
      style={{ ...bgStyle, ...bsModalProps.style }}
    >
      <Modal.Header
        label={label}
        title={title}
        closeButton={closeButton}
        onHide={props.onHide}
      />
      {props.children}
    </BsModal>
  );
}

type ModalHeaderProps =
  /**
   * Removing "withCloseButton" and related props to avoid confusion:
   * It seems to not have any effect (bug? "closeButton" works despite not being documented)
   */
  Omit<
    React.ComponentProps<typeof BsModal.Header>,
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
  const { label, title, closeButton, onHide, ...bsHeaderProps } = props;
  return (
    <BsModal.Header
      {...bsHeaderProps}
      className="border-0 justify-content-center p-0"
    >
      {
        // Omit title section if there is no title nor label
        (label ?? title) && (
          <BsModal.Title className="text-center">
            {label && <h1 className="h6 text-muted mb-1">{label}</h1>}
            {title && <h2 className="h4 m-0">{title}</h2>}
          </BsModal.Title>
        )
      }
      {closeButton && <Modal.CloseButton onClick={onHide} />}
      {props.children}
    </BsModal.Header>
  );
}

type ModalBodyProps = React.ComponentProps<typeof BsModal.Body>;

function ModalBody(props: ModalBodyProps) {
  return <BsModal.Body className="p-0 my-1">{props.children}</BsModal.Body>;
}

export function ModalCloseButton(props: { onClick?: () => void }) {
  return (
    <Button
      variant="close"
      aria-label="Schließen"
      className="position-absolute top-0 end-0 z-1 m-3"
      data-bs-dismiss="modal"
      onClick={props.onClick}
    />
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.CloseButton = ModalCloseButton;
