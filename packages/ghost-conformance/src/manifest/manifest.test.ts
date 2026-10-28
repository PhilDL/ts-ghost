import { describe, expect, test } from "vitest";

import { buildManifest, parseManifest, serialiseManifest } from "./manifest.ts";

const access = { public: false, integration: true, staff: true, session: true };
const routes = [
  { method: "PUT", path: "/posts/:id", labs: null, guard: "admin", access },
  { method: "GET", path: "/upgrades/", labs: null, guard: "admin", access },
  { method: "GET", path: "/posts/:id", labs: null, guard: "admin", access },
  { method: "GET", path: "/posts", labs: "someFlag", guard: "admin", access },
] as const;

describe("manifest", () => {
  test("paths end in a slash, like the client's calls, and routes sort by path then method", () => {
    const manifest = buildManifest("6.72.0", [...routes]);
    expect(manifest.routes.map((r) => `${r.method} ${r.path}`)).toEqual([
      "GET /posts/",
      "GET /posts/:id/",
      "PUT /posts/:id/",
      "GET /upgrades/",
    ]);
    expect(manifest.routes[0]).toEqual({ method: "GET", path: "/posts/", labs: "someFlag", ...access });
  });

  test("serialises identically whatever the input order, one route per line", () => {
    const a = serialiseManifest(buildManifest("6.72.0", [...routes]));
    const b = serialiseManifest(buildManifest("6.72.0", [...routes].reverse()));
    expect(a).toBe(b);
    expect(a.split("\n").filter((line) => line.includes('"method"'))).toHaveLength(4);
    expect(parseManifest(a)).toEqual(buildManifest("6.72.0", [...routes]));
  });

  test("a route Ghost registers twice is an error, not a silent duplicate", () => {
    expect(() => buildManifest("6.72.0", [routes[0], routes[0]])).toThrow(/twice/);
  });
});
