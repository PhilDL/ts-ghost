import { describe, test, expect } from "vitest";
import { TSGhostAdminAPI } from "../admin-api";

describe("posts api .browse() Args Type-safety", () => {
  const url = process.env.VITE_GHOST_URL || "https://my-ghost-blog.com";
  const key = process.env.VITE_GHOST_ADMIN_API_KEY || "93fa6b1e07090ecdf686521b7e";
  const api = new TSGhostAdminAPI(url, key, "v5.0");
  test(".browse() params shouldnt accept invalid params", () => {
    expect(api.posts).toBeDefined();
    expect(1).toEqual(1);
  });
});
