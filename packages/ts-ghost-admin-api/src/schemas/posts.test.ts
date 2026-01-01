import { describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";
import { adminPostsCreateSchema } from "./posts";

describe("posts api .browse() Args Type-safety", () => {
  const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
  const key =
    process.env.VITE_GHOST_ADMIN_API_KEY ||
    "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
  const api = new TSGhostAdminAPI(url, key, "v6.0");
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

describe("posts schema validation", () => {
  test("email_only scheduled post without newsletter should fail validation", () => {
    const invalidPost = {
      title: "Test Post",
      email_only: true,
      status: "scheduled" as const,
    };
    const result = adminPostsCreateSchema.safeParse(invalidPost);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("newsletter is required when scheduling an email_only post");
      expect(result.error.issues[0].path).toEqual(["newsletter"]);
    }
  });

  test("non-email_only scheduled post without newsletter should succeed", () => {
    const validPost = {
      title: "Test Post",
      email_only: false,
      status: "scheduled" as const,
    };
    expect(adminPostsCreateSchema.safeParse(validPost).success).toBe(true);
  });

  test("scheduled post without email_only field and without newsletter should succeed", () => {
    const validPost = {
      title: "Test Post",
      status: "scheduled" as const,
    };
    expect(adminPostsCreateSchema.safeParse(validPost).success).toBe(true);
  });
});
