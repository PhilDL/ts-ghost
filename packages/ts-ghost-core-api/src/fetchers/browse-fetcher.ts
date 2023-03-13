import { schemaWithPickedFields } from "../query-builder/fields";
import { BrowseParamsSchema } from "../query-builder/browse-params";
import { z, ZodRawShape } from "zod";
import { ghostMetaSchema, type APICredentials } from "../schemas/shared";
import { _fetch } from "./helpers";
import type { Mask } from "../utils";

export class BrowseFetcher<
  Params extends BrowseParamsSchema,
  Fields extends Mask<OutputShape>,
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends APICredentials
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];
  protected readonly _resource: Api["resource"];

  constructor(
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
    } = { browseParams: {} as Params, include: [], fields: {} as z.noUnrecognized<Fields, OutputShape> },
    protected _api: Api
  ) {
    this._buildUrlParams();
    this._resource = _api.resource;
  }

  public _beta_unstable_formats<Formats extends Mask<Pick<OutputShape, "html" | "mobiledoc" | "plaintext">>>(
    formats: Formats
  ) {
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output: this.config.output.required(formats),
        include: this.config.include,
      },
      this._params,
      this._api
    );
  }

  public _beta_unstable_include<
    Includes extends Mask<Pick<OutputShape, Extract<keyof IncludeShape, keyof OutputShape>>>
  >(include: Includes) {
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output: this.config.output.required(include),
        include: this.config.include,
      },
      this._params,
      this._api
    );
  }

  public _beta_unstable_fields<Fields extends Mask<OutputShape>>(fields: Fields) {
    return new BrowseFetcher(
      {
        schema: this.config.schema,
        output: this.config.output.pick(fields),
        include: this.config.include,
      },
      this._params,
      this._api
    );
  }

  public getResource() {
    return this._resource;
  }

  public getParams() {
    return this._params;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURL() {
    return this._URL;
  }

  public getIncludes() {
    return this._params?.include || [];
  }

  private _buildUrlParams() {
    const inputKeys = this.config.schema.keyof().options as string[];
    const outputKeys = this.config.output.keyof().options as string[];
    if (this._api.endpoint === "content") {
      this._urlParams = {
        key: this._api.key,
        ...this._urlBrowseParams(),
      };
    } else {
      this._urlParams = {
        ...this._urlBrowseParams(),
      };
    }

    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    if (this._params.formats && this._params.formats.length > 0) {
      this._urlParams.formats = this._params.formats.join(",");
    }
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/`;
    for (const [key, value] of Object.entries(this._urlParams)) {
      url.searchParams.append(key, value);
    }
    this._URL = url;
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
    return z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        meta: ghostMetaSchema,
        data: z.array(this.config.output),
      }),
      z.object({
        status: z.literal("error"),
        errors: z.array(
          z.object({
            type: z.string(),
            message: z.string(),
          })
        ),
      }),
    ]);
  }

  public async fetch() {
    const resultSchema = this._getResultSchema();
    const result = await _fetch(this._URL, this._api);
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "success",
        meta: result.meta,
        data: result[this._resource],
      };
    }
    return resultSchema.parse(data);
  }

  public async paginate() {
    if (!this._params.browseParams?.page) {
      this._params.browseParams = {
        ...this._params.browseParams,
        page: 1,
      } as Params;
      this._buildUrlParams();
    }

    const resultSchema = this._getResultSchema();
    const result = await _fetch(this._URL, this._api);
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "success",
        meta: result.meta,
        data: result[this._resource],
      };
    }
    const response: {
      current: z.infer<typeof resultSchema>;
      next: BrowseFetcher<Params, Fields, BaseShape, OutputShape, IncludeShape, Api> | undefined;
    } = {
      current: resultSchema.parse(data),
      next: undefined,
    };
    if (response.current.status === "error") return response;
    const { meta } = response.current;
    if (meta.pagination.pages <= 1 || meta.pagination.page === meta.pagination.pages) return response;
    const params = {
      ...this._params,
      browseParams: {
        ...this._params.browseParams,
        page: meta.pagination.page + 1,
      },
    };
    const next = new BrowseFetcher(this.config, params, this._api);
    response.next = next;
    return response;
  }
}
