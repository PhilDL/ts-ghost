import { z } from "zod";

import type { HTTPClient } from "../helpers/http-client";
import type { APIResource } from "../schemas/shared";

export class DeleteFetcher<const Resource extends APIResource = any> {
  protected _pathnameIdentity: string | undefined = undefined;

  constructor(
    protected resource: Resource,
    private _params: { id: string },
    protected httpClient: HTTPClient,
  ) {
    this._buildPathnameIdentity();
  }

  public getResource() {
    return this.resource;
  }

  public getParams() {
    return this._params;
  }

  private _buildPathnameIdentity() {
    if (!this._params.id) {
      throw new Error("Missing id in params");
    }
    this._pathnameIdentity = this._params.id;
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
          }),
        ),
      }),
    ]);
    let result: any = {};
    try {
      const response = await this.httpClient.fetchRawResponse({
        resource: this.resource,
        pathnameIdentity: this._pathnameIdentity,
        options: {
          method: "DELETE",
        },
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
