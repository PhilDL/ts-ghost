import { z } from "zod";
import { baseTiersSchema } from "@ts-ghost/core-api";

export const adminTiersSchema = baseTiersSchema.merge(
  z.object({
    monthly_price_id: z.string({ description: "Monthly Stripe price id" }).nullish(),
    yearly_price_id: z.string({ description: "Yearly Stripe price id" }).nullish(),
  })
);

export type Tiers = z.infer<typeof adminTiersSchema>;

export const adminTiersCreateSchema = z.object({
  name: z.string({ description: "Name of the tier" }),
  description: z.string({ description: "Description of the tier" }).optional(),
  welcome_page_url: z.string({ description: "Welcome page URL of the tier" }).optional(),
  visibility: z.union([z.literal("public"), z.literal("none")]).optional(),
  monthly_price: z.number({ description: "Monthly price of the tier" }).optional(),
  yearly_price: z.number({ description: "Yearly price of the tier" }).optional(),
  trial_days: z.number({ description: "Trial days of the tier" }).optional(),
  benefits: z.array(z.string({ description: "Benefits of the tier" })).optional(),
  currency: z.string({ description: "Currency of the tier" }).optional(),
  active: z.boolean({ description: "Active of the tier" }).optional(),
});
