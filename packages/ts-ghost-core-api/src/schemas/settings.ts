import { z } from "zod/v3";

export const baseSettingsSchema = z.object({
  title: z.string(),
  description: z.string(),
  logo: z.string().nullable(),
  icon: z.string().nullable(),
  accent_color: z.string().nullable(),
  cover_image: z.string().nullable(),
  facebook: z.string().nullable(),
  twitter: z.string().nullable(),
  lang: z.string(),
  timezone: z.string(),
  codeinjection_head: z.string().nullable(),
  codeinjection_foot: z.string().nullable(),
  navigation: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    }),
  ),
  secondary_navigation: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    }),
  ),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  og_image: z.string().nullable(),
  og_title: z.string().nullable(),
  og_description: z.string().nullable(),
  twitter_image: z.string().nullable(),
  twitter_title: z.string().nullable(),
  twitter_description: z.string().nullable(),
  members_support_address: z.string(),
  url: z.string(),
});
