import clsx from "clsx";
import BsButton, {
  type ButtonProps as BsButtonProps,
} from "react-bootstrap/Button";

export type DialogButtonProps = BsButtonProps;

export function DialogButton(props: DialogButtonProps) {
  const { variant = "primary", className, ...bsButtonProps } = props;
  return (
    <BsButton
      {...bsButtonProps}
      variant={variant}
      className={clsx(`border border-${variant}-subtle border-1`, className)}
    />
  );
}
