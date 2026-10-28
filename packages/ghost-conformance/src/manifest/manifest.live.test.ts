import { beforeAll, describe, expect, inject, test } from "vitest";

import { startGhost, type GhostInstance } from "../ghost/instance.ts";
import { generateManifest } from "./generate.ts";
import type { Manifest, ManifestRoute } from "./manifest.ts";

describe("manifest generation", () => {
  let manifest: Manifest;
  beforeAll(async () => {
    const ghost = await startGhost({ name: "ts-ghost-manifest-test" });
    try {
      manifest = await generateManifest(ghost);
    } finally {
      await ghost.stop();
    }
  }, 600_000);

  const route = (method: string, path: string): ManifestRoute => {
    const found = manifest.routes.find((r) => r.method === method && r.path === path);
    if (!found) throw new Error(`${method} ${path} is not in the manifest`);
    return found;
  };

  test("records the pinned Ghost version and a sorted, unique route list", () => {
    expect(manifest.ghost).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.routes.length).toBeGreaterThan(200);
    const keys = manifest.routes.map((r) => `${r.path} ${r.method}`);
    expect(keys).toEqual([...new Set(keys)].sort());
  });

  test("the site route is public", () => {
    expect(route("GET", "/site/")).toMatchObject({ public: true, integration: true, staff: true });
  });

  test("editing settings refuses integration tokens and accepts staff tokens", () => {
    expect(route("PUT", "/settings/")).toMatchObject({ public: false, integration: false, staff: true });
  });

  test("wiping the database refuses both token kinds", () => {
    expect(route("DELETE", "/db/")).toMatchObject({ integration: false, staff: false, session: true });
  });

  test("routes that take their token from the URL refuse every header credential", () => {
    expect(route("PUT", "/schedules/:resource/:id/")).toMatchObject({
      public: false,
      integration: false,
      staff: false,
      session: false,
    });
  });

  test("sign-in is public although it refuses a body-less request", () => {
    expect(route("POST", "/session/")).toMatchObject({ public: true });
  });

  test("the staff-token routes accept staff and session, and only reading passes integrations", () => {
    // GET lets integrations past auth (Ghost's controller then fails); PUT isn't on the integration allowlist.
    expect(route("GET", "/users/:id/token/")).toMatchObject({
      integration: true,
      staff: true,
      session: true,
    });
    expect(route("PUT", "/users/:id/token/")).toMatchObject({
      integration: false,
      staff: true,
      session: true,
    });
  });

  test("records labs flags on routes and on sub-routers", () => {
    expect(route("GET", "/members/metafields/:namespace/").labs).toBeNull();
    expect(route("POST", "/members/metafields/:namespace/").labs).toBe("membersCustomFields");
    expect(route("GET", "/stripe/checkout/config/").labs).toBe("stripeCheckoutDesign");
    expect(route("GET", "/posts/").labs).toBeNull();
  });
});

describe("manifest generation guard", () => {
  test("refuses an instance that has already been set up", async () => {
    const shared = inject("ghost");
    const notThrowaway: GhostInstance = {
      url: shared.url,
      project: "shared",
      version: shared.version,
      stop: async () => undefined,
      compose: async () => {
        throw new Error("must not touch the shared instance");
      },
    };
    await expect(generateManifest(notThrowaway)).rejects.toThrow(/already set up/);
  });
});
