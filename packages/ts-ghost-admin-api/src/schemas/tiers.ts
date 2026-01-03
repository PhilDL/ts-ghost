import { z } from "zod";
import { baseTiersSchema } from "@ts-ghost/core-api";

export const adminTiersSchema = baseTiersSchema.merge(
  z.object({
    monthly_price_id: z.string().meta({ description: "Monthly Stripe price id" }).nullish(),
    yearly_price_id: z.string().meta({ description: "Yearly Stripe price id" }).nullish(),
  }),
);

export type Tiers = z.infer<typeof adminTiersSchema>;

export const adminTiersCreateSchema = z.object({
  name: z.string().meta({ description: "Name of the tier" }).min(1).max(2000),
  description: z.string().meta({ description: "Description of the tier" }).optional(),
  welcome_page_url: z.string().meta({ description: "Welcome page URL of the tier" }).optional(),
  visibility: z.union([z.literal("public"), z.literal("none")]).optional(),
  monthly_price: z.number().meta({ description: "Monthly price of the tier" }).optional(),
  yearly_price: z.number().meta({ description: "Yearly price of the tier" }).optional(),
  trial_days: z.number().meta({ description: "Trial days of the tier" }).optional(),
  benefits: z.array(z.string().meta({ description: "Benefits of the tier" })).optional(),
  currency: z.string().meta({ description: "Currency of the tier" }).optional(),
  active: z.boolean().meta({ description: "Active of the tier" }).optional(),
});
