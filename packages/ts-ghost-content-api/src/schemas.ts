import { z } from "zod";

export const ContentAPIEndpointsSchema = z.enum(["authors", "tiers", "posts", "pages", "tags"]);
export type ContentAPIEndpoints = z.infer<typeof ContentAPIEndpointsSchema>;

export const VersionsSchema = z.enum(["v5.0", "v2", "v3", "v4", "canary"]).default("v5.0");
export type ContentAPIVersions = z.infer<typeof VersionsSchema>;

export const ContentAPICredentialsSchema = z.object({
  endpoint: ContentAPIEndpointsSchema,
  key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
  version: VersionsSchema,
  url: z.string().url(),
});

export type ContentAPICredentials = z.infer<typeof ContentAPICredentialsSchema>;
