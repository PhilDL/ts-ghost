import { describe, test, expect, vi, afterEach } from "vitest";
import { BrowseEndpointType, ContentAPICredentialsSchema, AuthorAPI } from "./ts-ghost-content-api";

import { AuthorSchema } from "../app/zod-schemas";
import fetch from "node-fetch";

describe("ts-ghost-content-api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("New API", async () => {
    const testApi = {
      endpoint: BrowseEndpointType.authors,
      fetch: fetch,
      key: "93fa6b1e07090ecdf686521b7e",
      version: "v5.0",
      url: "https://my-ghost-blog.com",
    } as const;
    const api = ContentAPICredentialsSchema.parse(testApi);
    const authors = new AuthorAPI(AuthorSchema, AuthorSchema, {}, api);
    expect(authors).not.toBeUndefined();

    const browseQuery = authors.browse({ page: 2 } as const, { name: true, id: true });
    expect(browseQuery).not.toBeUndefined();
    expect(browseQuery.browseParams?.page).toBe("2");
    expect(browseQuery.browseUrlSearchParams).toBe("page=2&key=93fa6b1e07090ecdf686521b7e&fields=name%2Cid");

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
});
