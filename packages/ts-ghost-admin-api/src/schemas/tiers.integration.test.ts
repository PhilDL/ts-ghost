import { assert, beforeEach, describe, expect, test } from "vitest";

import { TSGhostAdminAPI } from "../admin-api";

const stubResult = {
  status: "success",
  meta: {
    pagination: { pages: 1, page: 1, limit: 2, total: 2, prev: null, next: null },
  },
  data: [
    {
      slug: "free",
      id: "63887bd07f2cf30001fec7a2",
      name: "Free",
      description: null,
      active: true,
      type: "free",
      welcome_page_url: null,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:02:56.000Z",
      stripe_prices: [],
      monthly_price: null,
      yearly_price: null,
      benefits: [],
      visibility: "public",
      trial_days: 0,
    },
    {
      slug: "default-product",
      id: "63887bd07f2cf30001fec7a3",
      name: "Astro Starter",
      description: null,
      active: true,
      type: "paid",
      welcome_page_url: null,
      created_at: "2022-12-01T10:02:56.000Z",
      updated_at: "2022-12-01T10:03:27.000Z",
      stripe_prices: [],
      monthly_price: 500,
      yearly_price: 5000,
      benefits: [],
      visibility: "public",
      currency: "USD",
      trial_days: 0,
    },
  ],
};

describe("tiers integration tests browse", () => {
  let api: TSGhostAdminAPI;
  beforeEach(() => {
    const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
    const key =
      process.env.VITE_GHOST_ADMIN_API_KEY ||
      "1efedd9db174adee2d23d982:4b74dca0219bad629852191af326a45037346c2231240e0f7aec1f9371cc14e8";
    api = new TSGhostAdminAPI(url, key, "v5.0");
  });
  test("tiers.browse()", async () => {
    expect(api.tiers).toBeDefined();
    const result = await api.tiers
      .browse({
        limit: 1,
      })
      .fetch();

    assert(result.status === "success");
    const tier = result.data[0];
    const stubTier = stubResult.data[0];
    expect(tier.id).toBe(stubTier.id);
    expect(tier.name).toBe(stubTier.name);
    expect(tier.description).toBe(stubTier.description);
    expect(tier.active).toBe(stubTier.active);
    expect(tier.type).toBe(stubTier.type);
    expect(tier.welcome_page_url).toBe(stubTier.welcome_page_url);
    expect(tier.created_at).toBe(stubTier.created_at);
    expect(tier.updated_at).toBeDefined();
    expect(tier.stripe_prices).toStrictEqual(stubTier.stripe_prices);
    expect(tier.monthly_price).toBe(stubTier.monthly_price);
    expect(tier.yearly_price).toBe(stubTier.yearly_price);
    expect(tier.benefits).toStrictEqual(stubTier.benefits);
    expect(tier.visibility).toBe(stubTier.visibility);
    expect(tier.trial_days).toBe(stubTier.trial_days);
  });

  test("tiers.read()", async () => {
    expect(api.tiers).toBeDefined();
    const result = await api.tiers
      .read({
        id: "63887bd07f2cf30001fec7a2",
      })
      .fetch();
    assert(result.status === "success");
    const tier = result.data;
    const stubTier = stubResult.data[0];
    expect(tier.id).toBe(stubTier.id);
    expect(tier.name).toBe(stubTier.name);
    expect(tier.description).toBe(stubTier.description);
    expect(tier.active).toBe(stubTier.active);
    expect(tier.type).toBe(stubTier.type);
    expect(tier.welcome_page_url).toBe(stubTier.welcome_page_url);
    expect(tier.created_at).toBe(stubTier.created_at);
    expect(tier.updated_at).toBeDefined();
    expect(tier.stripe_prices).toStrictEqual(stubTier.stripe_prices);
    expect(tier.monthly_price).toBe(stubTier.monthly_price);
    expect(tier.yearly_price).toBe(stubTier.yearly_price);
    expect(tier.benefits).toStrictEqual(stubTier.benefits);
    expect(tier.visibility).toBe(stubTier.visibility);
    expect(tier.trial_days).toBe(stubTier.trial_days);
  });
});
