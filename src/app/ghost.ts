import type { GhostAPI } from "@tryghost/content-api";
import { Tag, Author } from "./zod-schemas";
import GhostContentAPI from "@tryghost/content-api";
import fetch from "node-fetch";
import { GhostFetchTiersSchema, GhostFetchAuthorsSchema } from "./zod-schemas";

export type Endpoints = "tiers" | "posts" | "tags" | "settings" | "pages" | "authors";

export type CommaSeparatedFields<Ressource, T extends string> = T extends `${infer Field},${infer Rest}`
  ? Field extends keyof Ressource
    ? `${Field},${CommaSeparatedFields<Ressource, Rest>}`
    : never
  : T extends keyof Ressource
  ? T
  : never;

// type test = CommaSeparatedFields<{ id: string; name: string }, "id,name">;
export type Params<Ressource> = {
  include?: (keyof Ressource)[];
  fields?: readonly (keyof Ressource)[];
};

export type BrowseParams<Ressource> = Params<Ressource> & {
  limit?: string;
  page?: string;
  filter?: string;
  order?: string;
};

export type PostBrowseParams<Ressource> = Params<Ressource> &
  BrowseParams<Ressource> & {
    formats?: string;
  };

export type InferParams<T extends Endpoints> = T extends "posts" | "pages"
  ? PostBrowseParams<{ id: string }>
  : T extends "tiers"
  ? // ? BrowseParams<Tier>
    // tiers doesn't support search params
    never
  : T extends "tags"
  ? BrowseParams<Tag>
  : T extends "settings"
  ? Params<{ id: string }>
  : T extends "authors"
  ? BrowseParams<Author>
  : never;

export class Ghost {
  api: GhostAPI;
  url: string;
  key: string;
  version: "v5.0" | "v2" | "v3" | "v4" | "canary";

  constructor(url: string, key: string, version: "v5.0" | "v2" | "v3" | "v4" | "canary" = "v5.0") {
    this.url = url;
    this.key = key;
    this.version = version;
    this.api = new GhostContentAPI({
      url,
      key,
      version,
    });
  }

  fetchBlogPosts = async (page = 1) => {
    const posts = await this.api.posts
      .browse({
        include: ["tags", "authors"],
        page,
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
    return posts;
  };

  fetchAllBlogPosts = async () => {
    const posts = await this.api.posts
      .browse({
        include: ["tags", "authors"],
      })
      .catch((err: Error) => {
        console.error(err.message);
      });
    const pages = posts?.meta?.pagination?.pages || 1;
    if ((pages || 1) > 1) {
      for (let i = 2; i <= pages; i++) {
        const morePosts = await this.api.posts
          .browse({
            include: ["tags", "authors"],
            page: i,
          })
          .catch((err: Error) => {
            console.error(err.message);
          });
        posts?.push(...(morePosts || []));
      }
    }
    return posts;
  };

  fetchBlogPost = async (slug: string) => {
    const post = await this.api.posts
      .read(
        {
          slug: slug,
        },
        {
          include: ["tags", "authors"],
          formats: ["html", "plaintext"],
        }
      )
      .catch((err: Error) => {
        console.error(err.message);
      });
    return post;
  };

  fetchSettings = async () => {
    const settings = await this.api.settings.browse().catch((err) => {
      console.error(err.message);
    });
    return settings;
  };

  fetchAllTags = async () => {
    const tags = await this.api.tags
      .browse({
        limit: "all",
        fields: [
          "id",
          "name",
          "slug",
          "description",
          "feature_image",
          "visibility",
          "og_image",
          "og_title",
          "og_description",
          "twitter_image",
          "twitter_title",
          "twitter_description",
          "meta_title",
          "meta_description",
          "canonical_url",
          "accent_color",
          "url",
        ],
      })
      .catch((err) => {
        console.error(err.message);
      });
    return tags;
  };

  _fetch = async <T extends Endpoints>(endpoint: T, params?: InferParams<T>) => {
    let urlParamsObj: Record<string, string> = { key: this.key };
    if (params) {
      const { include, fields, ...cleanParams } = params;
      urlParamsObj = { ...urlParamsObj, ...cleanParams };
      if (include && Array.isArray(include) && include.length > 0) {
        urlParamsObj = { ...urlParamsObj, include: include.join(",") };
      }
      if (fields && Array.isArray(fields) && fields.length > 0) {
        urlParamsObj = { ...urlParamsObj, fields: fields.join(",") };
      }
    }

    const urlParams = new URLSearchParams(urlParamsObj);
    const url = `${this.url}/ghost/api/content/${endpoint}/?${urlParams.toString()}`;
    // const url = `${this.url}/ghost/api/content/tiers/?key=${this.key}&fields=name`;
    console.log("url", url);
    return await (
      await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": this.version,
        },
      })
    ).json();
  };

  fetchAllTiers = async () => {
    const result = await this._fetch("tiers");
    console.log("res", result);
    const tiers = GhostFetchTiersSchema.parse(result);
    return tiers;
  };

  fetchAllAuthors = async () => {
    // const fields = ["name", "slug"] as const;
    // const result = await this._fetch("authors", { fields });
    // const filter = fields.reduce((acc, field) => {
    //   acc[field] = true;
    //   return acc;
    // }, {} as Record<(typeof fields)[number], true>);

    // const filteredAuthorSchema = filterSchema(AuthorSchema, filter);
    // const browseSchema = z.object({
    //   meta: GhostMetaSchema,
    //   authors: z.array(filteredAuthorSchema),
    // });
    // const authors = browseSchema.parse(result);
    // return authors;
    const result = await this._fetch("authors");
    const authors = GhostFetchAuthorsSchema.parse(result);
    return authors;
  };
}
