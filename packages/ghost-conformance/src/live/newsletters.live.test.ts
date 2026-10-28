import { beforeAll, describe, expect } from "vitest";

import { fullNewsletterInput, seedNewsletters } from "../seeds/newsletters.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./live-test.ts";

describe("newsletters", () => {
  let seeded: Awaited<ReturnType<typeof seedNewsletters>>;
  beforeAll(async () => {
    seeded = await seedNewsletters();
  });

  liveTest(
    "GET /newsletters/ lists active and archived newsletters, with null and set fields",
    async ({ api }) => {
      const result = await api.newsletters.browse({ limit: "all" }).fetch();
      assertOk(result);

      expect(new Set(result.data.map((n) => n.status))).toEqual(new Set(["active", "archived"]));
      expect(result.data.some((n) => n.description === null && n.header_image === null)).toBe(true);
      expect(result.data.find((n) => n.id === seeded.full.id)).toMatchObject({
        description: seeded.full.description,
        header_image: seeded.full.header_image,
      });
    },
  );

  liveTest("GET /newsletters/:id/ returns the newsletter", async ({ api }) => {
    const result = await api.newsletters.read({ id: seeded.archived.id }).fetch();
    assertOk(result);

    expect(result.data).toEqual(seeded.archived);
  });

  // Expected failure: the client offers slug reads, but Ghost has no /newsletters/slug/:slug/ route.
  liveTest.fails("GET /newsletters/slug/:slug/ returns the newsletter", async ({ api }) => {
    const result = await api.newsletters.read({ slug: seeded.full.slug }).fetch();
    assertOk(result);
  });

  liveTest("POST /newsletters/ stores every field it was sent", async ({ api }) => {
    const input = fullNewsletterInput(uniqueSuffix());
    const added = await api.newsletters.add(input, { opt_in_existing: false });
    assertOk(added);

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(input);
  });

  // Expected failure: the client requires sender_name on add; Ghost doesn't.
  liveTest.fails("POST /newsletters/ accepts a newsletter with a name only", async ({ api }) => {
    const name = `Name only ${uniqueSuffix()}`;
    // @ts-expect-error the create schema makes sender_name required
    const added = await api.newsletters.add({ name });
    assertOk(added);

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data.name).toBe(name);
  });

  liveTest("PUT /newsletters/:id/ persists the edit", async ({ api }) => {
    const added = await api.newsletters.add({
      name: `Edit me ${uniqueSuffix()}`,
      sender_name: "Before",
    });
    assertOk(added);

    const edit = { name: `${added.data.name} edited`, sender_name: "After", description: "Edited" };
    const edited = await api.newsletters.edit(added.data.id, edit);
    assertOk(edited);

    const read = await api.newsletters.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject(edit);
  });

  // Expected failure: the newsletter schema lacks Ghost 6.72's design keys (background_color, button_*, link_*...).
  liveTest.fails(
    "newsletter responses send no key the client's schema lacks",
    async ({ api, responses }) => {
      const browsed = await api.newsletters.browse({ limit: "all" }).fetch();
      const browseRaw = responses.last("/newsletters/") as { newsletters: unknown };
      const read = await api.newsletters.read({ id: seeded.full.id }).fetch();
      const readRaw = responses.last(`/newsletters/${seeded.full.id}/`) as { newsletters: unknown[] };
      const name = `Key check ${uniqueSuffix()}`;
      const added = await api.newsletters.add({ name, sender_name: "Key check" });
      const addRaw = responses.last("/newsletters/") as { newsletters: unknown[] };
      assertOk(added);
      // Edits the newsletter added here: the seed's values are asserted by other tests.
      const edited = await api.newsletters.edit(added.data.id, { description: "Edited for the key check" });
      const editRaw = responses.last(`/newsletters/${added.data.id}/`) as { newsletters: unknown[] };
      assertOk(browsed);
      assertOk(read);
      assertOk(edited);

      expect([
        ...unknownKeys(browseRaw.newsletters, browsed.data, { at: "browse.newsletters" }),
        ...unknownKeys(readRaw.newsletters[0], read.data, { at: "read.newsletter" }),
        ...unknownKeys(editRaw.newsletters[0], edited.data, { at: "edit.newsletter" }),
        ...unknownKeys(addRaw.newsletters[0], added.data, { at: "add.newsletter" }),
      ]).toEqual([]);
    },
  );
});
