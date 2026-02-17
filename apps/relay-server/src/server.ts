import "dotenv/config"; // must be the first import!

import {
  clientAuthSchema,
  type HostAuth,
  type SpectatorAuth,
} from "@repo/shared/socket/auth";
import {
  invalidAuthShapeError,
  invalidTokenOrRoomIdError,
} from "@repo/shared/socket/authErrors";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import Debug from "debug";
import { createServer } from "http";
import { Server, type ExtendedError } from "socket.io";
import { Room } from "./Room.js";
import { RoomStore } from "./RoomStore.js";
import type { ClientSocket, SocketData } from "./socket/client.js";
import { setupSocket as setupHostSocket, type HostSocket } from "./socket/host.js";
import {
  setupSocket as setupSpectatorSocket,
  type SpectatorSocket,
} from "./socket/spectator.js";
import { createToken, verifyToken } from "./token.js";
import { awaitListening, getLocalExternalIPs, isMainModule } from "./utils.js";

const dbg = Debug("server:main");

export type RelayServer = Awaited<ReturnType<typeof createIoServer>>;

export type IoServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type NextFn = (err?: ExtendedError) => void;

export interface IoServerOptions {
  port?: number;
  corsOrigins?: string[];
  /* whether the server should immediately start listening after creation */
  autolisten?: boolean;
  serverOpts?: ConstructorParameters<typeof Server>[1];
}

/**
 * Creates and configures the socket.io relay server.
 * @param options - Options for configuring the server.
 *    - `port`: The port number to listen on. Defaults to `process.env.PORT` or `3333` if not set.
 *    - `corsOrigins`: An array of allowed CORS origins. Defaults to `["http://localhost:5173"]` plus any URLs specified in `process.env.CORS_APP_URLS` (space-separated).
 *    - `autolisten`: Whether to start listening immediately. Defaults to `true`.
 *    - `serverOpts`: Additional options to pass to the `socket.io` server constructor.
 * @return An object containing:
 *    - the `io` server instance
 *    - a function to access the current game rooms
 *    - a `close` function to shut down the server and clean up resources
 */
export async function createIoServer(options?: IoServerOptions) {
  options = { autolisten: true, ...options };
  const port = options.port ?? Number.parseInt(process.env.PORT ?? "3333");
  const corsOrigins = options.corsOrigins ?? [
    "http://localhost:5173",
    ...(process.env.CORS_APP_URLS
      ? process.env.CORS_APP_URLS.split(/\s+/).filter(Boolean)
      : []),
  ];

  const httpServer = createServer();
  const io: IoServer = new Server(httpServer, {
    cors: { origin: corsOrigins },
    serveClient: false,
    ...options.serverOpts,
  });

  /** Store for existing `Room`s identified by their `id` */
  const roomStore = new RoomStore();

  io.use(auth);
  io.use(ping);

  io.on("connection", async (socket) => {
    dbg("----- client connected ----- %o", {
      socketId: socket.id,
      providedRole: socket.handshake.auth.role as string,
      providedRoomId: socket.handshake.auth.roomId as string,
    });

    await tryJoinIoRoom(socket);

    socket.on("disconnecting", (reason, desc: object) => {
      dbg("client '%s' disconnecting: %o", socket.id, { reason, desc });
    });

    switch (socket.data.auth.role) {
      case "host":
        dbg("setup host socket");
        setupHostSocket(socket as HostSocket, roomStore);
        break;
      case "spectator":
        dbg("setup spectator socket");
        setupSpectatorSocket(socket as SpectatorSocket, roomStore);
        break;
    }
  });

  if (options.autolisten) {
    httpServer.listen(port);
    await awaitListening(httpServer);
  }
  return {
    io,
    gameRooms: () => roomStore.rooms(),
    close: async () => {
      roomStore.close();
      io.disconnectSockets(true);
      await io.close();
    },
  };

  // ----- Handlers -----

  // TODO remove this as it is unnecessary and was only for testing purposes
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
      return next(new Error(invalidAuthShapeError));
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
      room.hostSocketId = socket.id;
      roomStore.set(room);
      dbg("created new room with id '%s'", room.id);

      socket.data.auth = {
        ...auth,
        roomId: room.id,
        token: tokenBytes.toString("base64url"),
      };
    } else {
      // -> Reconnect, validate room and token

      const room = roomStore.get(auth.roomId);
      if (!room) {
        dbg("host provided unknown roomId '%s'", auth.roomId);
        return next(invalidAuthError());
      }
      dbg("found requested room");

      if (!auth.token) {
        dbg("no token for existing room '%s'", auth.roomId);
        return next(invalidAuthError());
      }

      if (!verifyToken(Buffer.from(auth.token, "base64url"), room.hostToken)) {
        dbg("invalid token for room '%s'", auth.roomId);
        return next(invalidAuthError());
      }

      if (room.hostSocketId !== null) {
        // disconnect previous host
        dbg(
          "new host '%s' for room '%s', disconnecting previous host '%s'",
          socket.id,
          room.id,
          room.hostSocketId,
        );
        io.in(room.hostSocketId).disconnectSockets(true);
      }

      room.hostSocketId = socket.id;
      socket.data.auth = auth as Required<HostAuth>;
    }
    return next();
  }

  /** `next` function __must__ be called before returning */
  function authSpectator(socket: ClientSocket, next: NextFn, auth: SpectatorAuth) {
    dbg("authorizing spectator");
    const room = roomStore.get(auth.roomId);
    if (!room) {
      dbg("spectator provided unknown roomId '%s'", auth.roomId);
      return next(invalidAuthError());
    }
    room.spectators.add(socket.id);
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

  function invalidAuthError() {
    return new Error(invalidTokenOrRoomIdError);
  }
}

// --------------------- MAIN ---------------------

if (isMainModule(import.meta.url)) {
  // Start the server immediately if this file is the main module.
  // This allows us to import functions like `createIoServer` from this file in tests without starting the server.
  dbg("Starting server...");

  const server = await createIoServer();
  const { httpServer } = server.io;
  const address = httpServer.address();
  const port = typeof address === "object" && address ? address.port : -1;
  const addresses = getLocalExternalIPs().reduce(
    (acc, ip) => `${acc}\n\t- http://${ip}:${port}`,
    "",
  );
  console.log("Server started at", addresses);

  httpServer.on("error", (err) => {
    console.error("Server error:", err);
  });

  const termEvents = [
    "beforeExit", // Emptied Node.js event loop
    "SIGBREAK", // Ctrl-Break on Windows
    "SIGHUP", // Parent terminal closed
    "SIGINT", // Terminal interrupt, usually by Ctrl-C
    "SIGTERM", // Graceful termination
    "SIGUSR2", // Used by Nodemon
  ] as const;
  for (const sig of termEvents) {
    process.on(sig, () => {
      dbg("Received %s signal", sig);
      void shutdown();
    });
  }

  let shuttingDown = false;

  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("Shutting down server...");

    const forceExit = setTimeout(() => {
      console.error("Forced shutdown due to timeout");
      process.exit(1);
    }, 10_000);

    try {
      await server.close();
      clearTimeout(forceExit);
      process.exit(0);
    } catch (err) {
      console.error("Shutdown failed", err);
      process.exit(1);
    }
  }
}
