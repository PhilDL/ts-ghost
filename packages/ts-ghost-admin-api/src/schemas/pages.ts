import { z } from "zod";
import { basePagesSchema } from "@ts-ghost/core-api";

import { adminAuthorsSchema } from "./authors";
import { adminTiersSchema } from "./tiers";

export const adminPagesSchema = basePagesSchema.merge(
  z.object({
    uuid: z.string(),
    mobiledoc: z.string().nullish(),
    status: z.union([z.literal("draft"), z.literal("published"), z.literal("scheduled")]),
    frontmatter: z.string().nullish(),
    tiers: z.array(adminTiersSchema).nullish(),
    count: z
      .object({
        clicks: z.number().nullish(),
        positive_feedback: z.number().nullish(),
        negative_feedback: z.number().nullish(),
        paid_conversions: z.number().nullish(),
        signups: z.number().nullish(),
      })
      .nullish(),
    authors: z.array(adminAuthorsSchema),
    primary_author: adminAuthorsSchema,
    html: z.string().catch("").optional(),
    plaintext: z.string().catch("").optional(),
  })
);

export type Page = z.infer<typeof adminPagesSchema>;
