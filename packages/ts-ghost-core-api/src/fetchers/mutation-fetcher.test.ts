import createFetchMock from "vitest-fetch-mock";
import { describe, expect, test } from "vitest";
import { z } from "zod/v3";

import { HTTPClient, type HTTPClientOptions } from "../helpers/http-client";
import { MutationFetcher } from "./mutation-fetcher";

const fetchMocker = createFetchMock(vi);

const fixture = JSON.stringify({
  posts: [
    {
      id: "123123123123123123",
      foo: "foo",
      bar: "bar",
      baz: true,
      count: 1,
    },
  ],
});

describe("MutationFetcher", () => {
  const adminCredentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "aaiuzhduad:baiuciauhviahuv",
    version: "v6.0",
    endpoint: "admin",
  };

  const httpClient = new HTTPClient(adminCredentials);

  const simplifiedSchema = z.object({
    id: z.string(),
    foo: z.string(),
    bar: z.string(),
    baz: z.boolean().optional(),
    count: z.number().optional(),
  });

  beforeEach(() => {
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should return a MutationFetcher instance", async () => {
    const body = {
      foo: "bar",
    };
    const mutation = new MutationFetcher(
      "posts",
      {
        output: simplifiedSchema,
        paramsShape: z.object({
          option_1: z.boolean(),
        }),
      },
      {
        option_1: true,
      },
      {
        method: "POST",
        body,
      },
      httpClient,
    );
    expect(mutation).toBeInstanceOf(MutationFetcher);
    expect(mutation.getResource()).toBe("posts");
    expect(mutation.getParams()).toStrictEqual({
      option_1: true,
    });
    fetchMocker.doMockOnce(fixture);
    await mutation.submit();

    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/admin/posts/?option_1=true", {
      body: JSON.stringify({ posts: [body] }),
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v6.0",
        Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
      },
      method: "POST",
    });
  });

  test("submit error returns status code 400", async () => {
    const body = { foo: "bar" };
    const mutation = new MutationFetcher(
      "posts",
      {
        output: simplifiedSchema,
        paramsShape: z.object({}),
      },
      {},
      {
        method: "POST",
        body,
      },
      httpClient,
    );

    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "ValidationError", message: "Invalid data", context: "foo is required" }],
      }),
      { status: 400 },
    );

    const result = await mutation.submit();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(result.errors[0].type).toBe("ValidationError");
      expect(result.errors[0].context).toBe("foo is required");
    }
  });

  test("submit error returns status code 404", async () => {
    const body = { foo: "bar" };
    const mutation = new MutationFetcher(
      "posts",
      {
        output: simplifiedSchema,
        paramsShape: z.object({}),
      },
      { id: "nonexistent-id" },
      {
        method: "PUT",
        body,
      },
      httpClient,
    );

    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "NotFoundError", message: "Resource not found" }],
      }),
      { status: 404 },
    );

    const result = await mutation.submit();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(404);
      expect(result.errors[0].type).toBe("NotFoundError");
    }
  });

  test("submit error returns status code 0 on network error", async () => {
    const body = { foo: "bar" };
    const mutation = new MutationFetcher(
      "posts",
      {
        output: simplifiedSchema,
        paramsShape: z.object({}),
      },
      {},
      {
        method: "POST",
        body,
      },
      httpClient,
    );

    fetchMocker.mockRejectOnce(new Error("Network error"));

    const result = await mutation.submit();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(0);
      expect(result.errors[0].type).toBe("FetchError");
    }
  });
});
