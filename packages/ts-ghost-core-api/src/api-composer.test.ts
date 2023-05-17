import createFetchMock from "vitest-fetch-mock";
import { describe, expect, test } from "vitest";
import { z } from "zod";

import { APIComposer } from "./api-composer";
import { BrowseFetcher, ReadFetcher } from "./fetchers";
import type { BrowseParams } from "./helpers/browse-params";
import { HTTPClient, HTTPClientOptions } from "./helpers/http-client";

const fetchMocker = createFetchMock(vi);

describe("APIComposer Read / Browse", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    endpoint: "content",
  };
  const adminCredentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "aaiuzhduad:baiuciauhviahuv",
    version: "v5.0",
    endpoint: "admin",
  };
  let httpClient: HTTPClient;
  let adminHttpClient: HTTPClient;

  const simplifiedSchema = z.object({
    foo: z.string(),
    bar: z.string(),
    baz: z.boolean().optional(),
    count: z.number().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
    "count.posts": z.literal(true).optional(),
  });

  const identitySchema = z.union([
    z.object({ id: z.string() }),
    z.object({ slug: z.string() }),
    z.object({ email: z.string() }),
  ]);

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    adminHttpClient = new HTTPClient(adminCredentials);
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("instantiation", () => {
    const composer = new APIComposer(
      "posts",
      { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
      httpClient
    );
    expect(composer).toBeDefined();
    expect(composer.browse()).toBeInstanceOf(BrowseFetcher);
    // @ts-expect-error - missing Identity fields
    expect(() => composer.read()).toThrow();
    // @ts-expect-error - missing Identity fields
    expect(() => composer.read({})).toThrow();
    expect(composer.read({ id: "abc" })).toBeInstanceOf(ReadFetcher);
    expect(composer.read({ slug: "this-is-a-slug" })).toBeInstanceOf(ReadFetcher);
    expect(composer.read({ email: "abc@test.com" })).toBeInstanceOf(ReadFetcher);
  });

  describe("pagination inputs", () => {
    const composer = new APIComposer(
      "posts",
      { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
      httpClient
    );
    test("pagination params", () => {
      expect(
        composer.browse({
          limit: 10,
          page: 2,
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("pagination params shouldn't accept limit over 15 or under 0", () => {
      expect(() =>
        composer.browse({
          limit: 20,
        })
      ).toThrow();
      expect(() =>
        composer.browse({
          limit: -1,
        })
      ).toThrow();
    });

    test("pagination params shouldn't accept page under 1", () => {
      expect(() =>
        composer.browse({
          page: 0,
        })
      ).toThrow();
    });
  });

  describe("order input", () => {
    const composer = new APIComposer(
      "posts",
      { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
      httpClient
    );
    test("order params should accept a string with correct fields", () => {
      expect(
        composer.browse({
          order: "foo desc",
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("order params should accept a string with IncludeSchema fields", () => {
      expect(
        composer.browse({
          order: "count.posts desc",
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("order params should not accept incorrect fields", () => {
      expect(() =>
        composer.browse({
          // @ts-expect-error - invalid field
          order: "foobarbaz desc",
        })
      ).toThrow();
    });

    test("order params should be possible to be declared as const", () => {
      const order = "foo DESC";
      const input = { order } satisfies BrowseParams<
        { order: typeof order },
        z.infer<typeof simplifiedSchema>
      >;
      expect(composer.browse(input)).toBeInstanceOf(BrowseFetcher);
    });

    test("order params should be possible to be declared as const and be type-safe", () => {
      const order = "foobar DESC";
      // @ts-expect-error - invalid field
      const input = { order } satisfies BrowseParams<
        { order: typeof order },
        z.infer<typeof simplifiedSchema>
      >;
      expect(() =>
        composer.browse(
          // @ts-expect-error - invalid field
          input
        )
      ).toThrow();
    });

    test("order params should be possible to be declared without type-safety but still throw", () => {
      const order = "foobar DESC";
      const input = { order } as BrowseParams<{ order: string }, z.infer<typeof simplifiedSchema>>;
      expect(() => composer.browse(input)).toThrow();
    });
  });

  describe("filter input", () => {
    const composer = new APIComposer(
      "posts",
      { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
      httpClient
    );
    test("filter params should accept a string with correct fields", () => {
      expect(
        composer.browse({
          filter: "foo:test",
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("filter params should accept a string with with IncludeSchema fields", () => {
      expect(
        composer.browse({
          filter: "count.posts:test",
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("filter params should not accept incorrect fields", () => {
      expect(() =>
        composer.browse({
          // @ts-expect-error - invalid field
          filter: "fo:test",
        })
      ).toThrow();
    });

    test("filter params should be possible to be declared as const", () => {
      const filter = "foo:bar";
      const input = { filter } satisfies BrowseParams<
        { filter: typeof filter },
        z.infer<typeof simplifiedSchema>
      >;
      expect(composer.browse(input)).toBeInstanceOf(BrowseFetcher);
    });

    test("filter params should be possible to be declared as const and be type-safe", () => {
      const filter = "foobar:test";
      // @ts-expect-error - invalid field
      const input = { filter } satisfies BrowseParams<
        { filter: typeof filter },
        z.infer<typeof simplifiedSchema>
      >;
      expect(() =>
        composer.browse(
          // @ts-expect-error - invalid field
          input
        )
      ).toThrow();
    });

    test("filter params should be possible to be declared without type-safety but still throw", () => {
      const filter = "foobar:test";
      const input = { filter } as BrowseParams<{ filter: string }, z.infer<typeof simplifiedSchema>>;
      expect(() => composer.browse(input)).toThrow();
    });
  });

  describe("identity read fields input", () => {
    const composer = new APIComposer(
      "posts",
      { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
      httpClient
    );
    test("identity read fields params should only accept key from the identity read schema", () => {
      expect(
        composer.read({
          id: "abc",
        })
      ).toBeInstanceOf(ReadFetcher);

      expect(
        composer.read({
          slug: "foo-bar",
        })
      ).toBeInstanceOf(ReadFetcher);
    });

    test("identity read fields params should only accept key from the identity read schema", () => {
      expect(() =>
        composer.read({
          // @ts-expect-error - invalid field
          foo: "foobarbaz",
        })
      ).toThrow();
    });
  });

  describe("include output", () => {
    const composer = new APIComposer(
      "posts",
      { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
      httpClient
    );
    test("include params should only accept key from the include schema", () => {
      expect(composer.browse()).toBeInstanceOf(BrowseFetcher);
      expect(composer.read({ id: "abc" })).toBeInstanceOf(ReadFetcher);
    });
  });
});

describe("APIComposer add / edit", () => {
  const credentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    endpoint: "content",
  };
  const adminCredentials: HTTPClientOptions = {
    url: "https://ghost.org",
    key: "aaiuzhduad:baiuciauhviahuv",
    version: "v5.0",
    endpoint: "admin",
  };
  let httpClient: HTTPClient;
  let adminHttpClient: HTTPClient;

  const simplifiedSchema = z.object({
    id: z.string(),
    foo: z.string(),
    bar: z.string(),
    baz: z.boolean().optional(),
    count: z.number().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
    "count.posts": z.literal(true).optional(),
  });

  const identitySchema = z.union([
    z.object({ id: z.string() }),
    z.object({ slug: z.string() }),
    z.object({ email: z.string() }),
  ]);

  const createSchema = z.object({
    foo: z.string(),
    bar: z.string().nullish(),
    baz: z.boolean().nullish(),
  });

  beforeEach(() => {
    httpClient = new HTTPClient(credentials);
    adminHttpClient = new HTTPClient(adminCredentials);
    fetchMocker.enableMocks();
    fetchMocker.enableMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("instantiation", async () => {
    const composer = new APIComposer(
      "posts",
      {
        schema: simplifiedSchema,
        identitySchema: identitySchema,
        include: simplifiedIncludeSchema,
        createSchema,
        createOptionsSchema: z.object({
          option_1: z.boolean(),
        }),
        // updateSchema: z.object({
        //   foobar: z.string(),
        // }),
      },
      httpClient
    );
    expect(composer).toBeDefined();
    expect(composer.browse()).toBeInstanceOf(BrowseFetcher);
    // @ts-expect-error - missing Identity fields
    expect(() => composer.read()).toThrow();
    // @ts-expect-error - missing Identity fields
    expect(() => composer.read({})).toThrow();
    expect(composer.read({ id: "abc" })).toBeInstanceOf(ReadFetcher);
    expect(composer.read({ slug: "this-is-a-slug" })).toBeInstanceOf(ReadFetcher);
    expect(composer.read({ email: "abc@test.com" })).toBeInstanceOf(ReadFetcher);
    // @ts-expect-error - required field missing
    expect(() => composer.add({ foobar: "abc@test.com" })).rejects.toThrow();
    // @ts-expect-error - unknown option
    expect(() => composer.add({ foo: "bar" }, { unknown: "option unknown" })).rejects.toThrow();
    // @ts-expect-error - edit only unknown fields
    expect(() => composer.edit("abc", { foobar: "abc@test.com" })).rejects.toThrow();
    // @ts-expect-error - edit without data
    expect(() => composer.edit("abc")).rejects.toThrow();
    expect(() => composer.edit("", { foo: "test" })).rejects.toThrow();
  });

  test("post add", async () => {
    const composer = new APIComposer(
      "posts",
      {
        schema: simplifiedSchema,
        identitySchema: identitySchema,
        include: simplifiedIncludeSchema,
        createSchema,
        createOptionsSchema: z.object({
          option_1: z.boolean(),
        }),
        // updateSchema: z.object({
        //   foobar: z.string(),
        // }),
      },
      httpClient
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            id: "abc",
            foo: "abc@test.com",
            bar: "foobaz",
          },
        ],
      })
    );
    const result = await composer.add({ foo: "abc@test.com" });
    expect(fetchMocker).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
      method: "POST",
      headers: {
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          {
            foo: "abc@test.com",
          },
        ],
      }),
    });
    expect(fetchMocker).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
      method: "POST",
      headers: {
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          {
            foo: "abc@test.com",
          },
        ],
      }),
    });
    assert(result.success);
    const post = result.data;
    expect(post).toStrictEqual({
      id: "abc",
      foo: "abc@test.com",
      bar: "foobaz",
    });
  });

  test("post add with options", async () => {
    const composer = new APIComposer(
      "posts",
      {
        schema: simplifiedSchema,
        identitySchema: identitySchema,
        include: simplifiedIncludeSchema,
        createSchema,
        createOptionsSchema: z.object({
          option_1: z.boolean(),
        }),
        // updateSchema: z.object({
        //   foobar: z.string(),
        // }),
      },
      httpClient
    );
    const mockData = {
      id: "abc",
      foo: "new foo",
      bar: "foobaz",
    };
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [mockData],
      })
    );
    const result = await composer.add({ foo: "new foo" }, { option_1: true });

    expect(fetchMocker).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?option_1=true&key=1234", {
      method: "POST",
      headers: {
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          {
            foo: "new foo",
          },
        ],
      }),
    });
    assert(result.success);
    expect(result.data).toStrictEqual(mockData);
  });

  test("post fail", async () => {
    const composer = new APIComposer(
      "posts",
      {
        schema: simplifiedSchema,
        identitySchema: identitySchema,
        include: simplifiedIncludeSchema,
        createSchema,
        createOptionsSchema: z.object({
          option_1: z.boolean(),
        }),
        // updateSchema: z.object({
        //   foobar: z.string(),
        // }),
      },
      httpClient
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [
          {
            message: "Validation error, cannot save member.",
            context: "Member already exists. Attempting to add member with existing email address",
            type: "ValidationError",
            details: null,
            property: "email",
            help: null,
            code: null,
            id: "61187c40-daaf-11ed-a607-7145a013f162",
            ghostErrorCode: null,
          },
        ],
      })
    );
    const result = await composer.add({ foo: "existing" }, { option_1: true });

    expect(fetchMocker).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?option_1=true&key=1234", {
      method: "POST",
      headers: {
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          {
            foo: "existing",
          },
        ],
      }),
    });
    assert(!result.success);
    expect(result.errors).toStrictEqual([
      {
        message: "Validation error, cannot save member.",
        context: "Member already exists. Attempting to add member with existing email address",
        type: "ValidationError",
      },
    ]);
  });

  test("put edit", async () => {
    const composer = new APIComposer(
      "posts",
      {
        schema: simplifiedSchema,
        identitySchema: identitySchema,
        include: simplifiedIncludeSchema,
        createSchema,
        createOptionsSchema: z.object({
          option_1: z.boolean(),
        }),
        // updateSchema: z.object({
        //   foobar: z.string(),
        // }),
      },
      httpClient
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        posts: [
          {
            id: "abc",
            foo: "new foo",
            bar: "foobaz",
          },
        ],
      })
    );
    const result = await composer.edit("abc", { foo: "new foo" });
    expect(fetchMocker).toBeCalledWith("https://ghost.org/ghost/api/content/posts/abc/?key=1234", {
      method: "PUT",
      headers: {
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          {
            foo: "new foo",
          },
        ],
      }),
    });
    assert(result.success);
    const post = result.data;
    expect(post).toStrictEqual({
      id: "abc",
      foo: "new foo",
      bar: "foobaz",
    });
  });

  test("put edit fail", async () => {
    const composer = new APIComposer(
      "posts",
      {
        schema: simplifiedSchema,
        identitySchema: identitySchema,
        include: simplifiedIncludeSchema,
        createSchema,
        createOptionsSchema: z.object({
          option_1: z.boolean(),
        }),
        // updateSchema: z.object({
        //   foobar: z.string(),
        // }),
      },
      httpClient
    );
    fetchMocker.doMockOnce(
      JSON.stringify({
        errors: [
          {
            message: "Resource not found error, cannot edit member.",
            context: "Could not find Member 6438cd365a8fdb00013a8783",
            type: "NotFoundError",
            details: null,
            property: null,
            help: null,
            code: null,
            id: "b29e9fc0-dab1-11ed-a607-7145a013f162",
            ghostErrorCode: null,
          },
        ],
      })
    );

    const result = await composer.edit("abc", { foo: "new foo" });

    expect(fetchMocker).toBeCalledWith("https://ghost.org/ghost/api/content/posts/abc/?key=1234", {
      method: "PUT",
      headers: {
        "Accept-Version": "v5.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        posts: [
          {
            foo: "new foo",
          },
        ],
      }),
    });
    assert(!result.success);
    expect(result.errors).toStrictEqual([
      {
        message: "Resource not found error, cannot edit member.",
        context: "Could not find Member 6438cd365a8fdb00013a8783",
        type: "NotFoundError",
      },
    ]);
  });
});
