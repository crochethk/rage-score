import { Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IoServer } from "../src/server.js";
import { useTestServer } from "./helpers/setup.js";
import { connectClient, createHost } from "./helpers/testClient.js";

describe("game room management", () => {
  const ts = useTestServer();
  const gameRooms = () => ts.server.gameRooms();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("happy paths", () => {
    it("creates and assigns room for host w/o roomId", async () => {
      const { socket, roomId } = await createHost(ts.url);
      const gameRoom = gameRooms().get(roomId);
      if (gameRoom === undefined) throw new Error("game room not found");
      expect(gameRoom.hostSocketId).toBe(socket.id);
      expect(gameRoom.spectatorsCount).toBe(0);
    });

    it("assigns existing room when host reconnects within grace period", async () => {
      const { socket: host, roomId, token } = await createHost(ts.url);
      expect(gameRooms().size).toBe(1);
      const hostId = host.id;
      host.disconnect();
      await waitForSocketRemoved(ts.server.io, hostId);
      vi.advanceTimersByTime(1000);
      expect(gameRooms().size).toBe(1);

      const auth = { role: "host", roomId, token };
      const newHost = await connectClient(ts.url, auth);
      expect(gameRooms().size).toBe(1);
      expect(gameRooms().get(roomId)?.hostSocketId).toBe(newHost.id);
    });

    it("unassigns hostSocketId when host disconnects", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      expect(gameRooms().get(roomId)?.hostSocketId).toBe(host.id);
      const hostId = host.id;
      host.disconnect();
      await waitForSocketRemoved(ts.server.io, hostId);
      expect(gameRooms().get(roomId)?.hostSocketId).toBeNull();
    });
  });
});

async function waitForSocketRemoved(io: IoServer, socketId: Socket["id"]) {
  if (socketId === undefined)
    return Promise.reject(new Error("socketId is undefined"));
  await vi.waitFor(async () => {
    const sockets = await io.fetchSockets();
    if (sockets.some((s) => s.id === socketId)) {
      throw new Error("socket still connected");
    }
  });
}
