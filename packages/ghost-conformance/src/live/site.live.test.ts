import { describe, expect } from "vitest";

import { unknownKeys } from "../unknown-keys.ts";
import { liveTest } from "./ghost.ts";

describe("site", () => {
  liveTest("GET /site/ succeeds and parses with the client's schema", async ({ api }) => {
    const result = await api.site.fetch();
    expect(result.success).toBe(true);
  });

  // Expected failure: the site schema lacks accent_color, allow_external_signup, cover_image, icon,
  // locale, site_uuid and timezone (Ghost 6.72).
  liveTest.fails("GET /site/ sends no key the client's schema lacks", async ({ api, responses }) => {
    const result = await api.site.fetch();
    if (!result.success) throw new Error("site fetch failed");

    const raw = responses.last("/site/") as { site: unknown };
    expect(unknownKeys(raw.site, result.data, { at: "site" })).toEqual([]);
  });
});
