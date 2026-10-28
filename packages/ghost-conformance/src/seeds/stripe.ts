import { must } from "./seed-result.ts";
import { ghostId, insert, type SqlSeed, type SqlSeedContext } from "./sql.ts";

/** What the Stripe seed creates; tests look it up by these emails and Stripe ids. */
export const STRIPE_SEED = {
  members: {
    /** Paid on the monthly price, with an offer and every nullable field set. */
    paid: "paid-member@conformance.test",
    /** Paid on the yearly price, with every nullable field null and a pending cancellation. */
    nulls: "paid-nulls@conformance.test",
  },
  customers: { paid: "cus_conformance_paid", nulls: "cus_conformance_nulls" },
  subscriptions: { paid: "sub_conformance_paid", nulls: "sub_conformance_nulls" },
  product: "prod_conformance",
  prices: { monthly: "price_conformance_monthly", yearly: "price_conformance_yearly" },
  /** Code of the signup offer the paid member redeemed. */
  offer: "stripe-seed-offer",
} as const;

/** Stripe-backed customers and subscriptions on Ghost's default paid tier, so two members are paid. */
export const stripeSeed: SqlSeed = {
  name: "stripe",
  tables: {
    stripe_products: "Ghost writes a tier's Stripe product only through a connected Stripe account.",
    stripe_prices: "Ghost writes a tier's Stripe prices only through a connected Stripe account.",
    members_stripe_customers: "Written from Stripe checkout webhooks.",
    members_stripe_customers_subscriptions: "Written from Stripe subscription webhooks.",
    members_products: "Only for paid members; the API links a tier only to comped members.",
    members: "Only `status`, which becomes `paid` only through a Stripe subscription.",
  },
  async run({ admin, exec }: SqlSeedContext) {
    const tiers = must(await admin.tiers.browse({ filter: "slug:default-product" }).fetch(), "stripe seed");
    const tier = tiers[0];
    if (!tier) throw new Error("Stripe seed: no default paid tier");
    const offer = must(
      await admin.offers.add({
        name: "Stripe seed offer",
        code: STRIPE_SEED.offer,
        display_title: "Three months off",
        display_description: "20% off for three months",
        type: "percent",
        cadence: "month",
        amount: 20,
        duration: "repeating",
        duration_in_months: 3,
        tier: { id: tier.id },
      }),
      "stripe seed",
    );
    const paid = must(
      await admin.members.add({ email: STRIPE_SEED.members.paid, name: "Paid Member" }),
      "stripe seed",
    );
    const nulls = must(await admin.members.add({ email: STRIPE_SEED.members.nulls }), "stripe seed");

    const t = (iso: string) => new Date(`${iso}T00:00:00Z`);
    const { customers, subscriptions, prices, product } = STRIPE_SEED;
    const subscription = (row: {
      customer: string;
      id: string;
      price: string;
      nickname: string;
      interval: string;
      amount: number;
      card: string | null;
      cancelled: string | null;
      offer: string | null;
    }) => ({
      id: ghostId(),
      customer_id: row.customer,
      subscription_id: row.id,
      stripe_price_id: row.price,
      status: "active",
      cancel_at_period_end: row.cancelled !== null,
      cancellation_reason: row.cancelled,
      current_period_end: t("2027-01-01"),
      start_date: t("2026-01-01"),
      default_payment_card_last4: row.card,
      created_at: t("2026-01-01"),
      updated_at: null,
      mrr: row.interval === "year" ? Math.round(row.amount / 12) : row.amount,
      offer_id: row.offer,
      plan_id: row.price,
      plan_nickname: row.nickname,
      plan_interval: row.interval,
      plan_amount: row.amount,
      plan_currency: "usd",
    });

    await exec([
      insert("stripe_products", [
        {
          id: ghostId(),
          product_id: tier.id,
          stripe_product_id: product,
          created_at: t("2026-01-01"),
          updated_at: null,
        },
      ]),
      insert("stripe_prices", [
        price(prices.monthly, "Monthly", 500, "month", "Billed monthly"),
        price(prices.yearly, null, 5000, "year", null),
      ]),
      insert("members_stripe_customers", [
        customer(paid.id, customers.paid, "Paid Member", paid.email),
        customer(nulls.id, customers.nulls, null, null),
      ]),
      insert("members_stripe_customers_subscriptions", [
        subscription({
          customer: customers.paid,
          id: subscriptions.paid,
          price: prices.monthly,
          nickname: "Monthly",
          interval: "month",
          amount: 500,
          card: "4242",
          cancelled: null,
          offer: offer.id,
        }),
        subscription({
          customer: customers.nulls,
          id: subscriptions.nulls,
          price: prices.yearly,
          nickname: "",
          interval: "year",
          amount: 5000,
          card: null,
          cancelled: "Too expensive",
          offer: null,
        }),
      ]),
      insert(
        "members_products",
        [paid, nulls].map((member) => ({
          id: ghostId(),
          member_id: member.id,
          product_id: tier.id,
          sort_order: 0,
          expiry_at: null,
        })),
      ),
      `UPDATE members SET status = 'paid' WHERE id IN ('${paid.id}', '${nulls.id}');`,
    ]);

    function price(
      id: string,
      nickname: string | null,
      amount: number,
      interval: string,
      description: string | null,
    ) {
      return {
        id: ghostId(),
        stripe_price_id: id,
        stripe_product_id: product,
        active: true,
        nickname,
        currency: "usd",
        amount,
        type: "recurring",
        interval,
        description,
        created_at: t("2026-01-01"),
        updated_at: null,
      };
    }
    function customer(memberId: string, id: string, name: string | null, email: string | null) {
      return {
        id: ghostId(),
        member_id: memberId,
        customer_id: id,
        name,
        email,
        created_at: t("2026-01-01"),
        updated_at: null,
      };
    }
  },
};
