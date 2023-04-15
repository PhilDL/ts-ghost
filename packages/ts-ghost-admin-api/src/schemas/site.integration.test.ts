import { assert, beforeEach, describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

const stubSite = {
  title: "Astro Starter",
  description: "Thoughts, stories and ideas.",
  logo: null,
  version: "5.38",
  url: "https://astro-starter.digitalpress.blog/",
};

describe("members integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });

  test("site .fetch()", async () => {
    expect(api.site).toBeDefined();
    const result = await api.site.fetch();
    assert(result.status === "success");
    const site = result.data;
    expect(site.title).toBe(stubSite.title);
    expect(site.description).toBe(stubSite.description);
    expect(site.logo).toBe(stubSite.logo);
    expect(site.version).toContain("5.");
    expect(site.url).toBe(stubSite.url);
  });
});
