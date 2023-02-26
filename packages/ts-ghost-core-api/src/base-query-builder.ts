import { BrowseParamsSchema, parseBrowseParams } from "./helpers/browse-params";
import type { BrowseParams } from "./helpers/browse-params";
import { z, ZodRawShape } from "zod";
import { schemaWithPickedFields } from "./helpers/fields";
import { ContentAPICredentials } from "./schemas";
import { BaseFetcher } from "./base-fetcher";

export class BaseQueryBuilder<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends ContentAPICredentials
> {
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      output: z.ZodObject<OutputShape>;
      include: z.ZodObject<IncludeShape>;
    },
    protected _api: Api
  ) {}

  /**
   * Browse function
   * @param {}
   * @returns
   */
  public browse<
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
  }) {
    const fetcher = new BaseFetcher(
      {
        schema: this.config.schema,
        output:
          (options?.output?.fields && schemaWithPickedFields(this.config.output, options.output.fields)) ||
          // this is a hack to get around the fact that I can't figure out how to
          // give back the same output as before
          (this.config.output as unknown as z.ZodObject<Pick<OutputShape, Extract<keyof OutputShape, keyof Fields>>>),
        include: this.config.include,
      },
      (options && options.input && parseBrowseParams(options.input, this.config.schema)) || {},
      this._api
    );
    if (options?.output?.include) {
      fetcher.setIncludeFields(options.output.include);
    }
    return fetcher;
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
    };
  }) {
    const fetcher = new BaseFetcher(
      {
        schema: this.config.schema,
        output:
          (options.output?.fields && schemaWithPickedFields(this.config.output, options.output.fields)) ||
          // this is a hack to get around the fact that I can't figure out how to
          // give back the same output as before
          (this.config.output as unknown as z.ZodObject<Pick<OutputShape, Extract<keyof OutputShape, keyof Fields>>>),
        include: this.config.include,
      },
      {},
      this._api
    );
    if (options?.output?.include) {
      fetcher.setIncludeFields(options.output.include);
    }
    return fetcher;
  }
}
