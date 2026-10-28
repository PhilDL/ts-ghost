import { beforeAll, describe, expect, inject, onTestFinished } from "vitest";

import { FULL_HTML, fullScalars, seedPosts, seedPostWithInactiveAuthor } from "../seeds/posts-and-pages.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeysOfResponses } from "../unknown-keys.ts";
import { adminApi } from "./ghost.ts";
import { assertOk, liveTest } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedPosts>>;
beforeAll(async () => {
  seed = await seedPosts(adminApi());
});

// Scoped to this file's seed: the SQL email seed adds posts whose email the client can't parse.
const seededOnly = (): `id:[${string}]` =>
  `id:[${[seed.full, seed.bare, seed.scheduled, seed.paid, seed.emailed].map((p) => p.id).join(",")}]`;

describe("posts", () => {
  liveTest("browse returns every status and a paid post", async ({ api }) => {
    const result = await api.posts.browse({ limit: "all", filter: seededOnly() }).fetch();

    assertOk(result);
    const byId = new Map(result.data.map((post) => [post.id, post]));
    expect(byId.get(seed.full.id)?.status).toBe("published");
    expect(byId.get(seed.bare.id)?.status).toBe("draft");
    expect(byId.get(seed.scheduled.id)?.status).toBe("scheduled");
    expect(byId.get(seed.paid.id)?.visibility).toBe("paid");
  });

  liveTest("browse with authors, tags and tiers included populates every relation", async ({ api }) => {
    const result = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .include({ authors: true, tags: true, tiers: true })
      .fetch();

    assertOk(result);
    expect(result.data.every((post) => post.authors.length > 0)).toBe(true);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.tags?.map((tag) => tag.name)).toEqual([`Post tag ${seed.suffix}`]);
    expect(full?.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(full?.primary_tag?.name).toBe(`Post tag ${seed.suffix}`);
  });

  liveTest("browse with the html format returns content", async ({ api }) => {
    const result = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .formats({ html: true })
      .fetch();

    assertOk(result);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.html).toBe("<p>Hello <strong>world</strong></p>");
  });

  // Expected failure: formats({ plaintext }) makes plaintext required, but Ghost omits it on empty posts.
  liveTest.fails("browse with the plaintext format returns content", async ({ api }) => {
    const result = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .formats({ plaintext: true })
      .fetch();

    assertOk(result);
    const full = result.data.find((post) => post.id === seed.full.id);
    expect(full?.plaintext).toBe("Hello world");
  });

  liveTest("read with the plaintext format returns content", async ({ api }) => {
    const result = await api.posts.read({ id: seed.full.id }).formats({ plaintext: true }).fetch();

    assertOk(result);
    expect(result.data.plaintext).toBe("Hello world");
  });

  liveTest("read by slug equals read by id", async ({ api }) => {
    const byId = await api.posts.read({ id: seed.full.id }).fetch();
    const bySlug = await api.posts.read({ slug: seed.full.slug }).fetch();

    assertOk(byId);

    assertOk(bySlug);
    expect(byId.data.id).toBe(seed.full.id);
    expect(bySlug.data).toEqual(byId.data);
  });

  liveTest("nullable fields come back null on a bare post and set on a full post", async ({ api }) => {
    const bare = await api.posts.read({ id: seed.bare.id }).fetch();
    const full = await api.posts.read({ id: seed.full.id }).fetch();

    assertOk(bare);

    assertOk(full);
    for (const key of NULLABLE) {
      expect.soft(bare.data[key], `bare ${key}`).toBeNull();
      expect.soft(full.data[key], `full ${key}`).not.toBeNull();
    }
  });

  liveTest("a post sent as a newsletter reads back its email and newsletter", async ({ api }) => {
    const result = await api.posts.read({ id: seed.emailed.id }).fetch();

    assertOk(result);
    expect(result.data.newsletter?.slug).toBe("default-newsletter");
    expect(result.data.email?.subject).toBe(`Emailed ${seed.suffix}`);
  });

  liveTest("add reads back every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const added = await api.posts.add(
      {
        ...fullScalars(suffix),
        email_subject: "Email subject",
        visibility: "tiers",
        tiers: [{ id: seed.tierId }],
        tags: [{ name: `Added tag ${suffix}` }],
        authors: [{ email: inject("ghost").owner.email }],
        html: FULL_HTML,
      },
      { source: "html" },
    );
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), email_subject: "Email subject" });
    expect(read.data.visibility).toBe("tiers");
    expect(read.data.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Added tag ${suffix}`]);
    expect(read.data.authors.map((author) => author.email)).toEqual([inject("ghost").owner.email]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  liveTest("add reads back a scheduled post's publish date", async ({ api }) => {
    const publishedAt = new Date("2099-01-02T03:04:05.000Z");
    const added = await api.posts.add({
      title: `Scheduled ${uniqueSuffix()}`,
      status: "scheduled",
      published_at: publishedAt,
    });
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ status: "scheduled", published_at: publishedAt.toISOString() });
  });

  // Expected failure: Ghost 6 ignores mobiledoc input and stores lexical only, so it never reads back.
  liveTest.fails("add reads back mobiledoc", async ({ api }) => {
    const added = await api.posts.add({ title: `Mobiledoc ${uniqueSuffix()}`, mobiledoc: MOBILEDOC });
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data.mobiledoc).toBe(MOBILEDOC);
  });

  // Expected failure: posts have no locale in Ghost; the client's input accepts one that Ghost drops.
  liveTest.fails("add reads back locale", async ({ api }) => {
    const added = await api.posts.add({ title: `Locale ${uniqueSuffix()}`, locale: "de" });
    assertOk(added);

    const read = await api.posts.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ locale: "de" });
  });

  liveTest("edit persists every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const added = await api.posts.add({ title: `To edit ${suffix}` });
    assertOk(added);

    const edited = await api.posts.edit(
      added.data.id,
      {
        ...fullScalars(suffix),
        email_subject: "Edited subject",
        visibility: "members",
        tags: [{ name: `Edited tag ${suffix}` }],
        html: FULL_HTML,
        updated_at: new Date(added.data.updated_at ?? ""),
      },
      { source: "html" },
    );
    assertOk(edited);

    const read = await api.posts.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({
      ...fullScalars(suffix),
      email_subject: "Edited subject",
      visibility: "members",
    });
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Edited tag ${suffix}`]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  liveTest("delete removes the post", async ({ api }) => {
    const added = await api.posts.add({ title: `To delete ${uniqueSuffix()}` });
    assertOk(added);

    expect(await api.posts.delete(added.data.id)).toEqual({ success: true });
    const read = await api.posts.read({ id: added.data.id }).fetch();
    expect(read.success).toBe(false);
  });

  // Expected failure: the client's author status allows active, invited and locked, not inactive.
  liveTest.fails("read reports a post's inactive author", async ({ api }) => {
    const { post, remove } = await seedPostWithInactiveAuthor(api);
    onTestFinished(remove);

    const result = await api.posts.read({ id: post.id }).fetch();
    assertOk(result);
    expect(result.data.primary_author.status).toBe("inactive");
    expect(result.data.authors.map((author) => author.status)).toEqual(["inactive"]);
  });
});

