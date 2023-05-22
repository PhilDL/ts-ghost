import { z } from "zod";

import type { HTTPClient } from "../helpers/http-client";

export const ghostIdentitySchema = z.object({
  slug: z.string(),
  id: z.string(),
});

export const ghostIdentityInputSchema = z.object({
  slug: z.string().optional(),
  id: z.string().optional(),
  email: z.string().email().optional(),
});

export type GhostIdentityInput = z.infer<typeof ghostIdentityInputSchema>;

export type GhostIdentity = z.infer<typeof ghostIdentitySchema>;

export const ghostMetaSchema = z.object({
  pagination: z.object({
    pages: z.number(),
    page: z.number(),
    limit: z.union([z.number(), z.literal("all")]),
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
  z.literal("tiers"),
]);

export const apiVersionsSchema = z
  .string()
  .regex(/^v5\.\d+/)
  .default("v5.0");
export type TAPIVersion<V> = V extends "v5.0" | `v5.${infer Minor}` ? `v5.${Minor}` : never;
export type APIVersions = z.infer<typeof apiVersionsSchema>;

export const contentAPICredentialsSchema = z.object({
  key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
  version: apiVersionsSchema,
  url: z.string().url(),
});

export type ContentAPICredentials = z.infer<typeof contentAPICredentialsSchema>;

export type APIResource =
  | "pages"
  | "posts"
  | "settings"
  | "authors"
  | "tiers"
  | "tags"
  | "members"
  | "site"
  | "offers"
  | "users"
  | "newsletters"
  | "webhooks"
  | "themes"
  | "files"
  | "images";

export type APIEndpoint = "admin" | "content";

export type APICredentials = {
  key: string;
  version: APIVersions;
  url: string;
};

export type GhostRequestConfig = {
  endpoint: APIEndpoint;
  resource: APIResource;
  httpClient: HTTPClient;
};

export const adminAPICredentialsSchema = z.object({
  key: z.string().regex(/[0-9a-f]{24}:[0-9a-f]{64}/, {
    message:
      "'key' must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters",
  }),
  version: apiVersionsSchema,
  url: z.string().url(),
});

export const slugOrIdSchema = z.union([z.object({ slug: z.string() }), z.object({ id: z.string() })]);
export const emailOrIdSchema = z.union([
  z.object({ email: z.string().email() }),
  z.object({ id: z.string() }),
]);
export const identitySchema = z.union([
  z.object({ email: z.string().email() }),
  z.object({ id: z.string() }),
  z.object({ slug: z.string() }),
]);

export type AdminAPICredentials = z.infer<typeof adminAPICredentialsSchema>;
