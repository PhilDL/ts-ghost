import { z } from "zod";
import {
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostCodeInjectionSchema,
  ghostSocialMediaSchema,
} from "@ts-ghost/core-api";
import { authorsSchema } from "../authors/schemas";
import { tagsSchema } from "../tags/schemas";

export const postsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  title: z.string(),
  html: z.string(),
  comment_id: z.string().nullable(),
  feature_image: z.string().nullable(),
  feature_image_alt: z.string().nullable(),
  feature_image_caption: z.string().nullable(),
  featured: z.boolean(),
  custom_excerpt: z.string().nullable(),
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  custom_template: z.string().nullable(),
  canonical_url: z.string().nullable(),
  authors: z.array(authorsSchema).nullable(),
  tags: z.array(tagsSchema).nullable(),
  primary_author: authorsSchema,
  primary_tag: tagsSchema.nullable(),
  url: z.string(),
  excerpt: z.string(),
});

export type Post = z.infer<typeof postsSchema>;

export const postsIncludeSchema = z.object({
  authors: z.literal(true).optional(),
  tags: z.literal(true).optional(),
});
export type PostsIncludeSchema = z.infer<typeof postsIncludeSchema>;
