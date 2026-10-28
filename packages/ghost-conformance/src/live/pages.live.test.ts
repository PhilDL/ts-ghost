import { beforeAll, describe, expect, inject } from "vitest";

import { FULL_HTML, fullScalars, seedPages } from "../seeds/posts-and-pages.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeysOfResponses } from "../unknown-keys.ts";
import { adminApi } from "./ghost.ts";
import { assertOk, liveTest, type LiveContext } from "./live-test.ts";

let seed: Awaited<ReturnType<typeof seedPages>>;
beforeAll(async () => {
  seed = await seedPages(adminApi());
});

describe("pages", () => {
  liveTest("browse returns the seeded pages", async ({ api }) => {
    const result = await api.pages.browse({ limit: "all" }).fetch();

    assertOk(result);
    const byId = new Map(result.data.map((page) => [page.id, page]));
    expect(byId.get(seed.full.id)?.status).toBe("published");
    expect(byId.get(seed.bare.id)?.status).toBe("draft");
  });

  liveTest("browse with authors, tags and tiers included populates every relation", async ({ api }) => {
    const result = await api.pages
      .browse({ limit: "all" })
      .include({ authors: true, tags: true, tiers: true })
      .fetch();

    assertOk(result);
    expect(result.data.every((page) => page.authors.length > 0)).toBe(true);
    const full = result.data.find((page) => page.id === seed.full.id);
    expect(full?.tags?.map((tag) => tag.name)).toEqual([`Page tag ${seed.suffix}`]);
    expect(full?.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(full?.primary_tag?.name).toBe(`Page tag ${seed.suffix}`);
  });

  liveTest("browse with the html format returns content", async ({ api }) => {
    const result = await api.pages.browse({ limit: "all" }).formats({ html: true }).fetch();

    assertOk(result);
    expect(result.data.find((page) => page.id === seed.full.id)?.html).toBe(FULL_HTML);
  });

  // Expected failure: formats({ plaintext }) makes plaintext required, but Ghost omits it on empty pages.
  liveTest.fails("browse with the plaintext format returns content", async ({ api }) => {
    const result = await api.pages.browse({ limit: "all" }).formats({ plaintext: true }).fetch();

    assertOk(result);
    expect(result.data.find((page) => page.id === seed.full.id)?.plaintext).toBe("Hello world");
  });

  liveTest("read with the plaintext format returns content", async ({ api }) => {
    const result = await api.pages.read({ id: seed.full.id }).formats({ plaintext: true }).fetch();

    assertOk(result);
    expect(result.data.plaintext).toBe("Hello world");
  });

  liveTest("read by slug equals read by id", async ({ api }) => {
    const byId = await api.pages.read({ id: seed.full.id }).fetch();
    const bySlug = await api.pages.read({ slug: seed.full.slug }).fetch();

    assertOk(byId);

    assertOk(bySlug);
    expect(byId.data.id).toBe(seed.full.id);
    expect(bySlug.data).toEqual(byId.data);
  });

  liveTest("nullable fields come back null on a bare page and set on a full page", async ({ api }) => {
    const bare = await api.pages.read({ id: seed.bare.id }).fetch();
    const full = await api.pages.read({ id: seed.full.id }).fetch();

    assertOk(bare);

    assertOk(full);
    for (const key of NULLABLE) {
      expect.soft(bare.data[key], `bare ${key}`).toBeNull();
      expect.soft(full.data[key], `full ${key}`).not.toBeNull();
    }
  });

  liveTest("add reads back every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const owner = inject("ghost").owner.email;
    const added = await api.pages.add(
      {
        ...fullScalars(suffix),
        visibility: "tiers",
        tiers: [{ id: seed.tierId }],
        tags: [{ name: `Added tag ${suffix}` }],
        authors: [{ email: owner }],
        html: FULL_HTML,
      },
      { source: "html" },
    );
    assertOk(added);

    const read = await api.pages.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), visibility: "tiers" });
    expect(read.data.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Added tag ${suffix}`]);
    expect(read.data.authors.map((author) => author.email)).toEqual([owner]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  // Expected failure: pages have no locale in Ghost; the client's input accepts one that Ghost drops.
  liveTest.fails("add reads back locale", async ({ api }) => {
    const added = await api.pages.add({ title: `Locale ${uniqueSuffix()}`, locale: "de" });
    assertOk(added);

    const read = await api.pages.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ locale: "de" });
  });

  liveTest("edit persists every value sent", async ({ api }) => {
    const suffix = uniqueSuffix();
    const added = await api.pages.add({ title: `To edit ${suffix}` });
    assertOk(added);

    const edited = await api.pages.edit(
      added.data.id,
      {
        ...fullScalars(suffix),
        visibility: "members",
        tags: [{ name: `Edited tag ${suffix}` }],
        html: FULL_HTML,
        updated_at: new Date(added.data.updated_at ?? ""),
      },
      { source: "html" },
    );
    assertOk(edited);

    const read = await api.pages.read({ id: added.data.id }).formats({ html: true }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), visibility: "members" });
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Edited tag ${suffix}`]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  liveTest("delete removes the page", async ({ api }) => {
    const added = await api.pages.add({ title: `To delete ${uniqueSuffix()}` });
    assertOk(added);

    expect(await api.pages.delete(added.data.id)).toEqual({ success: true });
    const read = await api.pages.read({ id: added.data.id }).fetch();
    expect(read.success).toBe(false);
  });
});

describe("pages: unknown keys", () => {
  const unknownAfterEveryOperation = async ({ api, responses }: LiveContext) => {
    const browsed = await api.pages
      .browse({ limit: "all" })
      .include({ authors: true, tags: true, tiers: true })
      .formats({ html: true })
      .fetch();
    const read = await api.pages.read({ id: seed.full.id }).fetch();
    const added = await api.pages.add({
      title: `Unknown keys ${uniqueSuffix()}`,
      tags: [{ name: "Unknown keys" }],
    });
    assertOk(browsed);
    assertOk(read);
    assertOk(added);
    const edited = await api.pages.edit(added.data.id, {
      title: "Edited",
      updated_at: new Date(added.data.updated_at ?? ""),
    });
    assertOk(edited);
    return unknownKeysOfResponses(responses.all());
  };
  const isAuthorKey = (k: string) => /^pages\[\]\.(authors\[\]|primary_author)\./.test(k);

  // Expected failure: the author schema lacks Ghost 6.72's socials, tour and notification flags.
  liveTest.fails("authors carry no key the client's schema lacks", async (context) => {
    expect((await unknownAfterEveryOperation(context)).filter(isAuthorKey)).toEqual([]);
  });

  // Expected failure: the pages schema lacks show_title_and_feature_image.
  liveTest.fails("pages carry no key the client's schema lacks", async (context) => {
    expect((await unknownAfterEveryOperation(context)).filter((k) => !isAuthorKey(k))).toEqual([]);
  });
});

// Every nullable field a page output has that the client's inputs can set.
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
  "primary_tag",
  "excerpt",
] as const;
