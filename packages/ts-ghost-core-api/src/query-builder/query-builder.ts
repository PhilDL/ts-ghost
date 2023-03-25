import { parseBrowseParams } from "./browse-params";
import type { BrowseParams } from "./browse-params";
import type { APICredentials } from "../schemas";
import { z, ZodEnum, ZodRawShape } from "zod";
import { BrowseFetcher } from "../fetchers/browse-fetcher";
import { ReadFetcher } from "../fetchers/read-fetcher";
import { queryIdentitySchema } from "../schemas";

export type OrderObjectKeyMask<Obj> = { [k in keyof Obj]?: "ASC" | "DESC" };

/**
 * QueryBuilder class
 * @param {ZodRawShape} Shape
 * @param {ZodRawShape} OutputShape
 * @param {ZodRawShape} IncludeShape
 * @param {APICredentials} Api
 *
 * @returns {QueryBuilder} QueryBuilder
 *
 */
export class QueryBuilder<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends APICredentials,
  Formats extends ZodEnum<[string, ...string[]]>
> {
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      output: z.ZodObject<OutputShape>;
      include: z.ZodObject<IncludeShape>;
      formats?: z.ZodArray<Formats, "many">;
    },
    protected _api: Api
  ) {}

  /**
   * Browse function
   * @param {}
   * @returns
   */
  public browse<
    const OrderStr extends string,
    const FilterStr extends string,
    const P extends {
      order?: OrderStr;
      limit?: number | string;
      page?: number | string;
      filter?: FilterStr;
    }
  >(options?: BrowseParams<P, Shape>) {
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output: this.config.output,
        include: this.config.include,
      },
      {
        browseParams: (options && parseBrowseParams(options, this.config.schema)) || undefined,
      },
      this._api
    );
  }

  /**
   * Browse function
   * @param {}
   * @returns
   */
  public read<
    Identity extends
      | {
          id: string;
        }
      | { slug: string }
  >(input: Identity) {
    return new ReadFetcher(
      {
        schema: this.config.schema,
        output: this.config.output,
        include: this.config.include,
      },
      {
        identity: queryIdentitySchema.parse(input),
      },
      this._api
    );
  }
}
