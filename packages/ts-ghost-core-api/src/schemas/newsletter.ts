import { z } from "zod";

import { ghostIdentitySchema } from "./shared";

export const baseNewsletterSchema = z.object({
  ...ghostIdentitySchema.shape,
  name: z.string({ description: "Public name for the newsletter" }),
  description: z.string({ description: "(nullable) Public description of the newsletter" }).nullish(),
  sender_name: z.string({ description: "(nullable) The sender name of the emails" }).nullish(),
  sender_email: z
    .string({ description: "(nullable) The email from which to send emails. Requires validation." })
    .nullish(),
  sender_reply_to: z.string({
    description:
      "The reply-to email address for sent emails. Can be either newsletter (= use sender_email) or support (use support email from Portal settings).",
  }),
  status: z.union([z.literal("active"), z.literal("archived")], {
    description: "active or archived - denotes if the newsletter is active or archived",
  }),
  visibility: z.union([z.literal("public"), z.literal("members")]),
  subscribe_on_signup: z.boolean({
    description: "true/false. Whether members should automatically subscribe to this newsletter on signup",
  }),
  sort_order: z.number({ description: "The order in which newsletters are displayed in the Portal" }),
  header_image: z
    .string({
      description: "(nullable) Path to an image to show at the top of emails. Recommended size 1200x600",
    })
    .nullish(),
  show_header_icon: z.boolean({ description: "true/false. Show the site icon in emails" }),
  show_header_title: z.boolean({ description: "true/false. Show the site name in emails" }),
  title_font_category: z.union([z.literal("serif"), z.literal("sans_serif")], {
    description: "Title font style. Either serif or sans_serif",
  }),
  title_alignment: z.string().nullish(),
  show_feature_image: z.boolean({ description: "true/false. Show the post's feature image in emails" }),
  body_font_category: z.union([z.literal("serif"), z.literal("sans_serif")], {
    description: "Body font style. Either serif or sans_serif",
  }),
  footer_content: z
    .string({
      description:
        "(nullable) Extra information or legal text to show in the footer of emails. Should contain valid HTML.",
    })
    .nullish(),
  show_badge: z.boolean({
    description:
      "true/false. Show you’re a part of the indie publishing movement by adding a small Ghost badge in the footer",
  }),
  created_at: z.string(),
  updated_at: z.string().nullish(),
  show_header_name: z.boolean({ description: "true/false. Show the newsletter name in emails" }),
  uuid: z.string(),
});
