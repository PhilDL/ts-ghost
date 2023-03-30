import { adminPostsSchema } from "./schemas/posts";
import { adminPagesSchema } from "./schemas/pages";
import { adminMembersSchema } from "./schemas/members";
import { adminTiersSchema } from "./schemas";
import { adminUsersSchema } from "./schemas/users";
import { baseNewsletterSchema, baseOffersSchema, baseTagsSchema } from "@ts-ghost/core-api";
import {
  QueryBuilder,
  BasicFetcher,
  APIVersions,
  baseSiteSchema,
  adminAPICredentialsSchema,
  slugOrIdSchema,
  emailOrIdSchema,
} from "@ts-ghost/core-api";
import { z } from "zod";

export type { AdminAPICredentials, APIVersions } from "@ts-ghost/core-api";

export class TSGhostAdminAPI<Version extends `v5.${string}` = any> {
  constructor(protected readonly url: string, protected readonly key: string, protected readonly version: Version) {}
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
    });
    return new QueryBuilder(
      {
        schema: adminPostsSchema,
        identitySchema: slugOrIdSchema,
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
      version: APIVersions;
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
        identitySchema: slugOrIdSchema,
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
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const membersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: adminMembersSchema,
        identitySchema: z.object({ id: z.string() }),
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
      version: APIVersions;
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
        identitySchema: slugOrIdSchema,
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
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const newslettersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: baseNewsletterSchema,
        identitySchema: slugOrIdSchema,
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
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const offersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: baseOffersSchema,
        identitySchema: slugOrIdSchema,
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
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const tagsIncludeSchema = z.object({
      "count.posts": z.literal(true).optional(),
    });
    return new QueryBuilder(
      {
        schema: baseTagsSchema,
        identitySchema: slugOrIdSchema,
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
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    const usersIncludeSchema = z.object({});
    return new QueryBuilder(
      {
        schema: adminUsersSchema,
        identitySchema: emailOrIdSchema,
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
      version: APIVersions;
      url: string;
      endpoint: "admin";
    };
    return new BasicFetcher({ output: baseSiteSchema }, api);
  }
}