describe("posts: unknown keys", () => {
  // Expected failure: the author schema lacks Ghost 6.72's socials, tour and notification flags.
  liveTest.fails("authors carry no key the client's schema lacks", async ({ api, responses }) => {
    const browsed = await api.posts
      .browse({ limit: "all", filter: seededOnly() })
      .include({ authors: true, tags: true, tiers: true })
      .formats({ html: true })
      .fetch();
    const read = await api.posts.read({ id: seed.full.id }).fetch();
    const added = await api.posts.add({ title: `Unknown keys ${uniqueSuffix()}` });
    assertOk(browsed);
    assertOk(read);
    assertOk(added);
    const edited = await api.posts.edit(added.data.id, {
      title: "Edited",
      updated_at: new Date(added.data.updated_at ?? ""),
    });
    assertOk(edited);

    const unknown = unknownKeysOfResponses(responses.all());
    expect(unknown.filter((k) => /^posts\[\]\.(authors\[\]|primary_author)\./.test(k))).toEqual([]);
  });

  // Expected failure: the post email schema lacks csd_email_count, post_id, newsletter_id, source_type and more.
  liveTest.fails(
    "a sent post's email carries no key the client's schema lacks",
    async ({ api, responses }) => {
      assertOk(await api.posts.read({ id: seed.emailed.id }).fetch());
      const unknown = unknownKeysOfResponses(responses.all());
      expect(unknown.filter((k) => k.startsWith("posts[].email."))).toEqual([]);
    },
  );

  // Expected failure: the post newsletter schema lacks its design and feedback fields.
  liveTest.fails(
    "a sent post's newsletter carries no key the client's schema lacks",
    async ({ api, responses }) => {
      assertOk(await api.posts.read({ id: seed.emailed.id }).fetch());
      const unknown = unknownKeysOfResponses(responses.all());
      expect(unknown.filter((k) => k.startsWith("posts[].newsletter."))).toEqual([]);
    },
  );
});

const MOBILEDOC = JSON.stringify({
  version: "0.3.1",
  atoms: [],
  cards: [],
  markups: [],
  sections: [[1, "p", [[0, [], 0, "Hello mobiledoc"]]]],
});

// Every nullable field a post output has that the client's inputs can set.
const NULLABLE = [
  "feature_image",
  "feature_image_alt",
  "feature_image_caption",
  "custom_excerpt",
  "codeinjection_head",
  "codeinjection_foot",
  "og_image",
  "og_title",
  "og_description",
  "twitter_image",
  "twitter_title",
  "twitter_description",
  "meta_title",
  "meta_description",
  "custom_template",
  "canonical_url",
  "published_at",
  "email_subject",
  "primary_tag",
  "excerpt",
] as const;
