import { useParams } from "react-router";
import App from "./App";
import { ConnectionStatus } from "./components/ConnectionStatus";
import {
  useBaseClient,
  useSpectatorClient,
} from "./contexts/socket/SocketContext";
import { useGameState } from "./hooks/useGameState";

export function AppSpectator() {
  const { roomId } = useParams();
  const [data, setData] = useSpectatorClient().incomingGameData;
  const gs = useGameState(() => data, setData);

  const { status } = useBaseClient();
  return (
    <>
      <ConnectionStatus status={status} />
      <App gs={gs} readonly />
      <div>
        <hr />
        <code>Zuschauer Raum {roomId}</code>
      </div>
    </>
  );
}
