import clsx from "clsx";
import { QRCodeSVG } from "qrcode.react";

export function QrCodeWithLogo({ value }: { value: string }) {
  return (
    <QrCodeContainer>
      <QRCodeSVG
        title={value}
        fgColor="red"
        bgColor="darkblue"
        imageSettings={{
          src: "/apple-touch-icon.png",
          height: 40,
          width: 40,
          excavate: true,
        }}
        className="rounded-3"
        value={value}
        level="M"
        size={160}
      />
    </QrCodeContainer>
  );
}

export function QrCodePlaceholder() {
  return (
    <QrCodeContainer
      style={{
        filter: "blur(5px)",
      }}
    >
      <QrCodeWithLogo value="no room assigned, yet" />
    </QrCodeContainer>
  );
}

interface QrCodeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function QrCodeContainer(props: QrCodeContainerProps) {
  const { children, className, ...rest } = props;
  return (
    <div
      className={clsx(
        "p-2 rounded-4",
        "d-flex w-100",
        "justify-content-center align-items-center",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
