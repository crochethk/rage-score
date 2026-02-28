import type { HostAuth, SpectatorAuth } from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import type { Socket } from "socket.io";

export type ClientSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/** `Socket.data` type */
export interface SocketData {
  /** Similar object to `socket.handshake.auth` but validated/hydrated. */
  auth: SpectatorAuth | Required<HostAuth>;
  // ...
}
