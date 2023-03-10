import { parseBrowseParams } from "./browse-params";
import type { BrowseParams } from "./browse-params";
import type { APICredentials } from "../schemas";
import { z, ZodEnum, ZodRawShape } from "zod";
import { schemaWithPickedFields } from "./fields";
import { BrowseFetcher } from "../fetchers/browse-fetcher";
import { ReadFetcher } from "../fetchers/read-fetcher";
import { queryIdentitySchema } from "../schemas";

type OrderObjectKeyMask<Obj> = { [k in keyof Obj]?: "ASC" | "DESC" };

// const formats = z.array(z.enum(["Salmon", "Tuna", "Trout"]));
// type t = z.infer<typeof formats>;

// type Outputs<
//   OutputShape extends ZodRawShape,
//   IncludeShape extends ZodRawShape,
//   Fields extends z.objectKeyMask<OutputShape>,
//   Include extends z.objectKeyMask<IncludeShape>,
//   Formats
// > = Formats extends ZodEnum<[string, ...string[]]>
//   ? {
//       fields?: z.noUnrecognized<Fields, OutputShape>;
//       include?: z.noUnrecognized<Include, IncludeShape>;
//       formats?: readonly z.infer<Formats>[];
//     }
//   : {
//       fields?: z.noUnrecognized<Fields, OutputShape>;
//       include?: z.noUnrecognized<Include, IncludeShape>;
//     };

// Write documentation for that class and its methods
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
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>,
    Order extends OrderObjectKeyMask<Shape>,
    P extends {
      order?: string;
      limit?: number | string;
      page?: number | string;
      filter?: string;
      _unstable_order?: Order;
    }
  >(options?: {
    input?: BrowseParams<P, Shape> & {
      _unstable_order?: z.noUnrecognized<Order, Shape>;
    };
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
    Fields extends z.objectKeyMask<OutputShape>,
    Include extends z.objectKeyMask<IncludeShape>
  >(options: {
    input: Identity;
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
