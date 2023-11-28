import { z } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  baseNewsletterSchema,
  baseOffersSchema,
  baseSiteSchema,
  baseTagsSchema,
  BasicFetcher,
  emailOrIdSchema,
  HTTPClient,
  slugOrIdSchema,
} from "@ts-ghost/core-api";

import { adminTiersCreateSchema, adminTiersSchema } from "./schemas";
import { adminMembersCreateSchema, adminMembersSchema } from "./schemas/members";
import { adminNewsletterCreateSchema } from "./schemas/newsletters";
import { adminOffersCreateSchema, adminOffersUpdateSchema } from "./schemas/offers";
import { adminPagesCreateSchema, adminPagesSchema, adminPagesUpdateSchema } from "./schemas/pages";
import { adminPostsCreateSchema, adminPostsSchema, adminPostsUpdateSchema } from "./schemas/posts";
import { adminTagsCreateSchema, adminTagsUpdateSchema } from "./schemas/tags";
import { adminUsersSchema } from "./schemas/users";
import { adminWebhookCreateSchema, adminWebhookSchema, adminWebhookUpdateSchema } from "./schemas/webhooks";

export type { AdminAPICredentials, APIVersions } from "@ts-ghost/core-api";

export class TSGhostAdminAPI<Version extends `v5.${string}` = any> {
  private httpClient: HTTPClient;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
  ) {
    const apiCredentials = adminAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.httpClient = new HTTPClient({
      ...apiCredentials,
      endpoint: "admin",
    });
  }
  get posts() {
    const postsIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      "posts",
      {
        schema: adminPostsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
        createSchema: adminPostsCreateSchema,
        updateSchema: adminPostsUpdateSchema,
        updateOptionsSchema: z.object({
          newsletter: z.string().optional(),
          email_segment: z.string().optional(),
          force_rerender: z.boolean().optional(),
          save_revision: z.boolean().optional(),
          convert_to_lexical: z.boolean().optional(),
          source: z.literal("html").optional(),
        }),
        createOptionsSchema: z.object({
          source: z.literal("html").optional(),
        }),
      },
      this.httpClient,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get pages() {
    const pagesIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      "pages",
      {
        schema: adminPagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
        createSchema: adminPagesCreateSchema,
        updateSchema: adminPagesUpdateSchema,
      },
      this.httpClient,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get members() {
    return new APIComposer(
      "members",
      {
        schema: adminMembersSchema,
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        createSchema: adminMembersCreateSchema,
        createOptionsSchema: z.object({
          send_email: z.boolean().optional(),
          email_type: z.union([z.literal("signin"), z.literal("subscribe"), z.literal("signup")]).optional(),
        }),
        updateOptionsSchema: z.object({
          send_email: z.boolean().optional(),
          email_type: z.union([z.literal("signin"), z.literal("subscribe"), z.literal("signup")]).optional(),
        }),
      },
      this.httpClient,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get tiers() {
    const tiersIncludeSchema = z.object({
      monthly_price: z.literal(true).optional(),
      yearly_price: z.literal(true).optional(),
      benefits: z.literal(true).optional(),
    });
    return new APIComposer(
      "tiers",
      {
        schema: adminTiersSchema,
        identitySchema: slugOrIdSchema,
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema,
      },
      this.httpClient,
    ).access(["browse", "read"]); // for now tiers mutations don't really work in the admin api
  }

  get newsletters() {
    const newslettersIncludeSchema = z.object({});
    return new APIComposer(
      "newsletters",
      {
        schema: baseNewsletterSchema,
        identitySchema: slugOrIdSchema,
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: z.object({
          opt_in_existing: z.boolean(),
        }),
      },
      this.httpClient,
    ).access(["browse", "read", "add", "edit"]);
  }

  get offers() {
    const offersIncludeSchema = z.object({});
    return new APIComposer(
      "offers",
      {
        schema: baseOffersSchema,
        identitySchema: slugOrIdSchema,
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema,
      },
      this.httpClient,
    ).access(["browse", "read", "add", "edit"]);
  }

  get tags() {
    const tagsIncludeSchema = z.object({
      "count.posts": z.literal(true).optional(),
    });
    return new APIComposer(
      "tags",
      {
        schema: baseTagsSchema,
        identitySchema: slugOrIdSchema,
        include: tagsIncludeSchema,
        createSchema: adminTagsCreateSchema,
        updateSchema: adminTagsUpdateSchema,
      },
      this.httpClient,
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get users() {
    const usersIncludeSchema = z.object({});
    return new APIComposer(
      "users",
      {
        schema: adminUsersSchema,
        identitySchema: emailOrIdSchema,
        include: usersIncludeSchema,
      },
      this.httpClient,
    ).access(["browse", "read"]);
  }

  get webhooks() {
    return new APIComposer(
      "webhooks",
      {
        schema: adminWebhookSchema,
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        createSchema: adminWebhookCreateSchema,
        updateSchema: adminWebhookUpdateSchema,
      },
      this.httpClient,
    ).access(["add", "edit", "delete"]);
  }

  get site() {
    return new BasicFetcher("site", { output: baseSiteSchema }, this.httpClient);
  }

  get settings() {
    return new BasicFetcher(
      "settings",
      {
        output: z.array(
          z.object({
            key: z.string(),
            value: z.string().nullable().or(z.number().nullable()).or(z.boolean().nullable()),
          }),
        ),
      },
      this.httpClient,
    );
  }
}
