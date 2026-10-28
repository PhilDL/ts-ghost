import { beforeAll, describe, expect, inject } from "vitest";

import { seedOffers } from "../seeds/offers.ts";
import { uniqueSuffix } from "../seeds/unique-suffix.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { assertOk, liveTest } from "./ghost.ts";

let seed: Awaited<ReturnType<typeof seedOffers>>;
beforeAll(async () => {
  seed = await seedOffers(inject("ghost"));
});

const ISO_MS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe("offers", () => {
  liveTest("add creates a fixed signup offer on a tier; edits read back", async ({ api }) => {
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
    assertOk(added);

    const edited = await api.offers.edit(added.data.id, {
      name: `Renamed ${code}`,
      display_title: "Still five off",
    });
    assertOk(edited);

    const read = await api.offers.read({ id: added.data.id }).fetch();
    assertOk(read);
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

  liveTest("a percent offer repeats for its months", async ({ api }) => {
    const result = await api.offers.read({ id: seed.repeating.id }).fetch();

    assertOk(result);
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
  liveTest.fails("a retention offer reads with no tier", async ({ api }) => {
    const result = await api.offers.read({ id: seed.retention.id }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({ code: seed.retention.code, type: "percent", tier: null });
  });

  // Expected failure: the retention offer's null tier fails the client's offers schema.
  liveTest.fails("browse lists the retention and the trial offer", async ({ api }) => {
    const result = await api.offers.browse({ limit: "all" }).fetch();

    assertOk(result);
    const byCode = new Map(result.data.map((offer) => [offer.code, offer]));
    expect(byCode.get(seed.retention.code)).toMatchObject({ tier: null });
    expect(byCode.get(seed.trial.code)).toMatchObject({ tier: { id: seed.tierId } });
  });

  // Expected failure: the client's offer create schema has no trial type.
  liveTest.fails("add creates a trial offer of a number of trial days on a tier", async ({ api }) => {
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
    const added = await api.offers.add(trial);

    assertOk(added);
    const read = await api.offers.read({ id: added.data.id }).fetch();
    assertOk(read);
    expect(read.data).toMatchObject({ ...trial, tier: { id: seed.tierId } });
  });

  liveTest(
    "a trial offer must have a trial duration, and other offers cannot have one",
    async ({ api, responses }) => {
      const base = {
        name: "n",
        code: "trial-check",
        cadence: "year",
        amount: 14,
        tier: { id: seed.tierId },
      } as const;
      const rejectsDuration = {
        name: "ZodError",
        issues: [expect.objectContaining({ path: ["duration"] })],
      };
      // A ZodError only: without a trial type in the client, this is refused on `type` first.
      await expect(
        // @ts-expect-error a trial offer's duration is "trial"
        api.offers.add({ ...base, type: "trial", duration: "once" }),
      ).rejects.toMatchObject({ name: "ZodError" });
      await expect(
        // @ts-expect-error only a trial offer has a trial duration
        api.offers.add({ ...base, type: "percent", duration: "trial" }),
      ).rejects.toMatchObject(rejectsDuration);
      expect(responses.all()).toEqual([]);
    },
  );

  // Ghost also sends redemption_type, created_at and last_redeemed; the unknown-keys test owns them.
  liveTest("a trial offer reads back with its trial days and tier", async ({ api, responses }) => {
    const result = await api.offers.read({ id: seed.trial.id }).fetch();

    assertOk(result);
    expect(result.data).toMatchObject({
      type: "trial",
      duration: "trial",
      amount: 14,
      tier: { id: seed.tierId, name: expect.any(String) },
    });
    const raw = responses.last("/offers/") as { offers: unknown[] };
    expect(raw.offers[0]).toMatchObject({
      redemption_type: "signup",
      created_at: expect.stringMatching(ISO_MS),
      last_redeemed: null,
    });
  });

  // Expected failure: the client offers slug reads, but Ghost has no /offers/slug/:slug/ route.
  liveTest.fails("GET /offers/slug/:slug/ returns the offer", async ({ api }) => {
    const result = await api.offers.read({ slug: seed.trial.code }).fetch();

    assertOk(result);
  });

  // Expected failure: the client's offers schema lacks redemption_type, created_at and last_redeemed.
  liveTest.fails("an offer carries no key the client's schema lacks", async ({ api, responses }) => {
    const result = await api.offers.read({ id: seed.trial.id }).fetch();

    assertOk(result);
    const raw = responses.last("/offers/") as { offers: unknown[] };
    expect(unknownKeys(raw.offers[0], result.data, { at: "offer" })).toEqual([]);
  });
});
