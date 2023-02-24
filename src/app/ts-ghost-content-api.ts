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
  limit: z.coerce
    .number()
    .refine((n) => n && n > 0 && n < 15, {
      message: "Limit must be between 1 and 15",
    })
    .transform((n) => n?.toString() || undefined)
    .optional(),
  page: z.coerce
    .number()
    .refine((n) => n && n > 1, {
      message: "Page must be greater than 1",
    })
    .transform((n) => n?.toString() || undefined)
    .optional(),
  filter: z.string().optional(),
});
export const parseBrowseArgs = <P, Shape extends z.ZodRawShape>(args: P, schema: z.ZodObject<Shape>) => {
  const keys = schema.keyof().options as string[];
  const augmentedSchema = browseArgsSchema.merge(
    z.object({
      order: z
        .string()
        .superRefine((val, ctx) => {
          const orderPredicates = val.split(",");
          for (const orderPredicate of orderPredicates) {
            const [field, direction] = orderPredicate.split(" ");
            if (!keys.includes(field)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Field "${field}" is not a valid field`,
                fatal: true,
              });
            }
            if (direction && !(direction.toUpperCase() === "ASC" || direction.toUpperCase() === "DESC")) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Order direction must be ASC or DESC",
                fatal: true,
              });
            }
          }
        })
        .optional(),
      filter: z
        .string()
        .superRefine((val, ctx) => {
          const filterPredicates = val.split(/[+(,]+/);
          for (const filterPredicate of filterPredicates) {
            const field = filterPredicate.split(":")[0].split(".")[0];
            if (!keys.includes(field)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Field "${field}" is not a valid field`,
                fatal: true,
              });
            }
          }
        })
        .optional(),
    })
  );
  return augmentedSchema.parse(args);
};
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

export const VersionsSchema = z.enum(["v5.0", "v2", "v3", "v4", "canary"]).default("v5.0");
export type Versions = z.infer<typeof VersionsSchema>;

export const InternalApiSchema = z.object({
  endpoint: EndpointsSchema,
  key: z.string(),
  version: VersionsSchema,
  url: z.string().url(),
});

export type InternalApi = z.infer<typeof InternalApiSchema>;

export class TSGhostContentAPI {
  constructor(protected readonly url: string, protected readonly key: string, protected readonly version: Versions) {}

  _getApi = (endpoint: Endpoints) => {
    const apiIn = {
      endpoint,
      key: this.key,
      version: this.version,
      url: this.url,
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
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseArgs: BrowseArgs<P, Shape>,
    mask?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    const args = parseBrowseArgs(browseArgs, this.schema);
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
