import { authorsSchema, authorsIncludeSchema } from "./authors/schemas";
import { TagsAPI } from "./tags/api";
import { tagsSchema, tagsIncludeSchema } from "./tags/schemas";
import { PagesAPI } from "./pages/api";
import { pagesSchema, pagesIncludeSchema } from "./pages/schemas";
import { PostsAPI } from "./posts/api";
import { postsSchema, postsIncludeSchema } from "./posts/schemas";
import { TiersAPI } from "./tiers/api";
import { tiersSchema, tiersIncludeSchema } from "./tiers/schemas";
import { contentAPICredentialsSchema, QueryBuilder, ContentAPIVersions } from "@ts-ghost/core-api";
import { BasicFetcher } from "@ts-ghost/core-api";
import { settingsSchema } from "./settings/schemas";

export type { ContentAPICredentials, ContentAPIVersions } from "@ts-ghost/core-api";

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
  settings = "settings",
}

export class TSGhostContentAPI {
  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: ContentAPIVersions
  ) {}

  get authors() {
    const api = contentAPICredentialsSchema.parse({
      endpoint: "authors",
      key: this.key,
      version: this.version,
      url: this.url,
    }) as {
      endpoint: "authors";
      key: string;
      version: ContentAPIVersions;
      url: string;
    };
    return new QueryBuilder(
      {
        schema: authorsSchema,
        output: authorsSchema,
        include: authorsIncludeSchema,
      },
      api
    );
  }
  get tiers() {
    const api = contentAPICredentialsSchema.parse({
      endpoint: "tiers",
      key: this.key,
      version: this.version,
      url: this.url,
    }) as {
      endpoint: "tiers";
      key: string;
      version: ContentAPIVersions;
      url: string;
    };
    return new TiersAPI({ schema: tiersSchema, output: tiersSchema, include: tiersIncludeSchema }, api);
  }
  get posts() {
    const api = contentAPICredentialsSchema.parse({
      endpoint: "posts",
      key: this.key,
      version: this.version,
      url: this.url,
    }) as {
      endpoint: "posts";
      key: string;
      version: ContentAPIVersions;
      url: string;
    };
    return new PostsAPI(
      {
        schema: postsSchema,
        output: postsSchema,
        include: postsIncludeSchema,
      },
      api
    );
  }
  get pages() {
    const api = contentAPICredentialsSchema.parse({
      endpoint: "pages",
      key: this.key,
      version: this.version,
      url: this.url,
    }) as {
      endpoint: "pages";
      key: string;
      version: ContentAPIVersions;
      url: string;
    };
    return new PagesAPI(
      {
        schema: pagesSchema,
        output: pagesSchema,
        include: pagesIncludeSchema,
      },
      api
    );
  }
  get tags() {
    const api = contentAPICredentialsSchema.parse({
      endpoint: "tags",
      key: this.key,
      version: this.version,
      url: this.url,
    }) as {
      endpoint: "tags";
      key: string;
      version: ContentAPIVersions;
      url: string;
    };
    return new TagsAPI({ schema: tagsSchema, output: tagsSchema, include: tagsIncludeSchema }, api);
  }

  get settings() {
    const api = contentAPICredentialsSchema.parse({
      endpoint: "settings",
      key: this.key,
      version: this.version,
      url: this.url,
    }) as {
      endpoint: "settings";
      key: string;
      version: ContentAPIVersions;
      url: string;
    };
    return new BasicFetcher({ output: settingsSchema }, api);
  }
}
