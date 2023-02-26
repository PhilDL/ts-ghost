import { z } from "zod";
import { ghostIdentitySchema, ghostMetaSchema, ghostMetadataSchema } from "@ts-ghost/core-api";

export const authorsSchema = z.object({
  ...ghostIdentitySchema.shape,
  ...ghostMetadataSchema.shape,
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

export type Author = z.infer<typeof authorsSchema>;

export const ghostFetchAuthorsSchema = z.object({
  meta: ghostMetaSchema,
  authors: z.array(authorsSchema),
});

export const authorsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type AuthorsIncludeSchema = z.infer<typeof authorsIncludeSchema>;
