import { invalidTokenOrRoomIdError } from "@repo/shared/socket/authErrors";
import { Socket } from "socket.io-client";
import { afterEach, assert, beforeEach, describe, expect, it, vi } from "vitest";
import { ROOM_CLEANUP_INTERVAL_MS, ROOM_IDLE_TIMEOUT_MS } from "../src/RoomStore.js";
import { IoServer } from "../src/server.js";
import { useTestServer } from "./helpers/setup.js";
import { connectClient, createHost } from "./helpers/testClient.js";

describe("game room management", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const ts = useTestServer();
  const gameRooms = () => ts.server.gameRooms();

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

    it("disconnects host when a second host successfully joins the same room", async () => {
      const { socket: first, roomId, token } = await createHost(ts.url);
      expect(first.connected).toBe(true);
      let sockets = await ts.server.io.fetchSockets();
      expect(sockets.find((s) => s.id === first.id)).toBeDefined();

      let room = gameRooms().get(roomId);
      expect(room).toBeDefined();
      expect(room!.hostSocketId).toBe(first.id);

      const second = await connectClient(ts.url, { role: "host", roomId, token });
      expect(second.connected).toBe(true);

      sockets = await ts.server.io.fetchSockets();
      expect(first.connected).toBe(false);
      expect(sockets.find((s) => s.id === first.id)).not.toBeDefined();
      room = gameRooms().get(roomId);
      expect(room).toBeDefined();
      expect(room!.hostSocketId).toBe(second.id);
    });

    it("creates separate rooms for different hosts", async () => {
      const { socket: host1, roomId: roomId1 } = await createHost(ts.url);
      const { socket: host2, roomId: roomId2 } = await createHost(ts.url);
      expect(roomId1).not.toBe(roomId2);
      const spectator1 = await connectClient(ts.url, {
        role: "spectator",
        roomId: roomId1,
      });
      let room1 = gameRooms().get(roomId1);
      let room2 = gameRooms().get(roomId2);
      expect(room1?.spectatorsCount).toBe(1);
      expect(room2?.spectatorsCount).toBe(0);

      const spectator2 = await connectClient(ts.url, {
        role: "spectator",
        roomId: roomId2,
      });
      room1 = gameRooms().get(roomId1);
      room2 = gameRooms().get(roomId2);
      expect(room1).toBeDefined();
      expect(room2).toBeDefined();
      expect(room1!.spectatorsCount).toBe(1);
      expect(room2!.spectatorsCount).toBe(1);
      expect(room1!.hostSocketId).toBe(host1.id);
      expect(room2!.hostSocketId).toBe(host2.id);
      expect(room1!.spectators).toContain(spectator1.id);
      expect(room2!.spectators).toContain(spectator2.id);
    });
  });

  describe("room cleanup", () => {
    it("disposes empty room after grace period", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      expect(gameRooms().has(roomId)).toBe(true);
      const hostId = host.id; // host.id will be undefined after disconnect
      host.disconnect();
      await waitForSocketRemoved(ts.server.io, hostId);

      const room = gameRooms().get(roomId)!;
      assert(room.hostSocketId === null);
      assert(room.spectatorsCount === 0);

      vi.advanceTimersByTime(ROOM_IDLE_TIMEOUT_MS - 1000);
      expect(gameRooms().has(roomId)).toBe(true);

      vi.advanceTimersByTime(ROOM_CLEANUP_INTERVAL_MS + 2000);
      expect(gameRooms().has(roomId)).toBe(false);
    });

    it("keeps room with idle host", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      expect(gameRooms().get(roomId)?.hostSocketId).toBe(host.id);

      vi.advanceTimersByTime(ROOM_IDLE_TIMEOUT_MS + ROOM_CLEANUP_INTERVAL_MS + 1000);
      expect(gameRooms().has(roomId)).toBe(true);
      expect(host.id).toBeDefined();
      expect(gameRooms().get(roomId)?.hostSocketId).toBe(host.id);
    });

    it("keeps room with idle spectator", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      const spectator = await connectClient(ts.url, { role: "spectator", roomId });
      expect(gameRooms().get(roomId)?.spectatorsCount).toBe(1);
      const hostId = host.id;
      host.disconnect();
      await waitForSocketRemoved(ts.server.io, hostId);

      vi.advanceTimersByTime(ROOM_IDLE_TIMEOUT_MS + ROOM_CLEANUP_INTERVAL_MS + 1000);
      expect(gameRooms().has(roomId)).toBe(true);
      expect(gameRooms().get(roomId)?.hostSocketId).toBeNull();
      expect(spectator.id).toBeDefined();
      expect(gameRooms().get(roomId)?.spectators).toContain(spectator.id);
    });

    it("adds spectator to room with just disconnected host", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      const hostId = host.id;
      host.disconnect();
      await waitForSocketRemoved(ts.server.io, hostId);
      vi.advanceTimersByTime(1000);
      const spectator = await connectClient(ts.url, { role: "spectator", roomId });
      const gameRoom = gameRooms().get(roomId);
      expect(gameRoom?.spectators).toContain(spectator.id);
      expect(gameRoom?.hostSocketId).toBeNull();
    });
  });

  describe("sad paths", () => {
    it("rejects clients when empty room has expired after host disconnect", async () => {
      const { socket: host, roomId, token } = await createHost(ts.url);
      const spectator = await connectClient(ts.url, { role: "spectator", roomId });
      const room = gameRooms().get(roomId);
      expect(room).toBeDefined();
      expect(room!.hostSocketId).toBe(host.id);
      expect(room!.spectators).toContain(spectator.id);
      const hostId = host.id;
      const spectatorId = spectator.id;
      host.disconnect();
      spectator.disconnect();
      await waitForSocketRemoved(ts.server.io, hostId);
      await waitForSocketRemoved(ts.server.io, spectatorId);

      vi.advanceTimersByTime(ROOM_IDLE_TIMEOUT_MS + ROOM_CLEANUP_INTERVAL_MS + 1000);
      await expect(
        connectClient(ts.url, { role: "host", roomId, token }),
      ).rejects.toThrow(invalidTokenOrRoomIdError);
      await expect(
        connectClient(ts.url, { role: "spectator", roomId }),
      ).rejects.toThrow(invalidTokenOrRoomIdError);
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
