import { describe, test, beforeEach, assert } from "vitest";
import { TSGhostAdminAPI } from "../admin-api";

const stubPage = {
  id: "63887bd17f2cf30001fec814",
  uuid: "3fcc3997-34aa-49ff-8458-fac79e1f6d33",
  title: "About this site",
  slug: "about",
  html: `<p>Astro Starter is an independent publication launched in December 2022 by Astro Starter. If you subscribe today, you'll get full access to the website as well as email newsletters about new content when it's available. Your subscription makes this site possible, and allows Astro Starter to continue to exist. Thank you!</p><h3 id="access-all-areas">Access all areas</h3><p>By signing up, you'll get access to the full archive of everything that's been published before and everything that's still to come. Your very own private library.</p><h3 id="fresh-content-delivered">Fresh content, delivered</h3><p>Stay up to date with new content sent straight to your inbox! No more worrying about whether you missed something because of a pesky algorithm or news feed.</p><h3 id="meet-people-like-you">Meet people like you</h3><p>Join a community of other subscribers who share the same interests.</p><hr><h3 id="start-your-own-thing">Start your own thing</h3><p>Enjoying the experience? Get started for free and set up your very own subscription business using <a href="https://ghost.org">Ghost</a>, the same platform that powers this website.</p>`,
  comment_id: "63887bd17f2cf30001fec814",
  plaintext:
    "Astro Starter is an independent publication launched in December 2022 by Astro Starter. If you subscribe today, you'll get full access to the website as well as email newsletters about new content when it's available. Your subscription makes this site possible, and allows Astro Starter to continue to exist. Thank you!\n" +
    "\n" +
    "\n" +
    "Access all areas\n" +
    "\n" +
    "By signing up, you'll get access to the full archive of everything that's been published before and everything that's still to come. Your very own private library.\n" +
    "\n" +
    "\n" +
    "Fresh content, delivered\n" +
    "\n" +
    "Stay up to date with new content sent straight to your inbox! No more worrying about whether you missed something because of a pesky algorithm or news feed.\n" +
    "\n" +
    "\n" +
    "Meet people like you\n" +
    "\n" +
    "Join a community of other subscribers who share the same interests.\n" +
    "\n" +
    "\n" +
    "Start your own thing\n" +
    "\n" +
    "Enjoying the experience? Get started for free and set up your very own subscription business using Ghost, the same platform that powers this website.",
  feature_image: null,
  featured: false,
  status: "published",
  visibility: "public",
  created_at: "2022-12-01T10:02:57.000Z",
  updated_at: "2022-12-01T10:03:27.000Z",
  published_at: "2022-12-01T10:02:57.000Z",
  custom_excerpt: null,
  codeinjection_head: null,
  codeinjection_foot: null,
  custom_template: null,
  canonical_url: null,
  tags: [],
  authors: [
    {
      id: "1",
      name: "PhilDL",
      slug: "phildl",
      email: "philippe.lattention@hotmail.fr",
      profile_image: "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=x&d=mp",
      cover_image: null,
      bio: null,
      website: "https://github.com/PhilDL",
      location: null,
      facebook: null,
      twitter: null,
      accessibility: null,
      status: "active",
      meta_title: null,
      meta_description: null,
      tour: null,
      last_seen: "2023-03-15T03:00:04.000Z",
      comment_notifications: true,
      free_member_signup_notification: true,
      paid_subscription_started_notification: true,
      paid_subscription_canceled_notification: false,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2023-03-15T03:00:04.000Z",
      mention_notifications: true,
      milestone_notifications: true,
      roles: [
        {
          created_at: "2022-12-01T10:02:56.000Z",
          description: "Blog Owner",
          id: "63887bd07f2cf30001fec79c",
          name: "Owner",
          updated_at: "2022-12-01T10:02:56.000Z",
        },
      ],
      url: "https://astro-starter.digitalpress.blog/author/phildl/",
    },
  ],
  tiers: [
    {
      id: "63887bd07f2cf30001fec7a2",
      name: "Free",
      slug: "free",
      active: true,
      welcome_page_url: null,
      visibility: "public",
      trial_days: 0,
      description: null,
      type: "free",
      currency: null,
      monthly_price: null,
      yearly_price: null,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:02:56.000Z",
      monthly_price_id: null,
      yearly_price_id: null,
    },
    {
      id: "63887bd07f2cf30001fec7a3",
      name: "Astro Starter",
      slug: "default-product",
      active: true,
      welcome_page_url: null,
      visibility: "public",
      trial_days: 0,
      description: null,
      type: "paid",
      currency: "USD",
      monthly_price: 500,
      yearly_price: 5000,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:03:27.000Z",
      monthly_price_id: null,
      yearly_price_id: null,
    },
  ],
  count: {
    signups: 0,
    paid_conversions: 0,
    positive_feedback: 0,
    negative_feedback: 0,
  },
  primary_author: {
    id: "1",
    name: "PhilDL",
    slug: "phildl",
    email: "philippe.lattention@hotmail.fr",
    profile_image: "https://www.gravatar.com/avatar/c2baf8feb52fc654cc40c731207c677d?s=250&r=x&d=mp",
    cover_image: null,
    bio: null,
    website: "https://github.com/PhilDL",
    location: null,
    facebook: null,
    twitter: null,
    accessibility: null,
    status: "active",
    meta_title: null,
    meta_description: null,
    tour: null,
    last_seen: "2023-03-15T03:00:04.000Z",
    comment_notifications: true,
    free_member_signup_notification: true,
    paid_subscription_started_notification: true,
    paid_subscription_canceled_notification: false,
    created_at: "2022-12-01T10:02:56.000Z",
    updated_at: "2023-03-15T03:00:04.000Z",
    mention_notifications: true,
    milestone_notifications: true,
    roles: [
      {
        created_at: "2022-12-01T10:02:56.000Z",
        description: "Blog Owner",
        id: "63887bd07f2cf30001fec79c",
        name: "Owner",
        updated_at: "2022-12-01T10:02:56.000Z",
      },
    ],
    url: "https://astro-starter.digitalpress.blog/author/phildl/",
  },
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
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("pages.browse()", async () => {
    expect(api.pages).toBeDefined();
    const result = await api.pages
      .browse({
        input: { limit: 1 },
      })
      .formats({ html: true, plaintext: true })
      .fetch();

    assert(result.status === "success");
    const page = result.data[0];
    expect(page.id).toBe(stubPage.id);
    expect(page.uuid).toBe(stubPage.uuid);
    expect(page.slug).toBe(stubPage.slug);
    expect(page.title).toBe(stubPage.title);
    expect(page.html).toBeDefined();
    expect(page.comment_id).toBe(stubPage.comment_id);
    expect(page.feature_image).toBe(stubPage.feature_image);
    expect(page.featured).toBe(stubPage.featured);
    expect(page.status).toBe(stubPage.status);
    expect(page.visibility).toBe(stubPage.visibility);
    expect(page.created_at).toBe(stubPage.created_at);
    expect(page.updated_at).toBe(stubPage.updated_at);
    expect(page.published_at).toBe(stubPage.published_at);
    expect(page.custom_excerpt).toBe(stubPage.custom_excerpt);
    expect(page.codeinjection_head).toBe(stubPage.codeinjection_head);
    expect(page.codeinjection_foot).toBe(stubPage.codeinjection_foot);
    expect(page.custom_template).toBe(stubPage.custom_template);
    expect(page.canonical_url).toBe(stubPage.canonical_url);
    expect(page.url).toBe(stubPage.url);
    expect(page.excerpt).toBe(stubPage.excerpt);
    expect(page.og_image).toBe(stubPage.og_image);
    expect(page.og_title).toBe(stubPage.og_title);
    expect(page.og_description).toBe(stubPage.og_description);
    expect(page.twitter_image).toBe(stubPage.twitter_image);
    expect(page.twitter_title).toBe(stubPage.twitter_title);
    expect(page.twitter_description).toBe(stubPage.twitter_description);
    expect(page.meta_title).toBe(stubPage.meta_title);
    expect(page.meta_description).toBe(stubPage.meta_description);
    expect(page.email_subject).toBeUndefined();
    expect(page.frontmatter).toBe(stubPage.frontmatter);
    expect(page.feature_image_alt).toBe(stubPage.feature_image_alt);
    expect(page.feature_image_caption).toBe(stubPage.feature_image_caption);

    // relationship fields
    expect(page.tags).toStrictEqual(stubPage.tags);

    // Author
    const pageAuthor = page.authors[0];
    const stubPageAuthors = stubPage.authors[0];
    expect(pageAuthor.id).toBe(stubPageAuthors.id);
    expect(pageAuthor.slug).toBe(stubPageAuthors.slug);
    expect(pageAuthor.name).toBe(stubPageAuthors.name);
    expect(pageAuthor.profile_image).toBe(stubPageAuthors.profile_image);
    expect(pageAuthor.cover_image).toBe(stubPageAuthors.cover_image);
    expect(pageAuthor.bio).toBe(stubPageAuthors.bio);
    expect(pageAuthor.website).toBe(stubPageAuthors.website);
    expect(pageAuthor.location).toBe(stubPageAuthors.location);
    expect(pageAuthor.facebook).toBe(stubPageAuthors.facebook);
    expect(pageAuthor.twitter).toBe(stubPageAuthors.twitter);
    expect(pageAuthor.meta_title).toBe(stubPageAuthors.meta_title);
    expect(pageAuthor.meta_description).toBe(stubPageAuthors.meta_description);
    expect(pageAuthor.url).toBe(stubPageAuthors.url);
    expect(pageAuthor.created_at).toBeDefined();
    expect(pageAuthor.updated_at).toBeDefined();
    expect(pageAuthor.email).toBe(stubPageAuthors.email);
    expect(pageAuthor.accessibility).toBe(stubPageAuthors.accessibility);
    expect(pageAuthor.roles).toStrictEqual(stubPageAuthors.roles);

    // Tiers
    assert(page.tiers?.length === 1);
    const pageTier = page.tiers[0];
    const stubPageTier = stubPage.tiers[0];
    expect(pageTier.id).toBe(stubPageTier.id);
    expect(pageTier.name).toBe(stubPageTier.name);
    expect(pageTier.slug).toBe(stubPageTier.slug);
    expect(pageTier.visibility).toBe(stubPageTier.visibility);
    expect(pageTier.trial_days).toBe(stubPageTier.trial_days);
    expect(pageTier.type).toBe(stubPageTier.type);
    expect(pageTier.currency).toBe(stubPageTier.currency);
    expect(pageTier.description).toBe(stubPageTier.description);
    expect(pageTier.currency).toBe(stubPageTier.currency);
    expect(pageTier.monthly_price).toBe(stubPageTier.monthly_price);
    expect(pageTier.monthly_price_id).toBe(stubPageTier.monthly_price_id);
    expect(pageTier.yearly_price).toBe(stubPageTier.yearly_price);
    expect(pageTier.yearly_price_id).toBe(stubPageTier.yearly_price_id);

    // Primary author

    expect(page.primary_author.id).toBe(stubPage.primary_author.id);
    expect(page.primary_author.slug).toBe(stubPage.primary_author.slug);
    expect(page.primary_author.name).toBe(stubPage.primary_author.name);
    expect(page.primary_author.profile_image).toBe(stubPage.primary_author.profile_image);
    expect(page.primary_author.cover_image).toBe(stubPage.primary_author.cover_image);
    expect(page.primary_author.bio).toBe(stubPage.primary_author.bio);
    expect(page.primary_author.website).toBe(stubPage.primary_author.website);
    expect(page.primary_author.location).toBe(stubPage.primary_author.location);
    expect(page.primary_author.facebook).toBe(stubPage.primary_author.facebook);
    expect(page.primary_author.twitter).toBe(stubPage.primary_author.twitter);
    expect(page.primary_author.meta_title).toBe(stubPage.primary_author.meta_title);
    expect(page.primary_author.meta_description).toBe(stubPage.primary_author.meta_description);
    expect(page.primary_author.url).toBe(stubPage.primary_author.url);
    expect(page.primary_author.created_at).toBeDefined();
    expect(page.primary_author.updated_at).toBeDefined();
    expect(page.primary_author.email).toBe(stubPage.primary_author.email);
    expect(page.primary_author.accessibility).toBe(stubPage.primary_author.accessibility);
    expect(page.primary_author.roles).toStrictEqual(stubPage.primary_author.roles);

    expect(page.count).toStrictEqual(stubPage.count);
    expect(page.primary_tag).toStrictEqual(stubPage.primary_tag);
  });

  test("pages.read()", async () => {
    expect(api.pages).toBeDefined();
    const result = await api.pages
      .read({
        input: { slug: "about" },
      })
      .formats({ html: true, plaintext: true })
      .fetch();

    assert(result.status === "success");
    const page = result.data;
    expect(page.id).toBe(stubPage.id);
    expect(page.uuid).toBe(stubPage.uuid);
    expect(page.slug).toBe(stubPage.slug);
    expect(page.title).toBe(stubPage.title);
    expect(page.html).toBeDefined();
    expect(page.comment_id).toBe(stubPage.comment_id);
    expect(page.feature_image).toBe(stubPage.feature_image);
    expect(page.featured).toBe(stubPage.featured);
    expect(page.status).toBe(stubPage.status);
    expect(page.visibility).toBe(stubPage.visibility);
    expect(page.created_at).toBe(stubPage.created_at);
    expect(page.updated_at).toBe(stubPage.updated_at);
    expect(page.published_at).toBe(stubPage.published_at);
    expect(page.custom_excerpt).toBe(stubPage.custom_excerpt);
    expect(page.codeinjection_head).toBe(stubPage.codeinjection_head);
    expect(page.codeinjection_foot).toBe(stubPage.codeinjection_foot);
    expect(page.custom_template).toBe(stubPage.custom_template);
    expect(page.canonical_url).toBe(stubPage.canonical_url);
    expect(page.url).toBe(stubPage.url);
    expect(page.excerpt).toBe(stubPage.excerpt);
    expect(page.og_image).toBe(stubPage.og_image);
    expect(page.og_title).toBe(stubPage.og_title);
    expect(page.og_description).toBe(stubPage.og_description);
    expect(page.twitter_image).toBe(stubPage.twitter_image);
    expect(page.twitter_title).toBe(stubPage.twitter_title);
    expect(page.twitter_description).toBe(stubPage.twitter_description);
    expect(page.meta_title).toBe(stubPage.meta_title);
    expect(page.meta_description).toBe(stubPage.meta_description);
    expect(page.email_subject).toBeUndefined();
    expect(page.frontmatter).toBe(stubPage.frontmatter);
    expect(page.feature_image_alt).toBe(stubPage.feature_image_alt);
    expect(page.feature_image_caption).toBe(stubPage.feature_image_caption);

    // relationship fields
    expect(page.tags).toStrictEqual(stubPage.tags);

    // Author
    const postAuthor = page.authors[0];
    const stubPageAuthors = stubPage.authors[0];
    expect(postAuthor.id).toBe(stubPageAuthors.id);
    expect(postAuthor.slug).toBe(stubPageAuthors.slug);
    expect(postAuthor.name).toBe(stubPageAuthors.name);
    expect(postAuthor.profile_image).toBe(stubPageAuthors.profile_image);
    expect(postAuthor.cover_image).toBe(stubPageAuthors.cover_image);
    expect(postAuthor.bio).toBe(stubPageAuthors.bio);
    expect(postAuthor.website).toBe(stubPageAuthors.website);
    expect(postAuthor.location).toBe(stubPageAuthors.location);
    expect(postAuthor.facebook).toBe(stubPageAuthors.facebook);
    expect(postAuthor.twitter).toBe(stubPageAuthors.twitter);
    expect(postAuthor.meta_title).toBe(stubPageAuthors.meta_title);
    expect(postAuthor.meta_description).toBe(stubPageAuthors.meta_description);
    expect(postAuthor.url).toBe(stubPageAuthors.url);
    expect(postAuthor.created_at).toBeDefined();
    expect(postAuthor.updated_at).toBeDefined();
    expect(postAuthor.email).toBe(stubPageAuthors.email);
    expect(postAuthor.accessibility).toBe(stubPageAuthors.accessibility);
    expect(postAuthor.roles).toStrictEqual(stubPageAuthors.roles);

    // Tiers
    assert(page.tiers?.length === 1);
    const postTier = page.tiers[0];
    const stubPageTier = stubPage.tiers[0];
    expect(postTier.id).toBe(stubPageTier.id);
    expect(postTier.name).toBe(stubPageTier.name);
    expect(postTier.slug).toBe(stubPageTier.slug);
    expect(postTier.visibility).toBe(stubPageTier.visibility);
    expect(postTier.trial_days).toBe(stubPageTier.trial_days);
    expect(postTier.type).toBe(stubPageTier.type);
    expect(postTier.currency).toBe(stubPageTier.currency);
    expect(postTier.description).toBe(stubPageTier.description);
    expect(postTier.currency).toBe(stubPageTier.currency);
    expect(postTier.monthly_price).toBe(stubPageTier.monthly_price);
    expect(postTier.monthly_price_id).toBe(stubPageTier.monthly_price_id);
    expect(postTier.yearly_price).toBe(stubPageTier.yearly_price);
    expect(postTier.yearly_price_id).toBe(stubPageTier.yearly_price_id);

    // Primary author

    expect(page.primary_author.id).toBe(stubPage.primary_author.id);
    expect(page.primary_author.slug).toBe(stubPage.primary_author.slug);
    expect(page.primary_author.name).toBe(stubPage.primary_author.name);
    expect(page.primary_author.profile_image).toBe(stubPage.primary_author.profile_image);
    expect(page.primary_author.cover_image).toBe(stubPage.primary_author.cover_image);
    expect(page.primary_author.bio).toBe(stubPage.primary_author.bio);
    expect(page.primary_author.website).toBe(stubPage.primary_author.website);
    expect(page.primary_author.location).toBe(stubPage.primary_author.location);
    expect(page.primary_author.facebook).toBe(stubPage.primary_author.facebook);
    expect(page.primary_author.twitter).toBe(stubPage.primary_author.twitter);
    expect(page.primary_author.meta_title).toBe(stubPage.primary_author.meta_title);
    expect(page.primary_author.meta_description).toBe(stubPage.primary_author.meta_description);
    expect(page.primary_author.url).toBe(stubPage.primary_author.url);
    expect(page.primary_author.created_at).toBeDefined();
    expect(page.primary_author.updated_at).toBeDefined();
    expect(page.primary_author.email).toBe(stubPage.primary_author.email);
    expect(page.primary_author.accessibility).toBe(stubPage.primary_author.accessibility);
    expect(page.primary_author.roles).toStrictEqual(stubPage.primary_author.roles);

    expect(page.count).toStrictEqual(stubPage.count);
    expect(page.primary_tag).toStrictEqual(stubPage.primary_tag);
  });

  test("pages api with bad key", async () => {
    const api = new TSGhostAdminAPI(
      process.env.VITE_GHOST_URL!,
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v5.0"
    );
    expect(api.pages).toBeDefined();
    const result = await api.pages
      .browse({
        input: { limit: 1 },
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(result.status === "error");
    expect(result.errors[0].message).toBe("Unknown Admin API Key");
    const resultR = await api.pages
      .read({
        input: { slug: "about" },
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(resultR.status === "error");
    expect(resultR.errors[0].message).toBe("Unknown Admin API Key");
  });

  test("pages api with wrong url", async () => {
    const api = new TSGhostAdminAPI(
      "https://codingdodoes.com",
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v5.0"
    );
    expect(api.pages).toBeDefined();
    const result = await api.pages
      .browse({
        input: { limit: 1 },
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(result.status === "error");
    expect(result.errors[0].message).toContain("FetchError");
    const resultR = await api.pages
      .read({
        input: { slug: "about" },
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(resultR.status === "error");
    expect(resultR.errors[0].message).toContain("FetchError");
  });
});
