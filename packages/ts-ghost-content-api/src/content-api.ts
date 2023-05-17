import {
  APIComposer,
  APIVersions,
  BasicFetcher,
  contentAPICredentialsSchema,
  HTTPClient,
  slugOrIdSchema,
} from "@ts-ghost/core-api";

import { authorsIncludeSchema, authorsSchema } from "./authors/schemas";
import { pagesIncludeSchema, pagesSchema } from "./pages/schemas";
import { postsIncludeSchema, postsSchema } from "./posts/schemas";
import { settingsSchema } from "./settings/schemas";
import { tagsIncludeSchema, tagsSchema } from "./tags/schemas";
import { tiersIncludeSchema, tiersSchema } from "./tiers/schemas";

export type { ContentAPICredentials, APIVersions } from "@ts-ghost/core-api";

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
  settings = "settings",
}

export class TSGhostContentAPI<Version extends `v5.${string}` = any> {
  private httpClient: HTTPClient;

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version
  ) {
    const apiCredentials = contentAPICredentialsSchema.parse({
      key,
      version,
      url,
    });
    this.httpClient = new HTTPClient({
      ...apiCredentials,
      endpoint: "content",
    });
  }

  get authors() {
    return new APIComposer(
      "authors",
      {
        schema: authorsSchema,
        identitySchema: slugOrIdSchema,
        include: authorsIncludeSchema,
      },
      this.httpClient
    ).access(["read", "browse"]);
  }
  get tiers() {
    return new APIComposer(
      "tiers",
      { schema: tiersSchema, identitySchema: slugOrIdSchema, include: tiersIncludeSchema },
      this.httpClient
    ).access(["browse", "read"]);
  }
  get posts() {
    return new APIComposer(
      "posts",
      {
        schema: postsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
      },
      this.httpClient
    ).access(["browse", "read"]);
  }
  get pages() {
    return new APIComposer(
      "pages",
      {
        schema: pagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
      },
      this.httpClient
    ).access(["browse", "read"]);
  }
  get tags() {
    return new APIComposer(
      "tags",
      { schema: tagsSchema, identitySchema: slugOrIdSchema, include: tagsIncludeSchema },
      this.httpClient
    ).access(["browse", "read"]);
  }

  get settings() {
    return new BasicFetcher("settings", { output: settingsSchema }, this.httpClient);
  }
}
