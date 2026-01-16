import createFetchMock from "vitest-fetch-mock";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod/v3";

import { HTTPClient, type HTTPClientOptions } from "../helpers";
import { BrowseFetcher } from "./browse-fetcher";

const fetchMocker = createFetchMock(vi);

const postsStub = JSON.stringify({
  posts: [
    {
      title: "title",
      slug: "eaoizdjoa1321123",
      count: 1,
    },
  ],
  meta: {
    pagination: {
      page: 1,
      limit: 10,
      pages: 1,
      total: 1,
      next: null,
      prev: null,
    },
  },
});
describe("BrowseFetcher", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v6.0",
    endpoint: "content",
  };
  const adminCredentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "aaiuzhduad:baiuciauhviahuv",
    version: "v6.0",
    endpoint: "admin",
  };
  let httpClient: HTTPClient;
  let adminHttpClient: HTTPClient;

  // const adminApi: AdminAPICredentials = {
  //   url: "https://ghost.org",
  //   key: "1234",
  //   version: "v6.0",
  //   resource: "posts",
  //   endpoint: "admin",
  // };

  // const adminHttpClient = new HTTPClient(adminApi);

  const simplifiedSchema = z.object({
    title: z.string(),
    slug: z.string(),
    published: z.boolean().optional(),
    count: z.number().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
  });

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    adminHttpClient = new HTTPClient(adminCredentials);
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    fetchMocker.resetMocks();
  });

  test("should return a BrowseFetcher instance", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(browseFetcher.getIncludes()).toEqual([]);
    expect(browseFetcher.getParams()).toStrictEqual({});
    expect(browseFetcher.getFormats()).toStrictEqual([]);

    fetchMocker.doMockOnce(postsStub);
    const result = await browseFetcher.fetch();

    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v6.0",
      },
    });
    assert(result.success === true);
    expect(result.data).toStrictEqual([
      {
        title: "title",
        slug: "eaoizdjoa1321123",
        count: 1,
      },
    ]);
  });

  test("should return a BrowseFetcher instance with Admin API", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      adminHttpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(browseFetcher.getIncludes()).toEqual([]);
    expect(browseFetcher.getParams()).toStrictEqual({});

    fetchMocker.doMockOnce(postsStub);
    const result = await browseFetcher.fetch();

    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/admin/posts/", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v6.0",
        Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
      },
    });
    assert(result.success === true);
    expect(result.data).toStrictEqual([
      {
        title: "title",
        slug: "eaoizdjoa1321123",
        count: 1,
      },
    ]);
  });

  test("should return a BrowseFetcher instance with undefined browse params", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      undefined,
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(browseFetcher.getIncludes()).toEqual([]);
    expect(browseFetcher.getParams()).toStrictEqual({
      browseParams: {},
      fields: {},
      include: [],
    });
    fetchMocker.doMockOnce(postsStub);
    await browseFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v6.0",
      },
    });
  });

  test("creating a BrowseFetcher with params", async () => {
    const pick = {
      title: true,
      slug: true,
      count: true,
    } as const;
    const output = simplifiedSchema.pick(pick);
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          order: "title DESC",
          limit: 10,
        },
        include: ["count"],
        fields: {
          title: true,
          slug: true,
          count: true,
        },
      },
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(browseFetcher.getIncludes()).toEqual(["count"]);
    expect(browseFetcher.getParams()).toStrictEqual({
      browseParams: {
        limit: 10,
        order: "title DESC",
      },
      fields: {
        slug: true,
        count: true,
        title: true,
      },
      include: ["count"],
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            title: "title",
            slug: "eaoizdjoa1321123",
            count: 1,
          },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            pages: 1,
            total: 1,
            next: null,
            prev: null,
          },
        },
      }),
    );
    const result = await browseFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/?order=title+DESC&limit=10&fields=title%2Cslug%2Ccount&include=count&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toStrictEqual([
        {
          title: "title",
          slug: "eaoizdjoa1321123",
          count: 1,
        },
      ]);

      expect(result.data[0].count).toBe(1);
      expect(result.meta).toStrictEqual({
        pagination: {
          page: 1,
          limit: 10,
          pages: 1,
          total: 1,
          next: null,
          prev: null,
        },
      });
      expect(result.meta.pagination).toStrictEqual({
        page: 1,
        limit: 10,
        pages: 1,
        total: 1,
        next: null,
        prev: null,
      });
      // @ts-expect-error - published is not in the output schema
      expect(result.data[0].published).toBeUndefined();
    }
  });

  test("BrowseFetcher .fetch() that returns empty set should return default meta", async () => {
    const pick = {
      title: true,
      slug: true,
      count: true,
    } as const;
    const output = simplifiedSchema.pick(pick);
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          order: "title DESC",
          limit: 10,
        },
        include: ["count"],
        fields: {
          title: true,
          slug: true,
          count: true,
        },
      },
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [],
      }),
    );
    const result = await browseFetcher.fetch();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toStrictEqual([]);
      expect(result.meta).toStrictEqual({
        pagination: {
          page: 0,
          limit: 15,
          pages: 0,
          total: 0,
          next: null,
          prev: null,
        },
      });
    }
  });

  test("BrowseFetcher .paginate() that returns empty set should return default meta", async () => {
    const pick = {
      title: true,
      slug: true,
      count: true,
    } as const;
    const output = simplifiedSchema.pick(pick);
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          order: "title DESC",
          limit: 10,
        },
        include: ["count"],
        fields: {
          title: true,
          slug: true,
          count: true,
        },
      },
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [],
      }),
    );
    const result = await browseFetcher.paginate();
    expect(result.current.success).toBe(true);
    if (result.current.success) {
      expect(result.current.data).toStrictEqual([]);
      expect(result.current.meta).toStrictEqual({
        pagination: {
          page: 0,
          limit: 15,
          pages: 0,
          total: 0,
          next: null,
          prev: null,
        },
      });
    }
  });

  test("creating a Admin API BrowseFetcher with params", async () => {
    const pick = {
      title: true,
      slug: true,
      count: true,
    } as const;
    const output = simplifiedSchema.pick(pick);
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          order: "title DESC",
          limit: 10,
        },
        include: ["count"],
        fields: {
          title: true,
          slug: true,
          count: true,
        },
      },
      adminHttpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(browseFetcher.getIncludes()).toEqual(["count"]);
    expect(browseFetcher.getParams()).toStrictEqual({
      browseParams: {
        limit: 10,
        order: "title DESC",
      },
      fields: {
        slug: true,
        count: true,
        title: true,
      },
      include: ["count"],
    });
    fetchMocker.doMockOnce(postsStub);
    await browseFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/admin/posts/?order=title+DESC&limit=10&fields=title%2Cslug%2Ccount&include=count",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
          Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
        },
      },
    );
  });

  test("creating a BrowseFetcher with formats", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        formats: ["html", "plaintext"],
      },
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getParams()).toStrictEqual({
      formats: ["html", "plaintext"],
    });
    expect(browseFetcher.getFormats()).toStrictEqual(["html", "plaintext"]);
    fetchMocker.doMockOnce(postsStub);
    await browseFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/?formats=html%2Cplaintext&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });

  test("creating a BrowseFetcher that paginates", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          limit: 1,
        },
      },
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);

    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            title: "title",
            slug: "first-page-blog-post",
            count: 1,
            published: true,
          },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 1,
            pages: 2,
            total: 2,
            next: null,
            prev: null,
          },
        },
      }),
    );
    const result = await browseFetcher.paginate();
    assert(result.current.success);
    expect(result.current.data[0].slug).toBe("first-page-blog-post");
    expect(result.current.meta).toStrictEqual({
      pagination: {
        page: 1,
        limit: 1,
        pages: 2,
        total: 2,
        next: null,
        prev: null,
      },
    });
    expect(result.next).toBeInstanceOf(BrowseFetcher);
    assert(result.next);
    expect(result.next.getParams()).toStrictEqual({
      browseParams: {
        limit: 1,
        page: 2,
      },
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            title: "second page blog post",
            slug: "second-page-blog-post",
            count: 1,
            published: true,
          },
        ],
        meta: {
          pagination: {
            page: 2,
            limit: 1,
            pages: 2,
            total: 2,
            next: null,
            prev: null,
          },
        },
      }),
    );
    const nextResult = await result.next.paginate();
    assert(nextResult.current.success);
    expect(nextResult.current.data[0].slug).toBe("second-page-blog-post");
    expect(nextResult.next).toBeUndefined();
  });

  test("_fetch failed, errors were caught in the fetch", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          limit: 1,
        },
      },
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    fetchMocker.mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await browseFetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toStrictEqual([
        {
          type: "FetchError",
          message: "Fake Fetch Error",
        },
      ]);
      expect(result.status).toBe(0);
    }
  });

  test("fetch error returns status code 404", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "NotFoundError", message: "Resource not found" }],
      }),
      { status: 404 },
    );

    const result = await browseFetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(404);
      expect(result.errors[0].type).toBe("NotFoundError");
    }
  });

  test("fetch error returns status code 401", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "UnauthorizedError", message: "Invalid API key" }],
      }),
      { status: 401 },
    );

    const result = await browseFetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(401);
      expect(result.errors[0].type).toBe("UnauthorizedError");
    }
  });

  test("fetch error returns status code 500", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "InternalServerError", message: "Server error" }],
      }),
      { status: 500 },
    );

    const result = await browseFetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(500);
      expect(result.errors[0].type).toBe("InternalServerError");
    }
  });

  test("_fetch failed, errors were caught in the paginate", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        browseParams: {
          limit: 1,
        },
      },
      httpClient,
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    fetchMocker.mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await browseFetcher.paginate();
    expect(result.current.success).toBe(false);
    if (!result.current.success) {
      expect(result.current.errors).toStrictEqual([
        {
          type: "FetchError",
          message: "Fake Fetch Error",
        },
      ]);
      expect(result.current.status).toBe(0);
    }
  });

  test("paginate error returns status code 404", async () => {
    const browseFetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "NotFoundError", message: "Resource not found" }],
      }),
      { status: 404 },
    );

    const result = await browseFetcher.paginate();
    expect(result.current.success).toBe(false);
    if (!result.current.success) {
      expect(result.current.status).toBe(404);
      expect(result.current.errors[0].type).toBe("NotFoundError");
    }
  });

  test("expect BrowseFetcher _fetch to throw if _URL is not defined", async () => {
    const fetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    // @ts-expect-error - _URL is private
    fetcher.httpClient._baseURL = undefined;
    await expect(fetcher.fetch()).rejects.toThrowError("URL is undefined");
    // @ts-expect-error - _params is private
    fetcher._params = undefined;
    expect(fetcher.getIncludes()).toEqual([]);
  });
});

