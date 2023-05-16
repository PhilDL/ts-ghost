import { z } from "zod";

import { HTTPClient } from "../helpers";
import type { APICredentials } from "../schemas/shared";

export class DeleteFetcher<Api extends APICredentials = any> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected readonly _resource: Api["resource"];

  constructor(private _params: { id: string }, protected _api: Api, protected httpClient: HTTPClient) {
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
    const schema = z.discriminatedUnion("success", [
      z.object({
        success: z.literal(true),
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
    let result: any = {};
    try {
      const response = await this.httpClient.fetchRawResponse(this._URL, this._api, {
        method: "DELETE",
      });
      if (response.status === 204) {
        result = {
          success: true,
        };
      } else {
        const res = await response.json();
        if (res.errors) {
          result.success = false;
          result.errors = res.errors;
        }
      }
    } catch (e) {
      result = {
        success: false,
        errors: [
          {
            type: "FetchError",
            message: (e as Error).toString(),
          },
        ],
      };
    }
    return schema.parse(result);
  }
}
