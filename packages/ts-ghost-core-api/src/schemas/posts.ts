import { z } from "zod";
import {
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostCodeInjectionSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "./shared";
import { authorsSchema } from "./authors";
import { tagsSchema } from "./tags";

const postsAuthorSchema = authorsSchema.extend({
  url: z.string().nullish(),
});
export const postsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z.string(),
  html: z.string().nullish(),
  mobiledoc: z.string().nullish(),
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
  excerpt: z.string(),
  reading_time: z.number().optional().default(0),
  created_at: z.string(),
  updated_at: z.string(),
  published_at: z.string(),
  email_subject: z.string().nullish(),
});
