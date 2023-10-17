import { z } from "zod";
import { baseMembersSchema } from "@ts-ghost/core-api";

export const adminMembersCreateSchema = z.object({
  email: z.string({ description: "The email address of the member" }).email(),
  name: z.string({ description: "The name of the member" }).optional(),
  note: z.string({ description: "(nullable) A note about the member" }).optional(),
  geolocation: z.string({ description: "(nullable) The geolocation of the member" }).optional(),
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
      { description: "The labels associated with the member" },
    )
    .optional(),
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
      },
    )
    .optional(),
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
      },
    )
    .optional(),
  subscribed: z
    .boolean({
      description:
        "Will subscribe the user to the default Newsletter, incompatible with the `newsletters` property",
    })
    .optional(),
  comped: z.boolean().optional(),
  stripe_customer_id: z.string().optional(),
  // subscriptions: NOT_USED it seems that subscriptions are not used on the API see Ghost source code: ghost/members-api/lib/repositories/member.js (method create)
});

export const adminMembersSchema = baseMembersSchema.merge(
  z.object({
    subscribed: z.boolean(),
    comped: z.boolean().nullish(),
    email_suppression: z
      .object({
        suppressed: z.boolean(),
        info: z.string().nullish(),
      })
      .nullish(),
    newsletters: z.array(
      z.object({
        id: z.string(),
        name: z.string({ description: "Public name for the newsletter" }),
        description: z.string({ description: "(nullable) Public description of the newsletter" }).nullish(),
        status: z.union([z.literal("active"), z.literal("archived")], {
          description: "active or archived - denotes if the newsletter is active or archived",
        }),
      }),
    ),
  }),
);

export type Member = z.infer<typeof adminMembersSchema>;
