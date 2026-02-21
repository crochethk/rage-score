import type { HostAuth } from "@repo/shared/socket/auth";
import { createContext, use } from "react";
import type { GameData } from "../../types";
import type { ConnectStatus } from "./BaseClientProvider";
import { HostClient, SpectatorClient } from "./SocketClient";

export interface BaseClientContextValue {
  status: ConnectStatus;
}
export interface HostClientContextValue {
  client: HostClient;
  auth: HostAuth;
}
export interface SpectatorClientContextValue {
  client: SpectatorClient;
  incomingGameData: readonly [
    GameData,
    React.Dispatch<React.SetStateAction<GameData>>,
  ];
}

export const BaseClientContext = createContext<
  BaseClientContextValue | undefined
>(undefined);
export const HostClientContext = createContext<
  HostClientContextValue | undefined
>(undefined);
export const SpectatorClientContext = createContext<
  SpectatorClientContextValue | undefined
>(undefined);

// --- hooks to strip `undefined` from the context value

export function useBaseClient(): BaseClientContextValue {
  return useCtxOrThrowIfValueUndefined(
    BaseClientContext,
    "BaseClientContext",
    "useBaseClient",
  );
}
export function useHostClient(): HostClientContextValue {
  return useCtxOrThrowIfValueUndefined(
    HostClientContext,
    "HostClientContext",
    "useHostClient",
  );
}
export function useSpectatorClient(): SpectatorClientContextValue {
  return useCtxOrThrowIfValueUndefined(
    SpectatorClientContext,
    "SpectatorClientContext",
    "useSpectatorClient",
  );
}

/**
 * Helper hook to throw an error if the context value is `undefined`, which means
 * that the hook is being used outside of the corresponding provider. This is
 * useful to strip `undefined` from the type and provide a clear error message.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
function useCtxOrThrowIfValueUndefined<T extends {} | undefined>(
  ctx: React.Context<T>,
  ctxName: string,
  hookName: string,
) {
  const value = use(ctx);
  if (value === undefined) {
    throw new Error(
      `'${hookName}' must be used within a '${ctxName}' provider`,
    );
  }
  return value;
}
