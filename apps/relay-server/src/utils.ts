import os from "os";

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
