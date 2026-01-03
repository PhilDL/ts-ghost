import { z } from "zod/v3";
import { baseMembersSchema } from "@ts-ghost/core-api";

export const adminMembersCreateSchema = z.object({
  email: z.email().meta({ description: "The email address of the member" }),
  name: z.string().meta({ description: "The name of the member" }).optional(),
  note: z.string().meta({ description: "(nullable) A note about the member" }).optional(),
  geolocation: z.string().meta({ description: "(nullable) The geolocation of the member" }).optional(),
  labels: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the label" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the label" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the label" }),
        }),
      ]),
    )
    .meta({ description: "The labels associated with the member" })
    .optional(),
  products: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the subscription" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the subscription" }),
        }),
        z.object({
          slug: z.string().meta({ description: "The slug of the subscription" }),
        }),
      ]),
    )
    .meta({
      description: `The products associated with the member, they correspond to a stripe product. 
          If given the member status will be 'comped' as given away a subscription.`,
    })
    .optional(),
  // newsletters and subscribed exclude each other. `subscribed`
  newsletters: z
    .array(
      z.union([
        z.object({
          id: z.string().meta({ description: "The ID of the newsletter" }),
        }),
        z.object({
          name: z.string().meta({ description: "The name of the newsletter" }),
        }),
      ]),
    )
    .meta({
      description: `Specifing newsletter to subscribe to via id or name, incompatible with the \`subscribed\` property`,
    })
    .optional(),
  subscribed: z
    .boolean()
    .meta({
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
        name: z.string().meta({ description: "Public name for the newsletter" }),
        description: z
          .string()
          .meta({ description: "(nullable) Public description of the newsletter" })
          .nullish(),
        status: z.union([z.literal("active"), z.literal("archived")]).meta({
          description: "active or archived - denotes if the newsletter is active or archived",
        }),
      }),
    ),
  }),
);

export type Member = z.infer<typeof adminMembersSchema>;
