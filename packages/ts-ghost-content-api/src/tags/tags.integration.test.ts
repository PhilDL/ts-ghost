import { beforeEach, describe, expect, test } from "vitest";

import { TSGhostContentAPI } from "../content-api";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "59d4bf56c73c04a18c867dc3ba";

const stub = {
  id: "63887bd07f2cf30001fec7a5",
  name: "News",
  slug: "news",
  description: null,
  feature_image: null,
  visibility: "public",
  og_image: null,
  og_title: null,
  og_description: null,
  twitter_image: null,
  twitter_title: null,
  twitter_description: null,
  meta_title: null,
  meta_description: null,
  codeinjection_head: null,
  codeinjection_foot: null,
  canonical_url: null,
  accent_color: null,
  url: "https://astro-starter.digitalpress.blog/tag/news/",
};
describe("tags integration tests browse", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v6.0");
  });
  test("tags.browse()", async () => {
    const result = await api.tags.browse().fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.meta.pagination).toBeDefined();
      expect(result.meta.pagination.page).toBe(1);
      expect(result.meta.pagination.limit).toBe(15);
      expect(result.meta.pagination.pages).toBe(1);
      expect(result.data).toHaveLength(1);
      const tag = result.data[0];
      expect(tag).toBeDefined();
      expect(tag.id).toBe(stub.id);
      expect(tag.name).toBe(stub.name);
      expect(tag.slug).toBe(stub.slug);
      expect(tag.description).toBe(stub.description);
      expect(tag.visibility).toBe(stub.visibility);
      expect(tag.feature_image).toBe(stub.feature_image);
      expect(tag.visibility).toBe(stub.visibility);
      expect(tag.codeinjection_head).toBe(stub.codeinjection_head);
      expect(tag.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(tag.canonical_url).toBe(stub.canonical_url);
      expect(tag.url).toBe(stub.url);
      expect(tag.og_image).toBe(stub.og_image);
      expect(tag.og_title).toBe(stub.og_title);
      expect(tag.og_description).toBe(stub.og_description);
      expect(tag.twitter_image).toBe(stub.twitter_image);
      expect(tag.twitter_title).toBe(stub.twitter_title);
      expect(tag.twitter_description).toBe(stub.twitter_description);
      expect(tag.meta_title).toBe(stub.meta_title);
      expect(tag.meta_description).toBe(stub.meta_description);
      // this would be undefined because Ghost API doesn't return it if the fields arg is there
      expect(tag.count?.posts).toBe(undefined);
    }
  });

  test("tags.browse() include authors and tags", async () => {
    const result = await api.tags.browse().include({ "count.posts": true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const tag = result.data[0];
      expect(tag).toBeDefined();
      expect(tag.id).toBe(stub.id);
      expect(tag.count?.posts).toBeGreaterThan(0);
    }
  });

  test("tags.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const result = await api.tags.browse().fields({ slug: true, name: true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const tag = result.data[0];
      expect(tag).toBeDefined();
      expect(tag.name).toBe(stub.name);
      expect(tag.slug).toBe(stub.slug);
      // @ts-expect-error
      expect(tag.id).toBeUndefined();
      // @ts-expect-error
      expect(tag.count).toBeUndefined();
    }
  });

  test("tags.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const result = await api.tags
      .browse()
      .fields({ slug: true, name: true, count: true })
      .include({ "count.posts": true })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const tag = result.data[0];
      expect(tag).toBeDefined();
      expect(tag.name).toBe(stub.name);
      expect(tag.slug).toBe(stub.slug);
      // WARNING: This combination doesn't work
      expect(tag.count).toBeUndefined();
      // @ts-expect-error
      expect(tag.id).toBeUndefined();
      // @ts-expect-error
      expect(tag.authors).toBeUndefined();
    }
  });
});

describe("tags integration tests read", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v6.0");
  });

  test("tags.read() by id", async () => {
    const result = await api.tags.read({ id: "63887bd07f2cf30001fec812" }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const tag = result.data;
      expect(tag).toBeDefined();
      expect(tag.id).toBe(stub.id);
      expect(tag.name).toBe(stub.name);
      expect(tag.slug).toBe(stub.slug);
      expect(tag.description).toBe(stub.description);
      expect(tag.visibility).toBe(stub.visibility);
      expect(tag.feature_image).toBe(stub.feature_image);
      expect(tag.visibility).toBe(stub.visibility);
      expect(tag.codeinjection_head).toBe(stub.codeinjection_head);
      expect(tag.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(tag.canonical_url).toBe(stub.canonical_url);
      expect(tag.url).toBe(stub.url);
      expect(tag.og_image).toBe(stub.og_image);
      expect(tag.og_title).toBe(stub.og_title);
      expect(tag.og_description).toBe(stub.og_description);
      expect(tag.twitter_image).toBe(stub.twitter_image);
      expect(tag.twitter_title).toBe(stub.twitter_title);
      expect(tag.twitter_description).toBe(stub.twitter_description);
      expect(tag.meta_title).toBe(stub.meta_title);
      expect(tag.meta_description).toBe(stub.meta_description);
      // this would be undefined because Ghost API doesn't return it if the fields arg is there
      expect(tag.count?.posts).toBe(undefined);
    }
  });

  test("tags.read() by slug", async () => {
    const result = await api.tags.read({ slug: "news" }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const tag = result.data;
      expect(tag).toBeDefined();
      expect(tag.id).toBe(stub.id);
      expect(tag.name).toBe(stub.name);
      expect(tag.slug).toBe(stub.slug);
      expect(tag.description).toBe(stub.description);
      expect(tag.visibility).toBe(stub.visibility);
      expect(tag.feature_image).toBe(stub.feature_image);
      expect(tag.visibility).toBe(stub.visibility);
      expect(tag.codeinjection_head).toBe(stub.codeinjection_head);
      expect(tag.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(tag.canonical_url).toBe(stub.canonical_url);
      expect(tag.url).toBe(stub.url);
      expect(tag.og_image).toBe(stub.og_image);
      expect(tag.og_title).toBe(stub.og_title);
      expect(tag.og_description).toBe(stub.og_description);
      expect(tag.twitter_image).toBe(stub.twitter_image);
      expect(tag.twitter_title).toBe(stub.twitter_title);
      expect(tag.twitter_description).toBe(stub.twitter_description);
      expect(tag.meta_title).toBe(stub.meta_title);
      expect(tag.meta_description).toBe(stub.meta_description);
      // this would be undefined because Ghost API doesn't return it if the fields arg is there
      expect(tag.count?.posts).toBe(undefined);
    }
  });

  test("tags.read() by slug with fields", async () => {
    const result = await api.tags.read({ slug: "news" }).fields({ name: true, id: true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const tag = result.data;
      expect(tag).toBeDefined();
      expect(tag.id).toBe(stub.id);
      expect(tag.name).toBe(stub.name);
      // @ts-expect-error
      expect(tag.slug).toBeUndefined();
      // @ts-expect-error
      expect(tag.count).toBeUndefined();
    }
  });

  test("tags.read() with count", async () => {
    const result = await api.tags.read({ slug: "news" }).include({ "count.posts": true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const tag = result.data;
      expect(tag).toBeDefined();
      expect(tag.id).toBe(stub.id);
      expect(tag.name).toBe(stub.name);
      expect(tag.count).toBeDefined();
      expect(tag.count?.posts).toBeGreaterThan(0);
    }
  });
});
