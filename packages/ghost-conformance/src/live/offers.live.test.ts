import { assert, beforeAll, describe, expect, inject, test } from "vitest";

import { seedOffers } from "../seeds/offers.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

let seed: Awaited<ReturnType<typeof seedOffers>>;
beforeAll(async () => {
  seed = await seedOffers(inject("ghost"));
});

const ISO_MS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

describe("offers", () => {
  const responses = liveResponses({ ignore: IGNORED });

  test("add creates a fixed signup offer on a tier; edits read back", async () => {
    const api = adminApi();
    const code = `fixed-${uniqueSuffix()}`;
    const sent = {
      name: `Fixed ${code}`,
      code,
      display_title: "Five off",
      display_description: "Five dollars off once",
      type: "fixed",
      cadence: "year",
      amount: 500,
      duration: "once",
      currency: "USD",
      tier: { id: seed.tierId },
    } as const;
    const added = await api.offers.add(sent);
    assert(added.success);

    const edited = await api.offers.edit(added.data.id, {
      name: `Renamed ${code}`,
      display_title: "Still five off",
    });
    expect(edited.success).toBe(true);

    const read = await api.offers.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({
      ...sent,
      name: `Renamed ${code}`,
      display_title: "Still five off",
      duration_in_months: null,
      status: "active",
      redemption_count: 0,
      tier: { id: seed.tierId, name: expect.any(String) },
    });
  });

  test("a percent offer repeats for its months", async () => {
    const result = await adminApi().offers.read({ id: seed.repeating.id }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({
      type: "percent",
      duration: "repeating",
      duration_in_months: 3,
      currency: null,
      display_title: "",
      display_description: "",
    });
  });

  // Expected failure: offer.tier is required in the client's schema; a retention offer has none.
  test.fails("a retention offer reads with no tier", async () => {
    const result = await adminApi().offers.read({ id: seed.retention.id }).fetch();

    assert(result.success);
    expect(result.data).toMatchObject({ code: seed.retention.code, type: "percent", tier: null });
  });

  // Expected failure: the retention offer's null tier fails the client's offers schema.
  test.fails("browse lists the retention and the trial offer", async () => {
    const result = await adminApi().offers.browse({ limit: "all" }).fetch();

    assert(result.success);
    const byCode = new Map(result.data.map((offer) => [offer.code, offer]));
    expect(byCode.get(seed.retention.code)).toMatchObject({ tier: null });
    expect(byCode.get(seed.trial.code)).toMatchObject({ tier: { id: seed.tierId } });
  });

  // Expected failure: the client's offer create schema has no trial type.
  test.fails("add creates a trial offer of a number of trial days on a tier", async () => {
    const code = `trial-${uniqueSuffix()}`;
    const trial = {
      name: `Trial ${code}`,
      code,
      type: "trial",
      cadence: "year",
      amount: 14,
      duration: "trial",
      currency: "USD",
      tier: { id: seed.tierId },
    } as const;
    // @ts-expect-error the client's offer create schema has no trial type
    const added = await adminApi().offers.add(trial);

    assert(added.success);
    const read = await adminApi().offers.read({ id: added.data.id }).fetch();
    assert(read.success);
    expect(read.data).toMatchObject({ ...trial, tier: { id: seed.tierId } });
  });

  test("a trial offer must have a trial duration, and other offers cannot have one", async () => {
    const base = { name: "n", code: "c", cadence: "year", amount: 14, tier: { id: seed.tierId } } as const;
    await expect(
      // @ts-expect-error a trial offer's duration is "trial"
      adminApi().offers.add({ ...base, type: "trial", duration: "once" }),
    ).rejects.toThrow();
    await expect(
      // @ts-expect-error only a trial offer has a trial duration
      adminApi().offers.add({ ...base, type: "percent", duration: "trial" }),
    ).rejects.toThrow();
    expect(responses.all()).toEqual([]);
  });

  // Expected failure: the client's offers schema lacks redemption_type, created_at and last_redeemed.
  test.fails(
    "a trial offer reads back with its tier, redemption type, creation time and last redemption",
    async () => {
      const result = await adminApi().offers.read({ id: seed.trial.id }).fetch();

      assert(result.success);
      expect(result.data).toMatchObject({
        type: "trial",
        duration: "trial",
        amount: 14,
        redemption_type: "signup",
        tier: { id: seed.tierId, name: expect.any(String) },
        created_at: expect.stringMatching(ISO_MS),
        last_redeemed: null,
      });
    },
  );

  // Expected failure: the client offers slug reads, but Ghost has no /offers/slug/:slug/ route.
  test.fails("GET /offers/slug/:slug/ returns the offer", async () => {
    const result = await adminApi().offers.read({ slug: seed.trial.code }).fetch();

    assert(result.success);
  });

  // Expected failure: the client's offers schema lacks redemption_type, created_at and last_redeemed.
  test.fails("an offer carries no key the client's schema lacks", async () => {
    const result = await adminApi().offers.read({ id: seed.trial.id }).fetch();

    assert(result.success);
    const raw = responses.last("/offers/") as { offers: unknown[] };
    expect(unknownKeys(raw.offers[0], result.data, { at: "offer" })).toEqual([]);
  });
});
