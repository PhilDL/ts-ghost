import { z, ZodTypeAny } from "zod/v3";

import type { HTTPClient } from "../helpers/http-client";
import type { APIResource } from "../schemas/shared";

export class BasicFetcher<const Resource extends APIResource = any, OutputShape extends ZodTypeAny = any> {
  constructor(
    protected resource: Resource,
    protected config: {
      output: OutputShape;
    },
    protected httpClient: HTTPClient,
  ) {}

  public getResource() {
    return this.resource;
  }

  public async fetch(options?: RequestInit) {
    const res = z.discriminatedUnion("success", [
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
          }),
        ),
      }),
    ]);
    const result = await this.httpClient.fetch({ options, resource: this.resource });
    let data: any = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
    } else {
      data = {
        success: true,
        data: result[this.resource],
      };
    }
    return res.parse(data);
  }
}
