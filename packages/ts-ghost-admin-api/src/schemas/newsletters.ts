import { z } from "zod/v3";

export const adminNewsletterCreateSchema = z.object({
  name: z.string(),
  description: z.string().max(3000).optional(),
  sender_name: z.string(),
  sender_email: z.email().nullish(),
  sender_reply_to: z.string().optional(),
  status: z.union([z.literal("active"), z.literal("archived")]).optional(),
  subscribe_on_signup: z.boolean().optional(),
  sort_order: z.number().optional(),
  header_image: z.string().url().nullish(),
  show_header_icon: z.boolean().optional(),
  show_header_title: z.boolean().optional(),
  title_font_category: z.union([z.literal("sans_serif"), z.literal("serif")]).optional(),
  title_alignment: z.string().optional(),
  show_feature_image: z.boolean().optional(),
  body_font_category: z.union([z.literal("sans_serif"), z.literal("serif")]).optional(),
  footer_content: z.string().nullish(),
  show_badge: z.boolean().optional(),
  show_header_name: z.boolean().optional(),
});
