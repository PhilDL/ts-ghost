import createFetchMock from "vitest-fetch-mock";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { TSGhostContentAPI } from "../content-api";

const fetchMocker = createFetchMock(vi);

describe("authors api .browse() Args Type-safety", () => {
  const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
  const key = process.env.VITE_GHOST_CONTENT_API_KEY || "59d4bf56c73c04a18c867dc3ba";
  const api = new TSGhostContentAPI(url, key, "v6.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    const browse = api.authors.browse({ pp: 2 });
    expect(browse.getParams().browseParams).toStrictEqual({});
  });

  test(".browse() 'order' params should ony accept fields values", () => {
    // @ts-expect-error - order should ony contain field
    expect(() => api.authors.browse({ order: "foo ASC" })).toThrow();
    // valid
    expect(api.authors.browse({ order: "name ASC" }).getParams().browseParams).toStrictEqual({
      order: "name ASC",
    });
    expect(api.authors.browse({ order: "name ASC,slug DESC" }).getParams().browseParams).toStrictEqual({
      order: "name ASC,slug DESC",
    });
    expect(
      api.authors.browse({ order: "name ASC,slug DESC,location ASC" }).getParams().browseParams,
    ).toStrictEqual({
      order: "name ASC,slug DESC,location ASC",
    });
    // @ts-expect-error - order should ony contain field (There is a typo in location)
    expect(() => api.authors.browse({ order: "name ASC,slug DESC,locaton ASC" })).toThrow();
  });

  test(".browse() 'filter' params should ony accept valid field", () => {
    expect(() =>
      api.authors.browse({
        // @ts-expect-error - order should ony contain field
        filter: "foo:bar",
      }),
    ).toThrow();
    expect(
      api.authors
        .browse({
          filter: "name:bar",
        })
        .getParams().browseParams,
    ).toStrictEqual({
      filter: "name:bar",
    });
    expect(
      api.authors
        .browse({
          filter: "name:bar+slug:-test",
        })
        .getParams().browseParams,
    ).toStrictEqual({
      filter: "name:bar+slug:-test",
    });
  });

  test(".browse 'fields' argument should ony accept valid fields", () => {
    expect(
      api.authors
        .browse()
        .fields({
          // @ts-expect-error - order should ony contain field
          foo: true,
        })
        .getOutputFields(),
    ).toEqual([]);

    expect(api.authors.browse().fields({ location: true }).getOutputFields()).toEqual(["location"]);
    expect(api.authors.browse().fields({ name: true, website: true }).getOutputFields()).toEqual([
      "name",
      "website",
    ]);
  });
});

describe("authors resource mocked", () => {
  let api: TSGhostContentAPI;

  beforeEach(() => {
    api = new TSGhostContentAPI("https://my-ghost-blog.com", "59d4bf56c73c04a18c867dc3ba", "v6.0");
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("aouthors should be fetched correctly", async () => {
    const authors = api.authors;
    expect(authors).not.toBeUndefined();
    const browseQuery = authors
      .browse({
        page: 2,
      })
      .fields({
        name: true,
        id: true,
      });
    expect(browseQuery).not.toBeUndefined();
    expect(browseQuery.getOutputFields()).toStrictEqual(["name", "id"]);

    fetchMocker.doMockOnce(
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
      }),
    );
    const result = await browseQuery.fetch();
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://my-ghost-blog.com/ghost/api/content/authors/?page=2&fields=name%2Cid&key=59d4bf56c73c04a18c867dc3ba",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
    expect(result).not.toBeUndefined();
    if (result.success) {
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe("foo");
      expect(result.data[0].id).toBe("eaoizdjoa1321123");
    }
  });
});
