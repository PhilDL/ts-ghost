import type { GhostAPI } from "@tryghost/content-api";
import { Tag, Author, AuthorSchema, TierSchema, PostSchema, PageSchema, TagSchema } from "./zod-schemas";
import GhostContentAPI from "@tryghost/content-api";
import fetch, { RequestInfo, RequestInit } from "node-fetch";
import { GhostFetchTiersSchema, GhostMetaSchema, filterSchema } from "./zod-schemas";
import { z, ZodRawShape } from "zod";

type Split<Str, Separator extends string> = Str extends `${infer Start}${Separator}${infer Rest}`
  ? [Start, ...Split<Rest, Separator>]
  : [Str];

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

type test = BrowseOrder<"name DESC", z.infer<typeof AuthorSchema>>;
type ooo = z.infer<typeof AuthorSchema>;

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

export type test2 = BrowseArgs<{ order: "name ASC" }, z.infer<typeof AuthorSchema>>;
export type test3 = BrowseFilter<"name:-foo+website:-codingdodo", z.infer<typeof AuthorSchema>>;

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

  get authors() {
    const apiIn = {
      endpoint: "authors",
      fetch: this._fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(apiIn);
    return {
      browse: new BrowseEndpoint(AuthorSchema, api).browse,
    };
  }
  get tiers() {
    const apiIn = {
      endpoint: BrowseEndpointType.tiers,
      fetch: this._fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(apiIn);
    return {
      browse: new BrowseEndpoint(TierSchema, api).browse,
    };
  }
  get posts() {
    const apiIn = {
      endpoint: BrowseEndpointType.posts,
      fetch: this._fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(apiIn);
    return {
      browse: new BrowseEndpoint(PostSchema, api).browse,
    };
  }
  get pages() {
    const apiIn = {
      endpoint: BrowseEndpointType.pages,
      fetch: this._fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(apiIn);
    return {
      browse: new BrowseEndpoint(PageSchema, api).browse,
    };
  }
  get tags() {
    const apiIn = {
      endpoint: BrowseEndpointType.tags,
      fetch: this._fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(apiIn);
    return {
      browse: new BrowseEndpoint(TagSchema, api).browse,
    };
  }
}

// export class AuthorAPI<Shape extends ZodRawShape> {
//   private _api: InternalApi;
//   private _output: EndpointOutput<Shape, BrowseArgsSchema>;
//   constructor(private readonly schema: z.ZodObject<Shape>) {
//     const apiIn = {
//       endpoint: "authors",
//       fetch: fetch,
//       key: "foobarbaz",
//       version: "v5",
//       url: "https://codingdodo.com",
//     } as const;
//     this._api = InternalApiSchema.parse(apiIn);
//     this._output = new EndpointOutput(this.schema, this._api);
//   }
// }

export class BrowseEndpoint<Shape extends ZodRawShape, API extends InternalApi> {
  private _browseArgs: BrowseArgsSchema | undefined = undefined;
  private _order: string | undefined = undefined;
  private _filter: string | undefined = undefined;
  endpointOutput = EndpointOutput;

  constructor(private readonly schema: z.ZodObject<Shape>, protected _api: InternalApi) {}

  order = <O extends string>(order: BrowseOrder<O, Shape>) => {
    this._order = order;
    return this;
  };

  filter = <F extends string>(filter: BrowseFilter<F, Shape>) => {
    this._filter = filter;
    return this;
  };

  browse = <P extends { order?: string; limit?: number; page?: number; filter?: string }>(
    browseArgs: BrowseArgs<P, Shape>
  ) => {
    this._browseArgs = browseArgsSchema.parse(browseArgs);
    return new EndpointOutput(this.schema, this._browseArgs, this._api);
  };
}

export class EndpointOutput<Shape extends ZodRawShape, B extends BrowseArgsSchema> {
  constructor(
    protected readonly _schema: z.ZodObject<Shape>,
    protected readonly _browseArgs: B | undefined = undefined,
    protected _api: InternalApi
  ) {}

  getApi() {
    return this._api;
  }

  fetch = async () => {
    if (!this._api) {
      throw new Error("API not initialized");
    }
    const url = `${this._api.url}/ghost/api/content/${this._api.endpoint}/?key=${this._api.key}&${this.browseUrlSearchParams}`;
    console.log("url fetch", url);
    try {
      const result = await (
        await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            "Accept-Version": this._api.version,
          },
        })
      ).json();

      const browseSchema = z.object({
        meta: GhostMetaSchema,
        [BrowseEndpointType[this._api.endpoint] as const]: z.array(this._schema),
      });
      return browseSchema.parse(result);
    } catch (e) {
      console.log("error", e);
    }
    // const result = await (
    //   await fetch(url, {
    //     headers: {
    //       "Content-Type": "application/json",
    //       "Accept-Version": this._api.version,
    //     },
    //   })
    // ).json();
    // return this._schema.parse(result);
  };

  get browseArgs() {
    return this._browseArgs;
  }

  get browseUrlSearchParams() {
    return new URLSearchParams(this._browseArgs).toString();
  }

  get schema() {
    return this._schema;
  }

  fields = <Fields extends z.objectKeyMask<Shape>>(mask: z.noUnrecognized<Fields, Shape>) => {
    return new FieldsSelectionEndpointOutput(this.schema.pick(mask), this._browseArgs, this._api);
  };
}

export class FieldsSelectionEndpointOutput<
  Shape extends ZodRawShape,
  B extends BrowseArgsSchema
> extends EndpointOutput<Shape, B> {
  constructor(
    protected readonly _schema: z.ZodObject<Shape>,
    protected readonly _browseArgs: B | undefined = undefined,
    protected _api: InternalApi
  ) {
    super(_schema, _browseArgs, _api);
  }

  get browseUrlSearchParams() {
    const keys = this._schema.keyof().options as string[];
    const params = {
      ...this._browseArgs,
      fields: keys.join(","),
    };
    return new URLSearchParams(params).toString();
  }
}
