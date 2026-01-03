import { z } from "zod/v3";

import { baseNewsletterSchema } from "./newsletter";
import { baseSubscriptionsSchema } from "./subscriptions";

export const baseMembersSchema = z.object({
  id: z.string(),
  email: z.string().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).nullable(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).nullish(),
  geolocation: z.string().meta({ description: "(nullable) The geolocation of the member" }).nullish(),
  created_at: z.string().meta({ description: "The date and time the member was created" }),
  updated_at: z
    .string()
    .meta({ description: "(nullable) The date and time the member was last updated" })
    .nullish(),
  labels: z.array(
    z.object({
      id: z.string({ description: "The ID of the label" }),
      name: z.string({ description: "The name of the label" }),
      slug: z.string({ description: "The slug of the label" }),
      created_at: z.string({ description: "The date and time the label was created" }),
      updated_at: z
        .string({ description: "(nullable) The date and time the label was last updated" })
        .nullish(),
    }),
    { description: "The labels associated with the member" },
    z.object({
      id: z.string({ description: "The ID of the label" }),
      name: z.string({ description: "The name of the label" }),
      slug: z.string({ description: "The slug of the label" }),
      created_at: z.string({ description: "The date and time the label was created" }),
      updated_at: z
        .string({ description: "(nullable) The date and time the label was last updated" })
        .nullish(),
    }),
    { description: "The labels associated with the member" }
    z
      .object({
        id: z.string().meta({ description: "The ID of the label" }),
        name: z.string().meta({ description: "The name of the label" }),
        slug: z.string().meta({ description: "The slug of the label" }),
        created_at: z.string().meta({ description: "The date and time the label was created" }),
        updated_at: z
          .string()
          .meta({ description: "(nullable) The date and time the label was last updated" })
          .nullish(),
      })
      .meta({ description: "The labels associated with the member" }),
  ),
  subscriptions: z
    .array(baseSubscriptionsSchema)
    .meta({ description: "The subscriptions associated with the member" }),
  avatar_image: z.string().meta({ description: "The URL of the member's avatar image" }),
  email_count: z.number().meta({ description: "The number of emails sent to the member" }),
  email_opened_count: z.number().meta({ description: "The number of emails opened by the member" }),
  email_open_rate: z.number().meta({ description: "(nullable) The open rate of the member" }).nullish(),
  status: z.string().meta({ description: "The status of the member" }),
  last_seen_at: z
    .string()
    .meta({ description: "(nullable) The date and time the member was last seen" })
    .nullish(),
  newsletters: z.array(baseNewsletterSchema),
});
