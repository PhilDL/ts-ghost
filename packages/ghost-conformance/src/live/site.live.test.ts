import { describe, expect, inject } from "vitest";

import { BLOG_TITLE } from "../ghost/bootstrap.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./ghost.ts";

describe("site", () => {
  liveTest("GET /site/ succeeds and parses with the client's schema", async ({ api }) => {
    const result = await api.site.fetch();
    assertOk(result);
  });

  liveTest("GET /site/ returns the site's title and url", async ({ api }) => {
    const result = await api.site.fetch();
    assertOk(result);

    expect(result.data.title).toBe(BLOG_TITLE);
    expect(result.data.url.replace(/\/$/, "")).toBe(inject("ghost").url);
  });

  // Expected failure: the site schema lacks accent_color, allow_external_signup, cover_image, icon,
  // locale, site_uuid and timezone (Ghost 6.72).
  liveTest.fails("GET /site/ sends no key the client's schema lacks", async ({ api, responses }) => {
    const result = await api.site.fetch();
    assertOk(result);

    const raw = responses.last("/site/") as { site: unknown };
    expect(unknownKeys(raw.site, result.data, { at: "site" })).toEqual([]);
  });
});
