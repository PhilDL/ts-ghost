import { z } from "zod";
import { baseMembersSchema } from "@ts-ghost/core-api";

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
  })
);

export type Member = z.infer<typeof adminMembersSchema>;
