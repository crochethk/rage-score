import type { DefaultEventsMap } from "socket.io";
import { z } from "zod";
import type { RoomId } from "./auth.js";

export interface ServerToClientEvents {
  "srv:ping": (ms: Timestamp, ack: (msg: PingAckMsg) => void) => void;
}
export const timestampSchema = z.int().nonnegative();
export type Timestamp = z.infer<typeof timestampSchema>;
export const pingAckMsgSchema = z.string();
export type PingAckMsg = z.infer<typeof pingAckMsgSchema>;

export interface ClientToServerEvents {
  clientEmitDummy: () => void;
  createRoom: (ackFn: (roomId: RoomId) => void) => void;
}

export type InterServerEvents = DefaultEventsMap;
