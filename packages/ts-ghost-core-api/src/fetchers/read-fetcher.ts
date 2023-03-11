import { z, ZodRawShape } from "zod";
import { type APICredentials, type GhostIdentityInput } from "../schemas/shared";
import { _fetch } from "./helpers";

export class ReadFetcher<
  Fields extends z.objectKeyMask<OutputShape>,
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
      identity: GhostIdentityInput;
      include?: (keyof IncludeShape)[];
      fields?: Fields;
      formats?: string[];
    },
    protected _api: Api
  ) {
    this._buildUrlParams();
    this._resource = _api.resource;
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
    if (this._params.identity.id) {
      url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/${this._params.identity.id}/`;
    } else if (this._params.identity.slug) {
      url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/slug/${this._params.identity.slug}/`;
    } else {
      throw new Error("Identity is not defined");
    }
    for (const [key, value] of Object.entries(this._urlParams)) {
      url.searchParams.append(key, value);
    }
    this._URL = url;
  }

  public async fetch() {
    const res = z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        data: this.config.output,
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
    const result = await _fetch(this._URL, this._api);
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "success",
        data: result[this._resource][0],
      };
    }
    return res.parse(data);
  }
}
