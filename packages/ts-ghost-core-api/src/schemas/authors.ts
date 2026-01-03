import { z } from "zod/v3";

import { ghostIdentitySchema, ghostMetadataSchema } from "./shared";

export const baseAuthorsSchema = z.object({
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
  url: z.string().nullish(),
});
