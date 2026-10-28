import { beforeAll, describe, expect } from "vitest";

import { fullTagInput, seedTags } from "../seeds/tags.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./ghost.ts";

describe("tags", () => {
  let seeded: Awaited<ReturnType<typeof seedTags>>;
  beforeAll(async () => {
    seeded = await seedTags();
  });

  liveTest(
    "GET /tags/?include=count.posts returns real post counts and the same tags as a plain browse",
    async ({ api, responses }) => {
      // Filtered to the seed, since other test files add tags concurrently.
      const filter: `slug:[${string}]` = `slug:[${seeded.full.slug},${seeded.bare.slug}]`;
      const plain = await api.tags.browse({ limit: "all", filter }).fetch();
      const counted = await api.tags
        .browse({ limit: "all", filter })
        .include({ "count.posts": true })
        .fetch();
      assertOk(plain);
      assertOk(counted);

      expect(plain.data).toHaveLength(2);
      expect(counted.data.map((t) => t.slug)).toEqual(plain.data.map((t) => t.slug));
      for (const tag of [seeded.full, seeded.bare]) {
        expect(counted.data.find((t) => t.id === tag.id)?.count?.posts).toBe(seeded.postsPerTag);
      }
      const raw = responses.last("/tags/") as { tags: unknown };
      expect(unknownKeys(raw.tags, counted.data, { at: "tags" })).toEqual([]);
    },
  );

  liveTest(
    "GET /tags/:id/ and /tags/slug/:slug/ return the same tag, with null and set fields",
    async ({ api, responses }) => {
      for (const tag of [seeded.full, seeded.bare]) {
        const byId = await api.tags.read({ id: tag.id }).fetch();
        const raw = responses.last(`/tags/${tag.id}/`) as { tags: unknown[] };
        const bySlug = await api.tags.read({ slug: tag.slug }).fetch();
        assertOk(byId);
        assertOk(bySlug);

        expect(bySlug.data).toEqual(byId.data);
        expect(unknownKeys(raw.tags[0], byId.data, { at: "tag" })).toEqual([]);
      }
      expect(seeded.bare.description).toBeNull();
      expect(seeded.full.description).not.toBeNull();
    },
  );

  liveTest("POST /tags/ stores every field it was sent", async ({ api, responses }) => {
    const input = fullTagInput(uniqueSuffix());
    const added = await api.tags.add(input);
    assertOk(added);
    const raw = responses.last("/tags/") as { tags: unknown[] };
    expect(unknownKeys(raw.tags[0], added.data, { at: "tag" })).toEqual([]);

    const read = await api.tags.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(input);
  });

  liveTest("PUT /tags/:id/ persists the edit", async ({ api, responses }) => {
    const added = await api.tags.add({ name: `Edit me ${uniqueSuffix()}` });
    assertOk(added);

    const edit = { name: `${added.data.name} edited`, description: "Edited description" };
    const edited = await api.tags.edit(added.data.id, edit);
    assertOk(edited);
    const raw = responses.last(`/tags/${added.data.id}/`) as { tags: unknown[] };
    expect(unknownKeys(raw.tags[0], edited.data, { at: "tag" })).toEqual([]);

    const read = await api.tags.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(edit);
  });

  liveTest("DELETE /tags/:id/ removes the tag", async ({ api }) => {
    const added = await api.tags.add({ name: `Delete me ${uniqueSuffix()}` });
    assertOk(added);

    expect(await api.tags.delete(added.data.id)).toEqual({ success: true });
    const read = await api.tags.read({ id: added.data.id }).fetch();
    expect(read.success).toBe(false);
  });
});
