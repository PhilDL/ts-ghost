import { z } from "zod";

export const ghostIdentitySchema = z.object({
  slug: z.string(),
  id: z.string(),
});

export const ghostIdentityInputSchema = z.object({
  slug: z.string().optional(),
  id: z.string().optional(),
});

export type GhostIdentityInput = z.infer<typeof ghostIdentityInputSchema>;

export const queryIdentitySchema = z
  .object({
    slug: z.string().optional(),
    id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.slug === undefined && data.id === undefined) {
        return {
          message: "Either slug or id must be provided",
          path: [],
        };
      }
      return true;
    },
    {
      message: "Either slug or id must be provided",
      path: [],
    }
  );

export type GhostIdentity = z.infer<typeof ghostIdentitySchema>;

export const ghostMetaSchema = z.object({
  pagination: z.object({
    pages: z.number(),
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    prev: z.number().nullable(),
    next: z.number().nullable(),
  }),
});

export type GhostMeta = z.infer<typeof ghostMetaSchema>;

export const ghostExcerptSchema = z.object({
  excerpt: z.string().optional(),
  custom_excerpt: z.string().optional(),
});

export const ghostCodeInjectionSchema = z.object({
  codeinjection_head: z.string().nullable(),
  codeinjection_foot: z.string().nullable(),
});

export const ghostFacebookSchema = z.object({
  og_image: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
});

export const ghostTwitterSchema = z.object({
  twitter_image: z.string().nullable(),
  twitter_title: z.string().nullable(),
  twitter_description: z.string().nullable(),
});

export const ghostSocialMediaSchema = z.object({
  ...ghostFacebookSchema.shape,
  ...ghostTwitterSchema.shape,
});

export const ghostMetadataSchema = z.object({
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
});

export const ghostVisibilitySchema = z.union([
  z.literal("public"),
  z.literal("members"),
  z.literal("none"),
  z.literal("internal"),
  z.literal("paid"),
]);

export const apiVersionsSchema = z.enum(["v5.0", "v2", "v3", "v4", "canary"]).default("v5.0");
export type ContentAPIVersions = z.infer<typeof apiVersionsSchema>;
export type AdminAPIVersions = z.infer<typeof apiVersionsSchema>;

export const contentAPICredentialsSchema = z.discriminatedUnion("resource", [
  z.object({
    resource: z.literal("authors"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("content"),
  }),
  z.object({
    resource: z.literal("tiers"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("content"),
  }),
  z.object({
    resource: z.literal("pages"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("content"),
  }),
  z.object({
    resource: z.literal("posts"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("content"),
  }),
  z.object({
    resource: z.literal("tags"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("content"),
  }),
  z.object({
    resource: z.literal("settings"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("content"),
  }),
]);

export type ContentAPICredentials = z.infer<typeof contentAPICredentialsSchema>;

export type APICredentials = {
  resource: "pages" | "posts" | "settings" | "authors" | "tiers" | "tags";
  key: string;
  version: ContentAPIVersions;
  url: string;
  endpoint: "admin" | "content";
};

export const adminAPIEndpointsSchema = z.union([z.literal("posts"), z.literal("pages")]);
export type AdminAPIEndpoints = z.infer<typeof adminAPIEndpointsSchema>;

export const adminAPICredentialsSchema = z.discriminatedUnion("resource", [
  z.object({
    resource: z.literal("pages"),
    key: z
      .string()
      .regex(/[0-9a-f]{24}:[0-9a-f]{64}/, {
        message:
          "'key' must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters",
      }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("admin"),
  }),
  z.object({
    resource: z.literal("posts"),
    key: z
      .string()
      .regex(/[0-9a-f]{24}:[0-9a-f]{64}/, {
        message:
          "'key' must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters",
      }),
    version: apiVersionsSchema,
    url: z.string().url(),
    endpoint: z.literal("admin"),
  }),
]);

export type AdminAPICredentials = z.infer<typeof adminAPICredentialsSchema>;
