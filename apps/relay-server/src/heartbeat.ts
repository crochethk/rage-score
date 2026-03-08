import Debug from "debug";
import http, { IncomingMessage, ServerResponse } from "http";
import type { IoServer } from "./server.js";
const dbg = Debug("server:heartbeat");

const HEARTBEAT_INTERVAL = process.env.HEARTBEAT_INTERVAL_MS
  ? parseInt(process.env.HEARTBEAT_INTERVAL_MS)
  : 5 * 60_000; // 5 minutes

const HEARTBEAT_GRACE_PERIOD = process.env.HEARTBEAT_GRACE_PERIOD_MS
  ? parseInt(process.env.HEARTBEAT_GRACE_PERIOD_MS)
  : 10 * 60_000; // 10 minutes

interface _IoServer extends IoServer {
  /** The heartbeat data, used to keep the server running, when sockets are connected. */
  _heartbeat: Heartbeat;
}
interface Heartbeat {
  interval: NodeJS.Timeout | null;
  activeConnections: number;
  stopDelayTimer: NodeJS.Timeout | null;
}

export function setupHeartbeat(io: IoServer, port: number) {
  const _io = io as _IoServer;
  _io._heartbeat = { interval: null, activeConnections: 0, stopDelayTimer: null };
  const hb = _io._heartbeat;

  // Setup heartbeat endpoint
  _io.httpServer.on("request", handleKeepAliveReq);

  // Wire up heartbeat with socket lifecycle
  _io.on("connection", (socket) => {
    hb.activeConnections++;
    if (hb.activeConnections === 1) {
      startHeartbeat(_io, port);
    }

    socket.on("disconnect", () => {
      hb.activeConnections--;
      if (hb.activeConnections <= 0) {
        hb.activeConnections = 0; // just in case
        stopHeartbeat(_io);
      }
    });
  });
}

function handleKeepAliveReq(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) {
  if (req.url === "/_keepalive" && req.headers.host?.includes("localhost")) {
    dbg("received keep-alive request");
    return res.writeHead(200).end("ok");
  }
}

/** Start heartbeat if not already started. */
function startHeartbeat(_io: _IoServer, port: number) {
  const hb = _io._heartbeat;
  if (hb.stopDelayTimer) {
    clearTimeout(hb.stopDelayTimer);
    hb.stopDelayTimer = null;
  }

  if (!hb.interval) {
    dbg("starting heartbeat");
    hb.interval = setInterval(() => {
      http.get(`http://localhost:${port}/_keepalive`).on("error", (err) => {
        dbg("keep-alive request failed: %o", err);
      });
      dbg("sent keep-alive request");
    }, HEARTBEAT_INTERVAL);
  }
}

/** Stop heartbeat if it is active. */
function stopHeartbeat(_io: _IoServer) {
  const hb = _io._heartbeat;

  hb.stopDelayTimer ??= setTimeout(() => {
    if (hb.interval) {
      dbg("stopping heartbeat");
      clearInterval(hb.interval);
      hb.interval = null;
    }
    hb.stopDelayTimer = null;
  }, HEARTBEAT_GRACE_PERIOD);
}
