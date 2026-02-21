import { useEffect, useState } from "react";
import { BaseClient } from "./SocketClient";
import { BaseClientContext } from "./SocketContext";

export type ConnectStatus = "connected" | "connecting" | "disconnected";

export interface BaseClientProviderProps {
  client: BaseClient;
  children: React.ReactNode;
}
export function BaseClientProvider(props: BaseClientProviderProps) {
  const { client, children } = props;
  const status = useConnectStatus(client);
  return <BaseClientContext value={{ status }}>{children}</BaseClientContext>;
}

// --Note--
// Keeping these kind of hooks private and only exposing the value via provider
// avoids duplicate state and listeners, in case the value needs to be used in
// multiple places.
function useConnectStatus(client: BaseClient) {
  const [status, setStatus] = useState<ConnectStatus>("disconnected");

  useEffect(() => {
    const offs = [
      client.onConnectError(() =>
        setStatus(client.active ? "connecting" : "disconnected"),
      ),
      client.onStartConnect(() => setStatus("connecting")),
      client.onStartDisconnect(() => setStatus("disconnected")),
      client.onConnected(() => setStatus("connected")),
      client.onDisconnected(() =>
        setStatus(client.active ? "connecting" : "disconnected"),
      ),
    ];
    return () => offs.forEach((off) => off());
  }, [client]);

  return status;
}
