import { type HostAuth } from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import {
  io as ioClient,
  type ManagerOptions,
  type Socket,
  type SocketOptions,
} from "socket.io-client";

export type RoomAuthPayload = Required<Pick<HostAuth, "roomId" | "token">>;
export type TestClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export async function connectClient(url: string, auth: Record<string, unknown>) {
  const socket: TestClientSocket = createClient(url, { auth });
  await new Promise<void>((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.on("connect_error", (err: Error) => reject(err));
  });
  return socket;
}

export async function createHost(url: string) {
  const socket: TestClientSocket = createClient(url, { auth: { role: "host" } });
  const roomAuth = await new Promise<RoomAuthPayload>((resolve, reject) => {
    socket.once("srv:room:auth", (roomId: string, token: string) =>
      resolve({ roomId, token }),
    );
    socket.on("connect_error", (err: Error) => reject(err));
  });
  return { ...roomAuth, socket };
}

export function createClient(
  url: string,
  opts?: Partial<ManagerOptions & SocketOptions>,
): TestClientSocket {
  return ioClient(url, {
    transports: ["websocket"],
    reconnection: false,
    forceNew: true,
    ...opts,
  }) as Socket<ServerToClientEvents, ClientToServerEvents>;
}
