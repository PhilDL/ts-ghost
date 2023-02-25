import fetch from "node-fetch";
import { z, ZodRawShape } from "zod";
import { BrowseParamsSchema } from "./helpers/browse-params";

type ContentAPICredentials = {
  endpoint?: any;
  version?: any;
  key: string;
  url: string;
};

export abstract class BaseAPI<
  Shape extends ZodRawShape,
  OutputShape extends ZodRawShape,
  IncludeShape extends ZodRawShape,
  B extends BrowseParamsSchema
> {
  protected _includeFields: (keyof IncludeShape)[] = [];
  constructor(
    protected config: {
      schema: z.ZodObject<Shape>;
      output: z.ZodObject<OutputShape>;
      include: z.ZodObject<IncludeShape>;
    },
    public browseParams: B | undefined = undefined,
    protected _api: ContentAPICredentials
  ) {}

  get outputFields() {
    return this.config.output.keyof().options as string[];
  }

  setIncludeFields(fields: z.infer<z.ZodObject<IncludeShape>>) {
    const parsedIncludeFields = this.config.include.parse(fields);
    this._includeFields = Object.keys(parsedIncludeFields);
  }

  get includeFields() {
    return this._includeFields;
  }

  get urlBrowseParams() {
    if (this.browseParams === undefined) return {};
    let urlBrowseParams: { filter?: string; page?: string; order?: string; limit?: string } = {};
    const { limit, page, ...params } = this.browseParams;
    urlBrowseParams = {
      ...params,
    };
    if (limit) {
      urlBrowseParams.limit = limit.toString();
    }
    if (page) {
      urlBrowseParams.page = page.toString();
    }
    return urlBrowseParams;
  }

  get browseUrlSearchParams() {
    const inputKeys = this.config.schema.keyof().options as string[];
    const outputKeys = this.config.output.keyof().options as string[];
    let params: Record<string, string> = {};
    params = {
      key: this._api.key,
      ...this.urlBrowseParams,
    };
    if (inputKeys.length !== outputKeys.length && outputKeys.length > 0) {
      params.fields = outputKeys.join(",");
    }
    if (this.includeFields.length > 0) {
      params.include = this.includeFields.join(",");
    }
    return new URLSearchParams(params).toString();
  }

  // abstract newWrapper(): unknown;

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
