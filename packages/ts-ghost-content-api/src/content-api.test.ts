import { describe, test, expect, beforeEach } from "vitest";
import { TSGhostContentAPI } from "./content-api";

describe("content-api", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI("https://ghost.org", "59d4bf56c73c04a18c867dc3ba", "v5.0");
  });

  test("content-api", () => {
    expect(api).toBeDefined();
  });

  test("content-api shouldn't instantiate with an incorrect url", () => {
    assert.throws(() => {
      const api = new TSGhostContentAPI("ghost.org", "59d4bf56c73c04a18c867dc3ba", "v5.0");
      api.settings;
    });
  });

  test("content-api shouldn't instantiate with an incorrect key", () => {
    assert.throws(() => {
      const api = new TSGhostContentAPI("https://ghost.org", "a", "v5.0");
      api.settings;
    });
  });

  test("content-api shouldn't instantiate with an incorrect version", () => {
    assert.throws(() => {
      const api = new TSGhostContentAPI(
        "https://ghost.org",
        "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
        // @ts-expect-error
        "v4.0"
      );
      api.settings;
    });
  });

  test("content-api.posts", () => {
    expect(api.posts).toBeDefined();
    expect(api.posts.browse).toBeDefined();
    expect(api.posts.read).toBeDefined();
  });

  test("content-api.pages", () => {
    expect(api.pages).toBeDefined();
    expect(api.pages.browse).toBeDefined();
    expect(api.pages.read).toBeDefined();
  });

  test("content-api.tags", () => {
    expect(api.tags).toBeDefined();
    expect(api.tags.browse).toBeDefined();
    expect(api.tags.read).toBeDefined();
  });

  test("content-api.tiers", () => {
    expect(api.tiers).toBeDefined();
    expect(api.tiers.browse).toBeDefined();
    expect(api.tiers.read).toBeDefined();
  });

  test("content-api.authors", () => {
    expect(api.authors).toBeDefined();
    expect(api.authors.browse).toBeDefined();
    expect(api.authors.read).toBeDefined();
    // @ts-expect-error
    expect(api.authors.add).toBeUndefined();
    // @ts-expect-error
    expect(api.authors.edit).toBeUndefined();
    expect(api.authors).toBeDefined();
  });

  test("content-api.settings", () => {
    expect(api.settings).toBeDefined();
    expect(api.settings.fetch).toBeDefined();
    // @ts-expect-error
    expect(api.settings.read).toBeUndefined();
    // @ts-expect-error
    expect(api.settings.browse).toBeUndefined();
  });
});
