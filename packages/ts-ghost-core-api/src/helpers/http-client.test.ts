import createFetchMock from "vitest-fetch-mock";
import { describe, expect, test } from "vitest";

import { HTTPClient } from "./http-client";

const fetchMocker = createFetchMock(vi);
describe("HTTPClient Content API", () => {
  const httpClient = new HTTPClient({
    key: "a",
    version: "v6.0",
    endpoint: "content",
    url: "https://ghost.org",
  });

  test("expect instanciation OK", async () => {
    expect(httpClient).toBeDefined();
    expect(httpClient.jwt).toBeUndefined();
    expect(httpClient.baseURL).toBeDefined();
    expect(httpClient.baseURL?.toString()).toBe("https://ghost.org/ghost/api/content/");
  });
  test("returns correct headers if content api", async () => {
    const headers = await httpClient.genHeaders();
    expect(headers).toEqual({
      "Content-Type": "application/json",
      "Accept-Version": "v6.0",
    });
  });
});

describe("HTTPClient with subpath", () => {
  const httpClient = new HTTPClient({
    key: "a",
    version: "v6.0",
    endpoint: "content",
    url: "https://ghost.org/blog",
  });

  test("expect instanciation OK with subpath", async () => {
    expect(httpClient).toBeDefined();
    expect(httpClient.jwt).toBeUndefined();
    expect(httpClient.baseURL).toBeDefined();
    expect(httpClient.baseURL?.toString()).toBe("https://ghost.org/blog/ghost/api/content/");
  });
});

describe("HTTPClient Admin API", () => {
  const httpClient = new HTTPClient({
    key: "a:b",
    version: "v5.22",
    endpoint: "admin",
    url: "https://ghost.org",
  });

  test("expect instanciation OK", async () => {
    expect(httpClient).toBeDefined();
    expect(httpClient.jwt).toBeUndefined();
    expect(httpClient.baseURL).toBeDefined();
    expect(httpClient.baseURL?.toString()).toBe("https://ghost.org/ghost/api/admin/");
  });
  test("returns a JWT", async () => {
    const jwt = await httpClient.generateJWT("a:b");
    expect(jwt).toMatch(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
  });

  test("returns correct headers if admin api", async () => {
    const headers = await httpClient.genHeaders();
    expect(headers["Content-Type"]).toEqual("application/json");
    expect(headers["Accept-Version"]).toEqual("v5.22");
    expect(headers["Authorization"]).toMatch(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
  });
});

describe("HTTPClient test fetch", () => {
  beforeEach(() => {
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  test("fetch content", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "content",
          bar: "content",
        },
      }),
    );

    const result = await httpClient.fetch({ resource: "posts" });
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/content/posts/?key=abcd", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v5.22",
      },
    });
    expect(result).toEqual({
      posts: {
        foo: "content",
        bar: "content",
      },
    });
  });

  test("fetch content with params", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "content-with-params",
          bar: "content-with-params",
        },
      }),
    );
    const searchParams = new URLSearchParams();
    searchParams.append("page", "2");
    searchParams.append("limit", "3");
    const result = await httpClient.fetch({ resource: "posts", searchParams });
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/content/posts/?page=2&limit=3&key=abcd",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v5.22",
        },
      },
    );
    expect(result).toEqual({
      posts: {
        foo: "content-with-params",
        bar: "content-with-params",
      },
    });
  });

  test("fetch admin", async () => {
    const httpClient = new HTTPClient({
      key: "a:b",
      version: "v5.22",
      endpoint: "admin",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      }),
    );

    const result = await httpClient.fetch({ resource: "posts" });
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/admin/posts/", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v5.22",
        Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
      },
    });
    expect(result).toEqual({
      posts: {
        foo: "foo",
        bar: "eaoizdjoa1321123",
      },
    });
  });

  test("fetch admin with params", async () => {
    const httpClient = new HTTPClient({
      key: "a:b",
      version: "v5.22",
      endpoint: "admin",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      }),
    );
    const searchParams = new URLSearchParams();
    searchParams.append("page", "2");
    searchParams.append("limit", "3");
    const result = await httpClient.fetch({ resource: "posts", searchParams });
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/admin/posts/?page=2&limit=3", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v5.22",
        Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
      },
    });
    expect(result).toEqual({
      posts: {
        foo: "foo",
        bar: "eaoizdjoa1321123",
      },
    });
  });

  test("fetch admin with params and basic ID identity", async () => {
    const httpClient = new HTTPClient({
      key: "a:b",
      version: "v5.22",
      endpoint: "admin",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      }),
    );
    const searchParams = new URLSearchParams();
    searchParams.append("page", "2");
    searchParams.append("limit", "3");
    const result = await httpClient.fetch({ resource: "posts", searchParams, pathnameIdentity: "123" });
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith("https://ghost.org/ghost/api/admin/posts/123/?page=2&limit=3", {
      headers: {
        "Content-Type": "application/json",
        "Accept-Version": "v5.22",
        Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
      },
    });
    expect(result).toEqual({
      posts: {
        foo: "foo",
        bar: "eaoizdjoa1321123",
      },
    });
  });
  test("fetch admin with params and basic slug identity", async () => {
    const httpClient = new HTTPClient({
      key: "a:b",
      version: "v5.22",
      endpoint: "admin",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: {
          foo: "foo",
          bar: "eaoizdjoa1321123",
        },
      }),
    );
    const searchParams = new URLSearchParams();
    searchParams.append("page", "2");
    searchParams.append("limit", "3");
    const result = await httpClient.fetch({
      resource: "posts",
      searchParams,
      pathnameIdentity: "slug/hello",
    });
    expect(fetchMocker).toHaveBeenCalledTimes(1);
    expect(fetchMocker).toHaveBeenCalledWith(
      "https://ghost.org/ghost/api/admin/posts/slug/hello/?page=2&limit=3",
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Version": "v5.22",
          Authorization: expect.stringMatching(/^Ghost [a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/),
        },
      },
    );
    expect(result).toEqual({
      posts: {
        foo: "foo",
        bar: "eaoizdjoa1321123",
      },
    });
  });
});

