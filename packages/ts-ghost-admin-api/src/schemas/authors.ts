import { z } from "zod";
import { baseAuthorsSchema } from "@ts-ghost/core-api";

export const adminAuthorsSchema = baseAuthorsSchema.merge(
  z.object({
    accessibility: z.string().nullish(),
    comment_notifications: z.boolean(),
    created_at: z.string().nullish(),
    updated_at: z.string().nullish(),
    email: z.string().nullish(),
    free_member_signup_notification: z.boolean(),
    last_seen: z.string().nullish(),
    mention_notifications: z.boolean().optional(),
    milestone_notifications: z.boolean().optional(),
    paid_subscription_canceled_notification: z.boolean(),
    paid_subscription_started_notification: z.boolean(),
    status: z.union([z.literal("active"), z.literal("invited"), z.literal("locked")]),
    roles: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          created_at: z.string().nullish(),
          updated_at: z.string().nullish(),
        })
      )
      .optional(),
  })
);

export type Author = z.infer<typeof adminAuthorsSchema>;
