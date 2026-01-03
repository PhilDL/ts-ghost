import { z } from "zod/v3";
import {
  ghostCodeInjectionSchema,
  ghostIdentitySchema,
  ghostMetadataSchema,
  ghostSocialMediaSchema,
  ghostVisibilitySchema,
} from "@ts-ghost/core-api";

export const tagsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
  ...ghostCodeInjectionSchema.shape,
  ...ghostSocialMediaSchema.shape,
  name: z.string(),
  description: z.string().nullable(),
  feature_image: z.string().nullable(),
  visibility: ghostVisibilitySchema,
  canonical_url: z.string().nullable(),
  accent_color: z.string().nullable(),
  url: z.string(),
  count: z
    .object({
      posts: z.number(),
    })
    .optional(),
});

export type Tag = z.infer<typeof tagsSchema>;

export const tagsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type TagsIncludeSchema = z.infer<typeof tagsIncludeSchema>;
