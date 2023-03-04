import type { ContentAPICredentials } from "../schemas";
import { describe, test, expect, assert } from "vitest";
import { ReadFetcher } from "./read-fetcher";
import { z } from "zod";

describe("ReadFetcher", () => {
  const api: ContentAPICredentials = {
    url: "https://ghost.org" as const,
    key: "1234",
    version: "v5.0",
    endpoint: "posts",
  } as const;

  const simplifiedSchema = z.object({
    title: z.string(),
    slug: z.string(),
    published: z.boolean().optional(),
    count: z.number().optional(),
  });

  const simplifiedIncludeSchema = z.object({
    count: z.literal(true).optional(),
  });

  test("should return a ReadFetcher instance using id", () => {
    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
      },
      api
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getEndpoint()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { id: "eh873jdLsnaUDj7149DSASJhdqsdj" },
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/eh873jdLsnaUDj7149DSASJhdqsdj/?key=1234"
    );
  });

  test("should return a ReadFetcher instance using slug", () => {
    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: simplifiedSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
      },
      api
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getEndpoint()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "published", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234"
    );
  });

  test("identity read fields params should only accept key from the identity read schema", () => {
    expect(
      () =>
        new ReadFetcher(
          {
            schema: simplifiedSchema,
            output: simplifiedSchema,
            include: simplifiedIncludeSchema,
          },
          {
            identity: {
              // @ts-expect-error - invalid field
              foo: "foobarbaz",
            },
          },
          api
        )
    ).toThrow();
  });

  test("ReadFetcher should accept include and fields ", async () => {
    const pick = { title: true, slug: true, count: true } as const;
    const outputSchema = simplifiedSchema.pick(pick);

    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: outputSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
        fields: { title: true, slug: true, count: true },
        include: ["count"],
      },
      api
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getEndpoint()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      fields: { title: true, slug: true, count: true },
      include: ["count"],
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234&fields=title%2Cslug%2Ccount&include=count"
    );

    const spy = vi.spyOn(readFetcher, "_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting undefined because the class is abstract
    spy.mockImplementationOnce(() => {
      return {
        posts: [
          {
            title: "title",
            slug: "this-is-a-slug-test",
            count: 1,
          },
        ],
      };
    });
    const result = await readFetcher.fetch();
    assert(result.status === "success");
    expect(result.data).toStrictEqual({
      title: "title",
      slug: "this-is-a-slug-test",
      count: 1,
    });
  });

  test("ReadFetcher with no results ", async () => {
    const pick = { title: true, slug: true, count: true } as const;
    const outputSchema = simplifiedSchema.pick(pick);

    const readFetcher = new ReadFetcher(
      {
        schema: simplifiedSchema,
        output: outputSchema,
        include: simplifiedIncludeSchema,
      },
      {
        identity: { slug: "this-is-a-slug" },
        fields: { title: true, slug: true, count: true },
        include: ["count"],
      },
      api
    );
    expect(readFetcher).toBeInstanceOf(ReadFetcher);
    expect(readFetcher.getEndpoint()).toBe("posts");
    expect(readFetcher.getOutputFields()).toEqual(["title", "slug", "count"]);
    expect(readFetcher.getParams()).toStrictEqual({
      identity: { slug: "this-is-a-slug" },
      fields: { title: true, slug: true, count: true },
      include: ["count"],
    });
    expect(readFetcher.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/slug/this-is-a-slug/?key=1234&fields=title%2Cslug%2Ccount&include=count"
    );

    const spy = vi.spyOn(readFetcher, "_fetch");
    // @ts-expect-error - mockResolvedValueOnce is expecting undefined because the class is abstract
    spy.mockImplementationOnce(() => {
      return {
        errors: [{ message: "Validation error, cannot read author.", type: "ValidationError" }],
      };
    });
    const result = await readFetcher.fetch();
    assert(result.status === "error");
    expect(result.errors).toStrictEqual([
      { message: "Validation error, cannot read author.", type: "ValidationError" },
    ]);
  });
});
