import { test, describe, expect, vi, afterEach } from "vitest";
import { BasicFetcher } from "./basic-fetcher";
import type { ContentAPICredentials } from "../schemas";
import { z } from "zod";

describe("BasicFetcher", () => {
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
    const spy = vi.spyOn(fetcher, "_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting Promise<any>
    spy.mockImplementationOnce(() => {
      return {
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
          unknown_key: "should not be here",
        },
      };
    });

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
    const spy = vi.spyOn(fetcher, "_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting Promise<any>
    spy.mockImplementationOnce(() => {
      return {
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
      };
    });

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
});
