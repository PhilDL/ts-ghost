import { AuthorSchema, TierSchema, PostSchema, PageSchema, TagSchema } from "./zod-schemas";
import fetch from "node-fetch";
import { GhostMetaSchema } from "./zod-schemas";
import { z, ZodRawShape } from "zod";

// type Split<Str, Separator extends string> = Str extends `${infer Start}${Separator}${infer Rest}`
//   ? [Start, ...Split<Rest, Separator>]
//   : [Str];

export type BrowseOrder<S, Shape> = S extends string
  ? S extends `${infer Field} ${infer Direction}`
    ? Field extends keyof Shape
      ? Direction extends "ASC" | "DESC" | "asc" | "desc"
        ? `${Field} ${Direction}`
        : never
      : never
    : S extends keyof Shape
    ? `${S}`
    : never
  : never;

export type FilterQuerySeparator = "+" | "," | "(" | ")";
export type FilterQueryOperators =
  | `-${string}`
  | `>${string}`
  | `<${string}`
  | `~${string}`
  | `-${string}`
  | `[${string}]`
  | string;
export type BrowseFilter<S, Shape> = S extends string
  ? S extends `${infer Field}:${infer Operation}${FilterQuerySeparator}${infer Rest}`
    ? Field extends keyof Shape
      ? Operation extends FilterQueryOperators
        ? `${Field}:${Operation}${FilterQuerySeparator}${BrowseFilter<Rest, Shape>}`
        : never
      : never
    : S extends `${infer Field}:${infer Operation}`
    ? Field extends keyof Shape
      ? Operation extends FilterQueryOperators
        ? S
        : never
      : never
    : never
  : never;

export type BrowseArgs<P, Shape> = P extends { order: infer Order }
  ? P extends { filter: infer Filter }
    ? Omit<P, "order" | "filter"> & { order: BrowseOrder<Order, Shape> } & { filter: BrowseFilter<Filter, Shape> }
    : Omit<P, "order"> & { order: BrowseOrder<Order, Shape> }
  : P extends { filter: infer Filter }
  ? Omit<P, "filter"> & { filter: BrowseFilter<Filter, Shape> }
  : P;

const browseArgsSchema = z.object({
  order: z.string().optional(),
  limit: z.coerce.string().optional(),
  page: z.coerce.string().optional(),
  filter: z.string().optional(),
});
export type BrowseArgsSchema = z.infer<typeof browseArgsSchema>;

const authorsIncludeSchema = z.literal("count.posts").optional();
export type AuthorsIncludeSchema = z.infer<typeof authorsIncludeSchema>;

export enum BrowseEndpointType {
  authors = "authors",
  tiers = "tiers",
  posts = "posts",
  pages = "pages",
  tags = "tags",
}

export const EndpointsSchema = z.enum(["authors", "tiers", "posts", "pages", "tags"]);
export type Endpoints = z.infer<typeof EndpointsSchema>;

export const InternalApiSchema = z.object({
  endpoint: z.enum(["authors", "tiers", "posts", "pages", "tags"]),
  fetch: z.function(),
  key: z.string(),
  version: z.enum(["v5", "canary"]),
  url: z.string(),
});

export type InternalApi = z.infer<typeof InternalApiSchema>;

export class TSGhostContentAPI {
  constructor(protected readonly _fetch: (url: string) => Promise<unknown> = fetch) {}

  _getApi = (endpoint: Endpoints) => {
    const apiIn = {
      endpoint,
      fetch: this._fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    return InternalApiSchema.parse(apiIn);
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

export abstract class BaseAPI<Shape extends ZodRawShape, OutputShape extends ZodRawShape, B extends BrowseArgsSchema> {
  constructor(
    private readonly schema: z.ZodObject<Shape>,
    public output: z.ZodObject<OutputShape>,
    public browseArgs: B | undefined = undefined,
    protected _api: InternalApi
  ) {}

  /**
   * Browse function
   * @param browseArgs
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number; page?: number; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseArgs: BrowseArgs<P, Shape>,
    mask?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    const args = browseArgsSchema.parse(browseArgs);
    return new AuthorAPI(
      this.schema,
      this.output.pick(mask || ({} as z.noUnrecognized<Fields, OutputShape>)),
      args,
      this._api
    );
  };

  get browseUrlSearchParams() {
    const inputKeys = this.schema.keyof().options as string[];
    const outputKeys = this.output.keyof().options as string[];
    if (inputKeys.length !== outputKeys.length) {
      const params = {
        ...this.browseArgs,
        key: this._api.key,
        fields: outputKeys.join(","),
      };
      return new URLSearchParams(params).toString();
    }
    const params = {
      ...this.browseArgs,
      key: this._api.key,
    };
    return new URLSearchParams(params).toString();
  }

  abstract fetch(): unknown;

  _fetch = async () => {
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/content/${this._api.endpoint}/?${this.browseUrlSearchParams}`;
    let result = undefined;
    try {
      result = await (
        await fetch(url.toString(), {
          headers: {
            "Content-Type": "application/json",
            "Accept-Version": this._api.version,
          },
        })
      ).json();
    } catch (e) {
      console.log("error", e);
    }
    return result;
  };
}

export class AuthorAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseArgsSchema
> extends BaseAPI<Shape, OutputShape, B> {
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
  B extends BrowseArgsSchema
> extends BaseAPI<Shape, OutputShape, B> {
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
  B extends BrowseArgsSchema
> extends BaseAPI<Shape, OutputShape, B> {
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
  B extends BrowseArgsSchema
> extends BaseAPI<Shape, OutputShape, B> {
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
  B extends BrowseArgsSchema
> extends BaseAPI<Shape, OutputShape, B> {
  fetch = async () => {
    const result = this._fetch();
    const browseSchema = z.object({
      meta: GhostMetaSchema,
      tags: z.array(this.output),
    });
    return browseSchema.parse(result);
  };
}
