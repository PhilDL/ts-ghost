import { adminPostsSchema } from "./schemas/posts";
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
}
