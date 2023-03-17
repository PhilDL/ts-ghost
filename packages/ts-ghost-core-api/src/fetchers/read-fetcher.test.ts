import createFetchMock, { type FetchMock } from "vitest-fetch-mock";
import fetch from "cross-fetch";
import type { ContentAPICredentials, AdminAPICredentials } from "../schemas/shared";
import { describe, test, expect, assert } from "vitest";
import { ReadFetcher } from "./read-fetcher";
import { z } from "zod";

describe("ReadFetcher", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

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
    vi.mock("cross-fetch", async () => {
      return {
        default: createFetchMock(vi),
      };
    });
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
      api
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
      adminApi
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
      api
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
          api
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
      api
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

    (fetch as FetchMock).doMockOnce(
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
    assert(result.status === "success");
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
      api
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
      api
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

    (fetch as FetchMock).doMockOnce(
      JSON.stringify({
        errors: [{ message: "Validation error, cannot read author.", type: "ValidationError" }],
      })
    );

    const result = await readFetcher.fetch();
    assert(result.status === "error");
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
      api
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    (fetch as FetchMock).mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await readFetcher.fetch();
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
