import { once } from "events";
import os from "os";
import { pathToFileURL } from "url";

/**
 * Compiles a list of this machine's local network IPv4 addresses.
 */
export function getLocalExternalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips = ["localhost"];
  for (const name in interfaces) {
    for (const iface of interfaces[name] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
}

/**
 * Determines if the current module is the main module, i.e. whether it was run directly.
 * @param importMetaUrl - The `import.meta.url` of the calling module.
 * @returns `true` if the module is the entry point, otherwise `false`.
 */
export function isMainModule(importMetaUrl: string): boolean {
  const moduleUrl = pathToFileURL(process.argv[1] ?? "").href;
  return importMetaUrl === moduleUrl;
}

/**
 * Helper function to await the `listening` event of an HTTP server.
 */
export async function awaitListening(
  httpServer: import("net").Server,
): Promise<void> {
  if (httpServer.listening) return;
  await once(httpServer, "listening");
}
