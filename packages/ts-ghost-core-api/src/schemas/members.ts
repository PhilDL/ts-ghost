import { z } from "zod";
import { baseNewsletterSchema } from "./newsletter";

export const baseMembersSchema = z.object({
  id: z.string(),
  email: z.string({ description: "The email address of the member" }),
  name: z.string({ description: "The name of the member" }),
  note: z.string({ description: "(nullable) A note about the member" }).nullish(),
  geolocation: z.string({ description: "(nullable) The geolocation of the member" }).nullish(),
  created_at: z.string({ description: "The date and time the member was created" }),
  updated_at: z.string({ description: "(nullable) The date and time the member was last updated" }).nullish(),
  labels: z.array(
    z.object({
      id: z.string({ description: "The ID of the label" }),
      name: z.string({ description: "The name of the label" }),
      slug: z.string({ description: "The slug of the label" }),
      created_at: z.string({ description: "The date and time the label was created" }),
      updated_at: z.string({ description: "(nullable) The date and time the label was last updated" }).nullish(),
    }),
    { description: "The labels associated with the member" }
  ),
  subscriptions: z.array(z.string({ description: "The subscriptions associated with the member" })),
  avatar_image: z.string({ description: "The URL of the member's avatar image" }),
  email_count: z.number({ description: "The number of emails sent to the member" }),
  email_opened_count: z.number({ description: "The number of emails opened by the member" }),
  email_open_rate: z.number({ description: "(nullable) The open rate of the member" }).nullish(),
  status: z.string({ description: "The status of the member" }),
  last_seen_at: z.string({ description: "(nullable) The date and time the member was last seen" }).nullish(),
  newsletters: z.array(baseNewsletterSchema),
});
