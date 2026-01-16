import createFetchMock from "vitest-fetch-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";
import { z } from "zod/v3";

import { HTTPClient, HTTPClientOptions } from "../helpers/http-client";
import { BasicFetcher } from "./basic-fetcher";

const fetchMocker = createFetchMock(vi);

describe("BasicFetcher", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v6.0",
    endpoint: "content",
  };
  let httpClient: HTTPClient;
  const outputSchema = z.object({
    foo: z.string(),
    bar: z.string(),
  });

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  test("instantiation and fetch", async () => {
    const fetcher = new BasicFetcher("posts", { output: outputSchema }, httpClient);
    expect(fetcher.getResource()).toBe("posts");
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      }),
    );
    const result = await fetcher.fetch();

    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v6.0",
      },
    });

    assert(result.success === true);
    expect(result.data).toStrictEqual({
      foo: "foo",
      bar: "eaoizdjoa1321123",
    });
  });

  test("fetch with errors", async () => {
    const fetcher = new BasicFetcher("posts", { output: outputSchema }, httpClient);
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
      }),
      { status: 400 },
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
    expect(result.status).toBe(400);
  });

  test("expect BasicFetcher _fetch to throw if _URL is not defined", async () => {
    const fetcher = new BasicFetcher("posts", { output: outputSchema }, httpClient);
    // @ts-expect-error - _URL is private
    fetcher.httpClient._baseURL = undefined;
    await expect(fetcher.fetch()).rejects.toThrowError("URL is undefined");
  });

  test("fetch failed, errors were caught", async () => {
    const fetcher = new BasicFetcher("posts", { output: outputSchema }, httpClient);
    fetchMocker.mockRejectOnce(() => Promise.reject("Fake Fetch Error"));

    const result = await fetcher.fetch();

    assert(result.success === false);
    expect(result.errors).toStrictEqual([
      {
        type: "FetchError",
        message: "Fake Fetch Error",
      },
    ]);
    expect(result.status).toBe(0);
  });

  test("fetch error returns status code 404", async () => {
    const fetcher = new BasicFetcher("posts", { output: outputSchema }, httpClient);
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "NotFoundError", message: "Resource not found" }],
      }),
      { status: 404 },
    );

    const result = await fetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(404);
      expect(result.errors[0].type).toBe("NotFoundError");
    }
  });

  test("fetch error returns status code 500", async () => {
    const fetcher = new BasicFetcher("posts", { output: outputSchema }, httpClient);
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "InternalServerError", message: "Server error" }],
      }),
      { status: 500 },
    );

    const result = await fetcher.fetch();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(500);
      expect(result.errors[0].type).toBe("InternalServerError");
    }
  });
});
