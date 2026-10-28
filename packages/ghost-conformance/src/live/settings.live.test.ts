import { describe, expect, inject, test } from "vitest";

import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

// Title the bootstrap gives the site at first-run setup.
const BLOG_TITLE = "ts-ghost conformance";

describe("settings", () => {
  const responses = liveResponses();

  // Expected failure: the settings schema only allows scalar values; Ghost sends list values (all_blocked_email_domains).
  test.fails("GET /settings/ returns every setting as key and value", async () => {
    const result = await adminApi().settings.fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data.find((s) => s.key === "title")?.value).toBe(BLOG_TITLE);
    expect(result.data.some((s) => s.value === null)).toBe(true);
    const raw = responses.last("/settings/") as { settings: unknown };
    expect(unknownKeys(raw.settings, result.data, { at: "settings" })).toEqual([]);
  });
});

describe("site", () => {
  test("GET /site/ returns the site's title and url", async () => {
    const result = await adminApi().site.fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data.title).toBe(BLOG_TITLE);
    expect(result.data.url.replace(/\/$/, "")).toBe(inject("ghost").url);
  });
});
