import { describe, test, expect } from "vitest";
import { TSGhostContentAPI } from "../content-api";
const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
const key = process.env.VITE_GHOST_CONTENT_API_KEY || "93fa6b1e07090ecdf686521b7e";

describe("posts api .browse() Args Type-safety", () => {
  const api = new TSGhostContentAPI(url, key, "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    // @ts-expect-error - shouldnt accept invalid params
    const browse = api.posts.browse({ input: { pp: 2 } });
    expect(browse.getParams().browseParams).toStrictEqual({});
    // const result = api.posts.browse({ output: { include: { tags: true } } });
  });
});