describe("HTTPClient fetchWithStatus", () => {
  beforeEach(() => {
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    fetchMocker.resetMocks();
    vi.restoreAllMocks();
  });

  test("fetchWithStatus returns data and status on success", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [{ title: "Test Post" }],
      }),
      { status: 200 },
    );

    const result = await httpClient.fetchWithStatus({ resource: "posts" });
    expect(result.status).toBe(200);
    expect(result.data).toEqual({
      posts: [{ title: "Test Post" }],
    });
  });

  test("fetchWithStatus returns status 404 on not found", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "NotFoundError", message: "Resource not found" }],
      }),
      { status: 404 },
    );

    const result = await httpClient.fetchWithStatus({ resource: "posts", pathnameIdentity: "nonexistent" });
    expect(result.status).toBe(404);
    expect(result.data).toEqual({
      errors: [{ type: "NotFoundError", message: "Resource not found" }],
    });
  });

  test("fetchWithStatus returns status 401 on unauthorized", async () => {
    const httpClient = new HTTPClient({
      key: "invalid-key",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "UnauthorizedError", message: "Invalid API key" }],
      }),
      { status: 401 },
    );

    const result = await httpClient.fetchWithStatus({ resource: "posts" });
    expect(result.status).toBe(401);
    expect((result.data as any).errors[0].type).toBe("UnauthorizedError");
  });

  test("fetchWithStatus returns status 500 on server error", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [{ type: "InternalServerError", message: "Server error" }],
      }),
      { status: 500 },
    );

    const result = await httpClient.fetchWithStatus({ resource: "posts" });
    expect(result.status).toBe(500);
    expect((result.data as any).errors[0].type).toBe("InternalServerError");
  });

  test("fetchWithStatus returns status 0 on network error", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.mockRejectOnce(new Error("Network error"));

    const result = await httpClient.fetchWithStatus({ resource: "posts" });
    expect(result.status).toBe(0);
    expect((result.data as any).errors[0].type).toBe("FetchError");
    expect((result.data as any).errors[0].message).toContain("Network error");
  });

  test("fetchWithStatus returns status on JSON parse error", async () => {
    const httpClient = new HTTPClient({
      key: "abcd",
      version: "v5.22",
      endpoint: "content",
      url: "https://ghost.org",
    });
    fetchMocker.doMockOnce("invalid json", { status: 200 });

    const result = await httpClient.fetchWithStatus({ resource: "posts" });
    expect(result.status).toBe(200);
    expect((result.data as any).errors[0].type).toBe("FetchError");
  });
});
