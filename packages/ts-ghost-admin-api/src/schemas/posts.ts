import { z } from "zod";
import { basePostsSchema, baseEmailSchema, baseNewsletterSchema } from "@ts-ghost/core-api";
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
    tiers: z.array(adminTiersSchema),
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
    html: z.string().optional(),
  })
);

export type Post = z.infer<typeof adminPostsSchema>;
