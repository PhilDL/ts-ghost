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
});
