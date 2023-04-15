import { z } from "zod";
import { baseEmailSchema, baseNewsletterSchema, basePostsSchema } from "@ts-ghost/core-api";

import { adminAuthorsSchema } from "./authors";
import { adminTiersSchema } from "./tiers";

export const adminPostsSchema = basePostsSchema.merge(
  z.object({
    uuid: z.string(),
    mobiledoc: z.string().nullish(),
    email_only: z.boolean(),
    status: z.union([z.literal("draft"), z.literal("published"), z.literal("scheduled")]),
    email_segment: z.string().nullish(),
    frontmatter: z.string().nullish(),
    tiers: z.array(adminTiersSchema).nullish(),
    email: baseEmailSchema.nullish(),
    newsletter: baseNewsletterSchema.nullish(),
    count: z
      .object({
        clicks: z.number().nullish(),
        positive_feedback: z.number().nullish(),
        negative_feedback: z.number().nullish(),
      })
      .nullish(),
    authors: z.array(adminAuthorsSchema),
    primary_author: adminAuthorsSchema,
    html: z.string().catch("").optional(),
    plaintext: z.string().catch("").optional(),
  })
);

export type Post = z.infer<typeof adminPostsSchema>;
