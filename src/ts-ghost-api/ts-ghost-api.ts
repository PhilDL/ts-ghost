import fetch from "node-fetch";
import { z, ZodRawShape } from "zod";
import { ContentAPICredentials, AuthorAPI } from "./ts-ghost-content-api";
import { BrowseParamsSchema, BrowseParams, parseBrowseParams } from "./browse-params";

export abstract class BaseAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> {
  constructor(
    private readonly schema: z.ZodObject<Shape>,
    public output: z.ZodObject<OutputShape>,
    public browseParams: B | undefined = undefined,
    protected _api: ContentAPICredentials
  ) {}

  /**
   * Browse function
   * @param browseParams
   * @param mask
   * @returns
   */
  browse = <
    P extends { order?: string; limit?: number | string; page?: number | string; filter?: string },
    Fields extends z.objectKeyMask<OutputShape>
  >(
    browseParams: BrowseParams<P, Shape>,
    fields?: z.noUnrecognized<Fields, OutputShape>
  ) => {
    const args = parseBrowseParams(browseParams, this.schema);
    return new AuthorAPI(
      this.schema,
      this.output.pick(fields || ({} as z.noUnrecognized<Fields, OutputShape>)),
      args,
      this._api
    );
  };

  get browseUrlSearchParams() {
    const inputKeys = this.schema.keyof().options as string[];
    const outputKeys = this.output.keyof().options as string[];
    if (inputKeys.length !== outputKeys.length) {
      const params = {
        ...this.browseParams,
        key: this._api.key,
        fields: outputKeys.join(","),
      };
      return new URLSearchParams(params).toString();
    }
    const params = {
      ...this.browseParams,
      key: this._api.key,
    };
    return new URLSearchParams(params).toString();
  }

  abstract fetch(): unknown;

  _fetch = async () => {
    const url = new URL(this._api.url);
    url.pathname = `/ghost/api/content/${this._api.endpoint}/?${this.browseUrlSearchParams}`;
    let result = undefined;
    try {
      result = await (
        await fetch(url.toString(), {
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
  };
}
