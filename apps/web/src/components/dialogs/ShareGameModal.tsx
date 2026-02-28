import clsx from "clsx";
import { Button, Spinner } from "react-bootstrap";
import {
  useBaseClient,
  useHostClient,
} from "../../contexts/socket/SocketContext";
import { QrCodePlaceholder, QrCodeWithLogo } from "../QrCode";
import { Modal } from "./Modal";

interface ShareGameModalProps {
  show: boolean;
  close: () => void;
  roomId?: string;
}

export function ShareGameModal({ show, close }: ShareGameModalProps) {
  const title = "Zuschauer einladen";
  const { status } = useBaseClient();
  const { auth } = useHostClient();
  const { roomId } = auth;

  // For example "https://rage.crochethk.cc/spectate/qHf_dUy4onVuMTDnskwQZA"
  const shareUrl = new URL("/spectate/" + roomId, window.location.origin).href;

  const infoAndUrlClassName = clsx(
    "my-2 text-center",
    (!roomId || status !== "connected") && "invisible",
  );

  return (
    <>
      <Modal title={title} show={show} closeButton onHide={close}>
        <Modal.Body>
          <div className="d-flex justify-content-center flex-column">
            <div className={infoAndUrlClassName}>
              <span className="fw-bold">QR-Code scannen</span> oder{" "}
              <span className="fw-bold">Link teilen</span>, um Zuschauer
              einzuladen:
            </div>

            {status === "connected" && auth.roomId ? (
              <QrCodeWithLogo value={shareUrl} />
            ) : status === "connecting" ? (
              <WaitingForConnectionPlaceholder />
            ) : (
              <QrCodePlaceholder />
            )}

            <div className={infoAndUrlClassName}>
              <code className={clsx("xsmall")}>
                <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                  {shareUrl}
                </a>
              </code>
            </div>
          </div>
          <ShareControls />
        </Modal.Body>
      </Modal>
    </>
  );
}

function WaitingForConnectionPlaceholder() {
  return (
    <div className="position-relative w-100">
      <div className="opacity-25">
        <QrCodePlaceholder />
      </div>
      <div className="position-absolute top-50 start-50 translate-middle text-center justify-content-center">
        <Spinner
          as="p"
          animation="border"
          style={{ "--bs-spinner-animation-speed": "1.5s" }}
        />
        <p>
          Verbindung herstellen...
          <br />
          <span className="fw-light xsmall">
            Dies kann beim ersten Mal ca. 1 min dauern.
          </span>
        </p>
      </div>
    </div>
  );
}

function ShareControls() {
  const { status } = useBaseClient();
  const { client, auth } = useHostClient();

  const startDisabled = status === "connected" || status === "connecting";
  const stopDisabled = !startDisabled;

  return (
    <div className="d-flex justify-content-center gap-1 mt-2">
      <StartSharingButton
        disabled={startDisabled}
        onClick={() => client.connect(auth)}
      />
      <StopSharingButton
        disabled={stopDisabled}
        onClick={() => client.disconnect()}
      />
    </div>
  );
}

interface SharingButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

function StartSharingButton({ disabled, onClick }: SharingButtonProps) {
  return (
    <Button variant="primary" disabled={disabled} onClick={onClick}>
      Freigabe starten
    </Button>
  );
}
function StopSharingButton({ disabled, onClick }: SharingButtonProps) {
  return (
    <Button variant="danger" disabled={disabled} onClick={onClick}>
      Freigabe beenden
    </Button>
  );
}
