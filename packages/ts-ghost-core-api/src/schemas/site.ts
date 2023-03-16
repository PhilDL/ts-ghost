import { z } from "zod";

export const baseSiteSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  version: z.string(),
  url: z.string(),
});
