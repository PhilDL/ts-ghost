import { describe, expect, test } from "vitest";
import { z } from "zod/v3";

import { parseBrowseParams } from "./browse-params";

describe("parseBrowseParams", () => {
  const simplifiedSchema = z.object({
    foo: z.string(),
    bar: z.string(),
    baz: z.boolean().optional(),
    count: z.number().optional(),
    email: z.string().email().optional(),
  });

  test("should accept valid params", () => {
    const result = parseBrowseParams(
      {
        limit: 15,
        page: 1,
        order: "foo ASC",
        filter: "foo:bar,bar:baz",
      },
      simplifiedSchema,
    );
    expect(result).toStrictEqual({
      limit: 15,
      page: 1,
      order: "foo ASC",
      filter: "foo:bar,bar:baz",
    });
  });

  test("should throw if page is less than 1", () => {
    expect(() =>
      parseBrowseParams(
        {
          limit: 15,
          page: 0,
          order: "foo ASC",
          filter: "foo:bar,bar:baz",
        },
        simplifiedSchema,
      ),
    ).toThrow();
  });

  test("should throw if limit is less than 1 or greater than 15", () => {
    expect(() =>
      parseBrowseParams(
        {
          limit: 16,
          page: 1,
          order: "foo ASC",
          filter: "foo:bar,bar:baz",
        },
        simplifiedSchema,
      ),
    ).toThrow();
    expect(() =>
      parseBrowseParams(
        {
          limit: 0,
          page: 1,
          order: "foo ASC",
          filter: "foo:bar,bar:baz",
        },
        simplifiedSchema,
      ),
    ).toThrow();
  });
  test("should throw if order contains invalid fields", () => {
    expect(() =>
      parseBrowseParams(
        {
          limit: 15,
          page: 1,
          order: "bazbaz ASC",
          filter: "foo:bar,bar:baz",
        },
        simplifiedSchema,
      ),
    ).toThrow();
  });

  test("should throw if order direction contains invalid string", () => {
    expect(() =>
      parseBrowseParams(
        {
          limit: 15,
          page: 1,
          order: "foo BAR",
        },
        simplifiedSchema,
      ),
    ).toThrow();
  });

  test("should throw if filter contains invalid fields", () => {
    expect(() =>
      parseBrowseParams(
        {
          limit: 15,
          page: 1,
          order: "foo ASC",
          filter: "foo:bar,bazbaz:baz",
        },
        simplifiedSchema,
      ),
    ).toThrow();
  });

  test("should accept valid params with email address", () => {
    const result = parseBrowseParams(
      {
        limit: 15,
        page: 1,
        order: "foo ASC",
        filter: "foo:bar,bar:baz,email:test@example.com",
      },
      simplifiedSchema,
    );
    expect(result).toStrictEqual({
      limit: 15,
      page: 1,
      order: "foo ASC",
      filter: "foo:bar,bar:baz,email:test@example.com",
    });
  });

  test("should accept valid params with email address containing a plus sign", () => {
    const result = parseBrowseParams(
      {
        limit: 15,
        page: 1,
        order: "foo ASC",
        filter: "foo:bar,email:'test+test@example.com',bar:baz",
      },
      simplifiedSchema,
    );
    expect(result).toStrictEqual({
      limit: 15,
      page: 1,
      order: "foo ASC",
      filter: "foo:bar,email:'test+test@example.com',bar:baz",
    });
  });

  test("email address with plus sign shouldnt break the rest of the validation", () => {
    expect(() =>
      parseBrowseParams(
        {
          limit: 15,
          page: 1,
          order: "foo ASC",
          filter: "foo:bar,email:'test+test@example.com',bazbaz:baz",
        },
        simplifiedSchema,
      ),
    ).toThrow();
  });
});
