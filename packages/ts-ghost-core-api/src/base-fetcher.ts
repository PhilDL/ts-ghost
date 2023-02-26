import fetch from "cross-fetch";
import { BrowseParamsSchema } from "./helpers/browse-params";
import { z, ZodRawShape } from "zod";
import { GhostMetaSchema, ContentAPICredentials } from "./schemas";

export class BaseFetcher<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema,
  Api extends ContentAPICredentials
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];
  protected readonly _endpoint: Api["endpoint"];
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      output: z.ZodObject<OutputShape>;
      include: z.ZodObject<IncludeShape>;
    },
    private _browseParams: B | undefined = undefined,
    protected _api: Api
  ) {
    this._buildUrlParams();
    this._endpoint = _api.endpoint;
  }

  public getEndpoint() {
    return this._endpoint;
  }

  public getBrowseParams() {
    return this._browseParams;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURL() {
    return this._URL;
  }

  public getIncludeFields() {
    return this._includeFields;
  }

  setIncludeFields(fields: z.infer<z.ZodObject<IncludeShape>>) {
    const parsedIncludeFields = this.config.include.parse(fields);
    this._includeFields = Object.keys(parsedIncludeFields);
    this._buildUrlParams();
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
    if (this.getIncludeFields().length > 0) {
      this._urlParams.include = this.getIncludeFields().join(",");
    }
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/content/${this._api.endpoint}/`;
    for (const [key, value] of Object.entries(this._urlParams)) {
      url.searchParams.append(key, value);
    }
    this._URL = url;
  }

  private _urlBrowseParams() {
    if (this._browseParams === undefined) return {};
    let urlBrowseParams: { filter?: string; page?: string; order?: string; limit?: string } = {};
    const { limit, page, ...params } = this._browseParams;
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

  public async fetch() {
    const res = z.discriminatedUnion("status", [
      z.object({
        status: z.literal("ok"),
        meta: GhostMetaSchema,
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
    const result = await this._fetch();
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "ok",
        meta: result.meta,
        data: result[this._endpoint],
      };
    }
    return res.parse(data);
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
      console.log("error", e);
    }
    return result;
  }
}
