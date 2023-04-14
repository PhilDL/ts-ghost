import { z } from "zod";
import type { APICredentials } from "../schemas/shared";
import { _fetch } from "../helpers/network";

export class DeleteFetcher<Api extends APICredentials = any> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _resource: Api["resource"];

  constructor(private _params: { id: string }, protected _api: Api) {
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
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/${this._params.id}/`;
    this._URL = url;
  }

  public async submit() {
    const schema = z.discriminatedUnion("status", [
      z.object({
        status: z.literal("success"),
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
    const response = await _fetch(this._URL, this._api, {
      method: "DELETE",
    });
    let result: any = {};
    if (response.errors) {
      result.status = "error";
      result.errors = response.errors;
    } else {
      result = {
        status: "success",
      };
    }
    return schema.parse(result);
  }
}
