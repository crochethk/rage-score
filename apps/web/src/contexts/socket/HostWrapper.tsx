import type { HostAuth } from "@repo/shared/socket/auth";
import {
  invalidAuthShapeError,
  invalidTokenOrRoomIdError,
} from "@repo/shared/socket/authErrors";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { BaseClientProvider } from "./BaseClientProvider";
import { BaseClient, HostClient, type OffFn } from "./SocketClient";
import { HostClientContext, useBaseClient } from "./SocketContext";

export function HostWrapper({ url }: { url: string }) {
  const [client] = useState<HostClient>(() => new HostClient(url));

  return (
    <BaseClientProvider client={client}>
      <HostClientProvider client={client}>
        <Outlet />
      </HostClientProvider>
    </BaseClientProvider>
  );
}

interface HostClientProviderProps {
  client: HostClient;
  children: React.ReactNode;
}
function HostClientProvider(props: HostClientProviderProps) {
  const { client, children } = props;
  const auth = useRoomAuth(client);

  const { status } = useBaseClient();
  const connectionDesired = useConnectionDesire(client);
  useEffect(() => {
    if (connectionDesired && status === "disconnected") {
      client.connect(auth);
    }
  }, [auth, client, connectionDesired, status]);

  const spectators = useSpectatorCount(client);

  return (
    <HostClientContext
      value={{
        client,
        auth,
        connectionDesired,
        spectators,
      }}
    >
      {children}
    </HostClientContext>
  );
}

const emptyAuth: () => HostAuth = () => ({ role: "host" });

function useRoomAuth(client: HostClient) {
  const [auth, setAuth] = useLocalStorage<HostAuth>("roomAuth", emptyAuth());

  useEffect(() => {
    const handleConnectError = ({ message }: Error) => {
      // retry connection with empty auth if server rejected provided
      if (
        message === invalidTokenOrRoomIdError ||
        message === invalidAuthShapeError
      ) {
        client.connect(emptyAuth());
      }
    };

    const offs: OffFn[] = [
      client.onRoomAuth((auth) => setAuth(auth)),
      client.onStartDisconnect(() => setAuth(emptyAuth)),
      client.onConnectError(handleConnectError),
    ];
    return () => offs.forEach((off) => off());
  }, [client, setAuth]);

  return auth;
}

interface ConnectionDesireRecord {
  desired: boolean;
  timestamp: number;
}

const CONNECTION_DESIRE_EXPIRATION = 2 * 60 * 60_000; // 2h
const connectionNotDesired = { desired: false, timestamp: 0 };

function useConnectionDesire(client: BaseClient) {
  const sanitizeExpired = (prevConnDesire: ConnectionDesireRecord) => {
    if (!prevConnDesire.desired) return prevConnDesire;
    const now = Date.now();
    const timestamp = prevConnDesire.timestamp;
    const isExpired = now - timestamp > CONNECTION_DESIRE_EXPIRATION;
    return isExpired ? connectionNotDesired : { desired: true, timestamp: now };
  };

  const [connDesire, setConnDesire] = useLocalStorage<ConnectionDesireRecord>(
    "hostConnectionDesire",
    connectionNotDesired,
    sanitizeExpired,
  );

  useEffect(() => {
    const setDesiredToTrue = () =>
      setConnDesire({ desired: true, timestamp: Date.now() });
    const offs = [
      client.onStartConnect(setDesiredToTrue),
      client.onConnected(setDesiredToTrue),
      client.onStartDisconnect(() => setConnDesire(connectionNotDesired)),
    ];
    return () => offs.forEach((off) => off());
  }, [client, setConnDesire]);

  return connDesire.desired;
}

function useSpectatorCount(client: HostClient) {
  const [count, setCount] = useState(0);
  useEffect(() => client.onSpectatorCount((c) => setCount(c)), [client]);
  return count;
}
