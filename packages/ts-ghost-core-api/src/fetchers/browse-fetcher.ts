import fetch from "cross-fetch";
import { BrowseParamsSchema } from "../query-builder/browse-params";
import { z, ZodRawShape } from "zod";
import { ghostMetaSchema, type ContentAPICredentials } from "../schemas";

export class BrowseFetcher<
  Params extends BrowseParamsSchema,
  Fields extends z.objectKeyMask<OutputShape>,
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends ContentAPICredentials
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];
  protected readonly _endpoint: Api["endpoint"];

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
    } = { browseParams: {} as Params, include: [], fields: {} as z.noUnrecognized<Fields, OutputShape> },
    protected _api: Api
  ) {
    this._buildUrlParams();
    this._endpoint = _api.endpoint;
  }

  public getEndpoint() {
    return this._endpoint;
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
    this._urlParams = {
      key: this._api.key,
      ...this._urlBrowseParams(),
    };
    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/content/${this._api.endpoint}/`;
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
    const result = await this._fetch();
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "success",
        meta: result.meta,
        data: result[this._endpoint],
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
    const result = await this._fetch();
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "success",
        meta: result.meta,
        data: result[this._endpoint],
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

  async _fetch() {
    if (this._URL === undefined) throw new Error("URL is undefined");
    let result = undefined;
    try {
      result = await (
        await fetch(this._URL.toString(), {
          headers: {
            "Content-Type": "application/json",
            "Accept-Version": this._api.version,
          },
        })
      ).json();
    } catch (e) {
      return {
        status: "error",
        errors: [
          {
            type: "FetchError",
            message: (e as Error).toString(),
          },
        ],
      };
    }
    return result;
  }
}
