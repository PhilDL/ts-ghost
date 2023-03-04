import createFetchMock, { FetchMock } from "vitest-fetch-mock";
import fetch from "cross-fetch";
import { test, describe, expect, vi, afterEach } from "vitest";
import { BasicFetcher } from "./basic-fetcher";
import type { ContentAPICredentials } from "../schemas";
import { z } from "zod";

describe("BasicFetcher", () => {
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
  test("instantiation", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org" as const,
      key: "1234",
      version: "v5.0",
      endpoint: "posts",
    } as const;
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    expect(fetcher.getEndpoint()).toBe("posts");
    expect(fetcher.getOutputFields()).toEqual(["foo", "bar"]);
    expect(fetcher.getURL()?.searchParams.toString()).toBe(`key=${api.key}`);
    expect(fetcher.getURL()?.pathname).toBe(`/ghost/api/content/${api.endpoint}/`);
    expect(fetcher.getURL()?.toString()).toBe(`${api.url}/ghost/api/content/${api.endpoint}/?key=${api.key}`);
  });

  test("fetch", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org" as const,
      key: "1234",
      version: "v5.0",
      endpoint: "posts",
    } as const;
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    (fetch as FetchMock).once(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      })
    );
    const result = await fetcher.fetch();
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toStrictEqual({
        foo: "foo",
        bar: "eaoizdjoa1321123",
      });
    }
  });

  test("fetch with errors", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org" as const,
      key: "1234",
      version: "v5.0",
      endpoint: "posts",
    } as const;
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    (fetch as FetchMock).doMockOnce(
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
    expect(result.status).toBe("error");
    if (result.status === "error") {
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
    }
  });

  test("expect BasicFetcher _fetch to throw if _URL is not defined", async () => {
    const api: ContentAPICredentials = {
      url: "https://ghost.org" as const,
      key: "1234",
      version: "v5.0",
      endpoint: "posts",
    } as const;
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
      url: "https://ghost.org" as const,
      key: "1234",
      version: "v5.0",
      endpoint: "posts",
    } as const;
    const outputSchema = z.object({
      foo: z.string(),
      bar: z.string(),
    });
    const fetcher = new BasicFetcher({ output: outputSchema }, api);
    (fetch as FetchMock).mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await fetcher.fetch();
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
});
