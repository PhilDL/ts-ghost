import { z } from "zod/v3";

export const ghostEventTypes = z.union([
  z.literal("site.changed", {
    description: "Triggered whenever any content changes in your site data or settings",
  }),
  z.literal("post.added", { description: "Triggered whenever a post is added to Ghost" }),
  z.literal("post.deleted", { description: "Triggered whenever a post is deleted from Ghost" }),
  z.literal("post.edited", { description: "Triggered whenever a post is edited in Ghost" }),
  z.literal("post.published", { description: "Triggered whenever a post is published to Ghost" }),
  z.literal("post.published.edited", {
    description: "Triggered whenever a published post is edited in Ghost",
  }),
  z.literal("post.unpublished", { description: "Triggered whenever a post is unpublished from Ghost" }),
  z.literal("post.scheduled", {
    description: "Triggered whenever a post is scheduled to be published in Ghost",
  }),
  z.literal("post.unscheduled", {
    description: "Triggered whenever a post is unscheduled from publishing in Ghost",
  }),
  z.literal("post.rescheduled", {
    description: "Triggered whenever a post is rescheduled to publish in Ghost",
  }),
  z.literal("page.added", { description: "Triggered whenever a page is added to Ghost" }),
  z.literal("page.deleted", { description: "Triggered whenever a page is deleted from Ghost" }),
  z.literal("page.edited", { description: "Triggered whenever a page is edited in Ghost" }),
  z.literal("page.published", { description: "Triggered whenever a page is published to Ghost" }),
  z.literal("page.published.edited", {
    description: "Triggered whenever a published page is edited in Ghost",
  }),
  z.literal("page.unpublished", { description: "Triggered whenever a page is unpublished from Ghost" }),
  z.literal("page.scheduled", {
    description: "Triggered whenever a page is scheduled to be published in Ghost",
  }),
  z.literal("page.unscheduled", {
    description: "Triggered whenever a page is unscheduled from publishing in Ghost",
  }),
  z.literal("page.rescheduled", {
    description: "Triggered whenever a page is rescheduled to publish in Ghost",
  }),
  z.literal("tag.added", { description: "Triggered whenever a tag is added to Ghost" }),
  z.literal("tag.edited", { description: "Triggered whenever a tag is edited in Ghost" }),
  z.literal("tag.deleted", { description: "Triggered whenever a tag is deleted from Ghost" }),
  z.literal("post.tag.attached", { description: "Triggered whenever a tag is attached to a post in Ghost" }),
  z.literal("post.tag.detached", {
    description: "Triggered whenever a tag is detached from a post in Ghost",
  }),
  z.literal("page.tag.attached", { description: "Triggered whenever a tag is attached to a page in Ghost" }),
  z.literal("page.tag.detached", {
    description: "Triggered whenever a tag is detached from a page in Ghost",
  }),
  z.literal("member.added", { description: "Triggered whenever a member is added to Ghost" }),
  z.literal("member.edited", { description: "Triggered whenever a member is edited in Ghost" }),
  z.literal("member.deleted", { description: "Triggered whenever a member is deleted from Ghost" }),
]);

export type GhostWebhookEventTypes = z.infer<typeof ghostEventTypes>;

export const adminWebhookSchema = z.object({
  id: z.string({ description: "The ID of the webhook" }),
  event: ghostEventTypes,
  target_url: z.string({ description: "The URL of the webhook" }).url(),
  name: z.string({ description: "The name of the webhook" }).nullish(),
  secret: z.string({ description: "The secret of the webhook" }).nullish(),
  api_version: z.string({ description: "The API version of the webhook" }).nullish(),
  integration_id: z.string({ description: "The ID of the integration" }).nullish(),
  status: z.string({ description: "The status of the webhook" }).nullish(),
  last_triggered_at: z.string({ description: "The date and time of the last webhook trigger" }).nullish(),
  last_triggered_status: z.string({ description: "The status of the last webhook trigger" }).nullish(),
  last_triggered_error: z.string({ description: "The error of the last webhook trigger" }).nullish(),
  created_at: z.string({ description: "The date and time of the webhook creation" }),
  updated_at: z.string({ description: "The date and time of the webhook update" }).nullish(),
});

export const adminWebhookCreateSchema = z.object({
  event: ghostEventTypes,
  target_url: z.string({ description: "The URL of the webhook" }).url(),
  name: z.string({ description: "The name of the webhook" }).optional(),
  secret: z.string({ description: "The secret of the webhook" }).nullish(),
  api_version: z.string({ description: "The API version of the webhook" }).nullish(),
  integration_id: z.string({ description: "The ID of the integration" }).nullish(),
});

export const adminWebhookUpdateSchema = z.object({
  event: ghostEventTypes.optional(),
  target_url: z.string({ description: "The URL of the webhook" }).url().optional(),
  name: z.string({ description: "The name of the webhook" }).optional(),
  api_version: z.string({ description: "The API version of the webhook" }).nullish(),
});
