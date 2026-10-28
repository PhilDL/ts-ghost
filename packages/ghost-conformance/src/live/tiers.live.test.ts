import { beforeAll, describe, expect, inject } from "vitest";

import { seedTiers } from "../seeds/tiers.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./ghost.ts";

let seed: Awaited<ReturnType<typeof seedTiers>>;
beforeAll(async () => {
  seed = await seedTiers(inject("ghost"));
});

describe("tiers", () => {
  liveTest("browse returns the free tier, active paid tiers and an archived one", async ({ api }) => {
    const result = await api.tiers.browse({ limit: "all" }).fetch();

    assertOk(result);
    const bySlug = new Map(result.data.map((tier) => [tier.slug, tier]));
    expect(bySlug.get("free")).toMatchObject({ type: "free", active: true });
    expect(bySlug.get("default-product")).toMatchObject({ type: "paid", active: true });
    expect(bySlug.get(seed.full.slug)).toMatchObject({ type: "paid", active: true });
    expect(bySlug.get(seed.archived.slug)).toMatchObject({ type: "paid", active: false });
  });

  liveTest("read by id returns Ghost's default paid tier with its prices", async ({ api }) => {
    const result = await api.tiers.read({ id: seed.defaultTierId }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({
      slug: "default-product",
      currency: "USD",
      monthly_price: 500,
      yearly_price: 5000,
      // Renamed by the first-run setup; Ghost leaves updated_at null on tier edits over the API.
      updated_at: expect.any(String),
    });
  });

  liveTest("an edited tier reads back with every value it was given", async ({ api }) => {
    const result = await api.tiers.read({ id: seed.full.id }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({
      name: seed.full.editedName,
      description: "A tier with every field set",
      welcome_page_url: "https://example.com/welcome",
      visibility: "public",
      currency: "USD",
      monthly_price: 700,
      yearly_price: 7000,
      benefits: ["First benefit", "Second benefit"],
      trial_days: 7,
    });
  });

  liveTest("a tier never edited has its nullable fields null", async ({ api }) => {
    const result = await api.tiers.read({ id: seed.bare.id }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({
      description: null,
      welcome_page_url: null,
      updated_at: null,
      benefits: [],
      trial_days: 0,
    });
  });

  liveTest(
    "a free tier has benefits but no prices, a paid one both, without includes",
    async ({ api, responses }) => {
      const result = await api.tiers.browse({ limit: "all" }).fetch();

      assertOk(result);
      const bySlug = new Map(result.data.map((tier) => [tier.slug, tier]));
      expect(bySlug.get("free")).toMatchObject({ benefits: [], monthly_price: null, yearly_price: null });
      expect(bySlug.get("default-product")).toMatchObject({
        benefits: [],
        monthly_price: 500,
        yearly_price: 5000,
      });
      expect(responses.all().map((r) => new URL(r.url).searchParams.has("include"))).toEqual([false]);
    },
  );

  // Expected failure: the client still sends the price and benefit includes, which Ghost ignores.
  liveTest.fails("the deprecated price and benefit includes are not sent", async ({ api, responses }) => {
    const include = { monthly_price: true, yearly_price: true, benefits: true } as const;
    const browsed = await api.tiers.browse({ limit: "all" }).include(include).fetch();
    const read = await api.tiers.read({ id: seed.full.id }).include(include).fetch();

    assertOk(browsed);

    assertOk(read);
    expect(responses.all().map((r) => new URL(r.url).searchParams.has("include"))).toEqual([false, false]);
  });

  // Expected failure: the client offers slug reads, but Ghost has no /tiers/slug/:slug/ route.
  liveTest.fails("GET /tiers/slug/:slug/ returns the tier", async ({ api }) => {
    const result = await api.tiers.read({ slug: "default-product" }).fetch();

    assertOk(result);
  });

  liveTest("tiers carry no key the client's schema lacks", async ({ api, responses }) => {
    const result = await api.tiers.browse({ limit: "all" }).fetch();

    assertOk(result);
    const raw = responses.last("/tiers/") as { tiers: unknown[] };
    expect(unknownKeys(raw.tiers, result.data, { at: "tiers" })).toEqual([]);
  });
});
