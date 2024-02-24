import {
  APIComposer,
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
  private credentials: {
    url: string;
    key: string;
    version: string;
  };

  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version,
  ) {
    this.credentials = contentAPICredentialsSchema.parse({
      key,
      version,
      url,
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
      new HTTPClient({
        ...this.credentials,
        endpoint: "content",
      }),
    ).access(["read", "browse"]);
  }
  get tiers() {
    return new APIComposer(
      "tiers",
      { schema: tiersSchema, identitySchema: slugOrIdSchema, include: tiersIncludeSchema },
      new HTTPClient({
        ...this.credentials,
        endpoint: "content",
      }),
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
      new HTTPClient({
        ...this.credentials,
        endpoint: "content",
      }),
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
      new HTTPClient({
        ...this.credentials,
        endpoint: "content",
      }),
    ).access(["browse", "read"]);
  }
  get tags() {
    return new APIComposer(
      "tags",
      { schema: tagsSchema, identitySchema: slugOrIdSchema, include: tagsIncludeSchema },
      new HTTPClient({
        ...this.credentials,
        endpoint: "content",
      }),
    ).access(["browse", "read"]);
  }

  get settings() {
    return new BasicFetcher(
      "settings",
      { output: settingsSchema },
      new HTTPClient({
        ...this.credentials,
        endpoint: "content",
      }),
    );
  }
}
