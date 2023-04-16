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

export const adminPostsCreateSchema = z.object({
  title: z.string().min(1).max(2000),
  slug: z.string().max(191).optional(),
  mobiledoc: z.string().max(1000000000).optional(),
  lexical: z.string().max(1000000000).optional(),
  html: z.string().max(1000000000).optional(),
  feature_image: z.string().max(2000).url().optional(),
  feature_image_alt: z.string().max(65535).optional(),
  feature_image_caption: z.string().max(65535).optional(),
  featured: z.boolean().optional(),
  status: z
    .union([z.literal("draft"), z.literal("published"), z.literal("scheduled"), z.literal("sent")])
    .optional(),
  locale: z.string().max(6).optional(),
  visibility: z
    .union([z.literal("public"), z.literal("internal"), z.literal("members"), z.literal("paid")])
    .optional(),
  visibility_filter: z.string().optional(),
  meta_title: z.string().max(300).optional(),
  meta_description: z.string().max(500).optional(),
  updated_at: z
    .date()
    .transform((val) => val.toISOString())
    .optional(),
  published_at: z
    .date()
    .transform((val) => val.toISOString())
    .optional(),
  custom_excerpt: z.string().max(300).optional(),
  codeinjection_head: z.string().max(65535).optional(),
  codeinjection_foot: z.string().max(65535).optional(),
  og_image: z.string().max(2000).url().optional(),
  og_title: z.string().max(300).optional(),
  og_description: z.string().max(500).optional(),
  twitter_image: z.string().max(2000).url().optional(),
  twitter_title: z.string().max(300).optional(),
  twitter_description: z.string().max(500).optional(),
  email_subject: z.string().max(300).optional(),
  custom_template: z.string().max(100).optional(),
  canonical_url: z.string().max(2000).url().optional(),
  email_only: z.boolean().optional(),
  tags: z
    .array(
      z.union([
        z.object({
          id: z.string({ description: "The ID of the tags" }),
        }),
        z.object({
          name: z.string({ description: "The name of the tags" }),
        }),
        z.object({
          slug: z.string({ description: "The slug of the tags" }),
        }),
      ]),
      {
        description: `The tags associated with the post array of either slug, id or name`,
      }
    )
    .optional(),
  tiers: z
    .array(
      z.union([
        z.object({
          id: z.string({ description: "The ID of the tiers" }),
        }),
        z.object({
          name: z.string({ description: "The name of the tiers" }),
        }),
        z.object({
          slug: z.string({ description: "The slug of the tiers" }),
        }),
      ]),
      {
        description: `The tiers associated with the post array of either slug, id or name`,
      }
    )
    .optional(),
  authors: z
    .array(
      z.union([
        z.object({
          id: z.string({ description: "The ID of the author" }),
        }),
        z.object({
          name: z.string({ description: "The name of the author" }),
        }),
        z.object({
          email: z.string({ description: "The email of the author" }),
        }),
      ]),
      {
        description: `Specifing author via id, name or slug.`,
      }
    )
    .optional(),
});

export type CreatePost = z.infer<typeof adminPostsCreateSchema>;

export const adminPostsUpdateSchema = adminPostsCreateSchema.partial({ title: true }).merge(
  z.object({
    updated_at: z.date().transform((val) => val.toISOString()),
  })
);

export type UpdatePost = z.infer<typeof adminPostsUpdateSchema>;
