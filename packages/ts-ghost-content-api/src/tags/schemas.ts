import { z } from "zod";
import {
  ghostIdentitySchema,
  ghostVisibilitySchema,
  ghostMetadataSchema,
  ghostCodeInjectionSchema,
  ghostSocialMediaSchema,
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
});

export type Tag = z.infer<typeof tagsSchema>;

export const tagsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type TagsIncludeSchema = z.infer<typeof tagsIncludeSchema>;
