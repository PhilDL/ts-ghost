import { z, ZodRawShape } from "zod";
import type { APICredentials } from "../schemas/shared";
import { _fetch } from "./helpers";

export class BasicFetcher<OutputShape extends ZodRawShape, Api extends APICredentials> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _resource: Api["resource"];

  constructor(
    protected config: {
      output: z.ZodObject<OutputShape>;
    },
    protected _api: Api
  ) {
    this._buildUrl();
    this._resource = _api.resource;
  }

  public getResource() {
    return this._resource;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURL() {
    return this._URL;
  }

  private _buildUrl() {
    if (this._api.endpoint === "content") {
      this._urlParams = {
        key: this._api.key,
      };
    }
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/`;
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
        data: result[this._resource],
      };
    }
    return res.parse(data);
  }
}
