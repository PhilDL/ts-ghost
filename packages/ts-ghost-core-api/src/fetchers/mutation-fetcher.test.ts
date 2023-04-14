import type { ContentAPICredentials } from "../schemas/shared";
import { describe, test, expect } from "vitest";
import { MutationFetcher } from "./mutation-fetcher";
import { z } from "zod";

describe("MutationFetcher", () => {
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

  test("should return a MutationFetcher instance", () => {
    const mutation = new MutationFetcher(
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
        body: {
          foo: "bar",
        },
      },
      api
    );
    expect(mutation).toBeInstanceOf(MutationFetcher);
    expect(mutation.getResource()).toBe("posts");
    expect(mutation.getParams()).toStrictEqual({
      option_1: true,
    });
    expect(mutation.getURL()?.toString()).toBe(
      "https://ghost.org/ghost/api/content/posts/?key=1234&option_1=true"
    );
  });
});
