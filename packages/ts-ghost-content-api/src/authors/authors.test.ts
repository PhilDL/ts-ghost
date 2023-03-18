import createFetchMock, { type FetchMock } from "vitest-fetch-mock";
import fetch from "cross-fetch";
import { describe, test, expect, vi, afterEach, beforeEach } from "vitest";
import { TSGhostContentAPI } from "../content-api";
const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "59d4bf56c73c04a18c867dc3ba";

describe("authors api .browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI(url, key, "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    const browse = api.authors.browse({ input: { pp: 2 } });
    expect(browse.getParams().browseParams).toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ input: { order: "foo ASC" } })).toThrow();
    // valid
    expect(api.authors.browse({ input: { order: "name ASC" } }).getParams().browseParams).toStrictEqual({
      order: "name ASC",
    });
    expect(api.authors.browse({ input: { order: "name ASC,slug DESC" } }).getParams().browseParams).toStrictEqual({
      order: "name ASC,slug DESC",
    });
    expect(
      api.authors.browse({ input: { order: "name ASC,slug DESC,location ASC" } }).getParams().browseParams
    ).toStrictEqual({
      order: "name ASC,slug DESC,location ASC",
    });
    // @ts-expect-error - order should ony contain field (There is a typo in location)
    expect(() => api.authors.browse({ input: { order: "name ASC,slug DESC,locaton ASC" } })).toThrow();
  });

  test(".browse() 'filter' params should ony accept valid field", () => {
    expect(() =>
      api.authors.browse({
        // @ts-expect-error - order should ony contain field
        input: { filter: "foo:bar" },
      })
    ).toThrow();
    expect(
      api.authors
        .browse({
          input: { filter: "name:bar" },
        })
        .getParams().browseParams
    ).toStrictEqual({
      filter: "name:bar",
    });
    expect(
      api.authors
        .browse({
          input: { filter: "name:bar+slug:-test" },
        })
        .getParams().browseParams
    ).toStrictEqual({
      filter: "name:bar+slug:-test",
    });
  });

  test(".browse 'fields' argument should ony accept valid fields", () => {
    expect(
      api.authors
        .browse({
          output: {
            // @ts-expect-error - order should ony contain field
            fields: { foo: true },
          },
        })
        .getOutputFields()
    ).toEqual([]);

    expect(
      api.authors
        .browse({
          output: {
            fields: { location: true },
          },
        })
        .getOutputFields()
    ).toEqual(["location"]);
    expect(
      api.authors
        .browse({
          output: {
            fields: { name: true, website: true },
          },
        })
        .getOutputFields()
    ).toEqual(["name", "website"]);
  });
});

describe("authors resource mocked", () => {
  let api: TSGhostContentAPI;

  beforeEach(() => {
    api = new TSGhostContentAPI("https://my-ghost-blog.com", "59d4bf56c73c04a18c867dc3ba", "v5.0");
    vi.mock("cross-fetch", async () => {
      return {
        default: createFetchMock(vi),
      };
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("aouthors should be fetched correctly", async () => {
    const authors = api.authors;
    expect(authors).not.toBeUndefined();
    const browseQuery = authors.browse({
      input: { page: 2 },
      output: {
        fields: {
          name: true,
          id: true,
        },
      },
    });
    expect(browseQuery).not.toBeUndefined();
    expect(browseQuery.getParams()?.fields).toStrictEqual({
      name: true,
      id: true,
    });
    expect(browseQuery.getURL()?.searchParams.toString()).toBe(
      "key=59d4bf56c73c04a18c867dc3ba&page=2&fields=name%2Cid"
    );

    (fetch as FetchMock).doMockOnce(
      JSON.stringify({
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
      })
    );
    const result = await browseQuery.fetch();
    // expect(spy).toHaveBeenCalledTimes(1);
    expect(result).not.toBeUndefined();
    if (result.status === "success") {
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("foo");
      expect(result.data[0].id).toBe("eaoizdjoa1321123");
    }
  });
});
