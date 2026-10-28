import { describe, expect } from "vitest";

import { BLOG_TITLE } from "../ghost/bootstrap.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { liveTest } from "./ghost.ts";

describe("settings", () => {
  // Expected failure: the settings schema only allows scalar values; Ghost sends list values (all_blocked_email_domains).
  liveTest.fails("GET /settings/ returns every setting as key and value", async ({ api, responses }) => {
    const result = await api.settings.fetch();
    if (!result.success) throw new Error(JSON.stringify(result.errors));

    expect(result.data.find((s) => s.key === "title")?.value).toBe(BLOG_TITLE);
    expect(result.data.some((s) => s.value === null)).toBe(true);
    const raw = responses.last("/settings/") as { settings: unknown };
    expect(unknownKeys(raw.settings, result.data, { at: "settings" })).toEqual([]);
  });
});
