import { parseBrowseParams } from "./browse-params";
import type { BrowseParams } from "./browse-params";
import type { APICredentials } from "../schemas";
import { z, ZodEnum, ZodRawShape } from "zod";
import { schemaWithPickedFields } from "./fields";
import { BrowseFetcher } from "../fetchers/browse-fetcher";
import { ReadFetcher } from "../fetchers/read-fetcher";
import { queryIdentitySchema } from "../schemas";
import type { Mask } from "../utils";

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
    },
    Fields extends Mask<OutputShape>,
    Include extends Mask<IncludeShape>,
  >(options?: {
    input?: BrowseParams<P, Shape>;
    /**
     * @deprecated use .fields(), .include(), and .formats() methods on the fetcher instead to have a better output typing.
     */
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
      formats?: z.infer<Formats>[];
    };
  }) {
    let includeFields: (keyof IncludeShape)[] = [];
    if (options?.output?.include) {
      const parsedIncludeFields = this.config.include.parse(options.output.include);
      includeFields = Object.keys(parsedIncludeFields);
    }
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields && schemaWithPickedFields(this.config.output, options.output.fields)) ||
          // this is a hack to get around the fact that I can't figure out how to
          // give back the same output as before
          (this.config.output as unknown as z.ZodObject<Pick<OutputShape, Extract<keyof OutputShape, keyof Fields>>>),
        include: this.config.include,
      },
      {
        browseParams: (options && options.input && parseBrowseParams(options.input, this.config.schema)) || undefined,
        include: includeFields,
        fields: options?.output?.fields || undefined,
        formats:
          this.config.formats && options?.output?.formats
            ? this.config.formats.parse(options.output.formats)
            : undefined,
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
      | { slug: string },
    Fields extends Mask<OutputShape>,
    Include extends Mask<IncludeShape>
  >(options: {
    input: Identity;
    /**
     * @deprecated use .fields(), .include(), and .formats() methods on the fetcher instead to have a better output typing.
     */
    output?: {
      fields?: z.noUnrecognized<Fields, OutputShape>;
      include?: z.noUnrecognized<Include, IncludeShape>;
      formats?: z.infer<Formats>[];
    };
  }) {
    let includeFields: (keyof IncludeShape)[] = [];
    if (options?.output?.include) {
      const parsedIncludeFields = this.config.include.parse(options.output.include);
      includeFields = Object.keys(parsedIncludeFields);
    }
    return new ReadFetcher(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields && schemaWithPickedFields(this.config.output, options.output.fields)) ||
          // this is a hack to get around the fact that I can't figure out how to
          // give back the same output as before
          (this.config.output as unknown as z.ZodObject<Pick<OutputShape, Extract<keyof OutputShape, keyof Fields>>>),
        include: this.config.include,
      },
      {
        identity: queryIdentitySchema.parse(options.input),
        include: includeFields,
        fields: options?.output?.fields || undefined,
        formats:
          this.config.formats && options?.output?.formats
            ? this.config.formats.parse(options.output.formats)
            : undefined,
      },
      this._api
    );
  }
}
