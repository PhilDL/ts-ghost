import { z } from "zod/v3";

import { baseOffersSchema } from "./offers";
import { baseTiersSchema } from "./tiers";

export const baseSubscriptionsSchema = z.object({
  id: z.string({ description: "Stripe subscription ID sub_XXXX" }),
  customer: z.object(
    {
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
    description: "If the subscription should be canceled or renewed at period end",
  }),
  cancellation_reason: z.string({ description: "Reason for subscription cancellation" }).nullable(),
  current_period_end: z.string({ description: "Subscription end date" }),
  price: z.object({
    id: z.string({ description: "Stripe price ID" }),
    price_id: z.string({ description: "Ghost price ID" }),
    nickname: z.string({ description: "Price nickname" }),
    amount: z.number({ description: "Price amount" }),
    interval: z.string({ description: "Price interval" }),
    type: z.string({ description: "Price type" }),
    currency: z.string({ description: "Price currency" }),
  }),
  tier: baseTiersSchema.nullish(),
  offer: baseOffersSchema.nullish(),
});
