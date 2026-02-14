import { Socket } from "socket.io-client";
import { afterEach, assert, beforeEach, describe, expect, it, vi } from "vitest";
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

    it("joins host and spectator to same IO room", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      const spectator = await connectClient(ts.url, { role: "spectator", roomId });
      const sockets = await ts.server.io.fetchSockets();
      expect(sockets.find((s) => s.id === host.id)?.rooms).toContain(roomId);
      expect(sockets.find((s) => s.id === spectator.id)?.rooms).toContain(roomId);
    });

    it("adds spectator to room", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      assert(gameRooms().get(roomId)?.spectatorsCount === 0);
      const spectator = await connectClient(ts.url, { role: "spectator", roomId });
      const gameRoom = gameRooms().get(roomId);
      expect(gameRoom).toMatchObject({ id: roomId, hostSocketId: host.id });
      expect(gameRoom?.spectators).toContain(spectator.id);
      expect(gameRoom?.spectatorsCount).toBe(1);
    });

    it("adds multiple spectators to room", async () => {
      const { roomId } = await createHost(ts.url);
      const spectator1 = await connectClient(ts.url, { role: "spectator", roomId });
      const spectator2 = await connectClient(ts.url, { role: "spectator", roomId });
      const room = gameRooms().get(roomId);
      expect(room).toBeDefined();
      expect(room!.spectators).toContain(spectator1.id);
      expect(room!.spectators).toContain(spectator2.id);
      expect(room!.spectatorsCount).toBe(2);

      const spectator1Id = spectator1.id;
      spectator1.disconnect();
      await waitForSocketRemoved(ts.server.io, spectator1Id);
      expect(gameRooms().get(roomId)?.spectatorsCount).toBe(1);
    });

    it("removes spectator from room on disconnect", async () => {
      const { roomId } = await createHost(ts.url);
      const spectator = await connectClient(ts.url, { role: "spectator", roomId });
      expect(gameRooms().get(roomId)?.spectatorsCount).toBe(1);
      const spectatorId = spectator.id;
      spectator.disconnect();
      await waitForSocketRemoved(ts.server.io, spectatorId);
      expect(gameRooms().get(roomId)?.spectatorsCount).toBe(0);
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
