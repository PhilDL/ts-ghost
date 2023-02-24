import fetch from "node-fetch";
import { z, ZodRawShape } from "zod";
import { ContentAPICredentials, AuthorAPI } from "./ts-ghost-content-api";
import { BrowseParamsSchema, BrowseParams, parseBrowseParams } from "./browse-params";
import { schemaWithPickedFields } from "./fields";

export abstract class BaseAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  B extends BrowseParamsSchema
> {
  constructor(
    protected readonly schema: z.ZodObject<Shape>,
    public output: z.ZodObject<OutputShape>,
    public browseParams: B | undefined = undefined,
    protected _api: ContentAPICredentials
  ) {}

  get outputFields() {
    return this.output.keyof().options as string[];
  }

  get browseUrlSearchParams() {
    const inputKeys = this.schema.keyof().options as string[];
    const outputKeys = this.output.keyof().options as string[];
    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
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
