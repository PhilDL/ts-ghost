import { describe, expect, test } from "vitest";

import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

describe("site", () => {
  const responses = liveResponses();

  test("GET /site/ succeeds and parses with the client's schema", async () => {
    const result = await adminApi().site.fetch();
    expect(result.success).toBe(true);
  });

  // Expected failure: the site schema lacks accent_color, allow_external_signup, cover_image, icon,
  // locale, site_uuid and timezone (Ghost 6.72).
  test.fails("GET /site/ sends no key the client's schema lacks", async () => {
    const result = await adminApi().site.fetch();
    if (!result.success) throw new Error("site fetch failed");

    const raw = responses.last("/site/") as { site: unknown };
    expect(unknownKeys(raw.site, result.data, { at: "site" })).toEqual([]);
  });
});
