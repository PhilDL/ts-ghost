import { z, ZodRawShape } from "zod/v3";

import { BrowseParamsSchema } from "../helpers/browse-params";
import type { HTTPClient } from "../helpers/http-client";
import { ghostMetaSchema, type APIResource } from "../schemas/shared";
import type { Exactly, Mask, NoUnrecognizedKeys } from "../utils";
import { contentFormats, type ContentFormats } from "./formats";

export class BrowseFetcher<
  const Resource extends APIResource = any,
  Params extends BrowseParamsSchema = any,
  Fields extends Mask<OutputShape> = any,
  BaseShape extends ZodRawShape = any,
  OutputShape extends ZodRawShape = any,
  IncludeShape extends ZodRawShape = any,
> {
  protected _urlParams: Record<string, string> = {};
  protected _urlSearchParams: URLSearchParams | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];

  constructor(
    protected resource: Resource,
    protected config: {
      schema: z.ZodObject<BaseShape>;
      output: z.ZodObject<OutputShape>;
      include: z.ZodObject<IncludeShape>;
    },
    private _params: {
      browseParams?: Params;
      include?: (keyof IncludeShape)[];
      fields?: Fields;
      formats?: string[];
    } = { browseParams: {} as Params, include: [], fields: {} as NoUnrecognizedKeys<Fields, OutputShape> },
    protected httpClient: HTTPClient,
  ) {
    this._buildUrlParams();
  }

  /**
   * Lets you choose output format for the content of Post and Pages resources
   * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
   * with the selected formats required.
   *
   * @param formats html, mobiledoc or plaintext
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  public formats<Formats extends Mask<Pick<OutputShape, ContentFormats>>>(
    formats: NoUnrecognizedKeys<Formats, OutputShape>,
  ) {
    const params = {
      ...this._params,
      formats: Object.keys(formats).filter((key) => contentFormats.includes(key)),
    };
    return new BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(formats as Exactly<Formats, Formats>),
        include: this.config.include,
      },
      params,
      this.httpClient,
    );
  }

  /**
   * Let's you include special keys into the Ghost API Query to retrieve complimentary info
   * The available keys are defined by the Resource include schema, will not care about unknown keys.
   * Returns a new Fetcher with an Output shape modified with the include keys required.
   *
   * @param include Include specific keys from the include shape
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  public include<Includes extends Mask<IncludeShape>>(include: NoUnrecognizedKeys<Includes, IncludeShape>) {
    const params = {
      ...this._params,
      include: Object.keys(this.config.include.parse(include)),
    };
    // remove dot-notation from the include object key
    const requiredIncludeKeys = Object.fromEntries(
      Object.keys(include)
        .filter((key) => !key.includes("."))
        .map((key) => [key, include[key]]),
    );

    return new BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(requiredIncludeKeys as Exactly<Includes, Includes>),
        include: this.config.include,
      },
      params,
      this.httpClient,
    );
  }

  /**
   * Let's you strip the output to only the specified keys of your choice that are in the config Schema
   * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
   *
   * @param fields Any keys from the resource Schema
   * @returns A new Fetcher with the fixed output shape having only the selected Fields
   */
  public fields<Fields extends Mask<OutputShape>>(fields: NoUnrecognizedKeys<Fields, OutputShape>) {
    const newOutput = this.config.output.pick(fields as Exactly<Fields, Fields>);
    return new BrowseFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: newOutput,
        include: this.config.include,
      },
      this._params,
      this.httpClient,
    );
  }

  public getResource() {
    return this.resource;
  }

  public getParams() {
    return this._params;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURLSearchParams() {
    return this._urlSearchParams;
  }

  public getIncludes() {
    return this._params?.include || [];
  }

  public getFormats() {
    return this._params?.formats || [];
  }

  private _buildUrlParams() {
    const inputKeys = this.config.schema.keyof().options as string[];
    const outputKeys = this.config.output.keyof().options as string[];
    this._urlParams = {
      ...this._urlBrowseParams(),
    };

    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.filter((key) => key !== "count").join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    if (this._params.formats && this._params.formats.length > 0) {
      this._urlParams.formats = this._params.formats.join(",");
    }
    this._urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
  }

  private _urlBrowseParams() {
    let urlBrowseParams: { filter?: string; page?: string; order?: string; limit?: string } = {};
    if (this._params.browseParams === undefined) return {};
    const { limit, page, ...params } = this._params.browseParams;
    urlBrowseParams = {
      ...params,
    };
    if (limit) {
      urlBrowseParams.limit = limit.toString();
    }
    if (page) {
      urlBrowseParams.page = page.toString();
    }
    return urlBrowseParams;
  }

  private _getResultSchema() {
    return z.discriminatedUnion("success", [
      z.object({
        success: z.literal(true),
        meta: ghostMetaSchema,
        data: z.array(this.config.output),
      }),
      z.object({
        success: z.literal(false),
        errors: z.array(
          z.object({
            type: z.string(),
            message: z.string(),
          }),
        ),
      }),
    ]);
  }

  public async fetch(options?: RequestInit & { debug?: boolean }) {
    const resultSchema = this._getResultSchema();
    if (options?.debug) {
      console.log("_urlSearchParams", this._urlSearchParams);
    }
    const result = await this.httpClient.fetch({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      options,
    });
    if (options?.debug) {
      console.log("result", result);
    }
    let data: any = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
    } else {
      data = {
        success: true,
        meta: result.meta || {
          pagination: {
            pages: 0,
            page: 0,
            limit: 15,
            total: 0,
            prev: null,
            next: null,
          },
        },
        data: result[this.resource],
      };
    }
    return resultSchema.parse(data);
  }

  public async paginate(options?: RequestInit) {
    if (!this._params.browseParams?.page) {
      this._params.browseParams = {
        ...this._params.browseParams,
        page: 1,
      } as Params;
      this._buildUrlParams();
    }

    const resultSchema = this._getResultSchema();
    const result = await this.httpClient.fetch({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      options,
    });
    let data: any = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
    } else {
      data = {
        success: true,
        meta: result.meta || {
          pagination: {
            pages: 0,
            page: 0,
            limit: 15,
            total: 0,
            prev: null,
            next: null,
          },
        },
        data: result[this.resource],
      };
    }
    const response: {
      current: z.infer<typeof resultSchema>;
      next: BrowseFetcher<Resource, Params, Fields, BaseShape, OutputShape, IncludeShape> | undefined;
    } = {
      current: resultSchema.parse(data),
      next: undefined,
    };
    if (response.current.success === false) return response;
    const { meta } = response.current;
    if (meta.pagination.pages <= 1 || meta.pagination.page === meta.pagination.pages) return response;
    const params = {
      ...this._params,
      browseParams: {
        ...this._params.browseParams,
        page: meta.pagination.page + 1,
      },
    };
    const next = new BrowseFetcher(this.resource, this.config, params, this.httpClient);
    response.next = next;
    return response;
  }
}
