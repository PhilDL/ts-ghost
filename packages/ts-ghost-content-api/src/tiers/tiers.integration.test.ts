import { describe, test, expect, beforeEach } from "vitest";
import { TSGhostContentAPI } from "../content-api";

const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "93fa6b1e07090ecdf686521b7e";

const stub = [
  {
    id: "63887bd07f2cf30001fec7a2",
    name: "Free",
    description: null,
    slug: "free",
    active: true,
    type: "free",
    welcome_page_url: null,
    created_at: "2022-12-01T10:02:56.000Z",
    updated_at: "2022-12-01T10:02:56.000Z",
    visibility: "public",
    benefits: [],
    trial_days: 0,
  },
  {
    id: "63887bd07f2cf30001fec7a3",
    name: "Astro Starter",
    description: null,
    slug: "default-product",
    active: true,
    type: "paid",
    welcome_page_url: null,
    created_at: "2022-12-01T10:02:56.000Z",
    updated_at: "2022-12-01T10:03:27.000Z",
    visibility: "public",
    benefits: [],
    currency: "USD",
    monthly_price: 500,
    yearly_price: 5000,
    trial_days: 0,
  },
];
describe("tiers integration tests browse", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v5.0");
  });
  test("tiers.browse()", async () => {
    const result = await api.tiers.browse().fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (result.status === "error") {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.meta.pagination).toBeDefined();
      expect(result.meta.pagination.page).toBe(1);
      expect(result.meta.pagination.pages).toBe(1);
      expect(result.data).toHaveLength(2);
      const tier = result.data[1];
      expect(tier).toBeDefined();
      expect(tier.id).toBe(stub[1].id);
      expect(tier.name).toBe(stub[1].name);
      expect(tier.slug).toBe(stub[1].slug);
      expect(tier.description).toBe(stub[1].description);
      expect(tier.visibility).toBe(stub[1].visibility);
      expect(tier.type).toBe(stub[1].type);
      expect(tier.currency).toBe(stub[1].currency);
      expect(tier.benefits).toStrictEqual(stub[1].benefits);
      expect(tier.monthly_price).toBe(stub[1].monthly_price);
      expect(tier.yearly_price).toBe(stub[1].yearly_price);
      expect(tier.trial_days).toBe(stub[1].trial_days);
    }
  });

  test("tiers.browse() include authors and tiers", async () => {
    const result = await api.tiers
      .browse({ output: { include: { benefits: true, monthly_price: true, yearly_price: true } } })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    if (result.status === "error") {
      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
    } else {
      expect(result.data).toHaveLength(2);
      const tier = result.data[0];
      expect(tier).toBeDefined();
      expect(tier.id).toBe(stub[0].id);
      expect(tier.monthly_price).toBeDefined();
    }
  });

  test("tiers.browse() with mix of incude and fields... ghost doesn't answer to that query", async () => {
    const result = await api.tiers
      .browse({
        output: {
          fields: { slug: true, name: true },
        },
      })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    // Right now this doesn't work in Ghost API
    expect(result.status).toBe("error");
  });

  test("tiers.browse() with mix of incude and fields... this is mostly broken on Ghost side", async () => {
    const result = await api.tiers
      .browse({
        output: {
          fields: { slug: true, name: true },
          include: { monthly_price: true },
        },
      })
      .fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    expect(result.status).toBe("error");
  });
});

describe("tiers integration tests read doesn't work on GHOST API", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI(url, key, "v5.0");
  });

  test("tiers.read() by id doesn't work on ghost", async () => {
    const result = await api.tiers.read({ input: { id: "63887bd07f2cf30001fec7a2" } }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    expect(result.status).toBe("error");
  });

  test("tiers.read() by slug", async () => {
    const result = await api.tiers.read({ input: { slug: "free" } }).fetch();
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
    expect(result.status).toBe("error");
  });
});
