import { z } from "zod/v3";
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
    lexical: z
      .string()
      .catch(
        '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
      )
      .optional(),
    html: z.string().catch("").optional(),
    plaintext: z.string().catch("").optional(),
  }),
);

export type Page = z.infer<typeof adminPagesSchema>;

export const adminPagesCreateSchema = z.object({
  title: z.string().min(1).max(2000),
  slug: z.string().max(191).optional(),
  mobiledoc: z.string().max(1000000000).optional(),
  lexical: z.string().max(1000000000).optional(),
  html: z.string().max(1000000000).optional(),
  feature_image: z.string().max(2000).url().optional(),
  feature_image_alt: z.string().max(65535).optional(),
  feature_image_caption: z.string().max(65535).optional(),
  featured: z.boolean().optional(),
  status: z.union([z.literal("draft"), z.literal("published"), z.literal("scheduled")]).optional(),
  locale: z.string().max(6).optional(),
  visibility: z
    .union([
      z.literal("public"),
      z.literal("internal"),
      z.literal("members"),
      z.literal("paid"),
      z.literal("tiers"),
    ])
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
  custom_template: z.string().max(100).optional(),
  canonical_url: z.string().max(2000).url().optional(),
  tags: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the tags" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the tags" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the tags" }),
        }),
      ]),
      {
        description: `The tags associated with the post array of either slug, id or name`,
      },
    )
    .meta({
      description: `The tags associated with the post array of either slug, id or name`,
    })
    .optional(),
  tiers: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the tiers" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the tiers" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the tiers" }),
        }),
      ]),
      {
        description: `The tiers associated with the post array of either slug, id or name`,
      },
    )
    .meta({
      description: `The tiers associated with the post array of either slug, id or name`,
    })
    .optional(),
  authors: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the author" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the author" }),
        }),
        z.object({
          email: z.string().meta({ description: "The email of the author" }),
        }),
      ]),
      {
        description: `Specifing author via id, name or slug.`,
      },
    )
    .meta({
      description: `Specifing author via id, name or slug.`,
    })
    .optional(),
});

export type CreatePage = z.infer<typeof adminPagesCreateSchema>;

export const adminPagesUpdateSchema = adminPagesCreateSchema.partial({ title: true }).merge(
  z.object({
    updated_at: z.date().transform((val) => val.toISOString()),
  }),
);

export type UpdatePage = z.infer<typeof adminPagesUpdateSchema>;
