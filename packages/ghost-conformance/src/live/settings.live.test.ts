import { describe, expect } from "vitest";

import { BLOG_TITLE } from "../ghost/bootstrap.ts";
import { assertOk, liveTest } from "./ghost.ts";

describe("settings", () => {
  // Expected failure: the settings schema only allows scalar values; Ghost sends list values (all_blocked_email_domains).
  liveTest.fails("GET /settings/ returns every setting as key and value", async ({ api }) => {
    const result = await api.settings.fetch();
    assertOk(result);

    expect(result.data.find((s) => s.key === "title")?.value).toBe(BLOG_TITLE);
    expect(result.data.some((s) => s.value === null)).toBe(true);
  });
});
