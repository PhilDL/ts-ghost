import { beforeEach, describe, expect, test } from "vitest";

import { TSGhostContentAPI } from "../content-api";
import type { Post } from "./schemas";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "59d4bf56c73c04a18c867dc3ba";

const stub = {
  id: "63887bd07f2cf30001fec812",
  uuid: "8586b088-0a4e-49d2-8926-7bc6deefda04",
  title: "Coming soon",
  slug: "coming-soon",
  html: `<p>This is Astro Starter, a brand new site by Astro Starter that's just getting started. Things will be up and running here shortly, but you can <a href="#/portal/">subscribe</a> in the meantime if you'd like to stay up to date and receive emails when new content is published!</p>`,
  comment_id: "63887bd07f2cf30001fec812",
  feature_image: "https://static.ghost.org/v4.0.0/images/feature-image.jpg",
  featured: false,
  visibility: "public",
  created_at: "2022-12-01T10:02:56.000+00:00",
  updated_at: "2022-12-01T10:03:27.000+00:00",
  published_at: "2022-12-01T10:02:56.000+00:00",
  custom_excerpt: null,
  codeinjection_head: null,
  codeinjection_foot: null,
  custom_template: null,
  canonical_url: null,
  url: "https://astro-starter.digitalpress.blog/coming-soon/",
  excerpt:
    "This is Astro Starter, a brand new site by Astro Starter that's just getting started. Things will be up and running here shortly, but you can subscribe in the meantime if you'd like to stay up to date and receive emails when new content is published!",
  reading_time: 0,
  access: true,
  comments: false,
  og_image: null,
  og_title: null,
  og_description: null,
  twitter_image: null,
  twitter_title: null,
  twitter_description: null,
  meta_title: null,
  meta_description: null,
  email_subject: null,
  frontmatter: null,
  feature_image_alt: null,
  feature_image_caption: null,
};
describe("posts integration tests browse", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v6.0");
  });
  test("posts.browse()", async () => {
    const result = await api.posts.browse().fetch();
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
      const post = result.data[0];
      expect(post).toBeDefined();
      expect(post.id).toBe(stub.id);
      expect(post.title).toBe(stub.title);
      expect(post.slug).toBe(stub.slug);
      expect(post.html).toContain("<p>This is Astro Starter, a brand new");
      expect(post.comment_id).toBe(stub.comment_id);
      expect(post.feature_image).toBe(stub.feature_image);
      expect(post.featured).toBe(stub.featured);
      expect(post.visibility).toBe(stub.visibility);
      expect(post.created_at).toBe(stub.created_at);
      expect(post.updated_at).toBe(stub.updated_at);
      expect(post.published_at).toBe(stub.published_at);
      expect(post.custom_excerpt).toBe(stub.custom_excerpt);
      expect(post.codeinjection_head).toBe(stub.codeinjection_head);
      expect(post.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(post.custom_template).toBe(stub.custom_template);
      expect(post.canonical_url).toBe(stub.canonical_url);
      expect(post.url).toBe(stub.url);
      expect(post.excerpt).toBe(stub.excerpt);
      expect(post.reading_time).toBe(stub.reading_time);
      expect(post.access).toBe(stub.access);
      expect(post.comments).toBe(stub.comments);
      expect(post.og_image).toBe(stub.og_image);
      expect(post.og_title).toBe(stub.og_title);
      expect(post.og_description).toBe(stub.og_description);
      expect(post.twitter_image).toBe(stub.twitter_image);
      expect(post.twitter_title).toBe(stub.twitter_title);
      expect(post.twitter_description).toBe(stub.twitter_description);
      expect(post.meta_title).toBe(stub.meta_title);
      expect(post.meta_description).toBe(stub.meta_description);
      expect(post.feature_image_alt).toBe(stub.feature_image_alt);
      expect(post.feature_image_caption).toBe(stub.feature_image_caption);
      expect(post.authors).toBeUndefined();
      expect(post.primary_author).toBeUndefined();
      expect(post.primary_tag).toBeUndefined();
      expect(post.tags).toBeUndefined();
    }
  });

  test("posts.browse() include authors and tags", async () => {
    const result = await api.posts.browse().include({ authors: true, tags: true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const post = result.data[0];
      expect(post).toBeDefined();
      expect(post.id).toBe(stub.id);
      expect(post.authors).toBeDefined();
      expect(post.authors).toHaveLength(1);
      expect(post.authors && post.authors[0].slug).toBe("phildl");
      expect(post.primary_author).toBeDefined();
      expect(post.primary_author).not.toBeNull();
      expect(post.primary_author?.slug).toBe("phildl");
      expect(post.tags).toBeDefined();
      expect(post.tags).toHaveLength(1);
      expect(post.primary_tag?.name).toBe("News");
    }
  });

  test("posts.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const outputFields = {
      slug: true,
      title: true,
    } satisfies { [k in keyof Post]?: true | undefined };
    const result = await api.posts.browse().fields(outputFields).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const post = result.data[0];
      expect(post).toBeDefined();
      expect(post.title).toBe(stub.title);
      expect(post.slug).toBe(stub.slug);
      // @ts-expect-error
      expect(post.id).toBeUndefined();
      // @ts-expect-error
      expect(post.authors).toBeUndefined();
    }
  });

  test("posts.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const result = await api.posts
      .browse()
      .fields({ slug: true, title: true, primary_author: true })
      .include({ authors: true })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const post = result.data[0];
      expect(post).toBeDefined();
      expect(post.title).toBe(stub.title);
      expect(post.slug).toBe(stub.slug);
      expect(post.primary_author).toBeDefined();
      expect(post.primary_author?.slug).toBe("phildl");
      // @ts-expect-error
      expect(post.id).toBeUndefined();
      // @ts-expect-error
      expect(post.authors).toBeUndefined();
    }
  });
});

