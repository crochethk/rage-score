import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import type { GameData } from "../../types";
import { BaseClientProvider } from "./BaseClientProvider";
import { SpectatorClient, type OffFn } from "./SocketClient";
import { SpectatorClientContext } from "./SocketContext";

// TODO transform this file into "SpectatorWrapper" similar to HostWrapper

export function SpectatorWrapper({ url }: { url: string }) {
  const [client] = useState<SpectatorClient>(() => new SpectatorClient(url));
  const { roomId } = useParams();
  useEffect(() => {
    if (roomId !== undefined) client.connect({ roomId });
    return () => client.disconnect();
  }, [client, roomId]);

  return (
    <BaseClientProvider client={client}>
      <SpectatorClientProvider client={client}>
        <Outlet />
      </SpectatorClientProvider>
    </BaseClientProvider>
  );
}

interface SpectatorClientProviderProps {
  client: SpectatorClient;
  children: React.ReactNode;
}
function SpectatorClientProvider(props: SpectatorClientProviderProps) {
  const { client, children } = props;
  const remoteData = useRemoteGameData(client);
  return (
    <SpectatorClientContext value={{ client, incomingGameData: remoteData }}>
      {children}
    </SpectatorClientContext>
  );
}

const emptyData = () => ({ players: [], rounds: [] });

function useRemoteGameData(client: SpectatorClient) {
  const [data, setData] = useState<GameData>(emptyData);

  useEffect(() => {
    const offs: OffFn[] = [
      client.onStateReplace((newData) => setData(newData)),
    ];
    return () => offs.forEach((off) => off());
  }, [client]);

  return [data, setData] as const;
}
