/**
 * This module provides centralized access to environment variables for the
 * web application.
 * To set environment variables, use `.env.*` files at the project root.
 * For example ".env.local" for private configuration or ".env.development"
 * for development specific variables.
 * See also the [Vite documentation](https://vitejs.dev/guide/env-and-mode.html).
 */
export const env = {
  config: {
    /**
     * The URL of the socket.io relay server required for the spectator mode.
     * Default: `http://localhost:3333`
     */
    serverUrl:
      (import.meta.env.VITE_RELAY_SERVER_URL as string) ??
      "http://localhost:3333",
  },
};
