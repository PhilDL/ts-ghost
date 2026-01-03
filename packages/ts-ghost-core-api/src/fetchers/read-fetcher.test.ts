import createFetchMock from "vitest-fetch-mock";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod/v3";

import { HTTPClient, HTTPClientOptions } from "../helpers/http-client";
import { ReadFetcher } from "./read-fetcher";

const fetchMocker = createFetchMock(vi);

const fixture = JSON.stringify({
  posts: [
    {
      title: "title",
      slug: "this-is-a-slug-test",
      count: 1,
    },
  ],
});

describe("ReadFetcher", () => {
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
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  test("should return a ReadFetcher instance using id", async () => {
    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
      },
      httpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
    });
    expect(readFetcher.getFormats()).toStrictEqual([]);
    fetchMocker.doMockOnce(fixture);
    await readFetcher.fetch();

    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/eh873jdLsnaUDj7149DSASJhdqsdj/?key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });

  test("should return a ReadFetcher with admin API instance using id", async () => {
    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
      },
      adminHttpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
    });
    fetchMocker.doMockOnce(fixture);
    await readFetcher.fetch();

    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/admin/posts/eh873jdLsnaUDj7149DSASJhdqsdj/",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
          Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
        },
      },
    );
  });

  test("should return a ReadFetcher instance using slug", async () => {
    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
      httpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
    });
    fetchMocker.doMockOnce(fixture);
    await readFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });

  test("identity read fields params should only accept key from the identity read schema", () => {
    expect(
      () =>
        new ReadFetcher(
          "posts",
          {
            schema: simplifiedSchema,
            output: simplifiedSchema,
            include: simplifiedIncludeSchema,
          },
          {
            identity: {
              // @ts-expect-error - invalid field
              foo: "foobarbaz",
            },
          },
          httpClient,
        ),
    ).toThrow();
  });

  test("ReadFetcher should accept include and fields ", async () => {
    const pick = { title: true, slug: true, count: true } as const;
    const outputSchema = simplifiedSchema.pick(pick);

    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: outputSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
        fields: { title: true, slug: true, count: true },
        include: ["count"],
      },
      httpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      fields: { title: true, slug: true, count: true },
      include: ["count"],
    });

    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            title: "title",
            slug: "this-is-a-slug-test",
            count: 1,
          },
        ],
      }),
    );
    const result = await readFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?fields=title%2Cslug%2Ccount&include=count&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
    assert(result.success);
    expect(result.data).toStrictEqual({
      title: "title",
      slug: "this-is-a-slug-test",
      count: 1,
    });
  });

  test("creating a ReadFetcher with formats", async () => {
    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
        formats: ["html", "plaintext"],
      },
      httpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      formats: ["html", "plaintext"],
    });
    fetchMocker.doMockOnce(fixture);
    await readFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?formats=html%2Cplaintext&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });

  test("ReadFetcher with no results ", async () => {
    const pick = { title: true, slug: true, count: true } as const;
    const outputSchema = simplifiedSchema.pick(pick);

    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: outputSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
        fields: { title: true, slug: true, count: true },
        include: ["count"],
      },
      httpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(readFetcher.getIncludes()).toEqual(["count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      fields: { title: true, slug: true, count: true },
      include: ["count"],
    });

    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ message: "Validation error, cannot read author.", type: "ValidationError" }],
      }),
    );

    const result = await readFetcher.fetch();
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?fields=title%2Cslug%2Ccount&include=count&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
    assert(!result.success);
    expect(result.errors).toStrictEqual([
      { message: "Validation error, cannot read author.", type: "ValidationError" },
    ]);
  });

  test("_fetch failed, errors were caught in the fetch", async () => {
    const readFetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
      httpClient,
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    fetchMocker.mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await readFetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toStrictEqual([
        {
          type: "FetchError",
          message: "Fake Fetch Error",
        },
      ]);
    }
  });

  test("expect ReadFetcher _fetch to throw if _URL is not defined", async () => {
    const fetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
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

describe("ReadFetcherFetcher outputs test suite", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v6.0",
    endpoint: "content",
  };
  let httpClient: HTTPClient;

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
  });

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
    httpClient = new HTTPClient(credentials);
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  test("new formats, fields, and include", async () => {
    const fetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      { identity: { slug: "this-is-a-slug" } },
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
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?fields=html%2Cpublished%2Ccount&include=count%2Cnested.key&formats=html&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });

  test("new formats, fields, and include", async () => {
    const fetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      { identity: { email: "abc@foo.com" } },
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
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/email/abc@foo.com/?fields=html%2Cpublished%2Ccount&include=count%2Cnested.key&formats=html&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });

  test("new formats, fields, and include should indicate wrong fields", async () => {
    const fetcher = new ReadFetcher(
      "posts",
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      { identity: { slug: "this-is-a-slug" } },
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
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?fields=html%2Cpublished%2Ccount&include=count&formats=html&key=1234",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v6.0",
        },
      },
    );
  });
});
