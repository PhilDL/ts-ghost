import { z } from "zod";

export const baseOffersSchema = z.object({
  id: z.string(),
  name: z.string({ description: "Internal name for an offer, must be unique" }),
  code: z.string({ description: "Shortcode for the offer, for example: https://yoursite.com/black-friday" }),
  display_title: z.string({ description: "Name displayed in the offer window" }),
  display_description: z.string({ description: "Text displayed in the offer window" }),
  type: z.union([z.literal("percent"), z.literal("fixed")]),
  cadence: z.union([z.literal("month"), z.literal("year")]),
  amount: z.number({
    description: `Offer discount amount, as a percentage or fixed value as set in type. 
      Amount is always denoted by the smallest currency unit 
      (e.g., 100 cents instead of $1.00 in USD)`,
  }),
  duration: z.union([z.literal("once"), z.literal("forever"), z.literal("repeating")], {
    description: "once/forever/repeating. repeating duration is only available when cadence is month",
  }),
  duration_in_months: z
    .number({ description: "Number of months offer should be repeated when duration is repeating" })
    .nullable(),
  currency_restriction: z.boolean({
    description:
      "Denotes whether the offer `currency` is restricted. If so, changing the currency invalidates the offer",
  }),
  currency: z
    .string({ description: "fixed type offers only - specifies tier's currency as three letter ISO currency code" })
    .nullable(),
  status: z.union([z.literal("active"), z.literal("archived")], {
    description: "active or archived - denotes if the offer is active or archived",
  }),
  redemption_count: z.number({ description: "Number of times the offer has been redeemed" }),
  tier: z.object(
    {
      id: z.string(),
      name: z.string(),
    },
    { description: "Tier on which offer is applied" }
  ),
});
