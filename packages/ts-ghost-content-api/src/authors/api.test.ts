import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { BrowseEndpointType, TSGhostContentAPI } from "../content-api";
import { ContentAPICredentialsSchema } from "../schemas";
import { AuthorsAPI } from "./api";
import { authorsIncludeSchema, AuthorSchema } from "./schemas";
import fetch from "node-fetch";

describe("ContentApi.browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI("https://my-ghost-blog.com", "93fa6b1e07090ecdf686521b7e", "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    api.authors.browse({ input: { pp: 2 } });
    expect(api.authors.browseParams).toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ input: { order: "foo ASC" } } as const)).toThrow();
    // valid
    expect(api.authors.browse({ input: { order: "name ASC" } } as const).browseParams).toStrictEqual({
      order: "name ASC",
    });
    expect(api.authors.browse({ input: { order: "name ASC,slug DESC" } } as const).browseParams).toStrictEqual({
      order: "name ASC,slug DESC",
    });
    expect(
      api.authors.browse({ input: { order: "name ASC,slug DESC,location ASC" } } as const).browseParams
    ).toStrictEqual({
      order: "name ASC,slug DESC,location ASC",
    });
    // @ts-expect-error - order should ony contain field (There is a typo in location)
    expect(() => api.authors.browse({ input: { order: "name ASC,slug DESC,locaton ASC" } } as const)).toThrow();
  });

  test(".browse() 'filter' params should ony accept valid field", () => {
    expect(() =>
      // @ts-expect-error - order should ony contain field
      api.authors.browse({
        input: { filter: "foo:bar" },
      } as const)
    ).toThrow();
    expect(
      api.authors.browse({
        input: { filter: "name:bar" },
      } as const).browseParams
    ).toStrictEqual({
      filter: "name:bar",
    });
    expect(
      api.authors.browse({
        input: { filter: "name:bar+slug:-test" },
      } as const).browseParams
    ).toStrictEqual({
      filter: "name:bar+slug:-test",
    });
  });

  test(".browse 'fields' argument should ony accept valid fields", () => {
    expect(
      api.authors.browse({
        output: {
          // @ts-expect-error - order should ony contain field
          fields: { foo: true },
        },
      } as const).outputFields
    ).toEqual([]);
    expect(
      api.authors.browse({
        output: {
          fields: { location: true },
        },
      } as const).outputFields
    ).toEqual(["location"]);
    expect(
      api.authors.browse({
        output: {
          fields: { name: true, website: true },
        },
      } as const).outputFields
    ).toEqual(["name", "website"]);
  });
});

describe("authors endpoint", () => {
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
