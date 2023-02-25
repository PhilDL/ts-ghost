import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import {
  BrowseEndpointType,
  ContentAPICredentialsSchema,
  AuthorsAPI,
  authorsIncludeSchema,
  TSGhostContentAPI,
} from "./ts-ghost-content-api";

import { AuthorSchema } from "../app/zod-schemas";
import fetch from "node-fetch";

describe("ts-ghost-content-api", () => {
  let api: TSGhostContentAPI;
  beforeEach(() => {
    api = new TSGhostContentAPI("https://my-ghost-blog.com", "93fa6b1e07090ecdf686521b7e", "v5.0");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("New API", async () => {
    const api = ContentAPICredentialsSchema.parse({
      endpoint: BrowseEndpointType.authors,
      fetch: fetch,
      key: "93fa6b1e07090ecdf686521b7e",
      version: "v5.0",
      url: "https://my-ghost-blog.com",
    });
    const authors = new AuthorsAPI(
      {
        schema: AuthorSchema,
        output: AuthorSchema,
        include: authorsIncludeSchema,
      },
      {},
      api
    );
    expect(authors).not.toBeUndefined();
    const browseQuery = authors.browse({
      input: { page: 2 },
      output: {
        fields: {
          name: true,
          id: true,
        },
      },
    } as const);
    expect(browseQuery).not.toBeUndefined();
    expect(browseQuery.browseParams?.page).toBe(2);
    expect(browseQuery.browseUrlSearchParams).toBe("key=93fa6b1e07090ecdf686521b7e&page=2&fields=name%2Cid");

    const spy = vi.spyOn(browseQuery, "_fetch");
    expect(spy.getMockName()).toEqual("_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting undefined because the class is abstract
    spy.mockImplementationOnce(() => {
      return {
        authors: [
          {
            name: "foo",
            id: "eaoizdjoa1321123",
          },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 15,
            pages: 1,
            total: 1,
            next: null,
            prev: null,
          },
        },
      };
    });
    const result = await browseQuery.fetch();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(result).not.toBeUndefined();
    expect(result.authors.length).toBe(1);
    expect(result.authors[0].name).toBe("foo");
    expect(result.authors[0].id).toBe("eaoizdjoa1321123");
  });

  test("Refactoring", async () => {
    const tagsBrowseQuery = api.tags.browse({
      input: {
        limit: 15,
        order: "name desc",
      },
      output: {
        fields: {
          name: true,
          id: true,
        },
        include: {
          "count.posts": true,
        },
      },
    } as const);
    expect(tagsBrowseQuery).not.toBeUndefined();
    expect(tagsBrowseQuery.browseParams).toStrictEqual({ limit: 15, order: "name desc" });
    expect(tagsBrowseQuery.outputFields).toStrictEqual(["name", "id"]);
    expect(tagsBrowseQuery.browseUrlSearchParams).toBe(
      "key=93fa6b1e07090ecdf686521b7e&order=name+desc&limit=15&fields=name%2Cid&include=count.posts"
    );
    const spy = vi.spyOn(tagsBrowseQuery, "_fetch");
    expect(spy.getMockName()).toEqual("_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting undefined because the class is abstract
    spy.mockImplementationOnce(() => {
      return {
        tags: [
          {
            name: "foo",
            id: "eaoizdjoa1321123",
          },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 15,
            pages: 1,
            total: 1,
            next: null,
            prev: null,
          },
        },
      };
    });
  });
});
