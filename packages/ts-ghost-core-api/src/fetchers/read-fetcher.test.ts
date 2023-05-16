import createFetchMock from "vitest-fetch-mock";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

import { HTTPClient } from "../helpers/http-client";
import type { AdminAPICredentials, ContentAPICredentials } from "../schemas/shared";
import { ReadFetcher } from "./read-fetcher";

const fetchMocker = createFetchMock(vi);

describe("ReadFetcher", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

  const httpClient = new HTTPClient(api);

  const adminApi: AdminAPICredentials = {
    url: "https://ghost.org",
    key: "1234:123123",
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
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should return a ReadFetcher instance using id", () => {
    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
      },
      api,
      httpClient
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/eh873jdLsnaUDj7149DSASJhdqsdj/?key=1234"
    );
    expect(readFetcher.getFormats()).toStrictEqual([]);
  });

  test("should return a ReadFetcher with admin API instance using id", () => {
    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
      },
      adminApi,
      httpClient
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/admin/posts/eh873jdLsnaUDj7149DSASJhdqsdj/"
    );
  });

  test("should return a ReadFetcher instance using slug", () => {
    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
      api,
      httpClient
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234"
    );
  });

  test("identity read fields params should only accept key from the identity read schema", () => {
    expect(
      () =>
        new ReadFetcher(
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
          api,
          httpClient
        )
    ).toThrow();
  });

  test("ReadFetcher should accept include and fields ", async () => {
    const pick = { title: true, slug: true, count: true } as const;
    const outputSchema = simplifiedSchema.pick(pick);

    const readFetcher = new ReadFetcher(
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
      api,
      httpClient
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getResource()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      fields: { title: true, slug: true, count: true },
      include: ["count"],
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234&fields=title%2Cslug%2Ccount&include=count"
    );

    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            title: "title",
            slug: "this-is-a-slug-test",
            count: 1,
          },
        ],
      })
    );
    const result = await readFetcher.fetch();
    assert(result.success);
    expect(result.data).toStrictEqual({
      title: "title",
      slug: "this-is-a-slug-test",
      count: 1,
    });
  });

  test("creating a ReadFetcher with formats", async () => {
    const browseFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
        formats: ["html", "plaintext"],
      },
      api,
      httpClient
    );
    expect(browseFetcher).toBeInstanceOf(ReadFetcher);
    expect(browseFetcher.getResource()).toBe("posts");
    expect(browseFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      formats: ["html", "plaintext"],
    });
    expect(browseFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234&formats=html%2Cplaintext"
    );
  });

  test("ReadFetcher with no results ", async () => {
    const pick = { title: true, slug: true, count: true } as const;
    const outputSchema = simplifiedSchema.pick(pick);

    const readFetcher = new ReadFetcher(
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
      api,
      httpClient
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
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234&fields=title%2Cslug%2Ccount&include=count"
    );

    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ message: "Validation error, cannot read author.", type: "ValidationError" }],
      })
    );

    const result = await readFetcher.fetch();
    assert(!result.success);
    expect(result.errors).toStrictEqual([
      { message: "Validation error, cannot read author.", type: "ValidationError" },
    ]);
  });

  test("_fetch failed, errors were caught in the fetch", async () => {
    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
      api,
      httpClient
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
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
      api,
      httpClient
    );
    // @ts-expect-error - _URL is private
    fetcher._URL = undefined;
    await expect(fetcher.fetch()).rejects.toThrowError("URL is undefined");
    // @ts-expect-error - _params is private
    fetcher._params = undefined;
    expect(fetcher.getIncludes()).toEqual([]);
  });
});
describe("ReadFetcherFetcher outputs test suite", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

  const httpClient = new HTTPClient(api);

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
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("new formats, fields, and include", async () => {
    const fetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      { identity: { slug: "this-is-a-slug" } },
      api,
      httpClient
    );
    const res = fetcher
      .formats({ html: true })
      .include({ count: true, "nested.key": true })
      .fields({ html: true, published: true, count: true });
    expect(res.getIncludes()).toStrictEqual(["count", "nested.key"]);
    expect(res.getOutputFields()).toStrictEqual(["html", "published", "count"]);
    expect(res.getFormats()).toStrictEqual(["html"]);
    expect(
      res.getURL()?.toString().replace("https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/", "")
    ).toBe("?key=1234&fields=html%2Cpublished%2Ccount&include=count%2Cnested.key&formats=html");
  });

  test("new formats, fields, and include", async () => {
    const fetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      { identity: { email: "abc@foo.com" } },
      api,
      httpClient
    );
    const res = fetcher
      .formats({ html: true })
      .include({ count: true, "nested.key": true })
      .fields({ html: true, published: true, count: true });
    expect(res.getIncludes()).toStrictEqual(["count", "nested.key"]);
    expect(res.getOutputFields()).toStrictEqual(["html", "published", "count"]);
    expect(res.getFormats()).toStrictEqual(["html"]);
    expect(
      res.getURL()?.toString().replace("https://ghost.org/ghost/api/content/posts/email/abc@foo.com/", "")
    ).toBe("?key=1234&fields=html%2Cpublished%2Ccount&include=count%2Cnested.key&formats=html");
  });

  test("new formats, fields, and include should indicate wrong fields", async () => {
    const fetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      { identity: { slug: "this-is-a-slug" } },
      api,
      httpClient
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
    expect(
      res.getURL()?.toString().replace("https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/", "")
    ).toBe("?key=1234&fields=html%2Cpublished%2Ccount&include=count&formats=html");
  });
});
