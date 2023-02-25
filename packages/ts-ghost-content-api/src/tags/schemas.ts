import { z } from "zod";
import {
  GhostIdentificationSchema,
  GhostVisibilitySchema,
  GhostMetadataSchema,
  GhostCodeInjectionSchema,
  GhostSocialMediaSchema,
  GhostMetaSchema,
} from "@ts-ghost/core-api";

export const TagSchema = z.object({
  ...GhostIdentificationSchema.shape,
  ...GhostMetadataSchema.shape,
  ...GhostCodeInjectionSchema.shape,
  ...GhostSocialMediaSchema.shape,
  name: z.string(),
  description: z.string().nullable(),
  feature_image: z.string().nullable(),
  visibility: GhostVisibilitySchema,
  canonical_url: z.string().nullable(),
  accent_color: z.string().nullable(),
  url: z.string(),
});

export const tagsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type TagsIncludeSchema = z.infer<typeof tagsIncludeSchema>;
