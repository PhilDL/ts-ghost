import { adminPostsSchema } from "./schemas/posts";
import { adminPagesSchema } from "./schemas/pages";
import { adminMembersSchema } from "./schemas/members";
import { adminTiersSchema } from "./schemas";
import { adminUsersSchema } from "./schemas/users";
import { baseNewsletterSchema, baseOffersSchema, baseTagsSchema } from "@ts-ghost/core-api";
import {
  adminAPICredentialsSchema,
  QueryBuilder,
  AdminAPIVersions,
  baseSiteSchema,
  BasicFetcher,
} from "@ts-ghost/core-api";
import { z } from "zod";

export type { AdminAPICredentials, AdminAPIVersions } from "@ts-ghost/core-api";

export class TSGhostAdminAPI {
  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: AdminAPIVersions
  ) {}
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const postsIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
    });
    return new QueryBuilder(
      {
        schema: adminPostsSchema,
        output: adminPostsSchema,
        include: postsIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const pagesIncludeSchema = z.object({
      authors: z.literal(true).optional(),
      tags: z.literal(true).optional(),
    });
    return new QueryBuilder(
      {
        schema: adminPagesSchema,
        output: adminPagesSchema,
        include: pagesIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const membersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: adminMembersSchema,
        output: adminMembersSchema,
        include: membersIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const tiersIncludeSchema = z.object({
      monthly_price: z.literal(true).optional(),
      yearly_price: z.literal(true).optional(),
      benefits: z.literal(true).optional(),
    });
    return new QueryBuilder(
      {
        schema: adminTiersSchema,
        output: adminTiersSchema,
        include: tiersIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const newslettersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: baseNewsletterSchema,
        output: baseNewsletterSchema,
        include: newslettersIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const offersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: baseOffersSchema,
        output: baseOffersSchema,
        include: offersIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const tagsIncludeSchema = z.object({
      "count.posts": z.literal(true).optional(),
    });
    return new QueryBuilder(
      {
        schema: baseTagsSchema,
        output: baseTagsSchema,
        include: tagsIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    const usersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: adminUsersSchema,
        output: adminUsersSchema,
        include: usersIncludeSchema,
      },
      api
    );
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
      version: AdminAPIVersions;
      url: string;
      endpoint: "admin";
    };
    return new BasicFetcher({ output: baseSiteSchema }, api);
  }
}
