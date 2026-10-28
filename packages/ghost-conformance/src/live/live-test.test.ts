import { afterAll, beforeAll, describe, expect, vi } from "vitest";
import { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { liveTest } from "./live-test.ts";

const KEY = "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
const site = { title: "T", description: "D", logo: null, version: "6.72", url: "http://localhost/" };

// Without the override, the fixture's teardown fails the test on site.unmodelled.
describe("liveTest with keys ignored for the describe", () => {
  liveTest.override({ ignore: ["site.unmodelled"] });
  // Stubbed before the fixture wraps fetch, which happens ahead of every test.
  beforeAll(() => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(JSON.stringify({ site: { ...site, unmodelled: 1 } }), {
          headers: { "content-type": "application/json" },
        }),
    );
  });
  afterAll(() => {
    vi.unstubAllGlobals();
  });

  liveTest("passes a test whose only unknown key is ignored", async ({ ignore, responses }) => {
    const api = responses.track(new TSGhostAdminAPI("http://localhost:2368", KEY, "v6.0"));
    expect(ignore).toEqual(["site.unmodelled"]);
    expect((await api.site.fetch()).success).toBe(true);
  });
});
