import { z, ZodRawShape, ZodTypeAny } from "zod";

import { DeleteFetcher } from "./fetchers";
import { BrowseFetcher } from "./fetchers/browse-fetcher";
import { MutationFetcher } from "./fetchers/mutation-fetcher";
import { ReadFetcher } from "./fetchers/read-fetcher";
import { parseBrowseParams, type BrowseParams } from "./helpers/browse-params";
import { HTTPClient } from "./helpers/http-client";
import type { APICredentials } from "./schemas";
import type { IsAny } from "./utils";

function isZodObject(schema: z.ZodObject<any> | z.ZodTypeAny): schema is z.ZodObject<any> {
  return (schema as z.ZodObject<any>).partial !== undefined;
}

/**
 * API Composer contains all methods, pick and choose.
 */
export class APIComposer<
  Shape extends ZodRawShape = any,
  IdentityShape extends z.ZodTypeAny = any,
  IncludeShape extends ZodRawShape = any,
  CreateShape extends ZodTypeAny = any,
  CreateOptions extends ZodTypeAny = any,
  UpdateShape extends ZodTypeAny = any,
  Api extends APICredentials = any
> {
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      identitySchema: IdentityShape;
      include: z.ZodObject<IncludeShape>;
      createSchema?: CreateShape;
      createOptionsSchema?: CreateOptions;
      updateSchema?: UpdateShape;
    },
    protected _apiCredentials: Api,
    protected _httpClient: HTTPClient
  ) {}

  /**
   * Browse function that accepts browse params order, filter, page and limit. Will return an instance
   * of BrowseFetcher class.
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
  >(options?: BrowseParams<P, Shape & IncludeShape>) {
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include,
      },
      {
        browseParams:
          (options && parseBrowseParams(options, this.config.schema, this.config.include)) || undefined,
      },
      this._apiCredentials,
      this._httpClient
    );
  }

  /**
   * Read function that accepts Identify fields like id, slug or email. Will return an instance
   * of ReadFetcher class.
   */
  public read(options: z.infer<IdentityShape>) {
    return new ReadFetcher(
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include,
      },
      {
        identity: this.config.identitySchema.parse(options),
      },
      this._apiCredentials,
      this._httpClient
    );
  }

  public async add(data: z.input<CreateShape>, options?: z.infer<CreateOptions>) {
    if (!this.config.createSchema) {
      throw new Error("No createSchema defined");
    }
    const parsedData = this.config.createSchema.parse(data);
    const parsedOptions =
      this.config.createOptionsSchema && options
        ? this.config.createOptionsSchema.parse(options)
        : undefined;
    const fetcher = new MutationFetcher(
      {
        output: this.config.schema,
        paramsShape: this.config.createOptionsSchema,
      },
      parsedOptions,
      { method: "POST", body: parsedData },
      this._apiCredentials,
      this._httpClient
    );
    return fetcher.submit();
  }

  public async edit(
    id: string,
    data: IsAny<UpdateShape> extends true ? Partial<z.input<CreateShape>> : z.input<UpdateShape>,
    options?: z.infer<CreateOptions>
  ) {
    let updateSchema: z.ZodTypeAny | z.ZodObject<any> | undefined = this.config.updateSchema;
    if (!this.config.updateSchema && this.config.createSchema && isZodObject(this.config.createSchema)) {
      updateSchema = this.config.createSchema.partial();
    }
    if (!updateSchema) {
      throw new Error("No updateSchema defined");
    }
    const cleanId = z.string().nonempty().parse(id);
    const parsedData = updateSchema.parse(data);
    const parsedOptions =
      this.config.createOptionsSchema && options ? this.config.createOptionsSchema.parse(options) : {};

    if (Object.keys(parsedData).length === 0) {
      throw new Error("No data to edit");
    }
    const fetcher = new MutationFetcher(
      {
        output: this.config.schema,
        paramsShape: this.config.createOptionsSchema,
      },
      { id: cleanId, ...parsedOptions },
      { method: "PUT", body: parsedData },
      this._apiCredentials,
      this._httpClient
    );
    return fetcher.submit();
  }

  public async delete(id: string) {
    const cleanId = z.string().nonempty().parse(id);
    const fetcher = new DeleteFetcher({ id: cleanId }, this._apiCredentials, this._httpClient);
    return fetcher.submit();
  }

  public access<const Keys extends keyof this>(keys: Keys[]) {
    const d: {
      [Property in keyof this]?: this[Property];
    } = {};
    keys.forEach((key) => {
      d[key] = (this[key] as Function).bind(this);
    });
    return d as Pick<this, Keys>;
  }
}
