import { describe, test, beforeEach, assert, expect } from "vitest";
import { TSGhostAdminAPI } from "../admin-api";

const stubResult = {
  status: "success",
  meta: {
    pagination: { pages: 1, page: 1, limit: 2, total: 2, prev: null, next: null },
  },
  data: [
    {
      slug: "news",
      id: "63887bd07f2cf30001fec7a5",
      meta_title: null,
      meta_description: null,
      codeinjection_head: null,
      codeinjection_foot: null,
      og_image: null,
      og_title: null,
      og_description: null,
      twitter_image: null,
      twitter_title: null,
      twitter_description: null,
      name: "News",
      description: null,
      feature_image: null,
      visibility: "public",
      canonical_url: null,
      accent_color: null,
      url: "https://astro-starter.digitalpress.blog/tag/news/",
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:02:56.000Z",
    },
  ],
};

describe("tags integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("tags.browse()", async () => {
    expect(api.tags).toBeDefined();
    const result = await api.tags
      .browse({
        limit: 1,
      })
      .fetch();

    assert(result.status === "success");
    const tag = result.data[0];
    const stubTag = stubResult.data[0];
    expect(tag.slug).toBe(stubTag.slug);
    expect(tag.id).toBe(stubTag.id);
    expect(tag.meta_title).toBe(stubTag.meta_title);
    expect(tag.meta_description).toBe(stubTag.meta_description);
    expect(tag.codeinjection_head).toBe(stubTag.codeinjection_head);
    expect(tag.codeinjection_foot).toBe(stubTag.codeinjection_foot);
    expect(tag.og_image).toBe(stubTag.og_image);
    expect(tag.og_title).toBe(stubTag.og_title);
    expect(tag.og_description).toBe(stubTag.og_description);
    expect(tag.twitter_image).toBe(stubTag.twitter_image);
    expect(tag.twitter_title).toBe(stubTag.twitter_title);
    expect(tag.twitter_description).toBe(stubTag.twitter_description);
    expect(tag.name).toBe(stubTag.name);
    expect(tag.description).toBe(stubTag.description);
    expect(tag.feature_image).toBe(stubTag.feature_image);
    expect(tag.visibility).toBe(stubTag.visibility);
    expect(tag.canonical_url).toBe(stubTag.canonical_url);
    expect(tag.accent_color).toBe(stubTag.accent_color);
    expect(tag.url).toBe(stubTag.url);
    expect(tag.created_at).toBe(stubTag.created_at);
    expect(tag.updated_at).toBeDefined();
  });

  test("tags.read()", async () => {
    expect(api.tags).toBeDefined();
    const result = await api.tags
      .read({
        id: "63887bd07f2cf30001fec7a5",
      })
      .fetch();
    assert(result.status === "success");
    const tag = result.data;
    const stubTag = stubResult.data[0];
    expect(tag.slug).toBe(stubTag.slug);
    expect(tag.id).toBe(stubTag.id);
    expect(tag.meta_title).toBe(stubTag.meta_title);
    expect(tag.meta_description).toBe(stubTag.meta_description);
    expect(tag.codeinjection_head).toBe(stubTag.codeinjection_head);
    expect(tag.codeinjection_foot).toBe(stubTag.codeinjection_foot);
    expect(tag.og_image).toBe(stubTag.og_image);
    expect(tag.og_title).toBe(stubTag.og_title);
    expect(tag.og_description).toBe(stubTag.og_description);
    expect(tag.twitter_image).toBe(stubTag.twitter_image);
    expect(tag.twitter_title).toBe(stubTag.twitter_title);
    expect(tag.twitter_description).toBe(stubTag.twitter_description);
    expect(tag.name).toBe(stubTag.name);
    expect(tag.description).toBe(stubTag.description);
    expect(tag.feature_image).toBe(stubTag.feature_image);
    expect(tag.visibility).toBe(stubTag.visibility);
    expect(tag.canonical_url).toBe(stubTag.canonical_url);
    expect(tag.accent_color).toBe(stubTag.accent_color);
    expect(tag.url).toBe(stubTag.url);
    expect(tag.created_at).toBe(stubTag.created_at);
    expect(tag.updated_at).toBeDefined();
  });
});
