import { describe, expect, test } from "vitest";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

const { failed, submitted } = EMAIL_SEED.posts;

describe("emailed posts", () => {
  const responses = liveResponses();

  // Expected failure: core email schema requires `from`, `source` and `updated_at`; Ghost sends null.
  test.fails("a post whose email has a null from and source parses", async () => {
    const result = await adminApi().posts.read({ slug: failed }).fetch();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toMatchObject({ status: "failed", from: null, source: null, reply_to: null });
    expect(result.data.newsletter).toBeNull();
  });

  test("a post with a fully sent email parses with its email and newsletter", async () => {
    const result = await adminApi().posts.read({ slug: submitted }).fetch();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toMatchObject({
      status: "submitted",
      from: EMAIL_SEED.from,
      reply_to: EMAIL_SEED.replyTo,
      error: null,
    });
    expect(result.data.email?.source).toContain('"root"');
    const raw = responses.last("/posts/") as { posts: { email: { newsletter_id: string } }[] };
    expect(result.data.newsletter?.id).toBe(raw.posts[0]?.email.newsletter_id);
  });

  test("reading the emailed post by id equals reading it by slug", async () => {
    const bySlug = await adminApi().posts.read({ slug: submitted }).fetch();
    if (!bySlug.success) throw new Error("read by slug failed");
    const byId = await adminApi().posts.read({ id: bySlug.data.id }).fetch();
    expect(byId).toEqual(bySlug);
  });

  // Expected failure: the failed email's null `from`/`source`/`updated_at` break the whole browse.
  test.fails("browse returns both emailed posts with their email status", async () => {
    const result = await adminApi()
      .posts.browse({ filter: `slug:[${failed},${submitted}]` })
      .fetch();
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.map((post) => post.email?.status).sort()).toEqual(["failed", "submitted"]);
  });

  // Expected failure: core email schema lacks csd_email_count, feedback_enabled, newsletter_id, post_id,
  // source_type and track_clicks.
  test.fails("an emailed post's email carries no key the client's schema lacks", async () => {
    const result = await adminApi().posts.read({ slug: submitted }).fetch();
    if (!result.success) throw new Error("read failed");
    const raw = responses.last("/posts/") as { posts: { email: unknown }[] };
    expect(unknownKeys(raw.posts[0]!.email, result.data.email, { at: "post.email" })).toEqual([]);
  });

  // Expected failure: the post newsletter schema lacks feedback_enabled, show_* flags and more.
  test.fails("an emailed post's newsletter carries no key the client's schema lacks", async () => {
    const result = await adminApi().posts.read({ slug: submitted }).fetch();
    if (!result.success) throw new Error("read failed");
    const raw = responses.last("/posts/") as { posts: { newsletter: unknown }[] };
    const post = raw.posts[0]!;
    expect(unknownKeys(post.newsletter, result.data.newsletter, { at: "post.newsletter" })).toEqual([]);
  });
});
