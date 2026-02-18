import type { DefaultEventsMap } from "socket.io";
import { z } from "zod";
import type { GameData } from "../game.js";
import type { HostToken, RoomId } from "./auth.js";

type StateReplaceHandler = (data: GameData) => void;

export interface ServerToClientEvents {
  "srv:room:auth": (roomId: RoomId, token: HostToken) => void;
  "srv:room:spectators": (count: number) => void;
  "srv:state:replace": StateReplaceHandler;
  "srv:ping": (ms: Timestamp, ack: (msg: PingAckMsg) => void) => void;
}
export const timestampSchema = z.int().nonnegative();
export type Timestamp = z.infer<typeof timestampSchema>;
export const pingAckMsgSchema = z.string();
export type PingAckMsg = z.infer<typeof pingAckMsgSchema>;

export interface ClientToServerEvents {
  "hst:room:close": () => void;
  "hst:state:replace": StateReplaceHandler;
}

export type InterServerEvents = DefaultEventsMap;
