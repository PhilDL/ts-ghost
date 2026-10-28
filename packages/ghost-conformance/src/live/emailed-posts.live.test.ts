import { describe, expect } from "vitest";

import { EMAIL_SEED } from "../seeds/emails.ts";
import { assertOk, liveTest } from "./live-test.ts";

const { failed, submitted } = EMAIL_SEED.posts;

// Unknown keys of a post's email and newsletter are checked in posts.live.test.ts.
describe("emailed posts", () => {
  // Expected failure: core email schema requires `from`, `source` and `updated_at`; Ghost sends null.
  liveTest.fails("a post whose email has a null from and source parses", async ({ api }) => {
    const result = await api.posts.read({ slug: failed }).fetch();
    assertOk(result);
    expect(result.data.email).toMatchObject({ status: "failed", from: null, source: null, reply_to: null });
    expect(result.data.newsletter).toBeNull();
  });

  liveTest(
    "a post with a fully sent email parses with its email and newsletter",
    async ({ api, responses }) => {
      const result = await api.posts.read({ slug: submitted }).fetch();
      assertOk(result);
      expect(result.data.email).toMatchObject({
        status: "submitted",
        from: EMAIL_SEED.from,
        reply_to: EMAIL_SEED.replyTo,
        error: null,
      });
      expect(result.data.email?.source).toContain('"root"');
      const raw = responses.last("/posts/") as { posts: { email: { newsletter_id: string } }[] };
      expect(result.data.newsletter?.id).toBe(raw.posts[0]?.email.newsletter_id);
    },
  );

  liveTest("reading the emailed post by id equals reading it by slug", async ({ api }) => {
    const bySlug = await api.posts.read({ slug: submitted }).fetch();
    assertOk(bySlug);
    const byId = await api.posts.read({ id: bySlug.data.id }).fetch();
    assertOk(byId);
    // A public post lists every paid tier, and other test files add tiers in parallel.
    const withoutTiers = ({ tiers: _, ...post }: typeof byId.data) => post;
    expect(withoutTiers(byId.data)).toEqual(withoutTiers(bySlug.data));
  });

  // Expected failure: the failed email's null `from`/`source`/`updated_at` break the whole browse.
  liveTest.fails("browse returns both emailed posts with their email status", async ({ api }) => {
    const result = await api.posts.browse({ filter: `slug:[${failed},${submitted}]` }).fetch();
    assertOk(result);
    expect(result.data.map((post) => post.email?.status).sort()).toEqual(["failed", "submitted"]);
  });
});
