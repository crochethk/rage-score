import type { RoomId } from "@repo/shared/socket/auth";
import Debug from "debug";
import type { Room } from "./Room.js";
const dbg = Debug("server:RoomStore");

export const ROOM_IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const ROOM_CLEANUP_INTERVAL_MS = 60 * 1000; // once per minute

export class RoomStore {
  #rooms = new Map<RoomId, Room>();
  #cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.#cleanupInterval = this.#scheduleCleanup();
  }

  rooms(): ReadonlyMap<RoomId, Room> {
    return this.#rooms;
  }

  get(id: RoomId) {
    return this.#rooms.get(id);
  }
  set(room: Room) {
    this.#rooms.set(room.id, room);
  }
  delete(id: RoomId) {
    this.#rooms.delete(id);
  }
  close() {
    clearInterval(this.#cleanupInterval);
  }

  #scheduleCleanup() {
    return setInterval(() => {
      if (this.#rooms.size === 0) {
        dbg("no rooms in store, skipping cleanup");
        return;
      }
      dbg("cleanup started");
      const now = Date.now();
      for (const [roomId, room] of this.#rooms) {
        if (
          room.hostSocketId === null &&
          room.spectatorsCount === 0 &&
          now - room.lastActive > ROOM_IDLE_TIMEOUT_MS
        ) {
          dbg("disposing room '%s' due to inactivity", roomId);
          this.#rooms.delete(roomId);
        }
      }
      dbg("%d rooms left in store", this.#rooms.size);
    }, ROOM_CLEANUP_INTERVAL_MS);
  }
}
