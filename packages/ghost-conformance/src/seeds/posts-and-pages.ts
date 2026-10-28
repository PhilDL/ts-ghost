import { inject } from "vitest";
import type { TSGhostAdminAPI } from "@ts-ghost/admin-api";

import { must } from "./seed-result.ts";
import { sessionRequest } from "./session.ts";
import { ghostId, insert, mysqlExec, raw } from "./sql.ts";
import { uniqueSuffix } from "./unique-suffix.ts";

/** Every scalar a post and a page share, set, so each nullable output field comes back non-null. */
export function fullScalars(suffix: string) {
  return {
    title: `Full ${suffix}`,
    slug: `full-${suffix}`,
    feature_image: "https://example.com/feature.png",
    feature_image_alt: "Feature alt",
    feature_image_caption: "Feature caption",
    featured: true,
    status: "published",
    meta_title: "Meta title",
    meta_description: "Meta description",
    custom_excerpt: "Custom excerpt",
    codeinjection_head: "<style>.head{}</style>",
    codeinjection_foot: "<script>void 0</script>",
    og_image: "https://example.com/og.png",
    og_title: "OG title",
    og_description: "OG description",
    twitter_image: "https://example.com/twitter.png",
    twitter_title: "Twitter title",
    twitter_description: "Twitter description",
    custom_template: "custom-full",
    canonical_url: "https://example.com/canonical",
  } as const;
}

/** Body that lexical's html source turns into the content the formats checks look for. */
export const FULL_HTML = "<p>Hello <strong>world</strong></p>";

/** The free and paid tiers every fresh Ghost has; the paid one fills `tiers` on tier-gated content. */
export async function paidTierId(api: TSGhostAdminAPI): Promise<string> {
  const tiers = await api.tiers.browse().fetch();
  const paid = tiers.success ? tiers.data.find((tier) => tier.type === "paid") : undefined;
  if (!paid) throw new Error("Fresh Ghost has no paid tier");
  return paid.id;
}

/**
 * Seeds posts through the client: a full one (every optional field, tags, tiers), a bare draft
 * (every nullable field null), a scheduled one, a paid one and one sent as a newsletter.
 */
export async function seedPosts(api: TSGhostAdminAPI) {
  const suffix = uniqueSuffix();
  const tierId = await paidTierId(api);
  const full = must(
    await api.posts.add(
      {
        ...fullScalars(suffix),
        email_subject: "Email subject",
        visibility: "tiers",
        tiers: [{ id: tierId }],
        tags: [{ name: `Post tag ${suffix}` }],
        html: FULL_HTML,
      },
      { source: "html" },
    ),
    "full post",
  );
  const bare = must(await api.posts.add({ title: `Bare ${suffix}` }), "bare post");
  const scheduled = must(
    await api.posts.add({
      title: `Scheduled ${suffix}`,
      status: "scheduled",
      published_at: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    }),
    "scheduled post",
  );
  const paid = must(
    await api.posts.add({ title: `Paid ${suffix}`, status: "published", visibility: "paid" }),
    "paid post",
  );
  const draft = must(await api.posts.add({ title: `Emailed ${suffix}` }), "emailed post");
  // Publishing with a newsletter creates the post's email; with no members it is never delivered.
  const emailed = must(
    await api.posts.edit(
      draft.id,
      { status: "published", updated_at: new Date(draft.updated_at ?? "") },
      { newsletter: "default-newsletter" },
    ),
    "send emailed post",
  );
  return { suffix, tierId, full, bare, scheduled, paid, emailed };
}

/** Seeds pages through the client: a full one (every optional field, tags, tiers) and a bare draft. */
export async function seedPages(api: TSGhostAdminAPI) {
  const suffix = uniqueSuffix();
  const tierId = await paidTierId(api);
  const full = must(
    await api.pages.add(
      {
        ...fullScalars(suffix),
        visibility: "tiers",
        tiers: [{ id: tierId }],
        tags: [{ name: `Page tag ${suffix}` }],
        html: FULL_HTML,
      },
      { source: "html" },
    ),
    "full page",
  );
  const bare = must(await api.pages.add({ title: `Bare ${suffix}` }), "bare page");
  return { suffix, tierId, full, bare };
}

/**
 * Adds a staff user as a post's author, then suspends the user, so the post keeps an inactive author.
 * The API can't create staff users without an emailed invite, so only that row comes from SQL.
 */
export async function seedPostWithInactiveAuthor(api: TSGhostAdminAPI) {
  const suffix = uniqueSuffix();
  const email = `author-${suffix}@conformance.test`;
  const userId = ghostId();
  const ghost = inject("ghost");
  await mysqlExec(ghost.composeProject, [
    insert("users", [
      {
        id: userId,
        name: `Author ${suffix}`,
        slug: `author-${suffix}`,
        password: "!",
        email,
        status: "active",
        created_at: raw("NOW()"),
      },
    ]),
    insert("roles_users", [
      { id: ghostId(), role_id: raw("(SELECT id FROM roles WHERE name = 'Author')"), user_id: userId },
    ]),
  ]);
  const post = must(
    await api.posts.add({ title: `By author ${suffix}`, authors: [{ email }] }),
    "post by the author",
  );
  // Editing and deleting users are staff actions the client doesn't offer.
  await sessionRequest(ghost, "PUT", `/users/${userId}/`, { users: [{ status: "inactive" }] });
  // The client can't parse inactive authors yet, so other tests must never see this post or user.
  const remove = async () => {
    await api.posts.delete(post.id);
    await sessionRequest(ghost, "DELETE", `/users/${userId}/`);
  };
  return { post, remove };
}
