import clsx from "clsx";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import { useBaseClient } from "../contexts/socket/SocketContext";
import { ShareGameModal } from "./dialogs/ShareGameModal";

export function HostClientControls() {
  const [showShareGame, setShowShareGame] = useState(false);
  const { status } = useBaseClient();
  const buttonTitle = "Spielstand freigeben";
  const icon = status !== "connected" ? "bi-share" : "bi-share-fill";
  const btnVariant = status === "connected" ? "success" : "primary";
  return (
    <>
      <Button
        className="m-1"
        variant={btnVariant}
        onClick={() => setShowShareGame(true)}
        title={buttonTitle}
      >
        <i className={clsx("bi", icon)} /> {buttonTitle}
      </Button>
      <ShareGameModal
        show={showShareGame}
        close={() => setShowShareGame(false)}
      />
    </>
  );
}
