import fetch from "cross-fetch";
import { describe, expect, test } from "vitest";
import createFetchMock, { type FetchMock } from "vitest-fetch-mock";
import { z } from "zod";

import { APIComposer } from "./api-composer";
import { BrowseFetcher, ReadFetcher } from "./fetchers";
import type { BrowseParams } from "./helpers/browse-params";
import type { ContentAPICredentials } from "./schemas/shared";

describe("APIComposer Read / Browse", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

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

  const composer = new APIComposer(
    { schema: simplifiedSchema, identitySchema: identitySchema, include: simplifiedIncludeSchema },
    api
  );

  test("instantiation", () => {
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
    test("include params should only accept key from the include schema", () => {
      expect(composer.browse()).toBeInstanceOf(BrowseFetcher);
      expect(composer.read({ id: "abc" })).toBeInstanceOf(ReadFetcher);
    });
  });
});

describe("APIComposer add / edit", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org",
    key: "1234",
    version: "v5.0",
    resource: "posts",
    endpoint: "content",
  };

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

  const composer = new APIComposer(
    {
      schema: simplifiedSchema,
      identitySchema: identitySchema,
      include: simplifiedIncludeSchema,
      createSchema,
      createOptionsSchema: z.object({
        option_1: z.boolean(),
      }),
    },
    api
  );

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
    (fetch as FetchMock).doMockOnce(
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
    expect(fetch).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
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
    expect(fetch).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234", {
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
    assert(result.status === "success");
    const post = result.data;
    expect(post).toStrictEqual({
      id: "abc",
      foo: "abc@test.com",
      bar: "foobaz",
    });
  });

  test("post add with options", async () => {
    const mockData = {
      id: "abc",
      foo: "new foo",
      bar: "foobaz",
    };
    (fetch as FetchMock).doMockOnce(
      JSON.stringify({
        posts: [mockData],
      })
    );
    const result = await composer.add({ foo: "new foo" }, { option_1: true });

    expect(fetch).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234&option_1=true", {
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
    assert(result.status === "success");
    expect(result.data).toStrictEqual(mockData);
  });

  test("post fail", async () => {
    (fetch as FetchMock).doMockOnce(
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

    expect(fetch).toBeCalledWith("https://ghost.org/ghost/api/content/posts/?key=1234&option_1=true", {
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
    assert(result.status === "error");
    expect(result.errors).toStrictEqual([
      {
        message: "Validation error, cannot save member.",
        context: "Member already exists. Attempting to add member with existing email address",
        type: "ValidationError",
      },
    ]);
  });

  test("put edit", async () => {
    (fetch as FetchMock).doMockOnce(
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
    expect(fetch).toBeCalledWith("https://ghost.org/ghost/api/content/posts/abc/?key=1234", {
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
    assert(result.status === "success");
    const post = result.data;
    expect(post).toStrictEqual({
      id: "abc",
      foo: "new foo",
      bar: "foobaz",
    });
  });

  test("put edit fail", async () => {
    (fetch as FetchMock).doMockOnce(
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

    expect(fetch).toBeCalledWith("https://ghost.org/ghost/api/content/posts/abc/?key=1234", {
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
    assert(result.status === "error");
    expect(result.errors).toStrictEqual([
      {
        message: "Resource not found error, cannot edit member.",
        context: "Could not find Member 6438cd365a8fdb00013a8783",
        type: "NotFoundError",
      },
    ]);
  });
});
