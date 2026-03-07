import clsx from "clsx";
import type { ConnectStatus } from "src/contexts/socket/BaseClientProvider";

import "./ConnectionStatus.css";

export function ConnectionStatus({ status }: { status: ConnectStatus }) {
  return (
    <div
      className="position-fixed top-0 end-0"
      style={{
        zIndex: 1337,
        paddingTop: "calc(env(safe-area-inset-top) - 15px)",
        paddingRight: "calc(env(safe-area-inset-right) - 15px)",
      }}
    >
      <ConnectionStatusIcon status={status} />
    </div>
  );
}

function ConnectionStatusIcon({ status }: { status: ConnectStatus }) {
  let icon: string;
  let style: string;
  let spin = false;
  switch (status) {
    case "connected":
      icon = "bi-wifi";
      style = "text-white bg-success rounded-circle px-1 fs-6";
      break;
    case "disconnected":
      icon = "bi-wifi-off";
      style = "text-white bg-danger rounded-circle px-1 fs-1";
      break;
    case "connecting":
      icon = "bi-arrow-repeat";
      style = "text-warning fs-1";
      spin = true;
  }

  return <i className={clsx("bi", icon, style, spin && "spin")} />;
}
