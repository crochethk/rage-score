import type { ClientAuth, HostAuth } from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import Debug from "debug";
import type { DisconnectReason, Socket } from "socket.io";
import type { RoomStore } from "../RoomStore.js";
import type { SocketData } from "./client.js";
const dbg = Debug("server:socket:host");

export type HostSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  HostSocketData
>;

export type HostSocketData = Omit<SocketData, "auth"> & {
  auth: Required<HostAuth>;
};

export function setupSocket(socket: HostSocket, rooms: RoomStore) {
  if (isNewHostSession(socket)) {
    const auth = socket.data.auth;
    socket.emit("srv:room:auth", auth.roomId, auth.token);
  }

  socket.on("disconnecting", (reason) => handleDisconnecting(socket, rooms, reason));
}

function isNewHostSession(socket: HostSocket) {
  const auth = socket.handshake.auth as ClientAuth;
  return auth.role === "host" && !auth.roomId;
}

function handleDisconnecting(
  socket: HostSocket,
  rooms: RoomStore,
  _reason: DisconnectReason,
) {
  const roomId = socket.data.auth.roomId;
  const room = rooms.get(roomId);
  if (room) {
    if (room.hostSocketId !== socket.id) {
      dbg(
        "[WARNING] disconnected host socket '%s' was not the registered host of room '%s'",
        socket.id,
        roomId,
      );
    }
    dbg("removed host '%s' from game room '%s'", room.hostSocketId, roomId);
    room.hostSocketId = null;
  } else {
    dbg(
      "[WARNING] disconnected host socket '%s' was associated with unknown room '%s'",
      socket.id,
      roomId,
    );
  }
}
