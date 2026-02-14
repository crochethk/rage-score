import type { RoomId } from "@repo/shared/socket/auth";
import type { Room } from "./Room.js";

export type RoomStore = Map<RoomId, Room>;

export function createRoomStore(): RoomStore {
  return new Map<RoomId, Room>();
}
