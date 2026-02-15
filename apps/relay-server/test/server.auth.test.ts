import { hostTokenSchema, roomIdSchema } from "@repo/shared/socket/auth";
import {
  invalidAuthShapeError,
  invalidTokenOrRoomIdError,
} from "@repo/shared/socket/authErrors";
import { clearTimeout } from "node:timers";
import { assert, beforeEach, describe, expect, it } from "vitest";
import { Room } from "../src/Room.js";
import { useTestServer } from "./helpers/setup.js";
import {
  connectClient,
  createClient,
  createHost,
  type RoomAuthPayload,
} from "./helpers/testClient.js";

describe("auth flow", () => {
  const ts = useTestServer();

  describe("happy paths", () => {
    it("connects client with plausible auth", async () => {
      const clientsCount = () => ts.server.io.engine.clientsCount;
      expect(clientsCount()).toEqual(0);
      await connectClient(ts.url, { role: "host" });
      expect(clientsCount()).toEqual(1);
    });

    it("provides new room credentials for host w/o roomId", async () => {
      const auth = { role: "host" };
      const socket = createClient(ts.url, { auth });

      const { roomId, token } = await new Promise<RoomAuthPayload>(
        (resolve, reject) => {
          socket.on("srv:room:auth", (roomId, token) => resolve({ roomId, token }));
          socket.on("connect_error", (err) => reject(err));
        },
      );
      expect(roomId).toSatisfy((v) => roomIdSchema.safeParse(v).success);
      expect(token).toSatisfy((v) => hostTokenSchema.safeParse(v).success);
    });

    it("reconnects host with valid auth", async () => {
      const { socket: host, roomId, token } = await createHost(ts.url);
      expect(host.connected).toBe(true);
      host.disconnect();
      expect(host.disconnected).toBe(true);

      const auth = { role: "host", roomId, token };
      const nextHost = await connectClient(ts.url, auth);
      expect(nextHost.connected).toBe(true);
    });

    it("connects spectator with valid roomId", async () => {
      const { roomId } = await createHost(ts.url);

      const auth = { role: "spectator", roomId };
      const socketPromise = connectClient(ts.url, auth);
      await expect(socketPromise).resolves.toMatchObject({ connected: true });
    });

    it("connects spectator when host just disconnected", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      host.disconnect();

      const auth = { role: "spectator", roomId };
      const socketPromise = connectClient(ts.url, auth);
      await expect(socketPromise).resolves.toMatchObject({ connected: true });
    });

    it("does _not_ emit 'srv:room:auth' to spectator", async () => {
      // TODO: Spying on what the server actually emits would probably be a more
      //        robust way to test this
      const { roomId } = await createHost(ts.url);
      const auth = { role: "spectator", roomId };
      const spectator = createClient(ts.url, { auth });

      await new Promise<void>((resolve, reject) => {
        const theEvent = "srv:room:auth";
        const timeUntilResolve = setTimeout(resolveHandler, 100);
        spectator.on(theEvent, rejectHandler);

        function rejectHandler() {
          clearTimeout(timeUntilResolve);
          reject(new Error(`spectator received '${theEvent}' event`));
        }
        function resolveHandler() {
          spectator.off(theEvent, rejectHandler);
          resolve();
        }
      });
    });
  });

  describe("sad paths", () => {
    it("rejects invalid host token _value_", async () => {
      const { socket: host, roomId, token } = await createHost(ts.url);
      host.disconnect();

      // Tamper token value
      // Note: changing last token char might have no effect due to base64url padding
      const badToken = (token.startsWith("A") ? "B" : "A") + token.slice(1);
      const badAuth = { role: "host", roomId, token: badToken };

      expect(token).not.toBe(badToken); // sanity check

      await expect(connectClient(ts.url, badAuth)).rejects.toThrow(
        invalidTokenOrRoomIdError,
      );
    });

    it("rejects unknown role", async () => {
      const auth = { role: "foo42" };
      await expect(connectClient(ts.url, auth)).rejects.toThrow(
        invalidAuthShapeError,
      );
    });

    it("rejects host with unknown roomId", async () => {
      const roomId = Room.createId();
      const auth = { role: "host", roomId, token: "A".repeat(22) };
      assert(hostTokenSchema.safeParse(auth.token).success, "token schema invalid");
      await expect(connectClient(ts.url, auth)).rejects.toThrow(
        invalidTokenOrRoomIdError,
      );
    });

    describe("invalid host token _schema_", () => {
      let roomId: RoomAuthPayload["roomId"];
      let token: RoomAuthPayload["token"];

      beforeEach(async () => {
        const host = await createHost(ts.url);
        roomId = host.roomId;
        token = host.token;
        host.socket.disconnect();
      });

      it("rejects base64(!) specific char", async () => {
        const badToken = "/" + token.slice(1);
        const badAuth = { role: "host", roomId, token: badToken };
        await expect(connectClient(ts.url, badAuth)).rejects.toThrow(
          invalidAuthShapeError,
        );
      });

      it("rejects too long token", async () => {
        const badToken = "A" + token;
        const badAuth = { role: "host", roomId, token: badToken };
        await expect(connectClient(ts.url, badAuth)).rejects.toThrow(
          invalidAuthShapeError,
        );
      });

      it("rejects too short token", async () => {
        const badToken = token.slice(1);
        const badAuth = { role: "host", roomId, token: badToken };
        await expect(connectClient(ts.url, badAuth)).rejects.toThrow(
          invalidAuthShapeError,
        );
      });

      it("rejects null token", async () => {
        const badToken = null as unknown as string;
        const badAuth = { role: "host", roomId, token: badToken };
        await expect(connectClient(ts.url, badAuth)).rejects.toThrow(
          invalidAuthShapeError,
        );
      });
    });

    it("rejects host with missing token for existing room", async () => {
      const { socket: host, roomId } = await createHost(ts.url);
      host.disconnect();
      await expect(connectClient(ts.url, { role: "host", roomId })).rejects.toThrow(
        invalidAuthShapeError,
      );
    });

    it("rejects spectator w/o roomId", async () => {
      const socketPromise = connectClient(ts.url, { role: "spectator" });
      await expect(socketPromise).rejects.toThrow(invalidAuthShapeError);
    });

    it("rejects spectator with unknown roomId", async () => {
      const roomId = Room.createId();
      const auth = { role: "spectator", roomId };
      const socketPromise = connectClient(ts.url, auth);
      await expect(socketPromise).rejects.toThrow(invalidTokenOrRoomIdError);
    });
  });
});
