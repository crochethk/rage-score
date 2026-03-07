import type {
  ClientAuth,
  HostAuth,
  HostToken,
  RoomId,
  SpectatorAuth,
} from "@repo/shared/socket/auth";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/shared/socket/socketEvents";
import { io as ioClient, Socket } from "socket.io-client";
import type { GameData } from "../../types";

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/** Function to unregister an event handler. */
export type OffFn = () => void;

const STATE_REPLACE_DELAY = 2_000;

/**
 * ...
 * Methods registering event handlers usually start with `on`. These methods
 * usually return a cleanup function which allows removing the registered
 * handler again.
 */
export abstract class BaseClient {
  protected io: ClientSocket;
  private readonly url: string;
  private readonly startConnectHandlers = new Set<() => void>();
  private readonly startDisconnectHandlers = new Set<() => void>();

  get active() {
    return this.io.active;
  }
  get connected() {
    return this.io.connected;
  }
  get disconnected() {
    return this.io.disconnected;
  }

  constructor(url: string) {
    this.url = url;
    this.io = ioClient(url, { autoConnect: false });

    this.onConnected(() => console.log("socket connected"));
    this.onDisconnected((r) => console.log(`socket disconnected (${r})`));
  }

  connect(auth: Partial<ClientAuth>) {
    if (this.connected || this.active) return;
    console.log(`connecting to ${this.url}...`);
    this.emitConnect();
    this.io.auth = auth;
    this.io.connect();
  }

  private emitConnect() {
    this.startConnectHandlers.forEach((handler) => handler());
  }

  disconnect() {
    if (this.disconnected && !this.active) return;
    this.prepareDisconnect();
    this.io.disconnect();
  }

  /** Logic to be executed prior to the socket being disconnected (client-side). */
  protected prepareDisconnect() {
    console.log("disconnecting...");
    this.emitDisconnect();
  }

  private emitDisconnect() {
    this.startDisconnectHandlers.forEach((handler) => handler());
  }

  onConnectError(handler: (err: Error) => void): OffFn {
    this.io.on("connect_error", handler);
    return () => this.io.off("connect_error", handler);
  }

  /**
   * Fired when the `connect` method is called and state changes from idle to connecting.
   */
  onStartConnect(handler: () => void): OffFn {
    this.startConnectHandlers.add(handler);
    return () => this.startConnectHandlers.delete(handler);
  }

  /**
   * Fired when the `disconnect()` method is (manually) called and connection
   * state will inevitably switch to `disconnected`.
   */
  onStartDisconnect(handler: () => void): OffFn {
    this.startDisconnectHandlers.add(handler);
    return () => this.startDisconnectHandlers.delete(handler);
  }

  onConnected(handler: () => void): OffFn {
    this.io.on("connect", handler);
    return () => this.io.off("connect", handler);
  }

  onDisconnected(handler: (reason: Socket.DisconnectReason) => void): OffFn {
    this.io.on("disconnect", handler);
    return () => this.io.off("disconnect", handler);
  }
}

export class HostClient extends BaseClient {
  private stateReplaceDebounceTimer: number | null = null;

  /**
   * @param auth Optional auth for reconnecting to an existing room. If omitted,
   * a new room will be created.
   */
  override connect(auth: HostAuth): void {
    super.connect(auth);

    this.onRoomAuth((auth) => {
      this.io.auth = auth; // update auth for auto-reconnects
    });
  }

  /**
   * Disconnects the client:
   * - If currently connected, the server will be notified to close and remove the room.
   * - Any pending debounced events will be cancelled.
   */
  override disconnect(): void {
    if (this.connected) {
      console.log("closing room");
      this.io.emit("hst:room:close");
      // let server disconnect us to avoid timing issues, caused by early client disconnect
      this.prepareDisconnect();
    } else {
      super.disconnect();
    }

    this.io.auth = {};
    if (this.stateReplaceDebounceTimer !== null) {
      clearTimeout(this.stateReplaceDebounceTimer);
      this.stateReplaceDebounceTimer = null;
    }
  }

  emitStateSnapshot(gd: GameData) {
    if (this.stateReplaceDebounceTimer !== null) {
      clearTimeout(this.stateReplaceDebounceTimer);
    }

    this.stateReplaceDebounceTimer = setTimeout(() => {
      this.io.emit("hst:state:replace", gd);
    }, STATE_REPLACE_DELAY);
  }

  onRoomAuth(handler: (auth: Required<HostAuth>) => void): OffFn {
    const _handler = (roomId: RoomId, token: HostToken) =>
      handler({ role: "host", roomId, token });
    this.io.on("srv:room:auth", _handler);

    return () => this.io.off("srv:room:auth", _handler);
  }

  onSpectatorCount(handler: (count: number) => void): OffFn {
    this.io.on("srv:room:spectators", handler);
    return () => this.io.off("srv:room:spectators", handler);
  }
}

export class SpectatorClient extends BaseClient {
  override connect(auth: Omit<SpectatorAuth, "role">): void {
    // override to hint auth type
    super.connect({ role: "spectator", ...auth });
  }

  onStateReplace(handler: (gd: GameData) => void): OffFn {
    this.io.on("srv:state:replace", handler);
    return () => this.io.off("srv:state:replace", handler);
  }
}
