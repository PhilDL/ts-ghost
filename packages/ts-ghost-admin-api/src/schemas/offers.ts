import isSlug from "validator/lib/isSlug";
import { z } from "zod/v3";

const baseOffersCreateSchema = z.object({
  name: z.string(),
  code: z.string().refine((value) => isSlug(value), {
    message: "Code must be a valid slug",
  }),
  display_title: z.string().optional(),
  display_description: z.string().optional(),
  cadence: z.union([z.literal("year"), z.literal("month")]),
  amount: z.number().meta({
    description: "Amount of the percent or fixed amount in the smallest unit of the currency",
  }),
  duration: z.union([z.literal("once"), z.literal("forever"), z.literal("repeating")]),
  duration_in_months: z
    .number()
    .meta({
      description: "Number of months offer should be repeated when duration is repeating",
    })
    .nullish(),
  currency_restriction: z.boolean().optional(),
  status: z.union([z.literal("active"), z.literal("archived")]).optional(),
  redemption_count: z.number().optional(),
  tier: z.object({
    id: z.string().min(1),
    name: z.string().optional(),
  }),
});

/**
 * There are other rules here that may be problematic unions
 * cadence: "year" | "month"
 * duration: "once" | "forever" | "repeating" => "repeating" when cadence is "month"
 * duration_in_months: number is only available when `duration` is "repeating"
 *
 * We could type all of that out, but it may complexify the readability and not be helpful ?
 */
export const adminOffersCreateSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("fixed"),
    currency: z.string(),
    ...baseOffersCreateSchema.shape,
  }),
  z.object({
    type: z.literal("percent"),
    currency: z.string().nullish(),
    ...baseOffersCreateSchema.shape,
  }),
]);

export type OffersCreate = z.infer<typeof adminOffersCreateSchema>;

export const adminOffersUpdateSchema = z.object({
  name: z.string().optional(),
  code: z
    .string()
    .refine((value) => isSlug(value), {
      message: "Code must be a valid slug",
    })
    .optional(),
  display_title: z.string().optional(),
  display_description: z.string().optional(),
  status: z.union([z.literal("active"), z.literal("archived")]).optional(),
});
