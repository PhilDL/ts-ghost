import { AuthorSchema, TierSchema, PostSchema, PageSchema, TagSchema } from "../app/zod-schemas";
import { GhostMetaSchema } from "../app/zod-schemas";
import { z, ZodRawShape } from "zod";
import { BaseAPI } from "./ts-ghost-api";
import { BrowseParamsSchema, BrowseParams, parseBrowseParams } from "./browse-params";
import { schemaWithPickedFields } from "./fields";

export const authorsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type AuthorsIncludeSchema = z.infer<typeof authorsIncludeSchema>;

export const tagsIncludeSchema = z.object({
  "count.posts": z.literal(true).optional(),
});
export type TagsIncludeSchema = z.infer<typeof tagsIncludeSchema>;

const tiersIncludeSchema = z.object({
  monthly_price: z.literal(true).optional(),
  yearly_price: z.literal(true).optional(),
  benefits: z.literal(true).optional(),
});
export type TiersIncludeSchema = z.infer<typeof tiersIncludeSchema>;

const postsOrPageIncludeSchema = z.object({
  authors: z.literal(true).optional(),
  tags: z.literal(true).optional(),
});
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
        include: postsOrPageIncludeSchema,
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
        include: postsOrPageIncludeSchema,
      },
      {},
      this._getApi("pages")
    );
  }
  get tags() {
    return new TagsAPI({ schema: TagSchema, output: TagSchema, include: tagsIncludeSchema }, {}, this._getApi("tags"));
  }
}

export class AuthorsAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, IncludeShape, B> {
  /**
   * Browse function
   * @param {}
   * @returns
   */
  browse = <
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
    },
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options?: {
    input?: BrowseParams<P, Shape>;
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
    };
  }) => {
    const authorsApi = new AuthorsAPI(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields &&
            schemaWithPickedFields(
              this.config.output,
              options.output.fields || ({} as z.noUnrecognized<Fields, OutputShape>)
            )) ||
          schemaWithPickedFields(this.config.output, {} as z.noUnrecognized<Fields, OutputShape>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      authorsApi.setIncludeFields(options.output.include);
    }
    return authorsApi;
  };

  public async fetch() {
    const result = await this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      authors: z.array(this.config.output),
    });
    return browseSchema.parse(result);
  }
}

export class TiersAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, IncludeShape, B> {
  /**
   * Browse function
   * @param {}
   * @returns
   */
  browse = <
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
    },
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options?: {
    input?: BrowseParams<P, Shape>;
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
    };
  }) => {
    const tiersApi = new TiersAPI(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields &&
            schemaWithPickedFields(
              this.config.output,
              options.output.fields || ({} as z.noUnrecognized<Fields, OutputShape>)
            )) ||
          schemaWithPickedFields(this.config.output, {} as z.noUnrecognized<Fields, OutputShape>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      tiersApi.setIncludeFields(options.output.include);
    }
    return tiersApi;
  };

  public async fetch() {
    const result = await this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      tiers: z.array(this.config.output),
    });
    return browseSchema.parse(result);
  }
}

export class PostsAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, IncludeShape, B> {
  /**
   * Browse function
   * @param {}
   * @returns
   */
  browse = <
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
    },
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options?: {
    input?: BrowseParams<P, Shape>;
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
    };
  }) => {
    const postsApi = new PostsAPI(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields &&
            schemaWithPickedFields(
              this.config.output,
              options.output.fields || ({} as z.noUnrecognized<Fields, OutputShape>)
            )) ||
          schemaWithPickedFields(this.config.output, {} as z.noUnrecognized<Fields, OutputShape>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      postsApi.setIncludeFields(options.output.include);
    }
    return postsApi;
  };

  public async fetch() {
    const result = await this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      posts: z.array(this.config.output),
    });
    return browseSchema.parse(result);
  }
}

export class PagesAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, IncludeShape, B> {
  /**
   * Browse function
   * @param {}
   * @returns
   */
  browse = <
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
    },
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options?: {
    input?: BrowseParams<P, Shape>;
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
    };
  }) => {
    const pagesApi = new PagesAPI(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields &&
            schemaWithPickedFields(
              this.config.output,
              options.output.fields || ({} as z.noUnrecognized<Fields, OutputShape>)
            )) ||
          schemaWithPickedFields(this.config.output, {} as z.noUnrecognized<Fields, OutputShape>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      pagesApi.setIncludeFields(options.output.include);
    }
    return pagesApi;
  };

  public async fetch() {
    const result = await this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      pages: z.array(this.config.output),
    });
    return browseSchema.parse(result);
  }
}

export class TagsAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> extends BaseAPI<Shape, OutputShape, IncludeShape, B> {
  /**
   * Browse function
   * @param {}
   * @returns
   */
  browse = <
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
    },
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options?: {
    input?: BrowseParams<P, Shape>;
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
    };
  }) => {
    const tagsApi = new TagsAPI(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields &&
            schemaWithPickedFields(
              this.config.output,
              options.output.fields || ({} as z.noUnrecognized<Fields, OutputShape>)
            )) ||
          schemaWithPickedFields(this.config.output, {} as z.noUnrecognized<Fields, OutputShape>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      tagsApi.setIncludeFields(options.output.include);
    }
    return tagsApi;
  };

  public async fetch() {
    const result = await this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      tags: z.array(this.config.output),
    });
    return browseSchema.parse(result);
  }
}
