import { z } from "zod/v3";

import { baseOffersSchema } from "./offers";
import { baseTiersSchema } from "./tiers";

export const baseSubscriptionsSchema = z.object({
  id: z.string().meta({ description: "Stripe subscription ID sub_XXXX" }),
  customer: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string(),
    },
    { description: "Stripe customer attached to the subscription" },
  ),
  status: z.string({ description: "Subscription status" }),
  start_date: z.string({ description: "Subscription start date" }),
  default_payment_card_last4: z.string({ description: "Last 4 digits of the card" }).nullable(),
  cancel_at_period_end: z.boolean({
    },
    { description: "Stripe customer attached to the subscription" }
  ),
  status: z.string({ description: "Subscription status" }),
  start_date: z.string({ description: "Subscription start date" }),
  default_payment_card_last4: z.string({ description: "Last 4 digits of the card" }).nullable(),
  cancel_at_period_end: z.boolean({
    })
    .meta({ description: "Stripe customer attached to the subscription" }),
  status: z.string().meta({ description: "Subscription status" }),
  start_date: z.string().meta({ description: "Subscription start date" }),
  default_payment_card_last4: z.string().meta({ description: "Last 4 digits of the card" }).nullable(),
  cancel_at_period_end: z.boolean().meta({
    description: "If the subscription should be canceled or renewed at period end",
  }),
  cancellation_reason: z.string().meta({ description: "Reason for subscription cancellation" }).nullable(),
  current_period_end: z.string().meta({ description: "Subscription end date" }),
  price: z.object({
    id: z.string().meta({ description: "Stripe price ID" }),
    price_id: z.string().meta({ description: "Ghost price ID" }),
    nickname: z.string().meta({ description: "Price nickname" }),
    amount: z.number().meta({ description: "Price amount" }),
    interval: z.string().meta({ description: "Price interval" }),
    type: z.string().meta({ description: "Price type" }),
    currency: z.string().meta({ description: "Price currency" }),
  }),
  tier: baseTiersSchema.nullish(),
  offer: baseOffersSchema.nullish(),
});
