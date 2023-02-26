import { z } from "zod";
import { GhostIdentificationSchema, GhostMetaSchema, GhostMetadataSchema } from "@ts-ghost/core-api";

export const AuthorSchema = z.object({
  ...GhostIdentificationSchema.shape,
  ...GhostMetadataSchema.shape,
  name: z.string(),
  profile_image: z.string().nullable(),
  cover_image: z.string().nullable(),
  bio: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  count: z
    .object({
      posts: z.number(),
    })
    .optional(),
  url: z.string(),
});

export const GhostFetchAuthorsSchema = z.object({
  meta: GhostMetaSchema,
  authors: z.array(AuthorSchema),
});

export const authorsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type AuthorsIncludeSchema = z.infer<typeof authorsIncludeSchema>;
