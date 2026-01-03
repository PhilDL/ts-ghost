import { beforeEach, describe, expect, test } from "vitest";

import { TSGhostContentAPI } from "../content-api";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "59d4bf56c73c04a18c867dc3ba";

const stub = {
  id: "63887bd17f2cf30001fec814",
  uuid: "3fcc3997-34aa-49ff-8458-fac79e1f6d33",
  title: "About this site",
  slug: "about",
  html: `<p>Astro Starter is an independent publication launched in December 2022 by Astro Starter. If you subscribe today, you'll get full access to the website as well as email newsletters about new content when it's available. Your subscription makes this site possible, and allows Astro Starter to continue to exist. Thank you!</p><h3 id="access-all-areas">Access all areas</h3><p>By signing up, you'll get access to the full archive of everything that's been published before and everything that's still to come. Your very own private library.</p><h3 id="fresh-content-delivered">Fresh content, delivered</h3><p>Stay up to date with new content sent straight to your inbox! No more worrying about whether you missed something because of a pesky algorithm or news feed.</p><h3 id="meet-people-like-you">Meet people like you</h3><p>Join a community of other subscribers who share the same interests.</p><hr><h3 id="start-your-own-thing">Start your own thing</h3><p>Enjoying the experience? Get started for free and set up your very own subscription business using <a href="https://ghost.org">Ghost</a>, the same platform that powers this website.</p>`,
  comment_id: "63887bd17f2cf30001fec814",
  feature_image: null,
  featured: false,
  visibility: "public",
  created_at: "2022-12-01T10:02:57.000+00:00",
  updated_at: "2022-12-01T10:03:27.000+00:00",
  published_at: "2022-12-01T10:02:57.000+00:00",
  custom_excerpt: null,
  codeinjection_head: null,
  codeinjection_foot: null,
  custom_template: null,
  canonical_url: null,
  authors: [Array],
  tags: [],
  primary_author: [Object],
  primary_tag: null,
  url: "https://astro-starter.digitalpress.blog/about/",
  excerpt:
    "Astro Starter is an independent publication launched in December 2022 by Astro Starter. If you subscribe today, you'll get full access to the website as well as email newsletters about new content when it's available. Your subscription makes this site possible, and allows Astro Starter to continue to exist. Thank you!\n" +
    "\n" +
    "\n" +
    "Access all areas\n" +
    "\n" +
    "By signing up, you'll get access to the full archive of everything that's been published before and everything that's still to come. Your very own private libra",
  reading_time: 1,
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
  frontmatter: null,
  feature_image_alt: null,
  feature_image_caption: null,
};
describe("pages integration tests browse", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v6.0");
  });
  test("pages.browse()", async () => {
    const result = await api.pages.browse().fetch();
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
      const page = result.data[0];
      expect(page).toBeDefined();
      expect(page.id).toBe(stub.id);
      expect(page.title).toBe(stub.title);
      expect(page.slug).toBe(stub.slug);
      expect(page.html).toContain("<p>Astro Starter is an independent publication");
      expect(page.comment_id).toBe(stub.comment_id);
      expect(page.feature_image).toBe(stub.feature_image);
      expect(page.featured).toBe(stub.featured);
      expect(page.visibility).toBe(stub.visibility);
      expect(page.created_at).toBe(stub.created_at);
      expect(page.updated_at).toBe(stub.updated_at);
      expect(page.published_at).toBe(stub.published_at);
      expect(page.custom_excerpt).toBe(stub.custom_excerpt);
      expect(page.codeinjection_head).toBe(stub.codeinjection_head);
      expect(page.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(page.custom_template).toBe(stub.custom_template);
      expect(page.canonical_url).toBe(stub.canonical_url);
      expect(page.url).toBe(stub.url);
      expect(page.excerpt).toBe(stub.excerpt);
      expect(page.reading_time).toBe(stub.reading_time);
      expect(page.access).toBe(stub.access);
      expect(page.comments).toBe(stub.comments);
      expect(page.og_image).toBe(stub.og_image);
      expect(page.og_title).toBe(stub.og_title);
      expect(page.og_description).toBe(stub.og_description);
      expect(page.twitter_image).toBe(stub.twitter_image);
      expect(page.twitter_title).toBe(stub.twitter_title);
      expect(page.twitter_description).toBe(stub.twitter_description);
      expect(page.meta_title).toBe(stub.meta_title);
      expect(page.meta_description).toBe(stub.meta_description);
      expect(page.feature_image_alt).toBe(stub.feature_image_alt);
      expect(page.feature_image_caption).toBe(stub.feature_image_caption);
      expect(page.authors).toBeUndefined();
      expect(page.primary_author).toBeUndefined();
      expect(page.primary_tag).toBeUndefined();
      expect(page.tags).toBeUndefined();
    }
  });

  test("pages.browse() include authors and tags", async () => {
    const result = await api.pages.browse().include({ authors: true, tags: true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const page = result.data[0];
      expect(page).toBeDefined();
      expect(page.id).toBe(stub.id);
      expect(page.authors).toBeDefined();
      expect(page.authors).toHaveLength(1);
      expect(page.authors && page.authors[0].slug).toBe("phildl");
      expect(page.primary_author).toBeDefined();
      expect(page.primary_author).not.toBeNull();
      expect(page.primary_author?.slug).toBe("phildl");
      expect(page.tags).toBeDefined();
      expect(page.tags).toHaveLength(0);
      expect(page.primary_tag).toBeNull();
    }
  });

  test("pages.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const result = await api.pages.browse().fields({ slug: true, title: true }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const page = result.data[0];
      expect(page).toBeDefined();
      expect(page.title).toBe(stub.title);
      expect(page.slug).toBe(stub.slug);
      // @ts-expect-error
      expect(page.id).toBeUndefined();
      // @ts-expect-error
      expect(page.authors).toBeUndefined();
    }
  });

  test("pages.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const result = await api.pages
      .browse()
      .fields({ slug: true, title: true, primary_author: true, authors: true })
      .include({ authors: true })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(1);
      const page = result.data[0];
      expect(page).toBeDefined();
      expect(page.title).toBe(stub.title);
      expect(page.slug).toBe(stub.slug);
      expect(page.primary_author).toBeDefined();
      expect(page.primary_author?.slug).toBe("phildl");
      // @ts-expect-error
      expect(page.id).toBeUndefined();
      expect(page.authors).toBeUndefined();
    }
  });
});

