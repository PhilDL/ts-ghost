import { BrowseFetcher, ReadFetcher } from "../fetchers";
import type { ContentAPICredentials } from "../schemas";
import type { BrowseParams } from "./browse-params";
import { QueryBuilder } from "./query-builder";
import { test, expect, describe } from "vitest";
import { z } from "zod";

describe("QueryBuilder", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org" as const,
    key: "1234",
    version: "v5.0",
    endpoint: "posts",
  } as const;

  const simplifiedSchema = z.object({
    foo: z.string(),
    bar: z.string(),
    baz: z.boolean().optional(),
    count: z.number().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
  });

  const qb = new QueryBuilder(
    { schema: simplifiedSchema, output: simplifiedSchema, include: simplifiedIncludeSchema },
    api
  );

  test("instantiation", () => {
    expect(qb).toBeDefined();
    expect(qb.browse()).toBeInstanceOf(BrowseFetcher);
    // @ts-expect-error - missing Identity fields
    expect(() => qb.read()).toThrow();
    expect(qb.read({ input: { id: "abc" } })).toBeInstanceOf(ReadFetcher);
  });

  describe("pagination inputs", () => {
    test("pagination params", () => {
      expect(
        qb.browse({
          input: {
            limit: 10,
            page: 2,
          },
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("pagination params shouldn't accept limit over 15 or under 0", () => {
      expect(() =>
        qb.browse({
          input: {
            limit: 20,
          },
        })
      ).toThrow();
      expect(() =>
        qb.browse({
          input: {
            limit: -1,
          },
        })
      ).toThrow();
    });

    test("pagination params shouldn't accept page under 1", () => {
      expect(() =>
        qb.browse({
          input: {
            page: 0,
          },
        })
      ).toThrow();
    });
  });

  describe("order input", () => {
    test("order params should accept a string with correct fields", () => {
      expect(
        qb.browse({
          input: {
            order: "foo desc",
          },
        } as const)
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("order params should not accept incorrect fields", () => {
      expect(() =>
        qb.browse({
          input: {
            // @ts-expect-error - invalid field
            order: "foobarbaz desc" as const,
          },
        })
      ).toThrow();
    });

    test("order params should be possible to be declared as const", () => {
      const order = "foo DESC";
      const input = { order } satisfies BrowseParams<{ order: typeof order }, z.infer<typeof simplifiedSchema>>;
      expect(
        qb.browse({
          input: input,
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("order params should be possible to be declared as const and be type-safe", () => {
      const order = "foobar DESC";
      // @ts-expect-error - invalid field
      const input = { order } satisfies BrowseParams<{ order: typeof order }, z.infer<typeof simplifiedSchema>>;
      expect(() =>
        qb.browse({
          // @ts-expect-error - invalid field
          input: input,
        })
      ).toThrow();
    });

    test("order params should be possible to be declared without type-safety but still throw", () => {
      const order = "foobar DESC";
      const input = { order } as BrowseParams<{ order: string }, z.infer<typeof simplifiedSchema>>;
      expect(() =>
        qb.browse({
          input: input,
        })
      ).toThrow();
    });
  });

  describe("filter input", () => {
    test("filter params should accept a string with correct fields", () => {
      expect(
        qb.browse({
          input: {
            filter: "foo:test",
          },
        } as const)
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("filter params should not accept incorrect fields", () => {
      expect(() =>
        qb.browse({
          input: {
            // @ts-expect-error - invalid field
            filter: "fo:test",
          },
        })
      ).toThrow();
    });

    test("filter params should be possible to be declared as const", () => {
      const filter = "foo:bar";
      const input = { filter } satisfies BrowseParams<{ filter: typeof filter }, z.infer<typeof simplifiedSchema>>;
      expect(
        qb.browse({
          input: input,
        })
      ).toBeInstanceOf(BrowseFetcher);
    });

    test("filter params should be possible to be declared as const and be type-safe", () => {
      const filter = "foobar:test";
      // @ts-expect-error - invalid field
      const input = { filter } satisfies BrowseParams<{ filter: typeof filter }, z.infer<typeof simplifiedSchema>>;
      expect(() =>
        qb.browse({
          // @ts-expect-error - invalid field
          input: input,
        })
      ).toThrow();
    });

    test("filter params should be possible to be declared without type-safety but still throw", () => {
      const filter = "foobar:test";
      const input = { filter } as BrowseParams<{ filter: string }, z.infer<typeof simplifiedSchema>>;
      expect(() =>
        qb.browse({
          input: input,
        })
      ).toThrow();
    });
  });

  describe("identity read fields input", () => {
    test("identity read fields params should only accept key from the identity read schema", () => {
      expect(
        qb.read({
          input: {
            id: "abc",
          },
        } as const)
      ).toBeInstanceOf(ReadFetcher);

      expect(
        qb.read({
          input: {
            slug: "foo-bar",
          },
        } as const)
      ).toBeInstanceOf(ReadFetcher);
    });

    test("identity read fields params should only accept key from the identity read schema", () => {
      expect(() =>
        qb.read({
          input: {
            // @ts-expect-error - invalid field
            foo: "foobarbaz",
          },
        } as const)
      ).toThrow();
    });
  });

  describe("include output", () => {
    test("include params should only accept key from the include schema", () => {
      expect(
        qb.browse({
          output: {
            include: {
              count: true,
            },
          },
        } as const)
      ).toBeInstanceOf(BrowseFetcher);
      expect(
        qb.read({
          input: { id: "abc" },
          output: {
            include: {
              count: true,
            },
          },
        } as const)
      ).toBeInstanceOf(ReadFetcher);
    });

    test("include params should only accept key from the include schema", () => {
      expect(
        qb
          .browse({
            output: {
              include: {
                // @ts-expect-error - invalid field
                foobarbaz: true,
              },
            },
          } as const)
          .getIncludes()
      ).toStrictEqual([]);
      expect(
        qb
          .read({
            input: {
              id: "abc",
            },
            output: {
              include: {
                // @ts-expect-error - invalid field
                foobarbaz: true,
              },
            },
          } as const)
          .getIncludes()
      ).toStrictEqual([]);
    });
  });

  describe("fields output", () => {
    test("fields params should only accept key from the fields schema", () => {
      expect(
        qb
          .browse({
            output: {
              fields: {
                foo: true,
              },
            },
          } as const)
          .getOutputFields()
      ).toStrictEqual(["foo"]);

      expect(
        qb
          .read({
            input: {
              id: "abc",
            },
            output: {
              fields: {
                foo: true,
              },
            },
          } as const)
          .getOutputFields()
      ).toStrictEqual(["foo"]);
    });

    test("fields params should only accept key from the fields schema", () => {
      expect(
        qb
          .browse({
            output: {
              fields: {
                // @ts-expect-error - invalid field
                foobarbaz: true,
              },
            },
          } as const)
          .getOutputFields()
      ).toStrictEqual([]);

      expect(
        qb
          .read({
            input: { id: "abc" },
            output: {
              fields: {
                // @ts-expect-error - invalid field
                foobarbaz: true,
              },
            },
          } as const)
          .getOutputFields()
      ).toStrictEqual([]);
    });

    test("fields should be okay with separate declaration", () => {
      const outputFields = {
        foo: true,
      } satisfies { [k in keyof z.infer<typeof simplifiedSchema>]?: true | undefined };
      expect(
        qb
          .browse({
            output: {
              fields: outputFields,
            },
          } as const)
          .getOutputFields()
      ).toStrictEqual(["foo"]);
    });

    test("fields should be parsed even with type-safety overriden with as", () => {
      const fields = ["slug", "title", "foo"] as const;
      const unknownOriginFields = fields.reduce((acc, k) => {
        acc[k as keyof z.infer<typeof simplifiedSchema>] = true;
        return acc;
      }, {} as { [k in keyof z.infer<typeof simplifiedSchema>]?: true | undefined });
      expect(
        qb
          .browse({
            output: {
              fields: unknownOriginFields,
            },
          } as const)
          .getOutputFields()
      ).toStrictEqual(["foo"]);
    });
  });
});
