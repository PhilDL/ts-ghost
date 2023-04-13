import { z, ZodRawShape } from "zod";
import { type APICredentials, type GhostIdentityInput } from "../schemas/shared";
import { _fetch } from "./helpers";
import type { Mask } from "../utils";

export class PostFetcher<
  OutputShape extends ZodRawShape = any,
  ParamsShape extends ZodRawShape = any,
  Api extends APICredentials = any
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _resource: Api["resource"];

  constructor(
    protected config: {
      output: z.ZodObject<OutputShape>;
      paramsShape: z.ZodObject<ParamsShape>;
    },
    private _params: ParamsShape["output"],
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

  public getURL() {
    return this._URL;
  }

  private _buildUrlParams() {
    if (this._api.endpoint === "content") {
      this._urlParams = {
        key: this._api.key,
      };
    }
    if (this._params) {
      for (const [key, value] of Object.entries(this._params)) {
        this._urlParams[key] = value;
      }
    }

    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/`;
    for (const [key, value] of Object.entries(this._urlParams)) {
      url.searchParams.append(key, value);
    }
    this._URL = url;
  }

  public async post(data: OutputShape["output"]) {
    const res = z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
        data: z.array(this.config.output),
      }),
      z.object({
        status: z.literal("error"),
        errors: z.array(
          z.object({
            type: z.string(),
            message: z.string(),
            context: z.string().nullish(),
          })
        ),
      }),
    ]);
    const createData = {
      [this._resource]: data,
    };
    const result = await _fetch(this._URL, this._api, "POST", undefined, createData);
    console.log("result", result);
    let _data: any = {};
    if (result.errors) {
      _data.status = "error";
      _data.errors = result.errors;
    } else {
      _data = {
        status: "success",
        data: result[this._resource],
      };
    }
    return res.parse(_data);
  }
}
