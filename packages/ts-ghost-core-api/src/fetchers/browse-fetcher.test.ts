import createFetchMock, { type FetchMock } from "vitest-fetch-mock";
import fetch from "cross-fetch";
import type { ContentAPICredentials, AdminAPICredentials } from "../schemas/shared";
import { expect, test, describe, assert } from "vitest";
import { BrowseFetcher } from "./browse-fetcher";
import { z } from "zod";

describe("BrowseFetcher", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

  const adminApi: AdminAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "admin",
  };

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
    vi.mock("cross-fetch", async () => {
      return {
        default: createFetchMock(vi),
      };
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should return a BrowseFetcher instance", () => {
    const browseFetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      api
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(browseFetcher.getIncludes()).toEqual([]);
    expect(browseFetcher.getParams()).toStrictEqual({});
    expect(browseFetcher.getURL()?.toString()).toBe("https://ghost.org/ghost/api/content/posts/?key=1234");
  });

  test("should return a BrowseFetcher instance with Admin API", () => {
    const browseFetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      adminApi
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(browseFetcher.getIncludes()).toEqual([]);
    expect(browseFetcher.getParams()).toStrictEqual({});
    expect(browseFetcher.getURL()?.toString()).toBe("https://ghost.org/ghost/api/admin/posts/");
  });

  test("should return a BrowseFetcher instance with undefined browse params", () => {
    const browseFetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      undefined,
      api
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
    expect(browseFetcher.getURL()?.toString()).toBe("https://ghost.org/ghost/api/content/posts/?key=1234");
  });

  test("creating a BrowseFetcher with params", async () => {
    const pick = {
      title: true,
      slug: true,
      count: true,
    } as const;
    const output = simplifiedSchema.pick(pick);
    const browseFetcher = new BrowseFetcher(
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
      api
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
    expect(browseFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/?key=1234&order=title+DESC&limit=10&fields=title%2Cslug%2Ccount&include=count"
    );
    (fetch as FetchMock).doMockOnce(
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
      })
    );
    const result = await browseFetcher.fetch();
    expect(result.status).toBe("success");
    if (result.status === "success") {
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
      // @ts-expect-error - published is not in the output schema
      expect(result.data[0].published).toBeUndefined();
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
      adminApi
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
    expect(browseFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/admin/posts/?order=title+DESC&limit=10&fields=title%2Cslug%2Ccount&include=count"
    );
  });

  test("creating a BrowseFetcher with formats", async () => {
    const browseFetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        formats: ["html", "plaintext"],
      },
      api
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getParams()).toStrictEqual({
      formats: ["html", "plaintext"],
    });
    expect(browseFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/?key=1234&formats=html%2Cplaintext"
    );
  });

  test("creating a BrowseFetcher that paginates", async () => {
    const browseFetcher = new BrowseFetcher(
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
      api
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);

    (fetch as FetchMock).doMockOnce(
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
      })
    );
    const result = await browseFetcher.paginate();
    assert(result.current.status === "success");
    expect(result.current.data[0].slug).toBe("first-page-blog-post");
    expect(result.next).toBeInstanceOf(BrowseFetcher);
    assert(result.next);
    expect(result.next.getParams()).toStrictEqual({
      browseParams: {
        limit: 1,
        page: 2,
      },
    });
    (fetch as FetchMock).doMockOnce(
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
      })
    );
    const nextResult = await result.next.paginate();
    assert(nextResult.current.status === "success");
    expect(nextResult.current.data[0].slug).toBe("second-page-blog-post");
    expect(nextResult.next).toBeUndefined();
  });

  test("_fetch failed, errors were caught in the fetch", async () => {
    const browseFetcher = new BrowseFetcher(
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
      api
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    (fetch as FetchMock).mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await browseFetcher.fetch();
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.errors).toStrictEqual([
        {
          type: "FetchError",
          message: "Fake Fetch Error",
        },
      ]);
    }
  });

  test("_fetch failed, errors were caught in the paginate", async () => {
    const browseFetcher = new BrowseFetcher(
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
      api
    );
    expect(browseFetcher).toBeInstanceOf(BrowseFetcher);
    (fetch as FetchMock).mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await browseFetcher.paginate();
    expect(result.current.status).toBe("error");
    if (result.current.status === "error") {
      expect(result.current.errors).toStrictEqual([
        {
          type: "FetchError",
          message: "Fake Fetch Error",
        },
      ]);
    }
  });

  test("expect BrowseFetcher _fetch to throw if _URL is not defined", async () => {
    const fetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      api
    );
    // @ts-expect-error - _URL is private
    fetcher._URL = undefined;
    await expect(fetcher.fetch()).rejects.toThrowError("URL is undefined");
    // @ts-expect-error - _params is private
    fetcher._params = undefined;
    expect(fetcher.getIncludes()).toEqual([]);
  });
});

describe("BrowseFetcher output tests suite", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

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

  beforeEach(() => {
    vi.mock("cross-fetch", async () => {
      return {
        default: createFetchMock(vi),
      };
    });
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("beta__unstable tests", async () => {
    const fetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      api
    );
    (fetch as FetchMock).doMockOnce(
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
      })
    );
    const res = await fetcher.formats({ html: true }).fields({ html: true }).fetch();
    assert(res.status === "success");
    expect(res.data.length).toBe(1);
    expect(res.data[0].html).toBe("<h1>Hello world</h1>");
    // @ts-expect-error - plaintext is not defined
    expect(res.data[0].plaintext).toBeUndefined();
  });

  test("new formats, fields, and include", async () => {
    const fetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      api
    );
    const res = fetcher
      .formats({ html: true })
      .include({ count: true, "nested.key": true })
      .fields({ html: true, published: true, count: true });
    expect(res.getIncludes()).toStrictEqual(["count", "nested.key"]);
    expect(res.getOutputFields()).toStrictEqual(["html", "published", "count"]);
    expect(res.getFormats()).toStrictEqual(["html"]);
    expect(res.getURL()?.toString().replace("https://ghost.org/ghost/api/content/posts/", "")).toBe(
      "?key=1234&fields=html%2Cpublished%2Ccount&include=count%2Cnested.key&formats=html"
    );
  });
  test("new formats, fields, and include should indicate wrong fields", async () => {
    const fetcher = new BrowseFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {},
      api
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
    expect(res.getURL()?.toString().replace("https://ghost.org/ghost/api/content/posts/", "")).toBe(
      "?key=1234&fields=html%2Cpublished%2Ccount&include=count&formats=html"
    );
  });
});
