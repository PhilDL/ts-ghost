import { adminPostsSchema } from "./schemas/posts";
import { adminPagesSchema } from "./schemas/pages";
import { adminMembersSchema } from "./schemas/members";
import { adminAPICredentialsSchema, QueryBuilder, AdminAPIVersions } from "@ts-ghost/core-api";
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
        formats: z.array(z.enum(["html", "mobiledoc", "plaintext"])),
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
        formats: z.array(z.enum(["html", "mobiledoc", "plaintext"])),
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
}
