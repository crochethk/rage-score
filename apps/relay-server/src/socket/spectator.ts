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
  const room = rooms.get(socket.data.auth.roomId);
  if (room) {
    room.spectators.add(socket.id);
    dbg("added spectator '%s' to game room '%s'", socket.id, room.id);
  }

  socket.on("disconnecting", (reason) => handleDisconnecting(socket, rooms, reason));
}

function handleDisconnecting(
  socket: SpectatorSocket,
  rooms: RoomStore,
  _reason: DisconnectReason,
) {
  const roomId = socket.data.auth.roomId;
  const room = rooms.get(roomId);
  if (room) {
    if (!room.spectators.delete(socket.id)) {
      dbg(
        "[WARNING] disconnected spectator socket '%s' was not registered in its associated game room '%s'",
        socket.id,
        roomId,
      );
    }
    dbg("removed spectator '%s' from game room '%s'", socket.id, roomId);
  } else {
    dbg(
      "[WARNING] disconnected spectator socket '%s' was associated with unknown room '%s'",
      socket.id,
      roomId,
    );
  }
}
