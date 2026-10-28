import { assert, beforeAll, describe, expect, inject, test } from "vitest";

import { FULL_HTML, fullScalars, seedPages } from "../seeds/posts-and-pages.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeysOfResponses } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

let seed: Awaited<ReturnType<typeof seedPages>>;
beforeAll(async () => {
  seed = await seedPages(adminApi());
});

describe("pages", () => {
  liveResponses();

  test("browse returns the seeded pages", async () => {
    const result = await adminApi().pages.browse({ limit: "all" }).fetch();

    assert(result.success);
    const byId = new Map(result.data.map((page) => [page.id, page]));
    expect(byId.get(seed.full.id)?.status).toBe("published");
    expect(byId.get(seed.bare.id)?.status).toBe("draft");
  });

  test("browse with authors, tags and tiers included populates every relation", async () => {
    const result = await adminApi()
      .pages.browse({ limit: "all" })
      .include({ authors: true, tags: true, tiers: true })
      .fetch();

    assert(result.success);
    expect(result.data.every((page) => page.authors.length > 0)).toBe(true);
    const full = result.data.find((page) => page.id === seed.full.id);
    expect(full?.tags?.map((tag) => tag.name)).toEqual([`Page tag ${seed.suffix}`]);
    expect(full?.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(full?.primary_tag?.name).toBe(`Page tag ${seed.suffix}`);
  });

  test("browse with the html format returns content", async () => {
    const result = await adminApi().pages.browse({ limit: "all" }).formats({ html: true }).fetch();

    assert(result.success);
    expect(result.data.find((page) => page.id === seed.full.id)?.html).toBe(FULL_HTML);
  });

  // Expected failure: formats({ plaintext }) makes plaintext required, but Ghost omits it on empty pages.
  test.fails("browse with the plaintext format returns content", async () => {
    const result = await adminApi().pages.browse({ limit: "all" }).formats({ plaintext: true }).fetch();

    assert(result.success);
    expect(result.data.find((page) => page.id === seed.full.id)?.plaintext).toBe("Hello world");
  });

  test("read with the plaintext format returns content", async () => {
    const result = await adminApi().pages.read({ id: seed.full.id }).formats({ plaintext: true }).fetch();

    assert(result.success);
    expect(result.data.plaintext).toBe("Hello world");
  });

  test("read by slug equals read by id", async () => {
    const byId = await adminApi().pages.read({ id: seed.full.id }).fetch();
    const bySlug = await adminApi().pages.read({ slug: seed.full.slug }).fetch();

    assert(byId.success && bySlug.success);
    expect(byId.data.id).toBe(seed.full.id);
    expect(bySlug.data).toEqual(byId.data);
  });

  test("nullable fields come back null on a bare page and set on a full page", async () => {
    const bare = await adminApi().pages.read({ id: seed.bare.id }).fetch();
    const full = await adminApi().pages.read({ id: seed.full.id }).fetch();

    assert(bare.success && full.success);
    for (const key of NULLABLE) {
      expect.soft(bare.data[key], `bare ${key}`).toBeNull();
      expect.soft(full.data[key], `full ${key}`).not.toBeNull();
    }
  });

  test("add reads back every value sent", async () => {
    const suffix = uniqueSuffix();
    const owner = inject("ghost").owner.email;
    const added = await adminApi().pages.add(
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
    assert(added.success);

    const read = await adminApi().pages.read({ id: added.data.id }).formats({ html: true }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), visibility: "tiers" });
    expect(read.data.tiers?.map((tier) => tier.id)).toEqual([seed.tierId]);
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Added tag ${suffix}`]);
    expect(read.data.authors.map((author) => author.email)).toEqual([owner]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  // Expected failure: pages have no locale in Ghost; the client's input accepts one that Ghost drops.
  test.fails("add reads back locale", async () => {
    const added = await adminApi().pages.add({ title: `Locale ${uniqueSuffix()}`, locale: "de" });
    assert(added.success);

    const read = await adminApi().pages.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({ locale: "de" });
  });

  test("edit persists every value sent", async () => {
    const suffix = uniqueSuffix();
    const added = await adminApi().pages.add({ title: `To edit ${suffix}` });
    assert(added.success);

    const edited = await adminApi().pages.edit(
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
    assert(edited.success);

    const read = await adminApi().pages.read({ id: added.data.id }).formats({ html: true }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({ ...fullScalars(suffix), visibility: "members" });
    expect(read.data.tags?.map((tag) => tag.name)).toEqual([`Edited tag ${suffix}`]);
    expect(read.data.html).toBe(FULL_HTML);
  });

  test("delete removes the page", async () => {
    const added = await adminApi().pages.add({ title: `To delete ${uniqueSuffix()}` });
    assert(added.success);

    expect(await adminApi().pages.delete(added.data.id)).toEqual({ success: true });
    const read = await adminApi().pages.read({ id: added.data.id }).fetch();
    expect(read.success).toBe(false);
  });
});

describe("pages: unknown keys", () => {
  const responses = liveResponses();
  const unknownAfterEveryOperation = async () => {
    const api = adminApi();
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
    assert(browsed.success && read.success && added.success);
    const edited = await api.pages.edit(added.data.id, {
      title: "Edited",
      updated_at: new Date(added.data.updated_at ?? ""),
    });
    assert(edited.success);
    return unknownKeysOfResponses(responses.all());
  };
  const isAuthorKey = (k: string) => /^pages\[\]\.(authors\[\]|primary_author)\./.test(k);

  // Expected failure: the author schema lacks Ghost 6.72's socials, tour and notification flags.
  test.fails("authors carry no key the client's schema lacks", async () => {
    expect((await unknownAfterEveryOperation()).filter(isAuthorKey)).toEqual([]);
  });

  // Expected failure: the pages schema lacks show_title_and_feature_image.
  test.fails("pages carry no key the client's schema lacks", async () => {
    expect((await unknownAfterEveryOperation()).filter((k) => !isAuthorKey(k))).toEqual([]);
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
