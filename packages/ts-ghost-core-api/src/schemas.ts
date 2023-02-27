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
]);

export const contentAPIEndpointsSchema = z.union([
  z.literal("authors"),
  z.literal("tiers"),
  z.literal("posts"),
  z.literal("pages"),
  z.literal("tags"),
  z.literal("settings"),
]);
export type ContentAPIEndpoints = z.infer<typeof contentAPIEndpointsSchema>;

export const apiVersionsSchema = z.enum(["v5.0", "v2", "v3", "v4", "canary"]).default("v5.0");
export type ContentAPIVersions = z.infer<typeof apiVersionsSchema>;

export const contentAPICredentialsSchema = z.discriminatedUnion("endpoint", [
  z.object({
    endpoint: z.literal("authors"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("tiers"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("pages"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("posts"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("tags"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
  }),
  z.object({
    endpoint: z.literal("settings"),
    key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
    version: apiVersionsSchema,
    url: z.string().url(),
  }),
]);

export type ContentAPICredentials = z.infer<typeof contentAPICredentialsSchema>;
