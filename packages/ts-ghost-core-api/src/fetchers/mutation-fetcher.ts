import { z } from "zod";
import * as z4 from "zod/v4/core";

import { HTTPClient } from "../helpers/http-client";
import type { APIResource } from "../schemas/shared";

export class MutationFetcher<
  const Resource extends APIResource = any,
  OutputShape extends z4.$ZodType = any,
  ParamsShape extends z4.$ZodType = any,
  const HTTPVerb extends "POST" | "PUT" = "POST",
> {
  protected _urlParams: Record<string, string> = {};
  protected _urlSearchParams: URLSearchParams | undefined = undefined;
  protected _pathnameIdentity: string | undefined = undefined;

  constructor(
    protected resource: Resource,
    protected config: {
      output: OutputShape;
      paramsShape?: ParamsShape;
    },
    private _params: ({ id?: string } & z4.output<ParamsShape>) | undefined,
    protected _options: {
      method: HTTPVerb;
      body: Record<string, unknown>;
    },
    protected httpClient: HTTPClient,
  ) {
    this._buildUrlParams();
  }

  public getResource() {
    return this.resource;
  }

  public getParams() {
    return this._params;
  }

  private _buildUrlParams() {
    if (this._params) {
      for (const [key, value] of Object.entries(this._params)) {
        if (key !== "id") {
          this._urlParams[key] = value;
        }
      }
    }

    this._urlSearchParams = new URLSearchParams();
    if (this._params?.id) {
      this._pathnameIdentity = `${this._params.id}`;
    }
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
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
          }),
        ),
      }),
    ]);
    // Ghost API is expecting a JSON object with a key that matches the resource name
    // e.g. { posts: [ { title: "Hello World" } ] }
    // https://ghost.org/docs/api/v3/content/#create-a-post
    // body is also an array of objects, so we need to wrap it in another array
    // but Ghost will throw an error if given more than 1 item in the array.
    const createData = {
      [this.resource]: [this._options.body],
    };
    const response = await this.httpClient.fetch({
      resource: this.resource,
      searchParams: this._urlSearchParams,
      pathnameIdentity: this._pathnameIdentity,
      options: {
        method: this._options.method,
        body: JSON.stringify(createData),
      },
    });
    let result: any = {};
    if (response.errors) {
      result.success = false;
      result.errors = response.errors;
    } else {
      result = {
        success: true,
        data: response[this.resource][0],
      };
    }
    return schema.parse(result);
  }
}
