import type { ClientAuth, HostAuth } from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import Debug from "debug";
import type { DisconnectReason, Socket } from "socket.io";
import type { IoServer } from "src/server.js";
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

export function setupSocket(io: IoServer, socket: HostSocket, rooms: RoomStore) {
  if (isNewHostSession(socket)) {
    const { roomId, token } = socket.data.auth;
    socket.emit("srv:room:auth", roomId, token);
  }

  const room = rooms.get(socket.data.auth.roomId);
  if (room) {
    room.hostSocketId = socket.id;
    dbg("registered host '%s' for game room '%s'", socket.id, room.id);

    socket.emit("srv:room:spectators", room.spectatorsCount);
  }

  socket.on("disconnecting", (reason) => handleDisconnecting(socket, rooms, reason));
  socket.on("hst:room:close", () => handleRoomClose(io, socket, rooms));
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

function handleRoomClose(io: IoServer, socket: HostSocket, rooms: RoomStore) {
  // TODO: this might be a bit timing-sensitive and might print warnings if room
  // is deleted before all sockets are disconnected. Consider adding a `state`
  // property to `Room` ("open"|"closing"). Then in "disconnecting" event handlers
  // skip room cleanup when in `closing` state.
  const roomId = socket.data.auth.roomId;
  dbg("host '%s' closes room '%s'", socket.id, roomId);
  io.in(roomId).disconnectSockets(true);
  rooms.delete(roomId);
  dbg("removed room '%s'", roomId);
}
