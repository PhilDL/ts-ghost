import { beforeAll, describe, expect } from "vitest";

import { fullTagInput, seedTags } from "../seeds/tags.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeysOfResponses } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("tags", () => {
  let seeded: Awaited<ReturnType<typeof seedTags>>;
  beforeAll(async () => {
    seeded = await seedTags();
  });

  liveTest(
    "GET /tags/?include=count.posts returns real post counts and the same tags as a plain browse",
    async ({ api }) => {
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
    },
  );

  liveTest.for([
    { which: "full", description: expect.any(String) },
    { which: "bare", description: null },
  ] as const)(
    "GET /tags/:id/ and /tags/slug/:slug/ return the same $which tag",
    async ({ which, description }, { api }) => {
      const tag = seeded[which];
      const byId = await api.tags.read({ id: tag.id }).fetch();
      const bySlug = await api.tags.read({ slug: tag.slug }).fetch();
      assertOk(byId);
      assertOk(bySlug);

      expect(byId.data).toMatchObject({ id: tag.id, description });
      expect(bySlug.data).toEqual(byId.data);
    },
  );

  liveTest("POST /tags/ stores every field it was sent", async ({ api }) => {
    const input = fullTagInput(uniqueSuffix());
    const added = await api.tags.add(input);
    assertOk(added);

    const read = await api.tags.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(input);
  });

  liveTest("PUT /tags/:id/ persists the edit", async ({ api }) => {
    const added = await api.tags.add({ name: `Edit me ${uniqueSuffix()}` });
    assertOk(added);

    const edit = { name: `${added.data.name} edited`, description: "Edited description" };
    const edited = await api.tags.edit(added.data.id, edit);
    assertOk(edited);

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

  liveTest("tag responses carry no key the client's schema lacks", async ({ api, responses }) => {
    const filter: `slug:[${string}]` = `slug:[${seeded.full.slug},${seeded.bare.slug}]`;
    assertOk(await api.tags.browse({ filter }).include({ "count.posts": true }).fetch());
    assertOk(await api.tags.read({ id: seeded.full.id }).fetch());
    const added = await api.tags.add(fullTagInput(uniqueSuffix()));
    assertOk(added);
    assertOk(await api.tags.edit(added.data.id, { description: "Edited" }));

    expect(unknownKeysOfResponses(responses.all())).toEqual([]);
  });
});
