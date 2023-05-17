import { z, ZodRawShape } from "zod";

import type { HTTPClient } from "../helpers/http-client";
import { type APIResource, type GhostIdentityInput } from "../schemas/shared";
import type { Mask } from "../utils";

export class ReadFetcher<
  const Resource extends APIResource = any,
  Fields extends Mask<OutputShape> = any,
  BaseShape extends ZodRawShape = any,
  OutputShape extends ZodRawShape = any,
  IncludeShape extends ZodRawShape = any
> {
  protected _urlParams: Record<string, string> = {};
  protected _urlSearchParams: URLSearchParams | undefined = undefined;
  protected _pathnameIdentity: string | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];

  constructor(
    protected resource: Resource,
    protected config: {
      schema: z.ZodObject<BaseShape>;
      output: z.ZodObject<OutputShape>;
      include: z.ZodObject<IncludeShape>;
    },
    private _params: {
      identity: GhostIdentityInput;
      include?: (keyof IncludeShape)[];
      fields?: Fields;
      formats?: string[];
    },
    protected httpClient: HTTPClient
  ) {
    this._buildUrlParams();
  }

  /**
   * Lets you choose output format for the content of Post and Pages resources
   * The choices are html, mobiledoc or plaintext. It will transform the output of the fetcher to a new shape
   * with the selected formats required.
   *
   * @param formats html, mobiledoc or plaintext
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  public formats<Formats extends Mask<Pick<OutputShape, "html" | "mobiledoc" | "plaintext">>>(
    formats: z.noUnrecognized<Formats, OutputShape>
  ) {
    const params = {
      ...this._params,
      formats: Object.keys(formats).filter((key) => ["html", "mobiledoc", "plaintext"].includes(key)),
    };
    return new ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(formats as Formats),
        include: this.config.include,
      },
      params,
      this.httpClient
    );
  }

  /**
   * Let's you include special keys into the Ghost API Query to retrieve complimentary info
   * The available keys are defined by the Resource include schema, will not care about unknown keys.
   * Returns a new Fetcher with an Output shape modified with the include keys required.
   *
   * @param include Include specific keys from the include shape
   * @returns A new Fetcher with the fixed output shape and the formats specified
   */
  public include<Includes extends Mask<IncludeShape>>(include: z.noUnrecognized<Includes, IncludeShape>) {
    const params = {
      ...this._params,
      include: Object.keys(this.config.include.parse(include)),
    };
    return new ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: this.config.output.required(include as Includes),
        include: this.config.include,
      },
      params,
      this.httpClient
    );
  }

  /**
   * Let's you strip the output to only the specified keys of your choice that are in the config Schema
   * Will not care about unknown keys and return a new Fetcher with an Output shape with only the selected keys.
   *
   * @param fields Any keys from the resource Schema
   * @returns A new Fetcher with the fixed output shape having only the selected Fields
   */
  public fields<Fields extends Mask<OutputShape>>(fields: z.noUnrecognized<Fields, OutputShape>) {
    const newOutput = this.config.output.pick(fields);
    return new ReadFetcher(
      this.resource,
      {
        schema: this.config.schema,
        output: newOutput,
        include: this.config.include,
      },
      this._params,
      this.httpClient
    );
  }

  public getResource() {
    return this.resource;
  }

  public getParams() {
    return this._params;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getIncludes() {
    return this._params?.include || [];
  }

  public getFormats() {
    return this._params?.formats || [];
  }

  private _buildUrlParams() {
    const inputKeys = this.config.schema.keyof().options as string[];
    const outputKeys = this.config.output.keyof().options as string[];

    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    if (this._params.formats && this._params.formats.length > 0) {
      this._urlParams.formats = this._params.formats.join(",");
    }

    if (this._params.identity.id) {
      this._pathnameIdentity = `${this._params.identity.id}`;
    } else if (this._params.identity.slug) {
      this._pathnameIdentity = `slug/${this._params.identity.slug}`;
    } else if (this._params.identity.email) {
      this._pathnameIdentity = `email/${this._params.identity.email}`;
    } else {
      throw new Error("Identity is not defined");
    }
    this._urlSearchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(this._urlParams)) {
      this._urlSearchParams.append(key, value);
    }
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
          })
        ),
      }),
    ]);
    const result = await this.httpClient.fetch({
      resource: this.resource,
      pathnameIdentity: this._pathnameIdentity,
      searchParams: this._urlSearchParams,
      options,
    });
    let data: any = {};
    if (result.errors) {
      data.success = false;
      data.errors = result.errors;
    } else {
      data = {
        success: true,
        data: result[this.resource][0],
      };
    }
    return res.parse(data);
  }
}
