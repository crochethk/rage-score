import "dotenv/config"; // must be the first import!

import {
  clientAuthSchema,
  type ClientAuth,
  type HostAuth,
  type RoomId,
  type SpectatorAuth,
} from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import Debug from "debug";
import { Server, type ExtendedError, type Socket } from "socket.io";
import { Room } from "./Room.js";
import { createToken, verifyToken } from "./token.js";
import { getLocalExternalIPs } from "./utils.js";

const dbg = Debug("server:main");

/** `Socket.data` type */
interface SocketData {
  /** Similar object to `socket.handshake.auth` but validated/hydrated. */
  auth: SpectatorAuth | Required<HostAuth>;
  pingTimer: NodeJS.Timeout;
  // ...
}

type ClientSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// TODO use zod to validate used env vars

const PORT = Number.parseInt(process.env.PORT ?? "3333");
const corsOrigins = [
  "http://localhost:5173",
  ...(process.env.CORS_APP_URLS
    ? process.env.CORS_APP_URLS.split(/\s+/).filter(Boolean)
    : []),
];

/**
 * This implicitly starts a Node.js HTTP server, which can be accessed through io.httpServer.
 * @see https://socket.io/docs/v4/server-initialization/
 */
const server = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(PORT, {
  cors: { origin: corsOrigins },
  serveClient: false,
});

/** Store for existing `Room`s identified by their `id` */
const rooms = new Map<RoomId, Room>();

server.use(auth);
server.use(ping);

server.on("connection", async (socket) => {
  dbg("=".repeat(5), "client connected", "=".repeat(5));
  dbg("socket id:", socket.id);
  dbg("provided role:", socket.handshake.auth.role);
  dbg("provided roomId:", socket.handshake.auth.roomId);
  dbg("assigned roomId:", socket.data.auth?.roomId);

  await tryJoinIoRoom(socket);

  if (socket.data.auth.role === "spectator") {
    // No need to register any event handlers since spectators currently are
    // passive subscribers listening for state updates.
    return;
  }

  if (isNewHostSession(socket)) {
    const auth = socket.data.auth;
    socket.emit("srv:room:auth", auth.roomId, auth.token);
  }

  // TODO handle other events...

  socket.on("disconnect", (_reason) => {
    dbg("disconnect", `Socket ${socket.id} disconnected`);
  });
});

const addresses = getLocalExternalIPs().reduce(
  (acc, ip) => `${acc}\n\t- http://${ip}:${PORT}`,
  "",
);
console.log("Server started at", addresses);

// ----- Handlers -----

type NextFn = (err?: ExtendedError) => void;

function ping(socket: ClientSocket, next: NextFn) {
  // save timer ref to socket data
  socket.data.pingTimer = setInterval(() => {
    const timestamp = Date.now();
    dbg("[emit] PING", timestamp);
    socket.emit("srv:ping", timestamp, (msg) =>
      // handle ACK from client
      dbg("[receive]", msg.toUpperCase(), " from client"),
    );
  }, 5000);

  socket.on("disconnect", (_reason) => {
    // stop ping timer
    clearInterval(socket.data.pingTimer);
  });
  return next();
}

function auth(socket: ClientSocket, next: NextFn) {
  // validate auth shape
  const authResult = clientAuthSchema.safeParse(socket.handshake.auth);
  if (!authResult.success) {
    dbg("Invalid auth shape: %s", authResult.error.message);
    return next(new Error("Invalid auth shape"));
  }
  dbg("auth object shape ok");

  const auth = authResult.data;

  // authorize based on role
  dbg("client role: %o", auth.role);
  switch (auth.role) {
    case "host":
      return authHost(socket, next, auth);
    case "spectator":
      return authSpectator(socket, next, auth);
  }
  return next(new Error("Unknown role"));
}

function authHost(socket: ClientSocket, next: NextFn, auth: HostAuth) {
  dbg("authorizing host");
  if (!auth.roomId) {
    dbg("no roomId provided, creating new room");

    // create new Room and store it
    const [tokenBytes, tokenHash] = createToken();
    const room = new Room(tokenHash);
    rooms.set(room.id, room);
    dbg("created new room with id '%s'", room.id);

    socket.data.auth = {
      ...auth,
      roomId: room.id,
      token: tokenBytes.toString("base64url"),
    };
  } else {
    // -> Reconnect, validate room and token

    const room = rooms.get(auth.roomId);
    const invalidAuthError = new Error("Invalid roomId or token");
    if (!room) {
      dbg("host provided invalid roomId '%s'", auth.roomId);
      return next(invalidAuthError);
    }
    dbg("found requested room");

    if (!auth.token) {
      dbg("no token for existing room '%s'", auth.roomId);
      return next(invalidAuthError);
    }

    if (!verifyToken(Buffer.from(auth.token, "base64url"), room.hostToken)) {
      dbg("invalid token for room '%s'", auth.roomId);
      return next(invalidAuthError);
    }
    socket.data.auth = auth as Required<HostAuth>;
  }
  return next();
}

/** `next` function __must__ be called before returning */
function authSpectator(socket: ClientSocket, next: NextFn, auth: SpectatorAuth) {
  dbg("authorizing spectator");
  socket.data.auth = auth;
  return next();
}

async function tryJoinIoRoom(socket: ClientSocket) {
  if (!socket.data.auth) {
    dbg("expected `socket.data.auth` but was undefined, disconnecting");
    return socket.disconnect(true);
  }
  const { role, roomId } = socket.data.auth;
  await socket.join(roomId);
  dbg("room join: %o", { socketId: socket.id, role, roomId });
}

function isNewHostSession(socket: ClientSocket) {
  const auth = socket.handshake.auth as ClientAuth;
  return auth.role === "host" && !auth.roomId;
}

// function someMiddleware(
//   socket: ClientSocket,
//   next: (err?: ExtendedError) => void,
// ) {
//   return next(); // <--IMPORTANT !!!!
// }
