import { z } from "zod/v3";

export const baseSiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  version: z.string(),
  url: z.string(),
});
