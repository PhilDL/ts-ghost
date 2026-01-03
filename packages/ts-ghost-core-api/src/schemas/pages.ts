import { z } from "zod/v3";

import { baseAuthorsSchema } from "./authors";
import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "./shared";
import { baseTagsSchema } from "./tags";

const postsAuthorSchema = baseAuthorsSchema.extend({
  url: z.string().nullish(),
});

export const basePagesSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z.string(),
  html: z.string().nullish(),
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
  tags: z.array(baseTagsSchema).optional(),
  primary_author: postsAuthorSchema.nullish(),
  primary_tag: baseTagsSchema.nullish(),
  url: z.string(),
  excerpt: z.string().nullish(),
  reading_time: z.number().optional().default(0),
  created_at: z.string(),
  updated_at: z.string().nullish(),
  published_at: z.string().nullable(),
  email_subject: z.string().nullish(),
  is_page: z.boolean().default(true),
});
