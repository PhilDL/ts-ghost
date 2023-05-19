import { faker } from "@faker-js/faker";
import { assert, beforeEach, describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

const stub = {
  posts: [
    {
      id: "63887bd07f2cf30001fec812",
      uuid: "8586b088-0a4e-49d2-8926-7bc6deefda04",
      title: "Coming soon",
      slug: "coming-soon",
      html: `<p>This is Astro Starter, a brand new site by Astro Starter that's just getting started. Things will be up and running here shortly, but you can <a href="#/portal/">subscribe</a> in the meantime if you'd like to stay up to date and receive emails when new content is published!</p>`,
      comment_id: "63887bd07f2cf30001fec812",
      feature_image: "https://static.ghost.org/v4.0.0/images/feature-image.jpg",
      featured: false,
      status: "published",
      visibility: "public",
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:03:27.000Z",
      published_at: "2022-12-01T10:02:56.000Z",
      custom_excerpt: null,
      codeinjection_head: null,
      codeinjection_foot: null,
      custom_template: null,
      canonical_url: null,
      tags: [
        {
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
          created_at: "2022-12-01T10:02:56.000Z",
          updated_at: "2022-12-01T10:02:56.000Z",
          url: "https://astro-starter.digitalpress.blog/tag/news/",
        },
      ],
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
          last_seen: "2023-03-11T09:00:45.000Z",
          comment_notifications: true,
          free_member_signup_notification: true,
          paid_subscription_started_notification: true,
          paid_subscription_canceled_notification: false,
          created_at: "2022-12-01T10:02:56.000Z",
          updated_at: "2023-03-11T09:00:45.000Z",
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
      count: { clicks: 0, positive_feedback: 0, negative_feedback: 0 },
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
        last_seen: "2023-03-11T09:00:45.000Z",
        comment_notifications: true,
        free_member_signup_notification: true,
        paid_subscription_started_notification: true,
        paid_subscription_canceled_notification: false,
        created_at: "2022-12-01T10:02:56.000Z",
        updated_at: "2023-03-11T09:00:45.000Z",
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
      primary_tag: {
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
        created_at: "2022-12-01T10:02:56.000Z",
        updated_at: "2022-12-01T10:02:56.000Z",
        url: "https://astro-starter.digitalpress.blog/tag/news/",
      },
      email_segment: "all",
      url: "https://astro-starter.digitalpress.blog/coming-soon/",
      excerpt:
        "This is Astro Starter, a brand new site by Astro Starter that's just getting started. Things will be up and running here shortly, but you can subscribe in the meantime if you'd like to stay up to date and receive emails when new content is published!",
      reading_time: 0,
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
      email_only: false,
      email: null,
      newsletter: null,
    },
  ],
  meta: {
    pagination: { page: 1, limit: 1, pages: 1, total: 1, next: null, prev: null },
  },
};

describe("posts integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("posts.browse()", async () => {
    expect(api.posts).toBeDefined();
    const result = await api.posts
      .browse({
        limit: 1,
        order: "created_at ASC",
      })
      .formats({ html: true, plaintext: true })
      .fetch();

    assert(result.success);
    const post = result.data[0];
    const stubPost = stub.posts[0];
    expect(post.id).toBe(stubPost.id);
    expect(post.uuid).toBe(stubPost.uuid);
    expect(post.slug).toBe(stubPost.slug);
    expect(post.title).toBe(stubPost.title);
    expect(post.html).toBeDefined();
    expect(post.comment_id).toBe(stubPost.comment_id);
    expect(post.feature_image).toBe(stubPost.feature_image);
    expect(post.featured).toBe(stubPost.featured);
    expect(post.status).toBe(stubPost.status);
    expect(post.visibility).toBe(stubPost.visibility);
    expect(post.created_at).toBe(stubPost.created_at);
    expect(post.updated_at).toBe(stubPost.updated_at);
    expect(post.published_at).toBe(stubPost.published_at);
    expect(post.custom_excerpt).toBe(stubPost.custom_excerpt);
    expect(post.codeinjection_head).toBe(stubPost.codeinjection_head);
    expect(post.codeinjection_foot).toBe(stubPost.codeinjection_foot);
    expect(post.custom_template).toBe(stubPost.custom_template);
    expect(post.canonical_url).toBe(stubPost.canonical_url);
    expect(post.email_segment).toBe(stubPost.email_segment);
    expect(post.url).toBe(stubPost.url);
    expect(post.excerpt).toBe(stubPost.excerpt);
    expect(post.og_image).toBe(stubPost.og_image);
    expect(post.og_title).toBe(stubPost.og_title);
    expect(post.og_description).toBe(stubPost.og_description);
    expect(post.twitter_image).toBe(stubPost.twitter_image);
    expect(post.twitter_title).toBe(stubPost.twitter_title);
    expect(post.twitter_description).toBe(stubPost.twitter_description);
    expect(post.meta_title).toBe(stubPost.meta_title);
    expect(post.meta_description).toBe(stubPost.meta_description);
    expect(post.email_subject).toBe(stubPost.email_subject);
    expect(post.frontmatter).toBe(stubPost.frontmatter);
    expect(post.feature_image_alt).toBe(stubPost.feature_image_alt);
    expect(post.feature_image_caption).toBe(stubPost.feature_image_caption);
    expect(post.email_only).toBe(stubPost.email_only);

    // relationship fields
    expect(post.tags).toStrictEqual(stubPost.tags);

    // Author
    const postAuthor = post.authors[0];
    const stubPostAuthors = stubPost.authors[0];
    expect(postAuthor.id).toBe(stubPostAuthors.id);
    expect(postAuthor.slug).toBe(stubPostAuthors.slug);
    expect(postAuthor.name).toBe(stubPostAuthors.name);
    expect(postAuthor.profile_image).toBe(stubPostAuthors.profile_image);
    expect(postAuthor.cover_image).toBe(stubPostAuthors.cover_image);
    expect(postAuthor.bio).toBe(stubPostAuthors.bio);
    expect(postAuthor.website).toBe(stubPostAuthors.website);
    expect(postAuthor.location).toBe(stubPostAuthors.location);
    expect(postAuthor.facebook).toBe(stubPostAuthors.facebook);
    expect(postAuthor.twitter).toBe(stubPostAuthors.twitter);
    expect(postAuthor.meta_title).toBe(stubPostAuthors.meta_title);
    expect(postAuthor.meta_description).toBe(stubPostAuthors.meta_description);
    expect(postAuthor.url).toBe(stubPostAuthors.url);
    expect(postAuthor.created_at).toBeDefined();
    expect(postAuthor.updated_at).toBeDefined();
    expect(postAuthor.email).toBe(stubPostAuthors.email);
    expect(postAuthor.accessibility).toBeDefined();
    expect(postAuthor.roles).toStrictEqual(stubPostAuthors.roles);

    // Tiers
    assert(Array.isArray(post.tiers));
    const postTier = post.tiers[0];
    const stubPostTier = stubPost.tiers[0];
    expect(postTier.id).toBe(stubPostTier.id);
    expect(postTier.name).toBe(stubPostTier.name);
    expect(postTier.slug).toBe(stubPostTier.slug);
    expect(postTier.visibility).toBe(stubPostTier.visibility);
    expect(postTier.trial_days).toBe(stubPostTier.trial_days);
    expect(postTier.type).toBe(stubPostTier.type);
    expect(postTier.currency).toBe(stubPostTier.currency);
    expect(postTier.description).toBe(stubPostTier.description);
    expect(postTier.currency).toBe(stubPostTier.currency);
    expect(postTier.monthly_price).toBe(stubPostTier.monthly_price);
    expect(postTier.monthly_price_id).toBe(stubPostTier.monthly_price_id);
    expect(postTier.yearly_price).toBe(stubPostTier.yearly_price);
    expect(postTier.yearly_price_id).toBe(stubPostTier.yearly_price_id);

    // Primary author

    expect(post.primary_author.id).toBe(stubPost.primary_author.id);
    expect(post.primary_author.slug).toBe(stubPost.primary_author.slug);
    expect(post.primary_author.name).toBe(stubPost.primary_author.name);
    expect(post.primary_author.profile_image).toBe(stubPost.primary_author.profile_image);
    expect(post.primary_author.cover_image).toBe(stubPost.primary_author.cover_image);
    expect(post.primary_author.bio).toBe(stubPost.primary_author.bio);
    expect(post.primary_author.website).toBe(stubPost.primary_author.website);
    expect(post.primary_author.location).toBe(stubPost.primary_author.location);
    expect(post.primary_author.facebook).toBe(stubPost.primary_author.facebook);
    expect(post.primary_author.twitter).toBe(stubPost.primary_author.twitter);
    expect(post.primary_author.meta_title).toBe(stubPost.primary_author.meta_title);
    expect(post.primary_author.meta_description).toBe(stubPost.primary_author.meta_description);
    expect(post.primary_author.url).toBe(stubPost.primary_author.url);
    expect(post.primary_author.created_at).toBeDefined();
    expect(post.primary_author.updated_at).toBeDefined();
    expect(post.primary_author.email).toBe(stubPost.primary_author.email);
    expect(post.primary_author.accessibility).toBeDefined();
    expect(post.primary_author.roles).toStrictEqual(stubPost.primary_author.roles);

    expect(post.count).toStrictEqual(stubPost.count);
    expect(post.primary_tag).toStrictEqual(stubPost.primary_tag);
    expect(post.email).toStrictEqual(stubPost.email);
    expect(post.newsletter).toStrictEqual(stubPost.newsletter);
  });

  test("posts.read()", async () => {
    expect(api.posts).toBeDefined();
    const result = await api.posts
      .read({
        slug: "coming-soon",
      })
      .formats({ html: true, plaintext: true })
      .fetch();

    assert(result.success);
    const post = result.data;
    const stubPost = stub.posts[0];
    expect(post.id).toBe(stubPost.id);
    expect(post.uuid).toBe(stubPost.uuid);
    expect(post.slug).toBe(stubPost.slug);
    expect(post.title).toBe(stubPost.title);
    expect(post.html).toBeDefined();
    expect(post.comment_id).toBe(stubPost.comment_id);
    expect(post.feature_image).toBe(stubPost.feature_image);
    expect(post.featured).toBe(stubPost.featured);
    expect(post.status).toBe(stubPost.status);
    expect(post.visibility).toBe(stubPost.visibility);
    expect(post.created_at).toBe(stubPost.created_at);
    expect(post.updated_at).toBe(stubPost.updated_at);
    expect(post.published_at).toBe(stubPost.published_at);
    expect(post.custom_excerpt).toBe(stubPost.custom_excerpt);
    expect(post.codeinjection_head).toBe(stubPost.codeinjection_head);
    expect(post.codeinjection_foot).toBe(stubPost.codeinjection_foot);
    expect(post.custom_template).toBe(stubPost.custom_template);
    expect(post.canonical_url).toBe(stubPost.canonical_url);
    expect(post.email_segment).toBe(stubPost.email_segment);
    expect(post.url).toBe(stubPost.url);
    expect(post.excerpt).toBe(stubPost.excerpt);
    expect(post.og_image).toBe(stubPost.og_image);
    expect(post.og_title).toBe(stubPost.og_title);
    expect(post.og_description).toBe(stubPost.og_description);
    expect(post.twitter_image).toBe(stubPost.twitter_image);
    expect(post.twitter_title).toBe(stubPost.twitter_title);
    expect(post.twitter_description).toBe(stubPost.twitter_description);
    expect(post.meta_title).toBe(stubPost.meta_title);
    expect(post.meta_description).toBe(stubPost.meta_description);
    expect(post.email_subject).toBe(stubPost.email_subject);
    expect(post.frontmatter).toBe(stubPost.frontmatter);
    expect(post.feature_image_alt).toBe(stubPost.feature_image_alt);
    expect(post.feature_image_caption).toBe(stubPost.feature_image_caption);
    expect(post.email_only).toBe(stubPost.email_only);

    // relationship fields
    expect(post.tags).toStrictEqual(stubPost.tags);

    // Author
    const postAuthor = post.authors[0];
    const stubPostAuthors = stubPost.authors[0];
    expect(postAuthor.id).toBe(stubPostAuthors.id);
    expect(postAuthor.slug).toBe(stubPostAuthors.slug);
    expect(postAuthor.name).toBe(stubPostAuthors.name);
    expect(postAuthor.profile_image).toBe(stubPostAuthors.profile_image);
    expect(postAuthor.cover_image).toBe(stubPostAuthors.cover_image);
    expect(postAuthor.bio).toBe(stubPostAuthors.bio);
    expect(postAuthor.website).toBe(stubPostAuthors.website);
    expect(postAuthor.location).toBe(stubPostAuthors.location);
    expect(postAuthor.facebook).toBe(stubPostAuthors.facebook);
    expect(postAuthor.twitter).toBe(stubPostAuthors.twitter);
    expect(postAuthor.meta_title).toBe(stubPostAuthors.meta_title);
    expect(postAuthor.meta_description).toBe(stubPostAuthors.meta_description);
    expect(postAuthor.url).toBe(stubPostAuthors.url);
    expect(postAuthor.created_at).toBeDefined();
    expect(postAuthor.updated_at).toBeDefined();
    expect(postAuthor.email).toBe(stubPostAuthors.email);
    expect(postAuthor.accessibility).toBeDefined();
    expect(postAuthor.roles).toStrictEqual(stubPostAuthors.roles);

    // Tiers
    assert(Array.isArray(post.tiers));
    const postTier = post.tiers[0];
    const stubPostTier = stubPost.tiers[0];
    expect(postTier.id).toBe(stubPostTier.id);
    expect(postTier.name).toBe(stubPostTier.name);
    expect(postTier.slug).toBe(stubPostTier.slug);
    expect(postTier.visibility).toBe(stubPostTier.visibility);
    expect(postTier.trial_days).toBe(stubPostTier.trial_days);
    expect(postTier.type).toBe(stubPostTier.type);
    expect(postTier.currency).toBe(stubPostTier.currency);
    expect(postTier.description).toBe(stubPostTier.description);
    expect(postTier.currency).toBe(stubPostTier.currency);
    expect(postTier.monthly_price).toBe(stubPostTier.monthly_price);
    expect(postTier.monthly_price_id).toBe(stubPostTier.monthly_price_id);
    expect(postTier.yearly_price).toBe(stubPostTier.yearly_price);
    expect(postTier.yearly_price_id).toBe(stubPostTier.yearly_price_id);

    // Primary author

    expect(post.primary_author.id).toBe(stubPost.primary_author.id);
    expect(post.primary_author.slug).toBe(stubPost.primary_author.slug);
    expect(post.primary_author.name).toBe(stubPost.primary_author.name);
    expect(post.primary_author.profile_image).toBe(stubPost.primary_author.profile_image);
    expect(post.primary_author.cover_image).toBe(stubPost.primary_author.cover_image);
    expect(post.primary_author.bio).toBe(stubPost.primary_author.bio);
    expect(post.primary_author.website).toBe(stubPost.primary_author.website);
    expect(post.primary_author.location).toBe(stubPost.primary_author.location);
    expect(post.primary_author.facebook).toBe(stubPost.primary_author.facebook);
    expect(post.primary_author.twitter).toBe(stubPost.primary_author.twitter);
    expect(post.primary_author.meta_title).toBe(stubPost.primary_author.meta_title);
    expect(post.primary_author.meta_description).toBe(stubPost.primary_author.meta_description);
    expect(post.primary_author.url).toBe(stubPost.primary_author.url);
    expect(post.primary_author.created_at).toBeDefined();
    expect(post.primary_author.updated_at).toBeDefined();
    expect(post.primary_author.email).toBe(stubPost.primary_author.email);
    expect(post.primary_author.accessibility).toBeDefined();
    expect(post.primary_author.roles).toStrictEqual(stubPost.primary_author.roles);

    expect(post.count).toStrictEqual(stubPost.count);
    expect(post.primary_tag).toStrictEqual(stubPost.primary_tag);
    expect(post.email).toStrictEqual(stubPost.email);
    expect(post.newsletter).toStrictEqual(stubPost.newsletter);
  });

  test("posts mutations add, edit, delete", async () => {
    expect(api.posts).toBeDefined();

    const title = faker.hacker.phrase();

    const postAdd = await api.posts.add({
      title: title,
      html: "<p>Hello from ts-ghost</p>",
      tags: [{ name: "ts-ghost" }],
      tiers: [{ name: "ts-ghost" }],
      custom_excerpt: "This is custom excerpt from ts-ghost",
      meta_title: "Meta Title from ts-ghost",
      meta_description: "Description from ts-ghost",
      featured: true,
      og_title: "OG Title from ts-ghost",
      og_description: "OG Description from ts-ghost",
      twitter_title: "Twitter Title from ts-ghost",
      twitter_description: "Twitter Description from ts-ghost",
      visibility: "public",
    });
    assert(postAdd.success);
    const newPost = postAdd.data;
    expect(newPost.title).toBe(title);
    expect(newPost.slug).toBeDefined();
    expect(newPost.custom_excerpt).toBe("This is custom excerpt from ts-ghost");
    expect(newPost.meta_title).toBe("Meta Title from ts-ghost");
    expect(newPost.meta_description).toBe("Description from ts-ghost");
    expect(newPost.featured).toBe(true);
    expect(newPost.og_title).toBe("OG Title from ts-ghost");
    expect(newPost.og_description).toBe("OG Description from ts-ghost");
    expect(newPost.twitter_title).toBe("Twitter Title from ts-ghost");
    expect(newPost.twitter_description).toBe("Twitter Description from ts-ghost");
    expect(newPost.visibility).toBe("public");
    expect(newPost.tags && newPost.tags[0].name).toBe("ts-ghost");

    const postEdit = await api.posts.edit(newPost.id, {
      custom_excerpt: "Modified excerpt from ghost",
      updated_at: new Date(newPost.updated_at || ""),
    });

    assert(postEdit.success);
    const editedPost = postEdit.data;
    expect(editedPost.custom_excerpt).toBe("Modified excerpt from ghost");

    const postDelete = await api.posts.delete(editedPost.id);
    assert(postDelete.success);
  });

  test("posts api with bad key", async () => {
    const api = new TSGhostAdminAPI(
      process.env.VITE_GHOST_URL!,
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v5.0"
    );
    expect(api.posts).toBeDefined();
    const result = await api.posts
      .browse({
        limit: 1,
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(!result.success);
    expect(result.errors[0].message).toBe("Unknown Admin API Key");
    const resultR = await api.posts
      .read({
        slug: "coming-soon",
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(!resultR.success);
    expect(resultR.errors[0].message).toBe("Unknown Admin API Key");
  });

  test("posts api with wrong url", async () => {
    const api = new TSGhostAdminAPI(
      "https://codingdodoes.com",
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8",
      "v5.0"
    );
    expect(api.posts).toBeDefined();
    const result = await api.posts
      .browse({
        limit: 1,
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(!result.success);
    expect(result.errors[0].message).toContain("fetch");
    const resultR = await api.posts
      .read({
        slug: "coming-soon",
      })
      .formats({ html: true, plaintext: true })
      .fetch();
    assert(!resultR.success);
    expect(resultR.errors[0].message).toContain("fetch");
  });
});
