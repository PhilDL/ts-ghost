import { AuthorsAPI } from "./authors/api";
import { AuthorSchema, authorsIncludeSchema } from "./authors/schemas";
import { TagsAPI } from "./tags/api";
import { TagSchema, tagsIncludeSchema } from "./tags/schemas";
import { PagesAPI } from "./pages/api";
import { PageSchema, pagesIncludeSchema } from "./pages/schemas";
import { PostsAPI } from "./posts/api";
import { PostSchema, postsIncludeSchema } from "./posts/schemas";
import { TiersAPI } from "./tiers/api";
import { TierSchema, tiersIncludeSchema } from "./tiers/schemas";
import { ContentAPICredentialsSchema, BaseQueryBuilder, ContentAPIVersions } from "@ts-ghost/core-api";

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
}

export class TSGhostContentAPI {
  constructor(
    protected readonly url: string,
    protected readonly key: string,
    protected readonly version: ContentAPIVersions
  ) {}

  get authors() {
    const api = ContentAPICredentialsSchema.parse({
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
    return new BaseQueryBuilder(
      {
        schema: AuthorSchema,
        output: AuthorSchema,
        include: authorsIncludeSchema,
      },
      api
    );
  }
  get tiers() {
    const api = ContentAPICredentialsSchema.parse({
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
    return new TiersAPI({ schema: TierSchema, output: TierSchema, include: tiersIncludeSchema }, api);
  }
  get posts() {
    const api = ContentAPICredentialsSchema.parse({
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
        schema: PostSchema,
        output: PostSchema,
        include: postsIncludeSchema,
      },
      api
    );
  }
  get pages() {
    const api = ContentAPICredentialsSchema.parse({
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
        schema: PageSchema,
        output: PageSchema,
        include: pagesIncludeSchema,
      },
      api
    );
  }
  get tags() {
    const api = ContentAPICredentialsSchema.parse({
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
    return new TagsAPI({ schema: TagSchema, output: TagSchema, include: tagsIncludeSchema }, api);
  }
}
