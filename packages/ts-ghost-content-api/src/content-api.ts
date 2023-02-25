import { z, ZodRawShape } from "zod";
import type { BrowseParamsSchema, BrowseParams } from "@ts-ghost/core-api";
import { BaseAPI, schemaWithPickedFields, parseBrowseParams } from "@ts-ghost/core-api";
import { AuthorsAPI } from "./authors/api";
import { AuthorSchema, authorsIncludeSchema } from "./authors/schemas";
import { TagsAPI } from "./tags/api";
import { TagSchema, tagsIncludeSchema } from "./tags/schemas";
import { PageSchema, pagesIncludeSchema } from "./pages/schemas";
import { PagesAPI } from "./pages/api";
import { PostSchema, postsIncludeSchema } from "./posts/schemas";
import { PostsAPI } from "./posts/api";
import { TierSchema, tiersIncludeSchema } from "./tiers/schemas";
import { TiersAPI } from "./tiers/api";
import { ContentAPICredentialsSchema, ContentAPIEndpoints, ContentAPIVersions } from "./schemas";

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

  _getApi = (endpoint: ContentAPIEndpoints) => {
    const apiIn = {
      endpoint,
      key: this.key,
      version: this.version,
      url: this.url,
    } as const;
    return ContentAPICredentialsSchema.parse(apiIn);
  };

  get authors() {
    return new AuthorsAPI(
      {
        schema: AuthorSchema,
        output: AuthorSchema,
        include: authorsIncludeSchema,
      },
      {},
      this._getApi("authors")
    );
  }
  get tiers() {
    return new TiersAPI(
      { schema: TierSchema, output: TierSchema, include: tiersIncludeSchema },
      {},
      this._getApi("tiers")
    );
  }
  get posts() {
    return new PostsAPI(
      {
        schema: PostSchema,
        output: PostSchema,
        include: postsIncludeSchema,
      },
      {},
      this._getApi("posts")
    );
  }
  get pages() {
    return new PagesAPI(
      {
        schema: PageSchema,
        output: PageSchema,
        include: pagesIncludeSchema,
      },
      {},
      this._getApi("pages")
    );
  }
  get tags() {
    return new TagsAPI({ schema: TagSchema, output: TagSchema, include: tagsIncludeSchema }, {}, this._getApi("tags"));
  }
}
