import { assert, describe, expect, test } from "vitest";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { adminApi, liveResponses } from "./ghost.ts";

const { failed, submitted } = EMAIL_SEED.posts;

// Unknown keys of a post's email and newsletter are checked in posts.live.test.ts.
describe("emailed posts", () => {
  const responses = liveResponses();

  // Expected failure: core email schema requires `from`, `source` and `updated_at`; Ghost sends null.
  test.fails("a post whose email has a null from and source parses", async () => {
    const result = await adminApi().posts.read({ slug: failed }).fetch();
    assert(result.success);
    expect(result.data.email).toMatchObject({ status: "failed", from: null, source: null, reply_to: null });
    expect(result.data.newsletter).toBeNull();
  });

  test("a post with a fully sent email parses with its email and newsletter", async () => {
    const result = await adminApi().posts.read({ slug: submitted }).fetch();
    assert(result.success);
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
    assert(bySlug.success);
    const byId = await adminApi().posts.read({ id: bySlug.data.id }).fetch();
    expect(byId).toEqual(bySlug);
  });

  // Expected failure: the failed email's null `from`/`source`/`updated_at` break the whole browse.
  test.fails("browse returns both emailed posts with their email status", async () => {
    const result = await adminApi()
      .posts.browse({ filter: `slug:[${failed},${submitted}]` })
      .fetch();
    assert(result.success);
    expect(result.data.map((post) => post.email?.status).sort()).toEqual(["failed", "submitted"]);
  });
});
