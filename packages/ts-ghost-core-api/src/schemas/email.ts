import { z } from "zod/v3";

export const baseEmailSchema = z.object({
  id: z.string(),
  uuid: z.string(),
  status: z.string(),
  recipient_filter: z.string(),
  error: z.string().nullish(),
  error_data: z.any().nullable(),
  email_count: z.number(),
  delivered_count: z.number(),
  opened_count: z.number(),
  failed_count: z.number(),
  subject: z.string(),
  from: z.string(),
  reply_to: z.string().nullable(),
  source: z.string(), // lexical format
  html: z.string().nullable(),
  plaintext: z.string().nullable(),
  track_opens: z.boolean(),
  submitted_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
