import type { HostAuth } from "@repo/shared/socket/auth";
import {
  invalidAuthShapeError,
  invalidTokenOrRoomIdError,
} from "@repo/shared/socket/authErrors";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { BaseClientProvider } from "./BaseClientProvider";
import { HostClient, type OffFn } from "./SocketClient";
import { HostClientContext } from "./SocketContext";

// TODO reconnect on page reload (only) if client was previously connected

export function HostWrapper({ url }: { url: string }) {
  const [client] = useState<HostClient>(() => new HostClient(url));
  useEffect(() => {
    return () => client.disconnect();
  }, [client]);

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

  return (
    <HostClientContext
      value={{
        client,
        auth,
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