describe("pages integration tests read", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v6.0");
  });

  test("pages.browse() include authors and tags", async () => {
    const result = await api.pages.read({ id: "63887bd07f2cf30001fec812" }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (!result.success) {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toBeDefined();
      const page = result.data;
      expect(page).toBeDefined();
      expect(page.id).toBe(stub.id);
      expect(page.title).toBe(stub.title);
      expect(page.slug).toBe(stub.slug);
      expect(page.html).toContain("<p>Astro Starter is an independent publication");
      expect(page.comment_id).toBe(stub.comment_id);
      expect(page.feature_image).toBe(stub.feature_image);
      expect(page.featured).toBe(stub.featured);
      expect(page.visibility).toBe(stub.visibility);
      expect(page.created_at).toBe(stub.created_at);
      expect(page.updated_at).toBe(stub.updated_at);
      expect(page.published_at).toBe(stub.published_at);
      expect(page.custom_excerpt).toBe(stub.custom_excerpt);
      expect(page.codeinjection_head).toBe(stub.codeinjection_head);
      expect(page.codeinjection_foot).toBe(stub.codeinjection_foot);
      expect(page.custom_template).toBe(stub.custom_template);
      expect(page.canonical_url).toBe(stub.canonical_url);
      expect(page.url).toBe(stub.url);
      expect(page.excerpt).toBe(stub.excerpt);
      expect(page.reading_time).toBe(stub.reading_time);
      expect(page.access).toBe(stub.access);
      expect(page.comments).toBe(stub.comments);
      expect(page.og_image).toBe(stub.og_image);
      expect(page.og_title).toBe(stub.og_title);
      expect(page.og_description).toBe(stub.og_description);
      expect(page.twitter_image).toBe(stub.twitter_image);
      expect(page.twitter_title).toBe(stub.twitter_title);
      expect(page.twitter_description).toBe(stub.twitter_description);
      expect(page.meta_title).toBe(stub.meta_title);
      expect(page.meta_description).toBe(stub.meta_description);
      expect(page.feature_image_alt).toBe(stub.feature_image_alt);
      expect(page.feature_image_caption).toBe(stub.feature_image_caption);
      expect(page.authors).toBeUndefined();
      expect(page.primary_author).toBeUndefined();
      expect(page.primary_tag).toBeUndefined();
      expect(page.tags).toBeUndefined();
    }
  });
});
