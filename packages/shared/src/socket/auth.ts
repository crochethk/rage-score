import { z } from "zod";

export const roomIdSchema = z.base64url().length(22);
export type RoomId = z.infer<typeof roomIdSchema>;

// 16 Byte -> 128 bit token -> Math.ceil(128/6) = 22 chars base64url
export const hostTokenSchema = z.base64url().length(22);
export type HostToken = z.infer<typeof hostTokenSchema>;

const hostAuthSchema = z
  .strictObject({
    role: z.literal("host"),
    /** Optional room ID when reconnecting to an existing room. */
    roomId: roomIdSchema.optional(),
    /** The `base64url` encoded token of the room host. */
    token: hostTokenSchema.optional(),
  })
  .refine(
    (auth) => {
      const { roomId, token } = auth;
      const hasRoomId = roomId !== undefined;
      const hasToken = token !== undefined;
      return hasRoomId === hasToken;
    },
    { error: "Either both roomId and token must be provided, or neither." },
  );
export type HostAuth = z.infer<typeof hostAuthSchema>;

const spectatorAuthSchema = z.strictObject({
  role: z.literal("spectator"),
  roomId: roomIdSchema,
});
export type SpectatorAuth = z.infer<typeof spectatorAuthSchema>;

export const clientAuthSchema = z.discriminatedUnion("role", [
  hostAuthSchema,
  spectatorAuthSchema,
]);
export type ClientAuth = z.infer<typeof clientAuthSchema>;
