import type { RoomId } from "@repo/shared/socket/auth";
import crypto from "crypto";
import type { TokenHash } from "./token.js";

export class Room {
  static createId(): RoomId {
    return crypto.randomBytes(16).toString("base64url");
  }
  /** The identifier of the room. It is randomly generated upon room creation. */
  id: RoomId;

  /** The hash of the room host's token. */
  hostToken: TokenHash;

  /** The number of spectators in this room. */
  spectatorCount = 0;

  /**
   * @param roomHostToken The room host's token hash.
   */
  constructor(roomHostToken: TokenHash) {
    this.hostToken = roomHostToken;
    this.id = Room.createId();
  }
}
