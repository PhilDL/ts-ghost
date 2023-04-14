import { z } from "zod";

import { baseNewsletterSchema } from "./newsletter";
import { baseSubscriptionsSchema } from "./subscriptions";

export const membersCreateSchema = z.object({
  email: z.string({ description: "The email address of the member" }),
  name: z.string({ description: "The name of the member" }).nullish(),
  note: z.string({ description: "(nullable) A note about the member" }).nullish(),
  geolocation: z.string({ description: "(nullable) The geolocation of the member" }).nullish(),
  labels: z
    .array(
      z.union([
        z.object({
          id: z.string({ description: "The ID of the label" }),
        }),
        z.object({
          name: z.string({ description: "The name of the label" }),
        }),
        z.object({
          slug: z.string({ description: "The slug of the label" }),
        }),
      ]),
      { description: "The labels associated with the member" }
    )
    .nullish(),
  products: z
    .array(
      z.union([
        z.object({
          id: z.string({ description: "The ID of the subscription" }),
        }),
        z.object({
          name: z.string({ description: "The name of the subscription" }),
        }),
        z.object({
          slug: z.string({ description: "The slug of the subscription" }),
        }),
      ]),
      {
        description: `The products associated with the member, they correspond to a stripe product. 
          If given the member status will be 'comped' as given away a subscription.`,
      }
    )
    .nullish(),
  // newsletters and subscribed exclude each other. `subscribed`
  newsletters: z
    .array(
      z.union([
        z.object({
          id: z.string({ description: "The ID of the newsletter" }),
        }),
        z.object({
          name: z.string({ description: "The name of the newsletter" }),
        }),
      ]),
      {
        description: `Specifing newsletter to subscribe to via id or name, incompatible with the \`subscribed\` property`,
      }
    )
    .nullish(),
  subscribed: z
    .boolean({
      description:
        "Will subscribe the user to the default Newsletter, incompatible with the `newsletters` property",
    })
    .nullish(),
  comped: z.boolean().nullish(),
  stripe_customer_id: z.string().nullish(),
  // subscriptions: NOT_USED it seems that subscriptions are not used on the API see Ghost source code: ghost/members-api/lib/repositories/member.js (method create)
});

export const baseMembersSchema = z.object({
  id: z.string(),
  email: z.string({ description: "The email address of the member" }),
  name: z.string({ description: "The name of the member" }).nullable(),
  note: z.string({ description: "(nullable) A note about the member" }).nullish(),
  geolocation: z.string({ description: "(nullable) The geolocation of the member" }).nullish(),
  created_at: z.string({ description: "The date and time the member was created" }),
  updated_at: z
    .string({ description: "(nullable) The date and time the member was last updated" })
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
    { description: "The labels associated with the member" }
  ),
  subscriptions: z.array(baseSubscriptionsSchema, {
    description: "The subscriptions associated with the member",
  }),
  avatar_image: z.string({ description: "The URL of the member's avatar image" }),
  email_count: z.number({ description: "The number of emails sent to the member" }),
  email_opened_count: z.number({ description: "The number of emails opened by the member" }),
  email_open_rate: z.number({ description: "(nullable) The open rate of the member" }).nullish(),
  status: z.string({ description: "The status of the member" }),
  last_seen_at: z.string({ description: "(nullable) The date and time the member was last seen" }).nullish(),
  newsletters: z.array(baseNewsletterSchema),
});
