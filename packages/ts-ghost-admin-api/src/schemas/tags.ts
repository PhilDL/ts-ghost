import { z } from "zod/v3";

export const adminTagsCreateSchema = z.object({
  name: z.string().min(1).max(191),
  slug: z.string().max(191).optional(),
  description: z.string().max(500).optional(),
  feature_image: z.url().optional(),
  visibility: z.union([z.literal("public"), z.literal("internal")]).optional(),
  meta_title: z.string().max(300).optional(),
  meta_description: z.string().max(500).optional(),
  og_image: z.string().url().optional(),
  og_title: z.string().max(300).optional(),
  og_description: z.string().max(500).optional(),
  twitter_image: z.string().url().optional(),
  twitter_title: z.string().max(300).optional(),
  twitter_description: z.string().max(500).optional(),
  codeinjection_head: z.string().max(65535).optional(),
  codeinjection_foot: z.string().max(65535).optional(),
  canonical_url: z.string().url().optional(),
  accent_color: z.string().max(50).optional(),
});

export const adminTagsUpdateSchema = adminTagsCreateSchema.merge(
  z.object({
    name: z.string().min(1).max(191).optional(),
  }),
);
