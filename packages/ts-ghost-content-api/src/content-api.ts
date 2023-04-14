import { authorsSchema, authorsIncludeSchema } from "./authors/schemas";
import { tagsSchema, tagsIncludeSchema } from "./tags/schemas";
import { pagesSchema, pagesIncludeSchema } from "./pages/schemas";
import { postsSchema, postsIncludeSchema } from "./posts/schemas";
import { tiersSchema, tiersIncludeSchema } from "./tiers/schemas";
import { contentAPICredentialsSchema, APIComposer, APIVersions, slugOrIdSchema } from "@ts-ghost/core-api";
import { BasicFetcher } from "@ts-ghost/core-api";
import { settingsSchema } from "./settings/schemas";

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
  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: Version
  ) {}

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
      api
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
      api
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
      api
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
      api
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
      api
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
    return new BasicFetcher({ output: settingsSchema }, api);
  }
}
