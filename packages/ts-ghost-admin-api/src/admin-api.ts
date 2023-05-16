import { z } from "zod";
import {
  adminAPICredentialsSchema,
  APIComposer,
  APIVersions,
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
    protected readonly version: Version
  ) {
    this.httpClient = new HTTPClient({
      url,
      key,
      version,
      endpoint: "admin",
    });
  }
  get posts() {
    const api = adminAPICredentialsSchema.parse({
      resource: "posts",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "posts";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const postsIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      {
        schema: adminPostsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
        createSchema: adminPostsCreateSchema,
        updateSchema: adminPostsUpdateSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get pages() {
    const api = adminAPICredentialsSchema.parse({
      resource: "pages",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "pages";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const pagesIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
      tiers: z.literal(true).optional(),
    });
    return new APIComposer(
      {
        schema: adminPagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
        createSchema: adminPagesCreateSchema,
        updateSchema: adminPagesUpdateSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get members() {
    const api = adminAPICredentialsSchema.parse({
      resource: "members",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "members";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    return new APIComposer(
      {
        schema: adminMembersSchema,
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        createSchema: adminMembersCreateSchema,
        createOptionsSchema: z.object({
          send_email: z.boolean().optional(),
          email_type: z.union([z.literal("signin"), z.literal("subscribe"), z.literal("signup")]).optional(),
        }),
      },
      api,
      this.httpClient
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get tiers() {
    const api = adminAPICredentialsSchema.parse({
      resource: "tiers",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "tiers";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const tiersIncludeSchema = z.object({
      monthly_price: z.literal(true).optional(),
      yearly_price: z.literal(true).optional(),
      benefits: z.literal(true).optional(),
    });
    return new APIComposer(
      {
        schema: adminTiersSchema,
        identitySchema: slugOrIdSchema,
        include: tiersIncludeSchema,
        createSchema: adminTiersCreateSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read"]); // for now tiers mutations don't really work in the admin api
  }

  get newsletters() {
    const api = adminAPICredentialsSchema.parse({
      resource: "newsletters",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "newsletters";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const newslettersIncludeSchema = z.object({});
    return new APIComposer(
      {
        schema: baseNewsletterSchema,
        identitySchema: slugOrIdSchema,
        include: newslettersIncludeSchema,
        createSchema: adminNewsletterCreateSchema,
        createOptionsSchema: z.object({
          opt_in_existing: z.boolean(),
        }),
      },
      api,
      this.httpClient
    ).access(["browse", "read", "add", "edit"]);
  }

  get offers() {
    const api = adminAPICredentialsSchema.parse({
      resource: "offers",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "offers";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const offersIncludeSchema = z.object({});
    return new APIComposer(
      {
        schema: baseOffersSchema,
        identitySchema: slugOrIdSchema,
        include: offersIncludeSchema,
        createSchema: adminOffersCreateSchema,
        updateSchema: adminOffersUpdateSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read", "add", "edit"]);
  }

  get tags() {
    const api = adminAPICredentialsSchema.parse({
      resource: "tags",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "tags";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const tagsIncludeSchema = z.object({
      "count.posts": z.literal(true).optional(),
    });
    return new APIComposer(
      {
        schema: baseTagsSchema,
        identitySchema: slugOrIdSchema,
        include: tagsIncludeSchema,
        createSchema: adminTagsCreateSchema,
        updateSchema: adminTagsUpdateSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read", "add", "edit", "delete"]);
  }

  get users() {
    const api = adminAPICredentialsSchema.parse({
      resource: "users",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "users";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const usersIncludeSchema = z.object({});
    return new APIComposer(
      {
        schema: adminUsersSchema,
        identitySchema: emailOrIdSchema,
        include: usersIncludeSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read"]);
  }

  get webhooks() {
    const api = adminAPICredentialsSchema.parse({
      resource: "webhooks",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "webhooks";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    return new APIComposer(
      {
        schema: adminWebhookSchema,
        identitySchema: z.object({ id: z.string() }),
        include: z.object({}),
        createSchema: adminWebhookCreateSchema,
        updateSchema: adminWebhookUpdateSchema,
      },
      api,
      this.httpClient
    ).access(["add", "edit", "delete"]);
  }

  get site() {
    const api = adminAPICredentialsSchema.parse({
      resource: "site",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "site";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    return new BasicFetcher({ output: baseSiteSchema }, api, this.httpClient);
  }

  get settings() {
    const api = adminAPICredentialsSchema.parse({
      resource: "settings",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "admin",
    }) as {
      resource: "settings";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    return new BasicFetcher(
      {
        output: z.array(
          z.object({
            key: z.string(),
            value: z.string().nullable().or(z.number().nullable()).or(z.boolean().nullable()),
          })
        ),
      },
      api,
      this.httpClient
    );
  }
}
