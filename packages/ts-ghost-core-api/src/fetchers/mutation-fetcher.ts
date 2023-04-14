import { z, ZodRawShape, ZodTypeAny } from "zod";
import { type APICredentials, type GhostIdentityInput } from "../schemas/shared";
import { _fetch } from "./helpers";
import type { Mask } from "../utils";

export class MutationFetcher<
  OutputShape extends ZodRawShape = any,
  ParamsShape extends ZodTypeAny = any,
  Api extends APICredentials = any
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _resource: Api["resource"];

  constructor(
    protected config: {
      output: z.ZodObject<OutputShape>;
      paramsShape?: ParamsShape;
    },
    private _params: ParamsShape["_output"],
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

  public async post(body: unknown) {
    const returnSchema = z.discriminatedUnion("status", [
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
    // Ghost API is expecting a JSON object with a key that matches the resource name
    // e.g. { posts: [ { title: "Hello World" } ] }
    // https://ghost.org/docs/api/v3/content/#create-a-post
    // body is also an array of objects, so we need to wrap it in another array
    // but Ghost will throw an error if given more than 1 item in the array.
    const createData = {
      [this._resource]: [body],
    };
    const response = await _fetch(this._URL, this._api, {
      method: "POST",
      body: JSON.stringify(createData),
    });
    let result: any = {};
    if (response.errors) {
      result.status = "error";
      result.errors = response.errors;
    } else {
      result = {
        status: "success",
        data: response[this._resource],
      };
    }
    return returnSchema.parse(result);
  }

  public async put(id: string, body: unknown) {
    const returnSchema = z.discriminatedUnion("status", [
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
    // Ghost API is expecting a JSON object with a key that matches the resource name
    // e.g. { posts: [ { title: "Hello World" } ] }
    // https://ghost.org/docs/api/v3/content/#create-a-post
    // body is also an array of objects, so we need to wrap it in another array
    // but Ghost will throw an error if given more than 1 item in the array.
    if (this._URL) {
      this._URL.pathname = `${this._URL.pathname}${id}/`;
    }
    const createData = {
      [this._resource]: [body],
    };
    const response = await _fetch(this._URL, this._api, {
      method: "PUT",
      body: JSON.stringify(createData),
    });
    let result: any = {};
    if (response.errors) {
      result.status = "error";
      result.errors = response.errors;
    } else {
      result = {
        status: "success",
        data: response[this._resource],
      };
    }
    return returnSchema.parse(result);
  }
}
