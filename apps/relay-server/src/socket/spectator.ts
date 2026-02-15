import type { SpectatorAuth } from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import Debug from "debug";
import type { DisconnectReason, Socket } from "socket.io";
import type { RoomStore } from "src/RoomStore.js";
import type { SocketData } from "./client.js";
const dbg = Debug("server:socket:spectator");

export type SpectatorSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SpectatorSocketData
>;

export type SpectatorSocketData = Omit<SocketData, "auth"> & {
  auth: SpectatorAuth;
};

export function setupSocket(socket: SpectatorSocket, rooms: RoomStore) {
  socket.on("disconnecting", (reason) => handleDisconnecting(socket, rooms, reason));
}

function handleDisconnecting(
  socket: SpectatorSocket,
  rooms: RoomStore,
  _reason: DisconnectReason,
) {
  // TODO implement
}
