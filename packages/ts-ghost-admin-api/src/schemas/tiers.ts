import { z } from "zod";
import { baseTiersSchema } from "@ts-ghost/core-api";

export const adminTiersSchema = baseTiersSchema.merge(
  z.object({
    monthly_price_id: z.string({ description: "Monthly Stripe price id" }).nullable(),
    yearly_price_id: z.string({ description: "Yearly Stripe price id" }).nullable(),
  })
);

export type Tiers = z.infer<typeof adminTiersSchema>;
