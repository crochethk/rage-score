import { GameData, gameDataSchema } from "@repo/shared/game";
import { Socket as ServerSocket } from "socket.io";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  invalidGameDataExamples,
  validatedGameDataExamples as validGameData,
} from "./helpers/gameDataExamples.js";
import { useTestServer } from "./helpers/setup.js";
import {
  connectClient,
  createClient,
  createHost,
  createRoomWithSpectator,
} from "./helpers/testClient.js";

describe("state distribution", () => {
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
    it("forwards valid state from host to spectators", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      const spectators = [
        await connectClient(ts.url, { role: "spectator", roomId }),
        await connectClient(ts.url, { role: "spectator", roomId }),
      ];
      for (const s of spectators) {
        s.on("srv:state:replace", (data) => {
          expect(gameDataSchema.safeParse(data).success).toBe(true);
          s.testData = data;
        });
      }

      for (const [k, data] of Object.entries(validGameData)) {
        const msg = `data example '${k}'`;
        host.emit("hst:state:replace", data);
        await vi.waitFor(() => {
          for (const s of spectators) {
            expect(s.testData, msg).toBeTruthy();
            expect(s.testData, msg).toEqual(data);
          }
        });
      }
    });

    it("emits game state when spectator joins", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      const data = validGameData.multiRoundWithOngoingRound;
      expect(gameRooms().get(roomId)?.cachedState).toBeNull();
      host.emit("hst:state:replace", data);
      // Wait for state to arrive on the server
      await vi.waitFor(() =>
        expect(gameRooms().get(roomId)?.cachedState).toBeTruthy(),
      );

      const auth = { role: "spectator", roomId };
      const spectator = createClient(ts.url, { auth, autoConnect: false });
      spectator.once("srv:state:replace", (data) => {
        spectator.testData = data;
      });
      spectator.connect();
      await vi.waitFor(() => expect(spectator.testData).toEqual(data));
    });

    it("updates cached state when host sends snapshot", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      const data1 = validGameData.multiRoundWithOngoingRound;
      const data2 = validGameData.gameStartNoRounds;
      expect(gameRooms().get(roomId)?.cachedState).toBeNull();
      host.emit("hst:state:replace", data1);
      await vi.waitFor(() =>
        expect(gameRooms().get(roomId)?.cachedState).toEqual(data1),
      );
      host.emit("hst:state:replace", data2);
      await vi.waitFor(() =>
        expect(gameRooms().get(roomId)?.cachedState).toEqual(data2),
      );
    });
  });

  describe("sad paths", () => {
    it("ignores invalid game state snapshot", async () => {
      let receivedCount = 0; // sanity check
      let srvHost: ServerSocket | null = null;
      let spyHostTo: unknown = null;
      ts.server.io.on("connection", (socket) => {
        const { role } = socket.handshake.auth;
        if (role === "host") {
          srvHost = socket;
          spyHostTo = vi.spyOn(socket, "to");
          socket.on("hst:state:replace", () => receivedCount++);
        }
      });

      const { host, roomId } = await createRoomWithSpectator(ts);

      for (const [k, data] of Object.entries(invalidGameDataExamples)) {
        const msg = `data example '${k}'`;
        expect(gameDataSchema.safeParse(data).success, msg).toBe(false);
        // Wait for server to process the event
        await new Promise<void>((resolve, reject) => {
          srvHost!.once("hst:state:replace", () => resolve());
          host.emit("hst:state:replace", data as GameData);
        });
        expect(gameRooms().get(roomId)?.cachedState, msg).toBeNull();
      }
      // sanity check
      host.emit("hst:state:replace", validGameData.gameStartNoRounds);
      await vi.waitFor(() => {
        expect(receivedCount).toBe(Object.keys(invalidGameDataExamples).length + 1);
        expect(spyHostTo).toHaveBeenCalledTimes(1);
      });
    });
  });
});
