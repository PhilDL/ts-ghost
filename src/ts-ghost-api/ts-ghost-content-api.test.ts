import type { Expect, Equal } from "../app/type-utils";
import { describe, test, expect, vi, afterEach } from "vitest";
import { BrowseEndpointType, ContentAPICredentialsSchema, AuthorAPI, TSGhostContentAPI } from "./ts-ghost-content-api";

import { parseBrowseParams, type BrowseOrder, type BrowseFilter } from "./browse-params";
import { AuthorSchema, PostSchema } from "../app/zod-schemas";
import fetch from "node-fetch";
import { z } from "zod";

describe("Isolated Types", () => {
  test("BrowseOrder", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test = Expect<Equal<BrowseOrder<"authors ASC", z.infer<typeof PostSchema>>, "authors ASC">>;
  });
  test("BrowseFilter", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test2 = Expect<Equal<BrowseFilter<"authors.slug:~test", z.infer<typeof PostSchema>>, "authors.slug:~test">>;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test3 = Expect<
      Equal<
        BrowseFilter<"authors.slug:~test+title:-toto", z.infer<typeof PostSchema>>,
        | "authors.slug:~test+title:-toto"
        | "authors.slug:~test,title:-toto"
        | "authors.slug:~test(title:-toto"
        | "authors.slug:~test)title:-toto"
      >
    >;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type test4 = Expect<Equal<BrowseFilter<"authors:~test", z.infer<typeof PostSchema>>, "authors:~test">>;
  });
});

describe("ContentApi.browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI("https://my-ghost-blog.com", "93fa6b1e07090ecdf686521b7e", "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    api.authors.browse({ pp: 2 });
    expect(api.authors.browseParams).toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ order: "foo ASC" } as const)).toThrow();
    // valid
    api.authors.browse({ order: "name ASC" } as const);
    api.authors.browse({ order: "name ASC,slug DESC" } as const);
    api.posts.browse({ order: "title ASC,slug DESC,authors ASC" } as const);
    // @ts-expect-error - order should ony contain field
    expect(() => api.posts.browse({ order: "title ASC,slug DESC,authrs ASC" } as const)).toThrow();
  });

  test(".browse() 'filter' params should ony accept valid field", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ filter: "foo:bar" } as const)).toThrow();
    api.authors.browse({ filter: "name:bar" } as const);
    api.authors.browse({ filter: "name:bar+slug:-test" } as const);
    api.posts.browse({ filter: "authors:bar" } as const);
    api.posts.browse({ filter: "authors.slug:bar" } as const);
    // @ts-expect-error - order should ony contain field
    expect(() => api.posts.browse({ filter: "author.slug:bar" } as const)).toThrow();
  });

  test(".browse 'fields' argument should ony accept valid fields", () => {
    // @ts-expect-error - order should ony contain field
    api.authors.browse({}, { foo: true });
  });
});

describe("parseBrowseArgs()", () => {
  test("'order' should accept valid fields and throw on unknown fields", () => {
    expect(() => parseBrowseParams({ order: "foo ASC" }, AuthorSchema)).toThrowError(Error);
    expect(parseBrowseParams({ order: "website ASC,name DESC" }, AuthorSchema)).toStrictEqual({
      order: "website ASC,name DESC",
    });
  });
  test("'filter' should accept valid filter and throw on unknown fields", () => {
    expect(() => parseBrowseParams({ filter: "foo:-bar" }, AuthorSchema)).toThrowError(Error);
    expect(parseBrowseParams({ filter: "website:bar" }, AuthorSchema)).toStrictEqual({
      filter: "website:bar",
    });
    expect(() => parseBrowseParams({ filter: "unknownkeys:bar+name:baz" }, AuthorSchema)).toThrow();
    expect(parseBrowseParams({ filter: "website:bar+name:baz" }, AuthorSchema)).toStrictEqual({
      filter: "website:bar+name:baz",
    });
  });
  test("'filter' should accept dotted notation", () => {
    expect(parseBrowseParams({ filter: "authors.slug:bar" }, PostSchema)).toStrictEqual({
      filter: "authors.slug:bar",
    });
  });
  test("'filter' should throw on unknown field dotted notation", () => {
    expect(() => parseBrowseParams({ filter: "authorss.slug:bar" }, PostSchema)).toThrow();
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
