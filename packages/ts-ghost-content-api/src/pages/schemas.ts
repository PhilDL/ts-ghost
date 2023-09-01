import { z } from "zod";
import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "@ts-ghost/core-api";

import { authorsSchema } from "../authors/schemas";
import { tagsSchema } from "../tags/schemas";

const postsAuthorSchema = authorsSchema.extend({
  url: z.string().nullish(),
});

export const pagesSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z.string(),
  html: z.string().catch(""),
  plaintext: z.string().nullish(),
  comment_id: z.string().nullable(),
  feature_image: z.string().nullable(),
  feature_image_alt: z.string().nullable(),
  feature_image_caption: z.string().nullable(),
  featured: z.boolean(),
  custom_excerpt: z.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  visibility: ghostVisibilitySchema,
  custom_template: z.string().nullable(),
  canonical_url: z.string().nullable(),
  authors: z.array(postsAuthorSchema).optional(),
  tags: z.array(tagsSchema).optional(),
  primary_author: postsAuthorSchema.nullish(),
  primary_tag: tagsSchema.nullish(),
  url: z.string(),
  excerpt: z.string().catch(""),
  reading_time: z.number().optional().default(0),
  created_at: z.string(),
  updated_at: z.string(),
  published_at: z.string(),
  access: z.boolean(),
  comments: z.boolean(),
  email_subject: z.string().nullish(),
});

export type Page = z.infer<typeof pagesSchema>;

export const pagesIncludeSchema = z.object({
  authors: z.literal(true).optional(),
  tags: z.literal(true).optional(),
});
export type PagesIncludeSchema = z.infer<typeof pagesIncludeSchema>;
