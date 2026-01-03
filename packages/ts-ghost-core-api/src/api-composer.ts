import { z, ZodRawShape, ZodTypeAny } from "zod/v3";
import { z, ZodRawShape, ZodTypeAny } from "zod";
import { z, ZodObject as ZodObjectV4, ZodRawShape } from "zod";
import * as z4 from "zod/v4/core";

import { DeleteFetcher } from "./fetchers";
import { BrowseFetcher } from "./fetchers/browse-fetcher";
import { MutationFetcher } from "./fetchers/mutation-fetcher";
import { ReadFetcher } from "./fetchers/read-fetcher";
import { parseBrowseParams, type BrowseParams } from "./helpers/browse-params";
import type { HTTPClientFactory } from "./helpers/http-client";
import type { APIResource } from "./schemas";
import type { IsAny } from "./utils";

function isZodObject(schema: z4.$ZodType): schema is ZodObjectV4<any> {
  return (schema as ZodObjectV4<any>).partial !== undefined;
}

/**
 * API Composer contains all methods, pick and choose.
 */
export class APIComposer<
  const Resource extends APIResource = any,
  Shape extends ZodRawShape = any,
  IdentityShape extends z4.$ZodType<{ slug?: string; id?: string; email?: string }> = any,
  IncludeShape extends ZodRawShape = any,
  CreateSchema extends z4.$ZodType = any,
  CreateOptions extends z4.$ZodType = any,
  UpdateSchema extends z4.$ZodObject = any,
  UpdateOptions extends z4.$ZodObject = any,
> {
  constructor(
    protected resource: Resource,
    protected config: {
      schema: z.ZodObject<Shape>;
      identitySchema: IdentityShape;
      include: z.ZodObject<IncludeShape>;
      createSchema?: CreateSchema;
      createOptionsSchema?: CreateOptions;
      updateSchema?: UpdateSchema;
      updateOptionsSchema?: UpdateOptions;
    },
    protected httpClientFactory: HTTPClientFactory,
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
      limit?: number | "all";
      page?: number | string;
      filter?: FilterStr;
    },
  >(options?: BrowseParams<P, Shape & IncludeShape>) {
    return new BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include,
      },
      {
        browseParams:
          (options && parseBrowseParams(options, this.config.schema, this.config.include)) || undefined,
      },
      this.httpClientFactory.create(),
    );
  }

  /**
   * Read function that accepts Identify fields like id, slug or email. Will return an instance
   * of ReadFetcher class.
   */
  public read(options: z4.infer<IdentityShape>) {
    return new ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.schema,
        include: this.config.include,
      },
      {
        identity: z4.parse(this.config.identitySchema, options),
      },
      this.httpClientFactory.create(),
    );
  }

  public async add(data: z4.input<CreateSchema>, options?: z4.infer<CreateOptions>) {
    if (!this.config.createSchema) {
      throw new Error("No createSchema defined");
    }
    const parsedData = z.parse(this.config.createSchema, data);
    const parsedOptions =
      this.config.createOptionsSchema && options
        ? z4.parse(this.config.createOptionsSchema, options)
        : undefined;
    const fetcher = new MutationFetcher(
      this.resource,
      {
        output: this.config.schema,
        paramsShape: this.config.createOptionsSchema,
      },
      parsedOptions as ({ id?: string } & z4.output<CreateOptions>) | undefined,
      { method: "POST", body: parsedData as any },
      this.httpClientFactory.create(),
    );
    return fetcher.submit();
  }

  public async edit(
    id: string,
    data: IsAny<UpdateSchema> extends true ? Partial<z4.input<CreateSchema>> : z4.input<UpdateSchema>,
    options?: z4.infer<UpdateOptions>,
  ) {
    let updateSchema: z4.$ZodObject | undefined = this.config.updateSchema;
    if (!this.config.updateSchema && this.config.createSchema && isZodObject(this.config.createSchema)) {
      updateSchema = this.config.createSchema.partial();
    }
    if (!updateSchema) {
      throw new Error("No updateSchema defined");
    }
    const cleanId = z.string().nonempty().parse(id);
    const parsedData = z.parse(updateSchema, data);
    const parsedOptions =
      this.config.updateOptionsSchema && options ? z.parse(this.config.updateOptionsSchema, options) : {};

    if (Object.keys(parsedData).length === 0) {
      throw new Error("No data to edit");
    }
    const fetcher = new MutationFetcher(
      this.resource,
      {
        output: this.config.schema,
        paramsShape: this.config.updateOptionsSchema,
      },
      { id: cleanId, ...parsedOptions } as ({ id?: string } & z4.output<UpdateOptions>) | undefined,
      { method: "PUT", body: parsedData },
      this.httpClientFactory.create(),
    );
    return fetcher.submit();
  }

  public async delete(id: string) {
    const cleanId = z.string().nonempty().parse(id);
    const fetcher = new DeleteFetcher(this.resource, { id: cleanId }, this.httpClientFactory.create());
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
