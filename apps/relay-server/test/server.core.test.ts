import { describe, expect, it } from "vitest";
import { useTestServer } from "./helpers/setup.js";

describe("core", () => {
  const ts = useTestServer();

  it("starts listening", () => {
    expect(ts.server.io.httpServer.listening).toBe(true);
  });
});
