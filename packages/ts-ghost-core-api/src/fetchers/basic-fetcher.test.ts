import createFetchMock from "vitest-fetch-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import type { ContentAPICredentials } from "../schemas/shared";
import { BasicFetcher } from "./basic-fetcher";

const fetchMocker = createFetchMock(vi);

describe("BasicFetcher", () => {
  beforeEach(() => {
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("instantiation", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org",
      key: "1234",
      version: "v5.0",
      resource: "posts",
      endpoint: "content",
    };
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    expect(fetcher.getResource()).toBe("posts");
    expect(fetcher.getURL()?.searchParams.toString()).toBe(`key=${api.key}`);
    expect(fetcher.getURL()?.pathname).toBe(`/ghost/api/content/${api.resource}/`);
    expect(fetcher.getURL()?.toString()).toBe(
      `${api.url}/ghost/api/content/${api.resource}/?key=${api.key}`
    );
  });

  test("fetch", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org",
      key: "1234",
      version: "v5.0",
      resource: "posts",
      endpoint: "content",
    };
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      })
    );
    const result = await fetcher.fetch();
    assert(result.success === true);
    expect(result.data).toStrictEqual({
      foo: "foo",
      bar: "eaoizdjoa1321123",
    });
  });

  test("fetch with errors", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org",
      key: "1234",
      version: "v5.0",
      resource: "posts",
      endpoint: "content",
    };
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [
          {
            type: "foo error",
            message: "error message",
          },
          {
            type: "bar error",
            message: "error message",
          },
        ],
      })
    );

    const result = await fetcher.fetch();
    assert(result.success === false);
    expect(result.errors).toStrictEqual([
      {
        type: "foo error",
        message: "error message",
      },
      {
        type: "bar error",
        message: "error message",
      },
    ]);
  });

  test("expect BasicFetcher _fetch to throw if _URL is not defined", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org",
      key: "1234",
      version: "v5.0",
      resource: "posts",
      endpoint: "content",
    };
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    // @ts-expect-error - _URL is private
    fetcher._URL = undefined;
    await expect(fetcher.fetch()).rejects.toThrowError("URL is undefined");
  });

  test("fetch failed, errors were caught", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org",
      key: "1234",
      version: "v5.0",
      resource: "posts",
      endpoint: "content",
    };
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    fetchMocker.mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await fetcher.fetch();

    assert(result.success === false);
    expect(result.errors).toStrictEqual([
      {
        type: "FetchError",
        message: "Fake Fetch Error",
      },
    ]);
  });
});
