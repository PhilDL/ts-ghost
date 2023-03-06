import { describe, test, expect } from "vitest";
import { TSGhostContentAPI } from "../content-api";
const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "93fa6b1e07090ecdf686521b7e";
import type { Post } from "./schemas";

describe("posts api .browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI(url, key, "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    const browse = api.posts.browse({ input: { pp: 2 } });
    expect(browse.getParams().browseParams).toStrictEqual({});

    const outputFields = {
      slug: true,
      title: true,
      // @ts-expect-error - shouldnt accept invalid params
      foo: true,
    } satisfies { [k in keyof Post]?: true | undefined };

    let test = api.posts.browse({
      output: {
        // @ts-expect-error - shouldnt accept invalid params
        fields: outputFields,
      },
    });
    expect(test.getOutputFields()).toEqual(["slug", "title"]);

    const fields = ["slug", "title", "foo"] as const;
    const unknownOriginFields = fields.reduce((acc, k) => {
      acc[k as keyof Post] = true;
      return acc;
    }, {} as { [k in keyof Post]?: true | undefined });
    const result = api.posts.browse({
      output: {
        fields: unknownOriginFields,
      },
    });
    expect(result.getOutputFields()).toEqual(["slug", "title"]);
  });
  test(".browse() params, output fields declare const", () => {
    const outputFields = {
      slug: true,
      title: true,
    } satisfies { [k in keyof Post]?: true | undefined };

    let test = api.posts.browse({
      output: {
        fields: outputFields,
      },
    });
    expect(test.getOutputFields()).toEqual(["slug", "title"]);
  });
});
