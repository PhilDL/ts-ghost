import { z, ZodRawShape } from "zod";
import { type APICredentials, type GhostIdentityInput } from "../schemas/shared";
import { _fetch } from "./helpers";
import type { Mask } from "../utils";

export class ReadFetcher<
  Fields extends Mask<OutputShape>,
  BaseShape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  Api extends APICredentials
> {
  protected _urlParams: Record<string, string> = {};
  protected _URL: URL | undefined = undefined;
  protected _includeFields: (keyof IncludeShape)[] = [];
  protected readonly _resource: Api["resource"];

  constructor(
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
    protected _api: Api
  ) {
    this._buildUrlParams();
    this._resource = _api.resource;
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
      {
        schema: this.config.schema,
        output: this.config.output.required(formats as Formats),
        include: this.config.include,
      },
      params,
      this._api
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
  public include<Includes extends Mask<Pick<OutputShape, Extract<keyof IncludeShape, keyof OutputShape>>>>(
    include: z.noUnrecognized<Includes, OutputShape>
  ) {
    const params = {
      ...this._params,
      include: Object.keys(this.config.include.parse(include)),
    };
    return new ReadFetcher(
      {
        schema: this.config.schema,
        output: this.config.output.required(include as Includes),
        include: this.config.include,
      },
      params,
      this._api
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
      {
        schema: this.config.schema,
        output: newOutput,
        include: this.config.include,
      },
      this._params,
      this._api
    );
  }

  public getResource() {
    return this._resource;
  }

  public getParams() {
    return this._params;
  }

  public getOutputFields() {
    return this.config.output.keyof().options as string[];
  }

  public getURL() {
    return this._URL;
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
    if (this._api.endpoint === "content") {
      this._urlParams = {
        key: this._api.key,
      };
    }

    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      this._urlParams.fields = outputKeys.join(",");
    }
    if (this._params.include && this._params.include.length > 0) {
      this._urlParams.include = this._params.include.join(",");
    }
    if (this._params.formats && this._params.formats.length > 0) {
      this._urlParams.formats = this._params.formats.join(",");
    }
    const url = new URL(this._api.url);
    if (this._params.identity.id) {
      url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/${this._params.identity.id}/`;
    } else if (this._params.identity.slug) {
      url.pathname = `/ghost/api/${this._api.endpoint}/${this._api.resource}/slug/${this._params.identity.slug}/`;
    } else {
      throw new Error("Identity is not defined");
    }
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
        data: result[this._resource][0],
      };
    }
    return res.parse(data);
  }
}
