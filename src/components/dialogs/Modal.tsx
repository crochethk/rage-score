import { Modal as BsModal } from "react-bootstrap";

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
      {props.children}
    </BsModal>
  );
}