describe("posts integration tests read", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v6.0");
  });

  test("posts.read() with non-existent id returns 422 status", async () => {
    const result = await api.posts.read({ id: "nonexistent-id-12345" }).fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      // read with non-existent id returns 422 status code on Ghost side
      expect(result.status).toBe(422);
      expect(result.errors[0].type).toBe("ValidationError");
    }
  });

  test("posts.read() with non-existent slug returns 404 status", async () => {
    const result = await api.posts.read({ slug: "this-slug-does-not-exist-12345" }).fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(404);
      expect(result.errors[0].type).toBe("NotFoundError");
    }
  });

  test("posts.browse() include authors and tags", async () => {
    const result = await api.posts.read({ id: "63887bd07f2cf30001fec812" }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const post = result.data;
      expect(post).toBeDefined();
      expect(post.id).toBe(stub.id);
      expect(post.title).toBe(stub.title);
      expect(post.slug).toBe(stub.slug);
      expect(post.html).toContain("<p>This is Astro Starter, a brand new");
      expect(post.comment_id).toBe(stub.comment_id);
      expect(post.feature_image).toBe(stub.feature_image);
      expect(post.featured).toBe(stub.featured);
      expect(post.visibility).toBe(stub.visibility);
      expect(post.created_at).toBe(stub.created_at);
      expect(post.updated_at).toBe(stub.updated_at);
      expect(post.published_at).toBe(stub.published_at);
      expect(post.custom_excerpt).toBe(stub.custom_excerpt);
      expect(post.codeinjection_head).toBe(stub.codeinjection_head);
      expect(post.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(post.custom_template).toBe(stub.custom_template);
      expect(post.canonical_url).toBe(stub.canonical_url);
      expect(post.url).toBe(stub.url);
      expect(post.excerpt).toBe(stub.excerpt);
      expect(post.reading_time).toBe(stub.reading_time);
      expect(post.access).toBe(stub.access);
      expect(post.comments).toBe(stub.comments);
      expect(post.og_image).toBe(stub.og_image);
      expect(post.og_title).toBe(stub.og_title);
      expect(post.og_description).toBe(stub.og_description);
      expect(post.twitter_image).toBe(stub.twitter_image);
      expect(post.twitter_title).toBe(stub.twitter_title);
      expect(post.twitter_description).toBe(stub.twitter_description);
      expect(post.meta_title).toBe(stub.meta_title);
      expect(post.meta_description).toBe(stub.meta_description);
      expect(post.feature_image_alt).toBe(stub.feature_image_alt);
      expect(post.feature_image_caption).toBe(stub.feature_image_caption);
      expect(post.authors).toBeUndefined();
      expect(post.primary_author).toBeUndefined();
      expect(post.primary_tag).toBeUndefined();
      expect(post.tags).toBeUndefined();
    }
  });
});
