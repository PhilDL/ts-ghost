import { z, ZodRawShape, ZodTypeAny } from "zod";

import { _fetch } from "../helpers/network";
import type { APICredentials } from "../schemas/shared";

export class MutationFetcher<
  OutputShape extends ZodRawShape = any,
  ParamsShape extends ZodTypeAny = any,
  Api extends APICredentials = any,
  const HTTPVerb extends "POST" | "PUT" = "POST"
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _resource: Api["resource"];

  constructor(
    protected config: {
      output: z.ZodObject<OutputShape>;
      paramsShape?: ParamsShape;
    },
    private _params: ({ id?: string } & ParamsShape["_output"]) | undefined,
    protected _options: {
      method: HTTPVerb;
      body: Record<string, unknown>;
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
        if (key !== "id") {
          this._urlParams[key] = value;
        }
      }
    }

    const url = new URL(this._api.url);
    if (this._params?.id) {
      url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/${this._params.id}/`;
    } else {
      url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/`;
    }
    for (const [key, value] of Object.entries(this._urlParams)) {
      url.searchParams.append(key, value);
    }
    this._URL = url;
  }

  public async submit() {
    const schema = z.discriminatedUnion("success", [
      z.object({
        success: z.literal(true),
        data: this.config.output,
      }),
      z.object({
        success: z.literal(false),
        errors: z.array(
          z.object({
            type: z.string(),
            message: z.string(),
            context: z.string().nullish(),
          })
        ),
      }),
    ]);
    // Ghost API is expecting a JSON object with a key that matches the resource name
    // e.g. { posts: [ { title: "Hello World" } ] }
    // https://ghost.org/docs/api/v3/content/#create-a-post
    // body is also an array of objects, so we need to wrap it in another array
    // but Ghost will throw an error if given more than 1 item in the array.
    const createData = {
      [this._resource]: [this._options.body],
    };
    const response = await _fetch(this._URL, this._api, {
      method: this._options.method,
      body: JSON.stringify(createData),
    });
    let result: any = {};
    if (response.errors) {
      result.success = false;
      result.errors = response.errors;
    } else {
      result = {
        success: true,
        data: response[this._resource][0],
      };
    }
    return schema.parse(result);
  }
}