describe("BrowseFetcher output tests suite", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v6.0",
    endpoint: "content",
  };
  let httpClient: HTTPClient;

  const simplifiedSchema = z.object({
    title: z.string(),
    slug: z.string(),
    published: z.boolean().optional(),
    count: z.number().optional(),
    html: z.string().optional(),
    plaintext: z.string().optional(),
    mobiledoc: z.string().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
    "nested.key": z.literal(true).optional(),
  });

  const fixture = JSON.stringify({
    posts: [
      {
        title: "title",
        slug: "eaoizdjoa1321123",
        count: 1,
        published: true,
        html: "html",
        plaintext: "plaintext",
        mobiledoc: "mobiledoc",
      },
    ],
    meta: {
      pagination: {
        page: 1,
        limit: 10,
        pages: 1,
        total: 1,
        next: null,
        prev: null,
      },
    },
  });

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("beta__unstable tests", async () => {
    const fetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            html: "<h1>Hello world</h1>",
          },
        ],
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            pages: 1,
            total: 1,
            next: null,
            prev: null,
          },
        },
      }),
    );
    const res = await fetcher.formats({ html: true }).fields({ html: true }).fetch();
    assert(res.success);
    expect(res.data.length).toBe(1);
    expect(res.data[0].html).toBe("<h1>Hello world</h1>");
    // @ts-expect-error - plaintext is not defined
    expect(res.data[0].title).toBeUndefined();
    // @ts-expect-error - plaintext is not defined
    expect(res.data[0].plaintext).toBeUndefined();
  });

  test("new formats, fields, and include", async () => {
    const fetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    const res = fetcher
      .formats({ html: true })
      .include({ count: true, "nested.key": true })
      .fields({ html: true, published: true, count: true });
    expect(res.getIncludes()).toStrictEqual(["count", "nested.key"]);
    expect(res.getOutputFields()).toStrictEqual(["html", "published", "count"]);
    expect(res.getFormats()).toStrictEqual(["html"]);

    fetchMocker.doMockOnce(fixture);
    await res.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/?fields=html%2Cpublished%2Ccount&include=count%2Cnested.key&formats=html&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });
  test("new formats, fields, and include should indicate wrong fields", async () => {
    const fetcher = new BrowseFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      httpClient,
    );
    const res = fetcher
      // @ts-expect-error - foobar is not defined
      .formats({ html: true, foobar: true })
      // @ts-expect-error - foo is not in the include schema
      .include({ count: true, foo: true })
      // @ts-expect-error - barbaz is not in the output schema schema
      .fields({ html: true, published: true, count: true, barbaz: true });
    expect(res.getIncludes()).toStrictEqual(["count"]);
    expect(res.getOutputFields()).toStrictEqual(["html", "published", "count"]);
    expect(res.getFormats()).toStrictEqual(["html"]);
    fetchMocker.doMockOnce(fixture);
    await res.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/?fields=html%2Cpublished%2Ccount&include=count&formats=html&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });
});
