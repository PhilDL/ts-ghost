import { baseTiersSchema } from "@ts-ghost/core-api";
import { z } from "zod";

export const adminTiersSchema = baseTiersSchema.merge(
  z.object({
    monthly_price_id: z.string({ description: "Monthly Stripe price id" }).nullish(),
    yearly_price_id: z.string({ description: "Yearly Stripe price id" }).nullish(),
  })
);

export type Tiers = z.infer<typeof adminTiersSchema>;
