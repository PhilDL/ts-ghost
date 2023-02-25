import { z } from "zod";

export const GhostIdentificationSchema = z.object({
  slug: z.string(),
  id: z.string(),
});

export const GhostMetaSchema = z.object({
  pagination: z.object({
    pages: z.number(),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    prev: z.number().nullable(),
    next: z.number().nullable(),
  }),
});

export const GhostExcerptSchema = z.object({
  excerpt: z.string().optional(),
  custom_excerpt: z.string().optional(),
});

export const GhostCodeInjectionSchema = z.object({
  codeinjection_head: z.string().nullable(),
  codeinjection_foot: z.string().nullable(),
});

export const GhostFacebookSchema = z.object({
  og_image: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
});

export const GhostTwitterSchema = z.object({
  twitter_image: z.string().nullable(),
  twitter_title: z.string().nullable(),
  twitter_description: z.string().nullable(),
});

export const GhostSocialMediaSchema = z.object({
  ...GhostFacebookSchema.shape,
  ...GhostTwitterSchema.shape,
});

export const GhostMetadataSchema = z.object({
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
});

export const GhostVisibilitySchema = z.union([z.literal("public"), z.literal("members"), z.literal("none")]);
