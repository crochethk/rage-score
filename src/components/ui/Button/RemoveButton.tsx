import clsx from "clsx";
import BsButton, {
  type ButtonProps as BsButtonProps,
} from "react-bootstrap/Button";

export type RemoveButtonProps = BsButtonProps & {
  /** Description for screen readers */
  description?: string;
};

export function RemoveButton(props: RemoveButtonProps) {
  const { description, variant = "danger", children, ...bsButtonProps } = props;
  return (
    <BsButton variant={variant} title={description} {...bsButtonProps}>
      <i className={clsx("bi bi-trash", children && "me-1")} />
      {description && !children && (
        <span className="visually-hidden">{description}</span>
      )}
      {children}
    </BsButton>
  );
}
