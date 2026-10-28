import { assert, describe, expect, test } from "vitest";

import { STRIPE_SEED } from "../seeds/stripe.ts";
import { unknownKeys } from "../unknown-keys.ts";
import { adminApi, liveResponses } from "./ghost.ts";

/** Id of a member by email; selects only `id` so members the client can't parse still resolve. */
async function memberId(email: string): Promise<string> {
  const result = await adminApi()
    .members.browse({ filter: `email:'${email}'` })
    .fields({ id: true })
    .fetch();
  if (!result.success || !result.data[0]) throw new Error(`No member ${email}`);
  return result.data[0].id;
}

// Keys Ghost sends that the client deliberately doesn't model.
const IGNORED: string[] = [];

describe("paid members", () => {
  const responses = liveResponses({ ignore: IGNORED });

  test("a paid member reads with an active Stripe subscription on the paid tier", async () => {
    const result = await adminApi()
      .members.read({ id: await memberId(STRIPE_SEED.members.paid) })
      .fetch();

    assert(result.success);
    expect(result.data).toMatchObject({ status: "paid", comped: false });
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({
        id: STRIPE_SEED.subscriptions.paid,
        status: "active",
        customer: { id: STRIPE_SEED.customers.paid, name: "Paid Member", email: STRIPE_SEED.members.paid },
        default_payment_card_last4: "4242",
        cancel_at_period_end: false,
        cancellation_reason: null,
        current_period_end: "2027-01-01T00:00:00.000Z",
        price: expect.objectContaining({
          id: STRIPE_SEED.prices.monthly,
          nickname: "Monthly",
          interval: "month",
        }),
        tier: expect.objectContaining({ slug: "default-product", type: "paid" }),
        offer: expect.objectContaining({ code: STRIPE_SEED.offer }),
      }),
    ]);
  });

  // Expected failure: customer.email and price.nickname are typed as strings; Ghost sends null.
  test.fails("a subscription with a null customer email and price nickname parses", async () => {
    const result = await adminApi()
      .members.read({ id: await memberId(STRIPE_SEED.members.nulls) })
      .fetch();

    assert(result.success);
    expect(result.data.subscriptions).toEqual([
      expect.objectContaining({
        id: STRIPE_SEED.subscriptions.nulls,
        customer: { id: STRIPE_SEED.customers.nulls, name: null, email: null },
        default_payment_card_last4: null,
        cancel_at_period_end: true,
        cancellation_reason: "Too expensive",
        price: expect.objectContaining({ id: STRIPE_SEED.prices.yearly, nickname: null, interval: "year" }),
        offer: null,
      }),
    ]);
  });

  // Expected failure: the paid member with a null customer email fails the members schema.
  test.fails("browsing paid members parses", async () => {
    const result = await adminApi().members.browse({ filter: "status:paid" }).fetch();

    assert(result.success);
    expect(result.data.map((member) => member.email).sort()).toEqual(
      [STRIPE_SEED.members.nulls, STRIPE_SEED.members.paid].sort(),
    );
  });

  // Expected failure: the client offers no member includes and its schema strips `tiers`.
  test.fails("a paid member's tiers come with the include", async () => {
    const result = await adminApi()
      .members.read({ id: await memberId(STRIPE_SEED.members.paid) })
      // @ts-expect-error the client's member include schema is empty
      .include({ tiers: true })
      .fetch();

    assert(result.success);
    // @ts-expect-error the client's member schema lacks `tiers`
    expect(result.data.tiers).toEqual([expect.objectContaining({ slug: "default-product", type: "paid" })]);
  });

  // Expected failure: subscriptions lack plan, attribution, trial/discount dates, offer_redemptions, next_payment,
  // price.tier, tier price ids/expiry_at and offer redemption_type/created_at/last_redeemed (Ghost 6.72).
  test.fails("a subscription carries no key the client's schema lacks", async () => {
    const result = await adminApi()
      .members.read({ id: await memberId(STRIPE_SEED.members.paid) })
      .fetch();

    assert(result.success);
    const raw = responses.last("/members/") as { members: { subscriptions: unknown }[] };
    expect(
      unknownKeys(raw.members[0]?.subscriptions, result.data.subscriptions, { at: "subscriptions" }),
    ).toEqual([]);
  });
});
