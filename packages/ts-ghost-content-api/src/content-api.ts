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
    this.httpClient = new HTTPClient({
      key,
      version,
      endpoint: "content",
    });
  }

  get authors() {
    const api = contentAPICredentialsSchema.parse({
      resource: "authors",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "content",
    }) as {
      resource: "authors";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "content";
    };
    return new APIComposer(
      {
        schema: authorsSchema,
        identitySchema: slugOrIdSchema,
        include: authorsIncludeSchema,
      },
      api,
      this.httpClient
    ).access(["read", "browse"]);
  }
  get tiers() {
    const api = contentAPICredentialsSchema.parse({
      resource: "tiers",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "content",
    }) as {
      resource: "tiers";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "content";
    };
    return new APIComposer(
      { schema: tiersSchema, identitySchema: slugOrIdSchema, include: tiersIncludeSchema },
      api,
      this.httpClient
    ).access(["browse", "read"]);
  }
  get posts() {
    const api = contentAPICredentialsSchema.parse({
      resource: "posts",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "content",
    }) as {
      resource: "posts";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "content";
    };
    return new APIComposer(
      {
        schema: postsSchema,
        identitySchema: slugOrIdSchema,
        include: postsIncludeSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read"]);
  }
  get pages() {
    const api = contentAPICredentialsSchema.parse({
      resource: "pages",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "content",
    }) as {
      resource: "pages";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "content";
    };
    return new APIComposer(
      {
        schema: pagesSchema,
        identitySchema: slugOrIdSchema,
        include: pagesIncludeSchema,
      },
      api,
      this.httpClient
    ).access(["browse", "read"]);
  }
  get tags() {
    const api = contentAPICredentialsSchema.parse({
      resource: "tags",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "content",
    }) as {
      resource: "tags";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "content";
    };
    return new APIComposer(
      { schema: tagsSchema, identitySchema: slugOrIdSchema, include: tagsIncludeSchema },
      api,
      this.httpClient
    ).access(["browse", "read"]);
  }

  get settings() {
    const api = contentAPICredentialsSchema.parse({
      resource: "settings",
      key: this.key,
      version: this.version,
      url: this.url,
      endpoint: "content",
    }) as {
      resource: "settings";
      key: string;
      version: APIVersions;
      url: string;
      endpoint: "content";
    };
    return new BasicFetcher({ output: settingsSchema }, api, this.httpClient);
  }
}
