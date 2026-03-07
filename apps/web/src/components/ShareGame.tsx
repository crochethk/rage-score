import clsx from "clsx";
import { useState } from "react";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { useBaseClient, useHostClient } from "../contexts/socket/SocketContext";
import { ShareGameModal } from "./dialogs/ShareGameModal";

export function HostClientControls() {
  const [showShareGame, setShowShareGame] = useState(false);
  const { status } = useBaseClient();
  const { spectators } = useHostClient();
  const buttonTitle = "Spielstand freigeben";
  const icon = status !== "connected" ? "bi-share" : "bi-share-fill";
  const btnVariant = status === "connected" ? "success" : "primary";
  return (
    <>
      <Button
        className="m-1 position-relative"
        variant={btnVariant}
        onClick={() => setShowShareGame(true)}
        title={buttonTitle}
      >
        <i className={clsx("bi", icon)} /> {buttonTitle}
        {spectators > 0 && <SpectatorBadge count={spectators} />}
      </Button>
      <ShareGameModal
        show={showShareGame}
        close={() => setShowShareGame(false)}
      />
    </>
  );
}

function SpectatorBadge({ count }: { count: number }) {
  return (
    <Badge
      bg="info"
      pill
      className="position-absolute top-0 start-100 translate-middle"
    >
      {count}
      <span className="visually-hidden">Verbundene Zuschauer</span>
    </Badge>
  );
}
