import { afterEach, beforeEach } from "vitest";
import { createIoServer, type RelayServer } from "../../src/server.js";

export interface TestServer {
  server: RelayServer;
  url: string;
}

export function useTestServer(): Readonly<TestServer> {
  let url: TestServer["url"];
  let server: TestServer["server"];

  beforeEach(async () => {
    const testServer = await startTestServer();
    url = testServer.url;
    server = testServer.server;
  });
  afterEach(async () => {
    await server.close();
  });

  return {
    get url() {
      return url;
    },
    get server() {
      return server;
    },
  };
}

/**
 * Starts the relay server and returns the server instance along the `url` it can
 * be reached. The `url` includes an arbitrary port number, chosen by the OS.
 *
 * The __caller is responsible for closing__ the server when done using `server.close()`.
 *
 * @throws If the server fails to start or retrieve the port number.
 */
export async function startTestServer(): Promise<TestServer> {
  // "port: 0" lets the OS decide the port number (avoids conflicts)
  const server = await createIoServer({
    port: 0,
    corsOrigins: ["*"],
    serverOpts: {
      pingInterval: 10 * 60 * 1000, // avoid disconnects caused by fake timers
    },
  });
  const { httpServer } = server.io;
  const address = httpServer.address();
  const port = typeof address === "object" && address ? address.port : null;
  if (port === null) throw new Error("Failed to retrieve server port");

  const url = `http://localhost:${port}`;
  return { server, url };
}
