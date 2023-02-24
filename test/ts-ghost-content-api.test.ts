import { describe, test, expect, vi, afterEach } from "vitest";
import {
  BrowseEndpointType,
  InternalApiSchema,
  AuthorAPI,
  TSGhostContentAPI,
  parseBrowseArgs,
} from "../src/app/ts-ghost-content-api";
import { AuthorSchema, PostSchema } from "../src/app/zod-schemas";
import fetch from "node-fetch";

describe("ContentApi.browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI("https://codingdodo.com", "foobarbaz", "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    const test = api.authors.browse({ pp: 2 });
    expect(test.browseArgs, "Invalid params should be ignored").toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ order: "foo ASC" } as const)).toThrow();
    // valid
    api.authors.browse({ order: "name ASC" } as const);
    // api.authors.browse({ order: "name ASC,slug DESC" } as const);
  });

  test("Browse Fields params should ony accept valid field", () => {
    // @ts-expect-error - order should ony contain field
    api.authors.browse({}, { foo: true });
  });
});

describe("parseBrowseArgs()", () => {
  test("'order' should accept valid fields and throw on unknown fields", () => {
    expect(() => parseBrowseArgs({ order: "foo ASC" }, AuthorSchema)).toThrowError(Error);
    expect(parseBrowseArgs({ order: "website ASC,name DESC" }, AuthorSchema)).toStrictEqual({
      order: "website ASC,name DESC",
    });
  });
  test("'filter' should accept valid filter and throw on unknown fields", () => {
    expect(() => parseBrowseArgs({ filter: "foo:-bar" }, AuthorSchema)).toThrowError(Error);
    expect(parseBrowseArgs({ filter: "website:bar" }, AuthorSchema)).toStrictEqual({
      filter: "website:bar",
    });
    expect(() => parseBrowseArgs({ filter: "unknownkeys:bar+name:baz" }, AuthorSchema)).toThrow();
    expect(parseBrowseArgs({ filter: "website:bar+name:baz" }, AuthorSchema)).toStrictEqual({
      filter: "website:bar+name:baz",
    });
  });
  test("'filter' should accept dotted notation", () => {
    expect(parseBrowseArgs({ filter: "authors.slug:bar" }, PostSchema)).toStrictEqual({
      filter: "authors.slug:bar",
    });
  });
  test("'filter' should throw on unknown field dotted notation", () => {
    expect(() => parseBrowseArgs({ filter: "authorss.slug:bar" }, PostSchema)).toThrow();
  });
});

describe("ts-ghost-content-api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("New API", async () => {
    const testApi = {
      endpoint: BrowseEndpointType.authors,
      fetch: fetch,
      key: "foobarbaz",
      version: "v5.0",
      url: "https://codingdodo.com",
    } as const;
    const api = InternalApiSchema.parse(testApi);
    const authors = new AuthorAPI(AuthorSchema, AuthorSchema, {}, api);
    expect(authors).not.toBeUndefined();

    const browseQuery = authors.browse({ page: 2 } as const, { name: true, id: true });
    expect(browseQuery).not.toBeUndefined();
    expect(browseQuery.browseArgs?.page).toBe("2");
    expect(browseQuery.browseUrlSearchParams).toBe("page=2&key=foobarbaz&fields=name%2Cid");

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
