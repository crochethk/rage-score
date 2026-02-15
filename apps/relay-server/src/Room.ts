import type { RoomId } from "@repo/shared/socket/auth";
import crypto from "crypto";
import type { TokenHash } from "./token.js";

export class Room {
  static createId(): RoomId {
    return crypto.randomBytes(16).toString("base64url");
  }
  /** The identifier of the room. It is randomly generated upon room creation. */
  readonly id: RoomId;

  /** The hash of the room host's token. */
  hostToken: TokenHash;

  /**
   * The socket ID of the currently connected room host, or `null` if the host
   * is disconnected.
   */
  #hostSocketId: string | null = null;

  get hostSocketId() {
    return this.#hostSocketId;
  }
  set hostSocketId(id) {
    this.#hostSocketId = id;
    this.touch();
  }

  /**
   * The timestamp of the last activity in this room. Used to determine when to
   * dispose the room *after the host disconnects*.
   *
   * An activity is any event that indicates that the __host__ is still active.
   * These might be, for instance:
   * - the initial room creation
   * - successful host reconnection
   * - any socket event from the host (e.g. ping, game state update, etc.)
   *
   * Note that this explicitly does __not__ include spectator events, such as
   * joining or leaving the room.
   */
  lastActive = Date.now();

  /** The socket IDs of spectators currently connected to this room. */
  spectators = new Set<string>();

  /**
   * @param roomHostToken The room host's token hash.
   */
  constructor(roomHostToken: TokenHash) {
    this.hostToken = roomHostToken;
    this.id = Room.createId();
  }

  /** The total number of clients in this room. */
  get spectatorsCount(): number {
    return this.spectators.size;
  }

  /**
   * Updates the `lastActive` timestamp to the current time. Should be called
   * whenever an event occurs that indicates the host is still active.
   *
   * @see {@link Room.lastActive}
   */
  touch() {
    this.lastActive = Date.now();
  }
}
