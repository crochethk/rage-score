import "dotenv/config"; // must be the first import!

import type { HostAuth, SpectatorAuth } from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import Debug from "debug";
import { Server, type ExtendedError, type Socket } from "socket.io";
import { getLocalExternalIPs } from "./utils.js";

const dbg = Debug("server:main");

/** `Socket.data` type */
interface SocketData {
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
server.use(ping);

server.on("connection", (socket) => {
  dbg("=".repeat(5), "client connected", "=".repeat(5));
  dbg("socket id:", socket.id);
  dbg("client role:", socket.handshake.auth.role);
  dbg("client roomId:", socket.handshake.auth.roomId);

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
