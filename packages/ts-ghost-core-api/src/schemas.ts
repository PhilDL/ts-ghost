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

export const ContentAPIEndpointsSchema = z.union([
  z.literal("authors"),
  z.literal("tiers"),
  z.literal("posts"),
  z.literal("pages"),
  z.literal("tags"),
]);
export type ContentAPIEndpoints = z.infer<typeof ContentAPIEndpointsSchema>;

export const VersionsSchema = z.enum(["v5.0", "v2", "v3", "v4", "canary"]).default("v5.0");
export type ContentAPIVersions = z.infer<typeof VersionsSchema>;

export const ContentAPICredentialsSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("authors"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: VersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("tiers"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: VersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("pages"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: VersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("posts"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: VersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("tags"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: VersionsSchema,
    url: z.string().url(),
  }),
]);

export type ContentAPICredentials = z.infer<typeof ContentAPICredentialsSchema>;
