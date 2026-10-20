import { describe, expect, it, vi } from "vitest";
import pkg from "../../../../package.json";

// `connection()` needs a Next request scope; outside one it is a no-op for this test.
vi.mock("next/server", () => ({ connection: async () => {} }));

const { GET } = await import("./route");

describe("GET /api/health", () => {
  it("reports ok, the package version and no database yet", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({
      status: "ok",
      version: pkg.version,
      database: "not_configured",
    });
  });
});
