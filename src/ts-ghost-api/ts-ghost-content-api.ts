import { AuthorSchema, TierSchema, PostSchema, PageSchema, TagSchema } from "../app/zod-schemas";
import { GhostMetaSchema } from "../app/zod-schemas";
import { z, ZodRawShape } from "zod";
import { BaseAPI } from "./ts-ghost-api";
import { BrowseParamsSchema, BrowseParams, parseBrowseParams } from "./browse-params";
import { schemaWithPickedFields } from "./fields";

const authorsIncludeSchema = z.set(z.literal("count.posts")).optional();
export type AuthorsIncludeSchema = z.infer<typeof authorsIncludeSchema>;

const tagsIncludeSchema = z.set(z.literal("count.posts")).optional();
export type TagsIncludeSchema = z.infer<typeof tagsIncludeSchema>;

const tiersIncludeSchema = z
  .set(z.union([z.literal("monthly_price"), z.literal("yearly_price"), z.literal("benefits")]))
  .optional();
export type TiersIncludeSchema = z.infer<typeof tiersIncludeSchema>;

const postsOrPageIncludeSchema = z.set(z.union([z.literal("authors"), z.literal("tags")])).optional();
export type PostsOrPageIncludeSchema = z.infer<typeof postsOrPageIncludeSchema>;

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
}

export const ContentAPIEndpointsSchema = z.enum(["authors", "tiers", "posts", "pages", "tags"]);
export type ContentAPIEndpoints = z.infer<typeof ContentAPIEndpointsSchema>;

export const VersionsSchema = z.enum(["v5.0", "v2", "v3", "v4", "canary"]).default("v5.0");
export type ContentAPIVersions = z.infer<typeof VersionsSchema>;

export const ContentAPICredentialsSchema = z.object({
  endpoint: ContentAPIEndpointsSchema,
  key: z.string().regex(/[0-9a-f]{26}/, { message: "'key' must have 26 hex characters" }),
  version: VersionsSchema,
  url: z.string().url(),
});

export type ContentAPICredentials = z.infer<typeof ContentAPICredentialsSchema>;

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
    return new AuthorAPI(AuthorSchema, AuthorSchema, {}, this._getApi("authors"));
  }
  get tiers() {
    return new TiersApi(TierSchema, TierSchema, {}, this._getApi("tiers"));
  }
  get posts() {
    return new PostsApi(PostSchema, PostSchema, {}, this._getApi("posts"));
  }
  get pages() {
    return new PagesApi(PageSchema, PageSchema, {}, this._getApi("pages"));
  }
  get tags() {
    return new TagsApi(TagSchema, TagSchema, {}, this._getApi("tags"));
  }
}

export class AuthorAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, B> {
  /**
   * Browse function
   * @param browseParams
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseParams: BrowseParams<P, Shape>,
    fields?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    return new AuthorAPI(
      this.schema,
      schemaWithPickedFields(this.output, fields || ({} as z.noUnrecognized<Fields, OutputShape>)),
      parseBrowseParams(browseParams, this.schema),
      this._api
    );
  };

  fetch = async () => {
    const result = this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      authors: z.array(this.output),
    });
    return browseSchema.parse(result);
  };
}

export class TiersApi<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, B> {
  /**
   * Browse function
   * @param browseParams
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseParams: BrowseParams<P, Shape>,
    fields?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    return new TiersApi(
      this.schema,
      schemaWithPickedFields(this.output, fields || ({} as z.noUnrecognized<Fields, OutputShape>)),
      parseBrowseParams(browseParams, this.schema),
      this._api
    );
  };

  fetch = async () => {
    const result = this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      tiers: z.array(this.output),
    });
    return browseSchema.parse(result);
  };
}

export class PostsApi<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, B> {
  /**
   * Browse function
   * @param browseParams
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseParams: BrowseParams<P, Shape>,
    fields?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    return new PostsApi(
      this.schema,
      schemaWithPickedFields(this.output, fields || ({} as z.noUnrecognized<Fields, OutputShape>)),
      parseBrowseParams(browseParams, this.schema),
      this._api
    );
  };

  fetch = async () => {
    const result = this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      posts: z.array(this.output),
    });
    return browseSchema.parse(result);
  };
}

export class PagesApi<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, B> {
  /**
   * Browse function
   * @param browseParams
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseParams: BrowseParams<P, Shape>,
    fields?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    return new PagesApi(
      this.schema,
      schemaWithPickedFields(this.output, fields || ({} as z.noUnrecognized<Fields, OutputShape>)),
      parseBrowseParams(browseParams, this.schema),
      this._api
    );
  };

  fetch = async () => {
    const result = this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      pages: z.array(this.output),
    });
    return browseSchema.parse(result);
  };
}

export class TagsApi<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, B> {
  /**
   * Browse function
   * @param browseParams
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseParams: BrowseParams<P, Shape>,
    fields?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    return new TagsApi(
      this.schema,
      schemaWithPickedFields(this.output, fields || ({} as z.noUnrecognized<Fields, OutputShape>)),
      parseBrowseParams(browseParams, this.schema),
      this._api
    );
  };

  fetch = async () => {
    const result = this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      tags: z.array(this.output),
    });
    return browseSchema.parse(result);
  };
}
