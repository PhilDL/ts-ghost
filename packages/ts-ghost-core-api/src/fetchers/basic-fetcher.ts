import fetch from "cross-fetch";
import { z, ZodRawShape } from "zod";
import type { ContentAPICredentials } from "../schemas";

export class BasicFetcher<OutputShape extends ZodRawShape, Api extends ContentAPICredentials> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _endpoint: Api["endpoint"];

  constructor(
    protected config: {
      output: z.ZodObject<OutputShape>;
    },
    protected _api: Api
  ) {
    this._buildUrl();
    this._endpoint = _api.endpoint;
  }

  public getEndpoint() {
    return this._endpoint;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURL() {
    return this._URL;
  }

  private _buildUrl() {
    this._urlParams = {
      key: this._api.key,
    };
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/content/${this._api.endpoint}/`;
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
    const result = await this._fetch();
    let data: any = {};
    if (result.errors) {
      data.status = "error";
      data.errors = result.errors;
    } else {
      data = {
        status: "success",
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
