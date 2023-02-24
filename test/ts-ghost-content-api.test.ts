import { describe, test, expect } from "vitest";
import {
  BrowseEndpoint,
  TSGhostContentAPI,
  BrowseEndpointType,
  InternalApiSchema,
  type InternalApi,
} from "../src/app/ts-ghost-content-api";
import { AuthorSchema } from "../src/app/zod-schemas";
import fetch from "node-fetch";
import { z } from "zod";

describe("ts-ghost-content-api", () => {
  test("Browse endpoint should work", async () => {
    const testApi = {
      endpoint: BrowseEndpointType.authors,
      fetch: fetch,
      key: "foobarbaz",
      version: "v5",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(testApi);
    const authors = new BrowseEndpoint(AuthorSchema, api);
    expect(authors).not.toBeUndefined();
    const browseAuthors = authors.browse({
      order: "name ASC",
      limit: 2,
      page: 3,
      filter: "name:-foo+website:-codingdodo",
    } as const);
    expect(browseAuthors).not.toBeUndefined();
    expect(browseAuthors.browseArgs?.filter).toBe("name:-foo+website:-codingdodo");
    expect(browseAuthors.browseArgs?.order).toBe("name ASC");
    expect(browseAuthors.browseArgs?.limit).toBe("2");
    expect(browseAuthors.browseArgs?.page).toBe("3");
    expect(browseAuthors.browseUrlSearchParams).toBe(
      "order=name+ASC&limit=2&page=3&filter=name%3A-foo%2Bwebsite%3A-codingdodo"
    );
    const authorsName = browseAuthors.fields({
      name: true,
    });
    expect(authorsName.browseUrlSearchParams).toBe(
      "order=name+ASC&limit=2&page=3&filter=name%3A-foo%2Bwebsite%3A-codingdodo&fields=name"
    );
    // const test = await authorsName.fetch();
  });

  test("TSGhostContentAPI should work", async () => {
    const api = new TSGhostContentAPI();
    expect(api).not.toBeUndefined();
    const browseTags = api.tiers.browse({
      page: 1,
      filter: "visibility:public",
    } as const);
    expect(browseTags).not.toBeUndefined();
    expect(browseTags.browseUrlSearchParams).toBe("page=1&filter=visibility%3Apublic");
    const tagsWithNameAndDescr = browseTags.fields({
      name: true,
      description: true,
    });
    expect(tagsWithNameAndDescr.browseUrlSearchParams).toBe(
      "page=1&filter=visibility%3Apublic&fields=name%2Cdescription"
    );
  });

  test("TSGhostContentAPI fetch", async () => {
    const api = new TSGhostContentAPI();
    const test = await api.posts
      .browse({ limit: 15, page: 1, order: "title DESC" } as const)
      .fields({ title: true, slug: true })
      .getApi().endpoint;
    console.log("test");
  });
});
