import { assert, beforeEach, describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "./admin-api";

describe("admin-api", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    api = new TSGhostAdminAPI(
      "https://ghost.org",
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v5.0"
    );
  });

  test("admin-api", () => {
    expect(api).toBeDefined();
  });

  test("admin-api shouldn't instantiate with an incorrect url", () => {
    assert.throws(() => {
      const api = new TSGhostAdminAPI("ghost.org", "59d4bf56c73c04a18c867dc3ba", "v5.0");
      api.site;
    });
  });

  test("admin-api shouldn't instantiate with an incorrect key", () => {
    assert.throws(() => {
      const api = new TSGhostAdminAPI("https://ghost.org", "a:b", "v5.0");
      api.site;
    });
  });

  test("admin-api shouldn't instantiate with an incorrect version", () => {
    assert.throws(() => {
      const api = new TSGhostAdminAPI(
        "https://ghost.org",
        "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
        // @ts-expect-error
        "v4.0"
      );
      api.site;
    });
  });

  test("admin-api.posts", () => {
    expect(api.posts).toBeDefined();
    expect(api.posts.browse).toBeDefined();
    expect(api.posts.read).toBeDefined();
  });

  test("admin-api.pages", () => {
    expect(api.pages).toBeDefined();
    expect(api.pages.browse).toBeDefined();
    expect(api.pages.read).toBeDefined();
  });

  test("admin-api.tags", () => {
    expect(api.tags).toBeDefined();
    expect(api.tags.browse).toBeDefined();
    expect(api.tags.read).toBeDefined();
  });

  test("admin-api.tiers", () => {
    expect(api.tiers).toBeDefined();
    expect(api.tiers.browse).toBeDefined();
    expect(api.tiers.read).toBeDefined();
  });

  test("admin-api.users", () => {
    expect(api.users).toBeDefined();
    expect(api.users.browse).toBeDefined();
    expect(api.users.read).toBeDefined();
  });

  test("admin-api.offers", () => {
    expect(api.offers).toBeDefined();
    expect(api.offers.browse).toBeDefined();
    expect(api.offers.read).toBeDefined();
  });

  test("admin-api.members", () => {
    expect(api.members).toBeDefined();
    expect(api.members.browse).toBeDefined();
    expect(api.members.read).toBeDefined();
  });

  test("admin-api.newsletters", () => {
    expect(api.newsletters).toBeDefined();
    expect(api.newsletters.browse).toBeDefined();
    expect(api.newsletters.read).toBeDefined();
  });

  test("admin-api.site", () => {
    expect(api.site).toBeDefined();
    expect(api.site.fetch).toBeDefined();
    // @ts-expect-error
    expect(api.site.read).toBeUndefined();
    // @ts-expect-error
    expect(api.site.browse).toBeUndefined();
  });
});
