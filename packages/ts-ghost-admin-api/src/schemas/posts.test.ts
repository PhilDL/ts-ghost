import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

describe("posts api .browse() Args Type-safety", () => {
  const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
  const key =
    process.env.VITE_GHOST_ADMIN_API_KEY ||
    "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
  const api = new TSGhostAdminAPI(url, key, "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    expect(api.posts).toBeDefined();
    expect(1).toEqual(1);
    // @ts-expect-error - shouldnt accept invalid params
    expect(() => api.posts.browse({ filter: "slugg:test" })).toThrow();
    // @ts-expect-error - shouldnt accept invalid params
    expect(() => api.posts.browse({ filter: "slug:test,foo:-[bar,baz]" })).toThrow();
    expect(api.posts.browse({ filter: "slug:test,tags:-[bar,baz]" })).toBeDefined();
    expect(api.posts.browse({ filter: "slug:test,tags:[bar,baz]" })).toBeDefined();
    // @ts-expect-error - shouldnt accept invalid params
    expect(() => api.posts.browse({ filter: "slug:test,food:-[bar,baz]" })).toThrow();
  });
});

describe("check that fetchers are seperated instances", () => {
  test("fetchers are seperated instances", async () => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    const api = new TSGhostAdminAPI(url, key, "v5.0");

    const result = await api.posts.add(
      {
        title: "Its not working",
        html: "<p>Super Hello from ts-ghost</p>",
      },
      { source: "html" },
    );
    const result2 = await api.posts.add(
      {
        title: "Its not working2",
        html: "<p>Super Hello from ts-ghost2</p>",
      },
      { source: "html" },
    );
    const [a, b] = await Promise.all([
      api.posts.delete((result.success && result.data.id) || ""),
      api.posts.delete((result2.success && result2.data.id) || ""),
    ]);
    expect(a.success).toBeTruthy();
    expect(b.success).toBeTruthy();
  });
});
